import { existsSync, readFileSync } from "node:fs";

/* global console */

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const rootSource = readFileSync("src/remotion/Root.tsx", "utf8");
const rendererSource = readFileSync(
  "src/remotion/AiDailyNewsBrief20260708/AiDailyNewsBrief20260708.tsx",
  "utf8",
);
const dataModule = await import("../../../src/remotion/AiDailyNewsBrief20260708/data.js");
const audioModule = await import("../../../src/remotion/AiDailyNewsBrief20260708/audio.generated.js");
const scriptModule = await import("../../../src/remotion/AiDailyNewsBrief20260708/script.js");
const typesModule = await import("../../../src/remotion/AiDailyNewsBrief20260708/types.js");

const {
  AI_DAILY_NEWS_BRIEF_20260708_COMPOSITION_ID,
  AI_DAILY_NEWS_BRIEF_20260708_CONTENT_FAMILY,
  AI_DAILY_NEWS_BRIEF_20260708_DURATION_IN_FRAMES,
  AI_DAILY_NEWS_BRIEF_20260708_MAX_DURATION_IN_FRAMES,
  AI_DAILY_NEWS_BRIEF_20260708_PROFILE_ID,
} = typesModule;
const { aiDailyNewsBrief20260708Data } = dataModule;
const serializedData = JSON.stringify(aiDailyNewsBrief20260708Data);
const serializedScript = JSON.stringify(scriptModule.aiDailyNewsBrief20260708NarrationBeats);
const { aiDailyNewsBrief20260708Audio } = audioModule;
const audioBySceneId = new Map(
  aiDailyNewsBrief20260708Audio.map((track) => [track.sceneId, track]),
);

assert(
  AI_DAILY_NEWS_BRIEF_20260708_COMPOSITION_ID === "AiDailyNewsBrief20260708",
  "AI daily news brief composition id changed unexpectedly.",
);
assert(
  AI_DAILY_NEWS_BRIEF_20260708_PROFILE_ID === "landscape-16x9",
  "AI daily news brief should be a landscape producer sample.",
);
assert(
  AI_DAILY_NEWS_BRIEF_20260708_CONTENT_FAMILY === "trend-briefing",
  "AI daily news brief should stay in the trend-briefing family.",
);
assert(
  AI_DAILY_NEWS_BRIEF_20260708_DURATION_IN_FRAMES <=
    AI_DAILY_NEWS_BRIEF_20260708_MAX_DURATION_IN_FRAMES,
  "AI daily news brief must stay under five minutes.",
);
assert(
  rootSource.includes("AI_DAILY_NEWS_BRIEF_20260708_COMPOSITION_ID") &&
    rootSource.includes("AiDailyNewsBrief20260708Video"),
  "AI daily news brief sample must be registered in Root.tsx.",
);
assert(
  rendererSource.includes("StandaloneTimeline") &&
    rendererSource.includes("StandaloneVoiceover") &&
    rendererSource.includes("StandaloneBottomCaption"),
  "AI daily news brief should reuse the standalone video runtime.",
);
assert(
  rendererSource.includes("EvidenceOverlayPanel"),
  "AI daily news brief should reuse the Evidence Lens overlay block.",
);
assert(
  rendererSource.includes("../primitives") &&
    rendererSource.includes("VideoPanel") &&
    rendererSource.includes("Kicker") &&
    rendererSource.includes("CalloutGrid") &&
    rendererSource.includes("BarChart"),
  "AI daily news brief should reuse existing Remotion primitives, not only sample-local cards.",
);
assert(
  rendererSource.includes("const ModelGateScene") &&
    rendererSource.includes("const PowerGridScene") &&
    !rendererSource.includes(
      "const PowerGridScene: FC<{ readonly scene: AiDailyNewsBrief20260708Scene }> = ({ scene }) => (\n  <EvidenceScene scene={scene} />\n);",
    ),
  "Model gate and power-grid scenes should have dedicated no-overlap layouts.",
);
assert(
  rendererSource.includes("ContentCard3D"),
  "AI daily news brief should include 3D content-card treatments.",
);
assert(
  rendererSource.includes("perspective:") &&
    rendererSource.includes("rotateY(") &&
    rendererSource.includes("rotateX("),
  "3D treatment should be content-card oriented, not a background-only effect.",
);
assert(
  rendererSource.includes("useCurrentFrame()") && rendererSource.includes("interpolate("),
  "AI daily news brief renderer should stay frame-driven.",
);
assert(
  !rendererSource.includes("animation:") && !rendererSource.includes("transition:"),
  "AI daily news brief renderer must not use CSS animation or transition styles.",
);

