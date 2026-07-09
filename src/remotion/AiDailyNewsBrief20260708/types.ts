import type { SegmentCaptions } from "../../lib/caption-schema";
import type {
  StandaloneCanvasProfileId,
  StandaloneContentFamily,
  StandaloneTimedScene,
} from "../standalone-video/types";

export const AI_DAILY_NEWS_BRIEF_20260708_COMPOSITION_ID = "AiDailyNewsBrief20260708";
export const AI_DAILY_NEWS_BRIEF_20260708_FPS = 30;
export const AI_DAILY_NEWS_BRIEF_20260708_WIDTH = 1920;
export const AI_DAILY_NEWS_BRIEF_20260708_HEIGHT = 1080;
export const AI_DAILY_NEWS_BRIEF_20260708_PROFILE_ID = "landscape-16x9";
export const AI_DAILY_NEWS_BRIEF_20260708_CONTENT_FAMILY = "trend-briefing";
export const AI_DAILY_NEWS_BRIEF_20260708_VOICEOVER_PLAYBACK_RATE = 1.19;
export const AI_DAILY_NEWS_BRIEF_20260708_MAX_DURATION_IN_FRAMES =
  5 * 60 * AI_DAILY_NEWS_BRIEF_20260708_FPS;

export type AiDailyNewsBrief20260708SceneId =
  | "open"
  | "model-gate"
  | "gpt56"
  | "china-access"
  | "agent-infra"
  | "coding-security"
  | "sovereignty"
  | "capital-stack"
  | "power-grid"
  | "market-risk"
  | "developer-playbook"
  | "close";

export type AiDailyNewsBrief20260708EvidenceAsset = {
  readonly captureStatus: "captured-screenshot" | "source-card-fallback";
  readonly fallbackReason?: string;
  readonly id:
    | "openai-preview"
    | "reuters-openai"
    | "reuters-h200"
    | "reuters-zhipu"
    | "reuters-vera"
    | "reuters-meta"
    | "reuters-claude-code"
    | "reuters-boe"
    | "reuters-ukraine"
    | "reuters-sambanova"
    | "reuters-power"
    | "reuters-eia"
    | "source-pack";
  readonly label: string;
  readonly src: string;
  readonly sourceName: string;
  readonly sourceUrl: string;
};

export type AiDailyNewsBrief20260708VisualKind =
  | "thesis"
  | "evidence"
  | "model-matrix"
  | "access-map"
  | "infra-stack"
  | "security-audit"
  | "sovereignty"
  | "capital-stack"
  | "power-grid"
  | "risk-board"
  | "playbook"
  | "closing";

export type AiDailyNewsBrief20260708Scene = StandaloneTimedScene & {
  readonly accent: string;
  readonly audioFile: string;
  readonly captions: SegmentCaptions;
  readonly durationInFrames: number;
  readonly evidenceAssetIds: readonly AiDailyNewsBrief20260708EvidenceAsset["id"][];
  readonly headline: string;
  readonly kicker: string;
  readonly narration: string;
  readonly primitiveMap: readonly string[];
  readonly supportingText: string;
  readonly visual: {
    readonly kind: AiDailyNewsBrief20260708VisualKind;
  };
};

export type AiDailyNewsBrief20260708Data = {
  readonly assets: {
    readonly evidenceAssets: readonly AiDailyNewsBrief20260708EvidenceAsset[];
  };
  readonly contentFamily: typeof AI_DAILY_NEWS_BRIEF_20260708_CONTENT_FAMILY &
    StandaloneContentFamily;
  readonly generatedAt: string;
  readonly profileId: typeof AI_DAILY_NEWS_BRIEF_20260708_PROFILE_ID & StandaloneCanvasProfileId;
  readonly scenes: readonly AiDailyNewsBrief20260708Scene[];
  readonly topic: {
    readonly date: "2026-07-08";
    readonly factPolicy: {
      readonly gpt56Status: "reported-and-previewed";
      readonly whiteHouseApprovalStatus: "white-house-denial-reported";
      readonly sourceCapturePolicy: "real-capture-first-with-fallbacks-recorded";
    };
    readonly primaryHeadline: string;
    readonly sourceFacts: readonly {
      readonly label: string;
      readonly source: string;
      readonly status: "reported" | "official-preview" | "analysis" | "user-provided";
    }[];
  };
};

export const AI_DAILY_NEWS_BRIEF_20260708_DURATION_IN_FRAMES = 8720;

export type AiDailyNewsBrief20260708AudioTrack = {
  readonly audioFile: string;
  readonly captions: SegmentCaptions;
  readonly durationInFrames: number;
  readonly durationInSeconds?: number;
  readonly format?: "mp3" | "wav" | "aac" | "m4a";
  readonly narration: string;
  readonly provider?: string;
  readonly sceneId: AiDailyNewsBrief20260708SceneId;
};
