# Agent Producer Fixed Production Tools Design

Status: implemented on 2026-07-11.

Date: 2026-07-10.

Primary upstream reference:

- VoxCPM 2 Usage Guide:
  `https://voxcpm.readthedocs.io/zh-cn/latest/usage_guide.html`

## 1. Purpose

The purpose of this work is not to refactor old videos or optimize code for its
own sake. The purpose is to make future Agent Producer video production faster,
more reliable, and easier to review without reducing creative freedom.

The production model should separate two kinds of work:

```txt
creative decisions owned by the Agent
  topic research
  narration structure
  visual metaphor
  scene design
  pacing judgment
  review and revision

fixed production operations owned by tools
  TTS requests
  voice-reference preparation
  audio/caption metadata generation
  duration calculation
  fallback reporting
  artifact-boundary checks
  review-frame rendering
  mechanical validation
```

The fixed operations should become callable functions or scripts. Future Agent
Producer runs should invoke them instead of reproducing sample-specific code.

## 2. Hard Boundaries

- Existing finished videos are frozen and remain read-only references.
- Do not modify existing sample renderers, scripts, data, generated audio
  metadata, smokes, narration, stills, or rendered videos.
- Do not regenerate existing audio or rendered artifacts.
- Do not require existing samples to migrate to the new tools.
- Do not create a universal visual template or scene DSL.
- Do not route future Agent Producer work through the parked web prompt or
  `VideoProject` path.
- Generated audio, screenshots, source cards, stills, summaries, and mp4 files
  remain local-only unless explicitly requested otherwise.

The three recent videos and older F5 samples may be inspected for lessons, but
the new implementation must use dedicated fixtures rather than editing them.

## 3. Desired Future Workflow

For a new video, the Agent should perform only the work that benefits from
judgment and then hand fixed operations to repo tools:

```txt
1. define topic, audience, duration, language, canvas, and content family
2. research facts and collect evidence
3. write narration beats and scene intents
4. choose a TTS provider and voice strategy
5. call the shared audio production tool
6. inventory primitives, blocks, and standalone runtime helpers
7. compose a dedicated Remotion video
8. register a producer sample manifest with review frames
9. call the shared producer validation tool
10. call the shared review-frame renderer
11. review stills/audio/mp4 and revise creative decisions
12. record promotion notes only after the video works
```

Steps 5, 9, and 10 should not require the Agent to recreate procedural code.

## 4. Shared Audio Production Tool

Add a provider-neutral Agent Producer audio tool under `scripts/lib/`.

Its stable input should include:

- sample/composition identity
- output artifact root
- generated metadata destination
- duration constant destination and identifier
- narration beats
- a function that converts one beat into the `/api/tts` request plan
- selected provider adapter
- optional voice configuration
- optional fallback policy
- metadata serializer configuration

Its output should include:

- one audio track per narration beat
- measured duration in seconds and frames
- display captions
- provider identity
- fallback status and reason
- generated `audio.generated.ts` content
- updated total-duration constant
- machine-readable TTS summary

### 4.1 Provider Adapter Boundary

The shared orchestration must not pretend F5 and VoxCPM have identical voice
semantics. Provider-specific preparation belongs behind adapters.

```txt
producer audio orchestrator
  -> F5 adapter
  -> VoxCPM adapter
  -> future provider adapter
```

The common orchestrator owns iteration, error handling, output writing,
duration aggregation, summary generation, and fallback reporting.

Each adapter owns request payload construction, required environment/config
validation, voice-reference handling, and provider-specific response checks.

### 4.2 VoxCPM Adapter

The VoxCPM adapter should support an explicit mode rather than inferring all
voice-clone behavior from the presence of a transcript:

- `voice-design`: no reference audio; a parenthesized control instruction is
  prepended to the target text; repeated calls are not expected to preserve a
  stable random voice unless another consistency mechanism is used.
- `controllable-clone`: uses a reference audio path to preserve timbre and may
  use a control instruction to adjust speed, emotion, or style; VoxCPM 2 does
  not officially require a transcript for this mode.
- `high-fidelity-clone`: uses reference audio plus an exact transcript for
  prompt alignment; control instructions are ignored by the official Hi-Fi
  path and must not be presented as active controls.

The current repo API may expose fewer modes or continue to require reference
text for its current clone endpoint. The tool must distinguish this local
adapter constraint from the upstream VoxCPM 2 model contract instead of
documenting the local behavior as a universal VoxCPM rule.

Supported generation settings should be represented explicitly:

- `cfgValue`, defaulting to the balanced upstream value `2.0`
- `inferenceTimesteps`, defaulting to `10`
- `normalize`
- `denoise`
- `retryBadcase`

The tool should validate basic ranges but should not automatically search a
large parameter space. Quality tuning remains a bounded review operation.

Recommended adjustment order for future production:

1. fix text, punctuation, and segment length
2. verify reference audio quality and mode
3. keep `retryBadcase` enabled
4. reduce `cfgValue` for long, fuzzy, buzzing, or unstable output
5. increase inference steps only when the quality benefit justifies the cost
6. enable `denoise` only for noisy reference/prompt audio

### 4.3 F5 Adapter

The F5 adapter should retain the existing F5 request semantics and must not be
forced through VoxCPM clone modes, control instructions, or expression tags.

It should provide the same normalized output contract to the orchestrator:

- audio source
- provider
- real duration
- captions
- voice identity metadata when available

This design allows future F5 videos to use the shared production workflow
without modifying or migrating previous F5 videos.

### 4.4 Caption And Timing Policy

