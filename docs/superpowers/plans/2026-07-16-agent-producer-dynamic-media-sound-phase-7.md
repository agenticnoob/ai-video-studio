# Agent Producer Dynamic Media And Sound Phase 7 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete Roadmap Phase 7 with manifest-backed local dynamic-media blocks, deterministic motion treatments, a local sound-design runtime, audio quality gates, and one maintained Producer proof sample that combines VoxCPM narration, BGM, ambience, SFX, image, animated image, Lottie, and video assets.

**Architecture:** Add narrow Producer-owned capability modules rather than a media scene DSL. `src/remotion/media/` owns local Video, AnimatedImage, and Lottie rendering; `src/remotion/motion/` owns fixed Trail/CameraMotionBlur selection; `src/remotion/sound/` owns manifest-backed sound roles, transition mapping, and frame-driven ducking. Extend the Phase 5 asset contract with optional sound-quality policy and Lottie expression metadata so the existing `producer:assets` and `producer:preflight` chain remains the only supply/preflight path. Prove the complete slice through a short maintained composition whose binaries remain ignored and whose narration is generated only by the direct VoxCPM runtime.

**Tech Stack:** React 19, TypeScript 5.9, Remotion 4.0.489, `@remotion/media`, `@remotion/lottie`, `@remotion/motion-blur`, `lottie-web`, FFmpeg/ffprobe, Node.js ESM smokes, Docker Compose, VoxCPM direct Producer runtime, ESLint, Prettier, CodeGraph, Git.

---

## Current Repository Facts

- Starting branch: `refactor/agent-producer-service`.
- Starting commit: `def57d5 feat: complete remotion capability core`.
- Starting tracked worktree is clean; no user changes require protection.
- Phase 0 through Phase 6 are complete. Phase 7 is next and has not started.
- Docker baseline passes for version gate, Remotion capabilities, assets, validation, Producer OS, architecture, and skill alignment.
- Repository-wide Docker lint has the documented historical baseline of 39 errors and 2 warnings; changed files must be clean.
- Every installed Remotion package is exact `4.0.489`. Exact `@remotion/media`, `@remotion/lottie`, and `@remotion/motion-blur` packages exist at `4.0.489`; `@remotion/lottie` requires `lottie-web`.
- `ProducerAssetManifest` already admits video, audio, Lottie, and Rive kinds, and Phase 5 preflight already verifies local path, integrity, media metadata, and normalized H.264/yuv420p/CFR/AAC video.
- No Producer-owned reusable Video, AnimatedImage, Lottie, motion-blur, SFX library, ducking, or audio-quality surface exists.
- VoxCPM `/ready` currently reports HTTP 503 with `{ready:false,status:"loading",model:"/models/VoxCPM2"}`. Code work may proceed, but real narration generation is a hard completion gate.
- No approved local `.riv` asset exists. Roadmap wording makes Rive support conditional on an approved local asset plus real sample use, so installing an unproved Rive package is outside this phase execution.
- `docs/VISUAL_RECIPE_ROADMAP.md` is superseded and is not an active authority.

## Explicit Scope

### Create

