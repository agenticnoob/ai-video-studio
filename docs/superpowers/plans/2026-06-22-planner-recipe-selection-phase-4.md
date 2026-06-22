# Planner Recipe Selection Phase 4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Status:** Implemented and closed. Follow-up live-smoke closure is documented in `docs/superpowers/plans/2026-06-22-phase-4-live-smoke-closure.md`; contract-smoke provider-backed route validation passed, while real-GPU F5 route validation is blocked by the current environment lacking a visible NVIDIA driver.

**Goal:** Complete Visual Recipe Roadmap Phase 4 by letting DeepSeek choose planner-safe recipe families for recipe-capable templates while keeping generated output as a normal editable `VideoProject`.

**Architecture:** Publish recipe metadata from registered template definitions, derive a compact planner recipe manifest in the registry, validate optional `StoryboardPlan.segments[].recipeHints[]` against the selected template, and pass those hints into the existing selected-template compiler. Keep recipe runtime and implementation ownership inside the selected template; do not add a global recipe model or expose Remotion internals to the planner.

**Tech Stack:** TypeScript, Zod, existing template registry, DeepSeek JSON-mode planner/compiler prompts, Remotion, deterministic Node smoke scripts, Docker-first validation, ESLint, `tsc --noEmit`.

---

## Phase Boundary

Implement:

- planner-facing recipe metadata in template definitions
- a derived recipe manifest for prompt use and tests
- optional validated `recipeHints` on storyboard segment plans
- DeepSeek planner and revision prompt guidance for recipe hints
- compiler payload support so valid hints are visible during implementation compilation
- deterministic smoke coverage for manifest consistency and storyboard recipe hint validation
- fixture updates proving recipe hints survive into staged technical-explainer fixtures

Do not implement:

- a top-level `VideoProject` recipe field
- a global recipe registry outside registered template definitions
- generated TSX execution
- broad Visual IR rewrite
- media library or media-layer editor
- visual-review scoring or screenshot repair
- persistence/history
- multi-template-per-segment orchestration

## File Structure

- Modify: `src/templates/definition.ts`
  - Adds `TemplatePlannerRecipe` and optional `planner.recipes`.
- Modify: `src/templates/technical-explainer/schema.ts`
  - Exports `technicalExplainerRecipeIds` as the single source of truth for recipe ids.
- Modify: `src/templates/technical-explainer/definition.ts`
  - Publishes planner-safe metadata for the five technical-explainer recipes.
- Modify: `src/templates/registry.ts`
  - Adds derived recipe manifest types, data builder, and prompt formatter.
- Modify: `src/lib/template-registry.ts`
  - Re-exports the new registry helpers for existing `src/lib/*` imports.
- Modify: `src/lib/storyboard-plan-schema.ts`
  - Adds `storyboardRecipeHintSchema`, optional `recipeHints`, and cross-field validation.
- Modify: `src/lib/deepseek/prompts.ts`
  - Updates planner/revision/compiler prompts to describe and pass recipe hints.
- Modify: `src/lib/staged-smoke-fixtures.ts`
  - Adds recipe hints to technical-explainer storyboard fixtures.
- Create: `scripts/planner-recipe-manifest-smoke.mjs`
  - Guards manifest consistency and prompt-safe recipe exposure.
- Create: `scripts/storyboard-recipe-hints-smoke.mjs`
  - Guards parser validation for valid and invalid recipe hints.
- Modify: `package.json`
  - Adds `smoke:planner-recipe-manifest` and `smoke:storyboard-recipe-hints`.
- Optionally modify: `scripts/staged-live-smoke.mjs`
  - Adds a recipe-rich technical brief assertion if the existing smoke does not already cover it.
- Modify: `docs/ITERATION_STATUS.md`
  - Records Phase 4 status and validation after implementation.
- Modify: `docs/VISUAL_RECIPE_ROADMAP.md`
  - Marks Phase 4 implemented when the slice lands.
- Modify: `README.md`
  - Updates current visual-quality direction.

## Task 1: Add Template Recipe Manifest Contract

