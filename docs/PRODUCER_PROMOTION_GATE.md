# Producer Promotion Gate

Status: active Producer-only reuse gate.

`.agents/skills/ai-video-studio-agent-producer/` is the only supported
video-production entrypoint.

Visual production uses code and existing assets only.

The implementation sequence is defined by
`docs/AGENT_PRODUCER_ONLY_ROADMAP.md`.

Use this gate after a dedicated composition has passed still and MP4 review.
Promotion is evidence-based reuse extraction, not productization.

## Decisions

| Decision | Result |
| --- | --- |
| stay sample-local | keep topic-specific or unproven work in its composition |
| promote to primitive | extract one small reusable visual responsibility |
| promote to block | extract a semantic combination proven across beats |
| promote to effect | extract a deterministic visual treatment preset |
| promote to transition | extract a reusable bridge and optional SFX mapping |
| promote to style profile | extract a complete proven visual/motion/sound language |

Do not create planner-facing recipes or templates. Phase 4 removed those stale
values from the active Producer sample manifest and classified every existing
finished registry entry as a frozen reference.

## Required Evidence

A promotion candidate records:

- source composition and scenes
- problem it solves
- at least one reviewed still or MP4 state
- proposed responsibility and props
- code/assets to extract
- source and license metadata when relevant
- why it is not topic-specific
- deterministic validation command

## Gate Questions

1. Has a real Producer video proved the treatment?
2. Is the responsibility smaller than a complete scene system?
3. Can topic facts and narration remain outside it?
4. Can it use code and manifest-backed existing assets only?
5. Is motion deterministic and frame-driven?
6. Will another Producer task know when to choose it?
7. For Lottie/Rive or sound assets, did deterministic render and asset/audio
   preflight pass with provenance and license metadata?

Any “no” keeps the candidate sample-local.

Phase 8A provides the typed six-profile registry and deterministic inventory
fixtures. That registry is an available Producer constraint surface, but a
specific profile is not considered proven for production merely because its
isolated fixture renders. `TcpHandshakeEditorial` and `TcpHandshakeTerminal`
now prove `editorial-tech` and `retro-terminal` in real dedicated compositions
with narration, asset preflight, still/cover review, sound, and MP4 evidence.
Never retrofit a completed or frozen composition to manufacture promotion
evidence. Phase 8B style-profile sample contract is complete: every future
scaffold records one validated profile id. Phase 8 is complete.
Phase 9A deterministic quality gates are complete. Future samples run
`producer:quality` after render and before promotion; a passing mechanical gate
does not replace actual visual/audio review. Phase 9B completed
`DnsResolutionExplainer` with both visual review and the mechanical quality
gate. Phase 9 and the Roadmap are complete; promotion still requires separate
reuse evidence and Agent judgment.

## Documentation Hooks

Update only the matching authority:

- primitive contract: `docs/REMOTION_PRIMITIVES.md`
- component/block/effect inventory: `docs/REMOTION_COMPONENT_LIBRARY.md`
- supported workflow: Agent Producer Skill
- roadmap status: `docs/AGENT_PRODUCER_ONLY_ROADMAP.md`

Historical productization guidance is preserved in
`docs/archive/2026-07-15-pre-producer-only-producer-promotion-gate.md`.
