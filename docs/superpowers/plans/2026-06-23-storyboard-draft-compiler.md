# Storyboard Draft Compiler Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make storyboard planning resilient by having AI produce a provider-facing draft that deterministic repo code compiles into the strict internal `StoryboardPlan`.

**Architecture:** Keep `StoryboardPlan` as the internal planner-stage boundary and keep `VideoProject`, TTS, captions, templates, and Remotion unchanged. Add a small provider-facing `StoryboardPlanDraft` schema plus a deterministic compiler that maps draft intent into the existing strict `StoryboardPlan`, then update DeepSeek prompts and parser wiring to prefer the draft while preserving strict `StoryboardPlan` compatibility for existing fixtures.

**Tech Stack:** TypeScript, Zod, existing DeepSeek JSON-mode provider, existing template registry recipe metadata, source-level smoke scripts, Docker-first validation, ESLint, `tsc --noEmit`.

---

## Scope Boundary

Implement:

- a provider-facing `StoryboardPlanDraft` contract for AI output
- deterministic Draft -> `StoryboardPlan` compiler
- parser fallback that accepts either strict `StoryboardPlan` or draft output
- prompt changes so DeepSeek is asked for draft fields, not final nested planner JSON
- red/green smoke coverage for the reported `narration.intent` drift
- active documentation updates

Do not implement:

- changes to `VideoProject`
- changes to TTS/F5, captions, narration assets, or Remotion rendering
- template implementation draft compilers
- generated TSX
- media library, upload/storage, or persistence
- generic JSON auto-repair for arbitrary shapes
- broad provider abstraction beyond this small draft boundary

## Design Decision

The stable product contract remains:

```txt
brief -> StoryboardPlan -> narration synthesis -> template compile -> VideoProject
```

Only the provider output boundary changes:

```txt
DeepSeek JSON -> StoryboardPlanDraft -> compileStoryboardPlanDraft() -> strict StoryboardPlan
```

This keeps AI responsible for semantic choices and copy, while repo-owned code owns IDs, ordering, nesting, recipe hint shape, and final validation.

The draft schema is intentionally smaller and less nested than `StoryboardPlan`, but not permissive enough to hide invalid core data. It accepts either preferred flat narration fields or a provider-style `narration.text` object so the current `narration.intent` drift becomes harmless unknown draft metadata, not final schema pollution.

## File Structure

- Create: `src/lib/storyboard-plan-draft-schema.ts`
  - Owns the provider-facing draft Zod schema and inferred types.
- Create: `src/lib/storyboard-plan-draft-compiler.ts`
  - Owns deterministic conversion from draft data into strict `StoryboardPlan`.
- Modify: `src/lib/deepseek/parse-storyboard-plan.ts`
  - Keeps `parseStoryboardPlanToolCallArguments()` as the public parser, but adds draft fallback after strict parse fails.
- Modify: `src/lib/deepseek/prompts.ts`
  - Asks DeepSeek for `StoryboardPlanDraft` instead of final `StoryboardPlan` in full-brief and segment-revision planner prompts.
- Modify: `src/lib/deepseek/index.ts`
  - No broad rewrite expected; only adjust naming/comments if needed after parser behavior changes.
- Add: `scripts/storyboard-plan-draft-smoke.mjs`
  - Covers draft compile, the reported `narration.intent` drift, and invalid recipe rejection.
- Modify: `package.json`
  - Adds `smoke:storyboard-plan-draft`.
- Modify: `docs/ITERATION_STATUS.md`
  - Records the new planner boundary hardening after implementation.
- Modify: `docs/FINAL_PRODUCT_GOAL.md`
  - Clarifies that AI may emit a provider-facing draft, but internal pipeline still consumes `StoryboardPlan`.
- Modify: `README.md`
  - Updates current implementation status with Draft -> Plan compiler note.

## Task 1: Add Red Smoke Coverage For Draft Planning

**Files:**
- Add: `scripts/storyboard-plan-draft-smoke.mjs`
- Modify: `package.json`

- [ ] **Step 1: Add the smoke script**

