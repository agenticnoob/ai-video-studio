import type { SegmentCaptions } from "../standalone-video/caption-types";
import type { ProducerAudioTrack } from "../../../scripts/lib/producer-audio";

export const AI_DAILY20260721_COMPOSITION_ID = "AiDaily20260721";
export const AI_DAILY20260721_FPS = 30;
export const AI_DAILY20260721_WIDTH = 1080;
export const AI_DAILY20260721_HEIGHT = 1920;
// Estimated ~5 min; will be updated after audio generation
export const AI_DAILY20260721_NARRATION_DURATION_IN_FRAMES = 9000;
export const AI_DAILY20260721_END_HOLD_IN_FRAMES = 2;
export const AI_DAILY20260721_DURATION_IN_FRAMES = 14613;
export const AI_DAILY20260721_PROFILE_ID = "hand-drawn-explainer";
export const AI_DAILY20260721_CONTENT_FAMILY = "trend-briefing";
export const AI_DAILY20260721_SCENE_PADDING_FRAMES = 10;

export type AiDaily20260721SceneId =
  | "open"
  | "google"
  | "microsoft"
  | "alphabet"
  | "specialization"
  | "agent-payments"
  | "physical-ai"
  | "eu-regulation"
  | "blackrock"
  | "iqe"
  | "trends"
  | "close";

export type AiDaily20260721Scene = {
  readonly id: AiDaily20260721SceneId;
  readonly eyebrow: string;
  readonly headline: string;
  readonly detail: string;
  readonly metric?: string;
  readonly narration: string;
  readonly audioFile: string;
  readonly durationInFrames: number;
  readonly captions: SegmentCaptions;
};

export type AiDaily20260721AudioTrack = ProducerAudioTrack & {
  readonly sceneId: AiDaily20260721SceneId;
};