# Remotion Effects And Text Layout Phase 6A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the smallest unblocked Phase 6 capability slice by adding exact-version Remotion effects and layout utilities, Producer-owned effect presets, deterministic Chinese text fitting, and a registered inventory showcase while leaving transitions and later capabilities unstarted.

**Architecture:** Revise Phase 6 into explicit bounded slices because live npm evidence still makes the original all-at-once dependency closure impossible: `@remotion/transitions` stops at `4.0.477`, while the verified repository closure is exact `4.0.489`. Phase 6A admits only `@remotion/effects` and `@remotion/layout-utils` at exact `4.0.489`, exposes narrow Producer-owned factories and a text-fit wrapper, and proves them in one code-only Remotion inventory composition. Phase 6B retains official transitions, `HtmlInCanvas`/`CanvasImage` media coverage, light-leak/film-burn completion, and total transition-duration verification.

**Tech Stack:** React 19, TypeScript 5.9, Remotion 4.0.489, `@remotion/effects`, `@remotion/layout-utils`, Node.js ESM smoke scripts, Docker Compose, Remotion CLI, ESLint, Prettier, CodeGraph, Git.

---

## Current Repository Facts

- Starting branch: `refactor/agent-producer-service`.
- Starting commit: `317643f chore: complete remotion version gate`.
- Starting tracked worktree: clean; no user changes require protection.
- Phase 0 through Phase 5 are complete. Phase 6 version gate is complete; capability implementation has not started.
- CodeGraph found no Producer-owned `effects/`, `styles/`, `transitions/`, or `capability-showcase/` surface. `Root.tsx` registers only existing finished compositions.
- Every currently installed direct and lockfile Remotion package is exact `4.0.489`.
- Fresh npm evidence on 2026-07-16 still reports `@remotion/transitions` only through `4.0.477`, and that package depends exactly on `remotion`, `@remotion/shapes`, and `@remotion/paths` `4.0.477`.
- The same npm evidence reports `@remotion/effects@4.0.489` and `@remotion/layout-utils@4.0.489` as available; effects depends on exact `remotion@4.0.489` and layout-utils adds no conflicting Remotion closure.
- Official Remotion docs require all Remotion packages to share one exact version, describe effects on canvas components, require an explicit WebGL backend for `pixelate()`, recommend `swangle` on machines without a GPU, and expose `fitTextOnNLines()` for bounded text.
- Docker includes `fonts-noto-cjk` and `fonts-noto-cjk-extra`; the showcase may use `Noto Sans CJK SC` without adding or downloading a font asset.
- Repository-wide Docker lint retains the confirmed historical baseline of 39 errors and 2 warnings. Changed files must be clean without claiming a clean full lint gate.

## Explicit Scope

### Create

- `scripts/remotion-capabilities-smoke.mjs` — focused Phase 6A package, source, export, registration, status, and forbidden-boundary guard.
- `src/remotion/effects/presets.ts` — four frame-driven Producer effect preset factories and selection metadata.
- `src/remotion/effects/index.ts` — public Producer effects surface.
- `src/remotion/styles/fit-text.ts` — guarded Chinese/long-text fitting wrapper with width, line-count, and height-derived font bounds.
- `src/remotion/styles/index.ts` — public Producer layout surface.
- `src/remotion/capability-showcase/RemotionCapabilityShowcase.tsx` — code-only inventory composition using `Series`, four effect presets, and short/long Chinese fixtures.
- `src/remotion/capability-showcase/index.ts` — composition constants and exports.
- this plan — scope, RED/GREEN evidence, verification record, and stop boundary.

### Modify

