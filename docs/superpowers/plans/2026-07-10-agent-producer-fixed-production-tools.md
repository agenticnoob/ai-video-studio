# Agent Producer Fixed Production Tools Implementation Plan

Status: implemented on 2026-07-11. All planned commit steps were intentionally
skipped during implementation at the user's request; the completed work is
being committed as one aligned change after final verification.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build reusable scripts and functions for future Agent Producer audio production, mechanical validation, and review-frame rendering while leaving every existing finished video unchanged.

**Architecture:** Add a provider-neutral production library under `scripts/lib/producer-audio/` with explicit F5 and VoxCPM request-plan adapters, deterministic metadata/summary writers, and caption cleanup. Add a separate producer validation library and review-frame command that consume new fixture/sample contracts rather than migrating old videos. Update the VoxCPM and Agent Producer skills so future runs invoke the fixed tools and correctly distinguish upstream VoxCPM behavior from the repo adapter.

**Tech Stack:** Node.js ESM scripts, TypeScript compiled by focused Docker smoke commands, Next `/api/tts`, Remotion CLI, existing producer sample manifest registry, repo-local Markdown skills and smoke scripts.

## Global Constraints

- Existing finished videos are frozen and remain read-only references.
- Do not modify existing sample renderers, scripts, data, generated audio metadata, smokes, narration, stills, or rendered videos.
- Do not regenerate existing audio or rendered artifacts.
- Do not require existing samples to migrate to the new tools.
- Do not create a universal visual template or scene DSL.
- Do not route future Agent Producer work through the parked web prompt or `VideoProject` path.
- Generated audio, screenshots, source cards, stills, summaries, and mp4 files remain local-only unless explicitly requested otherwise.
- Use Docker-first validation and the smallest focused smoke covering each boundary.
- New tests use dedicated fixtures under `scripts/fixtures/producer-tools/`; they must not import or mutate frozen sample folders.

## File Structure

### New production audio files

- `scripts/lib/producer-audio/types.ts` — stable provider-neutral input/output contracts.
- `scripts/lib/producer-audio/captions.ts` — TTS/display text separation and caption cleanup.
- `scripts/lib/producer-audio/request.ts` — `/api/tts` JSON request helper and response normalization.
- `scripts/lib/producer-audio/providers/f5.ts` — F5 request-plan validation and payload construction.
- `scripts/lib/producer-audio/providers/voxcpm.ts` — explicit VoxCPM mode validation and payload construction.
- `scripts/lib/producer-audio/metadata.ts` — deterministic audio metadata, duration constant, and summary serialization.
- `scripts/lib/producer-audio/run.ts` — beat iteration, provider dispatch, fallback reporting, and file writes.
- `scripts/lib/producer-audio/index.ts` — public exports for future generator scripts.

### New validation and review files

- `scripts/lib/producer-validation.ts` — reusable mechanical validation functions.
- `scripts/validate-producer-sample.mjs` — CLI wrapper for future sample-specific validation modules.
- `scripts/render-producer-review-frames.mjs` — manifest-driven Remotion still renderer.
- `scripts/fixtures/producer-tools/fixture-config.ts` — isolated fixture data for audio and validation smokes.
- `scripts/fixtures/producer-tools/fixture-manifest.ts` — isolated manifest/review-frame fixture.
- `scripts/producer-audio-tools-smoke.mjs` — audio orchestration and provider-mode contract smoke.
- `scripts/producer-validation-smoke.mjs` — common validation failure/success smoke.
- `scripts/producer-review-frames-smoke.mjs` — deterministic command-plan smoke without rendering an old sample.

### Modified adoption and documentation files

- `src/lib/tts/config.ts` — add the missing `retryBadcase` config field and environment parsing for the current repo VoxCPM adapter.
- `src/lib/tts/voxcpm.ts` — forward `retry_badcase` to upstream requests.
- `.env.example` — document `VOXCPM_TTS_RETRY_BADCASE`.
- `.agents/skills/ai-video-studio-agent-producer/voxcpm-expression/VOXCPM_EXPRESSION.md` — upstream modes, parameters, quality tuning, and repo adapter contract.
- `.agents/skills/ai-video-studio-agent-producer/SKILL.md` — future sample adoption of fixed tools.
- `docs/providers/voxcpm.md` — operational provider reference matching the skill.
- `docs/REMOTION_COMPONENT_LIBRARY.md` — document the non-visual producer tool boundary if this file already routes production helpers; otherwise leave unchanged and put the entry in the Agent Producer skill only.
- `docs/ITERATION_STATUS.md` — record the completed fixed-production-tools slice and frozen-old-video boundary.
- `docs/VISUAL_RECIPE_ROADMAP.md` — add the bounded tooling phase without promoting visual recipes/templates.
- `scripts/skill-alignment-smoke.mjs` — enforce official-vs-repo VoxCPM distinctions and fixed-tool adoption language.
- `package.json` — add focused smoke and CLI commands.

