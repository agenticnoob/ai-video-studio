# Final Product Goal

Status: authoritative goal for the current project direction.

Decision date: 2026-07-06.

The previous prompt-to-`VideoProject` final goal is **parked indefinitely**.
It remains useful historical context for a future web/editor productization
track, but it is no longer the top-level goal for this repository.

The current top-level goal is the Agent Producer workflow: given a real topic,
Codex acts as producer, researcher, script editor, TTS coordinator, asset
collector, Remotion component composer, and render reviewer. The output should
be a dedicated Remotion video assembled from repo-owned primitives, blocks,
standalone-video runtime helpers, local data, screenshots, TTS timing, and
sample-specific scenes.

In one line:

```txt
topic -> research/assets -> narration/TTS -> component inventory
-> dedicated Remotion composition -> still/mp4 review -> promotion notes
```

## 1. Current Goal

The project should help produce high-quality, finished videos from real topics
through an agent-led local production workflow.

The default output is not a generated `VideoProject` from the website prompt.
The default output is a purpose-built Remotion composition under a dedicated
`src/remotion/<SampleName>/` folder.

A successful Agent Producer run should:

1. Start from a topic, brief, source, repo, page, dataset, product, or story.
2. Research or inspect the source material when the facts matter.
3. Capture screenshots or other evidence assets when visuals need proof.
4. Write narration beats before locking scene timing.
5. Generate or prepare TTS and let narration duration own the timeline.
6. Inventory existing primitives, recipe blocks, standalone-video helpers, and
   sample references before adding new TSX.
7. Compose a dedicated Remotion video from repo-owned components.
8. Render representative stills and, when practical, an mp4 for review.
9. Keep generated screenshots, audio, and rendered videos local-only unless the
   user explicitly asks to commit them.
10. Record promotion notes for reusable visual language after the sample works.

This is the direction to optimize first.

## 2. Parked Web Editor Goal

The previous final goal was:

```txt
user prompt
  -> storyboard planning
  -> per-segment narration synthesis
  -> audio + aligned captions
  -> per-segment template compilation
  -> assembled VideoProject
  -> preview, edit, regenerate, export
```

That path is now parked indefinitely as a productization track.

It should not guide day-to-day video-production work unless the user explicitly
asks for one of these productized capabilities:

- web/page generation
- editable `VideoProject` output
- selected-segment regeneration
- app-based preview/export
- productized template/recipe behavior
- future product UI or editor work

When those needs are explicit, the old pipeline remains a valid reference
model. Otherwise, start from Agent Producer.

## 3. Authoritative Workflow

Use this production order:

```txt
1. define the video job
2. research facts and collect evidence
3. write narration beats
4. generate or prepare TTS/captions
5. inventory reusable components
6. model local data explicitly
7. compose dedicated Remotion scenes
8. render stills for review
9. render mp4 when practical
10. decide what, if anything, should be promoted
```

### 3.1 Define The Video Job

A video job should state:

- audience
- duration target
- aspect ratio
- language
- content family, such as `project-intro`, `data-analysis`, `tutorial`,
  or `trend-briefing`
- expected source material, such as websites, GitHub repos, screenshots,
  product UI, local data, documents, or user-provided assets

### 3.2 Research And Assets

For factual topics, use current source material. Capture or prepare evidence
screenshots when a visual claim needs proof.

Generated or captured artifacts should stay under ignored local paths, usually:

- `public/generated/<slug>/`
- `out/`

Do not commit generated screenshots, generated audio, or rendered mp4 files by
default.

### 3.3 Narration And TTS First

Write concise narration beats before final visual timing. Generate or prepare
TTS before locking durations.

Rules:

- real narration duration owns scene timing
- captions belong with narration data, not template-specific implementation
- F5-TTS is preferred when configured and appropriate
- static voiceover assets for dedicated samples should be Remotion-readable via
  `staticFile()` from ignored generated artifact paths

### 3.4 Component Inventory Before New TSX

Before writing new visuals, map each beat to available building blocks:

- primitives under `src/remotion/primitives/`
- recipe blocks under `src/remotion/recipes/blocks/`
- timing/audio/caption helpers under `src/remotion/standalone-video/`
- existing high-signal samples such as `UvOpenSourceBrief`,
  `WorldCupBettingAnalysis`, and `PixelRAGChineseStandalone`
- sample-local scene/block code only when existing components cannot express
  the beat well

Use this hierarchy:

```txt
primitive -> block -> dedicated composition -> recipe -> template -> VideoProject
```

The hierarchy means: make a good dedicated video first, then promote reusable
pieces later. It does not mean every video must become a template.

### 3.5 Dedicated Composition As The Default Output

