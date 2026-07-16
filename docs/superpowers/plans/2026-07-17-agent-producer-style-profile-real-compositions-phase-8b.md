# Agent Producer Style-Profile Real Compositions Phase 8B Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the remaining Phase 8B acceptance boundary with two new real dedicated TCP-handshake compositions that use the same factual content but prove visibly and audibly different `editorial-tech` and `retro-terminal` production languages through the full Agent Producer chain.

**Architecture:** Add two independent maintained compositions, `TcpHandshakeEditorial` and `TcpHandshakeTerminal`, rather than a shared scene template. Both use the same three TCP handshake facts and direct high-fidelity VoxCPM narration, while each owns its layout, profile-constrained motion, official transition preset, manifest-backed SVG/audio assets, soundtrack, captions, covers, and publishing copy. Reuse only the existing Producer style resolver, transition presets, sound runtime, asset/preflight runtime, validation CLI, and render CLI.

**Tech Stack:** React 19, TypeScript 5.9, Remotion and `@remotion/*` exact `4.0.489`, VoxCPM direct Producer runtime, FFmpeg/ffprobe, SVG, Node.js ESM smokes, Docker Compose, CodeGraph, ESLint, Prettier, Git.

## Global Constraints

- `.agents/skills/ai-video-studio-agent-producer/` remains the only supported production entrypoint.
- Visual production uses code and existing assets only; no image or video generation model, ComfyUI, Web prompt flow, planner, template, or scene DSL is introduced.
- Existing finished/frozen compositions, `AgentProducerMediaSoundProof`, historical provider metadata, and compatibility modules remain read-only.
- Generated narration, localized assets, review PNGs, covers, MP4s, `public/generated/`, `out/`, and private voice files remain ignored and uncommitted.
- Remotion motion is frame-driven; CSS animation, CSS transition, timers, wall-clock state, and random values are forbidden.
- Both real compositions must pass narration, asset supply/preflight, validation, still/cover review, MP4, and ffprobe gates before Phase 8 is marked complete.
- Phase 9 remains unstarted and is not implemented in this slice.
- Do not push.

---

## Current Repository Facts

- Starting branch: `refactor/agent-producer-service`.
- Starting commit: `21b99e2 feat: require producer style profile selection`.
- Starting tracked worktree is clean; there are no tracked user changes to protect.
- Phase 0 through Phase 7, Phase 8A, and the Phase 8B sample-contract slice are complete.
- Phase 8B real-composition proof is the next and only unfinished Phase 8 slice; Phase 9 has not started.
- `producer:scaffold` requires one exact profile id, but the repository still has only the pre-profile Phase 7 maintained sample.
- CodeGraph proves registry, Root, validation, asset preflight, still planning, render planning, style resolution, transition presets, sound runtime, and direct VoxCPM are the surviving production chain.
- `editorial-tech` resolves to asymmetric editorial layout, restrained cyber treatment, `editorial-fade`, typography-led motion, bottom-safe captions, and measured pulse/clean-node sound.
- `retro-terminal` resolves to terminal stream layout, bold scanline/pixel treatment, `signal-wipe`, command-rhythm motion, prompt-like captions, and clocked sequence/signal-chirp sound.
- Docker focused baselines pass. Repository-wide Docker lint has the historical 39-error/2-warning baseline; changed files must be clean.
- `docs/VISUAL_RECIPE_ROADMAP.md` is superseded and is not active authority.

## Explicit Scope

### Create

- `scripts/producer-style-profile-real-compositions-smoke.mjs` — focused Phase 8B real-production RED/GREEN guard.
- `scripts/fixtures/producer-style-profile-proofs/create-audio-fixtures.sh` — deterministic ignored BGM, ambience, and SFX sources for both real compositions.
- `scripts/fixtures/producer-style-profile-proofs/tcp-editorial-diagram.svg` — repo-authored local editorial evidence diagram.
- `scripts/fixtures/producer-style-profile-proofs/tcp-terminal-packet.svg` — repo-authored local terminal packet/signal asset.
- `src/remotion/TcpHandshakeEditorial/` — dedicated renderer, types, narration, generator, generated metadata, data, sample/asset manifests, soundtrack, validation, covers, render metadata, publishing copy, and exports.
- `src/remotion/TcpHandshakeTerminal/` — equivalent dedicated source set with independent terminal composition language.
- this plan — implementation steps plus RED/GREEN, visual, render, and closure evidence.

### Modify

