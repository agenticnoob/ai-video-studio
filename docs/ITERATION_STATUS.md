# Iteration Status

Last updated: 2026-06-02

## Current stage

`ai-video-studio` now has a closed local v1 authoring loop for the single-template, segment-first workflow.

Current working flow:
1. user writes a brief
2. page calls local mock `POST /api/generate`
3. API returns schema-validated `VideoProject`
4. page hydrates project-level editable state
5. assembled full-video preview renders the normalized project
6. user selects a segment and edits / regenerates only that segment
7. user clicks local export to render the current edited `VideoProject`
8. server writes both:
   - stable artifact: `out/renders/latest.mp4`
   - unique artifact for this render: `out/renders/render-<timestamp>-<id>.mp4`
9. UI returns render state plus both download entries:
   - stable: `GET /api/render/latest`
   - unique: `GET /api/render/[renderId]`

## What is already implemented

### Product workflow UI
- `src/app/page.tsx` uses project-level state instead of single `VideoSpec` state
- Chinese-first main page copy for the current studio path
- brief input + generate button
- loading state + error state
- primary full-video preview using `ProjectVideo`
- visible segment list for navigation
- selected-segment editing shell
- structured scene/theme editing preserved within the selected segment
- working segment regeneration action from the revision prompt
- local render/export controls for the current edited project
- render success state now exposes both the stable latest artifact and the unique artifact for that render

### Structured generation boundary
- `src/app/api/generate/route.ts`
- supports two request modes:
  - full project generation from brief
  - selected segment regeneration from current project + segment id + revision prompt
- returns schema-validated `VideoProject` JSON
- current implementation is local deterministic mock generation
- temporary `spec` compatibility field still exists to avoid breaking older consumers during the migration window

### Local render/export boundary
- `src/app/api/render/route.ts` accepts the normalized current `VideoProject` and performs local Remotion render
- `src/lib/render-project.ts` renders `ProjectVideo`, creates a unique render artifact, and refreshes `latest.mp4`
- `src/app/api/render/latest/route.ts` serves the stable latest artifact
- `src/app/api/render/[renderId]/route.ts` serves the unique artifact for one successful export
- `src/helpers/use-rendering.ts` resets stale render attempts safely so the UI does not stay stuck in `rendering`

### Video runtime wiring
- `src/remotion/ProjectVideo/ProjectVideo.tsx` sequences project segments into one assembled composition
- `src/remotion/Root.tsx` registers both `ProjectVideo` and legacy `ScriptedVideo`
- `src/remotion/ScriptedVideo/*` remains the segment implementation path for the current template
- preview duration / fps / width / height are derived from the project metadata and segment helpers
- Remotion text rendering now prefers a CJK-capable sans stack for Chinese-first content

### Docker/runtime support
- `Dockerfile` installs `fonts-noto-cjk` and `fonts-noto-cjk-extra` in addition to the existing browser/render dependencies
- `scripts/render.sh` still targets the default/sample composition render path
- current edited-project export path is the page action / `POST /api/render`, not `scripts/render.sh`

## What is intentionally NOT done yet

These are still out of scope or not implemented yet:
- full-project regeneration UX beyond the current initial generate flow
- render job progress UX for end users
- cancellation/progress history for finished renders
- real LLM/provider-backed generation
- project persistence / saved drafts / history
- multi-template product architecture
- browser automation acceptance

## Validation status

Latest repo-local verification after the second render/export fix pass:
- `npm install`
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`

Latest Docker dev verification after the LAN-access + studio recovery pass:
- `docker logs ai-video-studio-web-1` confirmed the prior HMR failure was `allowedDevOrigins` blocking `192.168.50.6`
- `next.config.js` now allows both `192.168.31.6` and `192.168.50.6`
- `docker logs ai-video-studio-studio-1` confirmed the prior blank-page path came from a stale image/container missing browser shared libs (`libnspr4.so`) even though the repo Dockerfile already declared them
- `docker compose build web studio` rebuilt `ai-video-studio:local` from the current Dockerfile
- `docker compose up -d --force-recreate web studio` recreated both services
- `curl http://127.0.0.1:3000/` returned `200`
- `curl http://127.0.0.1:3001/` returned `200`
- `curl http://192.168.50.6:3000/` returned `200`
- `curl http://192.168.50.6:3001/` returned `200`
- `http://192.168.50.6:3001/bundle.js.map` now exposes 928 bundled sources (previous bad runtime-only bundle state is gone)

## Important files for the current stage

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
- `src/remotion/ScriptedVideo/SceneRenderer.tsx`
- `src/components/project/SegmentList.tsx`
- `src/components/project/SegmentEditor.tsx`
- `src/components/RenderControls.tsx`
- `docs/PRODUCT_REQUIREMENTS.md`
- `docs/FUTURE_DIRECTION_NOTES.md`
- `docs/plans/2026-05-29-v1-segment-first-orchestrator.md`

## Recommended next milestone

Highest-priority next step:
- replace the local deterministic `POST /api/generate` mock with a real provider-backed generation path while preserving schema validation and the project-level edit loop

Suggested order:
1. keep `VideoProject` as the generation contract
2. add provider integration behind the existing request modes
3. preserve schema validation + deterministic fallback/error handling
4. only then widen into persistence/history or multi-template work

## Notes for future Hermes/Codex work

- Keep `VideoProject` as the top-level page/generation/preview/render boundary for this phase.
- Keep `VideoSpec` as the per-segment implementation contract for the current scripted template.
- Do not widen scope into multi-template support before the generation path is no longer mock-only.
- Remove the temporary `/api/generate` `spec` compatibility field once no older consumer depends on it.
- Prefer repo-local artifacts for delegated workers when possible.
- On this workstation, browser automation is not the default validation path.
