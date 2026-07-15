# Agent Producer-Only Phase 0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `ai-video-studio-agent-producer` the repository's sole active video-production authority, record the exact keep/extract/delete boundary, and add an executable architecture guard without deleting runtime code.

**Architecture:** Archive the current mixed-product entry documents and replace them with compact Producer-only authorities that distinguish supported behavior from transitional code still present on disk. Add a machine-readable removal inventory plus a dependency-free Node smoke that validates its shape, active-document alignment, historical exceptions, and phase ownership. Update the Agent Producer skill so it routes only to code-driven Remotion, existing assets, and VoxCPM while later phases remain responsible for direct VoxCPM extraction and destructive F5/Web removal.

**Tech Stack:** Markdown, JSON, Node.js ESM, npm scripts, Remotion 4, Docker-first TypeScript/ESLint/build validation, CodeGraph, Git.

**Design authority:** `docs/AGENT_PRODUCER_ONLY_ROADMAP.md` at commit `d09f4e0`.

## Global Constraints

- `.agents/skills/ai-video-studio-agent-producer/` is the only supported video-production entrypoint.
- Visual production uses code and existing assets only. No image-generation or video-generation tool, service, prompt, fallback, or skill instruction is allowed.
- Covers are Remotion `<Still>` compositions built from code and manifest-backed existing assets.
- Missing source capture falls back to an honest code-rendered information graphic, never a generated source card.
- VoxCPM is the only supported provider for new narration.
- Existing finished compositions are frozen read-only references and are not migrated or regenerated.
- Historical `provider: "f5-tts"` values in frozen `audio.generated.ts` files remain accurate records and are explicitly allowed.
- Phase 0 deletes no executable source, service, script, adapter, config, composition, generated artifact, or historical metadata.
- The current shared Producer audio helper still calls Next `/api/tts`; Phase 1 must replace that boundary before Phase 2/3 deletion.
- Web generation and F5 generation are unsupported immediately, even though their code remains on disk until their owning deletion phase.
- Do not rename, rewrite, or re-render old compositions merely to make the new documentation cleaner.
- Generated audio, captured media, review frames, covers, and MP4 files remain ignored local artifacts.
- Use CodeGraph before source dependency decisions and Docker as the current type/build source of truth.

## Scope Split

This plan covers Roadmap Phase 0 only. Do not absorb later work:

| Later plan | Responsibility |
| --- | --- |
| Phase 1 | direct VoxCPM client, resume, silence trim, captions, removal of Producer `/api/tts` and `NEXT_ORIGIN` dependence |
| Phase 2 | delete F5 service, adapters, generation scripts, config, smokes, environment keys, and current F5 docs |
| Phase 3 | delete Next/Web generation, editor, planner, template, upload, progress, and export product paths |
| Phase 4+ | Producer OS consolidation, asset contracts, broader Remotion capabilities, styles, and final gates |

## File Structure

### New files

- `docs/architecture/agent-producer-only-removal-inventory.json` — machine-readable ownership, phase, action, and historical-exception map.
- `docs/archive/README.md` — explains why archived files are not current authority.
- `scripts/agent-producer-architecture-smoke.mjs` — validates the inventory and active authority documents without application dependencies.

### Archived and recreated entry documents

- `README.md` — concise operator entrypoint; old contents move to `docs/archive/2026-07-15-pre-producer-only-readme.md`.
- `AGENTS.md` — current repository instructions; old contents move to `docs/archive/2026-07-15-pre-producer-only-agents.md`.
- `docs/FINAL_PRODUCT_GOAL.md` — sole product authority; old contents move to `docs/archive/2026-07-15-pre-producer-only-final-product-goal.md`.
- `docs/ITERATION_STATUS.md` — current transition state only; old contents move to `docs/archive/2026-07-15-pre-producer-only-iteration-status.md`.
- `docs/VISUAL_RECIPE_ROADMAP.md` — short supersession notice; old contents move to `docs/archive/2026-07-15-pre-producer-only-visual-recipe-roadmap.md`.

### Modified files

- `.agents/skills/ai-video-studio-agent-producer/SKILL.md` — sole-path, VoxCPM-only, code/existing-asset, Remotion-cover workflow.
- `scripts/skill-alignment-smoke.mjs` — asserts the new skill and authority language and rejects removed guidance.
- `package.json` — adds `smoke:agent-producer-architecture`.
- F5 and Web/provider documents listed in Task 4 — receive an explicit historical/removal banner or move under `docs/archive/`.

---

### Task 1: Add The Removal Inventory Contract And Shape Guard

**Files:**

- Create: `scripts/agent-producer-architecture-smoke.mjs`
- Create: `docs/architecture/agent-producer-only-removal-inventory.json`
- Modify: `package.json`

**Interfaces:**

- Produces: JSON contract version `1` with `authority`, `allowedHistoricalExceptions`, and exactly five category arrays.
- Produces: npm command `smoke:agent-producer-architecture`.
- Later tasks extend the smoke's active-document assertions; they do not change the inventory shape.

- [ ] **Step 1: Write the failing inventory smoke**

Create `scripts/agent-producer-architecture-smoke.mjs`:

