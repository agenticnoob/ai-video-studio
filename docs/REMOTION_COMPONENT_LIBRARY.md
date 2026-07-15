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
`producer:validate`, `producer:stills`, and `producer:render`. Phase 5 asset
supply and its provenance/license schema remain outside this component
inventory until implemented.