- `package.json` — add only the focused Phase 8B smoke and deterministic profile-proof asset command.
- `src/remotion/Root.tsx` — register the two videos and four code-rendered cover Stills inside the existing Agent Producer inventory folder.
- `src/remotion/producer-samples/registry.ts` — add exactly the two new profiled maintained manifests after the unchanged Phase 7 proof.
- Producer OS/sample-manifest/promotion/validation/architecture/skill/style/capability/media smoke guards whose old expectations say only one maintained sample or real proof unstarted.
- `AGENTS.md`, `README.md`, `docs/FINAL_PRODUCT_GOAL.md`, `docs/ITERATION_STATUS.md`, `docs/AGENT_PRODUCER_ONLY_ROADMAP.md`, `docs/REMOTION_COMPONENT_LIBRARY.md`, `docs/PRODUCER_PROMOTION_GATE.md`, and `docs/architecture/agent-producer-only-removal-inventory.json`.
- `.agents/skills/ai-video-studio-agent-producer/SKILL.md`, `.agents/skills/remotion-best-practices/SKILL.md`, `scripts/AGENTS.md`, and `src/remotion/AGENTS.md`.

### No deletions

This slice deletes no source, composition, provider, compatibility, ignored, private, or generated path.

## Explicit Non-Goals

- no Phase 9 hard-failure implementation or final acceptance-video work
- no new shared template, recipe, universal scene schema, automatic profile renderer, or arbitrary TSX generator
- no image-generation/video-generation model, remote render-critical media, Web product, provider fallback, or F5 restoration
- no new dependency, Remotion version change, environment variable, Compose topology, provider runtime, or asset-schema change
- no retrofit, formatting pass, registration change, narration regeneration, or render of any existing finished/frozen composition or Phase 7 proof
- no promotion of sample-local TCP scene components into shared primitives/blocks
- no repository-wide lint cleanup
- no committed WAV, MP4, PNG, cover, localized asset, `public/generated`, `out`, private voice, model, or secret
- no push

## Frozen And Artifact Boundary

- `src/remotion/AgentProducerMediaSoundProof/` and every `frozen-reference` registry object remain source-identical.
- Historical `provider: "f5-tts"` metadata, `src/remotion/recipes/{blocks,timing}`, and storyboard compatibility remain unchanged.
- Repo-authored SVG and fixture scripts are source; localized SVG/WAV files remain ignored under `public/generated/<slug>/assets/`.
- Direct VoxCPM reads the existing ignored `voices/clone/` references and writes only ignored narration artifacts plus tracked metadata/duration source updates.
- Stills, covers, metadata bundles, and MP4s remain under ignored `out/<slug>/` paths.

## Dependency And Call-Chain Evidence

```txt
Agent Producer profile judgment
  -> producer:scaffold --style-profile editorial-tech|retro-terminal (contract proof in /tmp)
  -> dedicated composition source applied with the same strict manifest shape
  -> getProducerStyleProfile()
  -> profile-specific frame-driven layout + official transition preset
  -> manifest-backed SVG and sound assets

script.ts
  -> generate.mjs
  -> createVoxcpmProducerRequestPlan(high-fidelity-clone)
  -> runProducerAudioGeneration()
  -> per-scene WAV + tracked audio.generated.ts + measured duration constant

assets.supply.json
  -> producer:assets
  -> assets.manifest.json
  -> producer:preflight
  -> producer:validate
  -> producer:stills
  -> visual and audio review
  -> producer:render
  -> MP4 + ffprobe + two Remotion Still covers

manifest.ts
  -> producer-samples/registry.ts
  -> producer:stills / producer:render lookup
  -> Root video and Still registration
```

---

### Task 1: Add And Observe The Phase 8B Real-Composition RED

**Files:** create `scripts/producer-style-profile-real-compositions-smoke.mjs`; modify `package.json`.

- [x] **Step 1: Add the focused guard before production source**

Require both composition directories, exact profile ids, matching TCP narration facts, independent renderers/covers/soundtracks/manifests, three maintained registry entries, six Root registrations, Phase 8 completion inventory state, and active docs that keep Phase 9 unstarted. Scan new render sources for remote URLs, CSS animation/transition, timers, random state, Web/planner/template tokens, visual-generation tokens, and provider fallback.

- [x] **Step 2: Add the package command**

Add `"smoke:producer-style-profile-real-compositions": "node scripts/producer-style-profile-real-compositions-smoke.mjs"`.

- [x] **Step 3: Run Docker RED**

Run `docker compose run --rm producer bash -lc 'npm run smoke:producer-style-profile-real-compositions'`.

