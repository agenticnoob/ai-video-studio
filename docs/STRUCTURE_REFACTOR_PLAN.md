# Structure Refactor Plan

Status: planned; behavior-preserving structural cleanup only.

This document defines the next cleanup pass for `ai-video-studio`. The goal is
to make the already-working staged generation path easier to reason about,
test, and extend without changing the product model or adding new features.

Authoritative product direction remains `docs/FINAL_PRODUCT_GOAL.md`.
Current runtime status remains `docs/ITERATION_STATUS.md`.

## Goal

Tighten the implementation around the current shipped model:

```txt
brief
  -> StoryboardPlan
  -> per-segment narration synthesis
  -> audio + captions
  -> selected-template implementation compile
  -> assembled VideoProject
  -> preview/edit/regenerate/export
```

The cleanup should improve:

- cohesion: each module owns one clear stage or boundary
- decoupling: route handlers, provider code, UI state, and Remotion timeline
  flattening should depend on small contracts rather than each other's details
- diagnosability: planner/compiler/provider diagnostics should be created in
  one place
- testability: deterministic smokes and live smokes should map to clear
  product paths

## Non-Goals

Do not widen scope into:

- saved drafts, history, or project persistence
- multi-template-per-segment orchestration
- broad media-layer editing or timeline editing
- subtitle editor, waveform editor, beat sync, or audio mixing UI
- provider marketplace work
- product model changes away from `VideoProject`, `VideoSegment`,
  `templateId`, `implementation`, or `VideoSegment.narration`

## Current Coupling Hotspots

### 1. Staged generation orchestration

Current files:

- `src/lib/staged-generation/pipeline.ts`
- `src/lib/staged-generation/segment.ts`
- `src/lib/staged-generation/diagnostics.ts`
- `src/lib/staged-generation/assembly.ts`
- `src/lib/staged-project-generation.ts`
- `src/lib/staged-generation-api.ts`
- `src/lib/staged-project-assembly.ts`
- `src/app/api/generate/staged/route.ts`

Current status:

- Phase 1 has split orchestration, one planned segment's narration/compile
  work, assembly, and response diagnostics into `src/lib/staged-generation/*`.
- `src/lib/staged-project-generation.ts` and
  `src/lib/staged-project-assembly.ts` remain compatibility re-export files.
- `narrationLayers` no longer appears in the core staged result shape;
  diagnostics derive narration counts from `VideoSegment.narration.audio`.

### 2. TTS and F5 provider boundary

Current files:

- `src/lib/tts/index.ts`
- `src/lib/tts/f5.ts`
- `src/lib/tts/minimax.ts`
- `src/lib/tts/artifacts.ts`
- `src/lib/captions.ts`

Current issues:

- provider selection, voice clone rules, synthesis fallback, caption fallback,
  and sidecar writing are close together.
- voice clone must force F5 and must not silently fall back to MiniMax.
- normal F5 generation can still use configured fallback behavior.
- caption sidecar output must remain identical to final segment-owned caption
  data.

### 3. Frontend generation state

Current files:

- `src/helpers/use-project-generation.ts`
- `src/components/project/GenerationPanel.tsx`
- `src/components/project/PreviewPanel.tsx`

Current issues:

- one hook currently combines project selection state, generation actions,
  selected-segment regeneration, voice clone upload, payload validation,
  loading flags, and error state.
- the public facade can stay stable while internals are split.

### 4. Remotion timeline flattening

Current files:

- `src/remotion/ProjectVideo/ProjectVideo.tsx`
- `src/remotion/ProjectVideo/ProjectNarrationLayers.tsx`
- `src/remotion/ProjectVideo/ProjectCaptionLayers.tsx`
- `src/remotion/ProjectVideo/ProjectMediaLayers.tsx`
- `src/lib/project-schema.ts`

Current issues:

- segment-owned narration and captions are the target model, but render-time
  flattening logic is spread across Remotion components.
