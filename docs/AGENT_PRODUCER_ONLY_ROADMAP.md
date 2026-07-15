# Agent Producer-Only Roadmap

Status: approved design roadmap; implementation has not started.

Decision date: 2026-07-15.

This roadmap defines the repository transition from a mixed Agent Producer,
Web video product, and multi-provider TTS workspace into one focused local
production system:

> `ai-video-studio-agent-producer` is the only video-production entrypoint.

All retained and newly added capabilities must directly improve that skill's
ability to research a topic, collect existing assets, generate VoxCPM
narration, compose a dedicated Remotion video, review it, render it, and
prepare it for publication.

This is a deletion-and-consolidation roadmap, not a compatibility roadmap.
The previous Web generation product line is removed rather than parked. F5
generation is removed rather than retained as a fallback.

## 1. Final Product Boundary

The only supported production flow is:

```txt
topic / supplied material
  -> ai-video-studio-agent-producer skill
  -> research and existing-asset collection
  -> narration beats
  -> direct VoxCPM generation and caption timing
  -> primitive / block / runtime inventory
  -> dedicated Remotion composition
  -> asset and composition preflight
  -> representative still review
  -> MP4 render and ffprobe verification
  -> 16:9 and 9:16 covers
  -> publishing copy and promotion notes
```

The default output remains a purpose-built composition under
`src/remotion/<CompositionName>/`. There is no generated `VideoProject`, Web
prompt, storyboard-planner product flow, segment editor, or Web export path.

### 1.1 Required production surfaces

- `.agents/skills/ai-video-studio-agent-producer/`
- `.agents/skills/remotion-best-practices/`
- VoxCPM expression and voice-clone guidance
- Remotion Studio and CLI
- dedicated Remotion compositions
- repo-owned primitives, blocks, effects, transitions, and style profiles
- standalone timing, caption, audio, and canvas helpers
- Producer Sample OS manifests and scaffold
- existing-asset localization and license tracking
- deterministic validation and representative still rendering
- local MP4, metadata, cover, and publishing outputs

### 1.2 Removed product concepts

The finished repository no longer contains active versions of these concepts:

```txt
Web brief-to-video generation
VideoProject
VideoSegment
StoryboardPlan
provider storyboard planner
selected-template compiler
template registry for planner selection
selected-segment regeneration
product screenshot upload and binding
Web render/export API
render-progress API
Lambda video-generation route
F5-TTS provider or fallback
provider-neutral TTS selection
```

### 1.3 Existing finished compositions

Existing finished compositions are frozen read-only references.

- Do not migrate or regenerate them solely to adopt this roadmap.
- Keep their committed source code and generated-audio metadata.
- A historical `provider: "f5-tts"` value in an old
  `audio.generated.ts` remains an accurate record and is allowed.
- Existing local F5-generated audio may continue to play when present.
- No retained command, service, adapter, config, or skill instruction may
  generate new F5 audio.
- New scaffolds and future samples must not copy historical F5 or Web patterns.

## 2. Design Principles

### 2.1 One production authority

The Agent Producer skill owns the workflow order and routes to every supported
production capability. New tools are not considered complete until the skill
documents when and how to invoke them.

### 2.2 Code and existing assets only

Visual production may use:

- React, HTML, SVG, Canvas, CSS filters, and masks
- Remotion effects and deterministic frame-driven animation
- Three.js and existing GLB/glTF, HDRI, and texture assets
- local images, videos, SVGs, audio, fonts, and screenshots
- local Lottie or Rive files whose behavior is verified
- user-supplied assets
- captured real sources
- licensed stock or open-source assets localized before render

The production system must not introduce image-generation or video-generation
models, services, adapters, prompts, manifests, or fallback paths.

This boundary also applies to publication artwork and evidence fallbacks:

- 16:9 and 9:16 covers are dedicated Remotion `<Still>` compositions built
  from code and manifest-backed existing assets.
- Failed source capture falls back to an honest code-rendered information
  graphic, not a generated image or a generated "source card".
