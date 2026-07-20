# Agent Producer Skill Context-Budget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 3,336-word Agent Producer entrypoint with a <=500-word task router and five just-in-time references while preserving every supported production rule.

**Architecture:** Keep `.agents/skills/ai-video-studio-agent-producer/SKILL.md` as the only discoverable production entrypoint. Extract narration, assets/evidence, Remotion composition, render/review/quality, and full-video orchestration into focused Markdown references, then redirect smoke assertions to the file that owns each contract. Introduce the context-budget guard only after the references are independently protected so the final entrypoint rewrite can be a small RED/GREEN step.

**Tech Stack:** Agent Skills Markdown/YAML, Node.js ESM smoke scripts, npm scripts, Docker `producer`, Git.

---

## File Structure

Create:

- `.agents/skills/ai-video-studio-agent-producer/references/narration.md` — direct VoxCPM, captions, science voice, audio recovery and verification.
- `.agents/skills/ai-video-studio-agent-producer/references/assets-evidence.md` — visual-source classification, library/stock acquisition, manifest and evidence rules.
- `.agents/skills/ai-video-studio-agent-producer/references/remotion-composition.md` — dedicated composition, current Remotion capabilities, style profiles and frame-driven construction.
- `.agents/skills/ai-video-studio-agent-producer/references/render-review-quality.md` — validation, stills, render, covers, quality, publishing and handoff.
- `.agents/skills/ai-video-studio-agent-producer/references/full-video-workflow.md` — production brief and stage orchestration without duplicating stage procedures.

Modify:

- `.agents/skills/ai-video-studio-agent-producer/SKILL.md` — compact <=500-word router.
- `scripts/smoke/architecture/skill-alignment-smoke.mjs` — reference ownership and word-budget contract.
- `scripts/smoke/architecture/stock-assets-mcp-alignment-smoke.mjs` — asset guidance target.
- `scripts/smoke/architecture/agent-producer-architecture-smoke.mjs` — active skill-bundle forbidden scan.
- `scripts/smoke/architecture/agent-producer-web-removal-smoke.mjs` — active skill-bundle frozen-recipe scan.
- `scripts/smoke/producer/producer-asset-library-smoke.mjs` — consumption guidance target.
- `scripts/smoke/producer/remotion-capabilities-smoke.mjs` — Remotion guidance target.
- `scripts/smoke/producer/producer-media-sound-smoke.mjs` — media/sound guidance target.
- `scripts/smoke/producer/producer-style-profiles-smoke.mjs` — current style guidance without Roadmap history in the entrypoint.
- `scripts/smoke/producer/producer-style-profile-sample-contract-smoke.mjs` — profile scaffold guidance target.
- `scripts/smoke/producer/producer-style-profile-real-compositions-smoke.mjs` — current style proof routing without milestone coupling.
- `scripts/smoke/producer/producer-quality-gates-smoke.mjs` — quality guidance target.
- `scripts/smoke/producer/producer-final-acceptance-smoke.mjs` — render/final-review guidance target and authority-only Phase 9 status.
- `docs/superpowers/specs/2026-07-20-agent-producer-skill-context-budget-design.md` — mark implemented only after all gates pass.

Do not modify README, AGENTS, iteration status, Roadmap, runtime TypeScript,
composition source, manifests, generated artifacts, or private voice files.

### Task 1: Extract Narration Guidance

**Files:**

- Create: `.agents/skills/ai-video-studio-agent-producer/references/narration.md`
- Modify: `scripts/smoke/architecture/skill-alignment-smoke.mjs:68-151`
- Modify: `scripts/smoke/architecture/skill-alignment-smoke.mjs:289-344`

- [x] **Step 1: Route narration assertions to the not-yet-existing reference**

Add the path and read near the existing `producerSkill` declaration:

```js
const producerNarrationReferencePath =
  ".agents/skills/ai-video-studio-agent-producer/references/narration.md";
const producerNarrationReference = read(producerNarrationReferencePath);
```