- `scripts/producer-media-sound-smoke.mjs` — Phase 7 package, source, runtime, sample, docs, and forbidden-boundary RED/GREEN guard.
- `scripts/lib/producer-assets/audio-quality.ts` — FFmpeg peak/clipping and long-silence analysis.
- `src/remotion/media/ProducerLocalVideo.tsx` — local Video wrapper with trim, loop, playback rate, crop, and volume.
- `src/remotion/media/ProducerAnimatedImage.tsx` — local AnimatedImage wrapper with deterministic sizing, fit, speed, and loop behavior.
- `src/remotion/media/ProducerLottie.tsx` — `staticFile()` + `delayRender()` local Lottie loader.
- `src/remotion/media/index.ts` — narrow public media exports.
- `src/remotion/motion/presets.tsx`, `src/remotion/motion/index.ts` — fixed camera/typography/icon/particle Trail and CameraMotionBlur presets.
- `src/remotion/sound/types.ts` — sound roles, tracks, cues, and duck-window contracts.
- `src/remotion/sound/library.ts` — manifest-backed local sound library resolver.
- `src/remotion/sound/envelopes.ts` — deterministic per-frame volume and narration ducking arithmetic.
- `src/remotion/sound/ProducerSoundtrack.tsx` — local BGM, ambience, and SFX rendering through `@remotion/media`.
- `src/remotion/sound/transition-sfx.ts`, `src/remotion/sound/index.ts` — transition-to-SFX-role mapping and public exports.
- `scripts/fixtures/producer-media-sound/create-fixtures.sh` — ignored FFmpeg image/GIF/video/BGM/ambience/SFX fixture generation.
- `scripts/fixtures/producer-media-sound/lottie.json` — repo-authored expression-free Lottie input for deterministic proof.
- `src/remotion/AgentProducerMediaSoundProof/` — maintained proof composition, manifests, VoxCPM generator, validation, covers, render metadata, publishing copy, and source data.
- this plan — RED/GREEN and final execution evidence.

### Modify

- `package.json`, `package-lock.json` — exact Phase 7 dependencies, focused smoke, and fixture command.
- `scripts/remotion-version-gate-smoke.mjs` — require every new Remotion package at exact `4.0.489` and keep Rive absent.
- `src/remotion/producer-samples/asset-manifest.ts` — add optional audio role/QC policy and Lottie expression metadata.
- `scripts/lib/producer-assets/{types,metadata,localize,preflight,index}.ts` — carry sound policy, inspect Lottie expressions, analyze audio, and fail preflight.
- `scripts/producer-assets-smoke.mjs` — focused real FFmpeg audio success/failure coverage.
- `src/remotion/producer-samples/manifest.ts`, `registry.ts`, `index.ts` — declare maintained sound-design ownership and register the proof sample without changing frozen entries.
- `scripts/lib/producer-validation.ts`, `scripts/producer-validation-smoke.mjs` — require maintained sound-design asset ids and role agreement.
- `src/remotion/Root.tsx` — register only the new proof video and two cover Stills; do not edit existing registrations.
- `scripts/agent-producer-architecture-smoke.mjs`, `scripts/skill-alignment-smoke.mjs`, `scripts/remotion-capabilities-smoke.mjs` — update Phase 7 ownership/status guards.
- active entry docs, component/asset/promotion docs, removal inventory, Agent Producer skill, Remotion skill, and local `AGENTS.md` files listed under Documentation Alignment.

### No deletions

Phase 7 deletes no source, composition, provider, compatibility, ignored, private, or generated path.

## Explicit Non-Goals

- no Rive package/component without an approved local `.riv` asset and real sample use
- no remote runtime media or remote SFX URL
- no image-generation or video-generation model, prompt, adapter, service, or fallback
- no Web product, planner, template, recipe, `VideoProject`, or provider-neutral narration restoration
- no changes to finished/frozen compositions, their generated metadata, or historical recipe/storyboard compatibility
- no new narration provider, synthetic speech fallback, or silent track presented as narration
- no Phase 8 style profiles or Phase 9 general quality-gate expansion
- no repository-wide lint cleanup
- no committed audio, video, screenshots, `public/generated/`, `out/`, private voice, model, secret, or npm-log artifact
- no push

## Frozen And Artifact Boundary

- Every existing dedicated/frozen composition and registry record remains byte-for-byte unchanged.
- Historical `provider: "f5-tts"` metadata remains truthful and unchanged.
- `src/remotion/recipes/{blocks,timing}` and historical storyboard types remain read-only.
- All proof binaries live under `public/generated/agent-producer-media-sound-proof/` and outputs under `out/agent-producer-media-sound-proof/`; both are ignored.
- Only source, JSON metadata/manifests, scripts, docs, and dependency locks may be committed.
- The committed Lottie JSON is repo-authored test data, not generated imagery; render-critical media copies still pass through the Phase 5 manifest/preflight path.

