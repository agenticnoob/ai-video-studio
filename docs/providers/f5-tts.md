# F5-TTS Provider Target

Status: planned in-project narration provider.

This document defines the intended F5-TTS provider boundary for
`ai-video-studio`. F5-TTS should be integrated as a provider inside this
project, not treated as a separate product. The runtime may still run as a
local process or Docker service, but this repository owns the request contract,
configuration, artifact handling, caption normalization, and fallback behavior.

## Product Role

The F5-TTS provider should become the preferred local narration synthesis path
for staged generation:

```txt
StoryboardSegmentPlan.narration.text
  -> in-project F5-TTS provider
  -> segment-owned audio artifact + measured duration + aligned caption cues
  -> selected-template compiler
  -> assembled VideoProject
```

MiniMax TTS can remain as a working provider/fallback while the F5-TTS path is
being added. The staged pipeline should call a stable project-owned narration
provider interface instead of hard-coding provider details in assembly code.

## Provider Boundary

Input:

- segment narration text
- language
- segment id and project id for deterministic artifacts
- optional voice id / speaker profile
- optional reference audio when local F5-TTS voice cloning is configured
- optional caption style or alignment detail level

Output:

```ts
type F5TtsNarrationResult = {
  text: string;
  audio: {
    src: string;
    durationInFrames: number;
    durationInSeconds: number;
    voiceId?: string;
    provider: "f5-tts";
    format: "wav" | "mp3";
  };
  captions?: {
    language?: string;
    cues: {
      id: string;
      text: string;
      startFrame: number; // segment-local
      durationInFrames: number;
    }[];
  };
};
```

The exact runtime API can evolve, but the project-facing result should normalize
to the shared narration asset and caption cue contracts used by preview,
segment regeneration, and export.

## Implementation Direction

- Add an F5-TTS provider module under `src/lib/tts/`.
- Keep provider config in project-owned environment variables, for example:
  `F5_TTS_BASE_URL`, `F5_TTS_VOICE_ID`, and reference-audio settings when
  needed.
- Write generated audio to local project artifacts, consistent with the current
  `out/tts/...` path.
- Serve generated audio through `/api/tts/assets/...` with byte-range support.
- Normalize provider captions/alignment into segment-owned caption data with
  segment-local timing.
- If F5-TTS does not return usable captions for a request, fall back to a
  deterministic caption splitter based on narration text and real audio
  duration.
- Keep template implementations free of provider-specific audio or subtitle
  fields.

## Non-Goals For The First Slice

- no professional subtitle editor
- no waveform editing
- no beat sync, ducking, or DAW-style audio controls
- no provider marketplace or broad provider abstraction before F5-TTS works
- no template-specific private subtitle models

## Success Criteria

- staged full-project generation can use F5-TTS for each planned segment
- each generated segment has a playable local narration audio asset
- each generated segment has caption cues aligned to the narration audio
- preview and export render the same audio and captions
- selected-segment regeneration replaces only the target segment's audio and
  captions while preserving non-target segments
