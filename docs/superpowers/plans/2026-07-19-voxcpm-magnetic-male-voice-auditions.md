# VoxCPM Magnetic Male Voice Auditions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate and verify ten directly comparable 5–10 second VoxCPM voice-design WAV candidates for a reusable Chinese science-explainer clone voice.

**Architecture:** A local-only audition runner calls the existing direct Producer VoxCPM runtime sequentially with ten unique ids and one identical narration/control pair. The runtime owns request formatting, silence trimming, WAV validation, duration measurement, and artifact writes; the runner adds bounded duration retries and a JSON/Markdown audition index. FFprobe and FFmpeg independently verify the finished WAV files.

**Tech Stack:** Node.js/tsx, `scripts/lib/producer-audio/`, VoxCPM direct HTTP API, FFmpeg, ffprobe, Docker Compose `producer` service.

## Global Constraints

- Mode is exactly `voice-design`.
- Spoken text is exactly `科学真正迷人的地方就在于让复杂的世界突然变得清晰而震撼。`
- Control is exactly `young Chinese male science narrator, low-pitched and magnetic, passionate and inspiring`.
- Every accepted candidate duration is between 5 and 10 seconds inclusive.
- All candidates use identical text, control, and normal repository parameters.
- Artifacts stay beneath `public/generated/voxcpm-magnetic-male-auditions/audio/` and remain untracked.
- Do not modify existing Remotion compositions or current uncommitted video work.
- Do not use `/api/tts`, F5, or another provider. Do not push.

---

### Task 1: Verify The Direct VoxCPM Boundary

**Files:**
- Read: `scripts/lib/producer-audio/config.ts`
- Read: `scripts/lib/producer-audio/providers/voxcpm.ts`
- Read: `scripts/lib/producer-audio/request.ts`
- Test: `scripts/producer-audio-direct-voxcpm-smoke.mjs`

**Interfaces:**
- Consumes: Docker Compose `producer` environment and Producer audio modules.
- Produces: direct-runtime contract evidence and configured endpoint evidence without printing its value.

- [ ] **Step 1: Run the direct-runtime smoke**

Run:

```bash
docker compose exec -T producer npm run smoke:producer-audio-direct-voxcpm
```

Expected: exit 0 with `Producer direct VoxCPM smoke test passed.`

- [ ] **Step 2: Confirm endpoint configuration exists**

Run:

```bash
docker compose exec -T producer bash -lc 'test -n "$VOXCPM_TTS_BASE_URL" && printf "VOXCPM_TTS_BASE_URL configured\n"'
```

Expected: exit 0 with `VOXCPM_TTS_BASE_URL configured` and no endpoint value.

### Task 2: Create The Ignored Local Audition Runner

**Files:**
- Create local-only: `public/generated/voxcpm-magnetic-male-auditions/generate.mjs`
- Create at runtime: `public/generated/voxcpm-magnetic-male-auditions/audio/candidate-01.wav` through `candidate-10.wav`
- Create at runtime: `public/generated/voxcpm-magnetic-male-auditions/audio/summary.json`
- Create at runtime: `public/generated/voxcpm-magnetic-male-auditions/audio/index.md`

**Interfaces:**
- Consumes: `createVoxcpmProducerRequestPlan`, `readProducerVoxcpmConfig`, and `requestProducerNarrationAsset`.
- Produces: ten numbered WAV candidates and summary entries containing `id`, `durationInSeconds`, `durationInFrames`, `audioSrc`, and `outputPath`.

- [ ] **Step 1: Create the local-only runner**

Create `public/generated/voxcpm-magnetic-male-auditions/generate.mjs` with:

```javascript
#!/usr/bin/env node

import {mkdir, writeFile} from "node:fs/promises";
import {
  createVoxcpmProducerRequestPlan,
  readProducerVoxcpmConfig,
  requestProducerNarrationAsset,
} from "../../../scripts/lib/producer-audio/index.js";

const slug = "voxcpm-magnetic-male-auditions";
const text = "科学真正迷人的地方就在于让复杂的世界突然变得清晰而震撼。";
const control =
  "young Chinese male science narrator, low-pitched and magnetic, passionate and inspiring";
const config = readProducerVoxcpmConfig();
const accepted = [];

for (let number = 1; number <= 10; number += 1) {
  const id = `candidate-${String(number).padStart(2, "0")}`;
  let result;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const plan = createVoxcpmProducerRequestPlan({
      beat: {
        id,
        narrationRequired: true,
        ttsText: text,
        displayText: text,
        language: "zh-CN",
      },
      mode: "voice-design",
      control,
    });
    result = await requestProducerNarrationAsset({config, plan, slug});
    if (result.durationInSeconds >= 5 && result.durationInSeconds <= 10) break;
    if (attempt === 3) {
      throw new Error(
        `${id} remained outside 5-10 seconds after 3 attempts: ${result.durationInSeconds}`,
      );
    }
  }
  accepted.push({
    id,
    durationInSeconds: result.durationInSeconds,
    durationInFrames: result.durationInFrames,
    audioSrc: result.audioSrc,
    outputPath: result.outputPath,
  });
  console.log(`${id}: ${result.durationInSeconds.toFixed(3)}s`);
}

const root = `public/generated/${slug}/audio`;
await mkdir(root, {recursive: true});
await writeFile(
  `${root}/summary.json`,
  `${JSON.stringify({mode: "voice-design", text, control, candidates: accepted}, null, 2)}\n`,
  "utf8",
);
await writeFile(
  `${root}/index.md`,
  [
    "# VoxCPM Magnetic Male Voice Auditions",
    "",
    ...accepted.map(
      (candidate) =>
        `- ${candidate.id}: ${candidate.durationInSeconds.toFixed(3)}s - ${candidate.id}.wav`,
    ),
    "",
  ].join("\n"),
  "utf8",
);
```

