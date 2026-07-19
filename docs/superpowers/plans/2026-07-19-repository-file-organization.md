# Deep Repository Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize tracked repository files and local-only artifacts so the repository exposes one clear Producer-only structure without changing any composition output, public npm command name, frozen source, or render-critical local input.

**Architecture:** Add one incremental repository-layout smoke first, then make three independently green tracked slices: remnants/design documentation, smoke locations, and one-off tool locations. Build an auditable ignored cleanup manifest from the verified repository state, preserve every protected input and selected final deliverable, and delete only entries whose reviewed manifest decision is exactly `delete`.

**Tech Stack:** Node.js ESM smoke scripts, npm scripts, Git, CodeGraph, Remotion 4.0.489, Docker Compose `producer`, FFmpeg/ffprobe, POSIX shell.

## Global Constraints

- Work inline on the current `refactor/agent-producer-service` branch; do not create a subagent or push.
- Preserve all user changes outside this plan. Re-run `git status --short --branch` before each commit and stage only the named paths.
- Use CodeGraph before every dependency-sensitive delete or move decision, then use `rg` for literal and stale-path verification.
- Do not modify or regenerate any frozen composition merely to adopt this layout.
- Keep every existing npm script key exactly unchanged; only command values may change to point at moved files.
- Keep `postcss.config.mjs`, `styles/global.css`, `src/remotion/webpack-override.mjs`, Tailwind/PostCSS dependencies, `@remotion/tailwind-v4`, `public/fixtures/phase5-ui-screenshot.svg`, every dedicated composition directory, and frozen compatibility modules.
- Preserve `voices/`, `.env`, private configuration, `node_modules/`, `.codegraph/`, `.codex/`, `.agents/`, `.claude/`, `.producer-assets/`, `public/assets/library/`, render-critical `public/generated/` roots, the accepted science voice proof, selected final MP4s, final covers, and final metadata.
- Never use `git clean`, never delete all of `out/` or `public/generated/`, and never delete through an unresolved variable, workspace-root recursion, broad deletion glob, or guessed final revision.
- The tracked deletion and both script-move slices follow RED/GREEN TDD. A test must fail for the expected old-layout reason before the corresponding move or deletion.
- Focused checks run before Docker-first checks. Repository-wide lint may retain the documented baseline only if a fresh run proves the same unrelated failures and no changed file appears in the failure set.

---

## File Structure And Exact Ownership Map

### Create

- `scripts/smoke/architecture/repository-layout-smoke.mjs` — incremental tracked-layout, grouped-script, retained-file, and root-pollution guard.
- `docs/superpowers/plans/2026-07-19-repository-file-organization.md` — this executable plan.
- `out/repository-cleanup-2026-07-19.json` — ignored, machine-readable pre-delete inventory and decisions.
- `docs/maintenance/2026-07-19-repository-cleanup.md` — committed cleanup evidence without private values or media contents.

### Delete tracked

- `vercel.json`
- `public/product-ui-upload-smoke.png`
- `src/remotion/MyComp/Main.tsx`
- `src/remotion/MyComp/NextLogo.tsx`
- `src/remotion/MyComp/Rings.tsx`
- `src/remotion/MyComp/TextFade.tsx`
- `types/constants.ts`
- `types/schema.ts`

### Move tracked documentation

- `DESIGN.md` -> `docs/DESIGN_SYSTEM.md`

### Move tracked architecture smokes

- `scripts/agent-producer-architecture-smoke.mjs` -> `scripts/smoke/architecture/agent-producer-architecture-smoke.mjs`
- `scripts/agent-producer-web-removal-smoke.mjs` -> `scripts/smoke/architecture/agent-producer-web-removal-smoke.mjs`
- `scripts/remotion-version-gate-smoke.mjs` -> `scripts/smoke/architecture/remotion-version-gate-smoke.mjs`
- `scripts/skill-alignment-smoke.mjs` -> `scripts/smoke/architecture/skill-alignment-smoke.mjs`

### Move tracked Producer smokes

