# Stats Dashboard Template Roadmap

Status: planned; documentation and handoff only, no implementation in this
slice.

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

The missing piece is not "more chart effects". The missing piece is a
registered template that:

- exposes a stable schema to the planner/compiler
- reuses those existing Remotion primitives through a template runtime
- provides a template editor for structured data entry

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

## Proposed First Implementation Shape

Suggested implementation fields:

```txt
meta
theme
durationInFrames
variant
kicker?
headline
insight
metric
chart
footerNote?
```

Suggested `variant` values:

- `bar-comparison`
- `line-trend`
- `donut-share`

Suggested `metric` shape:

```txt
value
label
delta?
deltaDirection?
```

Suggested `chart` shape:

```txt
categories[]
series[]
unit?
maxValue?
highlightIndex?
```

This keeps the template LLM-visible contract compact and avoids leaking
primitive-only rendering props into generation.

## Roadmap

### Phase 0: Parameterize reusable chart primitives

Target:

- keep current visuals where practical
- convert hard-coded chart demo components into prop-driven reusable building
  blocks

First targets:

- `src/remotion/primitives/charts/LineChart.tsx`
- `src/remotion/primitives/charts/DonutChart.tsx`
- `src/remotion/primitives/charts/ComparisonChart.tsx`
- `src/remotion/primitives/charts/StatCounter.tsx`

Rules:

- keep Remotion frame-driven animation only
- no CSS animation or transition logic
- do not expose raw layout/motion knobs to the template schema unless needed

### Phase 1: Add template-local schema and definition

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

Target:

- compose `VideoPanel`, `Kicker`, and one chart primitive based on `variant`
- keep the template visually report-like and information-dense, not cinematic
  or narrative-first

Rules:

- the runtime chooses internal composition; the segment still has one
  `templateId`
- narration remains external under `VideoSegment.narration`

### Phase 3: Add editor and registration

Target:

- register the template through:
  - `src/templates/registered-definitions.ts`
  - `src/templates/registered-bundles.ts`
- expose a compact structured editor for:
  - variant
  - headline
  - insight
  - metric
  - categories/series
  - footer note

### Phase 4: Validate and document

Target:

- Docker-first typecheck/lint/build
- update docs if the primitive inventory or template inventory changed

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
