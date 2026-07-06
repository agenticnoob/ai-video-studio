# Producer Sample OS V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a bounded Producer Sample OS v1 so dedicated Agent Producer Remotion samples have a shared manifest, predictable scaffold convention, local-only artifact boundary, and focused smoke validation.

**Architecture:** Introduce a small `src/remotion/producer-samples/` metadata layer that describes maintained standalone samples without changing their renderers. Keep concrete videos in `src/remotion/<SampleName>/`, keep generated screenshots/audio/mp4 local-only, and validate compatibility through a Node smoke script instead of route or editor changes.

**Tech Stack:** TypeScript, React/Remotion 4, existing `src/remotion/standalone-video/` runtime contracts, Node smoke scripts, Docker-first validation.

---

## Scope Boundary

In scope:

- Producer sample manifest model for maintained Agent Producer samples.
- Manifest entries for `UvOpenSourceBrief`, `WorldCupBettingAnalysis`, and `PixelRAGChineseStandalonePreview`.
- New-sample scaffold convention for future `src/remotion/<SampleName>/` folders.
- Local-only artifact convention for `public/generated/<slug>/` and `out/`.
- Manifest smoke validation that does not require generated screenshots, audio, or mp4 files to be committed.
- Docs alignment for Phase B Producer Sample OS v1.

Out of scope:

- Do not route this through the web prompt.
- Do not create a universal visual template.
- Do not commit generated screenshots, generated audio, rendered mp4 files, or local research artifacts.
- Do not add productized editor features, persistence/history, media library UI, upload APIs, or `VideoProject` changes.
- Do not refactor the visuals of `UvOpenSourceBrief`, `WorldCupBettingAnalysis`, or `PixelRAGChineseStandalonePreview`.

## File Structure

- Create `src/remotion/producer-samples/manifest.ts`: shared manifest types, supported TTS status values, review-frame metadata, artifact root guard helpers, and source-file descriptors.
- Create `src/remotion/producer-samples/registry.ts`: committed registry entries for maintained producer samples.
- Create `src/remotion/producer-samples/index.ts`: public exports for manifest and registry modules.
- Create `src/remotion/producer-samples/scaffold/README.md`: human-facing convention for creating a new `src/remotion/<SampleName>/` sample.
- Create `src/remotion/producer-samples/scaffold/SampleName/index.ts`: scaffold export example.
- Create `src/remotion/producer-samples/scaffold/SampleName/SampleName.tsx`: scaffold Remotion component example that uses `StandaloneTimeline`, `StandaloneVoiceover`, and `StandaloneBottomCaption`.
- Create `src/remotion/producer-samples/scaffold/SampleName/types.ts`: scaffold constants and typed scene/data/audio contracts.
- Create `src/remotion/producer-samples/scaffold/SampleName/script.ts`: scaffold narration beats.
- Create `src/remotion/producer-samples/scaffold/SampleName/data.ts`: scaffold sample data shape.
- Create `src/remotion/producer-samples/scaffold/SampleName/audio.generated.ts`: committed metadata placeholder shape with no generated audio bytes.
- Create `scripts/producer-sample-manifest-smoke.mjs`: deterministic validation for manifest compatibility, source references, local-only artifact roots, and Root registration.
- Modify `package.json`: add `smoke:producer-sample-manifest`.
- Modify `README.md`: document Producer Sample OS v1 entry points and artifact convention.
- Modify `docs/ITERATION_STATUS.md`: record Phase B implementation status and validation target.
- Modify `docs/VISUAL_RECIPE_ROADMAP.md`: update Phase B status and acceptance details.

## Manifest Shape

The manifest should describe source-of-truth sample metadata, not generated media. Use this structure in `src/remotion/producer-samples/manifest.ts`:

```ts
export type ProducerSampleContentFamily =
  | "project-intro"
  | "data-analysis"
  | "tutorial"
  | "trend-briefing";

export type ProducerSampleCanvasProfile = "landscape-16x9" | "portrait-9x16";

export type ProducerSampleTtsStatus =
  | "not-required"
  | "planned"
  | "generated-local"
  | "needs-regeneration";

export type ProducerSampleSourceFileKind =
  | "renderer"
  | "types"
  | "script"
  | "data"
  | "audio-metadata"
  | "root-registration"
  | "smoke";

export type ProducerSampleReviewFrame = {
  readonly frame: number;
  readonly label: string;
  readonly purpose: string;
};

export type ProducerSamplePromotionCandidate = {
  readonly id: string;
  readonly targetLayer: "primitive" | "block" | "recipe" | "template";
  readonly reason: string;
};

export type ProducerSampleSourceFile = {
  readonly path: string;
  readonly kind: ProducerSampleSourceFileKind;
};

export type ProducerSampleManifest = {
  readonly compositionId: string;
  readonly sampleName: string;
  readonly slug: string;
  readonly contentFamily: ProducerSampleContentFamily;
  readonly canvasProfile: ProducerSampleCanvasProfile;
  readonly localArtifactRoot: `public/generated/${string}/`;
  readonly reviewFrames: readonly ProducerSampleReviewFrame[];
  readonly ttsStatus: ProducerSampleTtsStatus;
  readonly sourceFiles: readonly ProducerSampleSourceFile[];
  readonly promotionCandidates: readonly ProducerSamplePromotionCandidate[];
  readonly notes: readonly string[];
};

export const assertProducerSampleManifest = (manifest: ProducerSampleManifest): void => {
  if (!manifest.localArtifactRoot.startsWith("public/generated/")) {
    throw new Error(`${manifest.compositionId} localArtifactRoot must live under public/generated/.`);
  }

  if (!manifest.localArtifactRoot.endsWith("/")) {
    throw new Error(`${manifest.compositionId} localArtifactRoot must end with a slash.`);
  }

  if (manifest.reviewFrames.length === 0) {
    throw new Error(`${manifest.compositionId} must declare at least one review frame.`);
  }

  for (const reviewFrame of manifest.reviewFrames) {
    if (!Number.isInteger(reviewFrame.frame) || reviewFrame.frame < 0) {
      throw new Error(`${manifest.compositionId} has an invalid review frame: ${reviewFrame.frame}.`);
    }
  }
};
```

Important compatibility rule: this manifest does not replace sample-local `types.ts`, `data.ts`, `script.ts`, `audio.generated.ts`, or `data.generated.ts`. It records what a maintained sample already is so agents can start, review, and hand off consistently.

## Task 1: Manifest Types and Registry

**Files:**

- Create: `src/remotion/producer-samples/manifest.ts`
- Create: `src/remotion/producer-samples/registry.ts`
- Create: `src/remotion/producer-samples/index.ts`
- Create: `scripts/producer-sample-manifest-smoke.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write the failing manifest smoke**

Create `scripts/producer-sample-manifest-smoke.mjs` with checks that import the future registry and validate the three existing sample ids.

```js
import { existsSync, readFileSync } from "node:fs";

/* global console */

const {
  producerSampleManifests,
  getProducerSampleManifestByCompositionId,
  assertProducerSampleManifest,
} = await import("../src/remotion/producer-samples/index.js");

const rootSource = readFileSync("src/remotion/Root.tsx", "utf8");

const expectedCompositionIds = [
  "UvOpenSourceBrief",
  "WorldCupBettingAnalysis",
  "PixelRAGChineseStandalonePreview",
];

const expectedLocalRoots = new Map([
  ["UvOpenSourceBrief", "public/generated/uv-open-source-brief/"],
  ["WorldCupBettingAnalysis", "public/generated/world-cup-betting-analysis/"],
  ["PixelRAGChineseStandalonePreview", "public/generated/pixelrag-chinese-standalone/"],
]);

const expectedProfiles = new Map([
  ["UvOpenSourceBrief", "landscape-16x9"],
  ["WorldCupBettingAnalysis", "portrait-9x16"],
  ["PixelRAGChineseStandalonePreview", "landscape-16x9"],
]);

const expectedFamilies = new Map([
  ["UvOpenSourceBrief", "project-intro"],
  ["WorldCupBettingAnalysis", "data-analysis"],
  ["PixelRAGChineseStandalonePreview", "project-intro"],
]);

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

assert(
  producerSampleManifests.length >= expectedCompositionIds.length,
  "Producer sample registry should include the maintained sample set.",
);

for (const compositionId of expectedCompositionIds) {
  const manifest = getProducerSampleManifestByCompositionId(compositionId);

  assert(manifest, `Missing producer sample manifest for ${compositionId}.`);
  assertProducerSampleManifest(manifest);

  assert(
    manifest.localArtifactRoot === expectedLocalRoots.get(compositionId),
    `${compositionId} local artifact root changed unexpectedly.`,
  );
  assert(
    manifest.canvasProfile === expectedProfiles.get(compositionId),
    `${compositionId} canvas profile changed unexpectedly.`,
  );
  assert(
    manifest.contentFamily === expectedFamilies.get(compositionId),
    `${compositionId} content family changed unexpectedly.`,
  );
  assert(
    rootSource.includes(compositionId),
    `${compositionId} must remain registered in src/remotion/Root.tsx.`,
  );
  assert(
    manifest.reviewFrames.length >= 3,
    `${compositionId} should declare at least three review frames.`,
  );

  for (const sourceFile of manifest.sourceFiles) {
    assert(
      !sourceFile.path.startsWith("public/generated/"),
      `${compositionId} sourceFiles must not include generated artifacts: ${sourceFile.path}`,
    );
    assert(
      !sourceFile.path.startsWith("out/"),
      `${compositionId} sourceFiles must not include rendered artifacts: ${sourceFile.path}`,
    );
    assert(existsSync(sourceFile.path), `${compositionId} source file is missing: ${sourceFile.path}`);
  }
}

