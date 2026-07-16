# Agent Producer Style Profiles Phase 8A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the complete six-profile Producer style contract and prove that each profile changes composition, motion, texture, media strategy, and sound policy through deterministic capability-showcase fixtures, while deferring real dedicated-composition proof to Phase 8B.

**Architecture:** Add a narrow typed registry under `src/remotion/styles/` that composes already-proved effects, transitions, motion treatments, media roles, and sound language without becoming a template or scene DSL. Add a separate `StyleProfileShowcase` renderer so the existing 503-line capability showcase does not absorb six unrelated fixture implementations. Extend the existing inventory composition by six 90-frame pages; no finished composition, maintained proof, provider runtime, asset contract, or generated binary changes.

**Tech Stack:** React 19, TypeScript 5.9, Remotion and `@remotion/*` exact 4.0.489, `@remotion/three`, React Three Fiber, code-authored SVG/HTML, Node.js ESM smokes, Docker Compose, ESLint, Prettier, CodeGraph, Git.

---

## Current Repository Facts

- Starting branch: `refactor/agent-producer-service`.
- Starting commit: `f58062f fix: allow local video fallback in LAN Studio`.
- Starting tracked worktree is clean; ignored private/generated trees remain user-owned and must not be touched or staged.
- Phase 0 through Phase 7 are complete. Phase 8 is next and has not started; Phase 9 must remain unstarted.
- Phase 8 whole-phase acceptance contains two independent proof levels: six inventory fixtures and at least two new real dedicated compositions. The smallest verifiable slice is therefore Phase 8A contract/showcase, followed by Phase 8B real-composition proof.
- `src/remotion/styles/` currently exports only `fitProducerText()`; no style-profile registry or resolver exists.
- `AgentProducerCapabilityShowcase` is the only non-topic inventory composition and is registered under `Agent-Producer-Inventory`; its current duration is 610 frames.
- CodeGraph proves the showcase is the only active consumer of Producer effect/transition selection, while the Phase 7 maintained sample is the only active consumer of reusable media/motion/sound rendering.
- The sample manifest already recognizes `style-profile` as a promotion target, but no maintained sample field selects a profile. Phase 8A does not retrofit the completed Phase 7 proof; Phase 8B will introduce the real-sample selection boundary with new compositions.
- Existing Three.js code lives in finished compositions and is read-only. Phase 8A may reuse the installed `@remotion/three` API pattern but must write new isolated code-only geometry.
- Docker typecheck/build/composition listing pass. Repository-wide Docker lint has the documented historical baseline of 39 errors and 2 warnings; changed files must be clean.
- `docs/VISUAL_RECIPE_ROADMAP.md` is a superseded compatibility pointer, not active authority.

## Explicit Scope

### Create

- `scripts/producer-style-profiles-smoke.mjs` — focused Phase 8A source, runtime, docs, showcase, and forbidden-boundary RED/GREEN guard.
- `src/remotion/styles/profiles.ts` — six typed profile records, runtime validation, and strict resolver.
- `src/remotion/capability-showcase/StyleProfileShowcase.tsx` — six independent code-only fixture compositions.
- this plan — execution evidence and final verification record.

### Modify

- `package.json` — add only `smoke:producer-style-profiles`; add no dependency.
- `src/remotion/styles/index.ts` — export the style-profile contract and resolver.
- `src/remotion/capability-showcase/durations.ts` — add six 90-frame style pages to the registered total.
- `src/remotion/capability-showcase/RemotionCapabilityShowcase.tsx` — append one isolated `StyleProfileShowcase` sequence.
- `scripts/remotion-capabilities-smoke.mjs` — include Phase 8A source/duration discoverability without replacing the focused smoke.
- `scripts/agent-producer-architecture-smoke.mjs`, `scripts/skill-alignment-smoke.mjs` — guard Phase 8A ownership and Agent Producer selection language.
- `AGENTS.md`, `README.md`, `docs/FINAL_PRODUCT_GOAL.md`, `docs/ITERATION_STATUS.md`, `docs/AGENT_PRODUCER_ONLY_ROADMAP.md`, `docs/REMOTION_COMPONENT_LIBRARY.md`, `docs/PRODUCER_PROMOTION_GATE.md`, `docs/architecture/agent-producer-only-removal-inventory.json`.
- `.agents/skills/ai-video-studio-agent-producer/SKILL.md`, `.agents/skills/remotion-best-practices/SKILL.md`.

### No deletions

Phase 8A deletes no source, composition, provider, compatibility, private, ignored, or generated path.

## Explicit Non-Goals

