---
name: ai-video-studio-agent-producer
description: Use when working in /data/projects/labs/ai-video-studio and Codex should produce a dedicated Remotion video from a real topic using repo primitives, blocks, standalone-video helpers, TTS-owned timing, data modules, real source capture, still/mp4 review, and promotion notes instead of the one-shot web prompt or default VideoProject path.
---

# AI Video Studio Agent Producer

Use this skill for finished local videos from real topics. In this repo,
Agent Producer is the default personal production path; `VideoProject` and the
web editor are productization/export surfaces, not the default creative path.

Production Chain:

```txt
topic -> research/data -> narration/TTS -> component inventory
-> dedicated Remotion composition -> still/mp4 review -> promotion notes
```

Skill Stack:

- Use this skill as the main producer authority for real finished videos.
- Load `.agents/skills/remotion-best-practices/` before editing Remotion code;
  load `rules/video-layout.md` for dense scenes, `rules/subtitles.md` for
  caption display, and `rules/silence-detection.md` when inspecting audio gaps.
- Load `.agents/skills/ai-video-studio-agent-producer/voxcpm-expression/VOXCPM_EXPRESSION.md` only when VoxCPM
  narration, voice clone text, control instructions, or delivery-state tags are
  involved.

## Start Here

1. Read current routing docs:
   - `docs/FINAL_PRODUCT_GOAL.md`
   - `docs/ITERATION_STATUS.md`
   - `docs/VISUAL_RECIPE_ROADMAP.md`
   - `README.md`
2. Read visual inventory before planning scenes:
   - `.agents/skills/ai-video-studio-agent-producer/remotion-primitives/REMOTION_PRIMITIVES.md`
   - `docs/REMOTION_COMPONENT_LIBRARY.md`
   - `src/remotion/catalog/primitive-catalog.ts`
3. Inspect examples and shared runtime:
   - `src/remotion/WorldCupBettingAnalysis/`
   - `src/remotion/PixelRAGChineseStandalone/`
   - `src/remotion/standalone-video/`
   - `src/remotion/recipes/blocks/`
4. Use `.agents/skills/remotion-best-practices/` for Remotion rules. Load
   `rules/video-layout.md` before text-heavy scene design; load caption/audio
   rules when subtitles, voiceover timing, silence, or media duration matter.
5. If VoxCPM narration or voice clone is used, load
   `.agents/skills/ai-video-studio-agent-producer/voxcpm-expression/VOXCPM_EXPRESSION.md` before final
   TTS text or control instructions.

## Visual Construction Rule

Choose the narrowest repo-owned building block that fits:

```txt
existing primitive -> existing block -> sample-local scene/block
-> dedicated composition -> recipe/template promotion
```

- Use primitives from `src/remotion/primitives/` before writing new UI.
- Use recipe blocks, producer-sample blocks, or `standalone-video` helpers when
  they fit the beat.
- Write sample-local TSX only for arrangement/content that existing components
  cannot express cleanly.
- Promote a recipe/template only after the dedicated composition works and the
  reusable pattern is proven.
- Do not stop at "add screenshots." Name the primitive, block, or local scene
  that owns every visual beat.

## Produce The Video

### 1. Define The Job

Write a short production brief:

- audience
- duration target
- aspect ratio
- language
- content family, such as `project-intro`, `data-analysis`, `tutorial`, or
  `trend-briefing`
- expected source material: web pages, repo pages, dashboards, charts, local
  data, uploaded media, or user-provided brief

Default to a component-composed standalone Remotion composition. Use
`VideoProject` only when the user explicitly asks for web editing,
selected-segment regeneration, app export, or main-site generation behavior.

### 2. Research And Source Assets

Gather enough evidence before scripting:

- Search or inspect primary sources when current facts matter.
- Capture the actual page, repo, product UI, chart, or document when the video
  needs source-backed visual proof.
- Record each capture attempt in data or a local note with URL, status, asset
  path when captured, or a short failure reason such as paywall, auth wall,
  automation challenge, network failure, dynamic-render failure, or unreadable
  scaling.
- Store generated/captured media under ignored local artifact paths, usually
  `public/generated/<slug>/` or `out/`.
- Do not commit generated screenshots, generated source cards, audio, or mp4
  unless the user explicitly asks.

### 3. Evidence And Screenshot Rules

Use these rules for every source-backed scene:

- Attempt real capture before creating any source-card fallback.
- A real screenshot may enter the video only when it is actually captured,
  readable at render size, and relevant to the narrated claim.
- If a real screenshot is available and proves the beat, make it the dominant
  full-frame background. Add compact translucent overlays for headline,
  metrics, labels, or caution notes.
- If capture fails or the screenshot is unreadable, record the reason in data
  or handoff text. Do not show the fallback card in the video merely because it
  exists.
- Do not call a generated source-card fallback a screenshot in code, visible
  copy, docs, or final handoff.
- Do not show visible text such as "fallback", "screenshot fallback",
  "source-card fallback", "capture failed", or production-process explanations
  inside the video frame.
