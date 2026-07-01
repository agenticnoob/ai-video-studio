# Agent Producer Workflow Design

Status: accepted direction for the next bounded workflow slice.

## Problem

The current web prompt entrypoint is useful for quick staged generation, but it
is too narrow for high-quality information videos. Good videos often need
research, current facts, website or product screenshots, source curation,
voice-first timing, still-frame inspection, and revision before export.

The repo already has the right render foundation:

```txt
StoryboardPlan -> TTS/captions -> template implementation -> VideoProject -> ProjectVideo
```

It also has a large local primitive catalog under `src/remotion/primitives/`.
The missing layer is a local agent workflow that uses those assets deliberately
before falling back to custom standalone TSX.

## Decision

Add a repo-local Agent Producer workflow. The agent acts as a local producer
around the existing app:

```txt
topic
-> research and source capture
-> primitive inventory pass
-> narration beats
-> TTS and captions
-> VideoProject or standalone assembly
-> Remotion still review
-> final handoff
```

The workflow is documented in:

- `.agents/skills/ai-video-studio-agent-producer-workflow/SKILL.md`

The workflow is not a replacement for the web app. The web app remains the
Studio surface for prompt entry, preview, editing, and export. The producer
workflow is the higher-quality local path for videos that benefit from agent
research, screenshots, and render-review loops.

## Layer Model

Use this order when creating visuals:

```txt
primitive first
block second
recipe only if reusable
template when ready for product generation
```

Definitions:

- `primitive`: a reusable Remotion component under `src/remotion/primitives/`.
- `block`: a semantic combination of primitives inside a template or sample.
- `recipe`: a reusable visual treatment inside a registered template.
- `template`: the provider-visible segment implementation mechanism selected by
  `templateId`.
- `VideoProject`: the normal preview/edit/export boundary.

This keeps recipe work from becoming a parallel component system. Recipes
should compose primitives and blocks; they should not replace them.

## Output Modes

### Main Product Mode

Use this when the result should be editable in the current app.

Output:

- a schema-valid `VideoProject`
- one primary `templateId` per segment
- segment-owned narration audio/captions
- preview/export through `ProjectVideo`

This is the default mode.

### Standalone Sample Mode

Use this when a finished-video-first sample needs visuals that current
templates cannot express yet.

Output:

- a dedicated `src/remotion/<SampleName>/` composition
- static/generated assets under ignored local artifact paths
- registration in `src/remotion/Root.tsx`
- Remotion stills and, when practical, mp4 validation

Standalone samples are evidence and source material for later reusable
primitives, blocks, or recipes. They are not automatically product templates.

## First Validation Slice

The first practical use should be one real information video, such as:

- a 45-60 second Chinese open-source project intro
- a 45-60 second technical news explainer
- a short data-analysis video using a current source table or screenshot

Acceptance:

- source facts and screenshots are captured or explicitly noted as unavailable
- narration beats are written before visual durations are locked
- TTS or TTS-ready narration owns timing
- candidate primitives are listed before new visuals are written
- either a `VideoProject` or standalone composition is produced
- at least three representative stills are rendered and inspected
- generated screenshots/audio/video stay local-only unless explicitly requested
- docs are updated if the run promotes a reusable primitive, block, or recipe

## Non-Goals

- no broad media library
- no persistence/history
- no production queue
- no arbitrary provider-generated TSX as the normal path
- no direct LLM exposure of primitive props
- no multi-template-per-segment orchestration
- no automatic visual scoring or repair loop in this slice

## Documentation Updates

Keep these files aligned when the workflow changes:

- `.agents/skills/ai-video-studio-agent-producer-workflow/SKILL.md`
- `README.md`
- `docs/ITERATION_STATUS.md`
- `docs/VISUAL_RECIPE_ROADMAP.md`
- `docs/REMOTION_PRIMITIVES.md`
- `docs/REMOTION_COMPONENT_LIBRARY.md`

## Verification

For documentation-only updates:

```bash
git diff --check
python3 /home/zzzxc/.codex/skills/.system/skill-creator/scripts/quick_validate.py .agents/skills/ai-video-studio-agent-producer-workflow
```

For the first real producer run, add the smallest relevant Docker checks:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit --pretty false'
```
