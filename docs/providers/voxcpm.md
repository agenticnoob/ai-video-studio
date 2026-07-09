# VoxCPM TTS Provider

Status: default Agent Producer local provider adapter for the existing
`/data/projects/labs/voxcpm-api` service.

VoxCPM is the default narration provider for Agent Producer work. Plain
text-to-speech uses `/tts`; `voiceClone.enabled` with provider `voxcpm` uses
VoxCPM clone through `/clone_with_prompt` by default. F5-TTS remains available
only when explicitly selected with `TTS_PROVIDER=f5-tts`.

Use `.agents/skills/ai-video-studio-agent-producer/` as the main video
production skill, then load `.agents/skills/ai-video-studio-voxcpm-expression/`
only for VoxCPM narration, voice clone text, control instructions, pacing,
expression tags, caption phrasing, and silence checks.

## Runtime Contract

- `GET /health`: liveness.
- `GET /ready`: readiness; `200` means model loaded, `503` means still loading.
- `POST /tts`: JSON text synthesis, returns `audio/wav`.
- `POST /clone`: multipart clone request with `text` and `reference_audio`.
- `POST /clone_with_prompt`: multipart clone request with `text`,
  `prompt_text`, `prompt_audio`, and optional `reference_audio`.

Default personal deployment:

```txt
http://127.0.0.1:8810
```

When ai-video-studio runs in Docker, verify container-to-host reachability
before using this URL. `host.docker.internal` may require Docker host gateway
mapping and may still not reach a service bound only to host loopback on every
platform.

Current topology note: bridge-mode `web` could not reach the personal service
through `host.docker.internal` while VoxCPM was bound to host loopback. Use
`docker-compose.voxcpm.yml` or `scripts/producer-voxcpm.sh` for the documented
host-network topology.

## Project Contract

```txt
StoryboardSegmentPlan.narration.text + optional voiceClone reference
  -> POST /api/tts provider="voxcpm"
  -> VoxCPM POST /tts, /clone_with_prompt, or /clone
  -> punctuation-split chunk synthesis
  -> trimmed and concatenated local wav under AI_VIDEO_STUDIO_ARTIFACT_ROOT/tts
  -> measured duration + chunk-duration captions
  -> VideoSegment.narration
```

## Expression Guidance

When VoxCPM is used for Agent Producer narration or voice clone, write the
final TTS text with `.agents/skills/ai-video-studio-voxcpm-expression/`.
That skill covers compact control instructions, expressive delivery state,
pacing, and sparse English square-bracket non-language tags such as
`[laughing]`, `[sigh]`, and `[Uhm]`.

Keep the reference transcript exact for voice clone. Use control instructions
and target narration text to adjust delivery; do not use them to change the
speaker identity. If tags leak into generated captions, keep them in the TTS
input but clean or hide them in display captions.

## Caption And Silence Alignment

The current VoxCPM endpoints return `audio/wav` only; they do not return
provider timestamps for individual lines. The ai-video-studio adapter handles
subtitle alignment by splitting narration on punctuation before synthesis,
calling VoxCPM per chunk, trimming leading/trailing PCM silence from each
chunk, concatenating the chunk WAVs, and creating caption cues from measured
chunk durations.

Write narration punctuation intentionally. Chinese and English sentence marks,
commas, semicolons, and colons are subtitle boundaries; decimal model names
such as `GPT-5.6` should stay intact. When a segment has a suspicious tail gap,
verify the generated WAV with `ffmpeg silencedetect` and inspect generated
caption metadata before changing visual timing.

## Config

- `TTS_PROVIDER=voxcpm`
- `VOXCPM_TTS_BASE_URL=http://127.0.0.1:8810` for host-run Next, or a verified
  container-reachable URL for Docker.
- `VOXCPM_TTS_CLONE_MODE=clone_with_prompt` by default. Set `clone` only for
  compatibility with `/clone`.
- `VOXCPM_TTS_CLONE_ENDPOINT` optionally overrides the derived clone endpoint.
- `VOXCPM_TTS_CONTROL` optionally controls voice design.
- `VOXCPM_TTS_CFG_VALUE`, `VOXCPM_TTS_INFERENCE_TIMESTEPS`,
  `VOXCPM_TTS_NORMALIZE`, `VOXCPM_TTS_DENOISE`, `VOXCPM_TTS_SAVE`, and
  `VOXCPM_TTS_FILENAME_PREFIX` map directly to the VoxCPM `/tts` request.

## Validation

```bash
npm run smoke:skill-alignment
npm run smoke:provider-boundary
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:voxcpm-clone-adapter'
scripts/producer-voxcpm.sh ready
scripts/producer-voxcpm.sh up
scripts/producer-voxcpm.sh smoke
```

Clone live validation needs a private local reference audio file:

```bash
VOXCPM_TTS_NEXT_SMOKE_REFERENCE_AUDIO=/absolute/path/to/private-reference.wav \
VOXCPM_TTS_NEXT_SMOKE_REFERENCE_TEXT='exact transcript of the private reference audio' \
scripts/producer-voxcpm.sh smoke-clone
```
