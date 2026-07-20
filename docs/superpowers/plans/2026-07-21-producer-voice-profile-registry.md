# Producer Voice Profile Registry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one typed, VoxCPM-only voice profile registry and make every future Producer scaffold select a registered clone voice explicitly, so Chinese science explainers resolve to `science-explainer-young-male` instead of silently inheriting hard-coded `lyy` paths.

**Architecture:** Store the committed profile definitions in one data registry under `scripts/lib/producer-audio/`, validate and resolve them through a small TypeScript module, and adapt the existing `createVoxcpmProducerRequestPlan()` boundary rather than introducing another provider abstraction. Add a forward-only `voiceProfileId` manifest/scaffold contract while preserving every existing maintained/frozen composition, generated audio artifact, and private ignored voice file unchanged. Record this as a bounded post-Roadmap capability; Phase 9 and the Roadmap remain complete.

**Tech Stack:** TypeScript 5.9, Node.js ESM smoke scripts, direct VoxCPM Producer runtime, JSON registry data, Producer sample manifests/scaffold, Docker-first verification.

---

## Scope And Decisions

- Registry v1 contains exactly two clone identities:
  - `lyy`: general/non-science compatibility profile; default mode `high-fidelity-clone`; prompt audio `voices/clone/lyy.wav`; transcript `voices/clone/lyy.txt`; same-speaker timbre anchor `voices/clone/lyy-r.wav`.
  - `science-explainer-young-male`: future Chinese science-explainer default; default mode `controllable-clone`; reference audio `voices/clone/science-explainer-young-male.wav`; optional high-fidelity mode uses the same WAV plus `voices/clone/science-explainer-young-male.txt` and no control instruction.
- The registry owns clone identity, supported modes, reference paths, default mode, and control policy. It does not own narration copy or creative per-beat delivery wording.
- `voice-design` stays a supported raw VoxCPM mode but is not a clone identity and therefore has no `voiceProfileId`.
- `producer:scaffold` requires both `--style-profile` and `--voice-profile`; there is no CLI fallback. Agent Producer applies the science default from the brief and passes the explicit id.
- A future scaffold records `narration.voiceProfileId` and the resolved default clone mode. Existing manifests may omit the field so completed work is not retrofitted.
- Existing composition-local `generate.mjs` files are compatibility history for this iteration. Do not rewrite them and do not regenerate their narration merely to adopt the registry.
- Guard the six current composition generators that still contain raw clone paths through an exact compatibility allowlist. Any later `src/remotion/**/generate.mjs` with a raw `voices/clone/` path is a regression.
- Private WAV/TXT files remain ignored local inputs. Registry records contain repository-relative paths only; no audio bytes, transcripts, user identity data, secrets, or absolute workstation paths are committed.
- No Web route, provider selector, F5 path, fallback voice, environment variable, voice upload/admission flow, database, UI, or automatic content classifier is added.

## File Structure

| Path | Responsibility |
| --- | --- |
| `scripts/lib/producer-audio/voice-profiles.json` | Single committed data registry for clone ids, default/supported modes, local reference paths, and control requirements. |
| `scripts/lib/producer-audio/voice-profiles.ts` | Typed validation, strict lookup, mode resolution, and adapter into the existing VoxCPM request-plan builder. |
| `scripts/lib/producer-audio/index.ts` | Public Producer audio exports for profile ids, lookup, and request-plan resolution. |
| `scripts/smoke/producer/producer-voice-profiles-smoke.mjs` | Focused static and compiled-runtime RED/GREEN coverage for registry, resolver, scaffold, manifest, and fail-closed boundaries. |
| `scripts/producer-scaffold.mjs` | Mandatory `--voice-profile` parsing from the registry and token replacement into future source. |
| `src/remotion/producer-samples/manifest.ts` | Backward-compatible optional manifest field plus a strict future-scaffold manifest type and validation. |
| `src/remotion/producer-samples/scaffold/SampleName/generate.mjs` | Registry-driven generation example with no raw `lyy`/science path literals. |
| `src/remotion/producer-samples/scaffold/SampleName/manifest.ts` | Explicit future `voiceProfileId` and resolved clone mode. |
| `scripts/smoke/producer/agent-producer-os-smoke.mjs` | Scaffold CLI success/failure and generated-token assertions. |
| `scripts/smoke/producer/producer-validation-smoke.mjs` | Manifest rejection for unknown profiles, voice-design/profile misuse, and unsupported profile/mode pairs. |
| `package.json` | `smoke:producer-voice-profiles` command and compile inputs for dependent smokes. |
| Active Producer docs/skills | Explicit selection workflow, compatibility boundary, and post-Roadmap completion status. |

### Task 1: Add The Typed Registry Contract

**Files:**
- Create: `scripts/lib/producer-audio/voice-profiles.json`
- Create: `scripts/lib/producer-audio/voice-profiles.ts`
- Create: `scripts/smoke/producer/producer-voice-profiles-smoke.mjs`
- Modify: `scripts/lib/producer-audio/index.ts`
- Modify: `package.json`

- [ ] **Step 1: Add the focused command and a failing registry smoke**

Add this package command:

```json
"smoke:producer-voice-profiles": "rm -rf /tmp/producer-voice-profiles-smoke-build && npx tsc --allowJs --resolveJsonModule --target es2022 --module commonjs --moduleResolution node --skipLibCheck --esModuleInterop --noEmit false --rootDir . --outDir /tmp/producer-voice-profiles-smoke-build scripts/smoke/producer/producer-voice-profiles-smoke.mjs scripts/lib/producer-audio/types.ts scripts/lib/producer-audio/captions.ts scripts/lib/producer-audio/providers/voxcpm.ts scripts/lib/producer-audio/voice-profiles.ts src/remotion/standalone-video/caption-types.ts && NODE_PATH=/workspace/node_modules:node_modules PRODUCER_VOICE_PROFILES_BUILD_DIR=/tmp/producer-voice-profiles-smoke-build node /tmp/producer-voice-profiles-smoke-build/scripts/smoke/producer/producer-voice-profiles-smoke.mjs"
```

