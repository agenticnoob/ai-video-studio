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
| Sample scaffold | `producer-scaffold.mjs` | Creates the strict maintained future source skeleton. |
| Asset supply | `lib/producer-assets/`, `producer-assets.mjs` | Localizes manual/URL media, checksums, probes, and normalizes. |
| Asset preflight | `preflight-producer-assets.mjs` | Fails before maintained still/render jobs on invalid assets. |
| Unified render | `lib/producer-render.ts`, `render-producer-sample.mjs` | Plans/runs MP4, metadata, and two code-rendered covers. |
| Remotion version gate | `remotion-version-gate-smoke.mjs` | Requires exact `4.0.489` for the complete installed Remotion closure and completed Phase 6 docs/inventory. |
| Remotion capabilities | `remotion-capabilities-smoke.mjs` | Guards effects, text fitting, transitions, duration arithmetic, showcase sources, docs, and forbidden boundaries. |
| Capability fixture | `fixtures/remotion-capabilities/create-video-fixture.sh` | Creates one ignored FFmpeg-only local video for isolated canvas-effect review. |
| Media/sound fixture | `fixtures/producer-media-sound/create-fixtures.sh` | Creates ignored local PNG/GIF/video/BGM/ambience/SFX proof inputs. |
| Media/sound gate | `producer-media-sound-smoke.mjs` | Guards Phase 7 packages, modules, proof ownership, deterministic helpers, docs, and forbidden boundaries. |
| Style-profile sample contract | `producer-style-profile-sample-contract-smoke.mjs` | Guards mandatory profile selection for future scaffolds while preserving the Phase 7 proof. |
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
- Treat registry entries marked `frozen-reference` as discovery metadata only.
- Keep `ProducerAssetManifest` output deterministic and free of private source paths.
- Keep every installed Remotion package at exact `4.0.489`, including
  transitions and light leaks; do not add overrides or a mixed closure.
- Keep capability and Phase 7 proof fixture media generated and ignored. Use
  `producer:assets` and `producer:preflight` before maintained stills.
- Require `producer:scaffold --style-profile <profile-id>` for every future
  maintained sample; never retrofit the completed Phase 7 proof.

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
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run smoke:producer-assets'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run smoke:remotion-version-gate'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run smoke:remotion-capabilities'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run smoke:producer-media-sound'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run smoke:producer-style-profile-sample-contract'
git diff --check
```
