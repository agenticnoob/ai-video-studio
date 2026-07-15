# Remotion Version Gate Phase 6 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the smallest mandatory Phase 6 slice by locking every currently installed Remotion dependency to one verified exact version, proving the existing Producer render surface still works, and stopping before capability packages or showcase code are added.

**Architecture:** Add a focused package/lock/document guard, move the current Remotion dependency closure from `4.0.467` to exact `4.0.489`, and compare the same non-frozen primitive fixture before and after the upgrade. Keep Phase 6 capability implementation separate: `@remotion/effects`, `@remotion/transitions`, `@remotion/layout-utils`, producer-owned presets, text fitting, and the capability showcase remain absent. Record the current upstream publication conflict instead of mixing unsupported Remotion versions: the Roadmap needs effects introduced through `4.0.487`, while npm currently exposes `@remotion/transitions` only through `4.0.477` and that package hard-depends on Remotion `4.0.477`.

**Tech Stack:** Node.js ESM, npm lockfile v3, React 19, Remotion 4.0.489, Docker Compose, Remotion CLI, ESLint, Prettier, CodeGraph, Git.

---

## Current Repository Facts

- Starting branch: `refactor/agent-producer-service`.
- Starting commit: `87de39e feat: add producer asset supply and preflight`.
- Starting tracked worktree: clean; ignored `out/phase6-version-gate/before.png` is a local verification artifact and must not be staged.
- Roadmap Phase 0 through Phase 5 are complete. Phase 6 is the next incomplete phase.
- The Phase 6 version gate is a mandatory predecessor to capability package installation and therefore the smallest valid bounded slice.
- Direct Remotion dependencies are currently `4.0.467`, except `@remotion/three` is incorrectly ranged as `^4.0.467`.
- Official Remotion documentation identifies `roughenEdges()` as available from `4.0.487`; `paper()` is available from `4.0.486`, `createEffect()` and `pixelate()` from `4.0.479`, and the current documented Remotion version is `4.0.489`.
- npm confirms `remotion`, `@remotion/effects`, and `@remotion/layout-utils` at `4.0.489`, but `@remotion/transitions` latest is `4.0.477`; `@remotion/transitions@4.0.489` does not exist and `4.0.477` depends exactly on `remotion`, `@remotion/shapes`, and `@remotion/paths` `4.0.477`.
- CodeGraph found no current Phase 6 package/version guard, capability showcase, or producer-owned effects/layout module. Existing shared visual call paths reach frozen compositions and must not be edited.
- Fresh Docker lint baseline is 39 errors plus 2 warnings, all in existing frozen/local generated or historical script paths; no Phase 6 file exists in that set.
- The pre-upgrade primitive fallback still rendered successfully at frame 45 with SHA-256 `2f90dbc92db9f53e5aff41d6fa4a431983c6dcc3fa9f6ab65ea71edfcc82d9c9` and shows three visible, non-overlapping panels.

## Explicit Scope

### Create

- `scripts/remotion-version-gate-smoke.mjs` — RED/GREEN guard for exact direct and lockfile Remotion versions, version-gate status, and the capability-not-started boundary.

### Modify

- `package.json` — add `smoke:remotion-version-gate` and set all current `remotion` / `@remotion/*` entries to exact `4.0.489`.
- `package-lock.json` — regenerate the Remotion dependency closure from the patched package manifest.
- `scripts/agent-producer-architecture-smoke.mjs` — require the version-gate command and current status language.
- `AGENTS.md`, `README.md`, `scripts/AGENTS.md`, `src/remotion/AGENTS.md` — describe the exact version baseline and keep capability work unstarted.
- `docs/FINAL_PRODUCT_GOAL.md`, `docs/ITERATION_STATUS.md`, `docs/AGENT_PRODUCER_ONLY_ROADMAP.md` — mark only the Phase 6 version-gate slice complete and identify the next unstarted capability slice.
- `docs/REMOTION_COMPONENT_LIBRARY.md` — record the verified dependency floor and the upstream transitions publication blocker.
- `docs/architecture/agent-producer-only-removal-inventory.json` — record Phase 6 `version-gate` as a completed slice without adding Phase 6 to `completedPhases`.
- `.agents/skills/ai-video-studio-agent-producer/SKILL.md` and `.agents/skills/remotion-best-practices/SKILL.md` — route agents through the exact installed baseline and prevent premature capability-package use.
- this plan — checkboxes and execution evidence only.

### No deletions

This slice deletes no source, composition, provider file, compatibility path, private file, or local generated artifact.

## Explicit Non-Goals