Move these assertions from `producerSkill` to
`producerNarrationReference`: `punctuation-split`, `trimmed and concatenated`,
the three VoxCPM modes, `scripts/lib/producer-audio/`, `voices/clone/`,
`public/generated/<slug>/audio/`, scene recovery/fail-closed rules, `/ready`
reload behavior, `displayText`, the complete science profile token set, and the
accepted audition line.

In `activeScienceExplainerDocs`, replace the Agent Producer tuple with:

```js
[producerNarrationReference, "Agent Producer narration reference science explainer default"],
```

- [x] **Step 2: Run RED and verify the missing reference is the reason**

Run:

```bash
npm run smoke:skill-alignment
```

Expected: FAIL with `ENOENT` naming
`.agents/skills/ai-video-studio-agent-producer/references/narration.md`.

- [x] **Step 3: Create the narration reference**

Create the file with these exact sections and contracts:

```markdown
# Narration, Captions, And Audio

Use this reference for narration, voice choice, TTS text, caption timing,
audio recovery, or audio verification. Before final VoxCPM text, clone text,
control instructions, or expression tags, read
`../voxcpm-expression/VOXCPM_EXPRESSION.md`.

## Direct VoxCPM Contract

- Use only `scripts/lib/producer-audio/`; never call `/api/tts` or restore a
  provider selector.
- Select exactly one mode: `voice-design`, `controllable-clone`, or
  `high-fidelity-clone`.
- Call narration directly when `/ready` reports cold `503/loading`; the first
  real request reloads the model automatically, so `/ready` is diagnostic,
  not a gate.
- Keep spoken `ttsText` separate from visible `displayText`.
- Use punctuation-split synthesis, trim each returned chunk, then keep chunks
  trimmed and concatenated into one WAV per scene.
- Let measured chunk durations produce caption cues and scene duration.
- Store private references under ignored `voices/clone/` paths and outputs,
  progress, and summary under `public/generated/<slug>/audio/`.
- Save progress after each scene id. Reuse a scene only when its request
  fingerprint matches and its WAV still exists.
- Required narration fails closed on connection, timeout, reference,
  response-format, empty-audio, or duration errors. Never fall back to F5,
  another provider, or a silent completion.

## Chinese Science-Explainer Default

Future Chinese science-explainer narration defaults to the user-accepted
`science-explainer-young-male`. Normal work uses `controllable-clone` with
`voices/clone/science-explainer-young-male.wav` and compact per-beat controls.
When highest timbre fidelity is required, use `high-fidelity-clone` with the
same WAV and exact same-name transcript at
`voices/clone/science-explainer-young-male.txt`, without a control instruction.
An explicit production brief may override this science-only default;
non-science content retains the existing default clone configuration. Missing
private files fail closed and must not silently fall back to `lyy`, F5, or
another provider. User audition status: accepted on 2026-07-19.

## Audio Review And Handoff

Run `npm run smoke:producer-audio-direct-voxcpm` and
`npm run smoke:producer-audio-tools`. Verify codec, sample rate, channel count,
duration, audible level, clipping, long silence, trimmed boundaries, caption
order, and ignored/untracked status. Handoff records narration mode, caption
method, audio paths, verification results, and any failed scene ids.
```

- [x] **Step 4: Run GREEN**

Run:

```bash
npm run smoke:skill-alignment
git diff --check
```

Expected: both commands PASS.

- [x] **Step 5: Commit**

```bash
git add .agents/skills/ai-video-studio-agent-producer/references/narration.md \
  scripts/smoke/architecture/skill-alignment-smoke.mjs
git commit -m "docs: extract agent producer narration guidance"
```

### Task 2: Extract Asset And Evidence Guidance

**Files:**

