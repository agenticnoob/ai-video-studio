---
name: ai-video-studio-agent-producer
description: Use when working in /data/projects/labs/ai-video-studio and producing or revising any supported local video, narration, cover, review still, render, or publishing artifact.
---

# AI Video Studio Agent Producer

Use this skill for every supported video-production task in this repository.
It is the only supported video-production entrypoint.

Production Chain:

```txt
topic -> research/existing assets -> narration/VoxCPM -> component inventory
-> dedicated Remotion composition -> preflight -> still/mp4 review
-> Remotion `<Still>` covers -> publishing notes
```

Roadmap status: Phase 5 existing-asset supply, Phase 6 Remotion capability core,
and Phase 7 dynamic media/sound are complete with every installed Remotion
package exact `4.0.489`. Phase 8A style-profile contract and showcase are
complete. Phase 8 remains in progress; Phase 8B real-composition proof is next
and has not started.

## Skill Stack

- Use this skill as the workflow authority.
- Load `.agents/skills/remotion-best-practices/` before editing Remotion code.
  Load `rules/video-layout.md` for dense scenes, `rules/subtitles.md` for
  captions, and `rules/silence-detection.md` for audio gaps.
- Load
  `.agents/skills/ai-video-studio-agent-producer/voxcpm-expression/VOXCPM_EXPRESSION.md`
  before final VoxCPM narration, voice-clone text, control instructions, or
  expression tags.
- Run `npm run smoke:remotion-version-gate` before Phase 6 capability work.
  Use Phase 6 capabilities only after inspecting
  `AgentProducerCapabilityShowcase` and running
  `npm run smoke:remotion-capabilities`. Do not add mixed Remotion versions;
  transitions and light leaks are part of the exact `4.0.489` closure.

## Phase 6 Capability Selection

- `getProducerEffectPreset()`: resolve one of the four code-only effect
  treatments below for generated visual surfaces
- `comic-print`: printed panels and editorial emphasis
- `cyber-scan`: terminal, signal, and system-state beats
- `paper-grain`: document and hand-drawn explainer beats
- `pixel-grid`: digital abstraction and state-change beats
- `fitProducerText()`: bounded Chinese or long copy that needs explicit width,
  height, line-count, and `fits` diagnostics
- `editorial-fade`: restrained editorial scene changes
- `directional-slide`: spatial progression with an explicit direction
- `signal-wipe`: system-state or signal handoffs
- `cinematic-film-burn`: a deliberate high-energy cinematic chapter break
- `getProducerTransitionPreset()`: resolve one of the four official
  presentation/timing pairs above
- `getProducerTransitionSeriesDuration()`: calculate total duration from
  adjacent scene overlaps using official timing objects
- `getProducerMediaEffectPreset()`: source-preserving canvas effects for HTML,
  SVG, image, or video content

Import presets from `src/remotion/effects/` and text fitting from
`src/remotion/styles/`; import transition presets and duration accounting from
`src/remotion/transitions/`. These are Producer-owned capabilities, not a
template, recipe, or style-profile selection system. HTML-in-canvas rendering
requires `Config.setAllowHtmlInCanvasEnabled(true)` and the compatible Docker
Producer Chromium runtime. The ignored showcase fixture remains separate from
the reusable Phase 7 media and sound surfaces.

## Phase 7 Media And Sound Selection

- `ProducerLocalVideo`: manifest-backed local video with explicit trim, loop,
  playback rate, crop, and volume behavior; keep Remotion's official
  native-video fallback enabled so LAN HTTP Studio works without WebCodecs
  `VideoDecoder`
- `ProducerAnimatedImage`: local GIF/APNG/AVIF/WebP playback with explicit
  geometry, fit, speed, and loop behavior; GIF uses `@remotion/gif` so LAN HTTP
  Studio does not depend on WebCodecs `ImageDecoder`, while the other formats
  use Remotion `AnimatedImage`
- `ProducerLottie`: local `staticFile()` Lottie loading with render delay and
  expression metadata checked during asset supply/preflight
- `ProducerMotionTreatment`: fixed `camera-natural`, `typography-trail`,
  `icon-trail`, and `particle-trail` motion-blur/trail treatments
- `ProducerSoundtrack`: local BGM, ambience, transition SFX, deterministic
  fades, and narration-window ducking
- `getProducerSoundLibrary()`: resolve only licensed, manifest-backed audio
  entries with explicit narration/BGM/ambience/SFX roles

Import these surfaces from `src/remotion/media/`, `src/remotion/motion/`, and
`src/remotion/sound/`. Run `npm run smoke:producer-media-sound`, then
`producer:assets` and `producer:preflight` before representative stills. Rive
remains unadmitted until an approved local `.riv` asset is proved in a real
maintained sample.

