# Iteration Status

Last updated: latest documentation alignment

## Latest continuation — authoritative final generation goal

- Added `docs/FINAL_PRODUCT_GOAL.md` as the authoritative product target and
  roadmap source.
- Locked the final generation model as a staged pipeline:
  user prompt -> storyboard plan -> per-segment TTS -> per-segment
  selected-template compilation -> assembled `VideoProject`.
- Clarified that the current MiniMax-backed one-shot `POST /api/generate`
  path is a usable v1 shortcut, not the permanent generation architecture.
- Reframed TTS voiceover as part of the main generated-video pipeline because
  real narration duration should drive template parameter generation.
- Kept the durable product model unchanged:
  one primary `templateId` per `VideoSegment`, with template-specific
  `implementation`.
- Updated roadmap direction so media layers remain important later, but do not
  precede the TTS-first generation pipeline unless a task explicitly widens
  into existing-media compositing.

## 2026-06-08 continuation — media layer MVP implementation plan

- Tightened `docs/MEDIA_LAYERS.md` from a broad model into a bounded first
  implementation plan.
- Defined the first media slice as project-level only:
  `VideoProject.media.layers[]`, required `startFrame` and
  `durationInFrames`, `sourceType: "public" | "remote"`, no uploads, no
  generated assets, no waveform UI, no keyframes, and no segment-level media.
- Documented the shared Remotion runtime entry:
  `ProjectMediaLayers` filters/sorts layers, `MediaLayerSequence` owns the
  single `<Sequence>` wrapper, `RenderMediaLayer` switches on
  color/image/video/audio, and helper modules resolve sources/styles.
- Recorded the implementation order: schema and normalization first, then
  source/style helpers, renderer pieces, `ProjectVideo` integration, sample
  layers, compact editor, and finally MiniMax preservation/omit behavior.
- Added validation expectations for Docker-first lint/typecheck/build and a
  render smoke test covering background, audio, foreground, and existing
  template-rendered segment output.

## 2026-06-08 continuation — external Remotion reference notes

- Added `docs/EXTERNAL_REMOTION_REFERENCES.md` to preserve the takeaways from
  Clippkit and `remotion-dev/trailer`.
- Recorded Clippkit as a component-library / primitive-catalog reference:
  useful for categorized local primitives, catalog review, source metadata,
  and shadcn-style local ownership, but not as provider-facing template ids.
- Recorded Remotion's trailer project as a finished-video narrative reference:
  useful for scene naming, product-trailer structure, timing, code/demo beats,
  and future `product-intro` / `launch-trailer` template inspiration, but not
  as a direct template import.
- Linked the new reference note from `docs/PRODUCT_ARCHITECTURE.md` and
  `docs/REMOTION_COMPONENT_LIBRARY.md`.

## 2026-06-08 continuation — unified media layer planning boundary

- Reviewed the current `VideoProject` preview/export path before adding media
  layers: page state, `POST /api/render`, `renderProjectVideo()`, and the
  Remotion `ProjectVideo` composition all share the same normalized project
  payload.
- Confirmed current audio support is only a scripted-template internal hook:
  `VideoSpec.scenes[].voiceover` renders via `<Audio>` inside
  `ScriptedVideo`, but it is not a project-level or cross-template audio
  track model.
- Replaced the separate `baseLayer` / `audio.tracks` planning split with a
  unified media layer model in `docs/MEDIA_LAYERS.md`: optional project-level
  `media.layers[]` for image, video, audio, and color layers; later
  segment-level media layers only if needed.
- Reframed `baseLayer` as a media-layer role (`role: "base"` /
  `placement: "background"`) instead of a separate schema field.
- Kept the existing product model unchanged: media layers are timeline/media
  data on the project or segment boundary, not additional templates inside a
  segment.

## 2026-06-08 continuation — complete RVE primitive catalog intake

- Started a stable intake path for React Video Editor's Remotion template
  library by treating upstream "templates" as local Remotion primitive
  candidates, not as registered `VideoSegment` templates.