---

### Task 1: Define Producer Audio Contracts And Caption Cleanup

**Files:**
- Create: `scripts/lib/producer-audio/types.ts`
- Create: `scripts/lib/producer-audio/captions.ts`
- Create: `scripts/lib/producer-audio/index.ts`
- Create: `scripts/fixtures/producer-tools/fixture-config.ts`
- Create: `scripts/producer-audio-tools-smoke.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `ProducerNarrationBeat`, `ProducerAudioTrack`, `ProducerAudioProviderId`, `ProducerAudioRequestPlan`, `ProducerAudioSummary`, `ProducerAudioFallbackPolicy`, and `ProducerAudioRunConfig` from `types.ts`.
- Produces: `cleanProducerDisplayText(text: string): string` and `normalizeProducerCaptions(captions, displayText)` from `captions.ts`.
- Later tasks import these contracts only through `scripts/lib/producer-audio/index.ts`.

- [ ] **Step 1: Write the failing contract smoke**

Create `scripts/producer-audio-tools-smoke.mjs` with assertions that import the compiled public index and verify:

```javascript
const {
  cleanProducerDisplayText,
  normalizeProducerCaptions,
} = await import("../scripts/lib/producer-audio/index.js");

const cleaned = cleanProducerDisplayText(
  "(calm and precise) [Uhm] GPT-5.6 的价格，真的下降了吗？",
);
assert(cleaned === "GPT-5.6 的价格，真的下降了吗？", "display text cleanup");

const captions = normalizeProducerCaptions(
  {
    language: "zh-CN",
    cues: [{ text: "[Uhm] GPT-5.6", startSeconds: 0, endSeconds: 1.2 }],
  },
  "GPT-5.6",
);
assert(captions.cues[0].text === "GPT-5.6", "caption control syntax cleanup");
assert(captions.cues[0].endSeconds === 1.2, "caption timing preservation");
```

Also import fixture values from `scripts/fixtures/producer-tools/fixture-config.js` so the smoke proves fixtures are independent from existing sample folders.

- [ ] **Step 2: Add the focused smoke command and verify RED**

Add to `package.json`:

```json
"smoke:producer-audio-tools": "rm -rf /tmp/producer-audio-tools-smoke-build && npx tsc --allowJs --target es2022 --module commonjs --moduleResolution node --skipLibCheck --esModuleInterop --noEmit false --outDir /tmp/producer-audio-tools-smoke-build scripts/producer-audio-tools-smoke.mjs scripts/fixtures/producer-tools/fixture-config.ts scripts/lib/producer-audio/index.ts scripts/lib/producer-audio/types.ts scripts/lib/producer-audio/captions.ts && NODE_PATH=/workspace/node_modules:node_modules node /tmp/producer-audio-tools-smoke-build/scripts/producer-audio-tools-smoke.mjs"
```

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:producer-audio-tools'
```

Expected: FAIL because the new modules or exports do not exist.

- [ ] **Step 3: Implement stable contracts**

Define these exact unions and shapes in `types.ts`:

```typescript
export type ProducerAudioProviderId = "f5-tts" | "voxcpm";
export type ProducerVoxcpmMode = "voice-design" | "controllable-clone" | "high-fidelity-clone";

export type ProducerNarrationBeat = {
  readonly id: string;
  readonly ttsText: string;
  readonly displayText?: string;
  readonly language?: string;
};

export type ProducerAudioRequestPlan = {
  readonly provider: ProducerAudioProviderId;
  readonly body: Record<string, unknown>;
};

export type ProducerAudioTrack = {
  readonly sceneId: string;
  readonly narration: string;
  readonly audioFile: string;
  readonly captions: SegmentCaptions;
  readonly durationInFrames: number;
  readonly durationInSeconds: number;
  readonly provider: string;
  readonly format?: "mp3" | "wav" | "aac" | "m4a";
};

export type ProducerAudioFallbackPolicy = "forbid" | "allow-explicit-silence";

export type ProducerAudioSummary = {
  readonly compositionId: string;
  readonly providers: readonly string[];
  readonly sceneCount: number;
  readonly totalDurationInFrames: number;
  readonly usedFallback: boolean;
  readonly fallbackReasons: readonly string[];
};
```

Import `SegmentCaptions` from `src/lib/caption-schema.ts` with the correct relative path.

