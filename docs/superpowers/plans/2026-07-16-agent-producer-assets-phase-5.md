# Agent Producer Asset Supply Phase 5 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete Roadmap Phase 5 by making every maintained sample's existing media local, manifest-backed, licensed, checksummed, mechanically preflighted, and safe to render before representative stills.

**Architecture:** Add a pure Producer asset contract beside the maintained sample manifest and a Node-owned `scripts/lib/producer-assets/` runtime for manual/URL localization, deterministic serialization, SHA-256 integrity, media probing, FFmpeg normalization, and file-system preflight. Replace the Phase 4 lightweight `assets[]` field with one required asset-manifest path, then make maintained validation, still, and render commands resolve that manifest and fail closed before rendering. Keep all finished compositions and their registry entries frozen; only the unregistered catalog primitives with remote default images receive code-rendered fallbacks.

**Tech Stack:** TypeScript 5.9, Node.js ESM/CommonJS smoke builds, Node `fetch`, SHA-256, FFmpeg/ffprobe, React 19, Remotion 4.0.467, Docker Compose, JSON/Markdown contracts, CodeGraph, Git.

## Global Constraints

- Execute inline in `/data/projects/labs/ai-video-studio` on `refactor/agent-producer-service`; do not use subagents and do not create another worktree.
- `.agents/skills/ai-video-studio-agent-producer/` remains the only supported video-production entrypoint.
- Visual production uses code and existing assets only. Do not add image generation, video generation, ComfyUI, Web prompt generation, a planner, templates, or a universal scene DSL.
- VoxCPM remains the only narration provider for new work; Phase 5 does not alter narration transport or provider configuration.
- Do not edit, migrate, reformat, regenerate, or re-render any finished composition or historical `audio.generated.ts` metadata.
- Do not commit `voices/`, audio, video, screenshots, `public/generated/`, `out/`, private configuration, or generated render artifacts.
- `public/assets/library/` is for reviewed reusable existing assets; `public/generated/<slug>/assets/` is ignored composition-local working media.
- Formal render assets must be local. Missing, corrupt, undersized, unlicensed, attribution-incomplete, checksum-mismatched, duplicate, or unsupported media fails preflight.
- Video normalization is H.264, yuv420p, constant frame rate, AAC audio when audio exists, and fast-start MP4.
- Use frame-driven Remotion code only. The primitive fallback fixture contains no CSS animation, transition, or wall-clock behavior.
- Complete one Phase 5 commit, do not push, and stop before Phase 6.

## Current Repository Facts

- Starting commit: `d815fc4 feat: consolidate agent producer operating system`.
- Starting worktree: clean; no user edits require protection.
- Roadmap Phase 0 through Phase 4 are complete; Phase 5 is the next incomplete phase.
- `.codegraph/` exists and was used before direct source scans.
- Phase 4 exposes `producer:scaffold`, `producer:validate`, `producer:stills`, and `producer:render`.
- `MaintainedProducerSampleManifest.assets` is currently only `{id, localPath, purpose}[]`; it has no provenance, license, checksum, media metadata, or manifest file.
- `validateProducerSample()` checks manifest structure, audio, Root registration, and ignored artifact roots; it does not inspect asset files.
- `producer:stills` and `producer:render` do not run asset preflight.
- No maintained real sample is registered; all current registry entries are `frozen-reference`.
- `ZoomPulse`, `KenBurns`, and `ParallaxPan` have remote default image URLs and are reached only through the unregistered primitive catalog preview.
- Docker installs FFmpeg/ffprobe. No new npm media dependency is required.
- Whole-repository Docker lint has a historical baseline of 39 errors plus 2 warnings; changed files must be clean without claiming a clean repository-wide lint gate.

## Dependency And Call-Chain Evidence

CodeGraph established these current paths:

```txt
MaintainedProducerSampleManifest
  -> scaffold SampleName/manifest.ts
  -> assertProducerSampleManifest()
  -> producer validation and render job planning

producer:validate
  -> validation module producerValidationInput
  -> validateProducerSample()
  -> manifest/audio/registration/artifact checks

producer:stills
  -> registry lookup
  -> buildProducerReviewFrameJobs()
  -> npx remotion still

producer:render
  -> registry lookup
  -> buildProducerRenderJobs()
  -> render-video.sh plus two Remotion Still jobs

PrimitiveCatalogPreview
  -> KenBurns / ParallaxPan / ZoomPulse
  -> current remote default image URLs
  -> no finished-composition caller
```

