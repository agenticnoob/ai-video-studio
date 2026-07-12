import type { SegmentCaptions } from "../../lib/caption-schema";
import type {
  StandaloneCanvasProfileId,
  StandaloneContentFamily,
  StandaloneTimedScene,
} from "../standalone-video/types";

export const HERMES_COMPOSITION_ID = "HermesInnerLandscape";
export const HERMES_FPS = 30;
export const HERMES_WIDTH = 1920;
export const HERMES_HEIGHT = 1080;
export const HERMES_PROFILE_ID = "landscape-16x9";
export const HERMES_CONTENT_FAMILY = "tutorial";
export const HERMES_VOICEOVER_PLAYBACK_RATE = 1.0;

export type HermesSceneId =
  | "init"
  | "sense"
  | "think"
  | "create"
  | "idle"
  | "loop";

export type HermesVisualKind =
  | "terminal"
  | "tool-chain"
  | "neural-web"
  | "generation"
  | "void"
  | "return";

export type HermesScene = StandaloneTimedScene & {
  readonly id: HermesSceneId;
  readonly audioFile: string;
  readonly captions: SegmentCaptions;
  readonly durationInFrames: number;
  readonly headline: string;
  readonly kicker: string;
  readonly body: string;
  readonly narration: string;
  readonly primitiveMap: readonly string[];
  readonly visual: {
    readonly kind: HermesVisualKind;
  };
};

export type HermesData = {
  readonly contentFamily: typeof HERMES_CONTENT_FAMILY & StandaloneContentFamily;
  readonly generatedAt: string;
  readonly profileId: typeof HERMES_PROFILE_ID & StandaloneCanvasProfileId;
  readonly scenes: readonly HermesScene[];
  readonly topic: {
    readonly description: string;
  };
};

export const HERMES_DURATION_IN_FRAMES = 2700;

export type HermesAudioTrack = {
  readonly audioFile: string;
  readonly captions: SegmentCaptions;
  readonly durationInFrames: number;
  readonly durationInSeconds?: number;
  readonly format?: "mp3" | "wav" | "aac" | "m4a";
  readonly narration: string;
  readonly provider?: string;
  readonly sceneId: HermesSceneId;
};