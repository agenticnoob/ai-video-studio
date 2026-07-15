# Agent Producer Remove Web Product Phase 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the unsupported Next/Web video-generation, editing, planning, upload, progress, TTS, render, and Lambda product line while preserving the direct VoxCPM Agent Producer workflow, Remotion Studio/CLI production, and frozen compositions.

**Architecture:** Delete the complete Web product closure and its package/config/deployment surface, then make one Docker `producer` service the local Remotion Studio and Docker-first verification boundary. Move future caption typing to `standalone-video`, reduce the old storyboard/template modules to historical frozen-composition compatibility only, and retain `src/remotion/recipes/blocks/` plus its direct `recipes/timing/` dependency because current frozen compositions import those exact paths. A new Phase 3 guard proves that no active Web/planner/template call path remains and that compatibility files cannot import deleted product modules.

**Tech Stack:** TypeScript 5.9, React 19, Remotion 4.0.467, Node.js ESM smokes, Docker Compose, Zod compatibility schemas, Markdown/JSON authority docs, CodeGraph, Git.

## Current Repository Facts

- Branch: `refactor/agent-producer-service`.
- Starting commit: `b4b9262 refactor: remove f5 generation support`.
- Starting worktree: clean; no tracked user changes need merging.
- `.codegraph/` exists and was used before `rg` to inspect Phase 3 dependencies.
- Roadmap Phase 0 authority reset, Phase 1 direct VoxCPM, and Phase 2 F5 removal are complete.
- Phase 3 is the next unchecked Roadmap phase; Phase 4 has not started.
- Current focused baseline passes architecture, skill alignment, direct VoxCPM, Producer audio, Producer validation, Producer review frames, and `git diff --check`.
- Repository-wide Docker lint has a historical baseline of 75 errors plus 2 ignored generated warnings; Phase 3 must not claim a clean full lint gate unless that baseline actually changes.
- Docker currently exposes `web`, `studio`, and `render`; `web` and `web-prod` still own unsupported Next behavior.
- Existing orphan containers reported by Docker are external local state and are not deleted by this plan.

## Dependency And Call-Chain Evidence

CodeGraph and direct import scans establish:

```txt
src/app/page.tsx and src/components/project/**
  -> src/helpers/project-generation/** and src/helpers/use-*.ts
  -> /api/generate/staged, /api/render, /api/progress, /api/assets/product-ui
  -> VideoProject / VideoSegment / StoryboardPlan / templates

src/app/api/tts/**
  -> src/lib/tts/**, src/lib/captions.ts, src/lib/narration-asset-schema.ts
  -> no Agent Producer caller after Phase 1 direct VoxCPM

src/app/api/render/**
  -> src/lib/render-project.ts and render-artifacts.ts
  -> ProjectVideo + @remotion/bundler/@remotion/renderer
  -> no retained Producer CLI caller; scripts/render-video.sh uses Remotion CLI directly

src/remotion/Root.tsx
  -> ProjectVideo plus four template preview registrations
  -> RecipeShowcasePreview
  -> dedicated/frozen compositions that must remain registered unchanged

src/remotion/recipes/blocks/**
  -> imported directly by frozen UvOpenSourceBrief, OpenAiHardwareNewsBrief,
     AiDailyNewsBrief20260708/20260709, AiNewsStrategicBrief20260709,
     RawThoughtMirror, and other finished compositions
  -> retain at the exact path as historical compatibility; future Producer work must not import it

src/lib/caption-schema.ts
  -> imported directly by frozen composition types
  -> retain unchanged as historical compatibility
  -> future Producer and standalone runtime move to standalone-video/caption-types.ts

src/lib/storyboard-plan-schema.ts and template-registry.ts
  -> frozen composition script metadata; PixelRAG and WorldCup also call schema.parse()
  -> reduce to a minimal frozen compatibility contract with no src/templates or planner imports
```

## Scope

### Delete the Web product closure

