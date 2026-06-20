# Phase 6 Review Repair Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close Phase 6 v1 as an explicit visual diagnostics gate that catches hard rendering failures and offers manual repair help, without pretending to solve broad visual quality while template/Visual IR expression is still limited.

**Architecture:** Keep `VideoProject` as the only preview/export boundary and keep `VisualReviewDiagnostics` as the review contract. Phase 6 v1 remains an explicit user-triggered gate: static preflight diagnostics plan representative frames, manual still extraction merges bounded hard-failure pixel findings, deterministic `scene-graph` repairs run only for supported hard failures, and unsupported findings fall back to one selected-segment regeneration.

**Tech Stack:** Next.js route handlers, Zod contracts, Remotion still rendering, existing Docker-first npm smoke scripts, React Studio panel, deterministic TypeScript helpers.

---

## Scope Boundary

Phase 6 is not a full visual QA platform, and it should not be the main path for improving template richness. The complete Phase 6 v1 plan is:

1. **Review contract clarity:** `VisualReviewDiagnostics` must distinguish static preflight, still analysis, and repair-needed stages while preserving compatibility with existing `status: "static_preflight"` consumers.
2. **Hard-failure still evidence:** `/api/visual-review/stills` remains the explicit route for representative PNG rendering, and merged diagnostics must expose that stills were analyzed for near-blank, low-contrast, unsafe-margin, excessive fine detail, and empty-border failure classes.
3. **Manual repair assistance:** Studio keeps two separate actions: apply a structured repair prompt, or immediately run one explicit target-segment repair. This is assistance for hard failures, not a promise to make weak template content visually strong.
4. **Deterministic repair first:** Supported `scene-graph` still-analysis findings use deterministic parameter repair before provider regeneration.
5. **Clear failure/next-action diagnostics:** Each review result should tell the user whether no action is needed, a manual target repair is available, or the issue must fall back to regeneration.
6. **Phase 6 v1 completion gate:** Treat the current hard-failure diagnostics, still extraction, source-attributed findings, explicit manual repair action, and metadata-backed next action as the bounded v1 completion surface.
7. **Deferred outside Phase 6 v1:** Browser/canvas review, automatic repair loops, provider prompt repair loops, persistence/history, media composites, generated components, and broad aesthetic scoring remain out of this plan unless explicitly reopened.

## File Structure

- Modify `src/lib/visual-review-schema.ts` to add compatible diagnostic metadata:
  - `reviewStage`: `"static_preflight" | "still_analysis"`
  - `reviewScope`: `"project" | "segment"`
  - `nextAction`: `"none" | "manual_review" | "manual_repair"`
- Modify `src/lib/staged-generation/visual-review.ts` so static diagnostics and merged still diagnostics set those fields deterministically.
- Modify `scripts/visual-review-diagnostics-smoke.mjs` to lock red/green behavior for stage, scope, next action, and existing finding counts.
- Modify `scripts/visual-review-ui-source-smoke.mjs` to ensure Studio source surfaces the new diagnostic metadata.
- Modify `src/components/project/VisualReviewPanel.tsx` to show concise stage/next-action metadata in the manual visual-review panel.
- Modify `docs/ITERATION_STATUS.md` and `docs/VISUAL_IR_COMPILER_ROADMAP.md` after implementation so active docs match the shipped Phase 6 boundary.

## Task 1: Review Diagnostics Stage And Next Action

**Files:**
- Modify: `src/lib/visual-review-schema.ts`
- Modify: `src/lib/staged-generation/visual-review.ts`
- Modify: `scripts/visual-review-diagnostics-smoke.mjs`
- Modify: `scripts/visual-review-ui-source-smoke.mjs`
- Modify: `src/components/project/VisualReviewPanel.tsx`
- Modify: `docs/ITERATION_STATUS.md`
- Modify: `docs/VISUAL_IR_COMPILER_ROADMAP.md`

- [x] **Step 1: Write the failing diagnostics smoke**

Add assertions to `scripts/visual-review-diagnostics-smoke.mjs`:

```js
assert.equal(baseDiagnostics.reviewStage, "static_preflight");
assert.equal(baseDiagnostics.reviewScope, "project");
assert.equal(baseDiagnostics.nextAction, "manual_repair");

assert.equal(merged.status, "static_preflight");
assert.equal(merged.reviewStage, "still_analysis");
assert.equal(merged.reviewScope, "project");
assert.equal(merged.nextAction, "manual_repair");
```

