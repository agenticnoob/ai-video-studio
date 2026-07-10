import { existsSync, readFileSync } from "node:fs";

/* global console */

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const rootSource = readFileSync("src/remotion/Root.tsx", "utf8");
const rendererSource = readFileSync(
  "src/remotion/AiDailyNewsBrief20260709/AiDailyNewsBrief20260709.tsx",
  "utf8",
);
const generatorSource = readFileSync("scripts/generate-ai-daily-news-brief-2026-07-09.mjs", "utf8");

const dataModule = await import("../src/remotion/AiDailyNewsBrief20260709/data.js");
const audioModule = await import("../src/remotion/AiDailyNewsBrief20260709/audio.generated.js");
const typesModule = await import("../src/remotion/AiDailyNewsBrief20260709/types.js");

const {
  AI_DAILY_NEWS_BRIEF_20260709_COMPOSITION_ID,
  AI_DAILY_NEWS_BRIEF_20260709_CONTENT_FAMILY,
  AI_DAILY_NEWS_BRIEF_20260709_DURATION_IN_FRAMES,
  AI_DAILY_NEWS_BRIEF_20260709_MAX_DURATION_IN_FRAMES,
  AI_DAILY_NEWS_BRIEF_20260709_PROFILE_ID,
} = typesModule;
const { aiDailyNewsBrief20260709Data } = dataModule;
const { aiDailyNewsBrief20260709Audio } = audioModule;
const audioBySceneId = new Map(
  aiDailyNewsBrief20260709Audio.map((track) => [track.sceneId, track]),
);

assert(
  AI_DAILY_NEWS_BRIEF_20260709_COMPOSITION_ID === "AiDailyNewsBrief20260709",
  "AI daily news brief 2026-07-09 composition id changed unexpectedly.",
);
assert(
  AI_DAILY_NEWS_BRIEF_20260709_PROFILE_ID === "landscape-16x9",
  "AI daily news brief 2026-07-09 should be a landscape producer sample.",
);
assert(
  AI_DAILY_NEWS_BRIEF_20260709_CONTENT_FAMILY === "trend-briefing",
  "AI daily news brief 2026-07-09 should stay in the trend-briefing family.",
);
assert(
  AI_DAILY_NEWS_BRIEF_20260709_DURATION_IN_FRAMES <=
    AI_DAILY_NEWS_BRIEF_20260709_MAX_DURATION_IN_FRAMES,
  "AI daily news brief 2026-07-09 must stay under five minutes.",
);
assert(
  rootSource.includes("AI_DAILY_NEWS_BRIEF_20260709_COMPOSITION_ID") &&
    rootSource.includes("AiDailyNewsBrief20260709Video"),
  "AI daily news brief 2026-07-09 sample must be registered in Root.tsx.",
);
assert(
  rendererSource.includes("StandaloneTimeline") &&
    rendererSource.includes("StandaloneVoiceover") &&
    rendererSource.includes("StandaloneBottomCaption"),
  "AI daily news brief 2026-07-09 should reuse the standalone video runtime.",
);
assert(
  rendererSource.includes("EvidenceOverlayPanel"),
  "AI daily news brief 2026-07-09 should reuse the Evidence Lens overlay block.",
);
assert(
  rendererSource.includes("../primitives") &&
    rendererSource.includes("VideoPanel") &&
    rendererSource.includes("Kicker") &&
    rendererSource.includes("CalloutGrid") &&
    rendererSource.includes("BarChart"),
  "AI daily news brief 2026-07-09 should reuse existing Remotion primitives.",
);
assert(
  rendererSource.includes("ContentCard3D") &&
    rendererSource.includes("perspective:") &&
    rendererSource.includes("rotateY(") &&
    rendererSource.includes("rotateX("),
  "AI daily news brief 2026-07-09 should include foreground 3D content-card treatments.",
);
assert(
  rendererSource.includes("useCurrentFrame()") && rendererSource.includes("interpolate("),
  "AI daily news brief 2026-07-09 renderer should stay frame-driven.",
);
assert(
  !rendererSource.includes("animation:") && !rendererSource.includes("transition:"),
  "AI daily news brief 2026-07-09 renderer must not use CSS animation or transition styles.",
);

assert(aiDailyNewsBrief20260709Data.scenes.length === 12, "Expected twelve daily briefing beats.");
assert(
  aiDailyNewsBrief20260709Data.scenes.reduce(
    (total, scene) => total + scene.durationInFrames,
    0,
  ) === AI_DAILY_NEWS_BRIEF_20260709_DURATION_IN_FRAMES,
  "AI daily news brief 2026-07-09 duration constant should match the scene timeline.",
);
assert(
  aiDailyNewsBrief20260709Data.topic.date === "2026-07-09",
  "The brief date should be explicit.",
);
assert(
  aiDailyNewsBrief20260709Data.topic.coverageRange === "2026-07-09",
  "The daily brief must cover only 2026-07-09.",
);
assert(
  aiDailyNewsBrief20260709Data.topic.primaryHeadline.includes("模型发布受控化"),
  "Primary headline should cover controlled model rollout.",
);
assert(
  !aiDailyNewsBrief20260709Data.topic.primaryHeadline.includes("二十三天") &&
    !aiDailyNewsBrief20260709Data.topic.coverageRange.includes("06-17"),
  "Daily brief must not leak the older multi-week recap framing.",
);

