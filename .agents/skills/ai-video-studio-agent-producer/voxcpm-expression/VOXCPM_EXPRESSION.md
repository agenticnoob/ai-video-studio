---
name: ai-video-studio-voxcpm-expression
description: Use when working in /data/projects/labs/ai-video-studio and Codex writes or revises VoxCPM narration, voice clone text, VoxCPM control instructions, or Agent Producer voiceover that needs expressive delivery state, pacing, emotion, scene tone, or sparse non-language bracket tags such as [laughing], [sigh], [Uhm], and question/surprise markers.
---

# AI Video Studio VoxCPM Expression

Use this skill only for VoxCPM narration decisions. The upstream authority is
VoxCPM 2 Usage Guide: `https://voxcpm.readthedocs.io/zh-cn/latest/usage_guide.html`.
Do not project F5 semantics onto VoxCPM.

## Mode Selection

Choose the upstream model mode before preparing text or references:

- `voice-design`: no reference audio. Put a parenthesized control instruction
  before target text. A randomly designed voice is not guaranteed to remain
  consistent across independent calls.
- `controllable-clone`: reference audio preserves timbre while control can
  adjust delivery. **controllable clone does not require a transcript upstream**.
- `high-fidelity-clone`: use when speaker fidelity matters most. **Hi-Fi clone requires an exact transcript** for the reference audio, and **control instructions are ignored by Hi-Fi clone**.

The direct Producer runtime exposes all three approved modes one-to-one. Read
`Producer Direct Runtime Contract` before building a request.

## Reference Audio Rules

- Prefer clean single-speaker audio around **5–30 seconds**.
- Avoid music, overlapping speech, reverb, clipping, and long silence.
- For controllable clone, upstream can work without a transcript; supply one
  only when the current repo adapter path requires it.
- For Hi-Fi clone, use an exact word-for-word transcript. Do not paraphrase,
  normalize numbers, remove fillers, or add words not present in the reference.
- Private reference voices stay under ignored local paths such as `voices/`.

## Parameters And Tuning Order

Tune one dimension at a time in this order:

1. reference audio quality and correct mode
2. target text and punctuation
3. `inference_timesteps`
4. `cfg_value`
5. `normalize` and `denoise`
6. `retry_badcase`

Guidance:

- `cfg_value`: controls conditioning strength. Start from the repo default `2`;
  raise carefully when delivery ignores conditioning, lower if speech becomes
  forced or unstable.
  | `inference_timesteps`: quality/latency tradeoff. Start from `10`; increase for
  difficult lines only after text and reference quality are sound.
  | `normalize`: normally `true`; disable only when preserving input loudness is
  more important than consistent output level.
  | `denoise`: normally `false`; enable for a genuinely noisy reference, not as a
  substitute for choosing a clean reference.
  | `retry_badcase`: normally `true`; it asks upstream to retry obvious bad cases.
  Disable only for deterministic diagnosis or when repeated retries hide a
  reproducible failure.

## Default Voice Clone Configuration

When generating video narration without explicit override, use:

- **Mode**: `high-fidelity-clone` (`clone_with_prompt` endpoint)
- **prompt_audio**: `voices/clone/lyy.wav`
- **prompt_text**: content of `voices/clone/lyy.txt` (`我觉得应该要犒赏一下自己。讨厌！好狗不挡道！天哪！原来命运是不可抗拒的。`)
- **reference_audio**: `voices/clone/lyy-r.wav` (same speaker, different content, timbre anchor only)

Both audio files are of the same speaker. `prompt_audio` carries the exact transcript;
`reference_audio` provides additional timbre stability without needing its own transcript.

## Text, Punctuation, And Expression

Write natural spoken text first. Use a compact control instruction with at most
three dimensions: role, voice texture, and expressive state.

Examples:

```txt
calm Chinese technical narrator, clear and precise, lightly curious
middle-aged male broadcaster, low-pitched and magnetic, urgent but controlled
```

Use official-style English bracket tags sparsely: `[laughing]`, `[sigh]`,
`[Uhm]`, `[Shh]`, `[Question-ah]`, `[Surprise-wa]`. Keep tags in TTS text but
remove them from display captions. Preserve decimal names such as `GPT-5.6`.

