#!/usr/bin/env node

import assert from "node:assert/strict";
import console from "node:console";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const read = (relativePath) => readFileSync(path.join(root, relativePath), "utf8");

const requiredFiles = [
  "src/remotion/DnsResolutionExplainer/manifest.ts",
  "src/remotion/DnsResolutionExplainer/quality.ts",
  "src/remotion/DnsResolutionExplainer/DnsResolutionExplainer.tsx",
  "src/remotion/DnsResolutionExplainer/soundtrack.tsx",
  "src/remotion/DnsResolutionExplainer/cover.tsx",
  "src/remotion/DnsResolutionExplainer/validation.ts",
  "src/remotion/DnsResolutionExplainer/assets.manifest.json",
  "src/remotion/DnsResolutionExplainer/render-metadata.json",
  "src/remotion/DnsResolutionExplainer/publishing.md",
  "scripts/fixtures/producer-final-acceptance/create-assets.sh",
  "scripts/fixtures/producer-final-acceptance/dns-resolution-map.svg",
];

for (const relativePath of requiredFiles) {
  assert(
    existsSync(path.join(root, relativePath)),
    `Missing Phase 9B final acceptance surface: ${relativePath}`,
  );
}

const packageJson = JSON.parse(read("package.json"));
assert(packageJson.scripts["producer:quality"], "Phase 9B must retain producer:quality");
assert(
  packageJson.scripts["producer:final-acceptance-assets"],
  "Phase 9B must expose its deterministic local asset command",
);
assert(
  packageJson.scripts["smoke:producer-final-acceptance"],
  "Phase 9B must expose its focused smoke",
);

const manifest = read("src/remotion/DnsResolutionExplainer/manifest.ts");
for (const token of [
  "QualityGatedMaintainedProducerSampleManifest",
  'styleProfileId: "hand-drawn-explainer"',
  'qualityModule: "src/remotion/DnsResolutionExplainer/quality.ts"',
  'cover16x9CompositionId: "DnsResolutionExplainerCover16x9"',
  'cover9x16CompositionId: "DnsResolutionExplainerCover9x16"',
]) {
  assert(manifest.includes(token), `Final acceptance manifest must include ${token}`);
}

const renderer = read("src/remotion/DnsResolutionExplainer/DnsResolutionExplainer.tsx");
const data = read("src/remotion/DnsResolutionExplainer/data.ts");
for (const token of [
  "backgroundImage",
  "radial-gradient",
  "repeating-linear-gradient",
  "opacity: 0.72 + reveal * 0.28",
  "getProducerTransitionPreset",
  'id: "directional-slide"',
  "TransitionSeries",
  "staticFile",
  "dns-resolution-map.svg",
]) {
  assert(
    `${renderer}\n${data}`.includes(token),
    `Final acceptance renderer call chain must include ${token}`,
  );
}

const soundtrack = read("src/remotion/DnsResolutionExplainer/soundtrack.tsx");
for (const token of ["ProducerSoundtrack", "bgm", "ambience", "sfx", "narrationWindows"]) {
  assert(soundtrack.includes(token), `Final acceptance soundtrack must include ${token}`);
}
assert(
  (soundtrack.match(/durationInFrames:/g) ?? []).length >= 3,
  "Final acceptance soundtrack must declare at least three intentional SFX durations",
);

const quality = read("src/remotion/DnsResolutionExplainer/quality.ts");
for (const token of [
  "ProducerQualityPlan",
  "textLayouts",
  "visibleElements",
  'status: "resolved-asset"',
  "reviewFrames",
  "expectedDurationInFrames",
]) {
  assert(quality.includes(token), `Final acceptance quality plan must include ${token}`);
}

const registry = read("src/remotion/producer-samples/registry.ts");
assert(
  registry.includes("dnsResolutionExplainerManifest"),
  "Final acceptance manifest must be in the Producer registry",
);

const rootSource = read("src/remotion/Root.tsx");
for (const token of [
  "DNS_RESOLUTION_EXPLAINER_COMPOSITION_ID",
  "DnsResolutionExplainerCover16x9",
  "DnsResolutionExplainerCover9x16",
]) {
  assert(rootSource.includes(token), `Remotion Root must register ${token}`);
}

const inventory = JSON.parse(read("docs/architecture/agent-producer-only-removal-inventory.json"));
assert(inventory.completedPhases.includes(9), "Removal inventory must mark Phase 9 complete");
assert(
  inventory.completedPhaseSlices.some(
    (entry) =>
      entry.phase === 9 &&
      entry.slice === "final-acceptance-closure" &&
      entry.status === "complete",
  ),
  "Removal inventory must record the Phase 9B closure slice",
);

for (const [relativePath, required] of [
  ["AGENTS.md", "Phase 9 is complete"],
  ["README.md", "Roadmap is complete"],
  ["docs/FINAL_PRODUCT_GOAL.md", "Phase 9 is complete"],
  ["docs/ITERATION_STATUS.md", "Roadmap is complete"],
  ["docs/AGENT_PRODUCER_ONLY_ROADMAP.md", "Status: complete"],
  [".agents/skills/ai-video-studio-agent-producer/SKILL.md", "Phase 9 is complete"],
  [".agents/skills/remotion-best-practices/SKILL.md", "Phase 9 is complete"],
]) {
  assert(read(relativePath).includes(required), `${relativePath} must include ${required}`);
}

const newRuntimeSource = [renderer, soundtrack, quality, manifest].join("\n");
for (const [label, pattern] of [
  ["remote URL", /https?:\/\//iu],
  ["CSS animation", /animation(?:Name)?\s*:/u],
  ["CSS transition", /transition\s*:/u],
  ["timer", /set(?:Timeout|Interval)\s*\(/u],
  ["wall clock", /Date\.now\s*\(/u],
  ["random state", /Math\.random\s*\(/u],
  ["visual generation", /(?:image|video)[-_ ]generation|ComfyUI/iu],
  ["removed Web route", /\/api\/(?:generate|render|progress|tts)/u],
  ["removed F5 runtime", /F5_TTS_|f5-tts/iu],
]) {
  assert(!pattern.test(newRuntimeSource), `Final acceptance source contains forbidden ${label}`);
}

console.log("Producer final acceptance smoke passed.");
