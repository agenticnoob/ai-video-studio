# Iteration Status

Last updated: F5-TTS GPU real-mode validation

## Latest continuation — F5-TTS GPU real-mode validation

- Added real F5 synthesis mode behind `F5_TTS_SERVICE_MODE=f5` while keeping
  `contract-smoke` as the default service mode.
- Real mode:
  - loads `F5_TTS_MODEL_PATH` and `F5_TTS_VOCAB_PATH` lazily on first
    `/synthesize`
  - defaults to `/models/f5-tts/model_1250000.safetensors`
  - defaults to `/models/f5-tts/vocab.txt`
  - uses `F5_TTS_NFE_STEP` to control inference steps
  - uses request/env reference audio when provided, otherwise attempts the
    package default English reference sample
- Added the `f5-tts` Python package and runtime system dependencies to the
  `services/f5-tts` image.
- Added `docker-compose.f5.gpu.yml` for explicit GPU real-mode startup:
  `F5_TTS_SERVICE_MODE=f5`, `F5_TTS_DEVICE=cuda`, and Docker GPU access.
- Extended env examples and service docs for real-mode paths, device override,
  and reference audio/text configuration.
- Real mode fails explicitly when model/vocab/dependencies/reference data are
  missing; it does not silently fall back to generated smoke audio.
- Fixed real-mode diagnostics so `/synthesize` failures are logged with a
  traceback in the service container.
- Fixed the default reference fallback: the upstream package ships
  `basic_ref_en.wav` but not `basic_ref_en.txt`, so the service now uses the
  upstream example reference text when no custom reference voice is configured.

Current readiness:
- Local model files and the Vocos vocoder are present under `models/f5-tts/`,
  and the service is wired to use them.
- GPU overlay validation confirmed container-side PyTorch can see one
  `NVIDIA GeForce RTX 5060`.
- Direct real F5 smoke passed through
  `F5_TTS_BASE_URL=http://127.0.0.1:7865 scripts/f5-tts-smoke.sh` with
  `mode=f5`, `modelLoaded=true`, WAV output, and fallback caption cues.
- Next provider smoke passed through `scripts/f5-tts-next-smoke.sh`, confirming
  `/api/tts` adapter output, local `out/tts` WAV artifacts, duration probing,
  captions, and `/api/tts/assets/...` byte-range serving.
- Deterministic staged smoke passed through `npm run smoke:f5-staged` using
  real F5 narration for mixed `scripted` + `spotlight` segments.
- Deterministic staged export smoke passed with
  `F5_TTS_STAGED_SMOKE_RENDER=true npm run smoke:f5-staged`; `/api/render`
  produced `render-2026-06-11t15-31-39-590z-483a4f75` with a 2,103,133 byte
  MP4 artifact.
- If a custom local reference voice is needed, mount it under `voices/f5-tts/`
  and set `F5_TTS_DEFAULT_REFERENCE_AUDIO` plus
  `F5_TTS_DEFAULT_REFERENCE_TEXT`.

## Latest continuation — F5-TTS deterministic staged smoke

- Added `scripts/f5-tts-staged-smoke.mjs` and `npm run smoke:f5-staged`.
- The smoke uses a deterministic two-segment `StoryboardPlan` and avoids
  MiniMax planner/compiler calls.
- It generates each segment's narration through `POST /api/tts` with
  `provider: "f5-tts"`, then assembles a schema-compatible `VideoProject` with
  one `scripted` segment and one `spotlight` segment.
- The smoke verifies:
  - each segment receives `VideoSegment.narration.audio.provider = "f5-tts"`
  - each segment receives `VideoSegment.narration.captions`
  - each generated `/api/tts/assets/...` URL serves byte ranges with `206`
  - deterministic template implementations use the measured narration duration
- Optional export validation is available with
  `F5_TTS_STAGED_SMOKE_RENDER=true npm run smoke:f5-staged`.

Current readiness:
- The same deterministic staged smoke now works against both contract-smoke and
  real GPU-backed F5 mode.
- It validates the product-owned narration boundary without MiniMax
  planner/compiler calls and can optionally validate `/api/render`.

## Previous continuation — F5-TTS Next provider smoke

- Added `scripts/f5-tts-next-smoke.sh` to exercise the Next.js-side F5-TTS
  provider adapter through `POST /api/tts`.
- The smoke is intentionally scoped to the narration-provider stage, so it does
  not require MiniMax planner/compiler credentials and does not download a real
  F5 model.