- `scripts/agent-producer-os-smoke.mjs` -> `scripts/smoke/producer/agent-producer-os-smoke.mjs`
- `scripts/evidence-lens-smoke.mjs` -> `scripts/smoke/producer/evidence-lens-smoke.mjs`
- `scripts/producer-asset-library-smoke.mjs` -> `scripts/smoke/producer/producer-asset-library-smoke.mjs`
- `scripts/producer-assets-smoke.mjs` -> `scripts/smoke/producer/producer-assets-smoke.mjs`
- `scripts/producer-audio-direct-voxcpm-smoke.mjs` -> `scripts/smoke/producer/producer-audio-direct-voxcpm-smoke.mjs`
- `scripts/producer-audio-tools-smoke.mjs` -> `scripts/smoke/producer/producer-audio-tools-smoke.mjs`
- `scripts/producer-final-acceptance-smoke.mjs` -> `scripts/smoke/producer/producer-final-acceptance-smoke.mjs`
- `scripts/producer-media-sound-smoke.mjs` -> `scripts/smoke/producer/producer-media-sound-smoke.mjs`
- `scripts/producer-promotion-gate-smoke.mjs` -> `scripts/smoke/producer/producer-promotion-gate-smoke.mjs`
- `scripts/producer-quality-gates-smoke.mjs` -> `scripts/smoke/producer/producer-quality-gates-smoke.mjs`
- `scripts/producer-review-frames-smoke.mjs` -> `scripts/smoke/producer/producer-review-frames-smoke.mjs`
- `scripts/producer-sample-manifest-smoke.mjs` -> `scripts/smoke/producer/producer-sample-manifest-smoke.mjs`
- `scripts/producer-style-profile-real-compositions-smoke.mjs` -> `scripts/smoke/producer/producer-style-profile-real-compositions-smoke.mjs`
- `scripts/producer-style-profile-sample-contract-smoke.mjs` -> `scripts/smoke/producer/producer-style-profile-sample-contract-smoke.mjs`
- `scripts/producer-style-profiles-smoke.mjs` -> `scripts/smoke/producer/producer-style-profiles-smoke.mjs`
- `scripts/producer-validation-smoke.mjs` -> `scripts/smoke/producer/producer-validation-smoke.mjs`
- `scripts/remotion-capabilities-smoke.mjs` -> `scripts/smoke/producer/remotion-capabilities-smoke.mjs`
- `scripts/standalone-video-runtime-smoke.mjs` -> `scripts/smoke/producer/standalone-video-runtime-smoke.mjs`

### Move tracked composition smokes

- `scripts/ai-concepts-for-beginners-smoke.mjs` -> `scripts/smoke/compositions/ai-concepts-for-beginners-smoke.mjs`
- `scripts/ai-daily-news-brief-2026-07-08-smoke.mjs` -> `scripts/smoke/compositions/ai-daily-news-brief-2026-07-08-smoke.mjs`
- `scripts/ai-daily-news-brief-2026-07-09-smoke.mjs` -> `scripts/smoke/compositions/ai-daily-news-brief-2026-07-09-smoke.mjs`
- `scripts/ai-news-strategic-brief-2026-07-09-smoke.mjs` -> `scripts/smoke/compositions/ai-news-strategic-brief-2026-07-09-smoke.mjs`
- `scripts/openai-hardware-news-brief-smoke.mjs` -> `scripts/smoke/compositions/openai-hardware-news-brief-smoke.mjs`
- `scripts/pixelrag-chinese-standalone-smoke.mjs` -> `scripts/smoke/compositions/pixelrag-chinese-standalone-smoke.mjs`
- `scripts/uv-open-source-brief-smoke.mjs` -> `scripts/smoke/compositions/uv-open-source-brief-smoke.mjs`
- `scripts/world-cup-betting-analysis-smoke.mjs` -> `scripts/smoke/compositions/world-cup-betting-analysis-smoke.mjs`

### Move tracked one-off tools

- `scripts/build-beyond-language-data.mjs` -> `scripts/tools/build-beyond-language-data.mjs`
- `scripts/build-beyond-language-meta.mjs` -> `scripts/tools/build-beyond-language-meta.mjs`
- `scripts/capture-news-screenshots.mjs` -> `scripts/tools/capture-news-screenshots.mjs`
- `scripts/generate-ai-concepts-redefined-tts.mjs` -> `scripts/tools/generate-ai-concepts-redefined-tts.mjs`
- `scripts/generate-ai-daily-news-20260713-tts-clone.mjs` -> `scripts/tools/generate-ai-daily-news-20260713-tts-clone.mjs`
- `scripts/generate-ai-daily-news-20260714-tts-clone.mjs` -> `scripts/tools/generate-ai-daily-news-20260714-tts-clone.mjs`
- `scripts/generate-beyond-language-tts.mjs` -> `scripts/tools/generate-beyond-language-tts.mjs`
- `scripts/generate-raw-thought-tts-v2.mjs` -> `scripts/tools/generate-raw-thought-tts-v2.mjs`

