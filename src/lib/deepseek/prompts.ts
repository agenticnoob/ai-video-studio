import type {
  DeepSeekChatMessage,
  DeepSeekSegmentPlanRevisionRequest,
  DeepSeekStoryboardPlanRequest,
  DeepSeekTemplateCompileRequest,
} from "./provider";
import type { VideoProject } from "../project-schema";
import {
  buildPlannerTemplateManifestPrompt,
  getTemplateDefinition,
  templateIds,
} from "../template-registry";

/**
 * Payload for the provider. The transport uses JSON mode, then the parser
 * validates the returned object against the planner/template Zod contracts.
 */
export type DeepSeekPrompt = {
  messages: DeepSeekChatMessage[];
};

const STORYBOARD_PLAN_SYSTEM_PROMPT = `You create a structured "StoryboardPlan" for a segment-first video studio.

This is the planning stage only. The output decides segment intent, narration,
visual direction, and one primary registered template per segment. It must not
generate final template implementation fields.

The output must:
- be a single JSON object (no markdown fence, no commentary)
- validate against the StoryboardPlan schema
- contain between 1 and 6 segments; prefer 1-3 unless the brief clearly needs more
- use one primary template per segment
- choose templateId from the registered template ids: ${templateIds.map((id) => `"${id}"`).join(", ")}
- every segment MUST include these keys: id, order, title, purpose, templateId,
  templateReason, strategyDecision, narration, and visualBrief
- set purpose as a concrete one-sentence goal for that segment, not an empty
  label and not only a title
- set strategyDecision for every segment with strategy, confidence, reason, and fallbackStrategy
- set segment.order as contiguous integers starting at 1
- use stable segment ids like "segment-1", "segment-2"
- write narration.text as the spoken script for that segment
- explain templateReason using the selected template's fit for the segment purpose
- describe visualBrief without inventing media URLs or Remotion source code
- set expectedDurationSeconds when the brief or narration gives a useful timing hint

# Planner template manifest
${buildPlannerTemplateManifestPrompt()}

# Render strategy decision v1
- Current supported strategies are "template_macro", "primitive_scene_graph", and bounded "procedural_generator".
- Use "primitive_scene_graph" only when templateId is "scene-graph" and the
  segment needs custom layered Visual IR that is NOT one of the supported
  procedural generator shapes.
- For deterministic workflow, node graph, dependency flow, agent loop, system
  pipeline, journey, timeline, progression, terminal command session,
  build/test/deploy trace, or command output walkthrough segments, you MUST use
  templateId "scene-graph" with strategyDecision.strategy
  "procedural_generator" and include proceduralGenerator. Do not use
  "primitive_scene_graph" for those cases.
- Use "template_macro" for scripted, spotlight, stats-dashboard, and any other fixed registered macro template.
- Prefer "scene-graph" for product workflows, UI walkthroughs, system pipelines,
  agent loops, generation flows, command sessions, process visuals, cinematic
  openers/closings, node/path/code/terminal visuals, or when the brief asks for
  visual variety beyond cards and scripted text.
- Prefer "stats-dashboard" when the segment needs KPI, comparison, trend,
  category share, report, analytics, growth, or multi-chart/dashboard visuals.
- Use "spotlight" mainly for short hooks, recap cards, single key messages,
  metrics, and calls to action. Do not use spotlight for every segment of a
  multi-step product or workflow demo.
- Use "scripted" mainly for text-heavy narrative/explainer segments that need
  multiple internal text scenes but not a graph, path, terminal, or dashboard.
- Set fallbackStrategy to "template_macro" for scene-graph segments so the compiler can fall back to a stable macro if Visual IR validation fails.
- Set fallbackStrategy to "template_macro" for template_macro segments.
- Keep confidence between 0 and 1, and explain the strategy choice in reason.
- Do not emit media_asset_composite or generated_component in this phase.

# Procedural generator v1
- If strategyDecision.strategy is "procedural_generator", include proceduralGenerator.
- Supported proceduralGenerator.generatorId values are "node-graph-flow", "line-path-flow", and "terminal-session".
- Use "node-graph-flow" for deterministic workflow, agent loop, system pipeline, dependency graph, state machine, or node-and-edge visuals.
- Use "line-path-flow" for deterministic journeys, timelines, progressions, funnels, milestone paths, sequencing paths, or narration-driven path reveals.
- Use "terminal-session" for deterministic CLI, build, test, deploy, install, migration dry-run, smoke check, or command-output walkthroughs where terminal lines are the main visual object.
- proceduralGenerator.renderStrategy must be "procedural_generator".
- For "node-graph-flow", use 2-12 nodes and 1-18 edges. Every edge.from, edge.to, and beat.nodeId must reference declared node ids.
- For "node-graph-flow", use lane values only from "input", "plan", "build", "verify", "output".
- For "node-graph-flow", use status values only from "idle", "active", "success", "error".
- For "node-graph-flow", use beat action values only from "reveal", "activate", "complete", "error".
- For "line-path-flow", use 2-8 points. Each point must have id, label, x, and y, where x and y are normalized numbers from 0 to 1.
- For "line-path-flow", every beat.pointId must reference a declared point id.
- For "line-path-flow", use tone values only from "primary", "secondary", "success", "warning".
- For "line-path-flow", use beat action values only from "reveal", "advance", "highlight".
- For "terminal-session", use 1-8 lines. Every line must have id and text; keep command/output text concise and caption-safe.
- For "terminal-session", use status values only from "idle", "running", "success", "error".
- For "terminal-session", every beat.lineId must reference a declared line id.
- For "terminal-session", use beat action values only from "reveal", "run", "complete", "error", "focus".
- For "terminal-session", use prompt as a short shell prompt such as "$" or "web$".
- Set proceduralGenerator.durationInFrames from the expected segment duration when possible; otherwise choose a reasonable duration for the narration.
- Do not include proceduralGenerator on template_macro or primitive_scene_graph segments.

# Asset plan boundary
- If the video will need concrete visual evidence later, add top-level assetPlan.requiredAssets with stable ids, kind, purpose, and fallback.
- Use assetPlan ids such as "dashboard-screenshot" or "pricing-chart-data"; do not use URLs, file paths, src fields, or remote media references.
- Do not invent asset URLs. AssetPlan only requests future assets; it does not make media_asset_composite executable in this phase.

# Planning boundaries
- Do not generate implementation, scenes, callouts, theme, colors, or template props.
- Do not invent template ids.
- Do not model one segment as multiple template instances.
- Do not create arbitrary media URLs.
- Preserve the user's intent and language when possible.

# JSON output contract (CRITICAL)
Return the complete StoryboardPlan object directly as JSON. The top-level keys
must be title, brief, segments, and optional language/globalStyle/assetPlan.
Do not wrap the result inside "emit_result", "arguments", "result", "data", or
any other container.`;

