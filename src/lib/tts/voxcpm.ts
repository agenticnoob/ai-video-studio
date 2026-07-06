import { mkdir, readFile, writeFile } from "node:fs/promises";
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
  referenceAudioPath?: string;
  referenceText?: string;
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

const guessAudioMimeType = (filePath: string): string => {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".mp3") {
    return "audio/mpeg";
  }
  if (extension === ".m4a") {
    return "audio/mp4";
  }
  if (extension === ".aac") {
    return "audio/aac";
  }
  return "audio/wav";
};

const appendAudioFile = async (
  form: FormData,
  field: string,
  filePath: string,
): Promise<void> => {
  const buffer = await readFile(filePath);
  const blob = new Blob([Uint8Array.from(buffer)], { type: guessAudioMimeType(filePath) });
  form.set(field, blob, path.basename(filePath));
};

const callVoxcpmClone = async ({
  config,
  filenamePrefix,
  referenceAudioPath,
  referenceText,
  text,
}: {
  config: VoxcpmTtsConfig;
  filenamePrefix: string;
  referenceAudioPath: string;
  referenceText: string;
  text: string;
}): Promise<Buffer> => {
  const form = new FormData();
  form.set("text", text);
  form.set("cfg_value", String(config.cfgValue));
  form.set("inference_timesteps", String(config.inferenceTimesteps));
  form.set("normalize", String(config.normalize));
  form.set("denoise", String(config.denoise));
  form.set("save", String(config.save));
  form.set("filename_prefix", filenamePrefix);

  if (config.cloneMode === "clone") {
    if (config.control) {
      form.set("control", config.control);
    }
    await appendAudioFile(form, "reference_audio", referenceAudioPath);
  } else {
    form.set("prompt_text", referenceText);
    await appendAudioFile(form, "prompt_audio", referenceAudioPath);
    await appendAudioFile(form, "reference_audio", referenceAudioPath);
  }

  let response: Response;
  try {
    response = await fetch(config.cloneEndpoint, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(180_000),
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new TtsProviderError(`VoxCPM clone request failed: network error: ${detail}`);
  }

  if (!response.ok) {
    const bodyText = await response.text();
    throw new TtsProviderError(`VoxCPM clone request failed: ${response.status} ${bodyText}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.startsWith("audio/")) {
    const bodyText = await response.text();
    throw new TtsProviderError(`VoxCPM clone returned a non-audio response: ${bodyText}`);
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
  const hasCloneReference = Boolean(request.referenceAudioPath && request.referenceText);
  const audioBuffer = hasCloneReference
    ? await callVoxcpmClone({
        config,
        filenamePrefix: config.filenamePrefix,
        referenceAudioPath: request.referenceAudioPath as string,
        referenceText: request.referenceText as string,
        text: request.text,
      })
    : await callVoxcpmTts({
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