Expected: exit `1` on missing `src/remotion/TcpHandshakeEditorial/manifest.ts`, not Docker, syntax, dependency, or historical lint failure.

### Task 2: Build The Two Strict Maintained Composition Contracts

**Files:** both dedicated composition source sets, registry, and Root.

- [x] **Step 1: Prove scaffold selection without mutating source**

Run `producer-scaffold.mjs` twice under `/tmp` with `--style-profile editorial-tech` and `--style-profile retro-terminal`; inspect the generated strict manifest fields. Apply all repository source changes through `apply_patch` as required by this task.

- [x] **Step 2: Define identical factual content with independent ownership**

Each composition owns the same three Chinese beats: client `SYN`, server `SYN-ACK`, and client `ACK` leading to an established TCP connection. Keep `ttsText` and `displayText` punctuation-aligned and identical across both samples so visual/sound differences cannot be attributed to different content.

- [x] **Step 3: Add strict profiled manifests**

Both manifests satisfy `ProfiledMaintainedProducerSampleManifest`, declare `generated-local` only after narration succeeds, include asset/sound/validation/render/publishing ownership, and use review frames derived from measured scene starts.

- [x] **Step 4: Register only the new proof surfaces**

Add two registry entries, two video compositions, and four cover Stills. Do not edit existing registrations or manifest objects beyond the minimum import/list additions.

### Task 3: Implement Visibly Different Profile Languages

**Files:** both renderers, data/types, SVG sources, covers, and soundtracks.

- [x] **Step 1: Implement `editorial-tech`**

Use an asymmetric thesis/evidence composition, generous whitespace, local SVG network diagram, restrained grid/edge glow, thesis-led frame motion, `editorial-fade`, left bottom-safe captions, measured pulse BGM, quiet room ambience, and sparse node/soft-whoosh SFX.

- [x] **Step 2: Implement `retro-terminal`**

Use a vertical command/result stream, phosphor scanline/pixel field, local packet SVG, crisp state changes, `signal-wipe`, prompt-led captions, clocked sequence BGM, electronic ambience, and confirmation/signal-chirp SFX.

- [x] **Step 3: Keep all motion deterministic**

Use `useCurrentFrame()`, `interpolate()`, `Sequence`/`TransitionSeries`, SVG stroke/packet progress, and fixed frame cues. Do not use CSS animation/transition, timers, `Date.now`, or `Math.random`.

- [x] **Step 4: Render profile-specific covers**

Create one 16:9 and one 9:16 code-driven cover per composition. Preserve the same TCP topic promise while making editorial and terminal covers distinguishable without profile labels.

### Task 4: Generate Narration And Supply Assets

**Files:** both generators/audio metadata/duration constants, asset supply/final manifests, fixture script.

- [x] **Step 1: Generate deterministic local sound sources**

Run the fixture script in Docker and confirm every WAV path is ignored. The two profiles must use different BGM/ambience/SFX waveforms and levels.

- [x] **Step 2: Generate real VoxCPM narration**

Run both direct high-fidelity-clone generators without gating on `/ready`. Require six positive measured WAVs, clean duration-derived captions, and tracked `audio.generated.ts`/duration updates. No fallback or silent placeholder is allowed.

- [x] **Step 3: Localize and preflight each sample**

Run `producer:assets` for narration, profile-specific BGM/ambience/SFX, and the repo-authored SVG. Run `producer:preflight` for each composition; checksum, license, media, peak, and silence checks must pass.

- [x] **Step 4: Run maintained validation**

Run `producer:validate` for both validation modules and prove style id, narration/audio alignment, sound roles, asset manifest agreement, Root registrations, and ignored artifact roots.

### Task 5: Review Stills, Covers, Sound, And Final Renders

- [x] **Step 1: Render representative stills twice where determinism matters**

Run `producer:stills` for both samples. Inspect opening, middle, and closing states at full size for one focal point, safe margins, readable Chinese, caption clearance, no overlap/blank media, and profile distinction without labels. Re-render one representative frame per sample and compare SHA-256.

- [x] **Step 2: Inspect both cover pairs**

Render and inspect all four covers at full and thumbnail scale for hierarchy, safe bounds, contrast, and unmistakable profile language.

- [x] **Step 3: Render both MP4s**

Run `producer:render` for both compositions. Verify H.264/AAC streams, 1920x1080, 30fps, positive measured duration, audio presence, chapter metadata, and artifact paths with ffprobe and JSON checks.

- [x] **Step 4: Review actual playback/audio language**

Check narration intelligibility, profile-specific BGM/ambience/SFX, ducking, transition timing, and no unexpected silence or clipping. A successful render alone is not creative approval.

