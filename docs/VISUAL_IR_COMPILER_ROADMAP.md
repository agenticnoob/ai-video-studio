# Visual IR Compiler Roadmap

Status: authoritative product roadmap and final direction.

Use this as the primary roadmap for `ai-video-studio`. It explains the
complete target, not only the next bounded implementation step. Supporting
documents such as `docs/FINAL_PRODUCT_GOAL.md`, `docs/PRODUCT_ARCHITECTURE.md`,
`docs/TEMPLATE_ARCHITECTURE.md`, and provider notes should align with this
roadmap.

## 1. Core Thesis

Templates provide stability, but templates alone cannot cover open-ended user
expression.

The product should not become an endless template picker. It should become an
AI video compiler:

```txt
User Prompt
  -> Creative Treatment
  -> Shot Plan
  -> Render Strategy Decision
  -> Visual IR / Template Macro / Procedural Generator / Media Composite
  -> Remotion Compiler
  -> Review / Repair
  -> VideoProject
  -> Preview / Export
```

Modeling rule:

```txt
templates = macro / preset paths
Visual IR + primitives = general expression path
procedural generators = specialized deterministic visuals
media asset composite = realism and concrete visual evidence
generated component = future restricted escape hatch only
review / repair = quality closure
```

Remotion remains the deterministic rendering backend. The app should compile
bounded data into Remotion components; it should not let LLMs write
unrestricted Remotion source as the normal path.

External Remotion projects and skills can inform workflow, primitives, and
procedural-generator candidates. Capture those lessons through
`docs/REMOTION_GENERATION_PATTERNS.md`; do not import standalone Remotion
scaffolds or provider-facing codegen paths directly into the product model.

## 2. Stable Boundaries

Keep these boundaries throughout all phases:

- `VideoProject` remains the preview/edit/export payload.
- `VideoSegment` remains the user-facing editable shot unit.
- `VideoSegment.templateId` remains the discriminator for the current product
  model.
- segment-owned narration audio and captions stay outside visual
  `implementation`.
- real narration duration drives visual timing.
- generic `ProjectVideo` composition remains registered for export.
- `SceneGraphTemplatePreview` remains the deterministic visual-quality fixture
  entrypoint.
- server-safe registries must not import React/Remotion runtime modules.

## 3. Render Strategy Vocabulary

Every shot should eventually choose one strategy:

```ts
type RenderStrategy =
  | "template_macro"
  | "primitive_scene_graph"
  | "procedural_generator"
  | "media_asset_composite"
  | "generated_component";
```

Strategy roles:

- `template_macro`: current registered templates such as `scripted`,
  `spotlight`, and `stats-dashboard`; stable, lower-flexibility paths for
  common structures.
- `primitive_scene_graph`: the `scene-graph` Visual IR path using validated
  primitives, layout presets, and motion grammar.
- `procedural_generator`: bounded modules for visuals such as node graphs,
  line paths, code diffs, terminal flows, timelines, data flows, particles, or
  other deterministic graphics.
- `media_asset_composite`: asset-backed compositions using screenshots,
  images, video clips, generated media, icons, or concrete product visuals.
- `generated_component`: future restricted escape hatch for long-tail visuals
  only after schema, primitive, procedural, and media paths are insufficient.

Recommended long-term balance:

```txt
40% template_macro
30% primitive_scene_graph
15% procedural_generator
10% media_asset_composite
5% generated_component escape hatch
```

These are directional proportions, not hard routing rules.

## 4. Phase Roadmap

### Phase 0: Scene Graph MVP

Status: implemented.

Delivered:

- `ShotLanguagePlan` and `SceneGraph` contracts.
- registered `scene-graph` template.
- `UniversalSceneRenderer` MVP.
- deterministic three-segment fixture.
- preview/export compatibility through `VideoProject` and `ProjectVideo`.

Purpose:

- prove validated data can drive Remotion without generated TSX.

Limitation:

- visual output can still feel like card/PPT layouts.

### Phase 1: Scene Graph Visual IR v1

Status: implemented as the first deterministic visual-quality slice.