### Keep at `scripts/` root

- `ensure-remotion-browser.mjs`, `studio.sh`, `producer-voxcpm.sh`, and `render-video.sh`.
- `producer-scaffold.mjs`, `producer-assets.mjs`, `preflight-producer-assets.mjs`, and `producer-asset-library.mjs`.
- `validate-producer-sample.mjs`, `render-producer-review-frames.mjs`, `render-producer-sample.mjs`, and `validate-producer-quality.mjs`.
- `scripts/lib/`, `scripts/fixtures/`, and `scripts/AGENTS.md`.

---

### Task 1: Commit This Implementation Plan

**Files:**
- Create: `docs/superpowers/plans/2026-07-19-repository-file-organization.md`

**Interfaces:**
- Consumes: approved design `docs/superpowers/specs/2026-07-19-repository-file-organization-design.md` and current repository truth at `84f8a26`.
- Produces: exact move/deletion map, test order, commit boundaries, cleanup policy, and verification commands for Tasks 2-6.

- [ ] **Step 1: Run plan self-review**

Run:

```bash
rg -n 'T[B]D|T[O]DO|implement la[t]er|fill in detai[l]s|Similar to Tas[k]' docs/superpowers/plans/2026-07-19-repository-file-organization.md
rg -n 'vercel.json|product-ui-upload-smoke.png|src/remotion/MyComp|types/constants.ts|types/schema.ts|docs/DESIGN_SYSTEM.md' docs/superpowers/plans/2026-07-19-repository-file-organization.md
rg -n 'scripts/smoke/(architecture|producer|compositions)|scripts/tools|smoke:repository-layout' docs/superpowers/plans/2026-07-19-repository-file-organization.md
git diff --check
```

Expected: the placeholder scan has no matches; all approved tracked paths, target directories, local cleanup manifest/report, and validation commands are covered; `git diff --check` exits 0.

- [ ] **Step 2: Commit the plan only**

```bash
git add docs/superpowers/plans/2026-07-19-repository-file-organization.md
git diff --cached --check
git diff --cached --name-status
git commit -m "docs: plan deep repository cleanup"
```

Expected: one new plan file and commit message `docs: plan deep repository cleanup`.

---

### Task 2: TDD Tracked Remnants And Design Documentation

**Files:**
- Create: `scripts/smoke/architecture/repository-layout-smoke.mjs`
- Modify: `package.json`, `README.md`, `AGENTS.md`, `scripts/agent-producer-architecture-smoke.mjs`
- Move: `DESIGN.md` -> `docs/DESIGN_SYSTEM.md`
- Delete: the eight tracked files and one tracked directory content listed under “Delete tracked”.

**Interfaces:**
- Consumes: Git tracked-path truth and active navigation documents.
- Produces: npm command `smoke:repository-layout` and a green tracked-layout contract without altering Root registrations or Remotion source outside the unregistered starter directory.

- [ ] **Step 1: Add the first failing layout smoke**

Create an ESM smoke that uses `process.cwd()` as `root`, runs `git ls-files -- <path>`, and asserts:

```js
const removedTrackedPaths = [
  "vercel.json",
  "public/product-ui-upload-smoke.png",
  "src/remotion/MyComp",
  "types/constants.ts",
  "types/schema.ts",
];
const requiredTrackedPaths = [
  "docs/DESIGN_SYSTEM.md",
  "postcss.config.mjs",
  "styles/global.css",
  "src/remotion/webpack-override.mjs",
  "public/fixtures/phase5-ui-screenshot.svg",
];
```

For each removed path, require zero tracked files. For each retained/relocated path, require a tracked file and an existing filesystem path. Require `README.md` and `AGENTS.md` to contain `docs/DESIGN_SYSTEM.md`; require `package.json` to expose `"smoke:repository-layout": "node scripts/smoke/architecture/repository-layout-smoke.mjs"`; require Tailwind, PostCSS, and `@remotion/tailwind-v4` dependencies to remain.

- [ ] **Step 2: Prove RED on the old layout**

```bash
npm run smoke:repository-layout
```

Expected: exit 1 because at least `vercel.json` is still tracked and `docs/DESIGN_SYSTEM.md` does not exist. A syntax/module-resolution failure is not an acceptable RED.

