# Recipe Visual Blocks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract terminal, metric-card, workflow-map, and timeline showcase visuals into reusable Remotion recipe blocks.

**Architecture:** Keep `RecipeShowcasePreview` as the showcase composition and scene coordinator. Move reusable grouped visual blocks into `src/remotion/recipes/blocks/` with explicit typed props, frame-driven Remotion animation, and a barrel export.

**Tech Stack:** React, Remotion `useCurrentFrame()` / `interpolate()`, TypeScript, existing Docker-first smoke and typecheck validation.

---

### Task 1: Add Smoke Coverage For Recipe Blocks

**Files:**
- Modify: `scripts/recipe-showcase-preview-smoke.mjs`

- [ ] Extend the smoke script to require `src/remotion/recipes/blocks/index.ts`.
- [ ] Assert the block barrel exports `TerminalSessionBlock`, `MetricCardGrid`, `WorkflowMapBlock`, and `TimelineProgressBlock`.
- [ ] Assert `RecipeShowcasePreview` imports from `../recipes/blocks`.
- [ ] Run `docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:recipe-showcase-preview'` and confirm it fails because the blocks do not exist yet.

### Task 2: Implement Reusable Recipe Blocks

**Files:**
- Create: `src/remotion/recipes/blocks/terminal-session-block.tsx`
- Create: `src/remotion/recipes/blocks/metric-card-grid.tsx`
- Create: `src/remotion/recipes/blocks/workflow-map-block.tsx`
- Create: `src/remotion/recipes/blocks/timeline-progress-block.tsx`
- Create: `src/remotion/recipes/blocks/index.ts`

- [ ] Move terminal-panel rendering into `TerminalSessionBlock` with typed line props and frame-driven typewriter/scanline motion.
- [ ] Move metric count-up rendering into `MetricCardGrid` and `MetricCard` with typed metric props and frame-driven count/progress motion.
- [ ] Move workflow node/edge rendering into `WorkflowMapBlock` with explicit node coordinates and staggered reveal motion.
- [ ] Move timeline progress rendering into `TimelineProgressBlock` with typed checkpoints and frame-driven fill/activation motion.
- [ ] Export all public block components and prop types from the block barrel.

### Task 3: Rewire Showcase And Docs

**Files:**
- Modify: `src/remotion/RecipeShowcase/RecipeShowcasePreview.tsx`
- Modify: `docs/ITERATION_STATUS.md`
- Modify: `docs/VISUAL_RECIPE_ROADMAP.md`

- [ ] Replace local terminal, metric, workflow, and timeline block markup with the reusable block components.
- [ ] Keep showcase recipe ids, scene copy, transition overlay, and Remotion composition registration unchanged.
- [ ] Document that Phase 2 now includes grouped visual block primitives.

### Task 4: Verify

- [ ] Run `docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:recipe-showcase-preview'`.
- [ ] Run `docker compose run --rm web bash -lc 'rm -rf .next/types && [ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'`.
- [ ] If the refactor risks visual drift, render one representative still from `RecipeShowcasePreview`.
