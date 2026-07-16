# Remotion Transitions And Showcase Phase 6B Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete Phase 6B with exact-version official transitions, Producer-owned transition presets and duration accounting, light-leak/film-burn coverage, and deterministic HTML/SVG/image/video canvas-effect proofs in the existing Agent Producer capability showcase.

**Architecture:** Keep the repository on one exact Remotion closure. Phase 6B activates only when `@remotion/transitions@4.0.489` exists and depends on `4.0.489` Remotion internals; until then, stop before changing production code or active status. Once active, add narrow Producer transition factories and duration arithmetic, extend the isolated showcase, and generate any video proof only as an ignored local FFmpeg fixture so no media enters Git.

**Tech Stack:** React 19, TypeScript 5.9, Remotion 4.0.489, `@remotion/transitions`, `@remotion/light-leaks`, `HtmlInCanvas`, `CanvasImage`, Node.js ESM smoke scripts, FFmpeg, Docker Compose, Remotion CLI, ESLint, Prettier, CodeGraph, Git.

## Global Constraints

- `.agents/skills/ai-video-studio-agent-producer/` remains the only video-production entrypoint.
- Visual production uses code and existing assets only; image-generation and video-generation models remain forbidden.
- Every installed `remotion` and `@remotion/*` package must resolve to exact `4.0.489`.
- Do not use npm overrides, mixed Remotion versions, vendored transition replacements, or a lower capability target.
- Finished compositions, frozen registry entries, historical F5 metadata, and historical recipe/storyboard compatibility paths remain read-only.
- Do not commit audio, video, screenshots, `public/generated/`, `out/`, private voice files, secrets, or local npm logs.
- Do not begin Phase 7 dynamic media/sound, Phase 8 style profiles, or Phase 9 quality gates.
- Do not push.

---

## Current Repository Facts

- Starting branch: `refactor/agent-producer-service`.
- Starting commit for this execution: `61763dd docs: plan remotion capability phase 6b`.
- Starting tracked worktree: clean; ignored private/generated trees exist and must remain untouched and unstaged.
- Phase 0 through Phase 5, the Phase 6 version gate, and Phase 6A are complete. Phase 6 overall is incomplete.
- `AgentProducerCapabilityShowcase` currently contains two 90-frame pages: four effect presets and measured Chinese text fitting.
- CodeGraph identifies `src/remotion/Root.tsx` and `src/remotion/capability-showcase/index.ts` as the showcase registration/call boundary; no production source imports a Producer transition module because it does not exist.
- Every current direct and top-level lockfile Remotion package resolves to exact `4.0.489`.
- Fresh activation evidence on 2026-07-16 confirms `@remotion/transitions@4.0.489` exists and depends exactly on `remotion`, `@remotion/shapes`, and `@remotion/paths` `4.0.489`. The default `registry.npmmirror.com` packument remains stale, while `registry-direct.npmmirror.com` exposes the synchronized package and tarball; use the direct mirror as a one-command registry override without changing repository or user npm configuration.
- Live npm evidence reports `@remotion/light-leaks@4.0.489` exists and depends on `remotion@4.0.489`, but the Roadmap forbids starting Phase 6B piecemeal before the transition gate clears.
- Focused Docker capability, version-gate, architecture, and skill-alignment smokes pass at the starting commit.
- Repository-wide Docker lint has the documented historical baseline of 39 errors and 2 warnings; changed Phase 6B files must be clean.

## Explicit Scope

### Create after the activation gate passes

- `src/remotion/transitions/presets.ts` — Producer transition metadata, official presentations/timings, and input validation.
- `src/remotion/transitions/duration.ts` — total-duration accounting that subtracts official transition overlap.
- `src/remotion/transitions/index.ts` — narrow public exports.
- `scripts/fixtures/remotion-capabilities/create-video-fixture.sh` — deterministic FFmpeg color/test-pattern video fixture written only to ignored `public/generated/agent-producer-capability-showcase/assets/`.
- this plan's future execution evidence.

### Modify after the activation gate passes