## Dependency And Call-Chain Evidence

```txt
ProducerAssetSupplyPlan
  -> localizeProducerAssets()
  -> ffprobe / Lottie metadata / audio-quality analysis
  -> ProducerAssetManifest
  -> preflightProducerAssets()
  -> maintained validation / stills / render

manifest-backed local media path
  -> ProducerLocalVideo / ProducerAnimatedImage / ProducerLottie
  -> dedicated proof composition
  -> Root video + Still registrations

manifest sound roles + narration windows
  -> getProducerSoundLibrary()
  -> getProducerDuckedVolume()
  -> ProducerSoundtrack
  -> @remotion/media Audio volume callback

Producer transition id
  -> getProducerTransitionSfxRole()
  -> manifest-backed SFX cue id
  -> frame-timed Audio cue
```

CodeGraph also proves that current active Producer runtime has no reusable dynamic-media or sound-design caller; existing `<Audio>`/video-like usages are frozen compositions or the Phase 6 isolated canvas proof and must not be edited.

---

### Task 1: Add And Observe The Phase 7 RED Guard

**Files:** create `scripts/producer-media-sound-smoke.mjs`; modify `package.json`.

- [x] **Step 1: Add focused assertions before production code**

The smoke must require:

```js
for (const name of ["@remotion/media", "@remotion/lottie", "@remotion/motion-blur"]) {
  assert.equal(allDirectDependencies[name], "4.0.489");
}
assert.equal(allDirectDependencies["lottie-web"], "5.13.0");
assert(!("@remotion/rive" in allDirectDependencies));
```

It must require every new `media/`, `motion/`, `sound/`, audio-quality, fixture, and proof-sample path, compile/import pure helpers, assert ducking and transition mappings, require Phase 7 completion in inventory/docs, and scan Phase 7 render source for remote URLs, CSS animation/transition, visual-generation, Web/planner/template, and provider-fallback tokens.

- [x] **Step 2: Run Docker RED**

Run `docker compose run --rm producer bash -lc 'npm run smoke:producer-media-sound'`.

Expected: exit `1` on absent exact `@remotion/media` or the first missing Phase 7 source path, not syntax/Docker setup.

### Task 2: Admit Exact Dependencies And Implement Dynamic Media/Motion

**Files:** package/lock plus `src/remotion/media/` and `src/remotion/motion/`.

- [x] **Step 1: Add exact dependencies**

Add exact `@remotion/media`, `@remotion/lottie`, and `@remotion/motion-blur` `4.0.489`, plus exact `lottie-web` `5.13.0`. Regenerate the lock in Docker and prove every top-level `remotion`/`@remotion/*` entry is `4.0.489` with no Rive entry.

- [x] **Step 2: Implement local Video**

Expose `ProducerLocalVideo` with `src`, `trimBefore`, `trimAfter`, `loop`, `playbackRate`, `objectFit`, `objectPosition`, `volume`, `muted`, `width`, and `height`. Reject remote/absolute/traversal paths, invalid trim/rate/volume/geometry, call `staticFile(src)`, and set `onError={() => "fail"}` so missing media never silently falls back.

- [x] **Step 3: Implement AnimatedImage and Lottie**

`ProducerAnimatedImage` accepts local GIF/APNG/AVIF/WebP with explicit width/height, fit, playback rate, and loop behavior. `ProducerLottie` accepts a local JSON path, loads through `staticFile()`/`fetch`, owns `delayRender`/`continueRender`/`cancelRender`, and renders `<Lottie animationData={...}>`. Neither accepts remote URLs.

- [x] **Step 4: Implement fixed motion presets**

Expose ids `camera-natural`, `typography-trail`, `icon-trail`, and `particle-trail`. Camera uses `CameraMotionBlur`; the other three use `Trail` with fixed layer/lag/opacity settings. Children must remain absolutely positioned; no style profile or arbitrary shader surface is added.

### Task 3: Extend Asset And Validation Contracts For Sound

**Files:** asset manifest/runtime/smokes and Producer validation/runtime/smoke.

