import { segmentNarrationFromAsset, type SegmentNarrationAsset } from "../narration-asset-schema";
import { videoSegmentSchema, type VideoSegment } from "../project-schema";
import type { StoryboardPlan, StoryboardSegmentPlan } from "../storyboard-plan-schema";
import { generateSegmentNarrationAsset } from "../tts";
import type { TtsProviderId } from "../tts/config";
import type { VoiceCloneRequest } from "../tts/voice-references";
import { minimaxCompileTemplateImplementation } from "../minimax";
import { getTemplateDefinition } from "../template-registry";

export type CompilePlannedSegmentRequest = {
  narration: SegmentNarrationAsset;
  plan: StoryboardPlan;
  segment: StoryboardSegmentPlan;
};

export type CompilePlannedSegmentResult = {
  compilerAttempts: number;
  narration: SegmentNarrationAsset;
  repaired: boolean;
  segment: VideoSegment;
};

export type GenerateAndCompilePlannedSegmentRequest = {
  plan: StoryboardPlan;
  provider?: TtsProviderId;
  segment: StoryboardSegmentPlan;
  voiceClone?: VoiceCloneRequest;
  voiceId?: string;
};

const getTargetDurationInFrames = (
  segment: StoryboardSegmentPlan,
  narration: SegmentNarrationAsset,
): number => {
  const recommended = getTemplateDefinition(segment.templateId).capabilities
    .recommendedDurationFrames;
  return Math.max(narration.durationInFrames, recommended.min);
};

export const compilePlannedSegment = async ({
  narration,
  plan,
  segment,
}: CompilePlannedSegmentRequest): Promise<CompilePlannedSegmentResult> => {
  const compiled = await minimaxCompileTemplateImplementation({
    plan,
    segment,
    narration,
    targetDurationInFrames: getTargetDurationInFrames(segment, narration),
  });
  const videoSegment = videoSegmentSchema.parse({
    id: segment.id,
    title: segment.title ?? segment.purpose,
    intent: segment.purpose,
    narration: segmentNarrationFromAsset(narration),
    templateId: segment.templateId,
    implementation: compiled.implementation,
  });

  return {
    compilerAttempts: compiled.attempts,
    narration,
    repaired: compiled.repaired,
    segment: videoSegment,
  };
};

export const generateAndCompilePlannedSegment = async ({
  plan,
  provider,
  segment,
  voiceClone,
  voiceId,
}: GenerateAndCompilePlannedSegmentRequest): Promise<CompilePlannedSegmentResult> => {
  const narration = await generateSegmentNarrationAsset({
    plan,
    provider,
    segmentId: segment.id,
    voiceId,
    voiceClone,
  });

  return compilePlannedSegment({
    narration,
    plan,
    segment,
  });
};
