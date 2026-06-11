# AI Video Studio Agent Notes

Use this file as the first-stop workflow note when starting a new task in this repo.

## Start here

Before planning or editing, read these files in order:
1. `docs/FINAL_PRODUCT_GOAL.md`
2. `docs/ITERATION_STATUS.md`
3. `docs/PRODUCT_REQUIREMENTS.md`
4. `docs/FUTURE_DIRECTION_NOTES.md`
5. `README.md`

These files together explain:
- authoritative final generation goal
- current implemented stage
- product requirements
- roadmap direction
- deferred scope
- product direction
- Docker-first local workflow

When editing Remotion rendering code or template-internal animation
components, also consult
`.agents/skills/remotion-best-practices/SKILL.md`. Treat it as the repo-local
Remotion rendering guide.

## Current project stage

`ai-video-studio` already has a usable one-primary-template-per-segment authoring loop:
- user writes a brief
- page defaults to staged generation through `POST /api/generate/staged`
- page can fall back to the shipped one-shot `POST /api/generate` path through
  a generation-mode toggle
- API returns schema-validated `VideoProject`
- page hydrates project-level editable state
- assembled full-video preview renders live
- user can select a segment, edit its fields, and regenerate only that segment
- user can locally export the current edited project through `POST /api/render`
- successful export writes both a stable latest artifact and a unique artifact for that render

The first staged-generation groundwork is also in place:
- `src/lib/storyboard-plan-schema.ts` defines validated `StoryboardPlan` and
  `StoryboardSegmentPlan` contracts.
- `src/templates/registry.ts` derives a compact planner template manifest from
  registered template definitions.
- `src/lib/minimax/prompts.ts`, `src/lib/minimax/tool-schema.ts`,
  `src/lib/minimax/parse-storyboard-plan.ts`, and `src/lib/minimax/index.ts`
  expose an internal MiniMax storyboard-planner facade.
- `src/lib/narration-asset-schema.ts`, `src/lib/tts/*`, `POST /api/tts`, and
  `/api/tts/assets/...` provide the first internal TTS asset boundary for one
  planned segment's narration, including local audio artifacts and measured
  duration.
- `src/lib/staged-project-generation.ts` and the MiniMax selected-template
  compiler helpers provide the first staged assembly path:
  StoryboardPlan -> per-segment TTS -> selected-template compile -> assembled
  `VideoProject`.
- `POST /api/generate/staged` is available as the staged endpoint for either a
  brief, an existing `StoryboardPlan`, or one selected segment regeneration.
- The main page now defaults to staged generation; `POST /api/generate` remains
  available as the shipped v1 shortcut and fallback path.
- In staged mode, selected-segment regeneration now regenerates the target
  segment's plan, TTS audio, duration-aware template implementation, and
  narration audio layer while preserving non-target segments.
- Generated TTS assets are served from `/api/tts/assets/...` with byte-range
  support so Remotion Player can seek audio during pause/resume.
- Local export rewrites route media URLs to a Next API origin before Remotion
  rendering so `/api/tts/assets/...` audio can be downloaded during export.
- Page generation state is now split out of `src/app/page.tsx` into
  `src/helpers/use-project-generation.ts`, with `GenerationPanel` and
  `PreviewPanel` owning the brief/generation controls and Remotion Player
  preview sections.
- Staged request validation/error classification lives in
  `src/lib/staged-generation-api.ts`; staged assembly and narration-layer
  replacement helpers live in `src/lib/staged-project-assembly.ts`.
- Bounded planner repair is in place for invalid `StoryboardPlan` output in
  both full-brief and selected-segment staged planner paths.
- Deterministic staged smoke fixtures cover a mixed `scripted` + `spotlight`
  project, narration layer timeline assembly, and selected-segment narration
  replacement. Remotion exposes this fixture as
  `StagedSmokeMixedTemplateProject`, and `npm run smoke:staged-fixtures`
  bundles/loads it through `src/remotion/index.ts`.

This repo is past the upstream starter-demo stage.
Do not describe it as an untouched scaffold.

The current multi-template direction is implemented as a registered
one-primary-template-per-segment model, not as multiple template instances
inside a segment:
- `src/templates/<template>/` owns each template's schema, server-safe
  definition, structured capabilities, editor fields, runtime adapter, and
  bundle export.
- `src/templates/registry.ts` registers server-safe template metadata for
  schema validation and MiniMax prompt/tool generation.
- `src/templates/component-registry.tsx` registers runtime adapters for page
  editing and Remotion preview rendering.
- `src/lib/template-registry.ts` remains a compatibility re-export.
- currently registered templates:
  - `scripted`: `VideoSpec` implementation with internal `scenes`
  - `spotlight`: focused-card implementation with `headline`,
    `subheadline`, `callouts`, and `durationInFrames`

## Current highest-priority next milestone

The MiniMax-backed v1 generation path is usable for the current stage, and the
validated storyboard-plan contract / compact planner manifest / internal
planner facade are already present. The next product milestone should continue
moving toward the authoritative final generation pipeline in
`docs/FINAL_PRODUCT_GOAL.md`:

```txt
brief -> StoryboardPlan -> per-segment TTS -> per-segment template compile
-> assembled VideoProject
```