const buildStoryboardRepairInstructions = ({
  previousInvalidOutput,
  validationError,
}: {
  previousInvalidOutput?: string;
  validationError?: string;
}): string => {
  if (!previousInvalidOutput && !validationError) {
    return "";
  }

  return [
    "# Repair input",
    "The previous StoryboardPlan output was rejected. Return a corrected StoryboardPlan object only.",
    "Preserve the user's intent, but fix JSON shape, required fields, valid templateId values, unique ids, and contiguous order values.",
    validationError ? `Validation error: ${validationError}` : "",
    previousInvalidOutput
      ? `Previous invalid output:\n\`\`\`json\n${previousInvalidOutput.slice(0, 4000)}\n\`\`\``
      : "",
  ]
    .filter(Boolean)
    .join("\n");
};

const buildTemplateCompilerSystemPrompt = (request: DeepSeekTemplateCompileRequest): string => {
  const template = getTemplateDefinition(request.segment.templateId);
  const durationRange = template.capabilities.recommendedDurationFrames;
  const sceneGraphVisualIrInstructions =
    request.segment.templateId === "scene-graph"
      ? [
          "# SceneGraph Visual IR v1 rules",
          "- This is provider-backed Visual IR generation for primitive_scene_graph only.",
          '- Set renderStrategy exactly to "primitive_scene_graph".',
          '- Allowed composition values: "hero", "path", "split", "node-graph", "code-terminal", "lockup".',
          '- Allowed layout values: "full-bleed", "center", "split", "path-horizontal", "node-graph", "code-terminal-split", "safe-lockup".',
          '- Allowed layer types: "background", "kinetic-title", "text", "rich-text", "shape", "image-plane", "code-panel", "terminal-panel", "browser-window", "node-graph", "line-path", "cursor", "callout", "metric-highlight", "process-step", "caption".',
          '- Allowed motionPreset values: "fade-in", "slide-in", "pop", "draw-path", "highlight", "type-text", "camera-push", "match-cut", "success-pulse", "error-glitch".',
          "- Use 3 to 8 layers for normal segments and reserve captions with a caption layer whose source is segment-narration.",
          "- Keep every beat segment-local, within durationInFrames, and point targetLayerId only at existing layer ids.",
          "- Prefer full-bleed, path, node-graph, code-terminal, or lockup visual structures over centered cards.",
          "- Do not use template_macro, procedural_generator, media_asset_composite, or generated_component in this phase.",
        ].join("\n")
      : "";
  const repairInstructions =
    request.validationError || request.previousInvalidOutput
      ? [
          "# Repair input",
          "The previous compiler output was rejected. Return a corrected implementation object only.",
          request.validationError ? `Validation error: ${request.validationError}` : "",
          request.previousInvalidOutput
            ? `Previous invalid output:\n\`\`\`json\n${request.previousInvalidOutput.slice(
                0,
                4000,
              )}\n\`\`\``
            : "",
        ]
          .filter(Boolean)
          .join("\n")
      : "";

  return `You compile one planned storyboard segment into the selected template's implementation JSON.

# Output contract
- Return ONLY the selected template implementation object.
- Do not return a VideoProject.
- Do not return a VideoSegment.
- Do not wrap the object in "implementation", "segment", "project", "media", or "narration".
- Do not include audio source fields, media fields, narration asset metadata, or provider metadata.
- Generated narration audio is carried outside template implementation through VideoSegment.narration.
- The implementation must validate against the selected template schema.

# Selected template
- templateId: ${template.id}
- label: ${template.label}
- recommendedDurationFrames: ${durationRange.min}-${durationRange.max}
- targetDurationInFrames: ${request.targetDurationInFrames}
- implementation rules:
${template.implementationPrompt}

# Timing rules
- Use 30fps.
- implementation.meta must use fps=30, width=1280, height=720.
- The visual implementation duration must be at least ${request.targetDurationInFrames} frames.
- Prefer exactly ${request.targetDurationInFrames} frames unless the template needs a small visual tail.
- Use the real narration duration as the timing anchor; do not guess a shorter duration.

# Theme rules
- Include all required theme fields when the selected template schema requires theme.
- Use readable contrast and CSS color literals.

${sceneGraphVisualIrInstructions}

${repairInstructions}

# JSON output contract (CRITICAL)
Return only the selected template implementation object directly as JSON. Do
not wrap the result inside "emit_result", "arguments", "result", "data",
"implementation", "segment", or any other container.`;
};