- The Agent Producer skill must not invoke image-generation tooling for a
  cover, scene, background, texture, evidence card, or promotional asset.

### 2.3 Creativity stays agent-owned

Automation owns deterministic operations:

- VoxCPM request execution and recovery
- punctuation splitting and silence trimming
- WAV concatenation and duration measurement
- caption-cue construction
- asset download, localization, metadata, checksum, and license records
- composition registration checks
- review-frame command execution
- codec, dimensions, safe-area, and hard-failure checks
- MP4 metadata and artifact verification

The agent retains responsibility for:

- research and factual judgment
- narration structure
- visual metaphor
- asset choice
- scene composition
- motion and sound design
- actual still and MP4 review
- creative revision
- promotion decisions

### 2.4 Promote only proven reuse

Use this hierarchy:

```txt
primitive -> block -> dedicated composition -> reusable effect/transition/style
```

`recipe` and `template` are not product-generation layers after this roadmap.
Historical modules may be mined for useful Agent Producer blocks, but provider
or planner exposure is removed.

### 2.5 Rendering is local and deterministic

- All render-critical animation is frame-driven.
- Formal renders use local assets through `staticFile()` or approved local
  filesystem inputs.
- Remote URLs are forbidden in committed production compositions.
- All `remotion` and `@remotion/*` packages use the same exact version.
- Generated audio, captured media, review frames, covers, and MP4 files remain
  ignored local artifacts unless explicitly requested otherwise.

## 3. Target Repository Shape

The target ownership model is:

```txt
ai-video-studio/
|-- .agents/skills/
|   |-- ai-video-studio-agent-producer/
|   `-- remotion-best-practices/
|-- docs/
|   |-- FINAL_PRODUCT_GOAL.md
|   |-- AGENT_PRODUCER_ONLY_ROADMAP.md
|   |-- REMOTION_COMPONENT_LIBRARY.md
|   |-- PRODUCER_ASSET_CONTRACT.md
|   |-- PRODUCER_PROMOTION_GATE.md
|   |-- providers/voxcpm.md
|   `-- archive/
|-- scripts/
|   |-- lib/
|   |   |-- producer-audio/
|   |   |-- producer-assets/
|   |   |-- producer-validation/
|   |   `-- producer-review/
|   |-- producer-scaffold.mjs
|   |-- producer-validate.mjs
|   |-- producer-stills.mjs
|   `-- producer-render.mjs
|-- src/remotion/
|   |-- Root.tsx
|   |-- primitives/
|   |-- blocks/
|   |-- effects/
|   |-- transitions/
|   |-- styles/
|   |-- standalone-video/
|   |-- producer-samples/
|   |-- capability-showcase/
|   `-- <DedicatedComposition>/
|-- public/assets/library/
|-- public/generated/
|-- voices/clone/
`-- out/
```

### 3.1 Module responsibilities

| Module | Owns | Must not own |
| --- | --- | --- |
| Agent Producer skill | production order, routing, creative checklist | topic-specific TSX |
| `producer-audio` | VoxCPM transport, audio processing, captions, duration | provider selection, F5 |
| `producer-assets` | localization, provenance, license, media metadata | creative asset selection |
| `producer-validation` | deterministic hard-failure gates | aesthetic scoring |
| `producer-review` | review-frame plans and commands | automatic creative approval |
| `primitives` | small reusable visual units | sample facts or narration |
| `blocks` | semantic combinations of primitives | universal scene DSL |
| `effects` | project effect presets and custom Remotion effects | arbitrary per-topic copy |
| `transitions` | transition presets and optional SFX mapping | full scene content |
| `styles` | style-profile constraints and defaults | complete video templates |
| `standalone-video` | timing, audio, captions, canvas profiles | provider or Web contracts |
| `producer-samples` | manifest, registry, scaffold, reuse evidence | generated artifacts |
| dedicated composition | topic data, script, scenes, local arrangement | cross-project product schema |

## 4. Migration Strategy

Every removal phase follows this order:

```txt
identify the surviving use case
  -> build the Agent Producer-owned replacement
  -> add a focused failing guard
  -> switch the skill and producer tools
  -> verify the replacement
  -> delete the old entrypoint
  -> delete old internals, config, tests, and docs
  -> scan the active tree for forbidden references
```

Do not delete broad directories and use compiler failures as dependency
discovery. CodeGraph and direct call-path inspection must identify shared
boundaries before each deletion slice.

Classify every touched module as one of:

1. **Producer-owned:** retain or move under an Agent Producer boundary.
2. **Web/F5-only:** delete.
3. **Shared today:** first extract the smallest producer-owned interface, then
   delete the legacy interface.
4. **Historical composition dependency:** retain as read-only compatibility;
   exclude it from new scaffolds and active docs.
5. **Unused:** delete; do not preserve speculative abstractions.

## 5. Phase 0 - Authority Reset And Deletion Inventory

### Goal

Make this roadmap the only forward-looking repository plan and define the
exact survival/deletion boundary before implementation removal begins.

### Deliverables

- update `docs/FINAL_PRODUCT_GOAL.md` to remove the parked Web product line
- replace the active Web/F5 sections in `README.md`, `AGENTS.md`,
  `docs/ITERATION_STATUS.md`, and `docs/VISUAL_RECIPE_ROADMAP.md`
- remove image-generation instructions for covers and generated source-card
  fallbacks from the Agent Producer skill and active documentation
- make this roadmap the active roadmap link from entry documents
- mark superseded Web, F5, planner, template, and productization specs/plans as
  historical or move them to `docs/archive/`
- create a machine-readable removal inventory grouped by producer-owned,
  Web/F5-only, shared, historical dependency, and unused
- add an architecture smoke that guards the accepted authority and phase order
- record the permitted historical `provider: "f5-tts"` exception

### Non-goals

- no executable code deletion
- no Remotion dependency upgrade
- no old composition changes

### Acceptance

- a new agent cannot reasonably interpret Web generation or F5 as supported
- every active path scheduled for deletion has an owning phase
- no current document describes `VideoProject` as parked or optionally active
- `git diff --check` passes

## 6. Phase 1 - Direct VoxCPM Producer Runtime

### Why this precedes Web removal

The current shared producer audio request path calls `${origin}/api/tts`, and
several producer generation scripts rely on `NEXT_ORIGIN`. Removing Next before
replacing this boundary would break Agent Producer narration.

### Goal

Generate and process VoxCPM narration without starting Next or calling any
repository HTTP route.

### Target flow

```txt
ProducerNarrationBeat[]
  -> VoxCPM request plan
  -> direct VoxCPM client
  -> punctuation-sized requests
  -> response validation
  -> leading/trailing silence trim
  -> ordered WAV concatenation
  -> measured chunk and track durations
  -> display-caption cleanup
  -> duration-derived caption cues
  -> local audio and metadata files
```

### Deliverables

- replace `requestProducerNarrationAsset({origin, plan})` with a direct
  VoxCPM-owned client interface
- remove `NEXT_ORIGIN` and `/api/tts` from future producer tooling
- make `ProducerAudioProviderId` VoxCPM-only or remove the provider-id type
- keep VoxCPM modes explicit:
  - `voice-design`
  - `controllable-clone`
  - `high-fidelity-clone`
- read private reference files directly from ignored `voices/clone/`
- write output directly under `public/generated/<slug>/audio/`
- keep partial per-scene progress so failed batches can resume by scene id
- replace provider fallback policy with explicit narration policy:
  - narration required: fail closed
  - narration intentionally absent: declare it in the sample manifest
- generate deterministic `audio.generated.ts`, duration constants, and summary
- add direct-client, resume, silence, caption, duration, and invalid-response
  smokes
- update the Agent Producer skill before declaring the new runner active

### Error policy

- connection, timeout, reference, response-format, empty-audio, and measured
  duration failures stop the affected scene
- no F5 fallback
- no silent WAV presented as completed narration
- already completed scene artifacts remain reusable after a batch failure
- an intentionally silent scene declares `narrationRequired: false`

