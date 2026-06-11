# F5-TTS Service Plan

Status: next implementation plan for the in-project F5-TTS runtime service.

This plan starts after the provider adapter and segment-owned captions slice:

- `src/lib/tts/f5.ts` owns the Next.js-side F5 adapter.
- `src/lib/tts/index.ts` can select `f5-tts` or `minimax`.
- `VideoSegment.narration.audio` owns generated audio metadata.
- `VideoSegment.narration.captions` owns segment-local caption cues.
- Preview/export already flatten segment-owned narration audio and captions.

The next step is to add the runtime service that the adapter calls through
`F5_TTS_BASE_URL`.

## Goal

Create a repo-owned F5-TTS service boundary that can run locally through Docker
and satisfy the existing adapter contract:

```txt
Next staged generation
  -> src/lib/tts/f5.ts
  -> F5-TTS HTTP service
  -> local audio artifact + optional alignment/captions
  -> segment-owned narration data
```

The service is an execution backend, not a new product model. The stable
contract remains the project-owned HTTP API consumed by `src/lib/tts/f5.ts`.
The implementation behind that API can wrap upstream F5-TTS CLI/library code,
a local Python process, or a GPU-enabled container.

## Service Shape

Preferred first service:

- a separate Docker Compose service named `f5-tts`
- Python/FastAPI or similar small HTTP wrapper
- mounted model/cache directory so checkpoints are not committed to Git
- mounted reference-voice directory for local voice profiles
- generated response returned to the Next app as JSON with base64 audio or a
  route/downloadable URL
- health endpoint for startup checks and smoke tests

Recommended repo paths:

```txt
services/f5-tts/
  Dockerfile
  app/
    main.py
    schemas.py
    synthesize.py
  requirements.txt
  README.md

docker-compose.f5.yml
scripts/f5-tts-smoke.sh
```

Do not put model checkpoints, generated audio, or private reference voices in
Git. Use ignored local directories such as:

```txt
models/f5-tts/
voices/f5-tts/
out/tts/
```

## HTTP Contract

The service should implement the project-owned contract already expected by
`src/lib/tts/f5.ts`.

### `GET /health`

Response:

```json
{
  "ok": true,
  "provider": "f5-tts",
  "modelLoaded": true
}
```

### `POST /synthesize`

Request:

```json
{
  "text": "Narration text",
  "language": "en",
  "voiceId": "default",
  "voice_id": "default",
  "referenceAudio": "/voices/f5-tts/default.wav"
}
```

The service may ignore duplicated `voiceId` / `voice_id`; both are sent for
runtime compatibility.

Preferred response:

```json
{
  "audio_base64": "<base64 wav or mp3>",
  "format": "wav",
  "language": "en",
  "captions": {
    "cues": [
      {
        "id": "cue-1",
        "text": "Narration text",
        "startSeconds": 0,
        "endSeconds": 2.4
      }
    ]
  }
}
```

Accepted response alternatives:

- direct `audio/*` response body
- JSON `audio`, `audioBase64`, or `audio_base64`
- JSON `audioUrl` or `audio_url`
- optional captions under `captions`, `captions.cues`, `alignment`,
  `alignment.cues`, `alignment.words`, or `alignment.segments`

If the service cannot return alignment yet, it should still return valid audio.
The Next adapter already creates deterministic fallback captions from narration
text and measured audio duration.

## Docker And Environment

The web service should not embed the F5 model runtime. Keep the Next.js app
small and call the local runtime over HTTP.

Suggested local env:

```bash
TTS_PROVIDER=f5-tts
F5_TTS_BASE_URL=http://f5-tts:7865
F5_TTS_ENDPOINT=http://f5-tts:7865/synthesize
F5_TTS_VOICE_ID=default
F5_TTS_FORMAT=wav
F5_TTS_REFERENCE_AUDIO=/voices/f5-tts/default.wav
F5_TTS_FALLBACK_TO_MINIMAX=true
```

Suggested host smoke env:

```bash
F5_TTS_BASE_URL=http://127.0.0.1:7865
```

The service compose file should be opt-in so normal app development does not
download models or require GPU support:

```bash
docker compose -f docker-compose.yml -f docker-compose.f5.yml up f5-tts web
```

## Implementation Order

1. Add the `services/f5-tts/` HTTP wrapper with `/health` and `/synthesize`.
2. Add `docker-compose.f5.yml` as an optional service overlay.
3. Add ignored local model/reference-voice directories to `.gitignore`.
4. Add `.env.example` entries for F5 service runtime configuration.
5. Add `scripts/f5-tts-smoke.sh` that calls `/health` and `/synthesize`.
6. Add a provider-backed staged smoke path that sets `TTS_PROVIDER=f5-tts`
   and confirms:
   - generated audio lands under `out/tts/...`
   - `/api/tts/assets/...` serves the audio with byte-range support
   - generated project segments contain narration audio and captions
   - `/api/render` can export a project using the F5-generated audio
7. Update docs only after the runtime smoke has passed.

## Validation

Minimum validation for the service slice:

```bash
docker compose -f docker-compose.yml -f docker-compose.f5.yml up -d f5-tts
scripts/f5-tts-smoke.sh
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run build'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'
git diff --check
```

Provider-backed live smoke should be added once a local model/runtime is
available on the workstation. Until then, keep MiniMax fallback enabled so the
existing staged generation loop stays usable.

## Non-Goals

- no bundled model checkpoints in Git
- no mandatory GPU requirement for normal `web` development
- no subtitle editor, waveform editor, beat sync, or DAW-style audio UI
- no provider marketplace
- no template-private subtitle model
- no persistence/history expansion
- no broad media-layer editor work

## Open Decisions

- whether the first local runtime should target CPU-compatible smoke only or
  require a GPU profile
- which upstream F5-TTS invocation path is most stable on this workstation
- where local reference voices should live outside Git
- whether alignment should come directly from F5 output or a second local
  alignment helper when the selected runtime only returns audio
