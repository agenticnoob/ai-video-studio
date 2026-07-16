# Agent Producer Style-Profile Sample Contract Phase 8B Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Activate the first bounded Phase 8B production boundary by requiring every future `producer:scaffold` invocation to select one validated Producer style profile, while preserving the completed Phase 7 maintained proof and all frozen compositions unchanged.

**Architecture:** Extract the six profile ids into a lightweight canonical module shared by the Phase 8A profile registry and Producer sample manifests. Keep the pre-Phase-8 maintained proof compatible through the existing manifest type, add a stricter `ProfiledMaintainedProducerSampleManifest` for all newly scaffolded samples, and make `producer:scaffold --style-profile <id>` the only supported creation path. This slice changes only the deterministic sample contract and tooling; it does not create, narrate, render, or register either of the two real Phase 8B compositions.

**Tech Stack:** TypeScript 5.9, Node.js ESM, Remotion 4.0.489 type contracts, Docker Compose, CodeGraph, ESLint, Prettier, Git.

## Global Constraints

- `.agents/skills/ai-video-studio-agent-producer/` remains the only supported video-production entrypoint.
- Visual production uses code and existing assets only; no image-generation or video-generation capability is added.
- Existing finished compositions, the completed Phase 7 maintained proof, historical provider metadata, and frozen compatibility modules remain read-only.
- Generated audio, video, screenshots, `public/generated/`, `out/`, and private voice/model files remain untracked local artifacts.
- Phase 8B and Phase 8 must remain incomplete until two new real dedicated compositions pass narration, preflight, validation, still/cover review, MP4, and ffprobe gates.
- Phase 9 remains unstarted.
- Do not push.

---

## Current Repository Facts

- Starting branch: `refactor/agent-producer-service`.
- Starting commit: `7204733 feat: add producer style profile foundation`.
- Starting tracked worktree is clean; no tracked user changes require protection.
- Phase 0 through Phase 7 and Phase 8A are complete. Phase 8B is next and has not started.
- Phase 8A defines six ids in `src/remotion/styles/profiles.ts`, but `MaintainedProducerSampleManifest`, its scaffold template, and `producer:scaffold` do not select a profile.
- CodeGraph shows `producer:scaffold` copies `src/remotion/producer-samples/scaffold/SampleName/`, while `assertProducerSampleManifest()` and `validateProducerSample()` own maintained contract validation.
- The only maintained registry record is `AgentProducerMediaSoundProof`, completed in Phase 7. It must remain source-identical and valid without a profile field.
- The future scaffold is the supported creation boundary, so a required CLI flag plus a stricter generated-manifest type provides a forward-only contract without a composition-id allowlist or a retrofit.
- Focused Docker baseline passes for style profiles, Producer OS, Producer validation, architecture, and skill alignment.
- Repository-wide Docker lint has the documented historical baseline of 39 errors and 2 warnings; changed files must be clean.
- `docs/VISUAL_RECIPE_ROADMAP.md` is a superseded compatibility pointer, not active authority.

## Explicit Scope

### Create

- `src/remotion/styles/profile-ids.ts` — canonical six-id list, type, and runtime id guard with no TSX dependency.
- `scripts/producer-style-profile-sample-contract-smoke.mjs` — focused Phase 8B contract/scaffold/docs RED/GREEN guard.
- this plan — implementation steps plus RED/GREEN and closure evidence.

### Modify