- [ ] **Step 4: Implement caption cleanup**

`cleanProducerDisplayText` must:

- remove one leading parenthesized control instruction
- remove supported square-bracket non-language tags anywhere in the text
- collapse whitespace
- preserve punctuation, decimal model names, and ordinary bracketed content not in the supported tag list

`normalizeProducerCaptions` must preserve cue timings, clean cue text, and use cleaned `displayText` as a single fallback cue only when the provider returned no cues.

- [ ] **Step 5: Run the focused smoke to verify GREEN**

Run the Docker smoke from Step 2.

Expected: `Producer audio tools smoke passed.`

- [ ] **Step 6: Commit the contract slice**

```bash
git add package.json scripts/lib/producer-audio scripts/fixtures/producer-tools/fixture-config.ts scripts/producer-audio-tools-smoke.mjs
git commit -m "feat: define producer audio tool contracts"
```

### Task 2: Add F5 And VoxCPM Request-Plan Adapters

**Files:**
- Create: `scripts/lib/producer-audio/providers/f5.ts`
- Create: `scripts/lib/producer-audio/providers/voxcpm.ts`
- Modify: `scripts/lib/producer-audio/types.ts`
- Modify: `scripts/lib/producer-audio/index.ts`
- Modify: `scripts/fixtures/producer-tools/fixture-config.ts`
- Modify: `scripts/producer-audio-tools-smoke.mjs`

**Interfaces:**
- Consumes: `ProducerNarrationBeat`, `ProducerAudioRequestPlan`, `ProducerVoxcpmMode`.
- Produces: `createF5ProducerRequestPlan(input): ProducerAudioRequestPlan`.
- Produces: `createVoxcpmProducerRequestPlan(input): ProducerAudioRequestPlan`.
- Produces: `validateVoxcpmProducerMode(input): void`.

- [ ] **Step 1: Extend the smoke with failing provider-mode cases**

Add assertions for these exact behaviors:

```javascript
assert.throws(
  () => createVoxcpmProducerRequestPlan({ mode: "controllable-clone", beat, referenceAudioPath: "" }),
  /reference audio/i,
);

assert.doesNotThrow(() =>
  createVoxcpmProducerRequestPlan({
    mode: "controllable-clone",
    beat,
    referenceAudioPath: "voices/ref.wav",
  }),
);

assert.throws(
  () => createVoxcpmProducerRequestPlan({
    mode: "high-fidelity-clone",
    beat,
    referenceAudioPath: "voices/ref.wav",
  }),
  /exact reference transcript/i,
);

const highFidelity = createVoxcpmProducerRequestPlan({
  mode: "high-fidelity-clone",
  beat,
  referenceAudioPath: "voices/ref.wav",
  referenceText: "精确逐字稿",
  control: "urgent",
});
assert(!("control" in highFidelity.body), "Hi-Fi mode must ignore control instructions");
```

Also verify F5 produces `{provider: "f5-tts"}` without VoxCPM mode fields.

- [ ] **Step 2: Run smoke to verify RED**

Run `npm run smoke:producer-audio-tools` in Docker.

Expected: FAIL because provider adapters are missing.

- [ ] **Step 3: Implement the F5 adapter**

Use this exact input contract:

```typescript
export type F5ProducerRequestInput = {
  readonly beat: ProducerNarrationBeat;
  readonly voiceClone?: {
    readonly enabled: true;
    readonly referenceId: string;
    readonly referenceText: string;
  };
};
```

Return a `/api/tts` body containing `segmentId`, `text`, optional `language`, `provider: "f5-tts"`, and optional existing repo `voiceClone` payload. Do not accept VoxCPM controls or modes.

- [ ] **Step 4: Implement the VoxCPM adapter**

Use this exact input contract:

```typescript
export type VoxcpmProducerRequestInput = {
  readonly beat: ProducerNarrationBeat;
  readonly mode: ProducerVoxcpmMode;
  readonly referenceAudioPath?: string;
  readonly referenceId?: string;
  readonly referenceText?: string;
  readonly control?: string;
};
```

Behavior:

- `voice-design`: no reference audio/id/text; prefix `ttsText` with `(${control}) ` when control exists.
- `controllable-clone`: require reference audio path or uploaded `referenceId`; transcript is optional in the provider-neutral model; include control when supplied.
- `high-fidelity-clone`: require reference audio path or `referenceId` and non-empty exact `referenceText`; omit control.
- The returned `/api/tts` plan should model current repo compatibility separately: when using uploaded references, set `voiceClone.enabled`, `referenceId`, and the locally required `referenceText`; when the current API cannot represent an upstream mode, throw an error naming the repo adapter limitation rather than calling it a VoxCPM limitation.

