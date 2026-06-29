import type { SegmentCaptions } from "../../lib/caption-schema";
import type {
  StandaloneCanvasProfileId,
  StandaloneContentFamily,
  StandaloneTimedScene,
} from "../standalone-video/types";

export const PIXELRAG_CHINESE_STANDALONE_COMPOSITION_ID = "PixelRAGChineseStandalonePreview";
export const PIXELRAG_CHINESE_STANDALONE_FPS = 30;
export const PIXELRAG_CHINESE_STANDALONE_WIDTH = 1280;
export const PIXELRAG_CHINESE_STANDALONE_HEIGHT = 720;
export const PIXELRAG_CHINESE_STANDALONE_PROFILE_ID = "landscape-16x9";
export const PIXELRAG_CHINESE_STANDALONE_CONTENT_FAMILY = "project-intro";

export type PixelRAGChineseVisualKind =
  | "title-card"
  | "screenshot-card"
  | "text-crush"
  | "sliced-page"
  | "vector-cubes"
  | "index-stack"
  | "result-pull"
  | "use-case-cards"
  | "closing-card";

export type PixelRAGChineseAnimationStyle =
  | "tilt-rise"
  | "flip-in"
  | "stack-pop"
  | "slice-fan"
  | "cube-orbit"
  | "index-deck"
  | "result-pull"
  | "whip-slide"
  | "zoom-dive";

export type PixelRAGChineseScene = StandaloneTimedScene & {
  readonly id: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly plainTitle: string;
  readonly narration: string;
  readonly durationInFrames: number;
  readonly audioFile: string;
  readonly captions: SegmentCaptions;
  readonly visualKind: PixelRAGChineseVisualKind;
  readonly animationStyle: PixelRAGChineseAnimationStyle;
  readonly points: readonly string[];
  readonly screenshotFile: string;
  readonly accent: string;
  readonly secondaryAccent: string;
};

export type PixelRAGChineseStandaloneData = {
  readonly contentFamily: typeof PIXELRAG_CHINESE_STANDALONE_CONTENT_FAMILY &
    StandaloneContentFamily;
  readonly compositionId: typeof PIXELRAG_CHINESE_STANDALONE_COMPOSITION_ID;
  readonly title: string;
  readonly fps: typeof PIXELRAG_CHINESE_STANDALONE_FPS;
  readonly profileId: typeof PIXELRAG_CHINESE_STANDALONE_PROFILE_ID & StandaloneCanvasProfileId;
  readonly width: typeof PIXELRAG_CHINESE_STANDALONE_WIDTH;
  readonly height: typeof PIXELRAG_CHINESE_STANDALONE_HEIGHT;
  readonly scenes: readonly PixelRAGChineseScene[];
};
