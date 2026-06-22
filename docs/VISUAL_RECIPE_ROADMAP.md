# Visual Recipe Roadmap

Status: active roadmap for the clean `main` product line.

Use this document when the next task is about making generated videos look
better while preserving the current staged generation product model. The goal
is not to restart the product, not to merge the heavier scene-graph exploration
branch wholesale, and not to build a broad visual-review scoring system.

## 1. Thesis

The current `main` branch already has the right product skeleton:

```txt
brief
  -> StoryboardPlan
  -> per-segment narration synthesis
  -> audio + aligned captions
  -> selected template implementation
  -> VideoProject
  -> preview / edit / export
```

The weak point is visual quality, not the end-to-end pipeline.

The next product direction should upgrade simple templates into high-quality
scene recipes: reusable, polished, duration-aware visual treatments that the
planner can choose and the compiler can fill with schema-valid data.

In plain terms:

```txt
Do not widen the product.
Make the generated segments look more like finished videos.
```

## 2. Product Model

Keep the existing user-facing model:

- one `VideoProject` per generated video
- one or more `VideoSegment` entries per project
- one primary `templateId` per segment
- segment-owned narration audio and captions outside template-specific
  `implementation`
- real narration duration as the timing anchor
- local preview/edit/export through the existing Remotion path

Add a stronger internal concept:

```txt
template = registered segment implementation mechanism
recipe = polished visual treatment inside a template
```

A recipe is not a new top-level project object yet. It can start as a
template-local field or internal compiler decision.

Examples:

- `hero-title-reveal`
- `workflow-node-map`
- `terminal-build-run`
- `metric-countup`
- `timeline-progress`
- `code-diff-highlight`
- `before-after-compare`
- `product-ui-zoom`

The planner may eventually choose a recipe, but v1 can keep recipe selection
inside the selected template compiler.

## 3. Inspiration To Adopt

External video-generation frameworks such as VideoFlow are useful because they
make motion and composition first-class:

- sequential authoring with `wait`, parallel actions, and explicit holds
- reusable transition presets such as slide, blur resolve, typewriter, count-up,
  glitch resolve, and light sweep
- grouped layer trees that move as one visual unit
- keyframe/property animation across position, scale, opacity, blur, rotation,
  and effect parameters
- example videos that double as a capability showcase

Local mapping:

- use Remotion as the renderer
- keep AI output as bounded structured parameters
- encode motion grammar in repo-owned components and compilers
- add preview compositions for every important visual treatment
- expose recipes through existing templates before introducing a broader
  Visual IR system

## 4. What Not To Bring Back

Do not merge the prior scene-graph roadmap branch wholesale.

For this clean product line, avoid:

- broad visual-review scoring as the main quality strategy
- automatic screenshot repair loops
- browser/canvas QA as a core generation stage
- generic generated TSX as the normal path
- media-asset composite execution before recipes are visually strong
- multi-template-per-segment orchestration
- large roadmap or handoff document churn that obscures the current product
  boundary

The earlier exploration is still useful as research. Bring back ideas only
when they directly improve generated video quality in the current product
loop.

## 5. Roadmap

### Phase 0: Lock The Clean Product Boundary

Status: current branch goal.

Deliver:

- this roadmap
- active-doc links from `FINAL_PRODUCT_GOAL`, `ITERATION_STATUS`, `README`, and
  `AGENTS`
- explicit decision that `main` remains the product base
- explicit decision that the prior heavy review/scoring branch remains an
  experiment, not the merge target

Acceptance:

- a new worker can understand the next visual-quality direction without reading
  the experimental branch
- no implementation code changes are required

### Phase 1: Recipe Showcase Baseline

Status: implemented as the first visual-quality baseline.

Goal: create a visual quality target before changing live generation.

Deliver:

- a Remotion Studio preview composition that demonstrates 6 polished recipe
  treatments using static fixture data
- bounded subject-motion transitions between showcase scenes, starting with
  `stage-push`, `fly-through`, and `cube-turn`; the low-value full-frame
  light-sweep and scanline-wipe overlays have been removed from the active
  showcase, while `panel-push` remains as the only auxiliary overlay bridge
