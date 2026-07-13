# VoxCPM TTS Provider

Upstream authority: VoxCPM 2 Usage Guide,
`https://voxcpm.readthedocs.io/zh-cn/latest/usage_guide.html`.

Use `.agents/skills/ai-video-studio-agent-producer/` for the production flow and
`.agents/skills/ai-video-studio-agent-producer/voxcpm-expression/VOXCPM_EXPRESSION.md` for mode, text, expression,
and quality decisions.

## Official Model Modes

- `voice-design`: no reference audio; parenthesized control instruction can
  design a voice, but independent calls are not guaranteed to keep one random
  speaker identity.
- `controllable-clone`: reference audio preserves timbre and control can adjust
  speed/emotion/style. A transcript is not required upstream.
- `high-fidelity-clone`: requires reference audio plus an exact transcript;
  control instructions are ignored.

Prefer clean single-speaker reference audio around 5–30 seconds.

## Parameters

- `cfg_value`: conditioning strength; start at `2`.
- `inference_timesteps`: quality/latency tradeoff; start at `10`.
- `normalize`: default `true`.
- `denoise`: default `false`; use only for noisy reference audio.
- `retry_badcase`: default `true`; retries obvious bad generations.

Tune reference quality, mode, text, and punctuation before changing parameters.

## Repo Adapter Contract

The repo adapter is not the complete upstream VoxCPM API.

```txt
Agent Producer generator
  -> scripts/lib/producer-audio/ VoxCPM request plan
  -> POST /api/tts provider="voxcpm"
  -> current /tts, /clone, or /clone_with_prompt compatibility
  -> punctuation-split chunk synthesis
  -> PCM silence trimming + WAV concatenation
  -> measured duration + duration-derived captions
```

Punctuation splitting, silence trimming, WAV concatenation, and caption timing
are repository adapter behavior. VoxCPM does not return the per-line timestamps
used by this project.

The current uploaded-reference `/api/tts` schema requires `referenceId` and
`referenceText` together. Therefore it cannot directly express upstream
controllable clone without a transcript. Report this as a repo adapter
limitation, not a VoxCPM limitation. Hi-Fi-compatible clone requires exact
reference text and ignores control.

## Runtime And Config

- `TTS_PROVIDER=voxcpm`
- `VOXCPM_TTS_BASE_URL=http://192.168.50.6:8810`
- `VOXCPM_TTS_CLONE_MODE=clone_with_prompt`
- `VOXCPM_TTS_CLONE_ENDPOINT=` optional override
- `VOXCPM_TTS_CONTROL=` optional control
- `VOXCPM_TTS_CFG_VALUE=2`
- `VOXCPM_TTS_INFERENCE_TIMESTEPS=10`
- `VOXCPM_TTS_NORMALIZE=true`
- `VOXCPM_TTS_DENOISE=false`
- `VOXCPM_TTS_RETRY_BADCASE=true`
- `VOXCPM_TTS_SAVE=false`
- `VOXCPM_TTS_FILENAME_PREFIX=ai-video-studio`

The local service exposes `GET /health`, `GET /ready`, `POST /tts`, `POST
/clone`, and `POST /clone_with_prompt`. Use `docker-compose.voxcpm.yml` or
`scripts/producer-voxcpm.sh` when Docker bridge networking cannot reach a
host-loopback service.

## Validation

```bash
npm run smoke:skill-alignment
npm run smoke:voxcpm-clone-adapter
npm run smoke:producer-audio-tools
```

Generated audio, captions, summaries, stills, and MP4 remain local-only under
ignored `public/generated/` and `out/` paths.
