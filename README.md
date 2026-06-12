# AI Video Studio

AI-first web app scaffold evolving into a prompt-to-video studio.

Goal:
- user enters a natural-language brief
- AI plans storyboard segments from the brief and registered template
  capabilities
- the system generates narration audio and aligned captions for each segment
- AI compiles each segment into structured template parameters using the real
  audio duration
- page shows live preview for tuning
- user tweaks copy, timing, colors, scenes, assets
- final render exports a video artifact

Project path:
- `/data/projects/labs/ai-video-studio`

Current base:
- official Remotion Next.js template (`create-video --next`)
- Docker-first runtime wrapper added on top
- no host-global npm / pnpm install required for the Docker path

Current implementation status:
- the segment-first editing workflow is implemented
- local project render/export is implemented
- `POST /api/generate` is now provider-backed (MiniMax / minimaxi.com) — see [MiniMax integration](#minimax-integration) below
- generation and rendering support registered segment templates (`scripted`
  and `spotlight`) while preserving one primary template per segment
- the current MiniMax generation path is a usable v1 shortcut; the
  authoritative final target is the staged planner -> narration synthesis ->
  audio + aligned captions -> template compiler pipeline documented in
  `docs/FINAL_PRODUCT_GOAL.md`
- the first storyboard-planning contract is in place as a server-safe schema,
  compact registered-template manifest, and internal MiniMax planner facade
- the first TTS asset boundary is in place for planned segments:
  `SegmentNarrationAsset`, internal `POST /api/tts`, local `out/tts/...`
  audio artifacts, sidecar `<audio-name>.captions.json` caption artifacts,
  `/api/tts/assets/...` serving with byte-range support, and ffprobe duration
  measurement
- generated TTS audio assets are served through streamed byte ranges with
  immutable artifact caching, and Remotion preview pauses the timeline while
  narration audio is buffering
- generated narration audio is attached to `VideoSegment.narration.audio` and
  flattened to the project timeline for preview/export; project-level
  narration media layers remain supported only as a transitional compatibility
  carrier
- the selected-template compiler and staged endpoint use planned segment
  narration, real TTS duration, and only the selected template schema/rules to
  compile template-specific `implementation`
- the page defaults to staged generation through `POST /api/generate/staged`
  and keeps the shipped v1 `POST /api/generate` shortcut available through a
  page-level toggle
- staged selected-segment regeneration reruns the target segment's planning,
  TTS, selected-template compilation, and segment-owned narration replacement
  while preserving non-target segments
- the main page has been split into a thin layout entry plus focused project
  generation, generation controls, and preview modules so the staged loop can
  keep growing without concentrating all logic in `src/app/page.tsx`
- staged API request validation/error classification and staged project
  assembly helpers are separated from route dispatch and pipeline orchestration
- in-app export resolves route media such as `/api/tts/assets/...` through the
  Next app origin before Remotion rendering so generated narration audio is
  included in the exported file
- roadmap decisions should use `docs/FINAL_PRODUCT_GOAL.md` as the top-level
  source
- current progress and next-step notes live in `docs/ITERATION_STATUS.md`
- product requirements live in `docs/PRODUCT_REQUIREMENTS.md`
- F5-TTS / aligned captions provider target lives in
  `docs/providers/f5-tts.md`
- F5-TTS local runtime service plan lives in
  `docs/providers/f5-tts-service-plan.md`
- implementation handoff for that slice lives in
  `docs/HANDOFF_F5_TTS_CAPTIONS.md`
- behavior-preserving structure refactor planning lives in
  `docs/STRUCTURE_REFACTOR_PLAN.md`
- handoff for the structure refactor lives in
  `docs/HANDOFF_STRUCTURE_REFACTOR.md`
- agent/new-task startup notes live in `AGENTS.md`

## Current product flow

1. user writes a brief
2. page calls `POST /api/generate/staged` by default, or `POST /api/generate`
   when the one-shot fallback is selected
3. API returns schema-validated `VideoProject`
4. page renders assembled preview via `ProjectVideo`
5. user edits a selected segment and can regenerate only that segment; staged
   regeneration reruns that segment's narration/TTS/template compile chain
6. user exports the current edited project through `POST /api/render`
7. successful render writes:
   - unique artifact: `out/renders/render-<timestamp>-<id>.mp4`
   - stable artifact: `out/renders/latest.mp4`
8. download routes:
   - unique artifact: `/api/render/[renderId]`
   - stable latest artifact: `/api/render/latest`

## Product direction

Current modeling direction:
- `VideoProject` is the top-level generation / preview / render boundary
- `VideoSegment` is the user-facing editing and regeneration unit
- one segment should have one primary template
- `templateId` determines the schema of `implementation`
- final generation should plan segments first, generate narration audio plus
  aligned captions per segment second, then compile the selected template's
  `implementation` from the real audio duration and segment visual brief
- `implementation` is template-specific; current registered templates are:
  - `scripted`: `VideoSpec` with internal `scenes`
  - `spotlight`: `SpotlightSpec` with `headline`, `subheadline`,
    `callouts`, and `durationInFrames`
- `VideoSpec.scenes` is specific to the current `scripted` template, not a universal field for all future templates
- generated narration audio should be carried outside template-specific
  `implementation` fields; the target home is segment-owned
  `VideoSegment.narration`, and the scripted scene schema no longer exposes an
  audio field to generation providers
- the in-project F5-TTS provider adapter is the preferred local narration path
  when `F5_TTS_BASE_URL` points at a running service
- the optional `f5-tts` Docker overlay provides a contract-smoke runtime and a
  real `F5_TTS_SERVICE_MODE=f5` runtime; the GPU overlay has been validated
  with the local checkpoint, vocab, and Vocos vocoder
- caption cues should be stored with segment narration data using segment-local
  timing, then rendered by shared project preview/export code
- F5-TTS can be selected with `TTS_PROVIDER=f5-tts` or by setting
  `F5_TTS_BASE_URL`; when F5 does not return alignment, the project normalizes
  deterministic punctuation-split fallback captions from narration text and
  real audio duration
- staged generation can optionally use page-level F5 voice cloning: upload a
  reference audio file, provide the exact reference text, and the same cloned
  voice is used for full-project generation and selected-segment regeneration
- F5 runtime setup and validation details live in
  `docs/providers/f5-tts-service-plan.md`
- future existing video, image, audio, or color inputs should be modeled as
  project-level or segment-level `media.layers[]` data; `baseLayer` is now a
  media-layer role, not a separate project field

Current top-level boundaries:
1. `/src/app/page.tsx`
   - prompt input
   - segment-first editor
   - full preview panel
   - local render/export actions
2. `/src/app/api/generate/route.ts`
   - MiniMax-backed project/segment generation
3. `/src/app/api/render/*`
   - local Remotion export for the current edited project
4. `/src/lib/project-schema.ts`
   - stable `VideoProject` contract used by generation, preview, and export
5. `/src/lib/storyboard-plan-schema.ts`
   - validated `StoryboardPlan` contract for the future planner stage
6. `/src/templates/*`
   - cohesive template modules with `schema`, server-safe `definition`,
     structured `capabilities`, optional block contracts, editor fields,
     runtime adapters, and bundle exports
7. `/src/templates/registry.ts`
   - derived server-safe template metadata registry used by schema validation
     MiniMax prompt/tool generation, and the planner template manifest
8. `/src/templates/registered-definitions.ts`
   - server-safe template definition registration source
9. `/src/templates/registered-bundles.ts`
   - runtime template bundle registration source
10. `/src/templates/component-registry.tsx`
   - runtime template registry used by the page editor and Remotion preview
11. `/src/lib/template-registry.ts`
   - compatibility re-export for existing code
12. `/src/remotion/*`
    - render video from structured props instead of ad-hoc codegen
    - reusable video primitives live under `src/remotion/primitives/` and may
      be composed by template-local block renderers

## Handoff for the next iteration

Start from:
- `docs/FINAL_PRODUCT_GOAL.md`
- `docs/ITERATION_STATUS.md`
- `docs/STRUCTURE_REFACTOR_PLAN.md` when the task is structural cleanup
- `docs/HANDOFF_STRUCTURE_REFACTOR.md` when handing structure cleanup to a new
  conversation or Subagent-Driven run
- `docs/PRODUCT_REQUIREMENTS.md`
- `docs/FUTURE_DIRECTION_NOTES.md`
- `README.md`

Current code checkpoint:
- active page generation defaults to `POST /api/generate/staged`
- fallback product route: `POST /api/generate` still returns a validated
  one-shot `VideoProject`
- staged-generation groundwork: `StoryboardPlan` schema, planner manifest, and
  internal MiniMax planner facade are implemented
- TTS groundwork: internal `POST /api/tts` can generate and serve a
  `SegmentNarrationAsset` for one planned segment when MiniMax TTS is
  configured
- selected-template compiler groundwork: internal compiler functions and
  `POST /api/generate/staged` can assemble a staged project
- staged selected-segment regeneration is wired for the active page path
- page generation state now lives under `src/helpers/project-generation/`;
  `src/helpers/use-project-generation.ts` remains a compatibility export, with
  `GenerationPanel` and `PreviewPanel` handling the corresponding UI sections
- staged route request parsing/error classification lives in
  `src/lib/staged-generation-api.ts`; staged pipeline orchestration,
  one-segment narration/compile work, diagnostics, assembly, and
  selected-segment replacement helpers live under `src/lib/staged-generation/`
  with old staged module paths kept as compatibility re-exports
- route media export hardening is in place for generated narration audio
- basic bounded planner repair is in place for invalid `StoryboardPlan`
  output
- deterministic staged smoke fixtures cover a mixed `scripted` + `spotlight`
  project with segment-owned narration audio/captions and selected-segment
  narration/caption replacement;
  Remotion Studio exposes the current fixture as
  `StagedSmokeMixedTemplateProject`
- optional local F5 runtime service is implemented with contract-smoke and
  real GPU-backed `F5_TTS_SERVICE_MODE=f5` modes
- real F5 validation has passed direct service smoke, Next `/api/tts` adapter
  smoke, deterministic staged mixed-template smoke, and deterministic staged
  export smoke
- not implemented yet: persistence/history and broad media-layer editing

Best next bounded slice:
- keep `VideoProject` as the preview/edit/export boundary
- use `StoryboardPlan` as the planner-stage contract
- continue from `VideoSegment.narration` as the target home for generated
  narration text, audio metadata, and segment-local caption cues
- behavior-preserving structure cleanup now has dedicated module boundaries for
  staged generation, TTS/F5 provider selection and fallback, frontend
  generation state, Remotion timeline flattening, and smoke entrypoints
- use `npm run smoke:staged-live` for the provider-backed
  `POST /api/generate/staged` live smoke that combines MiniMax
  planner/compiler with real F5 narration; it skips when required credentials
  are missing
- avoid persistence/history, generic media-layer compositing, and
  multi-template-per-segment orchestration unless explicitly reopened

## Docker usage

Prereqs:
- Docker installed and running
- no host Node.js package installation needed

Start Next.js app:
```bash
cd /data/projects/labs/ai-video-studio
./scripts/dev.sh
```
Then open:
- http://localhost:3000

The Docker Compose `web` and `studio` services use
`restart: unless-stopped`, so local containers can survive workstation restarts
until they are explicitly stopped with `docker compose down` or equivalent.
Next dev requests are allowed from `localhost`, the configured LAN origins, and
`ez.zzzxc.com`.

The Docker startup path runs `npm run remotion:ensure-browser` before starting
the app. This checks for Remotion's Chrome Headless Shell and downloads it
upfront when missing, so the first in-app video export does not block on the
browser dependency download.

Start Remotion Studio:
```bash
cd /data/projects/labs/ai-video-studio
./scripts/studio.sh
```
Then open:
- http://localhost:3001

Preview the local Remotion primitive catalog in the app:
- http://localhost:3000/primitives

Remotion Studio is kept for full-video and template-level compositions. The
primitive catalog uses the app page above so small reusable components do not
crowd the Studio composition list.

Render the default/sample composition to `out/ai-video.mp4`:
```bash
cd /data/projects/labs/ai-video-studio
./scripts/render.sh
```

List Remotion compositions and load the deterministic staged smoke fixtures:
```bash
cd /data/projects/labs/ai-video-studio
docker compose run --rm web npm run smoke:staged-fixtures
```

Start the optional F5-TTS contract-smoke runtime:
```bash
cd /data/projects/labs/ai-video-studio
docker compose -f docker-compose.yml -f docker-compose.f5.yml up -d f5-tts
scripts/f5-tts-smoke.sh
```

This does not download F5 model checkpoints. It only verifies the local HTTP
contract consumed by the Next.js F5 adapter.

Validate the Next-side F5 adapter and generated TTS asset route:
```bash
cd /data/projects/labs/ai-video-studio
docker compose -f docker-compose.yml -f docker-compose.f5.yml up -d web
scripts/f5-tts-next-smoke.sh
```

This smoke calls `POST /api/tts`, writes a local `out/tts/...` artifact through
the existing adapter, and verifies `/api/tts/assets/...` byte-range serving.
It still uses contract-smoke audio, not a downloaded F5 model.

Validate a deterministic staged project using F5 narration assets:
```bash
cd /data/projects/labs/ai-video-studio
docker compose -f docker-compose.yml -f docker-compose.f5.yml up -d web
npm run smoke:f5-staged
```

This smoke avoids MiniMax planner/compiler calls. It uses a fixed two-segment
storyboard plan, generates each segment's narration through `POST /api/tts`,
assembles a schema-compatible `VideoProject`, and checks byte-range serving for
each generated narration asset. To also export the assembled project through
`POST /api/render`, run:

```bash
F5_TTS_STAGED_SMOKE_RENDER=true npm run smoke:f5-staged
```

Validate the live staged route with MiniMax planner/compiler plus F5
narration:

```bash
npm run smoke:staged-live
```

This command calls `POST /api/generate/staged`, checks segment-owned narration
audio and captions, validates diagnostics, and verifies byte-range serving for
generated `/api/tts/assets/...` audio. It exits successfully with a skip
message when `MINIMAX_API_KEY` or `F5_TTS_BASE_URL` is missing. To also export
the generated project through `POST /api/render`, run:

```bash
npm run smoke:staged-live:render
```

Run the real F5 runtime on GPU when the host NVIDIA driver/runtime is
available:

```bash
cd /data/projects/labs/ai-video-studio
scripts/f5-tts-real.sh up-build
scripts/f5-tts-smoke.sh
```

`scripts/f5-tts-real.sh` applies `docker-compose.f5.gpu.yml`, rebuilds only the
`f5-tts` image when requested, and recreates only the `f5-tts` container. The
helper forces `F5_TTS_SERVICE_MODE=f5`, defaults `F5_TTS_DEVICE=cuda`, and the
GPU overlay requests all visible GPUs. It still requires the local F5
checkpoint, vocab, and Vocos vocoder under `models/f5-tts/`.

Do not use the plain `docker-compose.f5.yml` overlay for user-facing F5
narration checks. That overlay intentionally defaults to `contract-smoke`;
that mode returns synthetic contract-test audio and can sound like a continuous
beep instead of real F5 narration.

On this workstation the GPU path has been validated with:
- direct service smoke: `F5_TTS_BASE_URL=http://127.0.0.1:7865 scripts/f5-tts-smoke.sh`
- Next adapter smoke: `NEXT_ORIGIN=http://127.0.0.1:3000 scripts/f5-tts-next-smoke.sh`
- staged assembly smoke: `docker compose -f docker-compose.yml -f docker-compose.f5.yml -f docker-compose.f5.gpu.yml exec -T web npm run smoke:f5-staged`
- staged export smoke: `docker compose -f docker-compose.yml -f docker-compose.f5.yml -f docker-compose.f5.gpu.yml exec -T web bash -lc 'F5_TTS_STAGED_SMOKE_RENDER=true npm run smoke:f5-staged'`
- live staged route smoke: `docker compose -f docker-compose.yml -f docker-compose.f5.yml -f docker-compose.f5.gpu.yml exec -T web npm run smoke:staged-live`

If `F5_TTS_DEFAULT_REFERENCE_AUDIO` is unset, the service uses the default
English reference WAV bundled with `f5-tts` plus the upstream example reference
text. For a custom voice, set both `F5_TTS_DEFAULT_REFERENCE_AUDIO` and
`F5_TTS_DEFAULT_REFERENCE_TEXT`.

The page also exposes F5 voice cloning for staged generation. Enable
`声音克隆`, upload a `.wav`, `.mp3`, `.m4a`, or `.aac` reference file, and
enter the transcript that matches the reference audio before generation. The
Next app stores the uploaded reference under ignored `out/voice-references/`;
the F5 overlay mounts that directory read-only at `/voice-references`. When
cloning is disabled, staged generation falls back to the configured default F5
voice/reference behavior.

Important distinction:
- `./scripts/render.sh` is still the default/sample composition render path from the Docker wrapper
- current edited-project export is the in-app action / `POST /api/render`
- the edited-project export writes `out/renders/latest.mp4` plus a unique `out/renders/render-*.mp4`
- generated route media such as `/api/tts/assets/...` is converted to an
  absolute Next app URL for Remotion export. Override the default
  `http://127.0.0.1:3000` with `AI_VIDEO_STUDIO_RENDER_ASSET_ORIGIN` when the
  renderer needs a different origin.

Stop containers:
```bash
cd /data/projects/labs/ai-video-studio
docker compose down
```

## Docker-first validation

This workstation uses Docker-first validation. Do not rely on host
`node_modules`.
```bash
cd /data/projects/labs/ai-video-studio
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run build'
```

Code quality entry points:
- `npm run lint`: ESLint for Next.js, TypeScript, and Remotion code.
- `npm run typecheck`: TypeScript compile check without emitting files.
- `npm run format:check`: Prettier style check.
- `npm run style:check`: lint + typecheck + format check.
- `npm run check`: style check + production build.

Run these through Docker on this workstation, for example:
```bash
cd /data/projects/labs/ai-video-studio
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run check'
```

## Docker files added
- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`
- `scripts/dev.sh`
- `scripts/studio.sh`
- `scripts/render.sh`

## Local configuration

Use one local config file:

```bash
cp .env.example .env
```

`.env.example` is the only tracked template. `.env` is ignored by Git and is
used for both Docker Compose interpolation and Next/provider runtime config.
Older `.env.local` files are still tolerated by Next.js, but new local setup
should prefer `.env` so Docker ports, provider credentials, TTS settings, and
render origins are managed in one place.

## Notes
- `node_modules` is intended to live in the Docker volume path on this workstation.
- output files are written under `/data/projects/labs/ai-video-studio/out`.
- the official scaffold created a nested `.git/` repo in this directory.
- the app is no longer the upstream starter UI; the current studio path already supports brief -> project generation -> full preview -> selected-segment editing -> selected-segment regeneration -> local export.
- Docker render images now include Noto CJK fonts for Chinese-first content.

## MiniMax integration

`POST /api/generate` is now backed by [MiniMax](https://api.minimaxi.com/v1) (minimaxi.com) Chat Completions. The `VideoProject` schema contract is unchanged — the provider is responsible for receiving the brief / current project and emitting a schema-validating JSON object. Each returned segment must choose one registered `templateId`, and its `implementation` must match that template-specific schema.

### Environment variables

Add to `.env` (see `.env.example`):

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `MINIMAX_API_KEY` | yes | — | Bearer token for `https://api.minimaxi.com/v1/text/chatcompletion_v2`. |
| `MINIMAX_MODEL` | no | `MiniMax-M2.7-highspeed` | The `model` field sent on every request. Must be read from `process.env`, never hard-coded. |
| `MINIMAX_BASE_URL` | no | `https://api.minimaxi.com/v1` | Override only for testing against a self-hosted gateway. |

MiniMax TTS uses the same `MINIMAX_API_KEY`. Optional TTS-specific variables:

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `MINIMAX_GROUP_ID` | account-dependent | — | Added as `GroupId` query param for MiniMax speech deployments that require it. |
| `MINIMAX_TTS_ENDPOINT` | no | `${MINIMAX_BASE_URL}/t2a_v2` | Full TTS endpoint override. Use this if your speech endpoint differs from the chat base URL. |
| `MINIMAX_TTS_MODEL` | no | `speech-2.8-turbo` | Speech model used by `POST /api/tts`. |
| `MINIMAX_TTS_VOICE_ID` | no | `male-qn-qingse` | Default voice for planned segment narration. |
| `MINIMAX_TTS_EMOTION` | no | — | Optional MiniMax voice emotion for speech-2.8 models. |
| `MINIMAX_TTS_SAMPLE_RATE` | no | `32000` | Requested audio sample rate. |
| `MINIMAX_TTS_BITRATE` | no | `128000` | Requested audio bitrate. |
| `MINIMAX_TTS_CHANNEL` | no | `1` | Requested channel count, `1` or `2`. |

Local render/export also supports:

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `AI_VIDEO_STUDIO_RENDER_ASSET_ORIGIN` | no | `http://127.0.0.1:3000` | Origin used by `/api/render` to resolve route media such as generated TTS audio during Remotion export. |

### What happens if the key is missing

The provider throws `MinimaxConfigError("MINIMAX_API_KEY is not configured. Set it in .env to enable real generation.")` on the first call, and `POST /api/generate` translates that into a `500` with the same message in the `error` field. The UI surfaces it as the generation error state — there is no silent mock fallback to the local mock anymore.

### Failure → HTTP status mapping

| Failure | HTTP |
|---|---|
| `MINIMAX_API_KEY` missing or empty | 500 |
| Network error / upstream non-2xx (4xx, 5xx) | 502 |
| Upstream returns non-JSON | 502 |
| Tool call missing, wrong function, empty arguments, or `finish_reason=length` | 502 |
| Response is JSON but fails `videoProjectSchema` | 500 |
| Invalid request body / unknown mode | 400 |

### Docker-first verification

```bash
cd /data/projects/labs/ai-video-studio
./scripts/dev.sh
```

Then smoke test the missing-key path from another terminal (returns 500):

```bash
cd /data/projects/labs/ai-video-studio
# ensure .env does NOT export MINIMAX_API_KEY
curl -s -X POST http://127.0.0.1:3000/api/generate \
  -H 'content-type: application/json' \
  -d '{"mode":"project","brief":"hello world"}'
# -> {"error":"MINIMAX_API_KEY is not configured. Set it in .env to enable real generation."} (status 500)
```

Run static validation inside Docker on this workstation; host `node_modules`
is not the default validation target.

Current MiniMax implementation notes live in [`docs/providers/minimax.md`](docs/providers/minimax.md).
