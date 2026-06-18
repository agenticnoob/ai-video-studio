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
      provider: "f5-tts",
      voiceCloneReference,
    };
  }

  return {
    provider: provider ?? readTtsProviderId(),
  };
};