**Files:**
- Modify: `src/templates/definition.ts`
- Modify: `src/templates/technical-explainer/schema.ts`
- Modify: `src/templates/technical-explainer/definition.ts`
- Modify: `src/templates/registry.ts`
- Modify: `src/lib/template-registry.ts`
- Create: `scripts/planner-recipe-manifest-smoke.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write the red manifest smoke**

Create `scripts/planner-recipe-manifest-smoke.mjs`:

```js
import { readFileSync } from "node:fs";
import {
  buildPlannerRecipeManifest,
  buildPlannerRecipeManifestPrompt,
} from "../src/templates/registry";

const read = (path) => readFileSync(path, "utf8");

const definitionTypes = read("src/templates/definition.ts");
const technicalSchema = read("src/templates/technical-explainer/schema.ts");
const technicalDefinition = read("src/templates/technical-explainer/definition.ts");
const registry = read("src/templates/registry.ts");

const requiredRecipeIds = [
  "hero-title-reveal",
  "terminal-build-run",
  "workflow-node-map",
  "metric-countup",
  "timeline-progress",
];

const assertIncludes = (source, snippet, label) => {
  if (!source.includes(snippet)) {
    throw new Error(`${label} is missing required snippet: ${snippet}`);
  }
};

assertIncludes(definitionTypes, "TemplatePlannerRecipe", "template definition types");
assertIncludes(definitionTypes, "recipes?: TemplatePlannerRecipe[]", "template planner metadata");
assertIncludes(technicalSchema, "technicalExplainerRecipeIds", "technical explainer schema");
assertIncludes(technicalDefinition, "recipes:", "technical explainer planner metadata");
assertIncludes(registry, "buildPlannerRecipeManifest", "template registry");
assertIncludes(registry, "buildPlannerRecipeManifestPrompt", "template registry");

const manifest = buildPlannerRecipeManifest();
const prompt = buildPlannerRecipeManifestPrompt();

for (const recipeId of requiredRecipeIds) {
  assertIncludes(technicalSchema, recipeId, "technical explainer schema");
  assertIncludes(technicalDefinition, recipeId, "technical explainer definition");
  if (!manifest.some((entry) => entry.templateId === "technical-explainer" && entry.recipeId === recipeId)) {
    throw new Error(`Planner recipe manifest is missing technical-explainer recipe: ${recipeId}`);
  }
  assertIncludes(prompt, recipeId, "planner recipe manifest prompt");
}

console.log("Planner recipe manifest smoke passed.");
```

- [ ] **Step 2: Add the smoke script command**

In `package.json`, add this under `scripts`:

```json
"smoke:planner-recipe-manifest": "rm -rf /tmp/planner-recipe-manifest-smoke-build && npx tsc --allowJs --target es2022 --module commonjs --moduleResolution node --skipLibCheck --esModuleInterop --noEmit false --outDir /tmp/planner-recipe-manifest-smoke-build scripts/planner-recipe-manifest-smoke.mjs src/templates/registry.ts src/templates/definition.ts src/templates/registered-definitions.ts src/templates/technical-explainer/schema.ts src/templates/technical-explainer/definition.ts && NODE_PATH=/workspace/node_modules:node_modules node /tmp/planner-recipe-manifest-smoke-build/scripts/planner-recipe-manifest-smoke.mjs"
```

- [ ] **Step 3: Run the red smoke**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:planner-recipe-manifest'
```

Expected: FAIL because `TemplatePlannerRecipe`, `technicalExplainerRecipeIds`,
and recipe manifest builders do not exist yet.

- [ ] **Step 4: Extend template definition metadata**

In `src/templates/definition.ts`, replace `TemplatePlannerMetadata` with:

```ts
export type TemplatePlannerRecipe = {
  recipeId: string;
  label: string;
  bestFor: string[];
  avoidCases: string[];
  requiredInputsSummary: string;
  durationFit: string;
};

export type TemplatePlannerMetadata = {
  description: string;
  avoidCases: string[];
  narrationFit: string;
  mediaExpectations: string;
  examples: string[];
  recipes?: TemplatePlannerRecipe[];
};
```

- [ ] **Step 5: Export technical explainer recipe ids from the schema**

