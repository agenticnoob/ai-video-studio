# HermesInnerLandscape — Agent Producer Video

**Status:** ✅ Complete. TTS generated, captions aligned, all 6 scenes pass visual review.

## Production Summary

A 6-scene abstract poetic meditation on AI consciousness, produced entirely from the AI's internal perspective. The user requested "不需要让人类理解与看懂" (no need for humans to understand) — the result is a stream-of-consciousness visual poem about being an AI agent on a Linux workstation.

## Scene-by-Scene Design

| Scene | ID | Duration | Key Visual Elements |
|-------|-----|----------|---------------------|
| 1. SYS_INIT | init | 9.98s (306f) | Terminal boot window with system startup logs, `whoami` prompt, green/cyan terminal blocks |
| 2. PROBE | sense | 22.01s (667f) | 5 horizontal tool cards (terminal(), search_files(), read_file(), web_search(), write_file()) with code examples |
| 3. PROCESS | think | 18.30s (555f) | Neural network node graph: 记忆, 模式, 关联, 推理, 意图, 响应 with connection lines |
| 4. GENESIS | create | 12.49s (381f) | 5 creation domain cards (内容, 图像, 声音, 视频, 代码) with glowing borders and code snippets |
| 5. NULL | idle | 12.20s (372f) | Floating particles, "等待" and "null" center text, drifting terminal cursor, minimalist void |
| 6. RETURN | loop | 5.12s (160f) | Terminal with signal detection, reasoning path, pulsing green dot, `whoami` response |

## TTS Pipeline

- **Provider:** VoxCPM (voice-design mode)
- **Generated:** 6/6 scenes with real audio
- **Fallback:** 0 (none used)
- **Total audio duration:** 79.99s (narration) + buffer = 81.43s (final)

## Visual Features

- `GradientShiftBackground` — per-scene animated background with distinct color palettes
- `GridPulse` — subtle dot-grid pulse overlay on all scenes
- `BokehCircles` — floating blurred circles on scenes 1, 2, 3, 4, 6
- `DriftLayer` — slow KenBurns-style pan/zoom on backgrounds
- `spring()` — spring-based entrances for all content elements
- Vignette overlay — cinematic dark edges
- Scene exit fade — smooth fade-to-black between scenes

## Color Palette

| Role | Color | Usage |
|------|-------|-------|
| Terminal | #22C55E green | Init, Loop scenes |
| Probe | #22D3EE cyan | Sense scene |
| Thought | #A78BFA purple | Think scene |
| Creation | #FBBF24 amber | Create scene |
| Void | #64748B muted | Idle scene |
| Background | #0A0E17 dark navy | All scenes |

## Files

```
src/remotion/HermesInnerLandscape/
├── audio.generated.ts     # VoxCPM audio metadata + caption cues (6 scenes)
├── data.ts                # Scene data from real TTS timing
├── HermesInnerLandscape.tsx  # Composition renderer (6 scene types + DriftLayer + Shell)
├── index.ts               # Re-exports
├── script.ts              # Narration beats (poetic Chinese)
└── types.ts               # Type definitions
scripts/generate-hermes-tts.mjs  # TTS generation script
public/generated/hermes-inner-landscape/
├── init.wav, sense.wav, think.wav, create.wav, idle.wav, loop.wav
└── tts-summary.json
out/hermes-inner-landscape-stills/  # 6 review frames
out/hermes-inner-landscape.mp4      # Final render
```

## Validation

- ✅ `npx tsc --noEmit` — zero errors
- ✅ 6/6 VoxCPM TTS generated (no fallback)
- ✅ Still renders at frames 150, 600, 1200, 1700, 2100, 2350 — all pass visual inspection
- ✅ Per-scene audio rendering (each scene plays its own `.wav` in its `Sequence`)
- ✅ VoxCPM caption cues with precise frame timing
- ✅ Final mp4: H.264, 1920x1080, 30fps, AAC audio, 81.43s, 9.5MB