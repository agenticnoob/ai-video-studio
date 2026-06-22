# Recipe Coverage Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the real generated `technical-explainer` template from 5 planner-selectable scene recipes to 9 high-quality recipes by promoting `code-diff-highlight` and adding `before-after-compare`, `decision-matrix`, and `architecture-layer-stack`, while explicitly deferring asset-aware `product-ui-zoom`.

**Architecture:** Keep `VideoProject`, `StoryboardPlan`, segment narration/audio/captions, and one-primary-template-per-segment unchanged. Add recipes inside the owning `technical-explainer` template schema, definition metadata, renderer switch, deterministic fixtures, and prompt-safe manifest surfaces; reusable visual UI should live under `src/remotion/recipes/blocks/` only when it is genuinely shared. Do not add a global recipe model, media library, arbitrary URLs, generated TSX execution, visual scoring, or multi-template-per-segment orchestration.

**Tech Stack:** TypeScript, Zod, Remotion frame-driven animation, existing recipe block primitives, DeepSeek JSON-mode prompt surfaces, deterministic Node smoke scripts, Docker-first validation, ESLint, `tsc --noEmit`.

**Execution note:** Implementation is being consolidated into one final commit
instead of the plan's optional per-task commits. Intermediate commit checklist
items remain unchecked unless a separate commit was actually created.

---

## Branch Objective

Current branch: `codex/visual-recipe-roadmap`.

The branch goal is not Phase 5 asset ingestion yet. The branch goal is:

```txt
Do not widen the product.
Make generated segments look more like finished videos.
```

Current state:

- `RecipeShowcasePreview` demonstrates 6 recipe concepts:
  - `hero-title-reveal`
  - `workflow-node-map`
  - `terminal-build-run`
  - `metric-countup`
  - `timeline-progress`
  - `code-diff-highlight`
- The real generated `technical-explainer` template supports 5 recipes:
  - `hero-title-reveal`
  - `terminal-build-run`
  - `workflow-node-map`
  - `metric-countup`
  - `timeline-progress`
- `code-diff-highlight` exists only in the showcase, not in the real template schema/compiler path.
- `before-after-compare` and `product-ui-zoom` are roadmap examples, not implemented recipes.
- `decision-matrix` and `architecture-layer-stack` are new bounded technical-explainer recipe proposals for this iteration.

This iteration should expand generated recipe coverage without pulling the project into Phase 5 assets.

## Scope

Implement:

- promote `code-diff-highlight` into the real `technical-explainer` template
- add a new `before-after-compare` recipe to the real template
- add a new `decision-matrix` recipe to the real template
- add a new `architecture-layer-stack` recipe to the real template
- publish all four recipes through planner-safe metadata and prompt-safe manifest text
- update DeepSeek template rules so the compiler can generate schema-valid sections
- update deterministic staged fixtures and smoke scripts
- render stills for visual inspection
- update active docs to describe Phase 4.5 Recipe Coverage Expansion
- document why `product-ui-zoom` waits for asset-aware Phase 5

Do not implement:

- `product-ui-zoom` in this iteration
- media upload UI
- project-level or segment-level media library
- arbitrary remote URLs or screenshots
- generic asset resolution
- global recipe registry outside registered template definitions
- new API routes
- visual-review scoring or screenshot repair
- generated TSX execution
- persistence/history
- multi-template-per-segment orchestration

## File Structure

- Modify: `src/templates/technical-explainer/schema.ts`
  - Add recipe ids and discriminated-union section schemas for `code-diff-highlight`, `before-after-compare`, `decision-matrix`, and `architecture-layer-stack`.
- Modify: `src/templates/technical-explainer/definition.ts`
  - Add planner recipe metadata, JSON schema cases, implementation prompt rules, revision prompt fields, and preservation payload coverage.
- Modify: `src/templates/technical-explainer/recipe-scenes.tsx`
  - Add Remotion scene renderers for all four new recipes.
- Modify: `src/templates/technical-explainer/runtime.tsx`
  - Route new recipe ids to their scene renderers and choose transition motion.
- Modify: `src/lib/staged-smoke-fixtures.ts`
  - Add deterministic implementation sections, storyboard recipe hints, and staged fixture coverage for all four new recipes.
- Modify: `scripts/technical-explainer-template-smoke.mjs`
  - Require all four new recipe ids in schema, definition, fixtures, and scene renderers.
- Modify: `scripts/planner-recipe-manifest-smoke.mjs`
  - Require all four new recipe ids in planner recipe manifest and prompt output.
- Modify: `scripts/staged-live-smoke.mjs`
  - Add non-blocking reporting for expanded technical-explainer recipe ids; do not make live smoke fail if the brief naturally chooses the original five recipes.
- Optionally create: `src/remotion/recipes/blocks/code-diff-block.tsx`
  - Shared block for semantic diff line rendering if both showcase and template should consume it.
- Optionally create: `src/remotion/recipes/blocks/decision-matrix-block.tsx`
  - Shared block for compact option/criteria comparisons if the renderer grows beyond a single template scene.
- Optionally create: `src/remotion/recipes/blocks/architecture-layer-stack-block.tsx`
  - Shared block for layered architecture diagrams if the renderer grows beyond a single template scene.
- Optionally modify: `src/remotion/recipes/blocks/index.ts`
  - Export any shared recipe block created in this iteration.
- Optionally modify: `src/remotion/RecipeShowcase/RecipeShowcasePreview.tsx`
  - Consume the shared code diff block if extracted; otherwise leave showcase behavior unchanged.
- Modify: `docs/ITERATION_STATUS.md`
  - Record Phase 4.5 plan/status after implementation.
- Modify: `docs/VISUAL_RECIPE_ROADMAP.md`
  - Insert Phase 4.5 between Phase 4 and Phase 5, and keep Phase 5 asset-aware.
- Modify: `README.md`
  - Update current visual-quality direction and recipe count after implementation.

## Recipe Contracts

### `code-diff-highlight`

Purpose: show a focused code/config/schema change using semantic add/remove/neutral line styling.

Schema shape:

```ts
{
  id: string;
  recipeId: "code-diff-highlight";
  title: string;
  subtitle?: string;
  durationInFrames?: number;
  fileLabel?: string;
  beforeLabel?: string;
  afterLabel?: string;
  lines: Array<{
    text: string;
    mode: "add" | "remove" | "neutral";
    focus?: boolean;
  }>;
  note?: string;
}
```

Bounds:

- `lines`: 3-8 items
- `text`: 1-120 chars
- `fileLabel`: optional, 1-80 chars
- `note`: optional, 1-220 chars

### `before-after-compare`

Purpose: compare old/new state without requiring actual screenshots or media assets.

Schema shape:

```ts
{
  id: string;
  recipeId: "before-after-compare";
  title: string;
  subtitle?: string;
  durationInFrames?: number;
  before: {
    label: string;
    headline: string;
    points: string[];
  };
  after: {
    label: string;
    headline: string;
    points: string[];
  };
  emphasis?: string;
}
```

Bounds:

- `before.points`: 2-4 items
- `after.points`: 2-4 items
- all point text: 1-80 chars
- `emphasis`: optional, 1-160 chars

### `decision-matrix`

Purpose: show a bounded option tradeoff table for technical decisions, framework choices, provider choices, or roadmap priorities.

Schema shape:

```ts
{
  id: string;
  recipeId: "decision-matrix";
  title: string;
  subtitle?: string;
  durationInFrames?: number;
  criteria: string[];
  options: Array<{
    label: string;
    summary?: string;
    scores: Array<{
      criterion: string;
      rating: "low" | "medium" | "high";
      note?: string;
    }>;
    recommended?: boolean;
  }>;
  decision?: string;
}
```

Bounds:

- `criteria`: 2-4 items
- `options`: 2-4 items
- each option must include one score per criterion
- `summary`: optional, 1-100 chars
- `decision`: optional, 1-180 chars

### `architecture-layer-stack`

Purpose: show module boundaries, platform layers, or data responsibility layers when a workflow map would imply sequence instead of ownership.

Schema shape:

```ts
{
  id: string;
  recipeId: "architecture-layer-stack";
  title: string;
  subtitle?: string;
  durationInFrames?: number;
  layers: Array<{
    label: string;
    detail?: string;
    tone?: "foundation" | "runtime" | "interface" | "provider";
  }>;
  dataFlow?: string[];
  emphasis?: string;
}
```

Bounds:

- `layers`: 3-6 items
- `detail`: optional, 1-120 chars
- `dataFlow`: optional, 2-5 items
- `emphasis`: optional, 1-160 chars

## Task 1: Extend Schema And Planner Metadata

**Files:**
- Modify: `src/templates/technical-explainer/schema.ts`
- Modify: `src/templates/technical-explainer/definition.ts`
- Modify: `scripts/planner-recipe-manifest-smoke.mjs`
- Modify: `scripts/technical-explainer-template-smoke.mjs`

- [x] **Step 1: Write the red smoke expectations**

In `scripts/planner-recipe-manifest-smoke.mjs`, update `requiredRecipeIds`:

```js
const requiredRecipeIds = [
  "hero-title-reveal",
  "terminal-build-run",
  "workflow-node-map",
  "metric-countup",
  "timeline-progress",
  "code-diff-highlight",
  "before-after-compare",
  "decision-matrix",
  "architecture-layer-stack",
];
```

In `scripts/technical-explainer-template-smoke.mjs`, update `requiredRecipeIds` the same way:

```js
const requiredRecipeIds = [
  "hero-title-reveal",
  "terminal-build-run",
  "workflow-node-map",
  "metric-countup",
  "timeline-progress",
  "code-diff-highlight",
  "before-after-compare",
  "decision-matrix",
  "architecture-layer-stack",
];
```

Add scene-renderer assertions:

```js
assertIncludes(sceneSource, "CodeDiffHighlightScene", "technical explainer scene renderers");
assertIncludes(sceneSource, "BeforeAfterCompareScene", "technical explainer scene renderers");
assertIncludes(sceneSource, "DecisionMatrixScene", "technical explainer scene renderers");
assertIncludes(sceneSource, "ArchitectureLayerStackScene", "technical explainer scene renderers");
```

- [x] **Step 2: Run the red smokes**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:planner-recipe-manifest'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:technical-explainer-template'
```

Expected:

- `smoke:planner-recipe-manifest` fails because the four recipe ids are missing from schema/definition/manifest.
- `smoke:technical-explainer-template` fails because schema/definition/fixtures/scene renderers do not contain the four recipe ids.

- [x] **Step 3: Add recipe ids and section schemas**

In `src/templates/technical-explainer/schema.ts`, extend `technicalExplainerRecipeIds`:

```ts
export const technicalExplainerRecipeIds = [
  "hero-title-reveal",
  "terminal-build-run",
  "workflow-node-map",
  "metric-countup",
  "timeline-progress",
  "code-diff-highlight",
  "before-after-compare",
  "decision-matrix",
  "architecture-layer-stack",
] as const;
```

Add these schemas before `technicalExplainerSectionSchema`:

```ts
const codeDiffHighlightSectionSchema = sectionBaseSchema.extend({
  recipeId: z.literal("code-diff-highlight"),
  fileLabel: z.string().trim().min(1).max(80).optional(),
  beforeLabel: z.string().trim().min(1).max(80).optional(),
  afterLabel: z.string().trim().min(1).max(80).optional(),
  lines: z
    .array(
      z
        .object({
          text: z.string().trim().min(1).max(120),
          mode: z.enum(["add", "remove", "neutral"]),
          focus: z.boolean().optional(),
        })
        .strict(),
    )
    .min(3)
    .max(8),
  note: z.string().trim().min(1).max(220).optional(),
});

const beforeAfterCompareSectionSchema = sectionBaseSchema.extend({
  recipeId: z.literal("before-after-compare"),
  before: z
    .object({
      label: z.string().trim().min(1).max(80),
      headline: z.string().trim().min(1).max(120),
      points: z.array(z.string().trim().min(1).max(80)).min(2).max(4),
    })
    .strict(),
  after: z
    .object({
      label: z.string().trim().min(1).max(80),
      headline: z.string().trim().min(1).max(120),
      points: z.array(z.string().trim().min(1).max(80)).min(2).max(4),
    })
    .strict(),
  emphasis: z.string().trim().min(1).max(160).optional(),
});

const decisionMatrixSectionSchema = sectionBaseSchema.extend({
  recipeId: z.literal("decision-matrix"),
  criteria: z.array(z.string().trim().min(1).max(60)).min(2).max(4),
  options: z
    .array(
      z
        .object({
          label: z.string().trim().min(1).max(80),
          summary: z.string().trim().min(1).max(100).optional(),
          scores: z
            .array(
              z
                .object({
                  criterion: z.string().trim().min(1).max(60),
                  rating: z.enum(["low", "medium", "high"]),
                  note: z.string().trim().min(1).max(100).optional(),
                })
                .strict(),
            )
            .min(2)
            .max(4),
          recommended: z.boolean().optional(),
        })
        .strict(),
    )
    .min(2)
    .max(4),
  decision: z.string().trim().min(1).max(180).optional(),
});

const architectureLayerStackSectionSchema = sectionBaseSchema.extend({
  recipeId: z.literal("architecture-layer-stack"),
  layers: z
    .array(
      z
        .object({
          label: z.string().trim().min(1).max(80),
          detail: z.string().trim().min(1).max(120).optional(),
          tone: z.enum(["foundation", "runtime", "interface", "provider"]).optional(),
        })
        .strict(),
    )
    .min(3)
    .max(6),
  dataFlow: z.array(z.string().trim().min(1).max(80)).min(2).max(5).optional(),
  emphasis: z.string().trim().min(1).max(160).optional(),
});
```

Append all four schemas to the discriminated union:

```ts
export const technicalExplainerSectionSchema = z.discriminatedUnion("recipeId", [
  heroTitleRevealSectionSchema,
  terminalBuildRunSectionSchema,
  workflowNodeMapSectionSchema,
  metricCountupSectionSchema,
  timelineProgressSectionSchema,
  codeDiffHighlightSectionSchema,
  beforeAfterCompareSectionSchema,
  decisionMatrixSectionSchema,
  architectureLayerStackSectionSchema,
]);
```

- [x] **Step 4: Add planner metadata**

In `src/templates/technical-explainer/definition.ts`, add four entries to `technicalExplainerPlannerRecipes`:

```ts
  {
    recipeId: "code-diff-highlight",
    label: "Code diff highlight",
    bestFor: ["code changes", "schema changes", "config diffs", "before/after implementation snippets"],
    avoidCases: ["non-technical narrative", "numeric KPI recap", "media-heavy UI demos"],
    requiredInputsSummary: "3-8 semantic diff lines with add/remove/neutral modes, optional file label and note",
    durationFit: "Works best for a medium beat where viewers can read a focused change.",
  },
  {
    recipeId: "before-after-compare",
    label: "Before/after compare",
    bestFor: ["old vs new workflow", "problem/solution contrast", "quality improvement", "migration recap"],
    avoidCases: ["raw command output", "single opening thesis", "dense dashboard analysis"],
    requiredInputsSummary: "before and after panels with labels, headlines, and 2-4 compact points each",
    durationFit: "Works well for a medium-to-closing beat with clear contrast.",
  },
  {
    recipeId: "decision-matrix",
    label: "Decision matrix",
    bestFor: ["technical tradeoffs", "provider choices", "roadmap prioritization", "framework selection"],
    avoidCases: ["raw logs", "single thesis opener", "linear workflow explanation"],
    requiredInputsSummary: "2-4 criteria and 2-4 options with low/medium/high ratings and optional recommendation",
    durationFit: "Works best for a medium explanation where viewers compare options quickly.",
  },
  {
    recipeId: "architecture-layer-stack",
    label: "Architecture layer stack",
    bestFor: ["module boundaries", "platform layers", "data ownership", "system architecture"],
    avoidCases: ["chronological process", "raw command output", "simple metric recap"],
    requiredInputsSummary: "3-6 architecture layers, optional data-flow labels, and optional emphasis",
    durationFit: "Works well for medium architecture beats with clear ownership boundaries.",
  },
