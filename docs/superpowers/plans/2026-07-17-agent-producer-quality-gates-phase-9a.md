# Agent Producer Quality Gates Phase 9A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the first bounded Phase 9 slice by adding one future-only deterministic quality-gate contract and executable CLI that closes layout, evidence, review-frame, rendered-frame, final-artifact, and Git-tracking failures without changing any completed composition.

**Architecture:** Keep the existing asset preflight and Producer validation as the owners of remote/missing media, provenance/license, codec, audio alignment, caption-control, Root registration, clipping, and silence failures. Add `scripts/lib/producer-quality-gates.ts` for the remaining deterministic contracts and `scripts/lib/producer-quality-analysis.ts` for FFmpeg/ffprobe/Git evidence collection. A new `producer:quality` CLI loads a composition-owned quality module, collects fresh rendered-frame and MP4 evidence, and fails closed. The scaffold and strict future manifest subtype require the module for every post-Phase-9 sample, while the completed Phase 7/8 maintained proofs remain source-compatible and read-only.

**Tech Stack:** TypeScript 5.9, Node.js ESM, FFmpeg/ffprobe, Remotion 4.0.489, Docker Compose, CodeGraph, ESLint, Prettier, Git.

## Global Constraints

- `.agents/skills/ai-video-studio-agent-producer/` remains the only supported video-production entrypoint.
- Visual production uses code and existing assets only; image/video generation and the removed Web product remain forbidden.
- Completed/frozen compositions, historical metadata, `recipes/{blocks,timing}`, private voices, and ignored/generated artifacts are read-only or local-only.
- The quality runtime may reject deterministic failures only; it must not score aesthetics or auto-approve creative quality.
- Phase 9B final acceptance video and final Roadmap completion remain unstarted.
- Do not push.

---

## Current Repository Facts

- Starting branch: `refactor/agent-producer-service`.
- Starting commit: `9494c39 feat: prove producer style profiles in real compositions`.
- The tracked worktree is clean and has no user changes to protect.
- Phase 0 through Phase 8 are complete. Phase 9 is next and has not started.
- Fresh Docker baselines pass for Producer validation, review frames, assets, architecture, and skill alignment.
- Repository-wide Docker lint has the documented historical baseline of 39 errors and 2 warnings; changed files must be clean.
- Existing asset preflight already owns remote/missing/unreadable media, codec/metadata, license/provenance, clipping, and silence failures.
- Existing Producer validation already owns Root registration, narration/scene/caption alignment, visible caption control tags, and ignored artifact roots.
- Missing shared ownership remains for measured text overflow, safe margins, evidence resolution, planned-vs-rendered review-frame coverage, near-blank/low-contrast frames, MP4/metadata/chapter agreement, and actually tracked generated artifacts.
- `docs/VISUAL_RECIPE_ROADMAP.md` is a superseded compatibility pointer. There is no active handoff document.

## Design Selection

1. One all-in Phase 9 commit would combine gate runtime, documentation cleanup, and a new real video; it is too large for one bounded review.
2. Documentation-only cleanup would not close the mechanical regression boundary and is therefore insufficient.
3. Selected: Phase 9A implements all deterministic gates and the forward-only contract; Phase 9B will produce the final acceptance video, run the gates on it, finish documentation cleanup, and close the Roadmap.

## Explicit Scope

### Create

- `scripts/lib/producer-quality-gates.ts` — pure contracts and fail-closed deterministic assertions.
- `scripts/lib/producer-quality-analysis.ts` — FFmpeg gray-frame analysis, ffprobe artifact inspection, metadata loading, and Git tracked-path inspection.
- `scripts/validate-producer-quality.mjs` — `producer:quality --module <quality-module>` CLI.
- `scripts/producer-quality-gates-smoke.mjs` — focused Phase 9A static/runtime/CLI/docs RED/GREEN guard.
- `scripts/fixtures/producer-quality/fixture-plan.ts` — repository-local real-CLI smoke plan with two chapter boundaries.
- `src/remotion/producer-samples/scaffold/SampleName/quality.ts` — future-sample quality plan/input template.
- this plan — RED/GREEN, verification, and closure evidence.

### Modify