- [ ] **Step 5: Run the smoke to verify GREEN**

Expected: provider mode assertions pass and the existing caption assertions remain green.

- [ ] **Step 6: Commit provider adapters**

```bash
git add scripts/lib/producer-audio scripts/fixtures/producer-tools/fixture-config.ts scripts/producer-audio-tools-smoke.mjs
git commit -m "feat: add producer audio provider adapters"
```

### Task 3: Add Request, Metadata, Summary, And Orchestration Functions

**Files:**
- Create: `scripts/lib/producer-audio/request.ts`
- Create: `scripts/lib/producer-audio/metadata.ts`
- Create: `scripts/lib/producer-audio/run.ts`
- Modify: `scripts/lib/producer-audio/types.ts`
- Modify: `scripts/lib/producer-audio/index.ts`
- Modify: `scripts/fixtures/producer-tools/fixture-config.ts`
- Modify: `scripts/producer-audio-tools-smoke.mjs`

**Interfaces:**
- Produces: `requestProducerNarrationAsset({origin, plan, fetchImpl})`.
- Produces: `serializeProducerAudioMetadata({header, exportName, typeImport, tracks})`.
- Produces: `updateProducerDurationConstant({source, constantName, durationInFrames})`.
- Produces: `buildProducerAudioSummary({compositionId, tracks, fallbackReasons})`.
- Produces: `runProducerAudioGeneration(config)` with injected `requestNarration` and file-write dependencies for smoke isolation.

- [ ] **Step 1: Add failing deterministic orchestration assertions**

Extend the smoke with an injected fake request implementation returning two normalized narration assets. Assert:

```javascript
const result = await runProducerAudioGeneration(fixtureRunConfig);
assert(result.tracks.length === 2, "one track per beat");
assert(result.summary.totalDurationInFrames === 330, "duration aggregation");
assert(result.summary.usedFallback === false, "fallback state");
assert(result.metadataSource.includes("fixtureAudioTracks"), "metadata export");
assert(result.durationSource.includes("FIXTURE_DURATION_IN_FRAMES = 330"), "duration update");
```

Add a failure fixture where the request throws and fallback policy is `forbid`; assert the original error is propagated. Add an allowed fallback fixture and assert `usedFallback: true` plus a non-empty reason.

- [ ] **Step 2: Run smoke to verify RED**

Expected: missing orchestration exports.

- [ ] **Step 3: Implement `/api/tts` request normalization**

`requestProducerNarrationAsset` must POST JSON to `${origin}/api/tts`, reject non-2xx responses with status and response text, require `body.narration`, and normalize:

```typescript
{
  audioSrc,
  captions,
  durationInFrames,
  durationInSeconds,
  format,
  provider,
}
```

Validate positive duration and non-empty audio source/provider before returning.

- [ ] **Step 4: Implement deterministic serializers**

`serializeProducerAudioMetadata` must produce stable TypeScript with JSON indentation, a generated-file header, an exact type-only import, and `satisfies readonly <TypeName>[]`.

`updateProducerDurationConstant` must replace exactly one numeric assignment matching:

```typescript
export const <CONSTANT_NAME> = <integer>;
```

Throw if zero or multiple matches are found.

- [ ] **Step 5: Implement orchestration with dependency injection**

`runProducerAudioGeneration` must:

1. iterate beats sequentially by default to avoid overloading local TTS
2. create a provider request plan per beat
3. call injected `requestNarration`
4. map provider response to `ProducerAudioTrack`
5. clean display captions
6. handle only explicitly configured fallback
7. aggregate duration and summary
8. return planned file contents
9. write files only through injected `writeTextFile` when `writeOutputs: true`

Do not shell out to `ffmpeg` inside this function; provider/API adapters remain responsible for audio generation and measured duration.

- [ ] **Step 6: Run focused smoke to verify GREEN**

Expected: deterministic metadata, duration update, fallback, and error-path assertions pass.

- [ ] **Step 7: Commit orchestration**

```bash
git add scripts/lib/producer-audio scripts/fixtures/producer-tools/fixture-config.ts scripts/producer-audio-tools-smoke.mjs
git commit -m "feat: add producer audio generation runner"
```

### Task 4: Align Current VoxCPM Adapter With Official Retry Configuration

