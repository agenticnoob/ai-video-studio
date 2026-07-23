import type { SegmentCaptions } from "../../../standalone-video/caption-types";
import type { ProducerAudioTrack } from "../../../../../scripts/lib/producer-audio";
import type {
  StandaloneCanvasProfileId,
  StandaloneContentFamily,
  StandaloneTimedScene,
} from "../../../standalone-video/types";

export const SAMPLE_NAME_COMPOSITION_ID = "SampleName";
export const SAMPLE_NAME_FPS = 30;
export const SAMPLE_NAME_WIDTH = 1280;
export const SAMPLE_NAME_HEIGHT = 720;
export const SAMPLE_NAME_DURATION_IN_FRAMES = 300;
export const SAMPLE_NAME_PROFILE_ID = "landscape-16x9";
export const SAMPLE_NAME_CONTENT_FAMILY = "project-intro";

export type SampleNameSceneId = "open" | "proof" | "close";

export type SampleNameScene = StandaloneTimedScene & {
  readonly id: SampleNameSceneId;
  readonly narration: string;
  readonly audioFile: string;
  readonly captions: SegmentCaptions;
};

export type SampleNameData = {
  readonly contentFamily: typeof SAMPLE_NAME_CONTENT_FAMILY & StandaloneContentFamily;
  readonly profileId: typeof SAMPLE_NAME_PROFILE_ID & StandaloneCanvasProfileId;
  readonly scenes: readonly SampleNameScene[];
};

export type SampleNameAudioTrack = ProducerAudioTrack & { readonly sceneId: SampleNameSceneId };
