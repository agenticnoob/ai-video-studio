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

`ai-video-studio` already has the first usable segment-first editing loop:
- user writes a brief
- page calls local mock `POST /api/generate`
- API returns schema-validated `VideoProject`
- page hydrates project-level editable state
- assembled full-video preview renders live
- user can select a segment, edit its fields, and regenerate only that segment

This means the repo is past the upstream starter-demo stage.
Do not describe it as an untouched scaffold.

## Current highest-priority next milestone

Add final local render/export using the current edited `VideoProject`.

Keep the next iteration focused on:
1. trigger render from current edited project state
2. show render state
3. return stable output path or download entry
4. keep preview state and render payload aligned

## Important implementation files

- `src/app/page.tsx`
- `src/app/api/generate/route.ts`
- `src/lib/project-schema.ts`
- `src/lib/project-generation.ts`
- `src/remotion/ProjectVideo/ProjectVideo.tsx`
- `src/components/project/SegmentList.tsx`
- `src/components/project/SegmentEditor.tsx`
- `src/remotion/ScriptedVideo/*`
- `src/remotion/Root.tsx`

## Constraints / non-goals for the current product stage

Still not implemented unless the new task explicitly asks for them:
- real LLM/provider-backed generation
- saved drafts/history/project persistence
- multi-template product architecture
- browser automation acceptance

## Validation workflow

Prefer Docker-first validation from repo root:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run build'
```

## Notes for Hermes/Codex/OpenCode

- Keep `VideoProject` as the top-level page/generation/preview/render boundary for this phase.
- Keep `VideoSpec` as the per-segment implementation contract for the current scripted template.
- Prefer small bounded edits.
- Prefer repo-local artifacts for delegated workers when possible.
- Browser automation is not the default validation path on this workstation.