- Pulled the upstream source at commit
  `6209b724798e48ff395f8df1a6fa2d26082372b5` for reference and ported all 81
  upstream components into local primitive directories:
  - charts/data -> `src/remotion/primitives/charts/`
  - text -> `src/remotion/primitives/text/`
  - content / intro / outro blocks -> `src/remotion/primitives/scenes/`
  - backgrounds -> `src/remotion/primitives/backgrounds/`
  - cinematic effects -> `src/remotion/primitives/cinematic/`
  - transitions -> `src/remotion/primitives/transitions/`
  - logo/branding -> `src/remotion/primitives/logos/`
  - image/media layouts -> `src/remotion/primitives/media/`
- Expanded `src/remotion/catalog/primitive-catalog.ts` into the complete local
  primitive metadata source, including upstream source file, commit, license,
  category, component name, status, and review duration.
- Added `/primitives` as a browser-based visual catalog page with a Remotion
  Player preview and selectable primitive list, so migrated primitives can be
  reviewed without editing Studio input props or registering every primitive
  as a Studio composition.
- Kept Remotion Studio focused on full-video and template-level compositions;
  primitive browsing now goes through the app catalog page rather than the
  Studio composition list.
- Replaced the few upstream render-critical CSS animations/transitions with
  frame-driven Remotion logic during intake (`KenBurns`, `ParallaxPan`,
  `ZoomPulse`, `FloatingBubbleText`) and removed transient CSS transitions in
  migrated primitives.
- Kept this as a primitive-library pilot only. None of the RVE components were
  added to `src/templates/registered-definitions.ts` or exposed directly to
  the generation provider.

## 2026-06-08 continuation — OGL metaballs primitive showcase

- Added an OGL/WebGL `MetaBallsPrimitive` under
  `src/remotion/primitives/backgrounds/` as a reusable Remotion background
  primitive, driven by `useCurrentFrame()` / Remotion frame state rather than
  CSS animation, browser animation loops, or `performance.now()`.
- Added a `MetaBallsDemo` Remotion Studio composition for reviewing the
  primitive on port 3001 without promoting it into the product template
  registry.
- Added `CursorKeyframeTrack` playback helpers under
  `src/remotion/primitives/interaction/` so future mouse/path-driven
  primitives can consume normalized deterministic tracks when a template has a
  concrete need for that data.
- Kept browser-side mouse recording out of the current product flow. Cursor
  tracks remain a low-level primitive input, not a `VideoProject`,
  `VideoSegment`, or registered-template schema field.
- Updated `docs/REMOTION_PRIMITIVES.md` to document the new primitive,
  Studio showcase status, and the product boundary around cursor recording.

## 2026-06-08 continuation — Remotion component library terminology

- Defined how external Remotion "template" libraries should map into this
  product:
  - external "templates" are component / primitive candidates by default
  - `ai-video-studio` templates remain segment-level primary implementation
    mechanisms selected by `templateId`
  - text effects, charts, transitions, logo reveals, backgrounds, lower
    thirds, and media layouts should normally live under `src/remotion/`
    rather than `src/templates/`
- Added `docs/REMOTION_COMPONENT_LIBRARY.md` to document component-library
  intake, directory roles, catalog shape, promotion path, implementation
  rules, and external reference policy.
- Updated product and template architecture docs so future RVE-style imports
  do not blur primitive/component terminology with registered product
  templates.

## 2026-06-07 continuation — product architecture wording alignment

- Clarified the current target architecture in `docs/PRODUCT_ARCHITECTURE.md`:
  LLM receives registered template descriptions and usage guidance, selects
  one primary template per segment, and emits schema-valid implementation
  parameters instead of generating Remotion source code.
- Clarified that multiple reusable Remotion components can compose each
  template internally while preserving the one-primary-template-per-segment
  product model.
- Clarified directory intent:
  - `src/components/` is product-page UI, not reusable Remotion video
    primitives.
  - future template-reusable Remotion scenes, elements, transitions, media
    helpers, and layout primitives should live under `src/remotion/` runtime
    folders such as `src/remotion/primitives/`.
- Updated `docs/TEMPLATE_ARCHITECTURE.md` and
  `docs/PRODUCT_REQUIREMENTS.md` so provider template selection is explicitly
  driven by template descriptions, capabilities, usage scenarios, constraints,
  and schema-valid parameters.
- Started the matching source layout iteration:
  - moved page-level reusable UI files under `src/components/ui/`
  - added `src/remotion/primitives/` for template-reusable Remotion video
    scenes, elements, and transition helpers
  - refactored current scripted and spotlight renderers to consume the first
    shared primitives while keeping their template implementations unchanged