const missingManifest = getProducerSampleManifestByCompositionId("MissingComposition");
assert(missingManifest === undefined, "Unknown composition ids should return undefined.");

console.log("Producer sample manifest smoke passed.");
```

- [ ] **Step 2: Wire the smoke command and confirm RED**

Add this script to `package.json`:

```json
"smoke:producer-sample-manifest": "rm -rf /tmp/producer-sample-manifest-smoke-build && npx tsc --allowJs --target es2022 --module commonjs --moduleResolution node --skipLibCheck --esModuleInterop --noEmit false --outDir /tmp/producer-sample-manifest-smoke-build scripts/producer-sample-manifest-smoke.mjs src/remotion/producer-samples/index.ts src/remotion/producer-samples/manifest.ts src/remotion/producer-samples/registry.ts && NODE_PATH=/workspace/node_modules:node_modules node /tmp/producer-sample-manifest-smoke-build/scripts/producer-sample-manifest-smoke.mjs"
```

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:producer-sample-manifest'
```

Expected: fail because `src/remotion/producer-samples/` does not exist yet.

- [ ] **Step 3: Implement `manifest.ts`**

Create `src/remotion/producer-samples/manifest.ts` with the types and `assertProducerSampleManifest()` shown in the Manifest Shape section. Also export:

```ts
export const producerSampleCanvasProfiles = ["landscape-16x9", "portrait-9x16"] as const;
export const producerSampleContentFamilies = [
  "project-intro",
  "data-analysis",
  "tutorial",
  "trend-briefing",
] as const;
```

- [ ] **Step 4: Implement the three compatibility manifests**

Create `src/remotion/producer-samples/registry.ts` with:

```ts
import type { ProducerSampleManifest } from "./manifest";

export const producerSampleManifests = [
  {
    compositionId: "UvOpenSourceBrief",
    sampleName: "UvOpenSourceBrief",
    slug: "uv-open-source-brief",
    contentFamily: "project-intro",
    canvasProfile: "landscape-16x9",
    localArtifactRoot: "public/generated/uv-open-source-brief/",
    ttsStatus: "generated-local",
    reviewFrames: [
      { frame: 45, label: "opening context", purpose: "Check first-read headline and hero composition." },
      { frame: 260, label: "repo evidence", purpose: "Check screenshot readability and overlay placement." },
      { frame: 650, label: "workflow beat", purpose: "Check block composition and caption clearance." },
      { frame: 1390, label: "closing synthesis", purpose: "Check final synthesis and safe margins." },
    ],
    sourceFiles: [
      { path: "src/remotion/UvOpenSourceBrief/UvOpenSourceBrief.tsx", kind: "renderer" },
      { path: "src/remotion/UvOpenSourceBrief/types.ts", kind: "types" },
      { path: "src/remotion/UvOpenSourceBrief/script.ts", kind: "script" },
      { path: "src/remotion/UvOpenSourceBrief/data.ts", kind: "data" },
      { path: "src/remotion/UvOpenSourceBrief/audio.generated.ts", kind: "audio-metadata" },
      { path: "src/remotion/Root.tsx", kind: "root-registration" },
      { path: "scripts/uv-open-source-brief-smoke.mjs", kind: "smoke" },
    ],
    promotionCandidates: [
      {
        id: "evidence-screenshot-backdrop",
        targetLayer: "block",
        reason: "Full-frame screenshot evidence with readable focus motion can be shared after more samples prove it.",
      },
      {
        id: "evidence-overlay-panel",
        targetLayer: "block",
        reason: "Compact translucent proof overlays recur across source-backed explainer samples.",
      },
      {
        id: "screenshot-focus",
        targetLayer: "primitive",
        reason: "Claim-aligned zoom-in, hold, and return metadata is a small reusable motion contract.",
      },
    ],
    notes: [
      "Generated screenshots and narration audio stay local-only under public/generated/uv-open-source-brief/.",
      "This sample remains a dedicated composition and does not use the parked web prompt path.",
    ],
  },
  {
    compositionId: "WorldCupBettingAnalysis",
    sampleName: "WorldCupBettingAnalysis",
    slug: "world-cup-betting-analysis",
    contentFamily: "data-analysis",
    canvasProfile: "portrait-9x16",
    localArtifactRoot: "public/generated/world-cup-betting-analysis/",
    ttsStatus: "generated-local",
    reviewFrames: [
      { frame: 30, label: "title", purpose: "Check portrait title readability and visual hierarchy." },
      { frame: 360, label: "formula", purpose: "Check EV formula explanation and subtitle separation." },
      { frame: 900, label: "match analysis", purpose: "Check odds/probability chart density." },
      { frame: 1840, label: "disclaimer", purpose: "Check risk disclaimer prominence." },
    ],
    sourceFiles: [
      { path: "src/remotion/WorldCupBettingAnalysis/WorldCupBettingAnalysis.tsx", kind: "renderer" },
      { path: "src/remotion/WorldCupBettingAnalysis/types.ts", kind: "types" },
      { path: "src/remotion/WorldCupBettingAnalysis/script.ts", kind: "script" },
      { path: "src/remotion/WorldCupBettingAnalysis/data.ts", kind: "data" },
      { path: "src/remotion/WorldCupBettingAnalysis/audio.generated.ts", kind: "audio-metadata" },
      { path: "src/remotion/Root.tsx", kind: "root-registration" },
      { path: "scripts/world-cup-betting-analysis-smoke.mjs", kind: "smoke" },
    ],
    promotionCandidates: [
      {
        id: "odds-ev-ranking",
        targetLayer: "recipe",
        reason: "The odds, no-vig probability, EV, and risk ranking story already informed a productized stats recipe.",
      },
      {
        id: "risk-disclaimer-frame",
        targetLayer: "block",
        reason: "Explicit risk-note treatment is reusable for data-analysis shorts.",
      },
    ],
    notes: [
      "Generated F5 voiceover files stay local-only under public/generated/world-cup-betting-analysis/.",
      "The sample redraws odds data in code when no source screenshot is available.",
    ],
  },
  {
    compositionId: "PixelRAGChineseStandalonePreview",
    sampleName: "PixelRAGChineseStandalone",
    slug: "pixelrag-chinese-standalone",
    contentFamily: "project-intro",
    canvasProfile: "landscape-16x9",
    localArtifactRoot: "public/generated/pixelrag-chinese-standalone/",
    ttsStatus: "generated-local",
    reviewFrames: [
      { frame: 30, label: "opening", purpose: "Check project intro headline and foreground 3D readability." },
      { frame: 420, label: "screenshot process", purpose: "Check screenshot-backed visual proof and caption clearance." },
      { frame: 820, label: "retrieval flow", purpose: "Check vector/index motion and focal point." },
      { frame: 1280, label: "closing", purpose: "Check final takeaway and safe margins." },
    ],
    sourceFiles: [
      { path: "src/remotion/PixelRAGChineseStandalone/PixelRAGChineseStandalone.tsx", kind: "renderer" },
      { path: "src/remotion/PixelRAGChineseStandalone/types.ts", kind: "types" },
      { path: "src/remotion/PixelRAGChineseStandalone/script.ts", kind: "script" },
      { path: "src/remotion/PixelRAGChineseStandalone/data.generated.ts", kind: "audio-metadata" },
      { path: "src/remotion/PixelRAGChineseStandalone/visuals.tsx", kind: "renderer" },
      { path: "src/remotion/Root.tsx", kind: "root-registration" },
      { path: "scripts/pixelrag-chinese-standalone-smoke.mjs", kind: "smoke" },
    ],
    promotionCandidates: [
      {
        id: "screenshot-evidence-flow",
        targetLayer: "recipe",
        reason: "Screenshot/process language already informed the technical-explainer evidence flow.",
      },
      {
        id: "foreground-3d-evidence-cards",
        targetLayer: "block",
        reason: "The foreground 3D card/page/index treatment may be reusable after another project-intro sample proves it.",
      },
    ],
    notes: [
      "This sample currently stores generated audio metadata inside data.generated.ts; Producer Sample OS v1 accepts that legacy shape.",
      "Generated screenshots and audio stay local-only under public/generated/pixelrag-chinese-standalone/.",
    ],
  },
] as const satisfies readonly ProducerSampleManifest[];

export const getProducerSampleManifestByCompositionId = (
  compositionId: string,
): ProducerSampleManifest | undefined =>
  producerSampleManifests.find((manifest) => manifest.compositionId === compositionId);
```

- [ ] **Step 5: Export the registry**

Create `src/remotion/producer-samples/index.ts`:

```ts
export * from "./manifest";
export * from "./registry";
```