- `src/remotion/styles/profiles.ts`, `src/remotion/styles/index.ts` — consume and re-export the canonical id contract without changing any profile record.
- `src/remotion/producer-samples/manifest.ts` — add optional compatibility field to the broad maintained type, strict profiled subtype, and validation for any declared id.
- `src/remotion/producer-samples/scaffold/SampleName/manifest.ts` — declare a tokenized `styleProfileId` and satisfy the strict profiled subtype.
- `scripts/producer-scaffold.mjs` — require and validate `--style-profile <id>`, then replace `STYLE_PROFILE_ID`.
- `src/remotion/producer-samples/scaffold/README.md` — document profile selection before scene implementation.
- `scripts/producer-style-profiles-smoke.mjs` — read ids from the canonical module after extraction.
- `scripts/agent-producer-os-smoke.mjs`, `scripts/producer-sample-manifest-smoke.mjs`, `scripts/producer-validation-smoke.mjs` — prove new scaffolds require valid profile selection while the Phase 7 proof remains unchanged.
- `scripts/agent-producer-architecture-smoke.mjs`, `scripts/skill-alignment-smoke.mjs`, `package.json` — expose and guard the focused Phase 8B contract command.
- `AGENTS.md`, `README.md`, `docs/FINAL_PRODUCT_GOAL.md`, `docs/ITERATION_STATUS.md`, `docs/AGENT_PRODUCER_ONLY_ROADMAP.md`, `docs/REMOTION_COMPONENT_LIBRARY.md`, `docs/PRODUCER_PROMOTION_GATE.md`, `docs/architecture/agent-producer-only-removal-inventory.json`.
- `.agents/skills/ai-video-studio-agent-producer/SKILL.md`, `.agents/skills/remotion-best-practices/SKILL.md`, `scripts/AGENTS.md`, `src/remotion/AGENTS.md`.

### No deletions

This slice deletes no source, composition, provider, compatibility, ignored, private, or generated path.

## Explicit Non-Goals

- no real Phase 8B topic selection, research, narration, asset localization, dedicated composition, registry entry, Root registration, review still, cover, MP4, ffprobe, or publishing artifact
- no claim that Phase 8B, Phase 8, or any individual profile has completed real-production proof
- no Phase 9 hard-failure gates or final acceptance video
- no profile-driven scene builder, template, recipe, planner schema, universal scene DSL, or arbitrary TSX generator
- no image-generation, video-generation, ComfyUI, remote runtime media, or provider fallback
- no edit, formatting pass, migration, registration change, or regeneration of `src/remotion/AgentProducerMediaSoundProof/` or any frozen composition
- no provider, asset schema, environment, Compose, dependency-version, or repository-wide lint cleanup
- no committed binary/generated/private artifact
- no push

## Frozen And Artifact Boundary

- `src/remotion/AgentProducerMediaSoundProof/manifest.ts` remains byte-for-byte unchanged and demonstrates compatibility for the sole pre-profile maintained proof.
- Every `frozen-reference` registry object, finished composition, `audio.generated.ts`, `src/remotion/recipes/{blocks,timing}`, and historical storyboard contract remains unchanged.
- New smoke scaffolds use temporary directories only and remove them after each check.
- No ignored user file is read, deleted, normalized, regenerated, staged, or committed.

## Dependency And Call-Chain Evidence

```txt
Agent Producer judgment
  -> producer:scaffold --style-profile <ProducerStyleProfileId>
  -> producer-scaffold.mjs validates canonical six-id boundary
  -> tokenized SampleName/manifest.ts
  -> ProfiledMaintainedProducerSampleManifest
  -> assertProducerSampleManifest()
  -> producer:validate / producer:stills / producer:render

profile-ids.ts
  -> profiles.ts (Phase 8A registry)
  -> producer-samples/manifest.ts (future sample contract)
  -> focused compiled-runtime smoke

AgentProducerMediaSoundProof manifest without styleProfileId
  -> existing MaintainedProducerSampleManifest compatibility branch
  -> unchanged Phase 7 registry and validation behavior
```

CodeGraph identifies `scripts/producer-scaffold.mjs` as the token-replacement entrypoint, the scaffold manifest as its generated contract, and `assertProducerSampleManifest()` as the validation boundary. There is no current real-production style-profile caller to migrate.

---

### Task 1: Add And Observe The Phase 8B Contract RED

**Files:** create `scripts/producer-style-profile-sample-contract-smoke.mjs`; modify `package.json`.

