# Iteration Status

Last updated: 2026-07-16

## Current Authority

`.agents/skills/ai-video-studio-agent-producer/` is the only supported
video-production entrypoint.

Visual production uses code and existing assets only.

The implementation sequence is defined by
`docs/AGENT_PRODUCER_ONLY_ROADMAP.md`.

## Current Milestone

Phase 1 — direct VoxCPM Producer runtime is complete.

Phase 0 authority reset remains complete. Phase 1 runtime code, focused smokes,
future scaffold migration, architecture guards, current documentation, Docker
validation, changed-file lint/format, forbidden scans, and a live two-scene
VoxCPM run are verified.

## Implemented Phase 1 Boundary

- Producer-owned three-mode direct VoxCPM transport
- private reference audio/transcript reads from ignored `voices/clone/`
- punctuation splitting, PCM silence trim, WAV concatenation, and measured duration
- clean duration-derived captions with separate `ttsText` and `displayText`
- per-scene progress, fingerprint validation, and failed-batch recovery
- fail-closed required narration and explicit intentional-silence policy
- deterministic generated audio metadata, duration constant, and summary
- future scaffold and architecture guard without an application origin

Legacy F5 and Web code remains unsupported and untouched for Phase 2 and Phase
3. Frozen compositions and historical provider metadata remain read-only.

## Verification

Passed with fresh evidence during implementation:

- `npm run smoke:producer-audio-direct-voxcpm`
- `npm run smoke:producer-audio-tools`
- `npm run smoke:producer-validation`
- `npm run smoke:agent-producer-architecture`
- `npm run smoke:skill-alignment`
- Docker `npx tsc --noEmit --pretty false`
- Docker `npm run build`
- changed-file ESLint
- changed-file Prettier check
- future Producer forbidden-dependency scan
- `git diff --check`

The configured VoxCPM service returned health HTTP 200. With Next absent from
the flow, a local-only two-scene high-fidelity clone run produced measured WAV
durations of 2.458958 and 2.841063 seconds, totaling 159 frames. A second run
reused both scene records while its request callback was configured to fail,
proving file-backed recovery. All live artifacts remain ignored under
`public/generated/phase1-direct-voxcpm-live-smoke/`.

Repository-wide `npm run lint` is not a passing gate: the known baseline remains
75 existing errors plus 2 ignored generated warnings. Phase 1 added no
changed-file lint errors.

## Next Bounded Slice

Phase 2 F5 deletion is the next Roadmap slice, but it has not started. Stop at
the Phase 1 boundary and create a separate Phase 2 plan before any deletion.

## Frozen History

Prior delivery history is preserved in
`docs/archive/2026-07-15-pre-producer-only-iteration-status.md`.
