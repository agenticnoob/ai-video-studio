/* global console */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(path.join(root, relativePath), "utf8");
const expectedVersion = "4.0.489";
const packageJson = JSON.parse(read("package.json"));
const packageLock = JSON.parse(read("package-lock.json"));
const inventory = JSON.parse(read("docs/architecture/agent-producer-only-removal-inventory.json"));
const allDirectDependencies = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
};
const remotionDependencyNames = Object.keys(allDirectDependencies).filter(
  (name) => name === "remotion" || name.startsWith("@remotion/"),
);

assert(remotionDependencyNames.length > 0, "No direct Remotion dependencies found");
for (const name of remotionDependencyNames) {
  assert.equal(
    allDirectDependencies[name],
    expectedVersion,
    `Remotion dependency ${name} must be exactly ${expectedVersion}`,
  );
}

for (const [lockPath, entry] of Object.entries(packageLock.packages)) {
  if (lockPath === "node_modules/remotion" || /^node_modules\/@remotion\/[^/]+$/u.test(lockPath)) {
    assert.equal(
      entry.version,
      expectedVersion,
      `Lockfile Remotion package ${lockPath} must resolve to ${expectedVersion}`,
    );
  }
}

for (const name of [
  "@remotion/effects",
  "@remotion/layout-utils",
  "@remotion/light-leaks",
  "@remotion/transitions",
  "@remotion/media",
  "@remotion/lottie",
  "@remotion/motion-blur",
]) {
  assert.equal(
    allDirectDependencies[name],
    expectedVersion,
    `Maintained Remotion package must be exactly ${expectedVersion}: ${name}`,
  );
}

assert(
  existsSync(path.join(root, "src/remotion/transitions")),
  "Phase 6 transition capability path must exist",
);

const iterationStatus = read("docs/ITERATION_STATUS.md");
const roadmap = read("docs/AGENT_PRODUCER_ONLY_ROADMAP.md");
assert(iterationStatus.includes("Phase 6 version gate is complete."));
assert(iterationStatus.includes("Phase 6A effects and text-layout foundation is complete."));
assert(iterationStatus.includes("Phase 6 Remotion capability core is complete."));
assert(iterationStatus.includes("Phase 7 dynamic existing media and sound design is complete."));
assert(iterationStatus.includes("Phase 8A style-profile contract and showcase is complete."));
assert(iterationStatus.includes("Phase 8 is complete."));
assert(iterationStatus.includes("Phase 9A deterministic quality gates are complete."));
assert(iterationStatus.includes("Phase 9B final acceptance video"));
assert(roadmap.includes("Phase 6B transitions and remaining showcase coverage complete"));
assert(
  inventory.completedPhaseSlices.some(
    (entry) => entry.phase === 6 && entry.slice === "version-gate" && entry.status === "complete",
  ),
  "Removal inventory must record the completed Phase 6 version gate",
);
assert(
  inventory.completedPhaseSlices.some(
    (entry) =>
      entry.phase === 6 &&
      entry.slice === "effects-text-layout-foundation" &&
      entry.status === "complete",
  ),
  "Removal inventory must record the completed Phase 6A foundation",
);
assert(inventory.completedPhases.includes(6), "Removal inventory must mark Phase 6 complete");
assert(
  inventory.completedPhaseSlices.some(
    (entry) =>
      entry.phase === 6 && entry.slice === "transitions-showcase" && entry.status === "complete",
  ),
  "Removal inventory must record the completed Phase 6B transition showcase",
);

console.log("Remotion version gate smoke passed.");
