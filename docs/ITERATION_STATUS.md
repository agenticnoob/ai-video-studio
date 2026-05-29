# Iteration Status

Last updated: 2026-05-29

## Current stage

`ai-video-studio` is no longer a single-spec demo flow.

It now has the first segment-first project loop:
1. user writes a brief
2. page calls local mock `POST /api/generate`
3. API returns schema-validated `VideoProject`
4. page hydrates project-level draft state
5. full-video preview renders the assembled project
6. user selects a segment and edits it through a structured editing shell

## What is already implemented

### Product workflow UI
- `src/app/page.tsx` now uses project-level state instead of single `VideoSpec` state
- brief input + generate button
- loading state + error state
- primary full-video preview using `ProjectVideo`
- visible segment list for navigation
- selected-segment editing shell
- structured scene/theme editing preserved within the selected segment
- natural-language segment revision input shell is visible for future regeneration wiring

### Structured generation boundary
- `src/app/api/generate/route.ts`
- accepts a brief payload
- returns schema-validated `VideoProject` JSON
- current implementation is local deterministic mock generation
- temporary `spec` compatibility field still exists to avoid breaking older consumers during the migration window

### Project/domain model
- `src/lib/project-schema.ts` defines `VideoProject` and segment helpers
- `src/lib/project-generation.ts` builds normalized segment-based projects
- v1 supports `templateId: "scripted"` only

### Video runtime wiring
- `src/remotion/ProjectVideo/ProjectVideo.tsx` sequences project segments into one assembled composition
- `src/remotion/Root.tsx` registers both `ProjectVideo` and legacy `ScriptedVideo`
- `src/remotion/ScriptedVideo/*` remains the segment implementation path for the current template
- preview duration / fps / width / height are derived from the project metadata and segment helpers

## What is intentionally NOT done yet

These are still out of scope or not implemented yet:
- actual per-segment regeneration API behavior
- full-project regeneration beyond the initial generate flow
- final local render/export flow
- render job progress UX for end users
- real LLM/provider-backed generation
- project persistence / saved drafts / history
- multi-template product architecture
- browser automation acceptance

## Validation status

The current segment-first project loop passed through the repo Docker workflow:
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`

Recent milestone verification:
- Task 3 project-level composition passed `npm run build`
- Task 4 project-level page migration passed `npm run lint` and `npx tsc --noEmit`

## Important files for next iteration

- `src/app/page.tsx`
- `src/app/api/generate/route.ts`
- `src/lib/project-schema.ts`
- `src/lib/project-generation.ts`
- `src/remotion/ProjectVideo/ProjectVideo.tsx`
- `src/components/project/SegmentList.tsx`
- `src/components/project/SegmentEditor.tsx`
- `docs/PRODUCT_REQUIREMENTS.md`
- `docs/FUTURE_DIRECTION_NOTES.md`
- `docs/plans/2026-05-29-v1-segment-first-orchestrator.md`

## Recommended next milestone

Highest-priority next step:
- add segment-level natural-language regeneration and merge it back into the current project draft

Suggested order:
1. add a per-segment regeneration route/contract
2. regenerate only the selected segment from the revision prompt
3. preserve untouched segments while merging the regenerated segment back into current state
4. only after regeneration is stable, add final local render/export

## Notes for future Hermes/Codex work

- Keep `VideoProject` as the top-level page/generation/preview boundary for this phase.
- Keep `VideoSpec` as the per-segment implementation contract for the current scripted template.
- Do not widen scope into multi-template support before segment regeneration and single-template render/export are complete.
- Remove the temporary `/api/generate` `spec` compatibility field once no older consumer depends on it.
- Prefer repo-local artifacts for delegated workers when possible.
- On this workstation, browser automation is not the default validation path.
