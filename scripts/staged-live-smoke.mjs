#!/usr/bin/env node
/* global console, fetch, process, setTimeout */

import "dotenv/config";

const NEXT_ORIGIN = (process.env.NEXT_ORIGIN || "http://127.0.0.1:3000").replace(/\/+$/, "");
const SHOULD_RENDER = ["1", "true", "yes", "on"].includes(
  (process.env.STAGED_LIVE_SMOKE_RENDER || "").toLowerCase(),
);

const requiredEnv = ["DEEPSEEK_API_KEY", "F5_TTS_BASE_URL"];

const fail = (message) => {
  throw new Error(message);
};

const skipIfMissingConfig = () => {
  const missing = requiredEnv.filter((name) => !(process.env[name] || "").trim());
  if (missing.length === 0) {
    return false;
  }

  console.log(`Skipping live staged smoke because required env is missing: ${missing.join(", ")}.`);
  return true;
};

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let body;

  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    body = text;
  }

  if (!response.ok) {
    fail(`Request failed: ${response.status} ${url} ${JSON.stringify(body)}`);
  }

  return body;
};

const waitForNext = async () => {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(NEXT_ORIGIN);
      if (response.ok) {
        return;
      }
    } catch {
      // Keep waiting.
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  fail(`Next app did not become reachable at ${NEXT_ORIGIN}`);
};

const assertRangeSupport = async (audioSrc) => {
  const response = await fetch(`${NEXT_ORIGIN}${audioSrc}`, {
    headers: {
      range: "bytes=0-15",
    },
  });

  if (response.status !== 206) {
    fail(`Range request for ${audioSrc} returned ${response.status}`);
  }
  if (response.headers.get("accept-ranges") !== "bytes") {
    fail(`Range request for ${audioSrc} did not include Accept-Ranges: bytes`);
  }
  const contentRange = response.headers.get("content-range") || "";
  if (!contentRange.startsWith("bytes 0-15/")) {
    fail(`Range request for ${audioSrc} returned unexpected Content-Range: ${contentRange}`);
  }
};

const assertSegmentNarration = async (segment) => {
  const audio = segment.narration?.audio;
  const captions = segment.narration?.captions;

  if (!audio) {
    fail(`Missing narration audio for ${segment.id}`);
  }
  if (audio.provider !== "f5-tts") {
    fail(`Expected ${segment.id} provider f5-tts, received ${audio.provider}`);
  }
  if (typeof audio.src !== "string" || !audio.src.startsWith("/api/tts/assets/")) {
    fail(`Unexpected ${segment.id} audio src: ${audio.src}`);
  }
  if (!audio.format) {
    fail(`Missing ${segment.id} audio format`);
  }
  if (!Number.isFinite(audio.durationInFrames) || audio.durationInFrames <= 0) {
    fail(`Invalid ${segment.id} durationInFrames: ${audio.durationInFrames}`);
  }
  if (!Number.isFinite(audio.durationInSeconds) || audio.durationInSeconds <= 0) {
    fail(`Invalid ${segment.id} durationInSeconds: ${audio.durationInSeconds}`);
  }
  if (!captions?.cues?.length) {
    fail(`Missing ${segment.id} caption cues`);
  }

  await assertRangeSupport(audio.src);
};

const assertDiagnostics = (diagnostics, segmentCount) => {
  if (!diagnostics) {
    fail("Missing diagnostics");
  }
  if (diagnostics.segmentCount !== segmentCount) {
    fail(`Expected diagnostics.segmentCount ${segmentCount}, received ${diagnostics.segmentCount}`);
  }
  if (diagnostics.narrationSegmentCount < 1) {
    fail("Expected diagnostics.narrationSegmentCount >= 1");
  }
  if (diagnostics.captionSegmentCount < 1) {
    fail("Expected diagnostics.captionSegmentCount >= 1");
  }
  if (!diagnostics.narrationProviders?.includes("f5-tts")) {
    fail(`Expected diagnostics.narrationProviders to include f5-tts`);
  }
};