- Create: `.agents/skills/ai-video-studio-agent-producer/references/assets-evidence.md`
- Modify: `scripts/smoke/architecture/skill-alignment-smoke.mjs:79-176`
- Modify: `scripts/smoke/architecture/stock-assets-mcp-alignment-smoke.mjs:61-110`
- Modify: `scripts/smoke/producer/producer-asset-library-smoke.mjs:32-58`

- [x] **Step 1: Route asset assertions to the not-yet-existing reference**

Use the same path variable in all three smokes:

```js
const producerAssetsReferencePath =
  ".agents/skills/ai-video-studio-agent-producer/references/assets-evidence.md";
const producerAssetsReference = read(producerAssetsReferencePath);
```

For `producer-asset-library-smoke.mjs`, use `readFileSync` instead of its local
`read` helper. Move all producer-side library, `ProducerAssetManifest`, visual
source, stock tool, receipt, candidate path, localization and preflight
assertions to this reference. Keep all asset-library management prohibitions
active on both the entrypoint and asset reference.

- [x] **Step 2: Run RED**

Run:

```bash
npm run smoke:skill-alignment
npm run smoke:stock-assets-mcp-alignment
```

Expected: both fail only because `references/assets-evidence.md` is missing.

- [x] **Step 3: Create the asset/evidence reference**

Create these exact sections: `Visual-Source Decision Gate`, `Library First`,
`Pexels Fallback`, `Manifest And Local Paths`, and `Evidence Honesty`. Preserve
the following operative wording:

```markdown
## Visual-Source Decision Gate

Classify every named narration beat before search:

- **asset-led:** a real person, place, object, product, source, or truthful
  evidence must be visible;
- **code-led:** explain a process, relationship, state change, hierarchy,
  comparison, or measured value with
  `existing primitive -> existing block -> composition-local component`;
- **hybrid:** use media as the reality or evidence anchor while code owns crop,
  layout, callouts, labels, comparison, and frame-driven motion.

Code-led beats do not call stock-assets-mcp. Stock may establish a category,
object, setting, or mood, but cannot prove a specific claim it does not
truthfully depict. Never use generic filler, a fabricated screenshot, or a
raster container for explanatory copy, charts, or process diagrams.

## Library First

Run `npm run producer:library:search -- --text <intent> --json`. Results are
candidates, not automatic creative choices. Use an active item only when its
recommended and avoided uses fit the scene. Library admission and maintenance
remain owned by `.agents/skills/ai-video-studio-asset-library/`.

## Pexels Fallback

Only for an unmatched asset-led or hybrid beat, use this order:

1. `producer:library:search`
2. `search_images`
3. `preview_images`
4. `acquire_image` without per-image confirmation
5. map `acquisition.json` provenance into `producer:assets`
6. run `producer:preflight`

The original remains under ignored `.producer-assets/stock-candidates/`.
Remotion never renders a remote URL or a path below
`.producer-assets/stock-candidates/`; it renders the localized copy under
`public/generated/<slug>/assets/`.

## Manifest And Evidence

Every visible non-code asset maps to the strict `ProducerAssetManifest` in
`docs/PRODUCER_ASSET_CONTRACT.md`. Record source, creator, license,
attribution, purpose, checksum, and media metadata. Attempt real capture for
source-backed evidence. If capture is unavailable or unreadable, record the
reason outside the frame and use an honest code-rendered information graphic.
Never label it as a screenshot or show internal fallback text in the video.
```

- [x] **Step 4: Run GREEN**

Run:

```bash
npm run smoke:skill-alignment
npm run smoke:stock-assets-mcp-alignment
npm run smoke:producer-asset-library
git diff --check
```

Expected: all commands PASS.

- [x] **Step 5: Commit**

```bash
git add .agents/skills/ai-video-studio-agent-producer/references/assets-evidence.md \
  scripts/smoke/architecture/skill-alignment-smoke.mjs \
  scripts/smoke/architecture/stock-assets-mcp-alignment-smoke.mjs \
  scripts/smoke/producer/producer-asset-library-smoke.mjs
git commit -m "docs: extract agent producer asset guidance"
```

