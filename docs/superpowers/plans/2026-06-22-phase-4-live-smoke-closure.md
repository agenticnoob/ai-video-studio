# Phase 4 Live Smoke Closure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Status:** Executed. The running Next route was reachable, real `F5_TTS_SERVICE_MODE=f5` reached the staged route but failed at synthesis because the current Docker runtime could not see an NVIDIA driver, and contract-smoke provider-backed route validation passed with 4 `technical-explainer` segments, segment-owned audio/captions, bounded planner repair, and compiler success without repair.

**Goal:** Close the remaining Phase 4 validation gap by proving planner recipe selection through the live staged route, then mark the project ready for the next small Phase 5 planning slice.

**Architecture:** Do not change the product model. Keep the existing boundary: `brief -> StoryboardPlan -> narration audio/captions -> selected-template compiler -> VideoProject`. This slice only validates the live route and updates active docs; any code change should be limited to smoke-run ergonomics if the current command path is the only failure.

**Tech Stack:** Docker Compose, Next dev service, DeepSeek staged planner/compiler, F5-TTS provider boundary, existing `scripts/staged-live-smoke.mjs`, Markdown docs, `git diff --check`.

---

## Scope Boundary

Implement:

- provider-backed `POST /api/generate/staged` live smoke from a running Next service
- confirmation that at least one live generated segment uses `technical-explainer`
- confirmation that compiled technical-explainer sections carry registered `recipeId` values
- confirmation that generated narration audio and captions remain segment-owned
- active doc update that Phase 4 is closed or clearly says what still blocks it

Do not implement:

- Phase 5 asset-aware recipe fields
- media library or media-layer editor
- new `VideoProject` recipe fields
- visual-review scoring
- generated TSX execution
- persistence/history
- broad refactor of staged generation

## File Structure

- Read: `docs/ITERATION_STATUS.md`
  - Source of truth for current validation gap.
- Read: `docs/VISUAL_RECIPE_ROADMAP.md`
  - Source of truth for Phase 4 acceptance and Phase 5 boundary.
- Read: `scripts/staged-live-smoke.mjs`
  - Existing live smoke script.
- Modify only if validation succeeds or fails with a stable finding:
  - `docs/ITERATION_STATUS.md`
  - `docs/VISUAL_RECIPE_ROADMAP.md`
  - `README.md`
- Modify only if the current live-smoke command path is the repeated failure:
  - `scripts/staged-live-smoke.mjs`
  - `package.json`

## Task 1: Confirm The Remaining Gap

**Files:**
- Read: `docs/ITERATION_STATUS.md`
- Read: `docs/VISUAL_RECIPE_ROADMAP.md`
- Read: `scripts/staged-live-smoke.mjs`

- [ ] **Step 1: Confirm clean worktree**

Run:

```bash
git status --short --branch
```

Expected: branch is `codex/visual-recipe-roadmap`; no unrelated local edits.

- [ ] **Step 2: Confirm Phase 4 deterministic validation is already green in docs**

Read `docs/ITERATION_STATUS.md`.

Expected: it lists these completed checks:

```txt
npm run smoke:planner-recipe-manifest
npm run smoke:storyboard-recipe-hints
npm run smoke:technical-explainer-template
npm run smoke:staged-fixtures
npx tsc --noEmit
npm run lint
git diff --check
```

- [ ] **Step 3: Confirm the only open Phase 4 validation item**

Read the provider-backed live smoke note in `docs/ITERATION_STATUS.md`.

Expected: the only documented gap is that `npm run smoke:staged-live` did not reach `http://127.0.0.1:3000` because the local Next runtime was not started or not reachable from the smoke execution context.

## Task 2: Run The Live Staged Smoke

**Files:**
- Exercise: `scripts/staged-live-smoke.mjs`
- Exercise: `src/app/api/generate/staged/route.ts`
- Exercise: `src/lib/staged-generation/*`
- Exercise: `src/lib/deepseek/*`
- Exercise: `src/lib/tts/*`

- [ ] **Step 1: Start or refresh the F5 service**

For real local F5 validation on this workstation, run:

```bash
bash scripts/f5-tts-real.sh up
```

Then verify:

```bash
bash scripts/f5-tts-real.sh health
```

Expected: health output is returned from `http://127.0.0.1:7865/health`.

If this fails because the GPU runtime is not available, use the compose F5 contract-smoke path for route integration only:

```bash
HOST_UID="$(id -u)" HOST_GID="$(id -g)" docker compose -f docker-compose.yml -f docker-compose.f5.yml up -d f5-tts
```

Expected: `f5-tts` is running and reachable from the compose network.

- [ ] **Step 2: Start the Next runtime**

Run:

```bash
HOST_UID="$(id -u)" HOST_GID="$(id -g)" docker compose -f docker-compose.yml -f docker-compose.f5.yml up -d web
```

Expected: the long-running `web` service starts the Next dev server on container port `3000`.

- [ ] **Step 3: Verify Next is reachable from inside the running web container**

Run:

```bash
docker compose -f docker-compose.yml -f docker-compose.f5.yml exec -T web bash -lc 'node -e "fetch(\"http://127.0.0.1:3000\").then((r)=>{console.log(r.status); process.exit(r.ok ? 0 : 1)}).catch((e)=>{console.error(e.message); process.exit(1)})"'
```

Expected: prints `200` or another successful app response status.

- [ ] **Step 4: Run the live staged smoke in the same running web container**

Run:

```bash
docker compose -f docker-compose.yml -f docker-compose.f5.yml exec -T web bash -lc 'npm run smoke:staged-live'
```