**Files:**
- Modify: `src/lib/tts/config.ts`
- Modify: `src/lib/tts/voxcpm.ts`
- Modify: `.env.example`
- Modify: `scripts/voxcpm-tts-smoke.mjs` if present; otherwise create `scripts/voxcpm-config-smoke.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: existing `readVoxcpmTtsConfig()` and VoxCPM request bodies.
- Produces: `VoxcpmTtsConfig.retryBadcase: boolean` read from `VOXCPM_TTS_RETRY_BADCASE`, default `true`.
- Produces: upstream request field `retry_badcase` for `/tts`, clone, and chunked synthesis paths.

- [ ] **Step 1: Write the failing config/request smoke**

Assert the default is `true`, explicit `false` is parsed, and captured VoxCPM request JSON includes:

```json
{
  "retry_badcase": true
}
```

Check all request builders that call the VoxCPM service, not only plain `/tts`.

- [ ] **Step 2: Run the focused smoke to verify RED**

Run the existing VoxCPM smoke command if available; otherwise add:

```json
"smoke:voxcpm-config": "rm -rf /tmp/voxcpm-config-smoke-build && npx tsc --allowJs --target es2022 --module commonjs --moduleResolution node --skipLibCheck --esModuleInterop --noEmit false --outDir /tmp/voxcpm-config-smoke-build scripts/voxcpm-config-smoke.mjs src/lib/tts/config.ts src/lib/tts/voxcpm.ts && NODE_PATH=/workspace/node_modules:node_modules node /tmp/voxcpm-config-smoke-build/scripts/voxcpm-config-smoke.mjs"
```

Expected: FAIL because `retryBadcase` is absent.

- [ ] **Step 3: Implement config parsing and request forwarding**

Add:

```typescript
retryBadcase: readBooleanEnv("VOXCPM_TTS_RETRY_BADCASE", true),
```

Forward it as:

```typescript
retry_badcase: config.retryBadcase,
```

Add `.env.example` documentation next to the other VoxCPM inference settings.

- [ ] **Step 4: Run focused smoke and TTS typecheck**

Run the smoke plus:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit --pretty false --incremental false'
```

Expected: PASS.

- [ ] **Step 5: Commit adapter alignment**

```bash
git add src/lib/tts/config.ts src/lib/tts/voxcpm.ts .env.example scripts/voxcpm-config-smoke.mjs package.json
git commit -m "feat: expose VoxCPM retry badcase control"
```

### Task 5: Add Shared Producer Validation

**Files:**
- Create: `scripts/lib/producer-validation.ts`
- Create: `scripts/validate-producer-sample.mjs`
- Create: `scripts/producer-validation-smoke.mjs`
- Modify: `scripts/fixtures/producer-tools/fixture-config.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `ProducerAudioTrack`, `ProducerNarrationBeat`, a manifest-shaped input, scene timing data, registered composition IDs, and an injected `isIgnoredPath` function.
- Produces: `validateProducerAudioAlignment(input): void`.
- Produces: `validateProducerArtifactBoundary(input): void`.
- Produces: `validateProducerSample(input): void`.
- CLI dynamically imports a future sample validation module exporting `producerValidationInput`.

- [ ] **Step 1: Write failing validation cases**

Create a valid fixture and invalid variants for:

- missing audio ID
- extra audio ID
- provider mismatch
- negative or zero duration
- unordered/out-of-range caption cues
- display caption containing `[Uhm]` or a leading control instruction
- scene duration exceeding normalized audio duration plus configured padding
- artifact root not ignored
- missing Remotion registration
- fallback provider without explicit fallback reason

Use `assert.throws` with specific message fragments for each invalid variant.

- [ ] **Step 2: Add command and verify RED**

Add:

```json
"smoke:producer-validation": "rm -rf /tmp/producer-validation-smoke-build && npx tsc --allowJs --target es2022 --module commonjs --moduleResolution node --skipLibCheck --esModuleInterop --noEmit false --outDir /tmp/producer-validation-smoke-build scripts/producer-validation-smoke.mjs scripts/fixtures/producer-tools/fixture-config.ts scripts/lib/producer-validation.ts scripts/lib/producer-audio/types.ts scripts/lib/producer-audio/captions.ts && NODE_PATH=/workspace/node_modules:node_modules node /tmp/producer-validation-smoke-build/scripts/producer-validation-smoke.mjs",
"producer:validate": "node scripts/validate-producer-sample.mjs"
```

Expected: smoke fails before implementation.

- [ ] **Step 3: Implement pure validation functions**

Keep validation pure except for injected checks. `validateProducerSample` should aggregate checks and throw the first precise error. It must not inspect visual quality or topic facts.

For artifact roots, accept an injected async callback:

```typescript
isIgnoredPath: (path: string) => Promise<boolean>
```

The CLI implementation should provide it by running:

```bash
git check-ignore -q <path>
```

- [ ] **Step 4: Implement the future-sample CLI**

Usage:

```bash
npm run producer:validate -- --module scripts/fixtures/producer-tools/fixture-validation.js
```

The imported module must export `producerValidationInput`. Print a concise success message containing the composition ID.

- [ ] **Step 5: Run smoke and fixture CLI**

Expected:

```txt
Producer validation smoke passed.
Producer sample FixtureProducerVideo passed mechanical validation.
```

- [ ] **Step 6: Commit validation tooling**

```bash
git add scripts/lib/producer-validation.ts scripts/validate-producer-sample.mjs scripts/producer-validation-smoke.mjs scripts/fixtures/producer-tools package.json
git commit -m "feat: add producer sample validation tools"
```

### Task 6: Add Manifest-Driven Review-Frame Command Planning And Rendering

**Files:**
- Create: `scripts/lib/producer-review-frames.ts`
- Create: `scripts/render-producer-review-frames.mjs`
- Create: `scripts/fixtures/producer-tools/fixture-manifest.ts`
- Create: `scripts/producer-review-frames-smoke.mjs`
- Modify: `src/remotion/producer-samples/index.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `ProducerSampleManifest` and Remotion entrypoint/output options.
- Produces: `slugifyReviewFrameLabel(label: string): string`.
- Produces: `buildProducerReviewFrameJobs(input): readonly ProducerReviewFrameJob[]`.
- CLI resolves real registered manifests only when explicitly executed; smoke uses the isolated fixture.

