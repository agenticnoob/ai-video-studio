# V1 Segment-First Video Orchestrator Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Evolve `ai-video-studio` from the current single-template `VideoSpec` editor into a v1 segment-first video orchestrator that generates one or more segments from a brief, previews the assembled full video, supports segment-level regeneration, and exports the final result.

**Architecture:** Keep the current local-first Next.js + Remotion setup and add a project-level schema above the existing `VideoSpec` template path. In v1, each segment is implemented by exactly one template instance, but the product model must still treat `segment` as the primary user-facing unit and `template` as an internal execution strategy. Reuse the existing `ScriptedVideo` path for the first implementation so the repo gains segment planning and full-video assembly before taking on multi-template overlap or uploaded-video composition.

**Tech Stack:** Next.js App Router, React, TypeScript, Zod, Remotion Player/Composition, local mock generation through `/api/generate`, Docker-first validation.

---

## Scope lock for this plan

This plan implements only the agreed v1 slice:
- text-only input
- AI/mock automatic segment splitting
- one template instance per segment
- full-video preview as primary UI
- visible segment list
- natural-language segment regeneration
- structured fine tuning on selected segment
- local final export

This plan explicitly does **not** implement:
- uploaded existing video input
- layered template overlap
- multi-template execution inside one segment
- timeline UI
- AI-generated brand-new templates

## Repo constraints

**Working directory:** `/data/projects/labs/ai-video-studio`

**Primary files already in play:**
- `src/app/page.tsx`
- `src/app/api/generate/route.ts`
- `src/lib/mock-spec.ts`
- `src/lib/template-registry.ts`
- `src/lib/video-schema.ts`
- `src/remotion/ScriptedVideo/*`
- `src/remotion/Root.tsx`
- `docs/PRODUCT_REQUIREMENTS.md`

**Allowed to create:**
- `docs/plans/*`
- `src/lib/project-schema.ts`
- `src/lib/project-generation.ts`
- `src/lib/project-preview.ts`
- `src/components/project/*`
- `src/remotion/ProjectVideo/*`
- `src/app/api/render/*` if needed for local render wiring

**Do not touch in this plan unless strictly required:**
- Lambda deployment paths under `src/app/api/lambda/*` beyond compatibility checks
- browser automation or Playwright tooling
- workflow docs outside minimal references to the new plan/status

## Validation contract for all implementation tasks

Run from repo root using Docker-first commands unless the task is doc-only:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run build'
```

If a task adds render/export wiring, add a task-local smoke command as well and report its output.

---

## Target end state

By the end of this plan, the product should behave like this:
1. user enters a creative brief
2. `/api/generate` returns a `VideoProject` containing one or more segments
3. the page shows full-video preview as the main surface
4. the page also shows a segment list
5. selecting a segment reveals its editable details
6. user can edit a segment with natural-language revision and regenerate only that segment
7. user can also fine-tune structured fields on the selected segment
8. the full project can be exported locally

---

## Proposed v1 data model

Use a project-level schema similar to this shape:

```ts
type VideoProject = {
  meta: {
    title: string;
    fps: number;
    width: number;
    height: number;
  };
  brief: string;
  segments: VideoSegment[];
};

