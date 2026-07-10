#!/usr/bin/env node
/* global Buffer, console, fetch, File, FormData, process */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const compiledRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scriptModule = await import(
  path.join(compiledRoot, "src", "remotion", "AiConceptsForBeginners", "script.js")
);
const { aiConceptsForBeginnersNarrationBeats, createAiConceptsForBeginnersSingleScenePlan } =
  scriptModule;

const NEXT_ORIGIN = (process.env.NEXT_ORIGIN || "http://web:3000").replace(/\/+$/, "");
const PUBLIC_ASSET_DIR = path.join(
  process.cwd(),
  "public",
  "generated",
  "ai-concepts-for-beginners",
);
const PUBLIC_ASSET_PREFIX = "generated/ai-concepts-for-beginners";
const GENERATED_AUDIO_PATH = path.join(
  process.cwd(),
  "src",
  "remotion",
  "AiConceptsForBeginners",
  "audio.generated.ts",
);
const TYPES_PATH = path.join(
  process.cwd(),
  "src",
  "remotion",
  "AiConceptsForBeginners",
  "types.ts",
);
const DEFAULT_VOICE_REFERENCE_AUDIO = path.join(
  process.cwd(),
  "voices",
  "f5-tts",
  "noobli",
  "ref.m4a",
);
const DEFAULT_VOICE_REFERENCE_TEXT = path.join(
  process.cwd(),
  "voices",
  "f5-tts",
  "noobli",
  "ref.txt",
);
const SCENE_TAIL_PADDING_FRAMES = 14;
const VOICEOVER_PLAYBACK_RATE = 1.2;
const REQUIRE_REAL_TTS = process.env.AI_CONCEPTS_REQUIRE_REAL_TTS !== "false";

const fail = (message) => {
  throw new Error(message);
};

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: { "content-type": "application/json", ...(options.headers || {}) },
  });
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    fail(`Request returned non-JSON from ${url}: ${text}`);
  }
  if (!response.ok) fail(`Request failed: ${response.status} ${url} ${JSON.stringify(body)}`);
  return body;
};

const getReferenceAudioMimeType = (filePath) => {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".mp3") return "audio/mpeg";
  if (extension === ".m4a") return "audio/m4a";
  if (extension === ".aac") return "audio/aac";
  return "audio/wav";
};

const uploadVoiceReference = async () => {
  const referenceAudioPath =
    process.env.AI_CONCEPTS_VOICE_REFERENCE_AUDIO || DEFAULT_VOICE_REFERENCE_AUDIO;
  const referenceTextPath =
    process.env.AI_CONCEPTS_VOICE_REFERENCE_TEXT || DEFAULT_VOICE_REFERENCE_TEXT;
  const referenceText = readFileSync(referenceTextPath, "utf8").trim();
  if (!referenceText) fail(`Voice reference text is empty: ${referenceTextPath}`);
  const form = new FormData();
  form.set(
    "audio",
    new File([readFileSync(referenceAudioPath)], path.basename(referenceAudioPath), {
      type: getReferenceAudioMimeType(referenceAudioPath),
    }),
  );
  form.set("referenceText", referenceText);
  const response = await fetch(`${NEXT_ORIGIN}/api/tts/voice-references`, {
    body: form,
    method: "POST",
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : undefined;
  if (!response.ok || typeof body?.referenceId !== "string") {
    fail(`Voice reference upload failed: ${response.status} ${JSON.stringify(body)}`);
  }
  return {
    enabled: true,
    referenceId: body.referenceId,
    referenceText: body.referenceText || referenceText,
  };
};

const cleanCaptionText = (text) =>
  text.replace(
    /\[(?:laughing|sigh|Uhm|Shh|Question-[^\]]+|Surprise-[^\]]+|Dissatisfaction-[^\]]+)\]\s*/g,
    "",
  );

const normalizeCaptions = (captions) => ({
  ...captions,
  cues: (captions?.cues || []).map((cue) => ({ ...cue, text: cleanCaptionText(cue.text) })),
});

