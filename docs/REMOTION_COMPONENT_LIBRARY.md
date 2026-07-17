# Remotion Component Library

Status: active Agent Producer component inventory contract.

`.agents/skills/ai-video-studio-agent-producer/` is the only supported
video-production entrypoint.

Visual production uses code and existing assets only.

The implementation sequence is defined by
`docs/AGENT_PRODUCER_ONLY_ROADMAP.md`.

This library exists to help the Agent Producer discover and reuse visual
capabilities while composing dedicated videos. It is not a template registry,
planner manifest, or universal scene system.

## Reuse Layers

```txt
primitive -> block -> dedicated composition -> proven shared capability
```

Shared capabilities may be effects, transitions, style profiles, media
treatments, layout helpers, audio helpers, or review tools. Topic facts,
narration, and one-off scene arrangements remain composition-local.

## Ownership

| Surface | Responsibility |
| --- | --- |
| `src/remotion/primitives/` | small visual atoms and focused treatments |
| `src/remotion/producer-samples/` | strict future manifests, scaffold, frozen-reference registry metadata, evidence-backed Producer blocks |
| `src/remotion/standalone-video/` | timing, audio, captions, and canvas profiles |
| `src/remotion/catalog/` | discovery metadata and review fixtures |
| `src/remotion/effects/` | Producer-owned deterministic effect preset factories |
| `src/remotion/styles/` | measured text fitting plus typed Producer style-profile constraints and defaults |
| `src/remotion/media/` | local Video, AnimatedImage, and Lottie render blocks |
| `src/remotion/motion/` | fixed CameraMotionBlur and Trail treatment selection |
| `src/remotion/sound/` | manifest-backed sound library, envelopes, soundtrack, and transition-SFX mapping |
| `src/remotion/capability-showcase/` | isolated Agent Producer capability inventory composition |
| dedicated composition | topic data, narration, scene order, and local arrangement |
| Agent Producer Skill | selection rules and production workflow |

`src/remotion/recipes/blocks/` and `recipes/timing/` remain frozen
compatibility for finished compositions. Future Producer work must use
`producer-samples/`, `standalone-video/`, primitives, or sample-local code
instead of extending those historical paths.

## Component Contract

A shared component should have:

- one clear visual responsibility
- deterministic frame-driven behavior
- typed, runtime-focused props
- no topic-specific facts or narration
- no remote default asset
- explicit canvas/layout assumptions
- source and license metadata when derived externally
- a real review fixture or composition use

Avoid giant prop bags, hidden wall-clock state, CSS animation, arbitrary URLs,
and props that reproduce an entire scene DSL.

## Existing Asset Contract

Components may consume only local or localized existing assets through stable
paths. Asset choice and provenance belong to the Producer job/manifest, not to
hard-coded remote defaults inside primitives.

Before acquiring or authoring equivalent image/SVG media, the Agent searches
the standalone reusable library catalog and inspects candidate semantic
records. SVG/PNG/JPEG/WebP admission does not require prior composition use;
search results guide but never replace Agent creative judgment. A chosen active
item is snapshotted into the future composition's normal
`ProducerAssetManifest` and preflighted for canonical path and metadata drift.

Admit images, video, SVG, audio, fonts, Lottie, Rive, GLB/glTF, HDRI, and
textures only after format and deterministic-render checks.

## Discovery Workflow

Before writing a new visual component:

1. inspect `.agents/skills/ai-video-studio-agent-producer/remotion-primitives/`
2. inspect `src/remotion/catalog/primitive-catalog.ts`
3. inspect `src/remotion/primitives/`
4. inspect Producer blocks and `standalone-video`
5. choose sample-local TSX when no shared component fits
6. extract reuse only after still/MP4 evidence

## Capability Roadmap

The following additions are owned by the Producer-only Roadmap:

- `@remotion/effects`, `CanvasImage`, and `HtmlInCanvas`
- project effect presets and custom `createEffect()` effects
- `@remotion/transitions` and transition/SFX mappings
- `@remotion/layout-utils` for text measurement and overflow protection
- local video, animated-image, Lottie, Rive, Three.js, and texture support
- BGM, ambience, SFX, ducking, clipping, and silence checks
- code-driven style profiles

A capability is not complete until the Agent Producer Skill documents when to
use it and a deterministic fixture or real composition proves it.

## Promotion Rule

Use `docs/PRODUCER_PROMOTION_GATE.md`. Do not promote a component because it is
visually interesting in isolation; require a real Producer sample, review
evidence, and a stable responsibility.

