import type { NarrationAudioFormat } from "../narration-asset-schema";
import { TtsConfigError } from "./errors";

export const DEFAULT_F5_TTS_FORMAT: NarrationAudioFormat = "wav";

export type TtsProviderId = "f5-tts";

export type F5TtsConfig = {
  baseUrl: string;
  endpoint: string;
  voiceId?: string;
  format: NarrationAudioFormat;
  referenceAudioPath?: string;
};

const readNarrationAudioFormatEnv = (
  name: string,
  fallback: NarrationAudioFormat,
): NarrationAudioFormat => {
  const rawValue = (process.env[name] ?? "").trim().toLowerCase();
  if (!rawValue) {
    return fallback;
  }
  if (rawValue === "mp3" || rawValue === "wav" || rawValue === "aac" || rawValue === "m4a") {
    return rawValue;
  }
  throw new TtsConfigError(`${name} must be one of: mp3, wav, aac, m4a.`);
};

export const readTtsProviderId = (): TtsProviderId => {
  const rawValue = (process.env.TTS_PROVIDER ?? process.env.AI_VIDEO_STUDIO_TTS_PROVIDER ?? "")
    .trim()
    .toLowerCase();

  if (!rawValue) {
    return "f5-tts";
  }
  if (rawValue === "f5" || rawValue === "f5-tts") {
    return "f5-tts";
  }

  throw new TtsConfigError("TTS_PROVIDER is F5-TTS only; use f5-tts or leave it empty.");
};

export const readF5TtsConfig = (): F5TtsConfig => {
  const rawBaseUrl = (process.env.F5_TTS_BASE_URL ?? "").trim();
  if (!rawBaseUrl) {
    throw new TtsConfigError("F5_TTS_BASE_URL is not configured.");
  }
  if (!/^https?:\/\//.test(rawBaseUrl)) {
    throw new TtsConfigError("F5_TTS_BASE_URL must start with http:// or https://.");
  }

  const baseUrl = rawBaseUrl.replace(/\/$/, "");
  const rawEndpoint = (process.env.F5_TTS_ENDPOINT ?? "").trim();
  const endpoint = rawEndpoint
    ? /^https?:\/\//.test(rawEndpoint)
      ? rawEndpoint
      : `${baseUrl}/${rawEndpoint.replace(/^\/+/, "")}`
    : `${baseUrl}/synthesize`;

  return {
    baseUrl,
    endpoint,
    voiceId: (process.env.F5_TTS_VOICE_ID ?? "").trim() || undefined,
    format: readNarrationAudioFormatEnv("F5_TTS_FORMAT", DEFAULT_F5_TTS_FORMAT),
    referenceAudioPath: (process.env.F5_TTS_REFERENCE_AUDIO ?? "").trim() || undefined,
  };
};
