import { existsSync, readFileSync } from "node:fs";

/* global console */

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const rootSource = readFileSync("src/remotion/Root.tsx", "utf8");
const rendererSource = readFileSync(
  "src/remotion/AiNewsStrategicBrief20260709/AiNewsStrategicBrief20260709.tsx",
  "utf8",
);
const dataModule = await import("../src/remotion/AiNewsStrategicBrief20260709/data.js");
const audioModule = await import("../src/remotion/AiNewsStrategicBrief20260709/audio.generated.js");
const scriptModule = await import("../src/remotion/AiNewsStrategicBrief20260709/script.js");
const typesModule = await import("../src/remotion/AiNewsStrategicBrief20260709/types.js");

const {
  AI_NEWS_STRATEGIC_BRIEF_20260709_COMPOSITION_ID,
  AI_NEWS_STRATEGIC_BRIEF_20260709_CONTENT_FAMILY,
  AI_NEWS_STRATEGIC_BRIEF_20260709_DURATION_IN_FRAMES,
  AI_NEWS_STRATEGIC_BRIEF_20260709_MAX_DURATION_IN_FRAMES,
  AI_NEWS_STRATEGIC_BRIEF_20260709_PROFILE_ID,
} = typesModule;
const { aiNewsStrategicBrief20260709Data } = dataModule;
const serializedData = JSON.stringify(aiNewsStrategicBrief20260709Data);
const serializedScript = JSON.stringify(scriptModule.aiNewsStrategicBrief20260709NarrationBeats);
const { aiNewsStrategicBrief20260709Audio } = audioModule;
const audioBySceneId = new Map(
  aiNewsStrategicBrief20260709Audio.map((track) => [track.sceneId, track]),
);

assert(
  AI_NEWS_STRATEGIC_BRIEF_20260709_COMPOSITION_ID === "AiNewsStrategicBrief20260709",
  "AI strategic news brief composition id changed unexpectedly.",
);
assert(
  AI_NEWS_STRATEGIC_BRIEF_20260709_PROFILE_ID === "landscape-16x9",
  "AI strategic news brief should be a landscape producer sample.",
);
assert(
  AI_NEWS_STRATEGIC_BRIEF_20260709_CONTENT_FAMILY === "trend-briefing",
  "AI strategic news brief should stay in the trend-briefing family.",
);
assert(
  AI_NEWS_STRATEGIC_BRIEF_20260709_DURATION_IN_FRAMES <=
    AI_NEWS_STRATEGIC_BRIEF_20260709_MAX_DURATION_IN_FRAMES,
  "AI strategic news brief must stay under five minutes.",
);
assert(
  rootSource.includes("AI_NEWS_STRATEGIC_BRIEF_20260709_COMPOSITION_ID") &&
    rootSource.includes("AiNewsStrategicBrief20260709Video"),
  "AI strategic news brief sample must be registered in Root.tsx.",
);
assert(
  rendererSource.includes("StandaloneTimeline") &&
    rendererSource.includes("StandaloneVoiceover") &&
    rendererSource.includes("StandaloneBottomCaption"),
  "AI strategic news brief should reuse the standalone video runtime.",
);
assert(
  rendererSource.includes("EvidenceOverlayPanel"),
  "AI strategic news brief should reuse the Evidence Lens overlay block.",
);
assert(
  rendererSource.includes("../primitives") &&
    rendererSource.includes("VideoPanel") &&
    rendererSource.includes("Kicker") &&
    rendererSource.includes("CalloutGrid") &&
    rendererSource.includes("BarChart"),
  "AI strategic news brief should reuse existing Remotion primitives, not only sample-local cards.",
);
assert(
  rendererSource.includes("const ModelGateScene") &&
    rendererSource.includes("const PowerGridScene") &&
    !rendererSource.includes(
      "const PowerGridScene: FC<{ readonly scene: AiNewsStrategicBrief20260709Scene }> = ({ scene }) => (\n  <EvidenceScene scene={scene} />\n);",
    ),
  "Model gate and power-grid scenes should have dedicated no-overlap layouts.",
);
assert(
  rendererSource.includes("ContentCard3D"),
  "AI strategic news brief should include 3D content-card treatments.",
);
assert(
  rendererSource.includes("perspective:") &&
    rendererSource.includes("rotateY(") &&
    rendererSource.includes("rotateX("),
  "3D treatment should be content-card oriented, not a background-only effect.",
);
assert(
  rendererSource.includes("useCurrentFrame()") && rendererSource.includes("interpolate("),
  "AI strategic news brief renderer should stay frame-driven.",
);
assert(
  !rendererSource.includes("animation:") && !rendererSource.includes("transition:"),
  "AI strategic news brief renderer must not use CSS animation or transition styles.",
);

