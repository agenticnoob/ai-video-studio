import {
  storyboardPlanSchema,
  type StoryboardPlan,
  type StoryboardSegmentPlan,
} from "../storyboard-plan-schema";
import { segmentNarrationAssetSchema, type SegmentNarrationAsset } from "../narration-asset-schema";
import { StoryboardSegmentNotFoundError } from "./errors";
import { createTtsRunId } from "./artifacts";
import { synthesizeMinimaxSpeech } from "./minimax";

export { StoryboardSegmentNotFoundError, TtsConfigError, TtsProviderError } from "./errors";

export type GenerateSegmentNarrationAssetRequest = {
  plan: StoryboardPlan;
  segmentId: string;
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
  const result = await synthesizeMinimaxSpeech({
    text: segment.narration.text,
    segmentId: segment.id,
    runId,
    voiceId: request.voiceId,
  });

  return segmentNarrationAssetSchema.parse({
    text: segment.narration.text,
    audioSrc: result.audioSrc,
    durationInFrames: result.durationInFrames,
    durationInSeconds: result.durationInSeconds,
    voiceId: result.voiceId,
    provider: result.provider,
    format: result.format,
  });
};