- no live LLM changes
- no new provider schema
- no project persistence changes

Candidate showcase treatments:

- title reveal with blur resolve and light sweep
- terminal session with typewriter rows, cursor, scanline, and success badge
- metric count-up with grouped card motion
- workflow map with staggered node/edge activation
- timeline progress with checkpoint emphasis
- code diff highlight with semantic color and line focus

Acceptance:

- `RecipeShowcasePreview` renders without placeholder audio
- still renders from the preview show visibly richer frames than the current
  simple template output:
  - `/workspace/out/recipe-showcase-hero.png`
  - `/workspace/out/recipe-showcase-terminal-late.png`
  - `/workspace/out/recipe-showcase-code.png`
- `npm run smoke:recipe-showcase-preview` ensures the preview composition stays
  registered and keeps the 6 expected recipe ids plus transition ids visible
  in source
- `npm run smoke:staged-fixtures` confirms Remotion can bundle and list the new
  composition beside the existing template previews
- transition boundary stills render for visual inspection, including:
  - `/workspace/out/recipe-motion-stage-push-v2.png`
  - `/workspace/out/recipe-motion-terminal-entry-mid.png`
  - `/workspace/out/recipe-motion-cube-turn-v3.png`

### Phase 2: Recipe Runtime Primitives

Status: complete for reusable runtime primitives.

Goal: factor the showcase into reusable template internals.

Deliver:

- a small motion preset catalog; v1 now exposes `stage-push`,
  `fly-through`, and `cube-turn` through
  `src/remotion/recipes/motion/scene-transition-stage.tsx`
- shared transition helpers for common reveal/exit patterns; v1 includes
  reusable scene sequencing, overlap, and content-preroll helpers
- grouped visual blocks for terminal, metric card, workflow map, and timeline;
  v2 exposes these through `src/remotion/recipes/blocks/`
- caption-safe layout defaults; v3 exposes
  `DEFAULT_RECIPE_CAPTION_SAFE_AREA` through `src/remotion/recipes/timing/`
- duration-aware helpers that map narration frames into reveal/hold/exit beats;
  v3 exposes `getRecipeBeatTiming()` through `src/remotion/recipes/timing/`

Acceptance:

- recipes are deterministic Remotion code
- animation remains frame-driven with Remotion APIs
- no CSS animation is used for render-critical timing
- existing `scripted`, `spotlight`, and `stats-dashboard` previews still load
- `RecipeShowcasePreview` consumes shared recipe-motion primitives instead of
  owning local copies of the stage transition logic
- `RecipeShowcasePreview` consumes shared recipe-block primitives instead of
  owning local copies of terminal, metric-card, workflow-map, and timeline
  block rendering
- `TimelineProgressBlock` consumes shared recipe timing helpers and
  caption-safe defaults
- `npm run smoke:recipe-timing` validates monotonic timing behavior for normal,
  short, and invalid durations
- `npm run smoke:recipe-showcase-preview` guards the `motion`, `blocks`, and
  `timing` public export surfaces

### Phase 3: High-Quality Recipe Templates

Status: implemented through the registered `technical-explainer` template.

Goal: make real generated segments use the better visual treatments.

Deliver:

- either upgrade existing `spotlight` / `stats-dashboard` internals or add one
  new registered recipe-oriented template
- v1 landed through the registered `technical-explainer` template
- template schema stays small and planner-friendly
- selected-template compiler fills recipe parameters from narration duration,
  visual brief, and structured segment intent
- selected-segment regeneration preserves non-target segments

Recommended first template path:

```txt
technical-explainer
```

Initial recipes:

- `hero-title-reveal`
- `terminal-build-run`
- `workflow-node-map`
- `metric-countup`
- `timeline-progress`

Phase 4.5 expands this generated template vocabulary to 9 planner-facing
recipes while preserving the same template boundary.

Acceptance:

- a deterministic staged fixture can render a multi-segment technical explainer
- each recipe can be inspected in Remotion Studio
- exported video uses the same `ProjectVideo` path as preview

### Phase 4: Planner Recipe Selection

