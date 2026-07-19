# Science Explainer Voice Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Qualify `science-explainer-young-male` with three real direct VoxCPM controllable-clone tracks, then make it the fail-closed default for future Chinese science-explainer narration only.

**Architecture:** Keep the approved profile as documentation-level Agent Producer policy rather than adding runtime configuration. An ignored local proof runner calls the existing `scripts/lib/producer-audio/` request-plan and direct transport APIs for three independent beats, while ffprobe, FFmpeg, Git, and a focused smoke verify the generated media and tracked contract. Only after all three real tracks pass does the tracked skill/provider policy become active.

**Tech Stack:** Node.js, TypeScript compiler, Producer direct VoxCPM runtime, VoxCPM controllable clone, FFmpeg, ffprobe, Git, Markdown, repository smoke scripts.

## Global Constraints

- Profile id is exactly `science-explainer-young-male`.
- Reference audio is exactly `voices/clone/science-explainer-young-male.wav`; the exact Hi-Fi transcript is `voices/clone/science-explainer-young-male.txt`.
- The three proof requests use direct VoxCPM, mode `controllable-clone`, normal repository defaults, and the approved text/control pairs.
- Proof artifacts remain ignored and untracked beneath `public/generated/science-explainer-voice-proof/audio/`.
- Mechanical checks do not approve speaker identity, timbre consistency, or expressive quality; the user owns final audition judgment.
- Missing science-profile private files fail closed. No fallback to `lyy`, F5, or another provider is allowed.
- Do not add a registry, environment variable, manifest field, scaffold argument, or completed/frozen composition migration.
- Preserve and do not stage the unrelated `SuperintelligenceBeyondHumanCognition` worktree changes.
- Execute inline in the current authorized branch; do not create a worktree, use subagents, push, or commit generated/private artifacts.

---

### Task 1: Lock The Private Reference And RED Contract

**Files:**
- Verify local-only: `voices/clone/science-explainer-young-male.wav`
- Verify local-only: `voices/clone/science-explainer-young-male.txt`
- Modify test: `scripts/skill-alignment-smoke.mjs`

**Interfaces:**
- Consumes: approved profile design, existing Git ignore rules, and current skill/provider documents.
- Produces: immutable input evidence plus a focused smoke that fails until the exact science-only policy is documented.

- [x] **Step 1: Verify the private files without modifying them**

Run:

```bash
sha256sum voices/clone/science-explainer-young-male.wav voices/clone/science-explainer-young-male.txt
ffprobe -v error -show_entries format=duration,size,format_name:stream=codec_name,sample_fmt,sample_rate,channels,bits_per_sample -of json voices/clone/science-explainer-young-male.wav
sed -n '1,20p' voices/clone/science-explainer-young-male.txt
git check-ignore -v voices/clone/science-explainer-young-male.wav voices/clone/science-explainer-young-male.txt
git ls-files -- voices/clone/science-explainer-young-male.wav voices/clone/science-explainer-young-male.txt
```

Expected: SHA values are recorded; WAV is 6.059354 seconds, `pcm_s16le`, 48 kHz, mono; transcript is non-empty and exact; both paths are ignored and `git ls-files` prints nothing.

- [x] **Step 2: Add the focused failing policy assertions**

Extend the VoxCPM skill and provider sections in `scripts/skill-alignment-smoke.mjs` so both tracked documents must contain:

```javascript
const scienceExplainerProfileTokens = [
  "science-explainer-young-male",
  "future Chinese science-explainer",
  "controllable-clone",
  "voices/clone/science-explainer-young-male.wav",
  "voices/clone/science-explainer-young-male.txt",
  "high-fidelity-clone",
  "production brief",
  "fail closed",
  "no fallback",
];
for (const required of scienceExplainerProfileTokens) {
  assertIncludes(voxcpmSkill, required, "VoxCPM skill science explainer default");
  assertIncludes(voxcpmDoc, required, "VoxCPM provider doc science explainer default");
}
```

