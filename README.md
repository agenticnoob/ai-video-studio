# AI Video Studio

AI-first Remotion video workspace with two deliberate paths:

- Agent Producer is the default personal production path for high-quality
  videos from a real topic.
- The previous `VideoProject` / web editor final goal is parked indefinitely
  and remains only a productization reference path.

Agent Producer goal:
- user gives a topic or brief
- agent researches sources and attempts real evidence capture when needed
- generated source-card fallback is used only after a failed or unreadable real
  capture attempt is recorded
- agent writes narration beats and generates or prepares TTS before locking
  timing
- agent inventories primitives, recipe blocks, and standalone-video helpers
- agent composes a dedicated Remotion video from repo-owned components
- agent renders stills / mp4 for review
- reusable visual language is promoted gradually into primitives, blocks,
  recipes, or templates after real samples prove it

### Producer Sample OS

Maintained Agent Producer samples are described by
`src/remotion/producer-samples/`. The manifest records composition id, content
family, canvas profile, local artifact root, review frames, TTS status,
committed source files, and promotion candidates.

Current maintained samples include `AiDailyNewsBrief20260708`,
`OpenAiHardwareNewsBrief`, `UvOpenSourceBrief`, `WorldCupBettingAnalysis`, and
`PixelRAGChineseStandalonePreview`. News/trend-briefing samples should keep
source-backed claims honest: use real screenshots when available, otherwise
record localized source-card fallback reasons in sample data.

Promotion candidates now use the Phase D gate in
`docs/PRODUCER_PROMOTION_GATE.md`: stay sample-local, promote to primitive,
promote to block, promote to recipe, or promote to template. Evidence Lens is
the first block-level reusable producer sample block; it remains Agent Producer
sample infrastructure rather than planner/editor product exposure.

New maintained samples should still live under `src/remotion/<SampleName>/`.
Use `src/remotion/producer-samples/scaffold/` as the starting convention, then
compose the real video from existing primitives, recipe blocks,
`src/remotion/standalone-video/` helpers, local data, and sample-specific
scenes.

Generated screenshots, generated narration audio, and rendered videos stay
local-only under `public/generated/<slug>/` or `out/` unless the user explicitly
asks to commit them.

Agent Producer narration defaults to VoxCPM. Use `scripts/producer-voxcpm.sh up`
to start the host-network Next topology for the loopback-bound personal
VoxCPM service, `scripts/producer-voxcpm.sh smoke` for plain `/tts`, and
`scripts/producer-voxcpm.sh smoke-clone` with private reference env vars for
clone validation. When writing final VoxCPM narration or clone text, use
`.agents/skills/ai-video-studio-voxcpm-expression/` for delivery
state, control instructions, and sparse non-language bracket tags. The current
VoxCPM adapter returns audio without per-line timestamps, so repo TTS generation
splits narration by punctuation, trims each returned chunk's silence,
concatenates the WAV chunks, and builds caption cues from measured chunk
durations.

The local production skill stack is:

- `.agents/skills/ai-video-studio-agent-producer/` for real-topic video
  production from research, sources, TTS timing, primitives, blocks, and still
  review.
- `.agents/skills/remotion-best-practices/` for Remotion code, layout,
  subtitle, audio, and render rules.
- `.agents/skills/ai-video-studio-voxcpm-expression/` only when VoxCPM
  narration, voice clone text, control instructions, pacing, or expression tags
  matter.

Source-backed evidence scenes follow a real-capture-first rule: capture the
actual page, repo, product UI, dashboard, chart, document, or supplied asset
when possible. If capture fails or is unreadable, record the reason before
making a localized source-card fallback, and do not describe that fallback as a
screenshot.

Parked productized web goal:
- user enters a natural-language brief
- AI plans storyboard segments from the brief and registered template
  capabilities
- the system generates narration audio and aligned captions for each segment
- AI compiles each segment into structured template parameters using the real
  audio duration
- page shows live preview for tuning
- user tweaks copy, timing, colors, scenes, assets
- final render exports a video artifact

Project path:
- `/data/projects/labs/ai-video-studio`

Current base:
- official Remotion Next.js template (`create-video --next`)
- Docker-first runtime wrapper added on top
- no host-global npm / pnpm install required for the Docker path

Current implementation status:
- the segment-first editing workflow is implemented
- local project render/export is implemented
- generation and rendering support registered segment templates (`scripted`,
  `spotlight`, `stats-dashboard`, and `technical-explainer`) while preserving
  one primary template per segment
- the parked web/editor generation path is the staged planner -> narration
  synthesis -> audio + aligned captions -> template compiler pipeline; keep it
  as productization context, not the current top-level goal
- the storyboard-planning contract is in place as a server-safe schema,
  compact registered-template manifest, and DeepSeek planner/compiler facade
- DeepSeek planner output is normalized through a provider-facing
  `StoryboardPlanDraft` -> strict `StoryboardPlan` compiler boundary, so AI
  chooses segment intent and narration while repo code owns final IDs, ordering,
  nesting, and validation
- the first TTS asset boundary is in place for planned segments:
  `SegmentNarrationAsset`, internal `POST /api/tts`, local TTS audio artifacts
  under `AI_VIDEO_STUDIO_ARTIFACT_ROOT/tts`, sidecar
  `<audio-name>.captions.json` caption artifacts, `/api/tts/assets/...`
  serving with byte-range support, and ffprobe duration measurement
- generated TTS audio assets are served through streamed byte ranges with
  immutable artifact caching, and Remotion preview pauses the timeline while
  narration audio is buffering
- generated narration audio is attached to `VideoSegment.narration.audio` and
  flattened to the project timeline for preview/export; project-level
  narration media layers remain supported only as a transitional compatibility
  carrier
- the selected-template compiler and staged endpoint use planned segment
  narration, real TTS duration, and only the selected template schema/rules to
  compile template-specific `implementation`
- the page uses `POST /api/generate/staged` for project generation and
  selected-segment regeneration
- staged selected-segment regeneration reruns the target segment's planning,
  TTS, selected-template compilation, and segment-owned narration replacement
  while preserving non-target segments
- the main page has been split into a thin layout entry plus focused project
  generation, generation controls, and preview modules so the staged loop can
  keep growing without concentrating all logic in `src/app/page.tsx`
