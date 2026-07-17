# Agent Producer Final Acceptance Phase 9B Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete Phase 9B with one new future-only `DnsResolutionExplainer` composition that passes the entire Agent Producer chain, then close the active Producer-only documentation and Roadmap without changing any completed or frozen composition.

**Architecture:** Use the Phase 9A scaffold contract to create a dedicated `hand-drawn-explainer` composition with three duration-owned Chinese narration beats. The renderer uses a deterministic code-driven paper treatment plus frame-derived SVG opacity/scale, presents one manifest-backed local DNS SVG through an official `directional-slide` transition series, and uses the existing Producer soundtrack for BGM, ambience, and at least two intentional SFX cues. Existing Producer audio, asset, validation, still, render, and quality CLIs remain unchanged; Phase 9B proves them through real outputs and then marks Phase 9/Roadmap complete.

**Tech Stack:** React 19, TypeScript 5.9, Remotion and `@remotion/*` exact `4.0.489`, direct VoxCPM high-fidelity clone, SVG, FFmpeg/ffprobe, Node.js ESM smokes, Docker Compose, CodeGraph, ESLint, Prettier, Git.

## Global Constraints

- `.agents/skills/ai-video-studio-agent-producer/` remains the only supported video-production entrypoint.
- Visual production uses code and existing assets only; no image/video generation, ComfyUI, Web prompt flow, planner, template, or scene DSL is introduced.
- Existing completed/frozen compositions, their metadata, the three pre-Phase-9 maintained proofs, historical compatibility modules, ignored private voices, and generated artifacts remain read-only or local-only.
- New render-critical motion uses `useCurrentFrame()`, `interpolate()`, `Sequence`, and `TransitionSeries`; CSS animation/transition, timers, wall-clock state, and random values are forbidden.
- Generated narration, localized assets, review PNGs, covers, MP4s, `public/generated/`, `out/`, and private voice files remain ignored and uncommitted.
- Phase 9/Roadmap may be marked complete only after the real acceptance composition passes preflight, validation, still/cover review, render/ffprobe, `producer:quality`, forbidden scans, and Docker-first closure.
- Do not push.

---

## Current Repository Facts

- Starting branch: `refactor/agent-producer-service`.
- Starting commit: `ef3aa76 chore: enforce producer quality gates`.
- Starting tracked worktree is clean; there are no user changes to protect.
- Phase 0 through Phase 8 and Phase 9A are complete; Phase 9B is the next and only unfinished Roadmap slice.
- Fresh Docker baselines pass for `smoke:producer-quality-gates`, `smoke:producer-style-profile-sample-contract`, `smoke:agent-producer-architecture`, `smoke:skill-alignment`, and `tsc --noEmit`.
- Repository-wide Docker lint has the historical 39-error/2-warning baseline; changed files must be clean and must not appear in that failure set.
- CodeGraph confirms the future call chain is scaffold -> strict quality-gated manifest -> direct VoxCPM -> asset supply/preflight -> validation -> review stills -> render -> quality.
- CodeGraph confirms `hand-drawn-explainer` selects `paper-grain`, `directional-slide`, `icon-trail`, SVG/code-diagram media, bottom-safe captions, organic sound, and no Three.js.
- `docs/VISUAL_RECIPE_ROADMAP.md` is a superseded compatibility pointer and there is no active handoff document.
- Private default VoxCPM references exist under ignored `voices/clone/`; orphan legacy containers are observed but are outside this non-destructive slice.

## Design Selection

1. Selected: a stable DNS-resolution explainer with a repo-authored/localized SVG. It proves the full chain without current-event research, browser-capture fragility, or new shared abstractions.
2. A documentary capture would add network, readability, and licensing risk without improving the deterministic workflow proof.
3. A cinematic 3D proof would add render risk and would make the required existing-visual-asset evidence less direct.

The three narration beats are cache/recursive lookup, root/TLD/authoritative traversal, and answer/TTL/cache return. They stay topic-local and factual; the composition does not become a generic DNS template.

## Explicit Scope

### Create

