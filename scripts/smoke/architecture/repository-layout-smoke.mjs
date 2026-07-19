/* global console, process */

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const absolute = (relativePath) => path.join(root, relativePath);
const read = (relativePath) => readFileSync(absolute(relativePath), "utf8");
const trackedPaths = (pathspec) =>
  execFileSync("git", ["ls-files", "--", pathspec], { cwd: root, encoding: "utf8" })
    .trim()
    .split("\n")
    .filter(Boolean);

const removedTrackedPaths = [
  "vercel.json",
  "public/product-ui-upload-smoke.png",
  "src/remotion/MyComp",
  "types/constants.ts",
  "types/schema.ts",
];
for (const relativePath of removedTrackedPaths) {
  assert.equal(
    trackedPaths(relativePath).length,
    0,
    `Repository remnant must have no tracked files: ${relativePath}`,
  );
}

const requiredTrackedPaths = [
  "docs/DESIGN_SYSTEM.md",
  "postcss.config.mjs",
  "styles/global.css",
  "src/remotion/webpack-override.mjs",
  "public/fixtures/phase5-ui-screenshot.svg",
];
for (const relativePath of requiredTrackedPaths) {
  assert.equal(trackedPaths(relativePath).length, 1, `Required tracked path: ${relativePath}`);
  assert(existsSync(absolute(relativePath)), `Required filesystem path: ${relativePath}`);
}

for (const docPath of ["README.md", "AGENTS.md"]) {
  assert(read(docPath).includes("docs/DESIGN_SYSTEM.md"), `${docPath} must link the design system.`);
}
assert(
  read("docs/DESIGN_SYSTEM.md").startsWith("# AI Video Studio Design System"),
  "Design system must retain its title after relocation.",
);

const packageJson = JSON.parse(read("package.json"));
assert.equal(
  packageJson.scripts?.["smoke:repository-layout"],
  "node scripts/smoke/architecture/repository-layout-smoke.mjs",
  "Repository layout smoke command must remain stable.",
);
for (const dependency of ["tailwindcss", "postcss", "@tailwindcss/postcss"]) {
  assert(
    packageJson.dependencies?.[dependency] || packageJson.devDependencies?.[dependency],
    `Required styling dependency: ${dependency}`,
  );
}
assert.equal(
  packageJson.dependencies?.["@remotion/tailwind-v4"],
  "4.0.489",
  "@remotion/tailwind-v4 must remain in the exact Remotion closure.",
);

const groupedSmokePaths = [
  "scripts/smoke/architecture/agent-producer-architecture-smoke.mjs",
  "scripts/smoke/architecture/agent-producer-web-removal-smoke.mjs",
  "scripts/smoke/architecture/remotion-version-gate-smoke.mjs",
  "scripts/smoke/architecture/repository-layout-smoke.mjs",
  "scripts/smoke/architecture/skill-alignment-smoke.mjs",
  "scripts/smoke/producer/agent-producer-os-smoke.mjs",
  "scripts/smoke/producer/evidence-lens-smoke.mjs",
  "scripts/smoke/producer/producer-asset-library-smoke.mjs",
  "scripts/smoke/producer/producer-assets-smoke.mjs",
  "scripts/smoke/producer/producer-audio-direct-voxcpm-smoke.mjs",
  "scripts/smoke/producer/producer-audio-tools-smoke.mjs",
  "scripts/smoke/producer/producer-final-acceptance-smoke.mjs",
  "scripts/smoke/producer/producer-media-sound-smoke.mjs",
  "scripts/smoke/producer/producer-promotion-gate-smoke.mjs",
  "scripts/smoke/producer/producer-quality-gates-smoke.mjs",
  "scripts/smoke/producer/producer-review-frames-smoke.mjs",
  "scripts/smoke/producer/producer-sample-manifest-smoke.mjs",
  "scripts/smoke/producer/producer-style-profile-real-compositions-smoke.mjs",
  "scripts/smoke/producer/producer-style-profile-sample-contract-smoke.mjs",
  "scripts/smoke/producer/producer-style-profiles-smoke.mjs",
  "scripts/smoke/producer/producer-validation-smoke.mjs",
  "scripts/smoke/producer/remotion-capabilities-smoke.mjs",
  "scripts/smoke/producer/standalone-video-runtime-smoke.mjs",
  "scripts/smoke/compositions/ai-concepts-for-beginners-smoke.mjs",
  "scripts/smoke/compositions/ai-daily-news-brief-2026-07-08-smoke.mjs",
  "scripts/smoke/compositions/ai-daily-news-brief-2026-07-09-smoke.mjs",
  "scripts/smoke/compositions/ai-news-strategic-brief-2026-07-09-smoke.mjs",
  "scripts/smoke/compositions/openai-hardware-news-brief-smoke.mjs",
  "scripts/smoke/compositions/pixelrag-chinese-standalone-smoke.mjs",
  "scripts/smoke/compositions/uv-open-source-brief-smoke.mjs",
  "scripts/smoke/compositions/world-cup-betting-analysis-smoke.mjs",
];
for (const relativePath of groupedSmokePaths) {
  assert.equal(trackedPaths(relativePath).length, 1, `Grouped smoke path: ${relativePath}`);
  assert(existsSync(absolute(relativePath)), `Grouped smoke filesystem path: ${relativePath}`);
}
for (const entry of readdirSync(absolute("scripts"), { withFileTypes: true })) {
  assert(
    !entry.isFile() || !entry.name.endsWith("-smoke.mjs"),
    `Smoke scripts must not live at scripts root: scripts/${entry.name}`,
  );
}

console.log("Repository layout smoke passed.");