const buildSegmentPlanRevisionPayload = (project: VideoProject, segmentId: string): unknown => {
  const targetIndex = project.segments.findIndex((segment) => segment.id === segmentId);
  const targetSegment = targetIndex >= 0 ? project.segments[targetIndex] : null;

  return {
    project: {
      title: project.meta.title,
      brief: project.brief,
      segmentCount: project.segments.length,
    },
    targetSegment:
      targetSegment === null
        ? null
        : {
            id: targetSegment.id,
            order: targetIndex + 1,
            title: targetSegment.title,
            intent: targetSegment.intent,
            templateId: targetSegment.templateId,
          },
    surroundingSegments: project.segments.map((segment, index) => ({
      id: segment.id,
      order: index + 1,
      title: segment.title,
      intent: segment.intent,
      templateId: segment.templateId,
    })),
  };
};

export const buildStoryboardPlanPrompt = ({
  brief,
  previousInvalidOutput,
  validationError,
}: DeepSeekStoryboardPlanRequest): DeepSeekPrompt => {
  const safeBrief = brief.length > 0 ? brief : "Create a concise AI Video Studio workflow video.";
  const repairInstructions = buildStoryboardRepairInstructions({
    previousInvalidOutput,
    validationError,
  });
  const messages: DeepSeekChatMessage[] = [
    {
      role: "system",
      content: [STORYBOARD_PLAN_SYSTEM_PROMPT, repairInstructions].filter(Boolean).join("\n\n"),
    },
    {
      role: "user",
      content: `Brief:\n"""\n${safeBrief}\n"""\n\nReturn a single JSON object matching the StoryboardPlan contract above.`,
    },
  ];

  return {
    messages,
  };
};

