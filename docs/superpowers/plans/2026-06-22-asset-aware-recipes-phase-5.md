# Asset-Aware Recipes Phase 5 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Phase 5 v1 asset-aware recipe support by implementing one controlled `product-ui-zoom` recipe inside the existing `technical-explainer` template.

**Architecture:** Keep `VideoProject`, `StoryboardPlan`, segment narration/audio/captions, and one-primary-template-per-segment unchanged. Add a template-owned `product-ui-zoom` section schema, planner metadata, compiler rules, renderer, deterministic fixtures, and route-asset export rewrite for that section only; do not add a media library or global asset model.

**Tech Stack:** TypeScript, Zod, React, Remotion `<Img>` / `staticFile()` / frame APIs, existing template registry, DeepSeek JSON-mode compiler prompts, deterministic source-level smoke scripts, Docker-first validation, Remotion still renders, ESLint, `tsc --noEmit`.

**Execution note:** Implemented as one consolidated Phase 5 v1 slice plus a
follow-up slow Studio preview fixture. The unchecked task boxes below remain as
the original execution plan unless a separate executor marked them while
working.

---

## Scope Boundary

Implement:

- `product-ui-zoom` as the tenth planner-facing `technical-explainer` recipe
- controlled screenshot/image asset fields inside the recipe section
- deterministic missing-asset fallback rendering inside the recipe
- preview/export-compatible route asset resolution for that recipe
- deterministic fixture coverage for asset-present and asset-missing paths
- smoke coverage and active docs updates

Do not implement:

- broad media-library UI
- project-level image/video media layers
- arbitrary remote image URLs
- upload/storage API for screenshots
- persistence/history
- visual-review scoring or screenshot repair
- generated TSX execution
- multi-template-per-segment orchestration

## Approach Decision

Recommended path: implement `product-ui-zoom` inside `technical-explainer`.

Why:

- Phase 4.5 explicitly deferred `product-ui-zoom` until controlled screenshot or
  UI image inputs exist.
- It proves real visual asset rendering, unlike text-only terminal assets.
- It keeps ownership local to the recipe-oriented template.
- It avoids widening the top-level product model before one recipe proves the
  asset boundary.

Rejected alternatives:

- `terminal-build-run` asset fields: too text-heavy to validate image preview/export behavior.
- `workflow-node-map` imported diagrams: useful later, but it would blur the structured-node recipe that already works.
- project-level image media layers: broader media-model work, not Phase 5 v1.

## File Structure

- Modify: `src/templates/technical-explainer/schema.ts`
  - Add `product-ui-zoom` recipe id, strict section schema, and a 10-section bound.
- Modify: `src/templates/technical-explainer/definition.ts`
  - Add planner metadata, JSON schema, compiler prompt rules, revision prompt rules, and `supportsMedia: true`.
- Modify: `src/templates/technical-explainer/recipe-scenes.tsx`
  - Add `ProductUiZoomScene` with `<Img>` rendering and fallback panel.
- Modify: `src/templates/technical-explainer/runtime.tsx`
  - Route `product-ui-zoom` sections to the new scene renderer.
- Modify: `src/lib/render-project.ts`
  - Rewrite `product-ui-zoom.asset.src` route paths for export.
- Modify: `src/lib/staged-smoke-fixtures.ts`
  - Add asset-present and asset-missing `product-ui-zoom` fixture sections and recipe hints.
- Add: `public/fixtures/phase5-ui-screenshot.svg`
  - Small deterministic SVG screenshot-like fixture for Remotion `<Img>` rendering.
- Modify: `scripts/technical-explainer-template-smoke.mjs`
  - Require `product-ui-zoom`, renderer coverage, fixture coverage, and no provider-authored remote URL support.
- Modify: `scripts/planner-recipe-manifest-smoke.mjs`
  - Require `product-ui-zoom` in the recipe manifest.
- Modify: `scripts/storyboard-recipe-hints-smoke.mjs`
  - Include `product-ui-zoom` in the valid recipe hint fixture.
