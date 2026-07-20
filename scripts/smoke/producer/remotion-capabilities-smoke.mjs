/* global console */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const read = (relativePath) => readFileSync(path.join(root, relativePath), "utf8");
const compiledRoot = process.env.REMOTION_CAPABILITIES_BUILD_DIR;
assert(compiledRoot, "REMOTION_CAPABILITIES_BUILD_DIR must point to compiled transition modules");
const require = createRequire(import.meta.url);
const { getProducerTransitionSeriesDuration } = require(
  path.join(compiledRoot, "src/remotion/transitions/duration.js"),
);
const { REMOTION_CAPABILITY_SHOWCASE_DURATION_IN_FRAMES } = require(
  path.join(compiledRoot, "src/remotion/capability-showcase/durations.js"),
);
const packageJson = JSON.parse(read("package.json"));
const inventory = JSON.parse(read("docs/architecture/agent-producer-only-removal-inventory.json"));
const allDirectDependencies = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
};

for (const name of [
  "@remotion/effects",
  "@remotion/layout-utils",
  "@remotion/transitions",
  "@remotion/light-leaks",
]) {
  assert.equal(allDirectDependencies[name], "4.0.489", `${name} must be exact 4.0.489`);
}
for (const relativePath of [
  "src/remotion/effects/presets.ts",
  "src/remotion/effects/index.ts",
  "src/remotion/styles/fit-text.ts",
  "src/remotion/styles/profiles.ts",
  "src/remotion/styles/index.ts",
  "src/remotion/capability-showcase/RemotionCapabilityShowcase.tsx",
  "src/remotion/capability-showcase/StyleProfileShowcase.tsx",
  "src/remotion/capability-showcase/durations.ts",
  "src/remotion/capability-showcase/index.ts",
  "src/remotion/transitions/presets.ts",
  "src/remotion/transitions/duration.ts",
  "src/remotion/transitions/index.ts",
  "scripts/fixtures/remotion-capabilities/create-video-fixture.sh",
]) {
  assert(
    existsSync(path.join(root, relativePath)),
    `Missing Remotion capability surface: ${relativePath}`,
  );
}

const transitionSource = read("src/remotion/transitions/presets.ts");
for (const token of [
  "editorial-fade",
  "directional-slide",
  "signal-wipe",
  "cinematic-film-burn",
  "linearTiming",
  "filmBurn",
]) {
  assert(transitionSource.includes(token), `Missing transition contract token: ${token}`);
}
assert.equal(
  getProducerTransitionSeriesDuration({
    sceneDurations: [60, 60, 60],
    transitions: [
      { id: "editorial-fade", durationInFrames: 15 },
      { id: "signal-wipe", durationInFrames: 20 },
    ],
    fps: 30,
  }),
  145,
);
assert.throws(
  () => getProducerTransitionSeriesDuration({ sceneDurations: [], transitions: [], fps: 30 }),
  /sceneDurations must not be empty/u,
);
assert.throws(
  () =>
    getProducerTransitionSeriesDuration({
      sceneDurations: [60, 60],
      transitions: [],
      fps: 30,
    }),
  /exactly one entry/u,
);
assert.throws(
  () =>
    getProducerTransitionSeriesDuration({
      sceneDurations: [60, 0],
      transitions: [{ id: "editorial-fade", durationInFrames: 15 }],
      fps: 30,
    }),
  /positive integer/u,
);
assert.throws(
  () =>
    getProducerTransitionSeriesDuration({
      sceneDurations: [60, 60],
      transitions: [{ id: "editorial-fade", durationInFrames: 0 }],
      fps: 30,
    }),
  /positive integer/u,
);

const effects = read("src/remotion/effects/presets.ts");
assert(
  effects.includes("getProducerMediaEffectPreset"),
  "Canvas source proofs require a source-preserving Producer effect helper",
);
for (const id of ["comic-print", "cyber-scan", "paper-grain", "pixel-grid"]) {
  assert(effects.includes(id), `Missing Producer effect preset: ${id}`);
}
for (const required of [
  "checkerboard",
  "halftone",
  "roughenEdges",
  "scanlines",
  "paper",
  "pixelate",
  "interpolate",
]) {
  assert(effects.includes(required), `Effect presets must use ${required}`);
}

const fitText = read("src/remotion/styles/fit-text.ts");
for (const required of ["fitTextOnNLines", "maxBoxHeight", "lineHeightPx", "Noto Sans CJK SC"]) {
  assert(fitText.includes(required), `Text fit helper must include ${required}`);
}

