# Handoff: Scene Graph Subagent-Driven Implementation

Status: execution handoff for Goal-mode implementation.

Use this file together with `docs/GOAL_SCENE_GRAPH_MVP.md` and
`docs/SCENE_GRAPH_VIDEO_LANGUAGE_PLAN.md`.

## 1. Operating Model

This slice is suitable for Subagent-Driven execution only if the main agent
keeps architecture control.

Main agent owns:

- final schema shape
- product boundary decisions
- template registration integration
- renderer quality bar
- validation selection
- final diff review
- final docs sync

Subagents may help with bounded tasks:

- read-only code path mapping
- schema draft review
- fixture creation review
- editor field audit
- renderer visual primitive audit
- docs consistency check
- smoke/test command suggestions

Do not delegate final architecture decisions to subagents.

## 2. Required Context For All Agents

Before implementation, read:

1. `docs/GOAL_SCENE_GRAPH_MVP.md`
2. `docs/SCENE_GRAPH_VIDEO_LANGUAGE_PLAN.md`
3. `docs/FINAL_PRODUCT_GOAL.md`
4. `docs/ITERATION_STATUS.md`
5. `docs/TEMPLATE_ARCHITECTURE.md`
6. `docs/REMOTION_PRIMITIVES.md`
7. `.agents/skills/remotion-best-practices/SKILL.md`

When using codegraph, prefer it before grep/read if `.codegraph/` exists.

## 3. Suggested Subagent Tasks

### Task A: Template Wiring Map

Type: read-only.

Goal:

- identify every file that must change to add a new registered template
- confirm current wiring for `scripted`, `spotlight`, and `stats-dashboard`
- list compile-time coverage checks that will fail until `scene-graph` is
  registered

Expected output:

- concise file list
- required exports
- likely TypeScript failure points
- no code edits

### Task B: Scene Graph Schema Review

Type: narrow implementation review.

Goal:

- review `src/lib/scene-graph-schema.ts` and
  `src/templates/scene-graph/schema.ts`
- confirm discriminated unions are bounded
- confirm IDs, beats, duration, and text limits are safe
- identify missing validation before renderer work proceeds

Expected output:

- findings by severity
- suggested schema tweaks
- no broad product redesign

### Task C: Renderer Primitive Audit

Type: read-only or narrow implementation review.

Goal:

- inspect existing Remotion primitives
- identify reusable components for background, chart/data, typography, panels,
  captions, and layout
- warn if renderer implementation duplicates existing primitives without need

Expected output:

- reuse recommendations
- gaps that need a new primitive
- no forced refactor outside scene-graph work

### Task D: Fixture And Smoke Audit

Type: narrow review.

Goal:

- verify deterministic fixture actually uses `scene-graph`
- verify opener/process/closing segments are visually distinct
- verify smoke commands exercise the new path
- verify preview/export payload boundaries remain `VideoProject`

Expected output:

- pass/fail notes
- missing smoke coverage
- exact commands to run

### Task E: Docs Consistency Review

Type: read-only.

Goal:

- check that docs do not claim LLM-generated TSX is the main path
- check that narration/captions remain segment-owned
- check that SceneGraph is documented as implementation data for the
  `scene-graph` template
- check that non-goals remain explicit

Expected output:

- doc lines or sections to fix
- no implementation changes

## 4. Main-agent Review Checklist

Before accepting implementation:

- `scene-graph` is registered through the same pattern as existing templates
- server-safe registry code does not import React/Remotion runtime modules
- runtime registry covers the new template
- `SceneGraph` schema is not an unbounded arbitrary object
- no generated TSX, dynamic imports, package installs, or eval-like behavior
- renderer uses Remotion frame-driven animation only
- captions remain outside `implementation`
- selected segment editing still compiles
- deterministic fixture renders through existing Remotion root/composition path
- validation commands were run in Docker
- docs are updated after code changes

## 5. Validation Baseline

Default validation should stay Docker-first:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run build'
git diff --check
```

Add a Remotion still check once the fixture exists. Example shape:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx remotion still src/remotion/index.ts SceneGraphTemplatePreview /workspace/out/scene-graph-preview.png --frame=90 --scale=0.5'
```

Adjust the composition id and output path to the implementation.

## 6. Stop Conditions

Stop and report instead of widening scope if:

- the new schema requires changing the core `VideoProject` contract broadly
- preview/export need separate payload formats
- Remotion rendering requires arbitrary generated code
- project-level `ShotLanguagePlan` has no safe home without a broader schema
  migration
- renderer quality cannot pass deterministic fixture review
- validation failures imply unrelated refactors outside the scene-graph path

## 7. Implementation Notes

Prefer a small first landing:

- one `scene-graph` template
- one renderer
- one deterministic fixture
- compact editor
- no provider-backed generation until fixture quality is proven

The strongest first proof is not a complex schema. It is a visually credible
three-segment fixture that uses the same `VideoProject` path as preview and
export.

