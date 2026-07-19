/* global console, process */

import assert from "node:assert/strict";
import { mkdir, readFile, rm, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
  cleanProducerDisplayText,
  createVoxcpmProducerRequestPlan,
  normalizeProducerCaptions,
  runProducerAudioGeneration,
  serializeProducerAudioMetadata,
  updateProducerDurationConstant,
} from "../../lib/producer-audio/index.js";

const requestSource = await readFile(
  path.join(process.cwd(), "scripts/lib/producer-audio/request.ts"),
  "utf8",
);
assert(!requestSource.includes("/api/tts"), "Producer narration must not call repository /api/tts");
assert(!/\borigin\b/.test(requestSource), "Producer narration must not accept an origin");

assert.equal(cleanProducerDisplayText("(calm) [Uhm] GPT-5.6，先看证据。"), "GPT-5.6，先看证据。");
assert.equal(
  cleanProducerDisplayText("普通的 [版本] 内容应该保留。"),
  "普通的 [版本] 内容应该保留。",
);

const normalized = normalizeProducerCaptions({
  captions: {
    language: "zh-CN",
    cues: [
      {
        id: "caption-1",
        text: "[Uhm] GPT-5.6，先看证据。",
        startFrame: 0,
        durationInFrames: 90,
      },
    ],
  },
  displayText: "GPT-5.6，先看证据。",
  durationInFrames: 90,
});
assert.equal(normalized.cues[0]?.text, "GPT-5.6，先看证据。");

const beats = [
  {
    id: "opening",
    narrationRequired: true,
    ttsText: "(calm) [Uhm] GPT-5.6，先看证据。",
    displayText: "GPT-5.6，先看证据。",
    language: "zh-CN",
  },
  {
    id: "closing",
    narrationRequired: true,
    ttsText: "普通的 [版本] 内容应该保留。",
    language: "zh-CN",
  },
];

const artifactRoot = path.join(os.tmpdir(), `producer-audio-tools-${process.pid}`);
await rm(artifactRoot, { force: true, recursive: true });
await mkdir(artifactRoot, { recursive: true });

const outputPathFor = (sceneId) => path.join(artifactRoot, "audio", `${sceneId}.wav`);
const audioSrcFor = (sceneId) => `generated/fixture/audio/${sceneId}.wav`;
const createPlan = (beat) => createVoxcpmProducerRequestPlan({ beat, mode: "voice-design" });
const makeAsset = async (beat) => {
  const outputPath = outputPathFor(beat.id);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `fixture-${beat.id}`);
  const durationInFrames = beat.id === "opening" ? 150 : 180;
  return {
    audioSrc: audioSrcFor(beat.id),
    captions: {
      language: beat.language,
      cues: [
        {
          id: `${beat.id}-caption-1`,
          text: beat.displayText ?? beat.ttsText,
          startFrame: 0,
          durationInFrames,
        },
      ],
    },
    durationInFrames,
    durationInSeconds: durationInFrames / 30,
    format: "wav",
    outputPath,
    provider: "voxcpm",
  };
};

const paths = {
  metadata: path.join(artifactRoot, "audio.generated.ts"),
  duration: path.join(artifactRoot, "types.ts"),
  progress: path.join(artifactRoot, "progress.json"),
  summary: path.join(artifactRoot, "summary.json"),
};
const createConfig = (requestNarration, currentBeats = beats) => ({
  compositionId: "FixtureProducerVideo",
  beats: currentBeats,
  createRequestPlan: createPlan,
  requestNarration,
  progressDestination: paths.progress,
  metadata: {
    header: "Fixture audio metadata.",
    exportName: "fixtureAudioTracks",
    typeImport: { name: "ProducerAudioTrack", path: "../../lib/producer-audio/types" },
    destination: paths.metadata,
  },
  duration: {
    source: "export const FIXTURE_DURATION_IN_FRAMES = 1;\n",
    constantName: "FIXTURE_DURATION_IN_FRAMES",
    destination: paths.duration,
  },
  summaryDestination: paths.summary,
  writeOutputs: true,
});

const firstCalls = [];
await assert.rejects(
  () =>
    runProducerAudioGeneration(
      createConfig(async ({ beat }) => {
        firstCalls.push(beat.id);
        if (beat.id === "closing") throw new Error("fixture second scene failed");
        return makeAsset(beat);
      }),
    ),
  /fixture second scene failed/,
);
assert.deepEqual(firstCalls, ["opening", "closing"]);
const partialProgress = JSON.parse(await readFile(paths.progress, "utf8"));
assert.deepEqual(
  partialProgress.scenes.map((scene) => scene.sceneId),
  ["opening"],
);