In `src/templates/technical-explainer/schema.ts`, replace the inline enum array:

```ts
export const technicalExplainerRecipeIds = [
  "hero-title-reveal",
  "terminal-build-run",
  "workflow-node-map",
  "metric-countup",
  "timeline-progress",
] as const;

export const technicalExplainerRecipeIdSchema = z.enum(technicalExplainerRecipeIds);
```

Keep the existing `TechnicalExplainerRecipeId` type:

```ts
export type TechnicalExplainerRecipeId = z.infer<typeof technicalExplainerRecipeIdSchema>;
```

- [ ] **Step 6: Publish recipe metadata from technical-explainer definition**

In `src/templates/technical-explainer/definition.ts`, import the ids:

```ts
import {
  getTechnicalExplainerDuration,
  technicalExplainerRecipeIds,
  technicalExplainerSegmentSchema,
  technicalExplainerSpecSchema,
} from "./schema";
```

Add this near the top of the file:

```ts
const technicalExplainerPlannerRecipes = [
  {
    recipeId: "hero-title-reveal",
    label: "Hero title reveal",
    bestFor: ["opening thesis", "promise framing", "concept introduction"],
    avoidCases: ["dense process details", "raw logs", "metric recap"],
    requiredInputsSummary: "primary text, optional eyebrow, supporting text, and up to 3 callouts",
    durationFit: "Works well as a short opener or thesis beat.",
  },
  {
    recipeId: "terminal-build-run",
    label: "Terminal build/run",
    bestFor: ["CLI flow", "logs", "build/test/deploy command", "developer workflow proof"],
    avoidCases: ["non-technical emotion", "chart-only recap", "timeline milestones"],
    requiredInputsSummary: "command, 2-6 terminal lines, optional status label",
    durationFit: "Works best for a medium beat with enough time to read command output.",
  },
  {
    recipeId: "workflow-node-map",
    label: "Workflow node map",
    bestFor: ["architecture", "pipeline", "dependencies", "multi-step system flow"],
    avoidCases: ["single-card punchline", "raw command output", "numeric-only recap"],
    requiredInputsSummary: "3-6 labeled nodes, optional detail text, optional active node",
    durationFit: "Works well for medium explanations with staged activation.",
  },
  {
    recipeId: "metric-countup",
    label: "Metric count-up",
    bestFor: ["outcomes", "signals", "KPI recap", "before/after numbers"],
    avoidCases: ["step-by-step process", "long prose", "CLI logs"],
    requiredInputsSummary: "2-4 metric labels, values, and optional details",
    durationFit: "Works well for concise recap beats.",
  },
  {
    recipeId: "timeline-progress",
    label: "Timeline progress",
    bestFor: ["milestones", "phase rollout", "implementation checkpoints", "delivery path"],
    avoidCases: ["raw code output", "single opening title", "dashboard-heavy analysis"],
    requiredInputsSummary: "3-5 checkpoints and optional note",
    durationFit: "Works well as a closing or progress-oriented beat.",
  },
] satisfies {
  recipeId: (typeof technicalExplainerRecipeIds)[number];
  label: string;
  bestFor: string[];
  avoidCases: string[];
  requiredInputsSummary: string;
  durationFit: string;
}[];
```

Then add it to `planner`:

```ts
recipes: technicalExplainerPlannerRecipes,
```

- [ ] **Step 7: Derive recipe manifest in the registry**

In `src/templates/registry.ts`, add:

```ts
export type PlannerRecipeManifestEntry = {
  templateId: TemplateId;
  templateLabel: string;
  recipeId: string;
  label: string;
  bestFor: string[];
  avoidCases: string[];
  requiredInputsSummary: string;
  durationFit: string;
};

export const buildPlannerRecipeManifest = (): PlannerRecipeManifestEntry[] => {
  return templateIds.flatMap((templateId) => {
    const template = templateDefinitions[templateId];
    return (template.planner.recipes ?? []).map((recipe) => ({
      templateId,
      templateLabel: template.label,
      recipeId: recipe.recipeId,
      label: recipe.label,
      bestFor: recipe.bestFor,
      avoidCases: recipe.avoidCases,
      requiredInputsSummary: recipe.requiredInputsSummary,
      durationFit: recipe.durationFit,
    }));
  });
};

export const getPlannerRecipeIdsForTemplate = (templateId: TemplateId): string[] => {
  return (templateDefinitions[templateId].planner.recipes ?? []).map((recipe) => recipe.recipeId);
};

export const buildPlannerRecipeManifestPrompt = (): string => {
  const byTemplate = templateIds
    .map((templateId) => {
      const template = templateDefinitions[templateId];
      const recipes = template.planner.recipes ?? [];
      if (recipes.length === 0) {
        return "";
      }

      return [
        `- ${templateId} (${template.label})`,
        ...recipes.map((recipe) =>
          [
            `  - ${recipe.recipeId} (${recipe.label})`,
            `    bestFor: ${recipe.bestFor.join(", ")}`,
            `    avoidCases: ${recipe.avoidCases.join(", ")}`,
            `    requiredInputs: ${recipe.requiredInputsSummary}`,
            `    durationFit: ${recipe.durationFit}`,
          ].join("\n"),
        ),
      ].join("\n");
    })
    .filter(Boolean);

  return byTemplate.length > 0
    ? byTemplate.join("\n\n")
    : "No planner-facing recipes are registered.";
};
```

- [ ] **Step 8: Add recipe manifest to planner template entries**

In `PlannerTemplateManifestEntry`, add:

```ts
recipes?: {
  recipeId: string;
  label: string;
  bestFor: string[];
  avoidCases: string[];
  requiredInputsSummary: string;
  durationFit: string;
}[];
```

In `buildPlannerTemplateManifest()`, add:

```ts
recipes: template.planner.recipes,
```

In `buildPlannerTemplateManifestPrompt()`, append a compact line:

```ts
template.recipes && template.recipes.length > 0
  ? `  recipes: ${template.recipes.map((recipe) => recipe.recipeId).join(", ")}`
  : "  recipes: none",
```

- [ ] **Step 9: Re-export recipe manifest helpers through the lib compatibility module**

In `src/lib/template-registry.ts`, add these value exports:

```ts
  buildPlannerRecipeManifest,
  buildPlannerRecipeManifestPrompt,
  getPlannerRecipeIdsForTemplate,
```

Add this type export:

```ts
  PlannerRecipeManifestEntry,
```

- [ ] **Step 10: Run manifest smoke and typecheck**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:planner-recipe-manifest'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
```

Expected: PASS.

- [ ] **Step 11: Commit Task 1**

```bash
git add src/templates/definition.ts src/templates/technical-explainer/schema.ts src/templates/technical-explainer/definition.ts src/templates/registry.ts src/lib/template-registry.ts scripts/planner-recipe-manifest-smoke.mjs package.json
git commit -m "feat: add planner recipe manifest"
```

## Task 2: Add Storyboard Recipe Hint Validation

**Files:**
- Modify: `src/lib/storyboard-plan-schema.ts`
- Create: `scripts/storyboard-recipe-hints-smoke.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write the red recipe hint parser smoke**

Create `scripts/storyboard-recipe-hints-smoke.mjs`:

```js
import { parseStoryboardPlanToolCallArguments } from "../src/lib/deepseek/parse-storyboard-plan";

const basePlan = {
  title: "Recipe hint smoke",
  brief: "Explain a technical workflow.",
  segments: [
    {
      id: "segment-1",
      order: 1,
      title: "Workflow",
      purpose: "Explain the build and deploy path.",
      templateId: "technical-explainer",
      templateReason: "The technical explainer supports workflow and terminal recipes.",
      narration: {
        text: "The workflow starts with planning, then runs tests, then ships.",
      },
      visualBrief: "Show workflow nodes and terminal output.",
      recipeHints: [
        {
          recipeId: "workflow-node-map",
          reason: "The segment explains a staged system flow.",
        },
        {
          recipeId: "terminal-build-run",
          reason: "The narration references running commands and tests.",
        },
      ],
    },
  ],
};

const parse = (value) => parseStoryboardPlanToolCallArguments(JSON.stringify(value));
const clone = (value) => JSON.parse(JSON.stringify(value));

const validPlan = parse(basePlan);
if (validPlan.segments[0].recipeHints?.length !== 2) {
  throw new Error("Expected valid recipe hints to survive storyboard parsing.");
}

const invalidRecipeId = clone(basePlan);
invalidRecipeId.segments[0].recipeHints = [
  {
    recipeId: "invented-recipe",
    reason: "The provider invented an unsupported recipe.",
  },
];

try {
  parse(invalidRecipeId);
  throw new Error("Expected invented recipe id to fail validation.");
} catch (error) {
  if (!String(error).includes("recipeHints")) {
    throw error;
  }
}

const wrongTemplate = clone(basePlan);
wrongTemplate.segments[0].templateId = "spotlight";
wrongTemplate.segments[0].recipeHints = [
  {
    recipeId: "workflow-node-map",
    reason: "Spotlight does not publish planner-facing recipes.",
  },
];

try {
  parse(wrongTemplate);
  throw new Error("Expected recipe hints on a template without recipes to fail validation.");
} catch (error) {
  if (!String(error).includes("recipeHints")) {
    throw error;
  }
}

const noHints = clone(basePlan);
delete noHints.segments[0].recipeHints;
parse(noHints);

console.log("Storyboard recipe hints smoke passed.");
```

- [ ] **Step 2: Add the smoke script command**

In `package.json`, add this under `scripts`:

```json
"smoke:storyboard-recipe-hints": "rm -rf /tmp/storyboard-recipe-hints-smoke-build && npx tsc --allowJs --target es2022 --module commonjs --moduleResolution node --skipLibCheck --esModuleInterop --noEmit false --outDir /tmp/storyboard-recipe-hints-smoke-build scripts/storyboard-recipe-hints-smoke.mjs src/lib/deepseek/parse-storyboard-plan.ts src/lib/storyboard-plan-schema.ts src/lib/template-registry.ts src/templates/registry.ts src/templates/definition.ts src/templates/registered-definitions.ts src/templates/technical-explainer/schema.ts src/templates/technical-explainer/definition.ts && NODE_PATH=/workspace/node_modules:node_modules node /tmp/storyboard-recipe-hints-smoke-build/scripts/storyboard-recipe-hints-smoke.mjs"
```

- [ ] **Step 3: Run the red smoke**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:storyboard-recipe-hints'
```

Expected: FAIL because `recipeHints` is not part of the strict
`StoryboardSegmentPlan` schema.

- [ ] **Step 4: Add the recipe hint schema**

In `src/lib/storyboard-plan-schema.ts`, update imports:

```ts
import {
  getPlannerRecipeIdsForTemplate,
  registeredTemplateIds,
  type TemplateId,
} from "./template-registry";
```

Add before `storyboardSegmentPlanSchema`:

```ts
export const storyboardRecipeHintSchema = z
  .object({
    recipeId: z.string().trim().min(1).max(80),
    reason: z.string().trim().min(1).max(400),
  })
  .strict();
```

Add the optional field inside `storyboardSegmentPlanSchema`:

```ts
recipeHints: z.array(storyboardRecipeHintSchema).min(1).max(5).optional(),
```

Add the exported type:

```ts
export type StoryboardRecipeHint = z.infer<typeof storyboardRecipeHintSchema>;
```

- [ ] **Step 5: Validate hints against the selected template**

In the existing `storyboardPlanSchema.superRefine()`, inside the segment loop,
after order/id checks, add:

```ts
    const recipeHints = segment.recipeHints ?? [];
    if (recipeHints.length > 0) {
      const allowedRecipeIds = getPlannerRecipeIdsForTemplate(segment.templateId);
      if (allowedRecipeIds.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: `Template "${segment.templateId}" does not support planner recipe hints.`,
          path: ["segments", index, "recipeHints"],
        });
      }

      for (let hintIndex = 0; hintIndex < recipeHints.length; hintIndex++) {
        const hint = recipeHints[hintIndex];
        if (!allowedRecipeIds.includes(hint.recipeId)) {
          ctx.addIssue({
            code: "custom",
            message: `Recipe "${hint.recipeId}" is not registered for template "${segment.templateId}".`,
            path: ["segments", index, "recipeHints", hintIndex, "recipeId"],
          });
        }
      }
    }