Status: implemented for planner-facing recipe hints. Deterministic smoke and
contract-smoke provider-backed route smoke have passed. A real-GPU F5 smoke is
blocked in the current execution environment by a missing NVIDIA driver, not by
the staged route or recipe-hint implementation. Design and execution plan are captured in
`docs/superpowers/specs/2026-06-22-planner-recipe-selection-phase-4-design.md`
and
`docs/superpowers/plans/2026-06-22-planner-recipe-selection-phase-4.md`.

Goal: let DeepSeek choose recipes without exposing rendering internals.

Deliver:

- compact recipe manifest derived from registered template definitions
- recipe choices remain optional `StoryboardPlan` hints, not top-level
  `VideoProject` fields
- invalid recipe ids are rejected at the planner schema boundary or repaired by
  the bounded planner repair loop
- planner prompt guidance that chooses recipe families for common briefs
- selected-template compiler validation and bounded fallback
- live smoke for one normal brief that naturally selects recipe-rich output

Acceptance:

- the planner does not invent recipe ids
- invalid recipe choices fail validation or fallback clearly
- generated videos remain editable as `VideoProject`
- contract-smoke live route validation returns technical-explainer segments with
  segment-owned F5-provider narration audio, captions, and recipe sections

### Phase 4.5: Recipe Coverage Expansion

Status: implemented.

Goal: increase the real generated recipe vocabulary before introducing
asset-aware recipes.

Deliver:

- promote `code-diff-highlight` from showcase-only to the real
  `technical-explainer` template
- add `before-after-compare` for old/new workflow and problem/solution contrast
- add `decision-matrix` for bounded technical tradeoff explanations
- add `architecture-layer-stack` for module/layer ownership explanations
- keep all four recipes as bounded template-owned implementation fields
- keep `product-ui-zoom` deferred until Phase 5 because it depends on
  controlled screenshot or UI image inputs

Acceptance:

- `technical-explainer` publishes 9 planner-facing recipes
- deterministic staged fixtures include the four new recipes
- preview/export still use `ProjectVideo`
- no media library, arbitrary URLs, generated TSX execution, or visual scoring is
  introduced

### Phase 5: Asset-Aware Recipes

Goal: introduce concrete media only after recipe quality is strong.

Deliver:

- bounded fields for screenshots, images, icons, code snippets, terminal output,
  or chart data when a recipe explicitly supports them
- missing-asset fallback behavior inside the recipe
- no broad media library UI in the first pass

Acceptance:

- assets are referenced through controlled fields, not arbitrary remote URLs
- preview and export resolve the same asset data
- missing assets produce a useful fallback frame, not a broken render

## 6. First Implementation Slice

Recommended next implementation after this roadmap:

```txt
Recipe Runtime Primitives
```

Why:

- the visual baseline now exists as `RecipeShowcasePreview`
- the next useful work is extracting reusable motion, grouped blocks, and
  duration-aware timing helpers from that showcase
- live provider prompts should still wait until the recipe internals are
  reusable inside real templates

Minimum scope:

- keep the existing `RecipeShowcasePreview` behavior intact
- extract one or two reusable blocks first, such as terminal session and metric
  cards
- add targeted tests or smoke coverage before moving those blocks into a real
  template
- preserve existing `scripted`, `spotlight`, and `stats-dashboard` preview
  compositions

Do not include:

- live provider changes
- new API routes
- visual scoring
- automatic repair
- persistent storage
- media library

## 7. Validation

Use Docker-first validation on this workstation.

For roadmap-only changes:

```bash
git diff --check
```

For preview/recipe implementation slices:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run build'
```

Add a targeted Remotion still render for each new showcase composition.

## 8. Decision Record

Current decision:

- Continue from `main`, not from the heavier scene-graph roadmap branch.
- Treat the scene-graph roadmap branch as research.
- Preserve the staged generation / F5 / caption / preview / export product
  loop.
- Invest next in high-quality recipe visuals, motion grammar, and previewable
  examples.

This keeps the product moving toward better generated videos without adding
another layer of review infrastructure before the visuals themselves are good.