- `scripts/producer-final-acceptance-smoke.mjs` — focused Phase 9B RED/GREEN, workflow, docs, frozen-boundary, and forbidden-source guard.
- `scripts/fixtures/producer-final-acceptance/create-assets.sh` — deterministic ignored BGM, ambience, and SFX fixture generator.
- `scripts/fixtures/producer-final-acceptance/dns-resolution-map.svg` — repo-authored DNS path visual source, localized through the asset system before render.
- `src/remotion/DnsResolutionExplainer/index.ts` — public composition exports.
- `src/remotion/DnsResolutionExplainer/types.ts` — ids, dimensions, transition duration, generated total duration, and scene/audio types.
- `src/remotion/DnsResolutionExplainer/script.ts` — separate clean `displayText` and punctuation-aligned `ttsText` for three scenes.
- `src/remotion/DnsResolutionExplainer/generate.mjs` — direct high-fidelity VoxCPM runner using ignored default references.
- `src/remotion/DnsResolutionExplainer/audio.generated.ts` — generated tracked duration/caption metadata only; no audio bytes.
- `src/remotion/DnsResolutionExplainer/data.ts` — duration-owned scenes, starts, labels, and localized asset paths.
- `src/remotion/DnsResolutionExplainer/DnsResolutionExplainer.tsx` — paper effect, sequential SVG path reveal, captions, narration, official transitions, and soundtrack.
- `src/remotion/DnsResolutionExplainer/soundtrack.tsx` — BGM/ambience, narration ducking, and three intentional local SFX cues.
- `src/remotion/DnsResolutionExplainer/cover.tsx` — 16:9 and 9:16 code-rendered covers.
- `src/remotion/DnsResolutionExplainer/manifest.ts` — `QualityGatedMaintainedProducerSampleManifest`.
- `src/remotion/DnsResolutionExplainer/assets.supply.json` and `assets.manifest.json` — deterministic supply plan and localized asset evidence.
- `src/remotion/DnsResolutionExplainer/validation.ts` — maintained sample/audio/asset/Root contract input.
- `src/remotion/DnsResolutionExplainer/quality.ts` — measured layout, safe-area, evidence, rendered-frame, artifact, chapter, and Git expectations.
- `src/remotion/DnsResolutionExplainer/render-metadata.json` — MP4 metadata and exact chapter starts.
- `src/remotion/DnsResolutionExplainer/publishing.md` — topic-facing publishing copy and local artifact handoff.
- this plan — RED/GREEN, render review, validation, and closure evidence.

### Modify

- `package.json` — add only the Phase 9B focused smoke and fixture command.
- `src/remotion/Root.tsx` — register one new video and two new Still covers in Agent Producer inventory.
- `src/remotion/producer-samples/registry.ts` — append one quality-gated maintained manifest; do not edit prior manifest objects.
- focused Producer OS/sample-manifest/promotion/validation/architecture/skill guards only where their exact completed-count/status expectations require the new acceptance proof.
- `AGENTS.md`, `README.md`, `docs/FINAL_PRODUCT_GOAL.md`, `docs/ITERATION_STATUS.md`, `docs/AGENT_PRODUCER_ONLY_ROADMAP.md`, `docs/REMOTION_COMPONENT_LIBRARY.md`, `docs/PRODUCER_PROMOTION_GATE.md`, and `docs/architecture/agent-producer-only-removal-inventory.json`.
- `.agents/skills/ai-video-studio-agent-producer/SKILL.md` and `.agents/skills/remotion-best-practices/SKILL.md`; inspect `scripts/AGENTS.md` and `src/remotion/AGENTS.md` and change them only if they conflict.

### No deletions

Phase 9B deletes no source, composition, archive, compatibility, provider, ignored, private, generated, or orphan-container path. Superseded documents already under `docs/archive/` and the `VISUAL_RECIPE_ROADMAP.md` compatibility pointer remain in place.

## Explicit Non-Goals

