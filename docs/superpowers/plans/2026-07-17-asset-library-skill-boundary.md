# Asset Library Skill Boundary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move reusable-asset admission and maintenance out of the video-production skill into a dedicated `ai-video-studio-asset-library` skill.

**Architecture:** The new skill owns inbox organization, semantic enrichment, visual inspection, add/ingest/validate/list/update/deprecate/build, and per-item reporting. `ai-video-studio-agent-producer` remains the sole video-production entrypoint and retains only library search, creative selection, manifest snapshotting, and preflight consumption.

**Tech Stack:** Repository skills, YAML skill metadata, Node.js smoke scripts, Markdown authority documents.

## Global Constraints

- No runtime asset-library behavior, schema, CLI, catalog, or static UI change.
- No subagents, new Roadmap phase, v2 feature, composition change, or generated/private asset change.
- Use `apply_patch` for repository edits and Docker-first verification.
- Preserve the clean user worktree and create one local Conventional Commit without push.

---

### Task 1: RED skill ownership contract

**Files:**
- Modify: `scripts/producer-asset-library-smoke.mjs`
- Modify: `scripts/skill-alignment-smoke.mjs`

**Interfaces:**
- Produces: static checks requiring `.agents/skills/ai-video-studio-asset-library/`, its UI metadata, complete management workflow, and absence of management operations from the Producer skill.

- [x] Require the dedicated skill and `agents/openai.yaml` to exist with matching names and trigger metadata.
- [x] Require all eight management commands, mixed-folder intake, visual semantic completion, fixed authorization, inbox preservation, and per-item outcomes in the dedicated skill.
- [x] Require Producer to keep `producer:library:search` and `ProducerAssetManifest` while excluding `producer:library:ingest`, `producer:library:add`, update/deprecate/build management, and inbox organization prose.
- [x] Run Docker focused smokes and record failure because the dedicated skill is absent and Producer still owns management.

### Task 2: GREEN dedicated skill and Producer consumer boundary

**Files:**
- Create: `.agents/skills/ai-video-studio-asset-library/SKILL.md`
- Create: `.agents/skills/ai-video-studio-asset-library/agents/openai.yaml`
- Modify: `.agents/skills/ai-video-studio-agent-producer/SKILL.md`
- Test: `scripts/producer-asset-library-smoke.mjs`
- Test: `scripts/skill-alignment-smoke.mjs`

**Interfaces:**
- Produces: `ai-video-studio-asset-library` as the only admission/maintenance workflow.
- Preserves: Agent Producer search, semantic judgment, canonical library reference snapshot, and normal preflight.

- [x] Create a concise trigger-focused skill with the existing management commands and deterministic intake sequence.
- [x] Create UI metadata whose default prompt explicitly invokes `$ai-video-studio-asset-library`.
- [x] Remove management commands and inbox-organization instructions from Producer while keeping its search-and-consume rules.
- [x] Run skill validation plus focused library and alignment smokes until GREEN.

### Task 3: Authority alignment, verification, and commit

**Files:**
- Modify: `AGENTS.md`
- Modify: `README.md`
- Modify: `docs/FINAL_PRODUCT_GOAL.md`
- Modify: `docs/ITERATION_STATUS.md`
- Modify: `docs/PRODUCER_ASSET_CONTRACT.md`
- Modify: `docs/AGENT_PRODUCER_ONLY_ROADMAP.md`
- Modify: `docs/architecture/agent-producer-only-removal-inventory.json`
- Modify: `docs/superpowers/specs/2026-07-17-agent-managed-asset-library-design.md`
- Modify: `docs/superpowers/plans/2026-07-17-asset-library-skill-boundary.md`

**Interfaces:**
- Produces: active documents that distinguish the non-video asset-library entrypoint from the sole video-production entrypoint.

- [x] Point library admission and maintenance to `.agents/skills/ai-video-studio-asset-library/`; keep Producer-only wording scoped to video production.
- [x] Run Docker library, skill-alignment, architecture, Producer-assets, TypeScript, build, and Remotion composition checks.
- [x] Run dedicated skill validation, changed-file ESLint/Prettier, `git diff --check`, frozen-composition scan, and forbidden/generated/private scan.
- [x] Stage only this correction, inspect the staged diff, commit `refactor: separate asset library management skill`, and do not push.

## Stop Conditions

- Stop if the split requires duplicating runtime code or adding a second asset-library implementation.
- Stop if Producer loses the mandatory search-before-acquisition or manifest/preflight consumption rules.
- Stop if any frozen composition or unrelated user change appears in the diff.

## RED Evidence

- `node scripts/producer-asset-library-smoke.mjs` failed with `Missing dedicated asset-library management skill`.
- `npm run smoke:skill-alignment` failed with `.agents/skills/ai-video-studio-asset-library/SKILL.md must exist`.

## Self-Review

- Coverage: skill creation, trigger metadata, ownership RED, Producer consumer boundary, authority docs, validation, frozen boundaries, and commit all map to tasks.
- Scope: documentation/process ownership only; no runtime or v2 behavior is included.