- no new dedicated topic composition, narration, asset localization, registry entry, cover, publishing copy, or MP4; those are Phase 8B
- no claim that the two-real-composition Phase 8 acceptance is complete
- no Phase 9 hard-failure gate or final acceptance video
- no template, recipe, planner, universal scene DSL, arbitrary TSX generator, or profile-driven automatic scene generation
- no image-generation or video-generation model, prompt, service, adapter, manifest field, or fallback
- no remote runtime media, new binary fixture, audio, video, screenshot, `public/generated/`, `out/`, voice, model, secret, or npm configuration change
- no modification, migration, formatting, registration change, or regeneration of any finished composition or its metadata
- no provider, VoxCPM, asset contract, environment, Compose, dependency-version, or repository-wide lint cleanup
- no push

## Frozen And Artifact Boundary

- Every finished composition, including completed maintained proof output, remains byte-for-byte unchanged.
- Historical `provider: "f5-tts"` metadata, `src/remotion/recipes/{blocks,timing}`, storyboard compatibility, and all frozen registry records remain unchanged.
- The isolated capability showcase is an inventory surface and may be extended; it is not a finished topic composition or migration target.
- Phase 8A fixtures are code-only. Representative stills render under ignored `out/phase8a-style-profiles/` and are never staged.
- No ignored user audio/video/image/voice/model file is read, deleted, normalized, regenerated, or added to the commit.

## Dependency And Call-Chain Evidence

```txt
Agent Producer judgment
  -> getProducerStyleProfile(profileId)
  -> typed palette / typography / layout / approved capabilities
  -> existing effect + transition + motion + media + sound policies
  -> dedicated composition arrangement (Phase 8B)

producerStyleProfiles
  -> focused pure-runtime validation
  -> StyleProfileShowcase fixtures
  -> AgentProducerCapabilityShowcase Series
  -> Root existing inventory registration and duration

existing exact Remotion closure
  -> code-only HTML/SVG fixtures
  -> @remotion/three ThreeCanvas code geometry for cinematic-3d
  -> deterministic frame-derived transforms
  -> representative still hashes
```

CodeGraph shows no supported current style-profile caller, so the new registry has no legacy call path to preserve. The existing `styles/index.ts` has no caller beyond the capability showcase and can safely add exports without changing `fitProducerText()`.

---

### Task 1: Add And Observe The Phase 8A RED Guard

**Files:** create `scripts/producer-style-profiles-smoke.mjs`; modify `package.json`.

- [x] **Step 1: Add the focused guard before production code**

The first stage must require these absent surfaces and all six exact ids:

```js
for (const relativePath of [
  "src/remotion/styles/profiles.ts",
  "src/remotion/capability-showcase/StyleProfileShowcase.tsx",
]) {
  assert(existsSync(path.join(root, relativePath)), `Missing Phase 8A surface: ${relativePath}`);
}
for (const id of [
  "editorial-tech",
  "comic-anime",
  "cinematic-3d",
  "retro-terminal",
  "documentary-media",
  "hand-drawn-explainer",
]) {
  assert(profileSource.includes(id), `Missing style profile: ${id}`);
}
```

When `PRODUCER_STYLE_PROFILES_BUILD_DIR` is present, import the compiled registry, validate all records, prove unknown ids throw, prove all six layout grammars are distinct, and prove at least four transition/effect/motion combinations and six sound strategies exist.

- [x] **Step 2: Run Docker RED**

Run:

```bash
docker compose run --rm producer bash -lc 'npm run smoke:producer-style-profiles'
```

Expected: exit `1` with `Missing Phase 8A surface: src/remotion/styles/profiles.ts`, not a Docker, syntax, dependency, or historical lint failure.

### Task 2: Implement The Strict Style-Profile Contract

**Files:** create `src/remotion/styles/profiles.ts`; modify `src/remotion/styles/index.ts`.

- [x] **Step 1: Define the complete contract**

Each `ProducerStyleProfile` must include:

```ts
type ProducerStyleProfile = {
  readonly id: ProducerStyleProfileId;
  readonly label: string;
  readonly useWhen: string;
  readonly palette: ProducerStylePalette;
  readonly typography: ProducerStyleTypography;
  readonly background: ProducerStyleBackground;
  readonly layout: ProducerStyleLayoutGrammar;
  readonly approvedPrimitives: readonly string[];
  readonly approvedBlocks: readonly string[];
  readonly effect: { readonly id: ProducerEffectPresetId; readonly intensity: "subtle" | "medium" | "bold" };
  readonly transitionPreset: { readonly id: ProducerTransitionPresetId; readonly durationRange: readonly [number, number] };
  readonly motion: { readonly id: ProducerMotionTreatmentId; readonly policy: string };
  readonly mediaMix: readonly ProducerStyleMediaRole[];
  readonly three: { readonly policy: "avoid" | "optional" | "preferred"; readonly rule: string };
  readonly captions: ProducerStyleCaptionTreatment;
  readonly sound: ProducerStyleSoundStrategy;
  readonly forbiddenDefaults: readonly string[];
};
```

