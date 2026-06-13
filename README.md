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
- generation and rendering support registered segment templates (`scripted`,
  `spotlight`, and `stats-dashboard`) while preserving one primary template per
  segment
- the active generation path is the staged planner -> narration synthesis ->
  audio + aligned captions -> template compiler pipeline documented in
  `docs/FINAL_PRODUCT_GOAL.md`
- the first storyboard-planning contract is in place as a server-safe schema,
  compact registered-template manifest, and internal MiniMax planner facade
- the first TTS asset boundary is in place for planned segments:
  `SegmentNarrationAsset`, internal `POST /api/tts`, local TTS audio artifacts
  under `AI_VIDEO_STUDIO_ARTIFACT_ROOT/tts`, sidecar
  `<audio-name>.captions.json` caption artifacts, `/api/tts/assets/...`
  serving with byte-range support, and ffprobe duration measurement
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
- the page uses `POST /api/generate/staged` for project generation and
  selected-segment regeneration
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
- generation and local export requests can attach a client `progressId`; the
  Next process records backend task nodes in memory and the page polls
  `/api/progress/[progressId]` while the request runs
- the main workspace UI now uses the two-color product palette, separates the
  whole-video export workspace from the segment editor, uses a horizontal
  drag-scroll segment strip, keeps the selected-segment form compact, and now
  restores explicit card hierarchy through a shared reusable card primitive so
  workspace shells, panels, nested editor groups, and segment-strip items all
  share the same border and shadow system
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
2. page calls `POST /api/generate/staged`
3. API returns schema-validated `VideoProject`
4. page renders assembled preview via `ProjectVideo`
5. user edits a selected segment and can regenerate only that segment; staged
   regeneration reruns that segment's narration/TTS/template compile chain
6. generation/regeneration and export show process-local backend progress
   nodes while the request is running
7. user exports the current edited project through `POST /api/render`
8. successful render writes:
   - unique artifact: `AI_VIDEO_STUDIO_ARTIFACT_ROOT/renders/render-<timestamp>-<id>.mp4`
9. download routes:
   - unique artifact: `/api/render/[renderId]`

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
  - `stats-dashboard`: `StatsDashboardSpec` with `layout`, dashboard
    `blocks`, optional `timeline`, and `durationInFrames`
  - `scene-graph`: bounded `SceneGraph` Visual IR with render strategy,
    composition/layout/motion presets, technical-video primitives, camera
    movement, transitions, and a `UniversalSceneRenderer`
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
- the active visual-quality direction is a controlled scene graph layer:
  future LLM work should generate `ShotLanguagePlan` and per-segment
  `SceneGraph` data, while the app compiles that data through a stable
  Remotion renderer instead of relying only on fixed card-like templates or
  unrestricted generated TSX. See `docs/SCENE_GRAPH_VIDEO_LANGUAGE_PLAN.md`.
- the concrete first landing for that direction is documented in
  `docs/GOAL_SCENE_GRAPH_MVP.md`; Subagent-Driven execution boundaries live in
  `docs/HANDOFF_SCENE_GRAPH_SUBAGENT.md`.
- the first Scene Graph Visual IR v1 deterministic slice is implemented:
  existing templates remain macro/preset paths, while `scene-graph` now has a
  bounded `primitive_scene_graph` compiler path with full-bleed, node graph,
  line path, code panel, terminal panel, browser-window placeholder, cursor,
  and lockup treatments. LLM Visual IR generation/repair is the next slice;
  unrestricted generated TSX remains out of scope. See
  `docs/GOAL_SCENE_GRAPH_VISUAL_IR_V1.md` and
  `docs/HANDOFF_SCENE_GRAPH_VISUAL_IR_SUBAGENT.md`.
- the full expert-derived visual architecture roadmap lives in
  `docs/VISUAL_IR_COMPILER_ROADMAP.md`. It defines the complete phased target:
  `template_macro`, `primitive_scene_graph`, `procedural_generator`,
  `media_asset_composite`, future restricted `generated_component`,
  review/repair, and eventual micro-template memory. The next recommended
  bounded phase is Visual IR Generation v1 for `primitive_scene_graph`.

Current top-level boundaries:
1. `/src/app/page.tsx`
   - prompt input
   - segment-first editor
   - full preview panel
   - local render/export actions
2. `/src/app/api/generate/staged/route.ts`
   - staged generation and selected-segment regeneration
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
- active page generation uses `POST /api/generate/staged`
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
- process-local backend progress tracking is in place for generation and
  render requests through `progressId`, `src/lib/task-progress.ts`, and
  `/api/progress/[progressId]`