- compatibility suppression for old project-level narration layers should be
  kept explicit and isolated.
- Remotion code must remain frame-driven.

### 5. Smoke and validation entrypoints

Current files:

- `scripts/f5-tts-smoke.sh`
- `scripts/f5-tts-next-smoke.sh`
- `scripts/f5-tts-staged-smoke.mjs`
- `package.json`
- `docs/providers/f5-tts-service-plan.md`
- `README.md`

Current issues:

- deterministic staged smoke already validates F5 narration, captions, asset
  serving, mixed-template assembly, and optional export.
- a live `POST /api/generate/staged` smoke that combines MiniMax
  planner/compiler with real F5 narration is still the main validation gap.

## Phased Plan

### Phase 0: Document the cleanup boundary

Status: this document.

Deliverables:

- `docs/STRUCTURE_REFACTOR_PLAN.md`
- `docs/HANDOFF_STRUCTURE_REFACTOR.md`
- status links from `docs/ITERATION_STATUS.md`, `README.md`, and `AGENTS.md`

Validation:

- `git diff --check`

### Phase 1: Refactor staged generation pipeline

Status: implemented.

Target shape:

```txt
src/lib/staged-generation/
  pipeline.ts       // brief/plan/segment orchestration
  segment.ts        // one planned segment: narration + template compile
  diagnostics.ts    // route response diagnostics
  assembly.ts       // project assembly and segment replacement helpers
  index.ts          // compatibility exports
```

Implementation rules:

- preserve existing public behavior for `mode: "brief"`, `mode: "plan"`, and
  `mode: "segment"`.
- keep `VideoSegment.narration.audio` and `VideoSegment.narration.captions` as
  the generated narration home.
- do not reintroduce project-level narration media layers as the primary
  carrier.
- keep selected-segment regeneration scoped to the target segment.
- move response diagnostics out of `src/app/api/generate/staged/route.ts`.
- remove `narrationLayers` from core staged results unless a narrow
  compatibility reason is proven.

Result:

- `src/lib/staged-generation/pipeline.ts` owns full and selected-segment
  orchestration.
- `src/lib/staged-generation/segment.ts` owns one planned segment's narration
  asset generation and selected-template compilation.
- `src/lib/staged-generation/diagnostics.ts` owns route response diagnostics.
- `src/lib/staged-generation/assembly.ts` owns assembly and selected-segment
  replacement helpers.
- `narrationLayers` was removed from the core staged result; the route keeps
  the legacy `diagnostics.narrationLayerCount` field by deriving it from
  segment-owned narration audio.

Validation:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'
git diff --check
```

### Phase 2: Refactor TTS and F5 provider boundary

Status: implemented.

Target shape:

```txt
src/lib/tts/
  index.ts              // public TTS boundary
  provider-selection.ts // provider and voice clone selection
  synthesis.ts          // provider dispatch and fallback rules
  caption-artifacts.ts  // sidecar persistence
  f5.ts                 // F5 HTTP adapter
  minimax.ts            // MiniMax adapter
```

Implementation rules:

- voice clone requests must force `f5-tts`.
- voice clone requests must not silently fall back to MiniMax.
- non-clone F5 requests may still fall back according to F5 config.
- sidecar caption artifacts must reflect the final normalized
  `VideoSegment.narration.captions` payload.
- keep provider-returned captions/alignment preferred over fallback captions.

Result:

- `src/lib/tts/provider-selection.ts` owns provider choice and the voice-clone
  rule that forces F5 and disables MiniMax fallback.
- `src/lib/tts/synthesis.ts` owns provider dispatch and configured non-clone
  F5-to-MiniMax fallback.
- `src/lib/tts/caption-artifacts.ts` owns sidecar caption JSON persistence.
- `src/lib/tts/index.ts` remains the public TTS boundary for
  `generateSegmentNarrationAsset()`.

Validation:

```bash
scripts/f5-tts-real.sh health
scripts/f5-tts-next-smoke.sh
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:f5-staged'
git diff --check
```

### Phase 3: Refactor frontend generation state

Status: implemented.

Target shape:

```txt
src/helpers/project-generation/
  use-project-state.ts
  use-generation-actions.ts
  use-voice-clone.ts
  use-project-generation.ts // stable facade