```javascript
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const inventoryPath = "docs/architecture/agent-producer-only-removal-inventory.json";
const categories = [
  "producerOwned",
  "webF5Only",
  "shared",
  "historicalDependency",
  "unused",
];
const actions = new Set(["retain", "extract-then-delete", "delete", "archive", "preserve-history"]);

const absolute = (relativePath) => path.join(root, relativePath);
const read = (relativePath) => readFileSync(absolute(relativePath), "utf8");

assert(existsSync(absolute(inventoryPath)), `${inventoryPath} must exist`);
const inventory = JSON.parse(read(inventoryPath));

assert.equal(inventory.version, 1, "inventory version");
assert.equal(
  inventory.authority.skill,
  ".agents/skills/ai-video-studio-agent-producer/",
  "sole skill authority",
);
assert.equal(inventory.authority.roadmap, "docs/AGENT_PRODUCER_ONLY_ROADMAP.md", "roadmap authority");
assert.deepEqual(Object.keys(inventory.categories).sort(), [...categories].sort(), "exact category set");

const seen = new Set();
for (const category of categories) {
  assert(Array.isArray(inventory.categories[category]), `${category} must be an array`);
  for (const entry of inventory.categories[category]) {
    assert.equal(typeof entry.id, "string", `${category} id`);
    assert(!seen.has(entry.id), `duplicate inventory id: ${entry.id}`);
    seen.add(entry.id);
    assert.equal(typeof entry.path, "string", `${entry.id} path`);
    assert(["path", "glob"].includes(entry.pathKind), `${entry.id} pathKind`);
    assert(actions.has(entry.action), `${entry.id} action`);
    assert(Number.isInteger(entry.phase) && entry.phase >= 0 && entry.phase <= 9, `${entry.id} phase`);
    assert.equal(typeof entry.reason, "string", `${entry.id} reason`);
    assert(entry.reason.length >= 12, `${entry.id} reason must be specific`);
    if (entry.pathKind === "path") {
      assert(existsSync(absolute(entry.path)), `${entry.id} path must exist: ${entry.path}`);
    }
  }
}

assert(
  inventory.allowedHistoricalExceptions.some(
    (entry) => entry.pattern === "src/remotion/**/audio.generated.ts" && entry.allowedValue === 'provider: "f5-tts"',
  ),
  "historical F5 metadata exception",
);

console.log("Agent Producer architecture inventory smoke passed.");
```

- [ ] **Step 2: Register the smoke and verify RED**

Add this exact script to `package.json`:

```json
"smoke:agent-producer-architecture": "node scripts/agent-producer-architecture-smoke.mjs"
```

Run:

```bash
npm run smoke:agent-producer-architecture
```

Expected: FAIL with `agent-producer-only-removal-inventory.json must exist`.

- [ ] **Step 3: Create the exact inventory**

Create `docs/architecture/agent-producer-only-removal-inventory.json` with this contract. Keep reasons and owning phases; do not collapse entries into an unreviewable `src/**` wildcard.