### Acceptance

- the Next process is stopped
- a fixture multi-scene sample generates real VoxCPM narration
- captions are clean, ordered, and within measured track duration
- the generated audio is readable through `staticFile()`
- no future-sample generator contains `NEXT_ORIGIN` or `/api/tts`

## 7. Phase 2 - Remove F5 Generation Completely

### Goal

Remove every executable F5 generation and fallback path while preserving old
composition metadata as historical truth.

### Delete

- `services/f5-tts/`
- `scripts/f5-tts/`
- F5 smoke, real-runtime, Next-adapter, and staged scripts
- `docker-compose.f5.yml`
- `docker-compose.f5.gpu.yml`
- F5 service blocks and environment variables in remaining compose files
- `scripts/lib/producer-audio/providers/f5.ts`
- `src/lib/tts/f5.ts`
- F5 provider selection, config, request-schema, and synthesis branches
- F5-only fixtures and test cases
- F5 package scripts
- F5 runtime and provider documentation
- F5 references in current README, AGENTS, skills, env examples, status, and
  roadmaps
- `voices/f5-tts/` instructions and helper paths; do not delete a user's local
  ignored voice files as part of source cleanup

### Preserve

- old composition source
- old `audio.generated.ts` provider values
- existing ignored audio artifacts
- archived historical documents when clearly marked superseded

### Acceptance

- active source and config contain no `F5_TTS_` environment key
- package scripts contain no executable F5 command
- Docker config contains no F5 service or dependency
- producer audio accepts only VoxCPM
- the only allowed active-tree `f5-tts` matches are frozen composition metadata
  documented by an explicit allowlist
- old compositions still list successfully when their assets are present

## 8. Phase 3 - Remove The Web Video Product Line

### Goal

Delete every video-generation, editing, regeneration, product-asset, progress,
and Web-export path outside Agent Producer.

### Delete by boundary

#### Web routes

- `/api/generate/staged`
- `/api/render` and render artifact download
- `/api/progress`
- `/api/assets/product-ui`
- `/api/tts`, TTS asset serving, and voice-reference upload
- Lambda render and progress routes

#### Web UI and hooks

- brief generation controls
- project workbench
- segment list and editor
- selected-segment regeneration
- product-asset upload and binding
- render controls and download state
- task-progress polling
- voice-clone upload UI

#### Product and provider model

- `VideoProject` and `VideoSegment`
- project timeline and project media-layer assembly
- storyboard plan, draft schema, parser, and compiler
- staged generation assembly, pipeline, diagnostics, and fixtures
- DeepSeek/MiniMax planner/compiler logic that has no Agent Producer consumer
- provider-facing template definitions and planner manifests
- template compiler and editor registry
- Web-only render-project and artifact routes

#### Tests, dependencies, and documentation

- all Web-generation and planner smokes
- product asset upload/binding smokes
- selected-segment and staged fixtures
- Lambda dependencies when no retained local producer tool needs them
- AI SDK provider dependencies with no Agent Producer consumer
- Web product documentation and environment variables

### Shared-code rule

Before deletion, inspect each apparent shared module:

- move caption types needed by producer audio into a producer-safe module
- retain Remotion bundler/renderer helpers only when producer CLI render tools
  call them
- retain primitives and blocks even if they originated in a template only when
  a producer composition or approved promotion candidate uses them
- move reusable visual code out of `src/templates/` before deleting the
  template system
- do not preserve a generic product schema merely to avoid a small extraction

### Next application boundary

The final system does not require a Next application to generate videos.
During this phase choose the smallest runtime packaging that still supports:

- Remotion Studio
- CLI composition listing, stills, and MP4 rendering
- local fonts and browser dependencies
- optional read-only primitive/capability catalog if it materially helps Agent
  Producer inventory

If the read-only catalog remains, it must live as a development aid and must
not expose generation, upload, editing, TTS, or export actions.

### Acceptance

- no active `/api/generate`, `/api/render`, `/api/progress`, `/api/tts`, or
  product-asset route