- `src/remotion/producer-samples/manifest.ts` — add `qualityModule` compatibility field, strict `QualityGatedMaintainedProducerSampleManifest`, source ownership kind, and validation.
- `src/remotion/producer-samples/scaffold/SampleName/manifest.ts` — require the new strict subtype and quality module.
- `src/remotion/producer-samples/scaffold/README.md` — insert `producer:quality` after render and before promotion/handoff.
- `scripts/agent-producer-os-smoke.mjs`, `scripts/producer-sample-manifest-smoke.mjs`, `scripts/producer-validation-smoke.mjs` — require the future quality contract while preserving completed maintained proofs.
- `scripts/agent-producer-architecture-smoke.mjs`, `scripts/skill-alignment-smoke.mjs`, `scripts/AGENTS.md`, `package.json` — expose and guard the Phase 9A runtime.
- `AGENTS.md`, `README.md`, `docs/FINAL_PRODUCT_GOAL.md`, `docs/ITERATION_STATUS.md`, `docs/AGENT_PRODUCER_ONLY_ROADMAP.md`, `docs/REMOTION_COMPONENT_LIBRARY.md`, `docs/PRODUCER_PROMOTION_GATE.md`, `docs/architecture/agent-producer-only-removal-inventory.json`.
- `.agents/skills/ai-video-studio-agent-producer/SKILL.md`, `.agents/skills/remotion-best-practices/SKILL.md`, `src/remotion/AGENTS.md`.

### No deletions

Phase 9A deletes no source, composition, provider, compatibility, ignored, private, or generated path.

## Explicit Non-Goals

- no Phase 9 final acceptance topic, research, narration, asset localization, composition, Root/registry entry, review render, cover, MP4, or publishing copy
- no claim that Phase 9 or the Roadmap is complete
- no retrofit or edit of `AgentProducerMediaSoundProof`, `TcpHandshakeEditorial`, `TcpHandshakeTerminal`, or any frozen composition
- no aesthetic score, automatic creative approval, automatic repair, OCR, object detection, or generated visual fallback
- no duplicate implementation of existing asset/audio/caption/Root gates
- no new dependency, Remotion version, provider, environment variable, Compose topology, or repository-wide lint cleanup
- no committed audio, video, screenshot, cover, `public/generated`, `out`, private voice/model, or secret
- no push

## Frozen And Artifact Boundary

- All completed dedicated compositions and their tracked metadata remain byte-for-byte unchanged.
- Existing maintained manifests may omit `qualityModule`; only the future scaffold satisfies the strict Phase 9 subtype.
- Synthetic smoke PNG/MP4/metadata fixtures live under `/tmp` and are deleted by the smoke command.
- The CLI reads ignored output but never mutates source or deletes user artifacts.
- Generated output paths must be both ignored and absent from `git ls-files`.

## Dependency And Call-Chain Evidence

```txt
future producer:scaffold
  -> QualityGatedMaintainedProducerSampleManifest
  -> qualityModule source ownership
  -> producer:validate / producer:stills / producer:render
  -> producer:quality --module <quality.ts>

quality.ts
  -> declared canvas/text/layout/evidence/review/artifact expectations
  -> collectProducerQualityEvidence()
     -> FFmpeg gray-frame bytes
     -> ffprobe JSON
     -> final metadata JSON
     -> git ls-files
  -> validateProducerQualityGateInput()
  -> deterministic failures only

existing producer:preflight + producer:validate
  -> remote/missing/license/codec/audio/caption/Root gates
  -> retained, invoked before producer:quality
```

CodeGraph identifies `assertProducerSampleManifest()` as the future manifest boundary, `validateProducerSample()` as the structural/audio boundary, `buildProducerReviewFrameJobs()` as the planned-still boundary, and `buildProducerRenderJobs()` plus `render-video.sh` as the artifact path. No current module owns the remaining cross-surface quality evidence.

---

### Task 1: Add And Observe The Phase 9A RED Guard

**Files:** create `scripts/producer-quality-gates-smoke.mjs`; modify `package.json`.

- [x] **Step 1: Add a focused static guard before production code**

Require these absent paths and package commands:

```js
for (const relativePath of [
  "scripts/lib/producer-quality-gates.ts",
  "scripts/lib/producer-quality-analysis.ts",
  "scripts/validate-producer-quality.mjs",
  "src/remotion/producer-samples/scaffold/SampleName/quality.ts",
]) {
  assert(existsSync(path.join(root, relativePath)), `Missing Phase 9A quality surface: ${relativePath}`);
}
assert(packageJson.scripts["producer:quality"]);
assert(packageJson.scripts["smoke:producer-quality-gates"]);
```

The compiled stage must test every new pure failure branch and a fully passing input. The static stage must require Phase 9A status/docs/skill/package ownership and scan quality runtime source for visual-generation, Web/F5, aesthetic scoring, and fallback tokens.

- [x] **Step 2: Run Docker RED**

Run:

```bash
docker compose run --rm producer bash -lc 'npm run smoke:producer-quality-gates'
```

Expected: exit `1` with `Missing Phase 9A quality surface: scripts/lib/producer-quality-gates.ts`, not Docker, syntax, or historical lint failure.

### Task 2: Implement The Pure Deterministic Gate Contract

**Files:** create `scripts/lib/producer-quality-gates.ts`.

- [x] **Step 1: Define explicit quality evidence**

Export `ProducerQualityGateInput` with canvas size, safe margins, text-layout measurements, visible bounds, evidence resolution, planned/rendered frames with luma statistics, expected/observed artifact metadata, and tracked artifact paths. Export `ProducerQualityGateThresholds` with defaults `minimumTextContrastRatio: 3`, `minimumFrameLumaStandardDeviation: 8`, `durationToleranceSeconds: 1 / fps`, and `chapterToleranceFrames: 1`.

- [x] **Step 2: Fail on layout, evidence, and still coverage**

Reject non-finite geometry, any text where `fits !== true` or measured width/height exceeds its box, text contrast below the threshold, visible bounds outside the canvas safe rectangle, unresolved evidence, missing/extra/duplicate rendered review frames, unreadable frames, or frames below the luma-deviation threshold.

- [x] **Step 3: Fail on final artifacts and Git tracking**

Require H.264 video, AAC audio, expected width/height/fps, duration agreement, metadata `durationInFrames`, ordered chapter start frames matching expected chapter durations, and zero tracked generated artifact path. Reject missing audio/video streams and non-finite measurements.

### Task 3: Collect Fresh Frame, Artifact, And Git Evidence

**Files:** create `scripts/lib/producer-quality-analysis.ts`, `scripts/validate-producer-quality.mjs`, and scaffold `quality.ts`.

- [x] **Step 1: Analyze each planned PNG with FFmpeg**

Decode each image to `64x64` gray rawvideo, compute mean and standard deviation from bytes, and return an unreadable failure on missing/invalid output. Do not use a new image dependency.

- [x] **Step 2: Inspect MP4 and metadata**

Use ffprobe JSON for video/audio codec, dimensions, rational fps, and duration. Load final metadata JSON, convert `HH:MM:SS(.sss)` chapter start times to frames, and preserve expected chapter durations from the quality module.

- [x] **Step 3: Inspect tracked artifacts**

Run `git ls-files` against every declared artifact file/root. Pass the exact tracked matches into the pure gate; ignored-but-tracked paths must fail.

- [x] **Step 4: Implement the CLI**

`producer:quality --module <quality-module>` compiles only the quality runtime plus the repository-local module, requires `producerQualityPlan`, collects evidence, runs the pure gate, and prints one success line. It rejects modules outside the repository and never writes source.

### Task 4: Make The Contract Mandatory For Future Scaffolds Only

**Files:** manifest types/assertion, scaffold manifest/quality/README, scaffold CLI, Producer OS/manifest/validation smokes.

- [x] **Step 1: Add compatible and strict types**

Add optional `qualityModule?: string` to `MaintainedProducerSampleManifest` and export:

```ts
export type QualityGatedMaintainedProducerSampleManifest =
  ProfiledMaintainedProducerSampleManifest & {
    readonly qualityModule: string;
  };
```

When present, require a repository-local path, source-file membership, and source kind `quality`. Existing completed maintained manifests remain valid without it.

- [x] **Step 2: Update the future scaffold**

