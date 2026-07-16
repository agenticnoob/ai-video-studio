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
normalization, and preflight before maintained still/render execution. Phase 6
is complete on one exact `4.0.489` Remotion closure. Producer-owned
`comic-print`, `cyber-scan`, `paper-grain`, and `pixel-grid` effects, guarded
Chinese text fitting, four official transition presets, duration accounting,
light-leak/film-burn treatment, and HTML/SVG/image/video canvas-effect proofs
are available through the isolated `AgentProducerCapabilityShowcase` inventory
composition. The configured default npm mirror may expose stale transition
metadata; the lockfile resolves `@remotion/transitions@4.0.489` without
overrides or mixed versions.

Phase 7 dynamic existing media and sound design is complete. Repo-owned local
Video, animated-image, Lottie, motion-blur/trail, soundtrack, ducking,
transition-SFX, and audio-QC surfaces are proved by a maintained composition
with real VoxCPM narration, strict asset preflight, reviewed stills/covers, and
an H.264/AAC render. GIF playback uses `@remotion/gif`, so LAN HTTP Studio does
not require the secure-context-only WebCodecs `ImageDecoder`; other supported
animated formats retain Remotion `AnimatedImage`. Local Video allows Remotion's
official native-video fallback when LAN HTTP Studio does not expose WebCodecs
`VideoDecoder`. `getProducerStyleProfile()` now exposes the Phase 8A contract for
`editorial-tech`, `comic-anime`, `cinematic-3d`, `retro-terminal`,
`documentary-media`, and `hand-drawn-explainer`. The six code-only inventory
fixtures use the same message but visibly different composition, motion,
texture, media, Three.js, caption, and sound policies.
Phase 8B style-profile sample contract is complete. Future scaffolds
require an explicit validated profile id without retrofitting the completed
Phase 7 proof. `TcpHandshakeEditorial` and `TcpHandshakeTerminal` now prove
`editorial-tech` and `retro-terminal` on identical narration/facts through
real VoxCPM, strict assets, reviewed stills/covers, and H.264/AAC renders.
Phase 8 is complete. Phase 9 has not started.

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
npm run producer:scaffold -- --name <CompositionName> --slug <slug> --style-profile <profile-id>
npm run producer:assets -- --manifest <supply-plan-json>
npm run producer:preflight -- --composition <composition-id>
npm run producer:validate -- --module <validation-module>
npm run producer:stills -- --composition <composition-id>
npm run producer:render -- --composition <composition-id>
npm run smoke:producer-os
npm run smoke:producer-assets
npm run smoke:remotion-version-gate
npm run smoke:remotion-capabilities
npm run smoke:producer-media-sound
npm run smoke:producer-style-profiles
npm run smoke:producer-style-profile-sample-contract
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
