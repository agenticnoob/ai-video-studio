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
const registry = JSON.parse(read(registryPath));
const runtime = await import(pathToFileURL(runtimePath).href);

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

console.log("Producer voice profile registry smoke passed.");
