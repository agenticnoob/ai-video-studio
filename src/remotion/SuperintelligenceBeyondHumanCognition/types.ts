import type { ProducerAudioTrack } from "../../../scripts/lib/producer-audio";
import type { SegmentCaptions } from "../standalone-video/caption-types";
import type {
  StandaloneCanvasProfileId,
  StandaloneContentFamily,
  StandaloneTimedScene,
} from "../standalone-video/types";

export const SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_COMPOSITION_ID =
  "SuperintelligenceBeyondHumanCognition";
export const SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_FPS = 30;
export const SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_WIDTH = 1080;
export const SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_HEIGHT = 1920;
export const SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_NARRATION_DURATION_IN_FRAMES = 11709;
export const SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_PROFILE_ID = "portrait-9x16";
export const SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_STYLE_PROFILE_ID = "cinematic-3d";
export const SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_CONTENT_FAMILY = "trend-briefing";
export const SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_CHAPTER_TRANSITION_FRAMES = 15;
export const SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_DURATION_IN_FRAMES =
  SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_NARRATION_DURATION_IN_FRAMES;

export type SuperintelligenceBeyondHumanCognitionSceneId =
  | "scene-01"
  | "scene-02"
  | "scene-03"
  | "scene-04"
  | "scene-05"
  | "scene-06"
  | "scene-07"
  | "scene-08"
  | "scene-09"
  | "scene-10"
  | "scene-11"
  | "scene-12"
  | "scene-13"
  | "scene-14"
  | "scene-15";

export type SuperintelligenceBeyondHumanCognitionScene = StandaloneTimedScene & {
  readonly id: SuperintelligenceBeyondHumanCognitionSceneId;
  readonly chapter: 1 | 2 | 3 | 4 | 5;
  readonly chapterTitle: string;
  readonly headline: string;
  readonly kicker: string;
  readonly narration: string;
  readonly audioFile: string;
  readonly captions: SegmentCaptions;
};

export type SuperintelligenceBeyondHumanCognitionData = {
  readonly contentFamily: typeof SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_CONTENT_FAMILY &
    StandaloneContentFamily;
  readonly profileId: typeof SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_PROFILE_ID &
    StandaloneCanvasProfileId;
  readonly scenes: readonly SuperintelligenceBeyondHumanCognitionScene[];
};

export type SuperintelligenceBeyondHumanCognitionAudioTrack = ProducerAudioTrack & {
  readonly sceneId: SuperintelligenceBeyondHumanCognitionSceneId;
};