Real generated audio owns scene timing.

For providers without line-level timing, the local adapter may split narration
into shorter units, synthesize them independently, trim leading/trailing
silence, concatenate the waveforms, and derive caption cues from measured chunk
durations.

This is a repo adapter behavior, not an upstream VoxCPM timestamp feature.

The shared tool should keep two text forms when needed:

- `ttsText`: provider input, including supported control syntax or expression
  markers
- `displayText`: viewer-facing caption text with control syntax removed

The tool must preserve meaningful model names and decimals during caption
cleanup.

## 5. Shared Producer Validation Tool

Add a reusable validation library and CLI for future producer samples.

The common validator should mechanically check:

- composition/sample manifest identity
- at least one review frame
- source files declared by the new sample exist
- local artifact roots live under ignored generated/output directories
- narration beat IDs, scene IDs, and audio-track IDs match
- every scene has positive duration
- every generated track has positive measured duration
- captions exist when narration is present
- caption cues are ordered and remain inside the track duration
- scene duration follows normalized audio duration within configured padding
- provider matches the requested provider
- fallback state is explicit rather than silent
- forbidden TTS control syntax is absent from display captions
- the composition is registered in the Remotion root

Each future sample should retain a small sample-specific smoke file for facts,
scene order, required visual components, and topic-specific claims. The shared
validator must not attempt to judge factual correctness or visual quality.

## 6. Manifest-Driven Review-Frame Renderer

Add a CLI that accepts a producer composition ID, reads its manifest review
frames, and renders all declared stills through Remotion.

Example interface:

```bash
npm run producer:stills -- --composition NewSampleName
```

The tool should:

- resolve the producer sample manifest
- create an output directory under `out/`
- render every declared frame
- use deterministic filenames containing frame number and normalized label
- write a small JSON summary of rendered files and review purposes
- fail clearly when the composition or review frames are missing

This script automates rendering only. The Agent still owns visual inspection
and decides whether the scene needs revision.

## 7. VoxCPM Skill Improvement

Update `.agents/skills/ai-video-studio-voxcpm-expression/SKILL.md` so future
Agent Producer runs can make correct voice-production decisions without
re-reading implementation history.

The skill should include:

- the three official VoxCPM 2 generation modes and their selection criteria
- the difference between `reference_wav_path`, `prompt_wav_path`, and
  `prompt_text`
- the fact that controllable clone does not require a transcript upstream
- the fact that Hi-Fi clone requires exact transcription and ignores control
  instructions
- recommended reference audio duration of roughly 5–30 seconds
- preference for clean reference audio and the trade-off of denoising
- parameter defaults and tuning ranges
- punctuation as prosody control and shorter sentence splitting for strong
  pauses
- short-text instability and the need to avoid isolated one-word synthesis
- long-text chunking and waveform concatenation
- retry and trimming guidance for anomalous duration or boundary artifacts
- voice consistency guidance: reuse the same reference audio
- a separate section titled `Repo Adapter Contract` describing the current
  `/api/tts` behavior, punctuation splitting, silence trimming, WAV joining,
  and duration-derived captions
- a statement that repo adapter requirements may be stricter than upstream
  VoxCPM 2 and must not be confused with official model requirements

Update `docs/providers/voxcpm.md`, the Agent Producer skill reference, and the
skill alignment smoke so these distinctions remain enforced.

## 8. Test Strategy

Do not use frozen existing videos as migration targets.

Add minimal fixtures that prove:

- common orchestration accepts normalized F5 and VoxCPM adapter results
- VoxCPM mode validation rejects incompatible combinations
- high-fidelity mode requires exact transcript configuration
- controllable clone can be modeled without an upstream transcript
- generated metadata and duration aggregation are deterministic
- display captions remove provider control syntax without damaging decimals
- fallback state is explicit in summary output
- producer validation catches missing audio, invalid cue ranges, provider
  mismatch, unignored artifact roots, and excessive duration padding
- review-frame command resolves manifest frames and builds deterministic
  Remotion commands without rendering a frozen sample
- skill smoke distinguishes official VoxCPM behavior from repo adapter behavior

Use the smallest Docker-first smoke and TypeScript checks covering these new
boundaries.

## 9. Documentation And Adoption

Update the Agent Producer skill so future production defaults to:

- shared audio tooling for mechanical TTS work
- shared producer validation for mechanical checks
- manifest-driven still rendering for visual review preparation
- dedicated Remotion composition for creative work

The scaffold for future samples should demonstrate the new calls, but existing
sample folders remain unchanged.

## 10. Acceptance Criteria

This design is successful when a future Agent Producer video can:

1. define narration beats and provider configuration without copying a full
   generator script
2. generate normalized audio/caption metadata through a provider adapter
3. validate mechanical production invariants with one shared command
4. render all declared review stills with one shared command
5. follow a VoxCPM skill that correctly distinguishes official model behavior
   from this repo's adapter behavior
6. preserve dedicated visual design and Agent judgment
7. leave every existing finished video unchanged

## 11. Design Self-Review

- Scope is limited to tooling, fixtures, skills, and active documentation for
  future Agent Producer runs.
- Existing finished video folders and sample-specific scripts are explicitly
  excluded from the write scope.
- Provider-neutral orchestration does not erase F5/VoxCPM semantic differences.
- Official VoxCPM behavior and current repo adapter constraints are named
  separately.
- Mechanical automation stops before research, narration judgment, visual
  design, still inspection, or creative revision.
- Acceptance criteria are testable without regenerating an existing video.
