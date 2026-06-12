import {
  storyboardPlanSchema,
  type StoryboardPlan,
  type StoryboardSegmentPlan,
} from "../storyboard-plan-schema";
import { normalizeSegmentCaptions } from "../captions";
import { segmentNarrationAssetSchema, type SegmentNarrationAsset } from "../narration-asset-schema";
import { StoryboardSegmentNotFoundError } from "./errors";
import { createTtsRunId } from "./artifacts";
import type { TtsProviderId } from "./config";
import { writeSegmentCaptionArtifact } from "./caption-artifacts";
import { resolveTtsProvider } from "./provider-selection";
import { synthesizeSegmentNarration } from "./synthesis";
import type { VoiceCloneRequest } from "./voice-references";

export { StoryboardSegmentNotFoundError, TtsConfigError, TtsProviderError } from "./errors";

export type GenerateSegmentNarrationAssetRequest = {
  plan: StoryboardPlan;
  segmentId: string;
  provider?: TtsProviderId;
  voiceId?: string;
  voiceClone?: VoiceCloneRequest;
};

export const getStoryboardSegmentPlan = (
  plan: StoryboardPlan,
  segmentId: string,
): StoryboardSegmentPlan => {
  const segment = plan.segments.find((candidate) => candidate.id === segmentId);
  if (!segment) {
    throw new StoryboardSegmentNotFoundError(segmentId);
  }

  return segment;
};

export const generateSegmentNarrationAsset = async (
  request: GenerateSegmentNarrationAssetRequest,
): Promise<SegmentNarrationAsset> => {
  const plan = storyboardPlanSchema.parse(request.plan);
  const segment = getStoryboardSegmentPlan(plan, request.segmentId);
  const runId = createTtsRunId();
  const providerSelection = await resolveTtsProvider({
    provider: request.provider,
    voiceClone: request.voiceClone,
  });
  const result = await synthesizeSegmentNarration({
    fallbackToMinimax: providerSelection.fallbackToMinimax,
    language: plan.language,
    provider: providerSelection.provider,
    referenceAudioPath: providerSelection.voiceCloneReference?.referenceAudioPath,
    referenceText: providerSelection.voiceCloneReference?.referenceText,
    runId,
    segmentId: segment.id,
    text: segment.narration.text,
    voiceId: request.voiceId,
  });
  const providerCaptions = "captions" in result ? result.captions : undefined;
  const captions =
    providerCaptions ??
    normalizeSegmentCaptions({
      durationInFrames: result.durationInFrames,
      language: plan.language,
      text: segment.narration.text,
    });
  await writeSegmentCaptionArtifact({
    audioOutputPath: result.outputPath,
    audioSrc: result.audioSrc,
    captions,
    durationInFrames: result.durationInFrames,
    durationInSeconds: result.durationInSeconds,
    provider: result.provider,
    segmentId: segment.id,
    text: segment.narration.text,
    voiceId: result.voiceId,
  });

  return segmentNarrationAssetSchema.parse({
    text: segment.narration.text,
    audioSrc: result.audioSrc,
    durationInFrames: result.durationInFrames,
    durationInSeconds: result.durationInSeconds,
    voiceId: result.voiceId,
    provider: result.provider,
    format: result.format,
    captions,
  });
};