- [ ] **Step 6: Run manifest smoke and confirm GREEN**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:producer-sample-manifest'
```

Expected: pass with `Producer sample manifest smoke passed.`

## Task 2: Scaffold Convention

**Files:**

- Create: `src/remotion/producer-samples/scaffold/README.md`
- Create: `src/remotion/producer-samples/scaffold/SampleName/index.ts`
- Create: `src/remotion/producer-samples/scaffold/SampleName/SampleName.tsx`
- Create: `src/remotion/producer-samples/scaffold/SampleName/types.ts`
- Create: `src/remotion/producer-samples/scaffold/SampleName/script.ts`
- Create: `src/remotion/producer-samples/scaffold/SampleName/data.ts`
- Create: `src/remotion/producer-samples/scaffold/SampleName/audio.generated.ts`
- Modify: `scripts/producer-sample-manifest-smoke.mjs`

- [ ] **Step 1: Extend smoke for scaffold convention**

Add checks to `scripts/producer-sample-manifest-smoke.mjs`:

```js
const scaffoldFiles = [
  "src/remotion/producer-samples/scaffold/README.md",
  "src/remotion/producer-samples/scaffold/SampleName/index.ts",
  "src/remotion/producer-samples/scaffold/SampleName/SampleName.tsx",
  "src/remotion/producer-samples/scaffold/SampleName/types.ts",
  "src/remotion/producer-samples/scaffold/SampleName/script.ts",
  "src/remotion/producer-samples/scaffold/SampleName/data.ts",
  "src/remotion/producer-samples/scaffold/SampleName/audio.generated.ts",
];

for (const scaffoldFile of scaffoldFiles) {
  assert(existsSync(scaffoldFile), `Missing sample scaffold file: ${scaffoldFile}`);
}

const scaffoldReadme = readFileSync("src/remotion/producer-samples/scaffold/README.md", "utf8");
assert(
  scaffoldReadme.includes("src/remotion/<SampleName>/"),
  "Scaffold README must point future samples at src/remotion/<SampleName>/.",
);
assert(
  scaffoldReadme.includes("public/generated/<slug>/"),
  "Scaffold README must document the local-only generated artifact root.",
);
assert(
  scaffoldReadme.includes("Do not commit generated screenshots, audio, or mp4 files"),
  "Scaffold README must warn against committing generated media.",
);
```

- [ ] **Step 2: Run manifest smoke and confirm RED**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:producer-sample-manifest'
```

Expected: fail because scaffold files do not exist yet.

- [ ] **Step 3: Create scaffold README**

Create `src/remotion/producer-samples/scaffold/README.md`:

```md
# Producer Sample Scaffold

Copy `SampleName/` to `src/remotion/<SampleName>/` when starting a maintained Agent Producer sample.

The committed sample folder should contain:

- `index.ts`
- `<SampleName>.tsx`
- `types.ts`
- `script.ts`
- `data.ts`
- `audio.generated.ts` or another committed metadata file when the sample needs generated narration metadata

Generated screenshots, generated narration audio, and rendered videos stay local-only:

- `public/generated/<slug>/`
- `out/`

Do not commit generated screenshots, audio, or mp4 files unless the user explicitly asks.

After the sample is renderable and maintained, add a manifest entry in `src/remotion/producer-samples/registry.ts`, register the composition in `src/remotion/Root.tsx`, and add a focused smoke script.
```

- [ ] **Step 4: Create scaffold `types.ts`**

Create `src/remotion/producer-samples/scaffold/SampleName/types.ts`:

```ts
import type { SegmentCaptions } from "../../../../lib/caption-schema";
import type {
  StandaloneCanvasProfileId,
  StandaloneContentFamily,
  StandaloneTimedScene,
} from "../../../standalone-video/types";

export const SAMPLE_NAME_COMPOSITION_ID = "SampleName";
export const SAMPLE_NAME_FPS = 30;
export const SAMPLE_NAME_WIDTH = 1280;
export const SAMPLE_NAME_HEIGHT = 720;
export const SAMPLE_NAME_PROFILE_ID = "landscape-16x9";
export const SAMPLE_NAME_CONTENT_FAMILY = "project-intro";

export type SampleNameSceneId = "open" | "proof" | "close";

export type SampleNameScene = StandaloneTimedScene & {
  readonly id: SampleNameSceneId;
  readonly headline: string;
  readonly narration: string;
  readonly audioFile: string;
  readonly captions: SegmentCaptions;
};

export type SampleNameData = {
  readonly contentFamily: typeof SAMPLE_NAME_CONTENT_FAMILY & StandaloneContentFamily;
  readonly profileId: typeof SAMPLE_NAME_PROFILE_ID & StandaloneCanvasProfileId;
  readonly scenes: readonly SampleNameScene[];
};

export type SampleNameAudioTrack = {
  readonly sceneId: SampleNameSceneId;
  readonly narration: string;
  readonly audioFile: string;
  readonly durationInFrames: number;
  readonly durationInSeconds?: number;
  readonly provider?: string;
  readonly captions: SegmentCaptions;
};
```

