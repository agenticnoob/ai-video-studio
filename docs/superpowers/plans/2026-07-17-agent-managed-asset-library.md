# Agent-Managed Reusable Asset Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the approved post-Roadmap v1 Agent-managed reusable SVG/PNG/JPEG/WebP library with deterministic catalog/report generation, Agent-only transactional CLI management, local semantic search, and forward-only Producer manifest validation.

**Architecture:** A focused `scripts/lib/producer-asset-library/` module owns a strict per-item schema, byte/header/SVG security validation, deterministic catalog and self-contained HTML generation, local search, and same-filesystem staged publication with rollback. One compiled Node CLI exposes the eight approved npm commands; existing `ProducerAssetManifest` remains the composition snapshot, while preflight cross-validates only mechanically recognizable future library paths. The browser output is committed read-only HTML with no server, database, upload, mutation, network, embedding, or generation surface.

**Tech Stack:** TypeScript 5.9, Node.js filesystem/crypto, FFmpeg/ffprobe where already available, deterministic JSON/HTML, npm scripts, Docker Compose, CodeGraph, Git.

## Global Constraints

- Execute inline in `/data/projects/labs/ai-video-studio`; do not use subagents, another worktree, or push.
- The approved design `docs/superpowers/specs/2026-07-17-agent-managed-asset-library-design.md` is authoritative for this feature.
- This is one post-Roadmap v1 capability. Do not create Phase 10, reopen Phase 9, or alter the Phase 0-9 completion definition.
- Support only SVG, PNG, JPEG, and WebP. Do not add audio, video, font, Lottie, Rive, glTF, texture, embeddings, generation models, database, API, Next, or Web-video product code.
- Agent is the only management entrypoint; generated `index.html` is local, static, read-only, self-contained, and has no mutation controls or network requests.
- Finished compositions, their manifests/metadata, provider files, audio, video, screenshots, `public/generated/`, `out/`, private voices, and historical compatibility paths remain unchanged.
- `.producer-assets/library-inbox/` is ignored, copied from only, never moved/deleted, and never committed.
- Use `deprecated` rather than physical deletion; no v1 delete command.
- Every production change follows RED -> GREEN -> refactor. Docker owns final type/build/composition truth.
- Stage and commit only this feature; preserve any later unrelated user changes.

## Current Repository Facts

- Branch is `refactor/agent-producer-service`; starting HEAD is `ef0b985`; tracked worktree is clean.
- Phase 0 through Phase 9 and the Roadmap are complete; no later phase exists.
- The approved design exists and explicitly says implementation has not started.
- `public/assets/library/` contains only the composition-first README; standalone records, catalog, report, schema, CLI, and search do not exist.
- Existing `producer-assets` localizes composition supply and `producer:preflight` validates `ProducerAssetManifest`; it does not manage independent reusable items.
- `ProducerAssetManifest` already permits `public/assets/library/` paths and records integrity/media facts, providing the forward-only snapshot boundary.
- Six style-profile IDs are centralized in `src/remotion/styles/profile-ids.ts`.
- Docker typecheck/build/composition listing are expected green; repository lint has a documented historical 39-error/2-warning baseline, so changed files require focused lint/Prettier.

## CodeGraph Dependency Evidence

```text
producer:assets -> localizeProducerAssets() -> ProducerAssetManifest
producer:preflight -> readProducerAssetManifest() -> preflightProducerAssets()
producer:validate -> validateProducerSample() -> assertProducerAssetManifest()
future maintained manifest -> assets.manifestPath -> ProducerAsset[] snapshot
ProducerAsset.localPath public/assets/library/items/<id>/asset.<ext>
  -> new load/validate canonical library item
  -> reject missing/deprecated/path/checksum/size/media drift
profile metadata -> isProducerStyleProfileId()
skill-alignment smoke -> active skill/docs command and workflow tokens
```

CodeGraph showed no current standalone-library caller. The new library module stays beside, rather than inside, composition localization; only `preflightProducerAssets()` gains the recognizable-path cross-check.

