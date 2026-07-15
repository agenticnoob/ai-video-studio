# Agent Producer Remove F5 Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove every executable F5 generation, fallback, service, adapter, command, configuration, and current provider document while preserving frozen compositions and keeping the still-transitional Web TTS path VoxCPM-only until Phase 3.

**Architecture:** Delete F5-owned runtime trees and entrypoints, then collapse the retained Web TTS provider boundary to the single literal `"voxcpm"`. Strengthen the Agent Producer architecture smoke so completed Phase 2 deletion paths must be absent and F5 environment/config/import patterns cannot return outside explicit historical and negative-test allowlists. Do not remove `/api/tts`, staged generation, Web rendering, or any frozen Remotion composition; those remain Phase 3 or historical boundaries.

**Tech Stack:** TypeScript 5.9, Node.js ESM smoke tests, Zod, Docker Compose, Next.js 16 transitional Web code, Remotion 4, Markdown/JSON authority docs, CodeGraph, Git.

**Implementation status:** Complete and verified on 2026-07-16. The checkboxes
below record the executed Phase 2 steps; Phase 3 remains unstarted.

## Global Constraints

- Execute inline in `/data/projects/labs/ai-video-studio` on `refactor/agent-producer-service`; do not use subagents or create another worktree.
- `ai-video-studio-agent-producer` remains the only supported video-production entrypoint.
- Visual production remains code plus existing assets only; do not add image or video generation.
- VoxCPM is the only provider accepted by retained narration code.
- Preserve every file under `src/remotion/<FinishedComposition>/` and every historical `provider: "f5-tts"` value in frozen `audio.generated.ts` metadata.
- Do not delete ignored `models/f5-tts/`, `voices/f5-tts/`, `voices/clone/`, audio, screenshots, `public/generated/`, or `out/`; tracked source deletion must not recurse through ignored user data.
- Keep `.gitignore` entries for legacy private model/voice paths so local user material does not become visible or committable.
- Do not delete `/api/tts`, staged generation, `VideoProject`, planner/template code, Web UI, progress, render, or Lambda paths; Phase 3 owns them.
- Remove obsolete one-off F5 generation scripts and package commands without modifying the finished compositions they originally produced.
- Historical plans/specs and the active Roadmap may describe F5 for traceability; they are not executable capability. Current provider/handoff docs are deleted.
- Use one final Conventional Commit: `refactor: remove f5 generation support`. Do not push.

## Current Repository Facts

- Branch: `refactor/agent-producer-service`.
- Starting commit: `a59a57f feat: add direct voxcpm producer runtime`.
- Starting worktree: clean.
- Phase 0 and Phase 1 are complete; Phase 2 is the next unchecked Roadmap phase.
- `.codegraph/` exists. CodeGraph shows `src/lib/tts/f5.ts` is reached through `src/lib/tts/synthesis.ts`; `src/lib/tts/config.ts`, `provider-selection.ts`, `request-schema.ts`, and `index.ts` are shared with the retained Web VoxCPM route.
- CodeGraph shows `scripts/lib/producer-audio/providers/f5.ts` has no caller; its only shared dependency is the transitional `ProducerAudioRequestPlan` type.
- The host lacks usable `node_modules`; final type/smoke evidence is Docker-first. Full-repository Docker lint was re-run and remains at the historical 75 errors plus 2 ignored generated warnings, with no changed Phase 2 file in the failure set.

## Scope

### Delete tracked F5-owned paths

- `services/f5-tts/`
- `scripts/f5-tts/`
- `scripts/f5-tts-next-smoke.sh`
- `scripts/f5-tts-real.sh`
- `scripts/f5-tts-smoke.sh`
- `scripts/f5-tts-staged-smoke.mjs`
- `docker-compose.f5.yml`
- `docker-compose.f5.gpu.yml`
- `src/lib/tts/f5.ts`
- `scripts/lib/producer-audio/providers/f5.ts`
- `docs/HANDOFF_F5_TTS_CAPTIONS.md`
- `docs/providers/f5-tts.md`
- `docs/providers/f5-tts-service-plan.md`

### Delete obsolete F5-backed frozen-sample generators, not compositions

- `scripts/generate-ai-concepts-for-beginners.mjs`
- `scripts/generate-ai-daily-news-brief-2026-07-08.mjs`
- `scripts/generate-ai-daily-news-brief-2026-07-09.mjs`
- `scripts/generate-ai-news-strategic-brief-2026-07-09.mjs`
- `scripts/generate-openai-hardware-news-brief.mjs`
- `scripts/generate-pixelrag-chinese-standalone.mjs`
- `scripts/generate-uv-open-source-brief.mjs`
- `scripts/generate-world-cup-betting-analysis.mjs`

### Modify retained runtime, validation, config, and docs

