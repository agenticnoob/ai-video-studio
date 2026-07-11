import type {
  ProducerAudioRequestPlan,
  ProducerNarrationBeat,
  ProducerVoxcpmMode,
} from "../types";

export type VoxcpmProducerRequestInput = {
  readonly beat: ProducerNarrationBeat;
  readonly mode: ProducerVoxcpmMode;
  readonly referenceAudioPath?: string;
  readonly referenceId?: string;
  readonly referenceText?: string;
  readonly control?: string;
};

const nonEmpty = (value: string | undefined): string | undefined => value?.trim() || undefined;

export const validateVoxcpmProducerMode = (input: VoxcpmProducerRequestInput): void => {
  const referenceAudioPath = nonEmpty(input.referenceAudioPath);
  const referenceId = nonEmpty(input.referenceId);
  const referenceText = nonEmpty(input.referenceText);
  const hasReference = Boolean(referenceAudioPath || referenceId);

  if (input.mode === "voice-design") {
    if (hasReference || referenceText) {
      throw new Error("VoxCPM voice-design must not include reference audio or transcript.");
    }
    return;
  }

  if (!hasReference) {
    throw new Error(`VoxCPM ${input.mode} requires reference audio or an uploaded reference id.`);
  }

  if (input.mode === "high-fidelity-clone" && !referenceText) {
    throw new Error("VoxCPM high-fidelity-clone requires an exact reference transcript.");
  }

  if (input.mode === "controllable-clone" && referenceId && !referenceText) {
    throw new Error(
      "The current repo /api/tts adapter requires referenceText for uploaded clone references; controllable clone does not require a transcript upstream.",
    );
  }
};

export const createVoxcpmProducerRequestPlan = (
  input: VoxcpmProducerRequestInput,
): ProducerAudioRequestPlan => {
  validateVoxcpmProducerMode(input);
  const referenceId = nonEmpty(input.referenceId);
  const referenceText = nonEmpty(input.referenceText);
  const control = nonEmpty(input.control);
  const text =
    input.mode === "voice-design" && control
      ? `(${control}) ${input.beat.ttsText}`
      : input.beat.ttsText;

  return {
    provider: "voxcpm",
    body: {
      segmentId: input.beat.id,
      text,
      ...(input.beat.language ? { language: input.beat.language } : {}),
      provider: "voxcpm",
      voxcpmMode: input.mode,
      ...(input.mode !== "high-fidelity-clone" && control ? { control } : {}),
      ...(referenceId
        ? {
            voiceClone: {
              enabled: true,
              referenceId,
              referenceText,
            },
          }
        : {}),
      ...(!referenceId && nonEmpty(input.referenceAudioPath)
        ? { referenceAudioPath: nonEmpty(input.referenceAudioPath), ...(referenceText ? { referenceText } : {}) }
        : {}),
    },
  };
};