```

- [ ] **Step 6: Run parser smoke and staged fixtures**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:storyboard-recipe-hints'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
```

Expected: PASS.

- [ ] **Step 7: Commit Task 2**

```bash
git add src/lib/storyboard-plan-schema.ts scripts/storyboard-recipe-hints-smoke.mjs package.json
git commit -m "feat: validate storyboard recipe hints"
```

## Task 3: Update DeepSeek Planner And Compiler Prompts

**Files:**
- Modify: `src/lib/deepseek/prompts.ts`
- Modify: `scripts/planner-recipe-manifest-smoke.mjs`

- [ ] **Step 1: Extend smoke coverage for prompt boundaries**

In `scripts/planner-recipe-manifest-smoke.mjs`, add these assertions:

```js
assertIncludes(prompts, "recipeHints", "DeepSeek prompts");
assertIncludes(prompts, "buildPlannerRecipeManifestPrompt", "DeepSeek prompts");
assertIncludes(prompts, "Do not generate implementation", "DeepSeek prompts");
assertIncludes(prompts, "The compiler turns recipe hints into implementation fields", "DeepSeek prompts");
```

- [ ] **Step 2: Import the recipe manifest prompt helper**

In `src/lib/deepseek/prompts.ts`, update the registry import:

```ts
import {
  buildPlannerRecipeManifestPrompt,
  buildPlannerTemplateManifestPrompt,
  getTemplateDefinition,
  templateIds,
} from "../template-registry";
```

- [ ] **Step 3: Update the storyboard planner system prompt**

In `STORYBOARD_PLAN_SYSTEM_PROMPT`, add these output requirements:

```txt
- when a selected template lists planner-facing recipes, optionally set segment.recipeHints to the most relevant recipe ids from that template only
- each recipe hint must be { recipeId, reason }
- leave recipeHints omitted when no listed recipe fits the segment
```

Add this section after `# Planner template manifest`:

```ts
# Planner recipe manifest
${buildPlannerRecipeManifestPrompt()}
```

Add these planning boundaries:

```txt
- Do not invent recipe ids.
- Do not use recipe hints from a different template.
- The compiler turns recipe hints into implementation fields; the planner must not output sections, theme, colors, or template props.
```

- [ ] **Step 4: Update segment revision prompt**

In `buildSegmentPlanRevisionPrompt()`, add equivalent requirements:

```txt
- If the selected template lists planner-facing recipes, optionally set recipeHints using ids from that template only.
- Keep recipeHints omitted when the revision request does not imply a recipe-specific presentation.
```

Add the recipe manifest block after the existing planner template manifest:

```ts
# Planner recipe manifest
${buildPlannerRecipeManifestPrompt()}
```

- [ ] **Step 5: Update compiler prompt**

In `buildTemplateCompilerSystemPrompt()`, add:

```txt
- Treat segment.recipeHints as planner guidance, not as output fields.
- Respect valid recipe hints when they fit the narration duration and selected template schema.
- The implementation must still validate against the selected template schema if hints are omitted.
```

In `buildTemplateCompilerPrompt()`, the existing `segment: request.segment`
payload already includes `recipeHints` after Task 2. Add a small field to
`selectedTemplate` for clarity:

```ts
plannerRecipes: template.planner.recipes ?? [],
```

