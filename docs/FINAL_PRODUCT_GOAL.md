# Final Product Goal

Status: active authority from 2026-07-15.

`.agents/skills/ai-video-studio-agent-producer/` is the only supported
video-production entrypoint.

`.agents/skills/ai-video-studio-asset-library/` separately owns reusable image
admission and maintenance without becoming a video-production entrypoint.

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

Iteration authority tracks product capabilities and milestones, not the
delivery state of an individual video production. A composition's render,
cover, audiovisual review, or quality state affects that production only; it
does not create, block, or reopen an iteration unless an approved milestone
explicitly names the composition as acceptance evidence. Use composition-local
records and ignored local artifacts for ordinary production status.

## Current Runtime Boundary

The direct VoxCPM Producer runtime under `scripts/lib/producer-audio/` owns
future narration transport, punctuation splitting, PCM silence trim and WAV
concatenation, measured duration, captions, local output, and scene recovery.
It runs without Next. Phase 2 alternate-provider deletion, Phase 3 Web product
removal, Phase 4 Producer OS consolidation, and Phase 5 existing-asset supply
are complete. A strict maintained manifest plus asset manifest, manual/URL
localization, checksum/provenance/license/media metadata, FFmpeg normalization,
preflight, validation, review-frame, and unified render commands now own every
future composition. Every pre-Phase-7 registry entry remains
`frozen-reference`; Phase 7 added one maintained proof. Phase
6 Remotion capability core is complete on an exact `4.0.489` closure. Four
Producer-owned effect ids, guarded Chinese text fitting, four official
transition presets with calculated overlap duration, light-leak/film-burn
treatment, and HTML/SVG/image/video canvas proofs are available through the
isolated inventory showcase. No override or mixed Remotion version is present.
Phase 7 is complete with repo-owned local Video, animated-image, Lottie,
motion-blur/trail, soundtrack, ducking, transition-SFX, and audio-quality
surfaces. GIF uses exact `@remotion/gif` for LAN HTTP Studio compatibility;
APNG/AVIF/WebP retain Remotion `AnimatedImage`, and local Video keeps the
official native-video fallback available when LAN HTTP Studio lacks WebCodecs
`VideoDecoder`. Its maintained proof includes real VoxCPM narration, strict
asset preflight, deterministic reviewed stills, covers, and an H.264/AAC
render. Phase 8A is now complete with six typed code-driven profile contracts and six
deterministic inventory fixtures. The profiles constrain composition, motion,
texture, media, Three.js, captions, and sound rather than selecting a template
or generating a scene. Phase 8B style-profile sample contract is complete.
Future scaffolds require one validated profile id while the completed Phase 7
proof remains unchanged. `TcpHandshakeEditorial` and `TcpHandshakeTerminal`
prove `editorial-tech` and `retro-terminal` against identical facts with real
VoxCPM narration, strict assets, reviewed stills/covers, and H.264/AAC renders.
Phase 8 is complete. Phase 9A deterministic quality gates are complete. The
future-only scaffold now owns a composition quality module, and the
post-render `producer:quality` command verifies measured text/layout bounds,
safe margins, evidence resolution, planned rendered frames, near-blank/low-
contrast frames, MP4/metadata/chapter agreement, and tracked generated paths.
Existing completed maintained proofs remain unchanged through the compatibility
boundary. Phase 9B completed `DnsResolutionExplainer` through the final path:
real direct VoxCPM narration, nine strict manifest-backed assets, deterministic
paper/SVG treatment, official transitions, reviewed stills and covers, a
739-frame H.264/AAC render, publishing copy, and successful `producer:quality`.
Phase 9 is complete and the Agent Producer-only Roadmap is complete. No
additional Roadmap phase has started.

The separate post-Roadmap v1 reusable image library accepts folder-oriented
Agent intake from the ignored inbox. Users may provide supported images plus
partial, shared, or overlapping description documents; the Agent relates and
visually inspects them, completes semantic records, and invokes deterministic
per-item ingestion. User inbox assets inherit the repository authorization and
no-attribution policy without a per-asset questionnaire. This does not add a
Roadmap phase or expand the library beyond SVG/PNG/JPEG/WebP. The dedicated
`.agents/skills/ai-video-studio-asset-library/` owns this workflow; Agent
Producer only searches and consumes active items for new videos.

One approved post-Roadmap v1 capability is complete: the Agent-managed reusable
SVG/PNG/JPEG/WebP library admits items independently of video use, produces a
deterministic machine catalog and local read-only HTML report, and validates
future composition snapshots. It is not Phase 10 and does not alter the
Roadmap completion definition.

A second bounded post-Roadmap capability, `stock-assets-mcp`, is complete as an
independently installable local Pexels-only stdio acquisition fallback. Agent
Producer classifies each beat as asset-led, code-led, or hybrid, searches the
reviewed library first, and uses the MCP only when an asset-led or hybrid beat
has no suitable result. Its versioned `acquisition.json` receipt feeds the
existing `producer:assets` contract; Remotion consumes only the localized
composition copy. Later reusable-library admission remains an explicit Asset
Library task. This is not Phase 10 or another production entrypoint. It adds no
HTTP, OAuth, UI, Unsplash, Pixabay, stock video, automatic promotion, or
automatic deletion, and completed and frozen compositions remain unchanged.

## Chinese Science-Explainer Narration Default

For future Chinese science-explainer narration, default to the user-accepted
`science-explainer-young-male` profile. Its normal mode is
`controllable-clone` with
`voices/clone/science-explainer-young-male.wav` and compact per-beat control
instructions. When highest timbre fidelity is the priority, use
`high-fidelity-clone` with the same WAV and the exact same-name transcript at
`voices/clone/science-explainer-young-male.txt`, and omit the control
instruction. An explicit production brief may override this science-only
default; non-science content retains the existing default clone configuration.
Missing private reference files must fail closed and must not silently fall
back to `lyy`, F5, or another provider.

User audition status: accepted on 2026-07-19.

## Supporting Authorities

- current status: `docs/ITERATION_STATUS.md`
- full roadmap: `docs/AGENT_PRODUCER_ONLY_ROADMAP.md`
- removal inventory: `docs/architecture/agent-producer-only-removal-inventory.json`
- Remotion inventory: `docs/REMOTION_COMPONENT_LIBRARY.md`
- promotion gate: `docs/PRODUCER_PROMOTION_GATE.md`
- asset contract: `docs/PRODUCER_ASSET_CONTRACT.md`
- VoxCPM reference: `docs/providers/voxcpm.md`
- historical context: `docs/archive/`
