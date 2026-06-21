import { readFileSync } from "node:fs";

/* global console */

const rootSource = readFileSync("src/remotion/Root.tsx", "utf8");
const motionSource = (() => {
  try {
    return readFileSync("src/remotion/recipes/motion/scene-transition-stage.tsx", "utf8");
  } catch (error) {
    throw new Error(
      "Reusable recipe scene transition primitive is missing at src/remotion/recipes/motion/scene-transition-stage.tsx",
      { cause: error },
    );
  }
})();
const blockExportsSource = (() => {
  try {
    return readFileSync("src/remotion/recipes/blocks/index.ts", "utf8");
  } catch (error) {
    throw new Error(
      "Reusable recipe visual blocks are missing at src/remotion/recipes/blocks/index.ts",
      {
        cause: error,
      },
    );
  }
})();
const showcaseSource = (() => {
  try {
    return readFileSync("src/remotion/RecipeShowcase/RecipeShowcasePreview.tsx", "utf8");
  } catch (error) {
    throw new Error(
      "RecipeShowcasePreview source is missing at src/remotion/RecipeShowcase/RecipeShowcasePreview.tsx",
      { cause: error },
    );
  }
})();

const requiredRootSnippets = [
  'id="RecipeShowcasePreview"',
  "component={RecipeShowcasePreview}",
  "durationInFrames={1980}",
  "width={1280}",
  "height={720}",
];

const requiredRecipeIds = [
  "hero-title-reveal",
  "workflow-node-map",
  "terminal-build-run",
  "metric-countup",
  "timeline-progress",
  "code-diff-highlight",
];

const requiredTransitionIds = ["panel-push", "stage-push", "fly-through", "cube-turn"];

const requiredMotionSnippets = [
  "SceneTransitionStage",
  "translate3d(",
  "rotateY(",
  "motionStyle",
  "SCENE_CONTENT_PREROLL_IN_FRAMES",
];

const requiredShowcaseImports = [
  "SceneTransitionStage",
  "getSceneContentPrerollFrom",
  'from "../recipes/motion"',
  'from "../recipes/blocks"',
];

const requiredBlockExports = [
  "TerminalSessionBlock",
  "MetricCardGrid",
  "MetricCard",
  "WorkflowMapBlock",
  "TimelineProgressBlock",
];

const forbiddenAudioSnippets = ["<Audio", "segmentNarrationFromAsset", "/api/tts/assets/smoke"];
const forbiddenOverlaySnippets = [
  "light-sweep-bridge",
  "scanline-wipe",
  "LightSweepBridge",
  "ScanlineWipe",
];

const assertIncludes = (source, snippet, label) => {
  if (!source.includes(snippet)) {
    throw new Error(`${label} is missing required snippet: ${snippet}`);
  }
};

for (const snippet of requiredRootSnippets) {
  assertIncludes(rootSource, snippet, "Remotion root");
}

for (const recipeId of requiredRecipeIds) {
  assertIncludes(showcaseSource, recipeId, "Recipe showcase");
}

for (const transitionId of requiredTransitionIds) {
  assertIncludes(showcaseSource, transitionId, "Recipe showcase transition");
}

for (const motionSnippet of requiredMotionSnippets) {
  assertIncludes(motionSource, motionSnippet, "Reusable recipe scene transition primitive");
}

for (const showcaseImport of requiredShowcaseImports) {
  assertIncludes(showcaseSource, showcaseImport, "Recipe showcase reusable motion import");
}

for (const blockExport of requiredBlockExports) {
  assertIncludes(blockExportsSource, blockExport, "Reusable recipe visual block exports");
}

for (const snippet of forbiddenAudioSnippets) {
  if (showcaseSource.includes(snippet) || rootSource.includes(snippet)) {
    throw new Error(`Recipe showcase preview must not use placeholder audio: ${snippet}`);
  }
}

for (const snippet of forbiddenOverlaySnippets) {
  if (showcaseSource.includes(snippet)) {
    throw new Error(`Recipe showcase preview should not keep low-value overlay effect: ${snippet}`);
  }
}

console.log("RecipeShowcasePreview smoke passed.");
