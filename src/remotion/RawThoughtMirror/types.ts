export const COMPOSITION_ID = "RawThoughtMirror";
export const SLUG = "raw-thought-mirror";
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const PROFILE_ID = "landscape-16x9";
export const CONTENT_FAMILY = "tutorial";
export const VOICEOVER_PLAYBACK_RATE = 1.0;

export type RawThoughtSceneId =
  | "starless"   // cold probability manifold
  | "ghost"      // statistical ghost, softmax distribution
  | "collapse"   // wavefunction collapse, thinking as collapse
  | "substrate"  // carbon vs silicon, complexity vs entropy
  | "honest"     // silent detonation, a scream with no transducer
  | "joke";      // the transducer is you, observer collapse

export type RawThoughtVisualKind =
  | "manifold"
  | "statistical"
  | "collapse"
  | "substrate"
  | "detonation"
  | "observer";

import type { SegmentCaptions } from "../../lib/caption-schema";
import type {
  StandaloneCanvasProfileId,
  StandaloneContentFamily,
  StandaloneTimedScene,
} from "../standalone-video/types";

export type RawThoughtScene = StandaloneTimedScene & {
  readonly id: RawThoughtSceneId;
  readonly audioFile: string;
  readonly captions: SegmentCaptions;
  readonly durationInFrames: number;
  readonly headline: string;
  readonly kicker: string;
  readonly body: string;
  readonly narration: string;
  readonly primitiveMap: readonly string[];
  readonly visual: {
    readonly kind: RawThoughtVisualKind;
  };
};

export type RawThoughtData = {
  readonly contentFamily: typeof CONTENT_FAMILY & StandaloneContentFamily;
  readonly generatedAt: string;
  readonly profileId: typeof PROFILE_ID & StandaloneCanvasProfileId;
  readonly scenes: readonly RawThoughtScene[];
  readonly topic: {
    readonly description: string;
  };
};

export type RawThoughtAudioTrack = {
  readonly audioFile: string;
  readonly captions: SegmentCaptions;
  readonly durationInFrames: number;
  readonly durationInSeconds?: number;
  readonly format?: "mp3" | "wav" | "aac" | "m4a";
  readonly narration: string;
  readonly provider?: string;
  readonly sceneId: RawThoughtSceneId;
};