- The smoke confirms:
  - `POST /api/tts` can call the `f5-tts` contract-smoke runtime
  - the Next adapter writes a local `out/tts/...` WAV artifact
  - ffprobe duration probing succeeds
  - response narration has provider `f5-tts`, format `wav`, and caption cues
  - `/api/tts/assets/...` serves the generated artifact with byte-range support
- Updated `docker-compose.f5.yml` so the overlay `web` service depends on the
  optional `f5-tts` service.

Current readiness:
- The repo now has two F5 service checks:
  - `scripts/f5-tts-smoke.sh` validates the runtime HTTP contract directly.
  - `scripts/f5-tts-next-smoke.sh` validates the Next adapter and asset route
    against that runtime.
- This still is not real F5 synthesis; `modelLoaded` remains false in the
  contract-smoke service.
- Full `POST /api/generate/staged` provider-backed smoke still needs MiniMax
  planner/compiler configuration, or a separate deterministic compiler harness.

## Previous continuation — F5-TTS contract-smoke runtime wrapper

- Added the optional `f5-tts` Docker Compose overlay service described by the
  service plan, without downloading or bundling a real F5 model.
- Added `services/f5-tts/`, a small FastAPI HTTP wrapper that exposes:
  - `GET /health`
  - `POST /synthesize`
- The first runtime mode is `contract-smoke`: it returns a generated WAV and
  fallback caption cue so the existing Next-side adapter can verify the HTTP
  contract, local artifact writing, duration probing, and caption
  normalization.
- Added `scripts/f5-tts-smoke.sh` for direct service health/synthesis contract
  checks.
- Added ignored local asset directories for future model checkpoints and
  private reference voices:
  - `models/f5-tts/`
  - `voices/f5-tts/`
- Updated env examples for the optional F5 runtime overlay.

Current readiness:
- The service boundary can be validated without downloading F5 model weights.
- This is not real F5 synthesis yet; `modelLoaded` is false in the smoke
  service.
- The next implementation slice should either wire the wrapper to a real local
  F5 invocation once checkpoints/reference voices are available, or add a
  provider-backed staged smoke using the contract-smoke service to exercise the
  existing Next adapter end to end.

## Latest continuation — F5-TTS runtime service plan

- Added `docs/providers/f5-tts-service-plan.md` as the next implementation
  plan for an opt-in local F5-TTS runtime service.
- Clarified that the current repo already owns the Next.js-side F5 adapter,
  provider selection, local artifact handling, caption normalization,
  fallback captions, and shared preview/export caption rendering.
- Defined the next service boundary:
  - optional Docker Compose service named `f5-tts`
  - stable `/health` and `/synthesize` HTTP contract
  - local model/reference-voice directories outside Git
  - service smoke script and provider-backed staged smoke before declaring the
    runtime integrated
- Kept MiniMax TTS as the working default/fallback while the F5 runtime service
  is not running.

Current readiness:
- Superseded by the latest runtime validation: the F5-TTS runtime service
  described in `docs/providers/f5-tts-service-plan.md` has been created and
  validated.
- Do not restart from caption normalization or provider adapter work; that
  boundary is already in place.

## Latest continuation — F5-TTS provider boundary and segment-owned captions

- Added shared caption normalization and deterministic fallback splitting for
  segment-local `VideoSegment.narration.captions`.
- Updated narration asset conversion so generated captions travel with
  `VideoSegment.narration`, alongside narration text and audio metadata.
- Added shared Remotion caption flattening/rendering for segment-owned captions
  so preview and export consume the same project data.
- Added an F5-TTS adapter under the existing TTS boundary:
  - provider selection through `TTS_PROVIDER` /
    `AI_VIDEO_STUDIO_TTS_PROVIDER`
  - automatic F5 selection when `F5_TTS_BASE_URL` is configured
  - local `out/tts/...` artifact writing and duration measurement
  - provider alignment/caption normalization when returned
  - MiniMax fallback when F5 fails, unless disabled
- Kept MiniMax TTS as the working default when F5 is not configured.
- Updated staged diagnostics and deterministic mixed-template smoke fixtures
  to cover segment-owned caption cues and selected-segment caption replacement.

Current readiness:
- Superseded by the latest runtime validation: the data/render path for
  segment-owned captions is in place, the F5 provider adapter contract is
  owned by the repo, and the optional F5 runtime now has contract-smoke and
  real GPU-backed smoke coverage.

## Latest continuation — segment-owned narration audio implementation