Create the smoke with these initial imports and assertions; later tasks extend the same file:

```js
#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const read = (relativePath) => readFileSync(path.join(root, relativePath), "utf8");
const buildRoot = process.env.PRODUCER_VOICE_PROFILES_BUILD_DIR;
assert(buildRoot, "PRODUCER_VOICE_PROFILES_BUILD_DIR is required.");

const registryPath = "scripts/lib/producer-audio/voice-profiles.json";
const runtimePath = path.join(buildRoot, "scripts/lib/producer-audio/voice-profiles.js");
const registry = JSON.parse(read(registryPath));
const runtime = await import(pathToFileURL(runtimePath).href);

assert.equal(registry.version, 1);
assert.deepEqual(
  registry.profiles.map((profile) => profile.id),
  ["lyy", "science-explainer-young-male"],
);
assert.deepEqual(runtime.producerVoiceProfileIds, [
  "lyy",
  "science-explainer-young-male",
]);
assert.doesNotThrow(() => runtime.assertProducerVoiceProfiles());
assert.throws(() => runtime.getProducerVoiceProfile("missing-profile"), /unknown/i);

console.log("Producer voice profile registry smoke passed.");
```

- [ ] **Step 2: Run the smoke and verify RED**

Run:

```bash
npm run smoke:producer-voice-profiles
```

Expected: non-zero exit because `scripts/lib/producer-audio/voice-profiles.ts` or `voice-profiles.json` does not exist.

- [ ] **Step 3: Add the registry data**

Create `scripts/lib/producer-audio/voice-profiles.json` exactly as follows:

```json
{
  "version": 1,
  "profiles": [
    {
      "id": "lyy",
      "label": "LYY",
      "useWhen": "General or non-science narration explicitly selects the existing clone identity.",
      "defaultMode": "high-fidelity-clone",
      "highFidelityClone": {
        "promptAudioPath": "voices/clone/lyy.wav",
        "promptTranscriptPath": "voices/clone/lyy.txt",
        "referenceAudioPath": "voices/clone/lyy-r.wav"
      }
    },
    {
      "id": "science-explainer-young-male",
      "label": "Science explainer young male",
      "useWhen": "Future Chinese science-explainer narration unless the production brief explicitly overrides it.",
      "defaultMode": "controllable-clone",
      "controllableClone": {
        "referenceAudioPath": "voices/clone/science-explainer-young-male.wav",
        "controlRequired": true
      },
      "highFidelityClone": {
        "promptAudioPath": "voices/clone/science-explainer-young-male.wav",
        "promptTranscriptPath": "voices/clone/science-explainer-young-male.txt",
        "referenceAudioPath": "voices/clone/science-explainer-young-male.wav"
      }
    }
  ]
}
```

- [ ] **Step 4: Implement strict typed validation and lookup**

Create `scripts/lib/producer-audio/voice-profiles.ts` with these public contracts and validation rules:

```ts
import registryDocument from "./voice-profiles.json";

export const producerVoiceProfileIds = ["lyy", "science-explainer-young-male"] as const;

export type ProducerVoiceProfileId = (typeof producerVoiceProfileIds)[number];
export type ProducerCloneMode = "controllable-clone" | "high-fidelity-clone";

export type ProducerControllableCloneProfile = {
  readonly referenceAudioPath: string;
  readonly controlRequired: boolean;
};

export type ProducerHighFidelityCloneProfile = {
  readonly promptAudioPath: string;
  readonly promptTranscriptPath: string;
  readonly referenceAudioPath: string;
};

export type ProducerVoiceProfile = {
  readonly id: ProducerVoiceProfileId;
  readonly label: string;
  readonly useWhen: string;
  readonly defaultMode: ProducerCloneMode;
  readonly controllableClone?: ProducerControllableCloneProfile;
  readonly highFidelityClone?: ProducerHighFidelityCloneProfile;
};

const requireText = (value: unknown, label: string): string => {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} must be non-empty.`);
  return value.trim();
};

const requireClonePath = (value: unknown, label: string, extension: ".wav" | ".txt"): string => {
  const filePath = requireText(value, label);
  if (
    !filePath.startsWith("voices/clone/") ||
    filePath.startsWith("/") ||
    filePath.includes("..") ||
    !filePath.endsWith(extension)
  ) {
    throw new Error(`${label} must be a repository-relative voices/clone/${extension} path.`);
  }
  return filePath;
};

const parseProfile = (value: unknown): ProducerVoiceProfile => {
  if (!value || typeof value !== "object") throw new Error("Producer voice profile must be an object.");
  const profile = value as Record<string, unknown>;
  const id = requireText(profile.id, "Producer voice profile id");
  if (!isProducerVoiceProfileId(id)) throw new Error(`Unknown Producer voice profile id: ${id}.`);
  const defaultMode = requireText(profile.defaultMode, `${id} defaultMode`);
  if (defaultMode !== "controllable-clone" && defaultMode !== "high-fidelity-clone") {
    throw new Error(`${id} has an unsupported default clone mode.`);
  }
  const controllable = profile.controllableClone as Record<string, unknown> | undefined;
  const highFidelity = profile.highFidelityClone as Record<string, unknown> | undefined;
  if (controllable && typeof controllable.controlRequired !== "boolean") {
    throw new Error(`${id} controllable controlRequired must be boolean.`);
  }
  for (const forbidden of ["fallbackProfileId", "fallbackVoice", "provider"] as const) {
    if (forbidden in profile) throw new Error(`${id} must not declare ${forbidden}.`);
  }
  const parsed: ProducerVoiceProfile = {
    id,
    label: requireText(profile.label, `${id} label`),
    useWhen: requireText(profile.useWhen, `${id} useWhen`),
    defaultMode,
    ...(controllable
      ? {
          controllableClone: {
            referenceAudioPath: requireClonePath(
              controllable.referenceAudioPath,
              `${id} controllable referenceAudioPath`,
              ".wav",
            ),
            controlRequired: controllable.controlRequired,
          },
        }
      : {}),
    ...(highFidelity
      ? {
          highFidelityClone: {
            promptAudioPath: requireClonePath(
              highFidelity.promptAudioPath,
              `${id} promptAudioPath`,
              ".wav",
            ),
            promptTranscriptPath: requireClonePath(
              highFidelity.promptTranscriptPath,
              `${id} promptTranscriptPath`,
              ".txt",
            ),
            referenceAudioPath: requireClonePath(
              highFidelity.referenceAudioPath,
              `${id} high-fidelity referenceAudioPath`,
              ".wav",
            ),
          },
        }
      : {}),
  };
  if (parsed.defaultMode === "controllable-clone" && !parsed.controllableClone) {
    throw new Error(`${id} default mode requires controllableClone configuration.`);
  }
  if (parsed.defaultMode === "high-fidelity-clone" && !parsed.highFidelityClone) {
    throw new Error(`${id} default mode requires highFidelityClone configuration.`);
  }
  return parsed;
};