Add `quality.ts`, set `qualityModule: "src/remotion/SampleName/quality.ts"`, add its source-file ownership, and make the scaffold manifest satisfy `QualityGatedMaintainedProducerSampleManifest`. The quality template declares safe margins, measured text/layout evidence hooks, evidence resolution, review-frame paths, expected render metadata, and ignored artifact roots; it contains no passing placeholder measurements masquerading as final evidence.

- [x] **Step 3: Extend contract smokes**

Require generated scaffolds to contain the quality module and strict subtype, reject remote/absolute/traversal quality paths, and explicitly prove all three completed maintained manifests remain unchanged and accepted through the compatibility branch.

### Task 5: Turn RED Into GREEN And Prove Real CLI Analysis

- [x] **Step 1: Run focused compiled GREEN**

Run `npm run smoke:producer-quality-gates` in Docker. The smoke creates temporary high-contrast and blank PNGs plus a short H.264/AAC MP4 and metadata JSON with FFmpeg, proves the real CLI accepts the good fixture, and proves blank/missing frame, artifact mismatch, unresolved evidence, unsafe bounds, overflow, low text contrast, and tracked artifact inputs fail for their exact reasons.

- [x] **Step 2: Run retained contract checks**

Run Producer validation, review frames, assets, OS, sample manifest/promotion, architecture, Web removal, version/capability/media/style-profile, and skill-alignment smokes. No completed composition render is needed because Phase 9A changes tooling/contracts only.

### Task 6: Align Active Authorities Without Claiming Phase 9 Complete

- [x] **Step 1: Record the Phase 9A/9B split**

Mark only `quality-gates` complete in `completedPhaseSlices`; keep Phase 9 out of `completedPhases`. State Phase 9B final acceptance video and final documentation/Roadmap closure are next and unstarted.

- [x] **Step 2: Route the final command order through the skill**

Document `producer:quality` after `producer:render` and before promotion/handoff. Clarify which failures remain in preflight/validate versus the new post-render gate, and state that aesthetic review remains agent-owned.

- [x] **Step 3: Check all active surfaces**

Align README, AGENTS, goal/status/Roadmap, component/promotion docs, removal inventory, both skills, local AGENTS, package scripts, and this execution record. Keep provider docs, asset contract, `.env.example`, Compose, superseded Visual Recipe pointer, and archived docs unchanged unless a direct conflict appears.

### Task 7: Docker-First Closure, Review, And One Commit

- [x] **Step 1: Run full Docker gates**

Run Docker typecheck, repository lint, build, and Remotion composition listing. Typecheck/build/listing must pass; report lint honestly against the 39-error/2-warning baseline.

- [x] **Step 2: Run changed-file and boundary checks**

Run changed-file ESLint and Prettier, JSON parsing, Compose config, `git diff --check`, forbidden scans, frozen-composition diff scan, generated/private artifact scan, and staged secret/binary scan.

- [x] **Step 3: Review and create one bounded commit**

Stage only Phase 9A quality runtime/contracts/smokes/docs and this plan. Create:

```bash
git commit -m "chore: enforce producer quality gates"
```

Record the hash and final status. Do not push or begin Phase 9B.

## RED Check

The first Docker `smoke:producer-quality-gates` must fail against `9494c39` because the quality runtime is absent. Subsequent sub-REDs must catch each missing deterministic failure class before GREEN.

## GREEN Result Required

- one pure deterministic gate covering text overflow, contrast, safe margins, evidence, planned/rendered frames, frame luma, MP4/metadata/chapters, and tracked artifacts
- one real FFmpeg/ffprobe/Git evidence collector and executable `producer:quality` CLI
- one strict future-only quality-gated maintained manifest/scaffold contract
- unchanged compatibility for completed maintained proofs and all frozen compositions
- retained preflight/validation ownership for media/audio/caption/Root failures
- Phase 9A complete, Phase 9B next/unstarted, Phase 9 and Roadmap incomplete
- focused/Docker verification plus honest lint baseline
- no committed generated/private/binary artifact

## Focused Validation

Primary RED/GREEN command: `npm run smoke:producer-quality-gates`. Supporting checks: Producer validation/review/assets/OS/sample-manifest/promotion, architecture/Web-removal/skill, Remotion version/capabilities/media/style contracts.