- [ ] **Step 2: Prove the runner and outputs are ignored**

Run:

```bash
git check-ignore -v public/generated/voxcpm-magnetic-male-auditions/generate.mjs public/generated/voxcpm-magnetic-male-auditions/audio/candidate-01.wav
```

Expected: both paths match the `public/generated/` ignore rule.

### Task 3: Generate Ten Candidates Sequentially

**Files:**
- Execute local-only: `public/generated/voxcpm-magnetic-male-auditions/generate.mjs`
- Verify: `public/generated/voxcpm-magnetic-male-auditions/audio/summary.json`

**Interfaces:**
- Consumes: local audition runner and configured VoxCPM service.
- Produces: exactly ten accepted WAV entries using the shared narration contract.

- [ ] **Step 1: Generate through the Producer container**

Run:

```bash
docker compose exec -T producer npx tsx public/generated/voxcpm-magnetic-male-auditions/generate.mjs
```

Expected: ten `candidate-NN: N.NNNs` lines and exit 0. A cold service may make the first request slower while the model reloads.

- [ ] **Step 2: Validate the summary contract**

Run:

```bash
docker compose exec -T producer node -e 'const fs=require("fs"); const p="public/generated/voxcpm-magnetic-male-auditions/audio/summary.json"; const s=JSON.parse(fs.readFileSync(p,"utf8")); if(s.mode!=="voice-design"||s.candidates.length!==10||s.candidates.some((c)=>c.durationInSeconds<5||c.durationInSeconds>10)) process.exit(1); console.log(`summary valid: ${s.candidates.length}`)'
```

Expected: `summary valid: 10`.

### Task 4: Verify Audio And Git Boundary

**Files:**
- Verify: `public/generated/voxcpm-magnetic-male-auditions/audio/candidate-01.wav` through `candidate-10.wav`
- Verify: `public/generated/voxcpm-magnetic-male-auditions/audio/index.md`

**Interfaces:**
- Consumes: ten generated candidate WAVs.
- Produces: independent codec/duration/signal evidence and a clean Git-boundary report.

- [ ] **Step 1: Probe all WAV durations and streams**

Run:

```bash
for file in public/generated/voxcpm-magnetic-male-auditions/audio/candidate-*.wav; do printf '%s\t' "$(basename "$file")"; ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,sample_rate,channels:format=duration -of default=noprint_wrappers=1 "$file" | tr '\n' ' '; printf '\n'; done
```

Expected: ten rows; each reports `pcm_s16le`, positive sample rate/channels, and 5–10 second duration.

- [ ] **Step 2: Check audible signal and peak headroom**

Run:

```bash
for file in public/generated/voxcpm-magnetic-male-auditions/audio/candidate-*.wav; do printf '%s\t' "$(basename "$file")"; ffmpeg -hide_banner -nostats -i "$file" -af volumedetect -f null - 2>&1 | awk -F': ' '/mean_volume|max_volume/{printf "%s ", $2} END{print ""}'; done
```

Expected: ten rows with finite mean/max volume; no candidate is silent and no maximum is above 0 dBFS.

- [ ] **Step 3: Confirm exactly ten local-only candidates**

Run:

```bash
test "$(find public/generated/voxcpm-magnetic-male-auditions/audio -maxdepth 1 -name 'candidate-*.wav' -type f | wc -l)" -eq 10
git status --short --untracked-files=all
git ls-files --error-unmatch public/generated/voxcpm-magnetic-male-auditions/audio/candidate-01.wav
```

Expected: count passes; Git status omits the generated root; `git ls-files --error-unmatch` exits non-zero. Existing unrelated dirty work remains unchanged.

- [ ] **Step 4: Hand off the audition list**

Read `summary.json` and provide candidate numbers, measured durations, and clickable absolute WAV paths. Ask the user to judge timbre, diction, energy, and long-form listening comfort before selecting the future clone reference.
