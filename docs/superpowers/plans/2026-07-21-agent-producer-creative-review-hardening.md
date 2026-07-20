# Agent Producer Creative Review Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the failures observed while producing `AiDaily20260720` into concise, enforceable Agent Producer guidance, aligned active documentation, regression coverage, and one verified source commit.

**Architecture:** Keep creative judgment in the Agent Producer skill and its stage references while using `skill-alignment-smoke.mjs` only to prevent contract drift. Record the production-specific evidence in one design note, keep deterministic CLI fixes in the existing Producer wrappers, and treat the completed Roadmap as historical authority rather than opening a new phase.

**Tech Stack:** Markdown skills/docs, Node.js smoke tests, TypeScript, React/Remotion, Docker `producer`, Git.

---

### Task 1: Record the production lessons

**Files:**
- Create: `docs/superpowers/specs/2026-07-21-agent-producer-creative-review-lessons.md`

- [x] **Step 1:** Document the observed failure classes: repeated scene grammar, style-over-content, insufficient early/late still coverage, weak cover concept, premature long render, CLI/metadata drift, and AAC/container tail mismatch.
- [x] **Step 2:** State the accepted future contract: content-first scene intent, paused-frame comprehension, adjacent-scene diversity, style as a constraint rather than a storyboard, early/mid/late review when motion matters, thumbnail/full-size cover review, benchmark-before-long-render, and an explicit mux-safe visual end hold.
- [x] **Step 3:** Mark `AiDaily20260720` as production evidence only; do not create Phase 10 or change frozen compositions.

### Task 2: Add regression expectations first

**Files:**
- Modify: `scripts/smoke/architecture/skill-alignment-smoke.mjs`

- [x] **Step 1:** Require the Agent Producer references to contain the new content-first storyboard, scene-diversity, visual-review, cover, and render-benchmark phrases.
- [x] **Step 2:** Require the active authority documents to describe the same creative-review contract.
- [x] **Step 3:** Require every TypeScript CLI wrapper that compiles JSON-importing Producer modules to pass `--resolveJsonModule`.
- [x] **Step 4:** Run `npm run smoke:skill-alignment` and confirm RED before implementation.

### Task 3: Harden the Agent Producer skill

**Files:**
- Modify: `.agents/skills/ai-video-studio-agent-producer/SKILL.md`
- Modify: `.agents/skills/ai-video-studio-agent-producer/references/full-video-workflow.md`
- Modify: `.agents/skills/ai-video-studio-agent-producer/references/remotion-composition.md`
- Modify: `.agents/skills/ai-video-studio-agent-producer/references/render-review-quality.md`

- [x] **Step 1:** Add a concise core creative gate to `SKILL.md` without exceeding its 500-word budget.
- [x] **Step 2:** Add a per-beat visual-intent record containing subject, action/change, shot language, meaning, and distinct silhouette before scene implementation.
- [x] **Step 3:** State that a style profile supplies constraints and texture, never a repeated scene template; clarity wins when profile conventions obscure meaning.
- [x] **Step 4:** Require all-scene still inspection plus early/mid/late states where motion changes meaning, before a long final render.
- [x] **Step 5:** Require covers to use a topic-specific focal metaphor, centered safe whitespace, and full-size plus thumbnail review.
- [x] **Step 6:** Require a representative render benchmark before long portrait videos, allow metadata/covers-only handoff when the user owns final export, and preserve mux integrity with an explicit end hold.

### Task 4: Align active repository authority

**Files:**
- Modify: `AGENTS.md`
- Modify: `README.md`
- Modify: `docs/FINAL_PRODUCT_GOAL.md`
- Modify: `docs/ITERATION_STATUS.md`
- Modify: `docs/AGENT_PRODUCER_ONLY_ROADMAP.md`
- Modify: `docs/DESIGN_SYSTEM.md`
- Modify: `src/remotion/AGENTS.md`

- [x] **Step 1:** Add the content-first scene and paused-frame comprehension rule to production guidance.
- [x] **Step 2:** Add the distinct visual grammar and style-not-template boundary.
- [x] **Step 3:** Add complete still-review, cover-review, and long-render benchmark requirements.
- [x] **Step 4:** Record this as bounded post-Roadmap workflow hardening, not a new phase.

### Task 5: Close the maintained composition and CLI fixes

**Files:**
- Modify: `scripts/preflight-producer-assets.mjs`
- Modify: `scripts/render-producer-review-frames.mjs`
- Modify: `scripts/render-producer-sample.mjs`
- Modify: `scripts/validate-producer-quality.mjs`
- Modify: `src/remotion/Root.tsx`
- Modify: `src/remotion/producer-samples/registry.ts`
- Create: `src/remotion/AiDaily20260720/*`

- [x] **Step 1:** Keep `--resolveJsonModule` in all affected TypeScript wrapper builds.
- [x] **Step 2:** Verify the composition, manifests, nine distinct scene visuals, controllable-clone metadata, quality chapter names, centered code-rendered covers, and two-frame visual end hold.
- [x] **Step 3:** Keep generated audio, stills, covers, JSON, and MP4 paths ignored.

### Task 6: Verify and commit

**Files:**
- Verify all files above.

- [x] **Step 1:** Run focused architecture, skill-alignment, Producer OS/assets/audio/style/quality smokes.
- [x] **Step 2:** Run Docker TypeScript, composition listing, validation, preflight, and render dry-run checks.
- [x] **Step 3:** Run `git diff --check`, inspect `git status`, and verify no private/generated artifacts are staged.
- [x] **Step 4:** Stage the bounded source/docs/skill slice and commit with `feat: harden agent producer creative review`.
