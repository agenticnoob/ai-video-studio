import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

/* global console, process */

const read = (file) => readFileSync(file, "utf8");
const packageJson = JSON.parse(read("package.json"));

for (const command of [
  "producer:scaffold",
  "producer:assets",
  "producer:preflight",
  "producer:render",
  "smoke:producer-os",
]) {
  assert(packageJson.scripts[command], `Missing Phase 4 command: ${command}`);
}

for (const file of [
  "scripts/producer-scaffold.mjs",
  "scripts/lib/producer-render.ts",
  "scripts/lib/producer-assets/index.ts",
  "scripts/render-producer-sample.mjs",
  "scripts/preflight-producer-assets.mjs",
  "src/remotion/producer-samples/scaffold/SampleName/manifest.ts",
  "src/remotion/producer-samples/scaffold/SampleName/cover.tsx",
  "src/remotion/producer-samples/scaffold/SampleName/render-metadata.json",
  "src/remotion/producer-samples/scaffold/SampleName/publishing.md",
  "src/remotion/producer-samples/scaffold/SampleName/assets.supply.json",
  "src/remotion/producer-samples/scaffold/SampleName/assets.manifest.json",
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
  3,
  "Phases 7 and 8 must register exactly three maintained proof samples.",
);
assert.deepEqual(
  maintainedProducerSampleManifests.map((manifest) => manifest.compositionId),
  ["AgentProducerMediaSoundProof", "TcpHandshakeEditorial", "TcpHandshakeTerminal"],
  "The maintained registry must contain the unchanged Phase 7 proof and the two Phase 8 proofs.",
);
assert(
  producerSampleManifests.every(
    (manifest) =>
      ["AgentProducerMediaSoundProof", "TcpHandshakeEditorial", "TcpHandshakeTerminal"].includes(
        manifest.compositionId,
      ) || manifest.sampleStatus === "frozen-reference",
  ),
  "Every finished sample outside the maintained proof set must remain a frozen reference.",
);
assert.doesNotThrow(() => assertProducerSampleManifest(sampleNameManifest));
assert.equal(
  sampleNameManifest.assets.manifestPath,
  "src/remotion/SampleName/assets.manifest.json",
);
assert.equal(sampleNameManifest.styleProfileId, "editorial-tech");

for (const [file, planner] of [
  ["scripts/render-producer-review-frames.mjs", "buildProducerReviewFrameJobs"],
  ["scripts/render-producer-sample.mjs", "buildProducerRenderJobs"],
]) {
  const source = read(file);
  const preflightIndex = source.indexOf("preflightProducerAssets");
  const plannerIndex = source.lastIndexOf(planner);
  assert(preflightIndex >= 0, `${file} must invoke Producer asset preflight.`);
  assert(
    preflightIndex < plannerIndex,
    `${file} must preflight maintained assets before planning render jobs.`,
  );
}

const renderJobs = buildProducerRenderJobs({ manifest: sampleNameManifest });
assert.deepEqual(
  renderJobs.map((job) => job.kind),
  ["video", "cover-16x9", "cover-9x16"],
);
const containerRenderJobs = buildProducerRenderJobs({
  execution: "producer-container",
  manifest: sampleNameManifest,
});
assert.deepEqual(
  containerRenderJobs.slice(1).map((job) => job.command),
  ["npx", "npx"],
  "Producer-container cover renders must not start nested Docker jobs.",
);
const renderVideoSource = read("scripts/render-video.sh");
assert(!renderVideoSource.includes("jq "), "Producer render must not depend on jq.");
assert(
  renderVideoSource.includes("/.dockerenv"),
  "Producer render must execute Remotion directly inside its container.",
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
      "--style-profile",
      "retro-terminal",
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
    "assets.supply.json",
    "assets.manifest.json",
  ]) {
    assert(existsSync(path.join(destination, filename)), `Scaffold output missing ${filename}.`);
  }
  const generatedManifest = read(path.join(destination, "manifest.ts"));
  const generatedVideo = read(path.join(destination, "PhaseFourFixture.tsx"));
  const generatedGenerator = read(path.join(destination, "generate.mjs"));
  const generatedAssetSupply = read(path.join(destination, "assets.supply.json"));
  const generatedAssetManifest = read(path.join(destination, "assets.manifest.json"));
  assert(generatedManifest.includes('compositionId: "PhaseFourFixture"'));
  assert(generatedManifest.includes('slug: "phase-four-fixture"'));
  assert(generatedManifest.includes('styleProfileId: "retro-terminal"'));
  assert(!generatedManifest.includes("STYLE_PROFILE_ID"));
  assert(generatedManifest.includes('from "../producer-samples/manifest"'));
  assert(generatedVideo.includes('from "../standalone-video"'));
  assert(generatedGenerator.includes('from "../../../scripts/lib/producer-audio/index.js"'));
  assert(generatedAssetSupply.includes('"compositionId": "PhaseFourFixture"'));
  assert(generatedAssetSupply.includes('"slug": "phase-four-fixture"'));
  assert(generatedAssetManifest.includes('"compositionId": "PhaseFourFixture"'));
  assert(!generatedManifest.includes("SampleName"));
} finally {
  rmSync(scaffoldRoot, { recursive: true, force: true });
}

console.log("Agent Producer OS smoke passed.");