- no `VideoProject`, `VideoSegment`, or `StoryboardPlan` call path
- no planner or selected-template compiler dependency
- no Web action can generate or export a video
- Remotion Studio and local CLI rendering remain functional
- retained read-only catalogs, if any, have no business-logic dependency on the
  deleted product line

## 9. Phase 4 - Consolidate Agent Producer OS

### Goal

Make the retained workflow complete, discoverable, and mandatory for every
future composition.

### Required future-sample contract

Every maintained new sample declares:

- production brief
- composition id and canvas profile
- narration script and narration-required policy
- VoxCPM mode and generated audio metadata
- local asset manifest
- sample manifest and registry entry
- validation module
- review frames with labels and purpose
- Root registration
- MP4 metadata and chapter data
- 16:9 and 9:16 Remotion `<Still>` cover outputs built only from code and
  manifest-backed existing assets
- publishing copy location
- promotion candidates and evidence

### Deliverables

- one producer scaffold command that creates the required source skeleton
- one sample registry containing all maintained future samples
- one validation entrypoint that composes audio, asset, registration, and
  artifact-boundary checks
- one review-frame entrypoint
- one render entrypoint producing MP4, metadata, and both code-rendered covers
- migrate recent post-Phase-G samples into the registry only when doing so does
  not modify their visual or narration output
- remove one-off future generator patterns from the scaffold documentation
- align the Agent Producer skill with the final commands

### Acceptance

- a new empty sample scaffold passes structural validation
- a real new sample cannot be declared complete without manifest, validation,
  review frames, and render metadata
- new samples do not copy F5, Next API, or Web product code
- cover production does not call image-generation tooling
- finished historical samples remain read-only

## 10. Phase 5 - Existing Asset Supply System

### Goal

Make existing media reproducible, local, licensed, and render-safe without any
image- or video-generation capability.

### Asset contract

Each asset record includes:

```ts
type ProducerAsset = {
  id: string;
  kind: "image" | "video" | "svg" | "audio" | "font" | "lottie" | "rive" | "gltf" | "texture";
  localPath: string;
  purpose: string;
  source: {
    provider: string;
    sourceUrl?: string;
    sourceId?: string;
    creator?: string;
    license: string;
    attribution?: string;
  };
  integrity: {
    sha256: string;
    sizeInBytes: number;
  };
  media?: {
    width?: number;
    height?: number;
    durationInSeconds?: number;
    fps?: number;
    codec?: string;
    pixelFormat?: string;
    sampleRate?: number;
  };
};
```

No generation-model, prompt, seed, or workflow field is included because
generated visual media is outside the product boundary.

### Deliverables

- `ProducerAssetManifest` schema and serializer
- manual-file and URL-localization adapters
- real screenshot/capture records
- checksum and duplicate detection
- image dimensions and video/audio metadata extraction
- FFmpeg normalization for formal video assets
- license and attribution completeness checks
- local library convention under `public/assets/library/`
- composition-local assets under `public/generated/<slug>/assets/`
- removal of remote default URLs from primitives
- `producer:assets` and `producer:preflight` commands
- Agent Producer skill instructions for choosing and recording existing assets

### Formal render rules

- no remote asset URL
- local video defaults to H.264, yuv420p, constant frame rate, and AAC audio
  unless transparency requires a documented alternative
- corrupt, unreadable, undersized, or unlicensed assets fail preflight
- missing evidence assets require an explicit scene redesign into an honest
  code information graphic; runtime silent substitution is forbidden

### Acceptance

- every visible non-code asset maps to a manifest record
- all formal render assets are local and readable
- provenance and license requirements are complete
- a missing or invalid asset fails before representative still rendering

## 11. Phase 6 - Remotion Capability Core

### Goal

Use Remotion as a code-driven compositing and post-production system, not only
as a React timeline.

### Version gate

Before adding packages:

- identify the minimum version for selected APIs
- move every `remotion` and `@remotion/*` dependency to one exact version
- remove the caret from `@remotion/three`
- verify Docker typecheck, lint, build, composition list, and representative
  stills before capability work

