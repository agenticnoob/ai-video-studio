---
name: ai-video-studio-voxcpm-expression
description: Use when working in /data/projects/labs/ai-video-studio and Codex writes or revises VoxCPM narration, VoxCPM voice clone text, VoxCPM control instructions, or Agent Producer voiceover that needs expressive delivery state, pacing, emotion, scene tone, or sparse non-language bracket tags such as [laughing], [sigh], [Uhm], and question/surprise markers.
---

# AI Video Studio VoxCPM Expression

## Purpose

Use this provider-specific guidance to write VoxCPM-ready narration for Agent
Producer videos. Keep the voice track expressive without turning scripts into
noisy prompt strings or creating a separate video-production path.

Reference the current VoxCPM cookbook when details matter:
`https://voxcpm.readthedocs.io/zh-cn/latest/cookbook.html`.

## Core Rules

- Write clean target-language narration first.
- Add expression only where it improves the video beat.
- Prefer one short control instruction per segment or scene.
- Use sparse English bracket tags inside narration text for breath, hesitation,
  laughter, sighs, question tone, or surprise.
- Keep TTS timing authoritative after generation; never lock scene duration
  before the real VoxCPM audio duration is known.
- Do not over-tag. If every sentence carries a tag, the script is probably
  worse.
- Treat punctuation as production timing, not decoration. Chinese/English
  commas, semicolons, colons, sentence-ending marks, question marks, and
  exclamation marks are the intended split points for readable VoxCPM chunks.
- Preserve decimal model names and versions such as `GPT-5.6`; do not split
  them into `GPT-5.` and `6`.

## Provider Timing Contract

VoxCPM returns audio/wav for `/tts`, `/clone`, and `/clone_with_prompt`; it has
no per-line timestamps in the current project adapter. The repo compensates by
splitting narration on punctuation before synthesis, trimming leading/trailing
silence from each chunk, concatenating chunk WAVs, and building captions from
the measured chunk durations.

Implications:

- Write punctuation where a subtitle or listening pause should occur.
- Avoid giant sentences that require the adapter to estimate a long cue.
- Avoid punctuation spam; too many tiny chunks can sound choppy.
- If a rendered line still shows a long blank tail or awkward subtitle cue,
  inspect the generated WAV with `ffmpeg silencedetect` and the generated
  caption metadata before rewriting visuals.

## Control Instruction

Use the control instruction for stable delivery state. Keep it compact and
describe only the voice behavior needed by the scene.

Include at most three useful dimensions:

- identity or role: `young technical narrator`, `middle-aged male broadcaster`
- voice texture: `low-pitched`, `bright`, `magnetic`, `slightly raspy`
- expressive state: `calm and precise`, `curious`, `urgent but controlled`,
  `slow historical narration`, `speaking very fast, bright and full`

Good patterns:

```txt
calm Chinese technical narrator, clear and precise, lightly curious
```

```txt
middle-aged male broadcaster, low-pitched and magnetic, energetic but not shouting
```

```txt
soft personal narration, warm and reflective, slower pace with small pauses
```

Avoid long stacked instructions that fight the reference voice or describe the
entire video visual style.

## Non-Language Tags

Use official-style English square-bracket tags in the narration text when the
spoken moment needs them.

Preferred tags:

- laughter and sigh: `[laughing]`, `[sigh]`
- hesitation and hush: `[Uhm]`, `[Shh]`
- question tone: `[Question-ah]`, `[Question-ei]`, `[Question-en]`,
  `[Question-oh]`
- surprise or dissatisfaction: `[Surprise-wa]`, `[Surprise-yo]`,
  `[Dissatisfaction-hnn]`

Use lowercase where the cookbook shows lowercase, especially `[laughing]` and
`[sigh]`. Do not invent variants such as `[Laughter]` unless a local test proves
they work better.

## Script Pass

For each narration beat:

1. Write the plain spoken line.
2. Decide the expression state in normal words.
3. Add a bracket tag only if the beat needs audible hesitation, breath, laugh,
   sigh, question tone, or surprise.
4. Keep tags near the phrase they affect.
5. Read the line aloud mentally; remove tags that make it feel written rather
   than spoken.

Example:

```txt
Plain: 这里最关键的不是参数，而是证据链有没有闭合。
State: calm, precise, slightly skeptical
VoxCPM text: [Uhm] 这里最关键的，不是参数，而是证据链有没有闭合。
```

## Video Integration

When generating an Agent Producer video with VoxCPM:

- Write the narration beats before visual timing.
- Pick or derive control instructions per scene from the scene intent.
- Store the final TTS text, including tags, with the segment or sample
  narration data.
- Keep captions readable. If bracket tags appear in generated captions and look
  distracting, hide or clean them in display captions while preserving them in
  the TTS input.
- Keep display captions punctuation-aligned. Do not merge unrelated clauses
  into one caption merely because VoxCPM returned one final WAV.
- For voice clone, keep the reference transcript exact and use control
  instruction only to adjust emotion, speed, and delivery. Do not expect clone
  control to change the speaker identity.
- After generation, inspect the real duration and update the Remotion timeline
  from the audio metadata.

## Quality Check

Before using the audio in a final render, verify:

- the narration still reads naturally without prompt clutter
- tags are sparse and purposeful
- the control instruction matches the scene state
- generated captions do not expose awkward tags to viewers
- decimals and model names remain intact in the display captions
- no segment has a long unexplained leading or trailing silence
- `ffprobe` or project metadata reports a positive real duration
- the video timing follows the generated VoxCPM audio duration