The Phase 5 design inserts `preflightProducerAssets()` after maintained manifest lookup and before the first still/video spawn. Frozen references retain their current discovery and dry-run behavior.

## Scope

### Create

- `src/remotion/producer-samples/asset-manifest.ts` — pure `ProducerAssetManifest` types and structural assertion.
- `scripts/lib/producer-assets/types.ts` — supply-plan and injectable runtime types.
- `scripts/lib/producer-assets/serialize.ts` — stable manifest serialization and parsing.
- `scripts/lib/producer-assets/metadata.ts` — SVG/Lottie and ffprobe metadata extraction.
- `scripts/lib/producer-assets/localize.ts` — manual/URL localization, checksum, duplicate detection, and FFmpeg normalization.
- `scripts/lib/producer-assets/preflight.ts` — file, hash, size, license, attribution, dimensions, duration, codec, and path verification.
- `scripts/lib/producer-assets/index.ts` — supported Producer asset exports.
- `scripts/producer-assets.mjs` — `producer:assets -- --manifest <supply-plan-json>`.
- `scripts/preflight-producer-assets.mjs` — `producer:preflight -- --composition <id>` plus direct `--manifest` fixture mode.
- `scripts/producer-assets-smoke.mjs` — focused Phase 5 RED/GREEN coverage.
- `scripts/fixtures/producer-assets/PrimitiveAssetFallbackFixture.tsx` — isolated representative still entrypoint for the three code fallbacks.
- `src/remotion/producer-samples/scaffold/SampleName/assets.supply.json` — empty reproducible supply-plan example.
- `src/remotion/producer-samples/scaffold/SampleName/assets.manifest.json` — empty strict final asset manifest.
- `docs/PRODUCER_ASSET_CONTRACT.md` — active operator and schema contract.
- `public/assets/library/README.md` — reusable licensed-asset boundary.

### Modify

- `src/remotion/producer-samples/manifest.ts`
- `src/remotion/producer-samples/index.ts`
- `src/remotion/producer-samples/scaffold/README.md`
- `src/remotion/producer-samples/scaffold/SampleName/{manifest.ts,validation.ts}`
- `scripts/lib/producer-validation.ts`
- `scripts/validate-producer-sample.mjs`
- `scripts/render-producer-review-frames.mjs`
- `scripts/render-producer-sample.mjs`
- `scripts/agent-producer-os-smoke.mjs`
- `scripts/producer-validation-smoke.mjs`
- `scripts/agent-producer-architecture-smoke.mjs`
- `scripts/skill-alignment-smoke.mjs`
- `src/remotion/primitives/cinematic/{KenBurns.tsx,ParallaxPan.tsx,ZoomPulse.tsx}`
- `package.json`
- `.agents/skills/ai-video-studio-agent-producer/SKILL.md`
- `README.md`, `AGENTS.md`, `scripts/AGENTS.md`, `src/remotion/AGENTS.md`
- `docs/FINAL_PRODUCT_GOAL.md`, `docs/ITERATION_STATUS.md`
- `docs/AGENT_PRODUCER_ONLY_ROADMAP.md`
- `docs/REMOTION_COMPONENT_LIBRARY.md`
- `docs/architecture/agent-producer-only-removal-inventory.json`
- this plan

### No deletions

Phase 5 deletes no composition, historical compatibility module, narration provider file, private file, or local generated artifact.

## Explicit Non-Goals

- no Phase 6 Remotion dependency version gate, effects/transitions packages, capability showcase, or text-fit system
- no Phase 7 dynamic-video block, Lottie/Rive runtime, SFX/BGM, ducking, or sound validation
- no actual new topic video and no migration of a finished video into the maintained contract
- no automatic browser capture implementation; a successful real capture is recorded as a normal image asset with provider/source URL/license metadata, while capture orchestration remains agent-owned
- no runtime fallback when an evidence asset is missing; the agent redesigns the scene as an honest code information graphic
- no arbitrary remote URLs in render code
- no repository-wide lint cleanup
- no push