## File Map

### Create

- `scripts/lib/producer-asset-library/types.ts` — v1 item/catalog/search/command types.
- `scripts/lib/producer-asset-library/validate.ts` — strict schema, file magic/raster dimensions, SVG security, integrity, layout, duplicate validation.
- `scripts/lib/producer-asset-library/catalog.ts` — deterministic usage derivation, facets, catalog JSON, escaped self-contained HTML.
- `scripts/lib/producer-asset-library/search.ts` — transparent text/filter shortlist logic, deprecated hidden by default.
- `scripts/lib/producer-asset-library/transactions.ts` — staged add/ingest/update/deprecate and atomic publish/rollback.
- `scripts/lib/producer-asset-library/index.ts` — supported exports.
- `scripts/producer-asset-library.mjs` — compiled shared CLI dispatcher.
- `scripts/producer-asset-library-smoke.mjs` — focused RED/GREEN and failure-injection acceptance.
- `public/assets/library/catalog.json`, `public/assets/library/index.html` — committed deterministic empty-state derived views.
- `docs/superpowers/plans/2026-07-17-agent-managed-asset-library.md` — this plan and execution record.

### Modify

- `scripts/lib/producer-assets/preflight.ts`, `scripts/lib/producer-assets/index.ts` — forward-only library reference cross-validation.
- `package.json`, `.gitignore` — eight commands, focused smoke, ignored inbox/staging root.
- `AGENTS.md`, `README.md`, `docs/FINAL_PRODUCT_GOAL.md`, `docs/ITERATION_STATUS.md`, `docs/AGENT_PRODUCER_ONLY_ROADMAP.md`, `docs/PRODUCER_ASSET_CONTRACT.md`, `docs/REMOTION_COMPONENT_LIBRARY.md`, `public/assets/library/README.md`.
- `docs/architecture/agent-producer-only-removal-inventory.json` — record a separate post-Roadmap Producer-owned capability without a phase.
- `.agents/skills/ai-video-studio-agent-producer/SKILL.md` and `.agents/skills/ai-video-studio-agent-producer/remotion-primitives/REMOTION_PRIMITIVES.md` — mandatory search-before-acquire guidance and judgment boundary.
- `scripts/agent-producer-architecture-smoke.mjs`, `scripts/skill-alignment-smoke.mjs`, `scripts/AGENTS.md` — regression ownership.

### Delete

- No files.

## Data And CLI Boundary

`AssetLibraryItem` is version `1`, kebab-case `id`, exact `file`, kind enum, non-empty title/description and semantic arrays, validated style-profile IDs/tags, positive visual dimensions/aspect ratio/colors/transparency, strict source variants, exact SHA-256/size/MIME, and active/deprecated lifecycle. Commands are `add`, `ingest`, `validate`, `list`, `search`, `update`, `deprecate`, and `build`; metadata is supplied through `--metadata <json>`, file input through `--file`, and `build --check` is non-mutating. CLI results shortlist candidates only and never auto-select an asset.

## Static UI Generation

`catalog.json` sorts items by id, derives relative media URLs/orientation/aspect facets and new-contract usage, and omits timestamps. `index.html` embeds the catalog JSON through script-safe escaping, inline CSS/JS, card previews, full-text search, type/tag/profile/role/aspect/status filters, details, and empty state. It has no form mutation, upload, fetch/XHR, or server dependency and works through `file://`.

## Atomicity And Rollback

Mutations stage under `.producer-assets/transactions/<operation-id>/` on the repository filesystem. The runtime validates the staged item and prospective derived bytes before canonical mutation, publishes the item via rename, replaces each derived sibling via temp+rename, and records old bytes. Any injected or real failure restores prior item/catalog/HTML bytes and removes only the transaction-created canonical item/temp files; inbox input remains untouched.

---

### Task 1: Establish Focused RED

**Files:** Create `scripts/producer-asset-library-smoke.mjs`; modify `package.json` only to register `smoke:producer-asset-library`.