- staged API request validation/error classification and staged project
  assembly helpers are separated from route dispatch and pipeline orchestration
- in-app export resolves route media such as `/api/tts/assets/...` through the
  Next app origin before Remotion rendering so generated narration audio is
  included in the exported file
- generation and local export requests can attach a client `progressId`; the
  Next process records backend task nodes in memory and the page polls
  `/api/progress/[progressId]` while the request runs
- the main workspace UI now uses the two-color product palette, separates the
  whole-video export workspace from the segment editor, uses a horizontal
  drag-scroll segment strip, keeps the selected-segment form compact, and now
  restores explicit card hierarchy through a shared reusable card primitive so
  workspace shells, panels, nested editor groups, and segment-strip items all
  share the same border and shadow system
- roadmap decisions should use `docs/FINAL_PRODUCT_GOAL.md` as the top-level
  Agent Producer source
- visual-quality and production-roadmap decisions should use
  `docs/VISUAL_RECIPE_ROADMAP.md`
- higher-quality local video-production work that needs research, screenshots,
  TTS-first timing, primitive selection, and still review should use
  `.agents/skills/ai-video-studio-agent-producer/` plus
  `docs/superpowers/specs/2026-07-01-agent-producer-design.md`; this
  is the default path for personal finished-video production, not a wrapper
  around the web prompt
- current progress and next-step notes live in `docs/ITERATION_STATUS.md`
- product requirements live in `docs/PRODUCT_REQUIREMENTS.md`
- F5-TTS / aligned captions provider target lives in
  `docs/providers/f5-tts.md`
- F5-TTS local runtime service plan lives in
  `docs/providers/f5-tts-service-plan.md`
- implementation handoff for that slice lives in
  `docs/HANDOFF_F5_TTS_CAPTIONS.md`
- behavior-preserving structure refactor planning lives in
  `docs/STRUCTURE_REFACTOR_PLAN.md`
- handoff for the structure refactor lives in
  `docs/HANDOFF_STRUCTURE_REFACTOR.md`
- agent/new-task startup notes live in `AGENTS.md`

## Parked productized web flow

1. user writes a brief
2. page calls `POST /api/generate/staged`
3. API returns schema-validated `VideoProject`
4. page renders assembled preview via `ProjectVideo`
5. user edits a selected segment and can regenerate only that segment; staged
   regeneration reruns that segment's narration/TTS/template compile chain
6. generation/regeneration and export show process-local backend progress
   nodes while the request is running
7. user exports the current edited project through `POST /api/render`
8. successful render writes:
   - unique artifact: `AI_VIDEO_STUDIO_ARTIFACT_ROOT/renders/render-<timestamp>-<id>.mp4`
9. download routes:
   - unique artifact: `/api/render/[renderId]`

## Current Direction

Current top-level direction:
- Agent Producer is the primary local production route for real finished
  videos. It starts from a topic, uses research/assets/TTS/component
  composition, and outputs a dedicated Remotion composition.
- The old `VideoProject` final goal is parked indefinitely. Keep it as a
  productization route only for generated projects that explicitly need page
  preview, editing, selected-segment regeneration, or app export.

Parked web/product modeling direction:
- `VideoProject` is the top-level generation / preview / render boundary for
  the productized web path
- `VideoSegment` is the user-facing editing and regeneration unit
- one segment should have one primary template
- `templateId` determines the schema of `implementation`
- final generation should plan segments first, generate narration audio plus
  aligned captions per segment second, then compile the selected template's
  `implementation` from the real audio duration and segment visual brief
- `implementation` is template-specific; current registered templates are:
  - `scripted`: `VideoSpec` with internal `scenes`
  - `spotlight`: `SpotlightSpec` with `headline`, `subheadline`,
    `callouts`, and `durationInFrames`
  - `stats-dashboard`: `StatsDashboardSpec` with `layout`, dashboard
    `blocks`, optional `timeline`, and `durationInFrames`
  - `technical-explainer`: `TechnicalExplainerSpec` with bounded recipe
    sections for hero title, terminal session, workflow map, metric cards,
    timeline progress, code diff, before/after comparison, decision matrix,
    architecture layers, screenshot evidence flow, and product UI zoom
- `VideoSpec.scenes` is specific to the current `scripted` template, not a universal field for all future templates
- generated narration audio should be carried outside template-specific
  `implementation` fields; the target home is segment-owned
  `VideoSegment.narration`, and the scripted scene schema no longer exposes an
  audio field to generation providers
- VoxCPM is the default Agent Producer narration provider. Plain narration
  uses the existing `/data/projects/labs/voxcpm-api` `/tts` service, and
  `voiceClone.enabled` with provider `voxcpm` uses VoxCPM clone through
  `/clone_with_prompt` by default.
- VoxCPM expressive narration guidance lives in
  `.agents/skills/ai-video-studio-voxcpm-expression/`; it should be
  used when final TTS text needs control instructions, emotional state,
  pacing, punctuation-aware caption phrasing, or non-language tags.
- the in-project F5-TTS provider adapter is retained as an explicit fallback
  when `TTS_PROVIDER=f5-tts` and `F5_TTS_BASE_URL` points at a running service
- the optional `f5-tts` Docker overlay provides a contract-smoke runtime and a
  real `F5_TTS_SERVICE_MODE=f5` runtime; the GPU overlay has been validated
  with the local checkpoint, vocab, and Vocos vocoder
- caption cues should be stored with segment narration data using segment-local
  timing, then rendered by shared project preview/export code
- F5-TTS can be selected with `TTS_PROVIDER=f5-tts`; when F5 does not return
  alignment, the project normalizes deterministic punctuation-split fallback
  captions from narration text and real audio duration
- staged generation can use page-level voice cloning: upload a reference audio
  file, provide the exact reference text, and the selected TTS provider receives
  the same reference for full-project generation and selected-segment
  regeneration
- F5 runtime setup and validation details live in
  `docs/providers/f5-tts-service-plan.md`
- VoxCPM provider setup and validation details live in
  `docs/providers/voxcpm.md`
- future existing video, image, audio, or color inputs should be modeled as
  project-level or segment-level `media.layers[]` data; `baseLayer` is now a
  media-layer role, not a separate project field