The contract references only existing Producer effect, transition, motion, media-role, and transition-SFX concepts. It contains constraints/defaults, not scene content or topic facts.

- [x] **Step 2: Define all six profiles as distinct production languages**

Use the Roadmap ids and explicitly different layout grammars:

```ts
"editorial-tech" -> "asymmetric-editorial"
"comic-anime" -> "panel-sequence"
"cinematic-3d" -> "depth-stage"
"retro-terminal" -> "terminal-stream"
"documentary-media" -> "evidence-led"
"hand-drawn-explainer" -> "diagram-reveal"
```

Every record must carry non-empty palette, typography, materials/background, approved primitives/blocks, effect/intensity, transition/duration range, motion/blur policy, media mix, Three.js policy, caption treatment, BGM/SFX strategy, and at least two forbidden defaults. The same content must not resolve to identical composition/motion/texture/media/sound settings across two profiles.

- [x] **Step 3: Validate and export the strict resolver**

`assertProducerStyleProfiles()` rejects duplicate ids, incomplete fields, invalid transition ranges, empty capability arrays, and a profile set whose layout grammars or sound signatures are not unique. `getProducerStyleProfile(id)` returns one immutable registry record and throws `Unknown Producer style profile` for unsupported ids. Export only the types, ids, registry, validator, and resolver from `styles/index.ts`; do not export a scene builder.

### Task 3: Build Six Deterministic Showcase Fixtures

**Files:** create `src/remotion/capability-showcase/StyleProfileShowcase.tsx`; modify `durations.ts` and `RemotionCapabilityShowcase.tsx`.

- [x] **Step 1: Add the explicit duration boundary**

Define:

```ts
export const STYLE_PROFILE_PAGE_DURATION_IN_FRAMES = 90;
export const STYLE_PROFILE_SHOWCASE_DURATION_IN_FRAMES = 6 * STYLE_PROFILE_PAGE_DURATION_IN_FRAMES;
```

The registered inventory duration becomes `610 + 540 = 1150` frames. Keep the existing five page durations unchanged.

- [x] **Step 2: Render independent layouts for the same message**

Use one common fixture message, `同一主题，不同生产语言`, but six independent components:

- `editorial-tech`: asymmetric headline plus code-driven node/connector evidence diagram and restrained entrance
- `comic-anime`: offset panel sequence, halftone field, outline treatment, and frame-driven speed lines
- `cinematic-3d`: `ThreeCanvas` with code-only geometry, explicit camera/light/depth, and frame-derived mesh rotation/camera travel
- `retro-terminal`: terminal stream, scanline/pixel treatment, command rhythm, and signal cursor
- `documentary-media`: evidence-led media window, lower third, source context, quote, and restrained editorial motion
- `hand-drawn-explainer`: paper surface, SVG arrows/annotations, diagram reveal, and rough editorial marks

All readable content stays inside 120px horizontal and 100px vertical safe areas. Main headlines remain at least 84px. Each fixture has one dominant focal point and no dashboard grid.

- [x] **Step 3: Keep motion render-deterministic**

Use `useCurrentFrame()`, `interpolate()`, `spring()`, individual `translate`/`scale`/`rotate` style properties, SVG draw progress, and Remotion `Series`. Do not use CSS animation/transition, wall-clock time, random values, timers, remote media, or generated imagery.

- [x] **Step 4: Append the six-page sub-showcase**

Append one `Series.Sequence` containing `<StyleProfileShowcase />` after the existing canvas-source page. Do not change Root registration or create a second product/showcase composition.

### Task 4: Turn RED Into GREEN And Render Evidence

**Files:** focused smoke, capability smoke, showcase source.

- [x] **Step 1: Run focused GREEN**

Run:

```bash
docker compose run --rm producer bash -lc 'npm run smoke:producer-style-profiles'
```

Expected: six records validate, resolver/unknown-id behavior passes, source forbidden scans pass, and registered duration equals 1150.

- [x] **Step 2: Render all six representative frames twice**

Render the midpoint of each Phase 8A page at frames `655`, `745`, `835`, `925`, `1015`, and `1105` to ignored `out/phase8a-style-profiles/`, repeat each render, and compare SHA-256 pairs. Inspect each full-size still for one focal point, safe margins, readable text, no overlap/blank source, visible texture/motion state, and unmistakable composition differences without relying on the profile label.

