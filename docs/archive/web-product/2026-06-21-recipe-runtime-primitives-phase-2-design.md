# Recipe Runtime Primitives Phase 2 Design

Status: approved direction, pending implementation plan.

## Goal

Complete Phase 2 of `docs/VISUAL_RECIPE_ROADMAP.md` by finishing the reusable
Remotion recipe runtime primitive layer.

Phase 2 should end with a small, modular, deterministic internal library under
`src/remotion/recipes/` that can support Phase 3 template work without changing
the product model.

## Product Boundary

This phase keeps the current staged generation product loop unchanged:

```txt
brief
  -> StoryboardPlan
  -> narration synthesis
  -> audio + captions
  -> selected template implementation
  -> VideoProject
  -> preview / edit / export
```

The work remains preview/runtime-only. It does not change DeepSeek prompts,
provider schemas, staged generation APIs, project persistence, media layers, or
registered template contracts.

Phase 2 completion means the primitives are ready for Phase 3 template adoption.
It does not mean generated projects already use these recipes.

## Current Baseline

Already implemented:

- `RecipeShowcasePreview` is the static quality baseline.
- `src/remotion/recipes/motion/` exposes the reusable scene transition stage
  and the current motion ids: `stage-push`, `fly-through`, and `cube-turn`.
- `src/remotion/recipes/blocks/` exposes grouped visual blocks:
  `TerminalSessionBlock`, `MetricCardGrid`, `MetricCard`,
  `WorkflowMapBlock`, and `TimelineProgressBlock`.
- `RecipeShowcasePreview` consumes the shared motion and block primitives.
- `scripts/recipe-showcase-preview-smoke.mjs` guards registration, recipe ids,
  transition ids, reusable exports, and the no-placeholder-audio rule.

## Proposed Architecture

Use three cohesive recipe-runtime modules:

```txt
src/remotion/recipes/
  motion/
    scene-transition-stage.tsx
    index.ts
  blocks/
    block-animation.ts
    terminal-session-block.tsx
    metric-card-grid.tsx
    workflow-map-block.tsx
    timeline-progress-block.tsx
    index.ts
  timing/
    recipe-timing.ts
    index.ts
```

### `recipes/motion`

Responsibility:

- scene-level entry / exit / overlap motion
- transition sequence timing for whole showcase scenes
- motion id catalog for deterministic callers

Dependencies:

- Remotion frame APIs
- React only where rendering is required

Non-responsibilities:

- block-local reveal timing
- template schemas
- generated project compilation

### `recipes/blocks`

Responsibility:

- reusable grouped visual units that can be composed inside future templates
- typed props for semantic content
- frame-driven reveal and internal animation
- stable defaults for visual density and layout

Dependencies:

- Remotion frame APIs
- recipe timing helpers once they exist

Non-responsibilities:

- deciding which block a planner should use
- changing registered template contracts
- fetching or resolving media assets

### `recipes/timing`

Responsibility:

- shared duration-aware timing helpers for recipe internals
- reveal / hold / exit beat calculation from a total frame duration
- caption-safe layout defaults for recipe scenes
- small reusable helper functions that can be unit-smoked by source checks and
  typechecked by TypeScript

Initial public API:

```ts
export type RecipeBeatTiming = {
  revealStartFrame: number;
  revealEndFrame: number;
  holdStartFrame: number;
  holdEndFrame: number;
  exitStartFrame: number;
  exitEndFrame: number;
};

export type RecipeCaptionSafeArea = {
  bottom: number;
  left: number;
  right: number;
};

export const DEFAULT_RECIPE_CAPTION_SAFE_AREA: RecipeCaptionSafeArea;

export const getRecipeBeatTiming: (options: {
  durationInFrames: number;
  minRevealFrames?: number;
  minExitFrames?: number;
  revealRatio?: number;
  exitRatio?: number;
}) => RecipeBeatTiming;
```

The helper should clamp short durations into valid monotonic frame ranges. The
caller should never receive negative frame values or an exit range that starts
before the hold range.

## Data Flow

Phase 2 data flow stays local to Remotion preview code:

```txt
RecipeShowcasePreview
  -> recipes/motion for scene sequence motion
  -> recipes/blocks for grouped visuals
  -> recipes/timing for duration-aware beat defaults
```

No data flows from planner output, provider response, API routes, or template
definition metadata into the new timing helper during this phase.

## Error Handling And Constraints

- Invalid or tiny durations should be normalized into safe monotonic beat
  ranges instead of producing negative frames.
- All render-critical animation must remain frame-driven through Remotion APIs.
- CSS animations, CSS transitions, and Tailwind animation utilities remain out
  of scope for render-critical motion.
- The showcase must continue to avoid placeholder narration audio.
- Public exports should stay narrow and typed. Avoid a generic visual IR,
  expression tree, or plugin system in this phase.

## Validation

Use Docker-first validation:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:recipe-showcase-preview'
docker compose run --rm web bash -lc 'rm -rf .next/types && [ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
```

Render one representative still only if the implementation changes visible
showcase layout or motion:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx remotion still src/remotion/index.ts RecipeShowcasePreview /workspace/out/recipe-phase2-complete.png --frame=650 --scale=0.5'
```

## Acceptance

Phase 2 is complete when:

- `src/remotion/recipes/motion/`, `src/remotion/recipes/blocks/`, and
  `src/remotion/recipes/timing/` expose narrow public barrels.
- `RecipeShowcasePreview` still consumes shared primitives instead of local
  transition or grouped-block copies.
- duration-aware timing and caption-safe defaults are available for Phase 3
  templates.
- `npm run smoke:recipe-showcase-preview` guards the timing barrel and required
  helper exports.
- `docs/ITERATION_STATUS.md`, `docs/VISUAL_RECIPE_ROADMAP.md`, and `README.md`
  describe Phase 2 as complete and Phase 3 as the next real-template adoption
  step.
- Docker-first smoke, typecheck, and lint pass.

## Non-Goals

- no DeepSeek prompt changes
- no provider schema changes
- no staged generation route changes
- no new registered template
- no real generated project behavior change
- no media-layer modeling
- no persistence/history
- no visual scoring or screenshot repair loop