Create `scripts/storyboard-plan-draft-smoke.mjs` with this content:

```js
/* global console */

const { parseStoryboardPlanToolCallArguments } =
  await import("../src/lib/deepseek/parse-storyboard-plan.js");

const parse = (value) => parseStoryboardPlanToolCallArguments(JSON.stringify(value));

const flatDraft = {
  title: "Draft planner smoke",
  brief: "Explain an AI video studio workflow.",
  language: "en",
  globalStyle: "Clear technical product demo.",
  segments: [
    {
      title: "Plan the story",
      purpose: "Show that the app first plans segments.",
      templateId: "technical-explainer",
      templateReason: "A technical explainer can show the staged workflow.",
      narrationText: "First, the studio turns a brief into a structured storyboard.",
      narrationTone: "clear",
      visualBrief: "Show a workflow map from brief to storyboard.",
      recipeHints: [
        {
          recipeId: "workflow-node-map",
          reason: "The segment explains a staged system flow.",
        },
      ],
      expectedDurationSeconds: 5,
    },
  ],
};

const compiledFlatDraft = parse(flatDraft);
if (compiledFlatDraft.segments[0].narration.text !== flatDraft.segments[0].narrationText) {
  throw new Error("Expected flat draft narrationText to compile into narration.text.");
}
if (compiledFlatDraft.segments[0].id !== "segment-1") {
  throw new Error("Expected draft compiler to assign stable segment ids.");
}
if (compiledFlatDraft.segments[0].order !== 1) {
  throw new Error("Expected draft compiler to assign contiguous segment order.");
}

const nestedNarrationDraft = {
  title: "Nested narration smoke",
  brief: "Demonstrate why draft compilation is safer than final JSON.",
  language: "zh",
  segments: [
    {
      purpose: "开场说明产品价值。",
      templateId: "technical-explainer",
      narration: {
        text: "输入一个 brief，系统会先规划分镜。",
        intent: "This extra provider key must not leak into StoryboardPlan.",
      },
      visualBrief: "用流程图展示 brief 到分镜。",
    },
  ],
};

const compiledNestedDraft = parse(nestedNarrationDraft);
if (compiledNestedDraft.segments[0].narration.text !== nestedNarrationDraft.segments[0].narration.text) {
  throw new Error("Expected nested draft narration.text to compile into narration.text.");
}
if ("intent" in compiledNestedDraft.segments[0].narration) {
  throw new Error("Expected draft-only narration.intent to be excluded from strict StoryboardPlan.");
}

const invalidRecipeDraft = {
  ...flatDraft,
  segments: [
    {
      ...flatDraft.segments[0],
      recipeHints: [
        {
          recipeId: "invented-recipe",
          reason: "Provider invented a recipe.",
        },
      ],
    },
  ],
};

try {
  parse(invalidRecipeDraft);
  throw new Error("Expected invalid draft recipe id to fail strict StoryboardPlan validation.");
} catch (error) {
  if (!String(error).includes("invented-recipe") && !String(error).includes("recipeHints")) {
    throw error;
  }
}

console.log("Storyboard plan draft smoke passed.");
```

- [ ] **Step 2: Add the npm script**

In `package.json`, add this script next to `smoke:storyboard-recipe-hints`:

```json
"smoke:storyboard-plan-draft": "rm -rf /tmp/storyboard-plan-draft-smoke-build && npx tsc --allowJs --target es2022 --module commonjs --moduleResolution node --skipLibCheck --esModuleInterop --noEmit false --outDir /tmp/storyboard-plan-draft-smoke-build scripts/storyboard-plan-draft-smoke.mjs src/lib/deepseek/parse-storyboard-plan.ts src/lib/storyboard-plan-schema.ts src/lib/storyboard-plan-draft-schema.ts src/lib/storyboard-plan-draft-compiler.ts src/lib/template-registry.ts src/templates/registry.ts src/templates/definition.ts src/templates/registered-definitions.ts src/templates/technical-explainer/schema.ts src/templates/technical-explainer/definition.ts && NODE_PATH=/workspace/node_modules:node_modules node /tmp/storyboard-plan-draft-smoke-build/scripts/storyboard-plan-draft-smoke.mjs"
```

