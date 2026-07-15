# Agent Producer OS Phase 4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Complete Roadmap Phase 4 by turning the retained Producer Sample OS into the mandatory future-composition contract, adding executable scaffold and render entrypoints, and removing stale recipe/template productization semantics without changing any finished composition.

**Architecture:** Keep every existing registered composition frozen and classify its registry metadata as a `frozen-reference`. Define a strict `maintained` manifest contract for future samples, make the scaffold export one complete example of that contract, and route deterministic scaffold, validation, review, and render operations through four Producer commands. Reuse the existing direct VoxCPM runtime, validation library, review-frame planner, Remotion CLI, and `render-video.sh`; do not introduce the Phase 5 asset supply system.

**Tech Stack:** TypeScript 5.9, Node.js ESM, React 19, Remotion 4.0.467, Docker Compose, shell render wrapper, JSON/Markdown contracts, CodeGraph, Git.

## Global Constraints

- Work inline in `/data/projects/labs/ai-video-studio` on `refactor/agent-producer-service`; do not use subagents or create another worktree.
- `.agents/skills/ai-video-studio-agent-producer/` remains the only video-production entrypoint.
- Visual production uses code and existing assets only. Do not add image generation, video generation, ComfyUI, Web prompt generation, a planner, templates, or a universal scene DSL.
- VoxCPM remains the only supported narration provider for new work.
- Do not edit, migrate, reformat, regenerate, or re-render any finished composition or its historical `audio.generated.ts` metadata.
- Do not commit `voices/`, audio, video, screenshots, `public/generated/`, `out/`, private configuration, or generated artifacts.
- Do not implement Phase 5 checksum, download, license, provenance, or media-normalization infrastructure.
- Use frame-driven Remotion code. The scaffold cover is a static `<Still>` component with no CSS animation, transition, or wall-clock behavior.
- Complete one Phase 4 commit, do not push, and stop before Phase 5.

## Current Repository Facts

- Starting commit: `f603f85 refactor: remove web video product line`.
- Starting worktree: clean; no user edits require protection.
- Roadmap Phase 0 through Phase 3 are complete; Phase 4 is the next incomplete phase.
- `.codegraph/` exists and was used before direct source scans.
- Existing Producer-owned runtime already provides direct VoxCPM audio, `producer:validate`, and `producer:stills`.
- `src/remotion/producer-samples/manifest.ts` still exposes `recipe` and `template` targets plus productization status.
- `scripts/producer-promotion-gate-smoke.mjs` still requires recipe/template docs, while `docs/PRODUCER_PROMOTION_GATE.md` forbids those choices.
- `package.json` has no `producer:scaffold`, `producer:render`, or `smoke:producer-os` command.
- The scaffold is a copy convention only; it lacks a strict future manifest, code-rendered covers, render metadata, and publishing-copy files.
- Whole-repository Docker lint reports a historical baseline of 39 errors plus 2 warnings; changed files must be clean even while that baseline remains.

## Dependency And Call-Chain Evidence

CodeGraph established these current paths:

```txt
src/remotion/producer-samples/registry.ts
  -> ProducerSampleManifest
  -> getProducerSampleManifestByCompositionId()
  -> producer:stills CLI and manifest/promotion smokes

scripts/render-producer-review-frames.mjs
  -> registry lookup
  -> buildProducerReviewFrameJobs()
  -> npx remotion still

scripts/validate-producer-sample.mjs
  -> sample validation module
  -> validateProducerSample()
  -> audio alignment + Root registration + ignored artifact boundary

scripts/render-video.sh
  -> docker producer service
  -> npx remotion render
  -> ffprobe + metadata/chapter JSON
```

The Phase 4 design adds sibling scaffold/render entrypoints and extends the existing manifest/validation contracts. It does not route through deleted Web code or historical recipe runtime.

## Scope

### Create

- `scripts/agent-producer-os-smoke.mjs` — Phase 4 contract, scaffold, and render-plan smoke.
- `scripts/producer-scaffold.mjs` — copies and tokenizes the future sample scaffold.
- `scripts/lib/producer-render.ts` — pure render job planning for MP4, metadata, and two covers.
- `scripts/render-producer-sample.mjs` — maintained-manifest render CLI with `--dry-run`.
- `src/remotion/producer-samples/scaffold/SampleName/manifest.ts` — strict maintained sample manifest.
- `src/remotion/producer-samples/scaffold/SampleName/cover.tsx` — code-rendered landscape/portrait cover.
- `src/remotion/producer-samples/scaffold/SampleName/render-metadata.json` — title, description, fps, and chapter input.
- `src/remotion/producer-samples/scaffold/SampleName/publishing.md` — publishing-copy location.