- no change, migration, formatting pass, registration rewrite, narration regeneration, still render, or MP4 render for any existing completed/frozen composition
- no shared primitive/block/effect/transition/style extraction from the DNS sample
- no new dependency, Remotion version, provider, environment variable, Compose topology, provider runtime, asset schema, or quality-gate relaxation
- no live Web source capture, remote render-critical URL, fabricated screenshot, generated visual fallback, or current-event claim
- no automatic aesthetic score, automatic creative approval, or automatic repair
- no repository-wide historical lint cleanup
- no committed WAV, MP4, PNG, localized generated asset, `public/generated`, `out`, private voice/model, secret, or credential
- no next Roadmap phase creation after closure and no push

## Frozen And Artifact Boundary

- Record pre-change hashes/diffs for `src/remotion/AgentProducerMediaSoundProof/`, `src/remotion/TcpHandshakeEditorial/`, `src/remotion/TcpHandshakeTerminal/`, all `frozen-reference` composition paths, and historical metadata; verify zero tracked diff before commit.
- Fixture WAVs and localized SVG/audio live only under `public/generated/dns-resolution-explainer/assets/`.
- VoxCPM narration/progress/summary live only under `public/generated/dns-resolution-explainer/audio/` until asset localization copies narration into the composition asset root.
- Review frames, covers, MP4, and final metadata live only under `out/dns-resolution-explainer/`.
- Only source SVG/script, composition source/JSON/Markdown, guards/docs, and generated textual audio/asset metadata may be committed.

## Dependency And Call-Chain Evidence

```txt
producer:scaffold --name DnsResolutionExplainer --slug dns-resolution-explainer
                  --style-profile hand-drawn-explainer
  -> QualityGatedMaintainedProducerSampleManifest + quality.ts
  -> script.ts / generate.mjs
  -> runProducerAudioGeneration(high-fidelity-clone)
  -> three measured WAV tracks + duration-derived captions

create-assets.sh + dns-resolution-map.svg + narration WAVs
  -> producer:assets
  -> assets.manifest.json
  -> producer:preflight
  -> producer:validate

DnsResolutionExplainer.tsx
  -> getProducerStyleProfile("hand-drawn-explainer")
  -> code-driven paper gradients + frame-derived SVG treatment
  -> local Img(staticFile("generated/dns-resolution-explainer/assets/dns-resolution-map.svg"))
  -> TransitionSeries(getProducerTransitionPreset("directional-slide"))
  -> ProducerSoundtrack(BGM + ambience + three SFX + narration ducking)
  -> duration-derived captions and per-scene narration Audio

manifest.ts -> registry.ts -> Root.tsx
  -> producer:stills -> visual review
  -> producer:render -> MP4/metadata/covers
  -> producer:quality -> FFmpeg/ffprobe/Git deterministic evidence
```

---

### Task 1: Add And Observe The Phase 9B RED Guard

**Files:** create `scripts/producer-final-acceptance-smoke.mjs`; modify `package.json`.

**Interfaces:** The smoke consumes tracked source/docs/package state and produces one exit-code gate. It must not create source or generated artifacts.

- [x] **Step 1: Add the focused static guard before production source**

Require the new composition manifest, quality module, fixture SVG/script, Root/registry ownership, exact `hand-drawn-explainer` profile, deterministic paper/opacity treatment, `directional-slide`, BGM/ambience, at least two SFX, quality command, completed Phase 9/Roadmap status, and zero forbidden tokens in the new render/runtime source.

- [x] **Step 2: Add the package command**

Add `"smoke:producer-final-acceptance": "node scripts/producer-final-acceptance-smoke.mjs"` and `"producer:final-acceptance-assets": "bash scripts/fixtures/producer-final-acceptance/create-assets.sh"`.

- [x] **Step 3: Run Docker RED**

Run: `docker compose run --rm producer bash -lc 'npm run smoke:producer-final-acceptance'`.

Expected: exit `1` on `Missing Phase 9B final acceptance surface: src/remotion/DnsResolutionExplainer/manifest.ts`, not Docker, syntax, dependency, or historical lint failure.

### Task 2: Scaffold The Strict Future Contract

**Files:** create the `DnsResolutionExplainer` source contract through `apply_patch`; modify Root and registry only after the manifest is structurally complete.

**Interfaces:** The composition exports `DNS_RESOLUTION_EXPLAINER_*` constants, `DnsResolutionExplainer`, `DnsResolutionExplainerCover16x9`, `DnsResolutionExplainerCover9x16`, `dnsResolutionExplainerManifest`, and `producerQualityPlan`.