- Do not use `EvidenceScreenshotBackdrop` or list it in a scene's
  `primitiveMap` unless that scene has a real `captured-screenshot` asset.
- If no real screenshot is usable, design an honest information graphic for
  the claim using primitives/blocks and record the capture failure outside the
  frame.

For evidence screenshots:

1. Name the claim first, such as `stars/forks`, `official definition`,
   `release date`, `benchmark`, `pricing`, or `product state`.
2. Capture/select a frame where that claim is visible without tiny-text
   dependence after scaling.
3. Store focus metadata that matches the claim. Do not zoom into an unrelated
   visually interesting area.
4. Keep the screenshot readable with normal brightness/contrast and light edge
   vignettes only.
5. Animate with frame-driven `interpolate()` push-in, hold, and return-to-context.
6. Render stills at context, focus, and return frames and inspect them.

### 4. Script And TTS First

Write narration beats before locking visual timing:

- Let real narration duration own scene duration.
- Keep captions under segment-owned narration data, not template-specific
  implementation fields.
- Use VoxCPM by default for local Agent Producer narration and voice clone
  timing; use F5-TTS only when explicitly configured with `TTS_PROVIDER=f5-tts`.
- VoxCPM currently returns audio, not per-line alignment. The project adapter
  therefore makes readable captions by punctuation-split synthesis, trims each
  returned chunk's leading/trailing silence, then writes one trimmed and
  concatenated WAV and derives caption cue durations from measured chunk audio.
  Do not bypass that path with one broad fallback cue per paragraph.
- Default voice clone configuration: see `voxcpm-expression/VOXCPM_EXPRESSION.md`
  **Default Voice Clone Configuration** section. When no override is specified,
  use `clone_with_prompt` with `voices/clone/lyy.wav` + `voices/clone/lyy.txt`
  (prompt) and `voices/clone/lyy-r.wav` (reference).
- For local producer videos, write static voiceover assets into
  `public/generated/<slug>/` so Remotion can read them through `staticFile()`.

### 5. Assemble The Composition

- Keep sample-specific files under `src/remotion/<SampleName>/`.
- Model content explicitly with `types.ts`, `script.ts`, `data.ts`, and
  generated audio metadata when needed.
- Use `src/remotion/standalone-video/` for timeline, caption, voiceover, and
  canvas-profile helpers when it fits.
- Compose scenes from existing primitives, existing recipe/producer blocks, and
  small sample-local renderers.
- Register the standalone composition in `src/remotion/Root.tsx`.
- Add a focused smoke guard when the sample becomes a committed source artifact.

### 6. Visual Review

Render representative stills before claiming quality:

```bash
docker compose run --rm web bash -lc 'npx remotion still src/remotion/index.ts <CompositionId> /workspace/out/<slug>-frame-<frame>.png --frame=<frame> --scale=0.5'
```

Inspect for:

- one obvious focal point
- readable main text and target-language visible copy
- safe margins and no subtitle collision
- no overlapping cards, labels, dates, badges, or transition elements
- no blank/broken media
- no cramped dashboard-like clutter
- useful motion states at intro, middle, and ending frames
- evidence scenes use real captures when visible; fallback reasons stay in
  data/handoff, not in the frame

### 7. Render MP4 With Metadata

After stills pass inspection, generate the final video with chapter metadata:

**a) 准备章节元信息 JSON**

在 composition 数据中提取章节信息，写入一个临时 JSON 文件：

```json
{
  "title": "视频标题",
  "description": "视频简介",
  "fps": 30,
  "chapters": [
    { "name": "章节1", "durationInFrames": 750 },
    { "name": "章节2", "durationInFrames": 800 }
  ]
}
```

`chapters[].durationInFrames` 对应每个场景的帧时长，脚本会自动累加计算出 `startTime`。

**b) 渲染并输出结构化的文件夹**

```bash
./scripts/render-video.sh <CompositionId> <slug> <metadata-json-path>
```

输出：

```
out/<slug>/
├── <slug>.mp4    — 渲染视频
└── <slug>.json   — 元信息（标题、简介、章节列表含开始时间）
```

`<slug>.json` 示例：

```json
{
  "title": "Git 教程 | 每个开发者都需要的版本控制",
  "description": "Git 是目前最流行的版本控制系统...",
  "duration": 188.1,
  "durationInFrames": 5643,
  "fps": 30,
  "chapters": [
    { "name": "开场", "startTime": "00:00:00" },
    { "name": "核心价值", "startTime": "00:00:25" },
    { "name": "核心概念", "startTime": "00:00:51" }
  ]
}
```

**c) 验证**

```bash
ffprobe -v error -show_entries format=duration -of csv=p=0 "out/<slug>/<slug>.mp4"
```

### 8. Promote Only After Evidence

After a real sample works:

- Extract shared timing/caption/audio helpers only when reuse is proven.
- Promote reusable visual arrangements into producer blocks or recipes only
  after still/mp4 review.
