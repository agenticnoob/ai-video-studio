# AI Video Studio

AI-first web app scaffold for prompt-to-video workflows.

Goal:
- user enters a natural-language brief
- AI turns it into structured video parameters / prompts
- page shows live preview for tuning
- user tweaks copy, timing, colors, scenes, assets
- final render exports a video artifact

Project path:
- /data/projects/labs/ai-video-studio

Current base:
- official Remotion Next.js template (`create-video --next`)
- Docker-first runtime wrapper added on top
- no host-global npm / pnpm install required

Current implementation status:
- first usable segment-first editing workflow is already implemented
- current progress and next-step notes live in `docs/ITERATION_STATUS.md`
- product requirements live in `docs/PRODUCT_REQUIREMENTS.md`
- agent/new-task startup notes live in `AGENTS.md`

## Product direction

Recommended flow for this repo:
1. `/src/app/page.tsx`
   - prompt input
   - parameter panel
   - preview panel
   - render/export actions
2. `/src/app/api/generate/route.ts`
   - call LLM
   - transform prompt into structured JSON
3. `/types/constants.ts` + a future schema file
   - define stable video schema
   - validate AI output before preview/render
4. `/src/remotion/*`
   - render video from structured props instead of ad-hoc codegen
5. `/src/app/api/render/*` or existing render endpoints
   - render final video after user confirmation

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

Render the default composition to `out/ai-video.mp4`:
```bash
cd /data/projects/labs/ai-video-studio
./scripts/render.sh
```

Stop containers:
```bash
cd /data/projects/labs/ai-video-studio
docker compose down
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
- `node_modules` lives in a Docker volume, not on the host.
- `.next` cache also lives in a Docker volume.
- output files are written to `/data/projects/labs/ai-video-studio/out`.
- the official scaffold created a nested `.git/` repo in this directory.
- the app is no longer the upstream starter UI; the current studio path already supports brief -> project generation -> full preview -> selected-segment editing -> selected-segment regeneration.
- the highest-priority next implementation step is final local render/export from the current edited `VideoProject`.