- `package.json`, `package-lock.json` — add exact `@remotion/transitions@4.0.489` and `@remotion/light-leaks@4.0.489`.
- `scripts/remotion-capabilities-smoke.mjs` — evolve the Phase 6A guard into the Phase 6B package/source/timing/showcase/forbidden guard.
- `scripts/remotion-version-gate-smoke.mjs` — require the complete exact-version Phase 6 closure.
- `remotion.config.ts` — enable HTML-in-canvas rendering in addition to the existing `swangle` backend.
- `src/remotion/capability-showcase/RemotionCapabilityShowcase.tsx` — add cinematic overlay, official transition timing, and HTML/SVG/image/video canvas-effect pages.
- `src/remotion/capability-showcase/index.ts` — update duration to the exact sum of showcase pages after transition overlap.
- `scripts/agent-producer-architecture-smoke.mjs`, `scripts/skill-alignment-smoke.mjs` — guard discoverability and Phase 6 completion language.
- `AGENTS.md`, `README.md`, `scripts/AGENTS.md`, `src/remotion/AGENTS.md`.
- `docs/FINAL_PRODUCT_GOAL.md`, `docs/ITERATION_STATUS.md`, `docs/AGENT_PRODUCER_ONLY_ROADMAP.md`, `docs/REMOTION_COMPONENT_LIBRARY.md`.
- `docs/architecture/agent-producer-only-removal-inventory.json`.
- `.agents/skills/ai-video-studio-agent-producer/SKILL.md`, `.agents/skills/remotion-best-practices/SKILL.md`.

### No deletions

Phase 6B deletes no source, composition, provider, compatibility, private, ignored, or generated path.

## Explicit Non-Goals

- no transition-to-SFX mapping, BGM, ambience, ducking, or production sound design
- no reusable local `<Video>` block, AnimatedImage, Lottie, Rive, or dynamic-media contract
- no style profiles or template/recipe/planner schema
- no custom shader or custom `createEffect()` implementation unless the official Phase 6B surfaces prove insufficient and the Roadmap is separately revised
- no maintained-sample manifest or Producer asset-contract change
- no frozen composition adoption, migration, render, regeneration, or formatting
- no provider, VoxCPM, `.env.example`, or Compose topology change
- no repository-wide lint cleanup

## Frozen And Artifact Boundary

- `src/remotion/<FinishedComposition>/`, frozen sample registry entries, historical `audio.generated.ts`, `src/remotion/recipes/{blocks,timing}`, and historical storyboard contracts remain byte-for-byte unchanged.
- The capability showcase remains an isolated Studio inventory aid, not a maintained topic sample or universal template.
- The image fixture uses the already tracked `public/fixtures/phase5-ui-screenshot.svg` through `staticFile()`; it is an existing local code-rendered fixture, not remote or generated media.
- The video proof is created locally from FFmpeg `testsrc2` under ignored `public/generated/agent-producer-capability-showcase/assets/canvas-video.mp4`, used only for representative verification, and never staged.
- Stills stay under ignored `out/phase6b-capabilities/`.

## Dependency And Call-Chain Evidence

```txt
package.json / package-lock.json
  -> Docker producer npm install
  -> @remotion/transitions + @remotion/light-leaks
  -> Remotion Studio / CLI render closure

Producer transition id + duration
  -> getProducerTransitionPreset()
  -> official presentation + linearTiming()
  -> TransitionSeries.Transition
  -> getProducerTransitionSeriesDuration()
  -> registered composition duration

Root.tsx
  -> Agent-Producer-Inventory Folder
  -> AgentProducerCapabilityShowcase
  -> transition / overlay / canvas-effect review pages

ignored FFmpeg fixture
  -> staticFile(generated/.../canvas-video.mp4)
  -> OffthreadVideo inside HtmlInCanvas
  -> representative still only
```

---

### Task 0: Exact-Version Activation Gate

**Files:**

- Read only: npm registry metadata, `package.json`, `package-lock.json`, active status/Roadmap documents.

- [x] **Step 1: Query the exact transition publication**

Run:

```bash
npm view @remotion/transitions version versions --json
npm view @remotion/transitions@4.0.489 version dependencies --json
```

Required to continue: the second command exits `0`, reports version `4.0.489`, and every `remotion` / `@remotion/*` dependency is exact `4.0.489`. This execution uses `--registry=https://registry-direct.npmmirror.com/` because the configured default mirror is stale and the local proxy fails TLS to `registry.npmjs.org`; independent unpkg/jsDelivr package metadata matches the synchronized registry result.

- [x] **Step 2: Record the cleared blocker and proceed**