- [ ] **Step 3: Run the red smoke**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:storyboard-plan-draft'
```

Expected: FAIL because `src/lib/storyboard-plan-draft-schema.ts` and `src/lib/storyboard-plan-draft-compiler.ts` do not exist yet.

## Task 2: Add Provider-Facing Draft Schema

**Files:**
- Create: `src/lib/storyboard-plan-draft-schema.ts`

- [ ] **Step 1: Create the draft schema module**

Create `src/lib/storyboard-plan-draft-schema.ts`:

```ts
import { z } from "zod";

import { MAX_STORYBOARD_SEGMENTS, templateIdSchema } from "./storyboard-plan-schema";

const nonEmptyString = (max: number) => z.string().trim().min(1).max(max);

export const storyboardPlanDraftRecipeHintSchema = z
  .object({
    recipeId: nonEmptyString(80),
    reason: nonEmptyString(400).optional(),
  })
  .strip();

export const storyboardPlanDraftNarrationSchema = z
  .object({
    text: nonEmptyString(2000),
    tone: nonEmptyString(160).optional(),
  })
  .passthrough();

export const storyboardSegmentPlanDraftSchema = z
  .object({
    id: nonEmptyString(80).optional(),
    order: z.number().int().min(1).optional(),
    title: nonEmptyString(160).optional(),
    purpose: nonEmptyString(1000),
    templateId: templateIdSchema,
    templateReason: nonEmptyString(1000).optional(),
    narrationText: nonEmptyString(2000).optional(),
    narrationTone: nonEmptyString(160).optional(),
    narration: storyboardPlanDraftNarrationSchema.optional(),
    visualBrief: nonEmptyString(1200),
    recipeHints: z.array(storyboardPlanDraftRecipeHintSchema).min(1).max(5).optional(),
    pacingHint: nonEmptyString(300).optional(),
    expectedDurationSeconds: z.number().positive().max(120).optional(),
  })
  .strip()
  .superRefine((segment, ctx) => {
    if (!segment.narrationText && !segment.narration?.text) {
      ctx.addIssue({
        code: "custom",
        message: "Draft segment must include narrationText or narration.text.",
        path: ["narrationText"],
      });
    }
  });

export const storyboardPlanDraftSchema = z
  .object({
    title: nonEmptyString(160),
    brief: nonEmptyString(4000),
    language: nonEmptyString(80).optional(),
    globalStyle: nonEmptyString(1000).optional(),
    segments: z.array(storyboardSegmentPlanDraftSchema).min(1).max(MAX_STORYBOARD_SEGMENTS),
  })
  .strip();

export type StoryboardPlanDraft = z.infer<typeof storyboardPlanDraftSchema>;
export type StoryboardSegmentPlanDraft = z.infer<typeof storyboardSegmentPlanDraftSchema>;
```

- [ ] **Step 2: Run draft smoke again**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:storyboard-plan-draft'
```

Expected: FAIL because the compiler module does not exist yet.

## Task 3: Add Deterministic Draft Compiler

**Files:**
- Create: `src/lib/storyboard-plan-draft-compiler.ts`

- [ ] **Step 1: Create the compiler module**

Create `src/lib/storyboard-plan-draft-compiler.ts`:

```ts
import { storyboardPlanSchema, type StoryboardPlan } from "./storyboard-plan-schema";
import type { StoryboardPlanDraft, StoryboardSegmentPlanDraft } from "./storyboard-plan-draft-schema";

const getSegmentId = (segment: StoryboardSegmentPlanDraft, index: number): string =>
  segment.id ?? `segment-${index + 1}`;

const getSegmentOrder = (segment: StoryboardSegmentPlanDraft, index: number): number =>
  segment.order ?? index + 1;

const getNarrationText = (segment: StoryboardSegmentPlanDraft): string =>
  segment.narrationText ?? segment.narration?.text ?? "";

const getNarrationTone = (segment: StoryboardSegmentPlanDraft): string | undefined =>
  segment.narrationTone ?? segment.narration?.tone;

const getTemplateReason = (segment: StoryboardSegmentPlanDraft): string =>
  segment.templateReason ?? `Selected because it fits this segment purpose: ${segment.purpose}`;

const compileSegment = (segment: StoryboardSegmentPlanDraft, index: number) => ({
  id: getSegmentId(segment, index),
  order: getSegmentOrder(segment, index),
  ...(segment.title ? { title: segment.title } : {}),
  purpose: segment.purpose,
  templateId: segment.templateId,
  templateReason: getTemplateReason(segment),
  narration: {
    text: getNarrationText(segment),
    ...(getNarrationTone(segment) ? { tone: getNarrationTone(segment) } : {}),
  },
  visualBrief: segment.visualBrief,
  ...(segment.recipeHints
    ? {
        recipeHints: segment.recipeHints.map((hint) => ({
          recipeId: hint.recipeId,
          reason: hint.reason ?? `Draft requested ${hint.recipeId} for this segment.`,
        })),
      }
    : {}),
  ...(segment.pacingHint ? { pacingHint: segment.pacingHint } : {}),
  ...(segment.expectedDurationSeconds
    ? { expectedDurationSeconds: segment.expectedDurationSeconds }
    : {}),
});

export const compileStoryboardPlanDraft = (draft: StoryboardPlanDraft): StoryboardPlan => {
  return storyboardPlanSchema.parse({
    title: draft.title,
    brief: draft.brief,
    ...(draft.language ? { language: draft.language } : {}),
    ...(draft.globalStyle ? { globalStyle: draft.globalStyle } : {}),
    segments: draft.segments.map(compileSegment),
  });
};
```

- [ ] **Step 2: Run the draft smoke again**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:storyboard-plan-draft'
```

Expected: still FAIL because the parser has not been wired to the draft schema/compiler yet.

## Task 4: Wire Draft Fallback Into The Storyboard Parser

**Files:**
- Modify: `src/lib/deepseek/parse-storyboard-plan.ts`

- [ ] **Step 1: Import draft schema and compiler**

At the top of `src/lib/deepseek/parse-storyboard-plan.ts`, add:

```ts
import { compileStoryboardPlanDraft } from "../storyboard-plan-draft-compiler";
import { storyboardPlanDraftSchema } from "../storyboard-plan-draft-schema";
```

- [ ] **Step 2: Add wrapped draft detection**

Add this helper below `looksLikeWrappedPlan()`:

```ts
const looksLikeWrappedDraft = (value: unknown): unknown | null => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const record = value as Record<string, unknown>;
  const draft = record["draft"] ?? record["storyboardPlanDraft"];
  if (draft === null || typeof draft !== "object" || Array.isArray(draft)) {
    return null;
  }
  return draft;
};
```

- [ ] **Step 3: Add draft parse helper**

Add this helper below the wrapped helpers:

```ts
const parseDraftPlan = (value: unknown): StoryboardPlan | null => {
  const draft = storyboardPlanDraftSchema.safeParse(value);
  if (!draft.success) {
    return null;
  }

  return compileStoryboardPlanDraft(draft.data);
};
```

- [ ] **Step 4: Try draft parsing before throwing**

Inside `parseStoryboardPlanToolCallArguments()`, after the wrapped strict-plan retry block and before the final `throw`, add:

```ts
const draft = parseDraftPlan(parsed);
if (draft !== null) {
  return draft;
}

const wrappedDraft = looksLikeWrappedDraft(parsed);
if (wrappedDraft !== null) {
  const retry = parseDraftPlan(wrappedDraft);
  if (retry !== null) {
    return retry;
  }
}
```

Keep the final error based on the original strict `StoryboardPlan` issues. Do not loosen `storyboardPlanSchema`.

- [ ] **Step 5: Run the draft smoke**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:storyboard-plan-draft'
```

Expected: PASS.