Also assert exact scoping and Hi-Fi semantics using normalized phrases:

```javascript
for (const [source, label] of [
  [voxcpmSkill, "VoxCPM skill science explainer default"],
  [voxcpmDoc, "VoxCPM provider doc science explainer default"],
]) {
  assertIncludesWords(source, "non-science content retains the existing default clone configuration", label);
  assertIncludesWords(source, "high-fidelity-clone uses the same WAV and exact same-name transcript without a control instruction", label);
  assertIncludesWords(source, "must not silently fall back to `lyy`, F5, or another provider", label);
}
```

- [x] **Step 3: Run RED and preserve the expected failure**

Run:

```bash
npm run smoke:skill-alignment
```

Expected: exit non-zero because the current skill/provider docs do not yet contain `science-explainer-young-male`.

### Task 2: Generate Three Real Direct VoxCPM Proofs

**Files:**
- Create local-only runner: `public/generated/science-explainer-voice-proof/generate.mjs`
- Create local-only: `public/generated/science-explainer-voice-proof/audio/calm-explanation.wav`
- Create local-only: `public/generated/science-explainer-voice-proof/audio/energetic-reveal.wav`
- Create local-only: `public/generated/science-explainer-voice-proof/audio/curious-question.wav`
- Create local-only: `public/generated/science-explainer-voice-proof/audio/summary.json`
- Create local-only: `public/generated/science-explainer-voice-proof/audio/index.md`

**Interfaces:**
- Consumes: `createVoxcpmProducerRequestPlan`, `readProducerVoxcpmConfig`, `requestProducerNarrationAsset`, and the selected private WAV.
- Produces: three independent controllable-clone WAVs and deterministic local qualification metadata.

- [x] **Step 1: Create the ignored proof runner**

Create `public/generated/science-explainer-voice-proof/generate.mjs` with the three approved records and this execution shape:

```javascript
#!/usr/bin/env node

import {mkdir, writeFile} from "node:fs/promises";
import {
  createVoxcpmProducerRequestPlan,
  readProducerVoxcpmConfig,
  requestProducerNarrationAsset,
} from "../../../scripts/lib/producer-audio/index.js";

const slug = "science-explainer-voice-proof";
const referenceAudioPath = "voices/clone/science-explainer-young-male.wav";
const proofs = [
  {
    id: "calm-explanation",
    text: "当我们仰望星空时，看到的每一点光芒，都可能来自数百年前的宇宙。",
    control: "young Chinese male science narrator, magnetic and clear, calm and authoritative",
  },
  {
    id: "energetic-reveal",
    text: "真正令人震撼的是，你身体里的每一个原子，都曾诞生于遥远的恒星！",
    control: "young Chinese male science narrator, low-pitched and magnetic, passionate and awe-inspiring",
  },
  {
    id: "curious-question",
    text: "如果时间真的会变慢，那么高速飞行的人，回来以后会比我们更年轻吗？",
    control: "young Chinese male science narrator, warm and magnetic, curious and suspenseful",
  },
];
const config = readProducerVoxcpmConfig();
const results = [];

for (const proof of proofs) {
  const plan = createVoxcpmProducerRequestPlan({
    beat: {
      id: proof.id,
      narrationRequired: true,
      ttsText: proof.text,
      displayText: proof.text,
      language: "zh-CN",
    },
    mode: "controllable-clone",
    referenceAudioPath,
    control: proof.control,
  });
  const asset = await requestProducerNarrationAsset({config, plan, slug});
  results.push({
    id: proof.id,
    provider: "direct-voxcpm",
    runtimeProvider: asset.provider,
    mode: plan.mode,
    referenceAudioPath: plan.referenceAudioPath,
    text: proof.text,
    control: proof.control,
    durationInSeconds: asset.durationInSeconds,
    durationInFrames: asset.durationInFrames,
    audioSrc: asset.audioSrc,
    outputFile: `${proof.id}.wav`,
  });
  console.log(`${proof.id}: ${asset.durationInSeconds.toFixed(6)}s`);
}

const outputRoot = `public/generated/${slug}/audio`;
await mkdir(outputRoot, {recursive: true});
const summary = {
  profileId: "science-explainer-young-male",
  provider: "direct-voxcpm",
  mode: "controllable-clone",
  referenceAudioPath,
  parameters: {
    cfgValue: config.cfgValue,
    inferenceTimesteps: config.inferenceTimesteps,
    normalize: config.normalize,
    denoise: config.denoise,
    retryBadcase: config.retryBadcase,
    save: config.save,
  },
  proofs: results,
  subjectiveReviewRequired: true,
};
await writeFile(`${outputRoot}/summary.json`, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
await writeFile(
  `${outputRoot}/index.md`,
  [
    "# Science Explainer VoxCPM Voice Proof",
    "",
    "Direct VoxCPM controllable-clone qualification for `science-explainer-young-male`.",
    "",
    ...results.map((result) => `- ${result.id}: ${result.durationInSeconds.toFixed(6)}s - ${result.id}.wav`),
    "",
    "Mechanical qualification does not approve speaker identity or expression; final judgment requires user audition.",
    "",
  ].join("\n"),
  "utf8",
);
```