type VideoSegment = {
  id: string;
  title: string;
  intent: string;
  revisionPrompt?: string;
  durationInFrames: number;
  templateId: "scripted";
  implementation: VideoSpec;
};
```

Important rule:
- `segment` is the user-facing unit
- `implementation` is the template-facing payload
- `templateId` stays explicit even though v1 uses only one template so the next iteration has a stable seam

---

## Task 1: Add project-level schema and helpers

**Objective:** Introduce a project-level model above `VideoSpec` without breaking the current `ScriptedVideo` path.

**Files:**
- Create: `src/lib/project-schema.ts`
- Modify: `src/lib/video-schema.ts`
- Test via typecheck/build only

**Step 1: Create the project schema**

Define and export:
- `videoSegmentSchema`
- `videoProjectSchema`
- `VideoSegment`
- `VideoProject`

Rules:
- `segments` must have at least 1 item
- `templateId` should be a literal or small enum for v1 (`"scripted"` only is acceptable)
- segment-level duration should stay derivable from `implementation` to avoid drift where possible

**Step 2: Add helper functions**

Implement helpers such as:
- `getSegmentDuration(segment)`
- `getProjectDuration(project)`
- `getSegmentStart(project, index)`
- `normalizeProject(project)`

`normalizeProject()` should ensure:
- project meta stays aligned with segment implementation meta
- segment duration reflects implementation duration

**Step 3: Re-run typecheck**

Run:
```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
```
Expected:
- PASS

**Step 4: Commit**

```bash
git add src/lib/project-schema.ts src/lib/video-schema.ts
git commit -m "feat: add project-level video schema"
```

---

## Task 2: Build project generation on top of the existing mock generator

**Objective:** Convert the current single-spec mock generation flow into a project generator that can emit multiple segments.

**Files:**
- Modify: `src/lib/mock-spec.ts`
- Create: `src/lib/project-generation.ts`
- Modify: `src/app/api/generate/route.ts`

**Step 1: Keep the current `VideoSpec` builder reusable**

Do not delete the existing single-spec helpers. Keep them as the internal implementation builder for one segment.

**Step 2: Add project generation helpers**

In `src/lib/project-generation.ts`, implement functions such as:
- `buildMockProjectFromBrief(input)`
- `buildSegmentFromBriefPart(...)`
- `reviseSegmentFromPrompt(segment, revisionPrompt)`

For v1 mock logic, segment splitting can be deterministic and simple. Example strategy:
- short brief -> 1 segment
- medium brief -> 2 segments
- long brief -> 3 segments

Each segment should produce:
- `title`
- `intent`
- `templateId`
- `implementation: VideoSpec`

**Step 3: Change `/api/generate` to return `VideoProject`**

The route contract should become:
```ts
type GenerateResponse = {
  project?: VideoProject;
  error?: string;
};
```

Validate the response with `videoProjectSchema` before returning.

**Step 4: Preserve a stable seam for future real LLM generation**

Keep generation logic isolated so later replacement is local to the generator layer, not the page.

**Step 5: Run lint + typecheck**

Run:
```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
```
Expected:
- PASS

**Step 6: Commit**

```bash
git add src/lib/mock-spec.ts src/lib/project-generation.ts src/app/api/generate/route.ts
git commit -m "feat: generate segment-based video projects"
```

---

## Task 3: Add a full-project Remotion composition

**Objective:** Let Remotion preview and render an assembled full-video project instead of only a single `VideoSpec`.

**Files:**
- Create: `src/remotion/ProjectVideo/ProjectVideo.tsx`
- Modify: `src/remotion/Root.tsx`
- Modify: `src/lib/template-registry.ts`
- Modify if needed: `src/lib/sample-video.ts`
- Modify if needed: `src/lib/project-generation.ts`

**Step 1: Create `ProjectVideo` composition**

Implement a project-level composition that:
- accepts `VideoProject`
- iterates through `segments`
- for each segment, renders the appropriate implementation based on `templateId`
- uses `Sequence` boundaries derived from project helpers

For v1, only support:
- `templateId: "scripted"`

**Step 2: Reuse existing `ScriptedVideo` implementation**

Do not fork scene rendering logic unnecessarily.
The project composition should delegate segment rendering to existing template components.

**Step 3: Register a new composition in `Root.tsx`**

Add a `ProjectVideo` composition with metadata calculated from the project schema.

**Step 4: Keep old compositions available for compatibility**

Do not remove `ScriptedVideo` or starter compositions yet.
The page migration can happen independently.

**Step 5: Run build verification**

Run:
```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run build'
```
Expected:
- PASS

**Step 6: Commit**

```bash
git add src/remotion/ProjectVideo/ProjectVideo.tsx src/remotion/Root.tsx src/lib/template-registry.ts src/lib/project-generation.ts src/lib/sample-video.ts
git commit -m "feat: add project-level Remotion composition"
```

---

## Task 4: Replace page state with project-level draft state

**Objective:** Move the studio page from a single `spec` editor to a full-project editor.

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/project/SegmentList.tsx`
- Create: `src/components/project/SegmentEditor.tsx`
- Create if useful: `src/components/project/ProjectSummary.tsx`

**Step 1: Replace single-spec state**

Current state is effectively:
- `brief`
- `spec`

Replace with:
- `brief`
- `project`
- `selectedSegmentId`
- loading / error state

**Step 2: Make preview full-project-first**

Use `Player` with the new `ProjectVideo` composition and `inputProps={project}`.

**Step 3: Add visible segment list**

Each list item should show at least:
- segment title
- one-line intent/summary
- duration
- selected state

**Step 4: Add selected segment editor shell**

Show:
- natural-language revision input
- segment metadata summary
- structured fields for the current implementation

Do not make the first iteration over-designed. Keep the shell simple and working.

**Step 5: Keep full-video preview primary**

The page layout should enforce:
- preview is the main focal area
- segment list remains visible
- editing focuses on one selected segment at a time

**Step 6: Run lint + typecheck**

Run:
```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
```
Expected:
- PASS

**Step 7: Commit**

```bash
git add src/app/page.tsx src/components/project/
git commit -m "feat: add project-level studio page"
```

---

## Task 5: Implement segment-level natural-language regeneration

**Objective:** Make the selected segment re-generatable without forcing a full project rebuild every time.

**Files:**
- Modify: `src/app/api/generate/route.ts`
- Modify: `src/lib/project-generation.ts`
- Modify: `src/app/page.tsx`
- Modify: `src/components/project/SegmentEditor.tsx`

**Step 1: Extend the generate API contract**

Support two request modes:
1. full project generation from brief
2. segment regeneration from current project + segment id + revision prompt

One acceptable contract:
```ts
{ mode: "project", brief: string }
{ mode: "segment", project: VideoProject, segmentId: string, revisionPrompt: string }
```

**Step 2: Add regeneration helper**

Implement a helper that:
- finds the selected segment
- updates its intent/revision prompt
- rebuilds its `implementation`
- normalizes the project

**Step 3: Wire page actions**

Add a selected-segment action such as:
- `Regenerate segment`