A committed high-signal sample should normally have:

```txt
src/remotion/<SampleName>/
  index.ts
  <SampleName>.tsx
  types.ts
  script.ts
  data.ts
  audio.generated.ts or generated narration metadata when needed
```

It should be registered in `src/remotion/Root.tsx` only when it is meant to be
a maintained Studio/renderable sample.

## 4. Reusable Layers

### Primitives

Primitives are small reusable Remotion components, usually under
`src/remotion/primitives/`. They should stay runtime-focused and not become
LLM-visible contracts by themselves.

### Blocks

Blocks are semantic compositions of primitives. They may live under
`src/remotion/recipes/blocks/`, `src/remotion/standalone-video/`, or a
sample folder while still being proven.

Promote a sample-local block only when it is useful beyond one video.

### Dedicated Compositions

Dedicated compositions are finished-video-first outputs. They are the default
Agent Producer deliverable.

Current references:

- `src/remotion/UvOpenSourceBrief/`
- `src/remotion/WorldCupBettingAnalysis/`
- `src/remotion/PixelRAGChineseStandalone/`

### Recipes And Templates

Recipes and templates are productization layers.

Use them when proven visual language should become available through the
web/editor generation path. Do not start personal video production by forcing a
new topic into a generic recipe or template.

### VideoProject

`VideoProject` is now a productization/editing/export boundary, not the
default creative production boundary.

Use it only when the user asks for page editing, selected-segment regeneration,
app export, or productized web generation.

## 5. Current Roadmap

### Phase A: Authority Reset

Status: current docs slice.

Goal: make this document the top-level goal and mark the previous
`VideoProject` final goal as parked indefinitely.

Acceptance:

- new agents start from Agent Producer by default
- README, AGENTS, iteration status, visual roadmap, and workflow skill agree on
  the authority order
- old web/editor pipeline is described as a productization track only

### Phase B: Producer Sample OS v1

Goal: make Agent Producer samples easier to start, review, and hand off.

Deliver:

- producer sample manifest model
- sample scaffold convention
- local-only artifact boundary
- manifest/smoke guard
- review-frame convention

Non-goals:

- no broad media library
- no persistence/history
- no universal template
- no generated screenshots/audio/mp4 committed to Git

### Phase C: Evidence Lens Block v1

Status: implemented for the first shared block slice.

Goal: promote the reusable screenshot-proof language from `UvOpenSourceBrief`
into a shared block while keeping topic-specific facts sample-local.

Deliver:

- shared screenshot focus data model
- full-frame readable screenshot backdrop
- compact translucent evidence overlay
- frame-driven zoom-in / hold / return motion
- still-review guidance for context / zoom / return frames

Implementation note:

- v1 lives under `src/remotion/producer-samples/evidence-lens/` and is
  re-exported from `src/remotion/producer-samples/`.
- `UvOpenSourceBrief` now uses the shared Evidence Lens backdrop and overlay
  while keeping uv facts, narration, TTS metadata, composition id, and duration
  target unchanged.
- `npm run smoke:evidence-lens` guards frame-driven motion, `staticFile()`
  screenshot usage, no CSS animation/transition, and the local-only artifact
  contract.

Non-goals:

- no automatic screenshot repair
- no visual scoring system
- no planner-visible recipe/template exposure in this phase

### Phase D: Promotion Gate v1

Goal: make promotion decisions explicit so sample-local ideas do not become
universal templates too early.

Deliver:

- checklist for sample-local vs primitive vs block vs recipe/template
- rule that recipes/templates are productization layers
- documentation hooks for promoted visual language

Non-goals:

- no universal data-story or project-intro template by default
- no multi-template-per-segment orchestration
- no primitive prop exposure to providers

## 6. Validation Expectations

For documentation-only direction changes:

```bash
git diff --check
```

For sample/runtime implementation slices, use the smallest Docker-first checks
that cover the changed boundary. Common checks include:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:standalone-video-runtime'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit --pretty false'
```

For visual work, render representative stills before claiming quality.

## 7. Non-Goals Until Explicitly Reopened

Do not use this goal to expand scope into:

- one-shot web prompt as the default production method
- a universal video template
- generated arbitrary TSX from providers
- broad media library UI
- persistence/history
- production queues
- automatic visual scoring or repair loops
- multi-template-per-segment orchestration
- committing generated screenshots/audio/mp4 files by default

## 8. Decision Rule

When choosing the next step, ask:

```txt
Does this help an agent make a better dedicated Remotion video from a real topic?
```

If yes, it belongs on the current main path.

If it mainly improves web editing, `VideoProject` generation, selected-segment
regeneration, or app export, treat it as productization work and keep it
secondary unless the user explicitly asks for it.
