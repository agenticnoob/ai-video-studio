# Terminal Session Procedural Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add deterministic `terminal-session` procedural generator groundwork that compiles supplied plan-mode payloads into the existing `scene-graph` / `primitive_scene_graph` path.

**Architecture:** Keep this as Phase 4 groundwork only: add a bounded Zod schema, deterministic compile-to-SceneGraph mapping, staged diagnostics coverage, and docs. Do not expose `terminal-session` to provider-facing planner/tool schema yet, and do not add generated TSX, media composite, or new Remotion primitives.

**Tech Stack:** TypeScript, Zod, Remotion SceneGraph data, deterministic staged smoke fixtures, Docker-first validation.

---

### Task 1: Red Fixture

**Files:**
- Modify: `src/lib/staged-smoke-fixtures.ts`

- [x] Add a failing deterministic fixture that imports `terminalSessionGeneratorSchema` and `compileTerminalSessionToSceneGraph`.
- [x] Assert a valid `terminal-session` payload parses, compiles to `primitive_scene_graph`, includes a `terminal-panel` layer, runs through `compileProceduralGeneratorSegment()`, and appears in staged diagnostics.
- [x] Run `docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'`.
- [x] Expected failure: TypeScript/bundle error because the new schema/compiler exports do not exist yet.

### Task 2: Schema And Compiler

**Files:**
- Modify: `src/lib/procedural-generator-schema.ts`
- Modify: `src/lib/procedural-generator-compiler.ts`

- [x] Add `TERMINAL_SESSION_GENERATOR_ID = "terminal-session"`.
- [x] Add a bounded `terminalSessionGeneratorSchema` with title, summary, status, command lines, optional prompt, beats, duration, caption-safe metadata, theme, and fallback strategy.
- [x] Extend `proceduralGeneratorSchema` and exported types with `TerminalSessionGenerator`.
- [x] Implement `compileTerminalSessionToSceneGraph()` to emit a `process` SceneGraph with background, title text, terminal-panel, optional summary callout, caption layer, and segment-local beats targeting the terminal layer.
- [x] Extend `compileProceduralGeneratorImplementation()` to dispatch `terminal-session`.
- [x] Re-run staged fixtures and confirm the new fixture passes.

### Task 3: Docs And Validation

**Files:**
- Modify: `docs/ITERATION_STATUS.md`
- Modify: `docs/VISUAL_IR_COMPILER_ROADMAP.md`
- Modify: `docs/FINAL_PRODUCT_GOAL.md`
- Modify: `docs/PRODUCT_REQUIREMENTS.md`
- Modify: `docs/PRODUCT_ARCHITECTURE.md`
- Modify: `AGENTS.md`
- Modify: `README.md`

- [x] Document that `terminal-session` is deterministic schema/compiler groundwork only, not provider-facing planner output.
- [x] Run Docker-first validation: staged fixtures, `tsc`, `lint`, `build`, and `git diff --check`.