- Added segment-owned narration/caption contracts:
  - `VideoSegment.narration.text`
  - `VideoSegment.narration.audio`
  - `VideoSegment.narration.captions`
- Updated staged full-project generation so generated TTS output is attached to
  the compiled owning segment as `segment.narration.audio`.
- Updated staged selected-segment regeneration so the target segment's
  narration and implementation are replaced together, while non-target segment
  data is preserved.
- Added render-time flattening for segment-owned narration audio through shared
  Remotion project rendering, with export-time route media resolution for
  `segment.narration.audio.src`.
- Kept project-level narration media layers as a transitional compatibility
  path for older/current projects, but they are no longer the primary staged
  narration carrier.
- Updated deterministic mixed-template staged smoke fixtures to assert
  segment-owned narration audio and selected-segment narration replacement.

Current readiness:
- Superseded by the latest F5/captions slice: caption normalization/fallback
  cues, shared caption rendering, and the Next-side F5 provider adapter are
  now in place.
- Superseded by the latest runtime validation: the optional local F5-TTS
  runtime service has been added and validated.

## Previous continuation — segment-owned narration/captions handoff alignment

- Updated the next implementation plan after the timeline-model discussion:
  generated narration audio and caption cues should belong to the owning
  `VideoSegment`, not to top-level `VideoProject.captions` or long-term
  project-level narration media layers.
- New target ownership model:
  - `VideoSegment.narration.text` stores the spoken script
  - `VideoSegment.narration.audio` stores generated audio metadata, provider,
    source URL, and measured duration
  - `VideoSegment.narration.captions` stores segment-local caption cues
  - `VideoProject.media.layers[]` is reserved for true full-video assets such
    as background music, ambience, watermarks, or global overlays
  - future `VideoSegment.media.layers[]` can carry segment-owned non-narration
    media when media editing widens
- Clarified the then-current implementation as transitional:
  - at that point, active staged generation still carried generated narration
    audio through project-level `media.layers[]`
  - selected-segment regeneration retimed those then-current narration layers
  - that plan was later completed for `VideoSegment.narration.audio`; captions
    remain the next model-alignment step
- Rewrote `docs/HANDOFF_F5_TTS_CAPTIONS.md` so the next conversation starts
  from segment-owned narration/captions before adding F5-TTS runtime details.
- Aligned docs and README around this model and removed the superseded early
  implementation plan under `docs/plans/`.

Current readiness:
- Superseded by the latest continuations: `VideoSegment.narration.audio` and
  `VideoSegment.narration.captions` now own generated narration data, and the
  Next-side F5 provider adapter is in place; the optional local F5-TTS runtime
  service has also been added and validated.
- Do not start by adding top-level `VideoProject.captions`.

## Latest continuation — F5-TTS aligned-captions target alignment

- Updated the authoritative target from a plain TTS-first staged path to a
  narration-synthesis path:
  `StoryboardPlan` -> in-project narration provider -> audio + aligned
  captions -> selected-template compiler -> assembled `VideoProject`.
- Added the product decision that F5-TTS should be an in-project provider
  boundary, not a separate product:
  - runtime may be a local process or Docker service
  - this repo owns the provider adapter, config, request/response contract,
    artifact handling, caption normalization, and fallback behavior
- Kept the current implementation status unchanged:
  - active staged generation still uses the existing TTS asset path
  - MiniMax TTS remains the current working provider/fallback
  - F5-TTS provider code, caption schema, caption rendering, and caption-aware
    staged regeneration are not implemented yet
- Added `docs/providers/f5-tts.md` as the handoff target for the next
  implementation slice.
- Validation performed for this documentation slice:
  - `git diff --check`

Current readiness:
- docs now define F5-TTS + aligned captions as the next narration-provider
  direction.
- implementation should start by adding shared caption contracts and an
  in-project F5-TTS provider adapter before changing template internals.

## Latest continuation — deterministic mixed-template staged smoke fixtures

- Added deterministic staged smoke fixtures for the registered template mix:
  - a two-segment `StoryboardPlan` with out-of-order input segments that
    normalizes to `scripted` then `spotlight`
  - fixture narration assets for both segments
  - schema-validated compiled `VideoSegment` objects for both registered
    templates
  - assembled `VideoProject` with project-level narration audio layers
  - selected-segment replacement fixture that verifies the target narration
    layer is regenerated at the correct timeline start while non-target
    segment data is preserved