- [x] **Step 2: Run the smoke and verify it fails**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:visual-review-diagnostics'
```

Expected: FAIL because `reviewStage`, `reviewScope`, and `nextAction` are not present.

- [x] **Step 3: Add compatible diagnostic schema fields**

In `src/lib/visual-review-schema.ts`, extend `visualReviewDiagnosticsSchema` with:

```ts
reviewStage: z.enum(["static_preflight", "still_analysis"]),
reviewScope: z.enum(["project", "segment"]),
nextAction: z.enum(["none", "manual_review", "manual_repair"]),
```

Keep `status: z.literal("static_preflight")` for existing compatibility.

- [x] **Step 4: Populate diagnostic metadata**

In `src/lib/staged-generation/visual-review.ts`:

```ts
type VisualReviewSummaryOptions = {
  findings: VisualReviewFinding[];
  reviewFrames: VisualReviewFrame[];
  reviewScope?: VisualReviewDiagnostics["reviewScope"];
  reviewStage?: VisualReviewDiagnostics["reviewStage"];
};

const getVisualReviewNextAction = ({
  findings,
  reviewStage,
}: {
  findings: VisualReviewFinding[];
  reviewStage: VisualReviewDiagnostics["reviewStage"];
}): VisualReviewDiagnostics["nextAction"] => {
  if (findings.length > 0) return "manual_repair";
  if (reviewStage === "static_preflight") return "manual_review";
  return "none";
};
```

Update `summarizeVisualReviewFindings()` so it defaults to project/static preflight and returns the new fields. Update `mergeVisualReviewStillAnalysisDiagnostics()` so merged still diagnostics return `reviewStage: "still_analysis"` and preserve `diagnostics.reviewScope`.

- [x] **Step 5: Run the diagnostics smoke and verify it passes**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:visual-review-diagnostics'
```

Expected: PASS with `Visual review diagnostics smoke passed.`

- [x] **Step 6: Add UI source smoke assertions**

Add source assertions to `scripts/visual-review-ui-source-smoke.mjs`:

```js
assertIncludes(panelSource, "reviewStageLabelMap", "Visual review diagnostic metadata");
assertIncludes(panelSource, "nextActionLabelMap", "Visual review diagnostic metadata");
assertIncludes(panelSource, "state.visualReview.reviewStage", "Visual review diagnostic metadata");
assertIncludes(panelSource, "state.visualReview.nextAction", "Visual review diagnostic metadata");
```

- [x] **Step 7: Run the UI smoke and verify it fails**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:visual-review-ui'
```

Expected: FAIL because the panel does not surface the new metadata.

- [x] **Step 8: Surface metadata in `VisualReviewPanel`**

Add label maps:

```ts
const reviewStageLabelMap = {
  static_preflight: "静态预检",
  still_analysis: "截图分析",
} as const;

const nextActionLabelMap = {
  manual_repair: "可手动修复",
  manual_review: "可生成截图复核",
  none: "无需处理",
} as const;
```

In the success panel summary, show the stage and next action using `state.visualReview.reviewStage` and `state.visualReview.nextAction`.

- [x] **Step 9: Run UI and diagnostics smoke**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:visual-review-diagnostics'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:visual-review-ui'
```

Expected: both PASS.

- [x] **Step 10: Sync active docs**

Update `docs/ITERATION_STATUS.md` and `docs/VISUAL_IR_COMPILER_ROADMAP.md` to record that Phase 6 diagnostics now carry compatible `reviewStage`, `reviewScope`, and `nextAction` metadata.

- [x] **Step 11: Run final verification**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:visual-review-diagnostics'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:visual-review-ui'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run build'
git diff --check
```

Expected: all commands exit 0.

## Deferred Work

These are not part of the current Phase 6 v1 completion target. Reopen only after Visual IR / procedural generator output is richer enough for visual review to produce actionable product value:

- **Browser/canvas review spike:** Defer until real canvas-level differences are actionable. Current Remotion still extraction is enough for hard-failure gating.
- **Automatic repair loops:** Defer. Current repair stays explicit and user-triggered.
- **Aesthetic scoring:** Defer. Current templates and bounded SceneGraph output are too constrained for broad visual-quality scoring to be useful.
- **Repair attempt ledger:** Defer durable ledgers. Current panel diagnostics and source attribution are sufficient for v1.
- **Post-repair target-only re-review:** Defer unless manual repair becomes a frequent workflow.
- **Provider prompt repair loops:** Defer. Keep provider generation focused on improving Visual IR/procedural output before asking review to fix it.

## Next Product Priority

After Phase 6 v1, shift implementation effort back to visual expression:

- richer `scene-graph` composition/layout presets
- more procedural generator families for common technical-video grammar
- better default visual density and rhythm in generated `primitive_scene_graph`
- asset-plan/media-composite work only when concrete assets become the bottleneck

## Self-Review

- Spec coverage: Task 1 covers diagnostic clarity and current manual loop visibility. Deferred work is explicitly outside Phase 6 v1 until visual expression improves.
- Placeholder scan: no placeholders or open-ended “add tests” steps remain.
- Type consistency: `reviewStage`, `reviewScope`, and `nextAction` are introduced in schema, helper output, smoke tests, and UI source checks with matching string literals.