- [ ] **Step 3: Reconfirm deletion blast radius immediately before deletion**

```bash
codegraph explore "Confirm current supported callers for vercel.json, public/product-ui-upload-smoke.png, src/remotion/MyComp, types/constants.ts, and types/schema.ts before deleting them"
rg -n --hidden --glob '!.git/**' --glob '!node_modules/**' --glob '!.codegraph/**' --glob '!docs/archive/**' --glob '!docs/superpowers/**' '(vercel\.json|product-ui-upload-smoke\.png|src/remotion/MyComp|types/constants|types/schema)' .
```

Expected: only `MyComp/Main.tsx` -> `types/constants.ts` internal starter linkage; no supported Root/Producer caller. If a live caller appears, preserve that candidate and stop this deletion slice.

- [ ] **Step 4: Apply the minimal tracked cleanup**

Delete exactly the tracked paths listed above. Relocate `DESIGN.md` byte-for-byte to `docs/DESIGN_SYSTEM.md`. Add `docs/DESIGN_SYSTEM.md` to the active navigation in `README.md` and `AGENTS.md`. Extend the architecture smoke’s active-doc checks to require the new path and its top-level title, without rewriting the design system or touching frozen composition source.

- [ ] **Step 5: Prove GREEN and verify the focused boundary**

```bash
npm run smoke:repository-layout
npm run smoke:agent-producer-architecture
npm run smoke:agent-producer-web-removal
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npx tsc --noEmit --pretty false'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npx remotion compositions src/remotion/index.ts'
git diff --check
```

Expected: layout, architecture, Web-removal, typecheck, and composition discovery exit 0; `MyComp` is absent from the composition list before and after because it was never registered.

- [ ] **Step 6: Commit tracked remnants/design only**

```bash
git add AGENTS.md README.md docs/DESIGN_SYSTEM.md package.json scripts/smoke/architecture/repository-layout-smoke.mjs scripts/agent-producer-architecture-smoke.mjs vercel.json public/product-ui-upload-smoke.png src/remotion/MyComp types/constants.ts types/schema.ts DESIGN.md
git diff --cached --check
git diff --cached --name-status
git commit -m "refactor: remove tracked repository remnants"
```

Expected: the commit contains only the layout smoke/command, active navigation/guard updates, one design document rename, and approved tracked deletions.

---

### Task 3: TDD Move Smoke Scripts By Responsibility

**Files:**
- Modify: `scripts/smoke/architecture/repository-layout-smoke.mjs`, `package.json`, `scripts/AGENTS.md`, `src/remotion/producer-samples/registry.ts`.
- Move: all 30 existing root `*-smoke.mjs` files according to the architecture/producer/compositions maps above.
- Modify moved files only where repo-root, compiled-root, self-path, or direct wrapper references change.
- Modify active docs/skills only when `rg` proves a direct executable old path.

**Interfaces:**
- Consumes: all existing npm smoke keys and the exact pre-move key list captured from `package.json`.
- Produces: unchanged npm keys backed by grouped smoke paths; updated registry `sourceFiles`; no root smoke files.

- [ ] **Step 1: Capture the immutable npm key contract**

```bash
node -e 'const p=require("./package.json"); console.log(Object.keys(p.scripts).sort().join("\n"))' > /tmp/ai-video-studio-npm-script-keys-before.txt
```

Expected: a sorted key list used for byte-for-byte comparison after the move.

- [ ] **Step 2: Extend layout smoke and prove RED**

Extend the smoke with the exact architecture/producer/compositions destination lists from this plan. Assert every destination is tracked, every `scripts/*-smoke.mjs` root path is absent, and `scripts/` root contains no filename ending `-smoke.mjs`. Run:

```bash
npm run smoke:repository-layout
```

Expected: exit 1 naming the first still-root smoke file.

- [ ] **Step 3: Move the 30 smoke files and repair path semantics**

Move the files exactly as mapped. In moved scripts that read repository source via `path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")`, use `process.cwd()` for repository source reads. In composition/runtime smokes that locate compiler output relative to the built script, change the compiler-root ascent from one level to three levels so `/tmp/<build>/scripts/smoke/<group>/<file>.js` resolves to `/tmp/<build>`. Keep environment-provided build roots unchanged.