```json
{
  "version": 1,
  "decisionDate": "2026-07-15",
  "authority": {
    "skill": ".agents/skills/ai-video-studio-agent-producer/",
    "roadmap": "docs/AGENT_PRODUCER_ONLY_ROADMAP.md"
  },
  "allowedHistoricalExceptions": [
    {
      "pattern": "src/remotion/**/audio.generated.ts",
      "allowedValue": "provider: \"f5-tts\"",
      "reason": "Frozen compositions retain accurate historical provider metadata."
    }
  ],
  "categories": {
    "producerOwned": [
      {"id":"producer-skill","path":".agents/skills/ai-video-studio-agent-producer","pathKind":"path","action":"retain","phase":0,"reason":"Sole supported video-production entrypoint."},
      {"id":"remotion-skill","path":".agents/skills/remotion-best-practices","pathKind":"path","action":"retain","phase":0,"reason":"Frame-driven Remotion implementation authority."},
      {"id":"voxcpm-doc","path":"docs/providers/voxcpm.md","pathKind":"path","action":"retain","phase":1,"reason":"Only supported narration provider documentation."},
      {"id":"remotion-root","path":"src/remotion/Root.tsx","pathKind":"path","action":"retain","phase":3,"reason":"Composition registration remains required without Web."},
      {"id":"primitives","path":"src/remotion/primitives","pathKind":"path","action":"retain","phase":4,"reason":"Code-driven reusable visual primitives."},
      {"id":"primitive-catalog","path":"src/remotion/catalog","pathKind":"path","action":"retain","phase":4,"reason":"Agent-facing component discovery surface."},
      {"id":"standalone-runtime","path":"src/remotion/standalone-video","pathKind":"path","action":"retain","phase":4,"reason":"Producer timing, caption, and canvas runtime."},
      {"id":"producer-samples","path":"src/remotion/producer-samples","pathKind":"path","action":"retain","phase":4,"reason":"Future sample manifest, registry, scaffold, and blocks."},
      {"id":"producer-validation","path":"scripts/lib/producer-validation.ts","pathKind":"path","action":"retain","phase":4,"reason":"Deterministic producer hard-failure checks."},
      {"id":"producer-review","path":"scripts/lib/producer-review-frames.ts","pathKind":"path","action":"retain","phase":4,"reason":"Manifest-driven representative still planning."}
    ],
    "webF5Only": [
      {"id":"f5-service","path":"services/f5-tts","pathKind":"path","action":"delete","phase":2,"reason":"Unsupported F5 runtime service."},
      {"id":"f5-helper-dir","path":"scripts/f5-tts","pathKind":"path","action":"delete","phase":2,"reason":"Unsupported F5 generation and probe scripts."},
      {"id":"f5-compose","path":"docker-compose.f5.yml","pathKind":"path","action":"delete","phase":2,"reason":"Unsupported F5 service topology."},
      {"id":"f5-compose-gpu","path":"docker-compose.f5.gpu.yml","pathKind":"path","action":"delete","phase":2,"reason":"Unsupported F5 GPU topology."},
      {"id":"f5-top-level-scripts","path":"scripts/f5-tts-*","pathKind":"glob","action":"delete","phase":2,"reason":"Unsupported F5 service, adapter, and staged smoke entrypoints."},
      {"id":"f5-current-docs","path":"docs/{HANDOFF_F5_TTS_CAPTIONS.md,providers/f5-tts*.md}","pathKind":"glob","action":"delete","phase":2,"reason":"Unsupported current F5 setup and handoff documentation."},
      {"id":"f5-lib-adapter","path":"src/lib/tts/f5.ts","pathKind":"path","action":"delete","phase":2,"reason":"Unsupported application F5 adapter."},
      {"id":"f5-producer-adapter","path":"scripts/lib/producer-audio/providers/f5.ts","pathKind":"path","action":"delete","phase":2,"reason":"Unsupported Producer F5 request-plan adapter."},
      {"id":"web-generate-routes","path":"src/app/api/generate","pathKind":"path","action":"delete","phase":3,"reason":"Unsupported brief-to-video generation API."},
      {"id":"web-render-routes","path":"src/app/api/render","pathKind":"path","action":"delete","phase":3,"reason":"Unsupported Web project export API."},
      {"id":"web-progress-routes","path":"src/app/api/progress","pathKind":"path","action":"delete","phase":3,"reason":"Unsupported Web render progress API."},
      {"id":"lambda-routes","path":"src/app/api/lambda","pathKind":"path","action":"delete","phase":3,"reason":"Unsupported cloud video-generation routes."},
      {"id":"product-assets-routes","path":"src/app/api/assets/product-ui","pathKind":"path","action":"delete","phase":3,"reason":"Unsupported Web product asset binding API."},
      {"id":"web-page","path":"src/app/page.tsx","pathKind":"path","action":"delete","phase":3,"reason":"Unsupported generation and editor application entrypoint."},
      {"id":"web-workbench","path":"src/components/project","pathKind":"path","action":"delete","phase":3,"reason":"Unsupported editor and generation UI."},
      {"id":"web-generation-hooks","path":"src/helpers/project-generation","pathKind":"path","action":"delete","phase":3,"reason":"Unsupported client generation state and actions."},
      {"id":"web-render-hooks","path":"src/helpers/{use-project-generation.ts,use-rendering.ts,use-task-progress.ts,create-progress-id.ts}","pathKind":"glob","action":"delete","phase":3,"reason":"Unsupported Web generation, progress, and export hooks."},
      {"id":"template-system","path":"src/templates","pathKind":"path","action":"delete","phase":3,"reason":"Unsupported planner-selected template product system."},
      {"id":"project-video","path":"src/remotion/ProjectVideo","pathKind":"path","action":"delete","phase":3,"reason":"Unsupported VideoProject preview and export composition."},
      {"id":"web-project-contracts","path":"src/lib/{project-*,storyboard-*,staged-*,template-registry.ts}","pathKind":"glob","action":"delete","phase":3,"reason":"Unsupported Web project, planner, and staged-generation contracts."}
    ],
    "shared": [
      {"id":"producer-audio","path":"scripts/lib/producer-audio","pathKind":"path","action":"extract-then-delete","phase":1,"reason":"Retain VoxCPM processing while removing HTTP and F5 branches."},
      {"id":"tts-api","path":"src/app/api/tts","pathKind":"path","action":"extract-then-delete","phase":1,"reason":"Producer currently depends on this route until direct VoxCPM exists."},
      {"id":"caption-schema","path":"src/lib/caption-schema.ts","pathKind":"path","action":"extract-then-delete","phase":3,"reason":"Producer captions need a Web-independent contract."},
      {"id":"captions","path":"src/lib/captions.ts","pathKind":"path","action":"extract-then-delete","phase":3,"reason":"Retain only caption helpers used by Producer."},
      {"id":"narration-schema","path":"src/lib/narration-asset-schema.ts","pathKind":"path","action":"extract-then-delete","phase":3,"reason":"Retain only Producer narration metadata fields."},
      {"id":"render-project","path":"src/lib/render-project.ts","pathKind":"path","action":"extract-then-delete","phase":3,"reason":"Preserve CLI renderer needs without VideoProject contracts."},
      {"id":"recipe-visuals","path":"src/remotion/recipes","pathKind":"path","action":"extract-then-delete","phase":3,"reason":"Promote proven Producer blocks before deleting planner recipes."},
      {"id":"package-topology","path":"package.json","pathKind":"path","action":"retain","phase":3,"reason":"Remove legacy scripts while keeping Remotion and Producer commands."},
      {"id":"environment-template","path":".env.example","pathKind":"path","action":"extract-then-delete","phase":2,"reason":"Remove F5 and Web keys while preserving VoxCPM and render configuration."},
      {"id":"docker-topology","path":"docker-compose.yml","pathKind":"path","action":"extract-then-delete","phase":3,"reason":"Replace Web service naming while preserving local Remotion tooling."}
    ],
    "historicalDependency": [
      {"id":"historical-f5-metadata","path":"src/remotion/**/audio.generated.ts","pathKind":"glob","action":"preserve-history","phase":0,"reason":"Frozen generated metadata must remain truthful."},
      {"id":"finished-compositions","path":"src/remotion/*","pathKind":"glob","action":"preserve-history","phase":0,"reason":"Finished dedicated compositions remain read-only references."},
      {"id":"standalone-audio","path":"public/standalone-samples/audio","pathKind":"path","action":"preserve-history","phase":0,"reason":"Committed reference audio supports frozen samples."},
      {"id":"archived-docs","path":"docs/archive/**","pathKind":"glob","action":"archive","phase":0,"reason":"Superseded plans remain searchable but non-authoritative."}
    ],
    "unused": []
  }
}
```

