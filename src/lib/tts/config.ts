import { TtsConfigError } from "./errors";

export const ttsProviderIds = ["voxcpm"] as const;
export type TtsProviderId = (typeof ttsProviderIds)[number];

export type VoxcpmCloneMode = "clone" | "clone_with_prompt";

export type VoxcpmTtsConfig = {
  baseUrl: string;
  endpoint: string;
  cloneEndpoint: string;
  cloneMode: VoxcpmCloneMode;
  control?: string;
  cfgValue: number;
  inferenceTimesteps: number;
  normalize: boolean;
  denoise: boolean;
  retryBadcase: boolean;
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

const readVoxcpmCloneModeEnv = (): VoxcpmCloneMode => {
  const rawValue = (process.env.VOXCPM_TTS_CLONE_MODE ?? "").trim().toLowerCase();
  if (!rawValue) {
    return "clone_with_prompt";
  }
  if (rawValue === "clone" || rawValue === "clone_with_prompt") {
    return rawValue;
  }
  throw new TtsConfigError("VOXCPM_TTS_CLONE_MODE must be one of: clone, clone_with_prompt.");
};

export const readTtsProviderId = (): TtsProviderId => {
  const rawValue = (
    (process.env.TTS_PROVIDER ?? "").trim() ||
    (process.env.AI_VIDEO_STUDIO_TTS_PROVIDER ?? "").trim()
  ).toLowerCase();

  if (!rawValue) {
    return "voxcpm";
  }
  if (rawValue === "voxcpm" || rawValue === "voxcpm-tts") {
    return "voxcpm";
  }

  throw new TtsConfigError("TTS_PROVIDER must be voxcpm.");
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
  const cloneMode = readVoxcpmCloneModeEnv();
  const rawCloneEndpoint = (process.env.VOXCPM_TTS_CLONE_ENDPOINT ?? "").trim();
  const cloneEndpoint = rawCloneEndpoint
    ? /^https?:\/\//.test(rawCloneEndpoint)
      ? rawCloneEndpoint
      : `${baseUrl}/${rawCloneEndpoint.replace(/^\/+/, "")}`
    : `${baseUrl}/${cloneMode}`;

  const inferenceTimesteps = readNumberEnv("VOXCPM_TTS_INFERENCE_TIMESTEPS", 10);
  if (!Number.isInteger(inferenceTimesteps) || inferenceTimesteps <= 0) {
    throw new TtsConfigError("VOXCPM_TTS_INFERENCE_TIMESTEPS must be a positive integer.");
  }

  return {
    baseUrl,
    endpoint,
    cloneEndpoint,
    cloneMode,
    control: (process.env.VOXCPM_TTS_CONTROL ?? "").trim() || undefined,
    cfgValue: readNumberEnv("VOXCPM_TTS_CFG_VALUE", 2),
    inferenceTimesteps,
    normalize: readBooleanEnv("VOXCPM_TTS_NORMALIZE", true),
    denoise: readBooleanEnv("VOXCPM_TTS_DENOISE", false),
    retryBadcase: readBooleanEnv("VOXCPM_TTS_RETRY_BADCASE", true),
    save: readBooleanEnv("VOXCPM_TTS_SAVE", false),
    filenamePrefix: (process.env.VOXCPM_TTS_FILENAME_PREFIX ?? "").trim() || "ai-video-studio",
  };
};