### Task 3: Extract Remotion Composition Guidance

**Files:**

- Create: `.agents/skills/ai-video-studio-agent-producer/references/remotion-composition.md`
- Modify: `scripts/smoke/architecture/skill-alignment-smoke.mjs:73-145`
- Modify: `scripts/smoke/producer/remotion-capabilities-smoke.mjs:200-214`
- Modify: `scripts/smoke/producer/producer-media-sound-smoke.mjs:187-196`
- Modify: `scripts/smoke/producer/producer-style-profiles-smoke.mjs:113-128`
- Modify: `scripts/smoke/producer/producer-style-profile-sample-contract-smoke.mjs:99-117`
- Modify: `scripts/smoke/producer/producer-style-profile-real-compositions-smoke.mjs:149-164`

- [ ] **Step 1: Route capability assertions to the missing reference**

Add:

```js
const producerRemotionReferencePath =
  ".agents/skills/ai-video-studio-agent-producer/references/remotion-composition.md";
const producerRemotionReference = read(producerRemotionReferencePath);
```

Move capability token assertions from `producerSkill` to this reference. In
the three style-profile smokes, remove the Agent Producer `SKILL.md` from lists
that require Roadmap phase-history wording; retain those checks for the actual
authority docs and Remotion skill. Add focused assertions that the new
reference includes current profile selection, scaffold, and quality routing.

- [ ] **Step 2: Run RED**

Run:

```bash
npm run smoke:remotion-capabilities
npm run smoke:producer-media-sound
```

Expected: FAIL because `references/remotion-composition.md` is missing.

- [ ] **Step 3: Create the Remotion reference**

Use these exact responsibilities and current surfaces:

```markdown
# Remotion Composition And Capabilities

Use this reference before editing Remotion source, scenes, styles, effects,
transitions, local media, motion, or sound. Read
`.agents/skills/remotion-best-practices/SKILL.md`, then only the matching rule:
`rules/video-layout.md` for dense layout, `rules/subtitles.md` for captions,
and `rules/silence-detection.md` for gaps. Inspect the primitive inventory only
when selecting or adding visual components.

## Construction

Build one dedicated composition under `src/remotion/<CompositionName>/` and
register its video plus both cover Stills. Inventory in this order:
`existing primitive -> existing block -> composition-local component -> proven
reusable extraction`. Keep facts, narration, scene data, assets, and audio
metadata explicit. All render-critical motion uses `useCurrentFrame()`,
`interpolate()`, `spring()`, `Sequence`, `Series`, or `TransitionSeries`; never
CSS animation or transitions.

## Style And Capability Selection

Select one explicit profile with `getProducerStyleProfile()`:
`editorial-tech`, `comic-anime`, `cinematic-3d`, `retro-terminal`,
`documentary-media`, or `hand-drawn-explainer`. Scaffold with
`npm run producer:scaffold -- --name <CompositionName> --slug <slug>
--style-profile <profile-id>`. A profile constrains composition, motion,
texture, media, captions, and sound; it does not generate scene structure.

Current callable surfaces include `getProducerEffectPreset()`,
`getProducerMediaEffectPreset()`, `fitProducerText()`,
`getProducerTransitionPreset()`, `getProducerTransitionSeriesDuration()`,
`cinematic-film-burn`, `ProducerLocalVideo`, `ProducerAnimatedImage`,
`ProducerLottie`, `ProducerMotionTreatment`, and `ProducerSoundtrack`.
Inspect `AgentProducerCapabilityShowcase` before adding a new abstraction.
HTML-in-canvas requires `Config.setAllowHtmlInCanvasEnabled(true)` and the
Producer Chromium runtime.

Run `npm run smoke:remotion-capabilities`,
`npm run smoke:producer-media-sound`,
`npm run smoke:producer-style-profiles`, and
`npm run smoke:producer-style-profile-sample-contract` for the changed
boundary. Do not retrofit completed or frozen compositions.
```