- `package.json`, `package-lock.json` — exact `4.0.489` effects/layout dependencies and `smoke:remotion-capabilities`.
- `remotion.config.ts` — enable Chromium OpenGL `swangle` for deterministic WebGL effect rendering in the no-GPU Producer container.
- `src/remotion/Root.tsx` — add one `Folder` containing only the capability showcase composition.
- `scripts/remotion-version-gate-smoke.mjs` — allow and require the Phase 6A exact-version packages while continuing to reject transitions/light-leaks and future paths.
- `scripts/agent-producer-architecture-smoke.mjs`, `scripts/skill-alignment-smoke.mjs` — guard Phase 6A ownership, command, status, and Agent Producer discoverability.
- `README.md`, `AGENTS.md`, `scripts/AGENTS.md`, `src/remotion/AGENTS.md` — report the implemented slice and unchanged blocker.
- `docs/FINAL_PRODUCT_GOAL.md`, `docs/ITERATION_STATUS.md`, `docs/AGENT_PRODUCER_ONLY_ROADMAP.md` — authorize the Phase 6A/6B split, mark only 6A complete, and keep Phase 6 overall incomplete.
- `docs/REMOTION_COMPONENT_LIBRARY.md` — inventory the four presets, text-fit helper, showcase, and exact selection rules.
- `docs/architecture/agent-producer-only-removal-inventory.json` — add Producer-owned effects/layout/showcase entries and a completed `effects-text-layout-foundation` slice without adding Phase 6 to `completedPhases`.
- `.agents/skills/ai-video-studio-agent-producer/SKILL.md`, `.agents/skills/remotion-best-practices/SKILL.md` — route agents to the new supported capabilities and preserve the Phase 6B prohibition.

### No deletions

This slice deletes no source, composition, compatibility path, provider file, private file, or generated artifact.

## Explicit Non-Goals

- no `@remotion/transitions`, mixed-version override, vendored transition implementation, or lower Remotion target
- no `src/remotion/transitions/`, transition preset, `TransitionSeries`, transition SFX mapping, or transition-duration arithmetic
- no `@remotion/light-leaks`, film-burn/light-leak completion, custom `createEffect()`, or new WebGL shader
- no `HtmlInCanvas` or `CanvasImage` source coverage; Chrome flag/media compatibility remains Phase 6B
- no image/video asset, remote URL, generated visual, or manifest mutation
- no Phase 7 dynamic media/sound, Phase 8 style profile, or Phase 9 hard gate
- no finished/frozen composition edit, render, migration, regeneration, or formatting
- no provider, VoxCPM, `.env.example`, Compose topology, asset contract, or Producer audio change
- no repository-wide lint cleanup and no push

## Frozen And Artifact Boundary

- Every finished directory under `src/remotion/<CompositionName>/` remains untouched.
- Historical `provider: "f5-tts"` metadata remains truthful and unchanged.
- `src/remotion/recipes/{blocks,timing}`, historical storyboard contracts, and frozen sample registry entries remain read-only.
- The new showcase is an Agent Producer inventory aid, not a maintained topic sample, template, planner surface, or frozen composition migration target.
- Representative stills are written only under ignored `out/phase6a-capabilities/`.
- Do not stage `public/generated/`, `out/`, `voices/`, audio, video, screenshots, secrets, npm logs, or private configuration.

## Dependency And Call-Chain Evidence

CodeGraph established:

```txt
Root.tsx
  -> current finished composition registrations
  -> new isolated Folder/CapabilityShowcase registration only

package.json / package-lock.json
  -> Docker producer npm install
  -> Remotion Studio, CLI renderer, and capability imports

Agent Producer skill
  -> component inventory
  -> Producer effect preset ids + text-fit helper
  -> dedicated future composition selection
```

The Phase 6A implementation path is:

```txt
frame + preset id
  -> getProducerEffectPreset()
  -> exact-version @remotion/effects descriptors
  -> Remotion Solid canvas in the showcase

Chinese copy + width/height/line constraints
  -> fitProducerText()
  -> @remotion/layout-utils fitTextOnNLines()
  -> bounded font size + line diagnostics
  -> normal React text in the showcase
```

The dependency boundary remains:

```txt
admitted now: @remotion/effects@4.0.489, @remotion/layout-utils@4.0.489
still blocked: @remotion/transitions latest 4.0.477 -> exact 4.0.477 internals
forbidden workaround: mixed versions, overrides, vendoring, lowering target
```

---

### Task 1: Add And Observe The Phase 6A RED Guard

**Files:**

- Create: `scripts/remotion-capabilities-smoke.mjs`
- Modify: `package.json`

- [x] **Step 1: Add the focused package/source/status assertions**

Create the smoke with this complete implementation:

```js
/* global console */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(path.join(root, relativePath), "utf8");
const packageJson = JSON.parse(read("package.json"));
const inventory = JSON.parse(
  read("docs/architecture/agent-producer-only-removal-inventory.json"),
);
const allDirectDependencies = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
};

for (const name of ["@remotion/effects", "@remotion/layout-utils"]) {
  assert.equal(
    allDirectDependencies[name],
    "4.0.489",
    `${name} must be exact 4.0.489`,
  );
}
for (const relativePath of [
  "src/remotion/effects/presets.ts",
  "src/remotion/effects/index.ts",
  "src/remotion/styles/fit-text.ts",
  "src/remotion/styles/index.ts",
  "src/remotion/capability-showcase/RemotionCapabilityShowcase.tsx",
  "src/remotion/capability-showcase/index.ts",
]) {
  assert(
    existsSync(path.join(root, relativePath)),
    `Missing Phase 6A surface: ${relativePath}`,
  );
}
assert(!("@remotion/transitions" in allDirectDependencies));
assert(!("@remotion/light-leaks" in allDirectDependencies));
assert(!existsSync(path.join(root, "src/remotion/transitions")));

const effects = read("src/remotion/effects/presets.ts");
for (const id of ["comic-print", "cyber-scan", "paper-grain", "pixel-grid"]) {
  assert(effects.includes(id), `Missing Producer effect preset: ${id}`);
}
for (const required of [
  "checkerboard",
  "halftone",
  "roughenEdges",
  "scanlines",
  "paper",
  "pixelate",
  "interpolate",
]) {
  assert(effects.includes(required), `Effect presets must use ${required}`);
}

const fitText = read("src/remotion/styles/fit-text.ts");
for (const required of [
  "fitTextOnNLines",
  "maxBoxHeight",
  "lineHeightPx",
  "Noto Sans CJK SC",
]) {
  assert(fitText.includes(required), `Text fit helper must include ${required}`);
}

const rootSource = read("src/remotion/Root.tsx");
assert(rootSource.includes("Folder"), "Root must group the capability showcase");
assert(rootSource.includes('Folder name="Agent-Producer-Inventory"'));
assert(rootSource.includes("REMOTION_CAPABILITY_SHOWCASE_COMPOSITION_ID"));
assert(
  read("src/remotion/capability-showcase/index.ts").includes(
    '"AgentProducerCapabilityShowcase"',
  ),
);
assert(
  read("remotion.config.ts").includes('Config.setChromiumOpenGlRenderer("swangle")'),
  "Remotion config must enable the documented no-GPU swangle renderer",
);

assert(
  inventory.completedPhaseSlices.some(
    (entry) =>
      entry.phase === 6 &&
      entry.slice === "effects-text-layout-foundation" &&
      entry.status === "complete",
  ),
  "Inventory must record the completed Phase 6A slice",
);

const iterationStatus = read("docs/ITERATION_STATUS.md");
assert(iterationStatus.includes("Phase 6A effects and text-layout foundation is complete."));
assert(iterationStatus.includes("Phase 6 overall remains incomplete."));
assert(
  iterationStatus.includes(
    "Phase 6B transitions and remaining showcase coverage have not started.",
  ),
);

const producerSkill = read(".agents/skills/ai-video-studio-agent-producer/SKILL.md");
for (const required of [
  "getProducerEffectPreset",
  "fitProducerText",
  "AgentProducerCapabilityShowcase",
  "npm run smoke:remotion-capabilities",
]) {
  assert(producerSkill.includes(required), `Agent Producer skill must include ${required}`);
}

const capabilitySource = [
  effects,
  fitText,
  read("src/remotion/capability-showcase/RemotionCapabilityShowcase.tsx"),
].join("\n");
for (const [label, pattern] of [
  ["remote URL", /https?:\/\//i],
  ["CSS animation", /animation(?:Name)?\s*:/],
  ["CSS transition", /transition\s*:/],
  ["image generation", /image[_ -]?generat/i],
  ["video generation", /video[_ -]?generat/i],
  ["provider runtime", /VoxCPM|f5-tts|TTS_PROVIDER/],
  ["planner/template runtime", /VideoProject|StoryboardPlan|selected-template/],
]) {
  assert(!pattern.test(capabilitySource), `Phase 6A source must not contain ${label}`);
}

console.log("Remotion capability smoke passed.");
```

