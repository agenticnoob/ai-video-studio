import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { normalizeSegmentCaptions, type ProviderCaptionCue } from "../captions";
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
import { readF5TtsConfig } from "./config";
import { TtsProviderError } from "./errors";

export type F5SpeechSynthesisRequest = {
  text: string;
  language?: string;
  segmentId: string;
  runId?: string;
  voiceId?: string;
  referenceAudioPath?: string;
  referenceText?: string;
};

export type F5SpeechSynthesisResult = {
  audioSrc: string;
  captions?: ReturnType<typeof normalizeSegmentCaptions>;
  durationInFrames: number;
  durationInSeconds: number;
  format: NarrationAudioFormat;
  outputPath: string;
  provider: "f5-tts";
  voiceId?: string;
};

type F5TtsJsonResponse = {
  audio?: unknown;
  audioBase64?: unknown;
  audio_base64?: unknown;
  audioUrl?: unknown;
  audio_url?: unknown;
  captions?: unknown;
  alignment?: unknown;
  format?: unknown;
  language?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const decodeAudioString = (value: string): Buffer => {
  const normalized = value.trim();
  const dataUriMatch = normalized.match(/^data:audio\/[a-z0-9.+-]+;base64,(.+)$/i);
  return Buffer.from(dataUriMatch?.[1] ?? normalized, "base64");
};

const fetchAudioUrl = async (audioUrl: string): Promise<Buffer> => {
  let response: Response;
  try {
    response = await fetch(audioUrl, { signal: AbortSignal.timeout(90_000) });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new TtsProviderError(`F5-TTS audio download failed: ${detail}`);
  }

  if (!response.ok) {
    throw new TtsProviderError(`F5-TTS audio download failed: ${response.status}`);
  }

  return Buffer.from(await response.arrayBuffer());
};

const normalizeFormat = (value: unknown, fallback: NarrationAudioFormat): NarrationAudioFormat => {
  if (value === "mp3" || value === "wav" || value === "aac" || value === "m4a") {
    return value;
  }
  return fallback;
};

const readNumber = (value: unknown): number | undefined => {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
};

const parseCaptionCue = (value: unknown): ProviderCaptionCue | undefined => {
  if (!isRecord(value) || typeof value.text !== "string" || !value.text.trim()) {
    return undefined;
  }

  return {
    id: typeof value.id === "string" ? value.id : undefined,
    text: value.text,
    startFrame: readNumber(value.startFrame),
    durationInFrames: readNumber(value.durationInFrames),
    endFrame: readNumber(value.endFrame),
    startSeconds: readNumber(value.startSeconds ?? value.start),
    durationSeconds: readNumber(value.durationSeconds ?? value.duration),
    endSeconds: readNumber(value.endSeconds ?? value.end),
    startMs: readNumber(value.startMs),
    endMs: readNumber(value.endMs),
  };
};

const parseCaptionCueArray = (value: unknown): ProviderCaptionCue[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((candidate) => parseCaptionCue(candidate))
    .filter((cue): cue is ProviderCaptionCue => Boolean(cue));
};

const extractCaptionCues = (json: F5TtsJsonResponse): ProviderCaptionCue[] => {
  const directCues = parseCaptionCueArray(json.captions);
  if (directCues.length > 0) {
    return directCues;
  }

  if (isRecord(json.captions)) {
    const nestedCaptionCues = parseCaptionCueArray(json.captions.cues);
    if (nestedCaptionCues.length > 0) {
      return nestedCaptionCues;
    }
  }

  if (Array.isArray(json.alignment)) {
    return parseCaptionCueArray(json.alignment);
  }

  if (isRecord(json.alignment)) {
    const cueCandidates = [
      parseCaptionCueArray(json.alignment.cues),
      parseCaptionCueArray(json.alignment.words),
      parseCaptionCueArray(json.alignment.segments),
    ].find((cues) => cues.length > 0);
    return cueCandidates ?? [];
  }

  return [];
};

const extractAudioBuffer = async (json: F5TtsJsonResponse): Promise<Buffer> => {
  const audioValue = json.audio_base64 ?? json.audioBase64 ?? json.audio;
  if (typeof audioValue === "string" && audioValue.trim()) {
    return decodeAudioString(audioValue);
  }

  const audioUrl = json.audio_url ?? json.audioUrl;
  if (typeof audioUrl === "string" && /^https?:\/\//.test(audioUrl)) {
    return fetchAudioUrl(audioUrl);
  }

  throw new TtsProviderError("F5-TTS response did not include audio data.");
};

const callF5Tts = async ({
  language,
  referenceAudioPath,
  referenceText,
  text,
  voiceId,
}: {
  language?: string;
  referenceAudioPath?: string;
  referenceText?: string;
  text: string;
  voiceId?: string;
}): Promise<{ audioBuffer: Buffer; json?: F5TtsJsonResponse }> => {
  const config = readF5TtsConfig();
  const body = {
    text,
    ...(language ? { language } : {}),
    ...(voiceId ? { voiceId, voice_id: voiceId } : {}),
    ...(referenceAudioPath ? { referenceAudio: referenceAudioPath } : {}),
    ...(referenceText ? { referenceText } : {}),
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
    throw new TtsProviderError(`F5-TTS request failed: network error: ${detail}`);
  }

  if (!response.ok) {
    const bodyText = await response.text();
    throw new TtsProviderError(`F5-TTS request failed: ${response.status} ${bodyText}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.startsWith("audio/")) {
    return { audioBuffer: Buffer.from(await response.arrayBuffer()) };
  }

  if (!contentType.includes("application/json")) {
    const bodyText = await response.text();
    throw new TtsProviderError(`F5-TTS returned a non-audio response: ${bodyText}`);
  }

  const json = (await response.json()) as F5TtsJsonResponse;
  return { audioBuffer: await extractAudioBuffer(json), json };
};

export const synthesizeF5Speech = async (
  request: F5SpeechSynthesisRequest,
): Promise<F5SpeechSynthesisResult> => {
  const config = readF5TtsConfig();
  const voiceId = request.voiceId ?? config.voiceId;
  const runId = request.runId ?? createTtsRunId();
  const { audioBuffer, json } = await callF5Tts({
    language: request.language,
    referenceAudioPath: request.referenceAudioPath ?? config.referenceAudioPath,
    referenceText: request.referenceText,
    text: request.text,
    voiceId,
  });
  const format = normalizeFormat(json?.format, config.format);
  const assetPath = createTtsAssetPath({
    format,
    runId,
    segmentId: request.segmentId,
  });
  const absoluteOutputPath = getTtsArtifactAbsolutePath(assetPath);

  await mkdir(path.dirname(absoluteOutputPath), { recursive: true });
  await writeFile(absoluteOutputPath, Uint8Array.from(audioBuffer));

  const durationInSeconds = await probeAudioDurationSeconds(absoluteOutputPath);
  const durationInFrames = durationSecondsToFrames(durationInSeconds, DEFAULT_VIDEO_FPS);
  const providerCues = json ? extractCaptionCues(json) : [];

  return {
    audioSrc: getTtsArtifactDownloadUrl(assetPath),
    captions: normalizeSegmentCaptions({
      durationInFrames,
      language:
        typeof json?.language === "string" && json.language.trim()
          ? json.language.trim()
          : request.language,
      providerCues,
      text: request.text,
    }),
    durationInFrames,
    durationInSeconds,
    format,
    outputPath: absoluteOutputPath,
    provider: "f5-tts",
    voiceId,
  };
};