- [ ] **Step 4: Run the inventory smoke to verify GREEN**

Run:

```bash
npm run smoke:agent-producer-architecture
```

Expected: `Agent Producer architecture inventory smoke passed.`

- [ ] **Step 5: Commit the inventory boundary**

```bash
git add package.json scripts/agent-producer-architecture-smoke.mjs docs/architecture/agent-producer-only-removal-inventory.json
git commit -m "test: guard agent producer-only architecture"
```

### Task 2: Replace Mixed Entry Documents With Producer-Only Authorities

**Files:**

- Create: `docs/archive/README.md`
- Rename: `README.md` -> `docs/archive/2026-07-15-pre-producer-only-readme.md`
- Create: `README.md`
- Rename: `AGENTS.md` -> `docs/archive/2026-07-15-pre-producer-only-agents.md`
- Create: `AGENTS.md`
- Rename: `docs/FINAL_PRODUCT_GOAL.md` -> `docs/archive/2026-07-15-pre-producer-only-final-product-goal.md`
- Create: `docs/FINAL_PRODUCT_GOAL.md`
- Rename: `docs/ITERATION_STATUS.md` -> `docs/archive/2026-07-15-pre-producer-only-iteration-status.md`
- Create: `docs/ITERATION_STATUS.md`
- Rename: `docs/VISUAL_RECIPE_ROADMAP.md` -> `docs/archive/2026-07-15-pre-producer-only-visual-recipe-roadmap.md`
- Create: `docs/VISUAL_RECIPE_ROADMAP.md`
- Modify: `scripts/agent-producer-architecture-smoke.mjs`

**Interfaces:**

- `README.md` answers how to enter and operate the supported workflow.
- `AGENTS.md` answers what an agent must read, preserve, and verify.
- `FINAL_PRODUCT_GOAL.md` defines the target product boundary.
- `ITERATION_STATUS.md` records current phase and the next bounded slice.
- `VISUAL_RECIPE_ROADMAP.md` is a compatibility pointer, not a second roadmap.

- [ ] **Step 1: Extend the smoke with active-authority assertions**

Before moving documents, add this block before the success log:

```javascript
const activeDocs = [
  "README.md",
  "AGENTS.md",
  "docs/FINAL_PRODUCT_GOAL.md",
  "docs/ITERATION_STATUS.md",
  "docs/VISUAL_RECIPE_ROADMAP.md",
];
const requiredAuthority = [
  ".agents/skills/ai-video-studio-agent-producer/",
  "docs/AGENT_PRODUCER_ONLY_ROADMAP.md",
  "code and existing assets only",
];
const forbiddenActivePhrases = [
  "parked indefinitely",
  "F5-TTS is an explicit fallback",
  "TTS_PROVIDER=f5-tts",
  "image_generate",
  "generated source-card fallback",
];

for (const docPath of activeDocs) {
  const source = read(docPath);
  for (const phrase of requiredAuthority) {
    assert(source.includes(phrase), `${docPath} must include ${JSON.stringify(phrase)}`);
  }
  for (const phrase of forbiddenActivePhrases) {
    assert(!source.includes(phrase), `${docPath} must not include ${JSON.stringify(phrase)}`);
  }
}

assert(read("docs/FINAL_PRODUCT_GOAL.md").includes("only supported production flow"));
assert(read("docs/ITERATION_STATUS.md").includes("Phase 0"));
assert(read("docs/VISUAL_RECIPE_ROADMAP.md").includes("Superseded"));
```

Run `npm run smoke:agent-producer-architecture`.

Expected: FAIL on the first mixed-authority phrase in the current entry docs.

- [ ] **Step 2: Archive the old entry documents without editing their history**

Run:

```bash
mkdir -p docs/archive
git mv README.md docs/archive/2026-07-15-pre-producer-only-readme.md
git mv AGENTS.md docs/archive/2026-07-15-pre-producer-only-agents.md
git mv docs/FINAL_PRODUCT_GOAL.md docs/archive/2026-07-15-pre-producer-only-final-product-goal.md
git mv docs/ITERATION_STATUS.md docs/archive/2026-07-15-pre-producer-only-iteration-status.md
git mv docs/VISUAL_RECIPE_ROADMAP.md docs/archive/2026-07-15-pre-producer-only-visual-recipe-roadmap.md
```

Create `docs/archive/README.md` with these exact rules:

```markdown
# Archived Product Context

Files under this directory are historical evidence only. They are not current
product authority, implementation instructions, supported commands, or future
plans.

Current authority, in order:

1. `.agents/skills/ai-video-studio-agent-producer/`
2. `docs/FINAL_PRODUCT_GOAL.md`
3. `docs/AGENT_PRODUCER_ONLY_ROADMAP.md`
4. `docs/ITERATION_STATUS.md`

Historical Web/F5 instructions must not be copied into current source, skills,
scripts, configuration, or active documentation. Frozen composition metadata
may retain accurate historical provider values.
```

- [ ] **Step 3: Create compact replacement documents**

Each replacement must use these exact statements verbatim:

```markdown
`.agents/skills/ai-video-studio-agent-producer/` is the only supported
video-production entrypoint.

Visual production uses code and existing assets only.

The implementation sequence is defined by
`docs/AGENT_PRODUCER_ONLY_ROADMAP.md`.
```

Add these file-specific sections:

`README.md`:

```markdown
# AI Video Studio

This repository is a local Agent Producer operating system for deterministic,
code-driven Remotion videos from real topics and existing assets.

## Supported Flow

topic -> research/existing assets -> VoxCPM narration -> dedicated Remotion
composition -> preflight -> still review -> MP4 -> Remotion Still covers ->
publishing notes

## Current Transition

Legacy Web and F5 code is still present while the phased removal roadmap is
executed. It is unsupported and must not be used for new work. The current
shared Producer audio helper still depends on Next `/api/tts`; Phase 1 replaces
that dependency before destructive deletion begins.

## Start Here

`.agents/skills/ai-video-studio-agent-producer/` is the only supported
video-production entrypoint.

Visual production uses code and existing assets only.

The implementation sequence is defined by
`docs/AGENT_PRODUCER_ONLY_ROADMAP.md`.

Use `docs/ITERATION_STATUS.md` for the current bounded slice and
`docs/providers/voxcpm.md` for narration behavior.

## Stable Producer Commands

- `npm run producer:validate -- --module <validation-module>`
- `npm run producer:stills -- --composition <composition-id>`
- `./scripts/render-video.sh <composition-id> <slug> <metadata-json>`
- `npm run smoke:agent-producer-architecture`
- `npm run smoke:skill-alignment`

Generated audio, captures, stills, covers, and MP4s stay under ignored local
artifact directories unless the user explicitly asks otherwise.
```

`AGENTS.md` must use these headings and rules:

```markdown
# Project Knowledge Base

## Authority

`.agents/skills/ai-video-studio-agent-producer/` is the only supported
video-production entrypoint.

Visual production uses code and existing assets only.

The implementation sequence is defined by
`docs/AGENT_PRODUCER_ONLY_ROADMAP.md`.

Read `docs/FINAL_PRODUCT_GOAL.md`, then `docs/ITERATION_STATUS.md`, then the
Roadmap. Use CodeGraph before source dependency decisions.

## Production Rules

- Build a dedicated composition under `src/remotion/<CompositionName>/`.
- Use code and manifest-backed existing assets only.
- Use VoxCPM only for new narration.
- Keep finished compositions and historical provider metadata read-only.
- Do not invoke Web generation, F5 generation, image generation, or video generation.
- The shared Producer audio helper remains transitional until Phase 1 removes `/api/tts`.

## Validation

- `npm run smoke:agent-producer-architecture`
- `npm run smoke:skill-alignment`
- Docker `npx tsc --noEmit --pretty false`
- Docker `npm run lint`
- Docker `npm run build`
- Docker `npx remotion compositions src/remotion/index.ts`
- representative stills whenever render code changes
- `git diff --check`

## Completion Summary

- completed work
- key modified files
- verification evidence
- known issues, if any
- next bounded step
```

`docs/FINAL_PRODUCT_GOAL.md` must contain: the only supported flow; required
surfaces; excluded concepts; historical F5 metadata exception; creativity vs
deterministic automation ownership; code-rendered cover rule; and links to the
roadmap, current status, Remotion component library, promotion gate, and VoxCPM
provider doc.

`docs/ITERATION_STATUS.md` must state:

```markdown
# Iteration Status

Last updated: 2026-07-15

## Current Authority

`.agents/skills/ai-video-studio-agent-producer/` is the only supported
video-production entrypoint.

Visual production uses code and existing assets only.

The implementation sequence is defined by
`docs/AGENT_PRODUCER_ONLY_ROADMAP.md`.

## Current Milestone

Phase 0 — authority reset and deletion inventory.

The Roadmap design is committed at `d09f4e0`. Runtime deletion has not started.
The current implementation still contains unsupported Web/F5 code, and the
shared Producer audio helper still depends on Next `/api/tts`.

## Next Bounded Slice

Complete this Phase 0 plan, then write and execute the Phase 1 direct VoxCPM
plan. Do not begin F5 or Web deletion before the direct VoxCPM replacement is
verified.

## Frozen History

Prior delivery history is preserved in
`docs/archive/2026-07-15-pre-producer-only-iteration-status.md`.
```

`docs/VISUAL_RECIPE_ROADMAP.md` must be a short `Status: Superseded` pointer to
`docs/AGENT_PRODUCER_ONLY_ROADMAP.md`; it must explain that future visual
capabilities serve the Agent Producer skill and that recipes/templates no
longer form a planner-facing product roadmap.

- [ ] **Step 4: Run the architecture smoke to verify GREEN**

Run:

```bash
npm run smoke:agent-producer-architecture
```

Expected: `Agent Producer architecture inventory smoke passed.`

- [ ] **Step 5: Commit the authority reset**

```bash
git add README.md AGENTS.md docs/FINAL_PRODUCT_GOAL.md docs/ITERATION_STATUS.md docs/VISUAL_RECIPE_ROADMAP.md docs/archive scripts/agent-producer-architecture-smoke.mjs
git commit -m "docs: reset authority to agent producer only"
```

### Task 3: Align The Agent Producer Skill With Code-Only Production

**Files:**

- Modify: `.agents/skills/ai-video-studio-agent-producer/SKILL.md`
- Modify: `scripts/skill-alignment-smoke.mjs`
- Modify: `scripts/agent-producer-architecture-smoke.mjs`

**Interfaces:**

- The skill routes research, existing assets, VoxCPM, Remotion composition,
  review, render, Remotion `<Still>` covers, and publishing notes.
- The skill does not route to Web, F5, image generation, video generation, or
  generated evidence cards.

- [ ] **Step 1: Add failing skill-policy assertions**

Extend `scripts/skill-alignment-smoke.mjs` with:

```javascript
for (const required of [
  "only supported video-production entrypoint",
  "docs/AGENT_PRODUCER_ONLY_ROADMAP.md",
  "code and existing assets only",
  "Remotion `<Still>`",
  "honest code-rendered information graphic",
  "VoxCPM is the only supported narration provider",
]) assertIncludes(producerSkill, required, "Agent Producer skill");

for (const forbidden of [
  "Use `VideoProject`",
  "TTS_PROVIDER=f5-tts",
  "use F5-TTS",
  "image_generate",
  "generated source-card",
  "recipe/template promotion",
]) assertNotIncludes(producerSkill, forbidden, "Agent Producer skill");
```

Add the same forbidden phrases to the Agent Producer skill check in
`scripts/agent-producer-architecture-smoke.mjs`.

Run:

```bash
npm run smoke:skill-alignment
```

Expected: FAIL on current F5/image-generation/Web guidance.

- [ ] **Step 2: Rewrite the skill's authority and production chain**

The opening must become:

```markdown
Use this skill for every supported video-production task in this repository.
It is the only supported video-production entrypoint.

Production Chain:

topic -> research/existing assets -> narration/VoxCPM -> component inventory
-> dedicated Remotion composition -> preflight -> still/mp4 review
-> Remotion `<Still>` covers -> publishing notes
```

Change `Start Here` to read `FINAL_PRODUCT_GOAL`, `ITERATION_STATUS`, and
`AGENT_PRODUCER_ONLY_ROADMAP`; remove `VISUAL_RECIPE_ROADMAP` as a planning
authority.

Change the reuse hierarchy to:

```txt
existing primitive -> existing block -> sample-local scene/block
-> dedicated composition -> proven effect/transition/style extraction
```

Remove every conditional path to `VideoProject`, selected-segment regeneration,
Web export, planner recipes, or templates.

- [ ] **Step 3: Rewrite asset, evidence, and narration rules**

Use these exact policy sentences:

```markdown
Visual production uses code and existing assets only.

Attempt real source capture when evidence is needed. If capture fails or is
unreadable, record the reason outside the frame and build an honest
code-rendered information graphic. Never generate a replacement image and
never label an information graphic as a screenshot.

VoxCPM is the only supported narration provider for new work. Historical
F5-generated files may be played by frozen compositions, but this skill must
not generate, configure, or fall back to F5.
```

Keep the current punctuation-split, silence-trim, WAV-concatenation,
duration-derived-caption, reference-voice privacy, and fail-closed narration
rules. Add a transition note that the shared Producer helper remains tied to
`/api/tts` until Phase 1, so new work should use an existing direct VoxCPM
sample script rather than F5 or Web generation.

- [ ] **Step 4: Replace image-generated covers with Remotion Still covers**

Replace the complete `Generate Cover Image` section with:

```markdown
### Generate Covers With Remotion Still

Create one topic-specific cover module with two registered `<Still>`
compositions: 1920x1080 and 1080x1920. Build both from React/HTML/SVG/Canvas,
repo primitives, fonts, and manifest-backed existing assets. Do not call image
generation or video generation.

The cover must express the original topic, not the internal scene list. Render
to `out/<slug>/<slug>-cover-16x9.png` and
`out/<slug>/<slug>-cover-9x16.png`, then inspect both at full size and thumbnail
size for text overflow, edge safety, contrast, and factual imagery.
```

- [ ] **Step 5: Verify both skill guards**

Run:

```bash
npm run smoke:skill-alignment
npm run smoke:agent-producer-architecture
```

Expected:

```txt
Skill alignment smoke passed.
Agent Producer architecture inventory smoke passed.
```

- [ ] **Step 6: Commit the skill alignment**

```bash
git add .agents/skills/ai-video-studio-agent-producer/SKILL.md scripts/skill-alignment-smoke.mjs scripts/agent-producer-architecture-smoke.mjs
git commit -m "docs: align producer skill with code-only visuals"
```

### Task 4: Mark Remaining Web, Planner, And F5 Documents Historical

**Files:**

- Create directory: `docs/archive/web-product/`
- Move: `docs/AGENT_PLATFORM_DESIGN.md`
- Move: `docs/FUTURE_DIRECTION_NOTES.md`
- Move: `docs/HANDOFF_STATS_DASHBOARD_TEMPLATE.md`
- Move: `docs/HANDOFF_STRUCTURE_REFACTOR.md`
- Move: `docs/MEDIA_LAYERS.md`
- Move: `docs/PRODUCT_ARCHITECTURE.md`
- Move: `docs/PRODUCT_REQUIREMENTS.md`
- Move: `docs/STRUCTURE_REFACTOR_PLAN.md`
- Move: `docs/TEMPLATE_ARCHITECTURE.md`
- Move: `docs/plans/STATS_DASHBOARD_TEMPLATE_ROADMAP.md`
- Move: `docs/providers/deepseek.md`
- Move: `docs/providers/minimax-tool-calling-review.md`
- Move: `docs/providers/minimax-tool-calling.md`
- Move: `docs/providers/minimax.md`
- Move: `docs/superpowers/plans/2026-06-21-recipe-runtime-primitives-phase-2.md`
- Move: `docs/superpowers/plans/2026-06-21-recipe-visual-blocks.md`
- Move: `docs/superpowers/plans/2026-06-22-asset-aware-recipes-phase-5.md`
- Move: `docs/superpowers/plans/2026-06-22-high-quality-recipe-templates-phase-3.md`
- Move: `docs/superpowers/plans/2026-06-22-phase-4-live-smoke-closure.md`
- Move: `docs/superpowers/plans/2026-06-22-planner-recipe-selection-phase-4.md`
- Move: `docs/superpowers/plans/2026-06-22-recipe-coverage-expansion.md`
- Move: `docs/superpowers/plans/2026-06-23-storyboard-draft-compiler.md`
- Move: `docs/superpowers/plans/2026-06-29-main-site-recipe-abstractions-v1.md`
- Move: `docs/superpowers/specs/2026-06-21-recipe-runtime-primitives-phase-2-design.md`
- Move: `docs/superpowers/specs/2026-06-22-asset-aware-recipes-phase-5-design.md`
- Move: `docs/superpowers/specs/2026-06-22-planner-recipe-selection-phase-4-design.md`
- Modify: `docs/HANDOFF_F5_TTS_CAPTIONS.md`
- Modify: `docs/providers/f5-tts-service-plan.md`
- Modify: `docs/providers/f5-tts.md`
- Modify: `scripts/agent-producer-architecture-smoke.mjs`