- `scripts/agent-producer-architecture-smoke.mjs`
- `scripts/provider-boundary-smoke.mjs`
- `scripts/staged-live-smoke.mjs`
- `scripts/lib/producer-audio/types.ts`
- `src/lib/tts/config.ts`
- `src/lib/tts/synthesis.ts`
- `package.json`
- `.env.example`
- `docker-compose.yml`
- `docker-compose.prod.yml`
- `tsconfig.json` — exclude the already-ignored `public/generated/` artifact
  boundary if a local artifact makes the official Docker type/build gate scan
  non-source files.
- `scripts/prod.sh`
- `scripts/prod-build.sh`
- `scripts/AGENTS.md`
- frozen-sample smoke files that currently read deleted generator source
- `README.md`, `AGENTS.md`, `docs/FINAL_PRODUCT_GOAL.md`, `docs/ITERATION_STATUS.md`, `docs/AGENT_PRODUCER_ONLY_ROADMAP.md`
- `docs/architecture/agent-producer-only-removal-inventory.json`
- `.agents/skills/ai-video-studio-agent-producer/SKILL.md`
- this plan

## Non-Goals

- No Phase 3 Web route, UI, planner, template, project contract, or render deletion.
- No changes to Remotion composition implementation, registration, duration, visual output, narration metadata, or committed historical audio.
- No conversion of old generators to VoxCPM; future work uses the Producer scaffold instead.
- No new provider abstraction, fallback, compatibility alias, schema widening, or relaxed allowlist.
- No repository-wide lint cleanup and no Remotion dependency upgrade.
- No render or still regeneration because render code does not change.

## Dependency And Call-Chain Evidence

```txt
POST /api/tts and staged generation (Phase 3 retained)
  -> src/lib/tts/index.ts
  -> resolveTtsProvider()
  -> synthesizeSegmentNarration()
  -> current branch: synthesizeF5Speech() | synthesizeVoxcpmSpeech()
  -> Phase 2 target: synthesizeVoxcpmSpeech() only

scripts/lib/producer-audio/providers/f5.ts
  -> no indexed caller
  -> only consumer of transitional ProducerAudioRequestPlan
  -> delete adapter and type together
```

The F5 service overlays, service wrapper, direct/Next/staged F5 smokes, prod wrappers, environment block, and package command are F5-only. `/api/tts`, VoxCPM Web adapter, voice-reference resolver, caption artifacts, staged pipeline, and Web rendering are shared/Phase 3 and stay.

---

### Task 1: Add The Phase 2 Failing Guards

**Files:**

- Modify: `scripts/agent-producer-architecture-smoke.mjs`
- Modify: `scripts/provider-boundary-smoke.mjs`
- Modify: `docs/architecture/agent-producer-only-removal-inventory.json`

**Interfaces:**

- Produces inventory `completedPhases: [0, 1, 2]`.
- Produces an architecture guard that requires Phase 2 `action: "delete"` paths to be absent.
- Produces a provider smoke that accepts only `"voxcpm"` and rejects legacy F5 aliases and env selection.

- [x] **Step 1: Mark Phase 2 complete in the machine contract before deleting code**

Add the exact top-level field:

```json
"completedPhases": [0, 1, 2]
```

Change the path assertion so completed deletion paths must not exist:

```js
const completedPhases = new Set(inventory.completedPhases);
if (entry.pathKind === "path") {
  if (entry.action === "delete" && completedPhases.has(entry.phase)) {
    assert(!existsSync(absolute(entry.path)), `${entry.id} must be removed: ${entry.path}`);
  } else {
    assert(existsSync(absolute(entry.path)), `${entry.id} path must exist: ${entry.path}`);
  }
}
```

Add explicit absent checks for every tracked F5-owned path and source checks that reject `F5_TTS_`, F5 imports, F5 provider literals, and deleted package commands in `.env.example`, compose/prod wrappers, retained TTS runtime, and `package.json`.

- [x] **Step 2: Make the provider-boundary smoke demand singleton VoxCPM**

Replace the explicit F5 clone acceptance test with rejection assertions:

```js
for (const provider of ["f5", "f5-tts", "minimax"]) {
  const result = ttsRequestSchema.safeParse({ ...validTtsRequest, provider });
  if (result.success) fail(`ttsRequestSchema accepted removed provider ${provider}.`);
}

await withEnv({ TTS_PROVIDER: "f5-tts" }, () => {
  try {
    readTtsProviderId();
  } catch (error) {
    if (!String(error).includes("voxcpm")) throw error;
    return;
  }
  fail('readTtsProviderId accepted removed provider "f5-tts".');
});
```

- [x] **Step 3: Run and record RED**

Run in Docker:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/typescript ] || npm install; npm run smoke:agent-producer-architecture'
```

Expected: non-zero because `services/f5-tts` or another Phase 2 deletion path still exists.

Then run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/typescript ] || npm install; npm run smoke:provider-boundary'
```

