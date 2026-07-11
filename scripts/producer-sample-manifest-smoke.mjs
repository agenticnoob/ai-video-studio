import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

/* global console */

const {
  producerSampleManifests,
  getProducerSampleManifestByCompositionId,
  assertProducerSampleManifest,
} = await import("../src/remotion/producer-samples/index.js");

const rootSource = readFileSync("src/remotion/Root.tsx", "utf8");

const expectedCompositionIds = [
  "OpenAiHardwareNewsBrief",
  "UvOpenSourceBrief",
  "WorldCupBettingAnalysis",
  "PixelRAGChineseStandalonePreview",
];

const expectedLocalRoots = new Map([
  ["OpenAiHardwareNewsBrief", "public/generated/openai-hardware-news-brief/"],
  ["UvOpenSourceBrief", "public/generated/uv-open-source-brief/"],
  ["WorldCupBettingAnalysis", "public/generated/world-cup-betting-analysis/"],
  ["PixelRAGChineseStandalonePreview", "public/generated/pixelrag-chinese-standalone/"],
]);

const expectedProfiles = new Map([
  ["OpenAiHardwareNewsBrief", "landscape-16x9"],
  ["UvOpenSourceBrief", "landscape-16x9"],
  ["WorldCupBettingAnalysis", "portrait-9x16"],
  ["PixelRAGChineseStandalonePreview", "landscape-16x9"],
]);

const expectedFamilies = new Map([
  ["OpenAiHardwareNewsBrief", "trend-briefing"],
  ["UvOpenSourceBrief", "project-intro"],
  ["WorldCupBettingAnalysis", "data-analysis"],
  ["PixelRAGChineseStandalonePreview", "project-intro"],
]);

const expectedRootMarkers = new Map([
  [
    "OpenAiHardwareNewsBrief",
    ["OPENAI_HARDWARE_NEWS_BRIEF_COMPOSITION_ID", "OpenAiHardwareNewsBriefVideo"],
  ],
  ["UvOpenSourceBrief", ["UV_OPEN_SOURCE_BRIEF_COMPOSITION_ID", "UvOpenSourceBriefVideo"]],
  [
    "WorldCupBettingAnalysis",
    ["WORLD_CUP_BETTING_ANALYSIS_COMPOSITION_ID", "WorldCupBettingAnalysisVideo"],
  ],
  [
    "PixelRAGChineseStandalonePreview",
    ["PIXELRAG_CHINESE_STANDALONE_COMPOSITION_ID", "PixelRAGChineseStandaloneVideo"],
  ],
]);

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const scaffoldSources = [
  "src/remotion/producer-samples/scaffold/SampleName/types.ts",
  "src/remotion/producer-samples/scaffold/SampleName/generate.mjs",
  "src/remotion/producer-samples/scaffold/SampleName/validation.ts",
].map((file) => readFileSync(file, "utf8")).join("\n");

for (const required of [
  "scripts/lib/producer-audio",
  "runProducerAudioGeneration",
  "producerValidationInput",
  "npm run producer:validate",
  "npm run producer:stills",
]) assert(scaffoldSources.includes(required), `Scaffold must reference ${required}.`);
for (const frozenPath of ["AiConceptsForBeginners", "AiDailyNewsBrief20260709", "PixelRAGChineseStandalone"]) {
  assert(!scaffoldSources.includes(frozenPath), `Scaffold must not import frozen sample ${frozenPath}.`);
}

const assertIgnoredPath = (path) => {
  try {
    execFileSync("git", ["check-ignore", "-q", path], { stdio: "ignore" });
  } catch {
    throw new Error(`${path} must stay ignored by Git for local-only producer artifacts.`);
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
  assertIgnoredPath(manifest.localArtifactRoot);
  assert(
    manifest.canvasProfile === expectedProfiles.get(compositionId),
    `${compositionId} canvas profile changed unexpectedly.`,
  );
  assert(
    manifest.contentFamily === expectedFamilies.get(compositionId),
    `${compositionId} content family changed unexpectedly.`,
  );
  const rootMarkers = expectedRootMarkers.get(compositionId) ?? [compositionId];
  for (const marker of rootMarkers) {
    assert(
      rootSource.includes(marker),
      `${compositionId} must remain registered in src/remotion/Root.tsx through ${marker}.`,
    );
  }
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
assert(
  scaffoldReadme.includes("After copying, update scaffold-relative imports"),
  "Scaffold README must document the import rewrite required after copying.",
);
assertIgnoredPath("out/");

const uvTypes = readFileSync("src/remotion/UvOpenSourceBrief/types.ts", "utf8");
const uvComponent = readFileSync(
  "src/remotion/UvOpenSourceBrief/UvOpenSourceBrief.tsx",
  "utf8",
);
const worldCupTypes = readFileSync("src/remotion/WorldCupBettingAnalysis/types.ts", "utf8");
const worldCupComponent = readFileSync(
  "src/remotion/WorldCupBettingAnalysis/WorldCupBettingAnalysis.tsx",
  "utf8",
);
const pixelragTypes = readFileSync("src/remotion/PixelRAGChineseStandalone/types.ts", "utf8");
const pixelragData = readFileSync(
  "src/remotion/PixelRAGChineseStandalone/data.generated.ts",
  "utf8",
);

assert(
  uvTypes.includes('UV_OPEN_SOURCE_BRIEF_PROFILE_ID = "landscape-16x9"'),
  "Uv profile contract missing.",
);
assert(
  uvTypes.includes('UV_OPEN_SOURCE_BRIEF_CONTENT_FAMILY = "project-intro"'),
  "Uv family contract missing.",
);
assert(uvComponent.includes("StandaloneTimeline"), "Uv sample should keep using standalone runtime.");

assert(
  worldCupTypes.includes('WORLD_CUP_BETTING_ANALYSIS_PROFILE_ID = "portrait-9x16"'),
  "WorldCup profile contract missing.",
);
assert(
  worldCupTypes.includes('WORLD_CUP_BETTING_ANALYSIS_CONTENT_FAMILY = "data-analysis"'),
  "WorldCup family contract missing.",
);
assert(
  worldCupComponent.includes("StandaloneTimeline"),
  "WorldCup sample should keep using standalone runtime.",
);

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

console.log("Producer sample manifest smoke passed.");