export const isProducerVoiceProfileId = (value: string): value is ProducerVoiceProfileId =>
  (producerVoiceProfileIds as readonly string[]).includes(value);

export const producerVoiceProfiles = registryDocument.profiles.map(parseProfile);

export const assertProducerVoiceProfiles = (
  profiles: readonly ProducerVoiceProfile[] = producerVoiceProfiles,
): void => {
  if (registryDocument.version !== 1) throw new Error("Producer voice profile registry version must be 1.");
  if (profiles.length !== producerVoiceProfileIds.length) {
    throw new Error(`Expected ${producerVoiceProfileIds.length} Producer voice profiles.`);
  }
  const ids = new Set<ProducerVoiceProfileId>();
  for (const profile of profiles) {
    if (ids.has(profile.id)) throw new Error(`Duplicate Producer voice profile: ${profile.id}.`);
    ids.add(profile.id);
  }
  for (const id of producerVoiceProfileIds) {
    if (!ids.has(id)) throw new Error(`Missing Producer voice profile: ${id}.`);
  }
};

export const getProducerVoiceProfile = (id: ProducerVoiceProfileId): ProducerVoiceProfile => {
  const profile = producerVoiceProfiles.find((candidate) => candidate.id === id);
  if (!profile) throw new Error(`Unknown Producer voice profile: ${String(id)}.`);
  return profile;
};

assertProducerVoiceProfiles();
```

During implementation, keep the error text and public names above stable. Do not add fallback lookup such as `getProducerVoiceProfile(id) ?? getProducerVoiceProfile("lyy")`.

- [ ] **Step 5: Export the registry surface**

Append this export to `scripts/lib/producer-audio/index.ts`:

```ts
export * from "./voice-profiles";
```

- [ ] **Step 6: Run the focused smoke and verify GREEN**

Run:

```bash
npm run smoke:producer-voice-profiles
```

Expected: `Producer voice profile registry smoke passed.`

- [ ] **Step 7: Commit the registry contract**

```bash
git add package.json scripts/lib/producer-audio/index.ts scripts/lib/producer-audio/voice-profiles.json scripts/lib/producer-audio/voice-profiles.ts scripts/smoke/producer/producer-voice-profiles-smoke.mjs
git commit -m "feat: add producer voice profile registry"
```

### Task 2: Resolve Registered Profiles Into Existing VoxCPM Plans

**Files:**
- Modify: `scripts/lib/producer-audio/voice-profiles.ts`
- Modify: `scripts/smoke/producer/producer-voice-profiles-smoke.mjs`
- Modify: `scripts/smoke/producer/producer-audio-direct-voxcpm-smoke.mjs`
- Modify: `package.json`

- [ ] **Step 1: Add failing resolver assertions**

Extend `producer-voice-profiles-smoke.mjs` with a reusable beat and these assertions:

```js
const beat = {
  id: "science-beat",
  narrationRequired: true,
  ttsText: "让我们解释这个概念。",
  displayText: "让我们解释这个概念。",
  language: "zh-CN",
};

const lyyPlan = runtime.createVoxcpmProducerRequestPlanForProfile({
  beat,
  profileId: "lyy",
});
assert.deepEqual(
  {
    mode: lyyPlan.mode,
    promptAudioPath: lyyPlan.promptAudioPath,
    promptTranscriptPath: lyyPlan.promptTranscriptPath,
    referenceAudioPath: lyyPlan.referenceAudioPath,
  },
  {
    mode: "high-fidelity-clone",
    promptAudioPath: "voices/clone/lyy.wav",
    promptTranscriptPath: "voices/clone/lyy.txt",
    referenceAudioPath: "voices/clone/lyy-r.wav",
  },
);

assert.throws(
  () => runtime.createVoxcpmProducerRequestPlanForProfile({ beat, profileId: "science-explainer-young-male" }),
  /control/i,
);
const sciencePlan = runtime.createVoxcpmProducerRequestPlanForProfile({
  beat,
  profileId: "science-explainer-young-male",
  control: "冷静、清晰、自然解释，中速",
});
assert.equal(sciencePlan.mode, "controllable-clone");
assert.equal(
  sciencePlan.referenceAudioPath,
  "voices/clone/science-explainer-young-male.wav",
);
assert.equal(sciencePlan.control, "冷静、清晰、自然解释，中速");