### Modify

- `src/remotion/producer-samples/manifest.ts`
- `src/remotion/producer-samples/registry.ts`
- `src/remotion/producer-samples/index.ts`
- `src/remotion/producer-samples/scaffold/README.md`
- `src/remotion/producer-samples/scaffold/SampleName/{generate.mjs,index.ts,validation.ts}`
- `scripts/fixtures/producer-tools/{fixture-manifest.ts,fixture-validation.js}`
- `scripts/lib/producer-validation.ts`
- `scripts/validate-producer-sample.mjs`
- `scripts/producer-validation-smoke.mjs`
- `scripts/producer-promotion-gate-smoke.mjs`
- `scripts/producer-sample-manifest-smoke.mjs`
- `scripts/agent-producer-architecture-smoke.mjs`
- `scripts/skill-alignment-smoke.mjs`
- `package.json`
- `.agents/skills/ai-video-studio-agent-producer/SKILL.md`
- `README.md`, `AGENTS.md`, `scripts/AGENTS.md`, `src/remotion/AGENTS.md`
- `docs/FINAL_PRODUCT_GOAL.md`, `docs/ITERATION_STATUS.md`
- `docs/AGENT_PRODUCER_ONLY_ROADMAP.md`
- `docs/PRODUCER_PROMOTION_GATE.md`, `docs/REMOTION_COMPONENT_LIBRARY.md`
- `docs/architecture/agent-producer-only-removal-inventory.json`
- this plan

### No deletions

Phase 4 deletes no composition, runtime, private file, local artifact, or historical compatibility path.

## Explicit Non-Goals

- no Phase 5 asset record schema, downloader, checksum, duplicate detection, provenance/license gate, or FFmpeg normalization
- no Phase 6 Remotion dependency upgrade, official effects/transitions package, capability showcase, or text-fit system
- no actual new topic video and no migration of a finished video to the future maintained contract
- no automatic edits to `src/remotion/Root.tsx`; the scaffold prints the required registration reminder
- no real VoxCPM request, still render, cover render, or MP4 render during the scaffold/render-plan smoke
- no cleanup of unrelated historical lint failures or Docker orphan containers
- no push

## Frozen And Historical Boundary

- Every current entry in `src/remotion/producer-samples/registry.ts` describes an already-finished composition and receives only `sampleStatus: "frozen-reference"` metadata plus Producer-only promotion vocabulary cleanup.
- No file under a finished `src/remotion/<CompositionName>/` directory changes.
- Historical `provider: "f5-tts"` metadata stays truthful.
- `src/remotion/recipes/blocks/`, `src/remotion/recipes/timing/`, `src/lib/caption-schema.ts`, `src/lib/storyboard-plan-schema.ts`, and `src/lib/template-registry.ts` remain frozen compatibility only.
- Archived docs are not rewritten.

---

### Task 1: Add And Observe The Phase 4 RED Guards

**Files:**

- Create: `scripts/agent-producer-os-smoke.mjs`
- Modify: `package.json`

**Interfaces:**

- Produces npm command `smoke:producer-os`.
- Establishes the future target vocabulary and required command/file surface before implementation.

- [x] **Step 1: Write the focused Phase 4 smoke**

The smoke reads `package.json`, the active manifest source, scaffold tree, and registry. Before production changes it must require:

```js
const expectedTargets = [
  "primitive",
  "block",
  "effect",
  "transition",
  "style-profile",
];

for (const command of ["producer:scaffold", "producer:render", "smoke:producer-os"]) {
  assert(packageJson.scripts[command], `Missing Phase 4 command: ${command}`);
}

for (const file of [
  "scripts/producer-scaffold.mjs",
  "scripts/lib/producer-render.ts",
  "scripts/render-producer-sample.mjs",
  "src/remotion/producer-samples/scaffold/SampleName/manifest.ts",
  "src/remotion/producer-samples/scaffold/SampleName/cover.tsx",
  "src/remotion/producer-samples/scaffold/SampleName/render-metadata.json",
  "src/remotion/producer-samples/scaffold/SampleName/publishing.md",
]) assert(existsSync(file), `Missing Phase 4 surface: ${file}`);
```

