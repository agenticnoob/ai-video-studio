# VoxCPM TTS Provider

Status: local provider adapter for the existing `/data/projects/labs/voxcpm-api`
service.

VoxCPM is a selectable narration provider for ordinary text-to-speech. It is
not the voice-clone provider in this project slice; `voiceClone.enabled`
continues to force F5-TTS.

## Runtime Contract

- `GET /health`: liveness.
- `GET /ready`: readiness; `200` means model loaded, `503` means still loading.
- `POST /tts`: JSON text synthesis, returns `audio/wav`.

Default personal deployment:

```txt
http://127.0.0.1:8810
```

When ai-video-studio runs in Docker, verify container-to-host reachability
before using this URL. `host.docker.internal` may require Docker host gateway
mapping and may still not reach a service bound only to host loopback on every
platform.

Current local probe note: during the 2026-07-07 provider integration, host
readiness passed at `http://127.0.0.1:8810/ready`. The bridge-mode `web`
container still timed out at `http://host.docker.internal:8810/ready`, because
the VoxCPM service binds host loopback. A temporary host-network Next server on
`http://127.0.0.1:3010` passed `npm run smoke:voxcpm-next` with
`VOXCPM_TTS_BASE_URL=http://127.0.0.1:8810`, generating a VoxCPM WAV and
verifying byte-range serving.

## Project Contract

```txt
StoryboardSegmentPlan.narration.text
  -> POST /api/tts provider="voxcpm"
  -> VoxCPM POST /tts
  -> local wav under AI_VIDEO_STUDIO_ARTIFACT_ROOT/tts
  -> measured duration + fallback captions
  -> VideoSegment.narration
```

## Config

- `TTS_PROVIDER=voxcpm`
- `VOXCPM_TTS_BASE_URL=http://127.0.0.1:8810` for host-run Next, or a verified
  container-reachable URL for Docker.
- `VOXCPM_TTS_CONTROL` optionally controls voice design.
- `VOXCPM_TTS_CFG_VALUE`, `VOXCPM_TTS_INFERENCE_TIMESTEPS`,
  `VOXCPM_TTS_NORMALIZE`, `VOXCPM_TTS_DENOISE`, `VOXCPM_TTS_SAVE`, and
  `VOXCPM_TTS_FILENAME_PREFIX` map directly to the VoxCPM `/tts` request.

## Validation

```bash
npm run smoke:provider-boundary
VOXCPM_TTS_BASE_URL=http://127.0.0.1:8810 NEXT_ORIGIN=http://127.0.0.1:3000 npm run smoke:voxcpm-next
```
