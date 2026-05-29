# Iteration Status

Last updated: 2026-05-27

## Current stage

`ai-video-studio` is no longer just the upstream Remotion/Next starter demo.

It now has a first-pass product workflow for the minimal loop:
1. user writes a brief
2. page calls local mock `POST /api/generate`
3. API returns schema-validated `VideoSpec`
4. page hydrates editable state from the response
5. Remotion Player previews the edited result live

## What is already implemented

### Product workflow UI
- `src/app/page.tsx` is now a single workflow studio page
- brief input + generate button
- loading state + error state
- editable meta fields
- editable theme fields
- editable scene content fields
- live preview bound to current edited `VideoSpec`

### Structured generation boundary
- `src/app/api/generate/route.ts`
- accepts a brief payload
- returns schema-validated `VideoSpec` JSON
- current implementation is local deterministic mock generation

### Video runtime wiring
- `src/remotion/ScriptedVideo/*` is the current primary preview path
- `src/remotion/Root.tsx` includes the `ScriptedVideo` composition registration
- preview duration / fps / width / height are derived from the current spec

## What is intentionally NOT done yet

These are still out of scope for the current iteration:
- final local render/export flow
- render job progress UX for end users
- real LLM/provider-backed generation
- project persistence / saved drafts / history
- multi-template product architecture
- browser automation acceptance

## Validation status

The current first-pass workflow passed:
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`

Validation was executed through the repo Docker workflow.

## Important files for next iteration

- `src/app/page.tsx`
- `src/app/api/generate/route.ts`
- `src/lib/mock-spec.ts`
- `src/lib/video-schema.ts`
- `src/remotion/ScriptedVideo/*`
- `src/remotion/Root.tsx`
- `docs/PRODUCT_REQUIREMENTS.md`
- `docs/PRODUCT_ARCHITECTURE.md`
- `docs/FUTURE_DIRECTION_NOTES.md`

## Recommended next milestone

Highest-priority next step:
- add final local render/export using the current edited `VideoSpec`

Suggested order:
1. trigger render from current edited spec
2. show render state: idle / rendering / success / failure
3. return stable output path or download entry
4. keep preview-state and render-payload aligned

## Notes for future Hermes/Codex work

- Keep `VideoSpec` as the contract boundary between generation, editing, preview, and future render/export.
- Do not widen scope into multi-template support before single-template render/export is complete.
- Prefer repo-local artifacts for delegated workers when possible.
- On this workstation, browser automation is not the default validation path.
