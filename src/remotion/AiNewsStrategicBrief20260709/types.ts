import type { SegmentCaptions } from "../../lib/caption-schema";
import type {
  StandaloneCanvasProfileId,
  StandaloneContentFamily,
  StandaloneTimedScene,
} from "../standalone-video/types";

export const AI_NEWS_STRATEGIC_BRIEF_20260709_COMPOSITION_ID = "AiNewsStrategicBrief20260709";
export const AI_NEWS_STRATEGIC_BRIEF_20260709_FPS = 30;
export const AI_NEWS_STRATEGIC_BRIEF_20260709_WIDTH = 1920;
export const AI_NEWS_STRATEGIC_BRIEF_20260709_HEIGHT = 1080;
export const AI_NEWS_STRATEGIC_BRIEF_20260709_PROFILE_ID = "landscape-16x9";
export const AI_NEWS_STRATEGIC_BRIEF_20260709_CONTENT_FAMILY = "trend-briefing";
export const AI_NEWS_STRATEGIC_BRIEF_20260709_VOICEOVER_PLAYBACK_RATE = 1.19;
export const AI_NEWS_STRATEGIC_BRIEF_20260709_MAX_DURATION_IN_FRAMES =
  5 * 60 * AI_NEWS_STRATEGIC_BRIEF_20260709_FPS;

export type AiNewsStrategicBrief20260709SceneId =
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

export type AiNewsStrategicBrief20260709EvidenceAsset = {
  readonly captureStatus: "captured-screenshot" | "source-card-fallback";
  readonly fallbackReason?: string;
  readonly id:
    | "anthropic-access"
    | "openai-gpt56"
    | "deepmind-control"
    | "enterprise-cost"
    | "model-routing"
    | "sovereign-ai"
    | "compute-finance"
    | "data-center-power"
    | "physical-ai"
    | "coding-agent-security"
    | "financial-regulation"
    | "meta-iris"
    | "source-pack";
  readonly label: string;
  readonly src: string;
  readonly sourceName: string;
  readonly sourceUrl: string;
};

export type AiNewsStrategicBrief20260709VisualKind =
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

export type AiNewsStrategicBrief20260709Scene = StandaloneTimedScene & {
  readonly accent: string;
  readonly audioFile: string;
  readonly captions: SegmentCaptions;
  readonly durationInFrames: number;
  readonly evidenceAssetIds: readonly AiNewsStrategicBrief20260709EvidenceAsset["id"][];
  readonly headline: string;
  readonly kicker: string;
  readonly narration: string;
  readonly primitiveMap: readonly string[];
  readonly supportingText: string;
  readonly visual: {
    readonly kind: AiNewsStrategicBrief20260709VisualKind;
  };
};

export type AiNewsStrategicBrief20260709Data = {
  readonly assets: {
    readonly evidenceAssets: readonly AiNewsStrategicBrief20260709EvidenceAsset[];
  };
  readonly contentFamily: typeof AI_NEWS_STRATEGIC_BRIEF_20260709_CONTENT_FAMILY &
    StandaloneContentFamily;
  readonly generatedAt: string;
  readonly profileId: typeof AI_NEWS_STRATEGIC_BRIEF_20260709_PROFILE_ID &
    StandaloneCanvasProfileId;
  readonly scenes: readonly AiNewsStrategicBrief20260709Scene[];
  readonly topic: {
    readonly date: "2026-07-09";
    readonly coverageRange: "2026-06-17 — 2026-07-09";
    readonly factPolicy: {
      readonly breakingClaimsStatus: "user-provided-and-reported";
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

export const AI_NEWS_STRATEGIC_BRIEF_20260709_DURATION_IN_FRAMES = 8196;

export type AiNewsStrategicBrief20260709AudioTrack = {
  readonly audioFile: string;
  readonly captions: SegmentCaptions;
  readonly durationInFrames: number;
  readonly durationInSeconds?: number;
  readonly format?: "mp3" | "wav" | "aac" | "m4a";
  readonly narration: string;
  readonly provider?: string;
  readonly sceneId: AiNewsStrategicBrief20260709SceneId;
};