```

- [x] **Step 5: Add implementation JSON schema cases**

In `src/templates/technical-explainer/definition.ts`, add four `oneOf` entries to `technicalExplainerSectionJsonSchema`:

```ts
    {
      ...sectionBaseJsonSchema,
      properties: {
        ...sectionBaseJsonSchema.properties,
        recipeId: { type: "string", const: "code-diff-highlight" },
        fileLabel: { type: "string" },
        beforeLabel: { type: "string" },
        afterLabel: { type: "string" },
        lines: {
          type: "array",
          minItems: 3,
          maxItems: 8,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              text: { type: "string" },
              mode: { type: "string", enum: ["add", "remove", "neutral"] },
              focus: { type: "boolean" },
            },
            required: ["text", "mode"],
          },
        },
        note: { type: "string" },
      },
      required: ["id", "recipeId", "title", "lines"],
    },
    {
      ...sectionBaseJsonSchema,
      properties: {
        ...sectionBaseJsonSchema.properties,
        recipeId: { type: "string", const: "before-after-compare" },
        before: {
          type: "object",
          additionalProperties: false,
          properties: {
            label: { type: "string" },
            headline: { type: "string" },
            points: { type: "array", minItems: 2, maxItems: 4, items: { type: "string" } },
          },
          required: ["label", "headline", "points"],
        },
        after: {
          type: "object",
          additionalProperties: false,
          properties: {
            label: { type: "string" },
            headline: { type: "string" },
            points: { type: "array", minItems: 2, maxItems: 4, items: { type: "string" } },
          },
          required: ["label", "headline", "points"],
        },
        emphasis: { type: "string" },
      },
      required: ["id", "recipeId", "title", "before", "after"],
    },
    {
      ...sectionBaseJsonSchema,
      properties: {
        ...sectionBaseJsonSchema.properties,
        recipeId: { type: "string", const: "decision-matrix" },
        criteria: { type: "array", minItems: 2, maxItems: 4, items: { type: "string" } },
        options: {
          type: "array",
          minItems: 2,
          maxItems: 4,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              label: { type: "string" },
              summary: { type: "string" },
              scores: {
                type: "array",
                minItems: 2,
                maxItems: 4,
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    criterion: { type: "string" },
                    rating: { type: "string", enum: ["low", "medium", "high"] },
                    note: { type: "string" },
                  },
                  required: ["criterion", "rating"],
                },
              },
              recommended: { type: "boolean" },
            },
            required: ["label", "scores"],
          },
        },
        decision: { type: "string" },
      },
      required: ["id", "recipeId", "title", "criteria", "options"],
    },
    {
      ...sectionBaseJsonSchema,
      properties: {
        ...sectionBaseJsonSchema.properties,
        recipeId: { type: "string", const: "architecture-layer-stack" },
        layers: {
          type: "array",
          minItems: 3,
          maxItems: 6,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              label: { type: "string" },
              detail: { type: "string" },
              tone: {
                type: "string",
                enum: ["foundation", "runtime", "interface", "provider"],
              },
            },
            required: ["label"],
          },
        },
        dataFlow: { type: "array", minItems: 2, maxItems: 5, items: { type: "string" } },
        emphasis: { type: "string" },
      },
      required: ["id", "recipeId", "title", "layers"],
    },
```

- [x] **Step 6: Update compiler and revision prompts**

In `implementationPrompt`, extend the allowed recipe list:

```txt
  code-diff-highlight
  before-after-compare
  decision-matrix
  architecture-layer-stack
```

Add rules:

```txt
  - Use code-diff-highlight for code, config, schema, or implementation changes where semantic add/remove/neutral lines make the difference legible.
  - Use before-after-compare for old/new workflows, problem/solution contrast, migrations, and quality improvements.
  - Use decision-matrix for technical tradeoffs, provider choices, roadmap prioritization, and framework selection.
  - Use architecture-layer-stack for module boundaries, platform layers, data ownership, and system architecture.
  - For code-diff-highlight, generate 3-8 short lines with mode add/remove/neutral; use focus=true on at most 2 lines.
  - For before-after-compare, generate before and after panels with 2-4 short points each.
  - For decision-matrix, generate 2-4 criteria and 2-4 options; each option needs low/medium/high ratings for the listed criteria.
  - For architecture-layer-stack, generate 3-6 layers and optional dataFlow labels only when they clarify ownership.
```

In `revisionPrompt`, add:

```txt
  code-diff-highlight: fileLabel?, beforeLabel?, afterLabel?, lines[3-8] with text, mode add|remove|neutral, focus?, note?
  before-after-compare: before { label, headline, points[2-4] }, after { label, headline, points[2-4] }, emphasis?
  decision-matrix: criteria[2-4], options[2-4] with label, summary?, scores[2-4] { criterion, rating low|medium|high, note? }, recommended?, decision?
  architecture-layer-stack: layers[3-6] with label, detail?, tone foundation|runtime|interface|provider?, dataFlow?[2-5], emphasis?
```

- [x] **Step 7: Run metadata smokes**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:planner-recipe-manifest'
```

Expected: PASS for planner manifest after schema/definition updates.

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:technical-explainer-template'
```

Expected: still FAIL because scene renderers and fixtures are not implemented yet. This is good; Task 2 through Task 5 close it.

- [ ] **Step 8: Commit Task 1**

```bash
git add src/templates/technical-explainer/schema.ts src/templates/technical-explainer/definition.ts scripts/planner-recipe-manifest-smoke.mjs scripts/technical-explainer-template-smoke.mjs
git commit -m "feat: expand technical explainer recipe metadata"
```

## Task 2: Add Code Diff Runtime Recipe

**Files:**
- Create: `src/remotion/recipes/blocks/code-diff-block.tsx`
- Modify: `src/remotion/recipes/blocks/index.ts`
- Modify: `src/templates/technical-explainer/recipe-scenes.tsx`
- Modify: `src/templates/technical-explainer/runtime.tsx`
- Optionally modify: `src/remotion/RecipeShowcase/RecipeShowcasePreview.tsx`

- [x] **Step 1: Create shared code diff block**

Create `src/remotion/recipes/blocks/code-diff-block.tsx`:

```tsx
import type { CSSProperties, FC } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { recipeBlockClamp, recipeBlockEnter, recipeBlockMonoFontFamily } from "./block-animation";