- [ ] **Step 5: Create scaffold narration/data/audio/component files**

Create `script.ts`:

```ts
import type { SampleNameSceneId } from "./types";

export type SampleNameNarrationBeat = {
  readonly sceneId: SampleNameSceneId;
  readonly text: string;
};

export const sampleNameNarrationBeats = [
  { sceneId: "open", text: "Start with the real topic and the viewer promise." },
  { sceneId: "proof", text: "Show one concrete source, data point, or product state." },
  { sceneId: "close", text: "End with the reusable takeaway." },
] as const satisfies readonly SampleNameNarrationBeat[];
```

Create `audio.generated.ts`:

```ts
import type { SampleNameAudioTrack } from "./types";

export const sampleNameAudio = [
  {
    sceneId: "open",
    narration: "Start with the real topic and the viewer promise.",
    audioFile: "generated/sample-name/open.wav",
    durationInFrames: 90,
    durationInSeconds: 3,
    provider: "planned",
    captions: {
      language: "en",
      cues: [{ id: "open-cue-1", text: "Start with the real topic.", startFrame: 0, durationInFrames: 90 }],
    },
  },
  {
    sceneId: "proof",
    narration: "Show one concrete source, data point, or product state.",
    audioFile: "generated/sample-name/proof.wav",
    durationInFrames: 120,
    durationInSeconds: 4,
    provider: "planned",
    captions: {
      language: "en",
      cues: [{ id: "proof-cue-1", text: "Show one concrete source.", startFrame: 0, durationInFrames: 120 }],
    },
  },
  {
    sceneId: "close",
    narration: "End with the reusable takeaway.",
    audioFile: "generated/sample-name/close.wav",
    durationInFrames: 90,
    durationInSeconds: 3,
    provider: "planned",
    captions: {
      language: "en",
      cues: [{ id: "close-cue-1", text: "End with the takeaway.", startFrame: 0, durationInFrames: 90 }],
    },
  },
] as const satisfies readonly SampleNameAudioTrack[];
```

Create `data.ts`:

```ts
import { sampleNameAudio } from "./audio.generated";
import {
  SAMPLE_NAME_CONTENT_FAMILY,
  SAMPLE_NAME_PROFILE_ID,
  type SampleNameData,
  type SampleNameSceneId,
} from "./types";

const audioBySceneId = new Map<SampleNameSceneId, (typeof sampleNameAudio)[number]>(
  sampleNameAudio.map((track) => [track.sceneId, track]),
);

const scene = (sceneId: SampleNameSceneId, headline: string) => {
  const audio = audioBySceneId.get(sceneId);

  if (!audio) {
    throw new Error(`Missing scaffold audio metadata for ${sceneId}.`);
  }

  return {
    id: sceneId,
    headline,
    narration: audio.narration,
    audioFile: audio.audioFile,
    durationInFrames: audio.durationInFrames,
    captions: audio.captions,
  };
};

export const sampleNameData = {
  contentFamily: SAMPLE_NAME_CONTENT_FAMILY,
  profileId: SAMPLE_NAME_PROFILE_ID,
  scenes: [
    scene("open", "Real topic promise"),
    scene("proof", "Evidence beat"),
    scene("close", "Reusable takeaway"),
  ],
} satisfies SampleNameData;
```

Create `SampleName.tsx`:

```tsx
import type { FC } from "react";
import { AbsoluteFill } from "remotion";
import { StandaloneBottomCaption, StandaloneTimeline, StandaloneVoiceover } from "../../../standalone-video";
import type { SampleNameScene } from "./types";

const Scene: FC<{ readonly scene: SampleNameScene }> = ({ scene }) => (
  <AbsoluteFill
    style={{
      alignItems: "center",
      background: "#101418",
      color: "#f8fafc",
      display: "flex",
      fontFamily: 'Inter, "Noto Sans SC", ui-sans-serif, system-ui, sans-serif',
      justifyContent: "center",
      padding: 72,
    }}
  >
    <h1 style={{ fontSize: 76, lineHeight: 1.05, margin: 0, maxWidth: 960 }}>{scene.headline}</h1>
    <StandaloneBottomCaption captions={scene.captions} variant="landscape" />
  </AbsoluteFill>
);

export const SampleNameVideo: FC<{ readonly scenes: readonly SampleNameScene[] }> = ({ scenes }) => (
  <AbsoluteFill style={{ background: "#101418" }}>
    <StandaloneTimeline
      renderAudio={(scene) => <StandaloneVoiceover audioFile={scene.audioFile} />}
      renderScene={(scene) => <Scene scene={scene} />}
      scenes={scenes}
    />
  </AbsoluteFill>
);
```

