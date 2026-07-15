export type ProducerVoxcpmConfig = {
  readonly baseUrl: string;
  readonly ttsEndpoint: string;
  readonly controllableCloneEndpoint: string;
  readonly highFidelityCloneEndpoint: string;
  readonly cfgValue: number;
  readonly inferenceTimesteps: number;
  readonly normalize: boolean;
  readonly denoise: boolean;
  readonly retryBadcase: boolean;
  readonly save: boolean;
  readonly filenamePrefix: string;
  readonly timeoutMs: number;
};

const readBoolean = (env: NodeJS.ProcessEnv, name: string, fallback: boolean): boolean => {
  const value = (env[name] ?? "").trim().toLowerCase();
  if (!value) return fallback;
  if (["1", "true", "yes", "on"].includes(value)) return true;
  if (["0", "false", "no", "off"].includes(value)) return false;
  throw new Error(`${name} must be a boolean value.`);
};

const readNumber = (env: NodeJS.ProcessEnv, name: string, fallback: number): number => {
  const rawValue = (env[name] ?? "").trim();
  const value = rawValue ? Number(rawValue) : fallback;
  if (!Number.isFinite(value)) throw new Error(`${name} must be a finite number.`);
  return value;
};

const assertHttpUrl = (value: string, name: string): string => {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid HTTP URL.`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`${name} must be an HTTP URL.`);
  }
  return value.replace(/\/+$/, "");
};

const resolveEndpoint = ({
  baseUrl,
  env,
  fallbackPath,
  name,
}: {
  readonly baseUrl: string;
  readonly env: NodeJS.ProcessEnv;
  readonly fallbackPath: string;
  readonly name: string;
}): string => {
  const value = (env[name] ?? "").trim();
  if (!value) return `${baseUrl}/${fallbackPath}`;
  if (/^https?:\/\//.test(value)) return assertHttpUrl(value, name);
  return `${baseUrl}/${value.replace(/^\/+/, "")}`;
};

export const readProducerVoxcpmConfig = (
  env: NodeJS.ProcessEnv = process.env,
): ProducerVoxcpmConfig => {
  const rawBaseUrl = (env.VOXCPM_TTS_BASE_URL ?? "").trim();
  if (!rawBaseUrl) throw new Error("VOXCPM_TTS_BASE_URL is not configured.");
  const baseUrl = assertHttpUrl(rawBaseUrl, "VOXCPM_TTS_BASE_URL");
  const inferenceTimesteps = readNumber(env, "VOXCPM_TTS_INFERENCE_TIMESTEPS", 10);
  if (!Number.isInteger(inferenceTimesteps) || inferenceTimesteps <= 0) {
    throw new Error("VOXCPM_TTS_INFERENCE_TIMESTEPS must be a positive integer.");
  }
  const timeoutMs = readNumber(env, "VOXCPM_TTS_TIMEOUT_MS", 180_000);
  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
    throw new Error("VOXCPM_TTS_TIMEOUT_MS must be a positive integer.");
  }
  const cfgValue = readNumber(env, "VOXCPM_TTS_CFG_VALUE", 2);
  if (!(cfgValue > 0)) throw new Error("VOXCPM_TTS_CFG_VALUE must be positive.");

  return {
    baseUrl,
    ttsEndpoint: resolveEndpoint({
      baseUrl,
      env,
      fallbackPath: "tts",
      name: "VOXCPM_TTS_ENDPOINT",
    }),
    controllableCloneEndpoint: resolveEndpoint({
      baseUrl,
      env,
      fallbackPath: "clone",
      name: "VOXCPM_TTS_CONTROLLABLE_CLONE_ENDPOINT",
    }),
    highFidelityCloneEndpoint: resolveEndpoint({
      baseUrl,
      env: {
        ...env,
        VOXCPM_TTS_HIGH_FIDELITY_CLONE_ENDPOINT:
          env.VOXCPM_TTS_HIGH_FIDELITY_CLONE_ENDPOINT ?? env.VOXCPM_TTS_CLONE_ENDPOINT,
      },
      fallbackPath: "clone_with_prompt",
      name: "VOXCPM_TTS_HIGH_FIDELITY_CLONE_ENDPOINT",
    }),
    cfgValue,
    inferenceTimesteps,
    normalize: readBoolean(env, "VOXCPM_TTS_NORMALIZE", true),
    denoise: readBoolean(env, "VOXCPM_TTS_DENOISE", false),
    retryBadcase: readBoolean(env, "VOXCPM_TTS_RETRY_BADCASE", true),
    save: readBoolean(env, "VOXCPM_TTS_SAVE", false),
    filenamePrefix: (env.VOXCPM_TTS_FILENAME_PREFIX ?? "").trim() || "ai-video-studio",
    timeoutMs,
  };
};
