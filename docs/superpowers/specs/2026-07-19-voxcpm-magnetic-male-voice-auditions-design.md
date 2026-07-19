# VoxCPM Magnetic Male Voice Auditions Design

Date: 2026-07-19
Status: approved for implementation

## Goal

Generate ten directly comparable VoxCPM candidate voices for a reusable Chinese
science-explainer clone voice. Every candidate must sound like a young Chinese
male narrator with a magnetic lower register, energetic delivery, and an
inspiring sense of momentum. Each result should last 5–10 seconds.

## Comparison Method

Use ten independent `voice-design` requests with identical narration text,
control instruction, and normal generation parameters. Independent requests
are intentional because VoxCPM voice design is random; the resulting timbre
variation is the selection surface.

Do not vary narration wording, control wording, or synthesis parameters between
candidates. Do not clone the first candidate into the remaining candidates,
because that would compare delivery rather than ten distinct timbres.

## Narration Contract

Spoken text:

> 科学真正迷人的地方就在于让复杂的世界突然变得清晰而震撼。

Control instruction:

> young Chinese male science narrator, low-pitched and magnetic, passionate and inspiring

The line has one sentence-ending punctuation boundary and no internal
punctuation. This keeps each candidate to one VoxCPM request and avoids
voice-design drift between punctuation-sized chunks inside a candidate.

No non-language expression tags are needed. The clean display text is identical
to the spoken text.

## Runtime And Artifact Boundary

Use the repository's direct Producer VoxCPM runtime under
`scripts/lib/producer-audio/`; do not use `/api/tts`, the removed F5 path, or a
second provider.

Write all generated artifacts beneath the ignored local-only root:

`public/generated/voxcpm-magnetic-male-auditions/audio/`

Expected deliverables:

- ten numbered WAV files, `candidate-01.wav` through `candidate-10.wav`
- one local JSON summary containing text, control, mode, duration, and file path
- one concise audition index listing candidate number and measured duration

Generated WAV and summary artifacts must remain untracked and uncommitted.

## Acceptance Checks

For every candidate:

- VoxCPM mode is exactly `voice-design`
- the output is a decodable, non-empty WAV
- measured duration is 5–10 seconds
- leading and trailing silence are trimmed by the Producer runtime
- the waveform has audible signal and no obvious digital clipping
- the request uses the exact shared text, control, and normal parameters

After generation, present clickable local paths and measured durations for all
ten candidates. Creative selection remains with the user; deterministic checks
do not claim which voice is best.

## Non-Goals

- no Remotion composition or video render
- no modification or regeneration of finished compositions
- no permanent clone registration before the user selects a candidate
- no generated audio committed to Git
- no push
