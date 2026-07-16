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

## Documentation Hooks

Update only the matching authority:

- primitive contract: `docs/REMOTION_PRIMITIVES.md`
- component/block/effect inventory: `docs/REMOTION_COMPONENT_LIBRARY.md`
- supported workflow: Agent Producer Skill
- roadmap status: `docs/AGENT_PRODUCER_ONLY_ROADMAP.md`

Historical productization guidance is preserved in
`docs/archive/2026-07-15-pre-producer-only-producer-promotion-gate.md`.