Delivered direction:

- `scene-graph` starts acting like a bounded Visual IR compiler path.
- deterministic fixture uses less card-like visuals.
- technical-video primitives such as node graph, line path, code/terminal,
  browser-window, cursor, and lockup treatments are available inside the
  `scene-graph` runtime.

Purpose:

- prove the renderer can produce visibly less PPT-like frames before asking an
  LLM to generate Visual IR.

### Phase 2: Visual IR Generation v1

Status: implemented for the bounded `primitive_scene_graph` path.

Add provider-backed generation only for the bounded
`primitive_scene_graph` path.

Pipeline:

```txt
StoryboardPlan
  + ShotLanguagePlan
  + segment visualBrief
  + narration duration
  + allowed primitive/layout/motion vocabulary
  -> SceneGraph / Visual IR
  -> validation
  -> one bounded repair attempt
  -> fallback to template_macro or existing segment on repeated failure
```

Requirements:

- no generated TSX
- no package installation
- no dynamic imports
- no filesystem/network/env access in generated content
- schema errors readable enough for bounded repair
- diagnostics expose validation, repair, and fallback
- selected-segment regeneration can replace only the target segment's
  `SceneGraph`

Acceptance:

- generated `scene-graph` segments pass schema validation
- generated output renders through `ProjectVideo`
- deterministic fixture remains available
- existing templates still work as fallback/macro paths

Current landing:

- the selected-template compiler prompt now gives `scene-graph` a constrained
  Visual IR vocabulary for provider-backed `primitive_scene_graph` generation
- compiler diagnostics expose render strategy, repair attempts, and fallback
  metadata
- selected-segment regeneration can preserve the existing `scene-graph`
  segment if Visual IR compilation fails after bounded repair
- full-project generation falls back from repeated `scene-graph` compiler
  failure to a deterministic `template_macro` segment instead of returning a
  broken Visual IR payload
- deterministic fixture assertions cover `primitive_scene_graph` diagnostics
  and fallback shape
- `scripts/staged-live-smoke.mjs` includes a forced `mode: "plan"`
  provider-backed `scene-graph` request that verifies generated Visual IR
  remains `primitive_scene_graph` and does not fallback

### Phase 3: Render Strategy Decision v1

Status: implemented as a bounded planner decision layer for currently
executable strategies.

Add a planner/compiler decision layer:

```ts
type StrategyDecision = {
  strategy: RenderStrategy;
  confidence: number;
  reason: string;
  fallbackStrategy: RenderStrategy;
};
```

Initial routing rules:

- common marketing/info structures -> `template_macro`
- abstract concept explainers -> `primitive_scene_graph`
- workflows, systems, agents, code, terminal, data flow ->
  `procedural_generator` or `primitive_scene_graph`
- concrete products, people, places, screenshots, images, or videos ->
  `media_asset_composite`
- only after other paths are insufficient -> future `generated_component`

Acceptance:

- strategy decision is validated data
- fallback strategy is explicit
- diagnostics explain why a strategy was selected
- no unsupported strategy silently falls through

Current landing:

- `StoryboardSegmentPlan.strategyDecision` records validated `strategy`,
  `confidence`, `reason`, and `fallbackStrategy` data for every planned
  segment.
- The current executable strategy schema is intentionally limited to
  `template_macro` and `primitive_scene_graph`.
- `scene-graph` must choose `primitive_scene_graph` with an explicit
  `template_macro` fallback; registered macro templates must choose
  `template_macro`.
- staged compiler diagnostics expose both the planner `strategyDecision` and
  the actual post-fallback `renderStrategy`.
- future strategies such as `procedural_generator`,
  `media_asset_composite`, and `generated_component` remain roadmap vocabulary
  until their compiler paths are implemented.

### Phase 4: Procedural Generator v1

Status: started with schema groundwork, deterministic compile-to-SceneGraph
support, staged diagnostics wiring, guarded staged execution, and
provider-facing planner/tool schema support for `node-graph-flow`,
`line-path-flow`, and `terminal-session`.

Add deterministic modules for recurring complex visuals that are too specific
for generic layers but too useful to be full templates.