Create `index.ts`:

```ts
export { sampleNameData } from "./data";
export { SampleNameVideo } from "./SampleName";
export * from "./types";
```

- [ ] **Step 6: Run manifest smoke and TypeScript**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:producer-sample-manifest'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit --pretty false'
```

Expected: both pass.

## Task 3: Existing Sample Compatibility Acceptance

**Files:**

- Modify: `scripts/producer-sample-manifest-smoke.mjs`

- [ ] **Step 1: Add compatibility source checks**

Extend `scripts/producer-sample-manifest-smoke.mjs` to inspect sample source files and assert existing compatibility without requiring generated media:

```js
const uvTypes = readFileSync("src/remotion/UvOpenSourceBrief/types.ts", "utf8");
const uvComponent = readFileSync("src/remotion/UvOpenSourceBrief/UvOpenSourceBrief.tsx", "utf8");
const worldCupTypes = readFileSync("src/remotion/WorldCupBettingAnalysis/types.ts", "utf8");
const worldCupComponent = readFileSync("src/remotion/WorldCupBettingAnalysis/WorldCupBettingAnalysis.tsx", "utf8");
const pixelragTypes = readFileSync("src/remotion/PixelRAGChineseStandalone/types.ts", "utf8");
const pixelragData = readFileSync("src/remotion/PixelRAGChineseStandalone/data.generated.ts", "utf8");

assert(uvTypes.includes('UV_OPEN_SOURCE_BRIEF_PROFILE_ID = "landscape-16x9"'), "Uv profile contract missing.");
assert(uvTypes.includes('UV_OPEN_SOURCE_BRIEF_CONTENT_FAMILY = "project-intro"'), "Uv family contract missing.");
assert(uvComponent.includes("StandaloneTimeline"), "Uv sample should keep using standalone runtime.");

assert(
  worldCupTypes.includes('WORLD_CUP_BETTING_ANALYSIS_PROFILE_ID = "portrait-9x16"'),
  "WorldCup profile contract missing.",
);
assert(
  worldCupTypes.includes('WORLD_CUP_BETTING_ANALYSIS_CONTENT_FAMILY = "data-analysis"'),
  "WorldCup family contract missing.",
);
assert(worldCupComponent.includes("StandaloneTimeline"), "WorldCup sample should keep using standalone runtime.");

assert(
  pixelragTypes.includes('PIXELRAG_CHINESE_STANDALONE_PROFILE_ID = "landscape-16x9"'),
  "PixelRAG profile contract missing.",
);
assert(
  pixelragTypes.includes('PIXELRAG_CHINESE_STANDALONE_CONTENT_FAMILY = "project-intro"'),
  "PixelRAG family contract missing.",
);
assert(
  pixelragData.includes("pixelragChineseStandaloneData"),
  "PixelRAG data.generated.ts compatibility should remain accepted.",
);
```

- [ ] **Step 2: Run manifest smoke**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:producer-sample-manifest'
```

Expected: pass.

- [ ] **Step 3: Run existing sample smokes**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:uv-open-source-brief'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:world-cup-betting-analysis'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:pixelrag-chinese-standalone'
```

Expected: all pass. These commands validate that Producer Sample OS v1 did not regress existing maintained samples.

## Task 4: Documentation Alignment

**Files:**

- Modify: `README.md`
- Modify: `docs/ITERATION_STATUS.md`
- Modify: `docs/VISUAL_RECIPE_ROADMAP.md`

- [ ] **Step 1: Update README**

Add a short "Producer Sample OS" subsection near the Agent Producer documentation:

```md
### Producer Sample OS

Maintained Agent Producer samples are described by `src/remotion/producer-samples/`.
The manifest records composition id, content family, canvas profile, local
artifact root, review frames, TTS status, committed source files, and promotion
candidates.

New maintained samples should still live under `src/remotion/<SampleName>/`.
Use `src/remotion/producer-samples/scaffold/` as the starting convention, then
compose the real video from existing primitives, recipe blocks,
`src/remotion/standalone-video/` helpers, local data, and sample-specific
scenes.

Generated screenshots, generated narration audio, and rendered videos stay
local-only under `public/generated/<slug>/` or `out/` unless the user explicitly
asks to commit them.
```

- [ ] **Step 2: Update iteration status**

Add a latest continuation entry to `docs/ITERATION_STATUS.md`:

```md
## Latest continuation — Producer Sample OS v1 Plan / Implementation

