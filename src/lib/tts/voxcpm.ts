import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  normalizeSegmentCaptions,
  splitCaptionTextByPunctuation,
  type ProviderCaptionCue,
} from "../captions";
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

type PcmWavData = {
  bitsPerSample: number;
  blockAlign: number;
  channels: number;
  data: Buffer;
  sampleRate: number;
};

const readAscii = (buffer: Buffer, offset: number, length: number): string =>
  buffer.toString("ascii", offset, offset + length);

const parsePcmWav = (buffer: Buffer): PcmWavData => {
  if (buffer.length < 44 || readAscii(buffer, 0, 4) !== "RIFF" || readAscii(buffer, 8, 4) !== "WAVE") {
    throw new TtsProviderError("VoxCPM returned audio that is not a RIFF/WAVE file.");
  }

  let offset = 12;
  let audioFormat: number | undefined;
  let bitsPerSample: number | undefined;
  let blockAlign: number | undefined;
  let channels: number | undefined;
  let sampleRate: number | undefined;
  let data: Buffer | undefined;

  while (offset + 8 <= buffer.length) {
    const chunkId = readAscii(buffer, offset, 4);
    const chunkSize = buffer.readUInt32LE(offset + 4);
    const chunkStart = offset + 8;
    const chunkEnd = chunkStart + chunkSize;

    if (chunkEnd > buffer.length) {
      throw new TtsProviderError("VoxCPM returned a malformed WAV chunk.");
    }

    if (chunkId === "fmt ") {
      audioFormat = buffer.readUInt16LE(chunkStart);
      channels = buffer.readUInt16LE(chunkStart + 2);
      sampleRate = buffer.readUInt32LE(chunkStart + 4);
      blockAlign = buffer.readUInt16LE(chunkStart + 12);
      bitsPerSample = buffer.readUInt16LE(chunkStart + 14);
    } else if (chunkId === "data") {
      data = buffer.subarray(chunkStart, chunkEnd);
    }

    offset = chunkEnd + (chunkSize % 2);
  }

  if (
    audioFormat !== 1 ||
    channels === undefined ||
    sampleRate === undefined ||
    blockAlign === undefined ||
    bitsPerSample !== 16 ||
    !data
  ) {
    throw new TtsProviderError("VoxCPM WAV output must be PCM 16-bit audio.");
  }

  return {
    bitsPerSample,
    blockAlign,
    channels,
    data,
    sampleRate,
  };
};

const encodePcmWav = ({ bitsPerSample, blockAlign, channels, data, sampleRate }: PcmWavData): Buffer => {
  const byteRate = sampleRate * blockAlign;
  const buffer = Buffer.alloc(44 + data.length);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + data.length, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(data.length, 40);
  buffer.set(data, 44);
  return buffer;
};

const isFrameAudible = (wav: PcmWavData, frameIndex: number, threshold: number): boolean => {
  const frameOffset = frameIndex * wav.blockAlign;
  for (let channel = 0; channel < wav.channels; channel += 1) {
    const sampleOffset = frameOffset + channel * 2;
    if (Math.abs(wav.data.readInt16LE(sampleOffset)) > threshold) {
      return true;
    }
  }
  return false;
};

const trimPcmWavSilence = (buffer: Buffer, { paddingSeconds = 0.06, threshold = 384 } = {}): Buffer => {
  const wav = parsePcmWav(buffer);
  const frameCount = Math.floor(wav.data.length / wav.blockAlign);
  let firstAudibleFrame = -1;
  let lastAudibleFrame = -1;

  for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
    if (isFrameAudible(wav, frameIndex, threshold)) {
      firstAudibleFrame = frameIndex;
      break;
    }
  }

  if (firstAudibleFrame < 0) {
    return buffer;
  }

  for (let frameIndex = frameCount - 1; frameIndex >= firstAudibleFrame; frameIndex -= 1) {
    if (isFrameAudible(wav, frameIndex, threshold)) {
      lastAudibleFrame = frameIndex;
      break;
    }
  }

  const paddingFrames = Math.round(wav.sampleRate * paddingSeconds);
  const startFrame = Math.max(0, firstAudibleFrame - paddingFrames);
  const endFrameExclusive = Math.min(frameCount, lastAudibleFrame + paddingFrames + 1);
  const data = wav.data.subarray(startFrame * wav.blockAlign, endFrameExclusive * wav.blockAlign);

  return encodePcmWav({ ...wav, data });
};