const assertSceneGraphVisualIr = (body) => {
  const [segment] = body.project?.segments || [];
  if (!segment) {
    fail("SceneGraph smoke response did not include a segment");
  }
  if (segment.templateId !== "scene-graph") {
    fail(`Expected scene-graph template, received ${segment.templateId}`);
  }
  if (segment.implementation?.renderStrategy !== "primitive_scene_graph") {
    fail(
      `Expected primitive_scene_graph renderStrategy, received ${segment.implementation?.renderStrategy}`,
    );
  }

  const [compiler] = body.diagnostics?.compiler || [];
  if (!compiler) {
    fail("SceneGraph smoke response did not include compiler diagnostics");
  }
  if (compiler.renderStrategy !== "primitive_scene_graph") {
    fail(`Expected primitive_scene_graph diagnostics, received ${compiler.renderStrategy}`);
  }
  if (compiler.strategyDecision?.strategy !== "primitive_scene_graph") {
    fail(
      `Expected primitive_scene_graph strategy decision, received ${compiler.strategyDecision?.strategy}`,
    );
  }
  if (compiler.strategyDecision?.fallbackStrategy !== "template_macro") {
    fail(
      `Expected template_macro fallback decision, received ${compiler.strategyDecision?.fallbackStrategy}`,
    );
  }
  if (compiler.fallback) {
    fail(`SceneGraph smoke unexpectedly fell back: ${JSON.stringify(compiler.fallback)}`);
  }
};

const assertProceduralGeneratorVisualIr = (body, expectedGeneratorId = undefined) => {
  const [segment] = body.project?.segments || [];
  if (!segment) {
    fail("Procedural generator smoke response did not include a segment");
  }
  if (segment.templateId !== "scene-graph") {
    fail(`Expected scene-graph template for procedural generator, received ${segment.templateId}`);
  }
  if (segment.implementation?.renderStrategy !== "primitive_scene_graph") {
    fail(
      `Expected procedural generator to compile to primitive_scene_graph, received ${segment.implementation?.renderStrategy}`,
    );
  }

  const [compiler] = body.diagnostics?.compiler || [];
  if (!compiler) {
    fail("Procedural generator smoke response did not include compiler diagnostics");
  }
  if (compiler.strategyDecision?.strategy !== "procedural_generator") {
    fail(
      `Expected procedural_generator strategy decision, received ${compiler.strategyDecision?.strategy}`,
    );
  }
  if (compiler.renderStrategy !== "primitive_scene_graph") {
    fail(
      `Expected primitive_scene_graph compiled diagnostics, received ${compiler.renderStrategy}`,
    );
  }
  if (compiler.proceduralGenerator?.renderStrategy !== "procedural_generator") {
    fail(
      `Expected procedural generator diagnostics, received ${JSON.stringify(
        compiler.proceduralGenerator,
      )}`,
    );
  }
  if (compiler.proceduralGenerator?.compiledRenderStrategy !== "primitive_scene_graph") {
    fail(
      `Expected procedural generator compiledRenderStrategy primitive_scene_graph, received ${compiler.proceduralGenerator?.compiledRenderStrategy}`,
    );
  }
  if (expectedGeneratorId && compiler.proceduralGenerator?.generatorId !== expectedGeneratorId) {
    fail(
      `Expected ${expectedGeneratorId} procedural generator, received ${compiler.proceduralGenerator?.generatorId}`,
    );
  }
  if (compiler.fallback) {
    fail(`Procedural generator smoke unexpectedly fell back: ${JSON.stringify(compiler.fallback)}`);
  }
};

const assertNaturalProceduralGeneratorSelection = (body) => {
  const proceduralCompiler = (body.diagnostics?.compiler || []).find(
    (compiler) =>
      compiler.strategyDecision?.strategy === "procedural_generator" &&
      compiler.proceduralGenerator?.generatorId === "node-graph-flow",
  );

  if (!proceduralCompiler) {
    fail(
      `Expected normal brief to naturally select node-graph-flow procedural_generator; received compiler diagnostics ${JSON.stringify(
        body.diagnostics?.compiler,
      )}`,
    );
  }
  if (proceduralCompiler.renderStrategy !== "primitive_scene_graph") {
    fail(
      `Expected natural procedural generator to compile to primitive_scene_graph, received ${proceduralCompiler.renderStrategy}`,
    );
  }
  if (proceduralCompiler.fallback) {
    fail(
      `Natural procedural generator unexpectedly fell back: ${JSON.stringify(
        proceduralCompiler.fallback,
      )}`,
    );
  }
};

