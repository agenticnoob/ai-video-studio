# AI Video Studio

AI-first web app scaffold evolving into a prompt-to-video studio.

Goal:
- user enters a natural-language brief
- AI turns it into structured video parameters / project data
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
- current progress and next-step notes live in `docs/ITERATION_STATUS.md`
- product requirements live in `docs/PRODUCT_REQUIREMENTS.md`
- agent/new-task startup notes live in `AGENTS.md`

## Current product flow

1. user writes a brief
2. page calls `POST /api/generate`
3. API returns schema-validated `VideoProject`
4. page renders assembled preview via `ProjectVideo`
5. user edits a selected segment and can regenerate only that segment
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
- `implementation` is template-specific; current registered templates are:
  - `scripted`: `VideoSpec` with internal `scenes`
  - `spotlight`: `SpotlightSpec` with `headline`, `subheadline`,
    `callouts`, and `durationInFrames`
- `VideoSpec.scenes` is specific to the current `scripted` template, not a universal field for all future templates
- future existing video, image, or color inputs should be modeled as project-level or segment-level `baseLayer` data

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
5. `/src/templates/*`
   - cohesive template modules with `schema`, server-safe `definition`,
     structured `capabilities`, optional block contracts, editor fields,
     runtime adapters, and bundle exports
6. `/src/templates/registry.ts`
   - derived server-safe template metadata registry used by schema validation
     and MiniMax prompt/tool generation
7. `/src/templates/registered-definitions.ts`
   - server-safe template definition registration source
8. `/src/templates/registered-bundles.ts`
   - runtime template bundle registration source
9. `/src/templates/component-registry.tsx`
   - runtime template registry used by the page editor and Remotion preview
10. `/src/lib/template-registry.ts`
   - compatibility re-export for existing code
11. `/src/remotion/*`
   - render video from structured props instead of ad-hoc codegen
   - reusable video primitives live under `src/remotion/primitives/` and may
     be composed by template-local block renderers

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

Important distinction:
- `./scripts/render.sh` is still the default/sample composition render path from the Docker wrapper
- current edited-project export is the in-app action / `POST /api/render`
- the edited-project export writes `out/renders/latest.mp4` plus a unique `out/renders/render-*.mp4`

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
- `.env.docker.example`
- `scripts/dev.sh`
- `scripts/studio.sh`
- `scripts/render.sh`

## Notes
- `node_modules` is intended to live in the Docker volume path on this workstation.
- output files are written under `/data/projects/labs/ai-video-studio/out`.
- the official scaffold created a nested `.git/` repo in this directory.
- the app is no longer the upstream starter UI; the current studio path already supports brief -> project generation -> full preview -> selected-segment editing -> selected-segment regeneration -> local export.
- Docker render images now include Noto CJK fonts for Chinese-first content.

## MiniMax integration

`POST /api/generate` is now backed by [MiniMax](https://api.minimaxi.com/v1) (minimaxi.com) Chat Completions. The `VideoProject` schema contract is unchanged — the provider is responsible for receiving the brief / current project and emitting a schema-validating JSON object. Each returned segment must choose one registered `templateId`, and its `implementation` must match that template-specific schema.

### Environment variables

Add to `.env.local` (see `.env.example`):

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `MINIMAX_API_KEY` | yes | — | Bearer token for `https://api.minimaxi.com/v1/text/chatcompletion_v2`. |
| `MINIMAX_MODEL` | no | `MiniMax-M2.7-highspeed` | The `model` field sent on every request. Must be read from `process.env`, never hard-coded. |
| `MINIMAX_BASE_URL` | no | `https://api.minimaxi.com/v1` | Override only for testing against a self-hosted gateway. |

### What happens if the key is missing

The provider throws `MinimaxConfigError("MINIMAX_API_KEY is not configured. Set it in .env.local to enable real generation.")` on the first call, and `POST /api/generate` translates that into a `500` with the same message in the `error` field. The UI surfaces it as the generation error state — there is no silent mock fallback to the local mock anymore.

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
# ensure .env.local does NOT export MINIMAX_API_KEY
curl -s -X POST http://127.0.0.1:3000/api/generate \
  -H 'content-type: application/json' \
  -d '{"mode":"project","brief":"hello world"}'
# -> {"error":"MINIMAX_API_KEY is not configured. Set it in .env.local to enable real generation."} (status 500)
```

Run static validation inside Docker on this workstation; host `node_modules`
is not the default validation target.

Current MiniMax implementation notes live in [`docs/providers/minimax.md`](docs/providers/minimax.md).
