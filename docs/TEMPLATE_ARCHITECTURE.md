# Template Architecture

The project uses one primary template per `VideoSegment`. A template is split
into server-safe metadata and client/video runtime code so API routes can build
schemas and prompts without importing React or Remotion components.

For Remotion-specific rendering and animation rules, use the repo-local
`.agents/skills/remotion-best-practices/SKILL.md` skill. It is vendored so
agents working in this repository share the same Remotion guidance.

## Module Shape

Each template should live in its own directory:

```txt
src/templates/<template-id>/
  index.ts
  schema.ts
  definition.ts
  editor.tsx
  runtime.tsx
```

- `index.ts`: template bundle export. It binds the server-safe definition and
  runtime adapter for registration while keeping their consumers separate.
- `schema.ts`: Zod segment schema and template-specific segment type. Use
  `createTemplateSegmentSchema()` for the shared segment fields.
- `definition.ts`: server-safe template metadata:
  - id and label
  - structured capabilities (`bestFor`, `textDensity`, recommended duration,
    media/baseLayer support)
  - implementation schema
  - segment schema
  - MiniMax JSON Schema fragment
  - duration helper
  - generation / revision / preservation prompt snippets
  - revision payload builder
- `editor.tsx`: template-specific structured field editor.
- `runtime.tsx`: template-specific runtime adapter that wires the editor and
  Remotion renderer into the shared runtime interface.

## Registries

- `src/templates/registry.ts` is server-safe. It must not import React,
  Remotion components, or template `runtime.tsx` files.
- `src/templates/registered-definitions.ts` is the server-safe registration
  source. `registry.ts` derives template ids, lookup maps, Zod segment schema
  variants, and MiniMax JSON schema fragments from this list.
- `src/templates/registered-bundles.ts` is the runtime registration source. It
  imports template bundle indexes and is only consumed by runtime code.
- `src/templates/component-registry.tsx` is runtime-only. It imports template
  bundles through `registered-bundles.ts`, derives runtime adapters, and checks
  at compile time that every registered `TemplateId` has runtime coverage.
- `src/templates/ids.ts` owns literal template id constants.
- `src/lib/template-registry.ts` is a compatibility re-export for existing
  project code.

## Adding a Template

1. Add a template id in `src/templates/ids.ts`.
2. Add `index.ts`, `schema.ts`, `definition.ts`, `editor.tsx`, and
   `runtime.tsx` under a new `src/templates/<template-id>/` directory.
3. Register the server-safe definition in
   `src/templates/registered-definitions.ts`.
4. Register the runtime side by adding the template bundle in
   `src/templates/registered-bundles.ts`.
5. Run Docker-first validation:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run build'
```

## Boundaries

- Keep `VideoProject` as the top-level generation, preview, and render
  contract.
- Keep `VideoSegment.templateId` as the discriminator.
- Keep one primary template per segment. A template may internally compose
  reusable parameterized React animation components, scenes, blocks,
  transitions, media helpers, and layout primitives, but those are template
  internals, not additional segment-level templates.
- Do not import runtime template files from API, MiniMax, or schema modules.
- Do not import `src/templates/<template>/index.ts` from server-safe modules;
  template bundle indexes include runtime adapters.
- Put template-specific fields, editor controls, renderer wiring, prompt
  snippets, and revision payload logic inside the template module before
  changing shared project code.
- Keep Remotion motion deterministic and frame-driven. Prefer
  `useCurrentFrame()`, `interpolate()`, `spring()`, `<Sequence>`, `<Series>`,
  and Remotion transition primitives. Avoid CSS animations, CSS transitions,
  and Tailwind animation utilities for render-critical motion.
