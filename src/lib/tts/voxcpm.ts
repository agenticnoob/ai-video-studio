import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { normalizeSegmentCaptions } from "../captions";
import { DEFAULT_VIDEO_FPS, durationSecondsToFrames } from "../narration-asset-schema";
import {
  createTtsAssetPath,
  createTtsRunId,
  getTtsArtifactAbsolutePath,
  getTtsArtifactDownloadUrl,
} from "./artifacts";
import { probeAudioDurationSeconds } from "./audio-duration";
import { readVoxcpmTtsConfig, type VoxcpmTtsConfig } from "./config";
import { TtsProviderError } from "./errors";

export type VoxcpmSpeechSynthesisRequest = {
  text: string;
  language?: string;
  segmentId: string;
  runId?: string;
  voiceId?: string;
};

export type VoxcpmSpeechSynthesisResult = {
  audioSrc: string;
  captions?: ReturnType<typeof normalizeSegmentCaptions>;
  durationInFrames: number;
  durationInSeconds: number;
  format: "wav";
  outputPath: string;
  provider: "voxcpm";
  voiceId?: string;
};

const callVoxcpmTts = async ({
  config,
  filenamePrefix,
  text,
}: {
  config: VoxcpmTtsConfig;
  filenamePrefix: string;
  text: string;
}): Promise<Buffer> => {
  const body = {
    text,
    ...(config.control ? { control: config.control } : {}),
    cfg_value: config.cfgValue,
    inference_timesteps: config.inferenceTimesteps,
    normalize: config.normalize,
    denoise: config.denoise,
    save: config.save,
    filename_prefix: filenamePrefix,
  };

  let response: Response;
  try {
    response = await fetch(config.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(180_000),
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new TtsProviderError(`VoxCPM request failed: network error: ${detail}`);
  }

  if (!response.ok) {
    const bodyText = await response.text();
    throw new TtsProviderError(`VoxCPM request failed: ${response.status} ${bodyText}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.startsWith("audio/")) {
    const bodyText = await response.text();
    throw new TtsProviderError(`VoxCPM returned a non-audio response: ${bodyText}`);
  }

  return Buffer.from(await response.arrayBuffer());
};

export const synthesizeVoxcpmSpeech = async (
  request: VoxcpmSpeechSynthesisRequest,
): Promise<VoxcpmSpeechSynthesisResult> => {
  const config = readVoxcpmTtsConfig();
  const runId = request.runId ?? createTtsRunId();
  const assetPath = createTtsAssetPath({
    format: "wav",
    runId,
    segmentId: request.segmentId,
  });
  const absoluteOutputPath = getTtsArtifactAbsolutePath(assetPath);
  const audioBuffer = await callVoxcpmTts({
    config,
    filenamePrefix: config.filenamePrefix,
    text: request.text,
  });

  await mkdir(path.dirname(absoluteOutputPath), { recursive: true });
  await writeFile(absoluteOutputPath, Uint8Array.from(audioBuffer));

  const durationInSeconds = await probeAudioDurationSeconds(absoluteOutputPath);
  const durationInFrames = durationSecondsToFrames(durationInSeconds, DEFAULT_VIDEO_FPS);

  return {
    audioSrc: getTtsArtifactDownloadUrl(assetPath),
    captions: normalizeSegmentCaptions({
      durationInFrames,
      language: request.language,
      text: request.text,
    }),
    durationInFrames,
    durationInSeconds,
    format: "wav",
    outputPath: absoluteOutputPath,
    provider: "voxcpm",
    voiceId: request.voiceId,
  };
};