- [x] **Step 1: Add strict sound policy**

Only audio assets may declare:

```ts
type ProducerSoundAssetPolicy = {
  readonly role: "narration" | "bgm" | "ambience" | "sfx";
  readonly maxAllowedPeakDb: number;
  readonly maxSilenceSeconds: number;
};
```

`maxAllowedPeakDb` must be finite and `<= 0`; `maxSilenceSeconds` must be positive. Lottie media records add `hasExpressions: boolean` and Phase 7 proof requires `false`.

- [x] **Step 2: Analyze audio in preflight**

Run FFmpeg `volumedetect` and `silencedetect` for every sound-policy asset. Fail on missing/unreadable audio, `-inf`/unparseable peak, observed peak above policy, or any silence longer than policy. Keep integrity and ffprobe checks first.

- [x] **Step 3: Cover RED/GREEN with real FFmpeg fixtures**

Extend `smoke:producer-assets` with normal, clipping, and long-silence WAV inputs. The normal file passes; clipped and long-silence policies fail for their exact reasons. Add Lottie expression metadata assertions.

- [x] **Step 4: Require maintained sound-design ownership**

Add optional maintained-manifest `soundDesign` with `soundtrackModulePath`, narration/BGM/ambience/SFX asset-id arrays, and require the source file path plus matching asset kinds/roles during `validateProducerSample()`. Frozen manifests are unchanged.

### Task 4: Implement Manifest-Backed Sound Runtime

**Files:** `src/remotion/sound/` and transition exports.

- [x] **Step 1: Resolve the local sound library**

`getProducerSoundLibrary(manifest)` returns role-indexed audio entries only when every record has local path, license, audio metadata, and sound policy. It never downloads or chooses creative assets.

- [x] **Step 2: Implement deterministic envelopes**

Expose `getProducerDuckedVolume({frame, baseVolume, duckedVolume, attackFrames, releaseFrames, narrationWindows})`. Validate finite ordered windows; return clamped interpolation through attack, duck hold, and release. Also expose fixed fade-in/out for ambience/BGM.

- [x] **Step 3: Render BGM, ambience, and SFX**

`ProducerSoundtrack` takes explicit local tracks and cue frames. BGM/ambience loop with `loopVolumeCurveBehavior="extend"`; BGM uses the duck callback; SFX use `from` and `durationInFrames`. All `Audio` elements use local `staticFile()` paths and fail closed.

- [x] **Step 4: Add transition mapping**

Map `editorial-fade -> soft-whoosh`, `directional-slide -> directional-whoosh`, `signal-wipe -> signal-sweep`, and `cinematic-film-burn -> impact-bloom`. Mapping returns a role, not a remote URL or hard-coded file.

### Task 5: Build And Prove One Maintained Producer Sample

**Files:** fixture script/Lottie input and `src/remotion/AgentProducerMediaSoundProof/`, registry, Root.

- [x] **Step 1: Generate ignored non-narration fixtures**

The fixture script creates a PNG image, animated GIF, H.264/yuv420p/CFR/AAC video, restrained BGM, ambience, and two short SFX under the proof slug. Copy/localize the committed Lottie JSON through `producer:assets`. Confirm all generated paths are ignored.

- [x] **Step 2: Generate real narration through direct VoxCPM**

Use a three-beat Chinese `voice-design` plan and call `runProducerAudioGeneration()` directly. The service unloads the model after 10 idle minutes and the first real request reloads it automatically, so `/ready` is diagnostic and must not gate generation. No synthetic speech or alternate provider is allowed. Only a failed or timed-out real narration request blocks Phase 7.

- [x] **Step 3: Localize all assets and write the strict manifest**

Run `producer:assets` for narration, BGM, ambience, two SFX, PNG, GIF, video, and Lottie. Every asset has repo-relative ignored destination, source/license metadata, checksum, media metadata, and sound QC policy where applicable. Run `producer:preflight` before rendering.

- [x] **Step 4: Implement the proof composition**

