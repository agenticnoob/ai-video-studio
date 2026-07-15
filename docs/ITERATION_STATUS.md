# Iteration Status

Last updated: 2026-07-15

## Current Authority

`.agents/skills/ai-video-studio-agent-producer/` is the only supported
video-production entrypoint.

Visual production uses code and existing assets only.

The implementation sequence is defined by
`docs/AGENT_PRODUCER_ONLY_ROADMAP.md`.

## Current Milestone

Phase 0 — authority reset and deletion inventory is implemented.

The Producer-only Roadmap is committed at `d09f4e0`, and its Phase 0
implementation plan is committed at `9a58704`.

Runtime deletion has not started. The current tree still contains unsupported
Web and F5 code, and the shared Producer audio helper still depends on Next
`/api/tts`.

## Phase 0 Deliverables

- machine-readable keep/extract/delete inventory
- executable architecture alignment smoke
- compact Producer-only README, AGENTS, goal, status, and roadmap entry docs
- Agent Producer Skill without Web, F5 generation, image generation, video
  generation, or generated evidence-card guidance
- archived Web/Planner product documentation
- explicit removal banners on current F5 documents pending Phase 2 deletion

## Verification

Passed with fresh evidence:

- `npm run smoke:agent-producer-architecture`
- `npm run smoke:skill-alignment`
- Docker `npx tsc --noEmit --pretty false`
- Docker `npm run build`
- Docker `npx remotion compositions src/remotion/index.ts`
- Docker Prettier check for all changed current files
- active-document forbidden-guidance scan
- `git diff --check`

Repository-wide `npm run lint` remains non-zero because of 75 pre-existing
errors in old Producer generation/capture scripts and `BeyondLanguage`, plus 2
warnings under ignored `public/generated/`. The new architecture smoke's two
initial `no-undef` errors were fixed and no changed file remains in the final
lint error list. This existing lint debt is outside the documentation-only
Phase 0 scope and must not be described as a passing full-repository lint gate.

## Next Bounded Slice

Create and execute the Phase 1 direct VoxCPM Producer runtime plan. Do not start
F5 or Web deletion before the direct VoxCPM replacement passes independently.

## Frozen History

Prior delivery history is preserved in
`docs/archive/2026-07-15-pre-producer-only-iteration-status.md`.
