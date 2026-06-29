# Main-Site Recipe Abstractions v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the main site generation path expose two sample-derived visual abstractions so the planner can choose them and the selected-template compiler can render better `VideoProject` segments.

**Architecture:** Keep `VideoProject` and one `templateId` per segment as the product boundary. Extract the PixelRAG sample into a `technical-explainer/screenshot-evidence-flow` recipe and the World Cup data-analysis sample into a `stats-dashboard/odds-ev-ranking` planner recipe, using existing registered templates and Remotion runtime paths.

**Tech Stack:** Next.js staged generation, Zod template schemas, planner recipe manifest, Remotion frame-driven runtime.

---

### Task 1: Lock Main-Site Recipe Selection With A Failing Smoke

**Files:**
- Create: `scripts/main-site-recipe-abstractions-smoke.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write the failing smoke**

Create a smoke that asserts:
- `buildPlannerRecipeManifest()` publishes `technical-explainer/screenshot-evidence-flow`.
- `buildPlannerRecipeManifest()` publishes `stats-dashboard/odds-ev-ranking`.
- Storyboard parsing accepts those `recipeHints` for their matching templates.
- The template compiler prompt payload carries `recipeHints` and `plannerRecipes`.
- Source files contain the schema/runtime hooks required to render each abstraction.

- [ ] **Step 2: Run it and verify RED**

Run:

```bash
docker compose run --rm web bash -lc 'npm run smoke:main-site-recipe-abstractions'
```

Expected: FAIL because the new recipe ids are not yet registered.

### Task 2: Add `technical-explainer/screenshot-evidence-flow`

**Files:**
- Modify: `src/templates/technical-explainer/schema.ts`
- Modify: `src/templates/technical-explainer/definition.ts`
- Modify: `src/templates/technical-explainer/recipe-scenes.tsx`
- Modify: `src/templates/technical-explainer/runtime.tsx`
- Modify: `src/lib/staged-smoke-fixtures.ts`

- [ ] **Step 1: Extend the schema**

Add a strict section shape with `recipeId: "screenshot-evidence-flow"`, `evidenceItems[3-5]`, optional `activeEvidenceId`, optional controlled `asset`, `callouts[1-3]`, and `fallbackSummary`.

- [ ] **Step 2: Publish planner metadata and compiler instructions**

Add the recipe to `technicalExplainerPlannerRecipes`, JSON schema, allowed recipe list, implementation prompt, and revision prompt.

- [ ] **Step 3: Render the section**

Add a frame-driven Remotion scene that presents a screenshot/fallback panel plus evidence cards, using `Img`/`staticFile` only for controlled public assets.

- [ ] **Step 4: Add fixtures**

Add the recipe to `technicalExplainerImplementation`, `technicalExplainerPreviewImplementation`, and storyboard `recipeHints`.

### Task 3: Add `stats-dashboard/odds-ev-ranking`

**Files:**
- Modify: `src/templates/stats-dashboard/definition.ts`
- Modify: `src/lib/staged-smoke-fixtures.ts`

- [ ] **Step 1: Publish planner metadata**

Add a planner recipe for odds, expected value, no-vig probability, risk ranking, and compact market-analysis stories.

- [ ] **Step 2: Strengthen compiler instructions**

Teach the stats-dashboard implementation prompt how to express this recipe with existing KPI, bar-chart, insight, and timeline blocks.

- [ ] **Step 3: Add a deterministic fixture**

Update the stats dashboard smoke fixture to include EV/risk ranking style data so the existing runtime path exercises the abstraction.

### Task 4: Green, Docs, And Verification

**Files:**
- Modify: `README.md`
- Modify: `docs/ITERATION_STATUS.md`
- Modify: `docs/VISUAL_RECIPE_ROADMAP.md`

- [ ] **Step 1: Run focused smoke**

Run:

```bash
docker compose run --rm web bash -lc 'npm run smoke:main-site-recipe-abstractions && npm run smoke:planner-recipe-manifest && npm run smoke:storyboard-recipe-hints && npm run smoke:technical-explainer-template && npm run smoke:staged-fixtures'
```

- [ ] **Step 2: Run gates**

Run:

```bash
docker compose run --rm web bash -lc 'npx tsc --noEmit --pretty false && npm run lint && npm run build'
git diff --check
```

- [ ] **Step 3: Document the corrected boundary**

Docs must say this affects main site generation because planner/LLM can select the published recipes during `brief -> StoryboardPlan -> template compile -> VideoProject`.
