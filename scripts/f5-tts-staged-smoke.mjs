#!/usr/bin/env node
/* global console, fetch, process, setTimeout */

const NEXT_ORIGIN = (process.env.NEXT_ORIGIN || "http://127.0.0.1:3000").replace(/\/+$/, "");
const SHOULD_RENDER = ["1", "true", "yes", "on"].includes(
  (process.env.F5_TTS_STAGED_SMOKE_RENDER || "").toLowerCase(),
);

const plan = {
  title: "F5 Staged Contract Smoke",
  brief:
    "Verify a deterministic staged project can use the F5 narration provider boundary before a real model is downloaded.",
  language: "en",
  globalStyle: "Operational product smoke test with clear timing and captions.",
  segments: [
    {
      id: "f5-staged-scripted",
      order: 1,
      title: "Provider boundary",
      purpose: "Show that staged generation can attach provider-owned narration.",
      templateId: "scripted",
      templateReason: "A scripted segment can express the pipeline as sequential beats.",
      narration: {
        text: "The staged project requests narration through the local F5 provider boundary.",
        tone: "clear",
      },
      visualBrief: "Two concise beats describing the provider boundary.",
      expectedDurationSeconds: 4,
    },
    {
      id: "f5-staged-spotlight",
      order: 2,
      title: "Project assembly",
      purpose: "Confirm the assembled project keeps captions and audio on each segment.",
      templateId: "spotlight",
      templateReason: "A focused card is enough to validate segment-owned narration.",
      narration: {
        text: "Audio and captions stay on the segment, while the project assembles the full timeline.",
        tone: "confident",
      },
      visualBrief: "A focused recap card with three short callouts.",
      expectedDurationSeconds: 5,
    },
  ],
};

const fail = (message) => {
  throw new Error(message);
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

const assertNarrationAsset = (segmentId, narration) => {
  if (!narration) {
    fail(`Missing narration for ${segmentId}`);
  }
  if (narration.provider !== "f5-tts") {
    fail(`Expected ${segmentId} provider f5-tts, received ${narration.provider}`);
  }
  if (narration.format !== "wav") {
    fail(`Expected ${segmentId} wav format, received ${narration.format}`);
  }
  if (typeof narration.audioSrc !== "string" || !narration.audioSrc.startsWith("/api/tts/assets/")) {
    fail(`Unexpected ${segmentId} audioSrc: ${narration.audioSrc}`);
  }
  if (!Number.isFinite(narration.durationInFrames) || narration.durationInFrames <= 0) {
    fail(`Invalid ${segmentId} durationInFrames: ${narration.durationInFrames}`);
  }
  if (!narration.captions?.cues?.length) {
    fail(`Missing ${segmentId} caption cues`);
  }
};

const toSegmentNarration = (asset) => ({
  text: asset.text,
  audio: {
    src: asset.audioSrc,
    durationInFrames: asset.durationInFrames,
    durationInSeconds: asset.durationInSeconds,
    voiceId: asset.voiceId,
    provider: asset.provider,
    format: asset.format,
  },
  captions: asset.captions,
});

const createScriptedImplementation = (segment, narration) => {
  const duration = narration.durationInFrames;
  const titleDuration = Math.max(30, Math.floor(duration * 0.42));
  const bulletsDuration = Math.max(30, duration - titleDuration);

  return {
    meta: {
      title: segment.title,
      fps: 30,
      width: 1280,
      height: 720,
    },
    theme: {
      background: "#0f172a",
      panel: "rgba(255,255,255,0.08)",
      primary: "#38bdf8",
      secondary: "#f59e0b",
      text: "#f8fafc",
      muted: "#cbd5e1",
    },
    scenes: [
      {
        id: "provider-boundary-title",
        type: "title",
        title: "F5 provider boundary",
        subtitle: "Contract-smoke narration flows through the same adapter.",
        duration: titleDuration,
      },
      {
        id: "provider-boundary-bullets",
        type: "bullets",
        title: "Verified path",
        bullets: ["Storyboard segment", "F5 narration asset", "Segment-owned captions"],
        duration: bulletsDuration,
      },
    ],
  };
};

const createSpotlightImplementation = (segment, narration) => ({
  meta: {
    title: segment.title,
    fps: 30,
    width: 1280,
    height: 720,
  },
  theme: {
    background: "#111827",
    panel: "rgba(255,255,255,0.10)",
    primary: "#22c55e",
    secondary: "#f97316",
    text: "#f9fafb",
    muted: "#d1d5db",
  },
  durationInFrames: narration.durationInFrames,
  kicker: "Staged smoke",
  headline: "Narration stays segment-owned",
  subheadline: "The project only assembles ordering and timeline playback.",
  callouts: ["Audio", "Captions", "Template props"],
});

const buildProject = (narrationAssets) => ({
  meta: {
    title: plan.title,
    fps: 30,
    width: 1280,
    height: 720,
  },
  brief: plan.brief,
  segments: plan.segments.map((segment) => {
    const narration = narrationAssets[segment.id];
    const implementation =
      segment.templateId === "scripted"
        ? createScriptedImplementation(segment, narration)
        : createSpotlightImplementation(segment, narration);

    return {
      id: segment.id,
      title: segment.title,
      intent: segment.purpose,
      templateId: segment.templateId,
      narration: toSegmentNarration(narration),
      implementation,
    };
  }),
});

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

const run = async () => {
  console.log(`Waiting for Next app at ${NEXT_ORIGIN}`);
  await waitForNext();

  const narrationAssets = {};

  for (const segment of plan.segments) {
    console.log(`Generating F5 narration for ${segment.id}`);
    const body = await requestJson(`${NEXT_ORIGIN}/api/tts`, {
      method: "POST",
      body: JSON.stringify({
        plan,
        provider: "f5-tts",
        segmentId: segment.id,
      }),
    });

    assertNarrationAsset(segment.id, body.narration);
    await assertRangeSupport(body.narration.audioSrc);
    narrationAssets[segment.id] = body.narration;
  }

  const project = buildProject(narrationAssets);
  const summary = {
    audioSources: project.segments.map((segment) => segment.narration.audio.src),
    captionCueCounts: project.segments.map((segment) => segment.narration.captions.cues.length),
    render: undefined,
    segmentCount: project.segments.length,
    templateIds: project.segments.map((segment) => segment.templateId),
  };

  if (SHOULD_RENDER) {
    console.log("Rendering assembled staged smoke project through /api/render");
    const renderBody = await requestJson(`${NEXT_ORIGIN}/api/render`, {
      method: "POST",
      body: JSON.stringify({ project }),
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
