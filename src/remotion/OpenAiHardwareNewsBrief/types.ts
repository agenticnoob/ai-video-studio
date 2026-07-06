import type { SegmentCaptions } from "../../lib/caption-schema";
import type {
  StandaloneCanvasProfileId,
  StandaloneContentFamily,
  StandaloneTimedScene,
} from "../standalone-video/types";

export const OPENAI_HARDWARE_NEWS_BRIEF_COMPOSITION_ID = "OpenAiHardwareNewsBrief";
export const OPENAI_HARDWARE_NEWS_BRIEF_FPS = 30;
export const OPENAI_HARDWARE_NEWS_BRIEF_WIDTH = 1920;
export const OPENAI_HARDWARE_NEWS_BRIEF_HEIGHT = 1080;
export const OPENAI_HARDWARE_NEWS_BRIEF_PROFILE_ID = "landscape-16x9";
export const OPENAI_HARDWARE_NEWS_BRIEF_CONTENT_FAMILY = "trend-briefing";
export const OPENAI_HARDWARE_NEWS_BRIEF_VOICEOVER_PLAYBACK_RATE = 1.18;

export type OpenAiHardwareNewsBriefSceneId =
  | "open"
  | "device"
  | "why"
  | "context"
  | "watch";

export type OpenAiHardwareNewsEvidenceAsset = {
  readonly id: "codex-report" | "work-louder" | "stake-report";
  readonly captureStatus: "source-card-fallback";
  readonly fallbackReason: string;
  readonly label: string;
  readonly src: string;
  readonly sourceUrl: string;
};

export type OpenAiHardwareNewsVisualKind =
  | "hero"
  | "device"
  | "workflow"
  | "context"
  | "watch";

export type OpenAiHardwareNewsBriefScene = StandaloneTimedScene & {
  readonly id: OpenAiHardwareNewsBriefSceneId;
  readonly audioFile: string;
  readonly captions: SegmentCaptions;
  readonly durationInFrames: number;
  readonly headline: string;
  readonly kicker: string;
  readonly narration: string;
  readonly primitiveMap: readonly string[];
  readonly visual: {
    readonly kind: OpenAiHardwareNewsVisualKind;
  };
};

export type OpenAiHardwareNewsBriefData = {
  readonly assets: {
    readonly evidenceAssets: readonly OpenAiHardwareNewsEvidenceAsset[];
  };
  readonly contentFamily: typeof OPENAI_HARDWARE_NEWS_BRIEF_CONTENT_FAMILY &
    StandaloneContentFamily;
  readonly generatedAt: string;
  readonly profileId: typeof OPENAI_HARDWARE_NEWS_BRIEF_PROFILE_ID & StandaloneCanvasProfileId;
  readonly scenes: readonly OpenAiHardwareNewsBriefScene[];
  readonly topic: {
    readonly primaryHeadline: string;
    readonly launchDate: string;
    readonly sourceFacts: readonly {
      readonly label: string;
      readonly source: string;
      readonly status: "reported" | "official-teaser" | "unconfirmed";
    }[];
    readonly governmentStake: {
      readonly status: "reported-early-talks";
      readonly framing: string;
    };
  };
};

export const OPENAI_HARDWARE_NEWS_BRIEF_DURATION_IN_FRAMES = 1478;

export type OpenAiHardwareNewsBriefAudioTrack = {
  readonly audioFile: string;
  readonly captions: SegmentCaptions;
  readonly durationInFrames: number;
  readonly durationInSeconds?: number;
  readonly format?: "mp3" | "wav" | "aac" | "m4a";
  readonly narration: string;
  readonly provider?: string;
  readonly sceneId: OpenAiHardwareNewsBriefSceneId;
};
