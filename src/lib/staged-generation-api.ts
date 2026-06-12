import { z } from "zod";

import { TemplateImplementationParseError } from "./minimax/parse-template-implementation";
import { StoryboardPlanParseError } from "./minimax/parse-storyboard-plan";
import { videoProjectSchema } from "./project-schema";
import { storyboardPlanSchema } from "./storyboard-plan-schema";
import { voiceCloneRequestSchema } from "./tts/voice-references";

const ttsProviderSchema = z.enum(["f5-tts", "minimax"]);

const stagedBriefRequestSchema = z.object({
  mode: z.literal("brief"),
  brief: z.string().trim().min(1, "Brief is required").max(4000, "Brief is too long"),
  provider: ttsProviderSchema.optional(),
  voiceId: z.string().trim().min(1).max(160).optional(),
  voiceClone: voiceCloneRequestSchema.optional(),
});

const stagedPlanRequestSchema = z.object({
  mode: z.literal("plan"),
  plan: storyboardPlanSchema,
  provider: ttsProviderSchema.optional(),
  voiceId: z.string().trim().min(1).max(160).optional(),
  voiceClone: voiceCloneRequestSchema.optional(),
});

const stagedSegmentRequestSchema = z.object({
  mode: z.literal("segment"),
  project: videoProjectSchema,
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
  /MiniMax request failed|MiniMax returned a non-JSON response|MiniMax response was not valid JSON|truncated by max_tokens|had no tool_calls|unexpected function|tool_call arguments were empty|tool_call arguments were not valid JSON|Generated storyboard plan failed schema validation|MiniMax template implementation arguments were not valid JSON|Generated ".*" implementation failed schema validation|implementation duration .* is shorter than required narration duration/;

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
