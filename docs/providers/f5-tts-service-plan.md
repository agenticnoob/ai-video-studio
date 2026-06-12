# F5-TTS Service Plan

Status: runtime service, Next provider, deterministic staged smoke, and real
GPU-backed F5 mode validation added.

This plan starts after the provider adapter and segment-owned captions slice:

- `src/lib/tts/f5.ts` owns the Next.js-side F5 adapter.
- `src/lib/tts/index.ts` can select `f5-tts` or `minimax`.
- `VideoSegment.narration.audio` owns generated audio metadata.
- `VideoSegment.narration.captions` owns segment-local caption cues.
- Preview/export already flatten segment-owned narration audio and captions.

The current service wrapper can be started through `F5_TTS_BASE_URL` in
contract-smoke mode without downloading a model. It proves the HTTP boundary,
Docker overlay, and smoke script before a real F5 checkpoint is installed.
`scripts/f5-tts-next-smoke.sh` also proves the Next adapter, local artifact
writing, duration probing, caption normalization, and byte-range asset serving
through `POST /api/tts`.
`npm run smoke:f5-staged` proves a deterministic staged project can assemble
segment-owned F5 narration assets without MiniMax planner/compiler calls.
`F5_TTS_SERVICE_MODE=f5` switches the service from generated smoke audio to
the local F5 checkpoint under `models/f5-tts/`.
With the local checkpoint, vocab, and Vocos vocoder present, the same smoke
path now validates real GPU-backed F5 synthesis end to end.

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

Current first service:

- a separate Docker Compose service named `f5-tts`
- Python/FastAPI HTTP wrapper under `services/f5-tts/`
- mounted model/cache directory so checkpoints are not committed to Git
- mounted reference-voice directory for local voice profiles
- generated response returned to the Next app as JSON with base64 audio
- health endpoint for startup checks and smoke tests
- default `contract-smoke` mode returns a generated WAV and deterministic
  fallback caption cues; it does not run a real F5-TTS checkpoint yet
- real `f5` mode loads `F5_TTS_MODEL_PATH` and `F5_TTS_VOCAB_PATH` lazily on
  the first `/synthesize` request
- real `f5` mode uses `F5_TTS_VOCODER_PATH` for the local Vocos vocoder and
  logs `/synthesize` failures with tracebacks for runtime diagnosis

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
out/voice-references/
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
  "modelLoaded": false,
  "mode": "contract-smoke"
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
  "referenceAudio": "/voices/f5-tts/default.wav",
  "referenceText": "Transcript that matches the reference audio"
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
The runtime fallback splits captions by Chinese/English sentence punctuation
and comma punctuation, merging short comma chunks forward for readability.
The Next adapter then normalizes those cues, or creates deterministic fallback
captions from narration text and measured audio duration when the runtime
returns no usable cues.

The Next TTS path also saves the final normalized caption payload next to the
generated audio under `out/tts/...` as `<audio-name>.captions.json`, so the
artifact on disk matches the `VideoSegment.narration.captions` data used by
preview/export.

In the current contract-smoke wrapper, the returned audio is synthetic test WAV
data and `modelLoaded` is false. Do not treat this as real F5 synthesis.

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
F5_TTS_VOICE_REFERENCE_RUNTIME_DIR=/voice-references
F5_TTS_FALLBACK_TO_MINIMAX=true
F5_TTS_SERVICE_MODE=f5
F5_TTS_MODEL_PATH=/models/f5-tts/model_1250000.safetensors
F5_TTS_VOCAB_PATH=/models/f5-tts/vocab.txt
F5_TTS_VOCODER_PATH=/models/f5-tts/vocos-mel-24khz
F5_TTS_ALLOW_VOCODER_DOWNLOAD=false
F5_TTS_NFE_STEP=16
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

GPU mode is an additional explicit overlay:

```bash
scripts/f5-tts-real.sh up-build
```

`scripts/f5-tts-real.sh` applies `docker-compose.f5.gpu.yml`, rebuilds only the
`f5-tts` image when requested, and recreates only the `f5-tts` container. The
helper forces `F5_TTS_SERVICE_MODE=f5`, defaults `F5_TTS_DEVICE=cuda`, and the
GPU overlay requests all visible GPUs. It requires a working host NVIDIA driver
plus Docker NVIDIA runtime. Use CPU only for diagnostics or systems without GPU
access.

