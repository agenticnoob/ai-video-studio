# Agent Producer Direct VoxCPM Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the future Agent Producer narration path's Next `/api/tts` dependency with a Producer-owned direct VoxCPM runtime that supports all three approved modes, deterministic audio metadata, and scene-id recovery.

**Architecture:** Keep all new runtime ownership under `scripts/lib/producer-audio/`: a VoxCPM-only discriminated request plan, Producer-local environment config, direct JSON/multipart transport, PCM WAV processing, and progress serialization. `run.ts` remains the orchestration boundary: it treats narration as required unless a beat explicitly declares silence, reuses matching completed scene artifacts, and writes deterministic metadata/duration/summary outputs only after the batch completes. Existing Web TTS and F5 files remain untouched for their Phase 2/3 deletion owners, but they are removed from the future Producer entrypoint and scaffold.

**Tech Stack:** TypeScript 5.9, Node.js 24 fetch/FormData/Blob APIs, PCM 16-bit WAV, Node filesystem and crypto APIs, dependency-free `.mjs` smokes, Docker-first validation.

## Global Constraints

- Execute inline in `/data/projects/labs/ai-video-studio` on `refactor/agent-producer-service`; do not use subagents or create another worktree.
- Use strict RED -> GREEN. The first RED must prove that `scripts/lib/producer-audio/request.ts` still calls repository `/api/tts`.
- Make one final commit only: `feat: add direct voxcpm producer runtime`. Do not push.
- VoxCPM is the only provider reachable from future Producer audio tooling.
- Explicit modes are `voice-design`, `controllable-clone`, and `high-fidelity-clone`.
- Read private reference audio and exact transcripts directly from ignored `voices/clone/`; never upload them through Next.
- Write narration audio and recovery state under ignored `public/generated/<slug>/audio/`.
- Preserve punctuation splitting, leading/trailing silence trim, WAV concatenation, measured duration, duration-derived caption cues, and `displayText`/`ttsText` separation.
- Required narration fails closed. An intentionally silent beat must explicitly declare `narrationRequired: false` and a positive `durationInFrames`.
- Preserve successful scene artifacts after a later scene fails; resume only when scene id, request fingerprint, and output file all match.
- Do not delete or modify F5 services, adapters, scripts, config, or current removal-target documents in Phase 1.
- Do not delete Next/Web routes, `VideoProject`, Planner, templates, or editor code in Phase 1.
- Do not modify, migrate, regenerate, or reformat finished compositions or their historical `provider: "f5-tts"` metadata.
- Do not commit `public/generated/`, `out/`, `voices/`, models, audio, screenshots, or video.
- Do not introduce image/video generation, ComfyUI, an asset system, Remotion capability work, or style profiles.

## File Structure

### New runtime files

- `scripts/lib/producer-audio/config.ts` — reads and validates Producer-owned `VOXCPM_TTS_*` transport/tuning configuration without provider selection.
- `scripts/lib/producer-audio/wav.ts` — parses PCM 16-bit WAV, rejects silent/invalid chunks, trims edge silence, concatenates compatible chunks, and measures duration.
- `scripts/lib/producer-audio/progress.ts` — fingerprints request plans and serializes validated per-scene recovery state.
- `scripts/producer-audio-direct-voxcpm-smoke.mjs` — focused three-mode transport, WAV, caption, invalid-response, private-reference, and output-path smoke.

### Modified runtime and tests