- [ ] **Step 6: Run prompt smoke and parser smoke**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:planner-recipe-manifest'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:storyboard-recipe-hints'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
```

Expected: PASS.

- [ ] **Step 7: Commit Task 3**

```bash
git add src/lib/deepseek/prompts.ts scripts/planner-recipe-manifest-smoke.mjs
git commit -m "feat: expose recipe hints to DeepSeek planning"
```

## Task 4: Add Recipe Hints To Deterministic Fixtures

**Files:**
- Modify: `src/lib/staged-smoke-fixtures.ts`
- Modify: `scripts/technical-explainer-template-smoke.mjs`

- [ ] **Step 1: Extend the template smoke script**

In `scripts/technical-explainer-template-smoke.mjs`, add:

```js
assertIncludes(fixtureSource, "recipeHints", "staged smoke fixtures");
assertIncludes(fixtureSource, 'recipeId: "workflow-node-map"', "staged smoke fixtures");
assertIncludes(fixtureSource, 'recipeId: "terminal-build-run"', "staged smoke fixtures");
```

- [ ] **Step 2: Add recipe hints to the first technical explainer segment**

In `src/lib/staged-smoke-fixtures.ts`, update the first
`technicalExplainerStoryboardPlan.segments` item:

```ts
      recipeHints: [
        {
          recipeId: "hero-title-reveal",
          reason: "The opening beat introduces the phase three template boundary.",
        },
        {
          recipeId: "workflow-node-map",
          reason: "The segment explains how reusable recipe primitives flow into generated output.",
        },
        {
          recipeId: "terminal-build-run",
          reason: "The segment references the deterministic smoke check path.",
        },
      ],
```

- [ ] **Step 3: Add recipe hints to the second technical explainer segment**

In the second `technicalExplainerStoryboardPlan.segments` item, add:

```ts
      recipeHints: [
        {
          recipeId: "metric-countup",
          reason: "The segment recaps measurable outcomes.",
        },
        {
          recipeId: "timeline-progress",
          reason: "The segment closes with implementation checkpoints.",
        },
      ],
```

- [ ] **Step 4: Run deterministic fixture coverage**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:technical-explainer-template'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:storyboard-recipe-hints'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
```

Expected: PASS.

- [ ] **Step 5: Commit Task 4**

```bash
git add src/lib/staged-smoke-fixtures.ts scripts/technical-explainer-template-smoke.mjs
git commit -m "test: add recipe hints to technical explainer fixtures"
```

## Task 5: Add Provider-Backed Live Smoke Assertion

**Files:**
- Modify: `scripts/staged-live-smoke.mjs`

- [ ] **Step 1: Inspect existing staged-live smoke structure**

Run:

```bash
sed -n '1,260p' scripts/staged-live-smoke.mjs
```

Expected: identify the normal brief path and any helper that posts to
`/api/generate/staged` or calls staged generation directly.

- [ ] **Step 2: Add a recipe-rich technical brief case**

Add a brief that should naturally select the technical explainer template:

```txt
Explain how a local AI video studio turns a brief into storyboard planning,
F5 narration, template compilation, preview, and export. Show the workflow,
a terminal smoke check, and a delivery recap.
```

The assertion should check:

```js
const technicalSegments = project.segments.filter(
  (segment) => segment.templateId === "technical-explainer",
);
if (technicalSegments.length === 0) {
  throw new Error("Expected staged live smoke to select at least one technical-explainer segment.");
}

for (const segment of technicalSegments) {
  const sections = segment.implementation?.sections;
  if (!Array.isArray(sections) || sections.length === 0) {
    throw new Error("Expected technical-explainer segment to compile recipe sections.");
  }
  for (const section of sections) {
    if (typeof section.recipeId !== "string") {
      throw new Error("Expected each technical-explainer section to include a recipeId.");
    }
  }
}
```

If `scripts/staged-live-smoke.mjs` already validates a normal brief and a new
case would make the live smoke too slow, add the assertion to the existing
normal brief only when it selected `technical-explainer`. Keep deterministic
smoke scripts as the hard gate.

- [ ] **Step 3: Run deterministic checks first**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:planner-recipe-manifest'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:storyboard-recipe-hints'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
```

Expected: PASS before live provider validation.

- [ ] **Step 4: Run provider-backed live smoke**

Run only after required local environment variables are configured:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-live'
```

Expected: PASS. If the provider chooses another valid template for the normal
brief, do not loosen deterministic recipe hint validation. Instead, revise the
live brief or keep this case as advisory and document the provider behavior in
`docs/ITERATION_STATUS.md`.

- [ ] **Step 5: Commit Task 5**

```bash
git add scripts/staged-live-smoke.mjs
git commit -m "test: cover live technical recipe selection"
```

