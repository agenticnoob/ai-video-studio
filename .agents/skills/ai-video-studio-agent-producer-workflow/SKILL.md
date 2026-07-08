---
name: ai-video-studio-agent-producer-workflow
description: Use when working in /data/projects/labs/ai-video-studio and Codex should produce a dedicated Remotion video from a real topic by composing existing primitives, blocks, standalone-video runtime helpers, TTS timing, data modules, screenshots, and still/render review instead of using the one-shot web prompt.
---

# AI Video Studio Agent Producer Workflow

## Purpose

Use this skill when the user wants a higher-quality video produced by a local
agent workflow instead of the one-shot web prompt. In this repo, this is the
default personal production path for real finished videos. The agent acts as
producer, researcher, data modeler, script editor, component composer, and
render reviewer.

The default producer path is a component-composed Remotion video:

```txt
topic -> research/data -> narration/TTS -> component inventory
-> dedicated Remotion composition -> still/mp4 review -> promotion notes
```

The web `VideoProject` path is a productization, editing, regeneration, or app
export target, not the default execution path for this workflow.

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
6. When using VoxCPM for narration or voice clone, use
   `.agents/skills/ai-video-studio-voxcpm-expression-workflow/` before writing
   final TTS text or control instructions.

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
- Use `VideoProject` only when the user explicitly needs the parked web/editor
  productization path: existing web editor, selected-segment regeneration, or
  `/api/render` export.
- If using `VideoProject`, explain why the page product path is the right
  output for this specific request.

### 2. Research And Asset Collection

For real topics, gather enough source material before scripting:

- Search or inspect primary sources when current facts matter.
- Capture website, GitHub, product, or chart screenshots when the video needs
  visual proof.
- Try real source capture before creating a generated source-card fallback.
  A source-card fallback is allowed only after the real page/screenshot is
  unavailable, blocked, unreadable after scaling, or otherwise not useful for
  the claim.
- Record the capture result in a local working note or data module: source URL,
  asset path when captured, or a short fallback reason such as paywall,
  geoblock, auth wall, automation block, network failure, dynamic-render
  failure, or unreadable screenshot.
- Do not describe a generated source-card fallback as a screenshot. Label it as
  source-card fallback evidence in data, notes, or handoff text.
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
- Use VoxCPM by default for local Agent Producer narration and voice clone
  timing; use F5-TTS only when explicitly configured with `TTS_PROVIDER=f5-tts`.
- For VoxCPM, write control instructions and sparse non-language tags with
  `.agents/skills/ai-video-studio-voxcpm-expression-workflow/`; do not over-tag
  narration text.
- TTS timing still owns scene timing regardless of provider.
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

Screenshot evidence direction:

- Real capture comes first. For a source-backed evidence beat, attempt to
  capture the actual page, repo, product UI, dashboard, chart, or document
  before generating a source-card fallback.
- If real capture fails or is not readable, keep the fallback honest: use a
  clearly labeled source-card fallback, localize all visible text for the
  video's language, and record why it replaced the real screenshot.
- When a beat uses a website, GitHub, product page, docs page, or dashboard
  screenshot as visual evidence, prefer making the screenshot the dominant
  full-frame visual instead of a small side card.
- Layer the narration headline, metrics, labels, and callouts as
  semi-transparent overlays on top of the screenshot, keeping safe margins and
  caption space clear.
- Use frame-driven Remotion `interpolate()` zoom/pan to push into the important
  part of the screenshot, such as stars, release title, docs navigation, chart
  value, or product state. Do not use CSS animation or transition.
- Keep the screenshot itself readable. Avoid heavy full-frame masks that turn
  the evidence into an indistinct dark background; prefer local translucent
  panels behind text and only light edge vignettes over the screenshot.
- Match zoom targets to the exact claim being narrated. If the narration says
  stars, zoom toward the star/fork counters; if it says release date, zoom
  toward the release title/date; if it says official definition, zoom toward
  the definition text; if it says speed, zoom toward the benchmark or
  performance area.
- For evidence zooms, use a quick push-in, a short hold, then return toward the
  original screenshot scale so the viewer sees both context and detail.
- Use screenshot cards only when the screenshot is secondary context; if the
  screenshot is proof for the beat, it should usually own the frame.

Readable screenshot evidence lens:

Use this micro-workflow when the screenshot must prove a real claim:

1. Name the claim first, such as `stars/forks`, `official definition`,
   `release title/date`, `benchmark`, `pricing`, or `product state`.
2. Attempt real capture from the source URL or local provided asset before
   making a fallback card.
3. Capture or select a screenshot where that claim is visible without relying
   on tiny text after scaling.
4. If real capture fails, record the reason and use a clearly labeled
   source-card fallback instead of calling it a screenshot.
5. Record a scene-local focus target that matches the claim. Do not zoom into a
   visually interesting area if it is not the area being narrated.
6. Make the screenshot or fallback evidence card the main layer at full-frame
   scale. Keep the evidence readable with normal brightness/contrast and only
   light edge vignettes.
7. Put narration text, metrics, and labels in a compact translucent panel.
   The panel may blur or darken only its own background; it should not mask the
   whole evidence layer.
8. Animate the screenshot or fallback card with a quick push-in, a short hold,
   and a return toward the original scale. This gives both context and detail
   in one shot.
9. Render stills at the start/context frame, the zoom/hold frame, and the
   return frame. Check that the evidence remains legible, the panel does not
   cover the claim, captions do not collide, the focal point matches the
   narration, and fallback cards do not contain untranslated copy.

Promotion candidates from the uv first run:

- `EvidenceScreenshotBackdrop`: full-frame screenshot layer with readable
  filter, light vignette, and frame-driven focus motion.
- `EvidenceOverlayPanel`: compact translucent local panel for headline,
  labels, and claim metrics.
- `ScreenshotFocus`: data model for `assetId`, claim/focus description,
  zoom-in frame, hold frame, return frame, target scale, and pan offsets.

Optional productization path:

- Build or edit a `VideoProject` only when the user asks for web editing,
  selected-segment regeneration, app export, or main-site generation quality.
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
- source-backed scenes use real captures when available, or clearly labeled
  source-card fallbacks with a recorded failure reason
- target-language visible copy on fallback cards and overlays

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
- evidence capture attempts: real screenshot path, or source-card fallback
  reason when capture failed or was unreadable
- TTS/caption status
- stills or render artifacts checked
- validation commands and results
- reusable pieces worth promoting later