const scienceHighFidelityPlan = runtime.createVoxcpmProducerRequestPlanForProfile({
  beat,
  profileId: "science-explainer-young-male",
  mode: "high-fidelity-clone",
});
assert.equal(scienceHighFidelityPlan.mode, "high-fidelity-clone");
assert.equal(
  scienceHighFidelityPlan.promptAudioPath,
  "voices/clone/science-explainer-young-male.wav",
);
assert.equal(
  scienceHighFidelityPlan.promptTranscriptPath,
  "voices/clone/science-explainer-young-male.txt",
);
assert.equal("control" in scienceHighFidelityPlan, false);
assert.throws(
  () =>
    runtime.createVoxcpmProducerRequestPlanForProfile({
      beat,
      profileId: "lyy",
      mode: "controllable-clone",
      control: "calm",
    }),
  /does not support/i,
);
```

- [ ] **Step 2: Run the smoke and verify RED**

Run:

```bash
npm run smoke:producer-voice-profiles
```

Expected: FAIL because `createVoxcpmProducerRequestPlanForProfile` is not exported.

- [ ] **Step 3: Implement the adapter without changing transport**

Add these imports and function to `voice-profiles.ts`:

```ts
import type { ProducerNarratedBeat, ProducerVoxcpmRequestPlan } from "./types";
import { createVoxcpmProducerRequestPlan } from "./providers/voxcpm";

export const createVoxcpmProducerRequestPlanForProfile = ({
  beat,
  control,
  mode,
  profileId,
}: {
  readonly beat: ProducerNarratedBeat;
  readonly control?: string;
  readonly mode?: ProducerCloneMode;
  readonly profileId: ProducerVoiceProfileId;
}): ProducerVoxcpmRequestPlan => {
  const profile = getProducerVoiceProfile(profileId);
  const resolvedMode = mode ?? profile.defaultMode;
  if (resolvedMode === "controllable-clone") {
    if (!profile.controllableClone) {
      throw new Error(`${profile.id} does not support controllable-clone.`);
    }
    const normalizedControl = control?.trim();
    if (profile.controllableClone.controlRequired && !normalizedControl) {
      throw new Error(`${profile.id} controllable-clone requires a compact per-beat control.`);
    }
    return createVoxcpmProducerRequestPlan({
      beat,
      mode: resolvedMode,
      referenceAudioPath: profile.controllableClone.referenceAudioPath,
      ...(normalizedControl ? { control: normalizedControl } : {}),
    });
  }
  if (!profile.highFidelityClone) {
    throw new Error(`${profile.id} does not support high-fidelity-clone.`);
  }
  if (control?.trim()) {
    throw new Error(`${profile.id} high-fidelity-clone must omit control.`);
  }
  return createVoxcpmProducerRequestPlan({
    beat,
    mode: resolvedMode,
    promptAudioPath: profile.highFidelityClone.promptAudioPath,
    promptTranscriptPath: profile.highFidelityClone.promptTranscriptPath,
    referenceAudioPath: profile.highFidelityClone.referenceAudioPath,
  });
};
```

The adapter must return the unchanged `ProducerVoxcpmRequestPlan` union. Do not add `profileId` to the transport payload; the resolved paths/mode already participate in the existing request fingerprint.

- [ ] **Step 4: Extend direct-runtime coverage for the registered science path**

Add `voice-profiles.ts` to the `smoke:producer-audio-direct-voxcpm` compile list. In its smoke, import `createVoxcpmProducerRequestPlanForProfile`, copy the registry's two science fixture filenames into the temporary `voices/clone/` root, and assert:

```js
const registeredSciencePlan = createVoxcpmProducerRequestPlanForProfile({
  beat: { id: "registered-science", narrationRequired: true, ttsText: "注册表克隆。" },
  profileId: "science-explainer-young-male",
  control: "清晰、自然、中速",
});
await requestProducerNarrationAsset({
  config,
  fetchImpl: fetchAudio,
  plan: registeredSciencePlan,
  rootDir: artifactRoot,
  slug: "fixture-video",
});
assert.equal(requests.at(-1)?.url, config.controllableCloneEndpoint);
assert.equal(textField(requests.at(-1)?.body, "control"), "清晰、自然、中速");
```

Retain the existing missing-reference assertion. It is the fail-closed proof: registry resolution never falls back to `lyy` when a selected private file is absent.

- [ ] **Step 5: Run focused audio checks**

Run:

```bash
npm run smoke:producer-voice-profiles
npm run smoke:producer-audio-direct-voxcpm
npm run smoke:producer-audio-tools
```

Expected: all three pass; no live VoxCPM service is contacted because request bytes are mocked.

- [ ] **Step 6: Commit the resolver**

```bash
git add package.json scripts/lib/producer-audio/voice-profiles.ts scripts/smoke/producer/producer-voice-profiles-smoke.mjs scripts/smoke/producer/producer-audio-direct-voxcpm-smoke.mjs
git commit -m "feat: resolve registered voices into voxcpm plans"
```

### Task 3: Add A Forward-Only Manifest Contract

**Files:**
- Modify: `src/remotion/producer-samples/manifest.ts`
- Modify: `src/remotion/producer-samples/scaffold/SampleName/manifest.ts`
- Modify: `scripts/smoke/producer/producer-validation-smoke.mjs`
- Modify: `scripts/smoke/producer/producer-voice-profiles-smoke.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write failing manifest assertions**

Extend the compiled smoke to import `assertProducerSampleManifest` and `sampleNameManifest`, then assert:

```js
assert.equal(sampleNameManifest.narration.voiceProfileId, "lyy");
assert.doesNotThrow(() => assertProducerSampleManifest(sampleNameManifest));
assert.throws(
  () =>
    assertProducerSampleManifest({
      ...sampleNameManifest,
      narration: { ...sampleNameManifest.narration, voiceProfileId: "unknown-voice" },
    }),
  /voice profile/i,
);
assert.throws(
  () =>
    assertProducerSampleManifest({
      ...sampleNameManifest,
      narration: {
        ...sampleNameManifest.narration,
        mode: "voice-design",
        voiceProfileId: "lyy",
      },
    }),
  /voice-design.*voice profile|voice profile.*voice-design/i,
);
assert.throws(
  () =>
    assertProducerSampleManifest({
      ...sampleNameManifest,
      narration: {
        ...sampleNameManifest.narration,
        mode: "controllable-clone",
        voiceProfileId: "lyy",
      },
    }),
  /does not support/i,
);
```