Three duration-from-audio scenes prove image/AnimatedImage, local trimmed/cropped/looped Video, local Lottie, motion presets, BGM+ambience, two transition-mapped SFX, and narration ducking. Register the video and 16:9/9:16 code-only covers. Add the maintained manifest to the single registry without editing existing entries.

- [x] **Step 5: Validate, render stills, and render final artifacts**

Run `producer:validate`, `producer:stills`, and `producer:render`. Inspect opening, media, Lottie, transition/SFX, and closing states; inspect both covers. Verify MP4 H.264/AAC, dimensions, FPS, duration, and audio stream with ffprobe. Re-render a Lottie-active still twice and require identical SHA-256.

### Task 6: Turn RED Into GREEN And Run Docker-First Verification

- [x] **Step 1: Run focused GREEN**

Run Phase 7 smoke, Producer assets, validation, OS, Phase 6 capabilities/version, architecture, skill alignment, audio direct/tools, and review-frame smokes in Docker.

- [x] **Step 2: Run full Docker gates**

Run Docker typecheck, full lint, build, and Remotion composition listing. Typecheck/build/listing must pass; report lint honestly against the historical 39-error/2-warning baseline.

- [x] **Step 3: Run changed-file checks**

Run ESLint on changed TS/TSX/MJS, Prettier on every changed supported file, `bash -n` on fixture scripts, JSON parse checks, Compose config, `git diff --check`, and phase-specific forbidden/frozen/artifact/secret scans.

### Task 7: Align Active Docs, Review, And Commit Once

- [x] **Step 1: Align all active authorities**

Mark Phase 7 complete only after real VoxCPM sample evidence, asset/audio preflight, representative stills, render, and Docker gates pass. State Phase 8 is next and not started. Record Rive as conditionally unadmitted, not falsely implemented.

- [x] **Step 2: Update this plan execution record**

Record exact RED failure, package closure, sound-QC failures/pass, VoxCPM readiness/generation, manifest/preflight, still hashes/inspection, MP4/ffprobe, focused/full Docker gates, lint baseline, and boundary scans.

- [x] **Step 3: Review and stage only Phase 7 files**

Confirm no existing frozen composition changed and no audio/video/PNG/GIF/`public/generated`/`out`/voice/secret is staged. Review `git status`, `git diff`, cached diff, and `git diff --check`.

- [x] **Step 4: Create one bounded commit**

Create `feat: add dynamic media and sound design`, record hash/status, and stop. Do not push or begin Phase 8.

## RED Check

The new Docker `smoke:producer-media-sound` must fail against commit `def57d5` because the exact Phase 7 media dependency and owned source boundary are absent. Asset/validation sub-REDs must fail on sound policy, clipping, long silence, and maintained role mismatch before implementation.

## GREEN Result Required

- exact uniform Remotion closure including media/Lottie/motion-blur
- local Video, AnimatedImage, and expression-inspected Lottie blocks
- four motion-blur/trail selection ids
- manifest-backed SFX library and four transition-to-SFX role mappings
- deterministic BGM/ambience envelopes and narration ducking
- peak/clipping/long-silence/missing-track failures through normal preflight/validation
- one maintained proof sample combining real VoxCPM narration, BGM, ambience, two SFX, image, GIF, Lottie, and video
- deterministic Lottie still, representative still review, two covers, MP4/ffprobe evidence
- Docker focused/typecheck/build/composition gates and honest lint baseline
- no Rive claim without an approved asset; no Phase 8 implementation
- frozen/private/generated boundaries unchanged

## Focused Validation

Primary RED/GREEN command: `npm run smoke:producer-media-sound`. Supporting commands: `smoke:producer-assets`, `smoke:producer-validation`, `smoke:producer-os`, `smoke:remotion-version-gate`, `smoke:remotion-capabilities`, `smoke:producer-audio-direct-voxcpm`, `smoke:producer-audio-tools`, `smoke:producer-review-frames`, `smoke:agent-producer-architecture`, and `smoke:skill-alignment`.

