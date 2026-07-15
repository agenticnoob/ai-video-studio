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
]) {
  assert(!(name in allDirectDependencies), `Capability package must remain absent: ${name}`);
}

for (const relativePath of [
  "src/remotion/effects",
  "src/remotion/transitions",
  "src/remotion/styles",
  "src/remotion/capability-showcase",
]) {
  assert(
    !existsSync(path.join(root, relativePath)),
    `Capability path must remain absent: ${relativePath}`,
  );
}

const iterationStatus = read("docs/ITERATION_STATUS.md");
const roadmap = read("docs/AGENT_PRODUCER_ONLY_ROADMAP.md");
assert(iterationStatus.includes("Phase 6 version gate is complete."));
assert(iterationStatus.includes("Phase 6 capability implementation has not started."));
assert(roadmap.includes("@remotion/transitions` remains published only through `4.0.477"));
assert(
  inventory.completedPhaseSlices.some(
    (entry) => entry.phase === 6 && entry.slice === "version-gate" && entry.status === "complete",
  ),
  "Removal inventory must record the completed Phase 6 version gate",
);

console.log("Remotion version gate smoke passed.");
