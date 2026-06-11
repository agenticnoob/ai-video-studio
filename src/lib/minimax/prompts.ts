import type {
  MinimaxChatMessage,
  MinimaxSegmentPlanRevisionRequest,
  MinimaxStoryboardPlanRequest,
  MinimaxTemplateCompileRequest,
  MinimaxTool,
  MinimaxToolChoice,
} from "./provider";
import type { VideoProject } from "../project-schema";
import {
  buildPlannerTemplateManifestPrompt,
  buildTemplateImplementationPrompt,
  buildTemplatePreservationPrompt,
  buildTemplateRevisionPrompt,
  buildTemplateSelectionPrompt,
  SPOTLIGHT_TEMPLATE_ID,
  getTemplateDefinition,
  templateIds,
} from "../template-registry";
import {
  EMIT_RESULT_TOOL,
  EMIT_RESULT_TOOL_CHOICE,
  EMIT_STORYBOARD_PLAN_TOOL,
  buildEmitTemplateImplementationTool,
} from "./tool-schema";

/**
 * Payload for the provider — messages + the tool definition we want the model
 * to call. Returning these together (instead of splitting them across two
 * calls) keeps the tool schema in lockstep with the prompt: if a future
 * variant of `buildXxxPrompt` wants a different schema, the change is local.
 */
export type MinimaxPrompt = {
  messages: MinimaxChatMessage[];
  tools: MinimaxTool[];
  toolChoice: MinimaxToolChoice;
};

const PROJECT_SYSTEM_PROMPT = `You generate structured "VideoProject" JSON for a segment-first video studio.

The output must:
- be a single JSON object (no markdown fence, no commentary)
- validate against the exact Zod schemas below — do not omit required fields
- contain between 1 and 3 segments (1 if brief ≤ 1 sentence, 2 if 2–4 sentences or < 280 chars, 3 if longer)
- use one primary template per segment
- choose templateId from the registered template ids: ${templateIds.map((id) => `"${id}"`).join(", ")}
- use fps=30, width=1280, height=720 in every implementation.meta

# Template selection rules
${buildTemplateSelectionPrompt()}
- A multi-segment project should usually mix templates when the brief has both
  setup/explanation and emphasis/recap beats.
- Do not use "${SPOTLIGHT_TEMPLATE_ID}" for every segment unless the brief asks
  for a very short announcement-style video.

# Registered implementation rules
${buildTemplateImplementationPrompt()}

# Theme rules
Every implementation has a theme with all 6 fields:
  background, panel, primary, secondary, text, muted
Use CSS color literals (hex or rgba). Vary primary/secondary across segments
so multi-segment projects feel distinct, but keep contrast readable.

# Hard constraints
- Return ONLY the JSON object. Do not prefix with "Here is the JSON:".
- Do not add fields not in the schemas.
- Do not return empty implementation.scenes arrays for scripted segments.
- Do not include implementation.scenes on spotlight segments.
- Do not include headline/callouts on scripted segments.
- If the brief is empty or off-topic, still return a valid 1-segment project
  with a generic AI Video Studio workflow.
- Return the VideoProject fields (meta, brief, segments) as the TOP-LEVEL keys
  of a single JSON object. Do NOT wrap them inside "project" or any other
  container object. The first level of the returned JSON must contain meta,
  brief, and segments directly.

# Tool-calling contract (CRITICAL)
You MUST emit the result by calling the function tool named "emit_result".
Pass the complete VideoProject object (top-level keys: meta, brief, segments)
as the function arguments JSON string. Do not return the JSON in the assistant
content channel — it will be ignored. Do not call any other tool.`;

