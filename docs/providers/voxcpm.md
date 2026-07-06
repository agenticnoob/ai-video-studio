# VoxCPM TTS Provider

Status: default Agent Producer local provider adapter for the existing
`/data/projects/labs/voxcpm-api` service.

VoxCPM is the default narration provider for Agent Producer work. Plain
text-to-speech uses `/tts`; `voiceClone.enabled` with provider `voxcpm` uses
VoxCPM clone through `/clone_with_prompt` by default. F5-TTS remains available
only when explicitly selected with `TTS_PROVIDER=f5-tts`.

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
  -> local wav under AI_VIDEO_STUDIO_ARTIFACT_ROOT/tts
  -> measured duration + fallback captions
  -> VideoSegment.narration
```

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