**Interfaces:**

- Archived Web/provider documents remain readable but are outside active
  authority.
- F5 documents remain at their current paths only until Phase 2 deletes them.

- [ ] **Step 1: Add failing historical-document checks**

Add this exact block before the success log:

```javascript
const legacyDocs = [
  "docs/AGENT_PLATFORM_DESIGN.md",
  "docs/FUTURE_DIRECTION_NOTES.md",
  "docs/HANDOFF_STATS_DASHBOARD_TEMPLATE.md",
  "docs/HANDOFF_STRUCTURE_REFACTOR.md",
  "docs/MEDIA_LAYERS.md",
  "docs/PRODUCT_ARCHITECTURE.md",
  "docs/PRODUCT_REQUIREMENTS.md",
  "docs/STRUCTURE_REFACTOR_PLAN.md",
  "docs/TEMPLATE_ARCHITECTURE.md",
  "docs/plans/STATS_DASHBOARD_TEMPLATE_ROADMAP.md",
  "docs/providers/deepseek.md",
  "docs/providers/minimax-tool-calling-review.md",
  "docs/providers/minimax-tool-calling.md",
  "docs/providers/minimax.md",
  "docs/superpowers/plans/2026-06-21-recipe-runtime-primitives-phase-2.md",
  "docs/superpowers/plans/2026-06-21-recipe-visual-blocks.md",
  "docs/superpowers/plans/2026-06-22-asset-aware-recipes-phase-5.md",
  "docs/superpowers/plans/2026-06-22-high-quality-recipe-templates-phase-3.md",
  "docs/superpowers/plans/2026-06-22-phase-4-live-smoke-closure.md",
  "docs/superpowers/plans/2026-06-22-planner-recipe-selection-phase-4.md",
  "docs/superpowers/plans/2026-06-22-recipe-coverage-expansion.md",
  "docs/superpowers/plans/2026-06-23-storyboard-draft-compiler.md",
  "docs/superpowers/plans/2026-06-29-main-site-recipe-abstractions-v1.md",
  "docs/superpowers/specs/2026-06-21-recipe-runtime-primitives-phase-2-design.md",
  "docs/superpowers/specs/2026-06-22-asset-aware-recipes-phase-5-design.md",
  "docs/superpowers/specs/2026-06-22-planner-recipe-selection-phase-4-design.md",
];
const f5RemovalBanner = [
  "> Removal target: F5 generation is unsupported. This historical document is",
  "> retained only until Roadmap Phase 2 deletes F5 services, adapters, scripts,",
  "> configuration, and current documentation. Do not follow these instructions.",
].join("\n");

for (const sourcePath of legacyDocs) {
  const archivedPath = path.join("docs/archive/web-product", path.basename(sourcePath));
  assert(!existsSync(absolute(sourcePath)), `${sourcePath} must move out of active docs`);
  assert(existsSync(absolute(archivedPath)), `${archivedPath} must exist`);
}

for (const f5Doc of [
  "docs/HANDOFF_F5_TTS_CAPTIONS.md",
  "docs/providers/f5-tts-service-plan.md",
  "docs/providers/f5-tts.md",
]) {
  assert(read(f5Doc).includes(f5RemovalBanner), `${f5Doc} must include the removal banner`);
}
```

The exact required banner is:

```markdown
> Removal target: F5 generation is unsupported. This historical document is
> retained only until Roadmap Phase 2 deletes F5 services, adapters, scripts,
> configuration, and current documentation. Do not follow these instructions.
```

Run `npm run smoke:agent-producer-architecture`.

Expected: FAIL because the legacy paths are still active and F5 banners are
missing.

- [ ] **Step 2: Move the exact Web/provider documents**

Run the following after creating `docs/archive/web-product/` with the first
move. Preserve every basename so the smoke can resolve it deterministically:

```bash
mkdir -p docs/archive/web-product
for file in \
  docs/AGENT_PLATFORM_DESIGN.md \
  docs/FUTURE_DIRECTION_NOTES.md \
  docs/HANDOFF_STATS_DASHBOARD_TEMPLATE.md \
  docs/HANDOFF_STRUCTURE_REFACTOR.md \
  docs/MEDIA_LAYERS.md \
  docs/PRODUCT_ARCHITECTURE.md \
  docs/PRODUCT_REQUIREMENTS.md \
  docs/STRUCTURE_REFACTOR_PLAN.md \
  docs/TEMPLATE_ARCHITECTURE.md \
  docs/plans/STATS_DASHBOARD_TEMPLATE_ROADMAP.md \
  docs/providers/deepseek.md \
  docs/providers/minimax-tool-calling-review.md \
  docs/providers/minimax-tool-calling.md \
  docs/providers/minimax.md \
  docs/superpowers/plans/2026-06-21-recipe-runtime-primitives-phase-2.md \
  docs/superpowers/plans/2026-06-21-recipe-visual-blocks.md \
  docs/superpowers/plans/2026-06-22-asset-aware-recipes-phase-5.md \
  docs/superpowers/plans/2026-06-22-high-quality-recipe-templates-phase-3.md \
  docs/superpowers/plans/2026-06-22-phase-4-live-smoke-closure.md \
  docs/superpowers/plans/2026-06-22-planner-recipe-selection-phase-4.md \
  docs/superpowers/plans/2026-06-22-recipe-coverage-expansion.md \
  docs/superpowers/plans/2026-06-23-storyboard-draft-compiler.md \
  docs/superpowers/plans/2026-06-29-main-site-recipe-abstractions-v1.md \
  docs/superpowers/specs/2026-06-21-recipe-runtime-primitives-phase-2-design.md \
  docs/superpowers/specs/2026-06-22-asset-aware-recipes-phase-5-design.md \
  docs/superpowers/specs/2026-06-22-planner-recipe-selection-phase-4-design.md
do
  git mv "$file" "docs/archive/web-product/$(basename "$file")"
done
```

Do not move Producer-specific plans, `standalone-video-runtime-v1`, the VoxCPM
provider doc, the Remotion component library, the Producer promotion gate, or
the new Roadmap.

- [ ] **Step 3: Add the exact F5 removal banner**

Insert the banner immediately below each F5 document's H1. Do not rewrite its
technical history in Phase 0; Phase 2 owns deletion.

- [ ] **Step 4: Run the architecture smoke to verify GREEN**

Run `npm run smoke:agent-producer-architecture`.

Expected: `Agent Producer architecture inventory smoke passed.`

- [ ] **Step 5: Commit historical classification**

```bash
git add docs scripts/agent-producer-architecture-smoke.mjs
git commit -m "docs: archive superseded web product plans"
```

### Task 5: Run The Phase 0 Gate And Record The Handoff

**Files:**

- Modify only if verification finds an inconsistency: `docs/ITERATION_STATUS.md`
- Modify only if verification finds an inconsistency: `docs/architecture/agent-producer-only-removal-inventory.json`

**Interfaces:**

- Produces a clean, reviewable Phase 0 boundary.
- Hands Phase 1 an explicit shared `/api/tts` dependency and prohibits early
  F5/Web deletion.

- [ ] **Step 1: Run focused authority checks**

```bash
npm run smoke:agent-producer-architecture
npm run smoke:skill-alignment
git diff --check
```

Expected: both smokes pass and `git diff --check` emits no output.

- [ ] **Step 2: Run Docker source validation**

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit --pretty false'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run build'
```

Expected: exit code `0` for all three. Record pre-existing warnings verbatim;
do not describe warnings as new failures.

- [ ] **Step 3: Verify Remotion is still independently discoverable**

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx remotion compositions src/remotion/index.ts'
```

Expected: exit code `0` and the currently registered dedicated compositions
remain listed. Phase 0 does not require a render because it changes no
composition code.

- [ ] **Step 4: Run explicit authority and artifact scans**

```bash
rg -n 'parked indefinitely|TTS_PROVIDER=f5-tts|image_generate|generated source-card fallback' README.md AGENTS.md docs/FINAL_PRODUCT_GOAL.md docs/ITERATION_STATUS.md docs/VISUAL_RECIPE_ROADMAP.md .agents/skills/ai-video-studio-agent-producer/SKILL.md
git status --short
git diff --stat
```

Expected: the `rg` command returns no matches. Git status contains only the
planned Phase 0 files and no `out/`, `public/generated/`, voice, model, secret,
or temporary artifacts.

- [ ] **Step 5: Update status only with verified facts**

After all commands pass, update `docs/ITERATION_STATUS.md`:

```markdown
Phase 0 is complete. Active docs and the Agent Producer skill now describe one
supported path; the removal inventory and architecture smoke are enforced.
No runtime Web/F5 code was deleted. Phase 1 direct VoxCPM extraction is next.
```

- [ ] **Step 6: Commit any verification-driven correction**

If Step 5 changed the status file:

```bash
git add docs/ITERATION_STATUS.md docs/architecture/agent-producer-only-removal-inventory.json
git commit -m "docs: close agent producer authority reset"
```

If no file changed, do not create an empty commit.

## Phase 0 Completion Criteria

- A new agent sees one supported production path in every active entry doc.
- The Agent Producer skill contains no Web, F5 generation, image-generation,
  video-generation, or generated-source-card instructions.
- The active docs honestly state that transitional Web/F5 code still exists
  and that Producer audio still needs a Phase 1 direct VoxCPM replacement.
- The inventory contains all five required categories and an owning phase for
  every listed deletion/extraction boundary.
- Historical F5 metadata is explicitly allowed only in frozen composition
  metadata.
- Old mixed-product entry docs and superseded provider/product plans are under
  `docs/archive/` or clearly marked as Phase 2 removal targets.
- No executable runtime file or frozen composition changed.
- Focused smokes, Docker typecheck/lint/build, Remotion composition listing,
  forbidden-reference scan, and `git diff --check` pass with fresh evidence.

## Execution Handoff

After Phase 0 is implemented and reviewed, create a separate Phase 1 plan for
the direct VoxCPM Producer runtime. Do not combine Phase 1 with F5 deletion:
the replacement must pass independently before destructive work starts.