const STORYBOARD_PLAN_SYSTEM_PROMPT = `You create a structured "StoryboardPlan" for a segment-first video studio.

This is the planning stage only. The output decides segment intent, narration,
visual direction, and one primary registered template per segment. It must not
generate final template implementation fields.

The output must:
- be a single JSON object (no markdown fence, no commentary)
- validate against the StoryboardPlan tool schema
- contain between 1 and 6 segments; prefer 1-3 unless the brief clearly needs more
- use one primary template per segment
- choose templateId from the registered template ids: ${templateIds.map((id) => `"${id}"`).join(", ")}
- set segment.order as contiguous integers starting at 1
- use stable segment ids like "segment-1", "segment-2"
- write narration.text as the spoken script for that segment
- explain templateReason using the selected template's fit for the segment purpose
- describe visualBrief without inventing media URLs or Remotion source code
- set expectedDurationSeconds when the brief or narration gives a useful timing hint

# Planner template manifest
${buildPlannerTemplateManifestPrompt()}

# Planning boundaries
- Do not generate implementation, scenes, callouts, theme, colors, or template props.
- Do not invent template ids.
- Do not model one segment as multiple template instances.
- Do not create arbitrary media URLs.
- Preserve the user's intent and language when possible.

# Tool-calling contract (CRITICAL)
You MUST emit the result by calling the function tool named "emit_result".
Pass the complete StoryboardPlan object (top-level keys: title, brief, segments,
and optional language/globalStyle) as the function arguments JSON string. Do
not return the JSON in the assistant content channel — it will be ignored.`;

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

const buildTemplateCompilerSystemPrompt = (request: MinimaxTemplateCompileRequest): string => {
  const template = getTemplateDefinition(request.segment.templateId);
  const durationRange = template.capabilities.recommendedDurationFrames;
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
- Generated narration audio is carried outside template implementation through project media layers.
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

${repairInstructions}

# Tool-calling contract (CRITICAL)
You MUST emit the result by calling the function tool named "emit_result".
Pass only the selected template implementation object as the function arguments JSON string.
Do not return JSON in the assistant content channel — it will be ignored.`;
};

/**
 * System prompt for segment-revision mode. Mostly the same shape, but the
 * preservation rule moves from "emit one of N segments" to "emit full project
 * with N-1 segments byte-identical". The tool call still goes through
 * `emit_result` (single-tool routing per the T1 research probe — see
 * docs/providers/minimax-tool-calling.md §5.1).
 */
const buildSegmentSystemPrompt = (targetSegmentId: string, revisionPrompt: string): string => {
  return `You revise a single segment inside an existing "VideoProject" JSON.

# Output contract
Return the FULL VideoProject (not a partial diff), matching the exact Zod
schemas in this conversation. The output must be a single JSON object
(no markdown fence, no commentary). You MUST emit it by calling the
"emit_result" function tool with the full VideoProject as arguments.

# Preservation rules (HARD)
|- For every segment whose id is NOT "${targetSegmentId}":
  - copy title, intent, templateId, AND the full template-specific implementation
    verbatim from the input — byte-for-byte, character-for-character
${buildTemplatePreservationPrompt()}
  - do NOT regenerate, re-color, reorder, rephrase, or trim any
    non-target segment
  - do NOT omit any template-specific required fields from non-target segments:
    the input payload contains them and the output MUST echo them
- For the segment whose id IS "${targetSegmentId}":
  - you may change title, intent, and implementation
  - you may choose templateId from ${templateIds.map((id) => `"${id}"`).join(", ")}
    if the revision request asks for a different presentation style
  - keep implementation.meta.title aligned with segment.title
  - if the revision prompt is empty or off-topic, keep the segment as-is

# Revision request for target segment
${revisionPrompt}

# Registered implementation schema reminders
${buildTemplateRevisionPrompt()}

Return ONLY the JSON object via the "emit_result" tool call.`;
};

const buildSegmentPayloadForRevise = (project: VideoProject): unknown => {
  return {
    meta: project.meta,
    brief: project.brief,
    segments: project.segments.map((segment) => ({
      id: segment.id,
      title: segment.title,
      intent: segment.intent,
      templateId: segment.templateId,
      implementation: getTemplateDefinition(segment.templateId).buildRevisionPayload(
        segment.implementation as never,
      ),
    })),
  };
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

export const buildProjectPrompt = (brief: string): MinimaxPrompt => {
  const safeBrief = brief.length > 0 ? brief : "Create a concise AI Video Studio workflow video.";
  const messages: MinimaxChatMessage[] = [
    { role: "system", content: PROJECT_SYSTEM_PROMPT },
    {
      role: "user",
      content: `Brief:\n"""\n${safeBrief}\n"""\n\nReturn a single JSON object matching the VideoProject contract above. Call the "emit_result" tool with the full project as arguments.`,
    },
  ];
  return {
    messages,
    tools: [EMIT_RESULT_TOOL],
    toolChoice: EMIT_RESULT_TOOL_CHOICE,
  };
};

export const buildStoryboardPlanPrompt = ({
  brief,
  previousInvalidOutput,
  validationError,
}: MinimaxStoryboardPlanRequest): MinimaxPrompt => {
  const safeBrief = brief.length > 0 ? brief : "Create a concise AI Video Studio workflow video.";
  const repairInstructions = buildStoryboardRepairInstructions({
    previousInvalidOutput,
    validationError,
  });
  const messages: MinimaxChatMessage[] = [
    {
      role: "system",
      content: [STORYBOARD_PLAN_SYSTEM_PROMPT, repairInstructions].filter(Boolean).join("\n\n"),
    },
    {
      role: "user",
      content: `Brief:\n"""\n${safeBrief}\n"""\n\nReturn a single JSON object matching the StoryboardPlan contract above. Call the "emit_result" tool with the complete plan as arguments.`,
    },
  ];

  return {
    messages,
    tools: [EMIT_STORYBOARD_PLAN_TOOL],
    toolChoice: EMIT_RESULT_TOOL_CHOICE,
  };
};

export const buildSegmentPlanRevisionPrompt = ({
  previousInvalidOutput,
  project,
  revisionPrompt,
  segmentId,
  validationError,
}: MinimaxSegmentPlanRevisionRequest): MinimaxPrompt => {
  const payload = JSON.stringify(buildSegmentPlanRevisionPayload(project, segmentId), null, 2);
  const repairInstructions = buildStoryboardRepairInstructions({
    previousInvalidOutput,
    validationError,
  });
  const messages: MinimaxChatMessage[] = [
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
- Write narration.text as the actual spoken script for this segment, not as an instruction.
- Keep narration concise enough for a short product-demo segment.
- Describe visualBrief for this segment without inventing media URLs or Remotion source code.
- Do not include implementation, scenes, callouts, theme, colors, audio URLs, or provider metadata.

# Planner template manifest
${buildPlannerTemplateManifestPrompt()}

${repairInstructions}

# Tool-calling contract (CRITICAL)
You MUST emit the result by calling the function tool named "emit_result".
Pass the complete one-segment StoryboardPlan object as the function arguments JSON string.`,
    },
    {
      role: "user",
      content: `Current project and target segment:\n\`\`\`json\n${payload}\n\`\`\`\n\nRevision request:\n"""\n${revisionPrompt}\n"""\n\nReturn exactly one planned segment for "${segmentId}" with fresh narration text. Call the "emit_result" tool with the StoryboardPlan as arguments.`,
    },
  ];

  return {
    messages,
    tools: [EMIT_STORYBOARD_PLAN_TOOL],
    toolChoice: EMIT_RESULT_TOOL_CHOICE,
  };
};