Official references:

- <https://www.remotion.dev/docs/remotion>
- <https://www.remotion.dev/docs/effects/api>
- <https://www.remotion.dev/docs/transitions/>
- <https://www.remotion.dev/docs/layout-utils/>

### Capability set

- `@remotion/effects`
- `CanvasImage`
- `HtmlInCanvas`
- project custom effects through `createEffect()` only when presets do not fit
- `@remotion/transitions` and `TransitionSeries`
- `@remotion/layout-utils` for text measurement and overflow prevention
- `Series` for sequential scene structures
- `Freeze` for explicit held visual states
- `Folder` and `Still` for Studio inventory and review organization
- effect and transition presets exported through producer-owned modules

### Capability showcase

Create one Agent Producer inventory composition that demonstrates:

1. comic halftone and rough-edge treatment
2. cyber scanline, glow, and chromatic treatment
3. paper, grain, and hand-drawn treatment
4. pixelate and pixel-dissolve treatment
5. cinematic blur, light-leak, and film-burn treatment
6. measured Chinese text fitting and overflow diagnostics
7. official transition timing with project presets
8. canvas effects applied to HTML, SVG, image, and video sources

The showcase is a component-inventory aid, not a parallel product or universal
video template.

### Acceptance

- every demonstrated effect is deterministic across repeated still renders
- unsupported Lottie-like expression behavior is not hidden behind effects
- text-fit helpers prevent overflow in short and long Chinese fixtures
- transition durations are included correctly in total composition duration
- the Agent Producer skill can name and select each capability

## 12. Phase 7 - Dynamic Existing Media And Sound Design

### Goal

Add production-grade motion and sound from existing assets.

Official references:

- <https://www.remotion.dev/docs/lottie/>
- <https://www.remotion.dev/docs/rive/>
- <https://www.remotion.dev/docs/motion-blur/>
- <https://www.remotion.dev/docs/sfx/>

### Deliverables

- local `<Video>` block with trim, loop, playback-rate, crop, and volume control
- `AnimatedImage` block for supported existing animated files
- Lottie block using local `staticFile()` data and metadata validation
- Lottie fixture checks for expression-related flicker before promotion
- Rive support only after an approved local `.riv` asset and real sample use
- motion-blur and trail presets for camera, typography, icons, and particles
- local SFX library with license records
- transition-to-SFX mapping
- background music and ambience tracks
- narration ducking and per-frame volume envelopes
- peak, clipping, long-silence, and missing-track validation

### Acceptance

- one producer sample combines narration, BGM, SFX, image, and video assets
- all assets remain local and manifest-backed
- narration remains intelligible under music and effects
- Lottie/Rive assets are admitted individually after deterministic render
  verification
- no visual media generation provider is introduced

## 13. Phase 8 - Code-Driven Style Profiles

### Goal

Create visibly different production languages without templates or generated
visual media.

### Initial profiles

| Profile | Primary language |
| --- | --- |
| `editorial-tech` | strong typography, diagrams, restrained motion, evidence media |
| `comic-anime` | halftone, outlines, panels, speed lines, existing character/sprite assets |
| `cinematic-3d` | GLB/glTF, camera paths, depth, lighting, material and texture assets |
| `retro-terminal` | terminal rhythm, scanlines, pixel transitions, UI SFX |
| `documentary-media` | source images/video, lower thirds, maps, quotes, restrained transitions |
| `hand-drawn-explainer` | paper effects, SVG drawings, rough annotations, diagram reveals |

### Each profile defines

- palette and typography
- background and material rules
- layout grammar
- approved primitives and blocks
- effects and effect intensity limits
- transition family
- motion-blur policy
- media-type mix
- Three.js usage when relevant
- caption treatment
- BGM and SFX strategy
- forbidden defaults and anti-patterns

### Hard rule

A style profile is not a color theme. Applying different profiles to the same
content must change composition, motion, texture, media strategy, and sound
language.

### Acceptance