**Interfaces:** The initial static guard requires `scripts/lib/producer-asset-library/index.ts`, `producer:library:add`, independent item layout, catalog/report files, and skill search-before-acquire text.

- [x] Write the focused smoke before production files, with the first missing-surface assertion: `assert(existsSync("scripts/lib/producer-asset-library/index.ts"), "Missing standalone Producer asset-library runtime")`.
- [x] Run `npm run smoke:producer-asset-library` and record exit `1` for the missing independent runtime, not syntax/dependency failure.

### Task 2: Implement Strict Schema And Media Security

**Files:** Create `types.ts`, `validate.ts`, `index.ts`; extend the focused smoke.

**Interfaces:** Export `assertAssetLibraryItem(value)`, `inspectAssetLibraryFile(path, kind)`, `validateAssetLibrary(root)`, and `serializeAssetLibraryItem(item)`.

- [x] Add failing runtime cases for four valid formats, missing semantic/source/license fields, unknown profile, dangerous SVG, malformed/type-spoofed raster, invalid layout/path, bad integrity, duplicate id/path/checksum.
- [x] Run focused smoke and confirm the new runtime cases fail because exports are absent.
- [x] Implement strict validation: PNG/JPEG/WebP magic and dimensions, SVG root/dimensions plus rejection of script/foreignObject/event attributes/entities/external resources/dangerous URLs, exact MIME/extension/checksum/size, and directory/file cardinality.
- [x] Re-run focused smoke until these cases pass without weakening assertions.

### Task 3: Deterministic Catalog, Search, And Read-Only Report

**Files:** Create `catalog.ts`, `search.ts`; create empty `catalog.json`/`index.html`; extend smoke.

**Interfaces:** Export `buildAssetLibraryViews({rootDir, check?})`, `createAssetLibraryCatalog(items, usages)`, `renderAssetLibraryHtml(catalog)`, and `searchAssetLibrary(catalog, query)`.

- [x] Add failing checks for empty state, all four preview kinds, deterministic repeat bytes, drift detection, HTML escaping/no-network/no-mutation controls, all required filters, full-text/filter search, and deprecated-hidden default.
- [x] Run and confirm failure on missing catalog/report implementation.
- [x] Implement stable sorting/JSON/newline, usage/facets, script-safe embedded snapshot, inline card/filter/detail UI, and local transparent search.
- [x] Re-run until catalog/search/report acceptance is green.

### Task 4: Transactional Agent Management CLI

**Files:** Create `transactions.ts`, `producer-asset-library.mjs`; modify `package.json`, `.gitignore`; extend smoke.

**Interfaces:** Export `addAssetLibraryItem`, `ingestAssetLibraryItem`, `updateAssetLibraryItem`, `deprecateAssetLibraryItem`; package commands map to the shared dispatcher.

- [x] Add failing cases for add/ingest/update/deprecate/list/search/validate/build, duplicate ID/checksum, no partial item on validation failure, inbox source preservation, and failure-injected rollback after item/catalog publication.
- [x] Confirm focused failure occurs before implementation.
- [x] Implement same-filesystem staged validation, atomic publish, derived replacement, rollback, and concise/JSON CLI output; accept no delete operation.
- [x] Re-run until all transaction and CLI cases pass.

### Task 5: Forward-Only Producer Manifest Integration

**Files:** Modify Producer asset preflight/index; extend focused smoke and `scripts/producer-assets-smoke.mjs` only where necessary.

**Interfaces:** `preflightProducerAssets()` detects exact `public/assets/library/items/<id>/asset.<ext>` paths, loads canonical `asset.json`, requires active status, maps svg/image kind, and compares path/source/integrity/media snapshot facts.

- [x] Add failing future-manifest cases for active success and missing/deprecated/path/checksum/size/media drift failure, plus an unchanged legacy/composition-local acceptance case.
- [x] Run and observe expected integration failures.
- [x] Implement cross-validation without changing `ProducerAssetManifest` shape or backfilling any existing composition.
- [x] Run `smoke:producer-asset-library` and `smoke:producer-assets` green.