Expected: non-zero because current `readTtsProviderId()` still accepts `f5-tts`.

### Task 2: Delete F5 Runtime And Collapse Retained TTS To VoxCPM

**Files:**

- Delete: all tracked F5-owned paths and obsolete generators listed in Scope.
- Modify: `scripts/lib/producer-audio/types.ts`
- Modify: `src/lib/tts/config.ts`
- Modify: `src/lib/tts/synthesis.ts`
- Modify: `scripts/staged-live-smoke.mjs`
- Modify: `package.json`
- Modify: six frozen-composition smoke files that read generator source.

**Interfaces:**

- `TtsProviderId` becomes the literal `"voxcpm"`.
- `synthesizeSegmentNarration()` calls only `synthesizeVoxcpmSpeech()`.
- Retained staged-live validation expects VoxCPM; it remains a Phase 3 Web smoke.

- [x] **Step 1: Remove the unused Producer F5 compatibility type**

Delete `ProducerAudioRequestPlan` from `scripts/lib/producer-audio/types.ts` with its Phase 2 comment.

- [x] **Step 2: Collapse shared Web TTS configuration**

Keep this exact public provider surface:

```ts
export const ttsProviderIds = ["voxcpm"] as const;
export type TtsProviderId = (typeof ttsProviderIds)[number];

export const readTtsProviderId = (): TtsProviderId => {
  const rawValue = (
    (process.env.TTS_PROVIDER ?? "").trim() ||
    (process.env.AI_VIDEO_STUDIO_TTS_PROVIDER ?? "").trim()
  ).toLowerCase();
  if (!rawValue || rawValue === "voxcpm" || rawValue === "voxcpm-tts") return "voxcpm";
  throw new TtsConfigError("TTS_PROVIDER must be voxcpm.");
};
```

Remove the F5 config type, constants, reader, imports, and synthesis branch. `synthesizeSegmentNarration()` must retain concurrency limiting and directly return `synthesizeVoxcpmSpeech(request)`.

- [x] **Step 3: Remove F5 entrypoints and old sample generators**

Delete only tracked files with `apply_patch`; do not run recursive filesystem deletion. Remove their npm commands. In old composition smokes, remove only `generatorSource` reads, generator-copy assertions, and deleted generator entries from required-file arrays; keep composition/data/audio/Root assertions unchanged.

- [x] **Step 4: Keep the Phase 3 staged smoke runnable through VoxCPM**

Use `VOXCPM_TTS_BASE_URL` as its TTS prerequisite, send `provider: "voxcpm"`, expect audio provider `"voxcpm"`, and update narration copy accordingly. Do not change its Web route or render behavior.

- [x] **Step 5: Verify GREEN for focused runtime guards**

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/typescript ] || npm install; npm run smoke:agent-producer-architecture && npm run smoke:provider-boundary && npm run smoke:producer-audio-direct-voxcpm && npm run smoke:producer-audio-tools && npm run smoke:producer-validation'
```

Expected: five success messages and exit `0`.

### Task 3: Remove F5 Configuration And Production Topology

**Files:**

- Modify: `.env.example`
- Modify: `docker-compose.yml`
- Modify: `docker-compose.prod.yml`
- Modify: `scripts/prod.sh`
- Modify: `scripts/prod-build.sh`
- Modify: `scripts/AGENTS.md`

- [x] **Step 1: Remove all F5 environment keys and selection guidance**

Delete the F5 host/service/model/reference block and provider-fallback text from `.env.example`. Keep the existing VoxCPM block and Web-only keys unchanged until Phase 3.

- [x] **Step 2: Remove F5 services and environment forwarding**

Remove F5 variables from every retained compose service. Remove the `f5-tts` stub from `docker-compose.prod.yml`. Make `prod.sh` and `prod-build.sh` compose only `docker-compose.yml` plus `docker-compose.prod.yml` and start only `web-prod`.

- [x] **Step 3: Preserve private ignored paths**

Do not edit `.gitignore` entries for `models/f5-tts/` and `voices/f5-tts/`. Confirm ignored user material was not deleted:

```bash
git status --short --ignored | rg 'models/f5-tts|voices/f5-tts' || true
```

### Task 4: Align All Active Authorities And Skill Guidance

**Files:**

- Modify: `.agents/skills/ai-video-studio-agent-producer/SKILL.md`
- Modify: `README.md`
- Modify: `AGENTS.md`
- Modify: `docs/FINAL_PRODUCT_GOAL.md`
- Modify: `docs/ITERATION_STATUS.md`
- Modify: `docs/AGENT_PRODUCER_ONLY_ROADMAP.md`
- Modify: `docs/architecture/agent-producer-only-removal-inventory.json`
- Modify: this plan

- [x] **Step 1: Record the supported and removed boundaries**

Current docs must say Phase 2 is complete, no executable F5 service/adapter/script/config/current provider document remains, and VoxCPM is the only retained narration provider. Historical frozen provider metadata remains truthful. Phase 3 Web product removal is next and has not started.

- [x] **Step 2: Remove stale F5 operational instructions**

The Agent Producer skill, README, AGENTS, and provider links must not point to any deleted F5 command, path, fallback, service, adapter, or documentation. Keep only the frozen-history rule needed to prevent metadata rewriting.

- [x] **Step 3: Mark the Roadmap phase without changing later phases**

Set the Roadmap header to Phase 0–2 complete and add Phase 2 implementation evidence. Do not alter Phase 3+ deliverables or start Phase 3 work.

- [x] **Step 4: Verify doc/skill GREEN**

```bash
npm run smoke:skill-alignment
npm run smoke:agent-producer-architecture
```

Expected: both success messages.

### Task 5: Run The Full Phase 2 Gate, Review, And Commit

- [x] **Step 1: Run focused smokes fresh in Docker**

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/typescript ] || npm install; npm run smoke:agent-producer-architecture && npm run smoke:skill-alignment && npm run smoke:provider-boundary && npm run smoke:producer-audio-direct-voxcpm && npm run smoke:producer-audio-tools && npm run smoke:producer-validation'
```