- Added `docs/REMOTION_PRIMITIVES.md` so each reusable Remotion primitive has
  a documented visual effect, props summary, current usage, and intended reuse
  pattern.
- Added a `scripted` block-contract pilot:
  - `src/templates/scripted/blocks.ts` records title / bullets / quote
    semantic blocks, AI-visible fields, visual effects, use cases, and
    primitive mappings without importing React or Remotion
  - `src/templates/scripted/block-renderers.tsx` maps validated scene fields
    to Remotion primitives at runtime
  - `src/remotion/ScriptedVideo/SceneRenderer.tsx` now delegates scene content
    rendering through the scripted block renderer while keeping the existing
    `VideoSpec.scenes` contract unchanged
- Updated architecture docs to explain the AI-assisted development rule:
  primitives stay visual, block contracts bridge semantics, and template
  schemas remain the provider-visible parameter contract.

## 2026-06-07 continuation — registry source consolidation and render warmup

- Consolidated template registration sources so future templates require less
  repeated center-file wiring:
  - `src/templates/registered-definitions.ts` is now the server-safe list of
    template definitions.
  - `src/templates/registry.ts` derives `TemplateId`, template lookup maps,
    registered ids, Zod segment schema variants, and MiniMax JSON schema
    fragments from the server-safe definition list.
  - `src/templates/registered-bundles.ts` is now the runtime list of template
    bundles.
  - `src/templates/component-registry.tsx` derives runtime adapters from the
    bundle list and has a type-level coverage check so each registered
    `TemplateId` must have runtime wiring.
  - `src/templates/ids.ts` now only owns literal template id constants.
- Updated `docs/TEMPLATE_ARCHITECTURE.md` so the add-template workflow points
  to `registered-definitions.ts` and `registered-bundles.ts` instead of
  editing the derived registries directly.
- Added `scripts/ensure-remotion-browser.mjs` and
  `npm run remotion:ensure-browser` to prepare Remotion's Chrome Headless
  Shell dependency before runtime use.
- Updated Docker `web`, `studio`, and `render` service commands to run the
  browser preflight after dependency install and before starting Next,
  Remotion Studio, or the sample render path.
- Verified the current `web` container starts with the Remotion browser
  preflight and then Next dev; the app responded with HTTP 200 after restart.
- Docker-first validation passed:
  - container `npm run remotion:ensure-browser`
  - container `npm run lint`
  - container `npx tsc --noEmit`
  - container `npm run build`
  - `git diff --check`

## 2026-06-07 continuation — repo-local Remotion skill guidance

- Installed the Remotion best-practices skill into
  `.agents/skills/remotion-best-practices/` and recorded it in
  `skills-lock.json` so agents in this repository share the same rendering
  guidance.
- Updated `AGENTS.md` and `docs/TEMPLATE_ARCHITECTURE.md` to treat the skill as
  the repo-local Remotion rendering guide.
- Clarified that templates may internally compose reusable parameterized React
  animation components, scenes, blocks, transitions, media helpers, and layout
  primitives while preserving one primary template per segment.
- Clarified that Remotion motion should stay deterministic and frame-driven
  with Remotion APIs, not CSS animations, CSS transitions, or Tailwind
  animation utilities.

## 2026-06-07 continuation — template module architecture

- Refactored the two-template implementation from a monolithic
  `src/lib/template-registry.ts` into cohesive template modules under
  `src/templates/`.
- Added a shared `createTemplateSegmentSchema()` helper so future templates do
  not repeat the segment base shape.
- Added `defineTemplateBundle()` and per-template `index.ts` bundle exports to
  bind each template's server-safe definition and runtime adapter at the module
  boundary.
- Added structured template capabilities (`bestFor`, `textDensity`,
  recommended duration, media/baseLayer support) and included them in the
  template selection prompt.
- Added a server-safe template metadata registry:
  - template ids, labels, Zod segment schemas, MiniMax JSON Schema fragments,
    duration helpers, prompt snippets, and revision payload builders live in
    template definitions.
  - API/generation/schema code can consume template metadata without importing
    React or Remotion runtime components.
