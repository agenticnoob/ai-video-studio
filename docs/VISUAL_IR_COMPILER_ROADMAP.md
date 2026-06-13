# Visual IR Compiler Roadmap

Status: full roadmap derived from the expert architecture direction. Use this
as the high-level plan after the deterministic Scene Graph Visual IR v1 slice.

This roadmap explains the complete target, not only the next bounded
implementation step.

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

Next recommended goal.

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

### Phase 3: Render Strategy Decision v1

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

### Phase 4: Procedural Generator v1

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

These modules should output bounded Visual IR or render through controlled
runtime components, not arbitrary code.

Acceptance:

- each generator has a small schema
- each generator has deterministic fixture coverage
- output still compiles through the same preview/export path
- generator failures fallback to `primitive_scene_graph`

### Phase 5: Asset Plan / Media Composite v1

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

### Phase 6: Review / Repair Loop v1

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

## 5. Next Goal To Define

After Scene Graph Visual IR v1, the next bounded goal should be:

```txt
Implement Visual IR Generation v1 for the existing scene-graph path:
use ShotLanguagePlan, segment visualBrief, real narration duration, and the
bounded primitive/layout/motion vocabulary to generate schema-valid
primitive_scene_graph SceneGraph data with one repair attempt, explicit
diagnostics, and fallback to template_macro, while preserving VideoProject
preview/export compatibility and avoiding generated TSX, media library work,
timeline editing, persistence, and unrestricted code execution.
```

Do not start with render strategy routing across every strategy. First prove
provider-generated `primitive_scene_graph` output is reliable.

## 6. Non-goals Until Explicitly Reopened

- unrestricted generated TSX as default path
- package installation during generation
- full media library
- drag/drop visual timeline editor
- database-backed project history
- auth/multi-tenant permissions
- multi-template-per-segment orchestration
- converting all existing templates into Visual IR macros in one pass