- [x] **Step 2: Run Docker-first compile/build/composition gates**

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit --pretty false'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run build'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx remotion compositions src/remotion/index.ts'
```

No still render is required because no Remotion render code changes.

- [x] **Step 3: Run changed-file lint, format, and shell/config checks**

Run ESLint on changed `.js/.mjs/.ts/.tsx` files only, Prettier check on all changed supported files, `bash -n scripts/prod.sh scripts/prod-build.sh`, and `docker compose config --quiet` for base plus prod overlays. Do not claim repository-wide lint passes.

- [x] **Step 4: Run forbidden and artifact scans**

```bash
rg -n 'F5_TTS_|createF5ProducerRequestPlan|synthesizeF5Speech|readF5TtsConfig' .env.example docker-compose.yml docker-compose.prod.yml package.json scripts src/lib/tts .agents/skills/ai-video-studio-agent-producer --glob '!scripts/agent-producer-architecture-smoke.mjs' --glob '!scripts/skill-alignment-smoke.mjs' --glob '!scripts/producer-validation-smoke.mjs'
git diff --check
git ls-files 'public/generated/**' 'out/**' 'voices/**' 'models/**'
git diff --name-only -- 'src/remotion/**'
```

Expected: forbidden scan has no matches; whitespace check passes; no generated/private artifact was added; no frozen composition file changed.

- [x] **Step 5: Review plan coverage and stage only Phase 2 files**

Check `git status --short`, `git diff --stat`, full `git diff`, deleted paths, current docs, and the Phase 2 Roadmap acceptance list. Confirm Phase 3 paths still exist.

- [x] **Step 6: Commit once without push**

```bash
git add .agents/skills/ai-video-studio-agent-producer/SKILL.md .env.example AGENTS.md README.md docker-compose.yml docker-compose.prod.yml docs package.json scripts services src/lib/tts tsconfig.json
git diff --cached --check
git diff --cached --stat
git commit -m "refactor: remove f5 generation support"
git status --short --branch
```

## Focused RED Evidence Required For Handoff

- Architecture smoke fails because a Phase 2 deletion path still exists.
- Provider-boundary smoke fails because the old provider reader still accepts the removed provider.

## GREEN Evidence Required For Handoff

- Phase 2 architecture and singleton provider guards pass.
- Direct VoxCPM Producer audio, Producer orchestration, validation, and skill alignment pass.
- Docker typecheck, build, and Remotion composition listing pass.
- Changed-file ESLint/Prettier and shell/config syntax checks pass.
- Phase-specific forbidden scan and `git diff --check` pass.
- No frozen composition or generated/private artifact changes.

## Documentation Alignment Boundary

Align `README.md`, `AGENTS.md`, `FINAL_PRODUCT_GOAL`, `ITERATION_STATUS`, the active Roadmap, removal inventory, Agent Producer skill, `.env.example`, package scripts, compose/prod wrappers, scripts handoff guidance, and this plan. `VISUAL_RECIPE_ROADMAP.md` remains a superseded pointer and requires no content change unless a verification guard proves otherwise.

## Commit Boundary And Stop Condition

The commit contains only Phase 2 F5 removal, VoxCPM-only narrowing needed to keep Phase 3 code compiling, frozen-generator entrypoint removal, guard/test updates, and active-doc alignment. Stop after the commit and status check. Phase 3 is the next bounded slice and must remain unstarted.
