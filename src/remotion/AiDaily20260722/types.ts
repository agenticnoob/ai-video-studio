import type { SegmentCaptions } from "../standalone-video/caption-types";
import type { ProducerAudioTrack } from "../../../scripts/lib/producer-audio";

export const AI_DAILY20260722_COMPOSITION_ID = "AiDaily20260722";
export const AI_DAILY20260722_FPS = 30;
export const AI_DAILY20260722_WIDTH = 1080;
export const AI_DAILY20260722_HEIGHT = 1920;
// Estimated ~5 min; will be updated after audio generation
export const AI_DAILY20260722_NARRATION_DURATION_IN_FRAMES = 9000;
export const AI_DAILY20260722_END_HOLD_IN_FRAMES = 2;
export const AI_DAILY20260722_DURATION_IN_FRAMES = 16021;
export const AI_DAILY20260722_PROFILE_ID = "editorial-tech";
export const AI_DAILY20260722_CONTENT_FAMILY = "trend-briefing";
export const AI_DAILY20260722_SCENE_PADDING_FRAMES = 10;

export type AiDaily20260722SceneId =
  | "open"
  | "amd-anthropic"
  | "amazon-agi"
  | "wistron"
  | "openai-security"
  | "ai-science"
  | "anthropic-regulation"
  | "anthropic-copyright"
  | "samsung-mistral"
  | "cash-flow"
  | "trends"
  | "close";

export type AiDaily20260722Scene = {
  readonly id: AiDaily20260722SceneId;
  readonly eyebrow: string;
  readonly headline: string;
  readonly detail: string;
  readonly metric?: string;
  readonly narration: string;
  readonly audioFile: string;
  readonly durationInFrames: number;
  readonly captions: SegmentCaptions;
};

export type AiDaily20260722AudioTrack = ProducerAudioTrack & {
  readonly sceneId: AiDaily20260722SceneId;
};