# VoxCPM TTS Provider

Upstream authority: VoxCPM 2 Usage Guide,
`https://voxcpm.readthedocs.io/zh-cn/latest/usage_guide.html`.

Use `.agents/skills/ai-video-studio-agent-producer/` for the production flow and
`.agents/skills/ai-video-studio-agent-producer/voxcpm-expression/VOXCPM_EXPRESSION.md`
for mode, text, expression, and quality decisions.

## Official Model Modes

- `voice-design`: no reference audio; a parenthesized control instruction can
  design a voice, but independent calls are not guaranteed to keep one random
  speaker identity.
- `controllable-clone`: reference audio preserves timbre and control can adjust
  speed, emotion, and style. A transcript is not required upstream or by the
  direct Producer runtime.
- `high-fidelity-clone`: requires prompt audio plus an exact transcript;
  control instructions are ignored. An optional same-speaker reference audio
  file can provide the separate timbre anchor.

Prefer clean single-speaker reference audio around 5–30 seconds.

## Chinese Science-Explainer Default

For future Chinese science-explainer narration, the qualified default profile
is `science-explainer-young-male`. Use `controllable-clone` as the normal mode,
set `referenceAudioPath` to
`voices/clone/science-explainer-young-male.wav`, and supply a compact control
instruction per narration beat when its delivery state needs to change.

An explicit production brief may override this science-only default. The rule
is that non-science content retains the existing default clone configuration.

When speaker fidelity has priority over delivery control,
high-fidelity-clone uses the same WAV and exact same-name transcript without a
control instruction. Use
`promptAudioPath: voices/clone/science-explainer-young-male.wav` with
`promptTranscriptPath: voices/clone/science-explainer-young-male.txt`, and omit
`control`.

Both private files are ignored local inputs and must exist before a science
request is built. Missing files fail closed with no fallback. The runtime must
not silently fall back to `lyy`, F5, or another provider.

The local qualification root is
`public/generated/science-explainer-voice-proof/audio/` and contains
`calm-explanation.wav`, `energetic-reveal.wav`, `curious-question.wav`,
`summary.json`, and `index.md`. All three tracks were generated through direct
VoxCPM `controllable-clone` with the exact profile reference and normal
repository parameters. Mechanical qualification does not prove identical
speaker identity or expressive quality.

User audition status: accepted on 2026-07-19. The selected profile is fully
qualified for the science-only default; the acceptance is a human listening
decision layered on top of, not produced by, the mechanical checks.

## Producer Direct Runtime Contract

The Producer-owned implementation is `scripts/lib/producer-audio/`:

```txt
ProducerNarrationBeat[]
  -> explicit VoxCPM mode plan
  -> direct JSON or multipart VoxCPM requests
  -> punctuation-sized audio/wav chunks
  -> PCM leading/trailing silence trim
  -> ordered compatible WAV concatenation
  -> measured duration and clean display captions
  -> public/generated/<slug>/audio/<scene-id>.wav
  -> per-scene progress + deterministic metadata/duration/summary
```

Request shapes:

- `voice-design` -> JSON to the plain endpoint
- `controllable-clone` -> multipart to the controllable clone endpoint with
  `reference_audio`
- `high-fidelity-clone` -> multipart to the high-fidelity endpoint with
  `prompt_audio`, exact `prompt_text`, and `reference_audio`

The runtime reads private audio and transcript files directly from ignored
`voices/clone/`. Paths outside that directory fail before any request. It does
not upload a reference through another application process.

Punctuation splitting, silence trimming, WAV concatenation, measured duration,
and duration-derived caption cues are repository Producer behavior, not model
timestamps. Spoken `ttsText` may contain sparse expression tags and control;
visible `displayText` must stay clean and keep matching punctuation boundaries.

Progress is saved after every completed scene id. Recovery requires the same
request fingerprint and an existing output WAV. Required narration fails
closed on connection, timeout, reference, response-format, empty/silent audio,
format incompatibility, or duration errors. There is no provider fallback.

## Runtime And Config

- `VOXCPM_TTS_BASE_URL=http://192.168.50.6:8810`
- `VOXCPM_TTS_ENDPOINT=` optional plain endpoint override
- `VOXCPM_TTS_CONTROLLABLE_CLONE_ENDPOINT=` optional controllable endpoint override
- `VOXCPM_TTS_HIGH_FIDELITY_CLONE_ENDPOINT=` optional high-fidelity endpoint override
- `VOXCPM_TTS_CLONE_ENDPOINT=` accepted as the historical high-fidelity endpoint override
- `VOXCPM_TTS_CFG_VALUE=2`
- `VOXCPM_TTS_INFERENCE_TIMESTEPS=10`
- `VOXCPM_TTS_NORMALIZE=true`
- `VOXCPM_TTS_DENOISE=false`
- `VOXCPM_TTS_RETRY_BADCASE=true`
- `VOXCPM_TTS_SAVE=false`
- `VOXCPM_TTS_FILENAME_PREFIX=ai-video-studio`
- `VOXCPM_TTS_TIMEOUT_MS=180000`

The default service endpoints are the plain, controllable clone, and
high-fidelity clone paths exposed by the local VoxCPM service. Docker bridge
networking can use `docker-compose.voxcpm.yml` or
`scripts/producer-voxcpm.sh` when it cannot reach a host-loopback service.

The service unloads the model after 10 minutes without an inference request.
In that idle state, `GET /ready` may return HTTP `503` with `status: "loading"`;
this is a normal cold state, not a generation blocker. Send the real Producer
request directly: the first `/tts`, `/clone`, or `/clone_with_prompt` request
loads the model automatically and waits for inference. The default 180-second
Producer request timeout includes this cold-start window. Treat `/ready` as a
diagnostic observation only; do not require HTTP `200` before narration.

The wrapper exposes only a direct readiness probe, arbitrary Producer
container commands, and status:

```bash
./scripts/producer-voxcpm.sh ready
./scripts/producer-voxcpm.sh run npm run smoke:producer-audio-tools
./scripts/producer-voxcpm.sh status
```

It does not start Next or proxy narration through a repository HTTP route.

## Final Acceptance Proof

Phase 9B generated the three `DnsResolutionExplainer` narration tracks through
the direct high-fidelity clone path. The tracked metadata records measured
218-, 258-, and 261-frame WAV durations; private references and generated WAVs
remain ignored. Asset preflight, composition validation, the 739-frame final
H.264/AAC render, and `producer:quality` passed without a provider fallback.

## Validation

```bash
npm run smoke:producer-audio-direct-voxcpm
npm run smoke:producer-audio-tools
npm run smoke:agent-producer-architecture
npm run smoke:skill-alignment
```

Generated audio, progress, summaries, captions, stills, and MP4 remain
local-only under ignored `public/generated/` and `out/` paths.
