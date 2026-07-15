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

## Current Runtime

Phase 3 removed the legacy Web generation/editor product, its APIs, templates,
planner/compiler path, Next packaging, and Web deployment surface.

The direct VoxCPM Producer runtime under `scripts/lib/producer-audio/` now owns
future narration transport, PCM WAV processing, duration-derived captions, and
scene recovery without starting Next. Phase 2 removed the F5 narration service,
adapters, scripts, configuration, and current provider documentation.
Remotion Studio, CLI rendering, and the Docker `producer` service are the
supported runtime surfaces. Phase 4 consolidated the Producer OS around one
strict future manifest, executable scaffold, validation, review-frame, and
render entrypoints. Phase 5 added strict asset manifests, manual/URL
localization, checksum, provenance/license/media metadata, FFmpeg
normalization, and preflight before maintained still/render execution. The
Phase 6 version gate now locks every currently installed Remotion package to
exact `4.0.489` and verifies the retained render surface. Phase 6 capability
implementation has not started.

The capability slice must not mix unsupported versions: npm currently exposes
`@remotion/transitions` only through `4.0.477`, whose dependency closure pins
Remotion internals to `4.0.477`. Effects, transitions, layout utilities, text
fitting, presets, and the capability showcase remain uninstalled/unimplemented.

Existing finished compositions remain frozen read-only references. Historical
`provider: "f5-tts"` metadata in their generated audio files stays truthful; it
does not authorize new F5 generation.

## Production Rules

- Use React, HTML, SVG, Canvas, Three.js, Remotion effects, and deterministic
  frame-driven motion.
- Use local or localized images, videos, screenshots, SVG, audio, fonts,
  Lottie, Rive, GLB/glTF, textures, and user-supplied files.
- Record every visible non-code asset in a `ProducerAssetManifest` and pass
  `producer:preflight` before representative stills.
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
- `docs/PRODUCER_ASSET_CONTRACT.md`
- `docs/providers/voxcpm.md`
- `docs/architecture/agent-producer-only-removal-inventory.json`

## Stable Producer Commands

```bash
npm run producer:scaffold -- --name <CompositionName> --slug <slug>
npm run producer:assets -- --manifest <supply-plan-json>
npm run producer:preflight -- --composition <composition-id>
npm run producer:validate -- --module <validation-module>
npm run producer:stills -- --composition <composition-id>
npm run producer:render -- --composition <composition-id>
npm run smoke:producer-os
npm run smoke:producer-assets
npm run smoke:remotion-version-gate
npm run smoke:producer-audio-direct-voxcpm
npm run smoke:producer-audio-tools
npm run smoke:agent-producer-web-removal
npm run smoke:agent-producer-architecture
npm run smoke:skill-alignment
```

New maintained samples declare a strict sample manifest and asset manifest under their dedicated
composition folder and enter the single registry only after video, cover, and
validation registration are ready. Current registry entries describe finished
compositions as `frozen-reference`; they are discovery metadata, not migration
targets.

Current Docker validation remains:

```bash
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npx tsc --noEmit --pretty false'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run lint'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run build'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npx remotion compositions src/remotion/index.ts'
```

## Local Artifact Boundary

- `public/generated/` — localized or generated-at-runtime audio, captures, and
  composition-owned media
- `out/` — stills, MP4s, metadata, covers, and publishing artifacts
- `voices/` — ignored private voice references
- `models/` — ignored local model/runtime data

Archived product history lives under `docs/archive/` and is not current
authority.