- the active page UI is organized into a whole-video workspace and a segment
  editor; the segment editor uses a horizontal drag-scroll segment strip plus
  compact selected-segment forms
- basic bounded planner repair is in place for invalid `StoryboardPlan`
  output
- deterministic staged smoke fixtures cover a mixed `scripted` + `spotlight`
  project with segment-owned narration audio/captions and selected-segment
  narration/caption replacement;
- deterministic scene graph smoke fixtures cover three `scene-graph` segments
  with a project-level `ShotLanguagePlan` and Visual IR v1 full-bleed,
  node-graph/path/code/terminal, and lockup treatments; Remotion Studio exposes
  `SceneGraphTemplatePreview`
- local export uses the generic `ProjectVideo` Remotion composition; template
  preview compositions remain available for focused Studio checks
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
- add provider-backed Visual IR generation and bounded repair for
  `primitive_scene_graph`, using the deterministic renderer vocabulary already
  in place
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

Start the separate production web service without changing the existing dev
service:
```bash
cd /data/projects/labs/ai-video-studio
cp .env.example .env.prod
# fill prod credentials / origins in .env.prod before first real use
bash scripts/prod-build.sh
```

`scripts/prod.sh` and `scripts/prod-build.sh` now explicitly load
`.env.prod` via `docker compose --env-file .env.prod`, so prod no longer
silently falls back to `.env` for Compose interpolation.

Default production topology on this workstation:
- `web` stays on the existing dev path (`npm run dev`)
- `web-prod` runs `next build` + `next start`
- `web-prod` binds `127.0.0.1:10001` by default
- host-level Cloudflare Tunnel ingress should point at `http://127.0.0.1:10001`
- export-time route media fetches inside the prod container must still use
  `AI_VIDEO_STUDIO_RENDER_ASSET_ORIGIN=http://127.0.0.1:3000`
- the optional real `f5-tts` GPU service is shared by dev and prod rather than
  duplicated
- the shared `f5-tts` host port stays local-only by default

If the prod service should also be reachable directly from the LAN, change
`PROD_APP_BIND` in `.env.prod` from `127.0.0.1` to `0.0.0.0`.

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

Render representative scene graph stills:
```bash
cd /data/projects/labs/ai-video-studio
docker compose run --rm web bash -lc 'npx remotion still src/remotion/index.ts SceneGraphTemplatePreview /workspace/out/scene-graph-opener.png --frame=90 --scale=0.5'
docker compose run --rm web bash -lc 'npx remotion still src/remotion/index.ts SceneGraphTemplatePreview /workspace/out/scene-graph-process.png --frame=215 --scale=0.5'
docker compose run --rm web bash -lc 'npx remotion still src/remotion/index.ts SceneGraphTemplatePreview /workspace/out/scene-graph-closing.png --frame=340 --scale=0.5'
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

This smoke calls `POST /api/tts`, writes a local artifact under
`AI_VIDEO_STUDIO_ARTIFACT_ROOT/tts` through the existing adapter, and verifies
`/api/tts/assets/...` byte-range serving.
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

The recommended workstation deployment is to keep exactly one real `f5-tts`
service running and let both the dev `web` service and the prod `web-prod`
service call the same internal `http://f5-tts:7865` endpoint. This keeps the
GPU/model footprint small while the app-layer concurrency guards stay at `1`.

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
Next app stores the uploaded reference under
`AI_VIDEO_STUDIO_ARTIFACT_ROOT/voice-references`, which defaults to the ignored shared
path `/workspace/out/voice-references` in the Docker workflow. The F5 overlay
mounts the shared host `./out` tree read-only at `/workspace/out`, so the
configured voice-reference path, TTS path, and render path all stay inside one
shared artifact root. Upload and synthesis therefore use one shared file path
instead of separate app/runtime path settings. When
cloning is disabled, staged generation falls back to the configured default F5
voice/reference behavior.

Important distinction:
- `./scripts/render.sh` is still the default/sample composition render path from the Docker wrapper
- current edited-project export is the in-app action / `POST /api/render`
- the edited-project export writes a unique `AI_VIDEO_STUDIO_ARTIFACT_ROOT/renders/render-*.mp4`
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
- `Dockerfile.prod`
- `docker-compose.yml`
- `docker-compose.prod.yml`
- `.dockerignore`
- `scripts/dev.sh`
- `scripts/prod.sh`
- `scripts/prod-build.sh`
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

For the separate production service on this workstation, create a second local
ignored file from the same tracked template:

```bash
cp .env.example .env.prod
```

