#!/usr/bin/env node
/* global Buffer, console, fetch, process */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const compiledRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scriptModule = await import(
  path.join(compiledRoot, "src", "remotion", "PixelRAGChineseStandalone", "script.js")
);
const {
  createPixelRAGSingleSegmentPlan,
  pixelragChineseSceneBlueprints,
  pixelragChineseShortSegments,
} = scriptModule;

const NEXT_ORIGIN = (process.env.NEXT_ORIGIN || "http://127.0.0.1:3000").replace(/\/+$/, "");
const PUBLIC_ASSET_DIR = path.join(
  process.cwd(),
  "public",
  "generated",
  "pixelrag-chinese-standalone",
);
const PUBLIC_ASSET_PREFIX = "generated/pixelrag-chinese-standalone";
const OUT_DIR = path.join(process.cwd(), ".omo", "evidence", "pixelrag-chinese-standalone");
const GENERATED_DATA_PATH = path.join(
  process.cwd(),
  "src",
  "remotion",
  "PixelRAGChineseStandalone",
  "data.generated.ts",
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

const assertNarrationAsset = (segmentId, narration) => {
  if (!narration) {
    fail(`Missing narration for ${segmentId}`);
  }
  if (narration.provider !== "f5-tts") {
    fail(`Expected ${segmentId} provider f5-tts, received ${narration.provider}`);
  }
  if (
    typeof narration.audioSrc !== "string" ||
    !narration.audioSrc.startsWith("/api/tts/assets/")
  ) {
    fail(`Unexpected ${segmentId} audioSrc: ${narration.audioSrc}`);
  }
  if (!Number.isFinite(narration.durationInFrames) || narration.durationInFrames <= 0) {
    fail(`Invalid ${segmentId} durationInFrames: ${narration.durationInFrames}`);
  }
  if (!narration.captions?.cues?.length) {
    fail(`Missing ${segmentId} caption cues`);
  }
};

const writePublicAudioFile = async (segmentId, narration) => {
  const format = narration.format || "wav";
  const audioFile = `${segmentId}.${format}`;
  const response = await fetch(`${NEXT_ORIGIN}${narration.audioSrc}`);
  if (!response.ok) {
    fail(`Failed to download generated audio for ${segmentId}: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length <= 0) {
    fail(`Generated audio for ${segmentId} was empty.`);
  }

  writeFileSync(path.join(PUBLIC_ASSET_DIR, audioFile), buffer);
  return `${PUBLIC_ASSET_PREFIX}/${audioFile}`;
};

const serializeGeneratedData = (
  scenes,
) => `// allow: SIZE_OK - generated Chinese F5 TTS timing and static audio references.
import {
  PIXELRAG_CHINESE_STANDALONE_COMPOSITION_ID,
  PIXELRAG_CHINESE_STANDALONE_FPS,
  PIXELRAG_CHINESE_STANDALONE_HEIGHT,
  PIXELRAG_CHINESE_STANDALONE_WIDTH,
  type PixelRAGChineseStandaloneData,
} from "./types";

export const pixelragChineseStandaloneData = {
  compositionId: PIXELRAG_CHINESE_STANDALONE_COMPOSITION_ID,
  fps: PIXELRAG_CHINESE_STANDALONE_FPS,
  height: PIXELRAG_CHINESE_STANDALONE_HEIGHT,
  scenes: ${JSON.stringify(scenes, null, 2)},
  title: "PixelRAG 中文开源项目介绍 V3",
  width: PIXELRAG_CHINESE_STANDALONE_WIDTH,
} satisfies PixelRAGChineseStandaloneData;
`;

const run = async () => {
  console.log(`Generating Chinese PixelRAG standalone TTS through ${NEXT_ORIGIN}/api/tts`);
  mkdirSync(PUBLIC_ASSET_DIR, { recursive: true });
  mkdirSync(OUT_DIR, { recursive: true });

  const scenes = [];
  for (const shortSegment of pixelragChineseShortSegments) {
    const plan = createPixelRAGSingleSegmentPlan(shortSegment);
    const [segment] = plan.segments;
    console.log(`Generating Chinese narration for ${shortSegment.id}`);
    const body = await requestJson(`${NEXT_ORIGIN}/api/tts`, {
      body: JSON.stringify({
        plan,
        provider: "f5-tts",
        segmentId: shortSegment.id,
      }),
      method: "POST",
    });

    assertNarrationAsset(shortSegment.id, body.narration);
    const audioFile = await writePublicAudioFile(shortSegment.id, body.narration);
    const blueprint = pixelragChineseSceneBlueprints[shortSegment.id];
    if (!blueprint) {
      fail(`Missing scene blueprint for ${shortSegment.id}`);
    }

    scenes.push({
      ...blueprint,
      audioFile,
      captions: body.narration.captions,
      durationInFrames: body.narration.durationInFrames,
      id: shortSegment.id,
      narration: segment.narration.text,
    });
  }

  const durationInFrames = scenes.reduce((sum, scene) => sum + scene.durationInFrames, 0);
  writeFileSync(GENERATED_DATA_PATH, serializeGeneratedData(scenes));
  writeFileSync(
    path.join(OUT_DIR, "summary.json"),
    `${JSON.stringify(
      {
        audioFiles: scenes.map((scene) => scene.audioFile),
        compositionId: "PixelRAGChineseStandalonePreview",
        durationInFrames,
        durationInSeconds: durationInFrames / 30,
        generatedDataPath: path.relative(process.cwd(), GENERATED_DATA_PATH),
        screenshotFiles: [...new Set(scenes.map((scene) => scene.screenshotFile))],
        provider: "f5-tts",
        sceneCount: scenes.length,
      },
      null,
      2,
    )}\n`,
  );

  console.log(`Wrote ${path.relative(process.cwd(), GENERATED_DATA_PATH)}`);
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