export type CodeDiffLineMode = "add" | "remove" | "neutral";

export type CodeDiffLine = {
  focus?: boolean;
  mode: CodeDiffLineMode;
  text: string;
};

export type CodeDiffBlockProps = {
  accentColor: string;
  addColor: string;
  fileLabel?: string;
  lines: CodeDiffLine[];
  mutedColor: string;
  neutralColor: string;
  removeColor: string;
  style?: CSSProperties;
};

export const CodeDiffBlock: FC<CodeDiffBlockProps> = ({
  accentColor,
  addColor,
  fileLabel = "diff",
  lines,
  mutedColor,
  neutralColor,
  removeColor,
  style,
}) => {
  const frame = useCurrentFrame();
  const panelIn = recipeBlockEnter(frame, 24, 58);
  const focusedIndex = Math.max(
    0,
    lines.findIndex((line) => line.focus),
  );
  const focusTop = interpolate(frame, [80, 220], [92, 92 + focusedIndex * 44], recipeBlockClamp);

  const tintForMode = (mode: CodeDiffLineMode) => {
    if (mode === "add") {
      return addColor;
    }
    if (mode === "remove") {
      return removeColor;
    }
    return neutralColor;
  };

  return (
    <div
      style={{
        backgroundColor: "#07101d",
        border: `1px solid ${accentColor}66`,
        borderRadius: 22,
        boxShadow: "0 26px 90px rgba(0,0,0,0.42)",
        height: 410,
        opacity: panelIn,
        overflow: "hidden",
        position: "relative",
        transform: `translateY(${interpolate(panelIn, [0, 1], [28, 0], recipeBlockClamp)}px)`,
        width: 570,
        ...style,
      }}
    >
      <div
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          color: mutedColor,
          fontFamily: recipeBlockMonoFontFamily,
          fontSize: 15,
          fontWeight: 800,
          padding: "17px 24px",
        }}
      >
        {fileLabel}
      </div>
      <div
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}20, transparent)`,
          height: 54,
          left: 0,
          position: "absolute",
          right: 0,
          top: focusTop,
        }}
      />
      <div style={{ padding: "24px 0" }}>
        {lines.map((line, index) => {
          const lineIn = recipeBlockEnter(frame, 62 + index * 22, 92 + index * 22);
          const tint = tintForMode(line.mode);
          return (
            <div
              key={`${line.mode}-${line.text}-${index}`}
              style={{
                backgroundColor:
                  line.mode === "add"
                    ? `${addColor}10`
                    : line.mode === "remove"
                      ? `${removeColor}12`
                      : "transparent",
                color: tint,
                fontFamily: recipeBlockMonoFontFamily,
                fontSize: 21,
                fontWeight: line.focus ? 850 : 760,
                opacity: lineIn,
                padding: "11px 28px",
                transform: `translateX(${interpolate(lineIn, [0, 1], [20, 0], recipeBlockClamp)}px)`,
              }}
            >
              {line.text}
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

- [x] **Step 2: Export the block**

In `src/remotion/recipes/blocks/index.ts`, add:

```ts
export { CodeDiffBlock } from "./code-diff-block";
export type { CodeDiffBlockProps, CodeDiffLine, CodeDiffLineMode } from "./code-diff-block";
```

- [x] **Step 3: Add the template scene renderer**

In `src/templates/technical-explainer/recipe-scenes.tsx`, import:

```ts
  CodeDiffBlock,
  type CodeDiffLine,
```

from `../../remotion/recipes/blocks`.

Add:

```tsx
export const CodeDiffHighlightScene: FC<
  TechnicalExplainerSceneProps<Extract<TechnicalExplainerSection, { recipeId: "code-diff-highlight" }>>
> = ({ section, theme }) => {
  const lines: CodeDiffLine[] = section.lines.map((line) => ({
    focus: line.focus,
    mode: line.mode,
    text:
      line.mode === "add"
        ? `+ ${line.text}`
        : line.mode === "remove"
          ? `- ${line.text}`
          : `  ${line.text}`,
  }));

  return (
    <div style={panelStyle(theme)}>
      <div style={{ display: "flex", gap: 42, marginTop: 44 }}>
        <div style={{ flex: 1, paddingTop: 42 }}>
          <div style={{ color: theme.primary, fontSize: 20, fontWeight: 900, marginBottom: 18 }}>
            {section.beforeLabel ?? "Change"}
          </div>
          <div style={{ fontSize: 46, fontWeight: 930, lineHeight: 1.05 }}>
            {section.title}
          </div>
          {section.subtitle ? (
            <div
              style={{
                color: theme.muted,
                fontSize: 22,
                fontWeight: 760,
                lineHeight: 1.35,
                marginTop: 24,
              }}
            >
              {section.subtitle}
            </div>
          ) : null}
          {section.note ? (
            <div
              style={{
                borderLeft: `4px solid ${theme.secondary}`,
                color: theme.muted,
                fontSize: 19,
                lineHeight: 1.35,
                marginTop: 28,
                paddingLeft: 16,
              }}
            >
              {section.note}
            </div>
          ) : null}
        </div>
        <CodeDiffBlock
          accentColor={theme.primary}
          addColor="#22c55e"
          fileLabel={section.fileLabel}
          lines={lines}
          mutedColor={theme.muted}
          neutralColor={theme.muted}
          removeColor="#fb7185"
        />
      </div>
    </div>
  );
};
```

- [x] **Step 4: Route runtime to the new scene**

In `src/templates/technical-explainer/runtime.tsx`, import `CodeDiffHighlightScene` from `./recipe-scenes`.

Add to `SectionScene`:

```tsx
    case "code-diff-highlight":
      return (
        <CodeDiffHighlightScene
          durationInFrames={durationInFrames}
          section={section}
          theme={spec.theme}
        />
      );
```

Update `getMotionForSection()`:

```ts
  if (
    section.recipeId === "terminal-build-run" ||
    section.recipeId === "metric-countup" ||
    section.recipeId === "code-diff-highlight"
  ) {
    return "fly-through";
  }
```

- [ ] **Step 5: Optionally reuse block in showcase**

If this stays low-risk, replace the local code panel in `src/remotion/RecipeShowcase/RecipeShowcasePreview.tsx` with `CodeDiffBlock`.

If the replacement causes visual churn, skip this step and keep showcase unchanged; the real template still uses the shared block.

- [x] **Step 6: Run typecheck**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
```

Expected: PASS.

- [ ] **Step 7: Commit Task 2**

```bash
git add src/remotion/recipes/blocks/code-diff-block.tsx src/remotion/recipes/blocks/index.ts src/templates/technical-explainer/recipe-scenes.tsx src/templates/technical-explainer/runtime.tsx src/remotion/RecipeShowcase/RecipeShowcasePreview.tsx
git commit -m "feat: add technical explainer code diff recipe"
```

If `RecipeShowcasePreview.tsx` was not modified, omit it from `git add`.

## Task 3: Add Before/After Runtime Recipe