const buildSceneGraphPlan = () => ({
  title: "Live SceneGraph Visual IR Smoke",
  brief:
    "Compile one provider-backed scene-graph segment with narration, captions, and bounded Visual IR.",
  language: "en",
  globalStyle:
    "Cinematic technical explainer with full-bleed structure, visible process flow, and caption-safe layout.",
  segments: [
    {
      id: "segment-1",
      order: 1,
      title: "Visual IR compiler path",
      purpose:
        "Show how the product turns a storyboard segment into a validated primitive scene graph.",
      templateId: "scene-graph",
      templateReason:
        "This smoke must exercise provider-backed primitive_scene_graph generation rather than a macro template.",
      strategyDecision: {
        strategy: "primitive_scene_graph",
        confidence: 0.95,
        reason: "The smoke explicitly targets bounded Visual IR generation.",
        fallbackStrategy: "template_macro",
      },
      narration: {
        text: "The compiler turns a planned segment into a validated scene graph, then renders it through the same project video path.",
        tone: "clear",
      },
      visualBrief:
        "Use a full-bleed technical opener with a node graph or line path, code or terminal panel, and a caption-safe lower band.",
      pacingHint: "steady technical demo",
      expectedDurationSeconds: 6,
    },
  ],
});

const requestSceneGraphSmoke = async () => {
  let lastError;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const body = await requestJson(`${NEXT_ORIGIN}/api/generate/staged`, {
      method: "POST",
      body: JSON.stringify({
        mode: "plan",
        provider: "f5-tts",
        plan: buildSceneGraphPlan(),
      }),
    });

    try {
      const segments = body.project?.segments;
      if (!Array.isArray(segments) || segments.length !== 1) {
        fail("SceneGraph smoke response did not include exactly one segment");
      }
      assertDiagnostics(body.diagnostics, 1);
      assertSceneGraphVisualIr(body);
      await assertSegmentNarration(segments[0]);
      return { body, segments };
    } catch (error) {
      lastError = error;
      if (attempt < 2) {
        console.log(
          `SceneGraph smoke attempt ${attempt} failed; retrying once: ${
            error instanceof Error ? error.message : error
          }`,
        );
      }
    }
  }

  throw lastError;
};

const buildProceduralGeneratorPlan = () => ({
  title: "Live Procedural Generator Smoke",
  brief:
    "Compile one provider-facing procedural generator segment through the deterministic node graph flow path.",
  language: "en",
  globalStyle:
    "Technical product explainer with a clear node graph flow, visible state changes, and caption-safe layout.",
  segments: [
    {
      id: "segment-1",
      order: 1,
      title: "Agent workflow node graph",
      purpose:
        "Show an AI agent workflow as a deterministic node graph flow that compiles through SceneGraph.",
      templateId: "scene-graph",
      templateReason:
        "The procedural generator is currently executed through the scene-graph renderer.",
      strategyDecision: {
        strategy: "procedural_generator",
        confidence: 0.94,
        reason: "The segment is a workflow with nodes, edges, and staged state transitions.",
        fallbackStrategy: "template_macro",
      },
      proceduralGenerator: {
        generatorId: "node-graph-flow",
        renderStrategy: "procedural_generator",
        durationInFrames: 180,
        captionSafeZone: true,
        fallbackStrategy: "primitive_scene_graph",
        fallbackReason: "If generator compilation fails, keep the segment on SceneGraph Visual IR.",
        title: "Agent workflow",
        summary: "A bounded node graph showing prompt, plan, act, verify, and export stages.",
        direction: "left-to-right",
        nodes: [
          { id: "prompt", label: "Prompt", detail: "intent", lane: "input", status: "success" },
          { id: "plan", label: "Plan", detail: "tasks", lane: "plan", status: "success" },
          { id: "act", label: "Act", detail: "tools", lane: "build", status: "active" },
          { id: "verify", label: "Verify", detail: "checks", lane: "verify", status: "idle" },
          { id: "export", label: "Export", detail: "video", lane: "output", status: "idle" },
        ],
        edges: [
          { from: "prompt", to: "plan", status: "success" },
          { from: "plan", to: "act", status: "success" },
          { from: "act", to: "verify", status: "active" },
          { from: "verify", to: "export", status: "idle" },
        ],
        beats: [
          { atFrame: 0, nodeId: "prompt", action: "reveal" },
          { atFrame: 36, nodeId: "plan", action: "complete" },
          { atFrame: 78, nodeId: "act", action: "activate" },
          { atFrame: 126, nodeId: "verify", action: "activate" },
        ],
      },
      narration: {
        text: "A bounded procedural generator describes the agent workflow as nodes and edges, then compiles into the same scene graph renderer.",
        tone: "technical",
      },
      visualBrief:
        "Use a node graph flow with prompt, plan, action, verification, and export states.",
      pacingHint: "clear workflow reveal",
      expectedDurationSeconds: 6,
    },
  ],
});