- [ ] **Step 1: Write the failing command-plan smoke**

Assert a fixture manifest with frames `45/opening thesis` and `620/model tiers` produces deterministic outputs:

```txt
out/fixture-producer-video/review-frames/frame-00045-opening-thesis.png
out/fixture-producer-video/review-frames/frame-00620-model-tiers.png
```

Assert duplicate filenames, negative frames, and empty review-frame lists throw.

- [ ] **Step 2: Add focused smoke and CLI commands; verify RED**

Add:

```json
"smoke:producer-review-frames": "rm -rf /tmp/producer-review-frames-smoke-build && npx tsc --allowJs --target es2022 --module commonjs --moduleResolution node --skipLibCheck --esModuleInterop --noEmit false --outDir /tmp/producer-review-frames-smoke-build scripts/producer-review-frames-smoke.mjs scripts/fixtures/producer-tools/fixture-manifest.ts scripts/lib/producer-review-frames.ts src/remotion/producer-samples/manifest.ts && NODE_PATH=/workspace/node_modules:node_modules node /tmp/producer-review-frames-smoke-build/scripts/producer-review-frames-smoke.mjs",
"producer:stills": "node scripts/render-producer-review-frames.mjs"
```

Expected: missing module failure.

- [ ] **Step 3: Implement deterministic review jobs**

`ProducerReviewFrameJob` must include:

```typescript
{
  compositionId: string;
  frame: number;
  label: string;
  purpose: string;
  outputPath: string;
  args: readonly string[];
}
```

The Remotion args must use `src/remotion/index.ts`, composition ID, output path, `--frame=<n>`, and optional CLI `--scale` defaulting to `0.5`.

- [ ] **Step 4: Implement the rendering CLI**

Usage:

```bash
npm run producer:stills -- --composition NewSampleName
```

The CLI should:

- parse `--composition`, optional `--scale`, and optional `--dry-run`
- resolve `getProducerSampleManifestByCompositionId`
- create the output directory
- run `npx remotion still` sequentially
- write `review-summary.json`
- print each rendered file
- in `--dry-run`, print jobs without invoking Remotion

Do not add a frozen video to tests or run the command against one during this task.

- [ ] **Step 5: Run smoke and a fixture dry-run path**

The pure smoke must pass. If the CLI cannot consume the fixture registry directly, test CLI argument parsing with a temporary injected registry module rather than a real sample.

- [ ] **Step 6: Commit review-frame tooling**

```bash
git add scripts/lib/producer-review-frames.ts scripts/render-producer-review-frames.mjs scripts/producer-review-frames-smoke.mjs scripts/fixtures/producer-tools/fixture-manifest.ts src/remotion/producer-samples/index.ts package.json
git commit -m "feat: add producer review frame renderer"
```

### Task 7: Update VoxCPM And Agent Producer Skills

**Files:**
- Modify: `.agents/skills/ai-video-studio-agent-producer/voxcpm-expression/VOXCPM_EXPRESSION.md`
- Modify: `.agents/skills/ai-video-studio-agent-producer/SKILL.md`
- Modify: `docs/providers/voxcpm.md`
- Modify: `scripts/skill-alignment-smoke.mjs`

