/* global console, process */

import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const compiledRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataModule = await import(
  path.join(compiledRoot, "src", "remotion", "UvOpenSourceBrief", "data.js")
);
const typesModule = await import(
  path.join(compiledRoot, "src", "remotion", "UvOpenSourceBrief", "types.js")
);

const { uvOpenSourceBriefData } = dataModule;
const {
  UV_OPEN_SOURCE_BRIEF_COMPOSITION_ID,
  UV_OPEN_SOURCE_BRIEF_FPS,
  UV_OPEN_SOURCE_BRIEF_HEIGHT,
  UV_OPEN_SOURCE_BRIEF_VOICEOVER_PLAYBACK_RATE,
  UV_OPEN_SOURCE_BRIEF_WIDTH,
} = typesModule;

const fail = (message) => {
  throw new Error(message);
};

const rootSource = readFileSync(path.join(process.cwd(), "src", "remotion", "Root.tsx"), "utf8");
const componentSource = readFileSync(
  path.join(process.cwd(), "src", "remotion", "UvOpenSourceBrief", "UvOpenSourceBrief.tsx"),
  "utf8",
);
const evidenceLensSource = readFileSync(
  path.join(process.cwd(), "src", "remotion", "producer-samples", "evidence-lens", "evidence-lens.tsx"),
  "utf8",
);
const generatorSource = readFileSync(
  path.join(process.cwd(), "scripts", "generate-uv-open-source-brief.mjs"),
  "utf8",
);
const scriptSource = readFileSync(
  path.join(process.cwd(), "src", "remotion", "UvOpenSourceBrief", "script.ts"),
  "utf8",
);

if (UV_OPEN_SOURCE_BRIEF_COMPOSITION_ID !== "UvOpenSourceBrief") {
  fail("Unexpected uv open-source brief composition id.");
}
if (UV_OPEN_SOURCE_BRIEF_FPS !== 30) {
  fail("uv open-source brief should render at 30fps.");
}
if (UV_OPEN_SOURCE_BRIEF_WIDTH !== 1920 || UV_OPEN_SOURCE_BRIEF_HEIGHT !== 1080) {
  fail("uv open-source brief should be a 1920x1080 landscape composition.");
}
if (UV_OPEN_SOURCE_BRIEF_VOICEOVER_PLAYBACK_RATE !== 1.08) {
  fail("uv open-source brief should use a subtle voiceover playback rate to fit the target.");
}

const durationInSeconds =
  uvOpenSourceBriefData.scenes.reduce((sum, scene) => sum + scene.durationInFrames, 0) /
  UV_OPEN_SOURCE_BRIEF_FPS;
if (durationInSeconds < 45 || durationInSeconds > 60) {
  fail(`uv open-source brief duration is out of range: ${durationInSeconds}s`);
}
if (uvOpenSourceBriefData.profileId !== "landscape-16x9") {
  fail("uv open-source brief should use the shared landscape standalone canvas profile.");
}
if (uvOpenSourceBriefData.contentFamily !== "project-intro") {
  fail("uv open-source brief should be categorized as a project-intro standalone sample.");
}
if (uvOpenSourceBriefData.topic.repo.fullName !== "astral-sh/uv") {
  fail("uv open-source brief should be about astral-sh/uv.");
}
if (uvOpenSourceBriefData.topic.repo.stars < 86000 || uvOpenSourceBriefData.topic.repo.forks < 3200) {
  fail("uv GitHub adoption facts look stale or missing.");
}
if (uvOpenSourceBriefData.topic.latestRelease.tag !== "0.11.26") {
  fail("uv latest release fact should match the verified 0.11.26 release.");
}
if (uvOpenSourceBriefData.scenes.length < 8) {
  fail("uv open-source brief should keep at least eight narration-led beats.");
}

for (const scene of uvOpenSourceBriefData.scenes) {
  if (!scene.narration || scene.narration.length < 18) {
    fail(`Scene ${scene.id} should keep Chinese narration text.`);
  }
  if (!scene.audioFile.startsWith("generated/uv-open-source-brief/")) {
    fail(`Unexpected audio location for ${scene.id}: ${scene.audioFile}`);
  }
  const audioPath = path.join(process.cwd(), "public", scene.audioFile);
  if (!existsSync(audioPath) || statSync(audioPath).size <= 0) {
    fail(`Missing generated static voiceover file for ${scene.id}: ${audioPath}`);
  }
  if (!scene.captions?.cues?.length) {
    fail(`Scene ${scene.id} should include caption cues.`);
  }
}

for (const asset of uvOpenSourceBriefData.assets.screenshots) {
  if (!asset.src.startsWith("generated/uv-open-source-brief/")) {
    fail(`Unexpected screenshot location: ${asset.src}`);
  }
  const assetPath = path.join(process.cwd(), "public", asset.src);
  if (!existsSync(assetPath) || statSync(assetPath).size <= 0) {
    fail(`Missing screenshot asset: ${assetPath}`);
  }
}

