import { z } from "zod";

import { MAX_STORYBOARD_SEGMENTS } from "./storyboard-plan-schema";

const emptyStringToUndefined = (value: unknown): unknown =>
  typeof value === "string" && value.trim().length === 0 ? undefined : value;

const shortTextSchema = z.string().trim().min(1).max(160);
const mediumTextSchema = z.string().trim().min(1).max(1200);
const optionalShortTextSchema = z.preprocess(emptyStringToUndefined, shortTextSchema.optional());
const optionalMediumTextSchema = z.preprocess(emptyStringToUndefined, mediumTextSchema.optional());

export const storyboardPlanDraftVisualKindSchema = z.enum([
  "template_macro",
  "workflow",
  "line_path",
  "terminal",
]);

export const storyboardPlanDraftSegmentSchema = z
  .object({
    title: optionalShortTextSchema,
    purpose: mediumTextSchema,
    narrationText: z.string().trim().min(1).max(2000),
    narrationTone: optionalShortTextSchema,
    visualBrief: mediumTextSchema,
    visualKind: storyboardPlanDraftVisualKindSchema.default("template_macro"),
    pacingHint: optionalShortTextSchema,
    expectedDurationSeconds: z.number().positive().max(120).optional(),
    steps: z.array(shortTextSchema).max(30).optional(),
    commands: z.array(shortTextSchema).max(20).optional(),
  })
  .strict();

export const storyboardPlanDraftSchema = z
  .object({
    title: shortTextSchema,
    brief: z.string().trim().min(1).max(4000),
    language: optionalShortTextSchema,
    globalStyle: optionalMediumTextSchema,
    segments: z.array(storyboardPlanDraftSegmentSchema).min(1).max(MAX_STORYBOARD_SEGMENTS),
  })
  .strict();

export type StoryboardPlanDraftVisualKind = z.infer<typeof storyboardPlanDraftVisualKindSchema>;
export type StoryboardPlanDraftSegment = z.infer<typeof storyboardPlanDraftSegmentSchema>;
export type StoryboardPlanDraft = z.infer<typeof storyboardPlanDraftSchema>;