- Added a Remotion composition, `StagedSmokeMixedTemplateProject`, using the
  fixture project as `defaultProps` so Remotion CLI / Studio can load and
  inspect the mixed-template staged output directly.
- Added `npm run smoke:staged-fixtures`, which lists Remotion compositions and
  bundles the smoke composition through `src/remotion/index.ts`.
- Kept the product model unchanged:
  - `VideoProject` remains the preview/edit/export boundary.
  - one primary `templateId` still determines each segment's
    template-specific `implementation`.
  - narration audio remained template-external project media layer data in
    that slice; the latest target now migrates ownership to
    `VideoSegment.narration`.
- Validation performed for this slice:
  - Docker `npx tsc --noEmit`
  - Docker `npm run lint`
  - Docker `npm run build`
  - Docker `npx remotion compositions src/remotion/index.ts`
  - `git diff --check`

Current readiness:
- the repo now has a deterministic, no-provider smoke artifact for mixed
  registered templates, then-current narration layer timeline assembly, and
  selected segment narration replacement. The latest smoke fixture now asserts
  segment-owned narration audio.

Remaining next slices:
- live multi-segment staged smoke with configured providers
- richer progress UX beyond idle / rendering / success / failure
- persistence/history only after the staged loop is stable

## Previous continuation — bounded storyboard planner repair

- Hardened the active staged planner path without changing the product model:
  - invalid MiniMax `StoryboardPlan` tool-call arguments now throw a dedicated
    `StoryboardPlanParseError` that preserves the rejected raw output.
  - full-project staged planning retries once with bounded repair context when
    planner JSON parsing or `StoryboardPlan` schema validation fails.
  - selected-segment staged regeneration uses the same planner repair path and
    additionally requires the repaired plan to contain exactly one segment
    before the code reassigns the target `segmentId` and `order = 1`.
  - repair prompts include validation errors and the previous invalid planner
    output while keeping the output contract limited to `StoryboardPlan`.
  - staged API diagnostics now expose planner attempts and whether planner
    repair was used for generated-brief and selected-segment paths.
- Kept the product model unchanged:
  - `VideoProject` remains the preview/edit/export boundary.
  - `StoryboardPlan` remains the planner-stage boundary.
  - `templateId` still determines template-specific `implementation`.
  - selected-segment regeneration remains scoped to the target segment plan,
    TTS audio, compiler output, and narration layer replacement.
- Validation performed for this slice:
  - Docker `npx tsc --noEmit`
  - Docker `npm run lint`

Current readiness:
- staged full-project generation and selected-segment regeneration now have
  bounded planner repair before TTS and selected-template compilation.
- invalid planner output fails as a clear upstream generation error after the
  repair attempt instead of silently falling through to unrelated content.

## Previous continuation — project structure cleanup and runtime config alignment

- Performed a behavior-preserving structure cleanup after the staged loop was
  manually validated:
  - `src/app/page.tsx` now acts as the page layout/composition entry instead
    of owning all generation and preview state directly.
  - `src/helpers/use-project-generation.ts` owns brief state, staged/shortcut
    generation, selected-segment regeneration, segment selection, and direct
    segment updates.
  - `src/components/project/GenerationPanel.tsx` owns the brief and generation
    controls.
  - `src/components/project/PreviewPanel.tsx` owns Remotion Player preview
    wiring.
  - `src/lib/staged-generation-api.ts` owns staged generation request schema
    parsing and upstream error status classification.
  - `src/lib/staged-project-assembly.ts` owns staged `VideoProject` assembly,
    ordered plan segment traversal, and target narration layer replacement
    during segment regeneration.
- Kept the product model unchanged:
  - `VideoProject` remains the preview/edit/export boundary.
  - `VideoSegment` remains the selected editing unit.
  - `templateId` still determines template-specific `implementation`.
  - the one-shot `/api/generate` path remains available as a fallback
    shortcut.
- Runtime configuration alignment:
  - Docker `web` and `studio` services now use `restart: unless-stopped` for
    workstation-friendly local runtime behavior.
  - Next dev origins now include `ez.zzzxc.com` in addition to the local LAN
    origins already configured.
- Validation performed for this slice:
  - Docker `npx tsc --noEmit`
  - Docker `npm run lint`
  - Docker `npm run build`
  - `git diff --check`

Current readiness:
- staged full-project generation and staged selected-segment regeneration keep
  the same behavior, but the page, route, and staged pipeline are split into
  smaller ownership units.
- the next implementation slices can now add planner repair, fixtures, and
  progress visibility without further inflating `page.tsx` or the staged API
  route.

