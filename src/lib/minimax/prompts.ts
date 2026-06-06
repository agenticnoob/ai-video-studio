import type { MinimaxChatMessage, MinimaxTool, MinimaxToolChoice } from "./provider";
import { SCRIPTED_TEMPLATE_ID, type VideoProject } from "../project-schema";
import { EMIT_RESULT_TOOL, EMIT_RESULT_TOOL_CHOICE } from "./tool-schema";

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
- use templateId "${SCRIPTED_TEMPLATE_ID}" for every segment
- use fps=30, width=1280, height=720 in every implementation.meta

# Scripted implementation rules
Because every current segment uses templateId "${SCRIPTED_TEMPLATE_ID}",
each segment.implementation must be the scripted VideoSpec shape. In that
shape, implementation.scenes is an array of 1+ scripted scenes. Each scene has a
discriminated \`type\` ∈ {"title", "bullets", "quote"} with fields:

  title:   { id, type:"title",   duration, kicker?, title, subtitle?, voiceover? }
  bullets: { id, type:"bullets", duration, kicker?, title, bullets: string[≥1], voiceover? }
  quote:   { id, type:"quote",   duration, kicker?, quote, author?, voiceover? }

- duration is an integer > 0, in frames at 30fps (so 90 ≈ 3 seconds)
- scene ids must be unique within the segment and stable across regenerations
  (e.g. "hook", "pipeline", "output")
- keep total per-segment duration between 90 and 600 frames

# Scripted theme rules
Every scripted implementation has a theme with all 6 fields:
  background, panel, primary, secondary, text, muted
Use CSS color literals (hex or rgba). Vary primary/secondary across segments
so multi-segment projects feel distinct, but keep contrast readable.

# Hard constraints
- Return ONLY the JSON object. Do not prefix with "Here is the JSON:".
- Do not add fields not in the schemas.
- Do not return empty implementation.scenes arrays for scripted segments.
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
  - copy title, intent, templateId, AND scripted implementation (meta + theme + scenes)
    verbatim from the input — byte-for-byte, character-for-character
  - in particular: the scenes array (including per-scene id, type, title,
    bullets/quote, duration, kicker, voiceover) and the theme object
    (background, panel, primary, secondary, text, muted) must match the
    input exactly
  - do NOT regenerate, re-color, reorder, rephrase, or trim any
    non-target segment
  - do NOT omit theme or scenes from non-target segments: the input
    payload contains them and the output MUST echo them. Omitting
    implementation.theme or implementation.scenes from a non-target
    segment is a hard failure (Zod will reject the project).
- For the segment whose id IS "${targetSegmentId}":
  - you may change title, intent, and implementation
  - keep templateId = "${SCRIPTED_TEMPLATE_ID}"
  - keep implementation.meta.title === implementation.scenes[0].title etc.
  - if the revision prompt is empty or off-topic, keep the segment as-is

# Revision request for target segment
${revisionPrompt}

# Scripted implementation schema reminder
- implementation.meta: { title, fps=30, width=1280, height=720 }
- implementation.theme: { background, panel, primary, secondary, text, muted }
- implementation.scenes: 1+ items, each type ∈ {"title", "bullets", "quote"} with the
  matching fields; duration is integer frames at 30fps

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
      implementation: {
        meta: segment.implementation.meta,
        theme: segment.implementation.theme,
        scenes: segment.implementation.scenes,
      },
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
      content: `Current project (full implementation on every segment so you can copy non-target segments verbatim — meta, theme, and scenes are all present in the payload below):\`\`\`json\n${payload}\n\`\`\`\n\nTarget segmentId: "${segmentId}"\nRevision prompt: "${revisionPrompt}"\n\nReturn the full VideoProject JSON with all segments. Preserve other segments\nverbatim (including theme + scenes) and regenerate only the target segment.\nCall the "emit_result" tool with the full project as arguments.`,
    },
  ];
  return {
    messages,
    tools: [EMIT_RESULT_TOOL],
    toolChoice: EMIT_RESULT_TOOL_CHOICE,
  };
};