- Update `.agents/skills/ai-video-studio-agent-producer/remotion-primitives/REMOTION_PRIMITIVES.md`,
  `docs/REMOTION_COMPONENT_LIBRARY.md`, `docs/VISUAL_RECIPE_ROADMAP.md`, and
  `README.md` when a reusable model changes.

## Non-Goals

- Do not route a high-quality producer request back through the one-shot web
  prompt.
- Do not force every local producer video into `VideoProject`.
- Do not treat screenshots alone as the improvement.
- Do not render fallback/source-card evidence as if it were a captured source.
- Do not expose internal production status, capture failures, or fallback
  mechanics in the video frame.
- Do not generate arbitrary provider-authored TSX.
- Do not expose primitive props directly to the LLM.
- Do not model one segment as multiple templates unless a future producer run
  proves the need.
- Do not use CSS animations, CSS transitions, or Tailwind animation utilities
  for render-critical motion.

## Validation

Use the smallest checks that cover the changed boundary:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit --pretty false'
git diff --check
```

Add targeted smokes for:

- new standalone composition registration
- new or changed producer sample
- source-backed scenes that must not show fallback/source-card visuals
- primitive/block usage that the user explicitly asked for

## Handoff Summary

End producer work with:

- topic and output path (`out/<slug>/`)
- why the output is standalone, or why `VideoProject` was explicitly chosen
- primitives/blocks/runtime helpers used
- source assets created and whether they are local-only
- evidence capture attempts: real screenshot path, or failure reason recorded
  outside the video frame
- whether any visible evidence scenes used actual captured screenshots
- TTS/caption status
- stills or render artifacts checked
- metadata JSON path (`out/<slug>/<slug>.json`) with title, description, and
  chapter start times
- validation commands and results
- reusable pieces worth promoting later

## Fixed Production Tools

Use shared tools for mechanical operations in every future sample. **existing finished samples are read-only references**: do not migrate, regenerate,
format, or modify their code, scripts, smokes, narration, audio, captions,
stills, or MP4.

- Audio orchestration and provider adapters: `scripts/lib/producer-audio/`
- Mechanical sample validation:
  `npm run producer:validate -- --module <validation-module>`
- Manifest-driven review stills:
  `npm run producer:stills -- --composition <composition-id>`
- Metadata-bundled mp4 render:
  `./scripts/render-video.sh <composition-id> <slug> <metadata-json>`

The Agent still owns research, narration structure, visual metaphor, scene
composition, motion design, actual still/MP4 review, creative revision, and
promotion judgment. The tools own TTS requests/errors, caption cleanup,
measured duration, metadata/constants/summaries, artifact checks, provider and
fallback checks, and review-frame command execution.

## Production Pitfalls (Updated 2026-07-12)

### Text visibility on dark backgrounds

Every text element on a dark background (especially `#0D1117` or similar) needs
an **explicit `color`** prop. Components like `EntranceHeadline`, scene headline
`div`s, and `<span>` elements in logo badges default to `color: inherit` which
may render as black (invisible on dark). Always set `color: palette.ink`
(`#F0F6FC`) or an accent color explicitly.

### Font sizing at 1920×1080

The `video-layout.md` rule (`headlines 84px at 1080px`) scales to 1920px width.
Actual minimums for a 1920px canvas:

| Role | Size | Example |
|------|------|---------|
| Main headline | 84px+ | `Git 能做什么？` |
| Card title | 28-32px | `版本追踪` |
| Card body | 20-24px | `每一次改动都有记录` |
| Command text | 16-20px | `git init my-project` |
| Labels / tags | 18-22px | `# 版本控制` |
| Caption / subtitle | 30px | Bottom caption overlay |

### Scene density planning

Estimate fill rate before composing. For a 1920×1080 canvas with 60px padding
on each side (1800px usable width):

| Desired fill | Content width | Strategy |
|-------------|--------------|----------|
| 60%+ | 1100-1400px | 2-column grid or wide cards |
| 70%+ | 1400-1600px | Full-width layouts, side panels |
| 80%+ | 1600-1800px | Dense information graphics |

For scenes with vertical lists (tips, steps), expand the list container to
fill horizontal space (1400px+) rather than centering a narrow column.

### Per-scene audio architecture

Each `GitTutorialScene` must have its own `audioFile` pointing to a per-scene
audio file. Do not share one audio file across scenes. The `StandaloneTimeline`
`renderAudio` callback should use `scene.audioFile`; the `renderOverlay` prop
is for a single audio that spans the entire composition (no per-scene timing).

### TTS generation order

1. Write narration beats in `script.ts`
2. Create a generation script (`.mjs`) that calls `POST /api/tts` per scene
3. Generate audio BEFORE locking scene durations
4. Write the resulting `audio.generated.ts` with measured durations
5. Build scene data from the generated metadata
6. Set `GIT_TUTORIAL_DURATION_IN_FRAMES` from the sum of measured durations