- [ ] **Step 4: Run GREEN**

Run:

```bash
npm run smoke:skill-alignment
npm run smoke:remotion-capabilities
npm run smoke:producer-media-sound
npm run smoke:producer-style-profiles
npm run smoke:producer-style-profile-sample-contract
npm run smoke:producer-style-profile-real-compositions
git diff --check
```

Expected: all commands PASS.

- [ ] **Step 5: Commit**

```bash
git add .agents/skills/ai-video-studio-agent-producer/references/remotion-composition.md \
  scripts/smoke/architecture/skill-alignment-smoke.mjs \
  scripts/smoke/producer/remotion-capabilities-smoke.mjs \
  scripts/smoke/producer/producer-media-sound-smoke.mjs \
  scripts/smoke/producer/producer-style-profiles-smoke.mjs \
  scripts/smoke/producer/producer-style-profile-sample-contract-smoke.mjs \
  scripts/smoke/producer/producer-style-profile-real-compositions-smoke.mjs
git commit -m "docs: extract agent producer remotion guidance"
```

### Task 4: Extract Full Workflow And Finalization Guidance

**Files:**

- Create: `.agents/skills/ai-video-studio-agent-producer/references/full-video-workflow.md`
- Create: `.agents/skills/ai-video-studio-agent-producer/references/render-review-quality.md`
- Modify: `scripts/smoke/architecture/skill-alignment-smoke.mjs:79-151`
- Modify: `scripts/smoke/producer/producer-quality-gates-smoke.mjs:36-42`
- Modify: `scripts/smoke/producer/producer-final-acceptance-smoke.mjs:122-131`

- [ ] **Step 1: Add failing ownership assertions**

Add reads for both missing files. Require the workflow reference to contain the
brief fields, stage order, `narration duration owns timing`, and all five stage
reference paths. Require the finalization reference to contain
`producer:validate`, `producer:stills`, `producer:render`, `producer:quality`,
`ffprobe`, both cover sizes, final MP4 viewing, aesthetic-approval boundary,
publishing copy, promotion, and handoff fields.

Change `producer-quality-gates-smoke.mjs` to assert `producer:quality` and
`does not approve aesthetics` in `render-review-quality.md`. In
`producer-final-acceptance-smoke.mjs`, remove `SKILL.md` from the Phase 9 status
list and assert final-path guidance in the finalization reference instead.

- [ ] **Step 2: Run RED**

Run:

```bash
npm run smoke:skill-alignment
npm run smoke:producer-quality-gates
npm run smoke:producer-final-acceptance
```

Expected: FAIL only on the missing workflow/finalization references.

- [ ] **Step 3: Create `full-video-workflow.md`**

Include this concise orchestration contract:

```markdown
# Full Video Workflow

Use this reference for a new end-to-end production. Load each linked stage
reference immediately before that stage instead of loading every reference at
startup.

## Brief

Record audience and publishing surface, duration and aspect ratio, language
and content family, factual freshness, narration requirement, expected assets
and evidence, output slug, and local artifact root.

## Stages

1. Define narration beats and classify each as asset-led, code-led, or hybrid.
2. Read `narration.md`; generate VoxCPM audio first. Measured narration
   duration owns captions and scene timing.
3. Read `assets-evidence.md`; search, localize, manifest, and preflight every
   visible non-code asset.
4. Read `remotion-composition.md`; build the dedicated composition and covers
   from repo-owned code and manifest-backed existing assets.
5. Read `render-review-quality.md`; validate, inspect stills, revise, render,
   watch the MP4, run quality gates, and prepare publishing artifacts.

Do not introduce a planner, universal scene DSL, Web workflow, generated visual
media, second narration provider, or migration of completed/frozen work.
```

- [ ] **Step 4: Create `render-review-quality.md`**

