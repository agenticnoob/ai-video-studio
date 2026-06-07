# Remotion Primitives

This document explains the reusable Remotion building blocks under
`src/remotion/primitives/`.

These components are video-rendering primitives for templates. They are not
page UI components and they are not top-level product concepts. A template may
compose several primitives to produce its final visual style while still
remaining one primary template for a `VideoSegment`.

For Remotion motion rules, keep animation deterministic and frame-driven with
Remotion APIs. Do not use CSS animations, CSS transitions, or Tailwind
animation utilities for render-critical motion.

## Current Inventory

| Primitive | File | Visual Effect | Current Use |
|---|---|---|---|
| `VideoPanel` | `src/remotion/primitives/elements/VideoPanel.tsx` | Large rounded content panel with themed background, border, shadow, entrance opacity, and slight slide/scale-in motion. | `scripted`, `spotlight` |
| `Kicker` | `src/remotion/primitives/elements/Kicker.tsx` | Small uppercase label above primary content, using the template secondary color and wide letter spacing. | `scripted`, `spotlight` |
| `CalloutGrid` | `src/remotion/primitives/elements/CalloutGrid.tsx` | Horizontal grid of short key messages, each with an alternating primary/secondary top rule. | `spotlight` |
| `TitleScene` | `src/remotion/primitives/scenes/TitleScene.tsx` | Title block with optional kicker and subtitle; optimized for opening or section-title moments. | `scripted` |
| `BulletScene` | `src/remotion/primitives/scenes/BulletScene.tsx` | Heading plus short bullet list; optimized for concise explanation or takeaway moments. | `scripted` |
| `QuoteScene` | `src/remotion/primitives/scenes/QuoteScene.tsx` | Large quote text with optional author; optimized for testimonial, insight, or emotional emphasis. | `scripted` |
| `useEntranceProgress` | `src/remotion/primitives/transitions/useEntranceProgress.ts` | Frame-driven spring progress helper returning `0..1` for entrance animation. | `scripted`, `spotlight` |
| `RemotionTheme` | `src/remotion/primitives/theme.ts` | Shared theme shape used by primitives: background, panel, primary, secondary, text, muted. | primitives and templates |

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