- `scripts/lib/producer-audio/types.ts` — removes `ProducerAudioProviderId`; adds VoxCPM-only plan unions and explicit narrated/silent beat policy.
- `scripts/lib/producer-audio/providers/voxcpm.ts` — builds mode-safe direct plans using private reference file paths, not uploaded reference ids.
- `scripts/lib/producer-audio/request.ts` — becomes the direct VoxCPM client and writes final scene WAV files.
- `scripts/lib/producer-audio/captions.ts` — adds punctuation splitting and duration-derived clean display cues.
- `scripts/lib/producer-audio/run.ts` — adds fail-closed policy, scene-id resume, and deterministic final outputs.
- `scripts/lib/producer-audio/metadata.ts` — emits VoxCPM-only/silent summary fields without fallback-provider state.
- `scripts/lib/producer-audio/index.ts` — exports only the future VoxCPM Producer surface; the Phase 2 F5 file stays on disk but is not exported.
- `scripts/producer-audio-tools-smoke.mjs` — records the initial `/api/tts` RED, then covers orchestration, resume, explicit silence, and deterministic output.
- `scripts/producer-validation-smoke.mjs`, `scripts/lib/producer-validation.ts`, `scripts/fixtures/producer-tools/fixture-config.ts` — validate VoxCPM-only narrated tracks and explicitly silent tracks without fallback-provider policy.
- `package.json` — registers and compiles the focused direct-client smoke and updates the existing tools smoke source list.

### Modified future Producer surface

- `src/remotion/producer-samples/scaffold/SampleName/generate.mjs` — uses direct VoxCPM, `voices/clone/` paths, ignored audio/progress/summary destinations, and no origin.
- `src/remotion/producer-samples/scaffold/SampleName/audio.generated.ts` — removes the placeholder provider value that is not VoxCPM metadata.
- `scripts/agent-producer-architecture-smoke.mjs` — rejects `NEXT_ORIGIN`, origin arguments, `/api/tts`, F5 imports, and provider selection in the future Producer audio closure.
- `docs/architecture/agent-producer-only-removal-inventory.json` — reclassifies Producer audio as retained Phase 1 ownership and `/api/tts` as a Phase 3 Web deletion target.

### Modified authority and operator docs

- `.agents/skills/ai-video-studio-agent-producer/SKILL.md`
- `.agents/skills/ai-video-studio-agent-producer/voxcpm-expression/VOXCPM_EXPRESSION.md`
- `README.md`
- `AGENTS.md`
- `docs/FINAL_PRODUCT_GOAL.md`
- `docs/ITERATION_STATUS.md`
- `docs/AGENT_PRODUCER_ONLY_ROADMAP.md`
- `docs/providers/voxcpm.md`

---

### Task 1: Record The Required `/api/tts` RED

**Files:**

- Modify: `scripts/producer-audio-tools-smoke.mjs`

**Interfaces:**

- Produces: an executable assertion that the future request module contains neither `/api/tts` nor an `origin` input.
- Consumes: current on-disk `scripts/lib/producer-audio/request.ts` source.

- [ ] **Step 1: Add the failing source-boundary assertion before existing behavior tests**

Add imports and assertions equivalent to:

```javascript
import { readFileSync } from "node:fs";
import path from "node:path";

const requestSource = readFileSync(
  path.join(process.cwd(), "scripts/lib/producer-audio/request.ts"),
  "utf8",
);
assert(!requestSource.includes("/api/tts"), "Producer narration must not call repository /api/tts");
assert(!/\borigin\b/.test(requestSource), "Producer narration must not accept an origin");
```

