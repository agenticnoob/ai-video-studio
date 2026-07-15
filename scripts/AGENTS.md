# SCRIPTS KNOWLEDGE BASE

## OVERVIEW

`scripts` contains the Docker Producer wrappers, direct VoxCPM runtime,
deterministic validation/review tooling, retained frozen-composition smokes,
and architecture guards. There is no supported Web route smoke surface.

## WHERE TO LOOK

| Task | Script | Notes |
| --- | --- | --- |
| Remotion Studio | `studio.sh` | Starts Docker `producer` on `STUDIO_PORT`. |
| Metadata render | `render-video.sh` | Renders MP4 + JSON under ignored `out/<slug>/`. |
| Remotion browser | `ensure-remotion-browser.mjs` | Container browser preflight. |
| Direct narration | `lib/producer-audio/` | VoxCPM-only request, WAV, caption, and recovery runtime. |
| VoxCPM container access | `producer-voxcpm.sh` | `ready`, direct `run`, and `status`; no app server. |
| Producer validation | `lib/producer-validation.ts` | Hard-failure manifest/composition checks. |
| Review frames | `lib/producer-review-frames.ts` | Deterministic frame planning. |
| Architecture guards | `agent-producer-*-smoke.mjs`, `skill-alignment-smoke.mjs` | Product boundary checks. |

Older composition-specific generators and smokes are frozen maintenance
references. Do not use them as future Producer scaffolds.

## CONVENTIONS

- Keep wrappers Docker-first with the `producer` service.
- Probe `node_modules/remotion`, not removed Web dependencies.
- Node smoke scripts should be deterministic and focused on one contract.
- Temporary smoke build output belongs under `/tmp`.
- Keep package smoke names aligned with maintained script files.
- Direct VoxCPM runtime failures must fail closed without a provider fallback.
- Keep private voices and generated media out of source control.

## ANTI-PATTERNS

- Do not restore Next routes, planner/template smokes, or Web TTS adapters.
- Do not download private model artifacts or voices by default.
- Do not bake secrets or workstation-local absolute paths into scripts.
- Do not add broad cleanup commands outside `/tmp`.
- Do not make smoke scripts mutate source files.

## VALIDATION

```bash
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run smoke:agent-producer-web-removal'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run smoke:producer-audio-tools'
git diff --check
```