## Frozen And Historical Boundary

- Every current registry entry remains `sampleStatus: "frozen-reference"` and does not receive a new asset manifest.
- No file under a finished `src/remotion/<CompositionName>/` directory changes.
- Historical `provider: "f5-tts"` metadata stays truthful.
- `src/remotion/recipes/blocks/`, `src/remotion/recipes/timing/`, `src/lib/caption-schema.ts`, `src/lib/storyboard-plan-schema.ts`, and `src/lib/template-registry.ts` remain read-only compatibility.
- Generated/local files under `public/generated/`, `out/`, and `voices/` are neither deleted nor staged.

---

### Task 1: Add And Observe The Phase 5 RED Guard

**Files:**

- Create: `scripts/producer-assets-smoke.mjs`
- Modify: `package.json`

**Interfaces:**

- Produces npm command `smoke:producer-assets`.
- Establishes the exact Phase 5 command/file surface before production implementation.

- [x] **Step 1: Write the focused smoke target checks**

The first assertions require:

```js
for (const command of ["producer:assets", "producer:preflight", "smoke:producer-assets"]) {
  assert(packageJson.scripts[command], `Missing Phase 5 command: ${command}`);
}
for (const file of [
  "src/remotion/producer-samples/asset-manifest.ts",
  "scripts/lib/producer-assets/index.ts",
  "scripts/producer-assets.mjs",
  "scripts/preflight-producer-assets.mjs",
  "src/remotion/producer-samples/scaffold/SampleName/assets.supply.json",
  "src/remotion/producer-samples/scaffold/SampleName/assets.manifest.json",
  "docs/PRODUCER_ASSET_CONTRACT.md",
]) assert(existsSync(file), `Missing Phase 5 surface: ${file}`);
```

The same smoke later covers contract validation, deterministic serialization, manual and mocked URL localization, SHA-256, duplicate rejection, SVG metadata, a real FFmpeg-normalized video fixture, license/attribution failures, missing/tampered/undersized files, and primitive remote-default source scans.

- [x] **Step 2: Register the command and run RED in Docker**

```bash
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run smoke:producer-assets'
```

Expected: exit `1` with `Missing Phase 5 command: producer:assets` or the first missing Phase 5 surface, not a dependency or syntax failure.

### Task 2: Add The Asset Contract, Serializer, And Localization Runtime

**Files:** all new contract/runtime/CLI files listed in Scope plus package scripts.

**Interfaces:**

```ts
export type ProducerAsset = {
  readonly id: string;
  readonly kind: "image" | "video" | "svg" | "audio" | "font" | "lottie" | "rive" | "gltf" | "texture";
  readonly localPath: string;
  readonly purpose: string;
  readonly source: {
    readonly provider: string;
    readonly sourceUrl?: string;
    readonly sourceId?: string;
    readonly creator?: string;
    readonly license: string;
    readonly attribution?: string;
    readonly attributionRequired?: boolean;
  };
  readonly integrity: { readonly sha256: string; readonly sizeInBytes: number };
  readonly media?: {
    readonly width?: number;
    readonly height?: number;
    readonly durationInSeconds?: number;
    readonly fps?: number;
    readonly codec?: string;
    readonly audioCodec?: string;
    readonly pixelFormat?: string;
    readonly sampleRate?: number;
    readonly constantFrameRate?: boolean;
  };
  readonly requirements?: {
    readonly minWidth?: number;
    readonly minHeight?: number;
    readonly minDurationInSeconds?: number;
  };
};

export type ProducerAssetManifest = {
  readonly version: 1;
  readonly compositionId: string;
  readonly slug: string;
  readonly assets: readonly ProducerAsset[];
};
```

- [x] **Step 1: Implement strict structural assertions**

Require version `1`, non-empty composition/slug, unique ids/local paths/SHA-256 values, repository-relative local paths under `public/assets/library/` or `public/generated/<slug>/assets/`, non-empty purpose/provider/license, valid lowercase 64-character SHA-256, positive size, attribution when explicitly required, and kind-appropriate positive media/requirement values. Reject generation fields named `prompt`, `seed`, `model`, or `workflow` anywhere in parsed JSON.