- [x] **Step 1: Prove the real future scaffold outside the repository**

Run:

```bash
npm run producer:scaffold -- --name DnsResolutionExplainer --slug dns-resolution-explainer --style-profile hand-drawn-explainer --output-root /tmp/phase9b-scaffold
```

Expected: scaffold succeeds under `/tmp/phase9b-scaffold`, the manifest satisfies `QualityGatedMaintainedProducerSampleManifest`, and no scaffold output appears in the repository.

- [x] **Step 2: Create the dedicated source contract**

Define 1920x1080/30fps constants, scene ids `cache`, `delegation`, and `answer`, a 16-frame directional transition, strict quality-gated manifest ownership, three review frames, the two Still ids, and chapter metadata derived from final scene durations.

```ts
export const DNS_RESOLUTION_EXPLAINER_COMPOSITION_ID = "DnsResolutionExplainer";
export const DNS_RESOLUTION_EXPLAINER_FPS = 30;
export const DNS_RESOLUTION_EXPLAINER_WIDTH = 1920;
export const DNS_RESOLUTION_EXPLAINER_HEIGHT = 1080;
export const DNS_RESOLUTION_EXPLAINER_TRANSITION_IN_FRAMES = 16;
export type DnsResolutionExplainerSceneId = "cache" | "delegation" | "answer";
```

- [x] **Step 3: Register only Phase 9B surfaces**

Append exactly one registry import/entry and one video plus two Still registrations. Existing registry objects and Root registrations remain byte-identical.

### Task 3: Implement The Acceptance Visual And Sound Language

**Files:** renderer, data/types, fixture SVG/script, soundtrack, covers.

**Interfaces:** `DnsResolutionExplainer` consumes generated audio metadata and repository-local asset paths; `DnsResolutionExplainerSoundtrack` consumes final duration and narration windows.

- [x] **Step 1: Build one honest manifest-backed DNS visual**

Create a 1600x720 SVG containing browser/cache, recursive resolver, root, TLD, authoritative server, and answer nodes. It uses no remote content, fabricated screenshot chrome, generated model field, or private source.

- [x] **Step 2: Apply the selected profile in production**

Render a profile-aligned paper surface with deterministic code gradients, place the localized SVG through `Img/staticFile`, and treat it with frame-driven opacity/scale. Use `TransitionSeries` with `directional-slide`; no CSS animation/transition or random state.

```tsx
<AbsoluteFill
  style={{
    backgroundImage:
      "radial-gradient(...), repeating-linear-gradient(...)"
  }}
/>
<Img src={staticFile("generated/dns-resolution-explainer/assets/dns-resolution-map.svg")} />
```

```ts
const transition = getProducerTransitionPreset({
  id: "directional-slide",
  direction: "from-right",
  durationInFrames: DNS_RESOLUTION_EXPLAINER_TRANSITION_IN_FRAMES,
});
```

- [x] **Step 3: Add deterministic sound design**

Generate licensed repo-authored BGM, ambience, pencil/query, hop, and answer confirmation WAVs with FFmpeg. Route them through `ProducerSoundtrack`, narration windows, deterministic ducking, and at least three explicit cue frames.

- [x] **Step 4: Build topic-specific covers**

Render one 16:9 and one 9:16 cover from code and the localized SVG. Keep a single focal DNS path, safe margins, readable Chinese, and no internal production labels.

### Task 4: Generate Real Narration And Supply Assets

**Files:** script/generator/audio metadata, supply/final manifests, fixture outputs under ignored roots.

**Interfaces:** `runProducerAudioGeneration()` writes three tracks and updates the total duration constant; `producer:assets` writes the strict final manifest consumed by preflight/validation.

- [x] **Step 1: Finalize clean narration text**

Use separate `ttsText`/`displayText`, matching punctuation boundaries, no control text or expression tags in captions, and high-fidelity clone with exact ignored prompt transcript/reference inputs.

