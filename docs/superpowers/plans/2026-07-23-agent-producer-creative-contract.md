# Agent Producer Creative Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make future Agent Producer videos fail closed unless they define content-first visual intent, avoid imports from existing dedicated compositions, and replace the repeated title-card scaffold with a capability-driven scene shell.

**Architecture:** Add a small Producer-owned creative-contract module that validates per-beat intent and source import boundaries without attempting to score aesthetics. Make the future scaffold opt into the new contract through a stricter manifest type, composition-local intent data, validation input, and neutral renderer shell; keep completed and frozen compositions backward-compatible and unchanged.

**Tech Stack:** TypeScript, React, Remotion 4.0.489, Node smoke tests, existing Producer manifest and validation CLIs.

---

### Task 1: Lock the future creative-contract boundary with a failing smoke

**Files:**
- Create: `scripts/smoke/producer/producer-creative-contract-smoke.mjs`
- Modify: `package.json`

- [x] **Step 1: Write the failing smoke**

Create a smoke that requires:

```js
const requiredFiles = [
  "src/remotion/producer-samples/creative-contract.ts",
  "src/remotion/producer-samples/scaffold/SampleName/visual-intent.ts",
];

for (const token of [
  "ProducerVisualIntent",
  "validateProducerVisualIntents",
  "validateProducerSourceBoundary",
  "visualIntentModule",
]) {
  assert(combinedSource.includes(token), `Missing creative-contract token: ${token}`);
}

assert(!renderer.includes("<h1"), "Future scaffold must not ship a repeated title-card layout.");
assert(!renderer.includes("renderScene={(scene) => <Scene"), "Future scaffold must not ship one repeated scene template.");
```

Compile the contract, manifest, validation module, and scaffold validation; exercise valid input plus failures for missing intent, duplicate intent, adjacent identical grammar without comparison, and imports from another dedicated composition.

- [x] **Step 2: Run the smoke and verify RED**

Run:

```bash
npm run smoke:producer-creative-contract
```

Expected: fail because the new contract and visual-intent module do not exist.

### Task 2: Implement the shared creative contract

**Files:**
- Create: `src/remotion/producer-samples/creative-contract.ts`
- Modify: `src/remotion/producer-samples/index.ts`
- Modify: `src/remotion/producer-samples/manifest.ts`
- Modify: `scripts/lib/producer-validation.ts`

- [x] **Step 1: Define the contract**

Add:

```ts
export type ProducerVisualIntent = {
  readonly sceneId: string;
  readonly subject: string;
  readonly action: string;
  readonly shotLanguage: string;
  readonly intendedMeaning: string;
  readonly primaryComposition: string;
  readonly silhouette: string;
  readonly renderMode: "code-led" | "asset-led" | "hybrid";
  readonly selectedCapabilities: readonly string[];
  readonly intentionalComparison?: boolean;
};
```

Implement `validateProducerVisualIntents()` so it requires exact scene/intent ID coverage, non-empty semantic fields, at least one selected capability, unique IDs, and distinct adjacent `primaryComposition` plus `silhouette` unless both scenes explicitly declare an intentional comparison.

Implement `validateProducerSourceBoundary()` so composition source may import relative composition-local modules and these repository-owned shared roots only:

```txt
src/remotion/primitives/
src/remotion/catalog/
src/remotion/effects/
src/remotion/styles/
src/remotion/transitions/
src/remotion/media/
src/remotion/motion/
src/remotion/sound/
src/remotion/standalone-video/
src/remotion/producer-samples/
```

Reject imports resolving into any other `src/remotion/<ExistingComposition>/` directory.

- [x] **Step 2: Add a future-only manifest contract**

Add `CreativelyGatedMaintainedProducerSampleManifest`, extending the existing voice-profiled quality-gated type with:

```ts
readonly creativeContract: {
  readonly visualIntentModule: string;
  readonly rendererSourcePath: string;
};
```

Validate both paths as repository-local and require them in `sourceFiles`. Do not add required fields to old maintained or frozen manifest types.

- [x] **Step 3: Wire validation**

Extend `ProducerValidationInput` with optional future-only fields:

```ts
readonly visualIntents?: readonly ProducerVisualIntent[];
readonly rendererSource?: {
  readonly path: string;
  readonly source: string;
};
```

When `manifest.creativeContract` exists, require both fields, verify path agreement, then call the two creative validators. Existing compositions without `creativeContract` remain compatible.

- [x] **Step 4: Run the focused smoke**

Run:

```bash
npm run smoke:producer-creative-contract
```

Expected: contract unit assertions pass; scaffold assertions may remain RED until Task 3.

### Task 3: Replace the biased scaffold

**Files:**
- Create: `src/remotion/producer-samples/scaffold/SampleName/visual-intent.ts`
- Modify: `src/remotion/producer-samples/scaffold/SampleName/SampleName.tsx`
- Modify: `src/remotion/producer-samples/scaffold/SampleName/data.ts`
- Modify: `src/remotion/producer-samples/scaffold/SampleName/types.ts`
- Modify: `src/remotion/producer-samples/scaffold/SampleName/manifest.ts`
- Modify: `src/remotion/producer-samples/scaffold/SampleName/validation.ts`
- Modify: `src/remotion/producer-samples/scaffold/README.md`