- no `@remotion/effects`, `@remotion/transitions`, `@remotion/layout-utils`, or `@remotion/light-leaks` installation
- no `src/remotion/effects/`, `src/remotion/transitions/`, `src/remotion/styles/`, or `src/remotion/capability-showcase/`
- no effect preset, transition preset, text-fitting helper, `CanvasImage`, `HtmlInCanvas`, `createEffect()`, `TransitionSeries`, `Series`, or `Freeze` production use
- no capability showcase or Root registration
- no Chromium flag/config change for `HtmlInCanvas`
- no workaround using npm overrides, mixed Remotion versions, relaxed version guards, or a lowered Roadmap capability target
- no finished/frozen composition render, edit, migration, regeneration, or formatting
- no Phase 7 dynamic media/sound, Phase 8 style profiles, or Phase 9 gates
- no repository-wide historical lint cleanup
- no push

## Frozen And Artifact Boundary

- Every finished directory under `src/remotion/<CompositionName>/` remains byte-for-byte untouched.
- Historical `provider: "f5-tts"` metadata remains truthful and unchanged.
- `src/remotion/recipes/{blocks,timing}`, historical storyboard contracts, and the frozen registry remain read-only.
- Representative stills use only `scripts/fixtures/producer-assets/PrimitiveAssetFallbackFixture.tsx`, not a finished composition.
- `out/phase6-version-gate/{before,after}.png` stays ignored and must not be staged.
- Do not stage `public/generated/`, `out/`, `voices/`, audio, video, screenshots, secrets, npm logs, or private configuration.

## Dependency And Call-Chain Evidence

CodeGraph established:

```txt
package.json / package-lock.json
  -> Docker producer npm install
  -> Remotion CLI / renderer / Root composition discovery
  -> every dedicated and frozen composition at runtime

scripts/agent-producer-architecture-smoke.mjs
  -> package command surface
  -> active authority status

PrimitiveAssetFallbackFixture
  -> KenBurns / ParallaxPan / ZoomPulse
  -> deterministic code-only fallback paths
  -> no finished composition mutation or registration
```

Official and npm evidence establishes this version decision:

```txt
minimum selected effect API: roughenEdges() >= 4.0.487
selected installed baseline: all current Remotion dependencies = 4.0.489 exact
current capability blocker: @remotion/transitions latest = 4.0.477
blocked workaround: mixed 4.0.489 / 4.0.477 dependency closure
```

The gate therefore upgrades only the packages already present. Capability packages remain a separate future decision after upstream versions align or the authority is explicitly revised with verified compatibility evidence.

---

### Task 1: Add And Observe The Version-Gate RED

**Files:**

- Create: `scripts/remotion-version-gate-smoke.mjs`
- Modify: `package.json`

- [x] **Step 1: Add the focused package/lock/status assertions**

Create the smoke with this complete implementation:

```js
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
const inventory = JSON.parse(
  read("docs/architecture/agent-producer-only-removal-inventory.json"),
);
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
  assert(!existsSync(path.join(root, relativePath)), `Capability path must remain absent: ${relativePath}`);
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
```

The command is `npm run smoke:remotion-version-gate` and success output is `Remotion version gate smoke passed.`.

- [x] **Step 2: Run the smoke in Docker and record RED**

Run:

```bash
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run smoke:remotion-version-gate'
```

Expected: exit `1` because the old dependency/lock state is `4.0.467` (and `@remotion/three` is ranged), not because of syntax or missing runtime dependencies.

### Task 2: Move The Existing Remotion Closure To One Exact Version

**Files:**

- Modify: `package.json`
- Modify mechanically through npm: `package-lock.json`

- [x] **Step 1: Patch every current direct Remotion version**

Set these existing entries to the exact string `4.0.489`:

```txt
@remotion/cli
@remotion/eslint-plugin
@remotion/google-fonts
@remotion/paths
@remotion/renderer
@remotion/shapes
@remotion/tailwind-v4
@remotion/three
remotion
```

Do not add capability packages.

- [x] **Step 2: Regenerate the lock and update the Docker dependency volume**

Run:

```bash
docker compose run --rm producer npm install --ignore-scripts
```

The npm-generated lockfile rewrite is the only non-`apply_patch` file mutation in this task. Verify the root lock dependencies and every installed Remotion package entry resolve to `4.0.489`.

- [x] **Step 3: Verify the installed dependency closure**

Run in Docker:

```bash
node -e 'const names=["remotion","@remotion/cli","@remotion/google-fonts","@remotion/paths","@remotion/renderer","@remotion/shapes","@remotion/tailwind-v4","@remotion/three","@remotion/eslint-plugin"]; for (const name of names) console.log(name, require(`${name}/package.json`).version)'
```