- [x] **Step 2: Implement deterministic parse/serialize**

`serializeProducerAssetManifest()` validates first and returns two-space JSON with a trailing newline. `parseProducerAssetManifest()` parses untrusted JSON, validates it, and returns the typed manifest. Preserve supply-plan order; do not add timestamps or absolute paths.

- [x] **Step 3: Implement metadata and integrity extraction**

Use SHA-256 and file stat for every asset. Parse SVG width/height/viewBox and Lottie `w/h/fr/ip/op` directly. Use ffprobe JSON for raster image, video, and audio streams. Normalize rational FPS and detect constant-frame-rate equality from `avg_frame_rate` and `r_frame_rate`.

- [x] **Step 4: Implement manual and URL localization**

The supply plan uses an explicit acquisition union:

```ts
type ProducerAssetAcquisition =
  | { readonly type: "manual"; readonly sourcePath: string }
  | { readonly type: "url"; readonly url: string };
```

Copy/read only the named input, write through a temporary sibling path, reject non-HTTP(S) URL acquisition, require URL source metadata to match the acquisition URL, and never persist an absolute source path in the final manifest.

- [x] **Step 5: Normalize video and reject duplicates**

All localized video requests run FFmpeg with H.264, yuv420p, CFR, optional AAC audio, and fast-start output. After probing and hashing, reject duplicate checksums before writing the final manifest. Clean only temporary files created by this command on failure.

- [x] **Step 6: Implement `producer:assets`**

```bash
npm run producer:assets -- --manifest <supply-plan-json>
```

Resolve the plan inside or outside the repo, require its output manifest path inside the repo, localize sequentially, write the strict final manifest, and print only asset ids/local paths plus the final manifest path. Do not log private manual source paths.

### Task 3: Add Mechanical Preflight And Put It Before Rendering

**Files:** preflight runtime/CLI, maintained manifest contract, validation, still/render CLIs, scaffold assets/validation.

**Interfaces:**

- `preflightProducerAssets({manifest, rootDir, execFileImpl?}): Promise<void>`.
- `producer:preflight -- --composition <id>` resolves a maintained registry manifest.
- `producer:preflight -- --manifest <asset-manifest-json>` supports isolated fixtures.

- [x] **Step 1: Implement file-system preflight**

For each asset, require a regular readable file, recalculate size/SHA-256, reprobe media, compare recorded metadata, enforce minimum dimensions/duration, and reject duplicates. Video must report H.264, yuv420p, CFR, and AAC when an audio stream exists. Missing, corrupt, remote, traversal, or mismatched assets fail with the asset id in the error.

- [x] **Step 2: Replace lightweight maintained assets with a manifest pointer**

Change maintained sample shape to:

```ts
readonly assets: { readonly manifestPath: string };
```

Add source kind `asset-manifest`, require the path in `sourceFiles`, and retain every frozen manifest unchanged. The scaffold points to `src/remotion/SampleName/assets.manifest.json`.

- [x] **Step 3: Compose asset structure into `producer:validate`**

The scaffold validation imports `assets.manifest.json` and passes `assetManifest`. `validateProducerSample()` asserts composition/slug/path agreement between the maintained sample and asset manifest. Existing frozen fixtures may omit both fields.

- [x] **Step 4: Gate maintained stills and render**

After registry lookup and before job planning/spawn, `render-producer-review-frames.mjs` and `render-producer-sample.mjs` load the maintained asset manifest and call `preflightProducerAssets()`. Frozen `producer:stills` keeps its existing behavior; `producer:render` remains closed to frozen references.

- [x] **Step 5: Add both scaffold JSON files**

The supply plan and final manifest are valid empty Phase 5 examples with `SampleName`/`sample-name` tokens. The scaffold smoke must verify they are copied and tokenized.

### Task 4: Remove Remote Primitive Defaults And Verify A Representative Still

**Files:** three cinematic primitives, fixture entrypoint, focused smoke.

- [x] **Step 1: Add the source guard before editing primitives**

Require no `http://` or `https://` in `src/remotion/primitives/`. Expected RED is the three known default URLs.

