import type { SegmentCaptions } from "../../lib/caption-schema";
import type {
  StandaloneCanvasProfileId,
  StandaloneContentFamily,
  StandaloneTimedScene,
} from "../standalone-video/types";

export const COMPOSITION_ID = "AiDailyNews20260713";
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const PROFILE_ID = "landscape-16x9";
export const CONTENT_FAMILY = "trend-briefing";
export const VOICEOVER_PLAYBACK_RATE = 1.0;
export const MAX_DURATION_IN_FRAMES = 8 * 60 * FPS;

export type SceneId =
  | "open"
  | "meta-infra"
  | "waze-voice"
  | "gpt56-agent"
  | "gpt-live"
  | "us-policy"
  | "eu-copyright"
  | "helsing"
  | "trend-summary"
  | "close";

export type VisualKind =
  | "thesis"
  | "infrastructure"
  | "consumer-ai"
  | "agent-arch"
  | "real-time-arch"
  | "policy-power"
  | "regulation"
  | "defense-capital"
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
  readonly primitiveMap: readonly string[];
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
    readonly date: "2026-07-13";
    readonly primaryHeadline: string;
    readonly sourceFacts: readonly {
      readonly label: string;
      readonly source: string;
      readonly status: "reported" | "official-preview" | "analysis" | "user-provided";
    }[];
  };
};

// Total TTS frames (LYY clone): 686+1008+600+730+893+667+835+826+1051+677 = 7973
// + 8 scene-tail padding per scene (10*8=80) = 8053
export const DURATION_IN_FRAMES = 8053;

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