Keep the next iteration focused on:
1. keep `VideoProject` as the preview/edit/export boundary
2. keep the existing StoryboardPlan contract as the planner-stage boundary
3. keep the bounded planner repair path active and visible in diagnostics
4. use generated narration audio from per-segment TTS before template
   compilation
5. use real audio duration plus the selected template context to generate
   schema-valid `implementation`
6. preserve validation, bounded repair, and non-target segment preservation
7. use deterministic smoke fixtures and provider-backed live smoke to harden
   mixed registered-template output before widening scope
8. do not widen into persistence/history, generic media-layer work, or
   multi-template-per-segment orchestration unless the task explicitly asks for it

Current product modeling decision:
- keep one primary template per `VideoSegment`
- `templateId` determines the schema of `implementation`
- `implementation` is template-specific; current registered templates are
  `scripted` (`VideoSpec`) and `spotlight` (`SpotlightSpec`)
- `VideoSpec.scenes` is specific to the current `scripted` template, not a universal field for all future templates
- treat generated narration/TTS as part of the main generation pipeline, not
  as a generic media-layer feature to solve first
- model future existing video/image/audio/color material as project-level or
  segment-level `media.layers[]` data; treat `baseLayer` as a layer role, not
  a separate field
- do not model one segment as multiple template instances unless a concrete future workflow proves that is necessary

## Important implementation files

- `src/app/page.tsx`
- `src/components/project/GenerationPanel.tsx`
- `src/components/project/PreviewPanel.tsx`
- `src/app/api/generate/route.ts`
- `src/app/api/render/route.ts`
- `src/app/api/render/latest/route.ts`
- `src/app/api/render/[renderId]/route.ts`
- `src/helpers/use-rendering.ts`
- `src/helpers/use-project-generation.ts`
- `src/lib/render-project.ts`
- `src/lib/project-schema.ts`
- `src/lib/storyboard-plan-schema.ts`
- `src/lib/staged-generation-api.ts`
- `src/lib/staged-project-assembly.ts`
- `src/templates/*`
- `src/templates/registered-definitions.ts`
- `src/templates/registered-bundles.ts`
- `src/templates/registry.ts`
- `src/templates/component-registry.tsx`
- `src/lib/minimax/*`
- `src/lib/project-generation.ts`
- `src/remotion/ProjectVideo/ProjectVideo.tsx`
- `src/remotion/ScriptedVideo/*`
- `src/remotion/Root.tsx`

## Constraints / non-goals for the current product stage

Still not implemented unless the new task explicitly asks for them:
- saved drafts/history/project persistence
- multi-template-per-segment orchestration
- project-level / segment-level media-layer compositing
- broad media-layer editor work beyond the current generated narration audio
  carrier
- planner repair beyond the current bounded planner/compiler repair paths
- browser automation acceptance
- end-user render progress UX beyond idle / rendering / success / failure

## Validation workflow

This project is Docker-first on this workstation. Default to containerized
validation and runtime commands. Do **not** run host `npm install`, host
`npm run lint`, host `npx tsc`, or host `npm run build` unless the user
explicitly asks for host-local validation.

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run check'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run build'
```

Use the Docker wrappers documented in `README.md` for app runtime:

```bash
./scripts/dev.sh
./scripts/studio.sh
./scripts/render.sh
```

The Docker Compose `web` and `studio` services use
`restart: unless-stopped`. Next dev origins include the local LAN origins and
`ez.zzzxc.com`.

The host `node_modules` directory may be absent, incomplete, or owned by a
different user because dependencies are intended to live in the Docker volume.
Treat host dependency errors as irrelevant unless the task is explicitly about
host-local setup.

## Notes for Hermes/Codex/OpenCode

- Keep `VideoProject` as the top-level page/generation/preview/render boundary for this phase.
- Treat `docs/FINAL_PRODUCT_GOAL.md` as the authoritative roadmap source.
- Treat the current one-shot MiniMax project generation path as a shipped v1
  shortcut, not the final generation architecture.
- Move future generation work toward `StoryboardPlan` -> TTS -> selected
  template compile -> assembled `VideoProject`.
- Keep `VideoSpec` as the per-segment implementation contract for the current scripted template.
- Keep `SpotlightSpec` as the per-segment implementation contract for the current spotlight template.
- Keep one primary template per segment; grow template internals through template-specific implementation fields before introducing multi-template-per-segment orchestration.
- Remotion template internals may be composed from reusable parameterized React
  animation components, but keep those components inside the selected primary
  template's `implementation` model rather than modeling them as additional
  segment-level templates.
- Keep Remotion animation frame-driven with `useCurrentFrame()`,
  `interpolate()`, `spring()`, `<Sequence>`, `<Series>`, or Remotion transition
  primitives. Do not use CSS animations, CSS transitions, or Tailwind animation
  utilities for render-critical motion.
- Treat `scenes` as a scripted-template implementation detail.
- Treat future video/image/audio/color overlay or background needs as
  `media.layers[]` modeling work.
- Prefer small bounded edits.
- Prefer Docker-first artifacts and validation on this workstation.
- Browser automation is not the default validation path on this workstation.
- `scripts/render.sh` still targets the sample/default composition render path; the current edited-project export path is the page action / `POST /api/render`.
- For local export, route media such as `/api/tts/assets/...` is resolved
  through `AI_VIDEO_STUDIO_RENDER_ASSET_ORIGIN` when set, otherwise
  `http://127.0.0.1:3000`.
