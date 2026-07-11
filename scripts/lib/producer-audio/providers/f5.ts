import type { ProducerAudioRequestPlan, ProducerNarrationBeat } from "../types";

export type F5ProducerRequestInput = {
  readonly beat: ProducerNarrationBeat;
  readonly voiceClone?: {
    readonly enabled: true;
    readonly referenceId: string;
    readonly referenceText: string;
  };
};

export const createF5ProducerRequestPlan = ({
  beat,
  voiceClone,
}: F5ProducerRequestInput): ProducerAudioRequestPlan => ({
  provider: "f5-tts",
  body: {
    segmentId: beat.id,
    text: beat.ttsText,
    ...(beat.language ? { language: beat.language } : {}),
    provider: "f5-tts",
    ...(voiceClone ? { voiceClone } : {}),
  },
});