## Docker-First Validation

Docker owns dependencies, TypeScript, build, composition listing, fixture generation, preflight, stills, MP4 render, and full lint evidence. Host commands may inspect Git and ignored artifacts but are not final type/render proof.

## Documentation Alignment Boundary

Check and align `AGENTS.md`, `README.md`, `docs/FINAL_PRODUCT_GOAL.md`, `docs/ITERATION_STATUS.md`, `docs/AGENT_PRODUCER_ONLY_ROADMAP.md`, `docs/REMOTION_COMPONENT_LIBRARY.md`, `docs/PRODUCER_ASSET_CONTRACT.md`, `docs/PRODUCER_PROMOTION_GATE.md`, `docs/architecture/agent-producer-only-removal-inventory.json`, `.agents/skills/ai-video-studio-agent-producer/SKILL.md`, `.agents/skills/remotion-best-practices/SKILL.md`, `scripts/AGENTS.md`, and `src/remotion/AGENTS.md`. Keep `docs/VISUAL_RECIPE_ROADMAP.md` a superseded pointer. Provider docs, `.env.example`, and Compose stay unchanged unless verification finds a direct inconsistency. There is no active handoff document; archived handoffs remain historical.

## Commit Boundary

One commit contains Phase 7 dependencies, media/motion/sound runtime, asset/validation extensions, focused smokes, maintained proof sample source/metadata, active-doc alignment, and this execution record. Ignored binaries and outputs never enter Git.

## Stop Condition

Stop after the Phase 7 commit and status verification. Phase 8 style profiles must remain explicitly unstarted. If VoxCPM remains externally unavailable, do not mark Phase 7 complete or create a misleading completion commit; report the implemented/verified boundary and exact blocker.

## Plan Self-Review

- Spec coverage: current facts, complete Phase 7 deliverables, conditional Rive gate, scope/non-goals, frozen boundary, CodeGraph call paths, RED/GREEN, focused/Docker validation, proof sample, docs, commit, and stop condition are explicit.
- Placeholder scan: no placeholder marker, relaxed allowlist, skipped check, or unspecified fallback remains.
- Type consistency: sound roles, policy fields, asset ids, transition roles, proof composition id, and exact package versions are consistent across tasks.
- Scope check: Phase 8/9, frozen compositions, provider/config topology, visual generation, Web/planner/template surfaces, and committed binary artifacts remain excluded.

## Execution Record

- Starting Docker baseline: version gate, Remotion capabilities, Producer assets,
  validation, Producer OS, architecture, and skill-alignment smokes all exited
  `0` before Phase 7 source changes.
- RED: the first Docker `smoke:producer-media-sound` exited `1` because
  `@remotion/media` was absent (`actual: undefined`, expected exact `4.0.489`).
  The new guard reached the intended missing-capability boundary without a
  syntax, Docker, or pre-existing baseline failure.
- Asset/validation sub-REDs: `smoke:producer-assets` first failed because the
  supplied `bgm` policy was not preserved; `smoke:producer-validation` first
  failed because a BGM id with an SFX role was accepted. The same Docker
  smokes now pass after adding policy propagation, FFmpeg peak/silence gates,
  Lottie expression inspection, and maintained role agreement.
- Exact dependencies are installed at `4.0.489` for `@remotion/media`,
  `@remotion/lottie`, and `@remotion/motion-blur`; `lottie-web` is exact
  `5.13.0`; Rive remains absent. Docker TypeScript and Remotion composition
  listing pass with the new proof and two Still registrations.
- Ignored FFmpeg fixture generation is complete. `git check-ignore` confirms
  proof image/video inputs remain under ignored `public/generated/`.
- Direct VoxCPM narration initially remained pending because `/ready` returned
  HTTP `503` with `status: loading`. That was later identified as a normal cold
  state: the service unloads after 10 idle minutes and reloads on the first real
  request. Direct generation succeeded without readiness polling, producing
  three measured local WAV files and generated metadata.
