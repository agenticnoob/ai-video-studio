# AI Video Studio Agent Notes

Use this file as the first-stop workflow note when starting a new task in this repo.

## Start here

Before planning or editing, read these files in order:
1. `docs/FINAL_PRODUCT_GOAL.md`
2. `docs/ITERATION_STATUS.md`
3. `docs/PRODUCT_REQUIREMENTS.md`
4. `docs/FUTURE_DIRECTION_NOTES.md`
5. `docs/HANDOFF_F5_TTS_CAPTIONS.md` when the task involves F5-TTS,
   captions/subtitles, or narration provider work
6. `docs/providers/f5-tts-service-plan.md` when the task involves the local
   F5-TTS runtime service or Docker service setup
7. `docs/STRUCTURE_REFACTOR_PLAN.md` and
   `docs/HANDOFF_STRUCTURE_REFACTOR.md` when the task is behavior-preserving
   structure cleanup, modularization, or Subagent-Driven refactor work
8. `README.md`

These files together explain:
- authoritative final generation goal
- current implemented stage
- product requirements
- roadmap direction
- deferred scope
- product direction
- F5-TTS / aligned captions handoff when relevant
- F5-TTS runtime service plan when relevant
- structure refactor plan and handoff when relevant
- Docker-first local workflow

Local configuration is now unified around one tracked template and one ignored
local file:
- `.env.example` is the only configuration template.
- `.env` is the local working configuration read by Docker Compose and the
  Next app.
- `.env.local` may still exist for legacy Next.js compatibility, but new setup
  should prefer `.env`.

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
- `src/lib/staged-generation/*` and the MiniMax selected-template compiler
  helpers provide the staged assembly path:
  StoryboardPlan -> per-segment TTS -> selected-template compile -> assembled
  `VideoProject`. Generated narration audio is now owned by
  `VideoSegment.narration.audio`; the current continuation also extends this
  narration boundary to segment-owned captions and the Next-side F5-TTS
  provider adapter.
- `POST /api/generate/staged` is available as the staged endpoint for either a
  brief, an existing `StoryboardPlan`, or one selected segment regeneration.
- The main page now defaults to staged generation; `POST /api/generate` remains
  available as the shipped v1 shortcut and fallback path.
- In staged mode, selected-segment regeneration now regenerates the target
  segment's plan, TTS audio, duration-aware template implementation, and
  segment-owned narration audio while preserving non-target segments.
- Generated TTS assets are attached to `VideoSegment.narration.audio` and
  flattened to the project timeline for preview/export. Project-level
  narration media layers remain supported only as a transitional compatibility
  path for older/current projects.
- Generated TTS assets are served from `/api/tts/assets/...` with byte-range
  support so Remotion Player can seek audio during pause/resume.
- The TTS asset route streams requested byte ranges instead of reading the full
  file into memory, uses immutable artifact caching, and segment-owned
  narration `<Audio>` pauses the Remotion preview timeline while buffering.
- Normalized caption payloads are written beside generated audio artifacts
  under `out/tts/...` as `<audio-name>.captions.json`.
- Page-level F5 voice cloning is exposed for staged generation. Users upload a
  `.wav`, `.mp3`, `.m4a`, or `.aac` reference audio file and provide matching
  reference text; the upload is stored under ignored `out/voice-references/`
  and reused for full-project generation plus selected-segment regeneration
  when `voiceClone.enabled` is true.
- When the F5 runtime has no real alignment data, its fallback caption path
  splits on sentence punctuation, can split on comma punctuation, and merges
  short comma chunks forward for readability.
- Local export rewrites route media URLs to a Next API origin before Remotion
  rendering so `/api/tts/assets/...` audio can be downloaded during export.
- Page generation state is now split out of `src/app/page.tsx` under
  `src/helpers/project-generation/`; `src/helpers/use-project-generation.ts`
  remains a compatibility export, with `GenerationPanel` and `PreviewPanel`
  owning the brief/generation controls and Remotion Player preview sections.
- Staged request validation/error classification lives in
  `src/lib/staged-generation-api.ts`; staged orchestration, one-segment
  narration/compile work, diagnostics, assembly, and selected-segment
  replacement helpers live in `src/lib/staged-generation/*`.
- Bounded planner repair is in place for invalid `StoryboardPlan` output in
  both full-brief and selected-segment staged planner paths.
- Deterministic staged smoke fixtures cover a mixed `scripted` + `spotlight`
  project with segment-owned narration audio/captions and selected-segment
  narration/caption replacement.
  Remotion exposes this fixture as
  `StagedSmokeMixedTemplateProject`, and `npm run smoke:staged-fixtures`
  bundles/loads it through `src/remotion/index.ts`.