### Task 6: Align Active Docs, Skill, And Architecture Guards

**Files:** Modify every active surface listed in File Map; inspect `.env.example` and `docker-compose.yml` and leave unchanged unless a real dependency appears.

- [x] Add failing architecture/skill assertions for the post-Roadmap capability, eight commands, search-before-acquire, judgment-not-selection, standalone admission, read-only UI, and unchanged Roadmap phases.
- [x] Update docs/skill/README/inventory so independent admission replaces composition-first wording; document future manifest snapshot integration and deprecated lifecycle.
- [x] Record that Compose/environment stay unchanged because no service or variable is introduced.
- [x] Run architecture and skill-alignment smokes green.

### Task 7: Docker-First Verification And Bounded Commit

**Files:** All task files; no frozen composition files.

- [x] Run focused smokes: `smoke:producer-asset-library`, `smoke:producer-assets`, `smoke:agent-producer-architecture`, `smoke:skill-alignment`.
- [x] Run Docker `npx tsc --noEmit --pretty false`, `npm run build`, and `npx remotion compositions src/remotion/index.ts`.
- [x] Run focused ESLint on changed JS/TS, Prettier check on all changed supported files, `git diff --check`, JSON parsing, forbidden/generated/private scan, frozen composition zero-diff scan, and staged secret/binary scan.
- [x] Review `git status` and `git diff`; stage only the bounded feature and commit `feat: add agent-managed asset library`; do not push.

## Focused Validation

```bash
npm run smoke:producer-asset-library
npm run smoke:producer-assets
npm run smoke:agent-producer-architecture
npm run smoke:skill-alignment
```

## Docker-First Validation

```bash
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npx tsc --noEmit --pretty false'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run build'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npx remotion compositions src/remotion/index.ts'
```

## Commit And Stop Boundary

One Conventional Commit contains only the v1 runtime/CLI/derived empty views, future manifest cross-validation, focused tests, active docs/skill/guards, and this execution record. Stop after local commit and status verification. Do not push, create a new Roadmap phase, migrate frozen compositions, add a service/dependency/environment variable, or begin v2.

## Plan Self-Review

- Spec coverage: all approved formats, schema semantics, source/license/integrity, deterministic catalog/report, filters/details, inbox, Agent-only management, future manifest validation, rollback, SVG/raster security, docs/skill, verification, commit, and stop boundaries map to tasks.
- Placeholder scan: no deferred implementation, generic error-handling step, delete command, external service, or unspecified test remains.
- Type consistency: item/catalog/search/transaction names and Producer manifest integration are stable across tasks.
- Scope check: one cohesive post-Roadmap v1 subsystem; v2 media kinds and management UI remain excluded.

## Execution Record

- Starting truth: branch `refactor/agent-producer-service`, HEAD `ef0b985`, clean worktree, no user changes to protect.
- RED evidence: the first host `npm run smoke:producer-asset-library` exited 1 on `Missing standalone Producer asset-library runtime`; later Docker sub-REDs caught the missing runtime, an incorrect expected sort order, duplicate-checksum interference in rollback injection, Node Buffer typing, and focused ESLint issues before GREEN.
- GREEN evidence: Docker focused smoke passes valid SVG/PNG/JPEG/WebP add/ingest/validate/catalog/search/report paths; empty state; semantic/license/SVG/raster/duplicate failures; deterministic build/check; deprecated search; update; inbox preservation; rollback; and active/missing/deprecated/path/checksum manifest-reference behavior through real Producer preflight.
- Verification evidence: focused library/assets/architecture/skill smokes, changed-file ESLint/Prettier, Docker typecheck, Remotion build, and composition listing pass. Full Docker lint remains the unchanged historical 39-error/2-warning baseline with no changed file in the failure set. `.env.example` and `docker-compose.yml` remain unchanged because the feature adds no service or environment variable.