## Phase 8A Style Profile Selection

Call `getProducerStyleProfile()` only after inspecting the six code-only pages
in `AgentProducerCapabilityShowcase` and running
`npm run smoke:producer-style-profiles`:

- `editorial-tech`: thesis-led typography, diagrams, restrained motion, and
  evidence media
- `comic-anime`: panel sequencing, halftone/outline texture, speed accents, and
  existing sprites
- `cinematic-3d`: code geometry or manifest-backed GLB/glTF, motivated camera,
  depth, light, material, and weighted sound
- `retro-terminal`: command rhythm, scanlines, pixel/state transitions, and UI
  signal sound
- `documentary-media`: source-first images/video, maps, quotes, lower thirds,
  restrained motion, and observational sound
- `hand-drawn-explainer`: paper texture, SVG drawings, rough annotations,
  diagram reveals, and organic mark sound

A profile constrains palette, typography, materials, layout grammar, approved
primitives/blocks, effect intensity, transition, motion, media mix, Three.js,
captions, BGM/SFX, and forbidden defaults. It is not a template, recipe,
planner schema, universal scene DSL, or automatic composition builder. The
agent still owns topic-specific structure and may keep a treatment sample-local.
Phase 8B must prove at least two profiles in new real dedicated compositions;
do not retrofit completed or frozen compositions for that evidence.

## Start Here

Read in order:

1. `docs/FINAL_PRODUCT_GOAL.md`
2. `docs/ITERATION_STATUS.md`
3. `docs/AGENT_PRODUCER_ONLY_ROADMAP.md`
4. `docs/REMOTION_COMPONENT_LIBRARY.md`
5. `.agents/skills/ai-video-studio-agent-producer/remotion-primitives/REMOTION_PRIMITIVES.md`

Use CodeGraph before source dependency decisions. Inspect these retained
surfaces before adding new abstractions:

- `src/remotion/catalog/primitive-catalog.ts`
- `src/remotion/primitives/`
- `src/remotion/producer-samples/`
- `src/remotion/standalone-video/`

## Non-Negotiable Boundaries

- Visual production uses code and existing assets only.
- VoxCPM is the only supported narration provider for new work.
- Build one dedicated composition under `src/remotion/<CompositionName>/`.
- Use Remotion Studio and CLI for preview, stills, and MP4 rendering.
- Render covers as code-driven Remotion `<Still>` compositions.
- existing finished samples are read-only references. Do not migrate,
  regenerate, reformat, or modify them merely to adopt new tooling.
- Historical F5-generated audio and provider metadata may remain attached to
  frozen compositions, but never restore F5, a second provider, or a fallback
  path for new work.
- Do not invoke Web generation, an editor workflow, a planner, segment
  regeneration, Web export, image generation, or video generation.

## Visual Construction Rule

Choose the narrowest repo-owned building block that fits:

```txt
existing primitive -> existing block -> sample-local scene/block
-> dedicated composition -> proven effect/transition/style extraction
```

- Inventory existing primitives and blocks before writing new TSX.
- Use `standalone-video` helpers for timeline, captions, audio, and canvas
  profiles when they fit.
- Keep sample-specific content and arrangement inside the dedicated
  composition.
- Extract a reusable primitive, block, effect, transition, or style only after
  at least one real video proves the boundary.
- Never stop at “add screenshots.” Name the component that owns each visual
  beat and the evidence or code-driven graphic it displays.

## Produce The Video

### 1. Define The Job

Write a short production brief containing:

- audience and publishing surface
- duration target and aspect ratio
- language and content family
- factual freshness requirements
- narration-required policy
- expected existing assets and evidence sources
- output slug and local artifact root

Default to a component-composed Remotion video. Do not introduce a universal
scene DSL or a planner-authored component model.

### 2. Research And Collect Existing Assets

Use primary sources when facts may have changed. Capture or localize only the
assets that serve a named narration beat.

Allowed assets include user-supplied files, real screenshots, licensed stock
media, open-source media, local images/video/SVG/audio/fonts, Lottie, Rive,
GLB/glTF, HDRI, and textures.

Every visible non-code asset in a maintained sample must map to a strict
`ProducerAssetManifest` described by `docs/PRODUCER_ASSET_CONTRACT.md`. Use
`public/assets/library/` for reusable reviewed media and
`public/generated/<slug>/assets/` for ignored composition-local working media.

For remote sources:

1. Test one representative URL before automating a capture batch.
2. Record URL, source, creator, license, local path, and capture status.
3. Localize formal render assets before rendering.
4. Keep remote URLs out of committed render-critical components.

Create/localize the declared supply plan, then run preflight before stills:

```bash
npm run producer:assets -- --manifest <supply-plan-json>
npm run producer:preflight -- --composition <composition-id>
```

Store captured/localized working media under ignored paths such as
`public/generated/<slug>/assets/` or `out/<slug>/`. Do not commit generated audio,
captures, stills, covers, or MP4 files unless the user explicitly requests it.

### 3. Evidence Rules

- Attempt real source capture when a claim needs visual proof.
- Admit a screenshot only when it is real, readable at render size, and
  relevant to the narration.
- Store focus metadata for the exact visible claim.
- Use frame-driven push-in, hold, and return motion.
- Render context, focus, and return stills for inspection.
- If capture fails or is unreadable, record the reason outside the frame and
  build an honest code-rendered information graphic.
- Never label an information graphic as a screenshot.
- Never put “fallback”, “capture failed”, or internal production explanations
  in the video frame.

### 4. Write Narration And Generate VoxCPM Audio First

Let measured narration duration own scene timing.

- Read the VoxCPM expression guidance before finalizing TTS text.
- Keep spoken `ttsText` separate from visible `displayText`.
- Use the direct VoxCPM Producer runtime in `scripts/lib/producer-audio/`.
- Call the narration endpoint directly even when `/ready` reports a cold
  `503/loading` state. The service unloads after 10 idle minutes and the first
  real request reloads it automatically; `/ready` is diagnostic, not a gate.
- Select one explicit mode: `voice-design`, `controllable-clone`, or
  `high-fidelity-clone`.
- Use punctuation-split synthesis for punctuation-sized beats.
- Trim leading and trailing silence from every returned chunk.
- Keep returned chunks trimmed and concatenated into one WAV per scene.
- Derive caption cues from measured chunk durations.
- Keep captions readable and free of control instructions or non-language
  expression tags.
- Fail closed when narration is required. Silence is allowed only when the
  sample manifest explicitly declares narration absent.
- Keep private reference audio and exact transcripts under ignored
  `voices/clone/` paths and read them directly from disk.
- Write audio, progress, and summary files under
  `public/generated/<slug>/audio/`.
- Save progress after each completed scene id. A retry reuses a scene only when
  its request fingerprint matches and its WAV still exists.

Required narration must fail closed on connection, timeout, reference,
response-format, empty-audio, or measured-duration errors. Do not select a
provider, upload a private reference, fall back to F5 or another provider, or
present a silent WAV as completed narration.

### 5. Assemble The Dedicated Composition

Keep topic-specific files under `src/remotion/<CompositionName>/`:

```txt
<CompositionName>/
|-- index.ts
|-- <CompositionName>.tsx
|-- types.ts
|-- script.ts
|-- data.ts
|-- audio.generated.ts
|-- validation.ts
`-- cover.tsx
```

Use only the files a composition actually needs. Model facts, narration, scene
data, assets, and generated audio metadata explicitly. Register the video and
cover Stills in `src/remotion/Root.tsx`.

All render-critical motion must use frame-driven Remotion APIs such as
`useCurrentFrame()`, `interpolate()`, `spring()`, `Sequence`, `Series`, and
`TransitionSeries`.

### 6. Preflight And Review Stills

Run structural validation before aesthetic review:

```bash
npm run producer:validate -- --module <validation-module>
npm run producer:stills -- --composition <composition-id>
```

Inspect representative frames for:

- one clear focal point
- readable Chinese/target-language text
- safe margins and no caption collision
- no overlapping cards, labels, dates, badges, or transitions
- no blank, broken, remote, or unlicensed media
- no cramped dashboard-like layout
- useful intro, middle, focus, transition, and ending states
- evidence scenes that truthfully distinguish captures from information
  graphics

Mechanical validators may fail on missing assets, overflow, unsafe margins,
bad codecs, missing audio, clipping, or forbidden references. They must not
claim that a video is aesthetically good.

### 7. Render MP4 And Metadata

After still review:

```bash
./scripts/render-video.sh <composition-id> <slug> <metadata-json>
ffprobe -v error -show_entries format=duration -of csv=p=0 "out/<slug>/<slug>.mp4"
```

Verify H.264/AAC output, dimensions, frame rate, duration, audio presence, and
chapter start times. Watch the final MP4; successful rendering is not visual
approval.

### 8. Generate Covers With Remotion Still

Create two topic-specific registered `<Still>` compositions:

| Output    | Canvas    | Path                               |
| --------- | --------- | ---------------------------------- |
| Landscape | 1920×1080 | `out/<slug>/<slug>-cover-16x9.png` |
| Portrait  | 1080×1920 | `out/<slug>/<slug>-cover-9x16.png` |

Build both from React/HTML/SVG/Canvas, repo primitives, fonts, and
manifest-backed existing assets. The cover expresses the original topic, not
the internal scene list or production workflow.

Inspect both at full size and thumbnail size for text overflow, edge safety,
contrast, factual imagery, and visual hierarchy.

### 9. Promote Only Proven Reuse

After a real sample works, record promotion evidence in the Producer sample
manifest. Extract only the smallest reusable primitive, block, effect,
transition, or style profile. Keep topic facts, narration, and one-off scene
arrangements sample-local.

Update `docs/REMOTION_COMPONENT_LIBRARY.md`, the relevant Skill inventory, and
`docs/AGENT_PRODUCER_ONLY_ROADMAP.md` only when the supported capability set
actually changes.

## Fixed Production Tools

Use shared tools for deterministic work in future samples:

- create a strict maintained manifest and dedicated composition scaffold:
  `npm run producer:scaffold -- --name <CompositionName> --slug <slug>`
- localize manual/URL assets and write checksum/provenance/license metadata:
  `npm run producer:assets -- --manifest <supply-plan-json>`
- fail closed on missing, corrupt, duplicate, undersized, unlicensed, remote,
  or non-normalized media before stills:
  `npm run producer:preflight -- --composition <composition-id>`
- direct VoxCPM transport, audio processing, caption timing, and scene recovery:
  `scripts/lib/producer-audio/`
- focused audio verification: `npm run smoke:producer-audio-direct-voxcpm` and
  `npm run smoke:producer-audio-tools`
- exact Remotion dependency boundary: `npm run smoke:remotion-version-gate`
- effects/text-layout capability boundary: `npm run smoke:remotion-capabilities`
- dynamic-media and sound-design boundary: `npm run smoke:producer-media-sound`
- style-profile contract and showcase boundary: `npm run smoke:producer-style-profiles`
- mechanical validation: `npm run producer:validate -- --module <validation-module>`
- manifest-driven review stills: `npm run producer:stills -- --composition <composition-id>`
- metadata-bundled MP4 and both code-rendered covers:
  `npm run producer:render -- --composition <composition-id>`

Every new maintained sample uses the strict maintained manifest contract under
`src/remotion/producer-samples/`. Existing registry entries are
`frozen-reference` metadata for finished compositions and must not be migrated
or regenerated. A future sample is not complete until its manifest names its
VoxCPM narration, a strict `ProducerAssetManifest`, validation module, review frames, render
metadata, two Remotion Still cover ids, and publishing copy.

The agent owns research, narration structure, visual metaphor, asset choice,
scene composition, motion and sound design, still/MP4 inspection, creative
revision, and promotion judgment.

Tools own request execution, caption cleanup, measured duration, asset
localization, checksum/media/license preflight, metadata, artifact checks,
registration checks, and review-frame command execution.

## Production Pitfalls

### Text And Layout

- Set explicit text colors on dark backgrounds.
- At 1920×1080, use approximately 84px+ main headlines, 28–32px card titles,
  20–24px body text, and 30px captions unless the design system proves another
  scale.
- Prefer a clear editorial composition over a grid of uniformly weighted
  cards.
- Measure long Chinese text and render overflow fixtures before final review.

### Audio

- Give every narrated scene its own audio file and measured duration.
- Generate audio before locking scene duration.
- Do not use one broad caption cue for a paragraph when punctuation-derived
  timing is available.
- Inspect long silence, clipping, and narration/music balance.

### Source Capture

- Stop retrying a blocked domain after representative connectivity checks
  confirm the failure.
- Record the failure promptly and switch to a code-driven information graphic.
- Never leave an empty screenshot slot in the composition.

### Copying A Composition

- Remove unused imports and copied data fields before scene work.
- Re-check component signatures instead of assuming the source sample's API.
- Run Docker TypeScript validation before any still or MP4 render.
- Preserve old compositions as references; create a new composition directory
  for new work.

## Validation

Use the smallest checks covering the changed boundary, then the full gate when
closing a production slice:

```bash
npm run smoke:agent-producer-architecture
npm run smoke:skill-alignment
npm run smoke:producer-assets
npm run smoke:remotion-version-gate
npm run smoke:producer-style-profiles
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npx tsc --noEmit --pretty false'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run lint'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run build'
git diff --check
```

## Handoff Summary

End Producer work with:

- topic, composition id, and `out/<slug>/` path
- narration mode, caption method, and audio verification
- primitives, blocks, effects, transitions, and runtime helpers used
- existing asset provenance and local-only artifact paths
- real capture paths or recorded capture-failure reasons
- representative stills inspected and revisions made
- MP4/ffprobe result and metadata path
- 16:9 and 9:16 Remotion Still cover paths
- validation commands and results
- proven reuse candidates
- known issues and next bounded step