- Modify: `docs/ITERATION_STATUS.md`
  - Record Phase 5 v1 plan/status after implementation.
- Modify: `docs/VISUAL_RECIPE_ROADMAP.md`
  - Mark Phase 5 status and summarize the bounded first slice.
- Modify: `README.md`
  - Update current visual-quality direction after implementation.

## Recipe Contract

Add this template-owned section shape:

```ts
{
  id: string;
  recipeId: "product-ui-zoom";
  title: string;
  subtitle?: string;
  durationInFrames?: number;
  asset?: {
    sourceType: "public" | "route";
    src?: string;
    alt: string;
    frameLabel?: string;
  };
  focalPoint?: {
    xPercent: number; // 0-100
    yPercent: number; // 0-100
    zoomPercent: number; // 100-180
    label?: string;
  };
  callouts?: string[]; // 1-3
  fallbackSummary: string;
}
```

Validation rules:

- `asset.sourceType` only allows `public` or `route`.
- `asset.src` is optional; when omitted, renderer uses fallback.
- `asset.alt` is required when `asset` exists.
- `focalPoint.xPercent` and `focalPoint.yPercent` are 0-100.
- `focalPoint.zoomPercent` is 100-180.
- `callouts` has at most 3 compact strings.
- `fallbackSummary` is required and max 220 characters.

## Task 1: Add Red Smoke Coverage For Phase 5

**Files:**
- Modify: `scripts/technical-explainer-template-smoke.mjs`
- Modify: `scripts/planner-recipe-manifest-smoke.mjs`

- [ ] **Step 1: Update technical explainer smoke expectations**

In `scripts/technical-explainer-template-smoke.mjs`, add `product-ui-zoom` to
`requiredRecipeIds`:

```js
const requiredRecipeIds = [
  "hero-title-reveal",
  "terminal-build-run",
  "workflow-node-map",
  "metric-countup",
  "timeline-progress",
  "code-diff-highlight",
  "before-after-compare",
  "decision-matrix",
  "architecture-layer-stack",
  "product-ui-zoom",
];
```

Add these assertions near the other scene/fixture checks:

```js
assertIncludes(sceneSource, "ProductUiZoomScene", "technical explainer scene renderers");
assertIncludes(runtimeSource, "ProductUiZoomScene", "technical explainer runtime");
assertIncludes(fixtureSource, 'recipeId: "product-ui-zoom"', "staged smoke fixtures");
assertIncludes(fixtureSource, "phase5-ui-screenshot.svg", "staged smoke fixtures");
assertIncludes(fixtureSource, "fallbackSummary", "staged smoke fixtures");
```

Add a guard that v1 does not support provider-authored arbitrary remote image URLs:

```js
if (
  schemaSource.includes('"remote"') ||
  fixtureSource.includes('sourceType: "remote"') ||
  fixtureSource.includes("https://")
) {
  throw new Error("Phase 5 v1 product-ui-zoom must not allow arbitrary remote image URLs.");
}
```

- [ ] **Step 2: Update planner recipe manifest smoke expectations**

In `scripts/planner-recipe-manifest-smoke.mjs`, add `product-ui-zoom` to
`requiredRecipeIds`.

- [ ] **Step 3: Run the red smoke commands**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:technical-explainer-template'
```

Expected: FAIL with a missing `product-ui-zoom`, `ProductUiZoomScene`, or fixture snippet.

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:planner-recipe-manifest'
```

Expected: FAIL because the planner recipe manifest is missing `product-ui-zoom`.

## Task 2: Add The Product UI Zoom Schema

**Files:**
- Modify: `src/templates/technical-explainer/schema.ts`

- [ ] **Step 1: Add the recipe id**

Add `"product-ui-zoom"` to `technicalExplainerRecipeIds` after
`"architecture-layer-stack"`.

- [ ] **Step 2: Add strict asset and focal point schemas**

Add before `technicalExplainerSectionSchema`:

```ts
const productUiZoomAssetSchema = z
  .object({
    sourceType: z.enum(["public", "route"]),
    src: z.string().trim().min(1).max(240).optional(),
    alt: z.string().trim().min(1).max(160),
    frameLabel: z.string().trim().min(1).max(80).optional(),
  })
  .strict();

const productUiZoomFocalPointSchema = z
  .object({
    xPercent: z.number().min(0).max(100),
    yPercent: z.number().min(0).max(100),
    zoomPercent: z.number().min(100).max(180),
    label: z.string().trim().min(1).max(80).optional(),
  })
  .strict();

const productUiZoomSectionSchema = sectionBaseSchema.extend({
  recipeId: z.literal("product-ui-zoom"),
  asset: productUiZoomAssetSchema.optional(),
  focalPoint: productUiZoomFocalPointSchema.optional(),
  callouts: z.array(z.string().trim().min(1).max(64)).min(1).max(3).optional(),
  fallbackSummary: z.string().trim().min(1).max(220),
});
```

- [ ] **Step 3: Add the section schema to the discriminated union**

Append `productUiZoomSectionSchema` to the
`technicalExplainerSectionSchema` union list.

- [ ] **Step 4: Raise the section bound to 10**

Change:

```ts
sections: z.array(technicalExplainerSectionSchema).min(1).max(9),
```

to:

```ts
sections: z.array(technicalExplainerSectionSchema).min(1).max(10),
```

This lets the deterministic template preview cover the tenth recipe without
dropping any Phase 4.5 recipe coverage.

- [ ] **Step 5: Run the focused smoke**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:technical-explainer-template'
```

Expected: still FAIL, now because definition/runtime/fixtures do not include the new recipe.

## Task 3: Publish Planner Metadata And Compiler Schema

**Files:**
- Modify: `src/templates/technical-explainer/definition.ts`
- Modify: `src/lib/deepseek/prompts.ts`

- [ ] **Step 1: Add planner recipe metadata**

Append to `technicalExplainerPlannerRecipes`:

```ts
{
  recipeId: "product-ui-zoom",
  label: "Product UI zoom",
  bestFor: ["product walkthrough", "UI state focus", "screenshot explanation", "feature demo"],
  avoidCases: ["no UI material available", "raw CLI logs", "architecture-only explanation"],
  requiredInputsSummary:
    "optional controlled public/route screenshot asset, fallback summary, focal point, and up to 3 callouts",
  durationFit: "Works best for a medium beat where viewers can inspect one product surface.",
},
```

- [ ] **Step 2: Add JSON schema case**

Add a `oneOf` case to `technicalExplainerSectionJsonSchema`:

```ts
{
  ...sectionBaseJsonSchema,
  properties: {
    ...sectionBaseJsonSchema.properties,
    recipeId: { type: "string", const: "product-ui-zoom" },
    asset: {
      type: "object",
      additionalProperties: false,
      properties: {
        sourceType: { type: "string", enum: ["public", "route"] },
        src: { type: "string" },
        alt: { type: "string" },
        frameLabel: { type: "string" },
      },
      required: ["sourceType", "alt"],
    },
    focalPoint: {
      type: "object",
      additionalProperties: false,
      properties: {
        xPercent: { type: "number", minimum: 0, maximum: 100 },
        yPercent: { type: "number", minimum: 0, maximum: 100 },
        zoomPercent: { type: "number", minimum: 100, maximum: 180 },
        label: { type: "string" },
      },
      required: ["xPercent", "yPercent", "zoomPercent"],
    },
    callouts: { type: "array", minItems: 1, maxItems: 3, items: { type: "string" } },
    fallbackSummary: { type: "string" },
  },
  required: ["id", "recipeId", "title", "fallbackSummary"],
},
```

- [ ] **Step 3: Mark technical-explainer as controlled-media capable**

Change:

```ts
supportsMedia: false,
```

to:

```ts
supportsMedia: true,
```

Update `planner.mediaExpectations` so it says this template does not need broad
external media, but `product-ui-zoom` may use controlled `public` or `route`
image references and otherwise renders fallback content.

- [ ] **Step 4: Update compiler prompt rules**

In `implementationPrompt`, add `product-ui-zoom` to allowed recipe ids, change
`sections: 1-9 recipe sections` to `sections: 1-10 recipe sections`, and add
rules:

```txt
  - Use product-ui-zoom for product walkthroughs, UI state focus, screenshot explanations, and feature demos.
  - For product-ui-zoom, never invent arbitrary remote URLs.
  - For product-ui-zoom.asset, sourceType must be public or route; omit asset.src when no controlled asset exists.
  - Always include fallbackSummary for product-ui-zoom so missing assets still render useful content.
