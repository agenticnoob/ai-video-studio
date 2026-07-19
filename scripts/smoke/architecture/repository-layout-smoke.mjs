/* global console, process */

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
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

console.log("Repository layout smoke passed.");