Punctuation is part of production timing. Use commas, semicolons, colons, and
sentence-ending marks where a listening or subtitle boundary belongs. Do not
create punctuation spam or giant unbroken sentences.

## Long And Short Text Handling

- Short line: keep one clear intention and avoid excessive control text.
- Long narration: split by semantic beats and punctuation before synthesis.
- Repeated designed-voice calls may drift; prefer a stable reference-based mode
  when a multi-scene video needs one consistent speaker.
- Fix awkward text, reference quality, or mode before compensating with extreme
  parameter values.

## Producer Direct Runtime Contract

Official VoxCPM model behavior and this repository's Producer behavior are
separate contracts.

Upstream VoxCPM provides audio generation modes and request parameters. It does
not provide project caption timestamps. VoxCPM returns audio/wav and exposes no per-line timestamps.

In this repository, **punctuation splitting, silence trimming, WAV
concatenation, and duration-derived captions are Producer runtime behavior**.
The runtime lives under `scripts/lib/producer-audio/` and calls VoxCPM directly:

- `voice-design` sends JSON to the configured plain endpoint and prefixes the
  compact control instruction to each punctuation-sized request.
- `controllable-clone` sends multipart audio directly and does not require a
  transcript.
- `high-fidelity-clone` reads exact prompt audio/transcript files plus the
  optional timbre reference and sends multipart data; control is absent.

Private references must be files under ignored `voices/clone/`. Audio,
progress, and summary output stays under `public/generated/<slug>/audio/`.
Progress is saved after each completed scene id and reused only when the plan
fingerprint and WAV both match. Required narration must fail closed; explicit
silence is a separate manifest decision.

## Agent Producer Integration

1. Select mode and reference strategy.
2. Write final TTS text and separate clean display text.
3. Use the direct runtime in `scripts/lib/producer-audio/` through the sample
   generator rather than duplicating request, caption, metadata, duration,
   progress, or summary logic.
4. Generate audio before locking Remotion scene duration.
5. Run `npm run producer:validate -- --module <validation-module>`.
6. Run `npm run producer:stills -- --composition <composition-id>`.
7. Review real audio, captions, stills, and MP4; tools do not make creative
   quality judgments.

## Common Pitfalls (Updated 2026-07-12)

### Voice-design cross-call drift

Each `voice-design` API call generates a **random** voice. Seven scenes = up to
seven different speakers. For multi-scene consistency:

1. Generate the first scene with voice-design using a good control instruction.
2. Save the output `.wav` as the reference audio.
3. Re-generate remaining scenes with `controllable-clone` mode using that
   reference, so timbre is preserved across all scenes.

### Control instruction format in the Producer runtime

Upstream VoxCPM requires voice-design control instructions as a parenthesized
prefix in the `text` field:

```
"(Warm male narrator, friendly and clear)写代码的你，有没有遇到过这种情况……"
```

Pass `control` to `createVoxcpmProducerRequestPlan`; the direct runtime adds the
parenthesized prefix exactly once per punctuation-sized voice-design request.
Do not put the instruction in `displayText`.

### Per-scene audio vs combined audio

Each scene must have its own audio file with independently measured
`durationInFrames`. A single shared audio file across all scenes causes every
`<Sequence>` to replay from the start. The `renderAudio` callback in
`StandaloneTimeline` should use `scene.audioFile` (per-scene), not a hardcoded
path. Use `renderOverlay` only when one audio spans the entire composition and
no per-scene caption timing is needed.

## Quality Gate

Before final render verify:

- correct mode for fidelity versus controllability
- reference audio is clean and within the useful 5–30 seconds range
- Hi-Fi transcript is exact; controllable-clone transcript requirement is not
  falsely presented as upstream behavior
- control instruction is compact and omitted for Hi-Fi clone
- tags are sparse and absent from display captions
- `cfg_value`, `inference_timesteps`, `normalize`, `denoise`, and
  `retry_badcase` changes have a stated reason
- no unexplained leading/trailing silence
- measured duration is positive and drives scene timing
- captions come from repo-measured chunk duration, not claimed VoxCPM timestamps