- capability-showcase fixtures demonstrate all initial profiles
- at least two real dedicated compositions use different profiles
- stills make the profiles distinguishable without reading profile labels
- profile selection remains an Agent Producer judgment, not an LLM-generated
  universal scene schema

## 14. Phase 9 - Quality Gates And Final Cleanup

### Goal

Make the Producer-only repository self-consistent and mechanically resistant to
regression.

### Deterministic hard-failure gates

- remote asset reference
- missing or unreadable asset
- unsupported codec or invalid media metadata
- incomplete license/provenance
- composition missing from Root
- narration/scene/caption duration mismatch
- caption control tags leaking into visible copy
- text overflow
- unsafe margins
- near-blank or severely low-contrast review frame
- unresolved evidence asset
- missing planned review frame
- audio clipping or excessive unintended silence
- MP4/metadata/chapter mismatch
- generated artifact path accidentally tracked by Git

These gates do not score aesthetics. Actual visual and audio quality remains an
Agent review responsibility.

### Final documentation cleanup

Align:

- `README.md`
- `AGENTS.md`
- `docs/FINAL_PRODUCT_GOAL.md`
- `docs/ITERATION_STATUS.md`
- this roadmap
- `docs/REMOTION_COMPONENT_LIBRARY.md`
- `docs/PRODUCER_PROMOTION_GATE.md`
- `docs/providers/voxcpm.md`
- Agent Producer and Remotion skill instructions
- `.env.example`
- Docker and package scripts

Archive or delete superseded current-state documents. Historical files must
start with a visible superseded notice and must not be linked as active entry
documents.

### Forbidden-reference scan

The active tree must contain no executable or present-tense occurrences of:

```txt
F5_TTS_
f5-tts provider selection
NEXT_ORIGIN ... /api/tts
/api/generate
/api/render
/api/progress
VideoProject
VideoSegment
StoryboardPlan
selected-segment regeneration
planner recipe manifest
selected-template compiler
```

Allowed exceptions are limited to:

- clearly marked files under `docs/archive/`
- frozen old composition metadata containing `provider: "f5-tts"`
- Git history

### Final acceptance video

Produce one new validation video using only the final path:

```txt
topic
  -> Agent Producer skill
  -> existing sources/assets
  -> direct VoxCPM
  -> style profile and Remotion capability inventory
  -> dedicated composition
  -> preflight
  -> still review
  -> MP4 + metadata + code-rendered covers + publishing copy
```

The validation video must include:

- at least one code-driven effect treatment
- at least one official transition preset
- at least one manifest-backed existing visual asset
- background music or ambience
- at least two intentional SFX cues
- duration-derived captions
- representative review frames
- successful final artifact verification
- 16:9 and 9:16 covers rendered as Remotion `<Still>` compositions using only
  code and manifest-backed existing assets

## 15. Validation Strategy

### 15.1 Per-phase minimum

Every implementation phase runs:

1. the smallest focused unit or smoke checks
2. Docker TypeScript validation
3. lint
4. Remotion composition listing or bundle validation
5. at least one representative still when render code changes
6. `git diff --check`
7. phase-specific forbidden-reference scans

### 15.2 Transitional commands

Until the Web service is removed, Docker remains the current source of type
truth:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit --pretty false'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run build'
npx remotion compositions src/remotion/index.ts
git diff --check
```

Phase 3 replaces `web` with a producer/render-oriented service name and updates
all current docs and commands in the same slice. Do not leave `web` as a
misleading container name after the Web product is gone.

### 15.3 Target final commands

The final package exposes a compact production command set:

```bash
npm run producer:scaffold -- --name <CompositionName> --slug <slug>
npm run producer:audio -- --module <audio-config-module>
npm run producer:assets -- --manifest <asset-manifest>
npm run producer:preflight -- --composition <composition-id>
npm run producer:validate -- --module <validation-module>
npm run producer:stills -- --composition <composition-id>
npm run producer:render -- --composition <composition-id> --slug <slug> --metadata <metadata-json>
npm run smoke:producer-os
npm run smoke:remotion-capabilities
npx remotion compositions src/remotion/index.ts
```

Exact command implementation belongs to the phase plans. The command names
above are the stable roadmap contract.

## 16. Phase Dependencies

```txt
Phase 0 authority and inventory
  -> Phase 1 direct VoxCPM
  -> Phase 2 F5 removal
  -> Phase 3 Web product removal
  -> Phase 4 Producer OS consolidation
  -> Phase 5 asset supply
  -> Phase 6 Remotion capability core
  -> Phase 7 dynamic media and sound
  -> Phase 8 style profiles
  -> Phase 9 quality gates and cleanup