Candidate generators:

- `node-graph-flow`
- `line-path-flow`
- `code-diff`
- `terminal-session`
- `timeline-sequence`
- `data-flow-map`
- `status-loop`
- `step-by-step-explainer`
- `calculation-flow`
- `semantic-highlight`
- `concept-build-up`

Current groundwork:

- `src/lib/procedural-generator-schema.ts` defines bounded
  `node-graph-flow`, `line-path-flow`, and `terminal-session` generator
  contracts.
- The contracts carry `renderStrategy: "procedural_generator"`, generator id,
  duration, caption-safe intent, generator-specific payload data, beats, and
  explicit fallback strategy.
- deterministic smoke fixtures validate the schemas, diagnostics helper, and
  compile-to-SceneGraph paths.
- `node-graph-flow` can now compile into bounded `primitive_scene_graph`
  `SceneGraph` data that reuses the existing scene-graph renderer.
- `line-path-flow` can now compile into bounded `primitive_scene_graph`
  `SceneGraph` data using the existing `line-path` primitive.
- `terminal-session` can now compile into bounded `primitive_scene_graph`
  `SceneGraph` data using the existing `terminal-panel` primitive.
- staged diagnostics can represent planned `procedural_generator` output, the
  actual compiled `primitive_scene_graph` path, and a bounded `template_macro`
  fallback for generator compilation failure.
- The provider-facing storyboard planner/tool schema can now emit
  `procedural_generator` only for `scene-graph` segments with bounded
  `node-graph-flow`, `line-path-flow`, or `terminal-session` payloads.
- Execution remains deterministic: generated payloads compile through the
  existing procedural compiler into actual `primitive_scene_graph` output, with
  `template_macro` fallback on compile failure.
- Procedural generator payload duration is aligned to real narration duration
  at the compiler boundary, so segment timing cannot cut off generated audio
  before the next storyboard segment starts.
- Provider-backed planning is not open-ended; no other generator ids,
  `media_asset_composite`, `generated_component`, generated TSX, or arbitrary
  code execution are accepted.
- provider-backed live smoke now includes a normal brief that naturally
  selects `node-graph-flow`, plus forced plan-mode smokes for
  `node-graph-flow`, `line-path-flow`, and `terminal-session`; all compile
  into actual `primitive_scene_graph` and fail if the generator silently falls
  back.

Next hardening:

- harden bounded repair/fallback around invalid provider generator payloads
  only when live output exposes repeated, well-scoped near-misses
- harden bounded repair/fallback around specific generator families only if
  live output exposes repeated, well-scoped near-misses

These modules should output bounded Visual IR or render through controlled
runtime components, not arbitrary code.

Acceptance:

- each generator has a small schema
- each generator has deterministic fixture coverage
- output still compiles through the same preview/export path
- generator failures fallback to `primitive_scene_graph`

### Phase 5: Asset Plan / Media Composite v1

Status: started as a non-executable asset-plan boundary.

Introduce concrete visual assets as first-class planned inputs, not as random
URLs inside template params.

Target shape:

```ts
type AssetPlan = {
  requiredAssets: Array<{
    id: string;
    kind:
      | "product_screenshot"
      | "screen_recording"
      | "generated_image"
      | "generated_video"
      | "icon"
      | "illustration"
      | "stock_clip"
      | "code_snippet"
      | "terminal_output"
      | "chart_data";
    purpose: string;
    fallback: string;
  }>;
};
```

Acceptance:

- assets are referenced by id/ref, not invented remote URLs
- preview/export can resolve the same asset references
- missing assets have clear fallback behavior
- no broad media library UI is required for the first version

Current landing:

- `StoryboardPlan` can carry a top-level `assetPlan.requiredAssets[]` with
  stable asset ids, bounded asset kinds, purpose, and fallback copy.
- The provider-facing storyboard planner/tool schema can request assets by id
  and kind, but does not expose URL, `src`, file path, or arbitrary remote
  media fields.
- staged diagnostics expose planned asset requirements so future asset
  resolution/composite work can be inspected without changing preview/export.