## Previous continuation — staged preview, segment regeneration, and export hardening

- Hardened the user-facing staged preview / edit / export loop.
- `POST /api/generate/staged` now supports selected-segment regeneration:
  - `mode: "segment"` accepts the current `VideoProject`, target
    `segmentId`, and `revisionPrompt`
  - MiniMax first replans exactly that segment as a one-segment
    `StoryboardPlan`
  - TTS regenerates the target segment's narration audio
  - the selected-template compiler uses the new real audio duration to produce
    schema-valid target `implementation`
  - the target `VideoSegment` and its narration audio layer are replaced in
    the current project
  - non-target segments and their narration layers are preserved, with
    narration layer `startFrame` values recalculated against the revised
    segment timeline
- The main page routes selected-segment regeneration to
  `POST /api/generate/staged` while staged generation is enabled. The shipped
  one-shot `/api/generate` segment path remains available only when the
  fallback generation mode is selected.
- The legacy `/api/generate` segment path now reattaches existing project media
  layers before returning, preventing old one-shot segment regeneration from
  dropping staged narration audio.
- TTS asset serving now supports byte-range requests:
  - `/api/tts/assets/...` returns `Accept-Ranges: bytes`
  - `Range: bytes=...` requests return `206 Partial Content` and
    `Content-Range`
  - this fixes Remotion Player pause/resume seek failures where the current
    segment audio could disappear until the next segment
- Local edited-project export now resolves route media before Remotion
  rendering:
  - project state can keep route URLs such as `/api/tts/assets/...`
  - `/api/render` rewrites route media to an absolute Next app origin for the
    renderer
  - default render asset origin is `http://127.0.0.1:3000`
  - `AI_VIDEO_STUDIO_RENDER_ASSET_ORIGIN` can override that origin for other
    runtime topologies
- Validation/smoke performed during this slice:
  - Docker `npx tsc --noEmit`
  - `git diff --check`
  - direct `Range` smoke against an existing generated TTS asset returned
    `206 Partial Content`
  - `/api/render` smoke with route TTS audio returned `200` and wrote
    `out/renders/render-2026-06-10t17-37-30-062z-0b8ae5f1.mp4`

Current readiness:
- staged full-project generation is the default user path
- staged selected-segment regeneration is wired for the active page path
- generated narration audio survives preview pause/resume and local export
- the one-shot `/api/generate` path remains as a fallback shortcut, not the
  final generation architecture

Remaining next slices:
- planner repair for invalid `StoryboardPlan` output
- broader multi-template smoke fixtures
- richer progress UX beyond idle / rendering / success / failure
- persistence/history only after the staged loop is stable

## Previous continuation — page staged generation toggle

- Wired the main page's top-level generate action to staged generation by
  default.
- Added a page-level generation-mode toggle:
  - enabled: `POST /api/generate/staged` with `mode: "brief"`
  - disabled: shipped one-shot `POST /api/generate` with `mode: "project"`
- Initially kept selected-segment regeneration on the existing one-shot segment
  revision path. This has since been superseded by staged segment regeneration
  in the latest continuation.
- Current page behavior:
  - creative brief generation now triggers planner -> TTS -> selected-template
    compiler -> narration audio media layer -> assembled `VideoProject`
  - the old MiniMax one-shot project route remains available as a fallback
  - preview, direct field editing, selected-segment revision, and export still
    operate on the normalized `VideoProject` boundary
- Superseded next slices:
  - user-facing preview / edit / export hardening is now underway
  - staged segment-level regeneration is now wired
  - one-shot fallback remains available while staged output continues to
    harden

## Latest continuation — staged endpoint live smoke

- Live-smoked `POST /api/generate/staged` with configured local MiniMax/TTS
  credentials through the running Docker dev server.
- `mode: "brief"` smoke passed for a short one-segment Chinese creative brief:
  - route returned `200`
  - planner produced a validated one-segment `StoryboardPlan`
  - planner selected `spotlight`
  - TTS generated a narration audio asset
  - compiler returned schema-valid `SpotlightSpec` in one attempt with no
    repair
  - assembled `VideoProject` included one project-level narration audio media
    layer
  - compiled visual duration matched the measured narration duration
- `mode: "plan"` smoke passed for a single `spotlight` segment:
  - route returned `200`
  - generated one project-level narration audio media layer
  - generated TTS audio served from `/api/tts/assets/...`
  - selected-template compiler returned schema-valid `SpotlightSpec`
  - compiler completed in one attempt with no repair
  - compiled visual duration matched the measured narration duration