Expected: the script prints a JSON summary with:

```json
{
  "segmentCount": 1,
  "templateIds": ["technical-explainer"],
  "audioSources": ["/api/tts/assets/..."],
  "captionCueCounts": [1]
}
```

The exact counts may vary, but success requires:

- `diagnostics.narrationProviders` includes `f5-tts`
- at least one segment has `templateId: "technical-explainer"`
- every generated segment has `narration.audio`
- every generated segment has `narration.captions.cues`
- technical-explainer `implementation.sections[]` contain `recipeId`

## Task 3: Fix Only A Repeated Smoke Ergonomics Failure

**Files:**
- Modify only if needed: `scripts/staged-live-smoke.mjs`
- Modify only if needed: `package.json`

- [ ] **Step 1: Decide whether a code change is needed**

If Task 2 passes, skip this task.

If the only failure is still reachability caused by running the smoke from a one-off container where `127.0.0.1:3000` points at the wrong process, add a Docker-first script alias instead of touching generation code.

- [ ] **Step 2: Add a package script if the command path needs to be codified**

In `package.json`, add:

```json
"smoke:staged-live:web": "NEXT_ORIGIN=http://127.0.0.1:3000 npm run smoke:staged-live"
```

This script is intended for `docker compose exec web ...`, not for `docker compose run --rm web ...`.

- [ ] **Step 3: Re-run the smoke through the running web service**

Run:

```bash
docker compose -f docker-compose.yml -f docker-compose.f5.yml exec -T web bash -lc 'npm run smoke:staged-live:web'
```

Expected: same success shape as Task 2 Step 4.

- [ ] **Step 4: Do not change staged generation unless the live smoke exposes a real product bug**

If the smoke reaches `/api/generate/staged` and fails with schema, planner, TTS, caption, or compiler behavior, stop and write the concrete failure into `docs/ITERATION_STATUS.md` before choosing the smallest bugfix. Do not proceed into Phase 5 while that bug is open.

## Task 4: Sync Active Docs

**Files:**
- Modify: `docs/ITERATION_STATUS.md`
- Modify: `docs/VISUAL_RECIPE_ROADMAP.md`
- Modify: `README.md`

- [ ] **Step 1: Update iteration status**

At the top of `docs/ITERATION_STATUS.md`, replace the provider-backed live smoke status with one of these concrete outcomes.

For success:

```markdown
Provider-backed live smoke status:
- `docker compose -f docker-compose.yml -f docker-compose.f5.yml exec -T web bash -lc 'npm run smoke:staged-live'`
  passed after starting the local Next runtime. The live staged route returned
  a normal editable `VideoProject` with segment-owned F5 narration audio,
  caption cues, and technical-explainer recipe sections.
```

For failure:

```markdown
Provider-backed live smoke status:
- `docker compose -f docker-compose.yml -f docker-compose.f5.yml exec -T web bash -lc 'npm run smoke:staged-live'`
  reached `/api/generate/staged` but failed at `<exact stage>`.
- Current blocker: `<one-sentence root cause>`.
- Next action: `<smallest concrete fix>`.
```

- [ ] **Step 2: Update roadmap phase status**

In `docs/VISUAL_RECIPE_ROADMAP.md`, keep Phase 4 as implemented only if the live smoke passes. If it fails after reaching the route, mark Phase 4 as implemented for deterministic coverage but blocked on live-provider closure.

- [ ] **Step 3: Update README only if user-facing status changed**

If live smoke passes, keep the README current visual-quality direction short:

```markdown
- Phase 4 planner recipe selection is validated through deterministic smoke and
  a provider-backed staged live smoke against the running Next route.
```

Do not add a long runbook to README; keep detailed validation commands in the plan and status doc.

## Task 5: Final Verification

**Files:**
- Verify docs and any optional script changes.

- [ ] **Step 1: Run whitespace check**

Run:

```bash
git diff --check
```

Expected: no whitespace errors.

- [ ] **Step 2: Run deterministic smoke only if code changed**

If Task 3 changed `package.json` or `scripts/staged-live-smoke.mjs`, run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:planner-recipe-manifest'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:storyboard-recipe-hints'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit'
```

Expected: all pass.

- [ ] **Step 3: Review final diff**

Run:

```bash
git diff -- docs/ITERATION_STATUS.md docs/VISUAL_RECIPE_ROADMAP.md README.md scripts/staged-live-smoke.mjs package.json
```

Expected: diff only mentions live smoke closure and any minimal command ergonomics. No Phase 5 asset model or generation architecture changes.

- [ ] **Step 4: Commit if the user asks to publish the closure**

Run:

```bash
git add docs/ITERATION_STATUS.md docs/VISUAL_RECIPE_ROADMAP.md README.md package.json scripts/staged-live-smoke.mjs
git commit -m "docs: close planner recipe live smoke"
```

Expected: one focused commit. If no code changed and docs only record a failed live smoke, use:

```bash
git commit -m "docs: record planner recipe live smoke status"
```

## Acceptance

This plan is complete when:

- `npm run smoke:staged-live` has been run from a running Next container or an equivalent reachable Next origin
- the result is recorded in `docs/ITERATION_STATUS.md`
- Phase 4 is either clearly closed or has one exact live-provider blocker
- no Phase 5 asset work has started
- `git diff --check` passes

## Next After This

If live smoke passes, the next bounded plan should be Phase 5 v1: add asset-aware inputs to one recipe only, probably `terminal-build-run` for controlled terminal output or `workflow-node-map` for structured nodes. Keep it template-local and avoid a media library.
