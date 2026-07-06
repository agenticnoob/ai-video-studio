import { existsSync, readFileSync } from "node:fs";

/* global console */

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const rootSource = readFileSync("src/remotion/Root.tsx", "utf8");
const rendererSource = readFileSync(
  "src/remotion/OpenAiHardwareNewsBrief/OpenAiHardwareNewsBrief.tsx",
  "utf8",
);
const generatorSource = readFileSync("scripts/generate-openai-hardware-news-brief.mjs", "utf8");

const dataModule = await import("../src/remotion/OpenAiHardwareNewsBrief/data.js");
const audioModule = await import("../src/remotion/OpenAiHardwareNewsBrief/audio.generated.js");
const typesModule = await import("../src/remotion/OpenAiHardwareNewsBrief/types.js");

const {
  OPENAI_HARDWARE_NEWS_BRIEF_COMPOSITION_ID,
  OPENAI_HARDWARE_NEWS_BRIEF_CONTENT_FAMILY,
  OPENAI_HARDWARE_NEWS_BRIEF_DURATION_IN_FRAMES,
  OPENAI_HARDWARE_NEWS_BRIEF_PROFILE_ID,
} = typesModule;
const { openAiHardwareNewsBriefData } = dataModule;
const { openAiHardwareNewsBriefAudio } = audioModule;
const audioBySceneId = new Map(openAiHardwareNewsBriefAudio.map((track) => [track.sceneId, track]));

assert(
  OPENAI_HARDWARE_NEWS_BRIEF_COMPOSITION_ID === "OpenAiHardwareNewsBrief",
  "OpenAI hardware news composition id changed unexpectedly.",
);
assert(
  OPENAI_HARDWARE_NEWS_BRIEF_PROFILE_ID === "landscape-16x9",
  "OpenAI hardware news should be a landscape producer sample.",
);
assert(
  OPENAI_HARDWARE_NEWS_BRIEF_CONTENT_FAMILY === "trend-briefing",
  "OpenAI hardware news should stay in the trend-briefing family.",
);
assert(
  rootSource.includes("OPENAI_HARDWARE_NEWS_BRIEF_COMPOSITION_ID") &&
    rootSource.includes("OpenAiHardwareNewsBriefVideo"),
  "OpenAI hardware news sample must be registered in Root.tsx.",
);
assert(
  rendererSource.includes("StandaloneTimeline") &&
    rendererSource.includes("StandaloneVoiceover") &&
    rendererSource.includes("StandaloneBottomCaption"),
  "OpenAI hardware news should reuse the standalone video runtime.",
);
assert(
  rendererSource.includes("EvidenceScreenshotBackdrop") &&
    rendererSource.includes("EvidenceOverlayPanel"),
  "OpenAI hardware news should reuse the Evidence Lens block.",
);
assert(
  rendererSource.includes("useCurrentFrame()") && rendererSource.includes("interpolate("),
  "OpenAI hardware news renderer should stay frame-driven.",
);
assert(
  !rendererSource.includes("animation:") && !rendererSource.includes("transition:"),
  "OpenAI hardware news renderer must not use CSS animation or transition styles.",
);

assert(openAiHardwareNewsBriefData.scenes.length === 5, "Expected five news beats.");
assert(
  openAiHardwareNewsBriefData.scenes.reduce((total, scene) => total + scene.durationInFrames, 0) ===
    OPENAI_HARDWARE_NEWS_BRIEF_DURATION_IN_FRAMES,
  "OpenAI hardware news duration constant should match the scene timeline.",
);
assert(
  openAiHardwareNewsBriefData.topic.primaryHeadline.includes("Codex Micro"),
  "Primary headline should cover Codex Micro.",
);
assert(
  openAiHardwareNewsBriefData.topic.launchDate === "2026-07-15",
  "Launch date should stay explicit and verifiable.",
);
assert(
  openAiHardwareNewsBriefData.topic.governmentStake.status === "reported-early-talks",
  "Government stake beat must remain framed as reported early talks.",
);
assert(
  openAiHardwareNewsBriefData.assets.evidenceAssets.length >= 3,
  "Expected at least three local evidence/source assets.",
);

for (const asset of openAiHardwareNewsBriefData.assets.evidenceAssets) {
  assert(
    asset.src.startsWith("generated/openai-hardware-news-brief/"),
    `${asset.id} should use the local generated asset prefix.`,
  );
  assert(
    asset.captureStatus === "source-card-fallback",
    `${asset.id} should honestly identify generated source-card fallback evidence.`,
  );
  assert(
    typeof asset.fallbackReason === "string" && asset.fallbackReason.length >= 32,
    `${asset.id} should record why real source capture was not used.`,
  );
}

for (const scene of openAiHardwareNewsBriefData.scenes) {
  assert(scene.audioFile.startsWith("generated/openai-hardware-news-brief/"), `${scene.id} audio prefix`);
  assert(scene.captions?.language === "zh-CN", `${scene.id} captions should be Chinese.`);
  assert(scene.durationInFrames >= 120, `${scene.id} duration is too short.`);
  assert(scene.primitiveMap.length >= 3, `${scene.id} should record visual component inventory.`);
  const audio = audioBySceneId.get(scene.id);
  assert(audio, `${scene.id} should have generated audio metadata.`);
  const normalizedAudioFrames = Math.ceil(
    audio.durationInFrames / typesModule.OPENAI_HARDWARE_NEWS_BRIEF_VOICEOVER_PLAYBACK_RATE,
  );
  assert(
    scene.durationInFrames - normalizedAudioFrames <= 12,
    `${scene.id} should not keep more than 12 frames of post-voiceover silence.`,
  );
}

const forbiddenEnglishSourceCardPhrases = [
  "Technology press connected",
  "Final specs and availability remain unconfirmed",
  "Shortcut hardware context",
  "reported early talks",
  "Sources: The Verge",
  "Source: The Guardian",
  "Source: Work Louder",
];

for (const phrase of forbiddenEnglishSourceCardPhrases) {
  assert(!generatorSource.includes(phrase), `Source card generator still contains English phrase: ${phrase}`);
}

for (const requiredChinesePhrase of [
  "多家科技媒体把 OpenAI Developers 的预告",
  "最终规格、价格和供货信息",
  "报道来源：The Verge / Business Insider",
  "据 The Guardian 报道",
]) {
  assert(
    generatorSource.includes(requiredChinesePhrase),
    `Source card generator should include Chinese copy: ${requiredChinesePhrase}`,
  );
}

const requiredFiles = [
  "src/remotion/OpenAiHardwareNewsBrief/OpenAiHardwareNewsBrief.tsx",
  "src/remotion/OpenAiHardwareNewsBrief/index.ts",
  "src/remotion/OpenAiHardwareNewsBrief/types.ts",
  "src/remotion/OpenAiHardwareNewsBrief/script.ts",
  "src/remotion/OpenAiHardwareNewsBrief/data.ts",
  "src/remotion/OpenAiHardwareNewsBrief/audio.generated.ts",
  "scripts/generate-openai-hardware-news-brief.mjs",
];

for (const requiredFile of requiredFiles) {
  assert(existsSync(requiredFile), `Missing required source file: ${requiredFile}`);
}

console.log("OpenAI hardware news brief smoke passed.");
