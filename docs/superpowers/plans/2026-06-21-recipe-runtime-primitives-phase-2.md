# Recipe Runtime Primitives Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Complete Visual Recipe Phase 2 by adding duration-aware recipe timing helpers, wiring them into the showcase runtime, and documenting Phase 2 as complete.

**Architecture:** Keep the recipe runtime split into narrow `motion`, `blocks`, and `timing` modules under `src/remotion/recipes/`. The new `timing` module is pure TypeScript and has no dependency on planner, provider, API, or template registry code. Existing showcase code remains the only runtime consumer in this phase.

**Tech Stack:** TypeScript, React, Remotion frame APIs, Docker-first npm scripts, source-level smoke checks, compiled helper smoke, ESLint, `tsc --noEmit`.

---

## File Structure

- Create: `src/remotion/recipes/timing/recipe-timing.ts`
  - Owns pure duration-aware beat timing and caption-safe defaults.
- Create: `src/remotion/recipes/timing/index.ts`
  - Narrow public barrel for future template consumers.
- Create: `scripts/recipe-timing-smoke.mjs`
  - Runtime smoke for `getRecipeBeatTiming()` monotonic behavior and defaults.
- Modify: `package.json`
  - Adds `smoke:recipe-timing`.
- Modify: `scripts/recipe-showcase-preview-smoke.mjs`
  - Guards the new timing barrel and public helper exports.
- Modify: `src/remotion/recipes/blocks/timeline-progress-block.tsx`
  - Consumes timing helpers through typed props and duration defaults.
- Modify: `src/remotion/RecipeShowcase/RecipeShowcasePreview.tsx`
  - Passes recipe duration and caption-safe defaults to `TimelineProgressBlock`.
- Modify: `docs/ITERATION_STATUS.md`
  - Records Phase 2 completion and validation.
- Modify: `docs/VISUAL_RECIPE_ROADMAP.md`
  - Marks Phase 2 complete and Phase 3 as next.
- Modify: `README.md`
  - Updates current visual-quality status.

## Task 1: Add Failing Smoke Coverage

**Files:**
- Modify: `package.json`
- Modify: `scripts/recipe-showcase-preview-smoke.mjs`
- Create: `scripts/recipe-timing-smoke.mjs`

- [x] **Step 1: Add source checks for the timing barrel**

In `scripts/recipe-showcase-preview-smoke.mjs`, add this reader after the existing block export reader:

```js
const timingExportsSource = (() => {
  try {
    return readFileSync("src/remotion/recipes/timing/index.ts", "utf8");
  } catch (error) {
    throw new Error(
      "Reusable recipe timing helpers are missing at src/remotion/recipes/timing/index.ts",
      {
        cause: error,
      },
    );
  }
})();
```

Add these arrays after `requiredBlockExports`:

```js
const requiredTimingExports = [
  "RecipeBeatTiming",
  "RecipeCaptionSafeArea",
  "DEFAULT_RECIPE_CAPTION_SAFE_AREA",
  "getRecipeBeatTiming",
];

const requiredTimingShowcaseSnippets = [
  'from "../recipes/timing"',
  "DEFAULT_RECIPE_CAPTION_SAFE_AREA",
  "durationInFrames={SCENE_DURATION}",
];
```

Add these checks after the block export loop:

```js
for (const timingExport of requiredTimingExports) {
  assertIncludes(timingExportsSource, timingExport, "Reusable recipe timing exports");
}

for (const timingSnippet of requiredTimingShowcaseSnippets) {
  assertIncludes(showcaseSource, timingSnippet, "Recipe showcase reusable timing usage");
}
```

- [x] **Step 2: Add behavior smoke for beat timing**

Create `scripts/recipe-timing-smoke.mjs`:

```js
import {
  DEFAULT_RECIPE_CAPTION_SAFE_AREA,
  getRecipeBeatTiming,
} from "../src/remotion/recipes/timing/recipe-timing";

/* global console */

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const assertMonotonic = (timing, durationInFrames) => {
  assert(timing.revealStartFrame === 0, "reveal should start at frame 0");
  assert(timing.revealStartFrame <= timing.revealEndFrame, "reveal range should be monotonic");
  assert(timing.revealEndFrame <= timing.holdStartFrame, "hold should not start before reveal ends");
  assert(timing.holdStartFrame <= timing.holdEndFrame, "hold range should be monotonic");
  assert(timing.holdEndFrame <= timing.exitStartFrame, "exit should not start before hold ends");
  assert(timing.exitStartFrame <= timing.exitEndFrame, "exit range should be monotonic");
  assert(timing.exitEndFrame === durationInFrames, "exit should end at the normalized duration");
};

const normalTiming = getRecipeBeatTiming({ durationInFrames: 330 });
assertMonotonic(normalTiming, 330);
assert(normalTiming.revealEndFrame > 0, "normal timing should include a reveal");
assert(normalTiming.holdEndFrame > normalTiming.holdStartFrame, "normal timing should include a hold");
assert(normalTiming.exitEndFrame > normalTiming.exitStartFrame, "normal timing should include an exit");

const shortTiming = getRecipeBeatTiming({ durationInFrames: 9 });
assertMonotonic(shortTiming, 9);
assert(shortTiming.exitStartFrame >= shortTiming.holdEndFrame, "short timing should keep exit after hold");

const invalidTiming = getRecipeBeatTiming({ durationInFrames: Number.NaN });
assertMonotonic(invalidTiming, 1);

assert(DEFAULT_RECIPE_CAPTION_SAFE_AREA.bottom >= 80, "caption-safe bottom inset should protect subtitles");
assert(DEFAULT_RECIPE_CAPTION_SAFE_AREA.left > 0, "caption-safe left inset should be positive");
assert(DEFAULT_RECIPE_CAPTION_SAFE_AREA.right > 0, "caption-safe right inset should be positive");

console.log("Recipe timing smoke passed.");
```