- Added a separate runtime component registry for client/video rendering:
  - template-specific Remotion renderers and editor fields are registered in
    `src/templates/component-registry.tsx`.
  - template-specific runtime adapters live in each template module
    (`src/templates/<template>/runtime.tsx`) so casts and renderer/editor
    wiring stay close to the template implementation.
  - `SegmentEditor` now renders template-specific fields through the registry
    instead of hard-coding `scripted` vs `spotlight` branches.
  - `ProjectVideo` continues to render one primary template per segment, but
    the concrete renderer is resolved through the runtime registry.
- Kept the current `VideoProject` contract and one-primary-template-per-segment
  model unchanged.
- Added `docs/TEMPLATE_ARCHITECTURE.md` to document the module shape,
  bundle shape, registries, add-template workflow, capabilities, and
  server/runtime import boundaries.
- Docker-first validation passed:
  - container `npm run lint`
  - container `npx tsc --noEmit`
  - container `npm run build`

## 2026-06-07 continuation — MiniMax multi-template parser hardening

- Investigated Docker logs after a `POST /api/generate 500`.
- Confirmed the hydration mismatch warnings in the log are caused by a browser
  extension adding `trancy-*` attributes to `<html>` and are unrelated to
  generation.
- Hardened MiniMax structural-field recovery for the new `spotlight`
  implementation by adding `callouts` to the parser's stringified structural
  field allowlist. This covers cases where MiniMax returns spotlight callouts
  as a JSON string instead of an array.
- Added bounded `/api/generate` error logging so future Docker logs include
  the generation failure status and message instead of only showing a bare 500.
- Docker-first validation passed:
  - container `npm run lint`
  - container `npx tsc --noEmit`
  - container `npm run build`
  - `git diff --check`
- Container API smoke passed with a 3-segment mixed-template project:
  `spotlight + scripted + spotlight`.

## 2026-06-06 continuation — first multi-template generation slice

- Opened the generation/render contract from scripted-only to a two-template
  segment union:
  - `scripted`: existing `VideoSpec` implementation with internal `scenes`
  - `spotlight`: new focused-card implementation for hooks, key messages,
    recaps, metrics, transitions, and calls to action
- Refactored the multi-template path into registries instead of scattered
  hard-coded switches:
  - `src/lib/template-registry.ts` owns template ids, labels, Zod segment
    schemas, MiniMax JSON Schema fragments, duration helpers, and prompt
    snippets.
  - `src/remotion/template-component-registry.tsx` owns templateId → Remotion
    component rendering.
- Added `src/lib/spotlight-schema.ts` and
  `src/remotion/SpotlightVideo/SpotlightVideo.tsx`.
- Updated `VideoProject` normalization, duration calculation, and
  `ProjectVideo` rendering to support `templateId: "scripted" | "spotlight"`
  while preserving one primary template per segment.
- Updated the MiniMax prompt and forced `emit_result` tool JSON schema so the
  provider can choose either template per segment and still return a complete
  schema-validated `VideoProject`.
- Updated the segment editor so scripted segments keep scene-level editing,
  while spotlight segments expose their template-specific fields
  (`headline`, `subheadline`, `callouts`, `durationInFrames`, theme).

Validation note:
- `git diff --check` passed.
- Docker-first validation is the correct path on this workstation. Host
  `node_modules` may be incomplete or owned by another user and should not be
  used as the default validation target.
- Container `npm run lint` passed.
- Container `npx tsc --noEmit` passed.
- Container `npm run build` passed (Next.js 16.2.3 Turbopack, 7/7 static
  pages).

## 2026-06-06 continuation — docs aligned to current MiniMax implementation

- Updated [`docs/providers/minimax.md`](providers/minimax.md) from an early
  provider design draft into the current implementation reference.
- Corrected MiniMax verification docs to reflect the project runtime:
  Docker-first via `./scripts/dev.sh`; repo-local npm commands are only static
  validation helpers when Docker is not part of the task.
- The document now matches the shipped tool-calling path:
  - `src/lib/minimax/*` implementation files, not the old proposed
    `src/lib/providers/*` shape
  - forced single `emit_result` tool call
  - `max_tokens=8192`
  - no `response_format=json_object` on the tool-calling path
  - Path 1-4 parser recovery for observed MiniMax argument shapes
  - full non-target segment implementation payload in segment revise mode
  - explicit 400 / 500 / 502 error boundaries with no silent mock fallback

