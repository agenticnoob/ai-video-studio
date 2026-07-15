import { cleanProducerDisplayText, splitProducerNarrationText } from "../captions";
import type { ProducerNarratedBeat, ProducerVoxcpmRequestPlan } from "../types";

type VoiceDesignInput = {
  readonly beat: ProducerNarratedBeat;
  readonly mode: "voice-design";
  readonly control?: string;
};

type ControllableCloneInput = {
  readonly beat: ProducerNarratedBeat;
  readonly mode: "controllable-clone";
  readonly referenceAudioPath: string;
  readonly control?: string;
};

type HighFidelityCloneInput = {
  readonly beat: ProducerNarratedBeat;
  readonly mode: "high-fidelity-clone";
  readonly promptAudioPath: string;
  readonly promptTranscriptPath: string;
  readonly referenceAudioPath?: string;
};

export type VoxcpmProducerRequestInput =
  | VoiceDesignInput
  | ControllableCloneInput
  | HighFidelityCloneInput;

const required = (value: string | undefined, message: string): string => {
  const normalized = value?.trim();
  if (!normalized) throw new Error(message);
  return normalized;
};

export const createVoxcpmProducerRequestPlan = (
  input: VoxcpmProducerRequestInput,
): ProducerVoxcpmRequestPlan => {
  const ttsText = required(input.beat.ttsText, "VoxCPM narration text is required.");
  const displayText = cleanProducerDisplayText(input.beat.displayText ?? ttsText);
  const ttsChunks = splitProducerNarrationText(ttsText);
  const displayChunks = splitProducerNarrationText(displayText);
  if (ttsChunks.length === 0 || ttsChunks.length !== displayChunks.length) {
    throw new Error("VoxCPM ttsText and displayText must have matching punctuation chunk counts.");
  }

  const base = {
    sceneId: required(input.beat.id, "VoxCPM scene id is required."),
    ttsText,
    displayText,
    ...(input.beat.language ? { language: input.beat.language } : {}),
  };

  if (input.mode === "voice-design") {
    const control = input.control?.trim();
    return { ...base, mode: input.mode, ...(control ? { control } : {}) };
  }
  if (input.mode === "controllable-clone") {
    const control = input.control?.trim();
    return {
      ...base,
      mode: input.mode,
      referenceAudioPath: required(
        input.referenceAudioPath,
        "VoxCPM controllable-clone requires reference audio.",
      ),
      ...(control ? { control } : {}),
    };
  }
  return {
    ...base,
    mode: input.mode,
    promptAudioPath: required(
      input.promptAudioPath,
      "VoxCPM high-fidelity-clone requires prompt audio.",
    ),
    promptTranscriptPath: required(
      input.promptTranscriptPath,
      "VoxCPM high-fidelity-clone requires an exact transcript file.",
    ),
    ...(input.referenceAudioPath?.trim()
      ? { referenceAudioPath: input.referenceAudioPath.trim() }
      : {}),
  };
};