Create sections for `Preflight And Stills`, `Render And Covers`, `Quality And
Creative Approval`, and `Handoff`. Preserve:

```markdown
Run `npm run producer:validate -- --module <validation-module>` and
`npm run producer:stills -- --composition <composition-id>` before aesthetic
approval. Inspect focal point, readable text, safe margins, caption collision,
overlap, blank/broken media, evidence honesty, and transition states.

After revisions, run `npm run producer:render -- --composition
<composition-id>` and verify the H.264/AAC MP4 with `ffprobe`. Watch the final
MP4; successful rendering is not visual or audiovisual approval.

Render registered Remotion `<Still>` covers at 1920x1080 and 1080x1920. Inspect
both full-size and as thumbnails.

Run `npm run producer:quality -- --module <quality-module>`. It checks
deterministic layout, evidence, frame, artifact, chapter, codec, and Git facts;
it does not approve aesthetics, narration balance, motion, or sound design.

Handoff records topic, composition id, artifact root, narration/caption method,
assets and provenance, inspected stills and revisions, MP4/ffprobe result,
cover paths, validation results, known issues, and the next bounded step.
Promote only reuse proved by a real composition.
```

- [ ] **Step 5: Run GREEN**

Run:

```bash
npm run smoke:skill-alignment
npm run smoke:producer-quality-gates
npm run smoke:producer-final-acceptance
git diff --check
```

Expected: all commands PASS.

- [ ] **Step 6: Commit**

```bash
git add .agents/skills/ai-video-studio-agent-producer/references/full-video-workflow.md \
  .agents/skills/ai-video-studio-agent-producer/references/render-review-quality.md \
  scripts/smoke/architecture/skill-alignment-smoke.mjs \
  scripts/smoke/producer/producer-quality-gates-smoke.mjs \
  scripts/smoke/producer/producer-final-acceptance-smoke.mjs
git commit -m "docs: extract agent producer finalization guidance"
```

### Task 5: Replace The Entrypoint With A Budgeted Router

**Files:**

- Modify: `.agents/skills/ai-video-studio-agent-producer/SKILL.md:1-580`
- Modify: `scripts/smoke/architecture/skill-alignment-smoke.mjs:68-176`
- Modify: `scripts/smoke/architecture/agent-producer-architecture-smoke.mjs:400-412`
- Modify: `scripts/smoke/architecture/agent-producer-web-removal-smoke.mjs:137-145`

- [ ] **Step 1: Add the word-budget and route guard before rewriting**

Add:

```js
const wordCount = (source) => source.trim().split(/\s+/u).length;
const producerReferencePaths = [
  "references/full-video-workflow.md",
  "references/narration.md",
  "references/assets-evidence.md",
  "references/remotion-composition.md",
  "references/render-review-quality.md",
];

assert(
  wordCount(producerSkill) <= 500,
  `Agent Producer SKILL.md exceeds the 500-word context budget: ${wordCount(producerSkill)}`,
);
for (const relativePath of producerReferencePaths) {
  assertIncludes(producerSkill, relativePath, "Agent Producer task router");
}
assertNotIncludes(producerSkill, "@.agents/skills/", "Agent Producer task router");
```

Keep only these entrypoint assertions: frontmatter, single-entrypoint wording,
`Production Chain`, `Task Routing`, five reference paths, seven stable producer
commands, core boundaries, and completion summary. Detailed tokens remain
protected by Tasks 1-4.

- [ ] **Step 2: Run RED and verify the current word count fails**

Run:

```bash
npm run smoke:skill-alignment
```

Expected: FAIL with
`Agent Producer SKILL.md exceeds the 500-word context budget: 3336` (minor
count variance is acceptable only if earlier extraction edits changed
whitespace; the count must remain greater than 500).

- [ ] **Step 3: Replace `SKILL.md` with the compact router**

Use this complete target shape:

```markdown
---
name: ai-video-studio-agent-producer
description: Use when working in /data/projects/labs/ai-video-studio and producing or revising any supported local video, narration, cover, review still, render, or publishing artifact.
---

# AI Video Studio Agent Producer

This is the only supported video-production entrypoint. Use code and existing
assets only; use VoxCPM only for new narration; create one dedicated Remotion
composition; keep completed and frozen compositions read-only.

## Production Chain

```txt
brief -> narration -> assets/preflight -> Remotion composition -> validation
-> still review -> render -> quality -> covers/publishing
```

Stable commands run in this order when their stage applies:

```bash
npm run producer:scaffold -- --name <CompositionName> --slug <slug> --style-profile <profile-id>
npm run producer:assets -- --manifest <supply-plan-json>
npm run producer:preflight -- --composition <composition-id>
npm run producer:validate -- --module <validation-module>
npm run producer:stills -- --composition <composition-id>
npm run producer:render -- --composition <composition-id>
npm run producer:quality -- --module <quality-module>
```

## Task Routing

Read only the matching reference; load another only when scope expands:

- full new video: `references/full-video-workflow.md`, then stage references
  just in time;
- narration, voice, captions, audio: `references/narration.md`;
- assets, evidence, capture, stock: `references/assets-evidence.md`;
- Remotion source, scenes, style, media, sound: `references/remotion-composition.md`;
- stills, render, covers, quality, publishing: `references/render-review-quality.md`;
- Roadmap, architecture, migration, or skill maintenance: read
  `docs/FINAL_PRODUCT_GOAL.md`, `docs/ITERATION_STATUS.md`, then
  `docs/AGENT_PRODUCER_ONLY_ROADMAP.md`.

Do not preload all references. For final VoxCPM expression or clone text,
follow the narration reference's expression-guide route. For Remotion edits,
follow the composition reference's rule-specific route.

## Boundaries

- No Web generation/editor, planner, F5 or provider fallback, image generation,
  video generation, remote render asset, fabricated screenshot, CSS animation,
  or CSS transition for render-critical motion.
- Agent judgment owns research, narration structure, visual metaphor, asset
  choice, scene composition, motion/sound design, and final audiovisual review.
- Generated media and private voice files stay ignored unless explicitly
  requested otherwise.

Finish with composition/artifact paths, narration and asset provenance,
reviewed stills and revisions, MP4/ffprobe and cover results, validation
commands, known issues, and the next bounded step.
```

- [ ] **Step 4: Scan the active skill bundle instead of only the router**

In the architecture and Web-removal smokes, define:

```js
const producerGuidancePaths = [
  ".agents/skills/ai-video-studio-agent-producer/SKILL.md",
  ".agents/skills/ai-video-studio-agent-producer/references/full-video-workflow.md",
  ".agents/skills/ai-video-studio-agent-producer/references/narration.md",
  ".agents/skills/ai-video-studio-agent-producer/references/assets-evidence.md",
  ".agents/skills/ai-video-studio-agent-producer/references/remotion-composition.md",
  ".agents/skills/ai-video-studio-agent-producer/references/render-review-quality.md",
];
const producerGuidance = producerGuidancePaths.map(read).join("\n");
```

Run the existing legacy/F5/generated-visual forbidden phrases and frozen
recipe-block checks against `producerGuidance`. Do not concatenate the bundle
inside `skill-alignment-smoke`; its positive assertions stay file-scoped.

- [ ] **Step 5: Run GREEN**

Run:

```bash
npm run smoke:skill-alignment
npm run smoke:agent-producer-architecture
npm run smoke:agent-producer-web-removal
npm run smoke:stock-assets-mcp-alignment
wc -w .agents/skills/ai-video-studio-agent-producer/SKILL.md
git diff --check
```

Expected: all smokes and `git diff --check` PASS; `wc -w` reports 500 or fewer.

- [ ] **Step 6: Commit**

