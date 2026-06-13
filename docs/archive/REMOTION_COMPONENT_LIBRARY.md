# Remotion Component Library

This document defines how external Remotion template/example libraries, such
as React Video Editor's free Remotion templates, should be interpreted inside
`ai-video-studio`.

## Naming Decision

Some external projects use the word `template` for any reusable Remotion
composition, scene, transition, chart, text animation, or media effect.

In this project, those assets are not product templates by default.

```txt
External Remotion "template"
  reusable Remotion component, primitive, scene block, transition, chart,
  background, media treatment, or motion example

ai-video-studio template
  one primary implementation mechanism for a VideoSegment, selected through
  templateId and backed by a schema-valid implementation payload
```

Do not import the external naming directly into the product model. When an
external library says "template", translate that to "component candidate" or
"primitive candidate" first.

## Role In The Product

Reusable Remotion components are internal building blocks. They can help a
registered template render richer visuals, but they are not directly selected
by the generation provider.

The durable flow is:

```txt
VideoSegment
  -> chooses one registered templateId
  -> template validates one implementation payload
  -> template runtime maps semantic fields to block renderers
  -> block renderers compose Remotion primitives/components
```

The provider should continue to choose high-level templates such as
`scripted`, `spotlight`, or future segment-level templates such as
`data-story`, `product-intro`, or `image-gallery`. It should not choose
low-level components such as `PixelTransition`, `PoppingText`, or `BarChart`
as segment templates.

## Where Components Live

Reusable Remotion building blocks should live under `src/remotion/`, grouped
by role. Preferred structure:

```txt
src/remotion/primitives/
  backgrounds/
  charts/
  cinematic/
  elements/
  layouts/
  logos/
  media/
  scenes/
  text/
  transitions/
```

Use the narrowest directory that fits:

- `elements/`: small visual atoms such as labels, panels, badges, chips, and
  counters.
- `layouts/`: repeated-content arrangements such as grids, split screens, and
  comparison rows.
- `backgrounds/`: full-frame visual backgrounds.
- `text/`: reusable text animation treatments.
- `charts/`: data visualization components.
- `transitions/`: visual transitions and frame-driven transition helpers.
- `logos/`: logo reveal or brand-mark treatments.
- `media/`: image/video presentation components.
- `cinematic/`: letterbox, film, vignette, and camera-style treatments.
- `scenes/`: complete scene-level blocks composed from lower-level
  primitives.

`src/components/` remains reserved for product-page UI.

## Candidate Catalog

If many external-style components are added, add a catalog before adding them
to templates directly:

```txt
src/remotion/catalog/
  categories.ts
  primitive-catalog.ts
  examples/
```

The catalog can power Remotion Studio showcase compositions and internal
review, but it should not become the provider-facing template registry.

A catalog entry should record:

- stable component id
- label
- category
- description
- supported use cases
- runtime component
- Zod props schema when useful
- default props for Studio previews
- current maturity: candidate, reusable, adopted, or deprecated

The RVE intake uses `src/remotion/catalog/primitive-catalog.ts` as this
metadata source and `/primitives` as the browser-based review page. Catalog
entries record the upstream repository, commit, source file, license,
category, component name, status, and review duration. The catalog is an
internal component-library index; it is not the provider-facing template
registry and it should not be expanded into one Remotion Studio composition
per primitive.

Current RVE source baseline:

```txt
repository: https://github.com/reactvideoeditor/remotion-templates
commit: 6209b724798e48ff395f8df1a6fa2d26082372b5
license: MIT
```

Related external references:

- Clippkit (`https://github.com/reactvideoeditor/clippkit`) reinforces the
  component-library and catalog intake model.
- Remotion trailer (`https://github.com/remotion-dev/trailer`) is a
  finished-video narrative reference, not a primitive registry.

Project-specific takeaways from both are recorded in
`docs/archive/EXTERNAL_REMOTION_REFERENCES.md`.

## Promotion Path

Do not promote a primitive into `src/templates/` just because it is visually
interesting.

Promotion is only appropriate when the component set can implement a complete
segment intent and deserves an AI-visible schema contract.

```txt
primitive candidate
  reusable visual component

scene/block candidate
  semantic visual unit used by a template runtime

template-local block contract
  server-safe mapping between implementation fields and primitives

registered template
  segment-level implementation mechanism with schema, definition, editor,
  runtime adapter, and registration
```

Examples:

| External-style component | Product interpretation |
|---|---|
| `PoppingText` | `src/remotion/primitives/text/PoppingText.tsx` |
| `PixelTransition` | `src/remotion/primitives/transitions/PixelTransition.tsx` |
| `BarChart` | `src/remotion/primitives/charts/BarChart.tsx` |
| `LogoFadeReveal` | `src/remotion/primitives/logos/LogoFadeReveal.tsx` |
| `LowerThird` | `src/remotion/primitives/scenes/LowerThird.tsx` |
| `GalleryGrid` | `src/remotion/primitives/media/GalleryGrid.tsx` |
| data-heavy report segment | possible future `src/templates/data-story/` |
| product launch intro segment | possible future `src/templates/product-intro/` |

## Implementation Rules

When adding a reusable Remotion component:

1. Check `.agents/skills/remotion-best-practices/SKILL.md`.
2. Keep motion deterministic and frame-driven with Remotion APIs.
3. Do not use CSS animations, CSS transitions, or Tailwind animation
   utilities for render-critical motion.
4. Keep primitive props runtime-focused and template-agnostic.
5. Do not expose primitive-only props to the provider unless a template
   explicitly promotes them into its implementation schema.
6. Add a small Studio showcase only when it helps review the component.
7. Keep showcase compositions separate from product template registration.
8. Update `docs/archive/REMOTION_PRIMITIVES.md` for adopted reusable primitives.

## External Reference Policy

External Remotion libraries can be used as inspiration for categories,
interaction patterns, and implementation ideas.

Do not copy source code directly unless the license clearly allows it and the
source is recorded in the implementation notes. Prefer re-implementing the
effect in the local style, using the repo-local Remotion rules and project
theme contracts.