- [x] **Step 2: Compile to an explicit `/tmp` CommonJS build and execute**

Run:

```bash
docker compose run --rm producer bash -lc 'rm -rf /tmp/science-explainer-voice-proof-build && npx tsc --allowJs --target es2022 --module commonjs --moduleResolution node --skipLibCheck --esModuleInterop --noEmit false --rootDir . --outDir /tmp/science-explainer-voice-proof-build public/generated/science-explainer-voice-proof/generate.mjs scripts/lib/producer-audio/index.ts scripts/lib/producer-audio/types.ts scripts/lib/producer-audio/config.ts scripts/lib/producer-audio/captions.ts scripts/lib/producer-audio/wav.ts scripts/lib/producer-audio/progress.ts scripts/lib/producer-audio/providers/voxcpm.ts scripts/lib/producer-audio/request.ts scripts/lib/producer-audio/metadata.ts scripts/lib/producer-audio/run.ts src/remotion/standalone-video/caption-types.ts && NODE_PATH=/workspace/node_modules:node_modules node /tmp/science-explainer-voice-proof-build/public/generated/science-explainer-voice-proof/generate.mjs'
```

Expected: all three direct requests exit zero and print one measured duration each. Do not use `npx tsx`, `/api/tts`, F5, or another provider.

- [x] **Step 3: Verify exact request metadata and media mechanics**

Run ffprobe on every WAV and FFmpeg `volumedetect` plus `silencedetect=noise=-45dB:d=0.001`. Confirm each summary record has provider `direct-voxcpm`, mode `controllable-clone`, exact reference path, normal parameter values, and a 5–12 second duration. Confirm every stream is non-empty decodable mono `pcm_s16le` at 48 kHz, has finite mean/max volume, max volume `<= 0 dBFS`, and no leading/trailing silence over 0.250 seconds.

- [x] **Step 4: Prove the complete artifact boundary**

Run:

```bash
git check-ignore -v public/generated/science-explainer-voice-proof/generate.mjs public/generated/science-explainer-voice-proof/audio/*.wav public/generated/science-explainer-voice-proof/audio/summary.json public/generated/science-explainer-voice-proof/audio/index.md
git ls-files -- public/generated/science-explainer-voice-proof voices/clone/science-explainer-young-male.wav voices/clone/science-explainer-young-male.txt
git status --short --untracked-files=all -- public/generated/science-explainer-voice-proof voices/clone/science-explainer-young-male.wav voices/clone/science-explainer-young-male.txt
```

Expected: all local artifacts and private references are ignored; `git ls-files` and scoped status print nothing.

### Task 3: Activate The Science-Only Default And Reach GREEN