Update the voice-profile smoke compile command to include:

```txt
src/remotion/styles/profile-ids.ts
src/remotion/producer-samples/manifest.ts
src/remotion/producer-samples/scaffold/SampleName/manifest.ts
```

- [ ] **Step 2: Run the smoke and verify RED**

Run:

```bash
npm run smoke:producer-voice-profiles
```

Expected: FAIL because the scaffold manifest has no `voiceProfileId` and the manifest validator has no registry contract.

- [ ] **Step 3: Add backward-compatible manifest types and validation**

In `src/remotion/producer-samples/manifest.ts`, import:

```ts
import {
  getProducerVoiceProfile,
  isProducerVoiceProfileId,
  type ProducerCloneMode,
  type ProducerVoiceProfileId,
} from "../../../scripts/lib/producer-audio/voice-profiles";
```

Extend maintained narration with the optional compatibility field:

```ts
readonly narration: {
  readonly required: boolean;
  readonly provider: "voxcpm";
  readonly mode: "voice-design" | "controllable-clone" | "high-fidelity-clone";
  readonly voiceProfileId?: ProducerVoiceProfileId;
  readonly scriptPath: string;
  readonly audioMetadataPath: string;
};
```

Add this strict future type after `QualityGatedMaintainedProducerSampleManifest`:

```ts
export type VoiceProfiledQualityGatedMaintainedProducerSampleManifest = Omit<
  QualityGatedMaintainedProducerSampleManifest,
  "narration"
> & {
  readonly narration: QualityGatedMaintainedProducerSampleManifest["narration"] & {
    readonly mode: ProducerCloneMode;
    readonly voiceProfileId: ProducerVoiceProfileId;
  };
};
```

Inside `assertProducerSampleManifest()`, after the provider check, add:

```ts
if (manifest.narration.voiceProfileId !== undefined) {
  if (!isProducerVoiceProfileId(manifest.narration.voiceProfileId)) {
    throw new Error(`${manifest.compositionId} has an unsupported Producer voice profile.`);
  }
  if (manifest.narration.mode === "voice-design") {
    throw new Error(`${manifest.compositionId} voice-design must not declare a voice profile.`);
  }
  const voiceProfile = getProducerVoiceProfile(manifest.narration.voiceProfileId);
  if (
    (manifest.narration.mode === "controllable-clone" && !voiceProfile.controllableClone) ||
    (manifest.narration.mode === "high-fidelity-clone" && !voiceProfile.highFidelityClone)
  ) {
    throw new Error(
      `${manifest.compositionId} voice profile ${voiceProfile.id} does not support ${manifest.narration.mode}.`,
    );
  }
}
```

Existing manifests without `voiceProfileId` continue to validate. Do not add the field to completed composition manifests in this iteration.

- [ ] **Step 4: Make the scaffold manifest satisfy the strict future type**

Change the scaffold import and narration block to:

```ts
import type { VoiceProfiledQualityGatedMaintainedProducerSampleManifest } from "../../manifest";

// Inside narration:
voiceProfileId: "lyy" /* VOICE_PROFILE_ID */,
mode: "high-fidelity-clone" /* VOICE_MODE */,

// Final satisfies clause:
} as const satisfies VoiceProfiledQualityGatedMaintainedProducerSampleManifest;
```

- [ ] **Step 5: Update dependent compile lists and validation fixtures**

Add `scripts/lib/producer-audio/voice-profiles.ts` and `--resolveJsonModule` to the package commands that compile `manifest.ts`, including:

- `smoke:producer-validation`
- `smoke:producer-review-frames`
- `smoke:producer-os`
- `smoke:producer-sample-manifest`
- `smoke:producer-promotion-gate`
- `smoke:producer-style-profile-sample-contract`
- `smoke:producer-asset-library`

Extend `producer-validation-smoke.mjs` with the same three invalid manifest cases from Step 1 so the general validation gate, not only the focused registry smoke, owns the contract.

- [ ] **Step 6: Run manifest and validation checks**

Run:

```bash
npm run smoke:producer-voice-profiles
npm run smoke:producer-validation
npm run smoke:producer-sample-manifest
npm run smoke:producer-style-profile-sample-contract
```

Expected: all pass; existing maintained and frozen manifests remain accepted without modification.

- [ ] **Step 7: Commit the manifest contract**

```bash
git add package.json src/remotion/producer-samples/manifest.ts src/remotion/producer-samples/scaffold/SampleName/manifest.ts scripts/smoke/producer/producer-validation-smoke.mjs scripts/smoke/producer/producer-voice-profiles-smoke.mjs
git commit -m "feat: record future producer voice profiles"
```

### Task 4: Make Future Scaffolds Select A Voice Explicitly

**Files:**
- Modify: `scripts/producer-scaffold.mjs`
- Modify: `src/remotion/producer-samples/scaffold/SampleName/generate.mjs`
- Modify: `scripts/smoke/producer/agent-producer-os-smoke.mjs`
- Modify: `scripts/smoke/producer/producer-voice-profiles-smoke.mjs`

- [ ] **Step 1: Add failing scaffold CLI coverage**

In `agent-producer-os-smoke.mjs`, add `--voice-profile`, `science-explainer-young-male` to the successful scaffold invocation. Assert:

```js
assert(generatedManifest.includes('voiceProfileId: "science-explainer-young-male"'));
assert(generatedManifest.includes('mode: "controllable-clone"'));
assert(generatedGenerator.includes('voiceProfileId = "science-explainer-young-male"'));
assert(generatedGenerator.includes('voiceMode = "controllable-clone"'));
assert(generatedGenerator.includes("createVoxcpmProducerRequestPlanForProfile"));
assert(!generatedGenerator.includes("voices/clone/lyy"));
assert(!generatedGenerator.includes("VOICE_PROFILE_ID"));
assert(!generatedGenerator.includes("VOICE_MODE"));
```

