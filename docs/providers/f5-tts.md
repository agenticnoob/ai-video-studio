# F5-TTS Provider Target

Status: provider adapter implemented; local runtime service planned next.

This document defines the F5-TTS provider boundary for `ai-video-studio`.
F5-TTS is integrated as a provider inside this project, not treated as a
separate product. The Next.js-side adapter, request contract, configuration,
artifact handling, caption normalization, and fallback behavior belong to this
repository.

The adapter is in place. The next implementation target is the optional local
runtime service described in
[`docs/providers/f5-tts-service-plan.md`](f5-tts-service-plan.md).

## Product Role

The F5-TTS provider is the preferred local narration synthesis path for staged
generation once `F5_TTS_BASE_URL` points at a running service:

```txt
StoryboardSegmentPlan.narration.text
  -> in-project F5-TTS provider
  -> segment-owned audio artifact + measured duration + aligned caption cues
  -> selected-template compiler
  -> assembled VideoProject
```

MiniMax TTS remains the working provider/fallback while the local F5-TTS
runtime service lands. The staged pipeline calls the project-owned narration
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

- F5-TTS provider module lives under `src/lib/tts/`.
- Keep provider config in project-owned environment variables:
  - `TTS_PROVIDER=f5-tts` or `AI_VIDEO_STUDIO_TTS_PROVIDER=f5-tts` selects F5
    explicitly.
  - If no provider is set, `F5_TTS_BASE_URL` selects F5 automatically;
    otherwise the current MiniMax TTS path remains the default.
  - `F5_TTS_BASE_URL` points at the local/container F5 runtime.
  - `F5_TTS_ENDPOINT` optionally overrides the default
    `${F5_TTS_BASE_URL}/synthesize` endpoint. It may be absolute or relative.
  - `F5_TTS_VOICE_ID` provides the default F5 voice/speaker profile.
  - `F5_TTS_FORMAT` controls the local artifact extension and defaults to
    `wav`.
  - `F5_TTS_REFERENCE_AUDIO` optionally points to reference audio for a local
    voice-cloning runtime.
  - `F5_TTS_FALLBACK_TO_MINIMAX=false` disables MiniMax fallback when F5 fails.
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

The adapter expects an HTTP runtime rather than embedding Python/model
execution inside the Next.js app. The runtime can return either:

- a direct `audio/*` response body
- JSON with `audio_base64`, `audioBase64`, or `audio`
- JSON with `audio_url` or `audioUrl`

Optional caption/alignment data can be returned as `captions`, `captions.cues`,
`alignment`, `alignment.cues`, `alignment.words`, or `alignment.segments`. Cue
timing may use frame, second, or millisecond fields. The project adapter
normalizes all accepted shapes into segment-local
`VideoSegment.narration.captions.cues[]`.

Request body sent to the runtime:

```json
{
  "text": "Segment narration text",
  "language": "en",
  "voiceId": "optional voice id",
  "voice_id": "optional voice id",
  "referenceAudio": "optional local reference audio path"
}
```

## Non-Goals For The First Slice

- no professional subtitle editor
- no waveform editing
- no beat sync, ducking, or DAW-style audio controls
- no provider marketplace or broad provider abstraction before F5-TTS works
- no template-specific private subtitle models
- no model checkpoints committed to Git
- no mandatory F5 runtime for normal web/studio development before the service
  overlay is enabled

## Success Criteria

- Next-side provider adapter can call a local F5-TTS HTTP service through
  `F5_TTS_BASE_URL`
- staged full-project generation can use F5-TTS for each planned segment when
  the service is running
- each generated segment has a playable local narration audio asset
- each generated segment has caption cues aligned to the narration audio, or
  deterministic fallback captions when the runtime only returns audio
- preview and export render the same audio and captions
- selected-segment regeneration replaces only the target segment's audio and
  captions while preserving non-target segments