- [x] **Step 2: Replace remote defaults with code fallbacks**

Keep optional `imageUrl` props for callers. When provided, render `<Img src={imageUrl}>`; when omitted, render a deterministic code-only gradient/shape fallback under the same frame-driven transform. Do not silently substitute another media file and do not describe the fallback as a screenshot.

- [x] **Step 3: Render and inspect the isolated fixture**

```bash
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npx remotion still scripts/fixtures/producer-assets/PrimitiveAssetFallbackFixture.tsx PrimitiveAssetFallbackFixture /tmp/primitive-asset-fallback.png --frame=45'
```

Inspect `/tmp/primitive-asset-fallback.png` for three visible code fallbacks, no blank panels, and no overlap. The PNG stays outside the repository and is not committed.

### Task 5: Align Active Authorities, Guards, And Operator Documentation

**Files:** all active docs/skill/inventory/guards listed in Scope.

- [x] **Step 1: Mark Phase 5 complete**

Set inventory `completedPhases` to `[0, 1, 2, 3, 4, 5]`; add Producer asset contract/runtime ownership. Update Roadmap header and Phase 5 implementation evidence. `FINAL_PRODUCT_GOAL`, `ITERATION_STATUS`, README, and AGENTS state Phase 5 complete and Phase 6 next/unstarted.

- [x] **Step 2: Document the six mandatory future commands**

```bash
npm run producer:scaffold -- --name <CompositionName> --slug <slug>
npm run producer:assets -- --manifest <supply-plan-json>
npm run producer:preflight -- --composition <composition-id>
npm run producer:validate -- --module <validation-module>
npm run producer:stills -- --composition <composition-id>
npm run producer:render -- --composition <composition-id>
```

- [x] **Step 3: Document provenance, capture, and failure rules**

The asset contract doc and Agent Producer skill explain manual files, URL localization, real capture records, licenses/attribution, library vs composition-local paths, normalization, and preflight. Failed capture remains an agent-authored external record followed by an honest code information graphic; there is no fabricated screenshot or runtime fallback.

- [x] **Step 4: Strengthen architecture and skill guards**

Require Phase 5 commands/files/status, reject remote primitive defaults, reject generation-model asset fields, and keep all frozen/archive exceptions explicit.

- [x] **Step 5: Record unchanged operational surfaces**

VoxCPM docs, `.env.example`, Compose, Remotion dependency versions, Root registrations, and frozen composition files remain unchanged unless verification exposes a direct inconsistency.

### Task 6: Full Phase 5 Verification, Review, And One Commit

- [x] **Step 1: Run focused GREEN smokes**

```bash
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run smoke:producer-assets && npm run smoke:producer-os && npm run smoke:producer-sample-manifest && npm run smoke:producer-promotion-gate && npm run smoke:producer-validation && npm run smoke:producer-review-frames && npm run smoke:agent-producer-architecture && npm run smoke:agent-producer-web-removal && npm run smoke:skill-alignment && npm run smoke:producer-audio-direct-voxcpm && npm run smoke:producer-audio-tools && npm run smoke:standalone-video-runtime'
```

- [x] **Step 2: Run Docker-first gates**

```bash
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npx tsc --noEmit --pretty false'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run lint'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run build'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npx remotion compositions src/remotion/index.ts'
```

Report repository-wide lint against the existing 39-error/2-warning baseline. Do not claim a clean lint gate unless the output is actually clean.

- [x] **Step 3: Run changed-file style and syntax checks**

Run ESLint on changed JS/MJS/TS/TSX files, Prettier `--check` on all changed supported files, `bash -n` on retained changed shell files if any, `docker compose config --quiet`, JSON parse checks for scaffold/architecture files, and `git diff --check`.

- [x] **Step 4: Run forbidden, frozen, and artifact scans**

Require no remote URL in primitives; no image/video generation, F5, Web, planner, or template restoration; no changed finished composition; no tracked `public/generated`, `out`, voice, audio, video, screenshot, secret, or temporary build file.

- [x] **Step 5: Re-read plan and Roadmap Phase 5 acceptance**