- [ ] **Step 6: Run existing recipe-hint smoke**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:storyboard-recipe-hints'
```

Expected: PASS. Existing strict `StoryboardPlan` parsing remains compatible.

## Task 5: Update DeepSeek Planner Prompts To Request Drafts

**Files:**
- Modify: `src/lib/deepseek/prompts.ts`

- [ ] **Step 1: Replace full-storyboard planner contract wording**

In `STORYBOARD_PLAN_SYSTEM_PROMPT`, change the opening and output requirements from final `StoryboardPlan` to provider-facing `StoryboardPlanDraft`.

Replace the first line:

```txt
You create a structured "StoryboardPlan" for a segment-first video studio.
```

with:

```txt
You create a provider-facing "StoryboardPlanDraft" for a segment-first video studio.
```

Replace these output bullets:

```txt
- validate against the StoryboardPlan schema
- set segment.order as contiguous integers starting at 1
- use stable segment ids like "segment-1", "segment-2"
- write narration.text as the spoken script for that segment
- explain templateReason using the selected template's fit for the segment purpose
```

with:

```txt
- validate against the StoryboardPlanDraft schema
- may omit segment.id and segment.order; deterministic code will assign stable values
- write segment.narrationText as the spoken script for that segment
- optionally set segment.narrationTone for delivery guidance
- explain templateReason when it is useful; deterministic code can fill a default reason
```

Replace the JSON output contract:

```txt
Return the complete StoryboardPlan object directly as JSON.
```

with:

```txt
Return the complete StoryboardPlanDraft object directly as JSON.
```

- [ ] **Step 2: Add explicit draft shape to the prompt**

Add this section before `# Planner template manifest`:

```txt
# Draft shape
Top-level:
- title
- brief
- language?
- globalStyle?
- segments[]

Each segment:
- title?
- purpose
- templateId
- templateReason?
- narrationText
- narrationTone?
- visualBrief
- recipeHints? as [{ recipeId, reason }]
- pacingHint?
- expectedDurationSeconds?
```

- [ ] **Step 3: Update repair wording**

In `buildStoryboardRepairInstructions()`, replace:

```txt
The previous StoryboardPlan output was rejected. Return a corrected StoryboardPlan object only.
```

with:

```txt
The previous StoryboardPlanDraft output was rejected. Return a corrected StoryboardPlanDraft object only.
```

Replace:

```txt
Preserve the user's intent, but fix JSON shape, required fields, valid templateId values, unique ids, and contiguous order values.
```

with:

```txt
Preserve the user's intent, but fix JSON shape, required fields, valid templateId values, narrationText, visualBrief, and recipe hint ids.
```

- [ ] **Step 4: Update segment revision prompt**

In `buildSegmentPlanRevisionPrompt()`, replace:

```txt
Return a StoryboardPlan containing EXACTLY ONE segment: the target segment to regenerate.
```

with:

```txt
Return a StoryboardPlanDraft containing EXACTLY ONE segment: the target segment to regenerate.
```

Replace:

```txt
- Keep the target segment id exactly "${segmentId}".
- Set the single segment order to 1.
```

with:

```txt
- You may omit id and order; deterministic code will restore the target segment id and order.
```

Replace:

```txt
- Write narration.text as the actual spoken script for this segment, not as an instruction.
```

with:

```txt
- Write narrationText as the actual spoken script for this segment, not as an instruction.
```

Replace the final user message:

```txt
Return exactly one planned segment for "${segmentId}" with fresh narration text.
```

with:

```txt
Return exactly one draft segment for "${segmentId}" with fresh narrationText.
```