- [x] **Step 2: Register and run RED in Docker**

Add `smoke:remotion-capabilities` as `node scripts/remotion-capabilities-smoke.mjs`, then run:

```bash
docker compose run --rm producer bash -lc 'npm run smoke:remotion-capabilities'
```

Expected: exit `1` on `@remotion/effects` or the first missing Phase 6A surface. The failure must be the absent capability contract, not syntax, Docker, or dependency setup.

### Task 2: Admit Only The Exact Compatible Dependencies

**Files:**

- Modify: `package.json`
- Modify mechanically through npm: `package-lock.json`
- Modify: `remotion.config.ts`
- Modify: `scripts/remotion-version-gate-smoke.mjs`

- [x] **Step 1: Add exact compatible packages**

Patch dependencies to include:

```json
"@remotion/effects": "4.0.489",
"@remotion/layout-utils": "4.0.489"
```

Do not add transitions or light-leaks.

- [x] **Step 2: Regenerate the lock and Docker dependency volume**

Run:

```bash
docker compose run --rm producer npm install --ignore-scripts
```

Verify all top-level `remotion` and `@remotion/*` lock entries remain exact `4.0.489` and no `@remotion/transitions` entry exists.

- [x] **Step 3: Enable the documented WebGL renderer**

Add exactly:

```ts
Config.setChromiumOpenGlRenderer("swangle");
```

Keep the existing image format and webpack override unchanged.

- [x] **Step 4: Evolve the version gate without weakening it**

Require effects/layout at exact `4.0.489`; continue to require transitions/light-leaks and `src/remotion/transitions` to be absent. Require the new Phase 6A inventory slice and keep Phase 6 out of `completedPhases`.

### Task 3: Add Producer-Owned Effects And Text Fitting

**Files:** all new `effects/` and `styles/` files listed in Scope.

- [x] **Step 1: Implement four narrow effect preset factories**

Create `presets.ts` with this implementation:

```ts
import { checkerboard } from "@remotion/effects/checkerboard";
import { halftone } from "@remotion/effects/halftone";
import { paper } from "@remotion/effects/paper";
import { pixelate } from "@remotion/effects/pixelate";
import { roughenEdges } from "@remotion/effects/roughen-edges";
import { scanlines } from "@remotion/effects/scanlines";
import { interpolate, type EffectDescriptor } from "remotion";

export type ProducerEffectPresetId =
  | "comic-print"
  | "cyber-scan"
  | "paper-grain"
  | "pixel-grid";

export const producerEffectPresets = [
  { id: "comic-print", label: "Comic print", useWhen: "Printed panels and editorial emphasis" },
  { id: "cyber-scan", label: "Cyber scan", useWhen: "Terminal, signal, and system-state beats" },
  { id: "paper-grain", label: "Paper grain", useWhen: "Document and hand-drawn explainer beats" },
  { id: "pixel-grid", label: "Pixel grid", useWhen: "Digital abstraction and state-change beats" },
] as const satisfies readonly {
  readonly id: ProducerEffectPresetId;
  readonly label: string;
  readonly useWhen: string;
}[];

export const getProducerEffectPreset = ({
  id,
  frame,
}: {
  readonly id: ProducerEffectPresetId;
  readonly frame: number;
}): EffectDescriptor<unknown>[] => {
  if (!Number.isFinite(frame)) throw new Error("frame must be finite");

  if (id === "comic-print") {
    return [
      checkerboard({ colors: ["#ffe6a7", "#ef476f"], cellSize: 42, angle: -8 }),
      halftone({ colorMode: "source", dotSize: 12, dotSpacing: 16, rotation: 8 }),
      roughenEdges({ amount: 0.42, border: 18, scale: 0.09, seed: 231.2 }),
    ];
  }

  if (id === "cyber-scan") {
    return [
      checkerboard({ colors: ["#061826", "#00d9ff"], cellSize: 32, angle: 3 }),
      scanlines({
        amount: 0.34,
        spacing: 5,
        thickness: 2,
        offset: interpolate(frame, [0, 180], [0, 90], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }),
    ];
  }

  if (id === "paper-grain") {
    return [
      checkerboard({ colors: ["#f5eddc", "#d8c5a4"], cellSize: 76, angle: 2 }),
      paper({
        amount: 0.72,
        colorFront: "#f7f0df",
        colorBack: "#b79d78",
        contrast: 0.32,
        roughness: 0.46,
        fiber: 0.4,
        seed: 17,
        scale: 0.58,
      }),
    ];
  }

  return [
    checkerboard({ colors: ["#382c6e", "#f72585", "#4cc9f0"], cellSize: 26, angle: 12 }),
    pixelate({
      blockSize: interpolate(frame, [0, 60], [28, 8], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    }),
  ];
};
```

- [x] **Step 2: Implement guarded Chinese text fitting**

Create `fit-text.ts` with this implementation:

```ts
import { fitTextOnNLines } from "@remotion/layout-utils";

export type FitProducerTextOptions = {
  readonly text: string;
  readonly maxBoxWidth: number;
  readonly maxBoxHeight: number;
  readonly maxLines: number;
  readonly maxFontSize: number;
  readonly fontFamily?: string;
  readonly fontWeight?: number | string;
  readonly lineHeight?: number;
};

export type FitProducerTextResult = {
  readonly fontSize: number;
  readonly lines: readonly string[];
  readonly lineHeightPx: number;
  readonly fits: boolean;
};

const requirePositiveFinite = (value: number, label: string): void => {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a positive finite number`);
  }
};

export const fitProducerText = ({
  text,
  maxBoxWidth,
  maxBoxHeight,
  maxLines,
  maxFontSize,
  fontFamily = "Noto Sans CJK SC",
  fontWeight = 700,
  lineHeight = 1.16,
}: FitProducerTextOptions): FitProducerTextResult => {
  if (!text.trim()) throw new Error("text must be non-empty");
  requirePositiveFinite(maxBoxWidth, "maxBoxWidth");
  requirePositiveFinite(maxBoxHeight, "maxBoxHeight");
  requirePositiveFinite(maxFontSize, "maxFontSize");
  requirePositiveFinite(lineHeight, "lineHeight");
  if (!Number.isInteger(maxLines) || maxLines <= 0) {
    throw new Error("maxLines must be a positive integer");
  }

  const heightSafeMaxFontSize = Math.min(
    maxFontSize,
    maxBoxHeight / (maxLines * lineHeight),
  );
  const isUnspacedCjk = /[\u3400-\u9fff]/u.test(text) && !/\s/u.test(text);
  const measurementText = isUnspacedCjk ? Array.from(text).join(" ") : text;
  const fitted = fitTextOnNLines({
    text: measurementText,
    maxBoxWidth,
    maxLines,
    fontFamily,
    fontWeight,
    maxFontSize: heightSafeMaxFontSize,
  });
  const lines = fitted.lines.map((line) =>
    isUnspacedCjk ? line.replaceAll(" ", "") : line,
  );
  const lineHeightPx = fitted.fontSize * lineHeight;
  const renderedHeight = lineHeightPx * lines.length;

  return {
    fontSize: fitted.fontSize,
    lines,
    lineHeightPx,
    fits: lines.length <= maxLines && renderedHeight <= maxBoxHeight + 0.01,
  };
};
```

- [x] **Step 3: Export only the supported surfaces**

Create `effects/index.ts` and `styles/index.ts` as narrow re-export files for the types, metadata, and functions above. Do not export a scene, recipe, template, or style-profile schema.

### Task 4: Prove The Slice In One Inventory Showcase

**Files:** capability showcase files and `Root.tsx`.

- [x] **Step 1: Build the code-only showcase**

Create `index.ts` with these exact constants and exports:

```ts
export const REMOTION_CAPABILITY_SHOWCASE_COMPOSITION_ID =
  "AgentProducerCapabilityShowcase";
