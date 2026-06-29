# Standalone Video Runtime V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract a reusable standalone finished-video runtime that supports both the 16:9 PixelRAG sample and the 9:16 WorldCup data-analysis sample without merging their visual styles.

**Architecture:** Add a `src/remotion/standalone-video/` core with canvas profiles, content families, scene timing helpers, active-caption lookup, static voiceover rendering, and a generic timeline component. Keep sample-specific renderers inside their existing folders; only move shared sequencing, audio, subtitle, and metadata concerns into the new runtime.

**Tech Stack:** TypeScript, React, Remotion 4, existing Node smoke scripts, Docker-first validation.

---

## File Structure

- Create `src/remotion/standalone-video/types.ts`: shared canvas/content family contracts, scene timing fields, audio track fields.
- Create `src/remotion/standalone-video/timeline.ts`: pure helpers for scene starts, duration, scene maps, and active captions.
- Create `src/remotion/standalone-video/runtime.tsx`: generic Remotion timeline, voiceover, and bottom caption components.
- Create `src/remotion/standalone-video/index.ts`: public exports.
- Create `scripts/standalone-video-runtime-smoke.mjs`: deterministic smoke for profile classification, timeline overlap, sequential timing, active-caption lookup, and package exports.
- Modify `package.json`: add `smoke:standalone-video-runtime`.
- Modify `src/remotion/PixelRAGChineseStandalone/types.ts`: reuse shared canvas/content-family/profile types while preserving existing public constants.
- Modify `src/remotion/PixelRAGChineseStandalone/PixelRAGChineseStandalone.tsx`: replace local start/duration/caption/audio sequencing with shared runtime helpers.
- Modify `src/remotion/WorldCupBettingAnalysis/types.ts`: reuse shared canvas/content-family/profile and generic audio track shape.
- Modify `src/remotion/WorldCupBettingAnalysis/WorldCupBettingAnalysis.tsx`: replace local scene-start map and voiceover component with shared helpers/runtime.
- Modify `scripts/pixelrag-chinese-standalone-smoke.mjs`: assert PixelRAG is `landscape-16x9` / `project-intro` and uses the shared standalone runtime.
- Modify `scripts/world-cup-betting-analysis-smoke.mjs`: assert WorldCup is `portrait-9x16` / `data-analysis` and uses the shared standalone runtime.
- Modify `README.md`, `docs/ITERATION_STATUS.md`, `docs/VISUAL_RECIPE_ROADMAP.md`: document that standalone samples now share a categorized runtime rather than a single universal visual template.

## Task 1: Shared Core and Smoke