Historical template-centered guidance is preserved in
`docs/archive/2026-07-15-pre-producer-only-remotion-component-library.md`.

Phase 4 exposes the deterministic operating chain through `producer:scaffold`,
`producer:validate`, `producer:stills`, and `producer:render`. Phase 5 added the
strict `ProducerAssetManifest`, `producer:assets`, and `producer:preflight`;
components still receive only local paths and never own acquisition or license
decisions. Phase 6 version gate is complete: current Remotion dependencies are
exact `4.0.489`, above the selected `roughenEdges()` minimum of `4.0.487`.
Phase 6 Remotion capability core is complete.

| Capability | Selection rule |
| --- | --- |
| `comic-print` | printed panels and editorial emphasis |
| `cyber-scan` | terminal, signal, and system-state beats |
| `paper-grain` | document and hand-drawn explainer beats |
| `pixel-grid` | digital abstraction and state-change beats |
| `fitProducerText()` | bounded Chinese or long copy that needs explicit width, height, line, and fit diagnostics |
| `editorial-fade` | restrained editorial scene changes |
| `directional-slide` | spatial progression with an explicit direction |
| `signal-wipe` | system-state or signal handoffs |
| `cinematic-film-burn` | deliberate high-energy cinematic chapter breaks |
| `getProducerTransitionSeriesDuration()` | total duration for adjacent transition overlaps using official timing objects |
| `getProducerMediaEffectPreset()` | source-preserving effects for HTML, SVG, image, and video canvas sources |
| `ProducerLocalVideo` | local manifest-backed video with trim, loop, rate, crop, and volume control plus the official native-video fallback for LAN HTTP Studio |
| `ProducerAnimatedImage` | local animated image with explicit fit, speed, and loop behavior; GIF uses `@remotion/gif` for LAN HTTP Studio compatibility, while APNG/AVIF/WebP use `AnimatedImage` |
| `ProducerLottie` | local expression-inspected Lottie JSON loaded through `staticFile()` |
| `ProducerMotionTreatment` | fixed camera, typography, icon, or particle blur/trail treatment |
| `ProducerSoundtrack` | explicit local BGM, ambience, transition SFX, fades, and narration ducking |

Inspect `AgentProducerCapabilityShowcase` and run
`npm run smoke:remotion-capabilities` before selecting these shared surfaces.
They remain Producer capabilities, not style profiles or templates. Every
Remotion package, including transitions and light leaks, is exact `4.0.489`.
HTML-in-canvas rendering depends on
`Config.setAllowHtmlInCanvasEnabled(true)` and the compatible Chromium runtime
used by the Docker Producer; it is not a generic browser guarantee.

Phase 7 dynamic existing media and sound design owns the reusable modules above
and the maintained `AgentProducerMediaSoundProof`. The Phase 6 showcase-local
ignored FFmpeg fixture remains a separate canvas-effect proof. Rive is not
installed or claimed without an approved local `.riv` asset and real use.

Phase 8A adds `getProducerStyleProfile()` with six profile ids:
`editorial-tech`, `comic-anime`, `cinematic-3d`, `retro-terminal`,
`documentary-media`, and `hand-drawn-explainer`. Each record constrains
composition, motion, texture, media, Three.js, captions, and sound; it does not
generate scenes or select a template. Six code-only pages in
`AgentProducerCapabilityShowcase` prove the inventory boundary. Run
`npm run smoke:producer-style-profiles` before selection.
Phase 8B style-profile sample contract is complete. New
scaffolds must record one validated profile id; the completed Phase 7 proof is
not retrofitted. `TcpHandshakeEditorial` and `TcpHandshakeTerminal` prove
`editorial-tech` and `retro-terminal` with identical facts, real VoxCPM,
strict assets, reviewed stills/covers, and H.264/AAC renders.
Phase 8 is complete. Phase 9A adds the future-only composition quality module
and `producer:quality` post-render gate for measured text/layout bounds, safe
margins, evidence resolution, planned rendered frames, luma variation,
artifact metadata/chapters, and tracked generated paths. It is deterministic
validation, not an aesthetic score. Phase 9B is complete:
`DnsResolutionExplainer` uses deterministic code paper/SVG treatment, the
official `directional-slide`, manifest-backed SVG/audio, reviewed frames and
covers, and a quality-gated 739-frame H.264/AAC render. Phase 9 and the Roadmap
are complete.
