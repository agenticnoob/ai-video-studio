/* global console, process */
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(path.join(root, relativePath), "utf8");
const requiredProfileIds = [
  "editorial-tech",
  "comic-anime",
  "cinematic-3d",
  "retro-terminal",
  "documentary-media",
  "hand-drawn-explainer",
];

for (const relativePath of [
  "src/remotion/styles/profile-ids.ts",
  "src/remotion/producer-samples/scaffold/SampleName/manifest.ts",
]) {
  assert(
    existsSync(path.join(root, relativePath)),
    `Missing Phase 8B contract surface: ${relativePath}`,
  );
}

const profileIdSource = read("src/remotion/styles/profile-ids.ts");
const profileSource = read("src/remotion/styles/profiles.ts");
const manifestSource = read("src/remotion/producer-samples/manifest.ts");
const scaffoldSource = read("scripts/producer-scaffold.mjs");
const scaffoldManifestSource = read(
  "src/remotion/producer-samples/scaffold/SampleName/manifest.ts",
);
const phaseSevenManifestSource = read("src/remotion/AgentProducerMediaSoundProof/manifest.ts");
const packageJson = JSON.parse(read("package.json"));

for (const id of requiredProfileIds) {
  assert(profileIdSource.includes(id), `Missing canonical style-profile id: ${id}`);
  assert(scaffoldSource.includes(id), `Scaffold CLI must accept style-profile id: ${id}`);
}
const scaffoldProfileIdBlock = scaffoldSource.match(/const styleProfileIds = \[([\s\S]*?)\];/u);
assert(scaffoldProfileIdBlock, "Scaffold CLI must expose its exact style-profile id list.");
assert.deepEqual(
  [...scaffoldProfileIdBlock[1].matchAll(/"([^"]+)"/gu)].map((match) => match[1]),
  requiredProfileIds,
  "Scaffold CLI profile ids must exactly match the canonical Roadmap order.",
);
for (const token of [
  "producerStyleProfileIds",
  "ProducerStyleProfileId",
  "isProducerStyleProfileId",
]) {
  assert(profileIdSource.includes(token), `Missing canonical profile-id token: ${token}`);
}
assert(profileSource.includes('from "./profile-ids"'), "Profile registry must use canonical ids.");
assert(
  manifestSource.includes("ProfiledMaintainedProducerSampleManifest") &&
    manifestSource.includes("styleProfileId"),
  "Maintained sample contract must expose the strict profiled subtype.",
);
assert(
  scaffoldSource.includes('valueFor("--style-profile")'),
  "Scaffold must read --style-profile.",
);
assert(
  scaffoldSource.includes("STYLE_PROFILE_ID"),
  "Scaffold must replace the style-profile token.",
);
assert(
  scaffoldManifestSource.includes("QualityGatedMaintainedProducerSampleManifest") &&
    scaffoldManifestSource.includes('styleProfileId: "editorial-tech" /* STYLE_PROFILE_ID */') &&
    scaffoldManifestSource.includes('qualityModule: "src/remotion/SampleName/quality.ts"'),
  "Scaffold manifest must require tokenized profile and quality-gate ownership.",
);
assert(
  !phaseSevenManifestSource.includes("styleProfileId"),
  "The completed Phase 7 proof must not be retrofitted with a style profile.",
);
assert(
  packageJson.scripts["smoke:producer-style-profile-sample-contract"],
  "Missing focused Phase 8B sample-contract command.",
);

const inventory = JSON.parse(read("docs/architecture/agent-producer-only-removal-inventory.json"));
assert(
  inventory.completedPhaseSlices.some(
    (entry) => entry.phase === 8 && entry.slice === "style-profile-sample-contract",
  ),
  "Removal inventory must record the completed Phase 8B sample-contract slice.",
);
assert(
  inventory.completedPhases.includes(8),
  "Phase 8 must be complete after two real compositions pass production gates.",
);

for (const docPath of [
  "AGENTS.md",
  "README.md",
  "docs/FINAL_PRODUCT_GOAL.md",
  "docs/ITERATION_STATUS.md",
  "docs/AGENT_PRODUCER_ONLY_ROADMAP.md",
  "docs/REMOTION_COMPONENT_LIBRARY.md",
  ".agents/skills/ai-video-studio-agent-producer/SKILL.md",
  ".agents/skills/remotion-best-practices/SKILL.md",
]) {
  const source = read(docPath);
  assert(
    source.includes("Phase 8B style-profile sample contract is complete."),
    `${docPath} must describe the completed Phase 8B contract slice.`,
  );
  assert(source.includes("Phase 8 is complete."), `${docPath} must mark Phase 8 complete.`);
  assert(source.includes("Phase 9A"), `${docPath} must describe the Phase 9A boundary.`);
  assert(source.includes("Phase 9B"), `${docPath} must keep Phase 9B unstarted.`);
}

