# TEMPLATE SYSTEM KNOWLEDGE BASE

**Generated:** 2026-06-24 13:26:24 +0800

## OVERVIEW

`src/templates` owns the registered one-primary-template-per-segment model.
Each template provides server-safe metadata/schema and a separate runtime/editor
bundle for preview/export/editing.

## STRUCTURE

```txt
src/templates/
|-- definition.ts              # server-safe template definition shape
|-- runtime-definition.ts      # runtime render/editor shape
|-- bundle.ts                  # definition + runtime bundle helper
|-- registered-definitions.ts  # server-safe registry source
|-- registered-bundles.ts      # runtime registry source
|-- registry.ts                # derived planner/schema metadata
|-- component-registry.tsx     # runtime render/editor lookup
`-- <template>/                # schema, definition, editor, runtime
```

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Add a template id | `ids.ts`, `<template>/schema.ts` | Keep discriminated schema stable. |
| Planner metadata | `<template>/definition.ts` | Descriptions, capabilities, recipes. |
| Runtime render | `<template>/runtime.tsx` | Segment renderer only. |
| Segment editor | `<template>/editor.tsx` | Page editing controls. |
| Register server-safe template | `registered-definitions.ts` | No runtime imports. |
| Register runtime bundle | `registered-bundles.ts` | Runtime/editor imports are allowed here. |
| Planner manifest | `registry.ts` | Derived from definitions only. |
| Runtime lookup | `component-registry.tsx` | Type-checked coverage for registered ids. |

## CONVENTIONS

- `templateId` determines the `implementation` schema.
- `implementation` is template-specific; do not invent universal scene fields.
- A template may contain many internal Remotion blocks/recipes, but the segment
  still has one primary template.
- `definition.ts` files must be server-safe: schema, planner metadata, and
  duration helpers only.
- Runtime/editor code belongs in `runtime.tsx`, `editor.tsx`, and
  `registered-bundles.ts`.
- Planner-facing recipe metadata must be compact and safe: recipe id, use cases,
  avoid cases, required input summary, and duration fit.
- For recipe-capable templates, recipe hints remain planner-stage hints and are
  compiled into schema-valid template-owned `implementation`.

## ANTI-PATTERNS

- Do not import React/Remotion runtime modules into server-safe definitions,
  schemas, DeepSeek prompts, or API validation code.
- Do not promote every reusable Remotion primitive into a new `templateId`.
- Do not add a global recipe registry outside template definitions unless the
  product model explicitly changes.
- Do not store narration audio, captions, or subtitle cues inside template
  `implementation`.
- Do not let planners/providers see or emit template runtime internals.

## VALIDATION

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:planner-recipe-manifest'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:technical-explainer-template'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
```