```ts
export const dnsResolutionNarrationBeats = [
  {
    id: "cache",
    ttsText: "输入域名后，浏览器先检查本机和系统缓存；没有答案，才把问题交给递归解析器。",
    displayText: "输入域名后，浏览器先检查本机和系统缓存；没有答案，才把问题交给递归解析器。",
    narrationRequired: true,
    language: "zh-CN",
  },
  {
    id: "delegation",
    ttsText: "解析器先问根服务器，再找到顶级域服务器，最后抵达权威服务器；每一步都返回下一站的线索。",
    displayText: "解析器先问根服务器，再找到顶级域服务器，最后抵达权威服务器；每一步都返回下一站的线索。",
    narrationRequired: true,
    language: "zh-CN",
  },
  {
    id: "answer",
    ttsText: "权威服务器给出记录和生存时间；解析器缓存结果，把 IP 地址交回浏览器，后续查询因此更快。",
    displayText: "权威服务器给出记录和生存时间；解析器缓存结果，把 IP 地址交回浏览器，后续查询因此更快。",
    narrationRequired: true,
    language: "zh-CN",
  },
] as const;
```

- [x] **Step 2: Generate direct VoxCPM narration**

Run the composition generator without gating on `/ready`. Require three positive measured WAV tracks, provider `voxcpm`, clean duration-derived captions, and no fallback or silent placeholder.

- [x] **Step 3: Generate/localize and preflight assets**

Run the fixture command, `producer:assets`, then `producer:preflight -- --composition DnsResolutionExplainer`. Require one SVG, three narration tracks, one BGM, one ambience, and at least three SFX with complete integrity/provenance/license/media/sound metadata.

- [x] **Step 4: Run maintained validation**

Run `producer:validate -- --module src/remotion/DnsResolutionExplainer/validation.ts` and prove profile, narration/scene/caption alignment, sound roles, asset agreement, Root registration, ignored roots, and quality ownership.

### Task 5: Review Stills, Covers, Render, And Quality

- [x] **Step 1: Render representative stills and observe quality RED if necessary**

Run `producer:stills -- --composition DnsResolutionExplainer`. Inspect opening, traversal, and answer frames at original size for one focal point, safe margins, Chinese readability, caption clearance, no overlap/blank media, and honest asset labeling. If a frame fails, change composition/layout or planned frame rather than relaxing quality thresholds.

- [x] **Step 2: Render and inspect both covers**

Inspect 16:9 and 9:16 covers at original and thumbnail scale for hierarchy, bounds, contrast, and topic clarity.

- [x] **Step 3: Render MP4 and inspect audio/video**

Run `producer:render -- --composition DnsResolutionExplainer`; verify H.264/AAC, 1920x1080, 30fps, duration/frame agreement, chapters, full decode, audio peak/silence, narration/BGM balance evidence, transition timing, and no missing asset.

- [x] **Step 4: Turn the Phase 9A real quality path GREEN**

Finalize `quality.ts` with measured layout evidence and exact rendered paths/timing, then run `producer:quality -- --module src/remotion/DnsResolutionExplainer/quality.ts`. It must use real review PNGs, MP4, metadata, FFmpeg/ffprobe, and Git evidence.

### Task 6: Complete Forbidden Scan And Active Documentation Closure

**Files:** all active authority/skill/local-AGENTS docs, removal inventory, affected guards, and this execution record.

- [x] **Step 1: Run the complete active-tree scan before docs closure**

Scan executable/config/package surfaces for `F5_TTS_`, F5 provider selection, `NEXT_ORIGIN` with `/api/tts`, removed `/api/*` video routes, `VideoProject`, `VideoSegment`, `StoryboardPlan`, selected-segment regeneration, planner recipe manifests, and selected-template compiler. Only archived docs and truthful frozen `provider: "f5-tts"` metadata may remain; present-tense active docs must describe removed concepts only as forbidden/history.

- [x] **Step 2: Mark Phase 9 and the Roadmap complete only after evidence exists**

Add Phase 9 to `completedPhases`, add a `final-acceptance-closure` slice, record the new composition/profile/asset/narration/still/cover/render/quality evidence, state there is no next Roadmap phase, and preserve the frozen/local-only boundary.

- [x] **Step 3: Check every active surface**

