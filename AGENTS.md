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
- Legacy Web code still exists during the migration but is unsupported.
- The F5 narration service, adapters, scripts, config, and current provider docs
  were removed in Phase 2.
- The direct VoxCPM Producer runtime under `scripts/lib/producer-audio/` owns
  future narration without starting Next or using a repository HTTP route.

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
| Mechanical validation | `scripts/lib/producer-validation.ts` |
| Review-frame planning | `scripts/lib/producer-review-frames.ts` |

## Production Rules

- Build a dedicated composition for each real topic.
- Inventory primitives, Producer blocks, and standalone runtime helpers before
  adding sample-local components.
- Keep creative judgment with the agent; automate only deterministic production
  operations and hard-failure checks.
- Use code and manifest-backed existing assets only.
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
npm run smoke:skill-alignment
npm run smoke:producer-audio-direct-voxcpm
npm run smoke:producer-audio-tools
npm run producer:validate -- --module <validation-module>
npm run producer:stills -- --composition <composition-id>
```

Current full checks are Docker-first:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit --pretty false'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run build'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx remotion compositions src/remotion/index.ts'
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
