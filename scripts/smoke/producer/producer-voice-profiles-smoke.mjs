#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const read = (relativePath) => readFileSync(path.join(root, relativePath), "utf8");
const buildRoot = process.env.PRODUCER_VOICE_PROFILES_BUILD_DIR;
assert(buildRoot, "PRODUCER_VOICE_PROFILES_BUILD_DIR is required.");

const registryPath = "scripts/lib/producer-audio/voice-profiles.json";
const runtimePath = path.join(buildRoot, "scripts/lib/producer-audio/voice-profiles.js");
const manifestRuntimePath = path.join(
  buildRoot,
  "src/remotion/producer-samples/manifest.js",
);
const scaffoldManifestRuntimePath = path.join(
  buildRoot,
  "src/remotion/producer-samples/scaffold/SampleName/manifest.js",
);
const registry = JSON.parse(read(registryPath));
const runtime = await import(pathToFileURL(runtimePath).href);
const { assertProducerSampleManifest } = await import(pathToFileURL(manifestRuntimePath).href);
const { sampleNameManifest } = await import(pathToFileURL(scaffoldManifestRuntimePath).href);

assert.equal(registry.version, 1);
assert.deepEqual(
  registry.profiles.map((profile) => profile.id),
  ["lyy", "science-explainer-young-male"],
);
assert.deepEqual(runtime.producerVoiceProfileIds, ["lyy", "science-explainer-young-male"]);
assert.doesNotThrow(() => runtime.assertProducerVoiceProfiles());
assert.throws(() => runtime.getProducerVoiceProfile("missing-profile"), /unknown/i);

const beat = {
  id: "science-beat",
  narrationRequired: true,
  ttsText: "让我们解释这个概念。",
  displayText: "让我们解释这个概念。",
  language: "zh-CN",
};

const lyyPlan = runtime.createVoxcpmProducerRequestPlanForProfile({
  beat,
  profileId: "lyy",
});
assert.deepEqual(
  {
    mode: lyyPlan.mode,
    promptAudioPath: lyyPlan.promptAudioPath,
    promptTranscriptPath: lyyPlan.promptTranscriptPath,
    referenceAudioPath: lyyPlan.referenceAudioPath,
  },
  {
    mode: "high-fidelity-clone",
    promptAudioPath: "voices/clone/lyy.wav",
    promptTranscriptPath: "voices/clone/lyy.txt",
    referenceAudioPath: "voices/clone/lyy-r.wav",
  },
);

assert.throws(
  () =>
    runtime.createVoxcpmProducerRequestPlanForProfile({
      beat,
      profileId: "science-explainer-young-male",
    }),
  /control/i,
);
const sciencePlan = runtime.createVoxcpmProducerRequestPlanForProfile({
  beat,
  profileId: "science-explainer-young-male",
  control: "冷静、清晰、自然解释，中速",
});
assert.equal(sciencePlan.mode, "controllable-clone");
assert.equal(
  sciencePlan.referenceAudioPath,
  "voices/clone/science-explainer-young-male.wav",
);
assert.equal(sciencePlan.control, "冷静、清晰、自然解释，中速");

const scienceHighFidelityPlan = runtime.createVoxcpmProducerRequestPlanForProfile({
  beat,
  profileId: "science-explainer-young-male",
  mode: "high-fidelity-clone",
});
assert.equal(scienceHighFidelityPlan.mode, "high-fidelity-clone");
assert.equal(
  scienceHighFidelityPlan.promptAudioPath,
  "voices/clone/science-explainer-young-male.wav",
);
assert.equal(
  scienceHighFidelityPlan.promptTranscriptPath,
  "voices/clone/science-explainer-young-male.txt",
);
assert.equal("control" in scienceHighFidelityPlan, false);
assert.throws(
  () =>
    runtime.createVoxcpmProducerRequestPlanForProfile({
      beat,
      profileId: "lyy",
      mode: "controllable-clone",
      control: "calm",
    }),
  /does not support/i,
);

const scaffoldGenerator = read("src/remotion/producer-samples/scaffold/SampleName/generate.mjs");
for (const forbidden of [
  "voices/clone/lyy.wav",
  "voices/clone/lyy.txt",
  "voices/clone/lyy-r.wav",
  "voices/clone/science-explainer-young-male.wav",
  "voices/clone/science-explainer-young-male.txt",
]) {
  assert(!scaffoldGenerator.includes(forbidden), `Future scaffold must not hard-code ${forbidden}.`);
}
assert(scaffoldGenerator.includes("createVoxcpmProducerRequestPlanForProfile"));

assert.equal(sampleNameManifest.narration.voiceProfileId, "lyy");
assert.doesNotThrow(() => assertProducerSampleManifest(sampleNameManifest));
assert.throws(
  () =>
    assertProducerSampleManifest({
      ...sampleNameManifest,
      narration: { ...sampleNameManifest.narration, voiceProfileId: "unknown-voice" },
    }),
  /voice profile/i,
);
assert.throws(
  () =>
    assertProducerSampleManifest({
      ...sampleNameManifest,
      narration: {
        ...sampleNameManifest.narration,
        mode: "voice-design",
        voiceProfileId: "lyy",
      },
    }),
  /voice-design.*voice profile|voice profile.*voice-design/i,
);
assert.throws(
  () =>
    assertProducerSampleManifest({
      ...sampleNameManifest,
      narration: {
        ...sampleNameManifest.narration,
        mode: "controllable-clone",
        voiceProfileId: "lyy",
      },
    }),
  /does not support/i,
);

console.log("Producer voice profile registry smoke passed.");