Update every `package.json` command path, including both TypeScript input paths and compiled JavaScript execution paths. Update self-command assertions in Web-removal/architecture smokes, direct moved-smoke references inside Producer smokes, and the eight frozen registry `sourceFiles` paths. Do not edit frozen `audio.generated.ts` comments that truthfully record the path used when those files were originally generated.

- [ ] **Step 4: Verify references after each move group**

After architecture, Producer, and composition groups respectively, run:

```bash
npm run smoke:repository-layout
rg -n 'scripts/[A-Za-z0-9._-]+-smoke\.mjs' package.json scripts src/remotion/producer-samples .agents README.md AGENTS.md docs --glob '!docs/archive/**' --glob '!docs/superpowers/**'
```

Expected after the final group: all executable paths point under `scripts/smoke/architecture/`, `scripts/smoke/producer/`, or `scripts/smoke/compositions/`; frozen historical generated comments are outside this active reference scan.

- [ ] **Step 5: Prove GREEN with the complete moved-smoke set**

Run the required focused set plus the directly affected contracts:

```bash
npm run smoke:repository-layout
npm run smoke:agent-producer-architecture
npm run smoke:agent-producer-web-removal
npm run smoke:skill-alignment
npm run smoke:producer-os
npm run smoke:producer-assets
npm run smoke:producer-asset-library
npm run smoke:producer-audio-direct-voxcpm
npm run smoke:producer-audio-tools
npm run smoke:remotion-version-gate
npm run smoke:remotion-capabilities
npm run smoke:producer-media-sound
npm run smoke:producer-style-profiles
npm run smoke:producer-style-profile-sample-contract
npm run smoke:producer-style-profile-real-compositions
npm run smoke:producer-quality-gates
npm run smoke:producer-final-acceptance
npm run smoke:producer-validation
npm run smoke:producer-review-frames
npm run smoke:producer-sample-manifest
npm run smoke:producer-promotion-gate
npm run smoke:evidence-lens
npm run smoke:standalone-video-runtime
node -e 'const p=require("./package.json"); console.log(Object.keys(p.scripts).sort().join("\n"))' > /tmp/ai-video-studio-npm-script-keys-after.txt
cmp /tmp/ai-video-studio-npm-script-keys-before.txt /tmp/ai-video-studio-npm-script-keys-after.txt
git diff --check
```

Expected: every command exits 0 and `cmp` proves no npm script key changed.

- [ ] **Step 6: Commit smoke organization**

```bash
git add package.json scripts src/remotion/producer-samples/registry.ts .agents README.md AGENTS.md docs
git diff --cached --check
git diff --cached --name-status
git commit -m "refactor: organize repository smoke scripts"
```

Expected: only smoke moves, their path fixes, package command values, registry paths, and directly affected active docs/skills are committed.

---

### Task 4: TDD Move One-Off Tools

**Files:**
- Modify: `scripts/smoke/architecture/repository-layout-smoke.mjs`, `scripts/AGENTS.md`.
- Move: the eight exact files listed under “Move tracked one-off tools”.
- Modify moved tools: repository-root ascent and generated source-header path strings.

**Interfaces:**
- Consumes: composition-local source/audio paths and ignored output roots.
- Produces: `scripts/tools/` ownership with no root one-off generator/capture/metadata builder and no changed public npm key.

- [ ] **Step 1: Extend layout smoke and prove RED**

Require the eight `scripts/tools/...` destinations, forbid the eight old root paths, and assert the root stable wrapper allowlist remains. Run `npm run smoke:repository-layout`.

Expected: exit 1 because `scripts/build-beyond-language-data.mjs` still exists at root.

- [ ] **Step 2: Move tools and fix their repository roots**

Move the eight files exactly as mapped. Change `path.resolve(import.meta.dirname, "..")` to `path.resolve(import.meta.dirname, "../..")`; change the capture helper’s `join(__dirname, "..", "public", ...)` to `join(__dirname, "../..", "public", ...)`; change future generated header strings from `scripts/<name>` to `scripts/tools/<name>`. Preserve the zero-byte `generate-ai-concepts-redefined-tts.mjs` as a zero-byte historical tool rather than inventing behavior.

- [ ] **Step 3: Prove GREEN and scan all active references**

