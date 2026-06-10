import { DEFAULT_MINIMAX_BASE_URL } from "../minimax/provider";
import type { NarrationAudioFormat } from "../narration-asset-schema";
import { TtsConfigError } from "./errors";

export const DEFAULT_MINIMAX_TTS_MODEL = "speech-2.8-turbo";
export const DEFAULT_MINIMAX_TTS_VOICE_ID = "male-qn-qingse";
export const DEFAULT_MINIMAX_TTS_FORMAT: NarrationAudioFormat = "mp3";
export const DEFAULT_MINIMAX_TTS_SAMPLE_RATE = 32000;
export const DEFAULT_MINIMAX_TTS_BITRATE = 128000;

export type MinimaxTtsConfig = {
  apiKey: string;
  endpoint: string;
  model: string;
  voiceId: string;
  groupId?: string;
  format: NarrationAudioFormat;
  sampleRate: number;
  bitrate: number;
  channel: 1 | 2;
  emotion?: string;
};

const readPositiveIntegerEnv = (name: string, fallback: number): number => {
  const rawValue = (process.env[name] ?? "").trim();
  if (rawValue.length === 0) {
    return fallback;
  }

  const value = Number(rawValue);
  if (!Number.isInteger(value) || value <= 0) {
    throw new TtsConfigError(`${name} must be a positive integer.`);
  }

  return value;
};

const readChannelEnv = (): 1 | 2 => {
  const value = readPositiveIntegerEnv("MINIMAX_TTS_CHANNEL", 1);
  if (value !== 1 && value !== 2) {
    throw new TtsConfigError("MINIMAX_TTS_CHANNEL must be 1 or 2.");
  }
  return value;
};

const normalizeBaseUrl = (rawBaseUrl: string): string => {
  if (!/^https?:\/\//.test(rawBaseUrl)) {
    return DEFAULT_MINIMAX_BASE_URL;
  }

  return rawBaseUrl.replace(/\/$/, "");
};

const getDefaultMinimaxTtsEndpoint = (): string => {
  const baseUrl = normalizeBaseUrl(
    (process.env.MINIMAX_TTS_BASE_URL ?? process.env.MINIMAX_BASE_URL ?? "").trim() ||
      DEFAULT_MINIMAX_BASE_URL,
  );

  return `${baseUrl}/t2a_v2`;
};

const appendGroupId = (endpoint: string, groupId?: string): string => {
  if (!groupId) {
    return endpoint;
  }

  const url = new URL(endpoint);
  if (!url.searchParams.has("GroupId")) {
    url.searchParams.set("GroupId", groupId);
  }

  return url.toString();
};

export const readMinimaxTtsConfig = (): MinimaxTtsConfig => {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    throw new TtsConfigError(
      "MINIMAX_API_KEY is not configured. Set it in .env.local to enable TTS generation.",
    );
  }

  const rawEndpoint = (process.env.MINIMAX_TTS_ENDPOINT ?? "").trim();
  const groupId = (process.env.MINIMAX_GROUP_ID ?? "").trim() || undefined;
  const endpoint = appendGroupId(rawEndpoint || getDefaultMinimaxTtsEndpoint(), groupId);
  const model = (process.env.MINIMAX_TTS_MODEL ?? "").trim() || DEFAULT_MINIMAX_TTS_MODEL;
  const voiceId = (process.env.MINIMAX_TTS_VOICE_ID ?? "").trim() || DEFAULT_MINIMAX_TTS_VOICE_ID;
  const emotion = (process.env.MINIMAX_TTS_EMOTION ?? "").trim() || undefined;

  return {
    apiKey: apiKey.trim(),
    endpoint,
    model,
    voiceId,
    groupId,
    format: DEFAULT_MINIMAX_TTS_FORMAT,
    sampleRate: readPositiveIntegerEnv("MINIMAX_TTS_SAMPLE_RATE", DEFAULT_MINIMAX_TTS_SAMPLE_RATE),
    bitrate: readPositiveIntegerEnv("MINIMAX_TTS_BITRATE", DEFAULT_MINIMAX_TTS_BITRATE),
    channel: readChannelEnv(),
    emotion,
  };
};
