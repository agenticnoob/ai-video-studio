# Asset Plan Boundary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the first bounded Phase 5 asset-plan boundary so staged planning can describe required assets without introducing upload UI, remote URLs, or executable media compositing.

**Architecture:** Keep `VideoProject` and current render strategies unchanged. Add a strict `AssetPlan` data contract to `StoryboardPlan`, expose it through provider tool schema and prompts, and surface it in staged diagnostics so missing future assets are inspectable while preview/export continue through existing template, SceneGraph, and procedural paths.

**Tech Stack:** TypeScript, Zod, MiniMax tool JSON schema, existing staged smoke fixtures, Docker-first validation.

---

### Task 1: AssetPlan Schema Red Test

**Files:**
- Modify: `src/lib/staged-smoke-fixtures.ts`
- Modify: `src/lib/storyboard-plan-schema.ts`

- [ ] **Step 1: Write a failing smoke assertion**

Add a fixture assertion that a plan may include `assetPlan.requiredAssets[]` with asset ids, kinds, purposes, and fallbacks, and that invented URL-like values are rejected by schema validation.

- [ ] **Step 2: Run red verification**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'
```

Expected: fail because `assetPlan` is not yet accepted by `storyboardPlanSchema`.

- [ ] **Step 3: Implement minimal schema**

Create strict Zod schemas in `src/lib/storyboard-plan-schema.ts`:
- `assetKindSchema`
- `assetRequirementSchema`
- `assetPlanSchema`

Allow an optional top-level `assetPlan` on `StoryboardPlan`. Do not add `media_asset_composite` to executable render strategies.

- [ ] **Step 4: Run green verification**

Run the same smoke command and confirm it passes.

### Task 2: Diagnostics And Tool Surface

**Files:**
- Modify: `src/lib/staged-generation/diagnostics.ts`
- Modify: `src/lib/minimax/tool-schema.ts`
- Modify: `src/lib/minimax/prompts.ts`
- Modify: `src/lib/staged-smoke-fixtures.ts`

- [ ] **Step 1: Add a failing diagnostics/tool assertion**

Extend fixture coverage so staged diagnostics report `assetPlan.requiredAssetCount` and `requiredAssets[]`, and the MiniMax storyboard tool schema exposes `assetPlan` without allowing URL fields.

- [ ] **Step 2: Run red verification**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'
```

Expected: fail because diagnostics and tool schema do not expose `assetPlan`.

- [ ] **Step 3: Implement diagnostics and prompt/tool schema**

Add `assetPlan?: { requiredAssetCount: number; requiredAssets: ... }` to staged diagnostics. Update planner prompts to tell providers that assets are references by id/fallback only, not URLs, and update the tool schema with a bounded `assetPlan.requiredAssets` object.

- [ ] **Step 4: Run green verification**

Run the same smoke command and confirm it passes.

### Task 3: Documentation Alignment

**Files:**
- Modify: `docs/VISUAL_IR_COMPILER_ROADMAP.md`
- Modify: `docs/ITERATION_STATUS.md`
- Modify: `docs/FINAL_PRODUCT_GOAL.md`
- Modify: `docs/PRODUCT_REQUIREMENTS.md`
- Modify: `README.md` if startup/current-stage text references the roadmap stage

- [ ] **Step 1: Update active docs**

Document that Phase 5 has started as a non-executable asset-plan boundary. Make clear that assets are requested by stable ids/kinds/purposes/fallbacks, no broad media library UI exists, no remote URL invention is accepted, and preview/export still use existing paths.

- [ ] **Step 2: Remove stale next-goal wording**

Replace the old roadmap “Next Goal To Define” text that still names completed Visual IR Generation v1 with the Asset Plan boundary slice.

- [ ] **Step 3: Check doc formatting**

Run:

```bash
git diff --check
```

Expected: no whitespace errors.

### Task 4: Final Verification

**Files:**
- No source edits unless verification exposes a bug.

- [ ] **Step 1: Run targeted smoke**

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'
```

- [ ] **Step 2: Run typecheck**

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
```

- [ ] **Step 3: Run lint**

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
```

- [ ] **Step 4: Run build if type/lint changes are non-trivial**

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run build'
```

- [ ] **Step 5: Inspect diff**

```bash
git diff --check
git status --short --branch
```