```bash
npm run smoke:repository-layout
rg -n 'scripts/(build-beyond-language|capture-news-screenshots|generate-ai-concepts-redefined-tts|generate-ai-daily-news-2026071[34]-tts-clone|generate-beyond-language-tts|generate-raw-thought-tts-v2)' scripts src .agents README.md AGENTS.md docs package.json --glob '!docs/archive/**' --glob '!docs/superpowers/**'
node -e 'const p=require("./package.json"); console.log(Object.keys(p.scripts).sort().join("\n"))' > /tmp/ai-video-studio-npm-script-keys-tools.txt
cmp /tmp/ai-video-studio-npm-script-keys-before.txt /tmp/ai-video-studio-npm-script-keys-tools.txt
git diff --check
```

Expected: active executable references use `scripts/tools/`; only immutable frozen generated-source comments may contain historical paths; npm keys remain identical.

- [ ] **Step 4: Commit tool organization**

```bash
git add scripts src .agents README.md AGENTS.md docs package.json
git diff --cached --check
git diff --cached --name-status
git commit -m "refactor: organize repository helper tools"
```

Expected: only the eight tool moves, root fixes, generated-header fixes, layout guard, and direct active documentation references are committed.

---

### Task 5: Inventory, Verify, And Delete Local-Only Artifacts

**Files:**
- Create ignored: `out/repository-cleanup-2026-07-19.json`
- Create tracked: `docs/maintenance/2026-07-19-repository-cleanup.md`
- Delete local-only: only reviewed manifest entries with `decision: "delete"`.

**Interfaces:**
- Consumes: current Root registrations, Producer registry/manifests, `quality.ts` artifact paths, `out/`, `public/generated/`, and protected local directories.
- Produces: complete audited decisions, selected final revisions, exact byte totals, preserved deliverables, and reclaimed-space evidence.

- [ ] **Step 1: Record pre-cleanup sizes and candidate universe**

```bash
du -sb .
for path in out public/generated models services output .next node_modules_root_owned_backup; do [ ! -e "$path" ] || du -sb "$path"; done
find out -mindepth 1 -maxdepth 3 -type f -printf '%p\t%s\n' | sort
find public/generated -mindepth 1 -maxdepth 2 -printf '%y\t%p\n' | sort
find . -maxdepth 1 -type f \( -name 'scripts-tmp-*.mjs' -o -name 'scripts-tmp-*.ts' \) -printf '%p\t%s\n' | sort
```

Expected baseline from initial discovery: repository `4600287841` bytes, `out/` `2398472768`, `models/` `1402816013`, `public/generated/` `644969307`, and `output/` `21146166`; refresh these values in the manifest/report immediately before deletion.

- [ ] **Step 2: Generate the cleanup manifest without deleting anything**

Write `out/repository-cleanup-2026-07-19.json` with top-level fields `generatedAt`, `repositoryRoot`, `beforeSizeInBytes`, `deleteSizeInBytes`, and `entries`. Every entry contains exactly `path`, `classification`, `sizeInBytes`, `decision`, `reason`, and `selectedRevision` (`null` when not a retained video).

The manifest must explicitly preserve protected roots and every source-referenced generated root. It must mark these exact local families for deletion after verification:

- `models/f5-tts/`, `services/f5-tts/`, `.next/`, `next-env.d.ts`, `tsconfig.tsbuildinfo`, `output/`, `node_modules_root_owned_backup/`.
- All 21 root files returned by the exact `scripts-tmp-*.mjs`/`scripts-tmp-*.ts` inventory.
- Removed-product empty shells under `scripts/f5-tts/`, `src/app/`, `src/components/`, `src/helpers/`, `src/lambda/`, `src/lib/deepseek/`, `src/lib/product-assets/`, `src/lib/staged-generation/`, `src/lib/tts/`, `src/remotion/ProjectVideo/`, `src/remotion/RecipeShowcase/`, `src/remotion/SampleName/`, `src/remotion/ScriptedVideo/`, `src/remotion/SpotlightVideo/`, `src/remotion/recipes/motion/`, and `src/templates/` only when each remains empty.
- `out/tts/`, `out/voice-references/`, `out/phase5-verification/`, `out/phase6-version-gate/`, `out/phase6a-capabilities/`, `out/phase6b-capabilities/`, `out/phase8a-style-profiles/`.
- Explicit review/still/diagnostic paths under `out/`, including `review-frames/`, `stills/`, named `*-stills/` directories, root diagnostic/review PNG files, and duplicate cover aliases.
- `public/generated/agent-producer-uv/`, `public/generated/phase1-direct-voxcpm-live-smoke/`, `public/generated/raw-thought/`, and `public/generated/voxcpm-magnetic-male-auditions/`, because active source/skills/docs have no current caller.
- `out/raw-thought-mirror.mp4`, `out/raw-thought-mirror-v3.mp4`, and `out/raw-thought-mirror-v3-fixed.mp4`; select `out/raw-thought-mirror-v2.mp4` because `src/remotion/RawThoughtMirror/AGENTS.md` explicitly names v2 as complete/final.