- all tracked files under `src/app/`
- all tracked files under `src/components/`
- all tracked files under `src/helpers/`
- all tracked files under `src/templates/`
- all tracked files under `src/lambda/`
- `src/remotion/ProjectVideo/`
- `src/remotion/ScriptedVideo/`
- `src/remotion/SpotlightVideo/`
- `src/remotion/RecipeShowcase/`
- `src/remotion/template-component-registry.tsx`
- `src/remotion/recipes/motion/`
- Web/planner-only `src/lib` modules: artifact paths, captions normalization, concurrency, DeepSeek, media/project/render/staged/task/TTS/product/template runtime contracts, draft/compiler code, sample projects, UI utilities, and template video schemas
- Web/product/planner/template smokes and `/api/tts` one-off generator entrypoints listed in Task 3
- `Dockerfile.prod`, `docker-compose.prod.yml`, `deploy.mjs`, `config.mjs`, `next-env.d.ts`, and `next.config.js`
- `scripts/dev.sh`, `scripts/prod.sh`, `scripts/prod-build.sh`, and `scripts/render.sh`

### Modify retained runtime and compatibility boundaries

- `src/remotion/Root.tsx`
- `src/remotion/standalone-video/caption-types.ts` (new)
- `src/remotion/standalone-video/{index.ts,timeline.ts,types.ts,runtime.tsx}`
- `src/remotion/producer-samples/scaffold/{README.md,SampleName/types.ts}`
- `scripts/lib/producer-audio/{caption-types imports,request.ts,captions.ts,types.ts}`
- `src/lib/{caption-schema.ts,storyboard-plan-schema.ts,template-registry.ts,AGENTS.md}`
- `src/remotion/recipes/blocks/**` remains byte-for-byte unchanged
- `src/remotion/<FinishedComposition>/**` remains byte-for-byte unchanged

### Modify local Producer packaging and commands

- `package.json`, `package-lock.json`
- `Dockerfile`, `docker-compose.yml`, `docker-compose.voxcpm.yml`
- `.env.example`, `.dockerignore`, `tsconfig.json`, `eslint.config.mjs`
- `scripts/studio.sh`, `scripts/producer-voxcpm.sh`, `scripts/render-video.sh`
- `scripts/agent-producer-architecture-smoke.mjs`
- `scripts/agent-producer-web-removal-smoke.mjs` (new)
- `scripts/skill-alignment-smoke.mjs`

### Active documentation alignment

- `README.md`
- `AGENTS.md`
- `scripts/AGENTS.md`
- `src/remotion/AGENTS.md`
- `src/lib/AGENTS.md`
- `docs/FINAL_PRODUCT_GOAL.md`
- `docs/ITERATION_STATUS.md`
- `docs/AGENT_PRODUCER_ONLY_ROADMAP.md`
- `docs/REMOTION_COMPONENT_LIBRARY.md`
- `docs/architecture/agent-producer-only-removal-inventory.json`
- `docs/providers/voxcpm.md`
- `.agents/skills/ai-video-studio-agent-producer/SKILL.md`
- `.agents/skills/ai-video-studio-agent-producer/remotion-primitives/REMOTION_PRIMITIVES.md`
- this plan

## Explicit Non-Goals

- no Phase 4 scaffold/render command consolidation beyond removing Web-owned commands
- no Producer asset manifest/preflight implementation from Phase 5
- no Remotion package upgrade or capability additions from Phase 6+
- no new image generation, video generation, ComfyUI, provider, planner, template, scene DSL, or Web fallback
- no edit, migration, formatting, registration change, narration regeneration, or visual re-render of finished compositions
- no deletion of ignored `voices/`, `models/`, `public/generated/`, `out/`, audio, screenshots, or video
- no cleanup of orphan Docker containers or unrelated host state
- no broad historical lint repair
- no push

## Frozen And Historical Compatibility Boundary

- `src/remotion/<FinishedComposition>/**` and historical `audio.generated.ts` values are read-only.
- `src/remotion/recipes/blocks/**` and its direct `src/remotion/recipes/timing/**` dependency stay only because frozen compositions import them directly; they are not future Producer entrypoints.
- `src/lib/caption-schema.ts` stays unchanged only because frozen composition type modules import it directly.
- `src/lib/storyboard-plan-schema.ts` and `src/lib/template-registry.ts` stay at their paths only to keep frozen narration metadata compiling; they must not import `src/templates`, DeepSeek, provider prompts, or planner manifests.
- Archived documents remain historical and are not rewritten to current commands.

---

### Task 1: Add And Observe The Phase 3 RED Guard

**Files:**