- `media_asset_composite` remains non-executable; current rendering still uses
  `template_macro`, `primitive_scene_graph`, and bounded
  `procedural_generator` paths.

### Phase 6: Review / Repair Loop v1

Status: started as static preflight diagnostics, representative frame planning,
and explicit still-image extraction.

Add quality closure after rendering or still extraction.

Checks:

- blank frames
- text overflow
- subtitle/caption collision
- unsafe margins
- low contrast
- layer overlap
- unreadable line length
- broken asset references
- duration/timing mismatch

Output:

```ts
type VisualReviewFinding = {
  severity: "info" | "warning" | "error";
  frame?: number;
  targetId?: string;
  message: string;
  suggestedRepair?: string;
};
```

Acceptance:

- representative stills are generated for review
- findings can trigger bounded repair for the target segment only
- repeated failure returns a clear diagnostic instead of silent bad output

Current landing:

- `src/lib/visual-review-schema.ts` defines strict
  `VisualReviewFinding`, `VisualReviewFrame`, and `VisualReviewDiagnostics`
  contracts.
- staged diagnostics now include `visualReview.status: "static_preflight"`
  for full staged generation and selected-segment regeneration.
- the static preflight flags deterministic issues available before still
  extraction: narration audio longer than visual segment duration, caption cues
  that extend past the segment, long caption text, and unresolved planned
  assets from the non-executable `assetPlan` phase.
- staged diagnostics now also include `visualReview.reviewFrames[]`, a
  deterministic list of absolute project frames to inspect for each segment's
  start, midpoint, and end. This is the stable input boundary for later still
  extraction.
- `POST /api/visual-review/stills` can explicitly render those representative
  frames through Remotion `renderStill` against the generic `ProjectVideo`
  composition and returns strict PNG still artifact metadata. This is not run
  during normal staged generation.
- no browser/canvas review, automatic repair, or provider prompt repair loop
  is active yet.

### Phase 7: Generated Component Escape Hatch

Future-only, last resort.

Allow restricted component generation only when:

- template matching is low confidence
- Visual IR primitives are insufficient
- procedural generators cannot express the shot
- media composite is not the right answer

Hard constraints:

- allowed imports only from approved local primitives
- no package installation
- no filesystem, network, env, or runtime API access
- no dynamic imports or eval-like behavior
- must pass formatting, lint, TypeScript, Remotion still review
- must include fallback Visual IR
- failure falls back to `primitive_scene_graph`

This path should remain rare. It is not the default architecture.

### Phase 8: Micro-template Memory

Future optimization after escape hatch exists.

When a generated or procedural shot repeatedly proves useful, promote it into
a reusable micro-template record:

```json
{
  "id": "code_review_loop_001",
  "description": "Code review loop with diff, comment, fix, and test pass.",
  "bestFor": ["AI coding agent", "code review", "test repair workflow"],
  "inputs": ["diffTitle", "comments", "testStatus"],
  "source": "generated_component",
  "qualityScore": 0.84,
  "reuseCount": 12
}
```

Do not implement persistence for this until the quality/review loop proves it
is worth keeping.

## 5. Current Bounded Goal

```txt
Implement Review / Repair Loop v1 incrementally:
keep deterministic `VisualReviewFinding` diagnostics, representative
review-frame planning, and explicit still image extraction stable, then add
bounded browser/canvas review and target-segment repair in later slices. The
next slices should preserve VideoProject preview/export compatibility, avoid
browser automation as the default validation path, and keep repair behavior
explicit rather than silently rewriting segments.
```

Do not widen Phase 6 into a full visual QA system. First keep proving that
review findings, frame planning, and still artifacts can be represented,
surfaced through diagnostics, and kept separate from provider generation and
silent repair behavior.

## 6. Non-goals Until Explicitly Reopened

- unrestricted generated TSX as default path
- package installation during generation
- full media library
- drag/drop visual timeline editor
- database-backed project history
- auth/multi-tenant permissions
- multi-template-per-segment orchestration
- converting all existing templates into Visual IR macros in one pass