Align README, AGENTS, goal/status/Roadmap, component/promotion docs, removal inventory, both skills, local AGENTS, package scripts, provider doc, asset contract, `.env.example`, Compose, superseded pointer, and this plan. Modify only surfaces with a factual Phase 9B conflict; record unchanged surfaces explicitly.

### Task 7: Docker-First Closure, Review, And One Commit

- [x] **Step 1: Run focused and retained contract suite**

Run the Phase 9B smoke; quality, scaffold/profile, style, capabilities, media/sound, assets, validation, review, Producer OS/sample/promotion, audio, architecture/Web-removal, and skill smokes.

- [x] **Step 2: Run full Docker gates**

Run Docker `tsc --noEmit`, repository lint, build, and Remotion composition listing. Typecheck/build/listing must pass; report lint honestly against the 39-error/2-warning baseline and prove no changed file is added to it.

- [x] **Step 3: Run changed-file and boundary checks**

Run changed-file ESLint and Prettier, shell syntax, JSON/SVG parse, Compose config, `git diff --check`, forbidden scans, frozen-source diff, ignored/generated/private artifact checks, binary/secret scan, and staged review.

- [x] **Step 4: Create one bounded commit**

Stage only Phase 9B source/text metadata, fixture sources, Root/registry integration, guards/package scripts, active-doc/skill closure, inventory, and this plan. Commit with `feat: complete producer roadmap acceptance`. Do not push.

## RED Check

The first Docker `smoke:producer-final-acceptance` must fail against `ef3aa76` because the Phase 9B composition is absent. Subsequent sub-REDs must catch missing quality ownership, Root/registry registration, narration, asset roles, review outputs, render metadata, forbidden references, and premature Roadmap completion before GREEN.

## GREEN Result Required

- one new `DnsResolutionExplainer` quality-gated maintained composition using `hand-drawn-explainer`
- one real manifest-backed local SVG plus deterministic paper/opacity treatment and official `directional-slide`
- direct high-fidelity VoxCPM narration with three positive measured tracks and duration-derived captions
- local BGM/ambience and at least two intentional SFX through Producer sound runtime
- passing supply/preflight/validation/still/cover/render/ffprobe/quality gates with actual visual/audio review evidence
- complete active-tree forbidden scan and one consistent Producer-only authority set
- Phase 9 and the Roadmap complete; no invented next phase
- zero completed/frozen/provider/config/dependency/private/generated/binary commit contamination

## Focused Validation

Primary RED/GREEN command: `npm run smoke:producer-final-acceptance`. Real acceptance commands: `producer:preflight`, `producer:validate`, `producer:stills`, `producer:render`, and `producer:quality`. Supporting checks cover quality/scaffold/profile, media/sound, asset/OS/manifest/promotion, direct VoxCPM/audio, architecture/Web removal, Remotion capabilities, and skill alignment.

## Docker-First Validation

Docker owns fixture generation, narration runtime access, asset supply/preflight, TypeScript, lint evidence, build, composition listing, stills, covers, MP4 rendering, FFmpeg/ffprobe quality evidence, and changed-file style checks. Host commands are limited to Git/source review and local image inspection.

## Documentation Alignment Boundary

Align all active authorities and skills only after the acceptance evidence passes. `docs/VISUAL_RECIPE_ROADMAP.md` remains a superseded pointer, archives remain historical, provider/asset/env/Compose are changed only for direct conflicts, and no handoff document is created because the skill plus final status/plan are the active handoff surfaces.

## Commit Boundary

One commit contains the new Phase 9B composition and source fixtures, tracked textual narration/asset metadata, registry/Root integration, focused/retained guards, complete active-doc/skill/inventory closure, and this execution record. It contains no generated binary, localized generated asset, private file, frozen edit, dependency/provider/environment/Compose change, or future Roadmap work.

## Stop Condition

Stop after the local Phase 9B commit and final status verification. Report that Phase 9 and the current Roadmap are complete, there is no next Roadmap phase, and no follow-on work has started. Do not push.

## Plan Self-Review