Default behavior after revision:
- only current segment updates

Optionally also add a separate button later for:
- `Regenerate full video`

**Step 4: Ensure state replacement is local and predictable**

Do not rebuild unrelated segments during local regeneration.

**Step 5: Run full validation suite**

Run:
```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run build'
```
Expected:
- PASS

**Step 6: Commit**

```bash
git add src/app/api/generate/route.ts src/lib/project-generation.ts src/app/page.tsx src/components/project/SegmentEditor.tsx
git commit -m "feat: support segment-level regeneration"
```

---

## Task 6: Add structured fine-tuning for the selected segment

**Objective:** Preserve the secondary editing path where the user can directly tweak generated structured fields.

**Files:**
- Modify: `src/components/project/SegmentEditor.tsx`
- Modify: `src/app/page.tsx`
- Modify if needed: `src/lib/project-schema.ts`

**Step 1: Keep structured editing limited and useful**

For the first cut, expose a small set only:
- segment title
- segment intent
- selected implementation meta title if useful
- scene text/content fields already supported by `VideoSpec`
- optional duration-related fields where safe

**Step 2: Reuse existing `VideoSpec` editing controls where practical**

Do not rebuild all field logic from scratch if the current page already has viable controls.
Extract and reuse instead of copy-paste when possible.

**Step 3: Normalize after structured edits**

When a nested implementation changes:
- recompute segment duration
- recompute full-project duration

**Step 4: Verify no preview/render drift**

The same edited project state must feed both preview and later export.

**Step 5: Run validation**

Run all three Docker checks.
Expected:
- PASS

**Step 6: Commit**

```bash
git add src/components/project/SegmentEditor.tsx src/app/page.tsx src/lib/project-schema.ts
git commit -m "feat: add structured segment fine-tuning"
```

---

## Task 7: Add local render/export for full projects

**Objective:** Close the v1 loop with export of the assembled full video.

**Files:**
- Create or modify: `src/app/api/render/*`
- Modify if needed: `src/helpers/use-rendering.ts`
- Modify if needed: `src/components/RenderControls.tsx`
- Modify: `src/app/page.tsx`
- Modify if needed: `scripts/render.sh`

**Step 1: Choose the smallest viable local render path**

Use the local Remotion render flow already present in the repo.
Do not route this through Lambda for v1.

**Step 2: Render the project-level composition**

Ensure export uses:
- the `ProjectVideo` composition
- the current in-page project state serialized as input props

**Step 3: Return stable output information**

Return at least:
- render status
- success/failure
- output file path or download-ready path

**Step 4: Keep preview and export payload aligned**

The payload used for export must come from the same normalized project object the preview uses.

**Step 5: Add a task-local smoke check**

Add and run a render smoke command that proves the project composition renders.
If a lightweight one-shot render command is too expensive, document the exact blocker and use the best available smoke proof.

Suggested commands to try:
```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run build'
```
Plus one project-render command specific to the implementation.

**Step 6: Commit**

```bash
git add src/app/api/render src/helpers/use-rendering.ts src/components/RenderControls.tsx src/app/page.tsx scripts/render.sh
git commit -m "feat: add project render export flow"
```

---

## Task 8: Update repo-local status docs after implementation lands

**Objective:** Keep future sessions aligned with the new implemented stage.

**Files:**
- Modify: `docs/ITERATION_STATUS.md`
- Modify if needed: `AGENTS.md`
- Modify if needed: `README.md`

**Step 1: Update implemented stage**

Record:
- that the repo is now project-level and segment-first
- that v1 supports full-video preview with segment navigation
- that one-template-per-segment remains a current simplification

**Step 2: Update next milestone**

After this plan lands, the likely next milestone should shift toward:
- richer segment planning
- better template diversity
- future overlay preparation

**Step 3: Re-run at least typecheck/build if docs mention validated status changes**

**Step 4: Commit**

```bash
git add docs/ITERATION_STATUS.md AGENTS.md README.md
git commit -m "docs: update project status for segment-first v1"
```

---

## Execution notes for worker handoff

When delegating this plan to Codex/OpenCode:
- point the worker to this file exactly
- require bounded file scope per task
- require a result artifact that lists files changed, commands run, validation results, blockers, and follow-ups
- do not ask the worker to freeload broad architecture changes outside this plan

## Suggested worker sequencing

Recommended execution order:
1. Task 1
2. Task 2
3. Task 3
4. Task 4
5. Task 5
6. Task 6
7. Task 7
8. Task 8

Do not combine Task 4-7 in one uncontrolled edit burst.
The product seam between project schema, generation, preview, regeneration, and export should be verified incrementally.

## Final verification checklist

Before calling the implementation complete, verify all of these with fresh evidence:
- full-video generation returns a valid `VideoProject`
- preview renders the assembled project
- segment list is visible and selectable
- selected segment can be revised via natural language
- selected segment can be fine-tuned structurally
- local export uses the project-level composition
- Docker lint/typecheck/build pass

## Expected deliverables

Implementation should leave behind:
- working code for project-level generation, preview, regeneration, and export
- updated repo-local status docs
- a clean result summary with validation evidence
