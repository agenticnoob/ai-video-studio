# Template Architecture

The project uses one primary template per `VideoSegment`. A template is split
into server-safe metadata and client/video runtime code so API routes can build
schemas and prompts without importing React or Remotion components.

## Module Shape

Each template should live in its own directory:

```txt
src/templates/<template-id>/
  schema.ts
  definition.ts
  editor.tsx
  runtime.tsx
```

- `schema.ts`: Zod segment schema and template-specific segment type.
- `definition.ts`: server-safe template metadata:
  - id and label
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
- `src/templates/component-registry.tsx` is runtime-only. It imports template
  `runtime.tsx` adapters and is used by the page editor and Remotion preview.
- `src/lib/template-registry.ts` is a compatibility re-export for existing
  project code.

## Adding a Template

1. Add a template id in `src/templates/ids.ts`.
2. Add `schema.ts`, `definition.ts`, `editor.tsx`, and `runtime.tsx` under a
   new `src/templates/<template-id>/` directory.
3. Register the server-safe definition in `src/templates/registry.ts`.
4. Register the runtime adapter in `src/templates/component-registry.tsx`.
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
- Do not import runtime template files from API, MiniMax, or schema modules.
- Put template-specific fields, editor controls, renderer wiring, prompt
  snippets, and revision payload logic inside the template module before
  changing shared project code.
