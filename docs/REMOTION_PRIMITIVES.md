# Remotion Primitives

Status: active Producer-only primitive contract.

`.agents/skills/ai-video-studio-agent-producer/` is the only supported
video-production entrypoint.

Visual production uses code and existing assets only.

The implementation sequence is defined by
`docs/AGENT_PRODUCER_ONLY_ROADMAP.md`.

Primitives are small, reusable, deterministic Remotion visual units. They are
not page UI, complete videos, planner options, or top-level product concepts.

## Sources Of Truth

- implementation: `src/remotion/primitives/`
- discovery metadata: `src/remotion/catalog/primitive-catalog.ts`
- Agent-facing quick reference:
  `.agents/skills/ai-video-studio-agent-producer/remotion-primitives/REMOTION_PRIMITIVES.md`
- component ownership: `docs/REMOTION_COMPONENT_LIBRARY.md`

The source catalog, not this prose file, is the exact current primitive list.

## Categories

Use the narrowest category matching the visual responsibility:

- backgrounds
- charts and data graphics
- cinematic treatments
- elements, labels, badges, and panels
- layouts and repeated-content arrangements
- logos and brand marks
- media presentation
- text and typography treatments
- transitions and bridges
- scene-level blocks composed from primitives

## Primitive Contract

Every maintained primitive should:

- accept typed render-focused props
- derive animation from frame and composition configuration
- expose explicit size/layout behavior
- use local assets or asset inputs supplied by the composition
- render deterministically at representative frames
- avoid topic facts, narration, and publishing copy
- avoid arbitrary provider-authored structures
- document external source and license when applicable

## Agent Selection

For each narration beat:

1. approve the beat's subject, action, shot language, meaning, composition, and
   silhouette in composition-local `visual-intent.ts`
2. search the primitive catalog and Producer blocks
3. choose the smallest existing unit that fits the approved intent
4. combine primitives in a composition-local scene when necessary
5. create a new primitive only when the responsibility is reusable beyond the
   current topic

Do not force a primitive into a beat merely because it exists. Do not make all
scenes look like equal-weight dashboard cards. A primitive may be reused, but
a future renderer must not import a finished dedicated composition as its scene
implementation.

## Motion Rules

- Use `useCurrentFrame()`, `interpolate()`, `spring()`, `Sequence`, `Series`,
  and transition APIs.
- Use deterministic seeds for particles and procedural layouts.
- Convert render-critical CSS animation and real-time interaction to
  frame-driven behavior.
- Test start, active, focus, exit, and transition-overlap frames.

## Asset Rules

- Formal renders use local or localized existing assets.
- No primitive ships with a remote default URL.
- Images/video must define crop, fit, and safe-area behavior.
- Lottie/Rive/3D assets are admitted individually after deterministic review.
- Missing evidence becomes an honest code-rendered information graphic, not a
  fabricated capture.

## New Primitive Checklist

- implementation is focused and typed
- index/catalog export is added
- source/license metadata is recorded
- representative fixtures cover short/long text and supported canvas profiles
- repeated stills are deterministic
- the Agent Producer Skill or its primitive reference explains when to use it
- a real composition or capability showcase proves it
- `git diff --check`, TypeScript, lint, and relevant render checks pass

Historical template-centered primitive guidance is preserved in
`docs/archive/2026-07-15-pre-producer-only-remotion-primitives.md`.
