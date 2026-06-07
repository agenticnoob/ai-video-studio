# Remotion Primitives

This document explains the reusable Remotion building blocks under
`src/remotion/primitives/`.

These components are video-rendering primitives for templates. They are not
page UI components and they are not top-level product concepts. A template may
compose several primitives to produce its final visual style while still
remaining one primary template for a `VideoSegment`.

External Remotion libraries may call similar assets "templates". In this repo,
those assets should be treated as reusable component or primitive candidates
first. See `docs/REMOTION_COMPONENT_LIBRARY.md` for the intake and promotion
policy.

For Remotion motion rules, keep animation deterministic and frame-driven with
Remotion APIs. Do not use CSS animations, CSS transitions, or Tailwind
animation utilities for render-critical motion.

Mouse-following effects should consume normalized cursor tracks when they need
to be exportable. Use `CursorKeyframeTrack` from
`src/remotion/primitives/interaction/cursor-keyframes.ts` for Remotion-side
playback. Browser-side recording is not part of the current product flow.

## Current Inventory

| Primitive | File | Visual Effect | Current Use |
|---|---|---|---|
| `VideoPanel` | `src/remotion/primitives/elements/VideoPanel.tsx` | Large rounded content panel with themed background, border, shadow, entrance opacity, and slight slide/scale-in motion. | `scripted`, `spotlight` |
| `MetaBallsPrimitive` | `src/remotion/primitives/backgrounds/MetaBallsPrimitive.tsx` | Full-frame OGL/WebGL metaball shader with deterministic frame-driven blob motion and a cursor-like path ball. | Studio showcase |
| `CursorKeyframeTrack` | `src/remotion/primitives/interaction/cursor-keyframes.ts` | Shared normalized cursor trajectory model and frame interpolation helpers for mouse-driven render effects. | `MetaBallsPrimitive` |
| `Kicker` | `src/remotion/primitives/elements/Kicker.tsx` | Small uppercase label above primary content, using the template secondary color and wide letter spacing. | `scripted`, `spotlight` |
| `CalloutGrid` | `src/remotion/primitives/layouts/CalloutGrid.tsx` | Horizontal grid of short key messages, each with an alternating primary/secondary top rule. | `spotlight` |
| `TitleScene` | `src/remotion/primitives/scenes/TitleScene.tsx` | Title block with optional kicker and subtitle; optimized for opening or section-title moments. | `scripted` |
| `BulletScene` | `src/remotion/primitives/scenes/BulletScene.tsx` | Heading plus short bullet list; optimized for concise explanation or takeaway moments. | `scripted` |
| `QuoteScene` | `src/remotion/primitives/scenes/QuoteScene.tsx` | Large quote text with optional author; optimized for testimonial, insight, or emotional emphasis. | `scripted` |
| `useEntranceProgress` | `src/remotion/primitives/transitions/useEntranceProgress.ts` | Frame-driven spring progress helper returning `0..1` for entrance animation. | `scripted`, `spotlight` |
| `RemotionTheme` | `src/remotion/primitives/theme.ts` | Shared theme shape used by primitives: background, panel, primary, secondary, text, muted. | primitives and templates |

## Directory Layers

Reusable Remotion primitives are split by role:

- `elements/`: small visual atoms such as labels and panels.
- `layouts/`: reusable arrangements of repeated content, such as callout grids.
- `backgrounds/`: full-frame reusable background treatments.
- `charts/`: reusable data visualization components.
- `cinematic/`: film, vignette, letterbox, or camera-style treatments.
- `logos/`: logo reveal and brand-mark treatments.
- `media/`: reusable image/video presentation components.
- `scenes/`: complete scene-level blocks composed from elements and layouts.
- `text/`: reusable text animation treatments.
- `transitions/`: frame-driven motion helpers and transition utilities.

Keep future additions in the narrowest layer that fits. A primitive should not
be promoted into a segment template unless it has a template-specific schema,
definition, runtime adapter, and registration path.

## Parameter Exposure Model

Primitive props are not exposed to the LLM directly.

The LLM sees template implementation fields through the registered template
schemas and prompts. The template runtime then maps those implementation fields
to primitive props.

