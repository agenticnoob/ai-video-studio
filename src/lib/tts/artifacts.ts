import { randomUUID } from "node:crypto";
import path from "node:path";
import type { NarrationAudioFormat } from "../narration-asset-schema";

export const TTS_OUTPUT_DIRECTORY = "out/tts";

const TTS_RUN_ID_PATTERN = /^tts-[a-z0-9-]+$/;
const TTS_ASSET_PATH_PATTERN = /^tts-[a-z0-9-]+\/[a-z0-9-]+\.(mp3|wav|aac|m4a)$/;

const slugify = (value: string): string => {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "segment";
};

export const createTtsRunId = (): string => {
  const timestamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
  return `tts-${timestamp}-${randomUUID().slice(0, 8)}`.toLowerCase();
};

export const isValidTtsRunId = (runId: string): boolean => {
  return TTS_RUN_ID_PATTERN.test(runId);
};

export const isValidTtsAssetPath = (assetPath: string): boolean => {
  return TTS_ASSET_PATH_PATTERN.test(assetPath);
};

export const createTtsAssetPath = ({
  format,
  runId,
  segmentId,
}: {
  format: NarrationAudioFormat;
  runId: string;
  segmentId: string;
}): string => {
  if (!isValidTtsRunId(runId)) {
    throw new Error(`Invalid TTS run id: ${runId}`);
  }

  const fileName = `${slugify(segmentId)}-${randomUUID().slice(0, 8)}.${format}`;
  return `${runId}/${fileName}`;
};

export const getTtsArtifactOutputPath = (assetPath: string): string => {
  if (!isValidTtsAssetPath(assetPath)) {
    throw new Error(`Invalid TTS asset path: ${assetPath}`);
  }

  return `${TTS_OUTPUT_DIRECTORY}/${assetPath}`;
};

export const getTtsArtifactAbsolutePath = (assetPath: string): string => {
  return path.join(process.cwd(), getTtsArtifactOutputPath(assetPath));
};

export const getTtsArtifactDownloadUrl = (assetPath: string): string => {
  if (!isValidTtsAssetPath(assetPath)) {
    throw new Error(`Invalid TTS asset path: ${assetPath}`);
  }

  return `/api/tts/assets/${assetPath}`;
};

export const getTtsAssetContentType = (assetPath: string): string => {
  if (assetPath.endsWith(".wav")) {
    return "audio/wav";
  }
  if (assetPath.endsWith(".aac")) {
    return "audio/aac";
  }
  if (assetPath.endsWith(".m4a")) {
    return "audio/mp4";
  }

  return "audio/mpeg";
};