```

Implementation rules:

- keep `GenerationPanel` and `PreviewPanel` behavior stable.
- preserve voice reference upload retry behavior.
- keep generation-time validation for missing voice clone reference audio or
  reference text.

Result:

- `src/helpers/project-generation/use-project-state.ts` owns project, selected
  segment, brief, revision prompt, and generation mode state.
- `src/helpers/project-generation/use-voice-clone.ts` owns reference upload,
  upload errors, and generation-time voice clone payload validation.
- `src/helpers/project-generation/use-generation-actions.ts` owns full-project
  generation and selected-segment regeneration actions.
- `src/helpers/project-generation/use-project-generation.ts` preserves the
  previous facade shape, while `src/helpers/use-project-generation.ts` remains
  a compatibility export.

Validation:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run build'
git diff --check
```

### Phase 4: Refactor Remotion timeline flattening

Status: implemented.

Before editing Remotion rendering code, read:

- `.agents/skills/remotion-best-practices/SKILL.md`

Target shape:

```txt
src/lib/project-timeline.ts
src/remotion/ProjectVideo/
  ProjectVideo.tsx
  ProjectNarrationLayers.tsx
  ProjectCaptionLayers.tsx
  ProjectMediaLayers.tsx
```

Implementation rules:

- keep segment-local caption timing in generated project data.
- flatten segment-owned narration and captions into the global timeline only
  at render time.
- keep old project-level narration media layer suppression for compatibility.
- keep Remotion animation and timing frame-driven.
- do not introduce CSS animations, CSS transitions, or Tailwind animation
  utilities for render-critical motion.

Result:

- `src/lib/project-timeline.ts` owns segment timeline windows, segment-owned
  narration flattening, segment-owned caption flattening, and compatibility
  suppression of old project-level narration media layers.
- `ProjectVideo`, `ProjectNarrationLayers`, and `ProjectCaptionLayers` now use
  the shared timeline helpers while keeping Remotion timing frame-driven.

Validation:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run build'
git diff --check
```

### Phase 5: Normalize smoke and add live staged route smoke

Status: implemented.

Target shape:

- direct service smoke: F5 runtime health and direct synthesis
- Next adapter smoke: `POST /api/tts`
- deterministic staged smoke: no MiniMax planner/compiler calls
- live staged route smoke: `POST /api/generate/staged` with MiniMax
  planner/compiler plus real F5 narration
- optional export smoke: `/api/render`

Implementation rules:

- keep deterministic smoke as the reliable no-MiniMax path.
- add the live smoke only when MiniMax credentials/config are present.
- live smoke should verify generated segments contain segment-owned narration
  audio and captions.
- live smoke should verify `/api/tts/assets/...` byte-range serving.
- optional export should verify the rendered MP4 exists and is non-empty.

Result:

- Added `scripts/staged-live-smoke.mjs`.
- Added `npm run smoke:staged-live`.
- Added `npm run smoke:staged-live:render`.
- The live smoke exits successfully with a clear skip message when
  `MINIMAX_API_KEY` or `F5_TTS_BASE_URL` is missing.

Validation:

```bash
scripts/f5-tts-real.sh health
scripts/f5-tts-next-smoke.sh
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:f5-staged'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-live'
git diff --check
```

## Suggested Commit Order

1. `docs: add structure refactor handoff`
2. `refactor: organize staged generation pipeline`
3. `refactor: tighten tts provider boundary`
4. `refactor: split project generation hook`
5. `refactor: centralize project timeline flattening`
6. `test: add live staged generation smoke`

Each commit should update relevant docs before handoff.