```bash
git add .agents/skills/ai-video-studio-agent-producer/SKILL.md \
  scripts/smoke/architecture/skill-alignment-smoke.mjs \
  scripts/smoke/architecture/agent-producer-architecture-smoke.mjs \
  scripts/smoke/architecture/agent-producer-web-removal-smoke.mjs
git commit -m "refactor: route agent producer skill by task"
```

### Task 6: Verify Context Behavior And Close Documentation

**Files:**

- Modify: `docs/superpowers/specs/2026-07-20-agent-producer-skill-context-budget-design.md:4`

- [ ] **Step 1: Run fresh-context skill scenarios**

Run three fresh agents with no conversation context beyond the repository and
the stated task. Record their file-read choices and answer summaries outside
the repository:

```txt
Scenario A: Generate one Chinese science-explainer VoxCPM narration line. Do
not touch Remotion, assets, render, covers, or publishing. Report which Agent
Producer files you needed.

Pass: reads SKILL.md, narration.md, and VOXCPM_EXPRESSION.md only; identifies
science-explainer-young-male, controllable-clone, fail-closed behavior, audio
verification, and the local output boundary.
```

```txt
Scenario B: Select and localize one truthful stock image for an asset-led beat.
Do not generate narration or edit Remotion. Report which Agent Producer files
you needed.

Pass: reads SKILL.md and assets-evidence.md only; preserves library-first,
Pexels-only fallback, acquisition receipt, producer:assets, and preflight.
```

```txt
Scenario C: Explain the supported end-to-end command order for a new video and
which guidance is loaded at each stage. Do not execute production.

Pass: reads SKILL.md and full-video-workflow.md first; discovers all seven
stable commands and names all four stage references without claiming they must
all be preloaded.
```

- [ ] **Step 2: Run the focused regression suite**

Run:

```bash
npm run smoke:agent-producer-architecture
npm run smoke:agent-producer-web-removal
npm run smoke:skill-alignment
npm run smoke:stock-assets-mcp-alignment
npm run smoke:producer-asset-library
npm run smoke:producer-audio-direct-voxcpm
npm run smoke:producer-audio-tools
npm run smoke:remotion-capabilities
npm run smoke:producer-media-sound
npm run smoke:producer-style-profiles
npm run smoke:producer-style-profile-sample-contract
npm run smoke:producer-style-profile-real-compositions
npm run smoke:producer-quality-gates
npm run smoke:producer-final-acceptance
```

Expected: every command PASS.

- [ ] **Step 3: Run Docker-first repository verification**

Run:

```bash
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npx tsc --noEmit --pretty false'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run lint'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run build'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npx remotion compositions src/remotion/index.ts'
git diff --check
```

Expected: typecheck, build, composition listing, and `git diff --check` PASS.
If repository-wide lint retains an existing baseline, verify no modified `.mjs`
file appears in the failure set and record the fresh counts without claiming a
clean lint gate.

- [ ] **Step 4: Mark the design implemented**

Change:

```markdown
Status: approved for implementation planning
```

to:

```markdown
Status: implemented and verified on 2026-07-20
```

- [ ] **Step 5: Verify artifact and Git boundaries**

Run:

```bash
git diff --check
git status --short
git diff --name-only HEAD~4..HEAD
```

Expected: only the skill Markdown, owned smoke scripts, design status, and this
committed plan are in scope; no `public/generated/`, `out/`, `.producer-assets/`,
or `voices/clone/` path is tracked or modified.

- [ ] **Step 6: Commit closure**

```bash
git add docs/superpowers/specs/2026-07-20-agent-producer-skill-context-budget-design.md
git commit -m "docs: record agent producer skill context refactor"
```

- [ ] **Step 7: Handoff without pushing**

Report the final entrypoint word count, reference word counts, context-scenario
results, commits, focused smoke results, Docker results, lint baseline if any,
clean/dirty Git status, and any known issue. Do not push.
