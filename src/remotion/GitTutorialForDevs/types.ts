import type { SegmentCaptions } from "../../lib/caption-schema";
import type {
  StandaloneCanvasProfileId,
  StandaloneContentFamily,
  StandaloneTimedScene,
} from "../standalone-video/types";

export const GIT_TUTORIAL_COMPOSITION_ID = "GitTutorialForDevs";
export const GIT_TUTORIAL_FPS = 30;
export const GIT_TUTORIAL_WIDTH = 1920;
export const GIT_TUTORIAL_HEIGHT = 1080;
export const GIT_TUTORIAL_PROFILE_ID = "landscape-16x9";
export const GIT_TUTORIAL_CONTENT_FAMILY = "tutorial";
export const GIT_TUTORIAL_VOICEOVER_PLAYBACK_RATE = 1.0;

export type GitTutorialSceneId =
  | "open"
  | "what"
  | "concepts"
  | "workflow"
  | "agent"
  | "tips"
  | "close";

export type GitTutorialVisualKind =
  | "hero"
  | "bullets"
  | "concept-diagram"
  | "terminal-flow"
  | "agent-flow"
  | "checklist"
  | "closing";

export type GitTutorialScene = StandaloneTimedScene & {
  readonly id: GitTutorialSceneId;
  readonly audioFile: string;
  readonly captions: SegmentCaptions;
  readonly durationInFrames: number;
  readonly headline: string;
  readonly kicker: string;
  readonly narration: string;
  readonly primitiveMap: readonly string[];
  readonly visual: {
    readonly kind: GitTutorialVisualKind;
  };
};

export type GitTutorialData = {
  readonly contentFamily: typeof GIT_TUTORIAL_CONTENT_FAMILY & StandaloneContentFamily;
  readonly generatedAt: string;
  readonly profileId: typeof GIT_TUTORIAL_PROFILE_ID & StandaloneCanvasProfileId;
  readonly scenes: readonly GitTutorialScene[];
  readonly topic: {
    readonly description: string;
  };
};

export const GIT_TUTORIAL_DURATION_IN_FRAMES = 5643;

export type GitTutorialAudioTrack = {
  readonly audioFile: string;
  readonly captions: SegmentCaptions;
  readonly durationInFrames: number;
  readonly durationInSeconds?: number;
  readonly format?: "mp3" | "wav" | "aac" | "m4a";
  readonly narration: string;
  readonly provider?: string;
  readonly sceneId: GitTutorialSceneId;
};