import {
  storyboardPlanSchema,
  type StoryboardPlan,
  type StoryboardSegmentPlan,
} from "../storyboard-plan-schema";
import { normalizeSegmentCaptions } from "../captions";
import { segmentNarrationAssetSchema, type SegmentNarrationAsset } from "../narration-asset-schema";
import { StoryboardSegmentNotFoundError } from "./errors";
import { createTtsRunId } from "./artifacts";
import { readF5TtsConfig, readTtsProviderId, type TtsProviderId } from "./config";
import { synthesizeF5Speech } from "./f5";
import { synthesizeMinimaxSpeech } from "./minimax";

export { StoryboardSegmentNotFoundError, TtsConfigError, TtsProviderError } from "./errors";

export type GenerateSegmentNarrationAssetRequest = {
  plan: StoryboardPlan;
  segmentId: string;
  provider?: TtsProviderId;
  voiceId?: string;
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
  const provider = request.provider ?? readTtsProviderId();
  const result =
    provider === "f5-tts"
      ? await synthesizeF5SpeechWithFallback({
          language: plan.language,
          runId,
          segmentId: segment.id,
          text: segment.narration.text,
          voiceId: request.voiceId,
        })
      : await synthesizeMinimaxSpeech({
          text: segment.narration.text,
          segmentId: segment.id,
          runId,
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

type F5SpeechWithFallbackRequest = {
  language?: string;
  runId: string;
  segmentId: string;
  text: string;
  voiceId?: string;
};

const shouldFallbackToMinimax = (): boolean => {
  try {
    return readF5TtsConfig().fallbackToMinimax;
  } catch {
    return false;
  }
};

const synthesizeF5SpeechWithFallback = async (request: F5SpeechWithFallbackRequest) => {
  try {
    return await synthesizeF5Speech(request);
  } catch (error) {
    if (!shouldFallbackToMinimax()) {
      throw error;
    }

    console.warn("F5-TTS synthesis failed; falling back to MiniMax TTS.", {
      message: error instanceof Error ? error.message : String(error),
      segmentId: request.segmentId,
    });
    return synthesizeMinimaxSpeech({
      text: request.text,
      segmentId: request.segmentId,
      runId: request.runId,
      voiceId: request.voiceId,
    });
  }
};
