import type { SegmentCaptions } from "../../../src/remotion/standalone-video/caption-types";

export type ProducerVoxcpmMode = "voice-design" | "controllable-clone" | "high-fidelity-clone";

export type ProducerNarratedBeat = {
  readonly id: string;
  readonly narrationRequired?: true;
  readonly ttsText: string;
  readonly displayText?: string;
  readonly language?: string;
};

export type ProducerSilentBeat = {
  readonly id: string;
  readonly narrationRequired: false;
  readonly durationInFrames: number;
  readonly ttsText?: never;
  readonly displayText?: never;
  readonly language?: string;
};

export type ProducerNarrationBeat = ProducerNarratedBeat | ProducerSilentBeat;

type ProducerVoxcpmPlanBase = {
  readonly sceneId: string;
  readonly ttsText: string;
  readonly displayText: string;
  readonly language?: string;
};

export type ProducerVoxcpmRequestPlan =
  | (ProducerVoxcpmPlanBase & {
      readonly mode: "voice-design";
      readonly control?: string;
    })
  | (ProducerVoxcpmPlanBase & {
      readonly mode: "controllable-clone";
      readonly referenceAudioPath: string;
      readonly control?: string;
    })
  | (ProducerVoxcpmPlanBase & {
      readonly mode: "high-fidelity-clone";
      readonly promptAudioPath: string;
      readonly promptTranscriptPath: string;
      readonly referenceAudioPath?: string;
    });

export type ProducerAudioTrack = {
  readonly sceneId: string;
  readonly narration: string;
  readonly audioFile: string;
  readonly captions: SegmentCaptions;
  readonly durationInFrames: number;
  readonly durationInSeconds: number;
  readonly provider?: "voxcpm";
  readonly format?: "wav";
};

export type ProducerAudioSummary = {
  readonly compositionId: string;
  readonly providers: readonly "voxcpm"[];
  readonly sceneCount: number;
  readonly narratedSceneCount: number;
  readonly silentSceneCount: number;
  readonly totalDurationInFrames: number;
};
