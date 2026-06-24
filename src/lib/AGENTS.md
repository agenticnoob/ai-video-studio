# SRC/LIB KNOWLEDGE BASE

**Generated:** 2026-06-24 13:26:24 +0800

## OVERVIEW

`src/lib` owns the source-of-truth domain contracts and server utilities:
`VideoProject`, storyboard planning, staged generation, TTS/captions,
render/export support, progress tracking, and heavy-task concurrency guards.

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Project contract | `project-schema.ts` | `VideoProject`, `VideoSegment`, duration normalization. |
| Timeline flattening | `project-timeline.ts` | Segment windows, narration, captions, media layers. |
| Storyboard contract | `storyboard-plan-schema.ts` | Strict internal `StoryboardPlan`. |
| Provider draft contract | `storyboard-plan-draft-schema.ts` | Looser provider-facing payload. |
| Draft compile | `storyboard-plan-draft-compiler.ts` | Deterministic draft -> strict plan. |
| DeepSeek boundary | `deepseek/` | Planner/compiler prompts and JSON parsing. |
| Staged orchestration | `staged-generation/` | Brief/plan/segment pipeline. |
| API request schemas | `staged-generation-api.ts`, `tts/request-schema.ts` | Route-safe validation. |
| TTS artifacts | `tts/` | F5 provider adapter, captions, audio artifacts. |
| Render/export | `render-project.ts` | Remotion bundle/render and asset-origin rewrite. |
| Heavy task guard | `concurrency-limits.ts` | Generation/render/TTS process-local limits. |
| Smoke fixtures | `staged-smoke-fixtures.ts` | Deterministic baseline projects/plans. |

## CONVENTIONS

- Zod schemas define the boundary. Parse external/provider/API input before it
  crosses into pipeline logic.
- Keep `StoryboardPlan` strict. Provider drift belongs in the draft schema,
  parser, or deterministic compiler, not in broad JSON repair.
- Preserve segment-owned narration: audio and captions belong under
  `VideoSegment.narration`.
- Real audio duration is the timing anchor for template compilation.
- Keep bounded repair diagnostics visible; do not hide planner/compiler repair
  behind a generic success path.
- Keep non-target segments unchanged during selected-segment regeneration.
- Treat project-level narration media layers as compatibility carriers only.
- Use `runWithConcurrencyLimit()` around generation, render, and TTS heavy work.

## ANTI-PATTERNS

- Do not add arbitrary remote media URLs, generated TSX execution, persistence,
  or a durable queue from this layer without an explicit milestone.
- Do not push template runtime imports into schemas, provider prompts, or API
  validation modules.
- Do not encode template-specific scene fields as universal project fields.
- Do not move captions into a separate LLM subtitle-generation stage.
- Do not weaken strict schema validation to accept provider mistakes silently.

## VALIDATION

Use the smallest smoke covering the changed contract:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:storyboard-plan-draft'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:storyboard-recipe-hints'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:provider-boundary'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
```