**Files:**
- Create: `src/remotion/standalone-video/types.ts`
- Create: `src/remotion/standalone-video/timeline.ts`
- Create: `src/remotion/standalone-video/index.ts`
- Create: `scripts/standalone-video-runtime-smoke.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write failing smoke**

Create `scripts/standalone-video-runtime-smoke.mjs` with tests that import compiled standalone-video helpers, assert the two supported canvas profiles, verify sequential and overlapped start-frame calculation, verify duration fallback for empty scenes, verify active-caption lookup at cue boundaries, and check the source exports the expected runtime names.

- [ ] **Step 2: Run smoke and confirm RED**

Run:

```bash
docker compose run --rm web bash -lc 'npm run smoke:standalone-video-runtime'
```

Expected: fail because the script/package entry or shared module does not exist yet.

- [ ] **Step 3: Implement pure shared core**

Create `types.ts`, `timeline.ts`, and `index.ts` with:

- `StandaloneCanvasProfileId = "landscape-16x9" | "portrait-9x16"`
- `StandaloneContentFamily = "project-intro" | "data-analysis" | "tutorial" | "trend-briefing"`
- `STANDALONE_CANVAS_PROFILES` for `1280x720` and `1080x1920` at 30fps
- `getStandaloneCanvasProfile(id)`
- `StandaloneTimedScene`
- `StandaloneAudioTrack`
- `buildStandaloneSceneStartFrames(scenes, { overlapFrames? })`
- `buildStandaloneSceneStartMap(scenes, { overlapFrames? })`
- `getStandaloneDurationInFrames(scenes, { overlapFrames? })`
- `getActiveStandaloneCaption(captions, frame)`

- [ ] **Step 4: Wire package smoke**

Add:

```json
"smoke:standalone-video-runtime": "rm -rf /tmp/standalone-video-runtime-smoke-build && npx tsc --allowJs --target es2022 --module commonjs --moduleResolution node --skipLibCheck --esModuleInterop --noEmit false --outDir /tmp/standalone-video-runtime-smoke-build scripts/standalone-video-runtime-smoke.mjs src/remotion/standalone-video/index.ts src/remotion/standalone-video/types.ts src/remotion/standalone-video/timeline.ts && NODE_PATH=/workspace/node_modules:node_modules node /tmp/standalone-video-runtime-smoke-build/scripts/standalone-video-runtime-smoke.mjs"
```

- [ ] **Step 5: Run smoke and confirm GREEN**

Run:

```bash
docker compose run --rm web bash -lc 'npm run smoke:standalone-video-runtime'
```

Expected: pass.

## Task 2: Shared Remotion Runtime

**Files:**
- Create: `src/remotion/standalone-video/runtime.tsx`
- Modify: `src/remotion/standalone-video/index.ts`
- Modify: `scripts/standalone-video-runtime-smoke.mjs`
- Modify: `package.json`

- [ ] **Step 1: Extend smoke for runtime exports**

Update `scripts/standalone-video-runtime-smoke.mjs` to read `src/remotion/standalone-video/runtime.tsx` and assert it exports `StandaloneTimeline`, `StandaloneVoiceover`, and `StandaloneBottomCaption`, uses `<Sequence`, `<Audio`, `pauseWhenBuffering`, and `staticFile`.

- [ ] **Step 2: Run smoke and confirm RED**

Run:

```bash
docker compose run --rm web bash -lc 'npm run smoke:standalone-video-runtime'
```

Expected: fail because `runtime.tsx` does not exist or exports are missing.

- [ ] **Step 3: Implement runtime components**

Create `runtime.tsx` with:

- `StandaloneTimeline<TScene>`: maps scenes to Remotion `Sequence`, accepts `overlapFrames`, `renderScene`, optional `renderAudio`, and optional `renderOverlay`.
- `StandaloneVoiceover`: renders Remotion `Audio` via `staticFile(audioFile)` with `pauseWhenBuffering` and optional `playbackRate`.
- `StandaloneBottomCaption`: finds active cue using `getActiveStandaloneCaption`, supports `variant: "landscape" | "portrait"`, and renders a bottom subtitle bar.

- [ ] **Step 4: Export runtime**

Update `index.ts` to export runtime components.

- [ ] **Step 5: Run smoke and confirm GREEN**

Run:

```bash
docker compose run --rm web bash -lc 'npm run smoke:standalone-video-runtime'
```

Expected: pass.

## Task 3: Refactor PixelRAG onto Runtime

**Files:**
- Modify: `src/remotion/PixelRAGChineseStandalone/types.ts`
- Modify: `src/remotion/PixelRAGChineseStandalone/PixelRAGChineseStandalone.tsx`
- Modify: `scripts/pixelrag-chinese-standalone-smoke.mjs`

- [ ] **Step 1: Add failing PixelRAG runtime assertions**

Update smoke to assert `profileId === "landscape-16x9"`, `contentFamily === "project-intro"`, and component source includes `StandaloneTimeline`, `StandaloneVoiceover`, `StandaloneBottomCaption`, and `overlapFrames={8}`.

- [ ] **Step 2: Run PixelRAG smoke and confirm RED**

Run:

```bash
docker compose run --rm web bash -lc 'npm run smoke:pixelrag-chinese-standalone'
```

Expected: fail because PixelRAG has not yet declared the shared profile/family or runtime usage.

- [ ] **Step 3: Add profile/family fields**

Update PixelRAG constants and data contract to carry `profileId: "landscape-16x9"` and `contentFamily: "project-intro"` while preserving existing width/height/fps constants.

- [ ] **Step 4: Refactor timeline/audio/caption**

Use `getStandaloneDurationInFrames(data.scenes, { overlapFrames: 8 })`, `StandaloneTimeline`, `StandaloneVoiceover`, and `StandaloneBottomCaption`. Keep PixelRAG-specific `Atmosphere`, `SceneText`, `SceneVisual`, foreground 3D, and exit opacity local.

- [ ] **Step 5: Run PixelRAG and shared smokes**

Run:

```bash
docker compose run --rm web bash -lc 'npm run smoke:standalone-video-runtime && npm run smoke:pixelrag-chinese-standalone'
```

Expected: pass.

## Task 4: Refactor WorldCup onto Runtime

**Files:**
- Modify: `src/remotion/WorldCupBettingAnalysis/types.ts`
- Modify: `src/remotion/WorldCupBettingAnalysis/data.ts`
- Modify: `src/remotion/WorldCupBettingAnalysis/WorldCupBettingAnalysis.tsx`
- Modify: `scripts/world-cup-betting-analysis-smoke.mjs`

- [ ] **Step 1: Add failing WorldCup runtime assertions**

Update smoke to assert `profileId === "portrait-9x16"`, `contentFamily === "data-analysis"`, and component source includes `StandaloneTimeline` and `StandaloneVoiceover`.

- [ ] **Step 2: Run WorldCup smoke and confirm RED**

Run:

```bash
docker compose run --rm web bash -lc 'npm run smoke:world-cup-betting-analysis'
```

Expected: fail because WorldCup has not yet declared the shared profile/family or runtime usage.

- [ ] **Step 3: Add profile/family fields**

Update WorldCup data contract and data object to carry `profileId: "portrait-9x16"` and `contentFamily: "data-analysis"`. Keep odds/match/ranking data local.

- [ ] **Step 4: Refactor timeline/audio**

Use `buildStandaloneSceneStartMap` for existing helper needs, `StandaloneTimeline` for scene sequencing, and `StandaloneVoiceover` with the current `1.1` playback rate. Keep `SummaryStrip`, scene renderers, pitch lines, tables, formula, and disclaimer local.

- [ ] **Step 5: Run WorldCup and shared smokes**

Run:

```bash
docker compose run --rm web bash -lc 'npm run smoke:standalone-video-runtime && npm run smoke:world-cup-betting-analysis'
```

Expected: pass.

## Task 5: Docs and Final Verification

**Files:**
- Modify: `README.md`
- Modify: `docs/ITERATION_STATUS.md`
- Modify: `docs/VISUAL_RECIPE_ROADMAP.md`

- [ ] **Step 1: Update docs**

Document that finished-video-first samples now share `src/remotion/standalone-video/`, with ratio-specific canvas profiles and content-family-specific renderers. Explicitly say this is not a universal visual template and does not replace `VideoProject`.

- [ ] **Step 2: Run full targeted verification**

Run:

```bash
docker compose run --rm web bash -lc 'npm run smoke:standalone-video-runtime && npm run smoke:pixelrag-chinese-standalone && npm run smoke:world-cup-betting-analysis && npx tsc --noEmit --pretty false && npm run lint'
```

Expected: all pass.

- [ ] **Step 3: Run diff check**

Run:

```bash
git diff --check
```

Expected: no output.

- [ ] **Step 4: Review git status**

Run:

```bash
git status --short
```

Expected: only intended source/docs/smoke changes plus local generated assets already present in the working tree.
