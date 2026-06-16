# Procedural Generator Planner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let provider-facing storyboard planning emit a bounded `procedural_generator` decision with a `node-graph-flow` payload for `scene-graph` segments.

**Architecture:** Keep execution deterministic: provider output is schema-valid structured data only, and existing `compileProceduralGeneratorSegment()` compiles it into `primitive_scene_graph` or falls back to `template_macro`. Do not add generated TSX, new generator families, or media-composite scope.

**Tech Stack:** TypeScript, Zod, MiniMax tool schemas, deterministic staged smoke fixtures, Docker-first validation.

---

## Continuation: Line Path Flow Provider Surface

**Goal:** Let provider-facing storyboard planning emit the second bounded procedural generator, `line-path-flow`, for `scene-graph` segments.

**Architecture:** Reuse the existing deterministic `line-path-flow` compiler path. The provider only emits validated structured data; staged generation still compiles it into actual `primitive_scene_graph` output and falls back to `template_macro` if compilation fails.

### Task 4: Line Path Tool Schema

**Files:**
- Modify: `src/lib/minimax/tool-schema.ts`
- Test: `src/lib/staged-smoke-fixtures.ts`

- [x] Add a failing deterministic assertion that `EMIT_STORYBOARD_PLAN_TOOL` accepts a `line-path-flow` payload with points and beats.
- [x] Run `docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'` and confirm the assertion fails because the tool schema still only exposes `node-graph-flow`.
- [x] Update the MiniMax storyboard tool schema to expose a bounded `oneOf` union for `node-graph-flow` and `line-path-flow`.
- [x] Re-run staged fixtures and confirm the assertion passes.

### Task 5: Planner Prompt And Live Smoke

**Files:**
- Modify: `src/lib/minimax/prompts.ts`
- Modify: `scripts/staged-live-smoke.mjs`

- [x] Update planner instructions so `node-graph-flow` is preferred for workflows/agents/dependencies and `line-path-flow` is preferred for timelines, progressions, journeys, funnels, or milestone paths.
- [x] Add a forced `line-path-flow` plan-mode live smoke request that verifies diagnostics show planned `procedural_generator`, generator id `line-path-flow`, actual compiled `primitive_scene_graph`, and no fallback.
- [x] Keep the existing normal-brief natural selection assertion scoped to `node-graph-flow`; do not make live smoke depend on provider naturally choosing `line-path-flow`.

### Task 6: Docs And Validation

**Files:**
- Modify: `docs/ITERATION_STATUS.md`
- Modify: `docs/VISUAL_IR_COMPILER_ROADMAP.md`
- Modify: `docs/FINAL_PRODUCT_GOAL.md`
- Modify: `docs/PRODUCT_REQUIREMENTS.md`
- Modify: `README.md`

- [x] Update active docs to say provider-facing planning now supports both `node-graph-flow` and `line-path-flow`, still only for `scene-graph` procedural generator segments.
- [x] Run Docker-first validation: staged fixtures, `tsc`, `lint`, `build`, live smoke when env is configured, and `git diff --check`.

### Task 1: Schema Acceptance

**Files:**
- Modify: `src/lib/storyboard-plan-schema.ts`
- Test: `src/lib/staged-smoke-fixtures.ts`

- [x] Add a failing smoke assertion that a `scene-graph` segment can carry `strategyDecision.strategy: "procedural_generator"` plus a valid `node-graph-flow` payload.
- [x] Run `docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'` and confirm schema rejection.
- [x] Extend storyboard planning schema so only `scene-graph` segments can use `procedural_generator`, and require a valid procedural generator payload for that strategy.
- [x] Re-run the smoke fixture and confirm the schema test passes.

### Task 2: Provider Tool Surface

**Files:**
- Modify: `src/lib/minimax/tool-schema.ts`
- Modify: `src/lib/minimax/prompts.ts`
- Test: `src/lib/staged-smoke-fixtures.ts`

- [x] Add a failing deterministic check that the MiniMax storyboard tool schema exposes `procedural_generator` and `node-graph-flow` fields.
- [x] Run the smoke fixture and confirm the tool-schema assertion fails.
- [x] Update provider-facing tool schema and prompts to describe the bounded generator shape and constraints.
- [x] Re-run the smoke fixture and confirm the tool-schema assertion passes.

### Task 3: Execution Contract And Docs

**Files:**
- Modify: `src/lib/staged-generation/segment.ts` if existing guarded execution does not trigger for provider plans.
- Modify: `scripts/staged-live-smoke.mjs`
- Modify: `docs/VISUAL_IR_COMPILER_ROADMAP.md`
- Modify: `docs/ITERATION_STATUS.md`
- Modify: `docs/FINAL_PRODUCT_GOAL.md`
- Modify: `README.md`

- [x] Confirm provider-shaped plans execute through `compileProceduralGeneratorSegment()` and diagnostics show planned `procedural_generator`, actual `primitive_scene_graph`, and fallback metadata on failure.
- [x] Extend live staged smoke to cover a forced `procedural_generator` `node-graph-flow` plan-mode request.
- [x] Update active docs to say provider-facing planner/tool schema is now available for `node-graph-flow`, while strategy remains bounded to `scene-graph` and deterministic compilation.
- [x] Run Docker-first validation: `tsc`, staged smoke fixtures, `lint`, `build`, and `git diff --check`.
