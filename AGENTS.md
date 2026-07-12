# PROJECT KNOWLEDGE BASE

**Generated:** 2026-07-13 16:00:00 +0800
**Source snapshot:** codex/visual-recipe-roadmap working tree before publish
**Branch:** codex/visual-recipe-roadmap

## OVERVIEW

`ai-video-studio` is a Docker-first Next 16 + React 19 + Remotion 4 workspace
with a new top-level direction. Agent Producer is the default personal
production path for high-quality videos from real topics. The old
`VideoProject` / web editor final goal is parked indefinitely and remains only
as a secondary productization reference path.

Current Agent Producer pipeline:

```txt
topic -> research/assets -> narration/TTS -> component inventory
-> dedicated Remotion composition -> still/mp4 review -> promotion notes
```

## STRUCTURE

```txt
ai-video-studio/
|-- docs/                  # product goals, roadmap, provider notes, handoffs
|-- scripts/               # Docker wrappers and deterministic smoke checks
|-- services/f5-tts/       # optional FastAPI F5-TTS runtime boundary
|-- src/app/               # Next app page and route handlers
|-- src/components/        # project UI and shared UI primitives
|-- src/helpers/           # client-side generation/render/progress hooks
|-- src/lib/               # schemas, staged pipeline, TTS, render utilities
|-- src/remotion/          # Remotion compositions, primitives, recipes
|   |-- GitTutorialForDevs/ # Agent Producer Git tutorial composition
|   |-- HermesInnerLandscape/ # Agent Producer abstract AI consciousness video
|   |-- RawThoughtMirror/     # Agent Producer cinematic raw-thought monologue
|   |-- standalone-samples/# reference-only standalone compositions
|   |-- standalone-video/  # reusable production skeleton
|   `-- producer-samples/  # sample manifest, registry, shared blocks
|-- src/templates/         # registered template definitions and runtimes
`-- public/                # static assets addressable by Remotion/Next
    `-- standalone-samples/audio/ # sample-only Remotion audio assets
