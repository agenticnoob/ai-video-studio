# Visual Recipe Roadmap

Status: active roadmap for Agent Producer and reusable visual promotion.

Use this document when the next task is about improving the Agent Producer path:
make dedicated Remotion videos first, then promote reusable visual language
only after samples prove it.

The goal is not to restart the product, not to merge the heavier scene-graph
exploration branch wholesale, not to build a broad visual-review scoring
system, and not to route personal video production back through the one-shot
web prompt.

## 1. Thesis

The current top-level production goal is:

```txt
topic
  -> research / assets
  -> narration / TTS
  -> component inventory
  -> dedicated Remotion composition
  -> still / mp4 review
  -> promotion notes
```

The previous prompt-to-`VideoProject` final goal is parked indefinitely. It
remains a productization reference only when the user explicitly asks for web
editing, selected-segment regeneration, app export, or generated
`VideoProject` behavior.

### Phase G: Fixed Producer Operations

Status: implemented for future Agent Producer samples only.

Goal: make non-creative production steps callable and mechanically verifiable
without turning dedicated videos into a universal template or scene DSL.

Delivered:

- provider-neutral `scripts/lib/producer-audio/` orchestration with independent
  F5 and VoxCPM adapters
- TTS request/error normalization, caption cleanup, measured duration,
  deterministic metadata/duration constant/TTS summary generation, and
  explicit fallback reporting
- `npm run producer:validate -- --module <validation-module>`
- `npm run producer:stills -- --composition <composition-id>`
- future-sample scaffold adoption and isolated fixture smokes
- VoxCPM official-mode and parameter guidance separated from repo adapter
  behavior

Hard boundary: all existing finished videos remain frozen read-only evidence.
They are not migrated, regenerated, reformatted, or modified by this phase.
Generated audio, summaries, review frames, source cards, and MP4 stay ignored
under `public/generated/` and `out/`.

Non-goals: no recipe/template promotion, no news abstraction, no universal
renderer, no scene DSL, no web prompt, no `VideoProject` migration, and no
automation of creative still/mp4 judgment.

The default personal production direction is Agent Producer: start from a real
topic, research and capture evidence, write narration and TTS first, inventory
existing primitives/blocks/runtime helpers, compose a dedicated Remotion video,
review stills/mp4, then promote only proven reusable pieces.

In plain terms:

```txt
Do not widen the product.
Do not send personal production back through the web prompt.
Make real videos first, then promote the reusable parts.
```

## 2. Producer And Promotion Model

Keep the Agent Producer model first:

- one dedicated Remotion composition per finished sample
- sample-owned source data, narration beats, and generated audio metadata
- real screenshot/source capture before generated source-card fallback; any
  fallback must record why capture failed or was unreadable
- news/trend-briefing samples such as `AiDailyNewsBrief20260709`,
  `AiNewsStrategicBrief20260709`, and `AiDailyNewsBrief20260708` may use
  foreground 3D content cards and transition plates when they clarify the
  story, but should not treat 3D as a background-only decorative layer
- local-only screenshots, audio, and renders unless explicitly requested
- shared `src/remotion/standalone-video/` helpers for timing/audio/captions
- VoxCPM expression guidance stays in
  `.agents/skills/ai-video-studio-voxcpm-expression/` so narration
  control instructions and sparse non-language tags are handled before final
  TTS generation, without changing the visual production path. Because VoxCPM
  returns audio without per-line timestamps, Agent Producer samples should use
  the repo TTS path that punctuation-splits narration, trims chunk silence,
  concatenates WAV chunks, and derives subtitle cues from measured chunk audio
- reuse primitives and blocks before writing sample-local scene code
- promote only reusable visual language after still/mp4 review

The parked productized web path still has this model when explicitly needed:

- one `VideoProject` per generated video
- one or more `VideoSegment` entries per project
- one primary `templateId` per segment
- segment-owned narration audio and captions outside template-specific
  `implementation`
- real narration duration as the timing anchor
- local preview/edit/export through the existing Remotion path

Add a stronger internal concept:

```txt
template = registered segment implementation mechanism
recipe = polished visual treatment inside a template
```

A recipe is not a new top-level project object yet. It can start as a
template-local field or internal compiler decision.

Use this internal hierarchy when deciding where a visual idea belongs:

```txt
primitive -> block -> dedicated composition -> recipe -> template -> VideoProject
```

- `primitive`: small reusable Remotion component, usually under
  `src/remotion/primitives/`.
