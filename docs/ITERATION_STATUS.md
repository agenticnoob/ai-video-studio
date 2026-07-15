# Iteration Status

Last updated: 2026-07-16

## Current Authority

`.agents/skills/ai-video-studio-agent-producer/` is the only supported
video-production entrypoint.

Visual production uses code and existing assets only.

The implementation sequence is defined by
`docs/AGENT_PRODUCER_ONLY_ROADMAP.md`.

## Current Milestone

Phase 2 — remove F5 generation completely — is complete and verified.

Phase 0 authority reset and Phase 1 direct VoxCPM runtime remain complete.
Phase 3 Web product removal has not started.

## Implemented Phase 2 Boundary

- removed the tracked runtime service, helper tree, Docker overlays, direct,
  Next-adapter, real-runtime, and staged smoke entrypoints
- removed the application adapter and unused Producer request-plan adapter
- collapsed retained Web TTS provider config, request schema, selection, and
  synthesis to VoxCPM only
- removed alternate-provider environment keys, package commands, compose
  forwarding, production wrapper dependencies, and current provider/handoff
  documentation
- removed obsolete one-off generation entrypoints for frozen samples while
  preserving their compositions and historical generated metadata unchanged
- kept `/api/tts`, staged generation, Web rendering, planner/template code,
  and UI for the separate Phase 3 deletion owner
- preserved ignored private model, voice, audio, generated, and render files

## Verification

RED evidence:

- the Phase 2 architecture guard failed because `services/f5-tts` was still a
  tracked runtime boundary
- the provider-boundary smoke failed because the old request schema still
  accepted the removed provider

GREEN evidence:

- `npm run smoke:agent-producer-architecture`
- `npm run smoke:provider-boundary`
- `npm run smoke:producer-audio-direct-voxcpm`
- `npm run smoke:producer-audio-tools`
- `npm run smoke:producer-validation`
- `npm run smoke:skill-alignment`
- affected frozen-composition contract smokes
- Docker `npx tsc --noEmit --pretty false`
- Docker `npm run build`
- Docker `npx remotion compositions src/remotion/index.ts`
- changed-file ESLint and Prettier
- production shell syntax and base/prod Compose config checks
- Phase 2 forbidden scan, artifact/frozen-boundary review, and
  `git diff --check`

The first Docker typecheck correctly exposed an ignored local artifact under
`public/generated/` as being inside the TypeScript source scan. `tsconfig.json`
now excludes that already-local-only artifact boundary; the artifact itself was
not changed or deleted, and the repeated typecheck and build pass.

Repository-wide Docker lint was re-run and remains at the historical 75 errors
plus 2 ignored generated warnings. No changed Phase 2 file appears in that
failure set, so this phase does not claim a clean full lint gate.

## Next Bounded Slice

After the Phase 2 closure commit, Phase 3 Web video product removal is next.
Phase 3 has not started and requires a separate plan.

## Frozen History

Existing finished compositions, historical generated-audio provider metadata,
ignored private voice/model files, and local generated artifacts remain
read-only or local-only. Prior delivery history remains under `docs/archive/`.
