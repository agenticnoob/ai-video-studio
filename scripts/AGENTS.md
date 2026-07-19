# SCRIPTS KNOWLEDGE BASE

## OVERVIEW

`scripts` keeps public Producer wrappers at its root, deterministic runtimes in
`lib/`, fixtures in `fixtures/`, and responsibility-grouped checks in `smoke/`.
There is no supported Web route smoke surface.

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
| Reusable asset library | `lib/producer-asset-library/`, `producer-asset-library.mjs` | Agent-only SVG/PNG/JPEG/WebP management, semantic search, deterministic catalog/report, and atomic rollback. |
| Unified render | `lib/producer-render.ts`, `render-producer-sample.mjs` | Plans/runs MP4, metadata, and two code-rendered covers. |
| Post-render quality | `lib/producer-quality-*`, `validate-producer-quality.mjs` | Collects FFmpeg/ffprobe/Git evidence and rejects deterministic layout/review/artifact failures. |
| Repository layout | `smoke/architecture/repository-layout-smoke.mjs` | Guards tracked remnants, retained styling, grouped smokes/tools, and root pollution. |
| Remotion version gate | `smoke/architecture/remotion-version-gate-smoke.mjs` | Requires exact `4.0.489` for the complete installed Remotion closure and completed Phase 6 docs/inventory. |
| Remotion capabilities | `smoke/producer/remotion-capabilities-smoke.mjs` | Guards effects, text fitting, transitions, duration arithmetic, showcase sources, docs, and forbidden boundaries. |
| Capability fixture | `fixtures/remotion-capabilities/create-video-fixture.sh` | Creates one ignored FFmpeg-only local video for isolated canvas-effect review. |
| Media/sound fixture | `fixtures/producer-media-sound/create-fixtures.sh` | Creates ignored local PNG/GIF/video/BGM/ambience/SFX proof inputs. |
| Media/sound gate | `smoke/producer/producer-media-sound-smoke.mjs` | Guards Phase 7 packages, modules, proof ownership, deterministic helpers, docs, and forbidden boundaries. |
| Style-profile sample contract | `smoke/producer/producer-style-profile-sample-contract-smoke.mjs` | Guards mandatory profile selection for future scaffolds while preserving the Phase 7 proof. |
| Composition guards | `smoke/compositions/` | Frozen and dedicated-composition contract checks. |
| Architecture guards | `smoke/architecture/` | Product authority, Web-removal, version, skill, and layout checks. |

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
- Keep `.producer-assets/library-inbox/` user-owned and unchanged; library
  publication must validate in staging and roll back item/catalog/report bytes
  together.
- Keep every installed Remotion package at exact `4.0.489`, including
  transitions and light leaks; do not add overrides or a mixed closure.
- Keep capability and Phase 7 proof fixture media generated and ignored. Use
  `producer:assets` and `producer:preflight` before maintained stills.
- Require `producer:scaffold --style-profile <profile-id>` for every future
  maintained sample; never retrofit the completed Phase 7 proof.
- Keep `TcpHandshakeEditorial` and `TcpHandshakeTerminal` as the maintained
  Phase 8 profile proofs; their generated narration, assets, stills, covers,
  and MP4s stay ignored. Phase 8 is complete. Phase 9A quality gates are
  complete; Phase 9B final acceptance video and Roadmap closure are complete.
- Run `producer:quality -- --module <quality-module>` after render for every
  future scaffold; do not treat its result as aesthetic approval.

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
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run smoke:producer-quality-gates'
git diff --check
```
