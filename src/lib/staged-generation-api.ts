import { z } from "zod";

import { TemplateImplementationParseError } from "./deepseek/parse-template-implementation";
import { StoryboardPlanParseError } from "./deepseek/parse-storyboard-plan";
import { videoProjectSchema } from "./project-schema";
import { storyboardPlanSchema } from "./storyboard-plan-schema";
import { voiceCloneRequestSchema } from "./tts/voice-references";

const ttsProviderSchema = z.enum(["f5-tts"]);
const progressIdSchema = z.string().trim().min(1).max(160).optional();

const stagedBriefRequestSchema = z.object({
  mode: z.literal("brief"),
  brief: z.string().trim().min(1, "Brief is required").max(4000, "Brief is too long"),
  progressId: progressIdSchema,
  provider: ttsProviderSchema.optional(),
  voiceId: z.string().trim().min(1).max(160).optional(),
  voiceClone: voiceCloneRequestSchema.optional(),
});

const stagedPlanRequestSchema = z.object({
  mode: z.literal("plan"),
  plan: storyboardPlanSchema,
  progressId: progressIdSchema,
  provider: ttsProviderSchema.optional(),
  voiceId: z.string().trim().min(1).max(160).optional(),
  voiceClone: voiceCloneRequestSchema.optional(),
});

const stagedSegmentRequestSchema = z.object({
  mode: z.literal("segment"),
  project: videoProjectSchema,
  progressId: progressIdSchema,
  segmentId: z.string().trim().min(1, "Segment id is required"),
  revisionPrompt: z
    .string()
    .trim()
    .min(1, "Revision prompt is required")
    .max(4000, "Revision prompt is too long"),
  provider: ttsProviderSchema.optional(),
  voiceId: z.string().trim().min(1).max(160).optional(),
  voiceClone: voiceCloneRequestSchema.optional(),
});

const upstreamErrorPattern =
  /DeepSeek request failed|DeepSeek response had no JSON output|Generated storyboard plan failed schema validation|DeepSeek storyboard JSON output was not valid JSON|DeepSeek template implementation JSON output was not valid JSON|Generated ".*" implementation failed schema validation|implementation duration .* is shorter than required narration duration/;

export const stagedGenerateRequestSchema = z.discriminatedUnion("mode", [
  stagedBriefRequestSchema,
  stagedPlanRequestSchema,
  stagedSegmentRequestSchema,
]);

export type StagedGenerateRequest = z.infer<typeof stagedGenerateRequestSchema>;

export const getStagedGenerationErrorStatus = (error: unknown): number => {
  const message = error instanceof Error ? error.message : "";

  return error instanceof StoryboardPlanParseError ||
    error instanceof TemplateImplementationParseError ||
    upstreamErrorPattern.test(message)
    ? 502
    : 500;
};
