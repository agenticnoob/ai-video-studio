# Handoff: Scene Graph Visual IR v1 Subagent-Driven Implementation

Status: implementation handoff plus completed deterministic-slice notes.

Use this file together with:

1. `docs/archive/GOAL_SCENE_GRAPH_VISUAL_IR_V1.md`
2. `docs/SCENE_GRAPH_VIDEO_LANGUAGE_PLAN.md`
3. `docs/FINAL_PRODUCT_GOAL.md`
4. `docs/ITERATION_STATUS.md`
5. `docs/TEMPLATE_ARCHITECTURE.md`
6. `docs/archive/REMOTION_PRIMITIVES.md`
7. `.agents/skills/remotion-best-practices/SKILL.md`

## 0. Completed Deterministic Slice Notes

The first Visual IR v1 deterministic slice is implemented:

- `src/lib/scene-graph-schema.ts` defines the bounded
  `renderStrategy`/composition/layout/motion preset vocabulary and validates
  the current executable strategy as `primitive_scene_graph`.
- `src/templates/scene-graph/primitives.tsx` contains scene-graph internal
  technical-video primitives. They are not registered templates and are not
  provider-visible free-form React props.
- `src/lib/staged-smoke-fixtures.ts` now drives the deterministic
  `SceneGraphTemplatePreview` opener/process/closing stills with full-bleed
  hero, node graph/path/code/terminal, and final lockup treatments.
- `SceneGraphTemplatePreview` still renders through `ProjectVideo`; the
  generic `ProjectVideo` composition remains the local export entrypoint.

Future subagents should treat LLM Visual IR generation and repair as the next
bounded slice. Do not reopen unrestricted generated TSX, media library, asset
ingestion, timeline editor, persistence, or multi-template-per-segment scope.

## 1. Operating Model

This slice is suitable for Subagent-Driven execution only if the main agent
keeps architecture control.

Main agent owns:

- final Visual IR schema shape
- render-strategy vocabulary boundaries
- primitive/layout/motion grammar scope
- renderer quality bar
- deterministic fixture acceptance
- preview/export compatibility
- final diff review
- final docs sync

Subagents may help with bounded tasks:

- read-only primitive inventory
- schema risk review
- renderer primitive implementation in disjoint files
- fixture visual copy/content drafting
- smoke command suggestions
- docs consistency audit

Do not delegate final architecture decisions or acceptance of visual quality.

## 2. Suggested Subagent Tasks

### Task A: Current Renderer Audit

Type: read-only.

Goal:

- inspect `src/templates/scene-graph/runtime.tsx`
- identify why current output still feels like PPT/cards
- list which renderer blocks should be replaced by full-bleed, node graph,
  path, code, terminal, and lockup treatments

Expected output:

- concise findings by renderer area
- safe reuse opportunities
- no code edits

### Task B: Visual IR Schema Review

Type: narrow review.

Goal:

- review proposed additions in `src/lib/scene-graph-schema.ts`
- confirm render strategy, composition, layout, and motion presets stay bounded
- flag any schema shape that would make LLM output unreliable later

Expected output:

- findings by severity
- suggested schema tweaks
- no product-model redesign

### Task C: Primitive Implementation Worker

Type: bounded code worker.

Ownership:

- only files under `src/templates/scene-graph/` or a new
  `src/templates/scene-graph/primitives/` folder

Goal:

- implement one or more internal primitives such as `NodeGraph`, `LinePath`,
  `CodePanel`, `TerminalPanel`, or `BrowserWindow`
- keep motion frame-driven
- do not modify shared project schema or registry files

Expected output:

- changed file list
- notes on props and visual behavior
- no broad refactor

### Task D: Fixture And Still Audit

Type: narrow review.

Goal:

- verify deterministic fixture uses the new visual primitives
- verify opener/process/closing are visually distinct
- verify still frames are nonblank and not card/PPT-like
- verify `ProjectVideo` export composition remains present

Expected output:

- pass/fail notes
- exact still frames and commands
- visual risks to fix

### Task E: Docs Consistency Review

Type: read-only.

Goal:

- ensure docs say templates are macro/preset paths, not the full expression
  model
- ensure `scene-graph` is documented as the first Visual IR compiler path
- ensure generated TSX/codegen remains future escape hatch only
- ensure non-goals remain explicit

Expected output:

- doc sections to fix
- no implementation changes

## 3. Main-agent Review Checklist

Before accepting implementation:

- `SceneGraph` remains validated data.
- `scene-graph` remains a normal registered template path.
- `ProjectVideo` generic composition remains registered for local export.
- no runtime module imports leak into server-safe registries.
- no generated TSX, dynamic imports, package installs, eval, filesystem,
  network, or env access are introduced.
- renderer motion uses Remotion frame-driven APIs only.
- captions remain outside `implementation`.
- deterministic fixture proves opener/process/closing visual difference.
- still renders are nonblank and visually less PPT-like.
- Docker-first validation was run.
- docs are updated after code changes.

## 4. Validation Baseline

Default validation:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run build'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'
git diff --check
```

Representative stills:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx remotion still src/remotion/index.ts SceneGraphTemplatePreview /workspace/out/scene-graph-opener.png --frame=90 --scale=0.5'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx remotion still src/remotion/index.ts SceneGraphTemplatePreview /workspace/out/scene-graph-process.png --frame=215 --scale=0.5'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx remotion still src/remotion/index.ts SceneGraphTemplatePreview /workspace/out/scene-graph-closing.png --frame=340 --scale=0.5'
```

Export entrypoint smoke:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx remotion render src/remotion/index.ts ProjectVideo /workspace/out/project-video-export-smoke.mp4 --log=error'
```

## 5. Stop Conditions

Stop and report instead of widening scope if:

- better visuals require generated TSX
- the schema starts becoming an unbounded arbitrary object
- media library or real asset ingestion becomes required
- preview and export require separate payload formats
- the renderer cannot avoid card/PPT layouts without broader product work
- validation failures imply unrelated refactors outside `scene-graph`

## 6. Implementation Notes

The next proof should be visual, not architectural.

Prefer:

- fewer card borders
- full-bleed compositions
- node/path/code/terminal visual metaphors
- strong hierarchy and camera motion
- bounded schema additions

Avoid:

- more fixed segment templates
- generic keyframe editor
- arbitrary code generation
- broad asset system work