Expected: every line ends in `4.0.489`.

### Task 3: Align Active Authorities Without Claiming Phase 6 Complete

**Files:** all active docs, skills, inventory, and architecture guard listed in Scope.

- [x] **Step 1: Record the completed slice precisely**

Use the consistent status:

```txt
Phase 6 version gate is complete.
Phase 6 capability implementation has not started.
```

Keep `completedPhases` at `[0, 1, 2, 3, 4, 5]`. Add a separate inventory record for Phase 6 `version-gate` completion.

- [x] **Step 2: Record the selected baseline and upstream blocker**

State that current installed Remotion dependencies are exact `4.0.489`, the selected Roadmap effect floor is `4.0.487`, and `@remotion/transitions` currently stops at `4.0.477` with exact `4.0.477` Remotion dependencies. Do not describe mixed versions as supported.

- [x] **Step 3: Keep future capability work explicitly absent**

The next bounded slice may install and prove capability dependencies only after the transitions version conflict has a supported resolution. Effects, transitions, layout utilities, presets, text fitting, and the showcase remain unimplemented.

- [x] **Step 4: Record unchanged operational surfaces**

`docs/providers/voxcpm.md`, `docs/PRODUCER_ASSET_CONTRACT.md`, `.env.example`, Docker Compose topology, Root registrations, frozen compositions, and `docs/VISUAL_RECIPE_ROADMAP.md` remain unchanged because this is a dependency gate only.

### Task 4: Turn RED Into GREEN

**Files:**

- Modify: `scripts/remotion-version-gate-smoke.mjs`
- Modify: `scripts/agent-producer-architecture-smoke.mjs`

- [x] **Step 1: Run the focused smoke after package and doc alignment**

```bash
docker compose run --rm producer bash -lc 'npm run smoke:remotion-version-gate'
```

Expected: exit `0` with `Remotion version gate smoke passed.`.

- [x] **Step 2: Run core Producer boundary smokes**

```bash
docker compose run --rm producer bash -lc 'npm run smoke:agent-producer-architecture && npm run smoke:skill-alignment && npm run smoke:producer-os && npm run smoke:producer-assets && npm run smoke:producer-validation && npm run smoke:producer-review-frames'
```

Expected: every command exits `0` without restoring Web, F5, planner, generated visual media, or frozen migration paths.

### Task 5: Docker-First Version-Gate Verification

- [x] **Step 1: Run Docker typecheck, lint, build, and composition listing**

```bash
docker compose run --rm producer bash -lc 'npx tsc --noEmit --pretty false'
docker compose run --rm producer bash -lc 'npm run lint'
docker compose run --rm producer bash -lc 'npm run build'
docker compose run --rm producer bash -lc 'npx remotion compositions src/remotion/index.ts'
```

Typecheck, build, and composition listing must exit `0`. Lint is expected to retain the freshly measured 39-error/2-warning historical baseline; report the actual result and do not claim a clean full lint gate.

- [x] **Step 2: Render the post-upgrade non-frozen fixture still**

```bash
docker compose run --rm producer bash -lc 'npx remotion still scripts/fixtures/producer-assets/PrimitiveAssetFallbackFixture.tsx PrimitiveAssetFallbackFixture out/phase6-version-gate/after.png --frame=45'
sha256sum out/phase6-version-gate/before.png out/phase6-version-gate/after.png
```

Inspect `after.png` for three visible panels, no blank content, and no overlap. If hashes differ, report the visual difference honestly; do not weaken the comparison.

- [x] **Step 3: Run changed-file style/config checks**

Run ESLint on changed JS/MJS/TS/TSX files, Prettier `--check` on every changed supported file, JSON parse checks for package/inventory files, `docker compose config --quiet`, and `git diff --check`.

- [x] **Step 4: Run forbidden, frozen, artifact, and secret scans**

Confirm:

```txt
no capability package or capability-showcase path was added
no image/video generation, Web, planner, template, F5, or provider fallback was restored
no finished composition or historical provider metadata changed
no public/generated, out, voices, audio, video, screenshot, secret, or npm log is staged
```

### Task 6: Review, Document Evidence, And Commit Once

- [x] **Step 1: Re-read the plan and Roadmap Phase 6 version gate**

Check exact-version selection, package-lock closure, RED/GREEN evidence, Docker verification, still comparison, docs alignment, upstream transitions blocker, frozen boundaries, and stop condition line by line.

- [x] **Step 2: Update this plan's execution record**

Record actual RED failure, installed versions, focused smoke results, Docker results, lint baseline, still hashes/inspection, boundary scans, and any known issue.

