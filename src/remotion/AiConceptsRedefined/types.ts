import type { SegmentCaptions } from "../../lib/caption-schema";
import type {
  StandaloneCanvasProfileId,
  StandaloneContentFamily,
  StandaloneTimedScene,
} from "../standalone-video/types";

export const COMPOSITION_ID = "AiConceptsRedefined";
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const PROFILE_ID = "landscape-16x9";
export const CONTENT_FAMILY = "tutorial";
export const VOICEOVER_PLAYBACK_RATE = 1.2;
export const SCENE_TAIL_PADDING_FRAMES = 14;

export type SceneId =
  | "open"
  | "core-change"
  | "why-rewrite"
  | "six-concepts"
  | "old-traffic"
  | "new-traffic"
  | "traffic-definition"
  | "traffic-metrics"
  | "old-service"
  | "new-service"
  | "service-definition"
  | "skill-value"
  | "old-auth"
  | "auth-problem"
  | "auth-essence"
  | "auth-example"
  | "auth-definition"
  | "old-privacy"
  | "privacy-complexity"
  | "privacy-problem"
  | "privacy-principle"
  | "privacy-definition"
  | "old-data"
  | "data-change"
  | "data-value"
  | "rag-memory"
  | "data-definition"
  | "old-interaction"
  | "interaction-change"
  | "ui-persists"
  | "interaction-definition"
  | "product-metrics"
  | "new-product-metrics"
  | "content-redefined"
  | "content-definition"
  | "trust-changes"
  | "trust-definition"
  | "summary-table"
  | "real-change"
  | "final-view"
  | "closing";

export type VisualKind =
  | "thesis"
  | "old-way"
  | "new-way"
  | "question-statement"
  | "new-definition"
  | "comparison-list"
  | "callout-list"
  | "chapter-break"
  | "summary"
  | "closing";

export type Scene = StandaloneTimedScene & {
  readonly accent: string;
  readonly audioFile: string;
  readonly captions: SegmentCaptions;
  readonly chapter: string;
  readonly durationInFrames: number;
  readonly headline: string;
  readonly id: SceneId;
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