Before the successful invocation, add two `assert.throws()` cases using `execFileSync`:

```js
assert.throws(
  () =>
    execFileSync(process.execPath, [
      "scripts/producer-scaffold.mjs",
      "--name",
      "MissingVoiceFixture",
      "--slug",
      "missing-voice-fixture",
      "--style-profile",
      "retro-terminal",
      "--output-root",
      outputRoot,
    ]),
  /voice-profile|usage/i,
);
assert.throws(
  () =>
    execFileSync(process.execPath, [
      "scripts/producer-scaffold.mjs",
      "--name",
      "UnknownVoiceFixture",
      "--slug",
      "unknown-voice-fixture",
      "--style-profile",
      "retro-terminal",
      "--voice-profile",
      "unknown-voice",
      "--output-root",
      outputRoot,
    ]),
  /voice-profile.*one of/i,
);
```

- [ ] **Step 2: Run Producer OS smoke and verify RED**

Run:

```bash
npm run smoke:producer-os
```

Expected: FAIL because the CLI ignores `--voice-profile` and still emits raw `lyy` paths.

- [ ] **Step 3: Read the single registry data source in the scaffold CLI**

In `scripts/producer-scaffold.mjs`:

```js
const voiceProfileId = valueFor("--voice-profile");
const voiceProfileRegistry = JSON.parse(
  await readFile(path.resolve("scripts/lib/producer-audio/voice-profiles.json"), "utf8"),
);
const voiceProfiles = voiceProfileRegistry.profiles;
const voiceProfile = voiceProfiles.find((candidate) => candidate.id === voiceProfileId);
```

Change the usage guard to require `voiceProfileId` and show this exact command:

```txt
Usage: npm run producer:scaffold -- --name <PascalCase> --slug <kebab-case> --style-profile <profile-id> --voice-profile <voice-profile-id> [--output-root <path>]
```

Reject unknown ids without a default:

```js
if (!voiceProfile) {
  throw new Error(
    `--voice-profile must be one of: ${voiceProfiles.map((profile) => profile.id).join(", ")}.`,
  );
}
```

Add these replacements to `replaceTokens()`:

```js
.replaceAll('"lyy" /* VOICE_PROFILE_ID */', JSON.stringify(voiceProfile.id))
.replaceAll('"high-fidelity-clone" /* VOICE_MODE */', JSON.stringify(voiceProfile.defaultMode))
```

The CLI must read ids and default modes from `voice-profiles.json`; do not duplicate another voice id array in `producer-scaffold.mjs`.

- [ ] **Step 4: Replace raw clone paths in the scaffold generator**

Change `SampleName/generate.mjs` imports to use `createVoxcpmProducerRequestPlanForProfile`. Add:

```js
const voiceProfileId = "lyy" /* VOICE_PROFILE_ID */;
const voiceMode = "high-fidelity-clone" /* VOICE_MODE */;
```

Give each scaffold beat a compact `voiceControl`, for example:

```js
voiceControl: "Natural, clear explanation, medium pace, restrained ending",
```

Replace the raw request-plan object with:

```js
createRequestPlan: (beat) =>
  createVoxcpmProducerRequestPlanForProfile({
    beat,
    profileId: voiceProfileId,
    mode: voiceMode,
    ...(voiceMode === "controllable-clone" ? { control: beat.voiceControl } : {}),
  }),
```

The finished scaffold template must contain none of:

```txt
voices/clone/lyy.wav
voices/clone/lyy.txt
voices/clone/lyy-r.wav
voices/clone/science-explainer-young-male.wav
voices/clone/science-explainer-young-male.txt
```

- [ ] **Step 5: Extend the focused registry smoke with static boundary checks**

Add:

```js
const scaffoldGenerator = read("src/remotion/producer-samples/scaffold/SampleName/generate.mjs");
for (const forbidden of [
  "voices/clone/lyy.wav",
  "voices/clone/lyy.txt",
  "voices/clone/lyy-r.wav",
  "voices/clone/science-explainer-young-male.wav",
  "voices/clone/science-explainer-young-male.txt",
]) {
  assert(!scaffoldGenerator.includes(forbidden), `Future scaffold must not hard-code ${forbidden}.`);
}
assert(scaffoldGenerator.includes("createVoxcpmProducerRequestPlanForProfile"));
```

- [ ] **Step 6: Run scaffold and audio contract checks**

Run:

```bash
npm run smoke:producer-os
npm run smoke:producer-voice-profiles
npm run smoke:producer-audio-tools
```

Expected: all pass; the temporary science scaffold records `science-explainer-young-male` plus `controllable-clone` and contains no raw clone paths.

- [ ] **Step 7: Commit the scaffold selection boundary**

```bash
git add scripts/producer-scaffold.mjs src/remotion/producer-samples/scaffold/SampleName/generate.mjs scripts/smoke/producer/agent-producer-os-smoke.mjs scripts/smoke/producer/producer-voice-profiles-smoke.mjs
git commit -m "feat: require voice profiles in producer scaffolds"
```

### Task 5: Align Producer Authority, Skill Routing, And Architecture Status

**Files:**
- Modify: `.agents/skills/ai-video-studio-agent-producer/SKILL.md`
- Modify: `.agents/skills/ai-video-studio-agent-producer/references/narration.md`
- Modify: `.agents/skills/ai-video-studio-agent-producer/voxcpm-expression/VOXCPM_EXPRESSION.md`
- Modify: `AGENTS.md`
- Modify: `README.md`
- Modify: `scripts/AGENTS.md`
- Modify: `docs/providers/voxcpm.md`
- Modify: `docs/FINAL_PRODUCT_GOAL.md`
- Modify: `docs/ITERATION_STATUS.md`
- Modify: `docs/AGENT_PRODUCER_ONLY_ROADMAP.md`
- Modify: `docs/architecture/agent-producer-only-removal-inventory.json`
- Modify: `scripts/smoke/architecture/skill-alignment-smoke.mjs`
- Modify: `scripts/smoke/architecture/agent-producer-architecture-smoke.mjs`