```

Phases 2 and 3 must not start before Phase 1 proves narration without Next.
Phase 5 precedes dynamic-media adoption so every media capability starts with
localization and license tracking. Phase 6 precedes style profiles so profiles
are built from tested capabilities rather than ad hoc effects.

## 17. Milestone And Commit Boundaries

Each phase is an independent implementation plan and review gate. Do not put
all repository deletion into one plan or one commit.

Recommended commit families:

1. `docs: make agent producer the only product roadmap`
2. `feat: add direct voxcpm producer audio runtime`
3. `refactor: remove f5 generation support`
4. `refactor: remove web video product line`
5. `feat: consolidate agent producer operating system`
6. `feat: add producer asset supply and preflight`
7. `feat: add remotion capability core`
8. `feat: add dynamic media and sound design`
9. `feat: add code-driven producer style profiles`
10. `chore: enforce producer-only quality gates`

Every commit must keep the tree verifiable at its phase boundary. Destructive
deletion commits require an immediately preceding replacement commit when a
surviving Producer capability would otherwise break.

## 18. Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Producer TTS silently depends on Next | prove direct VoxCPM in Phase 1 before deletion |
| Shared caption/schema code is deleted | extract producer-owned minimum interfaces first |
| Useful visuals are lost with templates | inventory consumers and promote only proven blocks before deletion |
| Old samples stop listing | keep historical helpers only where call paths prove the need |
| Repository retains conflicting authority | archive old docs and guard current entry documents |
| Remotion package mismatch | exact-version gate before adding capabilities |
| Capability showcase becomes another product | keep it inventory-only and skill-routed |
| Asset library becomes unlicensed or remote | require manifest, checksum, provenance, and local paths |
| Automated review expands into aesthetic scoring | restrict validators to deterministic hard failures |
| Style profiles collapse into color themes | require different composition, motion, texture, media, and sound language |

## 19. Non-Goals

- image generation
- video generation
- ComfyUI, image-to-video, avatar, or talking-head generation
- Web video generator or editor
- persistence, history, project database, or render queue product
- planner-generated arbitrary TSX
- universal scene DSL
- provider-neutral narration abstraction
- F5 compatibility or fallback
- cloud deployment as a roadmap goal
- automatic aesthetic scoring or creative repair
- migration or regeneration of frozen finished samples

## 20. Roadmap Completion Definition

This roadmap is complete only when all statements are true:

1. A new task needs only the Agent Producer skill to discover every supported
   production capability.
2. The full production flow works while the Next application is stopped or no
   longer exists.
3. VoxCPM generation, captioning, and local audio output have no Web route
   dependency.
4. No executable F5 service, adapter, script, config, fallback, or current
   documentation remains.
5. No Web video-generation, editing, regeneration, upload, progress, or export
   product path remains.
6. Remotion Studio and CLI can list, preview, still-render, and MP4-render
   dedicated compositions.
7. Existing visual assets are local, manifest-backed, licensed, and preflighted.
8. Effects, transitions, text fitting, dynamic media, sound design, and style
   profiles are callable Agent Producer capabilities.
9. At least one new video completes the entire final flow and passes all hard
   gates.
10. Frozen old compositions remain readable when their ignored local assets are
    available.
11. README, AGENTS, active docs, skills, package scripts, and Docker topology
    describe one consistent Producer-only system.

The repository is then no longer an AI video Web product with an Agent Producer
side path. It is a focused Agent Producer operating system for deterministic,
code-driven Remotion video production from real topics and existing assets.