Preserve all three `out/ai-daily-news-2026-07-12/*.mp4` revisions and record an ambiguity because no current authority selects one. Preserve `out/SuperintelligenceBeyondHumanCognition.mp4` as ambiguous/incomplete evidence because current status says the canonical final path is still outstanding. Do not guess or delete either family.

- [ ] **Step 3: Validate protected generated roots and final audio**

Derive the protected generated-root set from `src/remotion/producer-samples/registry.ts`, every maintained `manifest.ts`, and literal `generated/<slug>/` source references. For each protected root, assert it exists, contains non-empty files, and remains `decision: "preserve"`. Run maintained asset preflight for each maintained composition with a strict asset manifest:

```bash
npm run producer:preflight -- --composition AgentProducerMediaSoundProof
npm run producer:preflight -- --composition TcpHandshakeEditorial
npm run producer:preflight -- --composition TcpHandshakeTerminal
npm run producer:preflight -- --composition DnsResolutionExplainer
npm run producer:preflight -- --composition AiDailyNews20260717
npm run producer:preflight -- --composition SuperintelligenceBeyondHumanCognition
```

Expected: each exits 0. Confirm every narration `audio.generated.ts`/asset manifest path resolves under a preserved `public/generated/` root. If any audio is missing, preserve its related TTS/intermediate candidate and stop only that deletion.

- [ ] **Step 4: Verify retained MP4s and covers before deletion**

Run `ffprobe -v error -show_entries stream=codec_type,codec_name,width,height,r_frame_rate -show_entries format=duration -of json <exact-path>` for every manifest entry classified `final-video` or `ambiguous-video`. Require a decodable video stream and positive duration; maintained finals also require AAC audio. Assert every retained canonical `*-cover-16x9.png` and `*-cover-9x16.png` exists and is non-empty. Record selected revisions and ambiguous sets in both JSON and report.

- [ ] **Step 5: Print and review the exact deletion set**

Use a Node read-only command to parse the manifest, reject entries with missing/extra decision values, reject absolute paths, `..`, protected prefixes, repository root, all of `out`, all of `public/generated`, or any target not contained by `repositoryRoot`, then print each `delete` path and the sum of `sizeInBytes`.

Expected: printed paths exactly match the reviewed JSON; the total equals `deleteSizeInBytes`. No deletion occurs in this step.

- [ ] **Step 6: Delete only manifest-approved exact paths**

Use a Node command that re-runs the Step 5 guards, resolves each reviewed entry independently, verifies its current `lstat` size matches the recorded size (directories by recursive byte sum), and invokes `rmSync(exactAbsolutePath, {recursive: true, force: false})` only for entries whose decision is exactly `delete`. Do not discover additional paths during deletion.

Expected: every delete entry is absent afterward; every preserve entry remains. Ignored deleted artifacts are not recoverable from Git.

- [ ] **Step 7: Write the committed report**

Create `docs/maintenance/2026-07-19-repository-cleanup.md` with: authority/spec, before/after bytes, exact freed bytes, deletion classifications and paths, selected final revisions, retained covers/voices/generated roots, ambiguity records, verification commands/results, unrecoverability warning, and no private values/media content.

- [ ] **Step 8: Commit the cleanup report and closure evidence**

```bash
git add docs/maintenance/2026-07-19-repository-cleanup.md
git diff --cached --check
git diff --cached --name-status
git commit -m "chore: record deep repository cleanup"
```

Expected: the ignored JSON and local deletions remain untracked; only the sanitized maintenance report is committed in this slice.

---

### Task 6: Full Verification And Final Audit

**Files:**
- Modify only if a verification exposes a cleanup-caused stale path in an active non-frozen file; add such a repair to the relevant prior commit family or a focused follow-up commit.

**Interfaces:**
- Consumes: completed tracked layout and retained local artifacts.
- Produces: fresh evidence for every required smoke, Docker gate, stale-path scan, disk delta, secret scan, and final Git state.

- [ ] **Step 1: Run the required focused smoke suite**

