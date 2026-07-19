import type { SegmentCaptions } from "../standalone-video/caption-types";
import type {
  StandaloneCanvasProfileId,
  StandaloneContentFamily,
  StandaloneTimedScene,
} from "../standalone-video/types";

export const AI_DAILY_NEWS_20260719_COMPOSITION_ID = "AiDailyNews20260719";
export const AI_DAILY_NEWS_20260719_FPS = 30;
export const AI_DAILY_NEWS_20260719_WIDTH = 1920;
export const AI_DAILY_NEWS_20260719_HEIGHT = 1080;
export const AI_DAILY_NEWS_20260719_PROFILE_ID = "landscape-16x9";
export const AI_DAILY_NEWS_20260719_CONTENT_FAMILY = "trend-briefing";
export const AI_DAILY_NEWS_20260719_PROFILE = "hand-drawn-explainer";
export const AI_DAILY_NEWS_20260719_TRANSITION_IN_FRAMES = 16;

export type SceneId =
  | "open"
  | "meta-anthropic"
  | "vulnhunter"
  | "kimi-k3"
  | "australia-regulation"
  | "databricks"
  | "csquare-ipo"
  | "trend-summary"
  | "close";

export type VisualKind =
  | "thesis"
  | "compute-deal"
  | "security-tool"
  | "model-news"
  | "regulation"
  | "valuation"
  | "capital"
  | "summary-matrix"
  | "closing";

export type Scene = StandaloneTimedScene & {
  readonly accent: string;
  readonly audioFile: string;
  readonly captions: SegmentCaptions;
  readonly durationInFrames: number;
  readonly headline: string;
  readonly kicker: string;
  readonly narration: string;
  readonly supportingText: string;
  readonly visual: {
    readonly kind: VisualKind;
  };
};

export type Data = {
  readonly contentFamily: typeof AI_DAILY_NEWS_20260719_CONTENT_FAMILY & StandaloneContentFamily;
  readonly generatedAt: string;
  readonly profileId: typeof AI_DAILY_NEWS_20260719_PROFILE_ID & StandaloneCanvasProfileId;
  readonly scenes: readonly Scene[];
  readonly topic: {
    readonly date: "2026-07-19";
    readonly primaryHeadline: string;
  };
};

export const AI_DAILY_NEWS_20260719_DURATION_IN_FRAMES = 10783;

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