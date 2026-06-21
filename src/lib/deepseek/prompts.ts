import type {
  DeepSeekChatMessage,
  DeepSeekSegmentPlanRevisionRequest,
  DeepSeekStoryboardPlanRequest,
  DeepSeekTemplateCompileRequest,
} from "./provider";
import type { VideoProject } from "../project-schema";
import {
  buildPlannerRecipeManifestPrompt,
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
- set segment.order as contiguous integers starting at 1
- use stable segment ids like "segment-1", "segment-2"
- write narration.text as the spoken script for that segment
- explain templateReason using the selected template's fit for the segment purpose
- describe visualBrief without inventing media URLs or Remotion source code
- set expectedDurationSeconds when the brief or narration gives a useful timing hint
- when a selected template lists planner-facing recipes, optionally set segment.recipeHints to the most relevant recipe ids from that template only
- each recipe hint must be { recipeId, reason }
- leave recipeHints omitted when no listed recipe fits the segment

# Planner template manifest
${buildPlannerTemplateManifestPrompt()}

# Planner recipe manifest
${buildPlannerRecipeManifestPrompt()}

# Planning boundaries
- Do not generate implementation, scenes, callouts, theme, colors, or template props.
- Do not invent template ids.
- Do not invent recipe ids.
- Do not use recipe hints from a different template.
- The compiler turns recipe hints into implementation fields; the planner must not output sections, theme, colors, or template props.
- Do not model one segment as multiple template instances.
- Do not create arbitrary media URLs.
- Preserve the user's intent and language when possible.

# JSON output contract (CRITICAL)
Return the complete StoryboardPlan object directly as JSON. The top-level keys
must be title, brief, segments, and optional language/globalStyle. Do not wrap
the result inside "emit_result", "arguments", "result", "data", or any other
container.`;

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
- Treat segment.recipeHints as planner guidance, not as output fields.
- Respect valid recipe hints when they fit the narration duration and selected template schema.
- The implementation must still validate against the selected template schema if hints are omitted.

# Theme rules
- Include all required theme fields when the selected template schema requires theme.
- Use readable contrast and CSS color literals.

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
- Write narration.text as the actual spoken script for this segment, not as an instruction.
- Keep narration concise enough for a short product-demo segment.
- Describe visualBrief for this segment without inventing media URLs or Remotion source code.
- If the selected template lists planner-facing recipes, optionally set recipeHints using ids from that template only.
- Keep recipeHints omitted when the revision request does not imply a recipe-specific presentation.
- Do not include implementation, scenes, callouts, theme, colors, audio URLs, or provider metadata.

# Planner template manifest
${buildPlannerTemplateManifestPrompt()}

# Planner recipe manifest
${buildPlannerRecipeManifestPrompt()}

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
        plannerRecipes: template.planner.recipes ?? [],
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
