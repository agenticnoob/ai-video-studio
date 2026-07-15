# Iteration Status

Last updated: 2026-07-16

## Current Authority

`.agents/skills/ai-video-studio-agent-producer/` is the only supported
video-production entrypoint.

Visual production uses code and existing assets only.

The implementation sequence is defined by
`docs/AGENT_PRODUCER_ONLY_ROADMAP.md`.

## Current Milestone

Phase 3 — remove the Web video product line — is complete and verified.

Phase 0 authority reset, Phase 1 direct VoxCPM runtime, and Phase 2 F5 removal
remain complete. Phase 4 Producer OS consolidation is next and has not started.

## Implemented Phase 3 Boundary

- removed the Next application, Web APIs, generation/editor UI and hooks,
  Lambda routes, planner/compiler, staged generation, template system,
  `ProjectVideo`, `ScriptedVideo`, `SpotlightVideo`, and
  `RecipeShowcase`
- removed Web-only render, progress, upload, TTS, provider, and project
  contracts plus their focused smokes and one-off Web TTS generators
- removed Next, AI SDK, Remotion Player/Lambda, Web utility dependencies,
  production deployment files, and Web package scripts
- replaced `web`/`studio`/`render` Compose services with one
  Remotion-oriented `producer` service
- moved future Producer caption typing into
  `src/remotion/standalone-video/caption-types.ts`
- reduced `src/lib/storyboard-plan-schema.ts` and
  `src/lib/template-registry.ts` to frozen compatibility contracts
- retained `src/lib/caption-schema.ts`, `src/remotion/recipes/blocks/`, and
  `src/remotion/recipes/timing/` only because frozen compositions import them
- preserved all finished compositions, historical provider metadata, ignored
  private voice/audio/model data, `public/generated/`, and `out/`

## Verification

RED evidence:

- `npm run smoke:agent-producer-web-removal` exited 1 because `src/app`
  still contained 16 tracked files

GREEN evidence:

- `npm run smoke:agent-producer-web-removal`
- `npm run smoke:agent-producer-architecture`
- `npm run smoke:skill-alignment`
- direct VoxCPM and Producer audio tooling smokes
- Producer validation and review-frame smokes
- standalone runtime and affected frozen-composition contract smokes
- Docker `npx tsc --noEmit --pretty false`
- Docker `npm run build`
- Docker `npx remotion compositions src/remotion/index.ts`
- changed-file ESLint and Prettier
- Compose config, shell syntax, Phase 3 forbidden scan, frozen/artifact review,
  and `git diff --check`

The first Docker typecheck exposed that frozen `TimelineProgressBlock` still
imports `recipes/timing`. CodeGraph confirmed seven frozen composition
consumers, so the timing helper was restored byte-for-byte and recorded as
historical compatibility rather than weakening or editing frozen callers.

Repository-wide Docker lint now reports 41 errors plus 2 ignored generated
warnings, down from the Phase 2 baseline of 75 plus 2 because the deleted Web
closure owned 34 of those errors. No changed Phase 3 file appears in the
remaining error set, so this phase does not claim a clean whole-repository lint
gate.

An additional unchanged baseline was confirmed after the required gate:
`smoke:producer-sample-manifest` passes its manifest check, then the bundled
promotion-gate check fails because its old enum still requires “promote to
recipe/template” while the active promotion doc forbids those choices.
`scripts/producer-promotion-gate-smoke.mjs`, the manifest, and
`docs/PRODUCER_PROMOTION_GATE.md` are unchanged from HEAD. Phase 4 owns this
transitional Producer Sample OS migration; `smoke:evidence-lens` still passes.

## Next Bounded Slice

Phase 4 — consolidate Agent Producer OS — is next. Phase 4 has not started and
requires a separate plan.

## Frozen History

Existing finished compositions, historical generated-audio provider metadata,
ignored private voice/model files, and local generated artifacts remain
read-only or local-only. Prior delivery history remains under `docs/archive/`.