const rootSource = read("src/remotion/Root.tsx");
assert(rootSource.includes("Folder"), "Root must group the capability showcase");
assert(rootSource.includes('Folder name="Agent-Producer-Inventory"'));
assert(rootSource.includes("REMOTION_CAPABILITY_SHOWCASE_COMPOSITION_ID"));
assert(
  read("src/remotion/capability-showcase/index.ts").includes('"AgentProducerCapabilityShowcase"'),
);
const showcaseSource = read("src/remotion/capability-showcase/RemotionCapabilityShowcase.tsx");
for (const token of [
  "TransitionSeries",
  "LightLeak",
  "HtmlInCanvas",
  "CanvasImage",
  "OffthreadVideo",
  "getProducerMediaEffectPreset",
  "cinematic-film-burn",
]) {
  assert(showcaseSource.includes(token), `Missing showcase capability token: ${token}`);
}
assert(
  read("src/remotion/capability-showcase/durations.ts").includes(
    "getProducerTransitionSeriesDuration",
  ),
  "Showcase duration must use official transition duration accounting",
);
assert.equal(
  REMOTION_CAPABILITY_SHOWCASE_DURATION_IN_FRAMES,
  1150,
  "Capability showcase must register the exact 1150-frame Phase 8A duration",
);
assert(
  read("remotion.config.ts").includes('Config.setChromiumOpenGlRenderer("swangle")'),
  "Remotion config must enable the documented no-GPU swangle renderer",
);
assert(
  read("remotion.config.ts").includes("Config.setAllowHtmlInCanvasEnabled(true)"),
  "Remotion config must explicitly enable HTML-in-canvas rendering",
);

assert(
  inventory.completedPhaseSlices.some(
    (entry) =>
      entry.phase === 6 &&
      entry.slice === "effects-text-layout-foundation" &&
      entry.status === "complete",
  ),
  "Inventory must record the completed Phase 6A slice",
);
assert(inventory.completedPhases.includes(6), "Inventory must mark Phase 6 complete");
assert(
  inventory.completedPhaseSlices.some(
    (entry) =>
      entry.phase === 6 && entry.slice === "transitions-showcase" && entry.status === "complete",
  ),
  "Inventory must record the completed Phase 6B slice",
);

const iterationStatus = read("docs/ITERATION_STATUS.md");
assert(iterationStatus.includes("Phase 6A effects and text-layout foundation is complete."));
assert(iterationStatus.includes("Phase 6 Remotion capability core is complete."));
assert(iterationStatus.includes("Phase 7 dynamic existing media and sound design is complete."));
assert(iterationStatus.includes("Phase 8A style-profile contract and showcase is complete."));
assert(iterationStatus.includes("Phase 8 is complete."));
assert(iterationStatus.includes("Phase 9A deterministic quality gates are complete."));
assert(iterationStatus.includes("Phase 9B final acceptance video"));

const producerRemotionReference = read(
  ".agents/skills/ai-video-studio-agent-producer/references/remotion-composition.md",
);
for (const required of [
  "getProducerEffectPreset",
  "getProducerMediaEffectPreset",
  "fitProducerText",
  "getProducerTransitionPreset",
  "getProducerTransitionSeriesDuration",
  "cinematic-film-burn",
  "Config.setAllowHtmlInCanvasEnabled(true)",
  "AgentProducerCapabilityShowcase",
  "npm run smoke:remotion-capabilities",
  "getProducerStyleProfile",
  "npm run smoke:producer-style-profiles",
]) {
  assert(
    producerRemotionReference.includes(required),
    `Agent Producer Remotion reference must include ${required}`,
  );
}

const capabilitySource = [
  effects,
  fitText,
  read("src/remotion/capability-showcase/RemotionCapabilityShowcase.tsx"),
  read("src/remotion/capability-showcase/StyleProfileShowcase.tsx"),
].join("\n");
for (const [label, pattern] of [
  ["remote URL", /https?:\/\//i],
  ["CSS animation", /animation(?:Name)?\s*:/],
  ["CSS transition", /transition\s*:/],
  ["image generation", /image[_ -]?generat/i],
  ["video generation", /video[_ -]?generat/i],
  ["provider runtime", /VoxCPM|f5-tts|TTS_PROVIDER/],
  ["planner/template runtime", /VideoProject|StoryboardPlan|selected-template/],
]) {
  assert(!pattern.test(capabilitySource), `Phase 6 source must not contain ${label}`);
}

console.log("Remotion capability smoke passed.");
