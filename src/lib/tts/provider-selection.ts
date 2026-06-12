import { readTtsProviderId, type TtsProviderId } from "./config";
import {
  resolveVoiceCloneReference,
  type ResolvedVoiceCloneReference,
  type VoiceCloneRequest,
} from "./voice-references";

export type ResolveTtsProviderRequest = {
  provider?: TtsProviderId;
  voiceClone?: VoiceCloneRequest;
};

export type ResolvedTtsProvider = {
  fallbackToMinimax: boolean;
  provider: TtsProviderId;
  voiceCloneReference?: ResolvedVoiceCloneReference;
};

export const resolveTtsProvider = async ({
  provider,
  voiceClone,
}: ResolveTtsProviderRequest): Promise<ResolvedTtsProvider> => {
  const voiceCloneReference = await resolveVoiceCloneReference(voiceClone);

  if (voiceCloneReference) {
    return {
      fallbackToMinimax: false,
      provider: "f5-tts",
      voiceCloneReference,
    };
  }

  return {
    fallbackToMinimax: true,
    provider: provider ?? readTtsProviderId(),
  };
};