export const REMOTION_CAPABILITY_SHOWCASE_DURATION_IN_FRAMES = 180;
export const REMOTION_CAPABILITY_SHOWCASE_FPS = 30;
export const REMOTION_CAPABILITY_SHOWCASE_WIDTH = 1920;
export const REMOTION_CAPABILITY_SHOWCASE_HEIGHT = 1080;

export { RemotionCapabilityShowcase } from "./RemotionCapabilityShowcase";
```

Implement `RemotionCapabilityShowcase.tsx` as a 1920x1080 code-only composition with two 90-frame `Series.Sequence` sections:

1. four effect tiles using `Solid` and the four preset ids;
2. short and long Chinese fixtures using `fitProducerText()` with visible box/line diagnostics.

The effects section maps `producerEffectPresets` into a 2x2 grid. Each tile calls `getProducerEffectPreset({id, frame})`, renders a `Solid` canvas, and overlays its label and `useWhen`. The text section calls `fitProducerText()` once for `"代码驱动，画面可复核"` in a 700x210 two-line box and once for `"当中文标题明显变长时，字号必须自动收敛并保持在安全框内"` in a 1200x300 three-line box; render `lines` explicitly with `lineHeightPx` and show `fits` plus the computed font size. Use `useCurrentFrame()` and clamped `interpolate()` for section opacity only. Do not use CSS animation, CSS transitions, timers, remote URLs, or non-code assets.

- [x] **Step 2: Register it under one Studio folder**

Import `Folder` and add:

```tsx
<Folder name="Agent-Producer-Inventory">
  <Composition
    id={REMOTION_CAPABILITY_SHOWCASE_COMPOSITION_ID}
    component={RemotionCapabilityShowcase}
    durationInFrames={REMOTION_CAPABILITY_SHOWCASE_DURATION_IN_FRAMES}
    fps={REMOTION_CAPABILITY_SHOWCASE_FPS}
    width={REMOTION_CAPABILITY_SHOWCASE_WIDTH}
    height={REMOTION_CAPABILITY_SHOWCASE_HEIGHT}
  />
