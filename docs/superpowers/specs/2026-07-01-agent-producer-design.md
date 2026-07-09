# Agent Producer Design

Status: accepted direction for the default personal production path.

## Problem

The current web prompt entrypoint is useful for quick staged generation, but it
is the wrong default for high-quality finished videos. A good local producer
run should use the project's existing Remotion components directly: primitives,
recipe blocks, standalone timing/audio/caption helpers, local data modules,
TTS-first timing, still-frame inspection, and revision before export.

The repo already has concrete examples of that path, especially
`WorldCupBettingAnalysis`: local data, generated narration, a dedicated
composition, and shared `src/remotion/standalone-video/` runtime helpers. It
also has a large primitive catalog under `src/remotion/primitives/` and
grouped blocks under `src/remotion/recipes/blocks/`.

The missing layer is a local Agent Producer skill that composes those assets into a
purpose-built video instead of sending a bigger prompt through the page.

## Decision

Add a repo-local Agent Producer skill. The agent acts as a local producer
and component composer:

```txt
topic
-> research and source capture
-> narration beats
-> TTS and captions
-> primitive/block/runtime inventory
-> explicit data model
-> dedicated Remotion composition
-> Remotion still review
-> mp4/render review when practical
-> final handoff
```

The skill is documented in:

- `.agents/skills/ai-video-studio-agent-producer/SKILL.md`

The Agent Producer path is not a wrapper around the page prompt. The old web/editor final
goal is parked indefinitely and remains a secondary productization surface for
prompt entry, editing, selected-segment regeneration, and export. The producer
path's default output is a dedicated Remotion composition assembled from
repo-owned components. `VideoProject` is a productization target, not the
default local producer output.

## Layer Model

Use this order when creating visuals:

```txt
existing primitive first
existing block second
sample-specific scene/block third
dedicated composition fourth
recipe/template only after reuse is proven
```

Definitions:

- `primitive`: a reusable Remotion component under `src/remotion/primitives/`.
- `block`: an existing grouped renderer under `src/remotion/recipes/blocks/`,
  `src/remotion/standalone-video/`, or a sample-local composition of
  primitives.
- `dedicated composition`: a finished-video-first Remotion output such as
  `WorldCupBettingAnalysis`.
- `recipe`: a reusable visual treatment inside a registered template.
- `template`: the provider-visible segment implementation mechanism selected by
  `templateId`.
- `VideoProject`: the web productization preview/edit/export boundary.

This keeps recipe work from becoming a parallel component system. The local
producer first proves the video as a dedicated composition, then promotes only
the reusable parts back into primitives, blocks, recipes, or templates.

## Output Modes

### Component-Composed Standalone Mode

Use this by default when the user asks for a good finished video.

Output:

- a dedicated `src/remotion/<SampleName>/` composition
- explicit `types.ts`, `data.ts`, `script.ts`, or generated audio metadata
- scenes composed from primitives, existing recipe blocks, standalone runtime
  helpers, and small sample-local renderers
- static/generated assets under ignored local artifact paths
- registration in `src/remotion/Root.tsx`
- Remotion stills and, when practical, mp4 validation

This is the default mode.

### Parked Web Productization Mode

Use this when the result should be editable in the current app.

Output:

- a schema-valid `VideoProject`
- one primary `templateId` per segment
- segment-owned narration audio/captions
- preview/export through `ProjectVideo`

Use this mode only when the user explicitly needs the page editor,
selected-segment regeneration, app export, or the normal staged generation
path.

## First Validation Slice

The first practical use should be one real information video, such as:

- a 45-60 second Chinese open-source project intro
- a 45-60 second technical news explainer
- a short data-analysis video using a current source table or screenshot

Acceptance:

- source facts and screenshots are captured or explicitly noted as unavailable
- source-backed evidence beats attempt real capture before generated
  source-card fallback; fallback reasons are recorded and fallback cards are not
  described as screenshots
- fallback/source-card assets are not rendered as visible screenshot evidence
  when no real captured screenshot exists; failed capture reasons stay in data
  or handoff text, not in the video frame
- narration beats are written before visual durations are locked
- TTS or TTS-ready narration owns timing
- candidate primitives, blocks, and standalone runtime helpers are listed
  before new visuals are written
- a dedicated `src/remotion/<SampleName>/` composition is produced by default
- `VideoProject` is used only with an explicit reason tied to web editing or
  productization
- at least three representative stills are rendered and inspected
- generated screenshots/audio/video stay local-only unless explicitly requested
- docs are updated if the run promotes a reusable primitive, block, or recipe

## Non-Goals

- no broad media library
- no persistence/history
- no production queue
- no web prompt as the primary production method
- no arbitrary provider-generated TSX as the normal path
- no direct LLM exposure of primitive props
- no multi-template-per-segment orchestration
- no automatic visual scoring or repair loop in this slice

## Documentation Updates

Keep these files aligned when the skill changes:

- `.agents/skills/ai-video-studio-agent-producer/SKILL.md`
- `README.md`
- `docs/FINAL_PRODUCT_GOAL.md`
- `docs/ITERATION_STATUS.md`
- `docs/VISUAL_RECIPE_ROADMAP.md`
- `docs/REMOTION_PRIMITIVES.md`
- `docs/REMOTION_COMPONENT_LIBRARY.md`

## Verification

For documentation-only updates:

```bash
git diff --check
python3 /home/zzzxc/.codex/skills/.system/skill-creator/scripts/quick_validate.py .agents/skills/ai-video-studio-agent-producer
```

For the first real producer run, add the smallest relevant Docker checks:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit --pretty false'
```