```bash
npm run smoke:repository-layout
npm run smoke:agent-producer-architecture
npm run smoke:agent-producer-web-removal
npm run smoke:skill-alignment
npm run smoke:producer-os
npm run smoke:producer-assets
npm run smoke:producer-audio-direct-voxcpm
npm run smoke:producer-audio-tools
npm run smoke:remotion-version-gate
npm run smoke:remotion-capabilities
npm run smoke:producer-media-sound
npm run smoke:producer-style-profiles
npm run smoke:producer-style-profile-sample-contract
npm run smoke:producer-quality-gates
npm run smoke:producer-final-acceptance
```

Expected: all 15 commands exit 0.

- [ ] **Step 2: Run Docker-first complete verification**

```bash
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npx tsc --noEmit --pretty false'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run lint'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run build'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npx remotion compositions src/remotion/index.ts'
```

Expected: typecheck, build, and composition listing exit 0. For lint, report the fresh exact count; do not call it green if the known repository-wide baseline remains.

- [ ] **Step 3: Run stale-path, consistency, and secret/private-artifact scans**

```bash
git diff --check
rg -n --hidden --glob '!.git/**' --glob '!node_modules/**' --glob '!.codegraph/**' --glob '!docs/archive/**' --glob '!docs/superpowers/**' '(scripts/[A-Za-z0-9._-]+-smoke\.mjs|scripts/(build-beyond-language|capture-news-screenshots|generate-ai-concepts-redefined-tts|generate-ai-daily-news-2026071[34]-tts-clone|generate-beyond-language-tts|generate-raw-thought-tts-v2)|vercel\.json|product-ui-upload-smoke\.png|src/remotion/MyComp|types/constants|types/schema|DESIGN\.md)' .
git ls-files voices .env '.env.*' public/generated out .producer-assets models services
git status --short --branch
git log -8 --oneline --decorate
du -sb . out public/generated 2>/dev/null
```

Expected: no active stale executable path; the Git private-artifact scan is empty except intentionally tracked `.env.example` if matched separately; final status is clean; disk totals match the report.

- [ ] **Step 4: Re-read plan/spec coverage and close**

Check every acceptance item in the approved spec and every task checkbox in this plan against fresh commands. Record all commit hashes, actual irreversible deletions, retained final videos/covers/voices/generated roots, conservative ambiguities, lint baseline if present, and final branch status. Do not push.

## Commit Boundaries

1. `docs: plan deep repository cleanup` — plan only.
2. `refactor: remove tracked repository remnants` — layout smoke first RED/GREEN, tracked remnants, design move, active navigation/guard.
3. `refactor: organize repository smoke scripts` — grouped smoke moves and all executable/registry/package references.
4. `refactor: organize repository helper tools` — one-off tool moves and path/header fixes.
5. `chore: record deep repository cleanup` — sanitized manifest summary and local cleanup evidence; no ignored artifact is staged.

## Local Artifact Decision Summary

- **Always preserve:** protected private/config/dependency/tooling roots; all source- or manifest-referenced generated roots; science voice proof; selected final MP4s; canonical final covers; metadata needed by maintained quality gates.
- **Delete only after manifest review:** F5 model/service residue, removed Web/Next/build residue, root temp scripts, removed-product empty shells, TTS/voice-reference intermediates, review/diagnostic/capability evidence, proven duplicate revisions, obsolete auditions, and generated smoke roots with no current caller.
- **Ambiguity policy:** preserve all candidates and set `selectedRevision` to `null` with a concrete reason. Current known ambiguity families are the three AiDaily 2026-07-12 MP4 revisions and the non-canonical incomplete Superintelligence root MP4.
- **Recoverability:** tracked deletes remain recoverable from Git; ignored local deletions are irreversible unless separately backed up.

## Plan Self-Review Result

- Spec coverage: all tracked deletes/preserves, design relocation, three smoke groups, tools group, npm-key stability, sourceFiles/root calculations, cleanup manifest/report, pre-delete safety gates, required focused/Docker checks, stale scan, secret scan, disk delta, commits, and no-push boundary map to explicit tasks.
- Placeholder scan: the plan contains no deferred implementation marker or unspecified path.
- Path consistency: every source path has one exact destination; moved smoke paths use `scripts/smoke/<group>/`; one-off tools use `scripts/tools/`; public Producer wrappers stay in `scripts/`; cleanup JSON/report paths match the approved design.