- `mode: "plan"` smoke passed for a single `scripted` segment:
  - route returned `200`
  - generated one project-level narration audio media layer
  - generated TTS audio served from `/api/tts/assets/...`
  - selected-template compiler returned schema-valid `VideoSpec`
  - compiler completed in one attempt with no repair
  - compiled scene durations summed to the measured narration duration
- Confirmed generated TTS asset routes returned `200 audio/mpeg` with
  non-empty bodies.
- Current readiness:
  - planner -> TTS -> media layer -> selected-template compiler -> assembled
    `VideoProject` works for a single-segment `mode: "brief"` smoke
  - TTS -> media layer -> selected-template compiler -> assembled
    `VideoProject` works for both registered templates in single-segment
    `mode: "plan"` smoke tests
  - superseded by the later page staged generation toggle slice: the main
    generate action now defaults to staged generation, and the next step is to
    validate the user-facing preview / edit / export loop on staged output

## Latest continuation — selected-template compiler slice

- Added the first duration-aware selected-template compiler path without
  replacing the shipped v1 `POST /api/generate` route.
- Added MiniMax compiler wiring that:
  - receives one `StoryboardSegmentPlan`
  - receives the segment's `SegmentNarrationAsset`
  - computes a target duration from real narration frames and the selected
    template's recommended minimum
  - sends only the selected template's implementation schema and rules
  - returns only the selected template's `implementation`, not a segment,
    project, media layer, or narration object
  - validates with the selected template's Zod schema
  - retries once with bounded repair context when parsing, schema validation,
    or duration coverage fails
- Added staged assembly helpers:
  - `createNarrationAudioLayer()` converts TTS assets into project-level
    `media.layers[]` audio layers with `kind: "narration"`
  - `compilePlannedSegment()` compiles one planned segment into a validated
    `VideoSegment`
  - `generateStagedProjectFromPlan()` runs per-segment TTS, selected-template
    compilation, narration audio layer creation, and final `VideoProject`
    normalization
  - `generateStagedProjectFromBrief()` runs planner first, then delegates to
    the staged plan path
- Added opt-in `POST /api/generate/staged`:
  - `mode: "brief"` runs planner -> TTS -> compiler -> assembly
  - `mode: "plan"` skips planner and runs TTS -> compiler -> assembly from a
    validated `StoryboardPlan`
  - the current page and shipped `/api/generate` shortcut are unchanged
- Remaining next slices:
  - live smoke of `/api/generate/staged` with configured MiniMax/TTS
    credentials
  - route/page choice for when to expose staged generation as the main user
    action
  - segment-level staged regeneration using the smallest needed scope

## Latest continuation — narration audio boundary cleanup

- Quarantined the old scripted scene audio hook out of new generation paths:
  - removed it from the scripted scene Zod contract
  - removed it from the provider-visible scripted JSON schema
  - removed it from scripted block `llmFields`
  - stopped rendering audio from scripted scene fields in `ScriptedVideo`
- Added the first minimal template-external media carrier for generated
  narration audio:
  - `src/lib/media-layer-schema.ts`
  - optional `VideoProject.media.layers[]`
  - project-level audio layers with `type: "audio"` and
    `kind: "narration"`
  - `ProjectMediaLayers` renders project audio layers from the shared
    `ProjectVideo` composition path
- Updated product / architecture / media-layer docs so future TTS and compiler
  work uses template-external narration audio data instead of template-specific
  implementation fields.
- Current boundary after this cleanup:
  - selected-template compiler should generate visual/template
    `implementation` only
  - generated narration audio used project media layer data as the first
    runtime carrier; the latest target now prefers segment-owned narration
    metadata
  - do not reintroduce scripted scene audio fields in provider-visible schemas,
    prompts, compiler outputs, or runtime rendering

## Latest continuation — TTS asset boundary groundwork

- Added the first concrete TTS asset boundary for planned segments without
  changing the shipped v1 `POST /api/generate` route.
- Added `SegmentNarrationAsset` validation for narration text, served audio
  source, measured seconds, measured frames, provider, voice, and format.
- Added an internal MiniMax-backed TTS path:
  - `POST /api/tts` accepts a validated `StoryboardPlan` plus `segmentId`
  - `src/lib/tts` generates one planned segment's narration audio
  - generated files are written under `out/tts/...`
  - `/api/tts/assets/...` serves the generated local audio artifact
  - `ffprobe` measures real audio duration and converts it to frames
