# Product Architecture

`ai-video-studio` is a local-first AI + Remotion video studio. The current
product boundary is `VideoProject`: generation, page preview, segment editing,
and local export all operate on schema-validated project data.

The authoritative final generation target is documented in
`docs/FINAL_PRODUCT_GOAL.md`. This architecture document summarizes how that
target maps onto the codebase.

## Core Loop

1. The user gives a topic, brief, story, or video requirement.
2. The planner receives the user prompt plus a compact manifest of registered
   templates: descriptions, capabilities, use cases, constraints, and
   recommended duration ranges.
3. The planner returns a validated storyboard plan: ordered segments, selected
   `templateId` values, narration text, segment purpose, and visual briefs.
4. For each planned segment, the system generates TTS audio from the narration
   text.
5. The system measures or normalizes the generated audio duration.
6. For each segment, the compiler receives only the selected template's full
   schema and implementation rules, plus narration text, audio duration, and
   visual brief.
7. The compiler returns schema-valid template-specific `implementation`.
8. The system assembles compiled segments into a validated `VideoProject`.
9. The page renders an assembled full-video preview from the project.
10. The user edits structured fields or asks for natural-language segment
    revision.
11. The render endpoint exports the current edited project through Remotion.

The current MiniMax-backed one-call `POST /api/generate` path is a shipped v1
shortcut. It can stay while useful, but future generation work should move
toward the staged planner -> TTS -> compiler -> assembly pipeline.

Current implementation snapshot:

- The shipped page and `/api/generate` route still use the one-call
  `VideoProject` shortcut.
- `src/lib/storyboard-plan-schema.ts` defines the first validated
  `StoryboardPlan` boundary.
- `src/templates/registry.ts` derives the planner template manifest from
  server-safe registered template definitions.
- `src/lib/minimax/prompts.ts`, `src/lib/minimax/tool-schema.ts`,
  `src/lib/minimax/parse-storyboard-plan.ts`, and `src/lib/minimax/index.ts`
  provide an internal MiniMax planner facade.
- `src/lib/narration-asset-schema.ts`, `src/lib/tts/*`, `POST /api/tts`,
  and `/api/tts/assets/...` provide the first internal TTS asset boundary for
  planned segment narration, including local artifact writing and ffprobe
  duration measurement.
- Selected-template compiler functions and staged assembly into the active
  product route are still future slices.

## Composition Model

The product should not ask AI to write Remotion source code. AI chooses from
existing templates and fills validated parameters.

The durable model is:

```txt
Remotion primitives/components
  reusable visual building blocks, transitions, layouts, media helpers

Template block contract
  semantic bridge that records a visual block's effect, AI-visible fields,
  and mapping from template parameters to Remotion primitives

Template
  describes when it should be used, which parameters it accepts, and how
  those parameters are rendered by composing blocks and Remotion
  primitives/components

VideoSegment
  user-facing editable unit; implemented by one primary template; target home
  for segment narration metadata

VideoProject
  full generated video assembled from one or more segments
```

One template may internally compose many Remotion components. Those components
are implementation details of templates, not additional segment-level
templates.

For AI-assisted development, new visual capability should usually be introduced
as a small primitive plus a template-local block contract before changing a
template's top-level implementation schema.

External Remotion libraries may use the word `template` for reusable examples
such as text effects, charts, transitions, logo reveals, backgrounds, and
media layouts. In this product, treat those as Remotion component candidates,
not as `VideoSegment` templates. A reusable component only becomes a product
template if it can implement a complete segment intent and has a schema,
definition, runtime adapter, editor path, and registration.

Images, videos, audio tracks, and color layers are timeline/media data, not
templates. The next media-layer planning boundary is documented in
`docs/MEDIA_LAYERS.md`: start with optional project-level
`media.layers[]`, treat the old `baseLayer` idea as a layer role rather than a
separate field, keep template-internal voiceover fields local until a
deliberate migration is needed, and render media from the same `VideoProject`
used by preview and export.

The first media implementation should stay project-level only. Segment-level
media, uploads, generated assets, waveform editing, keyframes, and provider-
created media layers are follow-up work after the shared renderer is stable.

Generated narration audio is different from generic existing-media intake. TTS
voiceover belongs to the main generation pipeline because audio duration should
drive the selected template's compiled parameters. It may later be represented
through `media.layers[]` if that becomes the cleanest cross-template runtime
model, but the roadmap should first prove TTS -> duration -> template compile.

## Generation Context Boundaries

Template context should be split by generation stage:

- Planner context: compact metadata for all registered templates.
- Compiler context: full schema and implementation rules for only the selected
  template.
- Runtime context: React/Remotion renderer code, kept internal and not exposed
  to the provider.

This separation keeps planner context small as template count grows and keeps
template compilation easier to validate.

## Directory Intent

Current and future structure should keep page UI, video runtime, template
metadata, and generation code separated:

```txt
src/app/
  Next.js routes, API routes, and product page entry points

src/components/
  product-page UI components only; not Remotion video components

src/remotion/
  Remotion root, compositions, and reusable video primitives/components

src/templates/
  template-local schema, server-safe definition, editor, runtime adapter,
  and bundle export

src/lib/
  shared project and storyboard contracts, provider code, render helpers, and
  compatibility re-exports
```

When adding reusable video building blocks such as title scenes, bullet scenes,
captions, backgrounds, progress markers, or transitions, prefer a Remotion
runtime directory such as `src/remotion/primitives/` rather than
`src/components/`.

The component-library policy for external Remotion examples is documented in
`docs/REMOTION_COMPONENT_LIBRARY.md`.

Specific external reference notes for Clippkit and Remotion's trailer project
are documented in `docs/EXTERNAL_REMOTION_REFERENCES.md`.

## Template Selection Contract

Template definitions are part of the prompt contract. Each template should
explain:

- what use cases it is best for
- what use cases it should avoid
- expected text density and timing range
- narration fit and media expectations for planner selection
- required and optional implementation fields
- examples or rules that help the provider fill parameters safely

The planner should use compact metadata to select the most suitable template
for each segment. The compiler should later use only the selected template's
full schema and implementation rules to emit schema-valid parameters for that
template.