```

Generated/local artifact directories such as `out/`, `models/`, and `voices/`
are part of the local workstation flow, not source-of-truth product modeling.
Private F5 reference voices belong under ignored `voices/f5-tts/`; helper
scripts for local F5/TTS probes live under `scripts/f5-tts/`.

## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Current status / next slice | `docs/ITERATION_STATUS.md` | Fastest routing doc. |
| Current goal | `docs/FINAL_PRODUCT_GOAL.md` | Highest-level Agent Producer authority. |
| Producer roadmap / visual promotion | `docs/VISUAL_RECIPE_ROADMAP.md` | Agent Producer and reusable-visual roadmap. |
| Product scope | `docs/PRODUCT_REQUIREMENTS.md` | Segment/template/media boundaries. |
| Page workflow | `src/app/page.tsx`, `src/helpers/project-generation/` | Client state and actions. |
| Staged generation route | `src/app/api/generate/staged/route.ts` | Brief/plan/segment entrypoint. |
| Export route | `src/app/api/render/route.ts` | Current edited-project render path. |
| Project contract | `src/lib/project-schema.ts` | `VideoProject` / `VideoSegment`. |
| Storyboard contract | `src/lib/storyboard-plan-schema.ts` | Strict planner-stage boundary. |
| Draft parser | `src/lib/storyboard-plan-draft-*` | Provider-facing drift boundary. |
| TTS/F5 adapter | `src/lib/tts/`, `src/app/api/tts/` | Segment narration assets/captions. |
| Template registration | `src/templates/` | Server-safe definitions + runtime bundles. |
| Preview/export composition | `src/remotion/ProjectVideo/` | Shared Remotion render surface. |
| Agent producer skill | `.agents/skills/ai-video-studio-agent-producer/`, `docs/superpowers/specs/2026-07-01-agent-producer-design.md` | Local research/assets/TTS/primitives/blocks/runtime/stills loop for dedicated videos. |
| Remotion guidance skill | `.agents/skills/remotion-best-practices/` | Frame-driven Remotion, layout, subtitles, audio, silence detection, and render rules. |
| VoxCPM expression guidance | `.agents/skills/ai-video-studio-agent-producer/voxcpm-expression/VOXCPM_EXPRESSION.md`, `docs/providers/voxcpm.md` | VoxCPM control instructions, expressive state, punctuation-aware narration, silence checks, and sparse non-language tags for Agent Producer narration/voice clone. |
| Fixed producer audio tools | `scripts/lib/producer-audio/` | Provider-neutral orchestration with separate F5/VoxCPM request-plan adapters, caption cleanup, measured duration, metadata, constants, summaries, and fallback reporting. |
| Producer composition: HermesInnerLandscape | `src/remotion/HermesInnerLandscape/` | 6-scene abstract poetic AI consciousness video, VoxCPM voice-design TTS. |
| Producer composition: RawThoughtMirror | `src/remotion/RawThoughtMirror/` | 6-scene cinematic raw-thought monologue, VoxCPM LYY voice-clone TTS. |
| Producer mechanical validation | `scripts/lib/producer-validation.ts`, `scripts/validate-producer-sample.mjs` | Provider/audio/caption/duration/registration/local-only checks for future samples. |
| Producer review stills | `scripts/lib/producer-review-frames.ts`, `scripts/render-producer-review-frames.mjs` | Manifest-driven review-frame planning and sequential Remotion still rendering. |
| Standalone sample references | `src/remotion/standalone-samples/`, `public/standalone-samples/audio/` | Reference-only compositions and static audio. |
| F5 runtime service | `services/f5-tts/` | Contract-smoke and real-GPU service. |

## CODE MAP

| Symbol / entry | Type | Location | Refs | Role |
| --- | --- | --- | --- | --- |
| `POST` | route | `src/app/api/generate/staged/route.ts` | entry | Staged full/segment generation. |
| `POST` | route | `src/app/api/render/route.ts` | entry | Local mp4 export for a `VideoProject`. |
| `VideoProject` | type | `src/lib/project-schema.ts` | central | Preview/edit/export boundary. |
| `StoryboardPlan` | type | `src/lib/storyboard-plan-schema.ts` | 8 | Strict planner artifact. |
| `compileStoryboardPlanDraft` | function | `src/lib/storyboard-plan-draft-compiler.ts` | parser | Provider draft -> strict plan. |
| `runWithConcurrencyLimit` | function | `src/lib/concurrency-limits.ts` | routes | Process-local heavy-task guard. |
| `ProjectVideo` | component | `src/remotion/ProjectVideo/ProjectVideo.tsx` | 1 | Assembled preview/export composition. |
| `getSegmentTimelineWindows` | function | `src/lib/project-timeline.ts` | renderer | Flattens segments onto frames. |
| `buildPlannerTemplateManifest` | function | `src/templates/registry.ts` | prompts | Planner-safe template metadata. |
| `buildPlannerRecipeManifest` | function | `src/templates/registry.ts` | prompts | Planner-safe recipe metadata. |
| `renderTemplateSegment` | function | `src/templates/component-registry.tsx` | runtime | Segment -> template runtime renderer. |

## CONVENTIONS

- Start new work by reading `docs/FINAL_PRODUCT_GOAL.md`, then
  `docs/ITERATION_STATUS.md`; add `docs/VISUAL_RECIPE_ROADMAP.md` for visual,
  recipe, template, motion, transition, or generated-video polish work.
- Use CodeGraph first when locating code in this indexed repo.
- Default validation and runtime commands are Docker-first; host
  `node_modules` may be absent or irrelevant.
- `.env.example` is the tracked config template; `.env` is the local Docker/Next
  config. Treat `.env.local` as legacy compatibility only.
- Treat `VideoProject` as a productization/editing/export boundary only, not
  the default production target.
- Keep one primary `templateId` per `VideoSegment`; grow template internals
  before introducing multi-template-per-segment orchestration.
- Keep generated narration audio and captions under segment-owned narration
  data, outside template-specific `implementation`.
- Planner-facing recipe data is derived from registered template definitions.
  `recipeHints[]` are optional planner hints, not top-level project fields.
- For higher-quality local video production, use the Agent Producer skill:
  start from primitives/blocks/standalone-video runtime helpers, compose a
  dedicated Remotion video by default, and promote recipes/templates only after
  reuse is proven. Do not route this default back through the web prompt.
- For future samples, use `scripts/lib/producer-audio/`,
  `npm run producer:validate -- --module <validation-module>`, and
  `npm run producer:stills -- --composition <composition-id>` for fixed
  production operations. Existing finished samples are frozen read-only
  references and must not be migrated or regenerated to adopt these tools.
- When Agent Producer uses VoxCPM for narration or voice clone, load the
  VoxCPM expression skill before final TTS text. Use control instructions for
  delivery state, punctuation-aware phrasing, and sparse English bracket tags
  for non-language cues. VoxCPM currently returns audio without per-line
  timestamps; the repo adapter splits narration by punctuation, trims chunk
  silence, concatenates WAV chunks, and derives caption cues from measured
  chunk duration.
- For source-backed Agent Producer evidence, attempt real screenshot/source
  capture before generated source-card fallback. If fallback is used, record
  why capture failed or was unreadable and do not call the fallback a
  screenshot.
- Remotion animation must be frame-driven with Remotion APIs.

## ANTI-PATTERNS (THIS PROJECT)

- Do not model one segment as multiple template instances unless a future
  workflow proves the need.
- Do not put narration audio, captions, subtitles, or alignment cues inside
  template-specific `implementation`.
- Do not let planners/providers generate Remotion internals, arbitrary TSX,
  template `implementation`, global recipe models, or unrestricted media URLs.
- Do not import runtime template files from server-safe schema/provider/API
  modules.
- Do not silently fall back from F5 voice-clone/F5 runtime paths to MiniMax.
- Do not use CSS animations, CSS transitions, or Tailwind animation utilities
  for render-critical Remotion motion.
- Do not widen a bounded milestone into persistence/history, broad media
  library UI, waveform/DAW controls, subtitle pro editing, or production queues.
- Do not treat `scripts/render.sh` as the edited-project export path; that path
  is the page action / `POST /api/render`.
- Do not use host `npm install`, host lint, host typecheck, or host build as the
  default validation path unless explicitly requested.

## COMMANDS

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run check'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run build'

npm run smoke:producer-audio-tools
npm run smoke:producer-validation
npm run smoke:producer-review-frames
npm run producer:validate -- --module <validation-module>
npm run producer:stills -- --composition <composition-id>
./scripts/render-video.sh <composition-id> <slug> <metadata-json>

bash scripts/dev.sh
bash scripts/studio.sh
bash scripts/prod.sh
bash scripts/prod-build.sh
bash scripts/render.sh
bash scripts/f5-tts-real.sh up-build
```

Focused smoke commands live in `package.json` under `smoke:*`; choose the
smallest smoke covering the changed boundary.

## NOTES

- TypeScript/ESLint LSP can start when user-level LSP config is present, but
  host dependency resolution may still miss Docker-volume dependencies; Docker
  `tsc --noEmit` remains the source of type truth.
- `web` runs on port `3000`; Remotion Studio runs on `3001`.
- Prod uses a separate `web-prod` service through `docker-compose.prod.yml` and
  defaults to host bind `127.0.0.1:10001`.
- For export-time self-fetches in the `web-prod` topology, keep
  `AI_VIDEO_STUDIO_RENDER_ASSET_ORIGIN=http://127.0.0.1:3000`.
