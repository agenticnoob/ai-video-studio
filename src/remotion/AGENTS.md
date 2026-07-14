# REMOTION KNOWLEDGE BASE

**Generated:** 2026-07-13 16:00:00 +0800

## OVERVIEW

`src/remotion` is the deterministic rendering surface. It turns structured
`VideoProject` and template implementation data into preview/export frames; it
is not a place for planner/provider logic.

## STRUCTURE

```txt
src/remotion/
|-- index.ts                  # Remotion entry
|-- Root.tsx                  # composition registry
|-- ProjectVideo/             # shared project preview/export composition
|-- RecipeShowcase/           # visual-quality preview composition
|-- recipes/                  # reusable recipe blocks/motion/timing
|-- primitives/               # lower-level visual primitives
|-- ScriptedVideo/            # scripted-template renderer
|-- SpotlightVideo/           # spotlight-template renderer
|-- GitTutorialForDevs/       # Agent Producer Git tutorial composition
|-- HermesInnerLandscape/    # Agent Producer abstract AI consciousness video
|-- RawThoughtMirror/        # Agent Producer cinematic raw-thought monologue
|-- AiConceptsRedefined/     # Agent Producer conceptual explainer (41 scenes)
|-- AiDailyNews20260714/     # Agent Producer AI daily news briefing (8 scenes)
|-- standalone-samples/       # reference-only standalone compositions
|-- standalone-video/         # reusable production skeleton
`-- producer-samples/          # sample manifest, registry, shared blocks
```

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Composition registry | `Root.tsx` | Add/adjust Studio compositions here. |
| Project render path | `ProjectVideo/ProjectVideo.tsx` | Narration, media, segments, captions. |
| Captions | `ProjectVideo/ProjectCaptionLayers.tsx` | Shared segment-caption rendering. |
| Narration audio | `ProjectVideo/ProjectNarrationLayers.tsx` | Segment audio with buffering pause. |
| Recipe timing | `recipes/timing/` | Duration-aware beat helpers. |
| Recipe blocks | `recipes/blocks/` | Terminal, metric, workflow, timeline, diff. |
| Recipe transitions | `recipes/motion/` | Subject-motion transitions. |
| General primitives | `primitives/` | Reusable visual pieces. |

## CONVENTIONS

- Consult `.agents/skills/remotion-best-practices/SKILL.md` before editing
  render code or template-internal animation components.
- Keep motion frame-driven with `useCurrentFrame()`, `interpolate()`,
  `spring()`, `<Sequence>`, `<Series>`, and Remotion transition primitives.
- Use stable dimensions and fixed composition bounds; avoid layout shift from
  dynamic text, hover states, or loading labels.
- Use Remotion media components (`<Img>`, `<Audio>`, `<Video>`) and
  `staticFile()` for public assets where applicable.
- `ProjectVideo` must stay the shared preview/export surface for assembled
  projects.
- Captions are flattened from segment-local narration cues; templates should
  leave caption rendering to shared layers.
- Recipe primitives should be deterministic, duration-aware, and reusable by
  template internals without changing `VideoProject`.

## ANTI-PATTERNS

- Do not use CSS animations, CSS transitions, or Tailwind animation utilities
  for render-critical motion.
- Do not add planner/provider/LLM logic here.
- Do not create placeholder narration audio in Remotion preview fixtures.
- Do not hide generated narration or captions inside template implementation
  renderers.
- Do not widen recipe work into browser visual review, automatic repair loops,
  or generated TSX execution unless explicitly requested.

## VALIDATION

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:recipe-showcase-preview'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:recipe-timing'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx remotion still src/remotion/index.ts TechnicalExplainerTemplatePreview /workspace/out/<name>.png --frame=<frame> --scale=0.5'
```