```txt
LLM-visible parameters
  src/templates/<template>/definition.ts
  src/templates/<template>/schema.ts
  src/lib/*-schema.ts for current implementation schemas

Semantic block contracts
  src/templates/<template>/blocks.ts

Template runtime mapping
  src/templates/<template>/block-renderers.tsx
  src/remotion/<TemplateVideo>/*
  src/templates/<template>/runtime.tsx

Primitive props
  src/remotion/primitives/*
```

This keeps primitives reusable and template-agnostic. A primitive can have
layout or motion props that a template controls internally without exposing
those knobs to generation.

For AI-assisted development, the preferred middle layer is a template block
contract. A block contract documents the visual effect, AI-visible fields,
intended use cases, and primitive mapping. The current scripted template uses
`src/templates/scripted/blocks.ts` for this relationship and
`src/templates/scripted/block-renderers.tsx` for the runtime mapping.

Current mapping examples:

| Template | LLM-visible implementation field | Runtime mapping | Primitive prop |
|---|---|---|---|
| `scripted` | `implementation.theme` | passed through `SceneRenderer` | `theme` on `VideoPanel`, `TitleScene`, `BulletScene`, `QuoteScene` |
| `scripted` | `implementation.scenes[].kicker` | `SceneRenderer` switches on `scene.type` | `kicker` on `TitleScene`, `BulletScene`, `QuoteScene` |
| `scripted` | `implementation.scenes[].title` | `scene.type === "title"` or `"bullets"` | `title` on `TitleScene` or `BulletScene` |
| `scripted` | `implementation.scenes[].subtitle` | `scene.type === "title"` | `subtitle` on `TitleScene` |
| `scripted` | `implementation.scenes[].bullets` | `scene.type === "bullets"` | `bullets` on `BulletScene` |
| `scripted` | `implementation.scenes[].quote` / `author` | `scene.type === "quote"` | `quote` / `author` on `QuoteScene` |
| `scripted` | `implementation.scenes[].duration` | used by `SceneRenderer` | duration controls `useEntranceProgress(Math.min(40, scene.duration))` |
| `spotlight` | `implementation.theme` | passed through `SpotlightVideo` | `theme` on `VideoPanel`, `Kicker`, `CalloutGrid` |
| `spotlight` | `implementation.kicker` | rendered when present | `children` on `Kicker` |
| `spotlight` | `implementation.callouts` | passed directly | `callouts` on `CalloutGrid` |
| `spotlight` | `implementation.durationInFrames` | used by `SpotlightVideo` | duration controls sweep animation range |

Runtime-only props are intentionally not LLM-visible unless a template decides
they are part of its implementation contract. Examples:

- `VideoPanel.padding`
- `VideoPanel.maxWidth`
- `VideoPanel.style`
- `Kicker.style`
- `useEntranceProgress.damping`

If a future template needs the LLM to control one of those values, add a
template-specific implementation field first, validate it in that template's
schema, document it in that template's prompt, and then map it to the primitive
prop in the template runtime.

## AI-Assisted Development Rule

When asking AI to add a new template capability, prefer this order:

1. Add or reuse Remotion primitives under `src/remotion/primitives/`.
2. Add a template-local block contract under
   `src/templates/<template>/blocks.ts`.
3. Add runtime mapping under `src/templates/<template>/block-renderers.tsx`.
4. Keep the template implementation schema as the only LLM-visible parameter
   contract.
5. Update this document with the primitive effect and mapping.

This prevents AI-generated changes from merging rendering props, block
semantics, and template schemas into one hard-to-maintain blob.

## Elements

### `VideoPanel`

Effect:
- creates a large rounded panel for foreground content
- uses `theme.panel` as the fill color
- adds a subtle border derived from `theme.primary`
- adds a soft shadow derived from `theme.background`
- applies entrance opacity and a slight upward slide / scale-in motion

Main props:
- `theme`: visual colors
- `children`: content rendered inside the panel
- `entrance`: motion progress, usually from `useEntranceProgress()`
- `maxWidth`: maximum panel width; defaults to `980`
- `padding`: panel spacing; defaults to `48px 56px`
- `style`: template-specific overrides

