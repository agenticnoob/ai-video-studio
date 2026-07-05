#!/usr/bin/env node
/* global Buffer, console, fetch, process */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const compiledRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scriptModule = await import(
  path.join(compiledRoot, "src", "remotion", "UvOpenSourceBrief", "script.js")
);

const { createUvOpenSourceSingleScenePlan, uvOpenSourceNarrationBeats } = scriptModule;

const NEXT_ORIGIN = (process.env.NEXT_ORIGIN || "http://web:3000").replace(/\/+$/, "");
const PUBLIC_ASSET_DIR = path.join(process.cwd(), "public", "generated", "uv-open-source-brief");
const PUBLIC_ASSET_PREFIX = "generated/uv-open-source-brief";
const GENERATED_AUDIO_PATH = path.join(
  process.cwd(),
  "src",
  "remotion",
  "UvOpenSourceBrief",
  "audio.generated.ts",
);

const fail = (message) => {
  throw new Error(message);
};

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let body;

  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    fail(`Request returned non-JSON from ${url}: ${text}`);
  }

  if (!response.ok) {
    fail(`Request failed: ${response.status} ${url} ${JSON.stringify(body)}`);
  }

  return body;
};

const writeWavSilence = (filePath, durationInSeconds) => {
  const sampleRate = 24000;
  const channels = 1;
  const bitsPerSample = 16;
  const frameCount = Math.max(1, Math.round(sampleRate * durationInSeconds));
  const dataSize = frameCount * channels * (bitsPerSample / 8);
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * channels * (bitsPerSample / 8), 28);
  buffer.writeUInt16LE(channels * (bitsPerSample / 8), 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  writeFileSync(filePath, buffer);
};

const makeFallbackCaptions = (beat, durationInFrames) => ({
  language: "zh-CN",
  style: { position: "bottom", preset: "standalone-landscape" },
  cues: [
    {
      durationInFrames,
      id: `${beat.id}-caption`,
      startFrame: 0,
      text: beat.narration.length > 34 ? `${beat.narration.slice(0, 34)}...` : beat.narration,
    },
  ],
});

const tryGenerateTts = async (beat) => {
  const plan = createUvOpenSourceSingleScenePlan(beat);
  const body = await requestJson(`${NEXT_ORIGIN}/api/tts`, {
    body: JSON.stringify({
      plan,
      provider: "f5-tts",
      segmentId: beat.id,
    }),
    method: "POST",
  });

  const narration = body.narration;
  if (
    !narration ||
    typeof narration.audioSrc !== "string" ||
    !narration.audioSrc.startsWith("/api/tts/assets/")
  ) {
    fail(`Unexpected ${beat.id} TTS response.`);
  }

  const format = narration.format || "wav";
  const audioFileName = `${beat.id}.${format}`;
  const response = await fetch(`${NEXT_ORIGIN}${narration.audioSrc}`);
  if (!response.ok) {
    fail(`Failed to download generated audio for ${beat.id}: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(path.join(PUBLIC_ASSET_DIR, audioFileName), buffer);

  return {
    audioFile: `${PUBLIC_ASSET_PREFIX}/${audioFileName}`,
    captions: narration.captions,
    durationInFrames: narration.durationInFrames,
    durationInSeconds: narration.durationInSeconds,
    format,
    narration: beat.narration,
    provider: narration.provider,
    sceneId: beat.id,
  };
};

const makeFallbackAudio = (beat) => {
  const seconds = Math.max(5.3, Math.min(7.4, beat.narration.length / 7.6));
  const durationInFrames = Math.ceil(seconds * 30);
  const audioFileName = `${beat.id}.wav`;
  writeWavSilence(path.join(PUBLIC_ASSET_DIR, audioFileName), seconds);

  return {
    audioFile: `${PUBLIC_ASSET_PREFIX}/${audioFileName}`,
    captions: makeFallbackCaptions(beat, durationInFrames),
    durationInFrames,
    durationInSeconds: seconds,
    format: "wav",
    narration: beat.narration,
    provider: "local-silent-fallback",
    sceneId: beat.id,
  };
};

const serializeGeneratedAudio = (tracks) => `// allow: SIZE_OK - generated/fallback uv open-source brief TTS timing and static audio references.
import type { UvOpenSourceBriefAudioTrack } from "./types";

export const uvOpenSourceBriefAudio = ${JSON.stringify(
  tracks,
  null,
  2,
)} satisfies readonly UvOpenSourceBriefAudioTrack[];
`;

const run = async () => {
  mkdirSync(PUBLIC_ASSET_DIR, { recursive: true });
  const scenes = [];
  let usedFallback = false;

  for (const beat of uvOpenSourceNarrationBeats) {
    console.log(`Preparing narration for ${beat.id}`);
    try {
      scenes.push(await tryGenerateTts(beat));
    } catch (error) {
      usedFallback = true;
      console.warn(
        `Falling back to local silent WAV for ${beat.id}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      scenes.push(makeFallbackAudio(beat));
    }
  }

  writeFileSync(GENERATED_AUDIO_PATH, serializeGeneratedAudio(scenes));
  writeFileSync(
    path.join(PUBLIC_ASSET_DIR, "tts-summary.json"),
    `${JSON.stringify(
      {
        compositionId: "UvOpenSourceBrief",
        generatedAudioPath: path.relative(process.cwd(), GENERATED_AUDIO_PATH),
        providers: Array.from(new Set(scenes.map((scene) => scene.provider))),
        sceneCount: scenes.length,
        usedFallback,
      },
      null,
      2,
    )}\n`,
  );
  console.log(`Prepared uv open-source brief narration. fallback=${usedFallback}`);
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