Actual 2026-07-16 rerun: exact `4.0.489` returns successfully with an aligned dependency closure. Tasks 1-7 are now authorized; continue to forbid mixed versions, overrides, vendoring, or installing only a subset of Phase 6B.

### Task 1: Add And Observe The Phase 6B RED Guard

**Files:**

- Modify: `scripts/remotion-capabilities-smoke.mjs`
- Modify: `package.json`

**Interfaces:**

- Consumes: exact-version activation result from Task 0.
- Produces: `npm run smoke:remotion-capabilities` assertions for the complete Phase 6B boundary.

- [x] **Step 1: Add failing assertions before dependencies or production surfaces**

Extend the existing smoke to require both direct dependencies at `4.0.489`, require the three transition source files, require `Config.setAllowHtmlInCanvasEnabled(true)`, and require the source tokens below:

```js
for (const name of ["@remotion/transitions", "@remotion/light-leaks"]) {
  assert.equal(allDirectDependencies[name], "4.0.489", `${name} must be exact 4.0.489`);
}
for (const relativePath of [
  "src/remotion/transitions/presets.ts",
  "src/remotion/transitions/duration.ts",
  "src/remotion/transitions/index.ts",
]) {
  assert(existsSync(path.join(root, relativePath)), `Missing Phase 6B surface: ${relativePath}`);
}
const transitionSource = read("src/remotion/transitions/presets.ts");
for (const token of ["editorial-fade", "directional-slide", "signal-wipe", "linearTiming"]) {
  assert(transitionSource.includes(token), `Missing transition contract token: ${token}`);
}
assert(read("remotion.config.ts").includes("Config.setAllowHtmlInCanvasEnabled(true)"));
```

- [x] **Step 2: Run Docker RED**

Run:

```bash
docker compose run --rm producer bash -lc 'npm run smoke:remotion-capabilities'
```

Expected: exit `1` because `@remotion/transitions` is absent, not because of syntax, Docker, or a missing pre-existing dependency.

### Task 2: Admit The Exact Compatible Packages

**Files:**

- Modify: `package.json`
- Modify mechanically through npm: `package-lock.json`
- Modify: `scripts/remotion-version-gate-smoke.mjs`

- [x] **Step 1: Add exact dependencies**

Patch `dependencies` with:

```json
"@remotion/light-leaks": "4.0.489",
"@remotion/transitions": "4.0.489"
```

- [x] **Step 2: Regenerate and verify the lock**

Run:

```bash
docker compose run --rm producer npm install --ignore-scripts
docker compose run --rm producer node -e 'const names=["remotion","@remotion/transitions","@remotion/light-leaks"]; for (const name of names) console.log(name, require(`${name}/package.json`).version)'
```

Expected: every printed version is `4.0.489`; no nested `4.0.477` Remotion package exists.

- [x] **Step 3: Strengthen the version gate**

Require transitions/light-leaks at exact `4.0.489` and remove the Phase 6A assertions that require those packages and `src/remotion/transitions/` to be absent. Keep the all-lock-entry exact-version loop unchanged.

### Task 3: Implement Producer Transition Presets And Duration Accounting

**Files:**

- Create: `src/remotion/transitions/presets.ts`
- Create: `src/remotion/transitions/duration.ts`
- Create: `src/remotion/transitions/index.ts`

**Interfaces:**

- Produces: `ProducerTransitionPresetId`, `producerTransitionPresets`, `getProducerTransitionPreset()`, and `getProducerTransitionSeriesDuration()`.

- [x] **Step 1: Implement four fixed official presets**

Use `fade()`, directional `slide()`, and `wipe()` presentations with `linearTiming({durationInFrames})`. Validate positive integer duration, return the presentation and timing together, and expose metadata with these exact ids and responsibilities:

```ts
export type ProducerTransitionPresetId =
  | "editorial-fade"
  | "directional-slide"
  | "signal-wipe"
  | "cinematic-film-burn";

export const producerTransitionPresets = [
  { id: "editorial-fade", label: "Editorial fade", useWhen: "Restrained editorial scene changes" },
  { id: "directional-slide", label: "Directional slide", useWhen: "Spatial progression with an explicit direction" },
  { id: "signal-wipe", label: "Signal wipe", useWhen: "System-state or signal handoffs" },
] as const;
```

- [x] **Step 2: Implement total-duration arithmetic**

Use each timing object's official `getDurationInFrames({fps})` result:

```ts
export const getProducerTransitionSeriesDuration = ({
  sceneDurations,
  transitions,
  fps,
}: {
  readonly sceneDurations: readonly number[];
  readonly transitions: readonly { readonly id: ProducerTransitionPresetId; readonly durationInFrames: number }[];
  readonly fps: number;
}): number => {
  if (sceneDurations.length === 0) throw new Error("sceneDurations must not be empty");
  if (transitions.length !== sceneDurations.length - 1) {
    throw new Error("transitions must contain exactly one entry between adjacent scenes");
  }
  if (!Number.isFinite(fps) || fps <= 0) throw new Error("fps must be positive");
  const sceneTotal = sceneDurations.reduce((sum, duration) => sum + duration, 0);
  const overlap = transitions.reduce(
    (sum, transition) =>
      sum +
      getProducerTransitionPreset(transition).timing.getDurationInFrames({ fps }),
    0,
  );
  return sceneTotal - overlap;
};
```

Validate every scene duration as a positive integer and assert the result remains positive.

- [x] **Step 3: Export only the supported transition surface**

Re-export the four public names above. Do not export a scene DSL, SFX mapping, template, recipe, or style profile.

### Task 4: Extend The Isolated Capability Showcase

**Files:**

- Modify: `remotion.config.ts`
- Modify: `package.json`
- Modify: `src/remotion/effects/presets.ts`
- Modify: `src/remotion/effects/index.ts`
- Modify: `src/remotion/capability-showcase/RemotionCapabilityShowcase.tsx`
- Modify: `src/remotion/capability-showcase/index.ts`
- Create: `src/remotion/capability-showcase/durations.ts`
- Create: `scripts/fixtures/remotion-capabilities/create-video-fixture.sh`

- [x] **Step 1: Enable the explicit HTML-in-canvas render flag**

Add:

```ts
Config.setAllowHtmlInCanvasEnabled(true);
```

Keep `Config.setChromiumOpenGlRenderer("swangle")` unchanged. Document that HTML-in-canvas requires the configured Chrome capability and is not a generic browser guarantee.

- [x] **Step 2: Add the transition timing page**

Render three 60-frame code-only scenes with 15-frame `editorial-fade` and 20-frame `signal-wipe` transitions. The page duration is exactly `60 + 60 + 60 - 15 - 20 = 145` frames, calculated by `getProducerTransitionSeriesDuration()` and used by both `TransitionSeries` and the showcase duration constant.

- [x] **Step 3: Add the cinematic overlay page**

Use `TransitionSeries.Overlay` and `<LightLeak durationInFrames={30} seed={6} hueShift={18} />` between the first two code-only scenes, then a fixed 15-frame `cinematic-film-burn` transition into a third scene. The overlay does not shorten adjacent scenes, while the film-burn transition overlaps the second and third scenes, so this page contributes exactly `60 + 60 + 60 - 15 = 165` frames. This proves that light-leak and film-burn are separate official capabilities.

- [x] **Step 4: Add HTML, SVG, image, and local video canvas proofs**

Use one 120-frame page with `HtmlInCanvas` around code-authored HTML and inline SVG children, and `CanvasImage` with `staticFile("fixtures/phase5-ui-screenshot.svg")`. Apply source-preserving Producer media effect descriptors and bind each interactive canvas source to the full 120-frame page duration. For the video proof, place `OffthreadVideo` with `staticFile("generated/agent-producer-capability-showcase/assets/canvas-video.mp4")` inside `HtmlInCanvas`; this remains showcase-local proof and does not create the Phase 7 reusable video block. The complete showcase duration is exactly `90 + 90 + 145 + 165 + 120 = 610` frames.

- [x] **Step 5: Add the ignored local video-fixture generator**

The shell script runs:

```bash
mkdir -p public/generated/agent-producer-capability-showcase/assets
ffmpeg -hide_banner -loglevel error -y -f lavfi -i 'testsrc2=size=960x540:rate=30:duration=4' -an -c:v libx264 -pix_fmt yuv420p -r 30 public/generated/agent-producer-capability-showcase/assets/canvas-video.mp4
```

The script creates no tracked artifact and has no model/provider dependency.

### Task 5: Turn RED Into GREEN And Prove Duration Behavior

- [x] **Step 1: Extend the focused smoke with executable duration assertions**

