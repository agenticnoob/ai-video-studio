# Narration, Captions, And Audio

Use this reference for narration, voice choice, TTS text, caption timing,
audio recovery, or audio verification. Before final VoxCPM text, clone text,
control instructions, or expression tags, read
`../voxcpm-expression/VOXCPM_EXPRESSION.md`.

## Direct VoxCPM Contract

- Use only `scripts/lib/producer-audio/`; never call `/api/tts` or restore a
  provider selector.
- Select exactly one mode: `voice-design`, `controllable-clone`, or
  `high-fidelity-clone`.
- Call narration directly when `/ready` reports cold `503/loading`; the first
  real request reloads it automatically, so `/ready` is diagnostic, not a
  gate.
- Keep spoken `ttsText` separate from visible `displayText`.
- Use punctuation-split synthesis, trim each returned chunk, then keep chunks
  trimmed and concatenated into one WAV per scene.
- Let measured chunk durations produce caption cues and scene duration.
- Store private references under ignored `voices/clone/` paths and outputs,
  progress, and summary under `public/generated/<slug>/audio/`.
- Save progress after each scene id. Reuse a scene only when its request
  fingerprint matches and its WAV still exists.
- Required narration fails closed on connection, timeout, reference,
  response-format, empty-audio, or duration errors. Never fall back to F5,
  another provider, or a silent completion.

## Chinese Science-Explainer Default

For future Chinese science-explainer narration, default to the user-accepted
`science-explainer-young-male`. Normal work uses `controllable-clone` with
`voices/clone/science-explainer-young-male.wav` and compact per-beat controls.
When highest timbre fidelity is required, use `high-fidelity-clone` with the
same WAV and exact same-name transcript at
`voices/clone/science-explainer-young-male.txt`, without a control instruction.
An explicit production brief may override this science-only default;
non-science content retains the existing default clone configuration. Missing
private files fail closed and must not silently fall back to `lyy`, F5, or
another provider. User audition status: accepted on 2026-07-19.

## Audio Review And Handoff

Run `npm run smoke:producer-audio-direct-voxcpm` and
`npm run smoke:producer-audio-tools`. Verify codec, sample rate, channel count,
duration, audible level, clipping, long silence, trimmed boundaries, caption
order, and ignored/untracked status. Handoff records narration mode, caption
method, audio paths, verification results, and any failed scene ids.