- [ ] **Step 1: Add failing alignment assertions**

In `skill-alignment-smoke.mjs`, require all active narration authorities to contain:

```js
const voiceRegistryTokens = [
  "voice profile registry",
  "scripts/lib/producer-audio/voice-profiles.json",
  "--voice-profile <voice-profile-id>",
  "science-explainer-young-male",
  "explicit production brief",
  "fail closed",
  "no fallback",
];
```

Require the scaffold command in skill, README, AGENTS, final goal, iteration status, and Roadmap to be:

```bash
npm run producer:scaffold -- --name <CompositionName> --slug <slug> --style-profile <profile-id> --voice-profile <voice-profile-id>
```

In `agent-producer-architecture-smoke.mjs`, assert that `postRoadmapCapabilities` contains a complete `producer-voice-profile-registry-v1` entry whose runtime path is `scripts/lib/producer-audio/voice-profiles.ts`.

Also add an exact future-source guard. Enumerate `src/remotion/**/generate.mjs`, collect files containing `voices/clone/`, and require this sorted compatibility allowlist:

```js
const legacyRawVoiceGeneratorAllowlist = [
  "src/remotion/AiDailyNews20260717/generate.mjs",
  "src/remotion/AiDailyNews20260719/generate.mjs",
  "src/remotion/DnsResolutionExplainer/generate.mjs",
  "src/remotion/SuperintelligenceBeyondHumanCognition/generate.mjs",
  "src/remotion/TcpHandshakeEditorial/generate.mjs",
  "src/remotion/TcpHandshakeTerminal/generate.mjs",
];
```

The guard must compare exact sorted arrays, not merely count matches. The scaffold generator must not appear in the allowlist. Historical `scripts/tools/` files stay outside this future-composition check.

- [ ] **Step 2: Run alignment checks and verify RED**

Run:

```bash
npm run smoke:skill-alignment
npm run smoke:agent-producer-architecture
```

Expected: both fail on missing registry/scaffold/post-Roadmap language.

- [ ] **Step 3: Update the Agent Producer skill and narration guidance**

Change the production-chain scaffold command everywhere to include `--voice-profile <voice-profile-id>`. In `references/narration.md`, add this operational sequence:

```txt
brief classification
  -> Agent selects a registered voiceProfileId
  -> science brief defaults to science-explainer-young-male
  -> explicit brief may select another registered profile
  -> registry resolves the selected clone mode and private paths
  -> composition generate.mjs supplies per-beat control only for controllable-clone
  -> direct VoxCPM request fails closed if the selected files are missing
```

State explicitly:

- inspect `scripts/lib/producer-audio/voice-profiles.json`; do not copy raw clone paths into a future generator;
- `producer:scaffold` has no voice default and must receive the Agent-selected id;
- `voice-design` remains profile-less;
- high-fidelity mode omits control;
- registry lookup never falls back to `lyy` or another profile;
- existing composition generators are not migration examples.

Update the expression guide to show `createVoxcpmProducerRequestPlanForProfile()` examples for normal science controllable mode and science high-fidelity override, while preserving expression-tag rules.

- [ ] **Step 4: Update active repository authority without reopening the Roadmap**

Apply consistent text to AGENTS, README, provider docs, final goal, status, Roadmap, and scripts knowledge:

- registry v1 is a complete bounded post-Roadmap Producer capability;
- profile selection is explicit and VoxCPM-only;
- future Chinese science briefs default by Agent judgment to `science-explainer-young-male`;
- non-science/general work may explicitly select `lyy`;
- existing completed/frozen source and generated artifacts remain unchanged;
- no Phase 10 starts and Phase 9/Roadmap remain complete;
- no environment/config provider selector is introduced.

Replace the Roadmap sentence saying the science policy adds no runtime registry, manifest field, or scaffold parameter. It must now say the follow-up bounded iteration intentionally adds those three future-only surfaces without changing the completed Roadmap definition.

Add this inventory entry under `postRoadmapCapabilities`:

```json
{
  "id": "producer-voice-profile-registry-v1",
  "status": "complete",
  "path": ".agents/skills/ai-video-studio-agent-producer",
  "runtimePath": "scripts/lib/producer-audio/voice-profiles.ts",
  "reason": "A typed VoxCPM-only registry makes future clone identity and mode selection explicit in Producer scaffolds and manifests, preserves the accepted science default, fails closed without fallback, and does not migrate completed compositions or start Phase 10."
}
```

- [ ] **Step 5: Run alignment checks and verify GREEN**

Run:

```bash
npm run smoke:skill-alignment
npm run smoke:agent-producer-architecture
git diff --check
```

Expected: all pass.

- [ ] **Step 6: Commit authority alignment**

```bash
git add .agents/skills/ai-video-studio-agent-producer AGENTS.md README.md scripts/AGENTS.md docs/providers/voxcpm.md docs/FINAL_PRODUCT_GOAL.md docs/ITERATION_STATUS.md docs/AGENT_PRODUCER_ONLY_ROADMAP.md docs/architecture/agent-producer-only-removal-inventory.json scripts/smoke/architecture/skill-alignment-smoke.mjs scripts/smoke/architecture/agent-producer-architecture-smoke.mjs
git commit -m "docs: activate producer voice profile registry"
```

### Task 6: Verify The Complete Future-Only Boundary

**Files:**
- Verify only; fix only files already listed in Tasks 1–5 if a scoped check exposes a defect.

- [ ] **Step 1: Run the focused registry and Producer contract suite**

