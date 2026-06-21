# Node Graph Flow Expression Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the most common `node-graph-flow` procedural generator output by compiling dense workflow drafts into richer, caption-safe SceneGraph layers without changing the provider-facing schema.

**Architecture:** Keep the expression change inside the deterministic procedural compiler. Add one small internal preset selector for `node-graph-flow`, use it to choose layout, graph density, status panel timing, optional summary callout, and beat targets, then expose one visual/caption-only Remotion Studio preview composition for inspection. Preview fixtures must not attach placeholder narration audio; Studio playback parses `<Audio>` sources and can throw `UnsupportedInputFormatError` even when still rendering succeeds.

**Tech Stack:** TypeScript, Zod-validated Visual IR, Remotion SceneGraph renderer, Docker-first npm scripts.

---

## File Structure

- Modify `src/lib/procedural-generator-schema.ts`: add focused internal helpers beside the existing node graph SceneGraph compiler for preset selection and richer SceneGraph compilation.
- Modify `scripts/storyboard-plan-draft-smoke.mjs`: add assertions that a dense workflow draft still compiles through `node-graph-flow` and carries enough graph data for the richer preset.
- Modify `src/lib/staged-smoke-fixtures.ts`: add fixture assertions around the compiled `node-graph-flow` SceneGraph shape.
- Modify `src/remotion/Root.tsx`: register `NodeGraphFlowDensePreview` without removing the generic `ProjectVideo` export composition.
- Add `scripts/remotion-preview-source-smoke.mjs`: guard Remotion preview registration and the no-placeholder-audio fixture rule.
- Modify active docs: `docs/ITERATION_STATUS.md`, `docs/VISUAL_IR_COMPILER_ROADMAP.md`, `docs/FINAL_PRODUCT_GOAL.md`, `docs/PRODUCT_REQUIREMENTS.md`, and `README.md`.

## Tasks

### Task 1: Add Failing Smoke Expectations

**Files:**
- Modify: `scripts/storyboard-plan-draft-smoke.mjs`
- Modify: `src/lib/staged-smoke-fixtures.ts`

- [ ] Add a dense workflow draft smoke assertion:

```js
assert.equal(boundedGenerator?.generatorId, "node-graph-flow");
assert.ok((boundedGenerator?.nodes.length ?? 0) >= 6);
assert.ok((boundedGenerator?.edges.length ?? 0) >= 5);
```

- [ ] Add staged fixture expectations for the compiled SceneGraph:

```ts
const graphLayer = compiled.layers.find((layer) => layer.id === "generator-graph");
if (graphLayer?.type !== "node-graph") {
  throw new Error("Expected node graph layer in procedural generator fixture.");
}
if (graphLayer.layout !== "radial") {
  throw new Error("Expected dense node graph flow to use radial layout.");
}
const summaryLayer = compiled.layers.find((layer) => layer.id === "generator-summary");
if (summaryLayer?.type !== "callout") {
  throw new Error("Expected dense node graph flow to include a summary callout.");
}
```

- [ ] Run the targeted smoke commands and verify they fail for the expected missing richer preset behavior:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:storyboard-draft'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'
```

### Task 2: Implement Minimal Node Graph Preset Selection

**Files:**
- Modify: `src/lib/procedural-generator-schema.ts`

- [ ] Add an internal `NodeGraphFlowPreset` union and selector:

```ts
type NodeGraphFlowPreset = "pipeline" | "dense-system-map";

const selectNodeGraphFlowPreset = (generator: NodeGraphFlowGenerator): NodeGraphFlowPreset =>
  generator.direction === "top-to-bottom" ||
  generator.nodes.length >= 6 ||
  generator.edges.length >= generator.nodes.length
    ? "dense-system-map"
    : "pipeline";
```

- [ ] Use the preset inside `compileNodeGraphFlowToSceneGraph()`:
  - `pipeline` keeps the current compact pipeline behavior.
  - `dense-system-map` uses `composition: "node-graph"`, `layout: "node-graph"`, camera `pan-right`, graph layer `layout: "radial"`, up to 8 nodes and 10 edges, a summary callout, and status panel timing that starts later so it does not fight the graph reveal.

- [ ] Keep the provider-facing generator schema unchanged.

- [ ] Re-run the targeted smoke commands and verify they pass.

### Task 3: Sync Docs

**Files:**
- Modify: `AGENTS.md`
- Modify: `docs/ITERATION_STATUS.md`
- Modify: `docs/VISUAL_IR_COMPILER_ROADMAP.md`
- Modify: `docs/FINAL_PRODUCT_GOAL.md`
- Modify: `docs/PRODUCT_REQUIREMENTS.md`
- Modify: `docs/REMOTION_GENERATION_PATTERNS.md`
- Modify: `README.md`

- [ ] Document that Phase 6 remains a hard-failure gate.
- [ ] Document that the latest product work returns to upstream visual expression.
- [ ] Document that `node-graph-flow` now has an internal dense-system-map preset compiled deterministically to SceneGraph.
- [ ] Document the recurring 3001 Remotion Studio preview rule: visual/caption fixtures must not attach placeholder narration audio such as `/api/tts/assets/smoke/*.mp3`; use preview-only narration data and run `npm run smoke:remotion-preview`.

### Task 4: Full Verification And Review

- [ ] Run focused verification:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:storyboard-draft'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:remotion-preview'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
```

- [ ] Run formatting/diff checks:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx prettier --check scripts/storyboard-plan-draft-smoke.mjs src/lib/procedural-generator-schema.ts src/lib/staged-smoke-fixtures.ts docs/ITERATION_STATUS.md docs/VISUAL_IR_COMPILER_ROADMAP.md docs/FINAL_PRODUCT_GOAL.md docs/PRODUCT_REQUIREMENTS.md README.md docs/superpowers/plans/2026-06-21-node-graph-flow-expression.md'
git diff --check
```

- [ ] Review the final diff against this plan and fix any issues before reporting completion.