Verify every asset record is strict/local/licensed/checksummed, both localization adapters work, media metadata/normalization is real, preflight gates maintained stills, remote primitive defaults are gone, docs are aligned, and Phase 6 remains untouched.

- [x] **Step 6: Stage only Phase 5 files and commit once**

```bash
git add .agents/skills/ai-video-studio-agent-producer/SKILL.md AGENTS.md README.md docs package.json public/assets/library scripts src/remotion/producer-samples src/remotion/primitives/cinematic
git diff --cached --check
git diff --cached --stat
git commit -m "feat: add producer asset supply and preflight"
git status --short --branch
```

## RED Evidence Required For Handoff

- New `smoke:producer-assets` exits `1` on the first missing Phase 5 command/surface before production implementation.
- The primitive remote-default guard exits `1` on the three known catalog primitive URLs before their code fallbacks are implemented.

## GREEN Evidence Required For Handoff

- strict asset contract, deterministic serializer, manual/URL localization, SHA-256, duplicate detection, media probing, video normalization, license/attribution, and preflight smoke cases pass
- maintained scaffold contains supply/final asset manifests and validation agreement
- maintained still/render entrypoints preflight before spawning Remotion/FFmpeg jobs
- representative primitive fallback still renders and is visually inspected
- Docker typecheck, build, and composition listing pass
- repository lint result is reported truthfully against baseline
- changed-file ESLint and Prettier pass
- forbidden/frozen/artifact scans and `git diff --check` pass
- no finished composition or generated/private artifact changes

## Documentation Alignment Boundary

Align README, AGENTS, FINAL_PRODUCT_GOAL, ITERATION_STATUS, the active Roadmap, asset contract, component inventory, removal inventory, Agent Producer skill, scripts/remotion knowledge bases, package scripts, public asset library convention, and this plan. `VISUAL_RECIPE_ROADMAP.md` remains a superseded pointer. VoxCPM provider docs, `.env.example`, Compose, and Root remain unchanged unless verification proves an inconsistency.

## Commit Boundary And Stop Condition

Create exactly one commit containing only Phase 5 asset contract/localization/preflight tooling, maintained Sample OS integration, remote primitive-default removal, focused tests, and active-document alignment. Stop after commit/status verification. Do not begin Phase 6, do not push, and do not clean unrelated Docker or local artifact state.

## Plan Self-Review

- Spec coverage: every Roadmap Phase 5 deliverable maps to Tasks 2–5; acceptance and full validation map to Task 6.
- Placeholder scan: no `TBD`, deferred implementation placeholder, relaxed allowlist, or unbounded cleanup remains.
- Type consistency: `ProducerAssetManifest`, sample `assets.manifestPath`, validation `assetManifest`, and both preflight CLIs use the same field names.
- Scope check: Phase 6 capabilities, Phase 7 media/sound, frozen composition migration, browser capture automation, and real publication rendering remain explicitly excluded.

## Execution Record

- RED 1: Docker `smoke:producer-assets` exited `1` because `src/remotion/producer-samples/asset-manifest.ts` did not exist.
- RED 2: after the contract surface existed, the same smoke exited `1` because the three cinematic primitives still contained remote default URLs.
- RED 3: Producer OS smoke exited `1` because maintained review-frame rendering did not yet invoke asset preflight.
- GREEN: all twelve focused smoke commands passed in the Docker `producer` service.
- Docker gates: TypeScript, Remotion build, and composition discovery passed. Repository-wide lint remains the unchanged historical baseline of 39 errors and 2 warnings; changed-file ESLint passed.
- Style/config: changed-file Prettier, Compose config, scaffold/inventory JSON parsing, and `git diff --check` passed.
- Visual review: the isolated frame-45 primitive fixture rendered three visible code fallbacks with no blank panel or overlap. The still remains ignored under `out/phase5-verification/`.
- Boundary review: no finished composition, frozen provider metadata, Root registration, VoxCPM surface, dependency version, generated/private media, or forbidden legacy architecture path changed.
- Operational note: a host-only smoke attempt failed because host `node_modules` lacked TypeScript; the authoritative Docker rerun passed and is the evidence recorded above.
- Stop boundary: Phase 6 remains unstarted and no push is authorized.