const resumeCalls = [];
const resumed = await runProducerAudioGeneration(
  createConfig(async ({ beat }) => {
    resumeCalls.push(beat.id);
    return makeAsset(beat);
  }),
);
assert.deepEqual(resumeCalls, ["closing"], "completed opening scene must resume by scene id");
assert.equal(resumed.tracks.length, 2);
assert.equal(resumed.summary.totalDurationInFrames, 330);
assert.deepEqual(resumed.summary.providers, ["voxcpm"]);
assert.equal(resumed.summary.narratedSceneCount, 2);
assert.equal(resumed.summary.silentSceneCount, 0);

const changedBeats = [
  { ...beats[0], ttsText: "更新后的开场。", displayText: "更新后的开场。" },
  beats[1],
];
const invalidatedCalls = [];
await runProducerAudioGeneration(
  createConfig(async ({ beat }) => {
    invalidatedCalls.push(beat.id);
    return makeAsset(beat);
  }, changedBeats),
);
assert.deepEqual(invalidatedCalls, ["opening"], "changed plan must invalidate only its scene");

await unlink(outputPathFor("opening"));
const missingFileCalls = [];
await runProducerAudioGeneration(
  createConfig(async ({ beat }) => {
    missingFileCalls.push(beat.id);
    return makeAsset(beat);
  }, changedBeats),
);
assert.deepEqual(missingFileCalls, ["opening"], "missing output file must invalidate resume");

const stableFirst = await runProducerAudioGeneration(
  createConfig(async ({ beat }) => makeAsset(beat), changedBeats),
);
const stableSecond = await runProducerAudioGeneration(
  createConfig(async () => {
    throw new Error("a fully resumed run must not request narration");
  }, changedBeats),
);
assert.equal(stableSecond.metadataSource, stableFirst.metadataSource);
assert.equal(stableSecond.durationSource, stableFirst.durationSource);
assert.equal(stableSecond.summarySource, stableFirst.summarySource);
assert.equal(await readFile(paths.metadata, "utf8"), stableFirst.metadataSource);
assert.equal(await readFile(paths.duration, "utf8"), stableFirst.durationSource);
assert.equal(await readFile(paths.summary, "utf8"), stableFirst.summarySource);

const silentResult = await runProducerAudioGeneration({
  ...createConfig(async () => {
    throw new Error("explicit silence must not request narration");
  }, [{ id: "silent", narrationRequired: false, durationInFrames: 90 }]),
  compositionId: "SilentFixture",
  progressDestination: path.join(artifactRoot, "silent-progress.json"),
});
assert.deepEqual(silentResult.tracks, [
  {
    sceneId: "silent",
    narration: "",
    audioFile: "",
    captions: { cues: [] },
    durationInFrames: 90,
    durationInSeconds: 3,
  },
]);
assert.equal(silentResult.summary.narratedSceneCount, 0);
assert.equal(silentResult.summary.silentSceneCount, 1);

await assert.rejects(
  () =>
    runProducerAudioGeneration({
      ...createConfig(async () => {
        throw new Error("required narration outage");
      }, [{ id: "required", narrationRequired: true, ttsText: "必须失败。" }]),
      compositionId: "RequiredFixture",
      progressDestination: path.join(artifactRoot, "required-progress.json"),
    }),
  /required narration outage/,
);

const metadataSource = serializeProducerAudioMetadata({
  header: "Fixture audio metadata.",
  exportName: "fixtureAudioTracks",
  typeImport: { name: "ProducerAudioTrack", path: "../../lib/producer-audio/types" },
  tracks: [],
});
assert(
  metadataSource.includes(
    'import type { ProducerAudioTrack } from "../../lib/producer-audio/types";',
  ),
);
assert(metadataSource.includes("satisfies readonly ProducerAudioTrack[]"));
assert.equal(
  updateProducerDurationConstant({
    source: "export const FIXTURE_DURATION_IN_FRAMES = 1;\n",
    constantName: "FIXTURE_DURATION_IN_FRAMES",
    durationInFrames: 330,
  }),
  "export const FIXTURE_DURATION_IN_FRAMES = 330;\n",
);

await rm(artifactRoot, { force: true, recursive: true });
console.log("Producer audio tools smoke passed.");
