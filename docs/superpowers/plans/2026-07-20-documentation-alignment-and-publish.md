# Documentation Alignment and Publish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align every active repository document with the current Agent Producer-only implementation, then create and push one verified documentation release commit.

**Architecture:** Treat `AGENTS.md`, `README.md`, `docs/FINAL_PRODUCT_GOAL.md`, `docs/ITERATION_STATUS.md`, and `docs/AGENT_PRODUCER_ONLY_ROADMAP.md` as the authority stack, and validate their claims against package scripts, Docker topology, Producer source, skills, and focused smoke guards. Keep archived plans, frozen-composition notes, generated artifacts, and private voice files unchanged; update only active documentation or documentation-alignment guards proven stale by the audit.

**Tech Stack:** Markdown, JSON package scripts, Node.js smoke checks, Docker Compose, Git, GitHub CLI

---

### Task 1: Establish the live documentation baseline

**Files:**
- Review: `AGENTS.md`
- Review: `README.md`
- Review: `docs/FINAL_PRODUCT_GOAL.md`
- Review: `docs/ITERATION_STATUS.md`
- Review: `docs/AGENT_PRODUCER_ONLY_ROADMAP.md`
- Review: `package.json`
- Review: `docker-compose.yml`

- [x] **Step 1: Confirm branch, worktree, remote, and publication scope**

Run: `git status --short --branch && git log -5 --oneline --decorate && git remote -v`

Expected: the intended branch is identified, unrelated worktree changes are absent or explicitly excluded, and `origin` is configured.

- [x] **Step 2: Read the authority stack and current runtime surfaces**

Run: `sed -n '1,260p' AGENTS.md && sed -n '1,280p' README.md && sed -n '1,240p' docs/FINAL_PRODUCT_GOAL.md && sed -n '1,540p' docs/ITERATION_STATUS.md && sed -n '1,1360p' docs/AGENT_PRODUCER_ONLY_ROADMAP.md`

Expected: current product, capability, migration, post-Roadmap, and production-status boundaries are available for direct comparison.

### Task 2: Audit all active documentation against repository truth

**Files:**
- Review: `docs/*.md`
- Review: `docs/maintenance/*.md`
- Review: `docs/providers/*.md`
- Review: `packages/stock-assets-mcp/README.md`
- Review: `public/assets/library/README.md`
- Review: `.agents/skills/ai-video-studio-agent-producer/**/*.md`
- Review: `.agents/skills/ai-video-studio-asset-library/**/*.md`
- Review: `scripts/AGENTS.md`
- Review: `src/remotion/AGENTS.md`

- [x] **Step 1: Inventory active versus historical documentation**

Run: `rg --files -g '*.md' -g '!node_modules/**' -g '!.codegraph/**' | sort`

Expected: archived documents, completed execution plans/specs, frozen-composition notes, and current operational documents are distinguishable before edits.

- [x] **Step 2: Scan active documents for removed surfaces and stale paths**

Run: `rg -n 'Next|Web video|F5|/api/tts|Lambda|VideoProject|DESIGN\.md|scripts-tmp|Phase 10|next phase|39 errors|44 errors' AGENTS.md README.md docs packages/stock-assets-mcp/README.md public/assets/library/README.md .agents/skills scripts/AGENTS.md src/remotion/AGENTS.md`

Expected: every match is classified as current prohibition, frozen/history context, or actionable drift; no historical statement is rewritten as current behavior.

- [x] **Step 3: Cross-check commands and paths mechanically**

Run: `npm run smoke:agent-producer-architecture && npm run smoke:skill-alignment && npm run smoke:stock-assets-mcp-alignment && npm run smoke:repository-layout`

Expected: active authority/skill/package/path contracts pass, or failures identify exact documents that need alignment.

### Task 3: Repair only proven documentation drift

**Files:**
- Modify: `.agents/skills/remotion-best-practices/SKILL.md`
- Modify: `AGENTS.md`
- Modify: `docs/FINAL_PRODUCT_GOAL.md`
- Modify: `docs/ITERATION_STATUS.md`
- Modify: `docs/PRODUCER_ASSET_CONTRACT.md`
- Modify: `docs/REMOTION_COMPONENT_LIBRARY.md`
- Modify: `src/remotion/AGENTS.md`
- Modify: `scripts/smoke/architecture/skill-alignment-smoke.mjs`

- [x] **Step 1: Update current-state wording and command/path references**

Apply the smallest edits needed so all active entrypoints agree on the Producer-only runtime, completed Roadmap, post-Roadmap asset library and Pexels-only MCP boundary, science-explainer voice default, production-status ownership, Docker-first verification, and generated/private artifact rules.

- [x] **Step 2: Preserve historical and production-local truth**

Confirm that `docs/archive/`, completed plans/specs, frozen composition notes, and truthful historical provider metadata remain unchanged unless an active document links to a nonexistent path.

- [x] **Step 3: Review the complete documentation diff**

Run: `git diff --check && git diff --stat && git diff -- AGENTS.md README.md docs packages/stock-assets-mcp/README.md public/assets/library/README.md .agents/skills scripts/AGENTS.md src/remotion/AGENTS.md`

Expected: the diff is documentation-scoped, internally consistent, contains no generated artifacts, and has no whitespace errors.

### Task 4: Verify, commit, and push the aligned version

**Files:**
- Stage: only reviewed documentation and any directly related alignment guard

- [x] **Step 1: Run focused alignment checks**

Run: `npm run smoke:agent-producer-architecture && npm run smoke:agent-producer-web-removal && npm run smoke:skill-alignment && npm run smoke:stock-assets-mcp-alignment && npm run smoke:repository-layout`

Expected: all focused checks exit 0.

- [x] **Step 2: Run Docker-first repository verification**

Run: `docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npx tsc --noEmit --pretty false' && docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run build' && docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npx remotion compositions src/remotion/index.ts'`

Expected: typecheck, build, and composition discovery exit 0. Run repository lint separately and record its exact current result without misreporting a historical baseline as clean.

- [x] **Step 3: Prove the staging boundary**

Run: `git status --short && git ls-files --others --exclude-standard && git diff --cached --check`

Expected: only intended documentation/alignment files are staged; generated media, `public/generated/`, `out/`, and private voice inputs are absent.

- [x] **Step 4: Commit and push**

Run: `git commit -m "docs: align repository documentation" && git push -u origin "$(git branch --show-current)"`

Expected: the commit succeeds, the current branch is synchronized to `origin`, and no pull request is opened because the requested scope is commit plus push only.