It must also reject active `recipe`, `template`, `productized`, `productizationExposure`, and planner/productization wording in the manifest/registry/promotion smoke closure.

- [x] **Step 2: Register the command and run RED**

Add a compile/run command for the smoke to `package.json`, then run in Docker:

```bash
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run smoke:producer-os'
```

Expected: exit `1` on the first missing Phase 4 command or file, not a dependency or syntax failure.

- [x] **Step 3: Preserve the existing promotion RED**

Record the already-observed Docker failure:

```txt
Error: Docs must describe each Promotion Gate decision.
```

This proves the old smoke requires removed recipe/template decisions while the active promotion document correctly omits them.

### Task 2: Replace Legacy Productization Semantics With A Strict Future Manifest

**Files:**

- Modify: `src/remotion/producer-samples/manifest.ts`
- Modify: `src/remotion/producer-samples/registry.ts`
- Modify: `src/remotion/producer-samples/index.ts`
- Modify: `scripts/producer-promotion-gate-smoke.mjs`
- Modify: `scripts/producer-sample-manifest-smoke.mjs`

**Interfaces:**

- Produces active promotion targets `primitive | block | effect | transition | style-profile`.
- Produces `ProducerSampleManifest = FrozenProducerSampleManifest | MaintainedProducerSampleManifest`.
- Produces `maintainedProducerSampleManifests` filtered from the single registry.

- [x] **Step 1: Define the maintained/frozen manifest union**

Keep the shared composition/slug/review/source fields. Add:

```ts
export type ProducerSampleStatus = "frozen-reference" | "maintained";

export type MaintainedProducerSampleManifest = ProducerSampleManifestBase & {
  readonly sampleStatus: "maintained";
  readonly productionBrief: {
    readonly audience: string;
    readonly publishingSurface: string;
    readonly durationTargetSeconds: number;
  };
  readonly narration: {
    readonly required: boolean;
    readonly provider: "voxcpm";
    readonly mode: "voice-design" | "controllable-clone" | "high-fidelity-clone";
    readonly scriptPath: string;
    readonly audioMetadataPath: string;
  };
  readonly assets: readonly { readonly id: string; readonly localPath: string; readonly purpose: string }[];
  readonly validationModule: string;
  readonly render: {
    readonly metadataPath: string;
    readonly cover16x9CompositionId: string;
    readonly cover9x16CompositionId: string;
  };
  readonly publishingCopyPath: string;
};
```

`assertProducerSampleManifest()` keeps common checks and requires every maintained field, local path, non-empty review frame purpose, validation module, render metadata, both cover ids, and publishing path. It rejects remote asset URLs and recipe/template promotion targets. Frozen references retain the common metadata only.

- [x] **Step 2: Reclassify current registry entries without touching compositions**

Add `sampleStatus: "frozen-reference"` to every current registry entry. Convert the five stale recipe candidates to bounded block candidates, convert `promote-to-recipe` to `promote-to-block`, convert `productized` to `promoted`, remove every `productizationExposure`, and rewrite reasons as historical extraction evidence without claiming a live product recipe/template.

- [x] **Step 3: Replace promotion gate states**

Keep `stay-sample-local`, `promote-to-primitive`, and `promote-to-block`; add `promote-to-effect`, `promote-to-transition`, and `promote-to-style-profile`. Remove recipe/template states and productization status/exposure types.

- [x] **Step 4: Update registry and promotion smokes**

Require all current registry entries to be `frozen-reference`, require active targets exactly match the new five-item list, require no recipe/template/productized fields, and preserve the Evidence Lens block evidence assertions.

- [x] **Step 5: Run the focused manifest/promotion smoke GREEN**

```bash
npm run smoke:producer-sample-manifest
npm run smoke:producer-promotion-gate
```

Expected: both exit `0` with their existing success messages.

### Task 3: Add The Executable Future Sample Scaffold

**Files:**