Practical next step:
- choose the next small bounded product/code increment. Best candidates:
  1. clarify the existing top brief action as whole-project generation /
     regeneration when useful; the underlying `mode=project` path already
     replaces the current project
  2. add minimal render progress UX beyond idle/rendering/success/failure
  3. start `baseLayer` modeling only if the task explicitly widens into media
     underlays

## 2026-06-06 continuation — removed deprecated generate spec field

- Removed the deprecated `spec` compatibility field from
  `POST /api/generate`.
- The route now returns `{ project }` only for both full-project generation and
  segment regeneration.
- Confirmed there were no in-repo `data.spec` consumers before removal.

## T2-narrow patch (this iteration)

Carved down from the broader T2 milestone: the in-scope change here is **only**
the tool-calling main path + Zod strict validation + `max_tokens=8192` (plus
the `finish_reason=length` guard). All decisions are inherited from the T1
research probe (`docs/providers/minimax-tool-calling.md`) and are not
re-debated here.

Scope (per `t_2f241ef2`):
- only files touched: `src/lib/minimax/{provider,parse-project,prompts,index,tool-schema}.ts`,
  `src/app/api/generate/route.ts` (only the provider-error classification regex),
  this doc.
- explicit no-touch: `src/lib/project-schema.ts`, `src/lib/video-schema.ts`,
  `src/app/page.tsx`, the render/export chain, any multi-provider abstraction,
  Hermes/wrapper config, the `responses` API path, and any code path that
  would echo `MINIMAX_API_KEY`.

Decisions (locked by T1):
- model: `MiniMax-M2.7-highspeed` (T1: 5/5 full-field coverage at ~21s P50 with the
  v2 deep-recursive schema; M3 is 2-4× slower with no quality gain on the
  probed brief set). Override via `MINIMAX_MODEL` env only.
- transport: self-`fetch` to `https://api.minimaxi.com/v1/text/chatcompletion_v2`.
  No OpenAI SDK dependency. No streaming.
- tool schema: **single** `emit_result` function tool with a deep-recursive
  JSON Schema (see `src/lib/minimax/tool-schema.ts`). `tool_choice` is forced
  to `{ type: "function", function: { name: "emit_result" } }`. Dual-tool
  routing and top-level-only schema are rejected by the T1 probe.
- `max_tokens`: **8192**. T1 §6 showed 3-segment briefs at 4096 hit
  `finish_reason=length` on 1/4 calls; 8192 is 0/4 truncations across the
  probed set.
- `response_format=json_object` is **not** sent on the tool-calling path.
  It is redundant when `tools` is present (both force JSON; sending both is
  noise) and is the kind of dual-forcing that triggers the M2.7
  double-encoding regression observed on 2026-06-02.
- `finish_reason=length` is part of the contract: the provider throws
  (`"MiniMax response truncated by max_tokens ..."`) and the route surfaces
  it as **502** via the `UPSTREAM_ERROR_PATTERN` regex. No silent mock
  fallback — `MINIMAX_API_KEY` missing also surfaces as **500** with the
  explicit `MINIMAX_API_KEY is not configured` message.

What the route does:
- `POST /api/generate` with `mode=project` → `minimaxGenerateProject()` →
  build prompt → `callMinimaxChat()` → first `tool_calls[0].function.arguments`
  string → `parseToolCallArguments()` → Zod `videoProjectSchema.safeParse`
  → `VideoProject` JSON.
- `mode=segment` mirrors the same chain through `minimaxReviseSegment()`.
  The model is instructed to return the **full** project with non-target
  segments byte-identical; the parser still gates it through Zod.
- Errors classify by the message: `MinimaxConfigError` → 500 (config
  problem); messages matching `UPSTREAM_ERROR_PATTERN` (network/non-JSON
  upstream/parse failures/no tool calls/wrong tool/empty args/length
  truncation) → 502; everything else (including Zod schema rejection) → 500.

Local error-path verification (no live API needed — `scripts-tmp-t2-smoke.mjs`):
1. `MINIMAX_API_KEY` unset → `MinimaxConfigError` → 500.
2. `parseAndValidateProject` non-JSON input → `MiniMax response was not
   valid JSON` → 502.
3. `parseAndValidateProject` valid JSON but wrong shape → Zod rejection →
   500 (schema is a contract problem, not upstream).
4. `parseToolCallArguments` non-JSON `arguments` string → 502.
5. `parseToolCallArguments` valid JSON but wrong shape → 500.

