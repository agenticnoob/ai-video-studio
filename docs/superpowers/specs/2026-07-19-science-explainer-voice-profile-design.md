# Science Explainer Voice Profile Design

Date: 2026-07-19
Status: implemented and user-audition accepted on 2026-07-19

## Goal

Qualify the user-selected `candidate-03` VoxCPM voice as the future default
voice for Chinese science-explainer narration, without changing narration for
other content families or introducing a global voice registry.

## Selected Private Reference

- profile id: `science-explainer-young-male`
- reference audio: `voices/clone/science-explainer-young-male.wav`
- exact transcript: `voices/clone/science-explainer-young-male.txt`
- source audition: `candidate-03`
- measured reference duration: 6.059354 seconds
- reference format: 48 kHz mono PCM WAV

Both private files remain ignored and untracked. Missing private reference
files must fail closed; future science narration must not silently fall back to
the existing `lyy` voice or another provider.

## Qualification Proof

Generate three independent `controllable-clone` tracks from the same selected
reference. Keep the role and magnetic voice texture stable while changing only
the delivery state needed by the beat.

### Proof 1: Calm Explanation

Text:

> 当我们仰望星空时，看到的每一点光芒，都可能来自数百年前的宇宙。

Control:

> young Chinese male science narrator, magnetic and clear, calm and authoritative

### Proof 2: Energetic Reveal

Text:

> 真正令人震撼的是，你身体里的每一个原子，都曾诞生于遥远的恒星！

Control:

> young Chinese male science narrator, low-pitched and magnetic, passionate and awe-inspiring

### Proof 3: Curious Question

Text:

> 如果时间真的会变慢，那么高速飞行的人，回来以后会比我们更年轻吗？

Control:

> young Chinese male science narrator, warm and magnetic, curious and suspenseful

The TTS and display text are identical. No non-language tags are needed.

## Artifact Boundary

Write qualification artifacts beneath:

`public/generated/science-explainer-voice-proof/audio/`

Expected local-only outputs:

- `calm-explanation.wav`
- `energetic-reveal.wav`
- `curious-question.wav`
- `summary.json`
- `index.md`

Generated audio and summaries remain ignored and uncommitted.

## Science-Only Default Contract

After all three proof tracks pass mechanical qualification, update the
repo-local VoxCPM expression skill and provider documentation with this rule:

- future Chinese science-explainer narration defaults to
  `science-explainer-young-male`
- the normal mode is `controllable-clone` so each beat may vary delivery while
  preserving the selected timbre
- `referenceAudioPath` is
  `voices/clone/science-explainer-young-male.wav`
- when highest speaker fidelity is more important than controllability, use
  `high-fidelity-clone` with the same WAV as `promptAudioPath` and the exact
  same-name `.txt` transcript
- `high-fidelity-clone` receives no control instruction
- an explicit production brief may override this science-only default
- non-science content retains the existing default clone configuration
- missing science profile files fail closed with no voice or provider fallback

Do not add a runtime registry, environment variable, manifest field, scaffold
flag, or migration of completed samples. Current generators continue passing
provider-specific paths directly.

## Deterministic Acceptance

For each proof track:

- provider is direct VoxCPM
- mode is exactly `controllable-clone`
- reference path is exactly the named private WAV
- output is decodable non-empty `pcm_s16le` WAV
- duration is positive and between 5 and 12 seconds
- sample rate is 48 kHz and channel count is one
- mean and peak volume show audible signal without positive-dBFS clipping
- no leading or trailing silence longer than 250 ms remains

The focused smoke must also prove that the skill and provider documentation
contain the exact profile id, paths, science-only scope, normal mode,
high-fidelity alternative, and fail-closed/no-fallback rule.

Mechanical checks do not claim that the three deliveries sound like the same
speaker. Final timbre and expression judgment remains a user audition decision.
The user completed that judgment on 2026-07-19, confirmed the effect is strong,
and accepted `science-explainer-young-male` as the science-only default.

## Non-Goals

- no global default replacement
- no replacement or modification of the existing `lyy` voice files
- no voice-profile runtime registry
- no Remotion composition, video render, cover, or asset manifest
- no modification or regeneration of frozen or completed compositions
- no generated audio committed to Git
- no push