const concatenatePcmWavs = (buffers: Buffer[]): Buffer => {
  if (buffers.length === 0) {
    throw new TtsProviderError("VoxCPM did not generate any audio chunks.");
  }

  const wavs = buffers.map((buffer) => parsePcmWav(buffer));
  const [first] = wavs;
  for (const wav of wavs.slice(1)) {
    if (
      wav.bitsPerSample !== first.bitsPerSample ||
      wav.blockAlign !== first.blockAlign ||
      wav.channels !== first.channels ||
      wav.sampleRate !== first.sampleRate
    ) {
      throw new TtsProviderError("VoxCPM generated WAV chunks with incompatible audio formats.");
    }
  }

  const totalDataLength = wavs.reduce((total, wav) => total + wav.data.length, 0);
  const data = Buffer.alloc(totalDataLength);
  let cursor = 0;
  for (const wav of wavs) {
    data.set(wav.data, cursor);
    cursor += wav.data.length;
  }

  return encodePcmWav({
    ...first,
    data,
  });
};

const getPcmWavDurationSeconds = (buffer: Buffer): number => {
  const wav = parsePcmWav(buffer);
  const frameCount = Math.floor(wav.data.length / wav.blockAlign);
  return frameCount / wav.sampleRate;
};

const buildChunkCaptionCues = ({
  chunkDurationsInSeconds,
  chunks,
  durationInFrames,
}: {
  chunkDurationsInSeconds: number[];
  chunks: string[];
  durationInFrames: number;
}): ProviderCaptionCue[] => {
  let cursor = 0;

  return chunks.map((text, index) => {
    const remainingCues = chunks.length - index;
    const remainingFrames = durationInFrames - cursor;
    const proposedDuration =
      index === chunks.length - 1
        ? remainingFrames
        : durationSecondsToFrames(chunkDurationsInSeconds[index] ?? 0.001, DEFAULT_VIDEO_FPS);
    const cueDuration =
      index === chunks.length - 1
        ? Math.max(1, remainingFrames)
        : Math.min(Math.max(1, proposedDuration), remainingFrames - (remainingCues - 1));
    const cue = {
      durationInFrames: cueDuration,
      id: `caption-${index + 1}`,
      startFrame: cursor,
      text,
    };
    cursor += cueDuration;
    return cue;
  });
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
  const chunks = splitCaptionTextByPunctuation(request.text);
  const chunkBuffers: Buffer[] = [];
  const chunkDurationsInSeconds: number[] = [];

  for (const chunk of chunks) {
    const audioBuffer = hasCloneReference
      ? await callVoxcpmClone({
          config,
          filenamePrefix: config.filenamePrefix,
          referenceAudioPath: request.referenceAudioPath as string,
          referenceText: request.referenceText as string,
          text: chunk,
        })
      : await callVoxcpmTts({
          config,
          filenamePrefix: config.filenamePrefix,
          text: chunk,
        });
    const trimmedAudioBuffer = trimPcmWavSilence(audioBuffer);
    chunkBuffers.push(trimmedAudioBuffer);
    chunkDurationsInSeconds.push(getPcmWavDurationSeconds(trimmedAudioBuffer));
  }
  const audioBuffer = concatenatePcmWavs(chunkBuffers);

  await mkdir(path.dirname(absoluteOutputPath), { recursive: true });
  await writeFile(absoluteOutputPath, Uint8Array.from(audioBuffer));

  const durationInSeconds = await probeAudioDurationSeconds(absoluteOutputPath);
  const durationInFrames = durationSecondsToFrames(durationInSeconds, DEFAULT_VIDEO_FPS);
  const providerCues = buildChunkCaptionCues({
    chunkDurationsInSeconds,
    chunks,
    durationInFrames,
  });

  return {
    audioSrc: getTtsArtifactDownloadUrl(assetPath),
    captions: normalizeSegmentCaptions({
      durationInFrames,
      language: request.language,
      providerCues,
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
