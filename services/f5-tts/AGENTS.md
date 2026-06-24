# F5-TTS SERVICE KNOWLEDGE BASE

**Generated:** 2026-06-24 13:26:24 +0800

## OVERVIEW

`services/f5-tts` is an opt-in FastAPI runtime for the project-owned F5-TTS
HTTP boundary. It supports `contract-smoke` mode for deterministic adapter
validation and `f5`/real mode for local model synthesis.

## STRUCTURE

```txt
services/f5-tts/
|-- app/main.py        # FastAPI app, health and synthesize routes
|-- app/schemas.py     # Pydantic request/response contract
|-- app/synthesize.py  # contract-smoke audio, fallback captions, real F5 load
|-- Dockerfile
|-- requirements.txt
`-- README.md
```

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| HTTP routes | `app/main.py` | `/health`, `/synthesize`, semaphore guard. |
| Wire contract | `app/schemas.py` | Field aliases consumed by Next adapter. |
| Contract-smoke audio | `app/synthesize.py` | Generated WAV and fallback cues. |
| Real model setup | `app/synthesize.py`, `README.md` | Model/vocab/vocoder paths. |
| Docker runtime | `Dockerfile`, root compose overlays | Contract and GPU modes. |

## CONVENTIONS

- Keep the HTTP contract stable for `src/lib/tts/f5.ts`.
- Default mode is `contract-smoke`; real mode is explicit via
  `F5_TTS_SERVICE_MODE=f5`.
- Keep `F5_TTS_RUNTIME_CONCURRENCY=1` for real GPU synthesis unless there is
  measured evidence to change it.
- Model checkpoints, vocoders, and private voices live outside Git under ignored
  local directories such as `models/f5-tts/` and `voices/f5-tts/`.
- If real F5 has no alignment, return normalized fallback caption cues instead
  of inventing a separate subtitle-generation stage.
- Pydantic aliases such as `modelLoaded` and `modelConfigured` are part of the
  route contract.

## ANTI-PATTERNS

- Do not silently switch real F5 failures to MiniMax or another provider here.
- Do not require Hugging Face/runtime downloads by default; outbound access may
  be unavailable.
- Do not commit model files, reference voices, generated audio, or pycache.
- Do not change field names without updating the Next adapter and smokes.
- Do not remove the semaphore guard around `/synthesize`.

## VALIDATION

```bash
docker compose -f docker-compose.yml -f docker-compose.f5.yml up -d f5-tts
scripts/f5-tts-smoke.sh
NEXT_ORIGIN=http://127.0.0.1:3000 scripts/f5-tts-next-smoke.sh
docker compose exec -T web npm run smoke:f5-staged
```

Use `scripts/f5-tts-real.sh up-build` only when the host Docker runtime exposes
an NVIDIA driver and the local model/vocoder files exist.