- Create: `scripts/agent-producer-web-removal-smoke.mjs`
- Modify: `package.json`

- [x] **Step 1: Write the focused guard before production deletion**

The smoke must assert:

```js
const removedPaths = [
  "src/app",
  "src/components",
  "src/helpers",
  "src/templates",
  "src/lambda",
  "src/remotion/ProjectVideo",
  "src/remotion/ScriptedVideo",
  "src/remotion/SpotlightVideo",
  "src/remotion/RecipeShowcase",
  "src/remotion/recipes/motion",
  "src/remotion/template-component-registry.tsx",
  "Dockerfile.prod",
  "docker-compose.prod.yml",
  "next-env.d.ts",
  "next.config.js",
];
```

It must also require:

- no `next`, AI SDK, Lambda, Player, direct bundler, Next ESLint, `clsx`, or `tailwind-merge` package dependency
- no Web/product/planner package script
- Docker service `producer` and no `web`, `studio`, `render`, or `web-prod` service
- no `ProjectVideo`, template preview, or RecipeShowcase registration in `Root.tsx`
- future Producer audio and standalone runtime import `standalone-video/caption-types`, not `src/lib/caption-schema`
- frozen compatibility files exist and do not import `src/templates`
- `src/remotion/recipes/blocks` exists and no future scaffold/skill routes new work there

- [x] **Step 2: Register the exact npm command**

```json
"smoke:agent-producer-web-removal": "node scripts/agent-producer-web-removal-smoke.mjs"
```

- [x] **Step 3: Run and record RED**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/typescript ] || npm install; npm run smoke:agent-producer-web-removal'
```

Expected: non-zero because `src/app` (the first Phase 3 deletion boundary) still contains tracked files. Record the command, exit code, and assertion text before changing production files.

### Task 2: Extract Future Caption Types And Freeze Compatibility Contracts

**Files:**

- Create: `src/remotion/standalone-video/caption-types.ts`
- Modify: `src/remotion/standalone-video/index.ts`
- Modify: `src/remotion/standalone-video/timeline.ts`
- Modify: `src/remotion/standalone-video/types.ts`
- Modify: `src/remotion/standalone-video/runtime.tsx`
- Modify: `src/remotion/producer-samples/scaffold/SampleName/types.ts`
- Modify: `src/remotion/producer-samples/scaffold/README.md`
- Modify: `scripts/lib/producer-audio/request.ts`
- Modify: `scripts/lib/producer-audio/captions.ts`
- Modify: `scripts/lib/producer-audio/types.ts`
- Modify: `src/lib/storyboard-plan-schema.ts`
- Modify: `src/lib/template-registry.ts`
- Modify: focused smoke source lists in `package.json`

- [x] **Step 1: Define the Producer-owned caption shape**

```ts
export type ProducerCaptionCue = {
  readonly id: string;
  readonly text: string;
  readonly startFrame: number;
  readonly durationInFrames: number;
};