- Create: `scripts/producer-scaffold.mjs`
- Create: `src/remotion/producer-samples/scaffold/SampleName/manifest.ts`
- Create: `src/remotion/producer-samples/scaffold/SampleName/cover.tsx`
- Create: `src/remotion/producer-samples/scaffold/SampleName/render-metadata.json`
- Create: `src/remotion/producer-samples/scaffold/SampleName/publishing.md`
- Modify: `src/remotion/producer-samples/scaffold/README.md`
- Modify: `src/remotion/producer-samples/scaffold/SampleName/index.ts`
- Modify: `src/remotion/producer-samples/scaffold/SampleName/validation.ts`
- Modify: `scripts/agent-producer-os-smoke.mjs`
- Modify: `package.json`

**Interfaces:**

- Produces `npm run producer:scaffold -- --name <PascalCase> --slug <kebab-case>`.
- Produces a strict maintained `sampleNameManifest`.
- Produces `SampleNameCover` for two registered Remotion `<Still>` ids.

- [x] **Step 1: Implement safe scaffold argument and destination checks**

The CLI requires PascalCase `--name` and kebab-case `--slug`, defaults output root to `src/remotion`, rejects an existing destination, supports `--output-root` for isolated smoke fixtures, and copies only files from `src/remotion/producer-samples/scaffold/SampleName/`.

- [x] **Step 2: Tokenize names and copied import paths**

Replace `SampleName`, `sampleName`, `SAMPLE_NAME`, and `sample-name`. When copying to `src/remotion/<Name>/`, rewrite scaffold-depth imports from `../../../standalone-video` to `../standalone-video` and from `../../../../../scripts` to `../../../scripts`. Never edit `Root.tsx`; print the video and two Still registration ids after success.

- [x] **Step 3: Add the complete future manifest example**

The scaffold manifest uses `sampleStatus: "maintained"`, VoxCPM high-fidelity clone, empty `assets: []`, three review frames, `validation.ts`, `render-metadata.json`, `SampleNameCover16x9`, `SampleNameCover9x16`, and `publishing.md`. It passes `assertProducerSampleManifest()` before registration.

- [x] **Step 4: Add code-rendered covers**

`cover.tsx` exports one prop-driven static component with one clear headline, a supporting line, generous safe area, strong contrast, and no animation. The README shows `<Still>` registration for 1920x1080 and 1080x1920.

- [x] **Step 5: Add render metadata and publishing copy**

`render-metadata.json` contains a title, description, fps `30`, and three chapter durations matching the scaffold's 300 total frames. `publishing.md` contains concise title, description, and verification-note sections with no generated asset.

- [x] **Step 6: Prove an isolated scaffold can be created**

The Phase 4 smoke creates a temporary directory, invokes the CLI with `--name PhaseFourFixture --slug phase-four-fixture --output-root <tmp>/src/remotion`, asserts the complete required file set, asserts token replacement, and deletes only its `/tmp` fixture.

### Task 4: Compose Validation And Add The Unified Render Entrypoint

**Files:**

- Create: `scripts/lib/producer-render.ts`
- Create: `scripts/render-producer-sample.mjs`
- Modify: `scripts/lib/producer-validation.ts`
- Modify: `scripts/validate-producer-sample.mjs`
- Modify: `scripts/producer-validation-smoke.mjs`
- Modify: `src/remotion/producer-samples/scaffold/SampleName/validation.ts`
- Modify: `scripts/agent-producer-os-smoke.mjs`
- Modify: `package.json`

**Interfaces:**

- `validateProducerSample()` also validates an optional maintained manifest and its structural local-asset boundary.
- `buildProducerRenderJobs({manifest})` returns one metadata-backed video job and two code-rendered cover jobs.
- `producer:render` resolves a maintained registry manifest and supports `--dry-run`.

- [x] **Step 1: Add maintained manifest validation**

When `input.manifest` is present, require it to match `compositionId`, call `assertProducerSampleManifest()`, require its validation module and render/publishing paths in `sourceFiles`, and reject `http://`/`https://` asset paths. Keep current audio, registration, duration, and ignored-artifact checks unchanged for frozen fixture compatibility.

- [x] **Step 2: Update the validation CLI build closure**

Compile `src/remotion/producer-samples/manifest.ts` with `producer-validation.ts`. The scaffold validation exports `manifest: sampleNameManifest`; the fixture smoke adds one complete maintained case and one missing-cover rejection.

