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

## Current project stage

`ai-video-studio` already has a usable single-template, segment-first authoring loop:
- user writes a brief
- page calls local mock `POST /api/generate`
- API returns schema-validated `VideoProject`
- page hydrates project-level editable state
- assembled full-video preview renders live
- user can select a segment, edit its fields, and regenerate only that segment
- user can locally export the current edited project through `POST /api/render`
- successful export writes both a stable latest artifact and a unique artifact for that render

This repo is past the upstream starter-demo stage.
Do not describe it as an untouched scaffold.

## Current highest-priority next milestone

Replace the local deterministic generation mock with a real provider-backed generation path while preserving schema validation and the project-level edit loop.

Keep the next iteration focused on:
1. keep `VideoProject` as the generation contract
2. add provider-backed generation behind the existing request modes
3. preserve validation and bounded error handling
4. do not widen into persistence/history or multi-template work unless the task explicitly asks for it

## Important implementation files

- `src/app/page.tsx`
- `src/app/api/generate/route.ts`
- `src/app/api/render/route.ts`
- `src/app/api/render/latest/route.ts`
- `src/app/api/render/[renderId]/route.ts`
- `src/helpers/use-rendering.ts`
- `src/lib/render-project.ts`
- `src/lib/project-schema.ts`
- `src/lib/project-generation.ts`
- `src/remotion/ProjectVideo/ProjectVideo.tsx`
- `src/remotion/ScriptedVideo/*`
- `src/remotion/Root.tsx`

## Constraints / non-goals for the current product stage

Still not implemented unless the new task explicitly asks for them:
- real provider-backed generation
- saved drafts/history/project persistence
- multi-template product architecture
- browser automation acceptance
- end-user render progress UX beyond idle / rendering / success / failure

## Validation workflow

Prefer repo-local validation from repo root when Docker is not part of the task:

```bash
npm install
npm run lint
npx tsc --noEmit
npm run build
```

If the task explicitly asks for Docker verification, use the Docker wrappers documented in `README.md`.

## Notes for Hermes/Codex/OpenCode

- Keep `VideoProject` as the top-level page/generation/preview/render boundary for this phase.
- Keep `VideoSpec` as the per-segment implementation contract for the current scripted template.
- Prefer small bounded edits.
- Prefer repo-local artifacts for delegated workers when possible.
- Browser automation is not the default validation path on this workstation.
- `scripts/render.sh` still targets the sample/default composition render path; the current edited-project export path is the page action / `POST /api/render`.