if (!rootSource.includes("UvOpenSourceBriefVideo")) {
  fail("Remotion Root should register UvOpenSourceBriefVideo.");
}
if (!componentSource.includes("StandaloneTimeline")) {
  fail("UvOpenSourceBrief should use the shared standalone timeline runtime.");
}
if (!componentSource.includes("StandaloneVoiceover")) {
  fail("UvOpenSourceBrief should use the shared standalone voiceover runtime.");
}
if (!componentSource.includes("playbackRate={UV_OPEN_SOURCE_BRIEF_VOICEOVER_PLAYBACK_RATE}")) {
  fail("UvOpenSourceBrief should apply the real-TTS playback rate to voiceover audio.");
}
if (!componentSource.includes("screenshotFocusBySceneKind")) {
  fail("UvOpenSourceBrief should model screenshot-led scenes explicitly.");
}
if (!componentSource.includes('targetDescription: "GitHub repo star/fork counters"')) {
  fail("UvOpenSourceBrief repo screenshot focus should name the actual star/fork counter target.");
}
if (!componentSource.includes('targetDescription: "uv docs definition text"')) {
  fail("UvOpenSourceBrief docs screenshot focus should name the actual definition text target.");
}
if (!componentSource.includes('targetDescription: "GitHub release title and date"')) {
  fail("UvOpenSourceBrief release screenshot focus should name the actual release title/date target.");
}
if (!componentSource.includes("../producer-samples/evidence-lens")) {
  fail("UvOpenSourceBrief should consume the shared Evidence Lens block.");
}
if (!componentSource.includes("EvidenceScreenshotBackdrop")) {
  fail("UvOpenSourceBrief should use shared full-frame screenshots as visual evidence backdrops.");
}
if (!componentSource.includes("zoomInFrame")) {
  fail("UvOpenSourceBrief screenshot focus should use a fast zoom-in phase.");
}
if (!componentSource.includes("zoomHoldFrame")) {
  fail("UvOpenSourceBrief screenshot focus should hold briefly on the important region.");
}
if (!componentSource.includes("zoomOutFrame")) {
  fail("UvOpenSourceBrief screenshot focus should return toward the original screenshot size.");
}
if (componentSource.includes("const readableScreenshotFilter")) {
  fail("UvOpenSourceBrief should not keep a sample-local readable screenshot filter.");
}
if (!evidenceLensSource.includes("readableScreenshotFilter")) {
  fail("Evidence Lens should own the readable screenshot backdrop filter.");
}
if (componentSource.includes("rgba(7,19,15,0.94)") || componentSource.includes("rgba(7,19,15,0.66)")) {
  fail("UvOpenSourceBrief should not cover screenshot evidence with a heavy full-frame foreground mask.");
}
if (componentSource.includes("const TransparentOverlayPanel")) {
  fail("UvOpenSourceBrief should not keep a sample-local transparent overlay panel.");
}
if (!componentSource.includes("EvidenceOverlayPanel")) {
  fail("UvOpenSourceBrief should layer shared semi-transparent overlays over evidence screenshots.");
}
if (componentSource.includes("scale: interpolate(frame")) {
  fail("UvOpenSourceBrief should delegate screenshot zoom motion to the shared Evidence Lens block.");
}
if (!evidenceLensSource.includes("scale: interpolate(")) {
  fail("Evidence Lens should use frame-driven zoom for screenshot focus.");
}
if (!evidenceLensSource.includes("translate: `${interpolate(")) {
  fail("Evidence Lens should use frame-driven pan for screenshot focus.");
}
if (!componentSource.includes("StandaloneBottomCaption")) {
  fail("UvOpenSourceBrief should use shared standalone captions.");
}
if (!componentSource.includes("TerminalSessionBlock")) {
  fail("UvOpenSourceBrief should reuse the terminal recipe block.");
}
if (!componentSource.includes("WorkflowMapBlock")) {
  fail("UvOpenSourceBrief should reuse the workflow-map recipe block.");
}
if (!componentSource.includes("MetricCardGrid")) {
  fail("UvOpenSourceBrief should reuse the metric-card recipe block.");
}
if (!componentSource.includes("interpolate(")) {
  fail("UvOpenSourceBrief should use frame-driven Remotion interpolation.");
}
if (componentSource.includes("animation:") || componentSource.includes("transition:")) {
  fail("UvOpenSourceBrief should not use CSS animation or transition styles.");
}
if (!generatorSource.includes('process.env.NEXT_ORIGIN || "http://web:3000"')) {
  fail("UvOpenSourceBrief generator should default to the compose service origin for TTS.");
}
if (!scriptSource.includes("order: 1")) {
  fail("UvOpenSourceBrief TTS storyboard probe should use one-based segment order.");
}

console.log("uv open-source brief smoke passed.");