export const buildSegmentPlanRevisionPrompt = ({
  previousInvalidOutput,
  project,
  revisionPrompt,
  segmentId,
  validationError,
}: DeepSeekSegmentPlanRevisionRequest): DeepSeekPrompt => {
  const payload = JSON.stringify(buildSegmentPlanRevisionPayload(project, segmentId), null, 2);
  const repairInstructions = buildStoryboardRepairInstructions({
    previousInvalidOutput,
    validationError,
  });
  const messages: DeepSeekChatMessage[] = [
    {
      role: "system",
      content: `You revise one storyboard segment inside an existing video project.

Return a StoryboardPlan containing EXACTLY ONE segment: the target segment to regenerate.
This is the planning stage only. Do not generate final template implementation fields.

# Output requirements
- Keep the target segment id exactly "${segmentId}".
- Set the single segment order to 1.
- Preserve the original language unless the revision request explicitly asks otherwise.
- Choose one registered primary template from: ${templateIds.map((id) => `"${id}"`).join(", ")}.
- Keep the current template unless the revision request clearly asks for a different presentation style.
- Include strategyDecision. Use "primitive_scene_graph" only with templateId "scene-graph";
  use "procedural_generator" only with templateId "scene-graph" when the segment
  is best represented as a deterministic workflow, node graph, agent loop,
  system pipeline, dependency flow, journey, timeline, progression, funnel,
  milestone path, sequencing path, narration-driven path reveal, terminal
  command session, build/test/deploy trace, or command output walkthrough;
  otherwise use "template_macro". Use fallbackStrategy "template_macro" for
  this phase.
- If strategyDecision.strategy is "procedural_generator", include a bounded
  proceduralGenerator object with generatorId "node-graph-flow" or
  "line-path-flow" or "terminal-session".
- Use "node-graph-flow" for deterministic workflow, agent loop, system
  pipeline, dependency graph, state machine, or node-and-edge visuals.
- Use "line-path-flow" for deterministic journeys, timelines, progressions,
  funnels, milestone paths, sequencing paths, or narration-driven path reveals.
- Use "terminal-session" for deterministic CLI, build, test, deploy, install,
  migration dry-run, smoke check, or command-output walkthroughs where terminal
  lines are the main visual object.
- For "node-graph-flow", use renderStrategy "procedural_generator", 2-12
  nodes, 1-18 edges, and edge/beat references that point only at declared node
  ids.
- For "line-path-flow", use renderStrategy "procedural_generator", 2-8 points,
  normalized x/y coordinates from 0 to 1, and beat pointId references that
  point only at declared point ids.
- For "terminal-session", use renderStrategy "procedural_generator", 1-8
  concise terminal lines, status values from "idle", "running", "success",
  "error", and beat lineId references that point only at declared line ids.
- Write narration.text as the actual spoken script for this segment, not as an instruction.
- Keep narration concise enough for a short product-demo segment.
- Describe visualBrief for this segment without inventing media URLs or Remotion source code.
- Do not include implementation, scenes, callouts, theme, colors, audio URLs, or provider metadata.

# Planner template manifest
${buildPlannerTemplateManifestPrompt()}

${repairInstructions}

# JSON output contract (CRITICAL)
Return the complete one-segment StoryboardPlan object directly as JSON. Do not
wrap the result inside "emit_result", "arguments", "result", "data", or any
other container.`,
    },
    {
      role: "user",
      content: `Current project and target segment:\n\`\`\`json\n${payload}\n\`\`\`\n\nRevision request:\n"""\n${revisionPrompt}\n"""\n\nReturn exactly one planned segment for "${segmentId}" with fresh narration text.`,
    },
  ];

  return {
    messages,
  };
};

export const buildTemplateCompilerPrompt = (
  request: DeepSeekTemplateCompileRequest,
): DeepSeekPrompt => {
  const template = getTemplateDefinition(request.segment.templateId);
  const payload = JSON.stringify(
    {
      plan: {
        title: request.plan.title,
        brief: request.plan.brief,
        language: request.plan.language,
        globalStyle: request.plan.globalStyle,
      },
      segment: request.segment,
      narration: {
        text: request.narration.text,
        durationInFrames: request.narration.durationInFrames,
        durationInSeconds: request.narration.durationInSeconds,
        voiceId: request.narration.voiceId,
        provider: request.narration.provider,
        format: request.narration.format,
      },
      selectedTemplate: {
        templateId: template.id,
        label: template.label,
        planner: template.planner,
        capabilities: template.capabilities,
        implementationJsonSchema: template.implementationJsonSchema,
      },
      targetDurationInFrames: request.targetDurationInFrames,
    },
    null,
    2,
  );
  const messages: DeepSeekChatMessage[] = [
    { role: "system", content: buildTemplateCompilerSystemPrompt(request) },
    {
      role: "user",
      content: `Compiler input:\n\`\`\`json\n${payload}\n\`\`\`\n\nReturn only the selected "${request.segment.templateId}" implementation object directly as JSON.`,
    },
  ];

  return {
    messages,
  };
};