- `block`: a semantic composition of primitives inside a template or sample.
- `dedicated composition`: a finished-video-first Remotion video that composes
  primitives, blocks, local data, TTS timing, and sample-specific scenes, such
  as `WorldCupBettingAnalysis`.
- `recipe`: a reusable visual treatment inside a registered template, promoted
  only after a composition proves the arrangement is reusable.
- `template`: the provider-visible segment implementation mechanism selected
  by `templateId`.

This keeps recipe work from becoming a parallel component system. Local agent
producer runs should first make a good dedicated video, then extract reusable
pieces into primitives, blocks, recipes, or templates.

Examples:

- `hero-title-reveal`
- `workflow-node-map`
- `terminal-build-run`
- `metric-countup`
- `timeline-progress`
- `code-diff-highlight`
- `before-after-compare`
- `product-ui-zoom`

The planner may eventually choose a recipe, but v1 can keep recipe selection
inside the selected template compiler.

## 3. Inspiration To Adopt

External video-generation frameworks such as VideoFlow are useful because they
make motion and composition first-class:

- sequential authoring with `wait`, parallel actions, and explicit holds
- reusable transition presets such as slide, blur resolve, typewriter, count-up,
  glitch resolve, and light sweep
- grouped layer trees that move as one visual unit
- keyframe/property animation across position, scale, opacity, blur, rotation,
  and effect parameters
- example videos that double as a capability showcase

Local mapping:

- use Remotion as the renderer
- keep AI output as bounded structured parameters
- encode motion grammar in repo-owned components and compilers
- add preview compositions for every important visual treatment
- expose recipes through existing templates before introducing a broader
  Visual IR system

## 4. What Not To Bring Back

Do not merge the prior scene-graph roadmap branch wholesale.

For this clean product line, avoid:

- broad visual-review scoring as the main quality strategy
- automatic screenshot repair loops
- browser/canvas QA as a core generation stage
- generic generated TSX as the normal path
- media-asset composite execution before recipes are visually strong
- multi-template-per-segment orchestration
- large roadmap or handoff document churn that obscures the current product
  boundary

The earlier exploration is still useful as research. Bring back ideas only
when they directly improve generated video quality in the current product
loop.

## 5. Roadmap

### Phase 0: Lock The Clean Product Boundary

Status: current branch goal.

Deliver:

- this roadmap
- active-doc links from `FINAL_PRODUCT_GOAL`, `ITERATION_STATUS`, `README`, and
  `AGENTS`
- explicit decision that `main` remains the product base
- explicit decision that the prior heavy review/scoring branch remains an
  experiment, not the merge target

Acceptance:

- a new worker can understand the next visual-quality direction without reading
  the experimental branch
- no implementation code changes are required

### Phase 1: Recipe Showcase Baseline

Status: implemented as the first visual-quality baseline.

Goal: create a visual quality target before changing live generation.

Deliver:

- a Remotion Studio preview composition that demonstrates 6 polished recipe
  treatments using static fixture data
- bounded subject-motion transitions between showcase scenes, starting with
  `stage-push`, `fly-through`, and `cube-turn`; the low-value full-frame
  light-sweep and scanline-wipe overlays have been removed from the active
  showcase, while `panel-push` remains as the only auxiliary overlay bridge
- no live LLM changes
- no new provider schema
- no project persistence changes

Candidate showcase treatments:

- title reveal with blur resolve and light sweep
- terminal session with typewriter rows, cursor, scanline, and success badge
- metric count-up with grouped card motion
- workflow map with staggered node/edge activation
- timeline progress with checkpoint emphasis
- code diff highlight with semantic color and line focus

Acceptance:

- `RecipeShowcasePreview` renders without placeholder audio
- still renders from the preview show visibly richer frames than the current
  simple template output:
  - `/workspace/out/recipe-showcase-hero.png`
  - `/workspace/out/recipe-showcase-terminal-late.png`
  - `/workspace/out/recipe-showcase-code.png`
- `npm run smoke:recipe-showcase-preview` ensures the preview composition stays
  registered and keeps the 6 expected recipe ids plus transition ids visible
  in source
- `npm run smoke:staged-fixtures` confirms Remotion can bundle and list the new
  composition beside the existing template previews
- transition boundary stills render for visual inspection, including:
  - `/workspace/out/recipe-motion-stage-push-v2.png`
  - `/workspace/out/recipe-motion-terminal-entry-mid.png`
  - `/workspace/out/recipe-motion-cube-turn-v3.png`

### Phase 2: Recipe Runtime Primitives

Status: complete for reusable runtime primitives.

Goal: factor the showcase into reusable template internals.

