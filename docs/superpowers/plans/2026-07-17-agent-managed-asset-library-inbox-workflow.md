# Agent-Managed Asset Library Inbox Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make folder-based user asset intake the normal Agent workflow and remove per-asset authorization questions while preserving strict canonical records and atomic publication.

**Architecture:** The Agent recursively interprets mixed inbox batches and owns all semantic enrichment and visual inspection. The deterministic runtime remains single-item and atomic; inbox ingestion alone normalizes an omitted `source` to one repository-approved user-authorization record, while direct add and explicit source variants remain strict.

**Tech Stack:** Node.js, TypeScript, existing Producer asset-library runtime, focused smoke scripts, Markdown skill/contracts.

## Global Constraints

- This is a post-Roadmap v1 usability correction, not a new Roadmap phase or v2.
- No subagents, database, API, browser mutation UI, image generation, new media kinds, or creative auto-selection CLI.
- Inbox originals remain ignored, unmodified, unmoved, undeleted, and uncommitted.
- Existing compositions and manifests remain frozen with zero modification.
- All production edits use `apply_patch`; verification is Docker-first.

---

### Task 1: RED proof for inbox authorization normalization and Agent folder behavior

**Files:**
- Modify: `scripts/producer-asset-library-smoke.mjs`

**Interfaces:**
- Consumes: existing `ingestAssetLibraryItem()` and current Producer skill text.
- Produces: focused assertions requiring source-free inbox ingestion and explicit Agent folder-enrichment instructions.

- [x] Add a runtime case that calls `ingestAssetLibraryItem()` with valid semantic metadata but no `source`, then expects the canonical fixed user-authorization source record and preserved inbox input.
- [x] Add static assertions that the Producer skill requires recursive description-document inventory, visual inspection for missing semantics, no authorization questions, and per-item atomic ingest.
- [x] Run `npm run smoke:producer-asset-library` and record the expected failure caused by missing source/default workflow behavior.

### Task 2: GREEN inbox default without weakening other source validation

**Files:**
- Modify: `scripts/lib/producer-asset-library/types.ts`
- Modify: `scripts/lib/producer-asset-library/transactions.ts`
- Modify: `scripts/lib/producer-asset-library/index.ts`
- Test: `scripts/producer-asset-library-smoke.mjs`

**Interfaces:**
- Produces: exported `userAuthorizedAssetLibrarySource` and ingestion-only metadata normalization before staged validation.
- Preserves: `addAssetLibraryItem()` still rejects missing source; explicitly supplied and URL/Agent-authored source records keep existing validation.

- [x] Define the immutable fixed record with `kind: "user-provided"`, `provider: "user"`, `creator: "user"`, `license: "user-authorized"`, `rightsBasis: "User confirmed authorization for project use"`, and `attributionRequired: false`.
- [x] Apply it only when `ingestAssetLibraryItem()` receives metadata with no own `source` field.
- [x] Keep partial or invalid explicit source objects fail-closed.
- [x] Run the focused smoke and confirm the new runtime assertions pass.

### Task 3: GREEN Agent workflow and active documentation alignment

**Files:**
- Modify: `.agents/skills/ai-video-studio-agent-producer/SKILL.md`
- Modify: `public/assets/library/README.md`
- Modify: `docs/PRODUCER_ASSET_CONTRACT.md`
- Modify: `docs/ITERATION_STATUS.md`
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-07-17-agent-managed-asset-library-design.md`
- Modify: `docs/superpowers/plans/2026-07-17-agent-managed-asset-library-inbox-workflow.md`

**Interfaces:**
- Produces: one natural-language intake contract covering mixed descriptions, many-to-many mapping, image understanding, limited ambiguity questions, fixed authorization, and per-item reporting.

- [x] Teach the Agent to recursively inventory an inbox batch, read all description documents, map many-to-many facts, visually inspect missing semantics, and ask only for unresolved mapping or important creative ambiguity.
- [x] State that authorization is repository-wide, omitted from semantic input, normalized internally, and never re-requested.
- [x] State that image understanding is allowed but image generation remains forbidden.
- [x] Preserve the low-level single-item CLI and atomic rollback boundary; do not add `ingest-folder` creative automation.
- [x] Run focused library, Producer asset, architecture, and skill-alignment smokes.

## RED Evidence

- Docker focused smoke failed with `network-png.source must be an object` when inbox metadata omitted `source`.
- The static skill assertion then failed with `Agent Producer skill is missing inbox workflow: recursively inventory the requested inbox batch` before the workflow guidance was added.

### Task 4: Docker-first verification and bounded commit

**Files:**
- Verify all files changed by Tasks 1-3.

**Interfaces:**
- Produces: fresh verification evidence and one Conventional Commit; no push.

- [x] Run Docker `npm run smoke:producer-asset-library`, `npm run smoke:producer-assets`, `npm run smoke:agent-producer-architecture`, and `npm run smoke:skill-alignment`.
- [x] Run Docker `npx tsc --noEmit --pretty false`, `npm run build`, and `npx remotion compositions src/remotion/index.ts`.
- [x] Run ESLint and Prettier checks for changed source/script files, `git diff --check`, frozen-composition diff scan, and forbidden/generated/private asset scan.
- [x] Confirm active docs and skill match implementation, no unrelated user changes are staged, and no v2 or Roadmap phase was added.
- [x] Commit with `feat: streamline agent asset inbox intake` and do not push.

## Stop Conditions

- Stop if implementing the workflow would require an automatic creative classifier CLI, a new asset kind, or a mutable browser surface.
- Stop if the fixed authorization policy cannot remain limited to inbox ingestion.
- Stop if any frozen composition or pre-existing user change would be overwritten or staged.

## Self-Review

- Coverage: approved folder intake, many-to-many descriptions, Agent visual inspection, fixed authorization default, strict explicit-source validation, atomic per-item publication, docs/skill alignment, frozen boundaries, verification, and commit all map to tasks.
- Scope: one runtime normalization plus Agent workflow guidance; no independent subsystem or v2 feature is included.
- Types: `userAuthorizedAssetLibrarySource` is the single shared record consumed by transactions and tests.