- Spec coverage: current facts, bounded goal, exact scope/non-goals, files, frozen boundary, CodeGraph chain, RED/GREEN, real production chain, focused/Docker validation, docs, commit, and stop condition are explicit.
- Placeholder scan: the plan contains no relaxed allowlist, fake passing measurement, generated fallback, unspecified deletion, skipped review, or aesthetic auto-approval.
- Type consistency: composition/slug/profile/scene ids, manifest ownership, Root/registry ids, quality module, artifact paths, and command names match across tasks.
- Scope check: the one final acceptance composition plus closure is exactly Phase 9B; shared extraction, old-video changes, provider/config/dependency work, committed binaries, and a new phase remain excluded.

## Execution Record

- Start truth: branch `refactor/agent-producer-service`, commit `ef3aa76`, clean tracked worktree, no user changes.
- Baseline: Docker quality/scaffold-profile/architecture/skill smokes and TypeScript pass.
- RED: Docker `npm run smoke:producer-final-acceptance` exited `1` on `Missing Phase 9B final acceptance surface: src/remotion/DnsResolutionExplainer/manifest.ts` before production source existed.
- Scaffold proof: `producer:scaffold --name DnsResolutionExplainer --slug dns-resolution-explainer --style-profile hand-drawn-explainer --output-root /tmp/phase9b-scaffold` completed outside the repository and emitted the strict quality-gated contract.
- Narration: direct high-fidelity VoxCPM produced three positive tracks: cache `218` frames/`7.282375s`, delegation `258` frames/`8.592229s`, and answer `261` frames/`8.698771s`. The tracked total narration duration is `737` frames; audio bytes remain ignored.
- Asset RED/GREEN: the first strict preflight rejected `paper-room` because its level was below the configured silence threshold. Raising the deterministic fixture to `volume=0.025` preserved the gate and made all `9` manifest assets pass supply/preflight.
- Render review root cause: full-screen and bounded Remotion `Solid` canvases produced non-deterministic black viewport regions in headless stills. Three isolated attempts ruled out SVG clipping, transition nesting, and the `paper` descriptor. Removing `Solid` eliminated the artifact, so the final acceptance video uses deterministic CSS paper gradients and frame-derived SVG opacity/scale as the required code-driven effect treatment.
- Visual review: original-size cache, delegation, and answer stills passed focal-point, caption-clearance, bounds, and asset checks. Both code-rendered covers passed after the portrait title was reduced to `104px` and the SVG changed to `objectFit: contain` to prevent crop/orphan-line defects.
- Quality RED/GREEN: the first `737`-frame MP4 exposed normal AAC padding beyond the one-frame duration tolerance. A two-frame silent visual end hold fixed container/video agreement without relaxing the quality gate or stretching narration. Final ffprobe evidence is H.264 `1920x1080`, `30/1`, `739` frames, `24.633333s`, AAC `24.618667s`, and `5,278,787` bytes; all three chapters and full decode pass `producer:quality`.
- Retained contracts: the complete 19-command focused/quality/profile/capability/media/asset/validation/review/OS/sample/promotion/audio/architecture/Web-removal/skill suite passes in Docker. Exact maintained-proof and inventory snapshot guards were advanced to four chronological proofs and Phase 9B closure; old proof invariants remain explicit.
- Docker closure: `tsc --noEmit`, build, and Remotion composition listing pass; `DnsResolutionExplainer` lists at `739` frames with both Still covers. Changed-file ESLint and Prettier pass. Full lint is the unchanged historical baseline of `39` errors and `2` warnings and contains no changed file.
- Boundaries: shell syntax, JSON parse, SVG asset preflight, Compose config, `git diff --check`, focused forbidden scans, frozen-source zero-diff, and Git ignore checks pass. All new source/metadata are text; WAV/PNG/MP4/localized/generated/private paths remain ignored.
- Docs: AGENTS, README, goal/status/Roadmap, promotion/component/provider docs, removal inventory, both active skills, and the historical design supersession notice are aligned. The superseded visual-roadmap pointer, asset contract, `.env.example`, Compose, local AGENTS files, and frozen-local docs were inspected and required no change; no handoff was created.
- Commit hash and post-commit status are reported in the final handoff because a commit cannot contain its own hash.