**Files:**
- Modify: `src/templates/technical-explainer/recipe-scenes.tsx`
- Modify: `src/templates/technical-explainer/runtime.tsx`

- [x] **Step 1: Add before/after scene renderer**

In `src/templates/technical-explainer/recipe-scenes.tsx`, add:

```tsx
const ComparePanel: FC<{
  accentColor: string;
  label: string;
  headline: string;
  points: string[];
  mutedColor: string;
  panelColor: string;
  textColor: string;
}> = ({ accentColor, headline, label, mutedColor, panelColor, points, textColor }) => (
  <div
    style={{
      background: panelColor,
      border: `1px solid ${accentColor}66`,
      borderRadius: 22,
      boxShadow: "0 24px 80px rgba(0,0,0,0.28)",
      flex: 1,
      minHeight: 360,
      padding: "34px 36px",
    }}
  >
    <div style={{ color: accentColor, fontSize: 18, fontWeight: 900, marginBottom: 22 }}>
      {label}
    </div>
    <div style={{ color: textColor, fontSize: 38, fontWeight: 920, lineHeight: 1.04 }}>
      {headline}
    </div>
    <div style={{ display: "grid", gap: 14, marginTop: 32 }}>
      {points.map((point) => (
        <div
          key={point}
          style={{
            color: mutedColor,
            fontSize: 20,
            fontWeight: 760,
            lineHeight: 1.28,
          }}
        >
          {point}
        </div>
      ))}
    </div>
  </div>
);

export const BeforeAfterCompareScene: FC<
  TechnicalExplainerSceneProps<Extract<TechnicalExplainerSection, { recipeId: "before-after-compare" }>>
> = ({ section, theme }) => {
  const frame = useCurrentFrame();
  const afterIn = interpolate(frame, [36, 96], [0, 1], clamp);

  return (
    <div style={panelStyle(theme)}>
      <div style={{ fontSize: 44, fontWeight: 930, lineHeight: 1.04, marginTop: 24 }}>
        {section.title}
      </div>
      {section.subtitle ? (
        <div style={{ color: theme.muted, fontSize: 23, lineHeight: 1.32, marginTop: 16, width: 760 }}>
          {section.subtitle}
        </div>
      ) : null}
      <div style={{ display: "flex", gap: 26, marginTop: 40 }}>
        <ComparePanel
          accentColor="#fb7185"
          headline={section.before.headline}
          label={section.before.label}
          mutedColor={theme.muted}
          panelColor={theme.panel}
          points={section.before.points}
          textColor={theme.text}
        />
        <div
          style={{
            flex: 1,
            opacity: afterIn,
            transform: `translateX(${interpolate(afterIn, [0, 1], [34, 0], clamp)}px)`,
          }}
        >
          <ComparePanel
            accentColor={theme.primary}
            headline={section.after.headline}
            label={section.after.label}
            mutedColor={theme.muted}
            panelColor={theme.panel}
            points={section.after.points}
            textColor={theme.text}
          />
        </div>
      </div>
      {section.emphasis ? (
        <div
          style={{
            border: `1px solid ${theme.secondary}66`,
            borderRadius: 999,
            color: theme.secondary,
            display: "inline-flex",
            fontSize: 18,
            fontWeight: 900,
            marginTop: 28,
            padding: "11px 18px",
          }}
        >
          {section.emphasis}
        </div>
      ) : null}
    </div>
  );
};
```

- [x] **Step 2: Route runtime to before/after scene**

In `src/templates/technical-explainer/runtime.tsx`, import `BeforeAfterCompareScene`.

Add to `SectionScene`:

```tsx
    case "before-after-compare":
      return (
        <BeforeAfterCompareScene
          durationInFrames={durationInFrames}
          section={section}
          theme={spec.theme}
        />
      );
```

Keep `getMotionForSection()` defaulting this recipe to `stage-push`.

- [x] **Step 3: Run typecheck**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
```

Expected: PASS.

- [ ] **Step 4: Commit Task 3**

```bash
git add src/templates/technical-explainer/recipe-scenes.tsx src/templates/technical-explainer/runtime.tsx
git commit -m "feat: add technical explainer compare recipe"
```

## Task 4: Add Decision Matrix Runtime Recipe

**Files:**
- Modify: `src/templates/technical-explainer/recipe-scenes.tsx`
- Modify: `src/templates/technical-explainer/runtime.tsx`

- [x] **Step 1: Add decision matrix scene renderer**

In `src/templates/technical-explainer/recipe-scenes.tsx`, add:

```tsx
const ratingColor = (
  rating: "low" | "medium" | "high",
  theme: TechnicalExplainerSpec["theme"],
) => {
  if (rating === "high") {
    return "#22c55e";
  }
  if (rating === "medium") {
    return theme.secondary;
  }
  return "#fb7185";
};

export const DecisionMatrixScene: FC<
  TechnicalExplainerSceneProps<Extract<TechnicalExplainerSection, { recipeId: "decision-matrix" }>>