Do not use the plain `docker-compose.f5.yml` overlay for user-facing F5
narration checks. That overlay intentionally defaults to `contract-smoke`, so
it is useful for HTTP-contract validation but not for real narration timing or
sound quality.

Validated local state:

- Docker can expose one `NVIDIA GeForce RTX 5060` to the `f5-tts` container.
- `models/f5-tts/model_1250000.safetensors`, `models/f5-tts/vocab.txt`, and
  `models/f5-tts/vocos-mel-24khz/` are sufficient for local real-mode
  validation.
- `out/voice-references/` is mounted read-only into the F5 container at
  `/voice-references` so page-uploaded voice clone references can be used by
  real-mode synthesis.
- `scripts/f5-tts-smoke.sh` passed against real `mode=f5` output with
  `modelLoaded=true`.
- `scripts/f5-tts-next-smoke.sh` passed against the Next `/api/tts` adapter,
  local audio artifact writing, duration probing, captions, and byte-range
  serving.
- `npm run smoke:f5-staged` passed for deterministic mixed `scripted` +
  `spotlight` assembly using real F5 narration.
- `F5_TTS_STAGED_SMOKE_RENDER=true npm run smoke:f5-staged` passed and
  produced an exported MP4 through `/api/render`.

## Implementation Order

1. Add the `services/f5-tts/` HTTP wrapper with `/health` and `/synthesize`.
   Status: implemented for contract-smoke mode.
2. Add `docker-compose.f5.yml` as an optional service overlay.
   Status: implemented.
3. Add ignored local model/reference-voice directories to `.gitignore`.
   Status: implemented.
4. Add `.env.example` entries for F5 service runtime configuration.
   Status: implemented.
5. Add `scripts/f5-tts-smoke.sh` that calls `/health` and `/synthesize`.
   Status: implemented.
6. Add a provider-backed Next narration smoke path that sets
   `TTS_PROVIDER=f5-tts` and calls `POST /api/tts`.
   Status: implemented by `scripts/f5-tts-next-smoke.sh`.
7. Add a deterministic provider-backed staged smoke path that sets
   `TTS_PROVIDER=f5-tts` without MiniMax planner/compiler calls.
   Status: implemented by `npm run smoke:f5-staged`.
8. Add a live provider-backed staged route smoke for `POST /api/generate/staged`
   when MiniMax planner/compiler configuration is available, and confirm:
   Status: implemented by `npm run smoke:staged-live`; the command skips with
   exit 0 when `MINIMAX_API_KEY` or `F5_TTS_BASE_URL` is missing.
   - generated audio lands under `out/tts/...`
   - generated normalized caption JSON lands beside the audio as
     `<audio-name>.captions.json`
   - `/api/tts/assets/...` serves the audio with byte-range support
   - generated project segments contain narration audio and captions
   - `/api/render` can export a project using the F5-generated audio
9. Replace or extend contract-smoke synthesis with a real local F5 invocation.
   Status: implemented and validated locally through the GPU overlay with the
   downloaded checkpoint, vocab, and Vocos vocoder.

The deterministic smoke already confirms generated audio under `out/tts/...`,
byte-range serving for `/api/tts/assets/...`, segment-owned narration audio and
captions, and optional `/api/render` export when
`F5_TTS_STAGED_SMOKE_RENDER=true` is set.

## Validation

Minimum validation for the service slice:

```bash
docker compose -f docker-compose.yml -f docker-compose.f5.yml up -d f5-tts
scripts/f5-tts-smoke.sh
docker compose -f docker-compose.yml -f docker-compose.f5.yml up -d web
scripts/f5-tts-next-smoke.sh
npm run smoke:f5-staged
npm run smoke:staged-live
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run build'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'
git diff --check
```

Provider-backed live smoke against `POST /api/generate/staged` is implemented
as `npm run smoke:staged-live`. It still depends on MiniMax planner/compiler
configuration and `F5_TTS_BASE_URL`; when either is missing, it prints a clear
skip reason and exits successfully. The deterministic staged smoke remains the
bounded no-MiniMax validation path for real F5 narration, captions, asset
serving, and export.

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