```

In `revisionPrompt`, add:

```txt
  product-ui-zoom: asset? { sourceType public|route, src?, alt, frameLabel? }, focalPoint? { xPercent 0-100, yPercent 0-100, zoomPercent 100-180, label? }, callouts?[1-3], fallbackSummary
```

- [ ] **Step 5: Narrow the generic compiler media rule**

In `src/lib/deepseek/prompts.ts`, replace:

```txt
- Do not include audio source fields, media fields, narration asset metadata, or provider metadata.
```

with:

```txt
- Do not include audio source fields, project-level media fields, narration asset metadata, or provider metadata.
- Only include template-owned controlled asset descriptors when the selected template schema explicitly allows them.
```

- [ ] **Step 6: Run planner manifest smoke**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:planner-recipe-manifest'
```

Expected: PASS once schema and definition both expose `product-ui-zoom`.

## Task 4: Add The Renderer And Runtime Route

**Files:**
- Modify: `src/templates/technical-explainer/recipe-scenes.tsx`
- Modify: `src/templates/technical-explainer/runtime.tsx`

- [ ] **Step 1: Import Remotion image helpers**

In `recipe-scenes.tsx`, change the Remotion import to include `Img` and
`staticFile`:

```ts
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
```

- [ ] **Step 2: Add asset source resolver**

Add near the local helper functions:

```ts
const resolveProductUiZoomAssetSrc = (
  asset: Extract<TechnicalExplainerSection, { recipeId: "product-ui-zoom" }>["asset"],
): string | null => {
  if (!asset?.src) {
    return null;
  }

  if (asset.sourceType === "public") {
    return staticFile(asset.src.replace(/^\/+/, ""));
  }

  return asset.src;
};
```

- [ ] **Step 3: Add `ProductUiZoomScene`**

Add a scene renderer:

```tsx
export const ProductUiZoomScene: FC<
  TechnicalExplainerSceneProps<Extract<TechnicalExplainerSection, { recipeId: "product-ui-zoom" }>>
> = ({ durationInFrames, section, theme }) => {
  const frame = useCurrentFrame();
  const assetSrc = resolveProductUiZoomAssetSrc(section.asset);
  const timing = getRecipeBeatTiming({ durationInFrames });
  const reveal = interpolate(frame, [0, timing.revealEndFrame], [0, 1], clamp);
  const focus = interpolate(frame, [timing.revealEndFrame, timing.holdEndFrame], [0, 1], clamp);
  const focalPoint = section.focalPoint ?? { xPercent: 50, yPercent: 50, zoomPercent: 126 };
  const zoomScale = interpolate(focus, [0, 1], [1, focalPoint.zoomPercent / 100], clamp);
  const translateX = (50 - focalPoint.xPercent) * 3.2 * focus;
  const translateY = (50 - focalPoint.yPercent) * 1.8 * focus;

  return (
    <div style={panelStyle(theme)}>
      <div style={{ display: "grid", gridTemplateColumns: "430px 1fr", gap: 38, height: "100%" }}>
        <div style={{ paddingTop: 38 }}>
          <div style={{ color: theme.primary, fontSize: 18, fontWeight: 900, marginBottom: 18 }}>
            {section.asset?.frameLabel ?? "Product surface"}
          </div>
          <div style={{ fontSize: 48, fontWeight: 930, lineHeight: 1.04 }}>{section.title}</div>
          {section.subtitle ? (
            <div style={{ color: theme.muted, fontSize: 22, lineHeight: 1.32, marginTop: 20 }}>
              {section.subtitle}
            </div>
          ) : null}
          <div
            style={{
              borderLeft: `4px solid ${theme.secondary}`,
              color: theme.muted,
              fontSize: 19,
              lineHeight: 1.35,
              marginTop: 30,
              paddingLeft: 16,
            }}
          >
            {section.fallbackSummary}
          </div>
          {section.callouts?.length ? (
            <div style={{ display: "grid", gap: 10, marginTop: 28 }}>
              {section.callouts.map((callout) => (
                <div
                  key={callout}
                  style={{
                    background: theme.panel,
                    border: `1px solid ${theme.primary}55`,
                    borderRadius: 999,
                    color: theme.text,
                    fontSize: 17,
                    fontWeight: 850,
                    padding: "10px 14px",
                  }}
                >
                  {callout}
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div
          style={{
            alignSelf: "center",
            background: assetSrc ? "#020617" : theme.panel,
            border: `1px solid ${theme.primary}66`,
            borderRadius: 28,
            boxShadow: "0 30px 90px rgba(0,0,0,0.36)",
            height: 470,
            opacity: reveal,
            overflow: "hidden",
            position: "relative",
            transform: `translateY(${(1 - reveal) * 28}px)`,
          }}
        >
          {assetSrc ? (
            <Img
              alt={section.asset?.alt}
              src={assetSrc}
              style={{
                height: "100%",
                objectFit: "cover",
                transform: `translate(${translateX}px, ${translateY}px) scale(${zoomScale})`,
                transformOrigin: `${focalPoint.xPercent}% ${focalPoint.yPercent}%`,
                width: "100%",
              }}
            />
          ) : (
            <div
              style={{
                alignItems: "center",
                color: theme.text,
                display: "flex",
                fontSize: 28,
                fontWeight: 900,
                height: "100%",
                justifyContent: "center",
                lineHeight: 1.2,
                padding: 48,
                textAlign: "center",
              }}
            >
              {section.fallbackSummary}
            </div>
          )}
          {section.focalPoint?.label ? (
            <div
              style={{
                background: theme.secondary,
                borderRadius: 999,
                bottom: 24,
                color: "#111827",
                fontSize: 16,
                fontWeight: 900,
                left: 24,
                padding: "10px 14px",
                position: "absolute",
              }}
            >
              {section.focalPoint.label}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
```

When applying the renderer, satisfy TypeScript and Remotion lint while keeping
the behavior fixed: frame-driven reveal/zoom, `<Img>` when asset is present,
fallback panel when absent.

- [ ] **Step 4: Route the new scene in runtime**

In `runtime.tsx`, import `ProductUiZoomScene`, add a switch case:

```tsx
case "product-ui-zoom":
  return (
    <ProductUiZoomScene
      durationInFrames={durationInFrames}
      section={section}
      theme={spec.theme}
    />
  );
```

Keep product UI zoom on the calmer stage motion. Because `getMotionForSection()`
currently returns `"stage-push"` for every recipe that is not terminal, metric,
or code diff, do not add `product-ui-zoom` to the fly-through condition:

```ts
return "stage-push";
```

