/* global console, process */

import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const compiledRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataModule = await import(
  path.join(compiledRoot, "src", "remotion", "PixelRAGChineseStandalone", "data.generated.js")
);
const typesModule = await import(
  path.join(compiledRoot, "src", "remotion", "PixelRAGChineseStandalone", "types.js")
);

const { pixelragChineseStandaloneData } = dataModule;
const {
  PIXELRAG_CHINESE_STANDALONE_COMPOSITION_ID,
  PIXELRAG_CHINESE_STANDALONE_FPS,
  PIXELRAG_CHINESE_STANDALONE_HEIGHT,
  PIXELRAG_CHINESE_STANDALONE_WIDTH,
} = typesModule;

const fail = (message) => {
  throw new Error(message);
};

const rootSource = readFileSync(path.join(process.cwd(), "src", "remotion", "Root.tsx"), "utf8");
const componentSource = readFileSync(
  path.join(
    process.cwd(),
    "src",
    "remotion",
    "PixelRAGChineseStandalone",
    "PixelRAGChineseStandalone.tsx",
  ),
  "utf8",
);
const visualsSource = readFileSync(
  path.join(process.cwd(), "src", "remotion", "PixelRAGChineseStandalone", "visuals.tsx"),
  "utf8",
);

if (pixelragChineseStandaloneData.compositionId !== PIXELRAG_CHINESE_STANDALONE_COMPOSITION_ID) {
  fail("Chinese standalone composition id mismatch.");
}
if (pixelragChineseStandaloneData.profileId !== "landscape-16x9") {
  fail("PixelRAG should use the shared landscape standalone canvas profile.");
}
if (pixelragChineseStandaloneData.contentFamily !== "project-intro") {
  fail("PixelRAG should be categorized as a standalone project-intro sample.");
}
if (PIXELRAG_CHINESE_STANDALONE_COMPOSITION_ID !== "PixelRAGChineseStandalonePreview") {
  fail("Unexpected Chinese standalone composition id.");
}
if (pixelragChineseStandaloneData.fps !== PIXELRAG_CHINESE_STANDALONE_FPS) {
  fail("Chinese standalone FPS mismatch.");
}
if (
  pixelragChineseStandaloneData.width !== PIXELRAG_CHINESE_STANDALONE_WIDTH ||
  pixelragChineseStandaloneData.height !== PIXELRAG_CHINESE_STANDALONE_HEIGHT
) {
  fail("Chinese standalone dimensions mismatch.");
}
if (pixelragChineseStandaloneData.scenes.length < 10) {
  fail("Chinese standalone v3 video should split narration into at least ten short scenes.");
}

const durationInFrames = pixelragChineseStandaloneData.scenes.reduce(
  (sum, scene) => sum + scene.durationInFrames,
  0,
);
if (durationInFrames <= 0) {
  fail("Chinese standalone duration must come from generated F5 narration.");
}

for (const scene of pixelragChineseStandaloneData.scenes) {
  if (!/[\u4e00-\u9fff]/.test(scene.narration)) {
    fail(`Scene ${scene.id} narration should be Chinese.`);
  }
  if (scene.audioFile.startsWith("/api/tts/assets/") || scene.audioFile.startsWith("http")) {
    fail(`Scene ${scene.id} must use a Remotion static audio asset, not a route URL.`);
  }
  if (!scene.audioFile.startsWith("generated/pixelrag-chinese-standalone/")) {
    fail(`Unexpected static audio location for ${scene.id}: ${scene.audioFile}`);
  }
  if (!scene.screenshotFile?.startsWith("generated/pixelrag-chinese-standalone/")) {
    fail(`Scene ${scene.id} must use a generated GitHub screenshot asset.`);
  }
  const audioPath = path.join(process.cwd(), "public", scene.audioFile);
  if (!existsSync(audioPath) || statSync(audioPath).size <= 0) {
    fail(`Missing generated static audio file for ${scene.id}: ${audioPath}`);
  }
  const screenshotPath = path.join(process.cwd(), "public", scene.screenshotFile);
  if (!existsSync(screenshotPath) || statSync(screenshotPath).size <= 0) {
    fail(`Missing GitHub screenshot file for ${scene.id}: ${screenshotPath}`);
  }
  if (!scene.captions?.cues?.length) {
    fail(`Scene ${scene.id} should keep generated captions.`);
  }
  if (scene.durationInFrames > 150) {
    fail(`Scene ${scene.id} is too long for the v3 quick-scan rhythm.`);
  }
}

const animationStyles = new Set(
  pixelragChineseStandaloneData.scenes.map((scene) => scene.animationStyle),
);
if (animationStyles.size < 6) {
  fail("Chinese standalone v3 should use varied foreground entrance animations.");
}

const sceneKinds = new Set(pixelragChineseStandaloneData.scenes.map((scene) => scene.visualKind));
if (
  !sceneKinds.has("screenshot-card") ||
  !sceneKinds.has("sliced-page") ||
  !sceneKinds.has("result-pull")
) {
  fail(
    "Chinese standalone v3 should use screenshot cards, sliced page layers, and result-pull visuals.",
  );
}

if (!rootSource.includes("PixelRAGChineseStandaloneVideo")) {
  fail("Remotion Root should register the standalone Chinese PixelRAG video.");
}
if (rootSource.includes("PixelRAGOpenSourceIntroPreview")) {
  fail("Old template-based PixelRAG composition should not remain registered.");
}
if (componentSource.includes("ProjectVideo") || componentSource.includes("technical-explainer")) {
  fail("Chinese standalone video must not depend on existing video templates.");
}
if (!componentSource.includes("StandaloneTimeline")) {
  fail("Chinese standalone video should use the shared standalone timeline runtime.");
}
if (!componentSource.includes("StandaloneVoiceover")) {
  fail("Chinese standalone video should use the shared standalone voiceover runtime.");
}
if (!componentSource.includes("StandaloneBottomCaption")) {
  fail("Chinese standalone video should use the shared standalone caption runtime.");
}
if (!componentSource.includes("overlapFrames={8}")) {
  fail("Chinese standalone v3 should keep the 8-frame scene overlap through the shared runtime.");
}
if (!componentSource.includes("opacity: exit")) {
  fail("Chinese standalone v3 should include per-scene exit motion.");
}
if (!visualsSource.includes("CardStage3D")) {
  fail("Chinese standalone v3 should animate foreground content in a 3D card stage.");
}
if (!visualsSource.includes('transformStyle: "preserve-3d"')) {
  fail("Chinese standalone v3 should use preserve-3d foreground transforms.");
}
if (!visualsSource.includes("getEntrance3D")) {
  fail("Chinese standalone v3 should use varied 3D entrance presets.");
}
if (!visualsSource.includes("usePrimitive")) {
  fail("Chinese standalone v3 should reuse local primitive-inspired elements.");
}
if (!visualsSource.includes("ThreeCanvas")) {
  fail("Chinese standalone v2 should include Remotion ThreeCanvas 3D visuals.");
}
if (!visualsSource.includes("staticFile(scene.screenshotFile)")) {
  fail("Chinese standalone v2 should render real GitHub screenshots through staticFile().");
}

console.log("PixelRAG Chinese standalone smoke passed.");
