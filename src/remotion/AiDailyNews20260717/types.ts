import type { SegmentCaptions } from "../standalone-video/caption-types";
import type {
  StandaloneCanvasProfileId,
  StandaloneContentFamily,
  StandaloneTimedScene,
} from "../standalone-video/types";

export const AI_DAILY_NEWS_20260717_COMPOSITION_ID = "AiDailyNews20260717";
export const AI_DAILY_NEWS_20260717_FPS = 30;
export const AI_DAILY_NEWS_20260717_WIDTH = 1080;
export const AI_DAILY_NEWS_20260717_HEIGHT = 1920;
export const AI_DAILY_NEWS_20260717_PROFILE_ID = "portrait-9x16";
export const AI_DAILY_NEWS_20260717_CONTENT_FAMILY = "trend-briefing";
export const AI_DAILY_NEWS_20260717_TRANSITION_IN_FRAMES = 12;

export type SceneId =
  | "open"
  | "moonshot-k3"
  | "enterprise-ai"
  | "tech-breakthroughs"
  | "policy"
  | "capital-markets"
  | "trend-summary"
  | "close";

export type VisualKind =
  | "thesis"
  | "model-news"
  | "enterprise"
  | "innovation"
  | "regulation"
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
  readonly contentFamily: typeof AI_DAILY_NEWS_20260717_CONTENT_FAMILY & StandaloneContentFamily;
  readonly generatedAt: string;
  readonly profileId: typeof AI_DAILY_NEWS_20260717_PROFILE_ID & StandaloneCanvasProfileId;
  readonly scenes: readonly Scene[];
  readonly topic: {
    readonly date: "2026-07-17";
    readonly primaryHeadline: string;
  };
};

export const AI_DAILY_NEWS_20260717_DURATION_IN_FRAMES = 12216;

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