</Folder>
```

Do not wrap, reorder, edit, or reformat any existing registration.

- [x] **Step 3: Turn the focused smoke GREEN**

Run the same Docker command from Task 1. Expected output: `Remotion capability smoke passed.`

### Task 5: Align Active Authorities And Guards

**Files:** all docs, skills, inventory, and guard scripts listed in Scope.

- [x] **Step 1: Authorize and record the split precisely**

Use consistent language:

```txt
Phase 6A effects and text-layout foundation is complete.
Phase 6 overall remains incomplete.
Phase 6B transitions and remaining showcase coverage have not started.
```

Keep `completedPhases` at `[0, 1, 2, 3, 4, 5]`. Add a second Phase 6 completed slice after `version-gate`.

- [x] **Step 2: Document exact Agent Producer selection**

Document when to select `comic-print`, `cyber-scan`, `paper-grain`, and `pixel-grid`; route bounded Chinese/long text through `fitProducerText()`; name the showcase composition and focused smoke.

- [x] **Step 3: Preserve the blocker and remaining boundary**

State the verified npm/docs mismatch and forbid mixed versions, overrides, vendoring, or lowering the target. Keep transitions, light leaks, HtmlInCanvas/CanvasImage media proof, transition timing, and later phases explicitly unstarted.

- [x] **Step 4: Record unchanged surfaces**

`docs/providers/voxcpm.md`, `docs/PRODUCER_ASSET_CONTRACT.md`, `docs/PRODUCER_PROMOTION_GATE.md`, `.env.example`, Docker Compose, Producer audio, maintained sample manifests, and frozen compositions remain unchanged.

### Task 6: Fresh Verification, Review, And One Commit

- [x] **Step 1: Run focused GREEN smokes**

```bash
docker compose run --rm producer bash -lc 'npm run smoke:remotion-capabilities && npm run smoke:remotion-version-gate && npm run smoke:agent-producer-architecture && npm run smoke:skill-alignment && npm run smoke:producer-os && npm run smoke:producer-assets && npm run smoke:producer-validation && npm run smoke:producer-review-frames'
```

- [x] **Step 2: Run Docker-first gates**

```bash
docker compose run --rm producer bash -lc 'npx tsc --noEmit --pretty false'
docker compose run --rm producer bash -lc 'npm run lint'
docker compose run --rm producer bash -lc 'npm run build'
docker compose run --rm producer bash -lc 'npx remotion compositions src/remotion/index.ts'
```

Typecheck, build, and composition listing must exit `0`. Record full lint honestly against the 39-error/2-warning historical baseline.

- [x] **Step 3: Render and inspect representative showcase stills**

Render frames `30` and `120` twice under ignored `out/phase6a-capabilities/`, compare each pair's SHA-256, and inspect the images. The effects frame must show four visibly different nonblank tiles; the text frame must show both Chinese fixtures inside their boxes with readable text and no clipping or overlap.

- [x] **Step 4: Run changed-file and boundary checks**

Run changed-file ESLint, Prettier `--check`, JSON parsing, `docker compose config --quiet`, `git diff --check`, the Phase 6A forbidden scan, frozen-file diff check, generated/private artifact scan, and staged secret/media scan.

- [x] **Step 5: Re-read this plan and Roadmap acceptance**

Verify exact package alignment, RED/GREEN evidence, four preset responsibilities, text-fit diagnostics, showcase registration/render evidence, Agent Producer discoverability, docs consistency, unchanged surfaces, and the Phase 6B stop condition.

- [x] **Step 6: Update the execution record and commit once**

Stage only Phase 6A files and create:

```bash
git commit -m "feat: add remotion effects and text layout foundation"
```

Then record the commit hash and `git status --short --branch`. Do not push.

## RED Evidence Required For Handoff

- The first Docker `smoke:remotion-capabilities` exits `1` because exact Phase 6A dependencies/surfaces are absent in the old state.

## GREEN Evidence Required For Handoff

- effects/layout packages and every installed Remotion package resolve to exact `4.0.489`
- transitions and light-leaks remain absent; no mixed closure or override exists
- four frame-driven Producer preset ids and guarded text fitting are discoverable through the Agent Producer skill
- the inventory showcase lists and renders without non-code assets
- repeated representative stills are byte-deterministic and visually inspected
- focused capability/version/architecture/skill/Producer smokes pass
- Docker typecheck, build, and composition listing pass
- full lint is reported honestly against the historical baseline; changed files are clean
- docs, inventory, package/config, forbidden/frozen/artifact/secret scans, and `git diff --check` pass
- no finished composition, provider, env, Compose topology, generated media, private voice, or later-phase implementation changes

## Documentation Alignment Boundary

Align README, AGENTS, FINAL_PRODUCT_GOAL, ITERATION_STATUS, the active Roadmap, component inventory, removal inventory, Agent Producer skill, Remotion skill, script/remotion knowledge bases, architecture and skill guards, package scripts, and this plan. Keep `VISUAL_RECIPE_ROADMAP.md` as a superseded pointer. Keep provider, asset contract, promotion gate, env, Compose, Producer OS/sample manifests, and frozen sources unchanged unless verification proves a direct inconsistency.

## Commit Boundary And Stop Condition

Create exactly one commit containing the Phase 6A focused smoke, exact effects/layout dependencies, OpenGL render config, Producer-owned presets/text fitting, isolated showcase/registration, active-document alignment, and verification record. Stop after commit/status verification. Do not begin Phase 6B transitions or remaining showcase coverage, Phase 7, Phase 8, or Phase 9. Do not push.

## Plan Self-Review

- Spec coverage: repository facts, explicit scope/non-goals, frozen boundary, CodeGraph/npm/docs evidence, RED/GREEN, focused and Docker validation, visual inspection, docs, commit boundary, and stop condition are mapped to Tasks 1-6.
- Placeholder scan: no placeholder marker, relaxed check, unbounded cleanup, or unspecified implementation remains.
- Type/field consistency: preset ids, `fitProducerText()` inputs/results, composition constants, exact package version, and inventory slice names remain identical across tasks.
- Scope check: transitions, light-leaks, HtmlInCanvas/CanvasImage media proof, later phases, frozen sources, providers, env, Compose, and generated artifacts remain excluded.

## Execution Record

- RED: Docker `smoke:remotion-capabilities` exited `1` because
  `@remotion/effects` was absent (`actual: undefined`, expected exact
  `4.0.489`). The focused guard reached the intended missing-capability
  contract without a syntax, Docker, or dependency-setup error.
- Dependency result: `@remotion/effects` and `@remotion/layout-utils` installed
  at exact `4.0.489`; every direct and top-level lockfile Remotion entry remains
  exact `4.0.489`, while transitions remains absent.
- Initial GREEN: the same focused Docker smoke exits `0` with
  `Remotion capability smoke passed.` after correcting its registration guard
  to follow the imported composition-id constant into the showcase index.
- Render diagnosis: the first representative effect still failed to acquire a
  WebGL2 context with both the configured `angle` backend and an explicit
  `--gl=angle`. Remotion's official troubleshooting guidance assigns `swangle`
  to machines without a GPU; the Producer container exposes no GPU, and the
  same frame rendered successfully with only `--gl=swangle`. The repository
  default is therefore `swangle`, not a caller-specific CLI override.
- Representative stills: default-config renders at frames `30` and `120`
  succeeded twice. The effects pair shares SHA-256
  `23bfe51511094489fbdeeb78f9a5133e4e08dddc95cb7194252b04ac54ee3272`;
  the text pair shares
  `04ca203e82f48e648b0c767de22a5540b03ad93cad6e6ddf035b28b1b02ed3de`.
  Visual inspection confirmed four distinct nonblank effect tiles and short
  two-line plus long three-line Chinese fixtures inside their safety boxes.
- Focused GREEN: capability, version-gate, architecture, skill-alignment,
  Producer OS, assets, validation, and review-frame smokes all exited `0` in
  Docker.
- Docker gates: `tsc --noEmit`, Remotion bundle build, and composition listing
  exited `0`; the listing includes only the new 180-frame
  `AgentProducerCapabilityShowcase` alongside the existing registrations.
- Lint baseline: repository-wide Docker lint reproduced the historical 39
  errors and 2 warnings, all in unchanged historical/frozen files. Focused
  ESLint over every changed TS/TSX/MJS file exited `0`.
- Boundary checks: changed-file Prettier, JSON parsing, Compose config,
  `git diff --check`, capability forbidden scan, unchanged-surface review, and
  ignored artifact inspection passed. `out/`, `public/generated/`, and
  `voices/` remain ignored local trees and are outside the commit boundary.
