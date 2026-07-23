# Remotion Composition And Capabilities

Use this reference before editing Remotion source, scenes, styles, effects,
transitions, local media, motion, or sound. Read
`.agents/skills/remotion-best-practices/SKILL.md`, then only the matching rule:
`rules/video-layout.md` for dense layout, `rules/subtitles.md` for captions,
and `rules/silence-detection.md` for gaps. Inspect the primitive inventory only
when selecting or adding visual components.

## Construction

Build one dedicated composition under `src/remotion/<CompositionName>/` and
register its video plus both cover Stills. Inventory in this order:
`existing primitive -> existing block -> composition-local component -> proven
reusable extraction`. Keep facts, narration, scene data, assets, and audio
metadata explicit. All render-critical motion uses `useCurrentFrame()`,
`interpolate()`, `spring()`, `Sequence`, `Series`, or `TransitionSeries`; never
CSS animation or transitions.

## Style And Capability Selection

Select one explicit profile with `getProducerStyleProfile()`:
`editorial-tech`, `comic-anime`, `cinematic-3d`, `retro-terminal`,
`documentary-media`, or `hand-drawn-explainer`. Scaffold with
`npm run producer:scaffold -- --name <CompositionName> --slug <slug>
--style-profile <profile-id>`. A profile constrains composition, motion,
texture, media, captions, and sound; it does not generate scene structure.

## Style Is Not A Storyboard

Do not turn profile fixtures, cards, or diagram conventions into a repeated
scene template. The style profile supplies palette, texture, motion character,
media treatment, captions, and sound language; it does not decide what the
viewer sees. Build each scene from its content-first visual intent. A paused
frame must make the subject and action legible, and clarity wins whenever a
profile convention obscures the news, mechanism, or consequence. Keep adjacent
scenes distinct through primary silhouettes, spatial grammar, or shot language
unless they are a deliberate A/B comparison.

Current callable surfaces include `getProducerEffectPreset()`,
`getProducerMediaEffectPreset()`, `fitProducerText()`,
`getProducerTransitionPreset()`, `getProducerTransitionSeriesDuration()`,
`cinematic-film-burn`, `ProducerLocalVideo`, `ProducerAnimatedImage`,
`ProducerLottie`, `ProducerMotionTreatment`, and `ProducerSoundtrack`.
Inspect `AgentProducerCapabilityShowcase` before adding a new abstraction.
Use showcase pages only to verify callable APIs and rendering behavior; never
copy their page composition as a scene layout. New renderers may import only
composition-local modules and Producer shared roots. `producer:validate`
rejects dedicated-composition imports, draft or missing `visual-intent.ts`
entries, scene/intent drift, and repeated adjacent primary composition or
silhouette without an explicit comparison.
HTML-in-canvas requires `Config.setAllowHtmlInCanvasEnabled(true)` and the
Producer Chromium runtime.

Run `npm run smoke:producer-creative-contract` for this boundary.
Run `npm run smoke:remotion-capabilities`,
`npm run smoke:producer-media-sound`,
`npm run smoke:producer-style-profiles`, and
`npm run smoke:producer-style-profile-sample-contract` for the changed
boundary. Do not retrofit completed or frozen compositions. Load
`render-review-quality.md` only when work reaches stills, render, covers, or
post-render `producer:quality`.