- [ ] **Step 5: Run prompt-sensitive smokes**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:storyboard-plan-draft'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:storyboard-recipe-hints'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:planner-recipe-manifest'
```

Expected: all PASS.

## Task 6: Preserve Revised Segment ID And One-Segment Enforcement

**Files:**
- Modify: `src/lib/deepseek/index.ts`
- Modify: `scripts/storyboard-plan-draft-smoke.mjs`

- [ ] **Step 1: Add a parser smoke case for wrapped revised draft**

Append this case before the final `console.log()` in `scripts/storyboard-plan-draft-smoke.mjs`:

```js
const wrappedDraft = {
  storyboardPlanDraft: {
    title: "Wrapped draft smoke",
    brief: "Regenerate one segment.",
    segments: [
      {
        purpose: "Replace one selected segment.",
        templateId: "technical-explainer",
        narrationText: "This replacement segment keeps the original segment id later.",
        visualBrief: "Show one focused replacement beat.",
      },
    ],
  },
};

const compiledWrappedDraft = parse(wrappedDraft);
if (compiledWrappedDraft.segments.length !== 1) {
  throw new Error("Expected wrapped draft to compile into exactly one segment.");
}
```

- [ ] **Step 2: Re-run draft smoke**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:storyboard-plan-draft'
```

Expected: PASS after Task 4.

- [ ] **Step 3: Inspect `parseOneSegmentStoryboardPlan()` behavior**

In `src/lib/deepseek/index.ts`, keep this behavior unchanged:

```ts
if (plan.segments.length !== 1) {
  throw new StoryboardPlanParseError(
    `Generated revised storyboard plan must contain exactly one segment for "${segmentId}", but received ${plan.segments.length}.`,
    argumentsString,
  );
}
```

Do not add multi-segment repair logic. The existing repair loop already retries once with the validation error.

- [ ] **Step 4: Confirm target id restoration remains after draft parsing**

In `deepseekGenerateRevisedSegmentPlan()`, keep this existing return mapping:

```ts
segments: [
  {
    ...segment,
    id: request.segmentId,
    order: 1,
  },
],
```

No code change is required if the mapping is still present. If it is missing, restore it exactly as shown.

## Task 7: Add Minimal Live-Failure Regression Coverage To Existing Smoke

**Files:**
- Modify: `scripts/storyboard-plan-draft-smoke.mjs`

- [ ] **Step 1: Add the reported `narration.intent` shape as a named fixture**

Ensure `scripts/storyboard-plan-draft-smoke.mjs` contains this exact comment before `nestedNarrationDraft`:

```js
// Regression for provider drift observed in live generation:
// narration.intent is useful draft metadata, but must never reach StoryboardPlan.narration.
```

- [ ] **Step 2: Add assertion that final plan validates strict narration keys**

After compiling `nestedNarrationDraft`, add:

```js
const finalNarrationKeys = Object.keys(compiledNestedDraft.segments[0].narration).sort();
if (JSON.stringify(finalNarrationKeys) !== JSON.stringify(["text"])) {
  throw new Error(`Expected strict narration keys [text], received ${finalNarrationKeys.join(",")}`);
}
```

If the fixture also includes `tone`, adjust the expected keys to `["text", "tone"]`. Do not allow `intent`.

- [ ] **Step 3: Run draft smoke**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:storyboard-plan-draft'
```

Expected: PASS.

## Task 8: Update Active Documentation

**Files:**
- Modify: `docs/ITERATION_STATUS.md`
- Modify: `docs/FINAL_PRODUCT_GOAL.md`
- Modify: `README.md`

- [ ] **Step 1: Update iteration status**

Add this top section to `docs/ITERATION_STATUS.md`:

```markdown
Last updated: Storyboard Draft Compiler Boundary

## Latest continuation — Storyboard Draft Compiler Boundary

- Added a provider-facing `StoryboardPlanDraft` boundary for DeepSeek planner output.
- Kept internal `StoryboardPlan` strict and unchanged; deterministic repo code now compiles draft semantics into the final planner contract.
- Hardened planner parsing against provider drift such as extra `narration.intent` keys without adding broad hardcoded JSON repair rules.
- Kept scope limited to storyboard planning: no `VideoProject`, TTS, Remotion, template runtime, media-library, or persistence changes.

Validation performed:
- `docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:storyboard-plan-draft'`
- `docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:storyboard-recipe-hints'`
- `docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:planner-recipe-manifest'`
- `docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'`
- `docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'`
- `docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'`
- `git diff --check`
```

- [ ] **Step 2: Clarify final product goal planner boundary**

In `docs/FINAL_PRODUCT_GOAL.md`, under Stage A, add:

```markdown
Implementation note:

Provider-facing planner output may use a smaller `StoryboardPlanDraft` contract
so AI is responsible for semantic choices and narration text, while repo-owned
code deterministically compiles the draft into the strict internal
`StoryboardPlan`. The internal pipeline still consumes `StoryboardPlan`.
```

- [ ] **Step 3: Update README status**

In `README.md`, add one bullet under current implementation status:

```markdown
- DeepSeek planner output is normalized through a provider-facing
  `StoryboardPlanDraft` -> strict `StoryboardPlan` compiler boundary, so AI
  chooses segment intent and narration while repo code owns final IDs, ordering,
  nesting, and validation.
```

## Task 9: Full Verification

**Files:**
- Exercise the full planner-boundary path.

- [ ] **Step 1: Run planner-boundary smokes**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:storyboard-plan-draft'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:storyboard-recipe-hints'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:planner-recipe-manifest'
```

Expected: all PASS.

- [ ] **Step 2: Run composition smoke**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-fixtures'
```

Expected: PASS and list the existing Remotion compositions.

- [ ] **Step 3: Run static verification**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
git diff --check
```

Expected: all PASS.

- [ ] **Step 4: Confirm scope by diff**

Run:

```bash
git diff --stat
```

Expected: changes are limited to draft schema/compiler/parser/prompt files, smoke script/package script, and active docs. Existing Phase 5 files may already be dirty in this branch; do not revert or stage unrelated work.

## Task 10: Optional Provider-Backed Smoke

**Files:**
- Exercise: `POST /api/generate/staged`

- [ ] **Step 1: Decide whether live smoke is available**

Only run live smoke if `.env` has a valid `DEEPSEEK_API_KEY` and the project runtime is reachable. Use contract-smoke F5 mode unless Docker can see an NVIDIA driver.

- [ ] **Step 2: Run live smoke when available**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:staged-live'
```

Expected when available: PASS. If it fails due missing DeepSeek config, missing running Next route, or missing NVIDIA driver, record it as an environment/runtime caveat, not as a draft-compiler failure.

## Task 11: Commit When Requested

**Files:**
- Stage only files changed by this planner-boundary iteration.

- [ ] **Step 1: Inspect status**

Run:

```bash
git status --short
```

Expected: identify planner-boundary files separately from any pre-existing Phase 5 dirty files.

- [ ] **Step 2: Stage only this iteration**

Stage these files if they were changed:

```bash
git add \
  docs/FINAL_PRODUCT_GOAL.md \
  docs/ITERATION_STATUS.md \
  README.md \
  package.json \
  scripts/storyboard-plan-draft-smoke.mjs \
  src/lib/storyboard-plan-draft-schema.ts \
  src/lib/storyboard-plan-draft-compiler.ts \
  src/lib/deepseek/parse-storyboard-plan.ts \
  src/lib/deepseek/prompts.ts \
  src/lib/deepseek/index.ts
```

Do not stage unrelated Phase 5 files unless the user explicitly asks to include them.

- [ ] **Step 3: Commit only after user approval**

If the user asks to commit, run:

```bash
git commit -m "feat: add storyboard draft compiler boundary"
```

Expected: commit succeeds.

## Acceptance

This iteration is complete when:

- AI planner output can be parsed from `StoryboardPlanDraft`.
- The strict internal `StoryboardPlan` schema remains strict and unchanged.
- Reported drift where `narration.intent` appears in provider output no longer blocks generation and never reaches final `StoryboardPlan.narration`.
- Invalid template ids, invalid recipe ids, missing narration text, and non-contiguous final plan problems still fail validation clearly.
- Full-brief and selected-segment planner prompts ask for draft shape.
- Existing `StoryboardPlan` parser compatibility remains for fixtures and submitted-plan mode.
- Docker-first smokes, typecheck, lint, and `git diff --check` pass.