assert(
  aiNewsStrategicBrief20260709Data.scenes.length === 12,
  "Expected twelve strategic briefing beats.",
);
assert(
  aiNewsStrategicBrief20260709Data.scenes.reduce(
    (total, scene) => total + scene.durationInFrames,
    0,
  ) === AI_NEWS_STRATEGIC_BRIEF_20260709_DURATION_IN_FRAMES,
  "AI strategic news brief duration constant should match the scene timeline.",
);
assert(
  aiNewsStrategicBrief20260709Data.topic.date === "2026-07-09",
  "The strategic brief date should remain explicit.",
);
assert(
  aiNewsStrategicBrief20260709Data.topic.coverageRange === "2026-06-17 — 2026-07-09",
  "The multi-week coverage range should remain explicit.",
);
assert(
  aiNewsStrategicBrief20260709Data.topic.primaryHeadline.includes("模型访问"),
  "Primary headline should cover model access control.",
);
assert(
  aiNewsStrategicBrief20260709Data.topic.factPolicy.breakingClaimsStatus ===
    "user-provided-and-reported",
  "Breaking claims should stay framed as user-provided and reported.",
);
assert(
  aiNewsStrategicBrief20260709Data.assets.evidenceAssets.length >= 12,
  "Expected source assets for the main strategic chapters.",
);

for (const asset of aiNewsStrategicBrief20260709Data.assets.evidenceAssets) {
  assert(
    asset.src.startsWith("generated/ai-news-strategic-brief-2026-07-09/"),
    `${asset.id} should use the local generated asset prefix.`,
  );
  assert(
    asset.captureStatus === "captured-screenshot" || asset.captureStatus === "source-card-fallback",
    `${asset.id} should declare capture status.`,
  );
  if (asset.captureStatus === "source-card-fallback") {
    assert(
      typeof asset.fallbackReason === "string" && asset.fallbackReason.length >= 32,
      `${asset.id} should record why real source capture was not used.`,
    );
  }
}
assert(
  aiNewsStrategicBrief20260709Data.assets.evidenceAssets.some(
    (asset) => asset.id === "anthropic-access",
  ) &&
    aiNewsStrategicBrief20260709Data.assets.evidenceAssets.some(
      (asset) => asset.id === "data-center-power",
    ),
  "Strategic brief should include model-access and power-grid evidence assets.",
);

const evidenceAssetById = new Map(
  aiNewsStrategicBrief20260709Data.assets.evidenceAssets.map((asset) => [asset.id, asset]),
);

for (const scene of aiNewsStrategicBrief20260709Data.scenes) {
  assert(
    scene.audioFile.startsWith("generated/ai-news-strategic-brief-2026-07-09/"),
    `${scene.id} audio prefix`,
  );
  assert(scene.captions?.language === "zh-CN", `${scene.id} captions should be Chinese.`);
  assert(scene.durationInFrames >= 90, `${scene.id} duration is too short.`);
  assert(scene.primitiveMap.length >= 3, `${scene.id} should record visual component inventory.`);
  const audio = audioBySceneId.get(scene.id);
  assert(audio, `${scene.id} should have generated audio metadata.`);
  const normalizedAudioFrames = Math.ceil(
    audio.durationInFrames / typesModule.AI_NEWS_STRATEGIC_BRIEF_20260709_VOICEOVER_PLAYBACK_RATE,
  );
  assert(
    scene.durationInFrames - normalizedAudioFrames <= 18,
    `${scene.id} should not keep more than 18 frames of post-voiceover silence.`,
  );
}

