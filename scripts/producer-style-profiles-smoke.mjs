/* global console */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";
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
  "src/remotion/styles/profiles.ts",
  "src/remotion/capability-showcase/StyleProfileShowcase.tsx",
]) {
  assert(existsSync(path.join(root, relativePath)), `Missing Phase 8A surface: ${relativePath}`);
}

const profileSource = read("src/remotion/styles/profiles.ts");
const showcaseSource = read("src/remotion/capability-showcase/StyleProfileShowcase.tsx");
const durationSource = read("src/remotion/capability-showcase/durations.ts");
const capabilitySource = read("src/remotion/capability-showcase/RemotionCapabilityShowcase.tsx");

for (const id of requiredProfileIds) {
  assert(profileSource.includes(id), `Missing style profile: ${id}`);
}
for (const token of [
  "palette",
  "typography",
  "background",
  "layout",
  "approvedPrimitives",
  "approvedBlocks",
  "effect",
  "transition",
  "motion",
  "mediaMix",
  "three",
  "captions",
  "sound",
  "forbiddenDefaults",
  "getProducerStyleProfile",
  "assertProducerStyleProfiles",
]) {
  assert(profileSource.includes(token), `Missing style-profile contract token: ${token}`);
}
for (const token of [
  "ThreeCanvas",
  "useCurrentFrame",
  "interpolate",
  "EditorialTechFixture",
  "ComicAnimeFixture",
  "Cinematic3dFixture",
  "RetroTerminalFixture",
  "DocumentaryMediaFixture",
  "HandDrawnExplainerFixture",
]) {
  assert(showcaseSource.includes(token), `Missing style showcase token: ${token}`);
}
assert(
  durationSource.includes("STYLE_PROFILE_SHOWCASE_DURATION_IN_FRAMES"),
  "Capability duration must include the Phase 8A style-profile pages.",
);
assert(
  capabilitySource.includes("<StyleProfileShowcase />"),
  "Capability showcase must append the style-profile sub-showcase.",
);

for (const forbidden of [
  "http://",
  "https://",
  "Date.now",
  "Math.random",
  "setTimeout",
  "setInterval",
  "VideoProject",
  "StoryboardPlan",
  "ComfyUI",
  "image_generate",
  "video_generate",
]) {
  assert(
    !showcaseSource.includes(forbidden),
    `Style showcase contains forbidden token: ${forbidden}`,
  );
}
assert(
  !/(?:animation|transition)(?:Name|Duration|TimingFunction)?\s*:/u.test(showcaseSource),
  "Style showcase must not use CSS animation or transition properties.",
);

const inventory = JSON.parse(read("docs/architecture/agent-producer-only-removal-inventory.json"));
assert(
  inventory.completedPhaseSlices.some(
    (entry) => entry.phase === 8 && entry.slice === "style-profile-contract-showcase",
  ),
  "Removal inventory must record the completed Phase 8A slice.",
);
assert(
  !inventory.completedPhases.includes(8),
  "Phase 8 must remain incomplete until the real-composition proof is complete.",
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
  assert(source.includes("Phase 8A"), `${docPath} must describe the Phase 8A boundary.`);
  assert(source.includes("Phase 8B"), `${docPath} must keep Phase 8B explicit and unstarted.`);
}

const compiledRoot = process.env.PRODUCER_STYLE_PROFILES_BUILD_DIR;
if (compiledRoot) {
  const require = createRequire(import.meta.url);
  const profiles = require(path.join(compiledRoot, "src/remotion/styles/profiles.js"));
  const durations = require(
    path.join(compiledRoot, "src/remotion/capability-showcase/durations.js"),
  );

  assert.deepEqual(
    profiles.producerStyleProfileIds,
    requiredProfileIds,
    "Style-profile ids must match the Roadmap order.",
  );
  profiles.assertProducerStyleProfiles(profiles.producerStyleProfiles);
  assert.throws(
    () => profiles.getProducerStyleProfile("unknown-profile"),
    /Unknown Producer style profile/u,
  );
  assert.equal(
    profiles.getProducerStyleProfile("editorial-tech").layout.grammar,
    "asymmetric-editorial",
  );
  assert.equal(
    new Set(profiles.producerStyleProfiles.map((profile) => profile.layout.grammar)).size,
    6,
  );
  assert.equal(
    new Set(profiles.producerStyleProfiles.map((profile) => profile.sound.signature)).size,
    6,
  );
  assert(
    new Set(
      profiles.producerStyleProfiles.map(
        (profile) => `${profile.effect.id}/${profile.transitionPreset.id}/${profile.motion.id}`,
      ),
    ).size >= 4,
    "Style profiles need at least four distinct effect/transition/motion combinations.",
  );
  assert.equal(durations.STYLE_PROFILE_SHOWCASE_DURATION_IN_FRAMES, 540);
  assert.equal(durations.REMOTION_CAPABILITY_SHOWCASE_DURATION_IN_FRAMES, 1150);
}

console.warn("Producer style profiles smoke passed.");
