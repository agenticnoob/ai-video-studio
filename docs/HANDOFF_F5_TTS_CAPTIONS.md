# Handoff: Segment-Owned Narration, F5-TTS, And Captions

Status: implementation handoff; captions/provider adapter implemented,
F5 runtime service implemented, and GPU real-mode validation passed.

Use this document when starting the next implementation slice. It supersedes
the earlier idea of adding top-level `VideoProject.captions` first. The updated
model is:

```txt
segment owns narration assets and captions
project owns segment ordering and global timeline assembly
```

## Product Decision

The next generation target is still:

```txt
brief
  -> StoryboardPlan
  -> in-project narration synthesis provider
  -> segment-owned audio artifact + measured duration + aligned caption cues
  -> selected-template compiler
  -> assembled VideoProject
  -> preview/edit/regenerate/export
```

The important modeling change is that generated narration and subtitles should
belong to the `VideoSegment`, not to a top-level project caption object or a
project-level narration media layer.

Preferred target shape:

```ts
type VideoSegment = {
  id: string;
  title: string;
  intent: string;
  templateId: TemplateId;
  narration?: SegmentNarration;
  media?: SegmentMedia;
  implementation: TemplateImplementation;
};

type SegmentNarration = {
  text: string;
  audio?: SegmentNarrationAudio;
  captions?: SegmentCaptions;
};

type SegmentNarrationAudio = {
  src: string;
  durationInFrames: number;
  durationInSeconds: number;
  voiceId?: string;
  provider?: "f5-tts" | "minimax" | string;
  format?: "mp3" | "wav" | "aac" | "m4a";
};

type SegmentCaptionCue = {
  id: string;
  text: string;
  startFrame: number; // segment-local
  durationInFrames: number;
};

type SegmentCaptions = {
  language?: string;
  cues: SegmentCaptionCue[];
  style?: {
    preset?: string;
    position?: "bottom" | "center" | "top";
  };
};
```

Rules:

- `implementation` remains template-specific and must not hide narration audio
  or caption data.
- Segment-owned narration/captions use segment-local timing. A cue
  `startFrame: 0` means the start of that segment.
- `VideoProject.media.layers[]` should be reserved for true project-level
  assets such as background music, global overlays, or full-video ambience.
- Future `VideoSegment.media.layers[]` can hold segment-owned images, clips,
  sound effects, or other media. Narration can either remain in
  `segment.narration.audio` or be bridged from a segment-level narration media
  layer, but it should not stay as the primary top-level project media model.
- Remotion preview/export should flatten segment-owned narration and captions
  into the project timeline at render time.

F5-TTS should be integrated as an in-project provider boundary, not as a
separate product. The F5-TTS runtime may run as a local process or Docker
service, but this repo owns:

- provider adapter
- request/response contract
- configuration
- generated audio artifact handling
- caption/alignment normalization
- fallback behavior when provider captions are missing
- preview/export rendering of shared segment caption data

MiniMax TTS remains the current working provider/fallback while the local
F5-TTS runtime service lands.

## Current Implementation State

Already implemented:

- `StoryboardPlan` and `StoryboardSegmentPlan` schemas.
- staged generation route: `POST /api/generate/staged`.
- current TTS asset boundary:
  - `src/lib/narration-asset-schema.ts`
  - `src/lib/tts/*`
  - `src/app/api/tts/route.ts`
  - `src/app/api/tts/assets/[...assetPath]/route.ts`
- local generated audio artifacts under `out/tts/...`.
- byte-range serving for generated TTS assets.
- selected-template compilation using real narration audio duration.
- segment-owned `narration` schema on `VideoSegment`.
- segment-owned generated narration audio through
  `VideoSegment.narration.audio`.
- render-time flattening for segment-owned narration audio through
  `ProjectNarrationLayers`.
- export-time route media resolution for `segment.narration.audio.src`.
- selected-segment staged regeneration that regenerates target narration audio
  and replaces only the target segment's narration/implementation while
  preserving non-target segments.
- deterministic staged smoke fixtures for mixed `scripted` + `spotlight`
  output with segment-owned narration audio.

Current transitional behavior:

- Project-level narration media layers remain supported as a compatibility
  path for older/current projects.
- `ProjectVideo` suppresses a project-level narration layer when the matching
  segment already has `segment.narration.audio`, avoiding double audio.
- Generic project-level media remains reserved for true full-video assets such
  as background music, ambience, watermarks, or global overlays.

Implemented in the F5/captions/runtime slices:

- caption normalization helpers and fallback caption splitter.
- F5-TTS provider module behind the existing TTS boundary.
- provider selection/config for F5-TTS.
- caption normalization from provider alignment into segment-local cues.
- Remotion flattening/rendering for segment-owned captions.
- selected-segment caption replacement through `VideoSegment.narration`.
- caption coverage in staged smoke fixtures.
- optional `services/f5-tts/` FastAPI runtime with `contract-smoke` and real
  `F5_TTS_SERVICE_MODE=f5` modes.
- Docker overlays for the F5 service and explicit GPU runtime.
- direct service smoke, Next `/api/tts` provider smoke, deterministic staged
  smoke, and deterministic staged export smoke.

Still not implemented yet:

- a full `POST /api/generate/staged` live smoke that exercises MiniMax
  planner/compiler plus the real F5 service in one request.
- caption editing UI beyond rendering generated cues.

## Recommended Implementation Order

The original implementation order below is now mostly completed. The next
implementation slice should add a bounded live staged-route smoke that calls
`POST /api/generate/staged` with MiniMax planner/compiler configuration and
real F5 narration enabled.

### Completed: Add The F5-TTS Runtime Service

Suggested files:

- `services/f5-tts/Dockerfile`
- `services/f5-tts/app/main.py`
- `services/f5-tts/app/schemas.py`
- `services/f5-tts/app/synthesize.py`
- `services/f5-tts/requirements.txt`
- `docker-compose.f5.yml`
- `scripts/f5-tts-smoke.sh`

Rules:

- keep model checkpoints and private reference voices out of Git
- expose `GET /health` and `POST /synthesize`
- satisfy the HTTP contract already consumed by `src/lib/tts/f5.ts`
- keep the service opt-in so normal `web` and `studio` development do not
  require F5 model downloads or GPU support
- keep MiniMax fallback available for systems where the local F5 runtime is not
  running
- do not move narration or captions into template-specific `implementation`

Validation now covered:

- `scripts/f5-tts-smoke.sh` for direct runtime health/synthesis.
- `scripts/f5-tts-next-smoke.sh` for the Next adapter and generated asset
  route.
- `npm run smoke:f5-staged` for deterministic mixed-template assembly.
- `F5_TTS_STAGED_SMOKE_RENDER=true npm run smoke:f5-staged` for export through
  `/api/render`.

### 1. Add Caption Normalization Helpers

Add helpers that turn provider cues into segment-local caption cues.

Suggested file:

- `src/lib/captions.ts`

Responsibilities:

- normalize cue ids
- clamp cue timing within the segment duration
- keep cue timing segment-local
- fallback from narration text + duration when provider cues are missing
- replace only target segment captions during selected-segment regeneration

### 2. Flatten Segment Captions For Preview And Export

Render-time flattening should convert `segment.narration.captions.cues[]` into
global Remotion Sequences.

Suggested files:

- `src/remotion/ProjectVideo/ProjectCaptionLayers.tsx`
- `src/remotion/ProjectVideo/ProjectVideo.tsx`
- `src/lib/render-project.ts` if caption assets later reference route media
- `src/lib/staged-smoke-fixtures.ts`

Rules:

- compute each segment's global start with `getSegmentStart(project, index)`
- render `segment.narration.captions.cues[]` at
  `segmentStart + cue.startFrame`
- keep cue timing segment-local in persisted/generated project data
- keep captions outside template-specific `implementation`
- use frame-driven Remotion rendering
- avoid CSS animations/transitions for render-critical caption motion
- use the same segment caption data for preview and export

Consult `.agents/skills/remotion-best-practices/SKILL.md` before editing
Remotion rendering code.

### 3. Add F5-TTS Provider Module

Add an F5-TTS provider under the existing TTS boundary.

Suggested files:

- `src/lib/tts/f5.ts`
- `src/lib/tts/config.ts`
- `src/lib/tts/index.ts`
- `docs/providers/f5-tts.md`

Implemented env shape:

- `TTS_PROVIDER=f5-tts` or `AI_VIDEO_STUDIO_TTS_PROVIDER=f5-tts`
- `F5_TTS_BASE_URL`
- `F5_TTS_ENDPOINT`
- `F5_TTS_VOICE_ID`
- `F5_TTS_FORMAT`
- `F5_TTS_REFERENCE_AUDIO`
- `F5_TTS_FALLBACK_TO_MINIMAX`

The exact F5-TTS runtime API can be adapted during implementation. Normalize
whatever the runtime returns into the shared segment narration and caption cue
contracts.

### 4. Diagnostics And Fixtures

Expose enough diagnostics to see whether captions came from F5-TTS or fallback.

Suggested files:

- `src/app/api/generate/staged/route.ts`
- `src/lib/staged-smoke-fixtures.ts`
- `src/remotion/Root.tsx`

Add deterministic smoke fixture coverage for:

- caption cues on both registered templates
- selected-segment narration and caption replacement
- render-time flattening after segment duration changes

## Non-Goals For This Slice

- no professional subtitle editor
- no word-level karaoke UI
- no waveform editor
- no beat sync, ducking, or DAW-style audio controls
- no broad media-layer editor expansion
- no multi-template-per-segment orchestration
- no persistence/history unless explicitly reopened
- no template-private subtitle models
- no full timeline editor yet

## Validation

This workstation is Docker-first. Prefer:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run build'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'
git diff --check
```

If dependency install fails in Docker due to cache or registry issues, use the
repo's existing Docker/npm recovery guidance from `AGENTS.md` and `README.md`.

## Source-Of-Truth Documents

- `docs/FINAL_PRODUCT_GOAL.md`
- `docs/PRODUCT_ARCHITECTURE.md`
- `docs/PRODUCT_REQUIREMENTS.md`
- `docs/MEDIA_LAYERS.md`
- `docs/providers/f5-tts.md`
- `docs/ITERATION_STATUS.md`
- `AGENTS.md`