All 5 paths classified as expected (`PASS` × 5 in the smoke run).

Live smoke (1× mode=project, real `MINIMAX_API_KEY`, brief: "Create a
2-segment video about a kitchen knife forging workflow: heat, hammer,
polish."):
- elapsed 42.3 s end-to-end
- returned 2 segments, 6 scenes total (3 per segment)
- `meta = { title: "Forging a Kitchen Knife", fps: 30, width: 1280, height: 720 }`
- `segment[0].id = "segment-1"`, `templateId = "scripted"`
- `segment[0].implementation.scenes[0].type = "title"` (discriminator
  present, M2.7 deep-recursion regression not triggered)
- `brief` round-trips as a plain string (no double-encoding)
- `finish_reason` ≠ `length` (no truncation; `max_tokens=8192` budget held)

Validation trio:
- `npm run lint` → exit 0
- `npx tsc --noEmit` → exit 0
- `npm run build` → exit 0 (Next.js 16.2.3 Turbopack, 7/7 static pages)

## Latest iteration — MiniMax provider wiring (T2 milestone)

- `POST /api/generate` now calls `https://api.minimaxi.com/v1/text/chatcompletion_v2` for both `mode=project` and `mode=segment`.
- Implementation lives under `src/lib/minimax/` (provider client + prompt templates + strict parser + a tiny `index.ts` facade) and is documented in [`docs/providers/minimax.md`](providers/minimax.md).
- Key decisions:
  - config is read centrally in `readMinimaxConfig()`; `MINIMAX_API_KEY` missing → throws `MinimaxConfigError` → route returns **500** with the explicit message (no silent mock fallback).
  - other failures are classified by a regex over the thrown message and surface as 502 (network/upstream/parse) or 500 (schema validation).
  - strict parse: JSON fence strip → `JSON.parse` → `videoProjectSchema.safeParse`, errors carry the first 200 chars of raw text for diagnosis.
  - `MINIMAX_MODEL` / `MINIMAX_BASE_URL` default to `MiniMax-M2.7-highspeed` / `https://api.minimaxi.com/v1`; model name is never hard-coded in source.
  - `src/lib/project-generation.ts` is marked test-only and no longer imported by the route.
- New env keys documented in `.env.example`; full MiniMax section in `README.md`.
- Validation: `npm run lint`, `npx tsc --noEmit`, `npm run build` all pass. Missing-key 500 path verified with `tsx` invocation of `readMinimaxConfig()`.

## Tool calling — T3 live review resolved (2026-06-02 → stabilized)

- T2 wired the v2 deep-recursive `emit_result` tool + `tool_choice: {type:"function", function:{name:"emit_result"}}` + `max_tokens=8192` per T1 §5; `response_format: json_object` was dropped as redundant.
- T3 independent live verification (4 runs against the real `MINIMAX_API_KEY`; brief set different from T1/T2's) recorded in [`docs/providers/minimax-tool-calling-review.md`](providers/minimax-tool-calling-review.md).
- Follow-up fixes (parseToolCallArguments Path 4 + buildSegmentPrompt full non-target feed) landed and have been merged. The default `MINIMAX_MODEL = MiniMax-M2.7-highspeed` is the accepted production configuration.

## Current stage

`ai-video-studio` now has a closed local v1 authoring loop for the one-primary-template-per-segment workflow.

Current product direction:
- `VideoProject` remains the top-level generation / preview / render boundary.
- `VideoSegment` remains the user-facing editing and regeneration unit.
- Each segment should have one primary template.
- `templateId` determines the schema of `implementation`.
- `implementation` is template-specific; current `scripted` implementations use `VideoSpec`.
- `VideoSpec.scenes` is specific to the current `scripted` template, not a universal field for all future templates.
- The final generation target is documented in
  `docs/FINAL_PRODUCT_GOAL.md`: planner -> TTS -> selected-template compiler
  -> assembled `VideoProject`.
- Future existing video, image, audio, or color inputs should be modeled as
  project-level or segment-level `media.layers[]` data, not as extra
  templates inside the segment.
- The old `baseLayer` idea is a media-layer role, not a separate product
  field.

Current working flow:
1. user writes a brief
2. page calls `POST /api/generate`
3. API returns schema-validated `VideoProject`
4. page hydrates project-level editable state
5. assembled full-video preview renders the normalized project
6. user selects a segment and edits / regenerates only that segment
7. user clicks local export to render the current edited `VideoProject`
8. server writes both:
   - stable artifact: `out/renders/latest.mp4`
   - unique artifact for this render: `out/renders/render-<timestamp>-<id>.mp4`
9. UI returns render state plus both download entries:
   - stable: `GET /api/render/latest`
   - unique: `GET /api/render/[renderId]`

## What is already implemented

### Product workflow UI
- `src/app/page.tsx` uses project-level state instead of single `VideoSpec` state
- Chinese-first main page copy for the current studio path
- brief input + generate button
- loading state + error state
- primary full-video preview using `ProjectVideo`
- visible segment list for navigation
- selected-segment editing shell
- structured scene/theme editing preserved within the selected segment
- working segment regeneration action from the revision prompt
- local render/export controls for the current edited project
- render success state now exposes both the stable latest artifact and the unique artifact for that render

### Structured generation boundary
- `src/app/api/generate/route.ts`
- supports two request modes:
  - full project generation from brief
  - selected segment regeneration from current project + segment id + revision prompt
- returns schema-validated `VideoProject` JSON
- **current implementation is MiniMax (`https://api.minimaxi.com/v1/text/chatcompletion_v2`) backed** — see [`docs/providers/minimax.md`](providers/minimax.md)
- the local deterministic mock in `src/lib/project-generation.ts` is now **test-only** and is no longer imported by the route; missing `MINIMAX_API_KEY` surfaces as a 500 with an explicit message, never a silent fallback
- `/api/generate` returns `project` only; the old deprecated `spec`
  compatibility field has been removed

### Local render/export boundary
- `src/app/api/render/route.ts` accepts the normalized current `VideoProject` and performs local Remotion render
- `src/lib/render-project.ts` renders `ProjectVideo`, creates a unique render artifact, and refreshes `latest.mp4`
- `src/app/api/render/latest/route.ts` serves the stable latest artifact
- `src/app/api/render/[renderId]/route.ts` serves the unique artifact for one successful export
- `src/helpers/use-rendering.ts` resets stale render attempts safely so the UI does not stay stuck in `rendering`

### Video runtime wiring
- `src/remotion/ProjectVideo/ProjectVideo.tsx` sequences project segments into one assembled composition
- `src/lib/template-registry.ts` registers template ids, labels, schemas,
  MiniMax schema fragments, duration helpers, prompt snippets, and revision
  payload builders
- `src/remotion/template-component-registry.tsx` maps registered `templateId`
  values to Remotion components
- `src/remotion/Root.tsx` registers both `ProjectVideo` and legacy `ScriptedVideo`
- `src/remotion/ScriptedVideo/*` remains the segment implementation path for
  the `scripted` template
- `src/remotion/SpotlightVideo/*` is the segment implementation path for the
  `spotlight` template
- preview duration / fps / width / height are derived from the project metadata and segment helpers
- Remotion text rendering now prefers a CJK-capable sans stack for Chinese-first content

### Docker/runtime support
- `Dockerfile` installs `fonts-noto-cjk` and `fonts-noto-cjk-extra` in addition to the existing browser/render dependencies
- `scripts/render.sh` still targets the default/sample composition render path
- current edited-project export path is the page action / `POST /api/render`, not `scripts/render.sh`

## What is intentionally NOT done yet

These are still out of scope or not implemented yet:
- full-project regeneration UX beyond the current initial generate flow
- staged storyboard-plan -> TTS -> segment-compiler generation pipeline
- generated TTS audio assets and duration-aware template compilation
- render job progress UX for end users
- cancellation/progress history for finished renders
- ~~real LLM/provider-backed generation~~ **shipped** (MiniMax; see [`docs/providers/minimax.md`](providers/minimax.md))
- project persistence / saved drafts / history
- multi-template-per-segment orchestration
- project-level / segment-level media-layer compositing
- browser automation acceptance

## Validation status

Latest Docker-first validation after the multi-template registry + parser hardening pass:
- container `npm run lint`
- container `npx tsc --noEmit`
- container `npm run build`
- `git diff --check`
- container API smoke returned a 3-segment mixed-template project:
  `spotlight + scripted + spotlight`

Latest Docker dev verification after the LAN-access + studio recovery pass:
- `docker logs ai-video-studio-web-1` confirmed the prior HMR failure was `allowedDevOrigins` blocking `192.168.50.6`
- `next.config.js` now allows both `192.168.31.6` and `192.168.50.6`
- `docker logs ai-video-studio-studio-1` confirmed the prior blank-page path came from a stale image/container missing browser shared libs (`libnspr4.so`) even though the repo Dockerfile already declared them
- `docker compose build web studio` rebuilt `ai-video-studio:local` from the current Dockerfile
- `docker compose up -d --force-recreate web studio` recreated both services
- `curl http://127.0.0.1:3000/` returned `200`
- `curl http://127.0.0.1:3001/` returned `200`
- `curl http://192.168.50.6:3000/` returned `200`
- `curl http://192.168.50.6:3001/` returned `200`
- `http://192.168.50.6:3001/bundle.js.map` now exposes 928 bundled sources (previous bad runtime-only bundle state is gone)

## Important files for the current stage

- `src/app/page.tsx`
- `src/app/api/generate/route.ts`
- `src/app/api/render/route.ts`
- `src/app/api/render/latest/route.ts`
- `src/app/api/render/[renderId]/route.ts`
- `src/helpers/use-rendering.ts`
- `src/lib/render-project.ts`
- `src/lib/project-schema.ts`
- `src/lib/template-registry.ts`
- `src/lib/spotlight-schema.ts`
- `src/lib/project-generation.ts`
- `src/remotion/ProjectVideo/ProjectVideo.tsx`
- `src/remotion/template-component-registry.tsx`
- `src/remotion/ScriptedVideo/SceneRenderer.tsx`
- `src/remotion/SpotlightVideo/SpotlightVideo.tsx`
- `src/components/project/SegmentList.tsx`
- `src/components/project/SegmentEditor.tsx`
- `src/components/RenderControls.tsx`
- `docs/FINAL_PRODUCT_GOAL.md`
- `docs/PRODUCT_REQUIREMENTS.md`
- `docs/FUTURE_DIRECTION_NOTES.md`
- `docs/plans/2026-05-29-v1-segment-first-orchestrator.md`

## Recommended next milestone

- ~~replace the local deterministic `POST /api/generate` mock with a real provider-backed generation path while preserving schema validation and the project-level edit loop~~ **shipped** (MiniMax; see [`docs/providers/minimax.md`](providers/minimax.md)).

Suggested next focus, in order:
1. define and validate `StoryboardPlan` / `StoryboardSegmentPlan`
2. derive a compact planner template manifest from registered template
   definitions
3. add TTS voiceover generation for planned segment narration
4. capture generated audio duration and metadata
5. compile the selected template's `implementation` from narration, audio
   duration, visual brief, and template-specific schema/rules
6. assemble compiled segments into the existing `VideoProject` preview/export
   boundary
7. keep the next work bounded unless a task explicitly asks for
   persistence/history, generic media-layer compositing, or
   multi-template-per-segment orchestration

## Notes for future Hermes/Codex work

- Keep `VideoProject` as the top-level page/generation/preview/render boundary for this phase.
- Treat `docs/FINAL_PRODUCT_GOAL.md` as the authoritative final target and
  roadmap source.
- Treat the current one-shot MiniMax generation path as a shipped v1 shortcut,
  not the final generation architecture.
- Move future generation work toward storyboard planning, per-segment TTS,
  duration-aware selected-template compilation, and final `VideoProject`
  assembly.
- Keep `VideoSpec` as the per-segment implementation contract for the current scripted template.
- Keep `SpotlightSpec` as the per-segment implementation contract for the current spotlight template.
- Keep one primary template per segment; grow segment expressiveness through template-specific implementation fields first.
- Treat `scenes` as a `scripted` implementation detail, not as a universal product-level concept.
- Treat `callouts` as a `spotlight` implementation detail, not as a universal
  product-level concept.
- Model future existing video/image/audio/color material as project-level or
  segment-level `media.layers[]` data.
- Treat `baseLayer` as a media-layer role, not a separate product field.
- Do not widen scope into multi-template-per-segment support unless a concrete workflow proves that scene/component composition is insufficient.
- `/api/generate` now returns `{ project }` only; do not reintroduce the old
  `spec` compatibility field unless a concrete external caller requires it.
- Prefer Docker-first artifacts and validation on this workstation.
- On this workstation, browser automation is not the default validation path.