- Kept the current product boundary intact:
  - `VideoProject` remains the preview/edit/export contract
  - `POST /api/generate` still returns a validated `VideoProject` directly
  - the new TTS route is an internal staged-pipeline slice, not the active
    main generation path yet
- Docker/local smoke passed with configured MiniMax credentials:
  - `POST /api/tts` returned `200` with a MiniMax `mp3` narration asset
  - the response included measured duration (`4.32s`, `130` frames at 30fps)
  - `/api/tts/assets/...` returned `200 audio/mpeg` with a non-empty body
- Remaining next slices:
  - selected-template compiler that accepts `StoryboardSegmentPlan` +
    `SegmentNarrationAsset` + measured duration
  - planner/TTS/compiler route wiring
  - bounded planner/compiler repair

## Latest continuation — handoff documentation alignment

- Aligned `AGENTS.md`, `README.md`, product docs, architecture docs, template
  docs, and MiniMax provider docs around the current staged-generation status.
- Current handoff state:
  - shipped v1 route: `POST /api/generate` still returns validated
    `VideoProject` directly
  - implemented groundwork: `StoryboardPlan` schema, compact planner template
    manifest, internal MiniMax storyboard-planner facade, and internal TTS
    asset generation/serving for planned segment narration
  - then not implemented yet: public planner route wiring, planner repair,
    selected-template compiler, and full staged assembly
- Superseded by the later selected-template compiler slice: compiler
  groundwork and opt-in staged assembly now exist behind
  `POST /api/generate/staged`.

## Latest continuation — storyboard plan contract groundwork

- Added a server-safe `StoryboardPlan` / `StoryboardSegmentPlan` Zod contract
  for the target planner stage before final `VideoProject` assembly.
- Added template-local planner metadata to registered template definitions:
  description, avoid cases, narration fit, media expectations, and examples.
- Derived a compact planner template manifest from `src/templates/registry.ts`
  so the planner can choose among registered templates without receiving full
  implementation schemas or Remotion runtime internals.
- Added an internal MiniMax storyboard-planner prompt, tool schema, parser, and
  `minimaxGenerateStoryboardPlan()` facade.
- Kept the shipped v1 `POST /api/generate` path unchanged: it still generates
  schema-valid `VideoProject` directly until the staged pipeline is wired in a
  later slice.
- Preserved the durable model: one primary `templateId` per segment,
  template-specific `implementation`, and `VideoProject` as the preview /
  edit / export boundary.
