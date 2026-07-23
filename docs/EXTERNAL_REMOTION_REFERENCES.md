# External Remotion References

Status: active Producer-only intake guidance.

`.agents/skills/ai-video-studio-agent-producer/` is the only supported
video-production entrypoint.

Visual production uses code and existing assets only.

The implementation sequence is defined by
`docs/AGENT_PRODUCER_ONLY_ROADMAP.md`.

External Remotion projects are references for component design and narrative
craft. They do not define a Web product model, planner contract, or generation
entrypoint.

## Referenced Projects

- Clippkit: <https://github.com/reactvideoeditor/clippkit>
- Remotion trailer: <https://github.com/remotion-dev/trailer>
- React Video Editor templates:
  <https://github.com/reactvideoeditor/remotion-templates>

Before porting code, verify the current license, source commit, runtime
dependencies, and whether the behavior remains deterministic under Remotion
rendering.

## Intake Boundary

```txt
external idea or component
  -> local candidate
  -> deterministic frame-driven normalization
  -> catalog/review composition
  -> approved composition-local visual-intent.ts selection
  -> real Producer sample
  -> proven primitive/block/effect/transition/style extraction
```

Do not install an external library as a black box when a focused local port is
practical. Do not keep CSS animations, wall-clock timers, remote assets, or
browser-only interaction in render-critical code. An external reference may
inform how an approved beat is implemented, but it does not override the
creative contract or permit importing another finished dedicated composition.

## Clippkit

Use Clippkit as inspiration for reusable intros, typography, charts,
transitions, scenes, and media treatments.

Adopt:

- component categorization and previews
- small, comprehensible local source modules
- explicit props and deterministic timing
- source repository, commit, file, license, and review metadata

Reject:

- treating each component as a complete production workflow
- exposing low-level props to a planner
- importing remote media defaults
- preserving render-critical CSS animation

## Remotion Trailer

Use the Remotion trailer as a narrative and sequencing reference:

- focused scene components
- explicit scene order and duration
- intentional transition bridges
- code/terminal/product demonstrations
- typography with clear hierarchy
- end cards and calls to action

Extract patterns only after a dedicated Agent Producer composition proves
them. A finished-video scene is not automatically a reusable block.

## React Video Editor Templates

The repository's existing RVE-derived primitives remain local component
candidates and catalog entries. Review them through
`src/remotion/catalog/primitive-catalog.ts` and their current local previews.
They are not generation products.

## Admission Checklist

A port is admissible only when:

- its license permits the intended use
- its code and assets are localized
- animation is frame-driven
- repeated still renders are deterministic
- text and media fit the supported canvas profiles
- the Agent Producer Skill can name when to use it
- a real composition or capability showcase demonstrates it

Historical product-model notes are preserved in
`docs/archive/2026-07-15-pre-producer-only-external-remotion-references.md`.