const requestProceduralGeneratorSmoke = async () => {
  const body = await requestJson(`${NEXT_ORIGIN}/api/generate/staged`, {
    method: "POST",
    body: JSON.stringify({
      mode: "plan",
      provider: "f5-tts",
      plan: buildProceduralGeneratorPlan(),
    }),
  });

  const segments = body.project?.segments;
  if (!Array.isArray(segments) || segments.length !== 1) {
    fail("Procedural generator smoke response did not include exactly one segment");
  }
  assertDiagnostics(body.diagnostics, 1);
  assertProceduralGeneratorVisualIr(body);
  await assertSegmentNarration(segments[0]);
  return { body, segments };
};

const buildLinePathFlowPlan = () => ({
  title: "Live Line Path Procedural Generator Smoke",
  brief:
    "Compile one provider-facing procedural generator segment through the deterministic line path flow path.",
  language: "en",
  globalStyle:
    "Technical journey explainer with a visible milestone path, steady progression, and caption-safe layout.",
  segments: [
    {
      id: "segment-1",
      order: 1,
      title: "Narration timing path",
      purpose:
        "Show the staged generation journey as a deterministic line path flow that compiles through SceneGraph.",
      templateId: "scene-graph",
      templateReason:
        "The line path procedural generator is executed through the scene-graph renderer.",
      strategyDecision: {
        strategy: "procedural_generator",
        confidence: 0.92,
        reason: "The segment is a progression with ordered milestones and path reveal timing.",
        fallbackStrategy: "template_macro",
      },
      proceduralGenerator: {
        generatorId: "line-path-flow",
        renderStrategy: "procedural_generator",
        durationInFrames: 180,
        captionSafeZone: true,
        fallbackStrategy: "primitive_scene_graph",
        fallbackReason: "If generator compilation fails, keep the segment on SceneGraph Visual IR.",
        title: "Prompt to export path",
        summary:
          "A bounded line path showing brief, plan, voice, visual compile, and export milestones.",
        tone: "primary",
        showNodes: true,
        points: [
          { id: "brief", label: "Brief", x: 0.12, y: 0.62 },
          { id: "plan", label: "Plan", x: 0.3, y: 0.42 },
          { id: "voice", label: "Voice", x: 0.5, y: 0.5 },
          { id: "visual", label: "Visual", x: 0.7, y: 0.34 },
          { id: "export", label: "Export", x: 0.88, y: 0.58 },
        ],
        beats: [
          { atFrame: 0, pointId: "brief", action: "reveal" },
          { atFrame: 36, pointId: "plan", action: "advance" },
          { atFrame: 78, pointId: "voice", action: "highlight" },
          { atFrame: 126, pointId: "visual", action: "advance" },
        ],
      },
      narration: {
        text: "A bounded line path generator describes the journey from brief to export, then compiles into the same scene graph renderer.",
        tone: "technical",
      },
      visualBrief:
        "Use a line path flow with brief, plan, voice, visual compilation, and export milestones.",
      pacingHint: "steady milestone reveal",
      expectedDurationSeconds: 6,
    },
  ],
});