- [ ] **Step 2: Run the existing smoke in Docker and verify RED**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/typescript ] || npm install; npm run smoke:producer-audio-tools'
```

Expected: non-zero with `Producer narration must not call repository /api/tts`. The failure must come from the old request boundary, not from TypeScript compilation or a missing dependency.

- [ ] **Step 3: Preserve the RED output for the final handoff**

Record the command, exit status, and assertion text in working notes. Do not change production code before this failure is observed.

### Task 2: Build And Verify The Direct VoxCPM Client

**Files:**

- Create: `scripts/lib/producer-audio/config.ts`
- Create: `scripts/lib/producer-audio/wav.ts`
- Create: `scripts/producer-audio-direct-voxcpm-smoke.mjs`
- Modify: `scripts/lib/producer-audio/types.ts`
- Modify: `scripts/lib/producer-audio/providers/voxcpm.ts`
- Modify: `scripts/lib/producer-audio/request.ts`
- Modify: `scripts/lib/producer-audio/captions.ts`
- Modify: `package.json`

**Interfaces:**

- Produces: `readProducerVoxcpmConfig(env?: NodeJS.ProcessEnv): ProducerVoxcpmConfig`.
- Produces: `createVoxcpmProducerRequestPlan(input): ProducerVoxcpmRequestPlan`, a discriminated three-mode union with no provider id and no uploaded reference id.
- Produces: `requestProducerNarrationAsset({slug, plan, config?, rootDir?, fetchImpl?}): Promise<ProducerNarrationAsset>`.
- Produces: `splitProducerNarrationText`, `buildProducerCaptionCues`, `trimPcmWavSilence`, `concatenatePcmWavs`, and `getPcmWavDurationSeconds`.

- [ ] **Step 1: Write the focused direct-client smoke before the new implementation**

The smoke must create a temporary repo root with `voices/clone/reference.wav`, `voices/clone/reference.txt`, and `voices/clone/timbre.wav`; inject `fetch`; and assert these exact contracts:

```typescript
type ProducerVoxcpmRequestPlan =
  | { mode: "voice-design"; sceneId: string; ttsText: string; displayText: string; control?: string }
  | { mode: "controllable-clone"; sceneId: string; ttsText: string; displayText: string; referenceAudioPath: string; control?: string }
  | { mode: "high-fidelity-clone"; sceneId: string; ttsText: string; displayText: string; promptAudioPath: string; promptTranscriptPath: string; referenceAudioPath?: string };
```

Assertions:

- `voice-design` sends punctuation-sized JSON requests to `/tts`, prefixes the control instruction once, and sends no reference fields.
- `controllable-clone` sends multipart requests to `/clone` with `reference_audio` and optional control but no transcript requirement.
- `high-fidelity-clone` sends multipart requests to `/clone_with_prompt` with transcript content read from `promptTranscriptPath`, plus `prompt_audio` and `reference_audio`, and no control.
- all private paths outside `<root>/voices/clone/` fail before fetch.
- responses must have audio content type and valid audible PCM 16-bit WAV data.
- every returned punctuation chunk is edge-trimmed, compatible chunks concatenate in order, and the final duration is measured from the written WAV.
- caption cues are contiguous, stay within final duration, use cleaned `displayText`, and retain punctuation-sized timing.
- output is exactly `<root>/public/generated/<slug>/audio/<sceneId>.wav` with `audioSrc` `generated/<slug>/audio/<sceneId>.wav`.
- a non-audio response, malformed WAV, all-silent WAV, missing reference file, or non-positive measured duration rejects.

- [ ] **Step 2: Register the focused smoke and verify the second RED**

Add:

```json
"smoke:producer-audio-direct-voxcpm": "rm -rf /tmp/producer-audio-direct-voxcpm-smoke-build && npx tsc --allowJs --target es2022 --module commonjs --moduleResolution node --skipLibCheck --esModuleInterop --noEmit false --outDir /tmp/producer-audio-direct-voxcpm-smoke-build scripts/producer-audio-direct-voxcpm-smoke.mjs scripts/lib/producer-audio/types.ts scripts/lib/producer-audio/config.ts scripts/lib/producer-audio/captions.ts scripts/lib/producer-audio/wav.ts scripts/lib/producer-audio/providers/voxcpm.ts scripts/lib/producer-audio/request.ts && node /tmp/producer-audio-direct-voxcpm-smoke-build/scripts/producer-audio-direct-voxcpm-smoke.mjs"
```

Run it in Docker. Expected: compile failure because the new modules/exports do not exist yet.

- [ ] **Step 3: Replace provider-neutral request types with the discriminated VoxCPM plan**

Delete `ProducerAudioProviderId`, `ProducerAudioRequestPlan`, and `ProducerAudioFallbackPolicy` from the future types. Define narrated/silent policy as:

```typescript
export type ProducerNarratedBeat = {
  readonly id: string;
  readonly narrationRequired?: true;
  readonly ttsText: string;
  readonly displayText?: string;
  readonly language?: string;
};

