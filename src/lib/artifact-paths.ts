import path from "node:path";

const resolveConfiguredPath = (configuredValue: string, fallbackPath: string): string => {
  const normalizedDirectory = (configuredValue.trim() || fallbackPath).replace(/\/+$/, "");

  if (path.isAbsolute(normalizedDirectory)) {
    return normalizedDirectory;
  }

  return path.join(/* turbopackIgnore: true */ process.cwd(), normalizedDirectory);
};

export const DEFAULT_ARTIFACT_ROOT = "/workspace/out";

export const getArtifactRoot = (): string => {
  const configuredRoot = (process.env.AI_VIDEO_STUDIO_ARTIFACT_ROOT ?? "").trim();
  return resolveConfiguredPath(configuredRoot, DEFAULT_ARTIFACT_ROOT);
};

export const getRenderOutputDirectory = (): string => {
  return path.join(getArtifactRoot(), "renders");
};

export const getTtsOutputDirectory = (): string => {
  return path.join(getArtifactRoot(), "tts");
};

export const getVoiceReferenceDirectory = (): string => {
  return path.join(getArtifactRoot(), "voice-references");
};