- [x] **Step 3: Prove the 3D fixture in Docker**

The `cinematic-3d` midpoint must contain visible lit geometry and depth rather than a blank WebGL surface. If the render is blank, diagnose the Docker Chromium/OpenGL path; do not replace the profile with a color-only card or weaken the focused guard.

### Task 5: Align Active Authorities Without Claiming Phase 8 Complete

**Files:** active docs, skills, inventory, architecture/skill/capability guards.

- [x] **Step 1: Record the Phase 8A/8B split**

Update the Roadmap so Phase 8A is the contract/showcase slice and Phase 8B owns at least two new dedicated compositions with real narration/assets/stills/covers/render evidence. Mark Phase 8 `in progress` only after GREEN evidence exists; Phase 9 remains next-after-Phase-8 and unstarted.

- [x] **Step 2: Route profile selection through the Agent Producer skill**

Document `getProducerStyleProfile()` and all six selection rules. State that profiles constrain palette, typography, layout, effects, transitions, motion, media, Three.js, captions, and sound; they do not generate scenes. The Remotion skill must point to the focused smoke and showcase before profile use.

- [x] **Step 3: Align inventory and promotion language**

Add one Phase 8 Producer-owned style-profile entry to the removal inventory, record the completed `style-profile-contract-showcase` slice only, and keep Phase 8 out of `completedPhases`. Update component/promotion docs to distinguish a registry profile from a proven/promoted profile; two real compositions remain required in Phase 8B.

- [x] **Step 4: Keep unrelated surfaces explicitly unchanged**

Provider docs, asset contract, `.env.example`, Compose, package dependencies, sample manifests/registry, `VISUAL_RECIPE_ROADMAP.md`, frozen source, and archived handoffs remain unchanged unless verification reveals a direct factual conflict. There is no active handoff document.

### Task 6: Docker-First Closure, Review, And One Commit

- [x] **Step 1: Run focused and retained-boundary smokes**

Run in Docker: `smoke:producer-style-profiles`, `smoke:remotion-capabilities`, `smoke:remotion-version-gate`, `smoke:producer-media-sound`, `smoke:producer-os`, `smoke:producer-assets`, `smoke:producer-validation`, `smoke:producer-review-frames`, `smoke:agent-producer-architecture`, and `smoke:skill-alignment`.

- [x] **Step 2: Run full Docker gates**

Run Docker typecheck, full lint, build, and Remotion composition listing. Typecheck/build/listing must pass and the inventory composition must report 1150 frames. Report lint honestly against the fresh historical baseline.

- [x] **Step 3: Run changed-file and boundary checks**

Run changed-file ESLint, Prettier, JSON parse, Compose config, `git diff --check`, focused forbidden scans, frozen-composition diff scan, ignored/generated/private artifact scan, and staged secret/binary scan. Prove no finished composition or generated binary changed.

- [x] **Step 4: Review and create one bounded commit**

Stage only Phase 8A contract, showcase, focused guards, aligned active docs/skills, and this execution record. Create:

```bash
git commit -m "feat: add producer style profile foundation"
```

Record hash and final status. Do not push or begin Phase 8B.

## RED Check

The first Docker `smoke:producer-style-profiles` must exit `1` because `src/remotion/styles/profiles.ts` is absent at `f58062f`. A passing initial smoke or a syntax/setup error is not valid RED evidence.

## GREEN Result Required

- a strict six-profile contract and resolver with all Roadmap-defined fields
- six distinct composition grammars and sound signatures, not six color themes
- six deterministic code-only inventory fixtures using the same core message
- visible code-only Three.js depth proof for `cinematic-3d`
- exact 1150-frame registered capability showcase
- deterministic duplicate still hashes and visual inspection for all six pages
- Agent Producer and Remotion skill selection guidance
- Phase 8A complete / Phase 8 in progress / Phase 8B next / Phase 9 unstarted authority alignment
- focused/Docker verification plus honest lint baseline
- zero frozen/private/generated/provider/config/sample-registry change

## Focused Validation

Primary RED/GREEN command: `npm run smoke:producer-style-profiles`. Supporting checks: capability/version, media/sound, Producer OS/assets/validation/review, architecture, and skill alignment smokes. Render only the isolated capability showcase.

## Docker-First Validation

Docker owns dependencies, TypeScript, build, composition listing, representative stills, and full lint evidence. Host Git/source checks may aid review but are not final render/type proof.

## Documentation Alignment Boundary