- [ ] **Step 5: Run technical smoke**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:technical-explainer-template'
```

Expected: still FAIL until fixtures are updated.

## Task 5: Add Deterministic Fixture Asset And Sections

**Files:**
- Add: `public/fixtures/phase5-ui-screenshot.svg`
- Modify: `src/lib/staged-smoke-fixtures.ts`

- [ ] **Step 1: Add a deterministic public fixture asset**

Create `public/fixtures/phase5-ui-screenshot.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <rect width="1280" height="720" fill="#0f172a"/>
  <rect x="72" y="72" width="1136" height="576" rx="28" fill="#f8fafc"/>
  <rect x="72" y="72" width="1136" height="70" rx="28" fill="#111827"/>
  <circle cx="116" cy="107" r="10" fill="#fb7185"/>
  <circle cx="148" cy="107" r="10" fill="#f59e0b"/>
  <circle cx="180" cy="107" r="10" fill="#22c55e"/>
  <rect x="118" y="190" width="260" height="368" rx="18" fill="#e2e8f0"/>
  <rect x="420" y="190" width="716" height="90" rx="18" fill="#dbeafe"/>
  <rect x="420" y="310" width="330" height="248" rx="18" fill="#cffafe"/>
  <rect x="790" y="310" width="346" height="248" rx="18" fill="#fef3c7"/>
  <rect x="462" y="226" width="220" height="18" rx="9" fill="#2563eb"/>
  <rect x="462" y="348" width="210" height="20" rx="10" fill="#0891b2"/>
  <rect x="462" y="392" width="238" height="16" rx="8" fill="#0f766e"/>
  <rect x="832" y="348" width="220" height="20" rx="10" fill="#d97706"/>
  <rect x="832" y="392" width="250" height="16" rx="8" fill="#92400e"/>
  <text x="118" y="614" fill="#64748b" font-family="Arial, sans-serif" font-size="26" font-weight="700">
    Phase 5 controlled UI fixture
  </text>
</svg>
```

- [ ] **Step 2: Add asset-present section to `technicalExplainerImplementation.sections`**

Insert a `product-ui-zoom` section immediately after the existing
`before-after-compare` section. This placement makes frame 585 land inside the
asset-aware recipe still render.

```ts
{
  id: "ui-zoom",
  recipeId: "product-ui-zoom",
  title: "Zoom into the product surface",
  subtitle: "Phase 5 proves controlled image material inside one recipe.",
  asset: {
    sourceType: "public",
    src: "fixtures/phase5-ui-screenshot.svg",
    alt: "A deterministic product UI screenshot fixture for Phase 5.",
    frameLabel: "Controlled screenshot",
  },
  focalPoint: {
    xPercent: 72,
    yPercent: 48,
    zoomPercent: 138,
    label: "Inspect the active panel",
  },
  callouts: ["Controlled asset", "Template-owned", "Preview/export"],
  fallbackSummary: "A product UI screenshot would be highlighted here.",
  durationInFrames: 75,
}
```

- [ ] **Step 3: Add missing-asset fallback section**

Add a second `product-ui-zoom` section to the second staged fixture segment's
implementation, not to the single-segment `technicalExplainerSmokeProject`.
This keeps the preview fixture at 10 sections while still proving fallback data
through deterministic staged fixture parsing.

```ts
{
  id: "ui-zoom-fallback",
  recipeId: "product-ui-zoom",
  title: "Fallback stays useful",
  subtitle: "The recipe remains renderable when no screenshot is provided.",
  focalPoint: {
    xPercent: 50,
    yPercent: 50,
    zoomPercent: 120,
    label: "Fallback mode",
  },
  callouts: ["No broken frame", "Clear summary", "Same schema"],
  fallbackSummary: "No screenshot was attached, so the recipe renders a structured fallback frame.",
  durationInFrames: 75,
}
```

Replace the current filtered section construction for the second
`technicalExplainerCompiledSegments` entry with an explicit section list that
includes `metric-countup`, `timeline-progress`, `before-after-compare`,
`decision-matrix`, and `ui-zoom-fallback`.

- [ ] **Step 4: Add storyboard recipe hints**

Add `product-ui-zoom` hints to `technicalExplainerStoryboardPlan` where the
visual brief mentions product UI or controlled screenshot material:

```ts
{
  recipeId: "product-ui-zoom",
  reason: "The segment needs to focus attention on a controlled product UI screenshot.",
}
```

- [ ] **Step 5: Run fixture smoke**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:technical-explainer-template'
```

