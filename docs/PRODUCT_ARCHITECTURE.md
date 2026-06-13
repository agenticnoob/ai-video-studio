# Product Architecture

`ai-video-studio` is a local-first AI + Remotion video studio. The current
product boundary is `VideoProject`: generation, page preview, segment editing,
and local export all operate on schema-validated project data.

The authoritative product roadmap is `docs/VISUAL_IR_COMPILER_ROADMAP.md`.
`docs/FINAL_PRODUCT_GOAL.md` documents the stable generation-pipeline
contracts that support that roadmap. This architecture document summarizes how
those targets map onto the codebase.

## Core Loop

1. The user gives a topic, brief, story, or video requirement.
2. The planner receives the user prompt plus a compact manifest of registered
   templates: descriptions, capabilities, use cases, constraints, and
   recommended duration ranges.
3. The planner returns a validated storyboard plan: ordered segments, selected
   `templateId` values, narration text, segment purpose, and visual briefs.
4. For each planned segment, the system runs narration synthesis from the
   narration text. The preferred local provider is the in-project F5-TTS
   adapter backed by an optional runtime service.
5. The system measures or normalizes the generated audio duration and
   normalizes provider-returned caption timing.
6. For each segment, the compiler receives only the selected render path's
   schema and implementation rules, plus narration text, audio duration, and
   visual brief.
7. The compiler returns schema-valid `implementation`: template parameters for
   `template_macro` paths or bounded Visual IR for `scene-graph`.
8. The system assembles compiled segments into a validated `VideoProject`.
   Generated narration audio and captions should be attached to their owning
   `VideoSegment`; preview/export flatten segment-owned timing into the global
   project timeline.
9. The page renders an assembled full-video preview from the project.
10. The user edits structured fields or asks for natural-language segment
    revision.
11. The render endpoint exports the current edited project through Remotion.

The active page flow uses the staged planner -> TTS -> compiler -> assembly
pipeline. Segment-owned
narration audio/captions, the Next-side F5 adapter, and the optional local
F5-TTS runtime service are in place. The Visual IR Generation v1 landing keeps
provider-backed generation bounded to `primitive_scene_graph`:
the `scene-graph` compiler prompt exposes only the allowed Visual IR
vocabulary, staged diagnostics report repair/fallback state, and
selected-segment regeneration preserves the existing segment if repeated
scene-graph validation fails. Full-project generation falls back from repeated
scene-graph compiler failure to a deterministic `spotlight` macro segment when
there is no existing segment to preserve. `scripts/staged-live-smoke.mjs`
includes a forced provider-backed `scene-graph` plan smoke with real F5
narration before scope widens beyond `primitive_scene_graph`.

Current implementation snapshot:

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
- The in-project F5-TTS provider boundary lives under `src/lib/tts/`. The repo
  owns its request/response contract, config, artifact handling, caption
  normalization, and fallback behavior. The optional `services/f5-tts/`
  runtime supports contract-smoke mode and real `F5_TTS_SERVICE_MODE=f5`
  synthesis; the GPU overlay has been validated with the local checkpoint,
  vocab, and Vocos vocoder under `models/f5-tts/`.
- Private-team deployment uses process-local heavy-task guards for generation,
  TTS/F5 synthesis, and local render export. These guards protect the
  Docker-first single-web-process workflow; they are not database-backed
  durable queues or global locks for multi-replica deployments.
- Generation, selected-segment regeneration, and render export can report
  process-local task progress through `progressId` and
  `/api/progress/[progressId]`. This is a lightweight in-memory status surface
  for the active browser request, not a persistent job model.
- `src/lib/staged-generation/*`, the MiniMax template compiler helpers, and
  `POST /api/generate/staged` provide the staged assembly path from brief or
  plan input to `VideoProject`.
- The active page generation flow uses `/api/generate/staged`.
- The active selected-segment regeneration flow also uses
  `/api/generate/staged`: one target segment is replanned, regenerated through
  TTS, recompiled from real audio duration, and merged back into the current
  `VideoProject`.
- `/api/tts/assets/...` supports byte-range requests for Remotion Player
  seeking, and `/api/render` resolves route media to an absolute Next app
  origin before Remotion export.
- The product page UI separates the whole-video generation/preview/export
  workspace from selected-segment editing, uses a horizontal drag-scroll
  segment strip, and keeps segment/template editing controls compact.

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
templates. The current planning boundary is: project-level layers are for
full-video assets such as background music or global overlays; segment-level
layers are for media that belongs to one segment. Treat the old `baseLayer`
idea as a layer role rather than a separate field. Historical media-layer notes
are archived in `docs/archive/MEDIA_LAYERS.md`.

Do not use template-specific `implementation` fields as narration or caption
storage. Generated narration belongs to the segment, and shared preview/export
code should render it from the same `VideoProject` used by editing and export.

Generated narration audio is different from generic existing-media intake. TTS
narration audio belongs to the main generation pipeline because audio duration
should drive the selected template's compiled parameters. The current staged
path stores generated audio in segment-owned `VideoSegment.narration.audio` and
flattens it to the project timeline for preview/export. Project-level narration
media layers are retained only as a transitional compatibility path.

Captions are also part of the narration pipeline, not template-private visual
fields. The in-project F5-TTS adapter accepts audio plus alignment/caption cues
from the same segment narration request. Those cues are normalized into
segment-owned, segment-local caption data so preview and export render the same
subtitles across all registered templates after flattening. If a runtime only
returns audio, fallback captions are generated from narration text and measured
audio duration.

## Generation Context Boundaries

Template context should be split by generation stage:

- Planner context: compact metadata for all registered templates.
- Narration provider context: segment narration text, language, voice or
  speaker profile, and deterministic artifact identity; it should return audio
  metadata and aligned captions when available.
- Compiler context: full schema and implementation rules for only the selected
  render path, such as a template macro or bounded SceneGraph Visual IR.
- Runtime context: React/Remotion renderer code, kept internal and not exposed
  to the provider.

This separation keeps planner context small as template count grows and keeps
visual implementation compilation easier to validate.

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

Historical component-library policy and external Remotion reference notes are
archived under `docs/archive/`.

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
