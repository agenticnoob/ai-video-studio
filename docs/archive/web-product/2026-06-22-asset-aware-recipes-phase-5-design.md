# Asset-Aware Recipes Phase 5 Design

Status: implemented for v1.

## Goal

Complete the first bounded slice of Visual Recipe Roadmap Phase 5 by adding one
asset-aware recipe to the existing `technical-explainer` template:
`product-ui-zoom`.

The slice proves that a generated recipe can reference concrete visual material
through controlled structured fields while preserving the current product loop:

```txt
brief
  -> StoryboardPlan
  -> narration synthesis
  -> audio + aligned captions
  -> selected template implementation
  -> VideoProject
  -> preview / edit / export
```

## Product Boundary

Phase 5 v1 does not introduce a media library, project persistence, arbitrary
remote asset ingestion, visual-review scoring, generated TSX, or
multi-template-per-segment orchestration.

The user-facing boundary remains `VideoProject`. The planner boundary remains
`StoryboardPlan`. Recipe choices remain optional planner hints. Narration audio
and captions remain segment-owned under `VideoSegment.narration`.

The new asset-aware behavior lives inside one template-owned recipe section:

```txt
VideoSegment.templateId = "technical-explainer"
VideoSegment.implementation.sections[].recipeId = "product-ui-zoom"
VideoSegment.implementation.sections[].asset = controlled screenshot/image descriptor
```

## Recommended Approach

Add `product-ui-zoom` as the tenth `technical-explainer` recipe.

This is the right first Phase 5 slice because Phase 4.5 explicitly deferred
`product-ui-zoom` until controlled screenshot or UI image inputs exist. It is
also visually meaningful: the recipe can pan and zoom over a UI surface while
keeping surrounding explanation text bounded and readable.

The asset descriptor should be intentionally small:

```ts
type ProductUiZoomAsset = {
  sourceType: "public" | "route";
  src?: string;
  alt: string;
  frameLabel?: string;
};

type ProductUiZoomSection = {
  id: string;
  recipeId: "product-ui-zoom";
  title: string;
  subtitle?: string;
  durationInFrames?: number;
  asset?: ProductUiZoomAsset;
  focalPoint?: {
    xPercent: number;
    yPercent: number;
    zoomPercent: number;
    label?: string;
  };
  callouts?: string[];
  fallbackSummary: string;
};
```

Rules:

- `sourceType` is limited to `public` or `route`.
- `src` is optional so missing-asset fallback can be schema-valid.
- `public` assets resolve through Remotion `staticFile()`.
- `route` assets use their route path during preview and are rewritten to the
  configured render origin for local export.
- arbitrary `http://` or `https://` asset URLs are not a supported
  provider-authored input in v1; route sources may still be rewritten to the
  configured local render origin as an internal export step after project
  validation.
- `fallbackSummary` is required and is rendered when no usable asset is present.
- `alt` is required when an asset exists, and should describe the screenshot or
  UI image.

## Alternatives Considered

### Asset-aware `terminal-build-run`

This would be lower risk because terminal output is already text. It is not the
best Phase 5 proof because it does not exercise real image/screenshot rendering
or preview/export asset resolution.

### Asset-aware `workflow-node-map`

This would add structured node data, but the recipe already works well without
external material. It is better left as a data-driven recipe until the product
needs imported diagrams.

### Project-level media image layers

Adding project-level image/video layers is a larger media-model milestone. It
would widen the product before proving that one recipe can safely consume
controlled concrete material.

## Architecture

### Template schema

`src/templates/technical-explainer/schema.ts` remains the source of truth for
recipe ids and implementation validation.

Add:

- `"product-ui-zoom"` to `technicalExplainerRecipeIds`
- a strict `productUiZoomSectionSchema`
- the section array bound from 9 to 10, so the deterministic preview can cover
  the tenth recipe without removing Phase 4.5 coverage
- a small reusable helper schema only if it stays local to this template file

Do not add a top-level `VideoProject.assets`, `StoryboardPlan.assetPlan`, or
global media registry in this slice.

### Template definition

`src/templates/technical-explainer/definition.ts` publishes the new recipe
through planner-safe metadata and updates the compiler JSON schema.

Definition changes:

- `capabilities.supportsMedia` becomes `true` for this template, but only
  because one recipe supports controlled screenshot/image descriptors.
- `planner.mediaExpectations` explains that external media is optional and
  limited to controlled `public` or `route` image references.
- `technicalExplainerPlannerRecipes` adds `product-ui-zoom`.
- `technicalExplainerImplementationJsonSchema` adds the new section shape.
- `implementationPrompt` and `revisionPrompt` describe the new fields.

The generic DeepSeek compiler prompt currently says not to include media fields.
Phase 5 should narrow that rule rather than remove it:

```txt
Do not include project-level media fields or narration asset metadata.
Only include template-owned controlled asset descriptors when the selected
template schema explicitly allows them, such as technical-explainer
product-ui-zoom.asset.
```