**Interfaces:**
- Consumes: the official VoxCPM 2 usage guide and implemented fixed tool command names.
- Produces: enforceable future-agent instructions for mode selection, parameters, repo adapter constraints, and fixed script invocation.

- [ ] **Step 1: Extend skill alignment smoke first**

Require the VoxCPM skill and provider doc to include these exact concepts:

```txt
voice-design
controllable-clone
high-fidelity-clone
5–30 seconds
retry_badcase
Repo Adapter Contract
controllable clone does not require a transcript upstream
Hi-Fi clone requires an exact transcript
control instructions are ignored by Hi-Fi clone
```

Require the Agent Producer skill to reference:

```txt
npm run producer:validate
npm run producer:stills
scripts/lib/producer-audio/
existing finished samples are read-only references
```

Require language clearly stating that punctuation splitting, silence trimming, WAV concatenation, and duration-derived captions are repo adapter behavior rather than upstream timestamps.

- [ ] **Step 2: Run skill smoke to verify RED**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:skill-alignment'
```

Expected: FAIL on the new required wording.

- [ ] **Step 3: Rewrite the VoxCPM skill around production decisions**

Structure the skill with these sections:

1. `Mode Selection`
2. `Reference Audio Rules`
3. `Parameters And Tuning Order`
4. `Text, Punctuation, And Expression`
5. `Long And Short Text Handling`
6. `Repo Adapter Contract`
7. `Agent Producer Integration`
8. `Quality Gate`

State upstream behavior and repo adapter behavior separately. Reference the official guide URL without copying long passages.

- [ ] **Step 4: Update Agent Producer skill and provider doc**

The Agent Producer skill must route future samples to shared scripts for fixed operations while preserving dedicated composition and creative review. The provider doc must list environment variables including `VOXCPM_TTS_RETRY_BADCASE=true` and the current repo clone endpoint limitation.

- [ ] **Step 5: Run skill smoke to verify GREEN**

Expected: `Skill alignment smoke passed.`

- [ ] **Step 6: Commit skill alignment**

```bash
git add .agents/skills/ai-video-studio-agent-producer/voxcpm-expression/VOXCPM_EXPRESSION.md .agents/skills/ai-video-studio-agent-producer/SKILL.md docs/providers/voxcpm.md scripts/skill-alignment-smoke.mjs
git commit -m "docs: align producer tools and VoxCPM guidance"
```

### Task 8: Update Future Sample Scaffold And Active Documentation

**Files:**
- Modify: `src/remotion/producer-samples/scaffold/SampleName/types.ts`
- Create or Modify: `src/remotion/producer-samples/scaffold/SampleName/generate.mjs`
- Create or Modify: `src/remotion/producer-samples/scaffold/SampleName/validation.ts`
- Modify: `scripts/producer-sample-scaffold-smoke.mjs` if present; otherwise `scripts/producer-sample-manifest-smoke.mjs`
- Modify: `docs/ITERATION_STATUS.md`
- Modify: `docs/VISUAL_RECIPE_ROADMAP.md`
- Modify: `README.md` only if it currently documents Agent Producer commands

**Interfaces:**
- Consumes: public producer-audio exports and `producerValidationInput` CLI contract.
- Produces: a future-sample example showing direct tool invocation rather than copied generator logic.

- [ ] **Step 1: Add failing scaffold assertions**

Require the scaffold to reference:

```txt
scripts/lib/producer-audio
runProducerAudioGeneration
producerValidationInput
npm run producer:validate
npm run producer:stills
```

Also assert no scaffold code imports a frozen sample folder.

- [ ] **Step 2: Run scaffold/manifest smoke to verify RED**

Expected: missing adoption example.

- [ ] **Step 3: Add a minimal future-sample generator example**

The scaffold generator should demonstrate:

```javascript
await runProducerAudioGeneration({
  compositionId: "SampleName",
  beats: sampleNameNarrationBeats,
  createRequestPlan: (beat) => createVoxcpmProducerRequestPlan({
    beat,
    mode: "controllable-clone",
    referenceId: process.env.SAMPLE_NAME_VOICE_REFERENCE_ID,
    referenceText: process.env.SAMPLE_NAME_VOICE_REFERENCE_TEXT,
  }),
  fallbackPolicy: "forbid",
  // exact output paths and serializers from the implemented public contract
});
```

Keep it as scaffold/reference code; do not register or render `SampleName` as a real composition.

- [ ] **Step 4: Add scaffold validation input**

Demonstrate `producerValidationInput` using local sample data/audio metadata and an explicit provider expectation. Include comments only where necessary to show which fields remain sample-specific.

- [ ] **Step 5: Update active docs**

Record:

- why the tools exist: future production speed and quality
- old videos remain frozen
- fixed operations are script-owned
- creative operations remain Agent-owned
- exact commands for audio tool adoption, validation, and still rendering
- no recipe/template promotion in this slice

- [ ] **Step 6: Run scaffold and documentation smokes**

Run the scaffold/manifest smoke plus `git diff --check`.

- [ ] **Step 7: Commit adoption docs**

```bash
git add src/remotion/producer-samples/scaffold scripts/producer-sample-*smoke.mjs docs/ITERATION_STATUS.md docs/VISUAL_RECIPE_ROADMAP.md README.md
git commit -m "docs: adopt fixed tools for future producer samples"
```

### Task 9: Run Full Focused Verification And Review Frozen-Sample Boundary

**Files:**
- Verify only; modify files only to fix failures introduced by Tasks 1–8.

**Interfaces:**
- Consumes all commands introduced above.
- Produces final evidence that fixed tooling works and frozen videos remain untouched.

- [ ] **Step 1: Run all new focused smokes**

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:producer-audio-tools && npm run smoke:producer-validation && npm run smoke:producer-review-frames && npm run smoke:skill-alignment && npm run smoke:producer-sample-manifest'
```

