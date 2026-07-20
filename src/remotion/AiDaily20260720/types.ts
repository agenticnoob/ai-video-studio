import type { SegmentCaptions } from "../standalone-video/caption-types";
import type { ProducerAudioTrack } from "../../../scripts/lib/producer-audio";

export const AI_DAILY20260720_COMPOSITION_ID = "AiDaily20260720";
export const AI_DAILY20260720_FPS = 30;
export const AI_DAILY20260720_WIDTH = 1080;
export const AI_DAILY20260720_HEIGHT = 1920;
export const AI_DAILY20260720_NARRATION_DURATION_IN_FRAMES = 9601;
export const AI_DAILY20260720_END_HOLD_IN_FRAMES = 2;
export const AI_DAILY20260720_DURATION_IN_FRAMES =
  AI_DAILY20260720_NARRATION_DURATION_IN_FRAMES + AI_DAILY20260720_END_HOLD_IN_FRAMES;
export const AI_DAILY20260720_PROFILE_ID = "hand-drawn-explainer";
export const AI_DAILY20260720_CONTENT_FAMILY = "trend-briefing";
export const AI_DAILY20260720_SCENE_PADDING_FRAMES = 10;

export type AiDaily20260720SceneId =
  | "open"
  | "google"
  | "nvidia"
  | "kimi"
  | "science"
  | "regulation"
  | "power"
  | "signals"
  | "close";

export type AiDaily20260720Scene = {
  readonly id: AiDaily20260720SceneId;
  readonly eyebrow: string;
  readonly headline: string;
  readonly detail: string;
  readonly metric?: string;
  readonly narration: string;
  readonly audioFile: string;
  readonly durationInFrames: number;
  readonly captions: SegmentCaptions;
};

export type AiDaily20260720AudioTrack = ProducerAudioTrack & {
  readonly sceneId: AiDaily20260720SceneId;
};
