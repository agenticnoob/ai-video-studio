# Iteration Status And Production Artifact Boundary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make active repository authority track capabilities and milestones instead of ordinary video-production delivery state.

**Architecture:** Remove ordinary production records from `docs/ITERATION_STATUS.md`, preserve compositions only where they are explicit milestone acceptance evidence, and state the boundary in the three top-level active authorities that future agents read first. Historical plans, specs, maintenance reports, archives, composition-local files, runtime code, and generated artifacts remain unchanged.

**Tech Stack:** Markdown authority documents, repository architecture smokes, Git scope and secret scans.

## Global Constraints

- `DnsResolutionExplainer` remains Phase 9B acceptance evidence.
- `SuperintelligenceBeyondHumanCognition`, `AiDailyNews20260717`, and `AiDailyNews20260719` are production outputs, not iteration milestones.
- Asset Library v1 and `stock-assets-mcp` remain completed bounded post-Roadmap capabilities.
- Do not change composition source, manifests, generated artifacts, runtime code, dependencies, provider configuration, historical plans/specs/maintenance reports, or archives.
- Commit locally and do not push.

---

### Task 1: Align Active Iteration Authority

**Files:**

- Modify: `docs/ITERATION_STATUS.md`
- Modify: `docs/FINAL_PRODUCT_GOAL.md`
- Modify: `README.md`
- Modify: `AGENTS.md`

**Interfaces:**

- Consumes: the approved boundary in `docs/superpowers/specs/2026-07-20-iteration-status-production-boundary-design.md`.
- Produces: one consistent active-doc rule for capability status versus production delivery status.

- [x] **Step 1: Run the pre-change active-authority scan**

```bash
rg -n 'SuperintelligenceBeyondHumanCognition|AiDailyNews20260717|AiDailyNews20260719' \
  README.md AGENTS.md docs/FINAL_PRODUCT_GOAL.md docs/ITERATION_STATUS.md
```

Expected: the three production names occur only in `docs/ITERATION_STATUS.md`.

- [x] **Step 2: Remove ordinary production sections from iteration status**

Delete the complete `Post-Roadmap` sections for
`SuperintelligenceBeyondHumanCognition`, `AiDailyNews20260717`, and
`AiDailyNews20260719`. Keep the science-explainer voice capability, Asset
Library v1, `stock-assets-mcp`, and every implemented Roadmap boundary.

- [x] **Step 3: Add the active authority rule**

Add concise text to the four files stating:

```text
Iteration authority tracks product capabilities and milestones. Individual
video productions and their render, cover, review, or quality state do not
create or block an iteration unless an approved milestone explicitly names the
composition as acceptance evidence. Use composition-local records for
production delivery status.
```

In `AGENTS.md`, place the rule in `Current Repository Truth` and add a `Where
To Look` row that routes production status to `src/remotion/<CompositionName>/`
rather than `docs/ITERATION_STATUS.md`.

- [x] **Step 4: Run the post-change boundary scan**

```bash
! rg -n 'SuperintelligenceBeyondHumanCognition|AiDailyNews20260717|AiDailyNews20260719' \
  README.md AGENTS.md docs/FINAL_PRODUCT_GOAL.md docs/ITERATION_STATUS.md
rg -n 'DnsResolutionExplainer|stock-assets-mcp|Agent-managed reusable asset library' \
  README.md AGENTS.md docs/FINAL_PRODUCT_GOAL.md docs/ITERATION_STATUS.md
```

Expected: the removed production names have no active-authority matches while
Roadmap and post-Roadmap capability evidence remains present.

### Task 2: Verify Scope And Commit

**Files:**

- Modify: `docs/superpowers/plans/2026-07-20-iteration-status-production-boundary.md`
- Verify only: active docs and repository state.

**Interfaces:**

- Consumes: the aligned active authorities from Task 1.
- Produces: focused smoke, formatting, secret, generated-artifact, and Git evidence for one local documentation commit.

- [x] **Step 1: Run focused Docker-first smokes**

```bash
docker compose run --rm producer bash -lc \
  '[ -d /workspace/node_modules/remotion ] || npm install; npm run smoke:agent-producer-architecture && npm run smoke:skill-alignment && npm run smoke:stock-assets-mcp-alignment'
```

Expected: all three smokes exit `0`.

- [x] **Step 2: Run formatting and scope checks**

```bash
git diff --check
git diff --name-only
git status --short
git diff -- README.md AGENTS.md docs/FINAL_PRODUCT_GOAL.md docs/ITERATION_STATUS.md \
  docs/superpowers/plans/2026-07-20-iteration-status-production-boundary.md
```

Expected: only the five planned implementation files are modified or untracked.

- [x] **Step 3: Run secret and tracked-artifact checks**

```bash
git grep -n -I -E 'PEXELS_API_KEY[[:space:]]*=[[:space:]]*[A-Za-z0-9_-]{20,}|Authorization:[[:space:]]+[A-Za-z0-9_-]{20,}' -- \
  ':!docs/superpowers/specs/**' ':!docs/superpowers/plans/**'
git ls-files '.producer-assets/**' 'public/generated/**' 'out/**' '*.tgz' '.env*'
```

Expected: both commands produce no matches (`git grep` exit `1` means no match).

- [x] **Step 4: Stage, inspect, and commit**

```bash
git add README.md AGENTS.md docs/FINAL_PRODUCT_GOAL.md docs/ITERATION_STATUS.md \
  docs/superpowers/plans/2026-07-20-iteration-status-production-boundary.md
git diff --cached --check
git diff --cached --stat
git diff --cached
git commit -m "docs: separate iteration status from productions"
```

Expected: one local commit containing only the approved active-doc alignment
and its implementation plan. Do not push.