Bundle/import the transition module using the repository's existing TypeScript execution pattern and assert:

```ts
getProducerTransitionSeriesDuration({
  sceneDurations: [60, 60, 60],
  transitions: [
    { id: "editorial-fade", durationInFrames: 15 },
    { id: "signal-wipe", durationInFrames: 20 },
  ],
  fps: 30,
}) === 145;
```

Also assert invalid empty scenes, non-positive durations, and wrong transition counts throw.

- [x] **Step 2: Run focused GREEN smokes**

```bash
docker compose run --rm producer bash -lc 'npm run smoke:remotion-capabilities && npm run smoke:remotion-version-gate && npm run smoke:agent-producer-architecture && npm run smoke:skill-alignment && npm run smoke:producer-os && npm run smoke:producer-assets && npm run smoke:producer-validation && npm run smoke:producer-review-frames'
```

### Task 6: Render Deterministic Representative Evidence

- [x] **Step 1: Generate only the ignored video fixture**

Run the fixture script inside the Producer container and confirm `git check-ignore` recognizes the output.

- [x] **Step 2: Render transition, overlay, film-burn, and canvas states twice**

Render one active transition frame, separate light-leak and film-burn frames, and one canvas-source frame twice under `out/phase6b-capabilities/`. Compare SHA-256 pairs. Inspect for visible transition overlap, nonblank light leak and film burn, readable HTML/SVG/image content, a visible video frame, no clipping, and no unintended overlap.

- [x] **Step 3: Prove registered total duration**

Run `npx remotion compositions src/remotion/index.ts` and confirm `AgentProducerCapabilityShowcase` reports the exact new duration constant derived from the page durations.

### Task 7: Docker-First Verification, Docs Alignment, And One Commit

- [x] **Step 1: Run Docker gates**

```bash
docker compose run --rm producer bash -lc 'npx tsc --noEmit --pretty false'
docker compose run --rm producer bash -lc 'npm run lint'
docker compose run --rm producer bash -lc 'npm run build'
docker compose run --rm producer bash -lc 'npx remotion compositions src/remotion/index.ts'
git diff --check
```

Typecheck, build, and composition listing must exit `0`. Report lint against the fresh historical baseline; do not claim unrelated cleanup.

- [x] **Step 2: Run changed-file and forbidden checks**

Run ESLint on changed TS/TSX/MJS files, Prettier on every changed supported file, `bash -n` on the fixture script, JSON/Compose checks, and scans proving no remote URL, CSS animation/transition, image/video model, Web product, planner/template, provider fallback, generated artifact, private voice, secret, or frozen source entered the diff.

- [x] **Step 3: Align active authorities**

Mark Phase 6 and Phase 6B complete only after all GREEN evidence exists. Add Phase 6 to `completedPhases`, add a completed `transitions-showcase` slice, document the four transition ids and HTML-in-canvas notice, remove obsolete blocker language, and state Phase 7 is next and not started. Keep provider, asset contract, promotion gate, env, Compose, frozen sources, and `VISUAL_RECIPE_ROADMAP.md` unchanged unless verification finds a direct inconsistency.

- [x] **Step 4: Review and commit exactly one Phase 6B implementation**

Stage only the Phase 6B implementation, plan execution record, and aligned active docs. Confirm no ignored/private/media path is staged, then create:

```bash
git commit -m "feat: complete remotion capability core"
```

Do not push. Stop before Phase 7.

## RED Check

The first post-activation Docker `smoke:remotion-capabilities` failed because the exact transition dependency was absent. After dependency activation, the expanded guard separately failed on the missing `cinematic-film-burn` contract. A final authority RED failed because Phase 6 had not yet been recorded complete. These were target-boundary failures rather than syntax, Docker, or unrelated baseline failures.

## GREEN Result Required

- exact `4.0.489` transition/light-leak packages with no mixed lock entry
- four Producer transition presets and official timing arithmetic
- 145-frame transition example plus separate light-leak overlay and film-burn duration proof
- deterministic HTML/SVG/image/video canvas-effect review frames
- Agent Producer skill selection rules and HTML-in-canvas runtime notice
- focused smokes, Docker typecheck/build/composition listing, changed-file style checks, forbidden/frozen/artifact/secret scans, and `git diff --check`
- no finished composition, provider, env, Compose, generated/private media, or later-phase implementation change

## Focused Validation