- [x] **Step 3: Implement pure render job planning**

For a maintained manifest, return:

```ts
[
  { kind: "video", command: "bash", args: ["scripts/render-video.sh", compositionId, slug, metadataPath] },
  { kind: "cover-16x9", command: "docker", args: ["compose", "run", "--rm", "producer", "npx", "remotion", "still", "..."] },
  { kind: "cover-9x16", command: "docker", args: ["compose", "run", "--rm", "producer", "npx", "remotion", "still", "..."] },
]
```

Output paths are `out/<slug>/<slug>.mp4`, `out/<slug>/<slug>.json`, `out/<slug>/<slug>-cover-16x9.png`, and `out/<slug>/<slug>-cover-9x16.png`.

- [x] **Step 4: Implement the render CLI**

Usage:

```bash
npm run producer:render -- --composition <composition-id> [--dry-run]
```

It compiles/imports the registry and render planner, rejects unknown or frozen-reference compositions, prints deterministic jobs in dry-run mode, and otherwise runs them sequentially with inherited stdio. It does not approve visual quality.

- [x] **Step 5: Verify render-plan GREEN without rendering artifacts**

The Phase 4 smoke imports the scaffold manifest, asserts all three jobs and four output paths, and invokes no Remotion render.

### Task 5: Align Active Authorities And Guards

**Files:** all active docs, skill, inventory, architecture/skill smokes, and package scripts listed in Scope.

- [x] **Step 1: Mark Phase 4 complete**

Set inventory `completedPhases` to `[0, 1, 2, 3, 4]`. Update Roadmap header and Phase 4 implementation evidence. `FINAL_PRODUCT_GOAL`, `ITERATION_STATUS`, README, and AGENTS state Phase 4 complete and Phase 5 next/unstarted.

- [x] **Step 2: Document the four mandatory future commands**

Current entry docs and the Agent Producer skill must route future samples through:

```bash
npm run producer:scaffold -- --name <CompositionName> --slug <slug>
npm run producer:validate -- --module <validation-module>
npm run producer:stills -- --composition <composition-id>
npm run producer:render -- --composition <composition-id>
```

- [x] **Step 3: Distinguish current, frozen, removed, and next**

Docs explicitly distinguish strict maintained future manifests, frozen registry references, removed Web/F5/recipe-template productization, and the not-yet-started Phase 5 asset supply system.

- [x] **Step 4: Update promotion/component docs**

Promotion decisions are sample-local, primitive, block, effect, transition, or style profile. No current doc describes recipe/template promotion. Component inventory points to strict future scaffold/registry status.

- [x] **Step 5: Strengthen architecture and skill guards**

Require Phase 4 commands, strict manifest phrases, `completedPhases` through `4`, and no recipe/template/productization vocabulary in active Producer Sample OS files. Keep historical/archive and frozen composition exceptions explicit.

- [x] **Step 6: Record unchanged operational surfaces**

No `.env.example`, Docker Compose, provider transport, Remotion package version, or frozen composition change is needed. Current docs state these surfaces remain unchanged because Phase 4 composes existing tooling rather than adding a provider or service.

### Task 6: Full Phase 4 Verification, Review, And One Commit

- [x] **Step 1: Run focused GREEN smokes**

```bash
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run smoke:producer-os && npm run smoke:producer-sample-manifest && npm run smoke:producer-promotion-gate && npm run smoke:producer-validation && npm run smoke:producer-review-frames && npm run smoke:agent-producer-architecture && npm run smoke:agent-producer-web-removal && npm run smoke:skill-alignment && npm run smoke:producer-audio-direct-voxcpm && npm run smoke:producer-audio-tools && npm run smoke:standalone-video-runtime'
```

- [x] **Step 2: Run Docker-first type/build/composition gates**

```bash
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npx tsc --noEmit --pretty false'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run lint'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run build'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npx remotion compositions src/remotion/index.ts'
```

Report repository-wide lint against the existing 39-error/2-warning baseline; do not claim a clean lint gate unless the output is actually clean.

- [x] **Step 3: Run changed-file lint and format checks**

Run ESLint only on changed JS/MJS/TS/TSX files and Prettier `--check` on every changed supported source/doc/JSON file. Run `bash -n scripts/render-video.sh` and `docker compose config --quiet`. No representative still is required because no registered render code or finished composition changes; the new scaffold cover is covered by TypeScript and pure job planning until a real future sample registers it.