const tryGenerateTts = async (beat, voiceClone) => {
  const plan = createAiConceptsForBeginnersSingleScenePlan(beat);
  const body = await requestJson(`${NEXT_ORIGIN}/api/tts`, {
    body: JSON.stringify({
      plan,
      provider: process.env.TTS_PROVIDER || "voxcpm",
      segmentId: beat.id,
      voiceClone,
    }),
    method: "POST",
  });
  const narration = body.narration;
  if (!narration?.audioSrc?.startsWith("/api/tts/assets/")) {
    fail(`Unexpected ${beat.id} TTS response.`);
  }
  const format = narration.format || "wav";
  const audioFileName = `${beat.id}.${format}`;
  const response = await fetch(`${NEXT_ORIGIN}${narration.audioSrc}`);
  if (!response.ok) fail(`Failed to download generated audio for ${beat.id}: ${response.status}`);
  writeFileSync(
    path.join(PUBLIC_ASSET_DIR, audioFileName),
    Buffer.from(await response.arrayBuffer()),
  );
  return {
    audioFile: `${PUBLIC_ASSET_PREFIX}/${audioFileName}`,
    captions: normalizeCaptions(narration.captions),
    durationInFrames: narration.durationInFrames,
    durationInSeconds: narration.durationInSeconds,
    format,
    narration: beat.narration,
    provider: narration.provider,
    sceneId: beat.id,
  };
};

const serializeGeneratedAudio = (tracks) =>
  `// allow: SIZE_OK - generated AI concepts TTS timing and local audio references.\nimport type { AiConceptsForBeginnersAudioTrack } from "./types";\n\nexport const aiConceptsForBeginnersAudio = ${JSON.stringify(
    tracks,
    null,
    2,
  )} satisfies readonly AiConceptsForBeginnersAudioTrack[];\n`;

const updateDurationConstant = (tracks) => {
  const durationInFrames = tracks.reduce(
    (total, track) =>
      total +
      Math.ceil(track.durationInFrames / VOICEOVER_PLAYBACK_RATE) +
      SCENE_TAIL_PADDING_FRAMES,
    0,
  );
  const current = readFileSync(TYPES_PATH, "utf8");
  const next = current.replace(
    /export const AI_CONCEPTS_FOR_BEGINNERS_DURATION_IN_FRAMES = \d+;/,
    `export const AI_CONCEPTS_FOR_BEGINNERS_DURATION_IN_FRAMES = ${durationInFrames};`,
  );
  writeFileSync(TYPES_PATH, next);
  return durationInFrames;
};

const run = async () => {
  mkdirSync(PUBLIC_ASSET_DIR, { recursive: true });
  if (!REQUIRE_REAL_TTS) {
    fail("Silent fallback is intentionally not implemented for the final beginner explainer.");
  }
  const voiceClone = await uploadVoiceReference();
  const tracks = [];
  for (const beat of aiConceptsForBeginnersNarrationBeats) {
    console.log(`Generating narration for ${beat.id}`);
    tracks.push(await tryGenerateTts(beat, voiceClone));
  }
  writeFileSync(GENERATED_AUDIO_PATH, serializeGeneratedAudio(tracks));
  const durationInFrames = updateDurationConstant(tracks);
  writeFileSync(
    path.join(PUBLIC_ASSET_DIR, "tts-summary.json"),
    `${JSON.stringify(
      {
        compositionId: "AiConceptsForBeginners",
        durationInFrames,
        durationInSeconds: durationInFrames / 30,
        providers: Array.from(new Set(tracks.map((track) => track.provider))),
        sceneCount: tracks.length,
        usedFallback: false,
        voiceReference: path.relative(process.cwd(), DEFAULT_VOICE_REFERENCE_AUDIO),
      },
      null,
      2,
    )}\n`,
  );
  console.log(`Generated AI concepts narration: ${(durationInFrames / 30).toFixed(1)} seconds.`);
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
