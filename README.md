# AI Video Studio

This repository is a local Agent Producer operating system for deterministic,
code-driven Remotion videos made from real topics and existing assets.

`.agents/skills/ai-video-studio-agent-producer/` is the only supported
video-production entrypoint.

Visual production uses code and existing assets only.

The implementation sequence is defined by
`docs/AGENT_PRODUCER_ONLY_ROADMAP.md`.

## Supported Flow

```txt
topic or supplied material
  -> Agent Producer skill
  -> research and existing-asset collection
  -> narration beats and VoxCPM
  -> primitive / block / runtime inventory
  -> dedicated Remotion composition
  -> preflight and representative still review
  -> local MP4 and metadata
  -> Remotion Still covers
  -> publishing copy
```

New videos are purpose-built compositions under
`src/remotion/<CompositionName>/`. Remotion Studio and CLI are the preview,
still, and render surfaces.

## Current Transition

Legacy Web and F5 code remains on disk while the phased removal roadmap is
executed. It is unsupported and must not be used for new work.

The direct VoxCPM Producer runtime under `scripts/lib/producer-audio/` now owns
future narration transport, PCM WAV processing, duration-derived captions, and
scene recovery without starting Next. Phase 2 still owns F5 deletion and Phase
3 still owns the Web product line; neither deletion phase is part of Phase 1.

Existing finished compositions remain frozen read-only references. Historical
`provider: "f5-tts"` metadata in their generated audio files stays truthful;
it does not authorize new F5 generation.

## Production Rules

- Use React, HTML, SVG, Canvas, Three.js, Remotion effects, and deterministic
  frame-driven motion.
- Use local or localized images, videos, screenshots, SVG, audio, fonts,
  Lottie, Rive, GLB/glTF, textures, and user-supplied files.
- Attempt real source capture when evidence is needed. If capture fails, record
  why and build an honest code-rendered information graphic.
- Generate new narration with VoxCPM only.
- Render 16:9 and 9:16 covers as Remotion `<Still>` compositions using code and
  manifest-backed existing assets.
- Keep generated audio, captures, stills, covers, and MP4s local unless the
  user explicitly requests otherwise.

## Start Here

Read in this order:

1. `docs/FINAL_PRODUCT_GOAL.md`
2. `docs/ITERATION_STATUS.md`
3. `docs/AGENT_PRODUCER_ONLY_ROADMAP.md`
4. `.agents/skills/ai-video-studio-agent-producer/SKILL.md`
5. `.agents/skills/remotion-best-practices/SKILL.md`

Supporting references:

- `docs/REMOTION_COMPONENT_LIBRARY.md`
- `docs/PRODUCER_PROMOTION_GATE.md`
- `docs/providers/voxcpm.md`
- `docs/architecture/agent-producer-only-removal-inventory.json`

## Stable Producer Commands

```bash
npm run producer:validate -- --module <validation-module>
npm run producer:stills -- --composition <composition-id>
./scripts/render-video.sh <composition-id> <slug> <metadata-json>
npm run smoke:producer-audio-direct-voxcpm
npm run smoke:producer-audio-tools
npm run smoke:agent-producer-architecture
npm run smoke:skill-alignment
```

Current Docker validation remains:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit --pretty false'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run build'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx remotion compositions src/remotion/index.ts'
```

The `web` service name is transitional. Phase 3 replaces it with a
Producer/render-oriented topology.

## Local Artifact Boundary

- `public/generated/` — localized or generated-at-runtime audio, captures, and
  composition-owned media
- `out/` — stills, MP4s, metadata, covers, and publishing artifacts
- `voices/` — ignored private voice references
- `models/` — ignored local model/runtime data

Archived product history lives under `docs/archive/` and is not current
authority.
