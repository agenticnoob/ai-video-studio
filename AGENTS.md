# Project Knowledge Base

## Authority

`.agents/skills/ai-video-studio-agent-producer/` is the only supported
video-production entrypoint.

Visual production uses code and existing assets only.

The implementation sequence is defined by
`docs/AGENT_PRODUCER_ONLY_ROADMAP.md`.

Read `docs/FINAL_PRODUCT_GOAL.md`, then `docs/ITERATION_STATUS.md`, then the
Roadmap. Use CodeGraph before source dependency decisions because this
repository contains `.codegraph/`.

## Current Repository Truth

- The supported output is a dedicated Remotion composition under
  `src/remotion/<CompositionName>/`.
- VoxCPM is the only supported provider for new narration.
- Remotion Studio and CLI are the preview, still, and render surfaces.
- Existing finished compositions and their generated provider metadata are
  frozen read-only references.
- Phase 3 removed the legacy Web video product, Next packaging, planner,
  templates, editor, and Web generation/render routes.
- The F5 narration service, adapters, scripts, config, and current provider docs
  were removed in Phase 2.
- The direct VoxCPM Producer runtime under `scripts/lib/producer-audio/` owns
  future narration without starting Next or using a repository HTTP route.
- The Docker `producer` service owns Studio and Docker-first verification.
- Phase 4 completed the strict maintained sample manifest plus executable
  scaffold, validation, review-frame, and render command chain.
- Phase 5 completed strict asset manifests, manual/URL localization, checksum,
  provenance/license/media metadata, FFmpeg normalization, and preflight.
- Every pre-Phase-7 Producer registry entry remains `frozen-reference`
  metadata; Phase 7 adds one maintained proof only.
- Phase 6 Remotion capability core is complete: every installed Remotion
  package is exact `4.0.489`; Producer-owned effects, guarded Chinese text
  fitting, official transition presets/timing, light-leak/film-burn treatment,
  and HTML/SVG/image/video canvas proofs are available in the isolated
  capability showcase.
- `@remotion/transitions`, `@remotion/light-leaks`, `@remotion/gif`,
  `@remotion/media`, `@remotion/lottie`, and `@remotion/motion-blur` are exact
  `4.0.489` and remain inside the uniform Remotion closure.
- Phase 7 local media/motion/sound modules, asset audio-QC, and the maintained
  proof are complete with real VoxCPM narration, strict preflight, reviewed
  stills/covers, and an H.264/AAC render. Local video keeps Remotion's official
  native-video fallback available for LAN HTTP Studio, where WebCodecs may be
  unavailable. Phase 8 is next and has not started.
- Historical caption/storyboard contracts and `recipes/blocks` plus
  `recipes/timing` remain only for frozen composition compatibility.

## Where To Look

| Task | Location |
| --- | --- |
| Current goal | `docs/FINAL_PRODUCT_GOAL.md` |
| Current milestone | `docs/ITERATION_STATUS.md` |
| Full migration sequence | `docs/AGENT_PRODUCER_ONLY_ROADMAP.md` |
| Deletion ownership | `docs/architecture/agent-producer-only-removal-inventory.json` |
| Producer workflow | `.agents/skills/ai-video-studio-agent-producer/` |
| Remotion rules | `.agents/skills/remotion-best-practices/` |
| VoxCPM expression | `.agents/skills/ai-video-studio-agent-producer/voxcpm-expression/` |
| Visual inventory | `docs/REMOTION_COMPONENT_LIBRARY.md`, `src/remotion/catalog/` |
| Shared runtime | `src/remotion/standalone-video/` |
| Producer sample OS | `src/remotion/producer-samples/` |
| Asset contract | `docs/PRODUCER_ASSET_CONTRACT.md` |
| Asset runtime | `scripts/lib/producer-assets/` |
| Mechanical validation | `scripts/lib/producer-validation.ts` |
| Review-frame planning | `scripts/lib/producer-review-frames.ts` |

## Production Rules

- Build a dedicated composition for each real topic.
- Inventory primitives, Producer blocks, and standalone runtime helpers before
  adding sample-local components.
- Keep creative judgment with the agent; automate only deterministic production
  operations and hard-failure checks.
- Use code and manifest-backed existing assets only.
- Run maintained assets through `producer:assets` and `producer:preflight`
  before representative stills.
- Attempt real capture for source-backed evidence. If capture is unavailable,
  record the reason outside the frame and use an honest code-rendered
  information graphic.
- Render covers as Remotion `<Still>` compositions in 16:9 and 9:16.
- Keep all render-critical motion frame-driven with Remotion APIs.
- Keep generated/local artifacts out of source control unless explicitly
  requested.

## Forbidden Behaviors

- Do not invoke Web prompt generation, `VideoProject`, storyboard planning,
  segment regeneration, editor export, progress APIs, or Lambda rendering for
  new work.
- Do not restore F5, a second narration provider, or a fallback path.
- Do not invoke image generation or video generation for scenes, evidence,
  textures, backgrounds, covers, or promotional assets.
- Do not modify or regenerate frozen compositions merely to adopt new tooling.
- Do not hide missing evidence behind a fabricated screenshot.
- Do not use CSS animations, CSS transitions, or Tailwind animation utilities
  for render-critical motion.

## Validation

Use the smallest focused checks first:

```bash
npm run smoke:agent-producer-architecture
npm run smoke:agent-producer-web-removal
npm run smoke:skill-alignment
npm run smoke:producer-os
npm run smoke:producer-assets
npm run smoke:producer-audio-direct-voxcpm
npm run smoke:producer-audio-tools
npm run smoke:remotion-version-gate
npm run smoke:remotion-capabilities
npm run smoke:producer-media-sound
npm run producer:validate -- --module <validation-module>
npm run producer:stills -- --composition <composition-id>
```

Future sample command order starts with
`npm run producer:scaffold -- --name <CompositionName> --slug <slug>`, then
asset supply/preflight, validation, and representative still review, and ends
with `npm run producer:render -- --composition <composition-id>`.

Current full checks are Docker-first:

```bash
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npx tsc --noEmit --pretty false'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run lint'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run build'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npx remotion compositions src/remotion/index.ts'
git diff --check
```

When render code changes, add representative stills and inspect them. Audio
runtime changes do not require re-rendering frozen compositions.

## Completion Summary

End development work with:

- completed work
- key modified files
- verification evidence
- known issues, if any
- next bounded step

Do not push unless the user explicitly asks.