### Runtime rendering

`src/templates/technical-explainer/recipe-scenes.tsx` adds a
`ProductUiZoomScene` renderer.

Rendering behavior:

- Use Remotion frame-driven animation only.
- Use `<Img>` for valid assets.
- Use `staticFile()` when `sourceType === "public"`.
- Use the route `src` as provided when `sourceType === "route"`.
- Use a deterministic fallback panel when `asset.src` is missing.
- Keep captions safe by leaving the bottom caption area visually quiet.
- Do not use CSS transitions or CSS animations.

`src/templates/technical-explainer/runtime.tsx` routes the new recipe id to
`ProductUiZoomScene`. It should keep the calmer `stage-push` transition so the
image zoom remains inspectable.

### Preview and export asset resolution

Local preview can render route assets such as `/api/...` from the running Next
origin. Local export must rewrite route asset paths to an absolute origin before
Remotion renders.

The existing `src/lib/render-project.ts` already rewrites route media layers and
segment narration audio with `AI_VIDEO_STUDIO_RENDER_ASSET_ORIGIN`. Phase 5
extends that concept to template-owned image asset descriptors without
generalizing the whole media model.

Recommended implementation:

- keep the helper local to render-project or a small `src/lib/render-route-assets.ts`
  module
- detect `technical-explainer` segments
- rewrite only `product-ui-zoom.asset` when `sourceType === "route"` and
  `src` starts with `/`
- return a normalized `VideoProject`

### Deterministic fixtures

`src/lib/staged-smoke-fixtures.ts` should include:

- one `product-ui-zoom` section with a controlled `public` asset descriptor
- one `product-ui-zoom` section without `asset.src` to prove fallback behavior
- matching storyboard `recipeHints`

Because `public/` is currently empty, the implementation should add one small
repo-owned SVG or PNG fixture under `public/fixtures/phase5-ui-screenshot.svg`.
This is a deterministic test asset, not a media library.

### Smoke coverage

Update source-level smoke scripts to guard:

- `product-ui-zoom` is in schema, definition, runtime, scene renderer, fixtures,
  and planner recipe manifest
- `technical-explainer` publishes ten planner-facing recipes
- the fixture includes both asset-present and asset-missing fallback examples
- no provider-authored arbitrary remote URL support appears in the recipe
  schema or fixtures

Add a focused render still for visual inspection:

```bash
npx remotion still src/remotion/index.ts TechnicalExplainerTemplatePreview \
  /workspace/out/technical-explainer-preview-ui-zoom-slow.png --frame=375 --scale=0.5
```

The current slow Studio fixture places the asset-present recipe around frame
300; frame 375 shows the new treatment after the initial reveal.

## Data Flow

```txt
technical-explainer recipe catalog
  -> planner recipe manifest includes product-ui-zoom
  -> StoryboardPlan.segments[].recipeHints[] may request product-ui-zoom
  -> narration/TTS/captions remain unchanged
  -> selected-template compiler emits product-ui-zoom section data
  -> VideoProject carries template-owned implementation data
  -> preview renders Img or fallback
  -> export rewrites route src when needed
  -> ProjectVideo remains the preview/export composition
```

## Error Handling

- Invalid `sourceType`: schema validation fails, then the existing compiler
  repair path may retry.
- Remote provider-authored `src`: schema validation fails because `sourceType`
  excludes remote and the prompt forbids arbitrary URLs.
- Missing `asset`: render the fallback panel using `fallbackSummary`.
- Missing `asset.src`: render the fallback panel using `fallbackSummary`.
- Broken route/public image at render time: Remotion may fail to fetch or decode
  it. This is acceptable for v1; the deterministic missing-asset fallback covers
  absent fields, not unreachable declared assets.

## Testing

Use Docker-first validation.

Required deterministic checks:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:planner-recipe-manifest'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:technical-explainer-template'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:storyboard-recipe-hints'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
git diff --check
```

Required visual check:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx remotion still src/remotion/index.ts TechnicalExplainerTemplatePreview /workspace/out/technical-explainer-preview-ui-zoom-slow.png --frame=375 --scale=0.5'
```

Optional route/export check after deterministic validation:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-live'
```

Use contract-smoke F5 mode for route checks unless the Docker runtime can see an
NVIDIA driver.

## Acceptance

Phase 5 v1 is complete for this bounded slice:

- `technical-explainer` has a schema-valid `product-ui-zoom` recipe.
- The planner recipe manifest exposes `product-ui-zoom`.
- The selected-template compiler prompt can generate bounded `product-ui-zoom`
  sections without seeing renderer internals.
- Preview and export use the same `VideoProject` / `ProjectVideo` boundary.
- Route image assets are rewritten for local export the same way narration route
  assets are.
- Missing asset data produces a useful fallback frame.
- No broad media library, arbitrary remote URL support, persistence, visual
  scoring, generated TSX, or multi-template-per-segment orchestration is added.
