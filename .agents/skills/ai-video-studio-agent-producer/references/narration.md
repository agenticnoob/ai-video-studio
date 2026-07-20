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

The bounded post-Roadmap VoxCPM-only voice profile registry is the active clone
identity boundary. Inspect
`scripts/lib/producer-audio/voice-profiles.json`; do not copy raw clone paths
into a future generator. `producer:scaffold` has no voice default and requires
`--voice-profile <voice-profile-id>`. Use this operational sequence:

```txt
brief classification
  -> Agent selects a registered voiceProfileId
  -> science brief defaults to science-explainer-young-male
  -> explicit production brief may select another registered profile
  -> registry resolves the selected clone mode and private paths
  -> composition generate.mjs supplies per-beat control only for controllable-clone
  -> direct VoxCPM request fails closed if the selected files are missing
```

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

`voice-design` remains profile-less. High-fidelity clone omits control. Registry
lookup has no fallback to `lyy` or another profile, and unknown profile ids,
unsupported profile/mode pairs, invalid paths, and missing private files fail
closed. Existing composition generators are compatibility history, not
migration examples. Future scaffolds record one explicit profile and resolved
mode in both the manifest and `generate.mjs`.

## Audio Review And Handoff

Run `npm run smoke:producer-audio-direct-voxcpm` and
`npm run smoke:producer-audio-tools`. Verify codec, sample rate, channel count,
duration, audible level, clipping, long silence, trimmed boundaries, caption
order, and ignored/untracked status. Handoff records narration mode, caption
method, audio paths, verification results, and any failed scene ids.
