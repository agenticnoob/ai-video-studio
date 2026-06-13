# Handoff: Stats Dashboard Template

Status: first implementation shipped.

Use this handoff when the next task is to add a data-statistics Remotion
template by reusing the existing primitive library.

## One-Sentence Context

The repo now has a first registered data-statistics segment template that wraps
existing Remotion primitives instead of introducing a free-form chart system.

## Read First

Read these files before planning edits:

1. `docs/FINAL_PRODUCT_GOAL.md`
2. `docs/ITERATION_STATUS.md`
3. `docs/TEMPLATE_ARCHITECTURE.md`
4. `docs/archive/REMOTION_PRIMITIVES.md`
5. `docs/archive/plans/STATS_DASHBOARD_TEMPLATE_ROADMAP.md`
6. `docs/archive/HANDOFF_STATS_DASHBOARD_TEMPLATE.md`
7. `.agents/skills/remotion-best-practices/SKILL.md`

## Current Product Boundary

Keep these stable:

- `VideoProject` is the preview/edit/export boundary.
- `VideoSegment` is the segment editing and regeneration boundary.
- each segment has one primary `templateId`.
- `templateId` determines the schema of `implementation`.
- narration text, audio, and captions stay under `VideoSegment.narration`.
- Remotion internals may compose many primitives, but they do not become
  segment-level templates.

## What Already Exists

Reusable primitives already in repo:

- `src/remotion/primitives/charts/BarChart.tsx`
- `src/remotion/primitives/charts/LineChart.tsx`
- `src/remotion/primitives/charts/DonutChart.tsx`
- `src/remotion/primitives/charts/ComparisonChart.tsx`
- `src/remotion/primitives/charts/StatCounter.tsx`
- `src/remotion/primitives/elements/VideoPanel.tsx`
- `src/remotion/primitives/elements/Kicker.tsx`
- `src/remotion/primitives/layouts/CalloutGrid.tsx`

Existing template wiring references:

- `src/templates/spotlight/*`
- `src/templates/scripted/*`
- `src/templates/registered-definitions.ts`
- `src/templates/registered-bundles.ts`
- `src/templates/registry.ts`
- `src/templates/component-registry.tsx`

Current implementation:

- `BarChart` is already prop-driven enough to reuse directly.
- `LineChart` and `DonutChart` now have semantic props for template reuse while
  keeping their default catalog previews intact.
- `BarChart`, `LineChart`, and `DonutChart` now have enough semantic props for
  compact dashboard layouts.
- `ComparisonChart` and `StatCounter` remain closer to demo primitives and can
  be parameterized in a later enhancement if the template needs those block
  types.

## Completed First Slice

- Added `src/templates/stats-dashboard/`.
- Registered `stats-dashboard` through the existing template definition and
  runtime bundle registries.
- Upgraded the template into a controlled block-based dashboard contract:
  - `layout`: `single`, `split`, `grid`, `hero-metric`, or `timeline`
  - `blocks[]`: `kpi`, `insight`, `bar-chart`, `line-chart`, or
    `donut-chart`
  - optional `timeline[]` sequence steps for staged reveal
- Added a compact editor for title/layout/duration plus JSON editing for
  blocks and timeline.
- Kept narration text/audio/captions outside template-specific
  `implementation`.
- Added `StatsDashboardSmokeProject` as a deterministic Remotion composition
  loaded by `npm run smoke:staged-fixtures`.
- Keep Studio preview `defaultProps` inline in `src/remotion/Root.tsx`.
  Remotion Studio can save default props only when it can statically extract
  the object literal from the root file; wrapper components or imported fixture
  constants trigger `Could not find or extract defaultProps`.

## Recommended Next Slice

1. visually review the first runtime layout in Studio or with a one-frame
   render.
2. harden MiniMax prompt examples if live generation picks weak chart data.
3. only then consider adding `comparison` or `progress` block types.

## Proposed Template Intent

Use `stats-dashboard` for segments such as:

- quarterly KPI summary
- user growth trend
- campaign before/after comparison
- market share / category split
- dashboard-style recap

Avoid using it for:

- story-first narrative scenes
- quote/testimonial scenes
- scenes that need many internal dramatic beats

## Proposed Template Contract

Keep the contract controlled rather than turning it into a generic chart DSL.

Suggested top-level implementation fields:

- `meta`
- `theme`
- `durationInFrames`
- `layout`
- `kicker?`
- `title`
- `subtitle?`
- `blocks[]`
- `timeline?`
- `footerNote?`

Supported `layout` values:

- `single`
- `split`
- `grid`
- `hero-metric`
- `timeline`

Supported block types:

- `kpi`
- `insight`
- `bar-chart`
- `line-chart`
- `donut-chart`

## Editing Rules

- keep `definition.ts` server-safe
- keep runtime-only chart composition in `runtime.tsx`
- do not leak primitive-only knobs into the LLM-visible schema unless they are
  promoted into block fields
- keep all render-critical motion frame-driven with Remotion APIs
- prefer a thin adapter layer over rewriting chart visuals from scratch

## Recommended Subagent Split

If using Subagent-Driven, keep the split narrow.

### Subagent A: primitive reuse audit

Scope:

- `src/remotion/primitives/charts/*`
- `src/remotion/primitives/elements/*`
- `src/remotion/primitives/layouts/*`

Questions:

- which chart primitives are already prop-driven?
- which ones need only a thin props pass?
- which props are semantic enough for template reuse?

Expected output:

- a small primitive parameterization plan

### Subagent B: template wiring

Scope:

- `src/templates/spotlight/*`
- `src/templates/registered-definitions.ts`
- `src/templates/registered-bundles.ts`
- `src/templates/registry.ts`
- `src/templates/component-registry.tsx`

Questions:

- what is the minimal new-template wiring path?
- which existing template is the best structural starting point?

Expected output:

- a file-by-file implementation checklist

### Subagent C: editor/runtime integration

Scope:

- `src/templates/stats-dashboard/*`
- `src/remotion/*` as needed

Questions:

- how should block layout and timeline switching work?
- which fields need direct manual editing versus structured text areas?
- what visual density feels like a data report rather than a spotlight card?

Expected output:

- a runtime/editor integration proposal

## Validation

Default to Docker-first validation:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run build'
git diff --check
```

## Non-Goals

Do not widen into:

- generic chart schema infrastructure
- multiple templates inside one segment
- narration/caption model changes
- new persistence/history features
- timeline editor work

## Ready-For-Implementation Exit Condition

This handoff has served its original purpose: the template module exists and
reuses the primitive library without re-deciding the product model.