**Interfaces:**

- Consumes: current Phase 8A ids and current Producer sample/scaffold sources.
- Produces: `npm run smoke:producer-style-profile-sample-contract` as the focused RED/GREEN command.

- [x] **Step 1: Add the static and compiled-runtime guard before production code**

The first static assertion requires the absent canonical module:

```js
for (const relativePath of [
  "src/remotion/styles/profile-ids.ts",
  "src/remotion/producer-samples/scaffold/SampleName/manifest.ts",
]) {
  assert(existsSync(path.join(root, relativePath)), `Missing Phase 8B contract surface: ${relativePath}`);
}
```

The guard must also require `--style-profile`, `ProfiledMaintainedProducerSampleManifest`, `styleProfileId`, the exact six ids, a completed `style-profile-sample-contract` inventory slice, and active docs that say real-composition proof is still unstarted.

When `PRODUCER_STYLE_PROFILE_SAMPLE_CONTRACT_BUILD_DIR` is present, import the compiled id and manifest modules, prove all six ids validate, reject `unknown-profile`, accept a profiled maintained fixture, reject its invalid id, and accept an otherwise identical legacy maintained fixture without `styleProfileId`.

- [x] **Step 2: Add the package command**

Use one static pass, compile only the lightweight id/manifest/scaffold boundary, then run the compiled stage:

```json
"smoke:producer-style-profile-sample-contract": "node scripts/producer-style-profile-sample-contract-smoke.mjs && rm -rf /tmp/producer-style-profile-sample-contract-build && npx tsc --target es2022 --module commonjs --moduleResolution node --skipLibCheck --esModuleInterop --noEmit false --rootDir . --outDir /tmp/producer-style-profile-sample-contract-build src/remotion/styles/profile-ids.ts src/remotion/producer-samples/manifest.ts src/remotion/producer-samples/scaffold/SampleName/manifest.ts && NODE_PATH=/workspace/node_modules:node_modules PRODUCER_STYLE_PROFILE_SAMPLE_CONTRACT_BUILD_DIR=/tmp/producer-style-profile-sample-contract-build node scripts/producer-style-profile-sample-contract-smoke.mjs"
```

- [x] **Step 3: Run Docker RED**

Run:

```bash
docker compose run --rm producer bash -lc 'npm run smoke:producer-style-profile-sample-contract'
```

Expected: exit `1` with `Missing Phase 8B contract surface: src/remotion/styles/profile-ids.ts`, not a Docker, syntax, dependency, or historical baseline failure.

### Task 2: Implement The Forward-Only Profiled Sample Contract

**Files:** create `src/remotion/styles/profile-ids.ts`; modify profile and sample manifest modules.

**Interfaces:**

- Produces: `producerStyleProfileIds`, `ProducerStyleProfileId`, `isProducerStyleProfileId(value)`.
- Produces: `ProfiledMaintainedProducerSampleManifest` with required `styleProfileId`.
- Preserves: `MaintainedProducerSampleManifest` compatibility for the unchanged Phase 7 proof.

- [x] **Step 1: Extract the canonical lightweight id boundary**

Create:

```ts
export const producerStyleProfileIds = [
  "editorial-tech",
  "comic-anime",
  "cinematic-3d",
  "retro-terminal",
  "documentary-media",
  "hand-drawn-explainer",
] as const;

export type ProducerStyleProfileId = (typeof producerStyleProfileIds)[number];

export const isProducerStyleProfileId = (value: string): value is ProducerStyleProfileId =>
  (producerStyleProfileIds as readonly string[]).includes(value);
```

Import/re-export this boundary from `profiles.ts` and `styles/index.ts`. Do not change profile records or resolver behavior.

- [x] **Step 2: Add compatible and strict maintained types**

Add `readonly styleProfileId?: ProducerStyleProfileId` to the existing maintained contract, then export:

```ts
export type ProfiledMaintainedProducerSampleManifest = MaintainedProducerSampleManifest & {
  readonly styleProfileId: ProducerStyleProfileId;
};
```

When a maintained manifest declares the field, `assertProducerSampleManifest()` must reject any value for which `isProducerStyleProfileId()` is false. Absence remains accepted only for pre-profile maintained source compatibility; supported future creation is enforced by the strict scaffold subtype and CLI.

- [x] **Step 3: Keep the Phase 7 proof source untouched**

Do not edit `src/remotion/AgentProducerMediaSoundProof/manifest.ts`. The focused smoke and existing Producer OS/sample-manifest smokes must explicitly prove it remains the sole maintained pre-profile record and still validates.

### Task 3: Require Profile Selection In Every Future Scaffold

**Files:** scaffold CLI/template/README and existing sample/validation smokes.

**Interfaces:**

- Consumes: `--style-profile <ProducerStyleProfileId>`.
- Produces: generated `styleProfileId: "<id>"` and strict profiled manifest typing.

- [x] **Step 1: Make the CLI flag mandatory and exact**

Add the six ids to `scripts/producer-scaffold.mjs`, require `--style-profile`, and reject unsupported values:

```js
const styleProfileId = valueFor("--style-profile");
const styleProfileIds = [
  "editorial-tech",
  "comic-anime",
  "cinematic-3d",
  "retro-terminal",
  "documentary-media",
  "hand-drawn-explainer",
];
if (!name || !slug || !styleProfileId) {
  throw new Error("Usage: npm run producer:scaffold -- --name <PascalCase> --slug <kebab-case> --style-profile <profile-id> [--output-root <path>]");
}
if (!styleProfileIds.includes(styleProfileId)) {
  throw new Error(`--style-profile must be one of: ${styleProfileIds.join(", ")}.`);
}
```

Replace `STYLE_PROFILE_ID` during tokenization.

- [x] **Step 2: Make the scaffold compile against the strict subtype**

The template must contain a compile-valid sentinel that the required CLI flag always replaces:

```ts
import type { ProfiledMaintainedProducerSampleManifest } from "../../manifest";

styleProfileId: "editorial-tech" /* STYLE_PROFILE_ID */,

} as const satisfies ProfiledMaintainedProducerSampleManifest;
```

The CLI has no default profile. Replace the full sentinel expression with the selected literal so generated files contain neither the sentinel comment nor a cast; the Agent Producer must choose one before scaffold creation.

- [x] **Step 3: Extend existing RED/GREEN coverage**

`agent-producer-os-smoke.mjs` must invoke the scaffold with `--style-profile retro-terminal`, assert the generated field, and assert the template field is `editorial-tech`. `producer-validation-smoke.mjs` must use a valid future `styleProfileId` and reject an invalid one. `producer-sample-manifest-smoke.mjs` must require the documented flag and assert the unchanged Phase 7 proof has no retrofitted field.

- [x] **Step 4: Document the supported command**

Update scaffold README and command examples to:

```bash
npm run producer:scaffold -- --name <CompositionName> --slug <slug> --style-profile <profile-id>
```

State that profile selection is Agent Producer judgment made before scene implementation and does not generate scene structure.

### Task 4: Turn RED Into GREEN And Align Authorities

**Files:** focused/architecture/skill guards, active docs, skills, and inventory.

- [x] **Step 1: Run focused GREEN and retained contract checks**

Run in Docker:

```bash
npm run smoke:producer-style-profile-sample-contract
npm run smoke:producer-style-profiles
npm run smoke:producer-os
npm run smoke:producer-sample-manifest
npm run smoke:producer-validation
```

All must pass. The new command must prove invalid/missing scaffold profile failure plus legacy maintained compatibility.

- [x] **Step 2: Record the bounded Phase 8B state**

Add `style-profile-sample-contract` to `completedPhaseSlices`, but keep `8` out of `completedPhases`. Active authorities must say:

- Phase 8B contract activation is complete.
- The two-real-composition proof is next and has not started.
- Phase 8B and Phase 8 remain in progress/incomplete.
- Phase 9 has not started.

- [x] **Step 3: Route the new command through both skills**

The Agent Producer skill must require profile selection before scaffolding and list the focused smoke. The Remotion skill must state that new maintained compositions declare a profile id but still own their topic-specific scene design. Architecture and skill-alignment smokes must guard these statements.

- [x] **Step 4: Keep unrelated active surfaces unchanged**

Verify `docs/VISUAL_RECIPE_ROADMAP.md`, `docs/providers/voxcpm.md`, `docs/PRODUCER_ASSET_CONTRACT.md`, `.env.example`, `docker-compose.yml`, package dependencies, and archived handoffs have no direct factual conflict. Do not edit them when no conflict exists.

### Task 5: Docker-First Closure, Review, And One Commit

- [x] **Step 1: Run the focused and retained-boundary suite**

Run Docker smokes for the new contract, Phase 8A profiles, Producer OS, sample manifest, validation, review frames, assets, media/sound, architecture, and skill alignment.

- [x] **Step 2: Run full Docker gates**

Run Docker typecheck, repository lint, build, and Remotion composition listing. Typecheck/build/listing must pass. Record repository lint honestly against the historical 39-error/2-warning baseline and prove no changed file appears in the failure set.

- [x] **Step 3: Run changed-file and boundary checks**

Run changed-file ESLint, Prettier, JSON parsing, Compose config, `git diff --check`, forbidden visual-generation/Web/F5 scans, frozen-composition diff scan, generated/private artifact scan, and staged secret/binary scan.

- [x] **Step 4: Review and create one bounded commit**

Stage only the Phase 8B sample-contract code, smokes, docs/skills, inventory, and this execution record. Create:

```bash
git commit -m "feat: require producer style profile selection"
```

Record hash and final status. Do not push or begin either real Phase 8B composition.

## RED Check

The first Docker `smoke:producer-style-profile-sample-contract` must fail against `7204733` because `src/remotion/styles/profile-ids.ts` is absent. Missing/invalid CLI profile sub-REDs must also be observed before the CLI becomes GREEN.

## GREEN Result Required

- one canonical six-id module shared by Phase 8A profiles and the Producer sample contract
- one strict profiled maintained subtype for all new scaffolds
- mandatory exact `--style-profile` CLI selection with no default
- generated scaffold manifest containing the selected id
- invalid id rejection and unchanged Phase 7 maintained-proof compatibility
- focused Docker guard plus retained Producer contract checks
- authority state: Phase 8B contract complete, two real compositions next/unstarted, Phase 8 and Phase 9 incomplete/unstarted
- no real composition, frozen source, provider/config, dependency, binary, generated, private, or ignored artifact change

## Focused Validation

Primary RED/GREEN command: `npm run smoke:producer-style-profile-sample-contract`. Supporting checks: `smoke:producer-style-profiles`, `smoke:producer-os`, `smoke:producer-sample-manifest`, `smoke:producer-validation`, `smoke:producer-review-frames`, `smoke:producer-assets`, `smoke:producer-media-sound`, `smoke:agent-producer-architecture`, and `smoke:skill-alignment`.

## Docker-First Validation

Docker owns dependencies, TypeScript, build, composition listing, focused compiled-runtime checks, and whole-repository lint evidence. Host Git/source checks may support review but are not final type/build proof.

## Documentation Alignment Boundary

Align `AGENTS.md`, `README.md`, `docs/FINAL_PRODUCT_GOAL.md`, `docs/ITERATION_STATUS.md`, `docs/AGENT_PRODUCER_ONLY_ROADMAP.md`, `docs/REMOTION_COMPONENT_LIBRARY.md`, `docs/PRODUCER_PROMOTION_GATE.md`, the removal inventory, Agent Producer skill, Remotion skill, local `scripts/AGENTS.md`, `src/remotion/AGENTS.md`, scaffold README, focused guards, package script, and this plan. Keep the superseded Visual Recipe pointer, provider/asset/env/Compose/archived-handoff surfaces unchanged unless a direct inconsistency is proven.