```bash
npm run smoke:producer-voice-profiles
npm run smoke:producer-audio-direct-voxcpm
npm run smoke:producer-audio-tools
npm run smoke:producer-validation
npm run smoke:producer-os
npm run smoke:producer-sample-manifest
npm run smoke:producer-style-profile-sample-contract
npm run smoke:skill-alignment
npm run smoke:agent-producer-architecture
```

Expected: every command exits 0.

- [ ] **Step 2: Prove the scaffold has no hidden voice fallback**

```bash
tmp_root="$(mktemp -d)"
node scripts/producer-scaffold.mjs --name VoiceRegistryProof --slug voice-registry-proof --style-profile hand-drawn-explainer --voice-profile science-explainer-young-male --output-root "$tmp_root"
rg -n "voiceProfileId|voiceMode|createVoxcpmProducerRequestPlanForProfile|voices/clone/lyy|voices/clone/science-explainer" "$tmp_root/VoiceRegistryProof"
rm -rf "$tmp_root"
```

Expected:

- generated manifest and generator contain `science-explainer-young-male`;
- generated mode is `controllable-clone`;
- generator calls `createVoxcpmProducerRequestPlanForProfile`;
- no generated file contains a raw `voices/clone/...` path.

The temporary root is resolved by `mktemp -d` and removed explicitly. Do not substitute a repository or home-directory path.

- [ ] **Step 3: Verify private and generated artifacts were not touched**

```bash
git diff -- voices/clone public/generated out
git status --short --untracked-files=all -- voices/clone public/generated out
git ls-files -- voices/clone public/generated out
```

Expected: no new tracked private voice, generated narration, cover, still, metadata, or MP4 artifact. Existing ignored local files may remain present and unchanged.

- [ ] **Step 4: Run Docker-first type, build, and composition checks**

```bash
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npx tsc --noEmit --pretty false'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run build'
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npx remotion compositions src/remotion/index.ts'
```

Expected: all exit 0. No still or video render is required because this iteration changes narration selection/configuration, not Remotion render code.

- [ ] **Step 5: Run scoped style checks and record the known repository baseline**

```bash
npx eslint scripts/lib/producer-audio/voice-profiles.ts scripts/producer-scaffold.mjs scripts/smoke/producer/producer-voice-profiles-smoke.mjs scripts/smoke/producer/producer-audio-direct-voxcpm-smoke.mjs scripts/smoke/producer/agent-producer-os-smoke.mjs scripts/smoke/producer/producer-validation-smoke.mjs src/remotion/producer-samples/manifest.ts src/remotion/producer-samples/scaffold/SampleName/manifest.ts
npx prettier --check scripts/lib/producer-audio/voice-profiles.json scripts/lib/producer-audio/voice-profiles.ts scripts/producer-scaffold.mjs scripts/smoke/producer/producer-voice-profiles-smoke.mjs scripts/smoke/producer/producer-audio-direct-voxcpm-smoke.mjs scripts/smoke/producer/agent-producer-os-smoke.mjs scripts/smoke/producer/producer-validation-smoke.mjs src/remotion/producer-samples/manifest.ts src/remotion/producer-samples/scaffold/SampleName/generate.mjs src/remotion/producer-samples/scaffold/SampleName/manifest.ts
docker compose run --rm producer bash -lc '[ -d /workspace/node_modules/remotion ] || npm install; npm run lint'
git diff --check
```

Expected:

- changed-file ESLint and Prettier exit 0;
- `git diff --check` exits 0;
- repository-wide Docker lint may retain the documented baseline from `docs/ITERATION_STATUS.md`; record the fresh count and confirm no changed registry/scaffold file appears in the failure set instead of widening this iteration into lint cleanup.

- [ ] **Step 6: Inspect final repository state**

```bash
git status --short --branch
git log --oneline -6
```

Expected: only intentionally modified tracked files remain; no private/generated artifact is staged or tracked.

## Acceptance Checklist

- [ ] One committed registry owns both clone profiles and all repository-relative reference paths.
- [ ] Registry validation rejects unknown/duplicate ids, invalid versions, unsupported defaults, path escape/absolute paths, and wrong file extensions.
- [ ] `lyy` resolves to its existing high-fidelity triple with no fallback behavior.
- [ ] `science-explainer-young-male` resolves normally to controllable clone with required per-beat control and can explicitly resolve to high-fidelity clone without control.
- [ ] Existing request transport, WAV processing, caption timing, progress recovery, and fingerprint behavior remain unchanged.
- [ ] Missing selected private references fail before any request and never retry with another profile.
- [ ] Future maintained manifests record `voiceProfileId`; existing manifests remain compatible without retrofit.
- [ ] `producer:scaffold` rejects a missing or unknown voice profile and emits the selected id/default mode into both manifest and generator.
- [ ] Future scaffold source contains no raw clone reference path.
- [ ] An exact six-file compatibility allowlist preserves current composition generators while rejecting raw clone paths in every later `src/remotion/**/generate.mjs`.
- [ ] Existing composition generators, narration WAVs, audio metadata, covers, renders, and ignored private voices are not modified or regenerated.
- [ ] Agent Producer remains the only video-production entrypoint and VoxCPM remains the only provider.
- [ ] Active skill/docs describe the registry consistently, Phase 9/Roadmap remain complete, and the inventory records one bounded post-Roadmap capability.
- [ ] Focused smokes, Docker typecheck/build/composition listing, changed-file lint/format, and `git diff --check` pass; any repository-wide lint baseline is reported accurately.

## Execution Notes

- Implement tasks in order; the manifest/scaffold work depends on the registry API from Task 1.
- Use TDD: preserve the failing output for each RED step before implementing the corresponding GREEN step.
- Do not generate real narration during this iteration. The direct-runtime smoke uses temporary local WAV fixtures and a mocked fetch response.
- Do not edit or stage `voices/clone/`, `public/generated/`, or `out/`.
- Do not push unless the user explicitly requests it.
