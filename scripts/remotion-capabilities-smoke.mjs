/* global console */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(path.join(root, relativePath), "utf8");
const packageJson = JSON.parse(read("package.json"));
const inventory = JSON.parse(read("docs/architecture/agent-producer-only-removal-inventory.json"));
const allDirectDependencies = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
};

for (const name of ["@remotion/effects", "@remotion/layout-utils"]) {
  assert.equal(allDirectDependencies[name], "4.0.489", `${name} must be exact 4.0.489`);
}
for (const relativePath of [
  "src/remotion/effects/presets.ts",
  "src/remotion/effects/index.ts",
  "src/remotion/styles/fit-text.ts",
  "src/remotion/styles/index.ts",
  "src/remotion/capability-showcase/RemotionCapabilityShowcase.tsx",
  "src/remotion/capability-showcase/index.ts",
]) {
  assert(existsSync(path.join(root, relativePath)), `Missing Phase 6A surface: ${relativePath}`);
}
assert(!("@remotion/transitions" in allDirectDependencies));
assert(!("@remotion/light-leaks" in allDirectDependencies));
assert(!existsSync(path.join(root, "src/remotion/transitions")));

const effects = read("src/remotion/effects/presets.ts");
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
assert(
  read("remotion.config.ts").includes('Config.setChromiumOpenGlRenderer("swangle")'),
  "Remotion config must enable the documented no-GPU swangle renderer",
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

const iterationStatus = read("docs/ITERATION_STATUS.md");
assert(iterationStatus.includes("Phase 6A effects and text-layout foundation is complete."));
assert(iterationStatus.includes("Phase 6 overall remains incomplete."));
assert(
  iterationStatus.includes(
    "Phase 6B transitions and remaining showcase coverage have not started.",
  ),
);

const producerSkill = read(".agents/skills/ai-video-studio-agent-producer/SKILL.md");
for (const required of [
  "getProducerEffectPreset",
  "fitProducerText",
  "AgentProducerCapabilityShowcase",
  "npm run smoke:remotion-capabilities",
]) {
  assert(producerSkill.includes(required), `Agent Producer skill must include ${required}`);
}

const capabilitySource = [
  effects,
  fitText,
  read("src/remotion/capability-showcase/RemotionCapabilityShowcase.tsx"),
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
  assert(!pattern.test(capabilitySource), `Phase 6A source must not contain ${label}`);
}

console.log("Remotion capability smoke passed.");
