import { readFileSync } from "node:fs";

/* global console */

const rootSource = readFileSync("src/remotion/Root.tsx", "utf8");
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

const forbiddenAudioSnippets = ["<Audio", "segmentNarrationFromAsset", "/api/tts/assets/smoke"];

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

for (const snippet of forbiddenAudioSnippets) {
  if (showcaseSource.includes(snippet) || rootSource.includes(snippet)) {
    throw new Error(`Recipe showcase preview must not use placeholder audio: ${snippet}`);
  }
}

console.log("RecipeShowcasePreview smoke passed.");