Current visual-quality direction:
- make Agent Producer the default path for personal high-quality video
  production; use purpose-built Remotion compositions before promoting
  reusable pieces back into recipes/templates
- keep the productized web path available as a secondary track instead of
  treating it as the final goal
- upgrade simple template output into high-quality scene recipes: polished,
  duration-aware treatments with stronger motion, transitions, grouped visual
  blocks, and Remotion Studio preview examples
- use the primitive-first hierarchy for reusable visual work:
  `primitive -> block -> dedicated composition -> recipe -> template -> VideoProject`.
  Local agent producer runs should first compose a purpose-built Remotion video
  from primitives, blocks, data, TTS timing, and sample-specific scenes; recipes
  are template-owned treatments promoted only after the composition proves a
  reusable shape.
- Phase D Promotion Gate v1 makes promotion decisions explicit:
  stay sample-local, promote to primitive, promote to block, promote to recipe,
  or promote to template. Evidence Lens is recorded as the first block-level
  reusable producer sample block, while generated artifacts remain local-only
  and planner/editor exposure remains out of scope for this slice.
- `RecipeShowcasePreview` is the first static Remotion Studio quality baseline,
  with hero title, workflow map, terminal session, metric cards, timeline, and
  code-diff recipe scenes plus bounded subject-motion transitions: 2.5D
  stage push/pull, fly-through, and a one-off cube turn accent. Low-value
  full-frame light-sweep and scanline-wipe overlay bridges were removed to
  keep Studio preview lighter.
- Phase 2 recipe-runtime work has completed for reusable runtime primitives:
  subject-motion transitions live under `src/remotion/recipes/motion/`,
  terminal, metric-card, workflow-map, and timeline grouped visual blocks live
  under `src/remotion/recipes/blocks/`, and duration-aware / caption-safe
  timing helpers live under `src/remotion/recipes/timing/`
- Phase 3 recipe-template work has landed through the registered
  `technical-explainer` template. It uses bounded recipe sections for hero
  title, terminal session, workflow map, metric cards, and timeline progress
  while preserving `ProjectVideo` preview/export behavior.
- Phase 4 planner recipe selection is in place: recipe-capable templates expose
  compact planner-facing recipe metadata, DeepSeek can return optional
  `recipeHints`, and the selected-template compiler turns those hints into
  schema-valid template implementation while keeping `VideoProject` unchanged.
  Deterministic smoke and contract-smoke provider-backed route smoke have
  validated this path; real-GPU F5 live smoke still requires a Docker runtime
  with a visible NVIDIA driver.
- Phase 4.5 recipe coverage expansion adds generated `code-diff-highlight`,
  `before-after-compare`, `decision-matrix`, and
  `architecture-layer-stack` recipes to `technical-explainer`, bringing the real
  planner/compiler template to 9 bounded recipe sections.
- Phase 5 v1 asset-aware recipes add `product-ui-zoom` to
  `technical-explainer` with controlled `public` or `route` image asset
  descriptors, deterministic missing-asset fallback rendering, and export-time
  route source rewriting while broader media-layer work remains deferred.
- Phase 5.1 lands the bounded product screenshot upload-and-bind loop for
  `technical-explainer/product-ui-zoom`: uploads stay client-side until binding,
  generation requests do not receive screenshot descriptors, and full project
  generation locally applies the latest uploaded screenshot to the first
  unbound product-ui placeholder.
- Main-site recipe abstractions now extract the useful visual language from the
  two standalone samples back into generated `VideoProject` output:
  `technical-explainer/screenshot-evidence-flow` lets the planner choose a
  screenshot-backed evidence/process treatment, and
  `stats-dashboard/odds-ev-ranking` lets the planner choose a compact odds,
  no-vig probability, expected value, and risk-ranking data story. These recipes
  are exposed through the planner manifest and `recipeHints`, so they affect
  normal `/api/generate/staged` generation rather than duplicate standalone
  videos. This is now productization context, not the default production route.