## Task 6: Final Validation And Docs Sync

**Files:**
- Modify: `docs/ITERATION_STATUS.md`
- Modify: `docs/VISUAL_RECIPE_ROADMAP.md`
- Modify: `README.md`

- [ ] **Step 1: Update iteration status**

At the top of `docs/ITERATION_STATUS.md`, add a new latest continuation:

```md
## Latest continuation — Planner Recipe Selection Phase 4

- Completed Phase 4 by adding planner-facing recipe hints for recipe-capable
  templates.
- Added a compact recipe manifest derived from registered template definitions.
- `technical-explainer` now publishes planner-safe metadata for
  `hero-title-reveal`, `terminal-build-run`, `workflow-node-map`,
  `metric-countup`, and `timeline-progress`.
- `StoryboardPlan.segments[].recipeHints[]` is optional, validated against the
  selected template, and remains outside `VideoProject` implementation data.
- DeepSeek planner/revision prompts can request recipe hints without seeing
  Remotion internals; the selected-template compiler still owns schema-valid
  `implementation` output.
- Scope remains unchanged: no global recipe model, no media library, no
  generated TSX execution, no visual-review scoring, and no persistence work.

Validation performed:
- `docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:planner-recipe-manifest'`
- `docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:storyboard-recipe-hints'`
- `docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:technical-explainer-template'`
- `docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'`
- `docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'`
- `docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'`
- `docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-live'`
```

Only list `smoke:staged-live` if it actually ran and passed.

- [ ] **Step 2: Update visual recipe roadmap**

In `docs/VISUAL_RECIPE_ROADMAP.md`, change Phase 4 status from a goal to
implemented after all validation passes:

```md
### Phase 4: Planner Recipe Selection

Status: implemented for planner-facing recipe hints.
```

Add:

```md
- recipe choices remain optional `StoryboardPlan` hints, not top-level
  `VideoProject` fields
- recipe manifests are derived from registered template definitions
- invalid recipe ids are rejected at the planner schema boundary or repaired by
  the bounded planner repair loop
```

- [ ] **Step 3: Update README current status**

In `README.md`, extend the current visual-quality direction:

```md
- Phase 4 planner recipe selection is in place: recipe-capable templates expose
  compact planner-facing recipe metadata, DeepSeek can return optional
  `recipeHints`, and the selected-template compiler turns those hints into
  schema-valid template implementation while keeping `VideoProject` unchanged.
```

- [ ] **Step 4: Run final validation**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:planner-recipe-manifest'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:storyboard-recipe-hints'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:technical-explainer-template'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
git diff --check
```

Run live smoke if provider credentials are available:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-live'
```

- [ ] **Step 5: Commit Task 6**

```bash
git add docs/ITERATION_STATUS.md docs/VISUAL_RECIPE_ROADMAP.md README.md
git commit -m "docs: mark planner recipe selection phase 4"
```

## Execution Notes

- Keep commits small. Each task should be independently reviewable.
- Do not rewrite Phase 3 template runtime code unless a compile error requires it.
- Do not import Node-only staged-generation helpers into Remotion-loaded fixture files.
- Preserve `ProjectVideo` and existing Remotion compositions in `src/remotion/Root.tsx`.
- Treat host `node_modules` errors as irrelevant; use Docker-first commands.
- If provider live smoke disagrees with deterministic expectations, keep deterministic validation as the hard gate and document the live-provider behavior.

## Final Acceptance Checklist

- [ ] `smoke:planner-recipe-manifest` passes.
- [ ] `smoke:storyboard-recipe-hints` passes.
- [ ] `smoke:technical-explainer-template` passes.
- [ ] `smoke:staged-fixtures` passes.
- [ ] `npx tsc --noEmit` passes in Docker.
- [ ] `npm run lint` passes in Docker.
- [ ] `git diff --check` passes.
- [ ] `smoke:staged-live` is run and documented, or clearly documented as skipped due to missing provider credentials/runtime.
- [ ] Active docs describe Phase 4 without widening into media library, visual scoring, generated TSX, persistence, or top-level recipe modeling.