Align `AGENTS.md`, `README.md`, `docs/FINAL_PRODUCT_GOAL.md`, `docs/ITERATION_STATUS.md`, `docs/AGENT_PRODUCER_ONLY_ROADMAP.md`, `docs/REMOTION_COMPONENT_LIBRARY.md`, `docs/PRODUCER_PROMOTION_GATE.md`, the removal inventory, Agent Producer skill, Remotion skill, focused guards, package script, and this plan. Keep the superseded Visual Recipe pointer, provider/asset/env/Compose/sample registry, archived handoffs, and frozen sources unchanged unless a direct inconsistency is proven.

## Commit Boundary

One commit contains only Phase 8A style contracts, code-only showcase fixtures, smoke/validation changes, active-doc/skill alignment, and this execution record. It contains no real sample, binary artifact, provider/config change, or Phase 8B/9 implementation.

## Stop Condition

Stop after the Phase 8A commit and final status verification. Phase 8 remains incomplete; Phase 8B real dedicated-composition proof is next and must be explicitly reported as not started.

## Plan Self-Review

- Spec coverage: current facts, bounded goal, scope/non-goals, exact files, frozen boundary, CodeGraph call paths, RED/GREEN, visual evidence, focused/Docker validation, docs, commit, and stop condition are explicit.
- Placeholder scan: no placeholder marker, relaxed allowlist, automatic scene generation, unspecified fallback, or skipped check remains.
- Type consistency: the six ids, field names, 90-frame page duration, 540-frame slice, 1150-frame total, and representative frames match across tasks.
- Scope check: real compositions, provider/assets, sample manifests, Phase 9 gates, frozen sources, and generated artifacts remain excluded.

## Execution Record

- Starting boundary: branch `refactor/agent-producer-service`, commit `f58062f`,
  clean tracked worktree, no user changes to protect. Docker capability,
  version, media/sound, architecture, and skill-alignment baselines passed.
- RED: the first Docker `smoke:producer-style-profiles` exited `1` on
  `Missing Phase 8A surface: src/remotion/styles/profiles.ts`. The guard then
  advanced through the missing showcase and missing inventory-status sub-REDs
  before reaching compiled runtime checks.
- GREEN contract: six exact profile ids pass strict runtime validation, use six
  unique layout grammars and six unique sound signatures, expose at least four
  distinct effect/transition/motion combinations, and reject unknown ids.
- The first focused compile exposed missing `--jsx react-jsx` because type
  imports traverse the existing motion/sound TSX exports. Adding the focused
  compile flag fixed the command without changing the contract.
- The first full focused suite exposed stale Phase 6/7 smoke assertions that
  permanently required Phase 8 to remain unstarted. Those guards now verify
  Phase 8A complete and Phase 8B unstarted. The architecture guard's exact
  slice list now includes the Phase 8A record.
- The first whole-repository lint run showed 39 errors and 8 warnings. Six new
  warnings were false positives from the Remotion rule interpreting the plain
  profile field `transition` as CSS transition state. Renaming the contract
  field to `transitionPreset` restored the unchanged historical 39-error/
  2-warning baseline; changed-file ESLint is clean.
- Visual proof: the first cinematic still confirmed visible code-only Three.js
  geometry but revealed tight headline line spacing. Explicit two-line copy,
  92px type, and 1.14 line height fixed the collision. Final full-size review
  confirms six distinct compositions, safe copy, one focal point, no blank or
  overlap, and a visible lit 3D stage.
- Deterministic SHA-256 pairs: frame 655
  `25595f6c1c0aa6b4b2a60ad2ed62f6954b127eeb56052e07fe612c301a1d2972`;
  frame 745
  `c9100e9adf9f049ba59f9b8210bbc645e60f2b8311e736ba96fac97d8450fa29`;
  frame 835
  `259e2b2abf8333bba9e2def31b6850263064447e4774f32f2d2f5a31c753cb20`;
  frame 925
  `916ecd1b48af2334dd7c7bbc14a5052e471c7856832a29fe249a5b77d15a12f3`;
  frame 1015
  `3cb91445212771499ec01cc2e364bd51203acab0ca19444dcf46ac9fc3ad61f4`;
  frame 1105
  `85a08be3b79b92d3df44da5306106b20948f4ff5e1364f6eb6a0b80379d74410`.
  Every A/B pair matches and all outputs are ignored under
  `out/phase8a-style-profiles/`.
- Fresh ten-command focused Docker suite passes. Docker typecheck, build, and
  composition listing pass; the inventory composition reports 1150 frames.
  Provider, assets, sample registry, environment, Compose, frozen sources, and
  generated/private artifacts remain unchanged. Phase 8B and Phase 9 remain
  unstarted.