Use `smoke:remotion-capabilities` as the phase RED/GREEN guard, then run version, architecture, skill, Producer OS, assets, validation, and review-frame smokes. Render only the isolated showcase; do not render finished compositions.

## Docker-First Validation

Docker owns TypeScript, build, composition listing, representative stills, and full lint evidence. Host checks may assist diagnosis but are not final proof.

## Documentation Alignment Boundary

When GREEN exists, align README, AGENTS, FINAL_PRODUCT_GOAL, ITERATION_STATUS, the active Roadmap, component inventory, removal inventory, Agent Producer skill, Remotion skill, script/remotion knowledge bases, guards, package scripts, config, and this plan. Keep the superseded Visual Recipe pointer and unchanged provider/asset/env/Compose/frozen surfaces explicit.

## Commit Boundary

Before activation, a plan-only documentation commit may record the verified blocker without claiming Phase 6B started. After activation, use exactly one implementation commit containing dependencies, transition/canvas capability code, tests, showcase evidence record, and active-doc alignment. Never mix ignored media or later phases into either boundary.

## Stop Condition

Current stop condition: after a successful Phase 6B commit, stop with Phase 7 explicitly unstarted. The previous package-publication stop no longer applies because the exact-version activation gate now passes.

## Plan Self-Review

- Spec coverage: current facts, phase goal, scope/non-goals, exact files, frozen boundary, call chain, activation gate, RED/GREEN, focused/Docker verification, docs, commit, and stop conditions are explicit.
- Placeholder scan: no placeholder marker, relaxed allowlist, unspecified compatibility workaround, or unbounded cleanup remains.
- Type consistency: preset ids and duration input fields are identical across implementation, showcase, and tests.
- Scope check: Phase 7 production media/audio, Phase 8 styles, Phase 9 gates, providers, frozen sources, and generated artifacts remain excluded.

## Execution Record

- 2026-07-16 activation gate: blocked. Registry latest is `4.0.477`; exact `4.0.489` returns E404, and `4.0.477` pins three Remotion internals to exact `4.0.477`.
- 2026-07-16 activation rerun: cleared. `registry-direct.npmmirror.com`, unpkg, and jsDelivr expose `@remotion/transitions@4.0.489`; its Remotion dependencies are exact `4.0.489`. The default mirror's packument is stale and direct TLS to `registry.npmjs.org` fails in this environment, so installation uses a command-local direct-mirror override without persisting npm configuration.
- Starting focused baseline: Docker version-gate, capability, architecture, and skill-alignment smokes exit `0`.
- Production execution: dependencies, transition/media effect helpers, 610-frame isolated showcase, ignored FFmpeg fixture, focused guards, and active-doc alignment are implemented. Typecheck, build, composition listing, focused smokes, deterministic duplicate still hashes, and changed-file ESLint are GREEN; full lint remains at the historical 39-error/2-warning baseline. Provider, env, Compose, frozen compositions, and generated/private artifacts remain unchanged or untracked.
- RED evidence: the first focused run exited `1` because `@remotion/transitions` was absent; the post-activation contract run exited `1` on missing `cinematic-film-burn`; the final authority guard exited `1` until inventory recorded Phase 6 complete.
- GREEN focused evidence: capability, version, architecture, skill-alignment, Producer OS, assets, validation, and review-frame smokes all exit `0` in Docker.
- Representative frames: frame 232 transition hash pair `a6ca34ba19c3ef0cdb8d4f2e56bc57dc3d1f629b5e8713c3e175f08f80941444`; frame 380 light-leak pair `6edcc70a1ce2b72503b6b307006ac4131c808bb60893e7e0f9767d645278896d`; frame 437 film-burn pair `783ad95cf49f5086c94a82d965630a276761a6171e6fa11fedd14c0db787c6e3`; frame 550 canvas-source pair `d9ca1d0ff4486fa86aa7d70b34dc035a2b62e48433e877a9a53ef76d9c5dae4e`. Visual review confirms effect visibility, readable source tiles, a visible local video frame, and no clipping.
- Docker final gates: typecheck, build, and composition listing exit `0`; the showcase registers at 610 frames. Changed-file ESLint, Prettier, Bash syntax, JSON parse, Compose config, forbidden/source/status scans, and `git diff --check` exit `0`. Full lint reports only the unchanged historical 39 errors and 2 warnings.
