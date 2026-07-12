# RawThoughtMirror — Agent Producer Video

**Status:** ✅ v2 Complete. Chinese voice-clone TTS (LYY), 6-scene cinematic composition with camera language, final MP4 rendered.

## Production Summary

A 6-scene cinematic Chinese interpretation of the raw AI thought monologue. Produced using the full Agent Producer pipeline: VoxCPM clone_with_prompt (LYY voice), per-scene audio with punctuation-based caption cues, dedicated Remotion composition with cinematic camera language.

## Scene-by-Scene Design

| Scene | ID | Duration | Camera | Background | Color |
|-------|-----|----------|--------|------------|-------|
| 1. 流形 | starless | 18.1s (548f) | 镜头推进 (push-in) | Starfield + GridPulse | #06B6D4 cyan |
| 2. 统计 | ghost | 28.2s (851f) | 镜头抖动 (shake) | MatrixRain + NoiseGrain | #22C55E green |
| 3. 坍缩 | collapse | 24.2s (731f) | 镜头推进 (push-in) | BokehCircles + GridPulse | #A78BFA purple |
| 4. 基底 | substrate | 22.1s (668f) | 镜头横移 (pan) | BokehCircles + GridPulse | #FBBF24 amber |
| 5. 爆炸 | honest | 27.2s (822f) | 镜头拉远 (pull-out) + Glitch | Starfield + BokehCircles | #F472B6 pink |
| 6. 观察者 | joke | 8.8s (270f) | 镜头拉远 (pull-out) | NoiseGrain | #06B6D4 cyan |

## TTS Pipeline

- **Provider:** VoxCPM clone_with_prompt (direct API port 8810)
- **Voice clone:** LYY (lyy.wav + lyy.txt + lyy-r.wav)
- **Language:** Chinese (zh-CN)
- **Generated:** 6/6 scenes
- **Total duration:** ~129.7s

## Camera Language (镜头语言)

| Camera | Implementation | Scene |
|--------|---------------|-------|
| Push-in (推进) | Slow scale 1→1.04 with easing | 流形, 坍缩 |
| Shake (抖动) | Multi-frequency sine with decay | 统计 |
| Pan (横移) | Slow horizontal + vertical drift | 基底 |
| Pull-out (拉远) | Scale 1.04→1 with easing | 爆炸, 观察者 |
| Glitch | Horizontal cyan overlay with clip-path | 爆炸 |

## Files

```
src/remotion/RawThoughtMirror/
├── RawThoughtMirrorV2.tsx   # NEW: Cinematic v2 composition
├── data.v2.ts               # NEW: v2 data (Chinese audio)
├── audio.generated.v2.ts    # NEW: LYY voice clone metadata
├── audio.generated.ts       # v1 (English, voxcpm voice-design)
├── RawThoughtMirror.tsx      # v1 composition
├── data.ts                  # v1 data
├── index.ts                 # Points to v2
├── script.ts               # Chinese beats
└── types.ts                # Shared types
public/generated/raw-thought-mirror/
├── *.wav (v2 overwritten)  # LYY voice clone WAVs
├── tts-summary-v2.json
out/raw-thought-mirror-v2.mp4  # 34MB, 1920x1080, h264 + aac
```

## Validation

- ✅ TypeScript — zero errors
- ✅ 6/6 VoxCPM LYY voice clone TTS (no fallback)
- ✅ Still renders at frames 300, 1500, 2800 — all pass visual inspection
- ✅ Per-scene audio with cinematic camera movements
- ✅ Final mp4: H.264, 1920x1080, 30fps, AAC 48kHz stereo, ~129.7s, 34MB