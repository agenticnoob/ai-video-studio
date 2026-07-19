/* global console */
import assert from "node:assert/strict";
import { fixtureProducerManifest } from "../../fixtures/producer-tools/fixture-manifest.js";
import {
  buildProducerReviewFrameJobs,
  slugifyReviewFrameLabel,
} from "../../lib/producer-review-frames.js";

assert.equal(slugifyReviewFrameLabel("GPT-5.6 / Model Tiers"), "gpt-5-6-model-tiers");
const jobs = buildProducerReviewFrameJobs({ manifest: fixtureProducerManifest });
assert.deepEqual(jobs.map((job) => job.outputPath), [
  "out/fixture-producer-video/review-frames/frame-00045-opening-thesis.png",
  "out/fixture-producer-video/review-frames/frame-00620-model-tiers.png",
]);
assert.throws(
  () => buildProducerReviewFrameJobs({ manifest: { ...fixtureProducerManifest, reviewFrames: [] } }),
  /at least one review frame/i,
);
assert.throws(
  () => buildProducerReviewFrameJobs({ manifest: { ...fixtureProducerManifest, reviewFrames: [{ frame: -1, label: "bad", purpose: "bad" }] } }),
  /negative/i,
);
assert.throws(
  () => buildProducerReviewFrameJobs({ manifest: { ...fixtureProducerManifest, reviewFrames: [{ frame: 45, label: "same", purpose: "one" }, { frame: 45, label: "same", purpose: "two" }] } }),
  /duplicate/i,
);

console.log("Producer review frames smoke passed.");
