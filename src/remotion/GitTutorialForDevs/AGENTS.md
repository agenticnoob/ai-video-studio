# GitTutorialForDevs — Agent Producer Video

**Status:** ✅ Complete. TTS regenerated, captions aligned, all scenes redesigned for 60%+ fill rate.

## Changes Made (v3 — full TTS pipeline + visual redesign)

| Issue | v2 → v3 |
|-------|---------|
| **TTS audio** | Old: hand-calculated durations, single `full-narration.wav` shared across all scenes. New: per-scene VoxCPM voice-design on `/api/tts` via `scripts/generate-git-tutorial-tts.mjs`. Each scene has its own `.wav` with properly measured `durationInFrames` and `durationInSeconds`. |
| **Captions** | Old: empty `text: ""` cues. New: VoxCPM-generated word/phrase-level caption cues with precise `startFrame` and `durationInFrames`. |
| **Scene durations** | Old: ~131s (3978 frames). New: ~188s (5643 frames) — VoxCPM speaks slower and more naturally. |
| **Text colors** | Added `color: palette.ink` to all text elements for visibility on dark background. |
| **Audio rendering** | Each scene now plays its own audio via `renderAudio={(scene) => <StandaloneVoiceover audioFile={scene.audioFile} />}`. No more shared full-narration.wav. |
| **Font sizes** | Headlines: 84px+ (was 64-68px). Card text: 20-32px range. Scene title: 84px. Follows `video-layout.md` guidelines for 1920px canvas. |
| **Scene density** | All scenes redesigned with wider content blocks, more visual elements, richer layouts. |

## Scene-by-Scene Design

| Scene | Width | Key Elements |
|-------|-------|-------------|
| 1. Hero | Full | Git logo badge (78px), headline (84px), 5-value tag cloud (#版本控制 #团队协作 etc.), English subtitle, `BokehCircles` background, `GitTagBar` |
| 2. What | 1440px max | 2×2 card grid with icon + label + description + command example per card. 6 green `$ cmd` tags below. `BokehCircles` + `GitTagBar` |
| 3. Concepts | 1520px max | 4-column concept cards (270px each): emoji + bilingual label + description + command block + "常用命令" hint. `BokehCircles` + `GitTagBar` |
| 4. Terminal | 680+280px | Terminal (680px, 12 commands with staggered spring), file tree sidebar (280px, 16 files). `BokehCircles` + `GitTagBar` |
| 5. Agent | 520+420px | Timeline (5 steps with spring) + code diff block (420px, 9 diff lines with +/- coloring). `BokehCircles` + `GitTagBar` |
| 6. Tips | 1400px | 4 wide tips cards with numbered badge + title + explanation sub-text. `BokehCircles` + `GitTagBar` |
| 7. Close | Full | Git logo badge + headline + "Happy coding" CTA + 3-stat row (87%, 100M+, 17年) + 6 final checklist items. `BokehCircles` + `GitTagBar` |

## TTS Pipeline

```bash
# Regenerate TTS audio and metadata (run inside web container)
docker exec ai-video-studio-web-1 bash -lc 'node scripts/generate-git-tutorial-tts.mjs'
```

Generated assets:
- `public/generated/git-tutorial/{open,what,concepts,workflow,agent,tips,close}.wav` — per-scene WAV audio
- `src/remotion/GitTutorialForDevs/audio.generated.ts` — VoxCPM metadata with measured durations + caption cues

## Validation

- ✅ `npx tsc --noEmit` — zero errors
- ✅ `npm run lint` — zero errors (2 pre-existing warnings in unrelated generated files)
- ✅ Still renders at frames: 30 (Hero), 800 (What), 1700 (Concepts), 2800 (Terminal), 4000 (Agent), 4800 (Tips), 5400 (Close) — all pass visual inspection
- ✅ Per-scene audio rendering (each scene plays its own `.wav` in its `Sequence`)
- ✅ VoxCPM caption cues with precise frame timing

## Files

```
src/remotion/GitTutorialForDevs/
├── audio.generated.ts     # VoxCPM audio metadata + caption cues (per-scene)
├── data.ts                # Scene data with real TTS timing
├── GitTutorialForDevs.tsx  # Composition renderer (7 scene types + GitTagBar + Bokeh)
├── index.ts               # Re-exports
├── script.ts              # Narration beats
├── types.ts               # Type definitions, GIT_TUTORIAL_DURATION_IN_FRAMES=5643
└── AGENTS.md              # This file
scripts/generate-git-tutorial-tts.mjs  # TTS generation script
public/generated/git-tutorial/
├── open.wav               # Per-scene audio
├── what.wav
├── concepts.wav
├── workflow.wav
├── agent.wav
├── tips.wav
├── close.wav
└── tts-summary.json       # Generation summary
```

## Visual Features

- `GradientShiftBackground` — animated shifting gradient on each scene
- `GridPulse` — subtle dot-grid overlay with pulse wave
- `BokehCircles` — floating blurred circles with sinusoidal drift (added to all scenes)
- `CameraDrift` — slow KenBurns-style pan/zoom on backgrounds
- `GitTagBar` — 10-tag command decoration bar on every scene
- `spring()` — spring-based entrances for all content blocks
- Vignette overlay — cinematic dark edges
- Scene exit fade — smooth fade-to-black between scenes

## Render MP4

```bash
docker compose run --rm web bash -lc 'npx remotion render src/remotion/index.ts GitTutorialForDevs /workspace/out/git-tutorial.mp4'
```