- [x] **Step 3: Review and stage only version-gate files**

```bash
git status --short
git diff --stat
git diff
git diff --check
git add .agents/skills/ai-video-studio-agent-producer/SKILL.md .agents/skills/remotion-best-practices/SKILL.md AGENTS.md README.md docs package.json package-lock.json scripts/AGENTS.md scripts/agent-producer-architecture-smoke.mjs scripts/remotion-version-gate-smoke.mjs src/remotion/AGENTS.md
git diff --cached --check
git diff --cached --stat
```

- [x] **Step 4: Create one bounded commit and verify status**

```bash
git commit -m "chore: complete remotion version gate"
git rev-parse --short HEAD
git status --short --branch
```

Do not push.

## RED Evidence Required For Handoff

- The new Docker `smoke:remotion-version-gate` must fail against the pre-upgrade `4.0.467` / ranged `@remotion/three` state for the expected exact-version reason.

## GREEN Evidence Required For Handoff

- all current direct and lockfile Remotion packages resolve to exact `4.0.489`
- `@remotion/three` has no caret
- capability packages and showcase code remain absent
- focused version, architecture, skill, Producer OS, asset, validation, and review smokes pass
- Docker typecheck, build, and composition listing pass
- full lint result is reported against the fresh 39-error/2-warning baseline
- the same non-frozen primitive fixture renders before and after the upgrade and is visually inspected
- changed-file lint/Prettier, JSON/Compose checks, forbidden/frozen/artifact/secret scans, and `git diff --check` pass
- no finished composition, generated/private media, provider, Root, `.env.example`, or Compose topology changes

## Documentation Alignment Boundary

Align README, AGENTS, FINAL_PRODUCT_GOAL, ITERATION_STATUS, the active Roadmap, component inventory, removal inventory, Agent Producer skill, Remotion skill, script/remotion knowledge bases, architecture guard, package scripts, and this plan. Keep `VISUAL_RECIPE_ROADMAP.md` as a superseded pointer. Keep provider, asset contract, env, Compose, Root, and frozen sources unchanged unless verification exposes a direct inconsistency.

## Commit Boundary And Stop Condition

Create exactly one commit containing the Phase 6 version-gate smoke, exact installed dependency/lockfile alignment, active-document status, and verification record. Stop after commit/status verification. Do not add capability packages, presets, text fitting, a capability showcase, Phase 7 work, or a transitions version workaround. Do not push.

## Plan Self-Review

- Spec coverage: current facts, scope/non-goals, frozen boundary, call-chain evidence, RED/GREEN, focused validation, Docker-first checks, docs, commit boundary, and stop condition are explicit.
- Placeholder scan: no placeholder marker, unbounded cleanup, relaxed allowlist, or unspecified implementation step remains.
- Type/field consistency: package and lock guards use `4.0.489`; inventory records a completed slice without marking all of Phase 6 complete.
- Scope check: capability packages, render code, showcase registration, frozen compositions, provider/config surfaces, and later phases remain explicitly excluded.

## Execution Record

- RED: the first Docker `smoke:remotion-version-gate` exited `1` on
  `@remotion/cli` `4.0.467`, proving the old dependency state did not satisfy
  the exact `4.0.489` contract.
- Dependency result: all nine direct Remotion dependencies and all top-level
  Remotion lock entries resolve to exact `4.0.489`; `@remotion/three` no longer
  has a caret. npm retained its existing ESLint peer warning and reported three
  existing audit findings (two low, one moderate).
- GREEN: version-gate, architecture, skill alignment, Producer OS, Producer
  assets, validation, and review-frame smokes all exit `0` in Docker.
- Docker gates: TypeScript, build, and Remotion composition discovery exit `0`.
  Full lint remains at the freshly measured historical baseline of 39 errors
  and 2 warnings; none is in a Phase 6 changed implementation file.
- Still evidence: both frame-45 fixture renders have SHA-256
  `2f90dbc92db9f53e5aff41d6fa4a431983c6dcc3fa9f6ab65ea71edfcc82d9c9`.
  The non-frozen fixture shows three visible, non-overlapping panels before and
  after the upgrade.
- Boundary checks: changed-file ESLint/Prettier, JSON parsing, Compose config,
  forbidden/frozen/artifact/secret scans, and `git diff --check` pass. No
  finished composition, provider, Root, env, Compose topology, generated media,
  private voice, or capability implementation changed.
- Upstream issue: `@remotion/transitions` is still unavailable at `4.0.489`;
  the next capability slice remains unstarted and may not use mixed versions,
  npm overrides, or a lowered target as a workaround.
