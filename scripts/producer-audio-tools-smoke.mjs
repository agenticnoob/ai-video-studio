/* global Response, console */

import assert from "node:assert/strict";

import {
  cleanProducerDisplayText,
  createF5ProducerRequestPlan,
  createVoxcpmProducerRequestPlan,
  requestProducerNarrationAsset,
  runProducerAudioGeneration,
  serializeProducerAudioMetadata,
  updateProducerDurationConstant,
  normalizeProducerCaptions,
} from "./lib/producer-audio/index.js";
import { fixtureNarrationBeats } from "./fixtures/producer-tools/fixture-config.js";

assert.equal(
  cleanProducerDisplayText(fixtureNarrationBeats[0].displayText),
  "GPT-5.6，先看证据。",
);
assert.equal(cleanProducerDisplayText(fixtureNarrationBeats[1].ttsText), "普通的 [版本] 内容应该保留。");

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
  displayText: fixtureNarrationBeats[0].displayText,
  durationInFrames: 90,
});
assert.equal(normalized.cues[0]?.text, "GPT-5.6，先看证据。");
assert.equal(normalized.cues[0]?.startFrame, 0);
assert.equal(normalized.cues[0]?.durationInFrames, 90);

const fallback = normalizeProducerCaptions({
  captions: { cues: [] },
  displayText: "(warm) [sigh] fallback caption",
  durationInFrames: 120,
});
assert.deepEqual(fallback.cues, [
  {
    id: "caption-1",
    text: "fallback caption",
    startFrame: 0,
    durationInFrames: 120,
  },
]);

const beat = fixtureNarrationBeats[0];
assert.throws(
  () => createVoxcpmProducerRequestPlan({ mode: "controllable-clone", beat, referenceAudioPath: "" }),
  /reference audio/i,
);
assert.doesNotThrow(() =>
  createVoxcpmProducerRequestPlan({
    mode: "controllable-clone",
    beat,
    referenceAudioPath: "voices/ref.wav",
  }),
);
assert.throws(
  () =>
    createVoxcpmProducerRequestPlan({
      mode: "high-fidelity-clone",
      beat,
      referenceAudioPath: "voices/ref.wav",
    }),
  /exact reference transcript/i,
);
const highFidelity = createVoxcpmProducerRequestPlan({
  mode: "high-fidelity-clone",
  beat,
  referenceAudioPath: "voices/ref.wav",
  referenceText: "精确逐字稿",
  control: "urgent",
});
assert(!("control" in highFidelity.body), "Hi-Fi mode must ignore control instructions");

const f5Plan = createF5ProducerRequestPlan({ beat });
assert.equal(f5Plan.provider, "f5-tts");
assert(!("mode" in f5Plan.body));

const requestResult = await requestProducerNarrationAsset({
  origin: "http://fixture.local",
  plan: f5Plan,
  fetchImpl: async (url, init) => {
    assert.equal(url, "http://fixture.local/api/tts");
    assert.equal(init.method, "POST");
    return new Response(
      JSON.stringify({
        narration: {
          audioSrc: "/api/tts/assets/fixture/opening.wav",
          captions: { cues: [] },
          durationInFrames: 150,
          durationInSeconds: 5,
          format: "wav",
          provider: "f5-tts",
        },
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  },
});
assert.equal(requestResult.durationInFrames, 150);

const metadataSource = serializeProducerAudioMetadata({
  header: "Fixture audio metadata.",
  exportName: "fixtureAudioTracks",
  typeImport: {
    name: "ProducerAudioTrack",
    path: "../../lib/producer-audio/types",
  },
  tracks: [],
});
assert(metadataSource.includes('import type { ProducerAudioTrack } from "../../lib/producer-audio/types";'));
assert(metadataSource.includes("satisfies readonly ProducerAudioTrack[]"));

assert.equal(
  updateProducerDurationConstant({
    source: "export const FIXTURE_DURATION_IN_FRAMES = 1;\n",
    constantName: "FIXTURE_DURATION_IN_FRAMES",
    durationInFrames: 330,
  }),
  "export const FIXTURE_DURATION_IN_FRAMES = 330;\n",
);

const generationResult = await runProducerAudioGeneration({
  compositionId: "FixtureProducerVideo",
  beats: fixtureNarrationBeats,
  createRequestPlan: (currentBeat) => createF5ProducerRequestPlan({ beat: currentBeat }),
  fallbackPolicy: "forbid",
  metadata: {
    header: "Fixture audio metadata.",
    exportName: "fixtureAudioTracks",
    typeImport: { name: "ProducerAudioTrack", path: "../../lib/producer-audio/types" },
  },
  duration: {
    source: "export const FIXTURE_DURATION_IN_FRAMES = 1;\n",
    constantName: "FIXTURE_DURATION_IN_FRAMES",
  },
  requestNarration: async ({ plan }) => ({
    audioSrc: `/generated/${plan.body.segmentId}.wav`,
    captions: { cues: [] },
    durationInFrames: plan.body.segmentId === "opening" ? 150 : 180,
    durationInSeconds: plan.body.segmentId === "opening" ? 5 : 6,
    format: "wav",
    provider: "f5-tts",
  }),
});
assert.equal(generationResult.tracks.length, 2, "one track per beat");
assert.equal(generationResult.summary.totalDurationInFrames, 330, "duration aggregation");
assert.equal(generationResult.summary.usedFallback, false, "fallback state");
assert(generationResult.metadataSource.includes("fixtureAudioTracks"), "metadata export");
assert(
  generationResult.durationSource.includes("FIXTURE_DURATION_IN_FRAMES = 330"),
  "duration update",
);

await assert.rejects(
  () =>
    runProducerAudioGeneration({
      compositionId: "FixtureProducerVideo",
      beats: [fixtureNarrationBeats[0]],
      createRequestPlan: (currentBeat) => createF5ProducerRequestPlan({ beat: currentBeat }),
      fallbackPolicy: "forbid",
      metadata: {
        header: "Fixture.",
        exportName: "fixtureAudioTracks",
        typeImport: { name: "ProducerAudioTrack", path: "../../lib/producer-audio/types" },
      },
      duration: {
        source: "export const FIXTURE_DURATION_IN_FRAMES = 1;\n",
        constantName: "FIXTURE_DURATION_IN_FRAMES",
      },
      requestNarration: async () => {
        throw new Error("fixture request failed");
      },
    }),
  /fixture request failed/,
);

const fallbackGeneration = await runProducerAudioGeneration({
  compositionId: "FixtureProducerVideo",
  beats: [fixtureNarrationBeats[0]],
  createRequestPlan: (currentBeat) => createF5ProducerRequestPlan({ beat: currentBeat }),
  fallbackPolicy: "allow-explicit-silence",
  metadata: {
    header: "Fixture.",
    exportName: "fixtureAudioTracks",
    typeImport: { name: "ProducerAudioTrack", path: "../../lib/producer-audio/types" },
  },
  duration: {
    source: "export const FIXTURE_DURATION_IN_FRAMES = 1;\n",
    constantName: "FIXTURE_DURATION_IN_FRAMES",
  },
  fallbackDurationInFrames: 90,
  requestNarration: async () => {
    throw new Error("fixture outage");
  },
});
assert.equal(fallbackGeneration.summary.usedFallback, true);
assert(fallbackGeneration.summary.fallbackReasons[0]?.includes("fixture outage"));

console.log("Producer audio tools smoke passed.");
