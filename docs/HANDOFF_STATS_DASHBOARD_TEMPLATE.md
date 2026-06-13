# Handoff: Stats Dashboard Template

Status: planned; implementation not started in this slice.

Use this handoff when the next task is to add a data-statistics Remotion
template by reusing the existing primitive library.

## One-Sentence Context

The repo already has enough chart and layout primitives to support a
data-statistics template; the next job is to wrap those primitives in one new
registered segment template instead of building another free-form chart system.

## Read First

Read these files before planning edits:

1. `docs/FINAL_PRODUCT_GOAL.md`
2. `docs/ITERATION_STATUS.md`
3. `docs/TEMPLATE_ARCHITECTURE.md`
4. `docs/REMOTION_PRIMITIVES.md`
5. `docs/plans/STATS_DASHBOARD_TEMPLATE_ROADMAP.md`
6. `docs/HANDOFF_STATS_DASHBOARD_TEMPLATE.md`
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

Important observation:

- `BarChart` is already prop-driven enough to reuse directly.
- `LineChart`, `DonutChart`, `ComparisonChart`, and `StatCounter` are still
  closer to demo primitives and likely need a thin parameterization pass before
  template reuse.

## Recommended First Slice

Implement in this order:

1. parameterize one or more existing chart primitives
2. add `src/templates/stats-dashboard/`
3. register the new template
4. add a template editor
5. run Docker-first validation

Do not start by inventing a generic chart abstraction.

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

Keep the first version compact.

Suggested top-level implementation fields:

- `meta`
- `theme`
- `durationInFrames`
- `variant`
- `kicker?`
- `headline`
- `insight`
- `metric`
- `chart`
- `footerNote?`

Suggested `variant` values:

- `bar-comparison`
- `line-trend`
- `donut-share`

## Editing Rules

- keep `definition.ts` server-safe
- keep runtime-only chart composition in `runtime.tsx`
- do not leak primitive-only knobs into the LLM-visible schema unless they are
  real product fields
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

- how should variant switching work?
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

This handoff has served its purpose when the next conversation can start by
creating the template module and reusing the existing primitive library without
re-deciding the product model.