- [x] **Step 3: Add npm script**

In `package.json`, add:

```json
"smoke:recipe-timing": "rm -rf /tmp/recipe-timing-smoke-build && npx tsc --allowJs --target es2022 --module commonjs --moduleResolution node --skipLibCheck --esModuleInterop --noEmit false --outDir /tmp/recipe-timing-smoke-build scripts/recipe-timing-smoke.mjs src/remotion/recipes/timing/recipe-timing.ts && NODE_PATH=/workspace/node_modules:node_modules node /tmp/recipe-timing-smoke-build/scripts/recipe-timing-smoke.mjs"
```

- [x] **Step 4: Run red checks**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:recipe-showcase-preview'
```

Expected: FAIL with `Reusable recipe timing helpers are missing`.

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:recipe-timing'
```

Expected: FAIL because `src/remotion/recipes/timing/recipe-timing.ts` does not exist yet.

## Task 2: Implement Recipe Timing Helpers

**Files:**
- Create: `src/remotion/recipes/timing/recipe-timing.ts`
- Create: `src/remotion/recipes/timing/index.ts`

- [x] **Step 1: Add pure timing implementation**

Create `src/remotion/recipes/timing/recipe-timing.ts`:

```ts
export type RecipeBeatTiming = {
  revealStartFrame: number;
  revealEndFrame: number;
  holdStartFrame: number;
  holdEndFrame: number;
  exitStartFrame: number;
  exitEndFrame: number;
};

export type RecipeCaptionSafeArea = {
  bottom: number;
  left: number;
  right: number;
};

export const DEFAULT_RECIPE_CAPTION_SAFE_AREA: RecipeCaptionSafeArea = {
  bottom: 96,
  left: 72,
  right: 72,
};

const normalizeFrameCount = (value: number | undefined, fallback: number) => {
  const candidate = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return Math.max(0, Math.round(candidate));
};

const normalizeRatio = (value: number | undefined, fallback: number) => {
  const candidate = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return Math.max(0, Math.min(0.45, candidate));
};

export const getRecipeBeatTiming = ({
  durationInFrames,
  minRevealFrames = 24,
  minExitFrames = 24,
  revealRatio = 0.18,
  exitRatio = 0.14,
}: {
  durationInFrames: number;
  minRevealFrames?: number;
  minExitFrames?: number;
  revealRatio?: number;
  exitRatio?: number;
}): RecipeBeatTiming => {
  const duration = Math.max(1, normalizeFrameCount(durationInFrames, 1));
  const revealMinimum = normalizeFrameCount(minRevealFrames, 24);
  const exitMinimum = normalizeFrameCount(minExitFrames, 24);
  const revealFrameRatio = normalizeRatio(revealRatio, 0.18);
  const exitFrameRatio = normalizeRatio(exitRatio, 0.14);

  const requestedRevealFrames = Math.max(revealMinimum, Math.round(duration * revealFrameRatio));
  const revealFrames = Math.min(duration, Math.max(0, Math.floor(duration * 0.45)), requestedRevealFrames);
  const remainingAfterReveal = Math.max(0, duration - revealFrames);

  const requestedExitFrames = Math.max(exitMinimum, Math.round(duration * exitFrameRatio));
  const exitFrames = Math.min(
    remainingAfterReveal,
    Math.max(0, Math.floor(duration * 0.4)),
    requestedExitFrames,
  );

  const revealStartFrame = 0;
  const revealEndFrame = revealFrames;
  const holdStartFrame = revealEndFrame;
  const exitEndFrame = duration;
  const exitStartFrame = Math.max(holdStartFrame, exitEndFrame - exitFrames);
  const holdEndFrame = exitStartFrame;

  return {
    revealStartFrame,
    revealEndFrame,
    holdStartFrame,
    holdEndFrame,
    exitStartFrame,
    exitEndFrame,
  };
};
```

- [x] **Step 2: Add public barrel**

Create `src/remotion/recipes/timing/index.ts`:

```ts
export {
  DEFAULT_RECIPE_CAPTION_SAFE_AREA,
  getRecipeBeatTiming,
  type RecipeBeatTiming,
  type RecipeCaptionSafeArea,
} from "./recipe-timing";
```

- [x] **Step 3: Run timing smoke**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:recipe-timing'
```

Expected: PASS with `Recipe timing smoke passed.`

## Task 3: Wire Timing Into Runtime Consumers

**Files:**
- Modify: `src/remotion/recipes/blocks/timeline-progress-block.tsx`
- Modify: `src/remotion/RecipeShowcase/RecipeShowcasePreview.tsx`

- [x] **Step 1: Update timeline block props**

In `src/remotion/recipes/blocks/timeline-progress-block.tsx`, import timing helpers:

```ts
import {
  DEFAULT_RECIPE_CAPTION_SAFE_AREA,
  getRecipeBeatTiming,
  type RecipeBeatTiming,
  type RecipeCaptionSafeArea,
} from "../timing";
```

Add props:

```ts
captionSafeArea?: RecipeCaptionSafeArea;
durationInFrames?: number;
timing?: RecipeBeatTiming;
```

Default them inside the component:

```ts
captionSafeArea = DEFAULT_RECIPE_CAPTION_SAFE_AREA,
durationInFrames = 330,
timing,
```

Calculate beat timing:

```ts
const beatTiming = timing ?? getRecipeBeatTiming({ durationInFrames });
const fill = interpolate(
  frame,
  [beatTiming.revealEndFrame, beatTiming.holdEndFrame],
  [0, 1],
  recipeBlockClamp,
);
```

Use caption-safe spacing for the note:

```ts
marginTop: Math.max(92, captionSafeArea.bottom + 22),
width: Math.max(420, width - captionSafeArea.left - captionSafeArea.right),
```

- [x] **Step 2: Update showcase imports and props**

In `src/remotion/RecipeShowcase/RecipeShowcasePreview.tsx`, add:

```ts
import { DEFAULT_RECIPE_CAPTION_SAFE_AREA } from "../recipes/timing";
```

Pass timing props to the timeline block:

```tsx
captionSafeArea={DEFAULT_RECIPE_CAPTION_SAFE_AREA}
durationInFrames={SCENE_DURATION}
```

- [x] **Step 3: Run showcase smoke**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:recipe-showcase-preview'
```

Expected: PASS with `RecipeShowcasePreview smoke passed.`

- [x] **Step 4: Run typecheck**

Run:

```bash
docker compose run --rm web bash -lc 'rm -rf .next/types && [ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
```

Expected: PASS.

## Task 4: Sync Documentation And Verify

**Files:**
- Modify: `docs/ITERATION_STATUS.md`
- Modify: `docs/VISUAL_RECIPE_ROADMAP.md`
- Modify: `README.md`

- [x] **Step 1: Update iteration status**

Add a new top section to `docs/ITERATION_STATUS.md` titled:

```md
## Latest continuation - Recipe Runtime Primitives Phase 2 completion
```

It must state:

- `src/remotion/recipes/timing/` now exposes duration-aware beat timing and caption-safe defaults.
- `TimelineProgressBlock` consumes the timing helper while keeping the showcase preview/runtime-only.
- `npm run smoke:recipe-showcase-preview` guards timing exports and showcase usage.
- `npm run smoke:recipe-timing` validates monotonic timing behavior.
- The next roadmap step is Phase 3 real template adoption.

- [x] **Step 2: Update roadmap**

In `docs/VISUAL_RECIPE_ROADMAP.md`, change Phase 2 status to:

```md
Status: complete for reusable runtime primitives.
```

Add that `src/remotion/recipes/timing/` provides the caption-safe and
duration-aware helper layer. Keep Phase 3 as the next step for real generated
segment adoption.

- [x] **Step 3: Update README**

In `README.md`, update the visual-quality status bullet so it says Phase 2 now
has motion primitives, grouped visual blocks, and duration-aware/caption-safe
timing helpers under `src/remotion/recipes/`.

- [x] **Step 4: Run final verification**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:recipe-timing'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:recipe-showcase-preview'
docker compose run --rm web bash -lc 'rm -rf .next/types && [ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
git diff --check
```

Expected: all commands pass.

- [x] **Step 5: Commit**

Stage the implementation and docs:

```bash
git add package.json scripts/recipe-showcase-preview-smoke.mjs scripts/recipe-timing-smoke.mjs src/remotion/recipes/timing/recipe-timing.ts src/remotion/recipes/timing/index.ts src/remotion/recipes/blocks/timeline-progress-block.tsx src/remotion/RecipeShowcase/RecipeShowcasePreview.tsx docs/ITERATION_STATUS.md docs/VISUAL_RECIPE_ROADMAP.md README.md docs/superpowers/plans/2026-06-21-recipe-runtime-primitives-phase-2.md
git commit -m "feat: complete recipe runtime primitives phase 2"
```