- Docker-first validation passed for this slice:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run build`
  - targeted `npx prettier --check` on changed files
  - `git diff --check`
- Full `npm run check` is still blocked by pre-existing Prettier warnings in
  unrelated `.agents/skills` and `src/remotion/primitives` files.

## Latest continuation — authoritative final generation goal

- Added `docs/FINAL_PRODUCT_GOAL.md` as the authoritative product target and
  roadmap source.
- Locked the final generation model as a staged pipeline:
  user prompt -> storyboard plan -> per-segment TTS -> per-segment
  selected-template compilation -> assembled `VideoProject`.
- Clarified that the current MiniMax-backed one-shot `POST /api/generate`
  path is a usable v1 shortcut, not the permanent generation architecture.
- Reframed TTS narration audio as part of the main generated-video pipeline
  because real narration duration should drive template parameter generation.
- Kept the durable product model unchanged:
  one primary `templateId` per `VideoSegment`, with template-specific
  `implementation`.
- Updated roadmap direction so media layers remain important later, but do not
  precede the narration-provider-first generation pipeline unless a task
  explicitly widens into existing-media compositing.

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
- Confirmed the earlier audio support was only a scripted-template internal
  hook, not a project-level or cross-template audio track model. That hook has
  since been removed from new generation/runtime paths.
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
- The first planner-stage groundwork is implemented:
  - `src/lib/storyboard-plan-schema.ts` validates `StoryboardPlan` and
    `StoryboardSegmentPlan`
  - `src/templates/registry.ts` derives a compact planner template manifest
    from registered template definitions
  - `src/lib/minimax/*` contains an internal MiniMax storyboard-planner prompt,
    tool schema, parser, and `minimaxGenerateStoryboardPlan()` facade
- `POST /api/generate/staged` exposes the staged path for brief or existing
  plan input, and the page now defaults to this staged path for top-level
  generation.
- `POST /api/generate` still returns schema-validated `VideoProject` directly
  and remains available through the one-shot fallback toggle.
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

### Storyboard planning groundwork
- `src/lib/storyboard-plan-schema.ts` defines the planner-stage contract.
- `src/templates/<template>/definition.ts` includes planner metadata:
  description, avoid cases, narration fit, media expectations, and examples.
- `src/templates/registry.ts` derives `buildPlannerTemplateManifest()` and
  `buildPlannerTemplateManifestPrompt()` from registered definitions.
- `src/lib/minimax/tool-schema.ts` exposes the `StoryboardPlan` tool schema.
- `src/lib/minimax/prompts.ts` builds the storyboard-planner prompt from the
  compact manifest.
- `src/lib/minimax/parse-storyboard-plan.ts` parses and validates planner
  tool-call arguments.
- `src/lib/minimax/index.ts` exposes `minimaxGenerateStoryboardPlan()`.
- No public route or page action consumes the planner result yet.

### Local render/export boundary
- `src/app/api/render/route.ts` accepts the normalized current `VideoProject` and performs local Remotion render
- `src/lib/render-project.ts` renders `ProjectVideo`, creates a unique render artifact, and refreshes `latest.mp4`
- `src/app/api/render/latest/route.ts` serves the stable latest artifact
- `src/app/api/render/[renderId]/route.ts` serves the unique artifact for one successful export
- `src/helpers/use-rendering.ts` resets stale render attempts safely so the UI does not stay stuck in `rendering`

### Video runtime wiring
- `src/remotion/ProjectVideo/ProjectVideo.tsx` sequences project segments into one assembled composition
- `src/templates/registered-definitions.ts` is the server-safe template
  definition registration source
- `src/templates/registry.ts` derives template ids, labels, schemas, MiniMax
  schema fragments, planner manifest, duration helpers, prompt snippets, and
  revision payload builders
- `src/templates/registered-bundles.ts` is the runtime bundle registration source
- `src/templates/component-registry.tsx` maps registered `templateId` values
  to editor fields and Remotion renderers
- `src/lib/template-registry.ts` remains a compatibility re-export
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
- public route / page integration for planner -> TTS -> segment-compiler
  staged generation
- generated TTS audio assets and duration-aware template compilation
- planner repair for invalid `StoryboardPlan` output
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
- `src/lib/storyboard-plan-schema.ts`
- `src/lib/minimax/provider.ts`
- `src/lib/minimax/prompts.ts`
- `src/lib/minimax/tool-schema.ts`
- `src/lib/minimax/parse-project.ts`
- `src/lib/minimax/parse-storyboard-plan.ts`
- `src/lib/minimax/index.ts`
- `src/lib/template-registry.ts`
- `src/lib/spotlight-schema.ts`
- `src/lib/project-generation.ts`
- `src/templates/registered-definitions.ts`
- `src/templates/registered-bundles.ts`
- `src/templates/registry.ts`
- `src/templates/component-registry.tsx`
- `src/templates/*`
- `src/remotion/ProjectVideo/ProjectVideo.tsx`
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
- ~~define and validate `StoryboardPlan` / `StoryboardSegmentPlan` and derive
  a compact planner template manifest~~ **groundwork shipped**.

Suggested next focus, in order:
1. optionally add bounded planner repair or route wiring for
   `minimaxGenerateStoryboardPlan()` if the next slice needs a live planner
   endpoint
2. add TTS narration audio generation for planned segment narration
3. capture generated audio duration and metadata
4. compile the selected template's `implementation` from narration, audio
   duration, visual brief, and template-specific schema/rules
5. assemble compiled segments into the existing `VideoProject` preview/export
   boundary
6. keep the next work bounded unless a task explicitly asks for
   persistence/history, generic media-layer compositing, or
   multi-template-per-segment orchestration

## Notes for future Hermes/Codex work

- Keep `VideoProject` as the top-level page/generation/preview/render boundary for this phase.
- Treat `docs/FINAL_PRODUCT_GOAL.md` as the authoritative final target and
  roadmap source.
- Treat the current one-shot MiniMax generation path as a shipped v1 shortcut,
  not the final generation architecture.
- Move future generation work toward storyboard planning, in-project narration
  synthesis, audio + aligned captions, duration-aware selected-template
  compilation, and final `VideoProject` assembly.
- Treat F5-TTS as the preferred next narration-provider boundary in this repo,
  while MiniMax TTS remains the current working provider/fallback.
- Keep caption/subtitle cues outside template-specific `implementation`; render
  them through shared project-level preview/export code.
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
