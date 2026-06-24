import { readFileSync } from "node:fs";

/* global console */

const readRequiredFile = (path, label) => {
  try {
    return readFileSync(path, "utf8");
  } catch (error) {
    throw new Error(`${label} is missing at ${path}`, { cause: error });
  }
};

const assertIncludes = (source, snippet, label) => {
  if (!source.includes(snippet)) {
    throw new Error(`${label} is missing required snippet: ${snippet}`);
  }
};

const idsSource = readRequiredFile("src/templates/ids.ts", "template ids");
const definitionRegistrySource = readRequiredFile(
  "src/templates/registered-definitions.ts",
  "registered template definitions",
);
const bundleRegistrySource = readRequiredFile(
  "src/templates/registered-bundles.ts",
  "registered template bundles",
);
const rootSource = readRequiredFile("src/remotion/Root.tsx", "Remotion root");
const fixtureSource = readRequiredFile("src/lib/staged-smoke-fixtures.ts", "staged smoke fixtures");
const schemaSource = readRequiredFile(
  "src/templates/technical-explainer/schema.ts",
  "technical explainer schema",
);
const definitionSource = readRequiredFile(
  "src/templates/technical-explainer/definition.ts",
  "technical explainer definition",
);
const runtimeSource = readRequiredFile(
  "src/templates/technical-explainer/runtime.tsx",
  "technical explainer runtime",
);
const sceneSource = readRequiredFile(
  "src/templates/technical-explainer/recipe-scenes.tsx",
  "technical explainer recipe scene renderers",
);
const bundleSource = readRequiredFile(
  "src/templates/technical-explainer/index.ts",
  "technical explainer bundle",
);

const requiredRecipeIds = [
  "hero-title-reveal",
  "terminal-build-run",
  "workflow-node-map",
  "metric-countup",
  "timeline-progress",
  "code-diff-highlight",
  "before-after-compare",
  "decision-matrix",
  "architecture-layer-stack",
  "product-ui-zoom",
];

assertIncludes(
  idsSource,
  'TECHNICAL_EXPLAINER_TEMPLATE_ID = "technical-explainer"',
  "template ids",
);
assertIncludes(
  definitionRegistrySource,
  "technicalExplainerTemplate",
  "registered template definitions",
);
assertIncludes(
  bundleRegistrySource,
  "technicalExplainerTemplateBundle",
  "registered template bundles",
);
assertIncludes(bundleSource, "defineTemplateBundle", "technical explainer bundle");
assertIncludes(definitionSource, "technicalExplainerTemplate", "technical explainer definition");
assertIncludes(
  definitionSource,
  "technicalExplainerImplementationJsonSchema",
  "technical explainer definition",
);
assertIncludes(schemaSource, "technicalExplainerSpecSchema", "technical explainer schema");
assertIncludes(runtimeSource, "technicalExplainerRuntimeTemplate", "technical explainer runtime");
assertIncludes(runtimeSource, "SceneTransitionStage", "technical explainer runtime");
assertIncludes(runtimeSource, "getTechnicalExplainerSectionTimings", "technical explainer runtime");
assertIncludes(sceneSource, "TerminalSessionBlock", "technical explainer scene renderers");
assertIncludes(sceneSource, "MetricCardGrid", "technical explainer scene renderers");
assertIncludes(sceneSource, "WorkflowMapBlock", "technical explainer scene renderers");
assertIncludes(sceneSource, "TimelineProgressBlock", "technical explainer scene renderers");
assertIncludes(sceneSource, "CodeDiffHighlightScene", "technical explainer scene renderers");
assertIncludes(sceneSource, "BeforeAfterCompareScene", "technical explainer scene renderers");
assertIncludes(sceneSource, "DecisionMatrixScene", "technical explainer scene renderers");
assertIncludes(sceneSource, "ArchitectureLayerStackScene", "technical explainer scene renderers");
assertIncludes(sceneSource, "ProductUiZoomScene", "technical explainer scene renderers");
assertIncludes(sceneSource, "getRecipeBeatTiming", "technical explainer scene renderers");
assertIncludes(rootSource, 'id="TechnicalExplainerTemplatePreview"', "Remotion root");
assertIncludes(rootSource, "technicalExplainerPreviewProject", "Remotion root");
assertIncludes(
  rootSource,
  "getProjectDuration(technicalExplainerPreviewProject)",
  "Remotion root",
);
assertIncludes(fixtureSource, "technicalExplainerSmokeProject", "staged smoke fixtures");
assertIncludes(fixtureSource, "technicalExplainerPreviewProject", "staged smoke fixtures");
assertIncludes(
  fixtureSource,
  "TECHNICAL_EXPLAINER_PREVIEW_SECTION_DURATION = 150",
  "staged smoke fixtures",
);
assertIncludes(fixtureSource, "technicalExplainerStagedProject", "staged smoke fixtures");
assertIncludes(fixtureSource, "recipeHints", "staged smoke fixtures");
assertIncludes(fixtureSource, 'recipeId: "workflow-node-map"', "staged smoke fixtures");
assertIncludes(fixtureSource, 'recipeId: "terminal-build-run"', "staged smoke fixtures");
assertIncludes(fixtureSource, 'recipeId: "code-diff-highlight"', "staged smoke fixtures");
assertIncludes(fixtureSource, 'recipeId: "before-after-compare"', "staged smoke fixtures");
assertIncludes(fixtureSource, 'recipeId: "decision-matrix"', "staged smoke fixtures");
assertIncludes(fixtureSource, 'recipeId: "architecture-layer-stack"', "staged smoke fixtures");
assertIncludes(fixtureSource, 'recipeId: "product-ui-zoom"', "staged smoke fixtures");
assertIncludes(fixtureSource, "phase5-ui-screenshot.svg", "staged smoke fixtures");
assertIncludes(fixtureSource, "fallbackSummary", "staged smoke fixtures");

if (
  schemaSource.includes('"remote"') ||
  fixtureSource.includes('sourceType: "remote"') ||
  fixtureSource.includes("https://")
) {
  throw new Error("Phase 5 v1 product-ui-zoom must not allow arbitrary remote image URLs.");
}

for (const recipeId of requiredRecipeIds) {
  assertIncludes(schemaSource, recipeId, "technical explainer schema");
  assertIncludes(definitionSource, recipeId, "technical explainer definition");
  assertIncludes(fixtureSource, recipeId, "staged smoke fixtures");
}

const forbiddenRootSnippets = ["<Audio", "segmentNarrationFromAsset({", "/api/tts/assets/smoke"];
for (const snippet of forbiddenRootSnippets) {
  if (rootSource.includes(snippet)) {
    throw new Error(
      `TechnicalExplainerTemplatePreview must not attach placeholder audio: ${snippet}`,
    );
  }
}

console.log("Technical explainer template smoke passed.");
