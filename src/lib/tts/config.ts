import type { NarrationAudioFormat } from "../narration-asset-schema";
import { TtsConfigError } from "./errors";

export const DEFAULT_F5_TTS_FORMAT: NarrationAudioFormat = "wav";

export const ttsProviderIds = ["f5-tts", "voxcpm"] as const;
export type TtsProviderId = (typeof ttsProviderIds)[number];

export type F5TtsConfig = {
  baseUrl: string;
  endpoint: string;
  voiceId?: string;
  format: NarrationAudioFormat;
  referenceAudioPath?: string;
};

export type VoxcpmTtsConfig = {
  baseUrl: string;
  endpoint: string;
  control?: string;
  cfgValue: number;
  inferenceTimesteps: number;
  normalize: boolean;
  denoise: boolean;
  save: boolean;
  filenamePrefix: string;
};

const readBooleanEnv = (name: string, fallback: boolean): boolean => {
  const rawValue = (process.env[name] ?? "").trim().toLowerCase();
  if (!rawValue) {
    return fallback;
  }
  if (["1", "true", "yes", "on"].includes(rawValue)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(rawValue)) {
    return false;
  }
  throw new TtsConfigError(`${name} must be a boolean value.`);
};

const readNumberEnv = (name: string, fallback: number): number => {
  const rawValue = (process.env[name] ?? "").trim();
  if (!rawValue) {
    return fallback;
  }
  const value = Number(rawValue);
  if (!Number.isFinite(value)) {
    throw new TtsConfigError(`${name} must be a finite number.`);
  }
  return value;
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
  const rawValue = (
    (process.env.TTS_PROVIDER ?? "").trim() ||
    (process.env.AI_VIDEO_STUDIO_TTS_PROVIDER ?? "").trim()
  ).toLowerCase();

  if (!rawValue) {
    return "f5-tts";
  }
  if (rawValue === "f5" || rawValue === "f5-tts") {
    return "f5-tts";
  }
  if (rawValue === "voxcpm" || rawValue === "voxcpm-tts") {
    return "voxcpm";
  }

  throw new TtsConfigError("TTS_PROVIDER must be one of: f5-tts, voxcpm.");
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

export const readVoxcpmTtsConfig = (): VoxcpmTtsConfig => {
  const rawBaseUrl = (process.env.VOXCPM_TTS_BASE_URL ?? "").trim();
  if (!rawBaseUrl) {
    throw new TtsConfigError("VOXCPM_TTS_BASE_URL is not configured.");
  }
  if (!/^https?:\/\//.test(rawBaseUrl)) {
    throw new TtsConfigError("VOXCPM_TTS_BASE_URL must start with http:// or https://.");
  }

  const baseUrl = rawBaseUrl.replace(/\/$/, "");
  const rawEndpoint = (process.env.VOXCPM_TTS_ENDPOINT ?? "").trim();
  const endpoint = rawEndpoint
    ? /^https?:\/\//.test(rawEndpoint)
      ? rawEndpoint
      : `${baseUrl}/${rawEndpoint.replace(/^\/+/, "")}`
    : `${baseUrl}/tts`;

  const inferenceTimesteps = readNumberEnv("VOXCPM_TTS_INFERENCE_TIMESTEPS", 10);
  if (!Number.isInteger(inferenceTimesteps) || inferenceTimesteps <= 0) {
    throw new TtsConfigError("VOXCPM_TTS_INFERENCE_TIMESTEPS must be a positive integer.");
  }

  return {
    baseUrl,
    endpoint,
    control: (process.env.VOXCPM_TTS_CONTROL ?? "").trim() || undefined,
    cfgValue: readNumberEnv("VOXCPM_TTS_CFG_VALUE", 2),
    inferenceTimesteps,
    normalize: readBooleanEnv("VOXCPM_TTS_NORMALIZE", true),
    denoise: readBooleanEnv("VOXCPM_TTS_DENOISE", false),
    save: readBooleanEnv("VOXCPM_TTS_SAVE", false),
    filenamePrefix: (process.env.VOXCPM_TTS_FILENAME_PREFIX ?? "").trim() || "ai-video-studio",
  };
};
