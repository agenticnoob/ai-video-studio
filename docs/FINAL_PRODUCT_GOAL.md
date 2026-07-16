# Final Product Goal

Status: active authority from 2026-07-15.

`.agents/skills/ai-video-studio-agent-producer/` is the only supported
video-production entrypoint.

Visual production uses code and existing assets only.

The implementation sequence is defined by
`docs/AGENT_PRODUCER_ONLY_ROADMAP.md`.

## Only Supported Production Flow

The only supported production flow is:

```txt
topic or supplied material
  -> Agent Producer skill
  -> research and existing-asset collection
  -> narration beats
  -> VoxCPM audio and duration-derived captions
  -> primitive / block / runtime inventory
  -> dedicated Remotion composition
  -> asset and composition preflight
  -> representative still review
  -> local MP4 and ffprobe verification
  -> code-rendered Remotion Still covers
  -> publishing copy
```

The product is a focused local production operating system, not a Web video
generator or editor.

## Required Surfaces

- `.agents/skills/ai-video-studio-agent-producer/`
- `.agents/skills/remotion-best-practices/`
- VoxCPM expression and voice-clone guidance
- dedicated Remotion compositions
- primitives, blocks, effects, transitions, and style profiles
- standalone timing, audio, caption, and canvas helpers
- Producer sample manifests, validation, and review-frame tooling
- existing-asset localization, provenance, and license records
- Remotion Studio and CLI rendering
- local MP4, metadata, code-rendered covers, and publishing outputs

## Excluded Concepts

These concepts are not supported product surfaces:

- Web brief-to-video generation
- `VideoProject`, `VideoSegment`, and `StoryboardPlan`
- planner-selected templates and recipes
- selected-segment regeneration
- product upload/binding and editor workflows
- Web progress, render, export, or Lambda routes
- F5 generation, selection, service, adapter, fallback, or restoration; Phase 2
  removed these executable surfaces
- provider-neutral narration selection
- image generation or video generation

Phase 3 removed their active runtime, UI, route, package, template, and planner
surfaces. Narrow historical types and recipe helpers remain only where frozen
compositions still import them.

## Visual Boundary

Allowed visual inputs include React, HTML, SVG, Canvas, CSS filters, masks,
Three.js, existing GLB/glTF, HDRI, textures, images, videos, screenshots,
audio, fonts, Lottie, Rive, user-supplied files, real captures, and localized
licensed assets.

When a real source capture fails or is unreadable, record the reason outside
the frame and build an honest code-rendered information graphic. Covers are
registered Remotion `<Still>` compositions rendered in 16:9 and 9:16.

## Frozen History

Existing finished compositions remain read-only references.

- Do not migrate or regenerate them solely to adopt new tooling.
- Keep committed source and generated-audio metadata truthful.
- Historical `provider: "f5-tts"` metadata is allowed in frozen
  `audio.generated.ts` files and must remain truthful.
- Existing local F5-generated audio may still play when available.
- No current command, service, adapter, config, documentation, or Skill may
  restore F5 or another narration fallback.

## Ownership Boundary

Automation owns deterministic work: VoxCPM requests and recovery, punctuation
splitting, silence trim, WAV concatenation, duration measurement, caption cues,
asset localization and metadata, registration checks, review-frame commands,
codec checks, and artifact verification.

The agent owns research, factual judgment, narration structure, visual
metaphor, asset choice, scene composition, motion and sound design, visual
review, revisions, and promotion decisions.

## Current Runtime Boundary

The direct VoxCPM Producer runtime under `scripts/lib/producer-audio/` owns
future narration transport, punctuation splitting, PCM silence trim and WAV
concatenation, measured duration, captions, local output, and scene recovery.
It runs without Next. Phase 2 alternate-provider deletion, Phase 3 Web product
removal, Phase 4 Producer OS consolidation, and Phase 5 existing-asset supply
are complete. A strict maintained manifest plus asset manifest, manual/URL
localization, checksum/provenance/license/media metadata, FFmpeg normalization,
preflight, validation, review-frame, and unified render commands now own every
future composition. Current registry entries remain `frozen-reference`. Phase
6 Remotion capability core is complete on an exact `4.0.489` closure. Four
Producer-owned effect ids, guarded Chinese text fitting, four official
transition presets with calculated overlap duration, light-leak/film-burn
treatment, and HTML/SVG/image/video canvas proofs are available through the
isolated inventory showcase. No override or mixed Remotion version is present.
Phase 7 dynamic existing media and sound design is next and has not started.

## Supporting Authorities

- current status: `docs/ITERATION_STATUS.md`
- full roadmap: `docs/AGENT_PRODUCER_ONLY_ROADMAP.md`
- removal inventory: `docs/architecture/agent-producer-only-removal-inventory.json`
- Remotion inventory: `docs/REMOTION_COMPONENT_LIBRARY.md`
- promotion gate: `docs/PRODUCER_PROMOTION_GATE.md`
- asset contract: `docs/PRODUCER_ASSET_CONTRACT.md`
- VoxCPM reference: `docs/providers/voxcpm.md`
- historical context: `docs/archive/`
