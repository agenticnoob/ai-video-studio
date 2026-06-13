# Goal: Scene Graph MVP

Status: bounded first landing implemented; provider-backed generation remains
deferred.

This document is the concrete execution target for turning
`docs/SCENE_GRAPH_VIDEO_LANGUAGE_PLAN.md` into a working first slice. Use it as
the Goal-mode objective when implementing the scene graph direction.

## 1. Goal Statement

Implement a first working `scene-graph` visual path that proves stronger shot
language while preserving the current product loop:

```txt
VideoProject
  -> ProjectVideo preview
  -> selected segment editing / regeneration compatibility
  -> POST /api/render export
```

The first slice should not replace the entire generation pipeline. It should
add one new registered template path:

```txt
templateId: "scene-graph"
implementation: SceneGraph
```

The first milestone is successful when a deterministic fixture can render a
short multi-segment project using `scene-graph` segments with visibly distinct
shot types and coherent visual language.

## 2. Closure Contract

The MVP must close the loop through existing project boundaries.

Required closure:

- `SceneGraph` is validated data, not generated TSX.
- `SceneGraph` lives in `VideoSegment.implementation` behind a registered
  `scene-graph` template.
- `ShotLanguagePlan` is stored at project level, preferably under project
  metadata or an equivalent project-level extension field.
- `ProjectVideo` can render `scene-graph` segments through the existing runtime
  template registry.
- local export through `POST /api/render` uses the same `VideoProject` payload
  as preview.
- segment-owned narration audio and captions remain outside
  `implementation`.
- caption rendering remains shared and segment-owned; scene graph data may
  reserve caption-safe zones but must not own caption cues.
- selected-segment visual regeneration can later replace only the target
  segment's `SceneGraph` while preserving non-target segments.

If any of these cannot be satisfied in the first implementation, stop and
document the exact blocker before widening scope.

## 3. Project-level Visual Language Placement

`ShotLanguagePlan` is needed for full-video continuity, but its first landing
must be conservative.

Preferred order:

1. If `VideoProject` already has a suitable metadata/diagnostics/extension
   field, store `ShotLanguagePlan` there.
2. If no suitable field exists, add the smallest optional project-level field
   needed to carry visual language data.
3. If adding that field causes broad schema, editor, renderer, or generation
   churn, stop and document the blocker before continuing.

Do not scatter visual language data into every segment as duplicated source of
truth. Individual `SceneGraph` values may copy resolved style values for render
safety, but the project-level `ShotLanguagePlan` should remain the intended
continuity anchor.

## 4. Non-goals

Do not include these in the MVP:

- unrestricted LLM-generated Remotion TSX
- package installation during generation
- full AI provider integration before deterministic fixtures pass
- full visual timeline editor
- drag/drop layer editing
- persistence, project history, database schema changes, or auth changes
- generic media library
- multi-template-per-segment orchestration
- replacing `scripted`, `spotlight`, or `stats-dashboard`
- changing the narration/TTS/caption ownership model

## 5. Implementation Phases

### Phase 1: Contracts

Add a scene graph schema in `src/lib/scene-graph-schema.ts`.

Minimum contracts:

- `ShotLanguagePlan`
- `SceneGraph`
- `SceneLayer`
- `SceneBeat`
- `SceneTransition`

Keep the first schema intentionally small.

Allowed first layer types:

- `background`
- `kinetic-title`
- `callout`
- `metric-highlight`
- `process-step`
- `caption`

Optional only if cheap and well-bounded:

- `media-frame` with a placeholder-safe `assetRef`

Contract requirements:

- every layer has a stable `id`
- beats reference layer ids
- frame values are segment-local
- layer text fields have length limits
- layer counts are capped
- duration comes from segment duration / narration duration, not arbitrary LLM
  timing
- schema errors are readable enough for future bounded repair prompts

### Phase 2: Registered Template Skeleton

Add a normal template module:

```txt
src/templates/scene-graph/
  schema.ts
  definition.ts
  runtime.tsx
  editor.tsx
  index.ts
```

Register it through the existing template architecture:

- `src/templates/ids.ts`
- `src/templates/registered-definitions.ts`
- `src/templates/registered-bundles.ts`
- any derived registry/type coverage required by the current code

