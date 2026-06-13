# Stats Dashboard Template Roadmap

Status: first implementation shipped; continue with validation hardening and
template-quality iteration.

This document defines the next bounded template addition for
`ai-video-studio`: a data-statistics segment template built by reusing the
existing Remotion primitive library instead of introducing a new open-ended
chart system.

Authoritative product direction remains `docs/FINAL_PRODUCT_GOAL.md`.
Current template wiring rules remain `docs/TEMPLATE_ARCHITECTURE.md`.

## Goal

Add one new registered segment template for data-heavy explainer moments:

```txt
stats-dashboard
```

The template should be suitable for:

- KPI recap
- growth/trend summary
- category comparison
- proportion/share summary
- report-style highlight segment

It should remain one primary template per `VideoSegment`, with template-local
`implementation` fields and no changes to narration ownership.

## Why This Template

The repo already contains reusable chart and layout primitives under
`src/remotion/primitives/`, including:

- `BarChart`
- `LineChart`
- `DonutChart`
- `ComparisonChart`
- `StatCounter`
- `VideoPanel`
- `Kicker`
- `CalloutGrid`

The initial missing piece was not "more chart effects". The missing piece was a
registered template that:

- exposes a stable schema to the planner/compiler
- reuses those existing Remotion primitives through a template runtime
- provides a template editor for structured data entry

That first registered template now exists under
`src/templates/stats-dashboard/`.

## Bounded Scope

This roadmap is only for one template addition.

In scope:

- one new registered template module under `src/templates/stats-dashboard/`
- one formal implementation schema for data-statistics segments
- thin primitive parameterization where current chart components are still demo
  shaped
- one runtime renderer that composes existing primitives
- one template editor for manual field editing

Out of scope:

- a generic chart DSL
- a cross-template chart framework
- multi-template-per-segment composition
- timeline editing
- persistence/history
- moving narration or captions into `implementation`

## Implemented Template Shape

Implemented top-level fields:

```txt
meta
theme
durationInFrames
layout
kicker?
title
subtitle?
blocks[]
timeline?
footerNote?
```

Supported `layout` values:

- `single`
- `split`
- `grid`
- `hero-metric`
- `timeline`

Supported block types:

```txt
kpi
insight
bar-chart
line-chart
donut-chart
```

Optional `timeline` step shape:

```txt
from
durationInFrames
blockIds[]
layout?
```

This keeps the template LLM-visible contract controlled while still allowing
single-chart, multi-chart, KPI-plus-chart, and sequenced dashboard layouts.

## Roadmap

### Phase 0: Parameterize reusable chart primitives

Status: implemented for the first template path.

Target:

- keep current visuals where practical
- convert hard-coded chart demo components into prop-driven reusable building
  blocks

First targets:

- `src/remotion/primitives/charts/LineChart.tsx`
- `src/remotion/primitives/charts/DonutChart.tsx`
- `src/remotion/primitives/charts/ComparisonChart.tsx`
- `src/remotion/primitives/charts/StatCounter.tsx`

Implemented:

- `LineChart` now accepts semantic data, title, colors, dimensions, and y-axis
  maximum while preserving its default preview behavior.
- `DonutChart` now accepts semantic segments, center text, dimensions, legend
  visibility, and ring sizing while preserving its default preview behavior.
- `BarChart` now accepts semantic sizing/container props for compact dashboard
  layouts.

Deferred:

- `ComparisonChart` and `StatCounter` are still optional future enhancements.

Rules:

- keep Remotion frame-driven animation only
- no CSS animation or transition logic
- do not expose raw layout/motion knobs to the template schema unless needed

### Phase 1: Add template-local schema and definition

Status: implemented.

Target:

```txt
src/templates/stats-dashboard/
  index.ts
  schema.ts
  definition.ts
  editor.tsx
  runtime.tsx
```

Rules:

- use `createTemplateSegmentSchema()`
- keep `definition.ts` server-safe
- add planner metadata and capability metadata
- preserve one primary template per segment

### Phase 2: Add runtime renderer

Status: implemented.

Target:

- compose `VideoPanel`, `Kicker`, and one or more dashboard block renderers
  based on `blocks[]`
- keep the template visually report-like and information-dense, not cinematic
  or narrative-first

Rules:

- the runtime chooses internal composition; the segment still has one
  `templateId`
- narration remains external under `VideoSegment.narration`

### Phase 3: Add editor and registration

Status: implemented.

Target:

- register the template through:
  - `src/templates/registered-definitions.ts`
  - `src/templates/registered-bundles.ts`
- expose a compact structured editor for:
  - layout
  - title/subtitle
  - blocks JSON
  - timeline JSON
  - footer note

### Phase 4: Validate and document

Status: implemented for the first template path.

Target:

- Docker-first typecheck/lint/build
- update docs if the primitive inventory or template inventory changed
- deterministic Remotion composition loading now includes
  `StatsDashboardSmokeProject`

Suggested validation:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run build'
git diff --check
```

## Success Criteria

This roadmap is complete when the next implementation conversation ships:

- one registered `stats-dashboard` template
- at least one reusable chart primitive path parameterized for template reuse
- a working runtime renderer and editor
- no product-model drift away from:
  - `VideoProject`
  - `VideoSegment`
  - one primary `templateId`
  - template-local `implementation`
  - segment-owned narration/captions
