import { z } from "zod";

import { MAX_STORYBOARD_SEGMENTS, templateIdSchema } from "./storyboard-plan-schema";

const nonEmptyString = (max: number) => z.string().trim().min(1).max(max);

export const storyboardPlanDraftRecipeHintSchema = z
  .object({
    recipeId: nonEmptyString(80),
    reason: nonEmptyString(400).optional(),
  })
  .strip();

export const storyboardPlanDraftNarrationSchema = z
  .object({
    text: nonEmptyString(2000),
    tone: nonEmptyString(160).optional(),
  })
  .passthrough();

export const storyboardSegmentPlanDraftSchema = z
  .object({
    id: nonEmptyString(80).optional(),
    order: z.number().int().min(1).optional(),
    title: nonEmptyString(160).optional(),
    purpose: nonEmptyString(1000),
    templateId: templateIdSchema,
    templateReason: nonEmptyString(1000).optional(),
    narrationText: nonEmptyString(2000).optional(),
    narrationTone: nonEmptyString(160).optional(),
    narration: storyboardPlanDraftNarrationSchema.optional(),
    visualBrief: nonEmptyString(1200),
    recipeHints: z.array(storyboardPlanDraftRecipeHintSchema).min(1).max(5).optional(),
    pacingHint: nonEmptyString(300).optional(),
    expectedDurationSeconds: z.number().positive().max(120).optional(),
  })
  .strip()
  .superRefine((segment, ctx) => {
    if (!segment.narrationText && !segment.narration?.text) {
      ctx.addIssue({
        code: "custom",
        message: "Draft segment must include narrationText or narration.text.",
        path: ["narrationText"],
      });
    }
  });

export const storyboardPlanDraftSchema = z
  .object({
    title: nonEmptyString(160),
    brief: nonEmptyString(4000),
    language: nonEmptyString(80).optional(),
    globalStyle: nonEmptyString(1000).optional(),
    segments: z.array(storyboardSegmentPlanDraftSchema).min(1).max(MAX_STORYBOARD_SEGMENTS),
  })
  .strip();

export type StoryboardPlanDraft = z.infer<typeof storyboardPlanDraftSchema>;
export type StoryboardSegmentPlanDraft = z.infer<typeof storyboardSegmentPlanDraftSchema>;