const requestLinePathFlowSmoke = async () => {
  const body = await requestJson(`${NEXT_ORIGIN}/api/generate/staged`, {
    method: "POST",
    body: JSON.stringify({
      mode: "plan",
      provider: "f5-tts",
      plan: buildLinePathFlowPlan(),
    }),
  });

  const segments = body.project?.segments;
  if (!Array.isArray(segments) || segments.length !== 1) {
    fail("Line path flow smoke response did not include exactly one segment");
  }
  assertDiagnostics(body.diagnostics, 1);
  assertProceduralGeneratorVisualIr(body, "line-path-flow");
  await assertSegmentNarration(segments[0]);
  return { body, segments };
};

const buildTerminalSessionPlan = () => ({
  title: "Live Terminal Session Procedural Generator Smoke",
  brief:
    "Compile one provider-facing procedural generator segment through the deterministic terminal session path.",
  language: "en",
  globalStyle:
    "Technical CLI explainer with a focused terminal panel, readable command progress, and caption-safe layout.",
  segments: [
    {
      id: "segment-1",
      order: 1,
      title: "Verification terminal session",
      purpose:
        "Show a deterministic terminal session for install, typecheck, smoke, and export commands.",
      templateId: "scene-graph",
      templateReason:
        "The terminal session procedural generator is executed through the scene-graph renderer.",
      strategyDecision: {
        strategy: "procedural_generator",
        confidence: 0.91,
        reason: "The segment is a command sequence with terminal lines and verification status.",
        fallbackStrategy: "template_macro",
      },
      proceduralGenerator: {
        generatorId: "terminal-session",
        renderStrategy: "procedural_generator",
        durationInFrames: 180,
        captionSafeZone: true,
        fallbackStrategy: "primitive_scene_graph",
        fallbackReason: "If generator compilation fails, keep the segment on SceneGraph Visual IR.",
        title: "Verification loop",
        summary:
          "A bounded terminal session showing install, typecheck, fixture smoke, and export.",
        status: "success",
        prompt: "web$",
        lines: [
          { id: "install", text: "npm install", status: "success" },
          { id: "typecheck", text: "npx tsc --noEmit", status: "success" },
          { id: "smoke", text: "npm run smoke:staged-fixtures", status: "success" },
          { id: "export", text: "npm run render", status: "running" },
        ],
        beats: [
          { atFrame: 0, lineId: "install", action: "reveal" },
          { atFrame: 36, lineId: "typecheck", action: "complete" },
          { atFrame: 78, lineId: "smoke", action: "complete" },
          { atFrame: 126, lineId: "export", action: "run" },
        ],
      },
      narration: {
        text: "A bounded terminal session generator describes command progress, then compiles into the same scene graph renderer.",
        tone: "technical",
      },
      visualBrief:
        "Use a terminal panel with install, typecheck, smoke, and export commands plus visible status changes.",
      pacingHint: "steady command reveal",
      expectedDurationSeconds: 6,
    },
  ],
});

const requestTerminalSessionSmoke = async () => {
  const body = await requestJson(`${NEXT_ORIGIN}/api/generate/staged`, {
    method: "POST",
    body: JSON.stringify({
      mode: "plan",
      provider: "f5-tts",
      plan: buildTerminalSessionPlan(),
    }),
  });

  const segments = body.project?.segments;
  if (!Array.isArray(segments) || segments.length !== 1) {
    fail("Terminal session smoke response did not include exactly one segment");
  }
  assertDiagnostics(body.diagnostics, 1);
  assertProceduralGeneratorVisualIr(body, "terminal-session");
  await assertSegmentNarration(segments[0]);
  return { body, segments };
};

