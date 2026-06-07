# AI Video Studio Agent Notes

Use this file as the first-stop workflow note when starting a new task in this repo.

## Start here

Before planning or editing, read these files in order:
1. `docs/ITERATION_STATUS.md`
2. `docs/PRODUCT_REQUIREMENTS.md`
3. `docs/FUTURE_DIRECTION_NOTES.md`
4. `README.md`

These files together explain:
- current implemented stage
- product requirements
- deferred scope
- product direction
- Docker-first local workflow

When editing Remotion rendering code or template-internal animation
components, also consult
`.agents/skills/remotion-best-practices/SKILL.md`. Treat it as the repo-local
Remotion rendering guide.

## Current project stage

`ai-video-studio` already has a usable one-primary-template-per-segment authoring loop:
- user writes a brief
- page calls `POST /api/generate`
- API returns schema-validated `VideoProject`
- page hydrates project-level editable state
- assembled full-video preview renders live
- user can select a segment, edit its fields, and regenerate only that segment
- user can locally export the current edited project through `POST /api/render`
- successful export writes both a stable latest artifact and a unique artifact for that render

This repo is past the upstream starter-demo stage.
Do not describe it as an untouched scaffold.

The current multi-template direction is implemented as a registered
one-primary-template-per-segment model, not as multiple template instances
inside a segment:
- `src/templates/<template>/` owns each template's schema, server-safe
  definition, structured capabilities, editor fields, runtime adapter, and
  bundle export.
- `src/templates/registry.ts` registers server-safe template metadata for
  schema validation and MiniMax prompt/tool generation.
- `src/templates/component-registry.tsx` registers runtime adapters for page
  editing and Remotion preview rendering.
- `src/lib/template-registry.ts` remains a compatibility re-export.
- currently registered templates:
  - `scripted`: `VideoSpec` implementation with internal `scenes`
  - `spotlight`: focused-card implementation with `headline`,
    `subheadline`, `callouts`, and `durationInFrames`

## Current highest-priority next milestone

Stabilize the existing MiniMax-backed generation path and align docs to current implementation facts.

Keep the next iteration focused on:
1. keep `VideoProject` as the generation contract
2. add provider-backed generation behind the existing request modes
3. preserve validation and bounded error handling
4. do not widen into persistence/history, baseLayer work, or
   multi-template-per-segment orchestration unless the task explicitly asks for it

Current product modeling decision:
- keep one primary template per `VideoSegment`
- `templateId` determines the schema of `implementation`
- `implementation` is template-specific; current registered templates are
  `scripted` (`VideoSpec`) and `spotlight` (`SpotlightSpec`)
- `VideoSpec.scenes` is specific to the current `scripted` template, not a universal field for all future templates
- model future existing video/image/color underlays as project-level or segment-level `baseLayer` data
- do not model one segment as multiple template instances unless a concrete future workflow proves that is necessary

## Important implementation files

- `src/app/page.tsx`
- `src/app/api/generate/route.ts`
- `src/app/api/render/route.ts`
- `src/app/api/render/latest/route.ts`
- `src/app/api/render/[renderId]/route.ts`
- `src/helpers/use-rendering.ts`
- `src/lib/render-project.ts`
- `src/lib/project-schema.ts`
- `src/templates/*`
- `src/lib/project-generation.ts`
- `src/remotion/ProjectVideo/ProjectVideo.tsx`
- `src/remotion/ScriptedVideo/*`
- `src/remotion/Root.tsx`

## Constraints / non-goals for the current product stage

Still not implemented unless the new task explicitly asks for them:
- saved drafts/history/project persistence
- multi-template-per-segment orchestration
- project-level / segment-level baseLayer media compositing
- browser automation acceptance
- end-user render progress UX beyond idle / rendering / success / failure

## Validation workflow

This project is Docker-first on this workstation. Default to containerized
validation and runtime commands. Do **not** run host `npm install`, host
`npm run lint`, host `npx tsc`, or host `npm run build` unless the user
explicitly asks for host-local validation.

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run check'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run build'
```

Use the Docker wrappers documented in `README.md` for app runtime:

```bash
./scripts/dev.sh
./scripts/studio.sh
./scripts/render.sh
```

The host `node_modules` directory may be absent, incomplete, or owned by a
different user because dependencies are intended to live in the Docker volume.
Treat host dependency errors as irrelevant unless the task is explicitly about
host-local setup.

## Notes for Hermes/Codex/OpenCode

- Keep `VideoProject` as the top-level page/generation/preview/render boundary for this phase.
- Keep `VideoSpec` as the per-segment implementation contract for the current scripted template.
- Keep `SpotlightSpec` as the per-segment implementation contract for the current spotlight template.
- Keep one primary template per segment; grow template internals through template-specific implementation fields before introducing multi-template-per-segment orchestration.
- Remotion template internals may be composed from reusable parameterized React
  animation components, but keep those components inside the selected primary
  template's `implementation` model rather than modeling them as additional
  segment-level templates.
- Keep Remotion animation frame-driven with `useCurrentFrame()`,
  `interpolate()`, `spring()`, `<Sequence>`, `<Series>`, or Remotion transition
  primitives. Do not use CSS animations, CSS transitions, or Tailwind animation
  utilities for render-critical motion.
- Treat `scenes` as a scripted-template implementation detail.
- Treat future video/image/color overlay or background needs as `baseLayer` modeling work.
- Prefer small bounded edits.
- Prefer Docker-first artifacts and validation on this workstation.
- Browser automation is not the default validation path on this workstation.
- `scripts/render.sh` still targets the sample/default composition render path; the current edited-project export path is the page action / `POST /api/render`.
