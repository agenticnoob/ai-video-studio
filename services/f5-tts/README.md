# F5-TTS Runtime Service

Status: opt-in wrapper with two modes:

- `contract-smoke`: no model load; returns generated WAV test audio.
- `f5`: loads the local F5 checkpoint and runs real synthesis.

This service exists to make the project-owned HTTP boundary concrete before
model setup is introduced:

- `GET /health`
- `POST /synthesize`

Contract-smoke mode returns a small generated WAV and fallback caption cues.
This is enough for `src/lib/tts/f5.ts` to verify request/response shape,
artifact writing, duration probing, and caption normalization without loading
model weights. It is not real narration and can sound like a continuous test
tone.

Run it with:

```bash
docker compose -f docker-compose.yml -f docker-compose.f5.yml up -d f5-tts
scripts/f5-tts-smoke.sh
```

Real F5-TTS model checkpoints and private reference voices should live outside
Git, under ignored local directories such as:

```txt
models/f5-tts/
voices/f5-tts/
```

Real mode keeps the same HTTP contract consumed by the Next.js adapter.

Run real mode with local model files:

```bash
scripts/f5-tts-real.sh up-build
scripts/f5-tts-smoke.sh
```

Default real-mode paths:

```txt
F5_TTS_MODEL_PATH=/models/f5-tts/model_1250000.safetensors
F5_TTS_VOCAB_PATH=/models/f5-tts/vocab.txt
F5_TTS_VOCODER_PATH=/models/f5-tts/vocos-mel-24khz
```

Real mode also needs a local Vocos vocoder. Download `charactr/vocos-mel-24khz`
under `models/f5-tts/vocos-mel-24khz/`, or explicitly allow runtime download:

```bash
F5_TTS_ALLOW_VOCODER_DOWNLOAD=true
```

Runtime download is disabled by default because this workstation's service
container may not have outbound Hugging Face access.

GPU real mode can be started with:

```bash
scripts/f5-tts-real.sh up-build
```

`scripts/f5-tts-real.sh` applies the GPU overlay, forces
`F5_TTS_SERVICE_MODE=f5`, defaults `F5_TTS_DEVICE=cuda`, and requests Docker
GPU access. CPU mode is useful for diagnostics, but GPU is the preferred
runtime for real synthesis.

The runtime service also accepts:

```bash
F5_TTS_RUNTIME_CONCURRENCY=1
```

Keep this at `1` for real GPU synthesis. It protects the FastAPI `/synthesize`
endpoint even when someone calls the F5 service directly instead of going
through the Next app's TTS boundary.

If `F5_TTS_DEFAULT_REFERENCE_AUDIO` is unset, the service uses the default
English reference WAV bundled with the `f5-tts` Python package plus the
upstream example reference text. For a local voice, mount
`voices/f5-tts/default.wav` and set:

```bash
F5_TTS_DEFAULT_REFERENCE_AUDIO=/voices/f5-tts/default.wav
F5_TTS_DEFAULT_REFERENCE_TEXT="Transcript of the reference audio."
```

Validated local real-mode checks:

```bash
F5_TTS_BASE_URL=http://127.0.0.1:7865 scripts/f5-tts-smoke.sh
NEXT_ORIGIN=http://127.0.0.1:3000 scripts/f5-tts-next-smoke.sh
docker compose exec -T web npm run smoke:f5-staged
docker compose exec -T web bash -lc 'F5_TTS_STAGED_SMOKE_RENDER=true npm run smoke:f5-staged'
```
