# Handoff: Structure Refactor

Status: all planned structure refactor phases implemented.

Use this handoff when the next implementation task is "make the code more
elegant, decoupled, cohesive, and modular" without changing product behavior.

## One-Sentence Context

The product pipeline already works; the next job is a behavior-preserving
structural cleanup around staged generation, TTS/F5, frontend generation state,
Remotion timeline flattening, and smoke validation.

## Read First

Read these files before planning edits:

1. `docs/FINAL_PRODUCT_GOAL.md`
2. `docs/ITERATION_STATUS.md`
3. `docs/STRUCTURE_REFACTOR_PLAN.md`
4. `docs/HANDOFF_STRUCTURE_REFACTOR.md`
5. `docs/HANDOFF_F5_TTS_CAPTIONS.md` if touching TTS, F5, captions, or
   `VideoSegment.narration`
6. `docs/providers/f5-tts-service-plan.md` if touching F5 runtime or smoke
   commands
7. `.agents/skills/remotion-best-practices/SKILL.md` if touching Remotion
   rendering code

## Current Product Boundary

Keep these stable:

- `VideoProject` is the preview/edit/export boundary.
- `VideoSegment` is the segment editing and selected-regeneration boundary.
- each segment has one primary `templateId`.
- `templateId` determines the schema of `implementation`.
- generated narration text, audio, and captions belong under
  `VideoSegment.narration`.
- project-level narration media layers are compatibility carriers only.
- `POST /api/generate/staged` is the active page generation path.

## Recommended Subagent Split

If using Subagent-Driven, split the work by boundary. Do not ask every subagent
to edit at once; use them to inspect and propose first, then implement one
slice at a time.

### Subagent A: staged pipeline

Scope:

- `src/lib/staged-project-generation.ts`
- `src/lib/staged-generation-api.ts`
- `src/lib/staged-project-assembly.ts`
- `src/app/api/generate/staged/route.ts`

Questions:

- which functions are pure orchestration versus one-segment work?
- can diagnostics move out of the route?
- can `narrationLayers` be removed from staged result shape without behavior
  loss?
- what compatibility exports are needed to avoid a large calling-side diff?

Expected output:

- a small migration plan for `src/lib/staged-generation/*`
- exact public functions that should stay stable
- validation commands

### Subagent B: TTS/F5 boundary

Scope:

- `src/lib/tts/index.ts`
- `src/lib/tts/f5.ts`
- `src/lib/tts/minimax.ts`
- `src/lib/tts/artifacts.ts`
- `src/lib/captions.ts`
- `src/lib/narration-asset-schema.ts`

Questions:

- where should provider selection live?
- where should voice clone "force F5, no MiniMax fallback" live?
- where should caption sidecar writing live?
- which errors should stay provider errors versus config errors?

Expected output:

- a proposed provider boundary split
- fallback invariants
- smoke commands that prove behavior stayed the same

### Subagent C: frontend generation state

Scope:

- `src/helpers/use-project-generation.ts`
- `src/components/project/GenerationPanel.tsx`
- `src/components/project/PreviewPanel.tsx`
- `src/app/page.tsx`

Questions:

- what state is pure project selection/editing?
- what state is generation request execution?
- what state belongs to voice clone upload and validation?
- can the existing `useProjectGeneration` return shape remain stable?

Expected output:

- hook split proposal
- component behavior risks
- validation commands

### Subagent D: Remotion timeline flattening

Scope:

- `src/remotion/ProjectVideo/ProjectVideo.tsx`
- `src/remotion/ProjectVideo/ProjectNarrationLayers.tsx`
- `src/remotion/ProjectVideo/ProjectCaptionLayers.tsx`
- `src/remotion/ProjectVideo/ProjectMediaLayers.tsx`
- `src/lib/project-schema.ts`

Questions:

- where should segment start and duration helpers live?
- how should segment-owned narration/captions flatten to global timeline?
- how should old project-level narration layer suppression stay isolated?

Expected output:

- a timeline helper proposal
- Remotion-specific constraints from the repo-local skill
- validation commands

### Subagent E: smoke and docs

Scope:

- `scripts/*smoke*`
- `package.json`
- `README.md`
- `docs/providers/f5-tts-service-plan.md`
- `docs/ITERATION_STATUS.md`

Questions:

- which smoke covers which product path?
- what command should prove deterministic F5 staged assembly?
- what command should prove live `POST /api/generate/staged` when credentials
  are available?

Expected output:

- smoke taxonomy
- proposed live staged smoke command name
- docs update list

## Completed Slice

Phase 1 from `docs/STRUCTURE_REFACTOR_PLAN.md` is implemented:

```txt
Refactor staged generation pipeline.
```

Recommended target files:

```txt
src/lib/staged-generation/
  pipeline.ts
  segment.ts
  diagnostics.ts
  assembly.ts
  index.ts
```

Keep old imports working where practical by either:

- leaving `src/lib/staged-project-generation.ts` as a compatibility re-export,
  or
- updating all call sites in the same commit with a small diff.

Current state:

- `src/lib/staged-generation/pipeline.ts` owns brief/plan/segment
  orchestration.
- `src/lib/staged-generation/segment.ts` owns one planned segment's narration
  asset generation and selected-template compilation.
- `src/lib/staged-generation/diagnostics.ts` owns route response diagnostics.
- `src/lib/staged-generation/assembly.ts` owns project assembly and
  selected-segment replacement helpers.
- `src/lib/staged-project-generation.ts` and
  `src/lib/staged-project-assembly.ts` remain compatibility re-exports.
- `narrationLayers` has been removed from the core staged result shape.

Behavior to preserve:

- `mode: "brief"` generates a full staged project from a user brief.
- `mode: "plan"` generates from a supplied `StoryboardPlan`.
- `mode: "segment"` regenerates only the selected segment.
- selected-segment regeneration preserves non-target segments.
- planner and compiler repair diagnostics remain visible.
- segment-owned narration audio and captions remain present.
- voice clone payload continues through staged brief and segment generation.

## Completed Cleanup

`narrationLayers` appears in staged generation results, but target narration
ownership has moved to `VideoSegment.narration`. `assembleStagedProject` does
not use narration layers. This cleanup has been applied:

- core pipeline state no longer returns `narrationLayers`
- legacy diagnostics are computed directly from segment-owned narration audio
- project-level narration media layers were not reintroduced as the primary
  model

## Completed Follow-Up Slices

Phases 2 through 5 from `docs/STRUCTURE_REFACTOR_PLAN.md` are implemented:

- TTS/F5 provider boundary is split across `src/lib/tts/provider-selection.ts`,
  `src/lib/tts/synthesis.ts`, and `src/lib/tts/caption-artifacts.ts`.
- Frontend generation state is split under `src/helpers/project-generation/`
  with a stable facade and compatibility export.
- Remotion timeline flattening is centralized in `src/lib/project-timeline.ts`.
- Live provider-backed staged route smoke is available as
  `npm run smoke:staged-live`; use `npm run smoke:staged-live:render` for the
  optional render path.

Current next step:

- Run the validation baseline after any follow-up edits.
- Treat new work as a separate product or hardening slice rather than more
  structure refactor backlog.

## Validation Baseline

Default to Docker-first validation:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'
git diff --check
```

If the slice touches F5/TTS behavior, add:

```bash
scripts/f5-tts-real.sh health
scripts/f5-tts-next-smoke.sh
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:f5-staged'
```

If the slice touches frontend or Remotion export behavior, add:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run build'
```

## Handoff Checklist

Before ending the implementation conversation:

- update `docs/ITERATION_STATUS.md`
- update `docs/STRUCTURE_REFACTOR_PLAN.md` if a phase is completed or changed
- update this handoff if the next slice changes
- run the relevant Docker-first validation commands
- include exact commands and outcomes in the final response
- if committing/pushing, write the commit message and keep this handoff current
