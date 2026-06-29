#!/usr/bin/env node
/* global Buffer, console, fetch, process */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const compiledRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scriptModule = await import(
  path.join(compiledRoot, "src", "remotion", "WorldCupBettingAnalysis", "script.js")
);

const { createWorldCupBettingSingleScenePlan, worldCupBettingNarrationScenes } = scriptModule;

const NEXT_ORIGIN = (process.env.NEXT_ORIGIN || "http://127.0.0.1:3000").replace(/\/+$/, "");
const PUBLIC_ASSET_DIR = path.join(
  process.cwd(),
  "public",
  "generated",
  "world-cup-betting-analysis",
);
const PUBLIC_ASSET_PREFIX = "generated/world-cup-betting-analysis";
const OUT_DIR = path.join(process.cwd(), ".omo", "evidence", "world-cup-betting-analysis");
const GENERATED_AUDIO_PATH = path.join(
  process.cwd(),
  "src",
  "remotion",
  "WorldCupBettingAnalysis",
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

const assertNarrationAsset = (scene, narration) => {
  if (!narration) {
    fail(`Missing narration for ${scene.id}`);
  }
  if (
    typeof narration.audioSrc !== "string" ||
    !narration.audioSrc.startsWith("/api/tts/assets/")
  ) {
    fail(`Unexpected ${scene.id} audioSrc: ${narration.audioSrc}`);
  }
  if (!Number.isFinite(narration.durationInFrames) || narration.durationInFrames <= 0) {
    fail(`Invalid ${scene.id} durationInFrames: ${narration.durationInFrames}`);
  }
  if (narration.durationInFrames > scene.durationInFrames) {
    console.warn(
      `Generated narration for ${scene.id} is longer than the draft scene duration: ${narration.durationInFrames} > ${scene.durationInFrames}`,
    );
  }
  if (!narration.captions?.cues?.length) {
    fail(`Missing ${scene.id} caption cues`);
  }
};

const writePublicAudioFile = async (scene, narration) => {
  const format = narration.format || "wav";
  const audioFile = `${scene.id}.${format}`;
  const response = await fetch(`${NEXT_ORIGIN}${narration.audioSrc}`);

  if (!response.ok) {
    fail(`Failed to download generated audio for ${scene.id}: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length <= 0) {
    fail(`Generated audio for ${scene.id} was empty.`);
  }

  writeFileSync(path.join(PUBLIC_ASSET_DIR, audioFile), buffer);
  return `${PUBLIC_ASSET_PREFIX}/${audioFile}`;
};

const serializeGeneratedAudio = (
  tracks,
) => `// allow: SIZE_OK - generated WorldCupBettingAnalysis TTS timing and static audio references.
import type { WorldCupBettingAudioTrack } from "./types";

export const worldCupBettingAudio = ${JSON.stringify(tracks, null, 2)} satisfies readonly WorldCupBettingAudioTrack[];
`;

const run = async () => {
  console.log(`Generating WorldCupBettingAnalysis TTS through ${NEXT_ORIGIN}/api/tts`);
  mkdirSync(PUBLIC_ASSET_DIR, { recursive: true });
  mkdirSync(OUT_DIR, { recursive: true });

  const tracks = [];
  for (const scene of worldCupBettingNarrationScenes) {
    const plan = createWorldCupBettingSingleScenePlan(scene);
    console.log(`Generating narration for ${scene.id}`);
    const body = await requestJson(`${NEXT_ORIGIN}/api/tts`, {
      body: JSON.stringify({
        plan,
        provider: "f5-tts",
        segmentId: scene.id,
      }),
      method: "POST",
    });

    assertNarrationAsset(scene, body.narration);
    const audioFile = await writePublicAudioFile(scene, body.narration);

    tracks.push({
      audioFile,
      captions: body.narration.captions,
      durationInFrames: body.narration.durationInFrames,
      durationInSeconds: body.narration.durationInSeconds,
      format: body.narration.format,
      narration: scene.narration,
      provider: body.narration.provider,
      sceneId: scene.id,
    });
  }

  writeFileSync(GENERATED_AUDIO_PATH, serializeGeneratedAudio(tracks));
  writeFileSync(
    path.join(OUT_DIR, "summary.json"),
    `${JSON.stringify(
      {
        audioFiles: tracks.map((track) => track.audioFile),
        compositionId: "WorldCupBettingAnalysis",
        generatedAudioPath: path.relative(process.cwd(), GENERATED_AUDIO_PATH),
        provider: "f5-tts",
        sceneCount: tracks.length,
        totalVoiceoverFrames: tracks.reduce((sum, track) => sum + track.durationInFrames, 0),
        totalVoiceoverSeconds: tracks.reduce((sum, track) => sum + track.durationInSeconds, 0),
      },
      null,
      2,
    )}\n`,
  );

  console.log(`Wrote ${path.relative(process.cwd(), GENERATED_AUDIO_PATH)}`);
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