const forbiddenOldTopics = [
  "Anthropic",
  "Fable",
  "Mythos",
  "DeepMind",
  "Claude Code",
  "六月十七",
  "23 天",
  "二十三天",
];

for (const scene of aiDailyNewsBrief20260709Data.scenes) {
  assert(
    scene.audioFile.startsWith("generated/ai-daily-news-brief-2026-07-09/"),
    `${scene.id} audio prefix`,
  );
  assert(scene.captions?.language === "zh-CN", `${scene.id} captions should be Chinese.`);
  assert(scene.durationInFrames >= 90, `${scene.id} duration is too short.`);
  assert(scene.primitiveMap.length >= 3, `${scene.id} should record visual component inventory.`);
  assert(audioBySceneId.has(scene.id), `${scene.id} should have generated audio metadata.`);
  for (const forbidden of forbiddenOldTopics) {
    assert(
      !scene.headline.includes(forbidden) &&
        !scene.supportingText.includes(forbidden) &&
        !scene.narration.includes(forbidden),
      `${scene.id} should not mention old-topic phrase: ${forbidden}`,
    );
  }
}

assert(
  aiDailyNewsBrief20260709Audio.every((track) => track.provider === "voxcpm"),
  "AI daily news brief 2026-07-09 should use real VoxCPM narration for every scene.",
);
assert(
  !aiDailyNewsBrief20260709Audio.some((track) => track.provider === "local-silent-fallback"),
  "AI daily news brief 2026-07-09 must not use local silent fallback audio.",
);

const requiredSceneIds = [
  "open",
  "gpt56",
  "meta-iris",
  "humain-cohere",
  "alberta-data-center",
  "grid-equipment",
  "nvidia-regulation",
  "samsung-memory",
  "china-access",
  "capital-repricing",
  "developer-playbook",
  "close",
];

for (const sceneId of requiredSceneIds) {
  assert(audioBySceneId.has(sceneId), `Missing required scene audio metadata: ${sceneId}`);
  assert(
    aiDailyNewsBrief20260709Data.scenes.some((scene) => scene.id === sceneId),
    `Missing required scene data: ${sceneId}`,
  );
}

assert(
  aiDailyNewsBrief20260709Data.assets.evidenceAssets.some((asset) => asset.id === "openai-gpt56") &&
    aiDailyNewsBrief20260709Data.assets.evidenceAssets.some((asset) => asset.id === "meta-iris") &&
    aiDailyNewsBrief20260709Data.assets.evidenceAssets.some(
      (asset) => asset.id === "humain-cohere",
    ) &&
    aiDailyNewsBrief20260709Data.assets.evidenceAssets.some(
      (asset) => asset.id === "grid-equipment",
    ),
  "Daily brief should include the major 2026-07-09 evidence assets.",
);

for (const asset of aiDailyNewsBrief20260709Data.assets.evidenceAssets) {
  assert(
    asset.src.startsWith("generated/ai-daily-news-brief-2026-07-09/"),
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

const gpt56Audio = audioBySceneId.get("gpt56");
assert(gpt56Audio, "gpt56 should have generated audio metadata.");
assert(gpt56Audio.captions.cues.length >= 5, "gpt56 captions should be punctuation-split.");
for (let index = 1; index < gpt56Audio.captions.cues.length; index += 1) {
  const previous = gpt56Audio.captions.cues[index - 1];
  const cue = gpt56Audio.captions.cues[index];
  assert(
    cue.startFrame === previous.startFrame + previous.durationInFrames,
    "gpt56 caption cues should be contiguous.",
  );
}

assert(
  generatorSource.includes("voiceClone") &&
    generatorSource.includes("AI_DAILY_NEWS_BRIEF_20260709_VOICE_REFERENCE_AUDIO") &&
    generatorSource.includes("AI_DAILY_NEWS_BRIEF_20260709_VOICE_REFERENCE_TEXT"),
  "AI daily news brief 2026-07-09 generator should pass voiceClone using the local reference voice.",
);
for (const requiredPhrase of [
  "GPT-5.6",
  "Meta Iris",
  "Humain",
  "50MW",
  "160 周",
  "资本",
  "硬资产",
]) {
  assert(
    generatorSource.includes(requiredPhrase),
    `Generator should include phrase: ${requiredPhrase}`,
  );
}

const requiredFiles = [
  "src/remotion/AiDailyNewsBrief20260709/AiDailyNewsBrief20260709.tsx",
  "src/remotion/AiDailyNewsBrief20260709/index.ts",
  "src/remotion/AiDailyNewsBrief20260709/types.ts",
  "src/remotion/AiDailyNewsBrief20260709/script.ts",
  "src/remotion/AiDailyNewsBrief20260709/data.ts",
  "src/remotion/AiDailyNewsBrief20260709/audio.generated.ts",
  "scripts/generate-ai-daily-news-brief-2026-07-09.mjs",
];

for (const requiredFile of requiredFiles) {
  assert(existsSync(requiredFile), `Missing required source file: ${requiredFile}`);
}

console.log("AI daily news brief 2026-07-09 smoke passed.");
