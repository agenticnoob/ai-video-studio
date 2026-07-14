# SCRIPTS KNOWLEDGE BASE

**Generated:** 2026-07-13 16:00:00 +0800

## OVERVIEW

`scripts` contains Docker workflow wrappers and focused smoke checks. Treat
these as the repo's practical CI surface because this checkout has no GitHub
Actions workflow.

## WHERE TO LOOK

| Task | Script | Notes |
| --- | --- | --- |
| Next dev | `dev.sh` | Docker `web` service. |
| Remotion Studio | `studio.sh` | Docker `studio` service on port 3001. |
| Sample render | `render.sh` | Default/sample composition path only. |
| Metadata-bundled render | `render-video.sh` | Render mp4 + JSON metadata to `out/<slug>/`. |
| Prod start | `prod.sh`, `prod-build.sh` | Requires `.env.prod`; uses `web-prod`. |
| Remotion browser | `ensure-remotion-browser.mjs` | Container startup preflight. |
| Real F5 runtime | `f5-tts-real.sh` | GPU overlay and real model mode. |
| TTS: HermesInnerLandscape | `generate-hermes-tts.mjs` | VoxCPM voice-design per-scene TTS for 6-scene AI consciousness video. |
| TTS: RawThoughtMirror v1 | `generate-raw-thought-tts.mjs` | VoxCPM voice-design per-scene TTS for raw-thought monologue v1. |
| TTS: RawThoughtMirror v2 | `generate-raw-thought-tts-v2.mjs` | VoxCPM LYY voice-clone per-scene TTS for cinematic v2. |
| TTS: AiConceptsRedefined | `generate-ai-concepts-redefined-tts.mjs` | VoxCPM LYY voice-clone per-scene TTS for 41-scene conceptual explainer. |
| TTS: AiDailyNews20260714 | `generate-ai-daily-news-20260714-tts-clone.mjs` | VoxCPM LYY voice-clone per-scene TTS for 8-scene daily news briefing. |
| F5 smoke | `f5-tts-smoke.sh`, `f5-tts-next-smoke.sh`, `f5-tts-staged-smoke.mjs` | Direct, Next adapter, staged checks. |
| Staged live | `staged-live-smoke.mjs` | `/api/generate/staged` route check. |
| Planner/draft smokes | `planner-recipe-manifest-smoke.mjs`, `storyboard-*.mjs` | Boundary regressions. |
| Recipe smokes | `recipe-*.mjs`, `technical-explainer-template-smoke.mjs` | Visual recipe/template checks. |

## CONVENTIONS

- Keep wrapper scripts Docker-first; do not assume host `node_modules`.
- Node smoke scripts should be deterministic and focused on one contract.
- Temporary smoke build output belongs under `/tmp`, not the repo tree.
- Keep `npm run smoke:*` names in `package.json` aligned with script names.
- Source-level smoke checks may assert forbidden snippets when they guard a
  real product boundary.
- Route-level smokes should make runtime/environment assumptions explicit.
- Use contract-smoke F5 mode for route checks unless real GPU mode is the task.

## ANTI-PATTERNS

- Do not make `scripts/render.sh` look like the edited-project export path.
- Do not download private model artifacts or reference voices from scripts by
  default.
- Do not bake secrets, tokens, or workstation-local absolute secrets into
  scripts.
- Do not add broad cleanup commands that can remove user artifacts outside
  `/tmp` without explicit approval.
- Do not make smoke scripts mutate source files.

## VALIDATION

For script-only edits, run the script's narrow path when possible plus syntax
checks. For shell wrapper edits, prefer a dry inspection unless starting
services is the requested behavior.

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:technical-explainer-template'
git diff --check
```
