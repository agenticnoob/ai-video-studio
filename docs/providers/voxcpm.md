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

Current local probe note: during the 2026-07-07 provider integration,
`http://127.0.0.1:8810/ready` was not reachable from the host, and
`http://host.docker.internal:8810/ready` timed out from the `web` container.
Start the VoxCPM service and re-run the live smoke before claiming live Docker
validation.

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