Use when:
- a template needs a stable content card or feature panel
- multiple scene types should share the same container treatment
- a template wants to customize layout while keeping panel styling consistent

Current examples:
- `scripted` wraps title, bullet, and quote scene content in `VideoPanel`
- `spotlight` uses it as a large absolute-positioned focused-card surface

### `Kicker`

Effect:
- renders a short uppercase label above main content
- uses `theme.secondary`
- applies bold weight, wide letter spacing, and compact spacing below

Main props:
- `theme`: visual colors
- `children`: short label text
- `style`: optional size/spacing overrides

Use when:
- a scene needs a category, section label, hook label, or tone marker
- the primary headline should be visually preceded by a small framing phrase

Current examples:
- `TitleScene`, `BulletScene`, and `QuoteScene` use `Kicker`
- `spotlight` uses `Kicker` above the large headline

## Layouts

### `CalloutGrid`

Effect:
- renders short key messages in a grid
- uses up to four equal columns
- gives each callout a top border
- alternates the top border between `theme.primary` and `theme.secondary`

Main props:
- `callouts`: short text items
- `theme`: visual colors

Use when:
- a template needs quick scan-friendly takeaways
- a focused card needs 2-4 supporting points under a main headline
- the content is not long enough to require a full bullet scene

Current examples:
- `spotlight` uses `CalloutGrid` as the bottom supporting-message row

## Scenes

### `TitleScene`

Effect:
- renders an optional kicker
- renders a large 64px bold title
- renders an optional subtitle below the title in muted color

Main props:
- `title`: primary heading
- `subtitle`: optional supporting line
- `kicker`: optional label above the heading
- `theme`: visual colors

Use when:
- opening a segment
- introducing a new section
- presenting one strong idea with optional supporting copy

Current examples:
- `scripted` maps `scene.type === "title"` to `TitleScene`

### `BulletScene`

Effect:
- renders an optional kicker
- renders a large heading
- renders short bullet lines below the heading

Main props:
- `title`: scene heading
- `bullets`: short list items
- `kicker`: optional label above the heading
- `theme`: visual colors

Use when:
- explaining a few key points
- listing steps, benefits, reasons, or takeaways
- keeping text short enough for video display

Current examples:
- `scripted` maps `scene.type === "bullets"` to `BulletScene`

### `QuoteScene`

Effect:
- renders an optional kicker
- renders a large quote block
- renders an optional author line in secondary color

Main props:
- `quote`: quoted text
- `author`: optional attribution
- `kicker`: optional label above the quote
- `theme`: visual colors

Use when:
- showing a testimonial
- highlighting a memorable sentence
- creating an emotional or reflective beat

Current examples:
- `scripted` maps `scene.type === "quote"` to `QuoteScene`

## Transitions

### `useEntranceProgress`

Effect:
- returns a spring-driven progress value for entrance animation
- value is consumed by components such as `VideoPanel`
- keeps motion frame-driven through Remotion's `spring()`

Main parameters:
- `durationInFrames`: how long the entrance should take
- `damping`: spring damping, default `200`

Use when:
- a template needs deterministic entrance motion
- several components should share the same entrance progress
- motion should remain render-safe and avoid CSS animation

Current examples:
- `scripted` uses `useEntranceProgress(Math.min(40, scene.duration))`
- `spotlight` uses `useEntranceProgress(38, 180)`

## Theme Shape

`RemotionTheme` is the shared color contract for primitives:

```ts
type RemotionTheme = {
  background: string;
  panel: string;
  primary: string;
  secondary: string;
  text: string;
  muted: string;
};
```

This mirrors the current template theme shape. Templates can pass their
implementation theme directly into primitives.

## Adding A New Primitive

When adding a reusable Remotion primitive:

1. Put it under `src/remotion/primitives/`, grouped by role:
   `scenes/`, `elements/`, `transitions/`, or another clear runtime category.
2. Keep the component parameterized and template-agnostic.
3. Use Remotion frame-driven APIs for motion.
4. Export it from `src/remotion/primitives/index.ts`.
5. Add an entry to this document describing its visual effect, props, and
   intended use.
6. Only add it to prompts if the provider truly needs to know it. Most
   primitives should stay internal to template runtime code.
