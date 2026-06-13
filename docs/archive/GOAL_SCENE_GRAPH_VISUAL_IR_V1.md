# Goal: Scene Graph Visual IR v1

Status: deterministic visual-quality slice implemented.

This goal records the first implemented visual-quality slice after the bounded
Scene Graph MVP. It incorporates the current product decision that fixed
templates should be treated as stable macro/preset paths, while the
`scene-graph` template evolves into the first controlled Visual IR compiler
path.

Implementation summary:

- `SceneGraph` now exposes bounded render-strategy, composition, layout, and
  motion preset vocabularies.
- The active accepted `scene-graph` render strategy is
  `primitive_scene_graph`; other strategy names are documented roadmap
  vocabulary and are not executable here.
- The renderer includes internal technical-video primitives such as
  `NodeGraph`, `LinePath`, `CodePanel`, `TerminalPanel`, `BrowserWindow`, and
  `Cursor`.
- The deterministic fixture exercises opener/process/closing stills with
  full-bleed, graph/path/code/terminal, and lockup treatments that are visibly
  less card/PPT-like.
- LLM Visual IR generation and bounded repair are the next slice, not part of
  this deterministic implementation.

## 1. Goal Statement

Upgrade the implemented `scene-graph` MVP from a card-like renderer into a
controlled Visual IR renderer that can produce visibly less PPT-like technical
video shots while preserving the current product loop:

```txt
VideoProject
  -> ProjectVideo preview
  -> selected segment editing / regeneration compatibility
  -> POST /api/render export
```

The slice should prove the next architecture direction:

```txt
registered templates = macro / preset paths
scene-graph = validated Visual IR / primitive compiler path
Remotion = deterministic renderer for both
```

The first quality milestone is successful when the deterministic
`SceneGraphTemplatePreview` fixture renders opener/process/closing shots that
look like authored video frames rather than information cards or slide panels.

## 2. Architectural Decision

Do not keep solving visual variety by adding more full segment templates.

Use this model instead:

```txt
template_macro
  -> macro params
  -> Visual IR / SceneGraph
  -> Remotion compiler

primitive_scene_graph
  -> Visual IR / SceneGraph
  -> Remotion compiler

procedural_generator
  -> bounded generated Visual IR
  -> Remotion compiler

media_asset_composite
  -> asset plan + Visual IR
  -> Remotion compiler

generated_component
  -> future restricted escape hatch only
```

For this goal, implement only the `primitive_scene_graph` quality slice. Keep
existing `scripted`, `spotlight`, and `stats-dashboard` as registered template
macros/fallbacks. Do not convert them yet.

## 3. Render Strategy Model

Introduce or document the first bounded render-strategy vocabulary in the
scene graph contract:

```ts
type RenderStrategy =
  | "template_macro"
  | "primitive_scene_graph"
  | "procedural_generator"
  | "media_asset_composite"
  | "generated_component";
```

For this slice:

- `primitive_scene_graph` is the only newly exercised strategy.
- `template_macro` remains represented by existing registered templates.
- `procedural_generator`, `media_asset_composite`, and
  `generated_component` are roadmap concepts only unless a tiny placeholder is
  needed for type-safe future extension.

Do not let `generated_component` execute code in this slice.

## 4. Visual IR Contract Direction

The current `SceneGraph` is the project-local Visual IR seed. Evolve it
conservatively instead of replacing it with a new broad schema.

Add only what is needed to express non-card shots:

- composition presets:
  - `hero`
  - `path`
  - `split`
  - `node-graph`
  - `code-terminal`
  - `lockup`
- layout presets:
  - `full-bleed`
  - `center`
  - `split`
  - `path-horizontal`
  - `node-graph`
  - `code-terminal-split`
  - `safe-lockup`
- motion presets:
  - `fade-in`
  - `slide-in`
  - `pop`
  - `draw-path`
  - `highlight`
  - `type-text`
  - `camera-push`
  - `match-cut`
  - `success-pulse`
  - `error-glitch`

Keep schema constraints:

- stable layer ids
- bounded layer counts
- text length limits
- segment-local frames
- captions outside `implementation`
- no arbitrary TSX, imports, packages, network, filesystem, or eval

## 5. Primitive Set

Add the smallest useful primitive set inside the `scene-graph` renderer or a
nearby internal runtime folder. These are not new registered templates:

- `TextLayer`
- `RichTextLayer`
- `ShapeLayer`
- `ImagePlane` placeholder-safe only
- `CodePanel`
- `TerminalPanel`
- `BrowserWindow`
- `NodeGraph`
- `LinePath`
- `Cursor`

The technical-video proof target should be able to show:

```txt
user prompt
  -> task node
  -> plan/code/test nodes
  -> code diff or terminal panel
  -> success/failure path
```

Use fake fixture content only; do not add a media library or asset ingestion
system in this slice.

## 6. Renderer Quality Target

Rework the deterministic fixture so that:

- opener uses full-bleed kinetic title, camera push, mask/wipe reveal, and no
  central card shell
- process uses `NodeGraph` + `LinePath` + staged activation instead of three
  small panels
- closing uses a true final lockup / end-frame treatment rather than title card
  plus callout card
- at least one shot uses a code or terminal style primitive if it can be done
  without widening scope
- caption-safe space is reserved but caption cues remain segment-owned
- representative stills are nonblank, readable, and visibly different from
  slide/PPT layouts

## 7. Non-goals

Do not include these in this goal:

- provider-backed LLM generation
- unrestricted generated Remotion TSX
- codegen escape hatch
- package installation during generation
- full media library
- real screenshot/video/image ingestion
- drag/drop layer editor
- full timeline/keyframe editor
- persistence/history/database/auth changes
- multi-template-per-segment orchestration
- converting existing templates into Visual IR macros

## 8. Acceptance Criteria

The goal is accepted when:

- `SceneGraphTemplatePreview` still renders through `ProjectVideo`.
- local export still has the generic `ProjectVideo` composition available.
- deterministic opener/process/closing stills look visibly less like PPT/cards.
- the renderer has a bounded primitive/motion/layout vocabulary.
- no unrestricted generated TSX or eval-like path is introduced.
- captions remain outside scene graph implementation.
- TypeScript, lint, build, smoke composition listing, and representative
  Remotion still renders pass in Docker.
- docs explain that LLM Visual IR generation is the next slice, not part of
  this one.

## 9. Suggested Goal-mode Objective

Use this objective in the next conversation:

```txt
Implement the Scene Graph Visual IR v1 goal described in
docs/archive/GOAL_SCENE_GRAPH_VISUAL_IR_V1.md: upgrade the existing scene-graph
renderer from a card-like MVP into a bounded Visual IR compiler path with
renderStrategy vocabulary, layout/motion presets, technical-video primitives
such as NodeGraph/LinePath/CodePanel/TerminalPanel, and deterministic
opener/process/closing fixture stills that look visibly less like PPT, while
preserving VideoProject preview/export compatibility and avoiding LLM
generation, media library work, timeline editing, persistence, and unrestricted
generated TSX.
```