const scaffoldRoot = mkdtempSync(path.join(os.tmpdir(), "producer-profile-contract-"));
try {
  const outputRoot = path.join(scaffoldRoot, "src/remotion");
  execFileSync(
    process.execPath,
    [
      "scripts/producer-scaffold.mjs",
      "--name",
      "ProfileContractFixture",
      "--slug",
      "profile-contract-fixture",
      "--style-profile",
      "retro-terminal",
      "--output-root",
      outputRoot,
    ],
    { cwd: root, stdio: "pipe" },
  );
  const generatedManifest = readFileSync(
    path.join(outputRoot, "ProfileContractFixture/manifest.ts"),
    "utf8",
  );
  assert(
    generatedManifest.includes('styleProfileId: "retro-terminal"'),
    "Generated scaffold must contain the selected profile id.",
  );

  const missingProfile = spawnSync(
    process.execPath,
    [
      "scripts/producer-scaffold.mjs",
      "--name",
      "MissingProfileFixture",
      "--slug",
      "missing-profile-fixture",
      "--output-root",
      outputRoot,
    ],
    { cwd: root, encoding: "utf8" },
  );
  assert.notEqual(missingProfile.status, 0, "Scaffold without --style-profile must fail.");
  assert.match(missingProfile.stderr, /--style-profile/u);

  const invalidProfile = spawnSync(
    process.execPath,
    [
      "scripts/producer-scaffold.mjs",
      "--name",
      "InvalidProfileFixture",
      "--slug",
      "invalid-profile-fixture",
      "--style-profile",
      "unknown-profile",
      "--output-root",
      outputRoot,
    ],
    { cwd: root, encoding: "utf8" },
  );
  assert.notEqual(invalidProfile.status, 0, "Unsupported --style-profile must fail.");
  assert.match(invalidProfile.stderr, /must be one of/u);
} finally {
  rmSync(scaffoldRoot, { recursive: true, force: true });
}

const compiledRoot = process.env.PRODUCER_STYLE_PROFILE_SAMPLE_CONTRACT_BUILD_DIR;
if (compiledRoot) {
  const require = createRequire(import.meta.url);
  const profileIds = require(path.join(compiledRoot, "src/remotion/styles/profile-ids.js"));
  const sampleManifest = require(
    path.join(compiledRoot, "src/remotion/producer-samples/manifest.js"),
  );
  assert.deepEqual(profileIds.producerStyleProfileIds, requiredProfileIds);
  for (const id of requiredProfileIds) assert(profileIds.isProducerStyleProfileId(id));
  assert.equal(profileIds.isProducerStyleProfileId("unknown-profile"), false);

  const maintainedFixture = {
    sampleStatus: "maintained",
    compositionId: "ProfiledFixture",
    sampleName: "ProfiledFixture",
    slug: "profiled-fixture",
    contentFamily: "tutorial",
    canvasProfile: "landscape-16x9",
    localArtifactRoot: "public/generated/profiled-fixture/",
    ttsStatus: "planned",
    styleProfileId: "editorial-tech",
    productionBrief: {
      audience: "Producer maintainers",
      publishingSurface: "Local review",
      durationTargetSeconds: 10,
    },
    narration: {
      required: true,
      provider: "voxcpm",
      mode: "voice-design",
      scriptPath: "fixtures/script.ts",
      audioMetadataPath: "fixtures/audio.generated.ts",
    },
    assets: { manifestPath: "fixtures/assets.manifest.json" },
    validationModule: "fixtures/validation.ts",
    render: {
      metadataPath: "fixtures/render-metadata.json",
      cover16x9CompositionId: "ProfiledFixtureCover16x9",
      cover9x16CompositionId: "ProfiledFixtureCover9x16",
    },
    publishingCopyPath: "fixtures/publishing.md",
    reviewFrames: [{ frame: 15, label: "opening", purpose: "Check the opening." }],
    sourceFiles: [
      { path: "fixtures/script.ts", kind: "script" },
      { path: "fixtures/audio.generated.ts", kind: "audio-metadata" },
      { path: "fixtures/manifest.ts", kind: "manifest" },
      { path: "fixtures/assets.manifest.json", kind: "asset-manifest" },
      { path: "fixtures/validation.ts", kind: "validation" },
      { path: "fixtures/cover.tsx", kind: "cover" },
      { path: "fixtures/render-metadata.json", kind: "render-metadata" },
      { path: "fixtures/publishing.md", kind: "publishing-copy" },
      { path: "src/remotion/Root.tsx", kind: "root-registration" },
    ],
    promotionCandidates: [],
    notes: [],
  };

  assert.doesNotThrow(() => sampleManifest.assertProducerSampleManifest(maintainedFixture));
  assert.throws(
    () =>
      sampleManifest.assertProducerSampleManifest({
        ...maintainedFixture,
        styleProfileId: "unknown-profile",
      }),
    /style profile/i,
  );
  const legacyMaintainedFixture = { ...maintainedFixture };
  delete legacyMaintainedFixture.styleProfileId;
  assert.doesNotThrow(() => sampleManifest.assertProducerSampleManifest(legacyMaintainedFixture));
}

console.warn("Producer style-profile sample contract smoke passed.");