export type ProducerSilentBeat = {
  readonly id: string;
  readonly narrationRequired: false;
  readonly durationInFrames: number;
  readonly language?: string;
};
```

Keep `ProducerAudioTrack.provider` as optional literal metadata `"voxcpm"`; it is not a provider-selection abstraction. Silent tracks omit it.

- [ ] **Step 4: Implement Producer-owned config**

`readProducerVoxcpmConfig` must require an HTTP(S) `VOXCPM_TTS_BASE_URL`, derive `/tts`, `/clone`, and `/clone_with_prompt` endpoints with optional exact endpoint overrides, validate positive integer inference steps/timeout, and parse booleans for normalize, denoise, retry, and save. It must not read `TTS_PROVIDER`, `AI_VIDEO_STUDIO_TTS_PROVIDER`, `NEXT_ORIGIN`, or any F5 variable.

- [ ] **Step 5: Implement the PCM WAV helpers**

Support RIFF/WAVE PCM format `1`, 16-bit samples, any positive channel/sample-rate combination, padded RIFF chunks, compatible concatenation, edge trim with 60ms padding, positive duration measurement, and explicit rejection of malformed or entirely silent audio.

- [ ] **Step 6: Implement mode validation and private-path plans**

- `voice-design`: reject any reference path; accept optional control.
- `controllable-clone`: require `referenceAudioPath`; transcript is neither required nor accepted.
- `high-fidelity-clone`: require `promptAudioPath` and `promptTranscriptPath`; accept optional same-speaker `referenceAudioPath`; ignore/reject control at the type boundary.
- clean display copy from `displayText ?? ttsText`; require display and TTS punctuation splits to have the same non-zero chunk count so measured chunk durations map truthfully.

- [ ] **Step 7: Implement direct transport and output writing**

Use only the configured VoxCPM endpoints. Read private files directly, validate response content type before reading bytes, trim each chunk, concatenate, write once to the scene path, measure final duration from the final WAV, and return literal provider `"voxcpm"`, format `"wav"`, output path, static-file-compatible `audioSrc`, and duration-derived captions.

- [ ] **Step 8: Run the focused smoke to verify GREEN**

Run `npm run smoke:producer-audio-direct-voxcpm` in Docker. Expected: `Direct VoxCPM Producer audio smoke passed.`

### Task 3: Add Scene Recovery And Deterministic Batch Outputs

**Files:**

- Create: `scripts/lib/producer-audio/progress.ts`
- Modify: `scripts/lib/producer-audio/run.ts`
- Modify: `scripts/lib/producer-audio/metadata.ts`
- Modify: `scripts/lib/producer-audio/index.ts`
- Modify: `scripts/producer-audio-tools-smoke.mjs`
- Modify: `package.json`

**Interfaces:**

- Produces: progress version `1` with `compositionId` and ordered scene records containing `sceneId`, request fingerprint, output path, and completed track.
- Produces: `runProducerAudioGeneration` that resumes matching scene ids, fails closed for narrated beats, and creates explicit silent tracks without calling VoxCPM.
- Produces: deterministic `audio.generated.ts`, duration source, and JSON summary independent of whether a scene was generated or resumed in the current invocation.

- [ ] **Step 1: Extend the tools smoke with failing orchestration tests**

Add tests that:

1. run two required beats where scene one succeeds and scene two rejects;
2. verify progress contains only scene one after the rejection;
3. rerun with the same plans and existing scene-one WAV, assert scene one is not requested and scene two is requested;
4. change scene one's text, assert its request fingerprint invalidates the resume entry;
5. delete scene one's WAV, assert it is regenerated despite matching progress;
6. run `{id: "silent", narrationRequired: false, durationInFrames: 90}`, assert no request, empty audio/captions, no provider, and 3-second duration at 30fps;
7. assert a required request failure propagates with no fallback track;
8. run twice from identical completed inputs and assert byte-identical metadata, duration, and summary sources.

Run the smoke in Docker. Expected: compile/runtime failure because progress and new policy are not implemented.

- [ ] **Step 2: Implement progress validation and stable fingerprints**

Use SHA-256 of a stable JSON representation of the complete direct request plan. Reject malformed progress or composition-id mismatch. Resume only when fingerprint matches, the stored track is valid, and `outputPath` exists. Serialize ordered scene entries with a trailing newline after every successful scene.

- [ ] **Step 3: Implement fail-closed narrated and explicit-silent orchestration**

Remove all fallback-policy branches. Default omitted `narrationRequired` to required for compatibility, but update the future scaffold to declare it explicitly. Required request errors propagate. Silent beats require positive frames, skip plan creation/request, and emit no narration audio or caption cue.

- [ ] **Step 4: Keep final outputs deterministic**

The summary includes `compositionId`, sorted literal provider list, `sceneCount`, `narratedSceneCount`, `silentSceneCount`, and `totalDurationInFrames`. Do not include timestamps, absolute paths, generated/resumed flags, or error history. Write metadata, duration, and summary only after the full batch completes.

- [ ] **Step 5: Run both audio smokes to verify GREEN**

Run:

```bash
npm run smoke:producer-audio-direct-voxcpm
npm run smoke:producer-audio-tools
```

Expected: both success messages and zero failures.

### Task 4: Switch The Future Scaffold And Architecture Guard

**Files:**

- Modify: `src/remotion/producer-samples/scaffold/SampleName/generate.mjs`
- Modify: `src/remotion/producer-samples/scaffold/SampleName/audio.generated.ts`
- Modify: `scripts/lib/producer-validation.ts`
- Modify: `scripts/producer-validation-smoke.mjs`
- Modify: `scripts/fixtures/producer-tools/fixture-config.ts`
- Modify: `scripts/agent-producer-architecture-smoke.mjs`
- Modify: `docs/architecture/agent-producer-only-removal-inventory.json`

**Interfaces:**

- Future scaffold consumes `readProducerVoxcpmConfig`, `createVoxcpmProducerRequestPlan`, `requestProducerNarrationAsset`, and `runProducerAudioGeneration` without origin/provider selection.
- Architecture smoke scans the explicit future Producer closure while allowing the untouched Phase 2 F5 adapter and frozen generators to remain on disk.

- [ ] **Step 1: Add failing validation and architecture assertions**

Validation smoke must reject a required beat whose track lacks VoxCPM audio/provider and accept an explicit silent beat only when it has empty audio, no provider, and no captions.

Architecture smoke must read these paths:

```javascript
const futureProducerAudioPaths = [
  "scripts/lib/producer-audio/index.ts",
  "scripts/lib/producer-audio/types.ts",
  "scripts/lib/producer-audio/config.ts",
  "scripts/lib/producer-audio/captions.ts",
  "scripts/lib/producer-audio/wav.ts",
  "scripts/lib/producer-audio/progress.ts",
  "scripts/lib/producer-audio/providers/voxcpm.ts",
  "scripts/lib/producer-audio/request.ts",
  "scripts/lib/producer-audio/run.ts",
  "src/remotion/producer-samples/scaffold/SampleName/generate.mjs",
];
```

Reject `NEXT_ORIGIN`, `AI_VIDEO_STUDIO_ORIGIN`, `/api/tts`, `createF5ProducerRequestPlan`, `providers/f5`, `TTS_PROVIDER`, and an `origin:` request argument. Also assert `producer-audio` is a retained Producer-owned inventory entry and `tts-api` is Phase 3 deletion-owned.

Run `npm run smoke:producer-validation` and `npm run smoke:agent-producer-architecture`. Expected: RED on current fallback/provider validation and current scaffold origin.

- [ ] **Step 2: Switch the scaffold to direct high-fidelity VoxCPM**

Each beat declares `narrationRequired: true`. Build plans with:

```javascript
createVoxcpmProducerRequestPlan({
  beat,
  mode: "high-fidelity-clone",
  promptAudioPath: "voices/clone/lyy.wav",
  promptTranscriptPath: "voices/clone/lyy.txt",
  referenceAudioPath: "voices/clone/lyy-r.wav",
})
```

Write scene WAVs and `progress.json` under `public/generated/sample-name/audio/`, summary under `public/generated/sample-name/audio/summary.json`, generated metadata to `audio.generated.ts`, and the duration constant to `types.ts`. Pass no origin and upload no reference.

- [ ] **Step 3: Align producer validation with narration policy**

Remove configurable provider/fallback inputs. Match beats by id; required beats must have non-empty audio, provider `"voxcpm"`, positive duration, and clean ordered captions. Explicit silent beats must have no audio/provider/captions and a positive declared duration.

- [ ] **Step 4: Reclassify the inventory without deleting code**

Move the `producer-audio` inventory entry to `producerOwned` with action `retain`, phase `1`, and a direct-runtime reason. Move `tts-api` to the Phase 3 Web deletion set because no Producer caller remains. Keep `f5-producer-adapter` as Phase 2 delete and do not remove its file.

- [ ] **Step 5: Verify future-path GREEN**

Run:

```bash
npm run smoke:producer-validation
npm run smoke:agent-producer-architecture
npm run smoke:skill-alignment
```

Expected: all three pass.

### Task 5: Align Current Documentation And Skill Guidance

**Files:**

- Modify: `.agents/skills/ai-video-studio-agent-producer/SKILL.md`
- Modify: `.agents/skills/ai-video-studio-agent-producer/voxcpm-expression/VOXCPM_EXPRESSION.md`
- Modify: `README.md`
- Modify: `AGENTS.md`
- Modify: `docs/FINAL_PRODUCT_GOAL.md`
- Modify: `docs/ITERATION_STATUS.md`
- Modify: `docs/AGENT_PRODUCER_ONLY_ROADMAP.md`
- Modify: `docs/providers/voxcpm.md`
- Modify: `scripts/skill-alignment-smoke.mjs`

**Interfaces:**

- Current docs describe direct VoxCPM as implemented and future Producer narration as Next-independent.
- Historical/frozen generators may still mention `/api/tts`, but no current instruction routes new work to them.

- [ ] **Step 1: Add failing skill-alignment requirements**

Require the Agent Producer skill and VoxCPM expression doc to name the direct Producer runtime, all three mode names, `voices/clone/`, `public/generated/<slug>/audio/`, scene-id resume, and fail-closed required narration. Reject instructions to use existing direct sample scripts as a workaround, repository `/api/tts`, origins, uploaded reference ids, provider selection, or fallback.

Run `npm run smoke:skill-alignment`. Expected: RED on the current transitional `/api/tts` guidance.

- [ ] **Step 2: Update the Agent Producer workflow**

Replace transitional narration instructions with the direct library flow. Explain that generated audio precedes scene timing; progress is per scene id; `displayText` stays clean; private audio/transcript files stay under ignored `voices/clone/`; and required narration never falls back to F5 or silent WAV.

- [ ] **Step 3: Update VoxCPM mode and adapter guidance**

Rename `Repo Adapter Contract` to `Producer Direct Runtime Contract`. Document JSON `/tts`, multipart `/clone`, multipart `/clone_with_prompt`, exact transcript file behavior, direct local references, punctuation/WAV/caption ownership, and the Producer-specific environment keys. Keep the old Web adapter out of current instructions.

- [ ] **Step 4: Close Phase 1 in entry docs and Roadmap**

- README/AGENTS/FINAL_PRODUCT_GOAL: direct Producer runtime is current truth; remove the transition warning that Producer audio calls Next.
- ITERATION_STATUS: Phase 1 complete with verification facts; Phase 2 is the next bounded slice but is not started.
- Roadmap: update top status and Phase 1 status/acceptance notes without changing later phase boundaries.
- VoxCPM provider doc: direct mode request shapes, private path rules, output/recovery layout, commands, and no Next requirement.

- [ ] **Step 5: Verify documentation GREEN and forbidden guidance scan**

Run:

```bash
npm run smoke:skill-alignment
npm run smoke:agent-producer-architecture
rg -n 'NEXT_ORIGIN|AI_VIDEO_STUDIO_ORIGIN|/api/tts' scripts/lib/producer-audio src/remotion/producer-samples/scaffold/SampleName .agents/skills/ai-video-studio-agent-producer/SKILL.md .agents/skills/ai-video-studio-agent-producer/voxcpm-expression/VOXCPM_EXPRESSION.md README.md AGENTS.md docs/FINAL_PRODUCT_GOAL.md docs/ITERATION_STATUS.md docs/providers/voxcpm.md
```

Expected: both smokes pass and `rg` returns no matches. Do not include the Roadmap in this scan because it deliberately records the historical dependency and phase ordering.

### Task 6: Run The Phase 1 Gate, Review, And Commit Once

**Files:**

- Review: every changed file from Tasks 1-5
- Modify only for verification-driven corrections: the same bounded Phase 1 files

**Interfaces:**

- Produces: one verified Phase 1 commit and a clean working tree with no tracked local artifacts.

- [ ] **Step 1: Run all focused smokes fresh**

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/typescript ] || npm install; npm run smoke:producer-audio-direct-voxcpm && npm run smoke:producer-audio-tools && npm run smoke:producer-validation && npm run smoke:agent-producer-architecture && npm run smoke:skill-alignment'
```

