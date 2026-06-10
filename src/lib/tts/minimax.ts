import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  DEFAULT_VIDEO_FPS,
  durationSecondsToFrames,
  type NarrationAudioFormat,
} from "../narration-asset-schema";
import {
  createTtsAssetPath,
  createTtsRunId,
  getTtsArtifactAbsolutePath,
  getTtsArtifactDownloadUrl,
} from "./artifacts";
import { probeAudioDurationSeconds } from "./audio-duration";
import { readMinimaxTtsConfig } from "./config";
import { TtsProviderError } from "./errors";

export type MinimaxSpeechSynthesisRequest = {
  text: string;
  segmentId: string;
  runId?: string;
  voiceId?: string;
};

export type MinimaxSpeechSynthesisResult = {
  audioSrc: string;
  durationInFrames: number;
  durationInSeconds: number;
  format: NarrationAudioFormat;
  outputPath: string;
  provider: "minimax";
  voiceId: string;
};

type MinimaxTtsJsonResponse = {
  data?: {
    audio?: unknown;
    audio_url?: unknown;
    status?: unknown;
    url?: unknown;
  };
  audio?: unknown;
  base_resp?: {
    status_code?: number;
    status_msg?: string;
  };
  message?: string;
};

const isLikelyHex = (value: string): boolean => {
  return value.length > 0 && value.length % 2 === 0 && /^[0-9a-f]+$/i.test(value);
};

const decodeAudioString = (value: string): Buffer => {
  const normalized = value.trim();
  const dataUriMatch = normalized.match(/^data:audio\/[a-z0-9.+-]+;base64,(.+)$/i);
  const encoded = dataUriMatch?.[1] ?? normalized;

  if (isLikelyHex(encoded)) {
    return Buffer.from(encoded, "hex");
  }

  return Buffer.from(encoded, "base64");
};

const fetchAudioUrl = async (audioUrl: string): Promise<Buffer> => {
  let response: Response;
  try {
    response = await fetch(audioUrl, { signal: AbortSignal.timeout(60_000) });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new TtsProviderError(`MiniMax TTS audio download failed: ${detail}`);
  }

  if (!response.ok) {
    throw new TtsProviderError(`MiniMax TTS audio download failed: ${response.status}`);
  }

  return Buffer.from(await response.arrayBuffer());
};

const extractAudioBuffer = async (
  response: Response,
  json: MinimaxTtsJsonResponse,
): Promise<Buffer> => {
  const statusCode = json.base_resp?.status_code;
  if (typeof statusCode === "number" && statusCode !== 0) {
    throw new TtsProviderError(
      `MiniMax TTS failed: ${statusCode} ${json.base_resp?.status_msg ?? ""}`.trim(),
    );
  }

  const audioValue = json.data?.audio ?? json.audio;
  const status = json.data?.status;
  if (typeof status === "number" && status !== 2) {
    throw new TtsProviderError(`MiniMax TTS response was not complete (status=${status}).`);
  }

  if (typeof audioValue === "string" && audioValue.trim().length > 0) {
    return decodeAudioString(audioValue);
  }

  const audioUrl = json.data?.audio_url ?? json.data?.url;
  if (typeof audioUrl === "string" && /^https?:\/\//.test(audioUrl)) {
    return fetchAudioUrl(audioUrl);
  }

  throw new TtsProviderError(
    `MiniMax TTS response did not include audio data (${response.status}).`,
  );
};

const callMinimaxTts = async ({
  text,
  voiceId,
}: {
  text: string;
  voiceId: string;
}): Promise<Buffer> => {
  const config = readMinimaxTtsConfig();
  const body = {
    model: config.model,
    text,
    stream: false,
    voice_setting: {
      voice_id: voiceId,
      speed: 1,
      vol: 1,
      pitch: 0,
      ...(config.emotion ? { emotion: config.emotion } : {}),
    },
    audio_setting: {
      sample_rate: config.sampleRate,
      bitrate: config.bitrate,
      format: config.format,
      channel: config.channel,
    },
    subtitle_enable: false,
    output_format: "hex",
  };

  let response: Response;
  try {
    response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(90_000),
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new TtsProviderError(`MiniMax TTS request failed: network error: ${detail}`);
  }

  if (!response.ok) {
    const bodyText = await response.text();
    throw new TtsProviderError(`MiniMax TTS request failed: ${response.status} ${bodyText}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.startsWith("audio/")) {
    return Buffer.from(await response.arrayBuffer());
  }

  if (!contentType.includes("application/json")) {
    const bodyText = await response.text();
    throw new TtsProviderError(`MiniMax TTS returned a non-audio response: ${bodyText}`);
  }

  const json = (await response.json()) as MinimaxTtsJsonResponse;
  return extractAudioBuffer(response, json);
};

export const synthesizeMinimaxSpeech = async (
  request: MinimaxSpeechSynthesisRequest,
): Promise<MinimaxSpeechSynthesisResult> => {
  const config = readMinimaxTtsConfig();
  const voiceId = request.voiceId ?? config.voiceId;
  const runId = request.runId ?? createTtsRunId();
  const assetPath = createTtsAssetPath({
    format: config.format,
    runId,
    segmentId: request.segmentId,
  });
  const absoluteOutputPath = getTtsArtifactAbsolutePath(assetPath);

  const audioBuffer = await callMinimaxTts({ text: request.text, voiceId });

  await mkdir(path.dirname(absoluteOutputPath), { recursive: true });
  await writeFile(absoluteOutputPath, Uint8Array.from(audioBuffer));

  const durationInSeconds = await probeAudioDurationSeconds(absoluteOutputPath);

  return {
    audioSrc: getTtsArtifactDownloadUrl(assetPath),
    durationInFrames: durationSecondsToFrames(durationInSeconds, DEFAULT_VIDEO_FPS),
    durationInSeconds,
    format: config.format,
    outputPath: absoluteOutputPath,
    provider: "minimax",
    voiceId,
  };
};
