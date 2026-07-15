# Planner Recipe Selection Phase 4 Design

Status: implemented and closed. Deterministic smoke and contract-smoke
provider-backed route smoke have validated the planner recipe selection
boundary. Real-GPU F5 staged-route smoke remains environment-dependent and
requires Docker access to an NVIDIA driver.

## Goal

Complete Visual Recipe Roadmap Phase 4 by letting DeepSeek choose recipe
families during storyboard planning without exposing Remotion rendering
internals or changing the top-level product model.

Phase 4 should end with planner-visible recipe hints that are derived from
registered template definitions, validated at the `StoryboardPlan` boundary,
passed into the selected-template compiler, and compiled into schema-valid
template implementation data.

## Product Boundary

Keep the current product loop unchanged:

```txt
brief
  -> StoryboardPlan
  -> narration synthesis
  -> audio + aligned captions
  -> selected template implementation
  -> VideoProject
  -> preview / edit / export
```

This phase does not create a global recipe object in `VideoProject`, does not
introduce multi-template-per-segment orchestration, and does not move recipe
runtime code outside the owning template. A recipe remains a polished visual
treatment inside a registered template. The planner only gets a compact,
provider-safe description of recipe families.

## Recommended Approach

Use planner-level recipe hints:

```ts
type StoryboardRecipeHint = {
  recipeId: string;
  reason: string;
};

type StoryboardSegmentPlan = {
  templateId: TemplateId;
  recipeHints?: StoryboardRecipeHint[];
};
```

The planner may provide `recipeHints` only for templates that publish a recipe
manifest. The selected-template compiler remains responsible for turning those
hints into final template-specific implementation fields.

Why this is the right boundary:

- It lets the planner reason about visual vocabulary without seeing renderer
  code.
- It keeps `VideoProject` and `VideoSegment` stable.
- It keeps recipe ownership inside template modules.
- It gives validation a narrow place to reject invented recipe ids.
- It allows older plans and fixtures to keep working because `recipeHints` is
  optional.

## Alternatives Considered

### Compiler-only recipe selection

The compiler could continue choosing recipe sections from `visualBrief` without
planner-visible hints. This is the smallest code change, but it does not
deliver Phase 4 because the planner still cannot choose recipe families.

### Top-level recipe model

Recipes could become project-level or segment-level objects. This is too wide
for the current product stage. It would expose template internals to the main
project schema and make later media-layer work harder to separate.

## Architecture

### Template definition layer

`src/templates/definition.ts` gains a compact recipe manifest type under
planner metadata:

```ts
export type TemplatePlannerRecipe = {
  recipeId: string;
  label: string;
  bestFor: string[];
  avoidCases: string[];
  requiredInputsSummary: string;
  durationFit: string;
};

export type TemplatePlannerMetadata = {
  description: string;
  avoidCases: string[];
  narrationFit: string;
  mediaExpectations: string;
  examples: string[];
  recipes?: TemplatePlannerRecipe[];
};
```

Only templates that have planner-facing recipes set `planner.recipes`. Existing
templates can omit the field.

### Technical explainer recipe catalog

`src/templates/technical-explainer/schema.ts` becomes the source of truth for
allowed recipe ids by exporting an id tuple:

```ts
export const technicalExplainerRecipeIds = [
  "hero-title-reveal",
  "terminal-build-run",
  "workflow-node-map",
  "metric-countup",
  "timeline-progress",
] as const;

export const technicalExplainerRecipeIdSchema = z.enum(technicalExplainerRecipeIds);
```

`definition.ts` imports the tuple or inferred type and publishes matching
planner metadata. This prevents schema, prompt, and smoke tests from drifting
apart.

### Registry layer

`src/templates/registry.ts` derives a planner recipe manifest from registered
template definitions. The prompt should keep recipe data nested under the
owning template:

```txt
- technical-explainer (Technical Explainer)
  description: ...
  recipes:
    - hero-title-reveal: bestFor=opening promise, thesis, framing
    - terminal-build-run: bestFor=CLI, logs, build/test/deploy flows
```

The registry owns formatting for prompt-safe recipe manifest text. DeepSeek
prompt files should not hard-code the recipe catalog.

### Storyboard plan schema

`src/lib/storyboard-plan-schema.ts` adds optional `recipeHints` to
`storyboardSegmentPlanSchema`.

Validation rules:

- `recipeHints` is optional.
- Each hint requires non-empty `recipeId` and `reason`.
- A segment may include at most 5 hints.
- Hints are allowed only when the selected template publishes recipes.
- Each `recipeId` must belong to the selected template's recipe manifest.
- Hints do not replace `templateId` and do not become implementation fields.

### Provider prompt layer

`src/lib/deepseek/prompts.ts` updates the planner and one-segment revision
prompts to say:

- The planner may include `recipeHints` from the selected template's manifest.
- The planner must not generate `implementation`, `sections`, `theme`, colors,
  Remotion code, or media URLs.
- The compiler, not the planner, turns recipe hints into template fields.

The selected-template compiler prompt includes `segment.recipeHints` in the
input payload and tells the model to respect valid hints where they fit the
narration duration.

### Compiler and repair behavior

No new compiler output type is needed. The current
`deepseekCompileTemplateImplementation()` path remains the selected-template
compiler. It already validates the returned implementation against the selected
template schema and retries once on parse or validation failure.

Phase 4 adds one bounded behavior:

- Invalid planner recipe ids fail at the StoryboardPlan parse boundary and use
  the existing storyboard repair attempt.
- Valid hints that produce invalid implementation are handled by the existing
  template compiler repair attempt.
- Empty hints keep the current compiler behavior.

### Diagnostics

Keep diagnostics simple. The first implementation only needs to surface the
existing planner/compiler attempts and repaired flags. If a new diagnostic is
added, it should be a provider-boundary field such as `recipeHints: { planned,
accepted }`, not a visual scoring system.

## Data Flow

```txt
technical-explainer schema
  -> technical-explainer planner.recipes
  -> registry-derived recipe manifest
  -> storyboard planner prompt
  -> StoryboardPlan.segments[].recipeHints[]
  -> narration and real duration
  -> selected-template compiler input
  -> technical-explainer implementation.sections[]
  -> assembled VideoProject
```

## Error Handling

- Invented recipe id: `StoryboardPlanParseError`, then one planner repair
  attempt.
- Recipe hint for a template without recipes: `StoryboardPlanParseError`, then
  one planner repair attempt.
- Valid recipe hint but invalid implementation section: existing
  `TemplateImplementationParseError`, then one compiler repair attempt.
- Missing recipe hints: accepted and compiled with the current template
  compiler behavior.

## Validation

Use Docker-first validation:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:planner-recipe-manifest'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:storyboard-recipe-hints'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:technical-explainer-template'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
```

Run provider-backed live smoke after deterministic coverage is green:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-live'
```

## Acceptance

Phase 4 is complete when:

- The planner recipe manifest is derived from registered template definitions.
- `technical-explainer` publishes the five recipe families currently supported
  by its schema.
- Storyboard plans can include valid `recipeHints`.
- Invalid recipe ids are rejected or repaired at the planner boundary.
- The compiler receives valid recipe hints without exposing Remotion internals
  to the planner.
- Generated output remains a normal editable `VideoProject`.
- Docs describe Phase 4 as planner-facing recipe selection, not a broad visual
  IR rewrite.

## Non-Goals

- no `VideoProject` top-level recipe model
- no global recipe registry outside template definitions
- no generated TSX execution
- no media library or media-layer editor
- no visual-review scoring
- no screenshot repair loop
- no persistence or history
- no multi-template-per-segment orchestration