Recommended prod-specific overrides in `.env.prod`:
- `PROD_APP_BIND=127.0.0.1`
- `PROD_APP_PORT=10001`
- `F5_TTS_HOST_BIND=127.0.0.1`
- `AI_VIDEO_STUDIO_ARTIFACT_ROOT="/workspace/out"`
- `AI_VIDEO_STUDIO_RENDER_ASSET_ORIGIN="http://127.0.0.1:3000"` for container-internal export fetches
- `TTS_PROVIDER="f5-tts"`
- `F5_TTS_BASE_URL="http://f5-tts:7865"`
- keep `AI_VIDEO_STUDIO_RENDER_CONCURRENCY`,
  `AI_VIDEO_STUDIO_GENERATION_CONCURRENCY`, `AI_VIDEO_STUDIO_TTS_CONCURRENCY`,
  and `F5_TTS_RUNTIME_CONCURRENCY` at `1`

### Private-team concurrency guard

This project is designed for private deployment and does not require a database
or production job queue for the current stage. It still protects expensive
server-side tasks because a private deployment may be used by a few people at
the same time.

Configured limits in `.env.example`:

| Variable | Default | Purpose |
|---|---:|---|
| `AI_VIDEO_STUDIO_RENDER_CONCURRENCY` | `1` | Maximum concurrent `/api/render` exports in this Next process. |
| `AI_VIDEO_STUDIO_GENERATION_CONCURRENCY` | `1` | Maximum concurrent `/api/generate/staged` requests in this Next process. |
| `AI_VIDEO_STUDIO_TTS_CONCURRENCY` | `1` | Maximum concurrent TTS provider synthesis calls, including local F5 runtime calls. |
| `AI_VIDEO_STUDIO_BUSY_MODE` | `reject` | `reject` returns HTTP `429` when the task type is busy; `queue` waits inside the HTTP request. |
| `AI_VIDEO_STUDIO_QUEUE_TIMEOUT_MS` | `300000` | Maximum wait time for `queue` mode. |
| `F5_TTS_RUNTIME_CONCURRENCY` | `1` | Maximum concurrent direct `/synthesize` calls inside the optional F5 runtime service. |

Recommended private-team defaults:
- keep render, generation, TTS, and F5 runtime concurrency at `1`
- keep `AI_VIDEO_STUDIO_BUSY_MODE=reject` so another user gets an immediate
  "busy, retry later" response instead of a long hanging request
- use `queue` only for trusted local workflows where keeping the browser
  request open is acceptable

The guard is process-local. It is enough for the Docker-first private-team
workflow, but it is not a global lock across multiple Next replicas. If this
project is deployed with multiple app instances, use an external lock or a real
job system before treating these limits as global.

## Notes
- `node_modules` is intended to live in the Docker volume path on this workstation.
- output files are written under `/data/projects/labs/ai-video-studio/out`.
- the official scaffold created a nested `.git/` repo in this directory.
- the app is no longer the upstream starter UI; the current studio path already supports brief -> project generation -> full preview -> selected-segment editing -> selected-segment regeneration -> local export.
- Docker render images now include Noto CJK fonts for Chinese-first content.

## MiniMax integration

The staged generation path is backed by [MiniMax](https://api.minimaxi.com/v1) (minimaxi.com) planner/compiler calls plus the in-repo TTS/assembly pipeline. The assembled `VideoProject` contract is unchanged — provider output must still validate against the selected planner/template schemas and final project schema.

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

The provider throws `MinimaxConfigError("MINIMAX_API_KEY is not configured. Set it in .env to enable real generation.")` on the first staged generation call, and `POST /api/generate/staged` returns a `500` with the same message in the `error` field. The UI surfaces it as the generation error state — there is no silent mock fallback to the local mock anymore.

### Failure → HTTP status mapping

| Failure | HTTP |
|---|---|
| `MINIMAX_API_KEY` missing or empty | 500 |
| Network error / upstream non-2xx (4xx, 5xx) | 502 |
| Upstream returns non-JSON | 502 |
| Tool call missing, wrong function, empty arguments, or `finish_reason=length` | 502 |
| Response is JSON but fails planner/template/project validation | 500 |
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
curl -s -X POST http://127.0.0.1:3000/api/generate/staged \
  -H 'content-type: application/json' \
  -d '{"mode":"brief","brief":"hello world"}'
# -> {"error":"MINIMAX_API_KEY is not configured. Set it in .env to enable real generation."} (status 500)
```

Run static validation inside Docker on this workstation; host `node_modules`
is not the default validation target.

Current MiniMax implementation notes live in [`docs/providers/minimax.md`](docs/providers/minimax.md).