assert(aiDailyNewsBrief20260708Data.scenes.length >= 12, "Expected at least twelve news beats.");
assert(
  aiDailyNewsBrief20260708Data.scenes.reduce(
    (total, scene) => total + scene.durationInFrames,
    0,
  ) === AI_DAILY_NEWS_BRIEF_20260708_DURATION_IN_FRAMES,
  "AI daily news brief duration constant should match the scene timeline.",
);
assert(
  aiDailyNewsBrief20260708Data.topic.date === "2026-07-08",
  "The source news date should remain explicit.",
);
assert(
  aiDailyNewsBrief20260708Data.topic.primaryHeadline.includes("模型访问"),
  "Primary headline should cover model access control.",
);
assert(
  aiDailyNewsBrief20260708Data.topic.factPolicy.gpt56Status === "reported-and-previewed",
  "GPT-5.6 framing should remain careful and sourced.",
);
assert(
  aiDailyNewsBrief20260708Data.topic.factPolicy.whiteHouseApprovalStatus ===
    "white-house-denial-reported",
  "Government approval wording should not be overstated.",
);
assert(
  aiDailyNewsBrief20260708Data.assets.evidenceAssets.length >= 9,
  "Expected source assets for the main evidence-backed chapters.",
);

for (const asset of aiDailyNewsBrief20260708Data.assets.evidenceAssets) {
  assert(
    asset.src.startsWith("generated/ai-daily-news-brief-2026-07-08/"),
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

const evidenceAssetById = new Map(
  aiDailyNewsBrief20260708Data.assets.evidenceAssets.map((asset) => [asset.id, asset]),
);

for (const scene of aiDailyNewsBrief20260708Data.scenes) {
  assert(
    scene.audioFile.startsWith("generated/ai-daily-news-brief-2026-07-08/"),
    `${scene.id} audio prefix`,
  );
  assert(scene.captions?.language === "zh-CN", `${scene.id} captions should be Chinese.`);
  assert(scene.durationInFrames >= 90, `${scene.id} duration is too short.`);
  assert(scene.primitiveMap.length >= 3, `${scene.id} should record visual component inventory.`);
  const audio = audioBySceneId.get(scene.id);
  assert(audio, `${scene.id} should have generated audio metadata.`);
  const normalizedAudioFrames = Math.ceil(
    audio.durationInFrames / typesModule.AI_DAILY_NEWS_BRIEF_20260708_VOICEOVER_PLAYBACK_RATE,
  );
  assert(
    scene.durationInFrames - normalizedAudioFrames <= 18,
    `${scene.id} should not keep more than 18 frames of post-voiceover silence.`,
  );
}

assert(
  aiDailyNewsBrief20260708Audio.every((track) => track.provider === "voxcpm"),
  "AI daily news brief should use real VoxCPM narration for every scene.",
);
assert(
  !aiDailyNewsBrief20260708Audio.some((track) => track.provider === "local-silent-fallback"),
  "AI daily news brief must not use local silent fallback audio.",
);
const gpt56Audio = audioBySceneId.get("gpt56");
assert(gpt56Audio, "gpt56 should have generated audio metadata.");
assert(
  gpt56Audio.captions.cues.length >= 5,
  "gpt56 captions should be punctuation-split into readable cues.",
);
assert(
  !gpt56Audio.captions.cues.some(
    (cue) => cue.text.includes("agent；低价低延迟模型") && cue.text.includes("未来企业不会"),
  ),
  "gpt56 captions should not merge the agent phrase with the next sentence.",
);
for (let index = 1; index < gpt56Audio.captions.cues.length; index += 1) {
  const previous = gpt56Audio.captions.cues[index - 1];
  const cue = gpt56Audio.captions.cues[index];
  assert(
    cue.startFrame === previous.startFrame + previous.durationInFrames,
    "gpt56 caption cues should be contiguous.",
  );
}

const modelGateScene = aiDailyNewsBrief20260708Data.scenes.find(
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
  for (const forbiddenPhrase of ["来源证据卡", "fallback 来源卡", "来源卡 fallback"]) {
    assert(
      !rendererSource.includes(forbiddenPhrase),
      `model-gate renderer must not show fallback/source-card wording: ${forbiddenPhrase}`,
    );
  }
}

for (const [sceneId, primitiveName] of [
  ["model-gate", "VideoPanel"],
  ["model-gate", "CalloutGrid"],
  ["power-grid", "BarChart"],
  ["power-grid", "Kicker"],
]) {
  const scene = aiDailyNewsBrief20260708Data.scenes.find((item) => item.id === sceneId);
  assert(scene, `Missing scene ${sceneId}.`);
  assert(
    scene.primitiveMap.includes(primitiveName),
    `${sceneId} should record primitive usage: ${primitiveName}`,
  );
}

for (const requiredPhrase of ["受限预览", "白宫方面也否认", "OpenAI"]) {
  assert(
    serializedData.includes(requiredPhrase) || serializedScript.includes(requiredPhrase),
    `Frozen data or script should include phrase: ${requiredPhrase}`,
  );
}

const requiredFiles = [
  "src/remotion/AiDailyNewsBrief20260708/AiDailyNewsBrief20260708.tsx",
  "src/remotion/AiDailyNewsBrief20260708/index.ts",
  "src/remotion/AiDailyNewsBrief20260708/types.ts",
  "src/remotion/AiDailyNewsBrief20260708/script.ts",
  "src/remotion/AiDailyNewsBrief20260708/data.ts",
  "src/remotion/AiDailyNewsBrief20260708/audio.generated.ts",
];

for (const requiredFile of requiredFiles) {
  assert(existsSync(requiredFile), `Missing required source file: ${requiredFile}`);
}

console.log("AI daily news brief 2026-07-08 smoke passed.");
