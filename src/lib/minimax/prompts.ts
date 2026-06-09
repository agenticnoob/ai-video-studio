import type { MinimaxChatMessage, MinimaxTool, MinimaxToolChoice } from "./provider";
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

export const buildStoryboardPlanPrompt = (brief: string): MinimaxPrompt => {
  const safeBrief = brief.length > 0 ? brief : "Create a concise AI Video Studio workflow video.";
  const messages: MinimaxChatMessage[] = [
    { role: "system", content: STORYBOARD_PLAN_SYSTEM_PROMPT },
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