- [x] **Step 4: Run forbidden, frozen, and artifact scans**

Require no recipe/template productization in current Sample OS files, no Web/F5 restoration, no image/video generation path, no changed finished composition, and no tracked generated/private artifact. Run `git diff --check`.

- [x] **Step 5: Re-read plan and Roadmap acceptance**

Verify scaffold, single registry, validation, review, render, covers, publishing location, frozen boundary, active docs, and stop condition against fresh evidence.

- [x] **Step 6: Stage only Phase 4 files and commit once**

```bash
git add .agents/skills/ai-video-studio-agent-producer/SKILL.md AGENTS.md README.md docs package.json scripts src/remotion/producer-samples
git diff --cached --check
git diff --cached --stat
git commit -m "feat: consolidate agent producer operating system"
git status --short --branch
```

## RED Evidence Required For Handoff

- Existing `smoke:producer-sample-manifest` exits `1` after its manifest stage because the old promotion smoke requires recipe/template decisions missing from active Producer-only docs.
- New `smoke:producer-os` exits `1` on a missing Phase 4 command/file before production implementation.

## GREEN Evidence Required For Handoff

- strict manifest, scaffold, render-plan, promotion, validation, review, architecture, skill, direct VoxCPM, and standalone smokes pass
- isolated scaffold creation passes without touching `src/remotion/Root.tsx`
- Docker typecheck, build, and composition listing pass
- repository lint result is reported truthfully against baseline
- changed-file ESLint and Prettier pass
- forbidden/frozen/artifact scans and `git diff --check` pass
- no real render or local generated artifact is created or committed

## Documentation Alignment Boundary

Align README, AGENTS, FINAL_PRODUCT_GOAL, ITERATION_STATUS, the active Roadmap, promotion gate, component inventory, removal inventory, Agent Producer skill, scripts/remotion knowledge bases, package scripts, and this plan. `VISUAL_RECIPE_ROADMAP.md` remains a superseded compatibility pointer. VoxCPM provider docs, `.env.example`, and Compose remain current and unchanged unless a guard exposes an inconsistency.

## Commit Boundary And Stop Condition

Create exactly one commit containing only Phase 4 contract consolidation, scaffold/render entrypoints, focused smokes, and active-document alignment. Stop after commit/status verification. Do not begin Phase 5, do not push, do not clean unrelated Docker or local artifact state.

## Plan Self-Review

- Spec coverage: every Roadmap Phase 4 deliverable maps to Tasks 2–5; acceptance and full validation map to Task 6.
- Placeholder scan: no implementation placeholder, ambiguous deferred step, or unbounded follow-up remains.
- Type consistency: the maintained manifest fields consumed by validation, scaffold, registry filtering, and render planning use the same names.
- Scope check: Phase 5 asset supply, Phase 6 capabilities, frozen composition migration, and real rendering remain explicitly excluded.

## Execution Record

- RED: the pre-Phase 4 bundled promotion smoke exited `1` with `Docs must describe each Promotion Gate decision`; the new Producer OS smoke exited `1` with `Missing Phase 4 command: producer:scaffold`.
- GREEN: Producer OS, manifest, promotion, validation, review-frame, architecture, Web-removal, skill, direct VoxCPM, audio-tooling, and standalone-runtime smokes pass in Docker.
- Docker gates: TypeScript, Remotion bundle build, and the 19-composition listing pass. Bundle output includes a non-fatal webpack cache rename warning.
- Lint: repository-wide Docker lint remains at 39 historical errors plus 2 ignored generated warnings; changed-file ESLint and Prettier pass.
- CLI checks: the fixture validation command passes, and `producer:render` fails closed for the frozen `UvOpenSourceBrief` reference.
- Boundary checks: Node/shell/Compose syntax, legacy productization, stale status, frozen composition, artifact/private-media, secret, render-animation, and `git diff --check` scans pass.
- Documentation: active authorities, handoff, inventory, Producer skill, promotion gate, component inventory, and local knowledge bases are aligned. Provider docs, `.env.example`, Compose, and the superseded visual-recipe pointer remain unchanged by design.
- Stop: Phase 4 is complete; Phase 5 remains unstarted. No render artifact was created and no push is authorized.
