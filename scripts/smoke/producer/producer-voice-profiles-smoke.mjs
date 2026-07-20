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

console.log("Producer voice profile registry smoke passed.");
