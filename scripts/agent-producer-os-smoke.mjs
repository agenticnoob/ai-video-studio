import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

/* global console, process */

const read = (file) => readFileSync(file, "utf8");
const packageJson = JSON.parse(read("package.json"));

for (const command of ["producer:scaffold", "producer:render", "smoke:producer-os"]) {
  assert(packageJson.scripts[command], `Missing Phase 4 command: ${command}`);
}

for (const file of [
  "scripts/producer-scaffold.mjs",
  "scripts/lib/producer-render.ts",
  "scripts/render-producer-sample.mjs",
  "src/remotion/producer-samples/scaffold/SampleName/manifest.ts",
  "src/remotion/producer-samples/scaffold/SampleName/cover.tsx",
  "src/remotion/producer-samples/scaffold/SampleName/render-metadata.json",
  "src/remotion/producer-samples/scaffold/SampleName/publishing.md",
]) {
  assert(existsSync(file), `Missing Phase 4 surface: ${file}`);
}

const currentSampleOsSource = [
  read("src/remotion/producer-samples/manifest.ts"),
  read("src/remotion/producer-samples/registry.ts"),
].join("\n");

for (const forbidden of ['"recipe"', '"template"', "productized", "productizationExposure"]) {
  assert(
    !currentSampleOsSource.includes(forbidden),
    `Producer Sample OS must remove ${forbidden}.`,
  );
}

const {
  assertProducerSampleManifest,
  maintainedProducerSampleManifests,
  producerSampleManifests,
  producerSamplePromotionTargets,
} = await import("../src/remotion/producer-samples/index.js");
const { sampleNameManifest } =
  await import("../src/remotion/producer-samples/scaffold/SampleName/manifest.js");
const { buildProducerRenderJobs } = await import("./lib/producer-render.js");

assert.deepEqual(
  [...producerSamplePromotionTargets],
  ["primitive", "block", "effect", "transition", "style-profile"],
);
assert.equal(
  maintainedProducerSampleManifests.length,
  0,
  "No unfinished future sample is registered.",
);
assert(
  producerSampleManifests.every((manifest) => manifest.sampleStatus === "frozen-reference"),
  "Every existing finished sample must be classified as a frozen reference.",
);
assert.doesNotThrow(() => assertProducerSampleManifest(sampleNameManifest));

const renderJobs = buildProducerRenderJobs({ manifest: sampleNameManifest });
assert.deepEqual(
  renderJobs.map((job) => job.kind),
  ["video", "cover-16x9", "cover-9x16"],
);
assert.deepEqual(
  renderJobs.flatMap((job) => job.outputPaths),
  [
    "out/sample-name/sample-name.mp4",
    "out/sample-name/sample-name.json",
    "out/sample-name/sample-name-cover-16x9.png",
    "out/sample-name/sample-name-cover-9x16.png",
  ],
);

const scaffoldRoot = mkdtempSync(path.join(os.tmpdir(), "producer-os-scaffold-"));
try {
  const outputRoot = path.join(scaffoldRoot, "src/remotion");
  execFileSync(
    process.execPath,
    [
      "scripts/producer-scaffold.mjs",
      "--name",
      "PhaseFourFixture",
      "--slug",
      "phase-four-fixture",
      "--output-root",
      outputRoot,
    ],
    { stdio: "pipe" },
  );
  const destination = path.join(outputRoot, "PhaseFourFixture");
  for (const filename of [
    "PhaseFourFixture.tsx",
    "manifest.ts",
    "cover.tsx",
    "validation.ts",
    "render-metadata.json",
    "publishing.md",
  ]) {
    assert(existsSync(path.join(destination, filename)), `Scaffold output missing ${filename}.`);
  }
  const generatedManifest = read(path.join(destination, "manifest.ts"));
  const generatedVideo = read(path.join(destination, "PhaseFourFixture.tsx"));
  const generatedGenerator = read(path.join(destination, "generate.mjs"));
  assert(generatedManifest.includes('compositionId: "PhaseFourFixture"'));
  assert(generatedManifest.includes('slug: "phase-four-fixture"'));
  assert(generatedManifest.includes('from "../producer-samples/manifest"'));
  assert(generatedVideo.includes('from "../standalone-video"'));
  assert(generatedGenerator.includes('from "../../../scripts/lib/producer-audio/index.js"'));
  assert(!generatedManifest.includes("SampleName"));
} finally {
  rmSync(scaffoldRoot, { recursive: true, force: true });
}

console.log("Agent Producer OS smoke passed.");