The template definition must describe it as a flexible shot-language renderer,
not as a generic arbitrary-code template.

### Phase 3: UniversalSceneRenderer MVP

Implement the first `UniversalSceneRenderer` inside the `scene-graph` template
runtime or a nearby internal component folder.

Renderer requirements:

- use only frame-driven Remotion animation
- use `useCurrentFrame()`, `interpolate()`, `spring()`, `<Sequence>`,
  `<Series>`, or Remotion transition primitives
- do not use CSS animations, CSS transitions, or Tailwind animation utilities
  for render-critical motion
- provide stable full-frame layout
- keep text inside bounded regions
- reserve caption-safe space when captions are present
- keep visual style coherent across all layers in one scene
- handle missing/invalid optional layer data gracefully after schema validation

First visual target:

- better than static cards
- visible depth through background/layer motion
- distinct opener/process/closing rhythm
- no overlapping text
- no blank frame at representative timestamps

### Phase 4: Deterministic Fixture And Smoke

Add a deterministic fixture before adding any LLM generation.

The fixture should include three scene-graph segments:

1. opener
2. process/explain
3. closing

Each segment should include segment-owned narration/captions if a local fixture
pattern already exists, or omit audio only if that matches existing template
preview practice.

Validation should include:

- TypeScript
- lint
- build if changes touch runtime paths broadly
- deterministic staged/template smoke if applicable
- at least one Remotion still render for the scene graph fixture

Recommended still frames:

- opener mid reveal
- process mid step
- closing final lockup

### Phase 5: Editor MVP

Add only compact parameter editing:

- scene type
- camera movement/intensity
- transition in/out
- layer text
- layer order if cheap
- style preset/accent if present in schema

Do not build a timeline editor.

### Phase 6: Generation Integration

Only after the deterministic fixture is visually acceptable:

- add scene graph compiler facade
- pass `ShotLanguagePlan`, segment context, narration duration, and allowed
  layer/transition schema to the LLM
- validate scene graph output
- run one bounded repair attempt
- fall back to existing registered templates on repeated failure
- expose diagnostics for scene graph validation, repair, and fallback

## 6. Acceptance Criteria

The MVP is accepted when:

- `scene-graph` is registered like other templates
- a deterministic `VideoProject` fixture renders through `ProjectVideo`
- `scene-graph` preview and export use the same project payload
- representative still renders are nonblank and visually coherent
- captions remain outside scene graph implementation
- TypeScript and lint pass
- docs explain how to continue into LLM generation
- no unrestricted generated TSX path is introduced

## 7. Risk Register

### Risk: The schema becomes a second rigid template

Mitigation:

- use layer and beat composition, not one fixed layout
- keep scene type, camera, transitions, and layer order configurable
- support at least opener, process, and closing fixture shapes

### Risk: The schema becomes too broad for reliable LLM output

Mitigation:

- cap layer types and layer count
- use discriminated unions
- keep first prompts examples-based
- validate and repair only the current segment graph

### Risk: UniversalSceneRenderer still looks like cards

Mitigation:

- build visual quality into renderer primitives first
- use motion, depth, and typography rhythm as renderer concerns
- prove quality with deterministic stills before LLM integration

### Risk: Segment graphs are not coherent across the full video

Mitigation:

- make `ShotLanguagePlan` project-level
- pass the same visual language into every scene graph generation call
- reuse recurring motifs and style presets

### Risk: Editing scope explodes

Mitigation:

- first editor is a structured form only
- no timeline, drag/drop, keyframe editor, or media library in the MVP

### Risk: Export diverges from preview

Mitigation:

- keep `VideoProject` as the only runtime payload
- use the existing template registry path for both preview and render
- add a Remotion still/smoke check before provider integration

## 8. Suggested Goal-mode Objective

Use this objective when starting the implementation goal:

```txt
Implement the Scene Graph MVP described in docs/GOAL_SCENE_GRAPH_MVP.md:
add validated ShotLanguagePlan/SceneGraph contracts, register a scene-graph
template, implement a UniversalSceneRenderer MVP, add deterministic fixture
coverage, and validate preview/export compatibility without introducing
unrestricted generated TSX or widening into persistence, media library, or
timeline editing.
```
