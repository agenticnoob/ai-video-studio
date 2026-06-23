import { storyboardPlanSchema, type StoryboardPlan } from "./storyboard-plan-schema";
import type { StoryboardPlanDraft, StoryboardSegmentPlanDraft } from "./storyboard-plan-draft-schema";

const getSegmentId = (segment: StoryboardSegmentPlanDraft, index: number): string =>
  segment.id ?? `segment-${index + 1}`;

const getSegmentOrder = (segment: StoryboardSegmentPlanDraft, index: number): number =>
  segment.order ?? index + 1;

const getNarrationText = (segment: StoryboardSegmentPlanDraft): string =>
  segment.narrationText ?? segment.narration?.text ?? "";

const getNarrationTone = (segment: StoryboardSegmentPlanDraft): string | undefined =>
  segment.narrationTone ?? segment.narration?.tone;

const getTemplateReason = (segment: StoryboardSegmentPlanDraft): string =>
  segment.templateReason ?? `Selected because it fits this segment purpose: ${segment.purpose}`;

const compileSegment = (segment: StoryboardSegmentPlanDraft, index: number) => ({
  id: getSegmentId(segment, index),
  order: getSegmentOrder(segment, index),
  ...(segment.title ? { title: segment.title } : {}),
  purpose: segment.purpose,
  templateId: segment.templateId,
  templateReason: getTemplateReason(segment),
  narration: {
    text: getNarrationText(segment),
    ...(getNarrationTone(segment) ? { tone: getNarrationTone(segment) } : {}),
  },
  visualBrief: segment.visualBrief,
  ...(segment.recipeHints
    ? {
        recipeHints: segment.recipeHints.map((hint) => ({
          recipeId: hint.recipeId,
          reason: hint.reason ?? `Draft requested ${hint.recipeId} for this segment.`,
        })),
      }
    : {}),
  ...(segment.pacingHint ? { pacingHint: segment.pacingHint } : {}),
  ...(segment.expectedDurationSeconds
    ? { expectedDurationSeconds: segment.expectedDurationSeconds }
    : {}),
});

export const compileStoryboardPlanDraft = (draft: StoryboardPlanDraft): StoryboardPlan => {
  return storyboardPlanSchema.parse({
    title: draft.title,
    brief: draft.brief,
    ...(draft.language ? { language: draft.language } : {}),
    ...(draft.globalStyle ? { globalStyle: draft.globalStyle } : {}),
    segments: draft.segments.map(compileSegment),
  });
};