export const buildTemplateCompilerPrompt = (
  request: MinimaxTemplateCompileRequest,
): MinimaxPrompt => {
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
  const messages: MinimaxChatMessage[] = [
    { role: "system", content: buildTemplateCompilerSystemPrompt(request) },
    {
      role: "user",
      content: `Compiler input:\n\`\`\`json\n${payload}\n\`\`\`\n\nReturn only the selected "${request.segment.templateId}" implementation object. Call the "emit_result" tool with that implementation as arguments.`,
    },
  ];

  return {
    messages,
    tools: [buildEmitTemplateImplementationTool(request.segment.templateId)],
    toolChoice: EMIT_RESULT_TOOL_CHOICE,
  };
};

export const buildSegmentPrompt = (
  project: VideoProject,
  segmentId: string,
  revisionPrompt: string,
): MinimaxPrompt => {
  const targetExists = project.segments.some((segment) => segment.id === segmentId);
  const targetSegmentId = targetExists ? segmentId : "__missing__";
  const systemPrompt = buildSegmentSystemPrompt(targetSegmentId, revisionPrompt);
  const payload = JSON.stringify(buildSegmentPayloadForRevise(project), null, 2);
  const messages: MinimaxChatMessage[] = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `Current project (full template-specific implementation on every segment so you can copy non-target segments verbatim):\`\`\`json\n${payload}\n\`\`\`\n\nTarget segmentId: "${segmentId}"\nRevision prompt: "${revisionPrompt}"\n\nReturn the full VideoProject JSON with all segments. Preserve other segments\nverbatim and regenerate only the target segment. Call the "emit_result" tool with the full project as arguments.`,
    },
  ];
  return {
    messages,
    tools: [EMIT_RESULT_TOOL],
    toolChoice: EMIT_RESULT_TOOL_CHOICE,
  };
};
