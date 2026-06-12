import { segmentNarrationFromAsset, type SegmentNarrationAsset } from "../narration-asset-schema";
import { videoSegmentSchema, type VideoSegment } from "../project-schema";
import type { StoryboardPlan, StoryboardSegmentPlan } from "../storyboard-plan-schema";
import { generateSegmentNarrationAsset } from "../tts";
import type { TtsProviderId } from "../tts/config";
import type { VoiceCloneRequest } from "../tts/voice-references";
import { minimaxCompileTemplateImplementation } from "../minimax";
import { getTemplateDefinition } from "../template-registry";
import type { StagedGenerationProgressReporter } from "./pipeline";

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
  onProgress?: StagedGenerationProgressReporter;
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
  onProgress,
  plan,
  provider,
  segment,
  voiceClone,
  voiceId,
}: GenerateAndCompilePlannedSegmentRequest): Promise<CompilePlannedSegmentResult> => {
  onProgress?.("narration", "running", `Generating narration for ${segment.id}.`);
  let narration: SegmentNarrationAsset;
  try {
    narration = await generateSegmentNarrationAsset({
      plan,
      provider,
      segmentId: segment.id,
      voiceId,
      voiceClone,
    });
    onProgress?.("narration", "success", `Narration generated for ${segment.id}.`);
  } catch (error) {
    onProgress?.("narration", "failure", error instanceof Error ? error.message : undefined);
    throw error;
  }

  onProgress?.("compiler", "running", `Compiling template for ${segment.id}.`);
  try {
    const compiled = await compilePlannedSegment({
      narration,
      plan,
      segment,
    });
    onProgress?.("compiler", "success", `Template compiled for ${segment.id}.`);
    return compiled;
  } catch (error) {
    onProgress?.("compiler", "failure", error instanceof Error ? error.message : undefined);
    throw error;
  }
};