## Docker-First Validation

Docker owns FFmpeg/ffprobe fixtures, compiled runtime checks, CLI proof, TypeScript, build, composition listing, and full lint evidence. Host commands support Git/source review only.

## Documentation Alignment Boundary

Align `AGENTS.md`, `README.md`, `docs/FINAL_PRODUCT_GOAL.md`, `docs/ITERATION_STATUS.md`, `docs/AGENT_PRODUCER_ONLY_ROADMAP.md`, `docs/REMOTION_COMPONENT_LIBRARY.md`, `docs/PRODUCER_PROMOTION_GATE.md`, the removal inventory, both active skills, `scripts/AGENTS.md`, `src/remotion/AGENTS.md`, scaffold README, package scripts, guards, and this plan. Keep provider/asset/env/Compose/superseded/archive surfaces unchanged unless direct verification finds a conflict.

## Commit Boundary

One commit contains only the Phase 9A quality contract, analysis/CLI, forward-only scaffold integration, focused smokes, active-doc/skill alignment, inventory slice record, and this execution record. It contains no new real composition, generated artifact, dependency/config/provider change, or Phase 9B work.

## Stop Condition

Stop after the local Phase 9A commit and final status verification. Phase 9B final acceptance video and final Roadmap completion are next and explicitly unstarted.

## Plan Self-Review

- Spec coverage: current facts, bounded goal, scope/non-goals, exact files, frozen boundary, CodeGraph chain, RED/GREEN, focused/Docker validation, docs, commit, and stop condition are explicit.
- Placeholder scan: no relaxed allowlist, fake passing fixture, aesthetic score, generated fallback, unspecified deletion, or skipped gate remains.
- Type consistency: `qualityModule`, `QualityGatedMaintainedProducerSampleManifest`, `producerQualityPlan`, `ProducerQualityGateInput`, and `producer:quality` match across tasks.
- Scope check: final video, final documentation closure, frozen sources, provider/config/dependencies, generated artifacts, and Phase 9 completion remain excluded.

## Execution Record

- Start truth: branch `refactor/agent-producer-service`, commit `9494c39`, clean tracked worktree, no user changes to protect.
- Primary RED: Docker `npm run smoke:producer-quality-gates` exited `1` with `Missing Phase 9A quality surface: scripts/lib/producer-quality-gates.ts` before production code existed.
- Focused sub-REDs caught a Node `Buffer` type mismatch, an invalid `/tmp` Git pathspec, stale Phase 6/7/8 assertions that permanently required Phase 9 to be unstarted, and the future scaffold smoke still requiring the Phase 8-only manifest subtype. Each root cause was fixed without relaxing a gate or modifying a completed composition.
- Chapter parser sub-RED: the real metadata fixture used `00:00:0.5`; the new assertion failed with `NaN !== 15`. The parser now accepts one- or two-digit seconds and chapter validation explicitly rejects non-finite frames.
- GREEN: the final Docker quality smoke passed both its static stage and compiled runtime stage, generated temporary high-contrast/blank PNG plus H.264/AAC MP4 evidence, accepted the good real CLI fixture, and rejected every declared bad branch.
- Retained contracts: all 16 supporting Docker smokes passed for validation, review frames, assets, Producer OS/sample manifest/promotion, architecture/Web removal, Remotion versions/capabilities/media/style profiles, direct VoxCPM/audio tools, and skill alignment.
- Docker closure: `npx tsc --noEmit --pretty false`, `npm run build`, and `npx remotion compositions src/remotion/index.ts` passed. The composition registry remained unchanged.
- Historical lint baseline: Docker `npm run lint` still reports exactly 39 errors and 2 warnings, all in unchanged historical/generated-reference files. Changed-file ESLint and Prettier passed.
- Boundary closure: package/inventory JSON parsing, Compose config, `git diff --check`, forbidden-runtime scan, frozen-composition scan, binary/generated/private artifact scan, and provider/asset/env/Compose/superseded-doc no-diff checks passed.
- Scope closure: no file was deleted; no dependency, provider, environment, Compose, real composition, generated artifact, or frozen reference changed. Phase 9B remains next and unstarted.
