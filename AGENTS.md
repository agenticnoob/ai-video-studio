# Project Knowledge Base

## Authority

`.agents/skills/ai-video-studio-agent-producer/` is the only supported
video-production entrypoint.

`.agents/skills/ai-video-studio-asset-library/` is the separate entrypoint for
reusable asset admission and maintenance; it is not a video-production flow.

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
  metadata; Phase 7 added one maintained proof only.
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
  unavailable.
- Phase 8A style-profile contract and showcase are complete: six typed profiles
  change composition, motion, texture, media, Three.js, caption, and sound
  language, and six code-only inventory fixtures prove the visual boundary.
- Phase 8B style-profile sample contract is complete. Every future scaffold
  requires an explicit validated profile id while the completed Phase 7 proof
  remains unchanged. `TcpHandshakeEditorial` and `TcpHandshakeTerminal` apply
  `editorial-tech` and `retro-terminal` to identical facts with real VoxCPM,
  strict assets, reviewed stills/covers, and H.264/AAC renders.
  Phase 8 is complete. Phase 9A deterministic quality gates are complete: the
  future scaffold owns measured layout/evidence expectations and
  `producer:quality` checks rendered frames, final artifacts, chapters, and Git
  tracking. Phase 9B completed `DnsResolutionExplainer` through real direct
  VoxCPM, strict assets, visual review, H.264/AAC render, code-only covers, and
  the post-render quality gate. Phase 9 is complete and the Roadmap is
  complete; no additional phase has started.
- Iteration authority tracks product capabilities and milestones, not the
  delivery state of an individual video. A composition's render, cover,
  audiovisual review, or quality state does not create, block, or reopen an
  iteration unless an approved milestone explicitly names that composition as
  acceptance evidence. Use composition-local manifests, validation/quality
  modules, research/publishing notes, and ignored artifacts for ordinary
  production status.
- Historical caption/storyboard contracts and `recipes/blocks` plus
  `recipes/timing` remain only for frozen composition compatibility.
- A separate post-Roadmap v1 Agent-managed reusable asset library now admits
  SVG/PNG/JPEG/WebP without prior composition use, provides deterministic
  `producer:library:*` commands plus a local read-only static catalog, and
  cross-validates only future canonical `ProducerAssetManifest` references.
- A separate bounded post-Roadmap `stock-assets-mcp` package now provides a
  local Pexels-only stdio fallback after reviewed-library search. Its
  `acquisition.json` receipt is the only integration boundary; Agent Producer
  localizes the selected candidate through `producer:assets`, and Remotion
  never renders a candidate path or remote URL. This is not Phase 10 and adds
  no HTTP, OAuth, UI, Unsplash, Pixabay, stock video, automatic promotion, or
  automatic deletion. Completed and frozen compositions remain unchanged.
- Normal library intake gives the Agent an ignored inbox folder containing
  assets and any number of shared/overlapping description documents. The Agent
  reads and visually classifies the batch, completes semantics, never asks for
  per-asset authorization/attribution facts, and invokes one atomic ingest per
  accepted item using the repository-wide user-authorization default.

## Chinese Science-Explainer Narration Default

For future Chinese science-explainer narration, default to the user-accepted
`science-explainer-young-male` profile. Its normal mode is
`controllable-clone` with
`voices/clone/science-explainer-young-male.wav` and compact per-beat control
instructions. When highest timbre fidelity is the priority, use
`high-fidelity-clone` with the same WAV and the exact same-name transcript at
`voices/clone/science-explainer-young-male.txt`, and omit the control
instruction. An explicit production brief may override this science-only
default; non-science content retains the existing default clone configuration.
Missing private reference files must fail closed and must not silently fall
back to `lyy`, F5, or another provider.

User audition status: accepted on 2026-07-19.

## Where To Look

| Task | Location |
| --- | --- |
| Current goal | `docs/FINAL_PRODUCT_GOAL.md` |
| Capability / milestone status | `docs/ITERATION_STATUS.md` |
| Individual production status | `src/remotion/<CompositionName>/` |
| Full migration sequence | `docs/AGENT_PRODUCER_ONLY_ROADMAP.md` |
| Video design system | `docs/DESIGN_SYSTEM.md` |
| Deletion ownership | `docs/architecture/agent-producer-only-removal-inventory.json` |
| Producer workflow | `.agents/skills/ai-video-studio-agent-producer/` |
| Asset library management | `.agents/skills/ai-video-studio-asset-library/` |
| Remotion rules | `.agents/skills/remotion-best-practices/` |
| VoxCPM expression | `.agents/skills/ai-video-studio-agent-producer/voxcpm-expression/` |
| Visual inventory | `docs/REMOTION_COMPONENT_LIBRARY.md`, `src/remotion/catalog/` |
| Shared runtime | `src/remotion/standalone-video/` |
| Producer sample OS | `src/remotion/producer-samples/` |
| Asset contract | `docs/PRODUCER_ASSET_CONTRACT.md` |
| Asset runtime | `scripts/lib/producer-assets/` |
| Stock fallback package | `packages/stock-assets-mcp/` |
| Mechanical validation | `scripts/lib/producer-validation.ts` |
| Review-frame planning | `scripts/lib/producer-review-frames.ts` |
| Script ownership | `scripts/AGENTS.md` |
| Historical one-off tools | `scripts/tools/` |

## Production Rules

- Build a dedicated composition for each real topic.
- Inventory primitives, Producer blocks, and standalone runtime helpers before
  adding sample-local components.
- Keep creative judgment with the agent; automate only deterministic production
  operations and hard-failure checks.
- Use code and manifest-backed existing assets only.
- Search the reusable asset catalog before acquiring or authoring equivalent
  visual media; the Agent owns the final scene-level selection judgment.
- Classify every named narration beat as asset-led, code-led, or hybrid before
  any asset search. Code-led beats use repo-owned code and do not call the MCP;
  asset-led or hybrid beats may use `stock-assets-mcp` only after library search.
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
npm run smoke:stock-assets-mcp-alignment
npm run smoke:producer-os
npm run smoke:producer-assets
npm run smoke:producer-audio-direct-voxcpm
npm run smoke:producer-audio-tools
npm run smoke:remotion-version-gate
npm run smoke:remotion-capabilities
npm run smoke:producer-media-sound
npm run smoke:producer-style-profiles
npm run smoke:producer-style-profile-sample-contract
npm run smoke:producer-quality-gates
npm run smoke:producer-final-acceptance
npm run producer:validate -- --module <validation-module>
npm run producer:stills -- --composition <composition-id>
```

Future sample command order starts with
`npm run producer:scaffold -- --name <CompositionName> --slug <slug> --style-profile <profile-id>`, then
asset supply/preflight, validation, and representative still review, and ends
with `npm run producer:render -- --composition <composition-id>` followed by
`npm run producer:quality -- --module <quality-module>`.

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