- Producer OS and sample-manifest compatibility initially RED because their
  Phase 4 assumptions required zero maintained samples and all registry entries
  to be frozen. The guards now require exactly one maintained
  `AgentProducerMediaSoundProof` while proving every earlier entry remains
  `frozen-reference`; both Docker smokes pass.
- The code-only 16:9 and 9:16 covers render successfully and were visually
  inspected at full frame: both have safe title/subtitle bounds, readable CJK,
  clear hierarchy, and no generated imagery. Outputs remain ignored.
- Fresh repository-wide Docker lint reports the unchanged historical baseline
  of 39 errors and 2 warnings. Changed-file ESLint and Prettier are clean;
  Docker typecheck, build, composition listing, JSON parsing, fixture `bash -n`,
  Compose config, and `git diff --check` pass.
- VoxCPM was initially polled read-only for roughly 20 minutes after repository
  work was ready. `/health` remained HTTP 200 while `/ready` remained HTTP 503.
  This exposed a documentation gap rather than an external outage: `/ready`
  reflects the idle-unloaded model, while a real request triggers reload.
- Direct generation then succeeded after a 14.801-second model load;
  `ttsStatus` is `generated-local`. The three measured WAV durations are
  4.270563, 6.713292, and 7.229813 seconds. The strict asset manifest contains
  all 11 assets, and preflight passes.
- Initial visual review found unreadable inherited black captions, an opening
  media layer covering the title, and stale absolute review frames after real
  audio timing. Explicit caption color, safe media geometry, and scene-start-
  derived review frames fixed the root causes. Frames 48, 188, and 401 plus
  both covers passed visual inspection. Duplicate frame-401 renders share
  SHA-256 `4452486e2ccfe29aa82e98f26858c2e4d27febfa2550ff6c171ab01fc849306a`.
- The real review CLI RED exposed a missing `--rootDir .`; the real render RED
  exposed stale `jq` and nested-Docker assumptions. Focused guards now cover
  real-registry review dry-run and direct Producer-container render execution.
- Final render/ffprobe evidence: 19.050667 seconds, 1920x1080, 30fps H.264,
  48kHz stereo AAC. MP4, covers, review frames, fixture media, and narration
  remain ignored.
- A fresh 12-command Docker focused suite passes, covering version/capability,
  Phase 7, assets, validation, OS/manifest, direct VoxCPM/audio tools, review
  frames, architecture, and skill alignment. Frozen-composition, forbidden
  source, generated-artifact, config-scope, secret, and diff scans are clean.
- Phase 7 is complete. Phase 8 code-driven style profiles is next and has not
  started.

Continuation with direct cold-start-capable narration:

```bash
docker compose run --rm producer bash -lc 'rm -rf /tmp/phase7-audio-build && npx tsc --allowJs --target es2022 --module commonjs --moduleResolution node --skipLibCheck --esModuleInterop --noEmit false --rootDir . --outDir /tmp/phase7-audio-build src/remotion/AgentProducerMediaSoundProof/generate.mjs src/remotion/AgentProducerMediaSoundProof/script.ts src/remotion/AgentProducerMediaSoundProof/types.ts scripts/lib/producer-audio/index.ts scripts/lib/producer-audio/types.ts scripts/lib/producer-audio/config.ts scripts/lib/producer-audio/captions.ts scripts/lib/producer-audio/wav.ts scripts/lib/producer-audio/progress.ts scripts/lib/producer-audio/providers/voxcpm.ts scripts/lib/producer-audio/request.ts scripts/lib/producer-audio/metadata.ts scripts/lib/producer-audio/run.ts src/remotion/standalone-video/caption-types.ts && node /tmp/phase7-audio-build/src/remotion/AgentProducerMediaSoundProof/generate.mjs'
docker compose run --rm producer npm run producer:media-sound-fixtures
docker compose run --rm producer npm run producer:assets -- --manifest src/remotion/AgentProducerMediaSoundProof/assets.supply.json
docker compose run --rm producer npm run producer:preflight -- --composition AgentProducerMediaSoundProof
```
