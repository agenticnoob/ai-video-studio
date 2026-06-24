# API ROUTE KNOWLEDGE BASE

**Generated:** 2026-06-24 13:26:24 +0800

## OVERVIEW

`src/app/api` is the Next route surface for staged generation, TTS assets,
progress polling, local render export, and Remotion Lambda helpers. Routes are
thin adapters over `src/lib` contracts.

## WHERE TO LOOK

| Route | File | Notes |
| --- | --- | --- |
| Staged generation | `generate/staged/route.ts` | brief, plan, selected-segment modes. |
| Render export | `render/route.ts` | current edited `VideoProject` -> mp4 artifact. |
| Render download | `render/[renderId]/route.ts` | artifact status/download. |
| TTS synthesis | `tts/route.ts` | segment narration asset generation. |
| TTS assets | `tts/assets/[...assetPath]/route.ts` | byte-range artifact serving. |
| Voice references | `tts/voice-references/route.ts` | uploaded clone reference storage. |
| Progress | `progress/[progressId]/route.ts` | process-local task progress polling. |
| Lambda render | `lambda/render/route.ts` | Remotion Lambda integration surface. |

## CONVENTIONS

- Route handlers should stay thin: parse JSON, validate with Zod/lib schemas,
  call `src/lib`, map domain errors to HTTP responses.
- Export `runtime = "nodejs"` and `dynamic = "force-dynamic"` for heavy or
  filesystem-backed routes.
- Use `safeParse()` for request validation and return a 400 with the first
  meaningful issue.
- Use `runWithConcurrencyLimit()` for generation and render routes.
- Wire `progressId` through `task-progress` only for long-running work.
- Preserve domain-specific error mapping: busy -> 429, bad segment/request ->
  400, provider upstream -> 502, config/runtime -> 500.
- Keep route media URLs export-friendly; render-time route assets are resolved
  through the configured render asset origin.

## ANTI-PATTERNS

- Do not put planner/compiler/TTS/render business logic directly in route files.
- Do not bypass `VideoProject` and `StoryboardPlan` schemas at API boundaries.
- Do not make route handlers depend on client components or template runtimes.
- Do not read full audio assets into memory when streaming byte ranges works.
- Do not add durable job queues or persistence from these routes unless the
  requested scope explicitly changes the deployment model.

## VALIDATION

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-live'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:provider-boundary'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
```

For real user-facing route checks, ensure the expected Docker services are
running and choose contract-smoke F5 unless the host exposes an NVIDIA runtime.