- Phase B Producer Sample OS v1 adds a committed sample manifest model,
  scaffold convention, local-only artifact boundary, and manifest smoke guard.
- The first compatibility target is the maintained standalone sample set:
  `UvOpenSourceBrief`, `WorldCupBettingAnalysis`, and
  `PixelRAGChineseStandalonePreview`.
- The manifest describes committed source and review metadata only; generated
  screenshots, generated audio, and rendered mp4 files remain local-only under
  ignored artifact paths.
- This phase does not route Agent Producer work through the web prompt, does
  not create a universal template, and does not expand the product editor.

Validation target:
- `npm run smoke:producer-sample-manifest`
- `npm run smoke:standalone-video-runtime`
- existing sample smokes for uv, WorldCup, and PixelRAG
- `npx tsc --noEmit --pretty false`
- `npm run lint`
- `git diff --check`
```

Adjust the heading wording to match whether the worker is committing only the plan or implementing the slice.

- [ ] **Step 3: Update visual roadmap Phase B**

Update `docs/VISUAL_RECIPE_ROADMAP.md` Phase B from "next recommended bounded slice" to the accurate implementation state after the code lands. Keep these acceptance bullets:

```md
- `src/remotion/producer-samples/` describes maintained samples without
  changing their renderer contracts.
- `UvOpenSourceBrief`, `WorldCupBettingAnalysis`, and
  `PixelRAGChineseStandalonePreview` can all be described by the same manifest
  model.
- `src/remotion/producer-samples/scaffold/` documents the expected future
  `src/remotion/<SampleName>/` source shape.
- `npm run smoke:producer-sample-manifest` validates the manifest and
  local-only artifact boundary without requiring generated media in Git.
```

- [ ] **Step 4: Run docs/source consistency checks**

Run:

```bash
rg -n "web prompt|universal template|public/generated|producer-samples|Producer Sample OS" README.md docs/ITERATION_STATUS.md docs/VISUAL_RECIPE_ROADMAP.md
git diff --check
```

Expected: docs mention Producer Sample OS and local-only artifacts clearly, while not presenting the web prompt or universal template as the Phase B path.

## Task 5: Final Verification

**Files:**

- No new files beyond previous tasks.

- [ ] **Step 1: Run targeted Producer Sample OS checks**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:producer-sample-manifest'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:standalone-video-runtime'
```

Expected: both pass.

- [ ] **Step 2: Run compatibility sample smokes**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:uv-open-source-brief'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:world-cup-betting-analysis'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run smoke:pixelrag-chinese-standalone'
```

Expected: all pass.

- [ ] **Step 3: Run type/lint/checksum validation**

Run:

```bash
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npx tsc --noEmit --pretty false'
docker compose run --rm web bash -lc '[ -d /workspace/node_modules/next ] || npm install; npm run lint'
git diff --check
```

Expected: TypeScript and lint pass, and `git diff --check` reports no whitespace errors.

- [ ] **Step 4: Confirm generated artifacts are not staged**

Run:

```bash
git status --short
```

Expected: changed files are source/docs/scripts only. There should be no tracked or staged files under `public/generated/` or `out/`.

## Minimal Next Slice

Implement only Task 1 and the smoke-facing part of Task 4 first:

- Add `src/remotion/producer-samples/manifest.ts`.
- Add `src/remotion/producer-samples/registry.ts` for the three existing samples.
- Add `src/remotion/producer-samples/index.ts`.
- Add `scripts/producer-sample-manifest-smoke.mjs`.
- Add `smoke:producer-sample-manifest` to `package.json`.
- Add a short README/roadmap/status note that Phase B has a manifest guard and local-only boundary.

Defer scaffold files to the second slice if the user wants the smallest possible code change. This keeps the first implementation focused on compatibility acceptance for `UvOpenSourceBrief`, `WorldCupBettingAnalysis`, and `PixelRAGChineseStandalonePreview`.

## Self-Review

- Spec coverage: sample manifest, `src/remotion/<SampleName>/` scaffold, local-only artifact convention, manifest/smoke validation, and compatibility acceptance for `UvOpenSourceBrief`, `WorldCupBettingAnalysis`, and `PixelRAGChineseStandalonePreview` are each mapped to tasks.
- Non-goals: the plan does not use the web prompt, does not create a universal visual template, does not commit generated media, and does not add editor/productization work.
- Placeholder scan: no `TBD`, `TODO`, or unbounded "implement later" steps remain.
- Type consistency: manifest field names are consistent across type definitions, registry entries, and smoke checks.