- The optional `f5-tts` Docker service is implemented with contract-smoke mode
  and real `F5_TTS_SERVICE_MODE=f5` mode. The GPU overlay has been validated
  locally with the downloaded checkpoint, vocab, and Vocos vocoder under
  `models/f5-tts/`.
- For user-facing F5 narration checks on this workstation, start or refresh the
  real runtime with `scripts/f5-tts-real.sh up` or
  `scripts/f5-tts-real.sh up-build`. Do not use the plain
  `docker-compose.f5.yml` overlay for that path; it defaults to
  `contract-smoke`.
- Real F5 validation has passed direct service smoke, Next `/api/tts` adapter
  smoke, deterministic staged mixed-template smoke, and deterministic staged
  export smoke.
- The F5 Docker overlay mounts `out/voice-references/` read-only into
  `/voice-references` so uploaded voice-clone references are reachable by the
  runtime.

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
brief -> StoryboardPlan -> per-segment narration synthesis
-> audio + aligned captions -> per-segment template compile
-> assembled VideoProject
```

Keep the next iteration focused on:
1. keep `VideoProject` as the preview/edit/export boundary
2. keep the existing StoryboardPlan contract as the planner-stage boundary
3. keep the bounded planner repair path active and visible in diagnostics
4. keep generated narration audio in `VideoSegment.narration.audio`
5. keep segment-owned `VideoSegment.narration.captions` normalization and
   shared caption rendering active
6. keep the optional local F5-TTS runtime service healthy behind the existing
   in-project provider adapter, including contract-smoke and real GPU smoke
   coverage
7. keep narration audio and subtitle/caption cues outside template-specific
   `implementation`
8. use real audio duration plus the selected template context to generate
   schema-valid `implementation`
9. preserve validation, bounded repair, and non-target segment preservation
10. use deterministic smoke fixtures and a full provider-backed
   `POST /api/generate/staged` live smoke to harden mixed registered-template
   output before widening scope
11. do not widen into persistence/history, generic media-layer work, or
   multi-template-per-segment orchestration unless the task explicitly asks for it

Current product modeling decision:
- keep one primary template per `VideoSegment`
- `templateId` determines the schema of `implementation`
- `implementation` is template-specific; current registered templates are
  `scripted` (`VideoSpec`) and `spotlight` (`SpotlightSpec`)
- `VideoSpec.scenes` is specific to the current `scripted` template, not a universal field for all future templates
- treat generated narration/TTS as part of the main generation pipeline, not
  as a generic media-layer feature to solve first
- treat F5-TTS as an in-project provider boundary: runtime may be local service
  or container, but request/response contract, config, artifact handling,
  caption normalization, and fallback behavior belong in this repo
- treat caption/subtitle cues as narration-provider output normalized into
  segment-owned caption data, not as template-private implementation fields
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
- `src/helpers/project-generation/*`
- `src/lib/render-project.ts`
- `src/lib/project-schema.ts`
- `src/lib/project-timeline.ts`
- `src/lib/storyboard-plan-schema.ts`
- `src/lib/narration-asset-schema.ts`
- `src/lib/tts/*`
- `src/app/api/tts/voice-references/route.ts`
- `src/lib/staged-generation/*`
- `src/lib/staged-generation-api.ts`
- `src/lib/staged-project-assembly.ts`
- `docs/providers/f5-tts.md`
- `docs/providers/f5-tts-service-plan.md`
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
  carrier and planned segment-owned caption/subtitle data
- professional subtitle editor, waveform editor, beat sync, ducking, or
  DAW-style audio controls
- planner repair beyond the current bounded planner/compiler repair paths
- browser automation acceptance
- end-user render progress UX beyond idle / rendering / success / failure

Private-team deployment note:
- Heavy generation/export work is protected by process-local concurrency
  limits configured in `.env.example`. The current guard covers staged
  generation, TTS/F5 synthesis, and local render export without introducing a
  database or durable job queue.
- Treat these limits as private Docker deployment protection, not as
  production multi-replica scheduling. Do not expand this into persistent
  queues, project history, multi-tenant auth, or full progress systems unless a
  task explicitly asks for that scope.

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
- Move future generation work toward `StoryboardPlan` -> in-project narration
  synthesis -> audio + aligned captions -> selected-template compile ->
  assembled `VideoProject`.
- Treat F5-TTS as the preferred next narration provider boundary in this repo,
  not as a separate external product. Runtime may be local process/container;
  this repo owns adapter, config, artifacts, caption normalization, and
  fallback behavior.
- Keep caption/subtitle cues outside template-specific `implementation`; store
  them with segment narration data and render them through shared preview/export
  flattening code.
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