**Files:**
- Modify: `.agents/skills/ai-video-studio-agent-producer/voxcpm-expression/VOXCPM_EXPRESSION.md`
- Modify: `docs/providers/voxcpm.md`
- Modify: `docs/ITERATION_STATUS.md`
- Test: `scripts/skill-alignment-smoke.mjs`

**Interfaces:**
- Consumes: all three passed proof tracks and the RED smoke contract.
- Produces: one discoverable science-only voice default with explicit override, Hi-Fi, fail-closed, and non-science behavior.

- [x] **Step 1: Document the qualified default in the VoxCPM expression skill**

Add a `Chinese Science-Explainer Default` section stating that future Chinese science-explainer content defaults to `science-explainer-young-male`, normally uses per-beat compact controls with `controllable-clone` and the exact WAV path, permits an explicit production-brief override, keeps the old default for non-science content, and fails closed with no `lyy`/F5/provider fallback. State that maximum-fidelity work uses `high-fidelity-clone`, the same WAV as prompt audio, the exact same-name `.txt`, and no control instruction.

- [x] **Step 2: Mirror the operational contract in the provider doc**

Add the same exact profile id, paths, scoping, normal mode, Hi-Fi alternative, production-brief override, fail-closed policy, and subjective-review caveat to `docs/providers/voxcpm.md`. Record the three local proof artifact names without treating ignored media as tracked acceptance fixtures.

- [x] **Step 3: Sync current status without starting a new Roadmap phase**

Update `docs/ITERATION_STATUS.md` last-updated date and add one bounded post-Roadmap section recording three mechanically qualified direct controllable-clone proofs, the science-only default, local-only artifacts, and remaining user audition judgment. Do not change Roadmap completion or any completed/frozen composition status.

- [x] **Step 4: Run GREEN and focused audio regressions**

Run:

```bash
docker compose run --rm producer bash -lc 'npm run smoke:skill-alignment && npm run smoke:producer-audio-direct-voxcpm && npm run smoke:producer-audio-tools'
```

Expected: all three commands exit zero.

### Task 4: Final Verification And Bounded Commit

**Files:**
- Commit only: `docs/superpowers/plans/2026-07-19-science-explainer-voice-profile.md`
- Commit only: `scripts/skill-alignment-smoke.mjs`
- Commit only: `.agents/skills/ai-video-studio-agent-producer/voxcpm-expression/VOXCPM_EXPRESSION.md`
- Commit only: `docs/providers/voxcpm.md`
- Commit only: `docs/ITERATION_STATUS.md`

**Interfaces:**
- Consumes: fresh GREEN test output, proof-media measurements, and explicit staged allowlist.
- Produces: one local commit that excludes all generated/private/unrelated work.

- [x] **Step 1: Run final evidence commands**

Run the three focused smokes again, the three-file ffprobe/FFmpeg qualification loop, `git diff --check`, `git check-ignore`, and `git status --short`. Re-read `summary.json`, `index.md`, and the tracked diff.

- [x] **Step 2: Stage only the tracked allowlist and inspect it**

Run:

```bash
git add docs/superpowers/plans/2026-07-19-science-explainer-voice-profile.md scripts/skill-alignment-smoke.mjs .agents/skills/ai-video-studio-agent-producer/voxcpm-expression/VOXCPM_EXPRESSION.md docs/providers/voxcpm.md docs/ITERATION_STATUS.md
git diff --cached --name-only
git diff --cached --check
```

Expected: exactly the five allowlisted tracked files are staged; no `voices/`, `public/generated/`, `/tmp`, or unrelated composition path appears.

- [x] **Step 3: Create the local commit and verify the remaining worktree**

Run:

```bash
git commit -m "feat: qualify science explainer VoxCPM voice"
git status --short
git log -1 --oneline
```

Expected: commit succeeds locally with no push; unrelated `SuperintelligenceBeyondHumanCognition` changes remain dirty and unstaged, while all private/generated proof artifacts remain ignored.