### Task 6: Turn RED Into GREEN And Run Docker-First Closure

- [x] **Step 1: Run the focused and retained-boundary suite**

Run the new focused smoke plus style profile/sample contract, version/capability, media/sound, Producer OS/sample manifest/promotion/assets/validation/review, direct VoxCPM/audio tools, architecture, Web removal, and skill-alignment smokes.

- [x] **Step 2: Run full Docker gates**

Run Docker typecheck, repository lint, build, and Remotion composition listing. Typecheck/build/listing must pass. Record lint honestly against the 39-error/2-warning historical baseline and prove no changed file appears in the failure set.

- [x] **Step 3: Run changed-file and boundary checks**

Run changed-file ESLint and Prettier, `bash -n`, JSON parsing, Compose config, `git diff --check`, forbidden Web/F5/visual-generation scans, frozen-composition diff scan, generated/private artifact scan, and secret/binary staging scan.

### Task 7: Align Authorities, Review, And Commit Once

- [x] **Step 1: Align active documentation**

Mark Phase 8 complete only after both real compositions pass every gate. Record the two ids/profiles, same-content comparison, asset/narration/render evidence, preserved frozen boundary, and Phase 9 as next and unstarted. Keep the Visual Recipe pointer superseded; provider/env/Compose docs change only if a direct factual conflict is found.

- [x] **Step 2: Update this execution record**

Record exact RED failure, six narration durations, preflight/validation output, still hashes and visual revisions, four cover reviews, MP4/ffprobe results, focused/full Docker gates, lint baseline, forbidden scans, and artifact boundary evidence.

- [x] **Step 3: Review and stage only Phase 8B files**

Inspect `git status`, full diff, cached diff, and `git diff --check`. Confirm no WAV/MP4/PNG/localized asset/private voice/secret/frozen source is staged and no Phase 9 work is present.

- [x] **Step 4: Create one bounded commit**

Create `feat: prove producer style profiles in real compositions`, record hash and final status, and stop. Do not push or begin Phase 9.

## RED Check

The first Docker `smoke:producer-style-profile-real-compositions` must fail against `21b99e2` because the two dedicated composition sources and completed Phase 8 evidence are absent. Subsequent sub-REDs must catch missing registry/Root ownership, invalid asset/sound roles, missing narration, and stale single-maintained-sample assumptions before GREEN.

## GREEN Result Required

- two new real dedicated compositions using `editorial-tech` and `retro-terminal`
- identical three-beat TCP facts with visibly different layout, motion, texture, media, caption, transition, and sound language
- direct high-fidelity VoxCPM narration with measured per-scene durations and captions
- strict manifest-backed local SVG, narration, BGM, ambience, and SFX assets
- passing supply/preflight/validation/still/cover/MP4/ffprobe gates for both
- deterministic representative still hashes and actual visual/audio review
- Phase 8 completed only after both proofs; Phase 9 next and unstarted
- zero frozen/provider/config/dependency/private/generated/binary commit contamination

## Focused Validation

Primary RED/GREEN command: `npm run smoke:producer-style-profile-real-compositions`. Supporting checks: profile/sample-contract, Producer OS/sample manifest/promotion/assets/validation/review, Remotion version/capabilities/media-sound, direct VoxCPM/audio tools, architecture/Web removal, and skill alignment.

## Docker-First Validation

Docker owns fixture generation, narration runtime access, asset supply/preflight, TypeScript, lint evidence, build, composition listing, stills, covers, MP4 rendering, and ffprobe evidence. Host commands are limited to Git/source review and local image inspection.

## Documentation Alignment Boundary

Align `AGENTS.md`, `README.md`, `docs/FINAL_PRODUCT_GOAL.md`, `docs/ITERATION_STATUS.md`, `docs/AGENT_PRODUCER_ONLY_ROADMAP.md`, `docs/REMOTION_COMPONENT_LIBRARY.md`, `docs/PRODUCER_PROMOTION_GATE.md`, the removal inventory, both active skills, local `scripts/AGENTS.md` and `src/remotion/AGENTS.md`, relevant focused guards/package scripts, and this plan. `docs/VISUAL_RECIPE_ROADMAP.md` remains a superseded compatibility pointer. `docs/providers/voxcpm.md`, `docs/PRODUCER_ASSET_CONTRACT.md`, `.env.example`, Compose, and archived handoffs remain unchanged unless direct verification finds a conflict.

## Commit Boundary

