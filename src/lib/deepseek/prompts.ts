import type {
  DeepSeekChatMessage,
  DeepSeekSegmentPlanRevisionRequest,
  DeepSeekStoryboardPlanRequest,
  DeepSeekTemplateCompileRequest,
} from "./provider";
import type { VideoProject } from "../project-schema";
import { getTemplateDefinition } from "../template-registry";

/**
 * Payload for the provider. The transport uses JSON mode, then the parser
 * validates the returned object against small provider-facing draft contracts
 * before deterministic project contracts are compiled.
 */
export type DeepSeekPrompt = {
  messages: DeepSeekChatMessage[];
};

const STORYBOARD_PLAN_SYSTEM_PROMPT = `You create a structured "StoryboardPlanDraft" for a segment-first video studio.

This is the planning stage only. The output captures segment intent,
narration, visual direction, and a simple visual kind. Deterministic code will
compile this draft into the final StoryboardPlan, including ids, order,
templateId, strategyDecision, proceduralGenerator, refs, and beats.

The output must:
- be a single JSON object (no markdown fence, no commentary)
- validate against the StoryboardPlanDraft schema
- contain between 1 and 6 segments; prefer 1-3 unless the brief clearly needs more
- every segment MUST include these keys: purpose, narrationText, visualBrief, and visualKind
- title is recommended for every segment, but the compiler can fill a fallback title
- set purpose as a concrete one-sentence goal for that segment, not an empty
  label and not only a title
- write narrationText as the spoken script for that segment
- describe visualBrief without inventing media URLs or Remotion source code
- choose visualKind from "template_macro", "workflow", "line_path", or "terminal"
- set expectedDurationSeconds when the brief or narration gives a useful timing hint

# Visual kind routing
- Use "workflow" for deterministic workflow, node graph, dependency flow, agent
  loop, system pipeline, state machine, or node-and-edge visuals.
- Use "line_path" for journeys, timelines, progressions, funnels, milestone
  paths, sequencing paths, or narration-driven path reveals.
- Use "terminal" for CLI, build, test, deploy, install, migration dry-run,
  smoke check, command output, or terminal walkthrough segments.
- Use "template_macro" for short hooks, recap cards, single key messages,
  text-heavy narration, metrics, calls to action, or cases where no bounded
  workflow/path/terminal visual is needed.
- For workflow and line_path segments, include steps as short labels. The code
  compiler will generate ids, refs, graph/path structures, and beats.
- For terminal segments, include commands as concise terminal lines. The code
  compiler will generate ids, refs, statuses, and beats.
- Do not output templateId, templateReason, strategyDecision,
  proceduralGenerator, nodes, edges, points, lines with ids, beats, atFrame,
  durationInFrames, implementation, scenes, callouts, theme, colors, or template props.

# Asset plan boundary
- Do not output assetPlan in StoryboardPlanDraft. Future asset requests remain
  a separate bounded StoryboardPlan feature.

# Planning boundaries
- Do not generate implementation, scenes, callouts, theme, colors, or template props.
- Do not model one segment as multiple template instances.
- Do not create arbitrary media URLs.
- Preserve the user's intent and language when possible.

# JSON output contract (CRITICAL)
Return the complete StoryboardPlanDraft object directly as JSON. The top-level keys
must be title, brief, segments, and optional language/globalStyle.
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
    "The previous StoryboardPlanDraft output was rejected. Return a corrected StoryboardPlanDraft object only.",
    "Preserve the user's intent, but fix JSON shape, required draft fields, valid visualKind values, and concise steps/commands.",
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

Return a StoryboardPlanDraft containing EXACTLY ONE segment: the target segment to regenerate.
This is the planning stage only. Deterministic code will compile the draft into
the final StoryboardPlan, including ids, order, templateId, strategyDecision,
proceduralGenerator, refs, and beats.

# Output requirements
- Preserve the original language unless the revision request explicitly asks otherwise.
- The top-level draft must include title, brief, and exactly one segment.
- The single segment must include purpose, narrationText, visualBrief, and visualKind.
- Use title when useful; the compiler can fill a fallback title.
- Choose visualKind from "template_macro", "workflow", "line_path", or "terminal".
- Keep narrationText as the actual spoken script for this segment, not as an instruction.
- Keep narration concise enough for a short product-demo segment.
- Describe visualBrief without inventing media URLs or Remotion source code.
- Use "workflow" for deterministic workflow, node graph, agent loop, system
  pipeline, dependency graph, state machine, or node-and-edge visuals.
- Use "line_path" for journeys, timelines, progressions, funnels, milestone
  paths, sequencing paths, or narration-driven path reveals.
- Use "terminal" for CLI, build, test, deploy, install, migration dry-run,
  smoke check, command output, or terminal walkthroughs.
- Use "template_macro" when no bounded workflow/path/terminal visual is needed.
- For workflow and line_path segments, include steps as short labels.
- For terminal segments, include commands as concise terminal lines.
- Do not output id, order, templateId, templateReason, strategyDecision,
  proceduralGenerator, nodes, edges, points, lines with ids, beats, atFrame,
  durationInFrames, implementation, scenes, callouts, theme, colors, audio URLs,
  or provider metadata.

${repairInstructions}

# JSON output contract (CRITICAL)
Return the complete one-segment StoryboardPlanDraft object directly as JSON.
Do not wrap the result inside "emit_result", "arguments", "result", "data", or
any other container.`,
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