Expected: five success messages, zero failures.

- [ ] **Step 2: Run Docker typecheck and build**

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit --pretty false'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run build'
```

Expected: both exit `0`.

- [ ] **Step 3: Run changed-file ESLint and Prettier**

Build the changed JS/TS/TSX file list from `git diff --name-only --diff-filter=ACMR` and run `npx eslint` only on that list. Run `npx prettier --check` on every changed supported source/doc/JSON file. Expected: no new changed-file lint errors and all checked files formatted.

Do not run or claim a passing repository-wide lint gate. The known baseline remains 75 existing errors plus 2 ignored generated warnings.

- [ ] **Step 4: Run final boundary and whitespace checks**

```bash
git diff --check
git status --short
git diff --stat
git diff -- scripts/lib/producer-audio src/remotion/producer-samples/scaffold/SampleName scripts/producer-audio-direct-voxcpm-smoke.mjs scripts/producer-audio-tools-smoke.mjs scripts/agent-producer-architecture-smoke.mjs
git ls-files 'public/generated/**' 'out/**' 'voices/**'
```

Expected: no whitespace errors; only planned Phase 1 files changed; no new tracked local artifact; no finished composition changes.

- [ ] **Step 5: Re-read this plan and the Phase 1 Roadmap checklist**

Confirm each deliverable, error policy, acceptance condition, strict non-goal, documentation target, and minimum verification item has evidence. If a condition cannot be proven without a live VoxCPM service, state that limitation precisely; the focused smoke must still prove real request shapes and real PCM processing with fixture responses.

- [ ] **Step 6: Stage and commit once, without push**

```bash
git add .agents/skills/ai-video-studio-agent-producer AGENTS.md README.md docs package.json scripts src/remotion/producer-samples/scaffold/SampleName
git diff --cached --check
git diff --cached --stat
git commit -m "feat: add direct voxcpm producer runtime"
git status --short --branch
```

Expected: one successful commit on `refactor/agent-producer-service`, branch remains unpushed, and working tree is clean.

## Phase 1 Completion Criteria

- Future Producer narration neither starts Next nor calls a repository route.
- Future Producer code has no `NEXT_ORIGIN`, origin parameter, `/api/tts`, F5 import, or provider-selection branch.
- Three VoxCPM modes have explicit request shapes and focused smoke coverage.
- Private audio/transcript reads are constrained to ignored `voices/clone/`.
- PCM chunks are punctuation-split, audible, edge-trimmed, format-compatible, concatenated, and measured.
- Captions are clean, duration-derived, ordered, and separated from TTS control text.
- Required narration fails closed; explicit silence is a declared scene policy, not fallback.
- Completed scenes survive a later failure and resume by scene id plus fingerprint and file existence.
- Audio, progress, and summary stay under ignored `public/generated/<slug>/audio/`; generated TypeScript and duration constants are deterministic.
- Current skill/docs describe the direct runtime; architecture smokes prevent regression.
- F5/Web/Planner/template code and frozen compositions remain untouched.
- Focused smokes, Docker typecheck/build, changed-file ESLint, Prettier, forbidden scans, and `git diff --check` have fresh evidence.
- One commit exists; no push occurred; Phase 2 has not started.
