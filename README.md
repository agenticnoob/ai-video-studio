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

Current top-level boundaries:
1. `/src/app/page.tsx`
   - prompt input
   - segment-first editor
   - full preview panel
   - local render/export actions
- `src/app/api/generate/route.ts`
   - MiniMax-backed project/segment generation
3. `/src/app/api/render/*`
   - local Remotion export for the current edited project
4. `/src/lib/project-schema.ts`
   - stable `VideoProject` contract used by generation, preview, and export
5. `/src/remotion/*`
   - render video from structured props instead of ad-hoc codegen

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

Start Remotion Studio:
```bash
cd /data/projects/labs/ai-video-studio
./scripts/studio.sh
```
Then open:
- http://localhost:3001

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

## Repo-local validation

Recent repo-local verification path:
```bash
cd /data/projects/labs/ai-video-studio
npm install
npm run lint
npx tsc --noEmit
npm run build
```

Docker verification was not re-run in the latest render/export fix pass.

## Docker files added
- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`
- `.env.docker.example`
- `scripts/dev.sh`
- `scripts/studio.sh`
- `scripts/render.sh`

## Notes
- `node_modules` may live either locally after `npm install` or in the Docker volume path, depending on how you validate.
- output files are written under `/data/projects/labs/ai-video-studio/out`.
- the official scaffold created a nested `.git/` repo in this directory.
- the app is no longer the upstream starter UI; the current studio path already supports brief -> project generation -> full preview -> selected-segment editing -> selected-segment regeneration -> local export.
- Docker render images now include Noto CJK fonts for Chinese-first content.

## MiniMax integration

`POST /api/generate` is now backed by [MiniMax](https://api.minimaxi.com/v1) (minimaxi.com) Chat Completions. The `VideoProject` schema contract is unchanged — the provider is responsible for receiving the brief / current project and emitting a schema-validating JSON object.

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
| Upstream returns non-JSON or empty `choices[0].message.content` | 502 |
| Response is JSON but fails `videoProjectSchema` | 500 |
| Invalid request body / unknown mode | 400 |

### Minimal local verification

```bash
cd /data/projects/labs/ai-video-studio
npm install
npm run lint
npx tsc --noEmit
npm run build
```

Smoke test the missing-key path (returns 500):

```bash
cd /data/projects/labs/ai-video-studio
# ensure .env.local does NOT export MINIMAX_API_KEY
npm run dev
# in another terminal
curl -s -X POST http://127.0.0.1:3000/api/generate \
  -H 'content-type: application/json' \
  -d '{"mode":"project","brief":"hello world"}'
# -> {"error":"MINIMAX_API_KEY is not configured. Set it in .env.local to enable real generation."} (status 500)
```

Full design notes and prompt templates live in [`docs/providers/minimax.md`](docs/providers/minimax.md).