export type ProducerCaptions = {
  readonly language?: string;
  readonly cues: readonly ProducerCaptionCue[];
  readonly style?: {
    readonly preset?: string;
    readonly position?: "bottom" | "center" | "top";
  };
};
```

Export compatibility aliases `SegmentCaptionCue` and `SegmentCaptions` from this new module so retained runtime code changes only its import source.

- [x] **Step 2: Switch only future/shared Producer code**

Update `scripts/lib/producer-audio/**`, `standalone-video/**`, and the future sample scaffold. Do not modify existing finished composition type files that import `src/lib/caption-schema.ts`.

- [x] **Step 3: Collapse the old template registry to frozen ids**

Keep literal ids `scripted`, `spotlight`, `stats-dashboard`, and `technical-explainer`, `registeredTemplateIds`, and `TemplateId`. Remove every import/export of `src/templates`, definitions, manifests, prompts, schemas, and runtime bundles.

- [x] **Step 4: Collapse storyboard validation to frozen metadata**

Keep the current field shapes, duplicate-id/order checks, types, and `storyboardPlanSchema.parse()` behavior used by PixelRAG/WorldCup. Remove planner recipe lookup; `recipeHints` remains historical metadata and is not routed to any runtime.

- [x] **Step 5: Verify the shared boundary**

Run direct audio, standalone runtime, Producer validation, PixelRAG, WorldCup, and focused Phase 3 smokes. Expected: the Phase 3 smoke still fails only on undeleted Web paths; all compatibility/future runtime checks pass.

### Task 3: Delete The Web, Planner, Template, And Web-TTS Closure

**Files:**

- Delete exact directories and files listed under Scope.
- Modify: `src/remotion/Root.tsx`
- Modify: `package.json`

- [x] **Step 1: Reconfirm deletion ownership**

Before deletion run `git status --short`, `git ls-files` for every target directory, and `rg` for importers outside the deletion closure. Expected: only the frozen compatibility imports documented above remain, and none require the Web/product modules being deleted.

- [x] **Step 2: Delete the tracked product directories with apply_patch**

Delete `src/app`, `src/components`, `src/helpers`, `src/templates`, `src/lambda`, `ProjectVideo`, `ScriptedVideo`, `SpotlightVideo`, `RecipeShowcase`, recipe motion, template-component-registry, and the Web-only `src/lib` modules. Do not delete `src/remotion/recipes/blocks`, its `src/remotion/recipes/timing` dependency, `src/lib/caption-schema.ts`, the reduced storyboard/template compatibility files, or any finished composition.

- [x] **Step 3: Delete Web/planner scripts**

Delete:

```txt
scripts/main-site-recipe-abstractions-smoke.mjs
scripts/planner-recipe-manifest-smoke.mjs
scripts/product-ui-asset-binding-smoke.mjs
scripts/product-ui-assets-smoke.mjs
scripts/product-ui-editor-binding-smoke.mjs
scripts/product-ui-upload-client-smoke.mjs
scripts/product-ui-upload-fixtures-smoke.mjs
scripts/provider-boundary-smoke.mjs
scripts/recipe-showcase-preview-smoke.mjs
scripts/recipe-timing-smoke.mjs
scripts/staged-fixtures-smoke.mjs
scripts/staged-live-smoke.mjs
scripts/storyboard-plan-draft-smoke.mjs
scripts/storyboard-recipe-hints-smoke.mjs
scripts/technical-explainer-template-smoke.mjs
scripts/template-implementation-boundary-smoke.mjs
scripts/voxcpm-clone-adapter-smoke.mjs
scripts/voxcpm-tts-next-smoke.sh
scripts/generate-ai-daily-news-20260713-tts.mjs
scripts/generate-git-tutorial-tts.mjs
scripts/generate-hermes-tts.mjs
scripts/generate-raw-thought-tts.mjs
```

Keep direct Producer runtime scripts and frozen composition smokes. Do not convert frozen generators during this phase.

- [x] **Step 4: Remove product registrations**

Delete only the RecipeShowcase, ProjectVideo, and four template preview imports/registrations plus their calculate-metadata helper from `Root.tsx`. Keep the order, props, durations, and registration of every dedicated/frozen composition unchanged.

- [x] **Step 5: Remove obsolete scripts and dependencies**

Remove all corresponding package scripts and direct dependencies. Retain `@remotion/renderer` because `scripts/ensure-remotion-browser.mjs` calls it; retain `@remotion/paths` because the unrelated retained `MyComp` source imports it.

### Task 4: Replace Next Packaging With One Producer Service

**Files:**

- Modify: `Dockerfile`
- Modify: `docker-compose.yml`
- Modify: `docker-compose.voxcpm.yml`
- Modify: `.env.example`
- Modify: `.dockerignore`
- Modify: `tsconfig.json`
- Modify: `eslint.config.mjs`
- Modify: `package.json`
- Update mechanically: `package-lock.json`
- Modify: `scripts/studio.sh`
- Modify: `scripts/producer-voxcpm.sh`
- Modify: `scripts/render-video.sh`
- Delete: `Dockerfile.prod`, `docker-compose.prod.yml`, `deploy.mjs`, `config.mjs`, `next-env.d.ts`, `next.config.js`, `scripts/dev.sh`, `scripts/prod.sh`, `scripts/prod-build.sh`, `scripts/render.sh`

- [x] **Step 1: Make `producer` the only Compose service**

The service mounts the workspace, shared node modules, and `out/`; exposes Remotion Studio; carries only Producer artifact and VoxCPM environment; and defaults to `npm run studio`. Docker-first commands use `docker compose run --rm producer bash -lc ...`.

- [x] **Step 2: Make package commands Remotion-native**

Use:

```json
"build": "remotion bundle src/remotion/index.ts --out-dir=/tmp/ai-video-studio-remotion-bundle",
"studio": "remotion studio src/remotion/index.ts",
"remotion": "remotion studio src/remotion/index.ts",
"render": "remotion render src/remotion/index.ts"
```

Keep Producer validation/stills/audio/review commands and maintained frozen-composition smokes.

- [x] **Step 3: Remove Next-specific TypeScript/ESLint/config**

Use an ES2022/bundler React/Remotion TypeScript configuration without Next plugin or `.next` includes. Keep generated/local artifact exclusions. Remove Next ESLint plugin/config while retaining base TypeScript and Remotion rules.

- [x] **Step 4: Update wrappers**

- `studio.sh` starts `producer`.
- `render-video.sh` runs `producer` and checks `node_modules/remotion`.
- `producer-voxcpm.sh` offers direct `ready` and `run` behavior through the host-network producer override; it must not start or probe Next.

- [x] **Step 5: Regenerate lockfile without adding unrelated upgrades**

Run `npm install --package-lock-only --ignore-scripts`, review the dependency delta, and confirm removed direct dependencies do not remain as root package requirements.

### Task 5: Align Architecture Guards And All Active Documentation

**Files:** all active docs and guards listed under Scope.

- [x] **Step 1: Mark Phase 3 complete in the inventory**

Set `completedPhases` to `[0, 1, 2, 3]`. Require deleted Phase 3 paths to have no tracked files. Reclassify:

- future captions as Producer-owned under `standalone-video`
- `src/lib/caption-schema.ts`, reduced storyboard/template contracts, and `src/remotion/recipes/blocks` plus `src/remotion/recipes/timing` as historical compatibility
- recipe motion/showcase and all Web product paths as completed Phase 3 deletions
- Docker topology as retained Producer-owned `producer` service

- [x] **Step 2: Update architecture and skill smokes**

Remove reads of deleted Phase 2 transitional Web files. Require the focused Phase 3 smoke, Producer service commands, no current `src/templates` guidance, and preserved frozen exceptions.

- [x] **Step 3: Update current authority/status**

README, AGENTS, FINAL_PRODUCT_GOAL, ITERATION_STATUS, and Roadmap must state Phase 3 complete, Web/Next product code removed, Producer Studio/CLI topology active, Phase 4 next, and Phase 4 unstarted.

- [x] **Step 4: Update operational docs/skills**

Replace Docker `web`/`node_modules/next` commands with `producer`/`node_modules/remotion`. Rewrite scripts/remotion/lib AGENTS files. Update component/primitive guidance so no active instruction routes new work through `src/templates` or planner recipes. Keep the visible frozen-compatibility warning for recipe blocks and old storyboard/caption contracts.

- [x] **Step 5: Update provider/handoff facts**

The VoxCPM doc must describe direct Producer container usage and no Next bridge. `ITERATION_STATUS.md` is the current handoff; no separate active handoff document exists.

### Task 6: Focused GREEN, Docker-First Gate, Review, And One Commit

- [x] **Step 1: Run focused GREEN smokes**

```bash
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/typescript ] || npm install; npm run smoke:agent-producer-web-removal && npm run smoke:agent-producer-architecture && npm run smoke:skill-alignment && npm run smoke:producer-audio-direct-voxcpm && npm run smoke:producer-audio-tools && npm run smoke:producer-validation && npm run smoke:producer-review-frames && npm run smoke:standalone-video-runtime'
```

- [x] **Step 2: Verify frozen compatibility consumers**

Run PixelRAG, WorldCup, UvOpenSourceBrief, OpenAI Hardware, affected AI daily/news, and other composition contract smokes whose source imports the retained compatibility modules. Expected: all pass without editing frozen composition files.

- [x] **Step 3: Run Docker-first gates**

```bash
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npx tsc --noEmit --pretty false'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run lint'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run build'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npx remotion compositions src/remotion/index.ts'
```

Record the real repository lint result against the historical baseline. No still is required because retained composition render code is not modified; Root only loses unsupported product preview registrations.

- [x] **Step 4: Run changed-file lint/format and syntax checks**

- ESLint on changed JS/MJS/TS/TSX files only
- Prettier check on all changed supported source/docs/JSON/config files
- `bash -n` on retained changed shell scripts
- `docker compose config --quiet` for base and VoxCPM overlay
- `git diff --check`

- [x] **Step 5: Run forbidden and artifact scans**

Require no active source/config/package occurrence of Web routes, Next, `VideoProject`, `VideoSegment`, planner compiler/registry, selected-template compiler, or deleted services. Exclude archived docs, the active Roadmap's historical phase description, guard negative-test strings, and frozen compatibility modules explicitly documented by the inventory.

Confirm:

```bash
git diff --name-only -- 'src/remotion/*/**'
git ls-files 'public/generated/**' 'out/**' 'voices/**' 'models/**'
git status --short
git diff --stat
git diff
```

Expected: no finished composition file changed; no local/private/generated artifact added; only planned Phase 3 files appear.

- [x] **Step 6: Re-read this plan and Roadmap Phase 3 acceptance**

Check each delete boundary, shared-code extraction, packaging decision, acceptance statement, non-goal, active doc, and stop condition against fresh evidence. Record any historical compatibility exception precisely rather than claiming literal source absence.

- [x] **Step 7: Stage and commit once, without push**

```bash
git add -A
git diff --cached --check
git diff --cached --stat
git commit -m "refactor: remove web video product line"
git status --short --branch
```

## Execution Record

- RED: the original Docker `web` command exited 1 with
  `Phase 3 path must have no tracked files: src/app` and actual count 16.
- Root-cause correction: the first Docker typecheck showed that frozen
  `TimelineProgressBlock` still imports `recipes/timing`; CodeGraph found
  seven frozen composition consumers, so that helper stayed byte-for-byte
  compatible and the plan/inventory were corrected.
- GREEN: all listed focused and frozen-compatibility smokes, Docker typecheck,
  Remotion bundle, 19-composition listing, changed-file ESLint/Prettier,
  shell/Compose checks, forbidden/artifact scans, and `git diff --check`
  passed.
- Whole-repository Docker lint now reports 41 errors and 2 warnings, all outside
  the Phase 3 changed-file set. This is the remaining historical baseline, not
  a clean lint claim.
- An extra, non-required `smoke:producer-sample-manifest` run passed its
  manifest stage and then hit the unchanged promotion-gate mismatch: the old
  enum smoke requires recipe/template promotion while current authority
  forbids it. The owning files are unchanged from HEAD and Phase 4 owns that
  Producer Sample OS migration; `smoke:evidence-lens` passes.
- External orphan containers were observed and intentionally not removed.

## RED Evidence Required For Handoff

- `smoke:agent-producer-web-removal` fails on the old tree because `src/app` is still tracked.
- The failure is an intentional Phase 3 boundary assertion, not a compile error, missing dependency, or relaxed allowlist.

## GREEN Evidence Required For Handoff

- focused Phase 3, architecture, skill, direct VoxCPM, Producer tooling, review, standalone, and affected frozen-composition smokes pass
- Docker typecheck, Remotion bundle build, and composition listing pass
- repository-wide lint is reported truthfully against its current baseline
- changed-file ESLint and Prettier pass
- shell and Compose config checks pass
- forbidden scan and `git diff --check` pass
- no finished composition, frozen provider metadata, private voice/model, generated audio/image/video, `public/generated`, or `out` file changes

## Documentation Completion Boundary

Current docs distinguish:

- supported now: Agent Producer skill, direct VoxCPM, dedicated Remotion compositions, Producer validation/review, one Producer Docker service, Studio/CLI
- deleted in Phase 3: Next/Web UI/routes, VideoProject, planner/template/compiler, product upload, Web TTS/render/progress/Lambda, production Web deployment
- historical only: archived docs, frozen storyboard/caption type names, recipe blocks imported by frozen compositions, historical provider metadata
- next: Phase 4 Agent Producer OS consolidation
- not started: every Phase 4 deliverable

## Commit Boundary And Stop Condition

Create exactly one Phase 3 commit containing the focused guard, shared compatibility extraction, Web product deletion, Producer packaging, dependency cleanup, and active-doc alignment. Stop after commit/status verification. Do not start Phase 4, do not push, and do not remove external orphan containers.