Expected: PASS after schema, definition, runtime, scene, and fixture coverage are complete.

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'
```

Expected: PASS; Remotion can bundle/list compositions with the new SVG asset reference.

## Task 6: Rewrite Route Assets For Export

**Files:**
- Modify: `src/lib/render-project.ts`

- [ ] **Step 1: Add type-safe product-ui-zoom rewrite helpers**

Add this import:

```ts
import { TECHNICAL_EXPLAINER_TEMPLATE_ID } from "../templates/ids";
```

Add local helper types and functions near `resolveRouteMediaForRender`:

```ts
type ProductUiZoomSectionLike = {
  recipeId: "product-ui-zoom";
  asset?: {
    sourceType?: string;
    src?: string;
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const rewriteProductUiZoomSectionAsset = (
  section: unknown,
  assetOrigin: string,
): unknown => {
  if (!isRecord(section) || section.recipeId !== "product-ui-zoom") {
    return section;
  }

  const typedSection = section as ProductUiZoomSectionLike;
  const asset = typedSection.asset;
  if (asset?.sourceType !== "route" || !asset.src?.startsWith("/")) {
    return section;
  }

  return {
    ...section,
    asset: {
      ...asset,
      src: `${assetOrigin}${asset.src}`,
    },
  };
};
```

- [ ] **Step 2: Rewrite technical-explainer implementation sections**

Inside `resolveRouteMediaForRender`, detect route `product-ui-zoom` assets in
segments. Include them in the early `hasRoute...` check.

Then in the `segments.map()` branch, after narration handling, add logic that:

- checks `segment.templateId === TECHNICAL_EXPLAINER_TEMPLATE_ID`
- checks `segment.implementation.sections` is an array
- maps sections through `rewriteProductUiZoomSectionAsset(section, assetOrigin)`
- returns the updated segment

Keep the helper scoped to render export. Do not add a global asset model.

- [ ] **Step 3: Preserve normalization**

Return through `normalizeProject(...)`, as the existing helper does today, so
the rewritten project still validates before export.

- [ ] **Step 4: Run typecheck**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
```

Expected: PASS.

## Task 7: Update Storyboard Recipe Hint Smoke

**Files:**
- Modify: `scripts/storyboard-recipe-hints-smoke.mjs`

- [ ] **Step 1: Add `product-ui-zoom` to the valid hints fixture**

In `basePlan.segments[0].recipeHints`, add:

```js
{
  recipeId: "product-ui-zoom",
  reason: "The segment can focus attention on a controlled product UI surface.",
},
```

Update the length assertion:

```js
if (validPlan.segments[0].recipeHints?.length !== 3) {
  throw new Error("Expected valid recipe hints to survive storyboard parsing.");
}
```

- [ ] **Step 2: Run the smoke**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:storyboard-recipe-hints'
```

Expected: PASS.

## Task 8: Render Visual Still

**Files:**
- Exercise: `src/remotion/index.ts`
- Exercise: `src/remotion/Root.tsx`
- Exercise: `src/templates/technical-explainer/*`

- [ ] **Step 1: Render product-ui-zoom still**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx remotion still src/remotion/index.ts TechnicalExplainerTemplatePreview /workspace/out/technical-explainer-preview-ui-zoom-slow.png --frame=375 --scale=0.5'
```

Expected: PASS and writes
`/workspace/out/technical-explainer-preview-ui-zoom-slow.png`.

Frame 585 is part of the plan contract because Task 5 inserts the asset-present
section immediately after `before-after-compare`.

## Task 9: Update Active Documentation

**Files:**
- Modify: `docs/ITERATION_STATUS.md`
- Modify: `docs/VISUAL_RECIPE_ROADMAP.md`
- Modify: `README.md`

- [ ] **Step 1: Update iteration status**

Add a new top section:

```markdown
Last updated: Asset-Aware Recipes Phase 5 v1

## Latest continuation — Asset-Aware Recipes Phase 5 v1

- Added `product-ui-zoom` as the first asset-aware `technical-explainer` recipe.
- Kept Phase 5 bounded to one template-owned recipe: no media library, no arbitrary remote URLs, no persistence, no generated TSX, no visual-review scoring, and no multi-template-per-segment orchestration.
- The recipe accepts controlled `public` or `route` image descriptors and renders a useful fallback frame when no asset source is available.
- Local export rewrites route image sources for `product-ui-zoom` through the existing render asset origin path.

Validation performed:
- `docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:planner-recipe-manifest'`
- `docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:technical-explainer-template'`
- `docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:storyboard-recipe-hints'`
- `docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'`
- `docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'`
- `docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'`
- Remotion still renders:
  - `/workspace/out/technical-explainer-preview-ui-zoom-slow.png`
```

- [ ] **Step 2: Update visual recipe roadmap**

Change Phase 5 from unstarted to implemented for v1, and keep later media work
deferred:

```markdown
### Phase 5: Asset-Aware Recipes

Status: implemented for v1 when this plan lands.

Goal: introduce concrete media only after recipe quality is strong.

Phase 5 v1 is bounded to `technical-explainer/product-ui-zoom`: controlled
`public` or `route` screenshot/image descriptors, route-source export rewrite,
and deterministic missing-asset fallback rendering.

Still deferred:
- broad media library UI
- arbitrary remote asset URLs
- upload/storage APIs
- project-level image/video media layers
- visual-review scoring or screenshot repair
```

- [ ] **Step 3: Update README**

In the current visual-quality direction section, update the Phase 5 bullet to
say that v1 adds controlled `product-ui-zoom` image asset descriptors and
fallback rendering while broader media-layer work remains deferred.

## Task 10: Full Verification

**Files:**
- Exercise whole deterministic Phase 5 path.

- [ ] **Step 1: Run deterministic smokes**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:planner-recipe-manifest'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:technical-explainer-template'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:storyboard-recipe-hints'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'
```

Expected: all PASS.

- [ ] **Step 2: Run static verification**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
git diff --check
```

Expected: all PASS.

- [ ] **Step 3: Confirm scope by diff**

Run:

```bash
git diff --stat
```

Expected: changes are limited to the `technical-explainer` recipe boundary,
render export route-asset rewrite, deterministic fixture asset/smokes, and
active docs.

## Task 11: Commit

**Files:**
- Stage all Phase 5 implementation and docs files.

- [ ] **Step 1: Inspect status**

Run:

```bash
git status --short
```

Expected: no unrelated local edits.

- [ ] **Step 2: Stage files**

Run:

```bash
git add \
  docs/ITERATION_STATUS.md \
  docs/VISUAL_RECIPE_ROADMAP.md \
  README.md \
  public/fixtures/phase5-ui-screenshot.svg \
  scripts/planner-recipe-manifest-smoke.mjs \
  scripts/storyboard-recipe-hints-smoke.mjs \
  scripts/technical-explainer-template-smoke.mjs \
  src/lib/render-project.ts \
  src/lib/staged-smoke-fixtures.ts \
  src/lib/deepseek/prompts.ts \
  src/templates/technical-explainer/definition.ts \
  src/templates/technical-explainer/recipe-scenes.tsx \
  src/templates/technical-explainer/runtime.tsx \
  src/templates/technical-explainer/schema.ts
```

- [ ] **Step 3: Commit**

Run:

```bash
git commit -m "feat: add asset-aware product ui recipe"
```

Expected: commit succeeds.

## Acceptance

This plan is complete when:

- `technical-explainer` publishes 10 planner-facing recipes including `product-ui-zoom`.
- `product-ui-zoom` accepts only controlled `public` or `route` image descriptors.
- Missing asset data renders a useful fallback frame.
- Preview and export both use the same `VideoProject` / `ProjectVideo` boundary.
- Route image asset sources are rewritten for local export.
- deterministic smokes, typecheck, lint, and targeted still renders pass.
- active docs describe Phase 5 v1 and clearly defer broader media work.
