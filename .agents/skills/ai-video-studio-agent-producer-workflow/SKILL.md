---
name: ai-video-studio-agent-producer-workflow
description: Use when working in /data/projects/labs/ai-video-studio and Codex should produce a dedicated Remotion video from a real topic by composing existing primitives, blocks, standalone-video runtime helpers, TTS timing, data modules, screenshots, and still/render review instead of using the one-shot web prompt.
---

# AI Video Studio Agent Producer Workflow

## Purpose

Use this skill when the user wants a higher-quality video produced by a local
agent workflow instead of the one-shot web prompt. The agent acts as producer,
researcher, data modeler, script editor, component composer, and render
reviewer.

The default producer path is a component-composed Remotion video:

```txt
topic -> research/data -> narration/TTS -> component inventory
-> dedicated Remotion composition -> still/mp4 review -> promotion notes
```

The web `VideoProject` path is a later productization target, not the default
execution path for this workflow.

## Core Rule

Use this order for visual construction:

```txt
existing primitive first
existing block second
sample-specific scene/block third
dedicated composition fourth
recipe/template only after reuse is proven
```

- Primitives are reusable Remotion building blocks under `src/remotion/primitives/`.
- Blocks are existing grouped renderers under `src/remotion/recipes/blocks/`,
  `src/remotion/standalone-video/`, or a sample-local composition of primitives.
- Dedicated compositions are finished-video-first Remotion outputs such as
  `WorldCupBettingAnalysis`.
- Recipes are reusable semantic arrangements inside a registered template.
- Templates are provider-visible segment implementation mechanisms selected by
  `templateId`.

Do not let the agent merely ask the web page to generate a project and add a
few screenshots. It should compose the video from repo-owned components and
only write new TSX for sample-specific scenes that existing primitives/blocks
cannot express.

## Start Here

1. Read current routing docs:
   - `docs/FINAL_PRODUCT_GOAL.md`
   - `docs/ITERATION_STATUS.md`
   - `docs/VISUAL_RECIPE_ROADMAP.md`
   - `README.md`
2. Read primitive/component references before planning visuals:
   - `docs/REMOTION_PRIMITIVES.md`
   - `docs/REMOTION_COMPONENT_LIBRARY.md`
   - `src/remotion/catalog/primitive-catalog.ts`
3. Inspect current finished-video examples and shared runtime:
   - `src/remotion/WorldCupBettingAnalysis/`
   - `src/remotion/PixelRAGChineseStandalone/`
   - `src/remotion/standalone-video/`
   - `src/remotion/recipes/blocks/`
4. Check the local primitive browser when visual selection matters:
   - `http://localhost:3000/primitives`
5. Use `.agents/skills/remotion-best-practices/` for Remotion rules. Load
   `rules/video-layout.md` before designing text-heavy scenes.

## Workflow

### 1. Define The Video Job

Write a short production brief:

- audience
- duration target
- aspect ratio
- language
- content family, such as `project-intro`, `data-analysis`, `tutorial`, or
  `trend-briefing`
- expected source material, such as web pages, GitHub repo, screenshots, local
  data, or uploaded product UI

Choose a default output:

- Default to a component-composed standalone Remotion composition when the user
  asks for a good finished video.
- Use `VideoProject` only when the user explicitly needs the existing web
  editor, selected-segment regeneration, or `/api/render` export path.
- If using `VideoProject`, explain why the page product path is the right
  output for this specific request.

### 2. Research And Asset Collection

For real topics, gather enough source material before scripting:

- Search or inspect primary sources when current facts matter.
- Capture website, GitHub, product, or chart screenshots when the video needs
  visual proof.
- Store generated or captured media under ignored local artifact paths, usually
  `public/generated/<slug>/` or `out/`.
- Do not commit generated screenshots, audio, or rendered videos unless the user
  explicitly asks.

Record source facts briefly in a local working note or data module if they feed
the render.

### 3. Primitive Inventory Pass

Before writing new components, list candidate primitives and blocks:

- charts: `src/remotion/primitives/charts/`
- media: `src/remotion/primitives/media/`
- text: `src/remotion/primitives/text/`
- scenes: `src/remotion/primitives/scenes/`
- transitions: `src/remotion/primitives/transitions/`
- existing recipe blocks: `src/remotion/recipes/blocks/`
- standalone timing/audio/caption helpers: `src/remotion/standalone-video/`
- backgrounds/cinematic/logos as needed

Map every intended beat to one of:

- existing primitive
- existing recipe block
- existing standalone-video helper
- sample-local scene/block composed from primitives
- truly new primitive worth promoting

Do not stop at "use screenshots." Name what renders the frame and how it
relates to the beat.

### 4. Script And TTS First

Write short narration beats before final visual timing. Generate or plan TTS
before locking scene durations.

Rules:

- Let real narration duration own timing.
- Keep captions under segment-owned narration data.
- Use F5-TTS when configured for local generation.
- For local producer videos, write static voiceover assets into
  `public/generated/<slug>/` so Remotion can read them through `staticFile()`.

### 5. Assemble Visuals

Default assembly path:

- Use `src/remotion/standalone-video/` for timing, caption, voiceover, and
  canvas-profile helpers when it fits.
- Keep sample-specific visuals under a dedicated `src/remotion/<SampleName>/`
  folder.
- Model content explicitly with `types.ts`, `data.ts`, `script.ts`, or
  generated audio metadata, following the shape of `WorldCupBettingAnalysis`
  when appropriate.
- Compose scenes from primitives, existing recipe blocks, and small
  sample-local renderers.
- Register only the standalone composition in `src/remotion/Root.tsx`.
- Add a focused smoke guard when the composition becomes a committed sample.
- Treat the sample as the product answer for the local video request, then mine
  reusable visual language back into primitives, blocks, recipes, or templates
  later.

Optional productization path:

- Build or edit a `VideoProject` only when the user asks for web editing,
  selected-segment regeneration, or main-site generation quality.
- Keep one primary `templateId` per `VideoSegment`.
- Use template implementation fields as the only LLM-visible contract.
- Let template runtimes map implementation fields to primitives.
- Keep preview/export on `ProjectVideo`.

### 6. Visual Review

Render representative stills before claiming quality:

```bash
docker compose run --rm web bash -lc 'npx remotion still src/remotion/index.ts <CompositionId> /workspace/out/<slug>-frame-<frame>.png --frame=<frame> --scale=0.5'
```

Inspect stills for:

- one obvious focal point
- readable main text
- safe margins
- no subtitle collisions
- no blank or broken media
- no cramped dashboard-like clutter
- useful motion state at intro, middle, and ending frames

For finished samples, also render an mp4 and inspect with `ffprobe` when
practical.

### 7. Promote Only After Evidence

After a real sample works:

- Extract shared timing/caption/audio helpers into runtime utilities.
- Promote reusable visual arrangements into blocks or recipes.
- Expose a recipe/template to the planner only after the finished composition
  proves the arrangement is reusable.
- Update `docs/REMOTION_PRIMITIVES.md`,
  `docs/REMOTION_COMPONENT_LIBRARY.md`, `docs/VISUAL_RECIPE_ROADMAP.md`, and
  `README.md` when the reusable model changes.

## Non-Goals

- Do not build a broad media library.
- Do not add persistence/history.
- Do not use the web prompt as the primary production method for this workflow.
- Do not treat screenshots alone as the improvement.
- Do not generate arbitrary provider-authored TSX as the normal path.
- Do not expose primitive props directly to the LLM.
- Do not model one segment as multiple templates.
- Do not force every local producer video into `VideoProject`.
- Do not use CSS animations, CSS transitions, or Tailwind animation utilities
  for render-critical motion.

## Validation

Use the smallest checks that cover the touched boundary:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit --pretty false'
git diff --check
```

Add targeted smokes when changing primitives, templates, standalone samples,
or Remotion composition registration.

## Handoff Summary Format

End producer work with:

- topic and output path
- why the output is standalone or why `VideoProject` was explicitly chosen
- primitives/blocks/runtime helpers used
- source assets created and whether they are local-only
- TTS/caption status
- stills or render artifacts checked
- validation commands and results
- reusable pieces worth promoting later