const run = async () => {
  if (skipIfMissingConfig()) {
    return;
  }

  console.log(`Waiting for Next app at ${NEXT_ORIGIN}`);
  await waitForNext();

  console.log("Requesting live staged project through /api/generate/staged");
  const body = await requestJson(`${NEXT_ORIGIN}/api/generate/staged`, {
    method: "POST",
    body: JSON.stringify({
      mode: "brief",
      provider: "f5-tts",
      brief:
        "Create a concise two-segment technical demo for AI Video Studio. The first segment must show the AI agent workflow as a node graph or dependency flow from prompt to plan to narration to verification to export. The second segment can recap the preview and local export result.",
    }),
  });

  const segments = body.project?.segments;
  if (!Array.isArray(segments) || segments.length === 0) {
    fail("Response did not include project.segments");
  }
  assertDiagnostics(body.diagnostics, segments.length);
  assertNaturalProceduralGeneratorSelection(body);

  for (const segment of segments) {
    await assertSegmentNarration(segment);
  }

  console.log("Requesting live scene-graph Visual IR staged project");
  const { body: sceneGraphBody, segments: sceneGraphSegments } = await requestSceneGraphSmoke();

  console.log("Requesting live procedural generator staged project");
  const { body: proceduralBody, segments: proceduralSegments } =
    await requestProceduralGeneratorSmoke();

  console.log("Requesting live line path procedural generator staged project");
  const { body: linePathBody, segments: linePathSegments } = await requestLinePathFlowSmoke();

  console.log("Requesting live terminal session procedural generator staged project");
  const { body: terminalSessionBody, segments: terminalSessionSegments } =
    await requestTerminalSessionSmoke();

  const summary = {
    audioSources: segments.map((segment) => segment.narration.audio.src),
    captionCueCounts: segments.map((segment) => segment.narration.captions.cues.length),
    diagnostics: body.diagnostics,
    render: undefined,
    sceneGraph: {
      audioSource: sceneGraphSegments[0].narration.audio.src,
      compiler: sceneGraphBody.diagnostics.compiler,
      renderStrategy: sceneGraphSegments[0].implementation.renderStrategy,
      strategyDecision: sceneGraphBody.diagnostics.compiler[0]?.strategyDecision,
      templateId: sceneGraphSegments[0].templateId,
    },
    proceduralGenerator: {
      audioSource: proceduralSegments[0].narration.audio.src,
      compiler: proceduralBody.diagnostics.compiler,
      compiledRenderStrategy: proceduralSegments[0].implementation.renderStrategy,
      strategyDecision: proceduralBody.diagnostics.compiler[0]?.strategyDecision,
      templateId: proceduralSegments[0].templateId,
    },
    linePathFlow: {
      audioSource: linePathSegments[0].narration.audio.src,
      compiler: linePathBody.diagnostics.compiler,
      compiledRenderStrategy: linePathSegments[0].implementation.renderStrategy,
      strategyDecision: linePathBody.diagnostics.compiler[0]?.strategyDecision,
      templateId: linePathSegments[0].templateId,
    },
    terminalSession: {
      audioSource: terminalSessionSegments[0].narration.audio.src,
      compiler: terminalSessionBody.diagnostics.compiler,
      compiledRenderStrategy: terminalSessionSegments[0].implementation.renderStrategy,
      strategyDecision: terminalSessionBody.diagnostics.compiler[0]?.strategyDecision,
      templateId: terminalSessionSegments[0].templateId,
    },
    segmentCount: segments.length,
    templateIds: segments.map((segment) => segment.templateId),
  };

  if (SHOULD_RENDER) {
    console.log("Rendering live staged smoke project through /api/render");
    const renderBody = await requestJson(`${NEXT_ORIGIN}/api/render`, {
      method: "POST",
      body: JSON.stringify({ project: body.project }),
    });
    if (!renderBody.renderId || !renderBody.downloadUrl || !renderBody.sizeInBytes) {
      fail(`Unexpected render response: ${JSON.stringify(renderBody)}`);
    }
    summary.render = {
      downloadUrl: renderBody.downloadUrl,
      renderId: renderBody.renderId,
      sizeInBytes: renderBody.sizeInBytes,
    };
  }

  console.log(JSON.stringify(summary, null, 2));
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