- The current sample-first checkpoint adds
  `PixelRAGChineseStandalonePreview`, a Chinese standalone Remotion video for
  [StarTrail-org/PixelRAG](https://github.com/StarTrail-org/PixelRAG). It
  generates F5-TTS first, writes the audio into Remotion-readable static assets,
  uses real GitHub screenshots, keeps the main screenshot/card/page/index
  content in foreground 3D motion, and renders through a custom composition
  rather than existing templates.
- The latest finished-video-first sample adds `WorldCupBettingAnalysis`, a
  standalone 1080x1920 / about 69.6s / 30fps Remotion composition for a世界杯竞彩
  EV analysis short. It keeps data in a local module, uses 8 generated Chinese
  F5-TTS voiceover files from `public/generated/world-cup-betting-analysis/`,
  redraws the odds table when no screenshot asset is present, and is intended
  as a concrete source for later data-analysis template extraction.
- The first real Agent Producer run adds `UvOpenSourceBrief`, a standalone
  1920x1080 / about 59.9s / 30fps Chinese open-source project brief for
  Astral `uv`. It uses current GitHub/docs/release facts, generated F5-TTS
  narration metadata, full-frame screenshot evidence, compact translucent
  overlays, and claim-aligned zoom-in / hold / return motion.
- Phase C now extracts that screenshot-proof language into
  `src/remotion/producer-samples/evidence-lens/`: shared `ScreenshotFocus`,
  `EvidenceScreenshotBackdrop`, and `EvidenceOverlayPanel`. `UvOpenSourceBrief`
  consumes the shared block while keeping its facts, narration, TTS metadata,
  composition id, and duration contract sample-local.
- Finished-video-first samples share the categorized
  `src/remotion/standalone-video/` runtime for timing, static voiceover,
  captions, and canvas profiles. This is a reusable production skeleton, not a
  universal visual template: PixelRAG remains `landscape-16x9` /
  `project-intro`, WorldCup remains `portrait-9x16` / `data-analysis`, and
  Uv remains `landscape-16x9` / `project-intro`. The default path for better
  real videos is Agent Producer; planner-visible templates and recipes remain
  the secondary productization path.
- Lower-priority standalone reference compositions are grouped under
  `src/remotion/standalone-samples/`, with checked-in sample audio under
  `public/standalone-samples/audio/`. They remain references, not registered
  product templates or planner-visible recipes.
- The Agent Producer skill is the local high-quality path outside the
  one-shot page prompt: research a real topic, capture or prepare source
  assets, inspect candidate primitives/blocks/runtime helpers, write
  narration/TTS before timing, assemble a dedicated Remotion composition in the
  style of `WorldCupBettingAnalysis`, and review Remotion stills before
  claiming the draft is good. `VideoProject` is reserved for explicit web
  editing or productization needs.
- keep AI output bounded to registered template / recipe parameters; do not use
  unrestricted generated TSX as the normal path
- avoid broad visual-review scoring or automatic screenshot repair as the next
  quality strategy; first make the generated segments look better
- use `docs/VISUAL_RECIPE_ROADMAP.md` for the Agent Producer and visual
  promotion roadmap

Current top-level boundaries:
1. `/src/app/page.tsx`
   - prompt input
   - segment-first editor
   - full preview panel
   - local render/export actions
2. `/src/app/api/generate/staged/route.ts`
   - staged generation and selected-segment regeneration
3. `/src/app/api/render/*`
   - local Remotion export for the current edited project
4. `/src/lib/project-schema.ts`
   - stable `VideoProject` contract used by generation, preview, and export
5. `/src/lib/storyboard-plan-schema.ts`
   - validated `StoryboardPlan` contract for the future planner stage
6. `/src/templates/*`
   - cohesive template modules with `schema`, server-safe `definition`,
     structured `capabilities`, optional block contracts, editor fields,
     runtime adapters, and bundle exports
7. `/src/templates/registry.ts`
   - derived server-safe template metadata registry used by schema validation
     DeepSeek prompt/tool generation, and the planner template manifest
8. `/src/templates/registered-definitions.ts`
   - server-safe template definition registration source
9. `/src/templates/registered-bundles.ts`
   - runtime template bundle registration source
10. `/src/templates/component-registry.tsx`
   - runtime template registry used by the page editor and Remotion preview
11. `/src/lib/template-registry.ts`
   - compatibility re-export for existing code
12. `/src/remotion/*`
    - render video from structured props instead of ad-hoc codegen
    - reusable video primitives live under `src/remotion/primitives/` and may
      be composed by template-local block renderers
13. `/.agents/skills/ai-video-studio-agent-producer/*`
    - repo-local Agent Producer skill: research,
      screenshots/assets, primitive/block/runtime inventory, TTS-first timing,
      dedicated composition assembly, still review, and later promotion
14. `/.agents/skills/ai-video-studio-voxcpm-expression/*`
    - repo-local skill for VoxCPM narration expression: control instructions,
      delivery state, voice-clone text handling, and sparse non-language tags
15. `/src/remotion/standalone-samples/*`
    - reference-only standalone compositions kept out of template/runtime
      folders
16. `/public/standalone-samples/audio/*`
    - checked-in sample audio required by reference-only standalone
      compositions
17. `/scripts/f5-tts/*`
    - local F5/TTS helper scripts; private reference voices stay in ignored
      `voices/f5-tts/`

## Handoff for the next iteration

Start from:
- `docs/FINAL_PRODUCT_GOAL.md`
- `docs/ITERATION_STATUS.md`
- `docs/STRUCTURE_REFACTOR_PLAN.md` when the task is structural cleanup
- `docs/HANDOFF_STRUCTURE_REFACTOR.md` when handing structure cleanup to a new
  conversation or Subagent-Driven run
- `docs/VISUAL_RECIPE_ROADMAP.md` when the task is visual quality, recipes,
  primitives, templates, motion, transitions, or generated-video polish
- `docs/superpowers/specs/2026-07-01-agent-producer-design.md` and
  `.agents/skills/ai-video-studio-agent-producer/SKILL.md` when the
  task is a local high-quality producer run rather than a quick web prompt
- `.agents/skills/ai-video-studio-voxcpm-expression/SKILL.md` when a
  producer run uses VoxCPM narration or voice clone and the script needs
  delivery state, expressive pacing, or non-language tags
- `docs/PRODUCT_REQUIREMENTS.md`
- `docs/FUTURE_DIRECTION_NOTES.md`
- `README.md`

Current code checkpoint:
- active page generation uses `POST /api/generate/staged`
- staged-generation groundwork: `StoryboardPlan` schema, planner manifest, and
  internal DeepSeek planner/compiler facade are implemented
- TTS groundwork: internal `POST /api/tts` can generate and serve a
  `SegmentNarrationAsset` for one planned segment when F5-TTS is configured
- selected-template compiler groundwork: internal compiler functions and
  `POST /api/generate/staged` can assemble a staged project
- staged selected-segment regeneration is wired for the active page path
- page generation state now lives under `src/helpers/project-generation/`;
  `src/helpers/use-project-generation.ts` remains a compatibility export, with
  `GenerationPanel` and `PreviewPanel` handling the corresponding UI sections
- staged route request parsing/error classification lives in
  `src/lib/staged-generation-api.ts`; staged pipeline orchestration,
  one-segment narration/compile work, diagnostics, assembly, and
  selected-segment replacement helpers live under `src/lib/staged-generation/`
  with old staged module paths kept as compatibility re-exports
- route media export hardening is in place for generated narration audio
- process-local backend progress tracking is in place for generation and
  render requests through `progressId`, `src/lib/task-progress.ts`, and
  `/api/progress/[progressId]`
- the active page UI is organized into a whole-video workspace and a segment
  editor; the segment editor uses a horizontal drag-scroll segment strip plus
  compact selected-segment forms
- basic bounded planner repair is in place for invalid `StoryboardPlan`
  output
- deterministic staged smoke fixtures cover a mixed `scripted` + `spotlight`
  project with segment-owned narration audio/captions and selected-segment
  narration/caption replacement;
  Remotion Studio exposes the current fixture as
  `StagedSmokeMixedTemplateProject`
- optional local F5 runtime service is implemented with contract-smoke and
  real GPU-backed `F5_TTS_SERVICE_MODE=f5` modes
- real F5 validation has passed direct service smoke, Next `/api/tts` adapter
  smoke, deterministic staged mixed-template smoke, and deterministic staged
  export smoke
- not implemented yet: persistence/history and broad media-layer editing

Current bounded direction and guardrails:
- treat `docs/FINAL_PRODUCT_GOAL.md` as the Agent Producer authority
- keep `VideoProject` as the preview/edit/export boundary only for the parked
  productized web route
- use `StoryboardPlan` as the planner-stage contract
- continue from `VideoSegment.narration` as the target home for generated
  narration text, audio metadata, and segment-local caption cues
- treat Phase 4 planner recipe selection as closed for deterministic coverage
  and contract-smoke provider-backed route validation
- keep the real-GPU F5 live smoke as an environment follow-up: rerun it only
  when Docker can see an NVIDIA driver
- Phase 5 v1 is landed as one asset-aware recipe inside the owning template;
  broader media-layer work remains deferred
- Phase 5.1 is complete for the bounded recipe-owned loop: upload one product screenshot before
  generation or inside a `product-ui-zoom` section, bind it to that recipe, and
  keep preview/export on the same controlled reference
- the current personal video-production path is Agent Producer first: start
  from primitive/block/runtime inventory, use research/screenshots/TTS-first
  timing when the topic needs it, then compose a dedicated Remotion video by
  default
- the secondary productization path is main-site recipe-first: use finished
  standalone samples as evidence, then promote reusable visual language into
  planner-visible templates and `recipeHints`
- choose `VideoProject` only for explicit web editing, selected-segment
  regeneration, app export, or productization needs
- avoid persistence/history, broad media-library UI, generic media-layer
  compositing, and multi-template-per-segment orchestration unless explicitly
  reopened

## Docker usage

Prereqs:
- Docker installed and running
- no host Node.js package installation needed

Start Next.js app:
```bash
cd /data/projects/labs/ai-video-studio
./scripts/dev.sh
```
Then open:
- http://localhost:3000

The Docker Compose `web` and `studio` services use
`restart: unless-stopped`, so local containers can survive workstation restarts
until they are explicitly stopped with `docker compose down` or equivalent.
Next dev requests are allowed from `localhost`, the configured LAN origins, and
`ez.zzzxc.com`.

Start the separate production web service without changing the existing dev
service:
```bash
cd /data/projects/labs/ai-video-studio
cp .env.example .env.prod
# fill prod credentials / origins in .env.prod before first real use
bash scripts/prod-build.sh
```

`scripts/prod.sh` and `scripts/prod-build.sh` now explicitly load
`.env.prod` via `docker compose --env-file .env.prod`, so prod no longer
silently falls back to `.env` for Compose interpolation.

Default production topology on this workstation:
- `web` stays on the existing dev path (`npm run dev`)
- `web-prod` runs `next build` + `next start`
- `web-prod` binds `127.0.0.1:10001` by default
- host-level Cloudflare Tunnel ingress should point at `http://127.0.0.1:10001`
- export-time route media fetches inside the prod container must still use
  `AI_VIDEO_STUDIO_RENDER_ASSET_ORIGIN=http://127.0.0.1:3000`
- the optional real `f5-tts` GPU service is shared by dev and prod rather than
  duplicated
- the shared `f5-tts` host port stays local-only by default

If the prod service should also be reachable directly from the LAN, change
`PROD_APP_BIND` in `.env.prod` from `127.0.0.1` to `0.0.0.0`.

The Docker startup path runs `npm run remotion:ensure-browser` before starting
the app. This checks for Remotion's Chrome Headless Shell and downloads it
upfront when missing, so the first in-app video export does not block on the
browser dependency download.

Start Remotion Studio:
```bash
cd /data/projects/labs/ai-video-studio
./scripts/studio.sh
```
Then open:
- http://localhost:3001

For visual-recipe inspection, open `TechnicalExplainerTemplatePreview`. It uses
a slower Studio-only fixture so each recipe holds for about five seconds; the
sample-derived `screenshot-evidence-flow` section starts around frame 300, and
the Phase 5 `product-ui-zoom` section starts around frame 450. The bounded
product screenshot upload-and-bind loop is now available through the app
generation panel and the segment editor; it remains recipe-owned rather than a
media library.

For the current real sample, open `PixelRAGChineseStandalonePreview`. It is a
12-scene Chinese PixelRAG intro whose duration comes from generated F5-TTS
narration, currently about 46 seconds after short scene overlaps. It uses real
GitHub project screenshots plus varied foreground 3D entry/exit motion for
cards, sliced pages, visual vectors, index stacks, and answer panels. It is a
standalone Remotion composition and does not use `ProjectVideo`,
`technical-explainer`, or the registered template renderer.

For the current data-analysis short sample, open `WorldCupBettingAnalysis`.
It is a standalone 9:16世界杯竞彩 analysis video built from structured local
match data, generated Chinese F5-TTS voiceover, and code-drawn visuals. It
does not require screenshot assets; when `public/assets/jingcai-odds.png` is
absent, the source scene redraws a compact odds table.

For the first real Agent Producer run, open `UvOpenSourceBrief`. It is a
standalone 16:9 Chinese open-source project brief for Astral `uv`, built from
local data, generated F5-TTS narration metadata, live evidence screenshots, and
sample-local visuals composed with `src/remotion/standalone-video/` plus
recipe blocks. Generated screenshots and audio live under ignored
`public/generated/uv-open-source-brief/`.

For the current OpenAI news producer sample, open `OpenAiHardwareNewsBrief`.
It is a standalone 16:9 Chinese trend brief about the reported Codex Micro /
Work Louder hardware teaser. It uses generated F5-TTS narration metadata,
Evidence Lens source-card fallback assets, workflow blocks, and sample-local
hardware/news visuals. Its source-card assets are explicitly recorded as
fallback evidence, not screenshots, with fallback reasons in
`src/remotion/OpenAiHardwareNewsBrief/data.ts`. Generated source cards, audio,
stills, and mp4 live under ignored
`public/generated/openai-hardware-news-brief/` and `out/`.

Preview the local Remotion primitive catalog in the app:
- http://localhost:3000/primitives

Remotion Studio is kept for full-video and template-level compositions. The
primitive catalog uses the app page above so small reusable components do not
crowd the Studio composition list.

For a higher-quality local producer run, use
`.agents/skills/ai-video-studio-agent-producer/` before writing new
Remotion visuals. That skill starts with the primitive catalog, then uses
research, real source capture before source-card fallback, TTS-first timing,
existing recipe blocks, `src/remotion/standalone-video/` helpers, and
still-frame review to build a dedicated composition like
`WorldCupBettingAnalysis`. Visible screenshot evidence must use an actual
captured, readable screenshot; failed capture reasons belong in data or
handoff text, not in the video frame. Treat `VideoProject` as a productization,
editing, regeneration, or app export target, not the default local producer
output.

Render the default/sample composition to `out/ai-video.mp4`:
```bash
cd /data/projects/labs/ai-video-studio
./scripts/render.sh
```

List Remotion compositions and load the deterministic staged smoke fixtures:
```bash
cd /data/projects/labs/ai-video-studio
docker compose run --rm web npm run smoke:staged-fixtures
```

Regenerate the standalone Chinese PixelRAG sample from real F5-TTS assets. This
command needs the Next `web` service running because it calls `POST /api/tts`:
```bash
cd /data/projects/labs/ai-video-studio
docker compose exec -T web bash -lc 'NEXT_ORIGIN=http://127.0.0.1:3000 npm run generate:pixelrag-chinese-standalone'
```

Validate the standalone PixelRAG sample contract without regenerating audio:
```bash
cd /data/projects/labs/ai-video-studio
docker compose run --rm web npm run smoke:pixelrag-chinese-standalone
```

Render the standalone PixelRAG sample:
```bash
cd /data/projects/labs/ai-video-studio
docker compose run --rm web bash -lc 'npx remotion render src/remotion/index.ts PixelRAGChineseStandalonePreview /workspace/out/pixelrag-chinese-standalone-v3.mp4'
```

Validate the standalone WorldCup betting analysis sample:
```bash
cd /data/projects/labs/ai-video-studio
docker compose run --rm web npm run smoke:world-cup-betting-analysis
```

Validate the shared standalone finished-video runtime:
```bash
cd /data/projects/labs/ai-video-studio
docker compose run --rm web npm run smoke:standalone-video-runtime
```

Regenerate the standalone uv open-source brief voiceover from local TTS. This
command needs the Next `web` service running because it calls `POST /api/tts`:
```bash
cd /data/projects/labs/ai-video-studio
docker compose exec -T web bash -lc 'NEXT_ORIGIN=http://127.0.0.1:3000 npm run generate:uv-open-source-brief'
```

Validate the standalone uv open-source brief contract without regenerating
audio:
```bash
cd /data/projects/labs/ai-video-studio
docker compose run --rm web npm run smoke:uv-open-source-brief
```

Render the standalone uv open-source brief sample:
```bash
cd /data/projects/labs/ai-video-studio
docker compose run --rm web bash -lc 'npx remotion render src/remotion/index.ts UvOpenSourceBrief /workspace/out/uv-open-source-brief.mp4'
```

Regenerate the standalone WorldCup betting analysis voiceover from local TTS.
This command needs the Next `web` service running because it calls
`POST /api/tts`:
```bash
cd /data/projects/labs/ai-video-studio
docker compose exec -T web bash -lc 'NEXT_ORIGIN=http://127.0.0.1:3000 npm run generate:world-cup-betting-analysis'
```

Render the standalone WorldCup betting analysis sample:
```bash
cd /data/projects/labs/ai-video-studio
docker compose run --rm web bash -lc 'npx remotion render src/remotion/index.ts WorldCupBettingAnalysis /workspace/out/world-cup-betting-analysis.mp4'
```

Validate the recipe showcase preview registration:
```bash
cd /data/projects/labs/ai-video-studio
docker compose run --rm web npm run smoke:recipe-showcase-preview
```

Start the optional F5-TTS contract-smoke runtime:
```bash
cd /data/projects/labs/ai-video-studio
docker compose -f docker-compose.yml -f docker-compose.f5.yml up -d f5-tts
scripts/f5-tts-smoke.sh
```

This does not download F5 model checkpoints. It only verifies the local HTTP
contract consumed by the Next.js F5 adapter.

Validate the Next-side F5 adapter and generated TTS asset route:
```bash
cd /data/projects/labs/ai-video-studio
docker compose -f docker-compose.yml -f docker-compose.f5.yml up -d web
scripts/f5-tts-next-smoke.sh
```

This smoke calls `POST /api/tts`, writes a local artifact under
`AI_VIDEO_STUDIO_ARTIFACT_ROOT/tts` through the existing adapter, and verifies
`/api/tts/assets/...` byte-range serving.
It still uses contract-smoke audio, not a downloaded F5 model.

Validate the Next-side VoxCPM adapter and generated TTS asset route:
```bash
cd /data/projects/labs/ai-video-studio
scripts/producer-voxcpm.sh up
scripts/producer-voxcpm.sh smoke
```

Use `TTS_PROVIDER=voxcpm` for the default Agent Producer narration path.
Ordinary text-to-speech calls VoxCPM `/tts`; voice cloning calls
`/clone_with_prompt` by default. The personal VoxCPM service currently binds to
host `127.0.0.1:8810`, and bridge-mode `host.docker.internal` was not
sufficient for that loopback-only service in the local validation. The
`docker-compose.voxcpm.yml` override therefore runs `web` with host networking
so Next can reach the same loopback URL as the host.

Validate VoxCPM clone with a private local reference file:
```bash
cd /data/projects/labs/ai-video-studio
VOXCPM_TTS_NEXT_SMOKE_REFERENCE_AUDIO=/absolute/path/to/private-reference.wav \
VOXCPM_TTS_NEXT_SMOKE_REFERENCE_TEXT='exact transcript of the private reference audio' \
scripts/producer-voxcpm.sh smoke-clone
```

Set `TTS_PROVIDER=f5-tts` only when you intentionally want the explicit F5
fallback path.

Validate a deterministic staged project using F5 narration assets:
```bash
cd /data/projects/labs/ai-video-studio
docker compose -f docker-compose.yml -f docker-compose.f5.yml up -d web
npm run smoke:f5-staged
```

This smoke avoids live LLM planner/compiler calls. It uses a fixed two-segment
storyboard plan, generates each segment's narration through `POST /api/tts`,
assembles a schema-compatible `VideoProject`, and checks byte-range serving for
each generated narration asset. To also export the assembled project through
`POST /api/render`, run:

```bash
F5_TTS_STAGED_SMOKE_RENDER=true npm run smoke:f5-staged
```

Validate the live staged route with DeepSeek planner/compiler plus F5
narration:

```bash
npm run smoke:staged-live
```

This command calls `POST /api/generate/staged`, checks segment-owned narration
audio and captions, validates diagnostics, and verifies byte-range serving for
generated `/api/tts/assets/...` audio. It exits successfully with a skip
message when `DEEPSEEK_API_KEY` or `F5_TTS_BASE_URL` is missing. To also export
the generated project through `POST /api/render`, run:

```bash
npm run smoke:staged-live:render
```

Run the real F5 runtime on GPU when the host NVIDIA driver/runtime is
available:

```bash
cd /data/projects/labs/ai-video-studio
scripts/f5-tts-real.sh up-build
scripts/f5-tts-smoke.sh
```

`scripts/f5-tts-real.sh` applies `docker-compose.f5.gpu.yml`, rebuilds only the
`f5-tts` image when requested, and recreates only the `f5-tts` container. The
helper sets `F5_TTS_SERVICE_MODE=f5`, defaults `F5_TTS_DEVICE=cuda`, and the
GPU overlay requests all visible GPUs. It still requires the local F5
checkpoint, vocab, and Vocos vocoder under `models/f5-tts/`.

The recommended workstation deployment is to keep exactly one real `f5-tts`
service running and let both the dev `web` service and the prod `web-prod`
service call the same internal `http://f5-tts:7865` endpoint. This keeps the
GPU/model footprint small while the app-layer concurrency guards stay at `1`.

Do not use the plain `docker-compose.f5.yml` overlay for user-facing F5
narration checks. That overlay intentionally defaults to `contract-smoke`;
that mode returns synthetic contract-test audio and can sound like a continuous
beep instead of real F5 narration.

On this workstation the GPU path has been validated with:
- direct service smoke: `F5_TTS_BASE_URL=http://127.0.0.1:7865 scripts/f5-tts-smoke.sh`
- Next adapter smoke: `NEXT_ORIGIN=http://127.0.0.1:3000 scripts/f5-tts-next-smoke.sh`
- staged assembly smoke: `docker compose -f docker-compose.yml -f docker-compose.f5.yml -f docker-compose.f5.gpu.yml exec -T web npm run smoke:f5-staged`
- staged export smoke: `docker compose -f docker-compose.yml -f docker-compose.f5.yml -f docker-compose.f5.gpu.yml exec -T web bash -lc 'F5_TTS_STAGED_SMOKE_RENDER=true npm run smoke:f5-staged'`
- live staged route smoke: `docker compose -f docker-compose.yml -f docker-compose.f5.yml -f docker-compose.f5.gpu.yml exec -T web npm run smoke:staged-live`

If `F5_TTS_DEFAULT_REFERENCE_AUDIO` is unset, the service uses the default
English reference WAV bundled with `f5-tts` plus the upstream example reference
text. For a custom voice, set both `F5_TTS_DEFAULT_REFERENCE_AUDIO` and
`F5_TTS_DEFAULT_REFERENCE_TEXT`.

The page also exposes F5 voice cloning for staged generation. Enable
`声音克隆`, upload a `.wav`, `.mp3`, `.m4a`, or `.aac` reference file, and
enter the transcript that matches the reference audio before generation. The
Next app stores the uploaded reference under
`AI_VIDEO_STUDIO_ARTIFACT_ROOT/voice-references`, which defaults to the ignored shared
path `/workspace/out/voice-references` in the Docker workflow. The F5 overlay
mounts the shared host `./out` tree read-only at `/workspace/out`, so the
configured voice-reference path, TTS path, and render path all stay inside one
shared artifact root. Upload and synthesis therefore use one shared file path
instead of separate app/runtime path settings. When
cloning is disabled, staged generation falls back to the configured default F5
voice/reference behavior.

Important distinction:
- `./scripts/render.sh` is still the default/sample composition render path from the Docker wrapper
- current edited-project export is the in-app action / `POST /api/render`
- the edited-project export writes a unique `AI_VIDEO_STUDIO_ARTIFACT_ROOT/renders/render-*.mp4`
- generated route media such as `/api/tts/assets/...` is converted to an
  absolute Next app URL for Remotion export. Override the default
  `http://127.0.0.1:3000` with `AI_VIDEO_STUDIO_RENDER_ASSET_ORIGIN` when the
  renderer needs a different origin.

Stop containers:
```bash
cd /data/projects/labs/ai-video-studio
docker compose down
```

## Docker-first validation

This workstation uses Docker-first validation. Do not rely on host
`node_modules`.
```bash
cd /data/projects/labs/ai-video-studio
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run build'
```

Code quality entry points:
- `npm run lint`: ESLint for Next.js, TypeScript, and Remotion code.
- `npm run typecheck`: TypeScript compile check without emitting files.
- `npm run format:check`: Prettier style check.
- `npm run style:check`: lint + typecheck + format check.
- `npm run check`: style check + production build.

Run these through Docker on this workstation, for example:
```bash
cd /data/projects/labs/ai-video-studio
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run check'
```

## Docker files added
- `Dockerfile`
- `Dockerfile.prod`
- `docker-compose.yml`
- `docker-compose.prod.yml`
- `.dockerignore`
- `scripts/dev.sh`
- `scripts/prod.sh`
- `scripts/prod-build.sh`
- `scripts/studio.sh`
- `scripts/render.sh`

## Local configuration

Use one local config file:

```bash
cp .env.example .env
```

`.env.example` is the only tracked template. `.env` is ignored by Git and is
used for both Docker Compose interpolation and Next/provider runtime config.
Older `.env.local` files are still tolerated by Next.js, but new local setup
should prefer `.env` so Docker ports, provider credentials, TTS settings, and
render origins are managed in one place.

For the separate production service on this workstation, create a second local
ignored file from the same tracked template:

```bash
cp .env.example .env.prod
```

Recommended prod-specific overrides in `.env.prod`:
- `PROD_APP_BIND=127.0.0.1`
- `PROD_APP_PORT=10001`
- `F5_TTS_HOST_BIND=127.0.0.1`
- `AI_VIDEO_STUDIO_ARTIFACT_ROOT="/workspace/out"`
- `AI_VIDEO_STUDIO_RENDER_ASSET_ORIGIN="http://127.0.0.1:3000"` for container-internal export fetches
- `TTS_PROVIDER="f5-tts"` for F5 default/voice-clone work, or
  `TTS_PROVIDER="voxcpm"` for ordinary VoxCPM `/tts` synthesis after
  reachability is verified
- `F5_TTS_BASE_URL="http://f5-tts:7865"`
- `VOXCPM_TTS_BASE_URL="<verified VoxCPM URL>"` only when VoxCPM is selected
- keep `AI_VIDEO_STUDIO_RENDER_CONCURRENCY`,
  `AI_VIDEO_STUDIO_GENERATION_CONCURRENCY`, `AI_VIDEO_STUDIO_TTS_CONCURRENCY`,
  and `F5_TTS_RUNTIME_CONCURRENCY` at `1`

### Private-team concurrency guard

This project is designed for private deployment and does not require a database
or production job queue for the current stage. It still protects expensive
server-side tasks because a private deployment may be used by a few people at
the same time.

Configured limits in `.env.example`:

| Variable | Default | Purpose |
|---|---:|---|
| `AI_VIDEO_STUDIO_RENDER_CONCURRENCY` | `1` | Maximum concurrent `/api/render` exports in this Next process. |
| `AI_VIDEO_STUDIO_GENERATION_CONCURRENCY` | `1` | Maximum concurrent `/api/generate/staged` requests in this Next process. |
| `AI_VIDEO_STUDIO_TTS_CONCURRENCY` | `1` | Maximum concurrent TTS provider synthesis calls, including local F5 runtime calls. |
| `AI_VIDEO_STUDIO_BUSY_MODE` | `reject` | `reject` returns HTTP `429` when the task type is busy; `queue` waits inside the HTTP request. |
| `AI_VIDEO_STUDIO_QUEUE_TIMEOUT_MS` | `300000` | Maximum wait time for `queue` mode. |
| `F5_TTS_RUNTIME_CONCURRENCY` | `1` | Maximum concurrent direct `/synthesize` calls inside the optional F5 runtime service. |

Recommended private-team defaults:
- keep render, generation, TTS, and F5 runtime concurrency at `1`
- keep `AI_VIDEO_STUDIO_BUSY_MODE=reject` so another user gets an immediate
  "busy, retry later" response instead of a long hanging request
- use `queue` only for trusted local workflows where keeping the browser
  request open is acceptable

The guard is process-local. It is enough for the Docker-first private-team
workflow, but it is not a global lock across multiple Next replicas. If this
project is deployed with multiple app instances, use an external lock or a real
job system before treating these limits as global.

## Notes
- `node_modules` is intended to live in the Docker volume path on this workstation.
- output files are written under `/data/projects/labs/ai-video-studio/out`.
- the official scaffold created a nested `.git/` repo in this directory.
- the app is no longer the upstream starter UI; the current studio path already supports brief -> project generation -> full preview -> selected-segment editing -> selected-segment regeneration -> local export.
- Docker render images now include Noto CJK fonts for Chinese-first content.

## DeepSeek Integration

The staged generation path is backed by DeepSeek through the Vercel AI SDK
provider. DeepSeek handles storyboard planning, selected-segment replanning,
and selected-template implementation compilation. F5-TTS and VoxCPM are the
active local narration/TTS providers: F5-TTS owns voice-clone requests, and
VoxCPM can be explicitly selected for ordinary `/tts` synthesis. The assembled
`VideoProject` contract is unchanged:
provider output must still validate against the selected planner/template
schemas and final project schema.

### Environment variables

Add to `.env` (see `.env.example`):

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `DEEPSEEK_API_KEY` | yes | — | API key for `@ai-sdk/deepseek`. |
| `DEEPSEEK_MODEL` | no | `deepseek-chat` | Model used by planner/compiler calls. |
| `DEEPSEEK_BASE_URL` | no | provider default | Optional gateway/base URL override. |

Local render/export also supports:

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `AI_VIDEO_STUDIO_RENDER_ASSET_ORIGIN` | no | `http://127.0.0.1:3000` | Origin used by `/api/render` to resolve route media such as generated TTS audio during Remotion export. |

### What happens if the key is missing

The provider throws `DeepSeekConfigError("DEEPSEEK_API_KEY is not configured. Set it in .env to enable real generation.")` on the first staged generation call, and `POST /api/generate/staged` returns a `500` with the same message in the `error` field. The UI surfaces it as the generation error state. There is no silent mock or MiniMax fallback.

### Failure → HTTP status mapping

| Failure | HTTP |
|---|---|
| `DEEPSEEK_API_KEY` missing or empty | 500 |
| Network error / upstream non-2xx (4xx, 5xx) | 502 |
| JSON output missing or invalid | 502 |
| Response fails planner/template validation | 502 |
| F5-TTS config missing or invalid | 500 |
| F5-TTS runtime/network/audio failure | 502 |
| VoxCPM config missing or invalid | 500 |
| VoxCPM runtime/network/audio failure | 502 |
| Invalid request body / unknown mode | 400 |

### Docker-first verification

```bash
cd /data/projects/labs/ai-video-studio
./scripts/dev.sh
```

Then smoke test the missing-key path from another terminal (returns 500):

```bash
cd /data/projects/labs/ai-video-studio
# ensure .env does NOT export DEEPSEEK_API_KEY
curl -s -X POST http://127.0.0.1:3000/api/generate/staged \
  -H 'content-type: application/json' \
  -d '{"mode":"brief","brief":"hello world"}'
# -> {"error":"DEEPSEEK_API_KEY is not configured. Set it in .env to enable real generation."} (status 500)
```

Run static validation inside Docker on this workstation; host `node_modules`
is not the default validation target.

Current DeepSeek implementation notes live in [`docs/providers/deepseek.md`](docs/providers/deepseek.md).