Deliver:

- a small motion preset catalog; v1 now exposes `stage-push`,
  `fly-through`, and `cube-turn` through
  `src/remotion/recipes/motion/scene-transition-stage.tsx`
- shared transition helpers for common reveal/exit patterns; v1 includes
  reusable scene sequencing, overlap, and content-preroll helpers
- grouped visual blocks for terminal, metric card, workflow map, and timeline;
  v2 exposes these through `src/remotion/recipes/blocks/`
- caption-safe layout defaults; v3 exposes
  `DEFAULT_RECIPE_CAPTION_SAFE_AREA` through `src/remotion/recipes/timing/`
- duration-aware helpers that map narration frames into reveal/hold/exit beats;
  v3 exposes `getRecipeBeatTiming()` through `src/remotion/recipes/timing/`

Acceptance:

- recipes are deterministic Remotion code
- animation remains frame-driven with Remotion APIs
- no CSS animation is used for render-critical timing
- existing `scripted`, `spotlight`, and `stats-dashboard` previews still load
- `RecipeShowcasePreview` consumes shared recipe-motion primitives instead of
  owning local copies of the stage transition logic
- `RecipeShowcasePreview` consumes shared recipe-block primitives instead of
  owning local copies of terminal, metric-card, workflow-map, and timeline
  block rendering
- `TimelineProgressBlock` consumes shared recipe timing helpers and
  caption-safe defaults
- `npm run smoke:recipe-timing` validates monotonic timing behavior for normal,
  short, and invalid durations
- `npm run smoke:recipe-showcase-preview` guards the `motion`, `blocks`, and
  `timing` public export surfaces

### Phase 3: High-Quality Recipe Templates

Status: implemented through the registered `technical-explainer` template.

Goal: make real generated segments use the better visual treatments.

Deliver:

- either upgrade existing `spotlight` / `stats-dashboard` internals or add one
  new registered recipe-oriented template
- v1 landed through the registered `technical-explainer` template
- template schema stays small and planner-friendly
- selected-template compiler fills recipe parameters from narration duration,
  visual brief, and structured segment intent
- selected-segment regeneration preserves non-target segments

Recommended first template path:

```txt
technical-explainer
```

Initial recipes:

- `hero-title-reveal`
- `terminal-build-run`
- `workflow-node-map`
- `metric-countup`
- `timeline-progress`

Phase 4.5 expands this generated template vocabulary to 9 planner-facing
recipes while preserving the same template boundary.

Acceptance:

- a deterministic staged fixture can render a multi-segment technical explainer
- each recipe can be inspected in Remotion Studio
- exported video uses the same `ProjectVideo` path as preview

### Phase 4: Planner Recipe Selection

Status: implemented for planner-facing recipe hints. Deterministic smoke and
contract-smoke provider-backed route smoke have passed. A real-GPU F5 smoke is
blocked in the current execution environment by a missing NVIDIA driver, not by
the staged route or recipe-hint implementation. Design and execution plan are captured in
`docs/superpowers/specs/2026-06-22-planner-recipe-selection-phase-4-design.md`
and
`docs/superpowers/plans/2026-06-22-planner-recipe-selection-phase-4.md`.

Goal: let DeepSeek choose recipes without exposing rendering internals.

Deliver:

- compact recipe manifest derived from registered template definitions
- recipe choices remain optional `StoryboardPlan` hints, not top-level
  `VideoProject` fields
- invalid recipe ids are rejected at the planner schema boundary or repaired by
  the bounded planner repair loop
- planner prompt guidance that chooses recipe families for common briefs
- selected-template compiler validation and bounded fallback
- live smoke for one normal brief that naturally selects recipe-rich output

Acceptance:

- the planner does not invent recipe ids
- invalid recipe choices fail validation or fallback clearly
- generated videos remain editable as `VideoProject`
- contract-smoke live route validation returns technical-explainer segments with
  segment-owned F5-provider narration audio, captions, and recipe sections

### Phase 4.5: Recipe Coverage Expansion

Status: implemented.

Goal: increase the real generated recipe vocabulary before introducing
asset-aware recipes.

Deliver:

- promote `code-diff-highlight` from showcase-only to the real
  `technical-explainer` template
- add `before-after-compare` for old/new workflow and problem/solution contrast
- add `decision-matrix` for bounded technical tradeoff explanations
- add `architecture-layer-stack` for module/layer ownership explanations
- keep all four recipes as bounded template-owned implementation fields
- keep `product-ui-zoom` deferred until Phase 5 because it depends on
  controlled screenshot or UI image inputs