> = ({ section, theme }) => {
  const frame = useCurrentFrame();
  const tableIn = interpolate(frame, [24, 76], [0, 1], clamp);

  return (
    <div style={panelStyle(theme)}>
      <div style={{ fontSize: 44, fontWeight: 930, lineHeight: 1.04, marginTop: 16 }}>
        {section.title}
      </div>
      {section.subtitle ? (
        <div style={{ color: theme.muted, fontSize: 22, lineHeight: 1.32, marginTop: 14, width: 820 }}>
          {section.subtitle}
        </div>
      ) : null}
      <div
        style={{
          background: theme.panel,
          border: `1px solid ${theme.primary}55`,
          borderRadius: 22,
          marginTop: 34,
          opacity: tableIn,
          overflow: "hidden",
          transform: `translateY(${interpolate(tableIn, [0, 1], [28, 0], clamp)}px)`,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `220px repeat(${section.criteria.length}, 1fr)`,
          }}
        >
          <div style={{ color: theme.muted, fontSize: 16, fontWeight: 900, padding: "18px 20px" }}>
            Option
          </div>
          {section.criteria.map((criterion) => (
            <div
              key={criterion}
              style={{ color: theme.muted, fontSize: 16, fontWeight: 900, padding: "18px 16px" }}
            >
              {criterion}
            </div>
          ))}
          {section.options.map((option) => (
            <>
              <div
                key={`${option.label}-label`}
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.10)",
                  color: option.recommended ? theme.primary : theme.text,
                  fontSize: 20,
                  fontWeight: 900,
                  padding: "18px 20px",
                }}
              >
                {option.label}
                {option.summary ? (
                  <div style={{ color: theme.muted, fontSize: 14, fontWeight: 700, marginTop: 6 }}>
                    {option.summary}
                  </div>
                ) : null}
              </div>
              {section.criteria.map((criterion) => {
                const score =
                  option.scores.find((candidate) => candidate.criterion === criterion) ??
                  option.scores[0]!;
                return (
                  <div
                    key={`${option.label}-${criterion}`}
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.10)",
                      color: ratingColor(score.rating, theme),
                      fontSize: 18,
                      fontWeight: 850,
                      padding: "18px 16px",
                    }}
                  >
                    {score.rating.toUpperCase()}
                    {score.note ? (
                      <div style={{ color: theme.muted, fontSize: 13, fontWeight: 700, marginTop: 5 }}>
                        {score.note}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
      {section.decision ? (
        <div style={{ color: theme.secondary, fontSize: 20, fontWeight: 900, marginTop: 24 }}>
          {section.decision}
        </div>
      ) : null}
    </div>
  );
};
```

- [x] **Step 2: Route runtime to decision matrix scene**

In `src/templates/technical-explainer/runtime.tsx`, import `DecisionMatrixScene`.

Add to `SectionScene`:

```tsx
    case "decision-matrix":
      return (
        <DecisionMatrixScene
          durationInFrames={durationInFrames}
          section={section}
          theme={spec.theme}
        />
      );
```

Keep `getMotionForSection()` defaulting this recipe to `stage-push`.

- [x] **Step 3: Run typecheck**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
```

Expected: PASS.

- [ ] **Step 4: Commit Task 4**

```bash
git add src/templates/technical-explainer/recipe-scenes.tsx src/templates/technical-explainer/runtime.tsx
git commit -m "feat: add technical explainer decision matrix recipe"
```

## Task 5: Add Architecture Layer Stack Runtime Recipe

**Files:**
- Modify: `src/templates/technical-explainer/recipe-scenes.tsx`
- Modify: `src/templates/technical-explainer/runtime.tsx`

- [x] **Step 1: Add architecture layer stack scene renderer**

In `src/templates/technical-explainer/recipe-scenes.tsx`, add:

```tsx
const layerToneColor = (
  tone: "foundation" | "runtime" | "interface" | "provider" | undefined,
  theme: TechnicalExplainerSpec["theme"],
) => {
  if (tone === "foundation") {
    return "#64748b";
  }
  if (tone === "runtime") {
    return theme.primary;
  }
  if (tone === "interface") {
    return theme.secondary;
  }
  if (tone === "provider") {
    return "#22c55e";
  }
  return theme.primary;
};

export const ArchitectureLayerStackScene: FC<
  TechnicalExplainerSceneProps<
    Extract<TechnicalExplainerSection, { recipeId: "architecture-layer-stack" }>
  >
> = ({ section, theme }) => {
  const frame = useCurrentFrame();
  const stackIn = interpolate(frame, [20, 78], [0, 1], clamp);

  return (
    <div style={panelStyle(theme)}>
      <div style={{ display: "flex", gap: 48, marginTop: 24 }}>
        <div style={{ flex: 1, paddingTop: 34 }}>
          <div style={{ fontSize: 44, fontWeight: 930, lineHeight: 1.04 }}>
            {section.title}
          </div>
          {section.subtitle ? (
            <div style={{ color: theme.muted, fontSize: 22, lineHeight: 1.32, marginTop: 18 }}>
              {section.subtitle}
            </div>
          ) : null}
          {section.dataFlow?.length ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 30 }}>
              {section.dataFlow.map((step) => (
                <div
                  key={step}
                  style={{
                    border: `1px solid ${theme.primary}55`,
                    borderRadius: 999,
                    color: theme.primary,
                    fontSize: 15,
                    fontWeight: 850,
                    padding: "8px 12px",
                  }}
                >
                  {step}
                </div>
              ))}
            </div>
          ) : null}
          {section.emphasis ? (
            <div style={{ color: theme.secondary, fontSize: 20, fontWeight: 900, marginTop: 26 }}>
              {section.emphasis}
            </div>
          ) : null}
        </div>
        <div style={{ flex: 1, opacity: stackIn }}>
          {section.layers.map((layer, index) => {
            const layerIn = interpolate(frame, [34 + index * 16, 78 + index * 16], [0, 1], clamp);
            const color = layerToneColor(layer.tone, theme);
            return (
              <div
                key={layer.label}
                style={{
                  background: theme.panel,
                  border: `1px solid ${color}66`,
                  borderRadius: 20,
                  boxShadow: "0 22px 70px rgba(0,0,0,0.24)",
                  marginBottom: 14,
                  opacity: layerIn,
                  padding: "18px 22px",
                  transform: `translateX(${interpolate(layerIn, [0, 1], [32, 0], clamp)}px)`,
                }}
              >
                <div style={{ color, fontSize: 18, fontWeight: 900 }}>{layer.label}</div>
                {layer.detail ? (
                  <div style={{ color: theme.muted, fontSize: 16, lineHeight: 1.32, marginTop: 6 }}>
                    {layer.detail}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
```

- [x] **Step 2: Route runtime to architecture stack scene**

In `src/templates/technical-explainer/runtime.tsx`, import `ArchitectureLayerStackScene`.

Add to `SectionScene`:

```tsx
    case "architecture-layer-stack":
      return (
        <ArchitectureLayerStackScene
          durationInFrames={durationInFrames}
          section={section}
          theme={spec.theme}
        />
      );
```

Keep `getMotionForSection()` defaulting this recipe to `stage-push`.

- [x] **Step 3: Run typecheck**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
```

Expected: PASS.

- [ ] **Step 4: Commit Task 5**

```bash
git add src/templates/technical-explainer/recipe-scenes.tsx src/templates/technical-explainer/runtime.tsx
git commit -m "feat: add technical explainer architecture stack recipe"
```

## Task 6: Expand Deterministic Fixtures And Smokes

**Files:**
- Modify: `src/lib/staged-smoke-fixtures.ts`
- Modify: `scripts/technical-explainer-template-smoke.mjs`
- Modify: `scripts/planner-recipe-manifest-smoke.mjs`

- [x] **Step 1: Add four new sections to fixture implementation**

In `src/lib/staged-smoke-fixtures.ts`, add these sections to `technicalExplainerImplementation.sections` after the existing timeline section:

```ts
    {
      id: "code-diff",
      recipeId: "code-diff-highlight",
      title: "Compiler boundary stays structured",
      subtitle: "The model changes data, not renderer code.",
      fileLabel: "src/templates/technical-explainer/schema.ts",
      beforeLabel: "Before",
      afterLabel: "After",
      lines: [
        { text: "template: simple spotlight", mode: "remove" },
        { text: "recipe: code-diff-highlight", mode: "add", focus: true },
        { text: "recipe: decision-matrix", mode: "add", focus: true },
        { text: "output: VideoProject", mode: "neutral" },
      ],
      note: "The section remains schema-valid template data.",
      durationInFrames: 75,
    },
    {
      id: "compare",
      recipeId: "before-after-compare",
      title: "From sparse template output to recipe coverage",
      subtitle: "The product model stays stable while the visual vocabulary grows.",
      before: {
        label: "Before",
        headline: "Five generated recipes",
        points: ["Good skeleton", "Limited contrast scenes", "Code changes stuck in showcase"],
      },
      after: {
        label: "After",
        headline: "Nine generated recipes",
        points: ["Code diffs compile", "Tradeoffs render", "Architecture boundaries show clearly"],
      },
      emphasis: "More visual range without media-library scope.",
      durationInFrames: 75,
    },
    {
      id: "decision",
      recipeId: "decision-matrix",
      title: "Choose the next bounded slice",
      subtitle: "Tradeoffs stay readable without turning the project into a planning deck.",
      criteria: ["Visual impact", "Scope risk", "Reuse"],
      options: [
        {
          label: "Asset-aware recipes",
          summary: "Powerful but wider",
          scores: [
            { criterion: "Visual impact", rating: "high", note: "Real material helps" },
            { criterion: "Scope risk", rating: "low", note: "Needs asset rules" },
            { criterion: "Reuse", rating: "medium", note: "Useful later" },
          ],
        },
        {
          label: "Recipe expansion",
          summary: "Best next branch fit",
          scores: [
            { criterion: "Visual impact", rating: "high", note: "More scene language" },
            { criterion: "Scope risk", rating: "high", note: "No new asset model" },
            { criterion: "Reuse", rating: "high", note: "Compiler can select it" },
          ],
          recommended: true,
        },
      ],
      decision: "Expand generated recipe coverage before Phase 5 assets.",
      durationInFrames: 75,
    },
    {
      id: "layers",
      recipeId: "architecture-layer-stack",
      title: "Keep ownership layered",
      subtitle: "Recipes grow inside the template while the product model stays stable.",
      layers: [
        { label: "VideoProject", detail: "Preview and export boundary", tone: "interface" },
        { label: "StoryboardPlan", detail: "Planner-stage segment intent", tone: "foundation" },
        { label: "technical-explainer", detail: "Template-owned recipe schema", tone: "runtime" },
        { label: "DeepSeek", detail: "Compiler fills bounded parameters", tone: "provider" },
      ],
      dataFlow: ["brief", "recipeHints", "implementation", "ProjectVideo"],
      emphasis: "More recipes, same segment-first architecture.",
      durationInFrames: 75,
    },
```

Increase `technicalExplainerImplementation.durationInFrames` from `420` to `690`.

- [x] **Step 2: Add recipe hints to storyboard fixture**

In the first `technicalExplainerStoryboardPlan.segments` item, add:

```ts
        {
          recipeId: "code-diff-highlight",
          reason: "The segment explains a concrete implementation change.",
        },
        {
          recipeId: "architecture-layer-stack",
          reason: "The segment explains ownership boundaries between planning, compiling, and rendering.",
        },
```

In the second item, add:

```ts
        {
          recipeId: "before-after-compare",
          reason: "The segment compares the previous recipe range with the expanded range.",
        },
        {
          recipeId: "decision-matrix",
          reason: "The segment explains why recipe expansion is the better bounded next slice.",
        },
```

- [x] **Step 3: Keep compiled segments focused**

In the first `technicalExplainerCompiledSegments` item, keep the full fixture implementation so it covers all recipes.

In the second item, update the `sections` filter:

```ts
      sections: technicalExplainerImplementation.sections.filter((section) =>
        ["metric-countup", "timeline-progress", "before-after-compare", "decision-matrix"].includes(
          section.recipeId,
        ),
      ),
```

Set its `durationInFrames` to `480` so the four sections fit:

```ts
      durationInFrames: 480,
```

- [x] **Step 4: Add smoke assertions for fixtures**

In `scripts/technical-explainer-template-smoke.mjs`, add:

```js
assertIncludes(fixtureSource, 'recipeId: "code-diff-highlight"', "staged smoke fixtures");
assertIncludes(fixtureSource, 'recipeId: "before-after-compare"', "staged smoke fixtures");
assertIncludes(fixtureSource, 'recipeId: "decision-matrix"', "staged smoke fixtures");
assertIncludes(fixtureSource, 'recipeId: "architecture-layer-stack"', "staged smoke fixtures");
```

The `requiredRecipeIds` loop already checks schema/definition/fixture coverage for all four ids after Task 1.

- [x] **Step 5: Run deterministic smokes**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:planner-recipe-manifest'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:technical-explainer-template'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:storyboard-recipe-hints'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
```

Expected: PASS.

- [ ] **Step 6: Commit Task 6**

```bash
git add src/lib/staged-smoke-fixtures.ts scripts/technical-explainer-template-smoke.mjs scripts/planner-recipe-manifest-smoke.mjs
git commit -m "test: cover expanded technical explainer recipes"
```

## Task 7: Visual Verification Stills

**Files:**
- No required code files.
- Output artifacts under `/workspace/out/` inside Docker.

- [x] **Step 1: Render code diff still**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx remotion still src/remotion/index.ts TechnicalExplainerTemplatePreview /workspace/out/technical-explainer-code-diff.png --frame=430 --scale=0.5'
```

Expected: PASS and writes `/workspace/out/technical-explainer-code-diff.png`.

- [x] **Step 2: Render before/after still**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx remotion still src/remotion/index.ts TechnicalExplainerTemplatePreview /workspace/out/technical-explainer-before-after.png --frame=505 --scale=0.5'
```

Expected: PASS and writes `/workspace/out/technical-explainer-before-after.png`.

- [x] **Step 3: Render decision matrix still**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx remotion still src/remotion/index.ts TechnicalExplainerTemplatePreview /workspace/out/technical-explainer-decision-matrix.png --frame=580 --scale=0.5'
```

Expected: PASS and writes `/workspace/out/technical-explainer-decision-matrix.png`.

- [x] **Step 4: Render architecture layer stack still**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx remotion still src/remotion/index.ts TechnicalExplainerTemplatePreview /workspace/out/technical-explainer-layer-stack.png --frame=655 --scale=0.5'
```

Expected: PASS and writes `/workspace/out/technical-explainer-layer-stack.png`.

- [x] **Step 5: Render existing recipe sanity still**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx remotion still src/remotion/index.ts TechnicalExplainerTemplatePreview /workspace/out/technical-explainer-expanded-hero.png --frame=45 --scale=0.5'
```

Expected: PASS and writes `/workspace/out/technical-explainer-expanded-hero.png`.

- [x] **Step 6: Inspect generated still paths**

Run:

```bash
docker compose run --rm web bash -lc 'ls -lh /workspace/out/technical-explainer-code-diff.png /workspace/out/technical-explainer-before-after.png /workspace/out/technical-explainer-decision-matrix.png /workspace/out/technical-explainer-layer-stack.png /workspace/out/technical-explainer-expanded-hero.png'
```

Expected: five non-empty PNG files.

- [ ] **Step 7: Commit Task 7 if code changed during visual fixes**

If visual inspection requires CSS/layout fixes, commit those fixes:

```bash
git add src/remotion/recipes/blocks/code-diff-block.tsx src/templates/technical-explainer/recipe-scenes.tsx src/templates/technical-explainer/runtime.tsx src/lib/staged-smoke-fixtures.ts
git commit -m "fix: polish expanded recipe stills"
```

If no code changed, skip this commit.

## Task 8: Update Live Smoke Reporting Conservatively

**Files:**
- Modify: `scripts/staged-live-smoke.mjs`

- [x] **Step 1: Add non-blocking expanded recipe reporting**

In `scripts/staged-live-smoke.mjs`, after the existing technical-explainer section checks, add code that reports expanded recipes without failing the route if the model chooses another valid recipe mix:

```js
const expandedRecipeIds = new Set([
  "code-diff-highlight",
  "before-after-compare",
  "decision-matrix",
  "architecture-layer-stack",
]);
const expandedRecipeCount = technicalExplainerSegments.flatMap(
  (segment) => segment.implementation.sections ?? [],
).filter((section) => expandedRecipeIds.has(section.recipeId)).length;

console.log(`Expanded technical-explainer recipe sections: \${expandedRecipeCount}`);
```

Do not add a hard failure that requires expanded recipes in every live smoke. The live brief may still legitimately choose the original five recipes.

- [x] **Step 2: Run deterministic validation**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
```

Expected: PASS.

- [ ] **Step 3: Commit Task 8**

```bash
git add scripts/staged-live-smoke.mjs
git commit -m "test: report expanded recipe live coverage"
```

## Task 9: Sync Active Docs

**Files:**
- Modify: `docs/ITERATION_STATUS.md`
- Modify: `docs/VISUAL_RECIPE_ROADMAP.md`
- Modify: `README.md`

- [x] **Step 1: Update iteration status**

At the top of `docs/ITERATION_STATUS.md`, add a new latest continuation:

```markdown
## Latest continuation — Recipe Coverage Expansion Phase 4.5

- Expanded the real generated `technical-explainer` template from 5 to 9 planner-selectable recipes by adding `code-diff-highlight`, `before-after-compare`, `decision-matrix`, and `architecture-layer-stack`.
- Kept the branch goal focused on visual expression: no media library, no arbitrary asset URLs, no generated TSX execution, no visual-review scoring, and no persistence work.
- `code-diff-highlight` renders semantic add/remove/neutral code or config lines inside the existing template implementation model.
- `before-after-compare` renders old/new workflow or problem/solution contrast without requiring screenshots or uploaded assets.
- `decision-matrix` renders option/criteria tradeoffs for technical decisions without adding a separate planning model.
- `architecture-layer-stack` renders ownership layers and data-flow labels for architecture explanations without widening `VideoProject`.
- `product-ui-zoom` remains deferred to Phase 5 Asset-Aware Recipes because it needs controlled screenshot or UI image inputs to be useful.

Validation performed:
- `docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:planner-recipe-manifest'`
- `docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:technical-explainer-template'`
- `docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'`
- `docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:storyboard-recipe-hints'`
- `docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'`
- `docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'`
- Remotion still renders:
  - `/workspace/out/technical-explainer-code-diff.png`
  - `/workspace/out/technical-explainer-before-after.png`
  - `/workspace/out/technical-explainer-decision-matrix.png`
  - `/workspace/out/technical-explainer-layer-stack.png`
  - `/workspace/out/technical-explainer-expanded-hero.png`
```

- [x] **Step 2: Update visual recipe roadmap**

In `docs/VISUAL_RECIPE_ROADMAP.md`, insert after Phase 4:

```markdown
### Phase 4.5: Recipe Coverage Expansion

Status: implemented when this plan lands.

Goal: increase the real generated recipe vocabulary before introducing asset-aware recipes.

Deliver:

- promote `code-diff-highlight` from showcase-only to the real `technical-explainer` template
- add `before-after-compare` for old/new workflow and problem/solution contrast
- add `decision-matrix` for bounded technical tradeoff explanations
- add `architecture-layer-stack` for module/layer ownership explanations
- keep all four recipes as bounded template-owned implementation fields
- keep `product-ui-zoom` deferred until Phase 5 because it depends on controlled screenshot or UI image inputs

Acceptance:

- `technical-explainer` publishes 9 planner-facing recipes
- deterministic staged fixtures include the four new recipes
- preview/export still use `ProjectVideo`
- no media library, arbitrary URLs, generated TSX execution, or visual scoring is introduced
```

Update Phase 3's initial recipe list to mention the original five and note Phase 4.5 expands it to nine.

- [x] **Step 3: Update README**

In `README.md`, update the current visual-quality direction:

```markdown
- Phase 4.5 recipe coverage expansion adds generated `code-diff-highlight`,
  `before-after-compare`, `decision-matrix`, and
  `architecture-layer-stack` recipes to `technical-explainer`, bringing the
  real planner/compiler template to 9 bounded recipe sections while keeping
  `product-ui-zoom` deferred to asset-aware Phase 5.
```

- [x] **Step 4: Run doc check**

Run:

```bash
git diff --check
```

Expected: PASS.

- [ ] **Step 5: Commit Task 9**

```bash
git add docs/ITERATION_STATUS.md docs/VISUAL_RECIPE_ROADMAP.md README.md
git commit -m "docs: plan expanded recipe coverage"
```

## Task 10: Final Verification And Handoff

**Files:**
- No planned file changes unless verification exposes a small bug.

- [x] **Step 1: Run full deterministic gate**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:planner-recipe-manifest'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:storyboard-recipe-hints'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:technical-explainer-template'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run build'
git diff --check
```

Expected: all PASS.

- [ ] **Step 2: Optional provider-backed route smoke**

Only run this when the local Next/F5 contract-smoke runtime is already up:

```bash
docker compose -f docker-compose.yml -f docker-compose.f5.yml exec -T web bash -lc 'npm run smoke:staged-live'
```

Expected:

- PASS when runtime is reachable.
- If it fails because Next is unreachable or the real F5 runtime has no visible NVIDIA driver, record it as environment/runtime status, not as a recipe implementation blocker.

- [x] **Step 3: Summarize behavior change**

Use this handoff summary:

```markdown
Recipe Coverage Expansion adds four real generated recipes to `technical-explainer`:

- `code-diff-highlight` for semantic code/config/schema changes
- `before-after-compare` for old/new workflow or problem/solution contrast
- `decision-matrix` for bounded technical tradeoffs
- `architecture-layer-stack` for module/layer ownership explanations

The generated-video model is unchanged: planner recipe hints remain storyboard-boundary hints, the compiler still emits template-owned `implementation`, and preview/export still consume a normal `VideoProject`. Phase 5 asset-aware work remains deferred.
```

- [ ] **Step 4: Final commit if verification fixes were needed**

If any verification fix changed code or docs:

```bash
git add src/templates/technical-explainer/schema.ts src/templates/technical-explainer/definition.ts src/templates/technical-explainer/recipe-scenes.tsx src/templates/technical-explainer/runtime.tsx src/remotion/recipes/blocks/code-diff-block.tsx src/remotion/recipes/blocks/index.ts src/lib/staged-smoke-fixtures.ts scripts/technical-explainer-template-smoke.mjs scripts/planner-recipe-manifest-smoke.mjs scripts/staged-live-smoke.mjs docs/ITERATION_STATUS.md docs/VISUAL_RECIPE_ROADMAP.md README.md
git commit -m "fix: verify expanded technical explainer recipes"
```

Otherwise skip this commit.

## Self-Review

Spec coverage:

- Branch objective is covered by keeping `VideoProject`, `StoryboardPlan`, narration, captions, and one-template-per-segment unchanged.
- The user request to focus on more high-quality scene recipes is covered by adding `code-diff-highlight`, `before-after-compare`, `decision-matrix`, and `architecture-layer-stack`.
- The question of `product-ui-zoom` is resolved by deferring it to Phase 5 because it needs controlled screenshot/image inputs.
- Low coupling and high cohesion are covered by keeping recipe schema, metadata, compiler prompt, runtime scene, fixture, and smoke coverage inside the owning `technical-explainer` template boundary.

Placeholder scan:

- No deferred code placeholders are used inside implementation steps.
- Optional showcase reuse is explicitly allowed to be skipped without blocking the core generated-template goal.

Type consistency:

- Recipe ids are consistent across schema, definition, runtime, fixtures, and smokes:
  - `code-diff-highlight`
  - `before-after-compare`
  - `decision-matrix`
  - `architecture-layer-stack`
- Section field names match the planned schema and JSON schema:
  - `lines[].mode`, `lines[].focus`
  - `before.label`, `before.headline`, `before.points`
  - `after.label`, `after.headline`, `after.points`
  - `criteria[]`, `options[].scores[].criterion`, `options[].scores[].rating`
  - `layers[].label`, `layers[].detail`, `layers[].tone`, `dataFlow[]`
