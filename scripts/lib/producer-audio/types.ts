import type { SegmentCaptions } from "../../../src/lib/caption-schema";

export type ProducerAudioProviderId = "f5-tts" | "voxcpm";
export type ProducerVoxcpmMode =
  | "voice-design"
  | "controllable-clone"
  | "high-fidelity-clone";

export type ProducerNarrationBeat = {
  readonly id: string;
  readonly ttsText: string;
  readonly displayText?: string;
  readonly language?: string;
};

export type ProducerAudioRequestPlan = {
  readonly provider: ProducerAudioProviderId;
  readonly body: Record<string, unknown>;
};

export type ProducerAudioTrack = {
  readonly sceneId: string;
  readonly narration: string;
  readonly audioFile: string;
  readonly captions: SegmentCaptions;
  readonly durationInFrames: number;
  readonly durationInSeconds: number;
  readonly provider: string;
  readonly format?: "mp3" | "wav" | "aac" | "m4a";
};

export type ProducerAudioFallbackPolicy = "forbid" | "allow-explicit-silence";

export type ProducerAudioSummary = {
  readonly compositionId: string;
  readonly providers: readonly string[];
  readonly sceneCount: number;
  readonly totalDurationInFrames: number;
  readonly usedFallback: boolean;
  readonly fallbackReasons: readonly string[];
};