## Commit Boundary

One commit contains only the Phase 8B style-profile sample contract, strict future scaffold selection, focused smokes, active-doc/skill alignment, inventory slice record, and this execution record. It contains no real sample, Root/registry change, provider/config/dependency change, or generated artifact.

## Stop Condition

Stop after the local commit and final status verification. The next bounded slice is the Phase 8B two-real-composition proof. Neither real composition may be started in this turn.

## Plan Self-Review

- Spec coverage: current facts, bounded objective, scope/non-goals, exact files, frozen boundary, CodeGraph call path, RED/GREEN, Docker validation, docs, commit, and stop condition are explicit.
- Placeholder scan: no placeholder marker, permissive allowlist, default profile, unspecified fallback, or skipped check remains.
- Type consistency: `ProducerStyleProfileId`, `styleProfileId`, `ProfiledMaintainedProducerSampleManifest`, `--style-profile`, and all six ids match across tasks.
- Scope check: two real compositions, narration/assets/render evidence, Phase 9, frozen sources, provider/config, and generated artifacts remain excluded.

## Execution Record

- Starting boundary: branch `refactor/agent-producer-service`, commit `7204733`,
  clean tracked worktree, and no tracked user change to protect. The focused
  Docker baseline passed for Phase 8A profiles, Producer OS, validation,
  architecture, and skill alignment.
- RED: the first Docker `smoke:producer-style-profile-sample-contract` exited
  `1` on `Missing Phase 8B contract surface:
  src/remotion/styles/profile-ids.ts`. After the canonical id module existed,
  the same guard advanced to the missing `--style-profile` scaffold boundary,
  then to the missing inventory slice. Each failure was the intended missing
  behavior rather than a Docker, syntax, or historical lint failure.
- GREEN contract: the six canonical ids are shared by the Phase 8A profile
  registry and Producer sample contract. New scaffolds require an exact
  `--style-profile` value, reject a missing or unknown value, and write the
  selected literal into a manifest satisfying
  `ProfiledMaintainedProducerSampleManifest`.
- Compatibility proof: the unchanged
  `src/remotion/AgentProducerMediaSoundProof/manifest.ts` remains the only
  maintained pre-profile record and still passes Producer OS, sample-manifest,
  promotion, and validation smokes without `styleProfileId`. No composition-id
  allowlist or retrofit was added.
- A fresh 12-command Docker focused suite passes: the new sample contract,
  Phase 8A profiles, Remotion version/capabilities, Producer OS, sample
  manifest/promotion, validation, review frames, assets, media/sound,
  architecture, and skill alignment.
- Docker typecheck, Remotion bundle, and composition listing pass. The
  capability showcase remains 1150 frames and the composition registry is
  unchanged. Render code, Root registration, assets, and media did not change,
  so no representative still or MP4 render belongs to this contract-only
  slice.
- The first fresh whole-repository lint run reported 40 errors and 2 warnings,
  including one new unused variable in the focused smoke. Removing that local
  error restored the documented historical baseline of 39 errors and 2
  warnings; no changed file remains in the failure set. Changed-file ESLint and
  Prettier pass.
- JSON parsing, Compose config, `git diff --check`, canonical CLI-id agreement,
  forbidden source scan, frozen-composition diff scan, ignored/generated/private
  artifact scan, and secret/binary staging review pass. Provider, asset
  contract, `.env.example`, Compose, dependencies, registry, Root, frozen
  sources, and local generated artifacts remain unchanged.
- Active authorities and both skills now record: Phase 8B style-profile sample
  contract complete; Phase 8B real-composition proof next and unstarted; Phase
  8 incomplete; Phase 9 unstarted.
