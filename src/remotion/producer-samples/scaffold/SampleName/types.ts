import type { SegmentCaptions } from "../../../../lib/caption-schema";
import type {
  StandaloneCanvasProfileId,
  StandaloneContentFamily,
  StandaloneTimedScene,
} from "../../../standalone-video/types";

export const SAMPLE_NAME_COMPOSITION_ID = "SampleName";
export const SAMPLE_NAME_FPS = 30;
export const SAMPLE_NAME_WIDTH = 1280;
export const SAMPLE_NAME_HEIGHT = 720;
export const SAMPLE_NAME_PROFILE_ID = "landscape-16x9";
export const SAMPLE_NAME_CONTENT_FAMILY = "project-intro";

export type SampleNameSceneId = "open" | "proof" | "close";

export type SampleNameScene = StandaloneTimedScene & {
  readonly id: SampleNameSceneId;
  readonly headline: string;
  readonly narration: string;
  readonly audioFile: string;
  readonly captions: SegmentCaptions;
};

export type SampleNameData = {
  readonly contentFamily: typeof SAMPLE_NAME_CONTENT_FAMILY & StandaloneContentFamily;
  readonly profileId: typeof SAMPLE_NAME_PROFILE_ID & StandaloneCanvasProfileId;
  readonly scenes: readonly SampleNameScene[];
};

export type SampleNameAudioTrack = {
  readonly sceneId: SampleNameSceneId;
  readonly narration: string;
  readonly audioFile: string;
  readonly durationInFrames: number;
  readonly durationInSeconds?: number;
  readonly provider?: string;
  readonly captions: SegmentCaptions;
};