- [x] **Step 1: Add concrete scaffold visual intents**

Create three structurally different placeholder intents for `open`, `proof`, and `close`, using distinct `primaryComposition` and `silhouette` values. Mark them as instructions that must be replaced before production rather than as a reusable storyboard.

- [x] **Step 2: Remove the repeated title-card renderer**

Replace the single shared centered `<Scene>` with an explicit scene switch and three deliberately neutral shells:

```tsx
const renderScene = (scene: SampleNameScene) => {
  switch (scene.id) {
    case "open":
      return <OpeningScene scene={scene} />;
    case "proof":
      return <EvidenceScene scene={scene} />;
    case "close":
      return <TakeawayScene scene={scene} />;
  }
};
```

The shells use different spatial grammar, expose the selected style profile and intent, and contain no topic-specific finished design. Add a file-level warning that future work must replace all three shells from `visual-intent.ts`.

- [x] **Step 3: Wire manifest and validation**

Use `CreativelyGatedMaintainedProducerSampleManifest`, add `creativeContract`, add `visual-intent.ts` to `sourceFiles`, and make scaffold validation load the renderer source through a repository-relative path:

```ts
visualIntents: sampleNameVisualIntents,
rendererSource: {
  path: "src/remotion/SampleName/SampleName.tsx",
  source: readFileSync("src/remotion/SampleName/SampleName.tsx", "utf8"),
},
```

Update the validation CLI compile list so `creative-contract.ts` is emitted and Node types needed by scaffold validation compile in the existing Docker environment.

- [x] **Step 4: Run focused smoke GREEN**

Run:

```bash
npm run smoke:producer-creative-contract
npm run smoke:producer-os
npm run smoke:producer-style-profile-sample-contract
```

Expected: all pass.

### Task 4: Make the skill route away from old compositions

**Files:**
- Modify: `.agents/skills/ai-video-studio-agent-producer/SKILL.md`
- Modify: `.agents/skills/ai-video-studio-agent-producer/references/full-video-workflow.md`
- Modify: `.agents/skills/ai-video-studio-agent-producer/references/remotion-composition.md`
- Modify: `.agents/skills/remotion-best-practices/SKILL.md`
- Modify: `docs/FINAL_PRODUCT_GOAL.md`
- Modify: `docs/ITERATION_STATUS.md`
- Modify: `docs/REMOTION_COMPONENT_LIBRARY.md`
- Modify: `scripts/AGENTS.md`
- Modify: `src/remotion/AGENTS.md`
- Modify: `scripts/smoke/architecture/skill-alignment-smoke.mjs`

- [x] **Step 1: Add explicit source-selection rules**

Require the Agent to inspect shared inventory and capability fixtures, but prohibit opening or copying dedicated completed/frozen composition renderers as implementation references unless the user explicitly asks for comparison or diagnosis. State that capability showcase pages prove APIs only and must not be copied as scene layouts.

- [x] **Step 2: Document the enforceable contract**

Document `visual-intent.ts`, creative manifest paths, adjacent-grammar validation, the source-import allowlist, and the distinction between deterministic validation and human aesthetic review.

- [x] **Step 3: Tighten alignment smoke**

Require all active skill/docs surfaces to mention `visual-intent.ts`, the no-old-composition-source rule, and `smoke:producer-creative-contract`.

- [x] **Step 4: Run alignment checks**

Run:

```bash
npm run smoke:skill-alignment
npm run smoke:agent-producer-architecture
```

Expected: both pass.

### Task 5: Final verification

Implementation review strengthened the original design in four ways:

- the validation CLI loads `producerVisualIntents` from the exact manifest
  module instead of trusting an inline array;
- source validation follows the full composition-local runtime import graph
  and rejects static, dynamic, `require()`, absolute repository, and type-only
  cross-composition dependencies;
- intentional comparisons require both adjacent beats to opt in;
- generated scaffold coverage also protects import rewriting and the stable
  `sampleName` manifest field.

**Files:**
- Verify all modified files.

- [x] **Step 1: Run focused Producer checks**

```bash
npm run smoke:producer-creative-contract
npm run smoke:producer-os
npm run smoke:producer-style-profile-sample-contract
npm run smoke:producer-quality-gates
npm run smoke:skill-alignment
npm run smoke:agent-producer-architecture
```

Expected: all pass.

- [x] **Step 2: Run Docker TypeScript validation**

```bash
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npx tsc --noEmit --pretty false'
```

Expected: exit 0.

- [x] **Step 3: Check formatting and worktree**

```bash
git diff --check
git status --short
```

Expected: no whitespace errors; only the creative-contract slice is modified.

- [x] **Step 4: Review scope**

Confirm no completed/frozen composition source changed, no generated media or private files are tracked, and no push occurred.
