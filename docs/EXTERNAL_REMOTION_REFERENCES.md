# External Remotion References

Status: reference notes for future implementation and design work.

This document records how selected external Remotion projects should influence
`ai-video-studio` without changing the current product model.

Current referenced projects:

- Clippkit: `https://github.com/reactvideoeditor/clippkit`
- Remotion trailer: `https://github.com/remotion-dev/trailer`

## Product Boundary

Keep the current boundary:

```txt
VideoProject
  -> VideoSegment[]
  -> one primary templateId per segment
  -> template-specific implementation
  -> template runtime
  -> Remotion primitives / scene blocks
```

External projects can influence the primitive catalog, scene/block library,
template internals, and future template design. They should not directly
change the meaning of `VideoProject`, `VideoSegment`, `templateId`, or
`implementation`.

## Clippkit

Clippkit describes itself as a collection of reusable Remotion components for
videos: intros, text effects, animations, transitions, and full scenes. It is
closer to a video component library than to a video editor or generation
framework.

Project interpretation:

```txt
Clippkit component
  -> primitive candidate
  -> catalog entry
  -> optional scene/block candidate
  -> optional template-internal component
```

What to adopt:

- Treat video effects like a UI component system: categorized, previewable,
  documented, and reusable.
- Keep copied or ported components local so they can be normalized to this
  repo's theme, props, and Remotion rules.
- Record source metadata for imported ideas: repository, commit, source file,
  license, category, status, and review duration.
- Use `/primitives` and `src/remotion/catalog/primitive-catalog.ts` as the
  internal review path before a component is used by templates.
- Let components feed template-local block renderers, not the provider-facing
  template registry.

What not to adopt:

- Do not register every Clippkit component as a `templateId`.
- Do not let the provider choose low-level components such as text effects,
  waveform elements, loaders, or card effects directly.
- Do not preserve render-critical CSS animations or transitions when porting;
  convert motion to Remotion frame-driven logic.
- Do not install an external component library as a black box when local
  source normalization is practical.

Current local alignment:

- The complete RVE primitive intake already follows this model: upstream
  components are local primitives and catalog entries, not registered
  `VideoSegment` templates.
- Future Clippkit-style additions should follow the same intake path.

## Remotion Trailer

`remotion-dev/trailer` is the source project for the Remotion promo video. It
is a hand-authored finished video project, not a reusable component registry.

Project interpretation:

```txt
Remotion trailer scene
  -> scene/block pattern reference
  -> possible primitive or template-local block
  -> possible future segment-level template inspiration
```

What to adopt:

- Use explicit scene names and scene-level components for maintainable
  narrative structure.
- Compose complete videos from many focused scene blocks plus precise Remotion
  timeline sequencing.
- Treat product trailer patterns as future template inspiration:
  intro, feature beat, code walkthrough, terminal/demo moment, website reveal,
  transition bridge, pricing/CTA, and end card.
- Keep timing, transitions, voiceover, and scene durations explicit enough to
  reason about preview and export behavior.
- Consider a future `product-intro` or `launch-trailer` registered template
  only after its semantic schema is clear.

Possible future template shape:

```ts
type ProductIntroImplementation = {
  meta: { title: string; fps: 30; width: 1280; height: 720 };
  theme: RemotionTheme;
  productName: string;
  tagline?: string;
  problem?: string;
  featureBeats: Array<{
    title: string;
    description?: string;
    codeSnippet?: string;
    visualHint?: "code" | "terminal" | "website" | "card";
  }>;
  cta?: string;
  durationInFrames: number;
};
```

What not to adopt:

- Do not copy the whole trailer as a product template; it is tailored to
  Remotion's own brand and script.
- Do not replace the current segment-first project model with a one-off
  hand-authored video tree.
- Do not expose scene implementation details directly to MiniMax before a
  registered template schema exists.
- Do not widen the current product into a full timeline editor just because
  the trailer uses rich hand-authored sequencing.

## Combined Takeaways

Clippkit and the Remotion trailer point at two different layers:

```txt
Clippkit
  -> reusable component / primitive catalog method

Remotion trailer
  -> complete-video narrative and scene composition method
```

The practical adoption path is:

1. Add or port reusable effects into `src/remotion/primitives/`.
2. Register them in `src/remotion/catalog/primitive-catalog.ts`.
3. Review them through `/primitives`.
4. Promote useful primitives into template-local block renderers.
5. Create or extend registered templates only when there is a clear
   segment-level semantic contract.

This keeps the visual vocabulary growing without blurring the difference
between low-level Remotion components and product-level templates.

## Relationship To Media Layers

These visual reference projects do not change the media-layer boundary.

Images, videos, audio tracks, and color layers should be modeled as project-
level or segment-level timeline/media data, as described in
`docs/MEDIA_LAYERS.md`, not as another primitive selection or another segment
template.