Acceptance:

- `technical-explainer` publishes 9 planner-facing recipes
- deterministic staged fixtures include the four new recipes
- preview/export still use `ProjectVideo`
- no media library, arbitrary URLs, generated TSX execution, or visual scoring is
  introduced

### Phase 5: Asset-Aware Recipes

Status: implemented for v1.

Goal: introduce concrete media only after recipe quality is strong.

Phase 5 v1 is bounded to `technical-explainer/product-ui-zoom`: controlled
`public` or `route` screenshot/image descriptors, route-source export rewrite,
and deterministic missing-asset fallback rendering.

Deliver:

- bounded fields for screenshots, images, icons, code snippets, terminal output,
  or chart data when a recipe explicitly supports them
- missing-asset fallback behavior inside the recipe
- no broad media library UI in the first pass

Still deferred:
- broad media library UI
- arbitrary remote asset URLs
- general upload/storage APIs beyond the bounded product-ui screenshot route
- project-level image/video media layers
- visual-review scoring or screenshot repair

Acceptance:

- assets are referenced through controlled fields, not arbitrary remote URLs
- preview and export resolve the same asset data
- missing assets produce a useful fallback frame, not a broken render

### Phase 5.1: Product Screenshot Upload-Bind Loop

Status: complete for the bounded client loop; user manual QA confirmed the flow.

Goal: keep `product-ui-zoom` useful by making one product screenshot easy to
upload and bind, without turning the feature into a media library.

Deliver:

- one screenshot upload entry point for the `product-ui-zoom` recipe
- pre-generation uploads remain a client-side pool and are not sent to
  `/api/generate/staged`
- after full project generation, the latest uploaded screenshot is
  deterministically bound to the first unbound `product-ui-zoom` placeholder
- a single controlled bind step that attaches the uploaded screenshot to the
  recipe
- structured segment-editor controls to upload, replace, choose from the current
  upload pool, or unbind a section asset
- preview/export reading the same bound screenshot reference
- a stable local fixture path such as `public/product-ui-upload-smoke.png` if a
  concrete image is needed for later QA
- generic `ProjectVideo` remains the preview/export composition boundary for
  edited projects

Still deferred:

- broad media library UI
- arbitrary remote asset URLs
- project-level image/video media layers
- general asset browsing, tagging, or collection management
- visual-review scoring or screenshot repair

Acceptance:

- the flow stays recipe-owned and bounded to `technical-explainer/product-ui-zoom`
- generation request payloads do not include uploaded product screenshot
  descriptors
- a user who uploads before generation sees the generated `product-ui-zoom`
  section use that latest uploaded screenshot without manually editing JSON
- upload and bind are enough to make the recipe useful for real product
  screenshots
- the feature does not become a general-purpose media library

### Phase 5.2: Standalone Real Open Source Intro Sample

Status: implemented for the first Chinese standalone sample,
`PixelRAGChineseStandalonePreview`.

Goal: validate the practical workflow the user will actually use: pick one real
open-source project, generate narration with TTS, let that narration own timing,
compose the video with a dedicated Remotion component, then extract reusable
helpers from the finished artifact.

Deliver:

- 12 short Chinese narration beats for
  [StarTrail-org/PixelRAG](https://github.com/StarTrail-org/PixelRAG), generated
  through strict per-beat `StoryboardPlan` / `POST /api/tts` calls
- Chinese `POST /api/tts` narration assets generated before final video assembly
- static Remotion audio files under `public/generated/pixelrag-chinese-standalone/`
- static GitHub repo/README screenshots under
  `public/generated/pixelrag-chinese-standalone/`
- scene durations derived from generated F5-TTS
- a registered Remotion composition, `PixelRAGChineseStandalonePreview`
- a custom TSX renderer under `src/remotion/PixelRAGChineseStandalone/`
  instead of `ProjectVideo` or existing templates
- frame-driven Remotion ThreeCanvas visuals plus foreground 3D motion for the
  main screenshot cards, sliced pages, vector cubes, index stacks, and answer
  panels
- overlapping short scenes with varied entry/exit styles and no hard cuts
- a scriptable regeneration path:
  `NEXT_ORIGIN=http://127.0.0.1:3000 npm run generate:pixelrag-chinese-standalone`
- a smoke guard for the sample contract:
  `npm run smoke:pixelrag-chinese-standalone`
- verified local export through Remotion render for the standalone composition

Still deferred:

- automatic repo/source ingestion into the product UI
- generic open-source-project video generation for arbitrary repos
- broad media library UI or project-level image/video layers
- generated TSX or arbitrary Remotion code from providers
- a new top-level video grammar before more real samples prove the shape

Acceptance:

- the generated mp4 uses real TTS audio and aligned captions
- composition timing is derived from generated narration durations, with short
  overlap between scenes for faster pacing
- Remotion Studio preview loads real static audio without route-media errors
- visible scenes include real GitHub screenshots, foreground 3D content motion,
  and nonblank 3D visuals
- the renderer does not depend on `VideoProject`, `ProjectVideo`, or
  `technical-explainer`
- preview/export use the standalone `PixelRAGChineseStandalonePreview`
  composition, not the registered template renderer
- the sample is useful as a concrete basis for extracting a reusable
  LLM-plus-Remotion video workflow

### Phase 5.3: Standalone Data Analysis Short Sample

Status: implemented for the first sports-data EV analysis sample,
`WorldCupBettingAnalysis`.

Goal: validate the sample-first path for a data-heavy vertical short before
promoting anything into the template registry. The target is a finished,
renderable video that can later be mined for reusable data-analysis blocks.

Deliver:

- a registered standalone Remotion composition, `WorldCupBettingAnalysis`
- 1080x1920 vertical canvas, `2089` frames / about `69.63` seconds at 30fps
- an 8-scene structure covering title, data source, EV formula, Brazil/Japan,
  Germany/Paraguay, Netherlands/Morocco, rankings, and disclaimer
- 8 generated Chinese F5-TTS voiceover files under
  `public/generated/world-cup-betting-analysis/`
- local structured data under `src/remotion/WorldCupBettingAnalysis/data.ts`
  for odds, average odds, no-vig probabilities, EV values, model/context
  notes, rankings, and disclaimer copy
- a custom renderer under `src/remotion/WorldCupBettingAnalysis/` using
  Remotion `Sequence`, `interpolate`, and `spring`
- football tactics-board SVG lines, code-redrawn odds table, EV bars,
  probability bars, ranking columns, and fixed bottom subtitles
- no dependency on current registered templates or generated TSX
- a scriptable voiceover regeneration path:
  `NEXT_ORIGIN=http://127.0.0.1:3000 npm run generate:world-cup-betting-analysis`
- a smoke guard: `npm run smoke:world-cup-betting-analysis`

Still deferred:

- adding this as a provider-visible registered template
- converting the visuals into reusable primitives or blocks
- screenshot ingestion for real竞彩 source images
- betting-product flows, wagering UX, or any recommendation workflow

Acceptance:

- the video renders in Remotion Studio and CLI without affecting existing
  compositions
- generated static voiceover audio plays from the Remotion composition without
  route-media dependencies
- all supplied match data and EV values remain accurate
- the final screen explicitly states `理性分析，不构成投注建议`
- if `public/assets/jingcai-odds.png` is absent, the video still works by
  redrawing a simplified odds table in code
- motion stays frame-driven; no CSS animation or transition rules are used for
  render-critical timing

### Phase 5.4: Standalone Finished-Video Runtime v1

Status: implemented for the two current standalone samples.

Goal: extract the repeatable finished-video production skeleton from the
PixelRAG and WorldCup samples while preserving their different aspect ratios
and visual languages.

Deliver:

- shared runtime source under `src/remotion/standalone-video/`
- canvas profiles for `landscape-16x9` (`1280x720`) and `portrait-9x16`
  (`1080x1920`)
- content-family tags for `project-intro`, `data-analysis`, `tutorial`, and
  `trend-briefing`
- reusable scene start-frame helpers, optional overlap timing, duration
  calculation, active-caption lookup, static-file voiceover rendering, bottom
  captions, and generic Remotion `Sequence` timeline rendering
- `PixelRAGChineseStandalonePreview` categorized as `landscape-16x9` /
  `project-intro`
- `WorldCupBettingAnalysis` categorized as `portrait-9x16` / `data-analysis`
- smoke guard: `npm run smoke:standalone-video-runtime`

Still deferred:

- a universal visual template that attempts to render every content family
- provider-visible generation for arbitrary standalone samples
- converting WorldCup or PixelRAG visuals into registered product templates
- media-library, persistence, or generated TSX expansion

Acceptance:

- profile and content-family choices are explicit data, not inferred from
  dimensions alone
- common timing/audio/caption behavior is shared
- sample-specific visuals stay in their own composition folders
- both standalone sample smokes continue to pass

Current sample hygiene:

- high-signal finished-video-first samples stay in dedicated folders such as
  `src/remotion/PixelRAGChineseStandalone/` and
  `src/remotion/WorldCupBettingAnalysis/`
- lower-priority reference-only standalone compositions live under
  `src/remotion/standalone-samples/`
- reference-only sample audio lives under `public/standalone-samples/audio/`
- local F5/TTS helper scripts live under `scripts/f5-tts/`, while private
  reference voices stay in ignored `voices/f5-tts/`
- abstract standalone samples without useful reference value should be removed
  instead of staying registered in Remotion Studio

### Phase 5.5: Main-Site Sample-Derived Recipe Abstractions

Status: implemented for the first two sample-derived main-site recipes.

Goal: turn the useful visual language from finished standalone samples back
into planner-visible registered templates so normal site generation produces
better `VideoProject` output.

Deliver:

- `technical-explainer/screenshot-evidence-flow`, inspired by the PixelRAG
  screenshot/evidence/process scenes
- bounded section schema for controlled `public | route` screenshot material,
  3-5 evidence cards, active evidence highlighting, callouts, and useful
  fallback rendering
- `stats-dashboard/odds-ev-ranking`, inspired by the WorldCup odds/EV/risk
  analysis scenes
- planner metadata and compiler guidance for odds, no-vig probability,
  expected value, risk notes, and compact ranking stories using existing
  dashboard blocks
- deterministic fixture coverage and a focused smoke guard:
  `npm run smoke:main-site-recipe-abstractions`

Acceptance:

- both recipes appear in `buildPlannerRecipeManifest()`
- matching `StoryboardPlan.segments[].recipeHints[]` validate for their
  owning templates and fail on the wrong template
- the selected-template compiler prompt payload includes both `recipeHints` and
  `plannerRecipes`
- `TechnicalExplainerTemplatePreview` can visually inspect the evidence-flow
  section
- `StatsDashboardTemplatePreview` can render an EV/risk ranking style dashboard
- preview/export still use the main `ProjectVideo` path for generated projects

### Phase 5.6: Agent Producer Skill v1

Status: implemented for docs and repo-local skill; first real producer run
completed with `UvOpenSourceBrief`; now accepted as the default personal
video-production path.

Goal: define the local production skill for topics that need agent research,
current information, screenshots, TTS-first timing, primitive/block selection,
purpose-built Remotion composition, and still/render review before they become
a good finished video.

Deliver:

- repo-local skill:
  `.agents/skills/ai-video-studio-agent-producer/SKILL.md`
- design note:
  `docs/superpowers/specs/2026-07-01-agent-producer-design.md`
- explicit layer model:
  `primitive -> block -> dedicated composition -> recipe -> template -> VideoProject`
- decision that the Agent Producer path is not a wrapper around the web prompt
- default preference for a component-composed standalone Remotion composition,
  following the `WorldCupBettingAnalysis` style of explicit data, generated
  narration, standalone-video runtime helpers, and sample-specific scenes
- `VideoProject` path only when the user explicitly needs web editing,
  selected-segment regeneration, app export, or main-site productization

Acceptance:

- future agents can start from one skill instead of rediscovering the producer path
- visual planning begins with the primitive catalog before new TSX is written
- agent output is not just page generation plus screenshots; it composes
  repo-owned primitives, blocks, runtime helpers, and data into a dedicated
  video
- source-backed evidence beats attempt real screenshot/source capture before
  generated source-card fallback; fallback use is recorded and not labeled as a
  screenshot
- fallback/source-card assets are not rendered as visible screenshot evidence
  when no real captured screenshot exists; failed capture reasons stay in data
  and handoff text, not in the video frame
- recipes remain template-owned reusable treatments promoted from evidence,
  not a separate component system
- generated screenshots, audio, and renders stay local-only unless explicitly
  requested
- no runtime or product schema changes are introduced by the skill document
  itself
- first real run validates the readable screenshot evidence lens: full-frame
  screenshots as proof, compact translucent local overlays, claim-aligned
  screenshot focus metadata, and frame-driven quick zoom-in / hold /
  return-to-context motion
- future source-card fallbacks are only acceptable after a failed or unreadable
  real capture attempt, with localized visible copy and a recorded reason

## 6. First Implementation Slice

Completed first implementation after this docs/skill slice:

```txt
Agent Producer First Real Run
```

Why:

- the user's current need is higher-quality videos than the one-shot web prompt
  can reliably produce
- the repo already has useful primitives, templates, TTS, standalone runtime,
  and Remotion verification surfaces
- one real run will show which primitives/blocks are missing before more recipe
  or template work is promoted

Minimum scope:

- chose one real 45-60 second topic: Astral `uv`
- gathered source facts and screenshots when the topic needed proof
- wrote narration beats before locking scene durations
- listed candidate primitives, blocks, and standalone runtime helpers before
  adding new visuals
- produced a dedicated `src/remotion/UvOpenSourceBrief/` composition
- used standalone-video runtime helpers instead of `VideoProject`
- rendered representative stills for visual inspection
- kept screenshots/audio/renders local-only under ignored artifact paths
- promoted no primitive/block yet, but identified reusable candidates:
  `EvidenceScreenshotBackdrop`, `EvidenceOverlayPanel`, and `ScreenshotFocus`

Do not include:

- new API routes
- web prompt generation as the primary production method
- visual scoring
- automatic repair
- persistent storage
- media library
- provider-visible arbitrary media ingestion

## 6.1 Current Roadmap Slices

### Phase A: Authority Reset

Status: current docs slice.

Goal: make `docs/FINAL_PRODUCT_GOAL.md` the Agent Producer authority and park
the previous prompt-to-`VideoProject` final goal indefinitely.

Deliver:

- `FINAL_PRODUCT_GOAL` rewritten around Agent Producer
- README / AGENTS / ITERATION_STATUS aligned to the new authority order
- old web/editor pipeline described as secondary productization context only

Acceptance:

- new agents start from Agent Producer by default
- active docs do not present the old `VideoProject` final goal as authoritative
- no code or generated media changes are introduced

### Phase B: Producer Sample OS v1

Status: implemented for manifest, scaffold convention, and smoke guard.

Goal: make Agent Producer runs easier to start, review, and hand off without
turning them into a generic web prompt or universal template.

Deliver:

- a committed producer sample manifest shape for composition id, content
  family, canvas profile, local artifact root, review frames, TTS status, and
  promotion candidates
- a scaffold for new `src/remotion/<SampleName>/` folders with `types.ts`,
  `script.ts`, `data.ts`, generated audio metadata placeholder, renderer entry,
  and smoke skeleton
- a documented sample directory convention that separates committed source
  files from local-only screenshots, audio, and mp4 files
- a focused manifest/smoke command that validates committed sample metadata
  without requiring generated artifacts to be in Git

Non-goals:

- no broad media library
- no persistence/history
- no one-shot arbitrary video generator
- no generated screenshots/audio/mp4 committed to Git

Acceptance:

- `src/remotion/producer-samples/` describes maintained samples without
  changing their renderer contracts.
- `PixelRAGChineseStandalonePreview`, `WorldCupBettingAnalysis`, and
  `UvOpenSourceBrief` can be described by the same manifest model
- `src/remotion/producer-samples/scaffold/` documents the expected future
  `src/remotion/<SampleName>/` source shape.
- `npm run smoke:producer-sample-manifest` validates the manifest and
  local-only artifact boundary without requiring generated media in Git.
- docs make clear that local artifacts stay ignored.

### Phase C: Evidence Lens Block v1

Status: implemented for the first shared block slice.

Goal: promote the reusable screenshot-proof language from `UvOpenSourceBrief`
into a shared block while keeping topic-specific facts sample-local.

Deliver:

- shared `ScreenshotFocus` data model for claim, asset id, zoom-in / hold /
  return frames, scale, pan, and overlay placement
- shared full-frame evidence screenshot backdrop with readable filters, light
  vignette, and frame-driven focus motion
- shared compact translucent evidence overlay panel
- uv sample updated to consume the shared block without changing its source
  facts, narration, or generated assets
- still-review guidance for context / zoom / return frames

Implementation:

- shared block location:
  `src/remotion/producer-samples/evidence-lens/`
- public producer-sample export:
  `src/remotion/producer-samples/index.ts`
- focused smoke:
  `npm run smoke:evidence-lens`
- uv smoke now checks that `UvOpenSourceBrief` delegates backdrop, overlay, and
  screenshot focus motion to the shared block while retaining sample-local
  focus targets and overlay content

Non-goals:

- no automatic screenshot repair
- no visual scoring system
- no planner-visible recipe/template exposure in this phase
- no broad arbitrary asset ingestion

Acceptance:

- uv evidence scenes remain readable and claim-aligned through the shared block
- the shared block uses Remotion frame-driven motion only
- review stills catch overlay collision, unreadable evidence, and wrong focus
  target before a sample is called good

### Phase D: Promotion Gate v1

Status: implemented for v1 after the Evidence Lens shared block extraction.

Goal: make promotion decisions explicit so sample-local ideas do not become
universal templates too early.

Deliver:

- checklist for keeping a visual idea sample-local, promoting it to primitive,
  promoting it to block, promoting it to recipe, or promoting it to template
- rule that recipes/templates are productization layers, not the default Agent
  Producer entrypoint
- documentation hooks for updating `REMOTION_PRIMITIVES`,
  `REMOTION_COMPONENT_LIBRARY`, `VISUAL_RECIPE_ROADMAP`, and README when a
  visual language is promoted
- structured producer sample manifest semantics for `gateState`, `status`, and
  `productizationExposure`
- focused smoke coverage through `npm run smoke:producer-promotion-gate`, also
  included in `npm run smoke:producer-sample-manifest`

Implementation:

- Gate documentation lives in `docs/PRODUCER_PROMOTION_GATE.md`.
- Allowed promotion targets are exactly `primitive`, `block`, `recipe`, and
  `template`.
- Evidence Lens is the first block-level reusable producer sample block:
  `EvidenceScreenshotBackdrop`, `EvidenceOverlayPanel`, and `ScreenshotFocus`
  are recorded as `promote-to-block`, `promoted`, and
  `agent-producer-internal`.

Non-goals:

- no universal data-story or project-intro template by default
- no multi-template-per-segment orchestration
- no primitive prop exposure to LLM providers

Acceptance:

- new samples can list promotion candidates without promoting them immediately
- productized recipes/templates require evidence from finished samples
- web/editor recipe work remains bounded to registered template contracts

### Phase E: News Producer Samples And Evidence Capture Hardening

Status: implemented for the maintained news samples and Agent Producer docs.

Goal: add maintained trend-briefing Agent Producer samples and make
source-backed evidence handling stricter for future runs.

Deliver:

- dedicated `OpenAiHardwareNewsBrief`, `AiDailyNewsBrief20260708`,
  `AiNewsStrategicBrief20260709`, and `AiDailyNewsBrief20260709` Remotion
  compositions
- local F5-TTS or VoxCPM narration metadata and local-only generated
  source-card assets
- producer sample manifest entries with review frames and promotion candidates
- focused sample smokes that check Chinese source-card copy, source-card
  fallback reasons, scene duration padding, duration metadata alignment, and
  composition-specific facts
- docs/skill rule that real screenshot/source capture must be attempted before
  generated source-card fallback

Non-goals:

- no automatic screenshot repair loop
- no broad media library
- no productized recipe/template exposure for the news source-card treatment

### Phase F: Beginner Concept Explainer Sample

Status: implemented as `AiConceptsForBeginners`.

Goal: prove that a longer educational Agent Producer video can explain a
dependency graph of abstract concepts through one coherent metaphor while
remaining visually varied and primitive-first.

Delivered:

- 13-scene, 8-minute-42-second Chinese tutorial composition
- AI restaurant metaphor connecting brain, information, tools, decisions, and
  organization
- dedicated visual treatments for context workbench, RAG flow, function-call
  ticket, MCP connector rail, agent loop, workflow rail, skill manuals,
  subagent delegation, and final system map
- real VoxCPM voice-clone narration with measured caption timing and local-only
  audio/render artifacts
- focused smoke coverage for concept order, duration range, real TTS, runtime
  reuse, primitive reuse, registration, and frame-driven motion

Promotion notes:

- keep `concept-metaphor-system-map` sample-local until a second educational
  topic proves a stable generic recipe
- keep the context workbench, MCP connector rail, and agent loop sample-local
  blocks until their APIs are reused outside this curriculum
- do not promote the restaurant metaphor itself into a provider-visible recipe

Non-goals:

- no general course-authoring product surface
- no arbitrary diagram DSL
- no LangChain-specific product dependency
- no generated `VideoProject` or web prompt path

## 7. Validation

Use Docker-first validation on this workstation.

For roadmap-only changes:

```bash
git diff --check
```

For preview/recipe implementation slices:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run build'
```

Add a targeted Remotion still render for each new showcase composition.

## 8. Decision Record

Current decision:

- Continue from `main`, not from the heavier scene-graph roadmap branch.
- Treat the scene-graph roadmap branch as research.
- Treat Agent Producer as the default personal production path for real
  finished videos.
- Park the staged generation / F5 / caption / preview / export web product
  loop indefinitely as a secondary productization path.
- Invest next in Producer Sample OS, evidence-lens extraction, motion grammar,
  and previewable examples that improve dedicated Remotion production first.

This keeps the product moving toward better generated videos without adding
another layer of review infrastructure before the visuals themselves are good.
