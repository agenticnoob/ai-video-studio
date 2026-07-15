# REMOTION KNOWLEDGE BASE

## OVERVIEW

`src/remotion` is the deterministic Agent Producer rendering surface.
Supported new work is a dedicated composition; there is no shared Web project
preview/export composition or planner-selected template runtime.

## STRUCTURE

```txt
src/remotion/
|-- index.ts                  # Remotion entry
|-- Root.tsx                  # dedicated/frozen composition registry
|-- primitives/               # maintained visual primitives
|-- catalog/                  # Agent-facing primitive discovery
|-- standalone-video/         # Producer timing/audio/caption/canvas runtime
|-- producer-samples/         # future sample manifest, scaffold, and blocks
|-- recipes/blocks/           # frozen composition compatibility only
|-- recipes/timing/           # direct dependency of frozen recipe blocks
|-- standalone-samples/       # frozen reference compositions
`-- <CompositionName>/        # purpose-built dedicated compositions
```
## WHERE TO LOOK

| Task | Location | Notes |
| --- | --- | --- |
| Composition registry | `Root.tsx` | Register dedicated compositions and Stills. |
| Visual primitives | `primitives/`, `catalog/` | Inventory before adding local components. |
| Producer runtime | `standalone-video/` | Future timing, captions, audio, canvas profiles. |
| Producer Sample OS | `producer-samples/` | Maintained manifests, scaffold, and blocks. |
| Frozen recipe compatibility | `recipes/blocks/`, `recipes/timing/` | Do not extend for future work. |

## CONVENTIONS

- Load `.agents/skills/remotion-best-practices/SKILL.md` before render edits.
- Keep motion frame-driven with Remotion APIs.
- Use fixed composition bounds and deterministic local assets.
- Build topic data, narration, and scene order inside the dedicated
  composition.
- Use `standalone-video/caption-types` for future Producer captions.
- Treat finished compositions and historical recipe helpers as read-only.

## ANTI-PATTERNS

- Do not restore `ProjectVideo`, `VideoProject`, `src/templates`, a
  planner/compiler, or RecipeShowcase.
- Do not use CSS animation, CSS transitions, or wall-clock timers.
- Do not add provider/LLM logic to render code.
- Do not fabricate source captures or generate scene imagery.

## VALIDATION

```bash
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npx tsc --noEmit --pretty false'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npx remotion compositions src/remotion/index.ts'
npm run producer:stills -- --composition <composition-id>
```