assert(
  aiNewsStrategicBrief20260709Audio.every((track) => track.provider === "voxcpm"),
  "AI strategic news brief should use real VoxCPM narration for every scene.",
);
assert(
  !aiNewsStrategicBrief20260709Audio.some((track) => track.provider === "local-silent-fallback"),
  "AI strategic news brief must not use local silent fallback audio.",
);
const gpt56Audio = audioBySceneId.get("gpt56");
assert(gpt56Audio, "gpt56 should have generated audio metadata.");
assert(
  gpt56Audio.captions.cues.length >= 5,
  "gpt56 captions should be punctuation-split into readable cues.",
);
assert(
  !gpt56Audio.captions.cues.some(
    (cue) => cue.text.includes("中端模型做日常 agent") && cue.text.includes("低价模型处理高频"),
  ),
  "gpt56 captions should stay split into readable model-tier cues.",
);
for (let index = 1; index < gpt56Audio.captions.cues.length; index += 1) {
  const previous = gpt56Audio.captions.cues[index - 1];
  const cue = gpt56Audio.captions.cues[index];
  assert(
    cue.startFrame === previous.startFrame + previous.durationInFrames,
    "gpt56 caption cues should be contiguous.",
  );
}

const modelGateScene = aiNewsStrategicBrief20260709Data.scenes.find(
  (scene) => scene.id === "model-gate",
);
assert(modelGateScene, "Missing model-gate scene.");
const modelGateHasCapturedScreenshot = modelGateScene.evidenceAssetIds.some(
  (assetId) => evidenceAssetById.get(assetId)?.captureStatus === "captured-screenshot",
);
if (!modelGateHasCapturedScreenshot) {
  assert(
    !modelGateScene.primitiveMap.includes("EvidenceScreenshotBackdrop"),
    "model-gate must not declare screenshot backdrop usage without a captured screenshot asset.",
  );
  assert(
    !rendererSource.includes("EvidenceCard3D"),
    "model-gate must not render a source-card fallback when no real screenshot exists.",
  );
  for (const forbiddenPhrase of [
    "来源证据卡",
    "fallback 来源卡",
    "来源卡 fallback",
    "替代来源卡",
  ]) {
    assert(
      !rendererSource.includes(forbiddenPhrase) &&
        !serializedData.includes(forbiddenPhrase) &&
        !serializedScript.includes(forbiddenPhrase),
      `strategic brief must not show fallback/source-card wording: ${forbiddenPhrase}`,
    );
  }
}

for (const [sceneId, primitiveName] of [
  ["model-gate", "VideoPanel"],
  ["model-gate", "CalloutGrid"],
  ["power-grid", "BarChart"],
  ["power-grid", "Kicker"],
]) {
  const scene = aiNewsStrategicBrief20260709Data.scenes.find((item) => item.id === sceneId);
  assert(scene, `Missing scene ${sceneId}.`);
  assert(
    scene.primitiveMap.includes(primitiveName),
    `${sceneId} should record primitive usage: ${primitiveName}`,
  );
}

for (const requiredPhrase of ["23 天里", "前沿模型访问权", "AI 数据中心开始影响"]) {
  assert(
    serializedData.includes(requiredPhrase) || serializedScript.includes(requiredPhrase),
    `Frozen data or script should include phrase: ${requiredPhrase}`,
  );
}

const requiredFiles = [
  "src/remotion/AiNewsStrategicBrief20260709/AiNewsStrategicBrief20260709.tsx",
  "src/remotion/AiNewsStrategicBrief20260709/index.ts",
  "src/remotion/AiNewsStrategicBrief20260709/types.ts",
  "src/remotion/AiNewsStrategicBrief20260709/script.ts",
  "src/remotion/AiNewsStrategicBrief20260709/data.ts",
  "src/remotion/AiNewsStrategicBrief20260709/audio.generated.ts",
];

for (const requiredFile of requiredFiles) {
  assert(existsSync(requiredFile), `Missing required source file: ${requiredFile}`);
}

console.log("AI strategic news brief 2026-07-09 smoke passed.");
