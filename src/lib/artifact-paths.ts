import path from "node:path";

const resolveConfiguredDirectory = ({
  envName,
  fallbackDirectory,
}: {
  envName: string;
  fallbackDirectory: string;
}): string => {
  const configuredDirectory = (process.env[envName] ?? "").trim();
  const normalizedDirectory = (configuredDirectory || fallbackDirectory).replace(/\/+$/, "");

  if (path.isAbsolute(normalizedDirectory)) {
    return normalizedDirectory;
  }

  return path.join(/* turbopackIgnore: true */ process.cwd(), normalizedDirectory);
};

export const DEFAULT_RENDER_OUTPUT_DIRECTORY = "/workspace/out/renders";
export const DEFAULT_TTS_OUTPUT_DIRECTORY = "/workspace/out/tts";
export const DEFAULT_VOICE_REFERENCE_DIRECTORY = "/workspace/out/voice-references";

export const getRenderOutputDirectory = (): string => {
  return resolveConfiguredDirectory({
    envName: "AI_VIDEO_STUDIO_RENDER_OUTPUT_DIR",
    fallbackDirectory: DEFAULT_RENDER_OUTPUT_DIRECTORY,
  });
};

export const getTtsOutputDirectory = (): string => {
  return resolveConfiguredDirectory({
    envName: "AI_VIDEO_STUDIO_TTS_OUTPUT_DIR",
    fallbackDirectory: DEFAULT_TTS_OUTPUT_DIRECTORY,
  });
};

export const getVoiceReferenceDirectory = (): string => {
  return resolveConfiguredDirectory({
    envName: "AI_VIDEO_STUDIO_VOICE_REFERENCE_DIR",
    fallbackDirectory: DEFAULT_VOICE_REFERENCE_DIRECTORY,
  });
};
