# Terminal Session Provider Surface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Promote `terminal-session` from supplied-plan-only groundwork to a bounded provider-facing procedural generator.

**Architecture:** Keep execution deterministic: provider emits validated `procedural_generator` data, the existing procedural compiler converts it to `primitive_scene_graph`, and fallbacks remain `template_macro`. The planner/tool schema and parser become the provider boundary; rendering code stays unchanged.

**Tech Stack:** TypeScript, Zod, MiniMax function tool schemas, Remotion fixture smoke, Docker-first validation.

---

### Task 1: Provider Boundary Tests

**Files:**
- Modify: `src/lib/staged-smoke-fixtures.ts`

- [x] Add fixture assertions that the storyboard tool schema exposes `terminal-session`.
- [x] Add fixture assertions that full storyboard and segment revision prompts describe `terminal-session`.
- [x] Add fixture assertion that `parseStoryboardPlanToolCallArguments()` accepts a bounded `terminal-session` plan.
- [x] Run `npm run smoke:staged-fixtures` in Docker and verify the new assertions fail before implementation.

### Task 2: Provider Boundary Implementation

**Files:**
- Modify: `src/lib/minimax/tool-schema.ts`
- Modify: `src/lib/minimax/prompts.ts`
- Modify: `src/lib/minimax/parse-storyboard-plan.ts`

- [x] Add a strict provider JSON schema for `terminal-session`.
- [x] Include it in the provider-facing `proceduralGenerator` union.
- [x] Update full storyboard and segment revision prompts with bounded usage rules.
- [x] Remove the provider parser rejection gate for `terminal-session`.
- [x] Run the fixture smoke and verify it passes.

### Task 3: Live Smoke And Docs

**Files:**
- Modify: `scripts/staged-live-smoke.mjs`
- Modify: `docs/VISUAL_IR_COMPILER_ROADMAP.md`
- Modify: `docs/FINAL_PRODUCT_GOAL.md`
- Modify: `docs/ITERATION_STATUS.md`
- Modify as needed: `README.md`

- [x] Add a forced plan-mode live smoke for `terminal-session`.
- [x] Update active docs so Phase 4 says provider-facing support covers `node-graph-flow`, `line-path-flow`, and `terminal-session`.
- [x] Run Docker-first validation: `npm run smoke:staged-fixtures`, `npx tsc --noEmit`, `npm run lint`, `npm run build`, live staged smoke, and `git diff --check`.