One commit contains only both Phase 8B real composition source sets, repo-authored SVG/fixture sources, manifest/registry/Root integration, focused and retained smoke updates, active-doc/skill alignment, inventory status, and this execution record. It contains no generated binary, private file, frozen edit, dependency/config/provider change, or Phase 9 implementation.

## Stop Condition

Stop after the local Phase 8B commit and final status verification. Phase 8 is complete only if both full production proofs passed; Phase 9 must be reported as next and explicitly unstarted.

## Plan Self-Review

- Spec coverage: current facts, complete Phase 8B acceptance, exact scope/non-goals, frozen boundary, CodeGraph chain, RED/GREEN, narration/assets/stills/covers/renders, Docker gates, docs, commit, and stop condition are explicit.
- Placeholder scan: every task names exact files, commands, expected failures, and required evidence; no unspecified fallback, relaxed allowlist, automatic scene generation, skipped review, or fake success path remains.
- Type consistency: composition ids, profile ids, sample slugs, three narration scene ids, manifest ownership, Root/registry ids, and validation commands match across tasks.
- Scope check: both real proofs are one Roadmap acceptance slice; Phase 9, shared abstraction promotion, provider/config/dependency changes, frozen sources, and committed generated artifacts remain excluded.

## Execution Record

- Starting boundary: branch `refactor/agent-producer-service`, commit `21b99e2`, clean tracked worktree, and passing focused Phase 8 contract/Producer baselines.
- RED: the first Docker `smoke:producer-style-profile-real-compositions` exited `1` on `Missing Phase 8B real proof: src/remotion/TcpHandshakeEditorial/TcpHandshakeEditorial.tsx`. The failure reached the intended missing production boundary without a Docker, dependency, syntax, or historical lint failure.
- Contract proof: both required scaffold invocations succeeded under `/tmp` with explicit `editorial-tech` and `retro-terminal` ids; no scaffold output entered the repository.
- VoxCPM: all six direct high-fidelity-clone tracks use provider `voxcpm` and positive measured durations. Editorial durations are `6.998083`, `7.656771`, and `7.273542` seconds (658 frames total); terminal durations are `6.779042`, `7.602688`, and `7.178104` seconds (646 frames total). No provider fallback ran.
- Assets and validation: both strict manifests localized seven audio files plus one repo-authored SVG. `producer:preflight` passed `8` assets and `producer:validate` passed for both composition ids.
- Visual review: six final representative stills and four code-rendered covers were inspected at original size. Initial transition-state samples at editorial frame 258 and terminal frame 479 were deterministic but unsuitable as stable evidence, so the review plan moved only those samples to frames 350 and 550. Both stable-frame A/B renders match exactly: editorial `64281b9fc0ca0e0eef0c5be469086191f59dc7c006b7981e31389f9e56bbe168`, terminal `494ad89a724535887225f408faaf0a4672c07b320e5e70dfbc7c72378aadfd03`.
- Render/QC: editorial produced 658 H.264 frames plus AAC at 1920x1080/30 fps, `21.994667` seconds and 4,315,510 bytes; terminal produced 646 frames, `21.589333` seconds and 9,556,650 bytes. Full FFmpeg decode passed. Mean/peak audio levels are `-22.2/-3.8 dB` and `-23.0/-5.7 dB`; no silence segment longer than one second at `-50 dB` was detected. Profile BGM, ambience, and SFX sources have distinct SHA-256 hashes. Human auditory playback was unavailable in the execution environment, so audio approval is objective decode/stream/level/silence evidence rather than a subjective listening claim.
- GREEN: focused style-profile real-composition, sample-contract/profile, Producer OS/sample-manifest/promotion/assets/validation/review, version/capability/media-sound, direct VoxCPM/audio tools, architecture, Web-removal, and skill-alignment smokes pass in Docker.
- Docker closure: `tsc --noEmit`, Remotion bundle, and composition enumeration pass; the list contains both videos and four cover Stills. Repository lint remains exactly the historical `39 errors, 2 warnings`, with no changed file in the failure set.
- Boundary checks: changed-file ESLint and Prettier 3.8.1 pass in Docker; shell syntax, SVG shape, JSON parse, Compose config, `git diff --check`, forbidden scans, frozen-source diff, ignored artifact/private voice checks, and dependency-lock diff pass. No WAV, MP4, PNG, localized asset, private voice, secret, or Phase 9 implementation is in the tracked change set.
- Staging review: 59 Phase 8B files are staged with no binary numstat entries, generated/output/private paths, frozen-composition source, dependency lock, or unstaged user change. The bounded commit message is `feat: prove producer style profiles in real compositions`; no push follows.
