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
- current progress and next-step notes live in `docs/ITERATION_STATUS.md`
- product requirements live in `docs/PRODUCT_REQUIREMENTS.md`
- agent/new-task startup notes live in `AGENTS.md`

## Current product flow

1. user writes a brief
2. page calls local mock `POST /api/generate`
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
2. `/src/app/api/generate/route.ts`
   - current local deterministic project/segment generation mock
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
