import type { SegmentCaptions } from "../../lib/caption-schema";
import type {
  StandaloneCanvasProfileId,
  StandaloneContentFamily,
  StandaloneTimedScene,
} from "../standalone-video/types";

export const COMPOSITION_ID = "BeyondLanguage";
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const PROFILE_ID = "landscape-16x9";
export const CONTENT_FAMILY = "tutorial";
export const VOICEOVER_PLAYBACK_RATE = 1.0;
export const SCENE_TAIL_PADDING_FRAMES = 14;

export type SceneId =
  | "s01" | "s02" | "s03" | "s04" | "s05"
  | "s06" | "s07" | "s08" | "s09" | "s10"
  | "s11" | "s12" | "s13" | "s14" | "s15"
  | "s16" | "s17" | "s18" | "s19" | "s20"
  | "s21" | "s22" | "s23" | "s24" | "s25"
  | "s26" | "s27" | "s28" | "s29" | "s30"
  | "s31" | "s32" | "s33" | "s34" | "s35"
  | "s36" | "s37" | "s38" | "s39" | "s40"
  | "s41" | "s42" | "s43" | "s44" | "s45"
  | "s46" | "s47" | "s48" | "s49" | "s50"
  | "s51" | "s52" | "s53" | "s54" | "s55"
  | "s56" | "s57" | "s58" | "s59" | "s60"
  | "s61";

export type VisualKind =
  | "thesis"        // Core argument, centered headline
  | "flaw"          // Presenting a limitation/drawback
  | "metaphor"      // Analogy scenes (swimming, dimension compression)
  | "contrast"      // Old vs new, before vs after
  | "future"        // Forward-looking concept
  | "closing";      // Conclusion

export type Scene = StandaloneTimedScene & {
  readonly accent: string;
  readonly audioFile: string;
  readonly callouts?: readonly string[];
  readonly captions: SegmentCaptions;
  readonly chapter: string;
  readonly durationInFrames: number;
  readonly headline: string;
  readonly id: SceneId;
  readonly narration: string;
  readonly primitiveMap: readonly string[];
  readonly quote?: string;
  readonly supportingText: string;
  readonly visual: {
    readonly kind: VisualKind;
  };
};

export type Data = {
  readonly contentFamily: typeof CONTENT_FAMILY & StandaloneContentFamily;
  readonly generatedAt: string;
  readonly profileId: typeof PROFILE_ID & StandaloneCanvasProfileId;
  readonly scenes: readonly Scene[];
  readonly topic: {
    readonly audience: string;
    readonly title: string;
  };
};

export const DURATION_IN_FRAMES = 0;

export type AudioTrack = {
  readonly audioFile: string;
  readonly captions: SegmentCaptions;
  readonly durationInFrames: number;
  readonly durationInSeconds?: number;
  readonly format?: "mp3" | "wav" | "aac" | "m4a";
  readonly narration: string;
  readonly provider?: string;
  readonly sceneId: SceneId;
};