Expected: all commands pass.

- [ ] **Step 2: Run TypeScript and lint**

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit --pretty false --incremental false && npm run lint'
```

Expected: PASS, with only explicitly identified pre-existing warnings if any.

- [ ] **Step 3: Verify local-artifact boundaries**

```bash
git check-ignore -q public/generated/example out/
```

Expected: exit code `0` for both generated roots used by the new tooling.

- [ ] **Step 4: Verify frozen existing samples were not modified**

Run:

```bash
git diff --name-only -- \
  src/remotion/AiConceptsForBeginners \
  src/remotion/AiDailyNewsBrief20260709 \
  src/remotion/AiNewsStrategicBrief20260709 \
  src/remotion/AiDailyNewsBrief20260708 \
  src/remotion/OpenAiHardwareNewsBrief \
  src/remotion/UvOpenSourceBrief \
  src/remotion/PixelRAGChineseStandalone \
  scripts/generate-ai-concepts-for-beginners.mjs \
  scripts/generate-ai-daily-news-brief-2026-07-09.mjs \
  scripts/generate-ai-news-strategic-brief-2026-07-09.mjs \
  scripts/generate-ai-daily-news-brief-2026-07-08.mjs \
  scripts/generate-openai-hardware-news-brief.mjs \
  scripts/generate-uv-open-source-brief.mjs \
  scripts/generate-pixelrag-chinese-standalone.mjs
```

Expected: no output.

- [ ] **Step 5: Run diff hygiene and inspect status**

```bash
git diff --check
git status --short
```

Expected: only planned tooling, fixture, skill, and documentation files appear.

- [ ] **Step 6: Final commit**

```bash
git add package.json .env.example scripts/lib scripts/fixtures scripts/*producer* scripts/skill-alignment-smoke.mjs src/lib/tts src/remotion/producer-samples .agents/skills docs README.md
git commit -m "feat: add fixed Agent Producer production tools"
```

- [ ] **Step 7: Write handoff**

The handoff must include:

- fixed operations now callable by future Agent Producer runs
- exact new commands
- F5/VoxCPM adapter distinction
- official VoxCPM behavior versus repo adapter behavior
- focused validation results
- confirmation that existing finished videos were not modified or regenerated
- any known limitation, especially current `/api/tts` representation of upstream VoxCPM modes

## Plan Self-Review

### Spec coverage

- Provider-neutral audio orchestration: Tasks 1–3.
- Explicit F5/VoxCPM semantic boundary: Task 2.
- `retry_badcase` upstream alignment: Task 4.
- Mechanical producer validation: Task 5.
- Manifest-driven review-frame rendering: Task 6.
- Official VoxCPM skill and repo adapter distinction: Task 7.
- Future-only adoption without old-video migration: Task 8.
- Frozen-sample and artifact verification: Task 9.

### Placeholder scan

The plan contains no `TBD`, deferred implementation placeholders, or unspecified test steps. Optional file handling is explicitly bounded by current file existence and does not widen scope.

### Type consistency

- `ProducerNarrationBeat`, `ProducerAudioRequestPlan`, `ProducerAudioTrack`, and `ProducerAudioSummary` are defined in Task 1 and reused consistently.
- Provider adapters return `ProducerAudioRequestPlan` in Task 2.
- Orchestration consumes provider request plans and returns normalized tracks/summary in Task 3.
- Validation consumes the normalized contracts in Task 5.
- Review-frame tooling remains independent of audio contracts and consumes `ProducerSampleManifest`.
