/* global console, process */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = process.cwd();
const compiledRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const hookModulePath = path.join(
  compiledRoot,
  "src",
  "helpers",
  "project-generation",
  "use-product-ui-assets.js",
);
const bindingModulePath = path.join(
  compiledRoot,
  "src",
  "helpers",
  "project-generation",
  "apply-product-ui-assets.js",
);

const fail = (message) => {
  throw new Error(message);
};

const assertIncludes = (source, expected, label) => {
  if (!source.includes(expected)) {
    fail(`${label}: expected source to include ${expected}`);
  }
};

const assertNotIncludes = (source, rejected, label) => {
  if (source.includes(rejected)) {
    fail(`${label}: source must not include ${rejected}`);
  }
};

const assertEqual = (actual, expected, label) => {
  if (actual !== expected) {
    fail(`${label}: expected ${String(expected)}, got ${String(actual)}`);
  }
};

const createUploadedItem = (assetId) => ({
  descriptor: {
    alt: `Uploaded product screenshot ${assetId}`,
    sourceType: "route",
    src: `/api/assets/product-ui/${assetId}`,
  },
  metadata: {
    assetId,
    contentType: "image/png",
    originalName: `${assetId}.png`,
    sizeInBytes: 68,
  },
});

const createProductUiPlaceholderProject = () => ({
  meta: {
    title: "Product UI upload smoke",
    fps: 30,
    width: 1280,
    height: 720,
  },
  brief: "Show a generated product UI placeholder.",
  segments: [
    {
      id: "segment-product-ui",
      title: "Product UI",
      intent: "Bind an uploaded screenshot after generation.",
      templateId: "technical-explainer",
      implementation: {
        meta: {
          title: "Product UI",
          fps: 30,
          width: 1280,
          height: 720,
        },
        title: "Product UI",
        durationInFrames: 180,
        sections: [
          {
            id: "product-screenshot",
            recipeId: "product-ui-zoom",
            title: "Generated placeholder",
            fallbackSummary: "Fallback copy before upload binding.",
          },
        ],
      },
    },
  ],
});

const assertHookExports = async () => {
  const hookModule = await import(hookModulePath);

  if (typeof hookModule.useProductUiAssets !== "function") {
    fail("useProductUiAssets export is required");
  }
  if (hookModule.MAX_PRODUCT_UI_ASSET_POOL_ITEMS !== 5) {
    fail("MAX_PRODUCT_UI_ASSET_POOL_ITEMS must be 5");
  }
  if (typeof hookModule.appendProductUiAssetToPool !== "function") {
    fail("appendProductUiAssetToPool export is required");
  }
  if (typeof hookModule.removeProductUiAssetFromPool !== "function") {
    fail("removeProductUiAssetFromPool export is required");
  }

  const sixItems = Array.from({ length: 6 }, (_, index) =>
    createUploadedItem(`product-ui-asset-20260625t00000${index}z-deadbe${index}.png`),
  );
  const cappedPool = sixItems.reduce(
    (pool, item) => hookModule.appendProductUiAssetToPool(pool, item),
    [],
  );
  if (cappedPool.length !== 5) {
    fail(`asset pool must keep at most 5 items, got ${cappedPool.length}`);
  }
  if (cappedPool[0].metadata.assetId !== sixItems[1].metadata.assetId) {
    fail("asset pool should keep the 5 most recent uploads");
  }

  const originalPool = cappedPool;
  const removedPool = hookModule.removeProductUiAssetFromPool(
    originalPool,
    originalPool[2].metadata.assetId,
  );
  if (removedPool.length !== 4) {
    fail("removeProductUiAssetFromPool should remove one matching asset");
  }
  if (originalPool.length !== 5) {
    fail("removeProductUiAssetFromPool must not mutate the existing pool");
  }
};

const assertGeneratedProjectAssetApplication = async () => {
  const bindingModule = await import(bindingModulePath);

  if (typeof bindingModule.applyLatestProductUiAssetToProject !== "function") {
    fail("applyLatestProductUiAssetToProject export is required");
  }

  const olderAsset = createUploadedItem("product-ui-asset-20260625t000000z-older01.png");
  const latestAsset = createUploadedItem("product-ui-asset-20260625t000001z-latest1.png");
  const project = createProductUiPlaceholderProject();
  const unchangedProject = bindingModule.applyLatestProductUiAssetToProject(project, []);

  if (unchangedProject !== project) {
    fail("project without uploaded assets should preserve object identity");
  }

  const appliedProject = bindingModule.applyLatestProductUiAssetToProject(project, [
    olderAsset,
    latestAsset,
  ]);
  const boundSection = appliedProject.segments[0].implementation.sections[0];

  assertEqual(
    boundSection.asset?.src,
    latestAsset.descriptor.src,
    "generated project asset binding src",
  );
  assertEqual(
    boundSection.asset?.alt,
    latestAsset.descriptor.alt,
    "generated project asset binding alt",
  );

  const reappliedProject = bindingModule.applyLatestProductUiAssetToProject(appliedProject, [
    olderAsset,
  ]);
  const stillBoundSection = reappliedProject.segments[0].implementation.sections[0];
  assertEqual(
    stillBoundSection.asset?.src,
    latestAsset.descriptor.src,
    "generated project asset binding must not replace an already bound section",
  );
};

const assertGenerationPanelSource = async () => {
  const panelSource = await readFile(
    path.join(workspaceRoot, "src", "components", "project", "GenerationPanel.tsx"),
    "utf8",
  );

  assertIncludes(panelSource, "产品截图素材", "GenerationPanel upload area");
  assertIncludes(panelSource, "productUiAssets", "GenerationPanel product UI asset prop");
  assertIncludes(panelSource, "isUploadingProductUiAsset", "GenerationPanel loading prop");
  assertIncludes(panelSource, "onProductUiAssetUpload", "GenerationPanel upload callback prop");
  assertIncludes(panelSource, "onProductUiAssetRemove", "GenerationPanel remove callback prop");
  assertIncludes(
    panelSource,
    ".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp",
    "GenerationPanel image accept list",
  );
  assertIncludes(panelSource, 'event.currentTarget.value = "";', "GenerationPanel input reset");
  assertIncludes(panelSource, "productUiAssetError", "GenerationPanel error display");
  assertIncludes(panelSource, "metadata.originalName", "GenerationPanel uploaded item list");
};

const assertGenerationWiring = async () => {
  const helperSource = await readFile(
    path.join(workspaceRoot, "src", "helpers", "project-generation", "use-project-generation.ts"),
    "utf8",
  );
  assertIncludes(helperSource, "useProductUiAssets", "use-project-generation hook wiring");
  assertIncludes(helperSource, "productUiAssets", "use-project-generation pool return");
  assertIncludes(helperSource, "uploadProductUiAsset", "use-project-generation upload return");
  assertIncludes(helperSource, "removeProductUiAsset", "use-project-generation remove return");
  assertIncludes(
    helperSource,
    "applyLatestProductUiAssetToProject",
    "use-project-generation applies uploaded assets to generated projects",
  );

  const pageSource = await readFile(path.join(workspaceRoot, "src", "app", "page.tsx"), "utf8");
  assertIncludes(
    pageSource,
    "<ProjectWorkbench initialProject={initialProject} />",
    "page workbench prop",
  );
  assertIncludes(
    pageSource,
    "technical-explainer-preview",
    "page keeps the legitimate technical explainer preview fixture",
  );
  assertNotIncludes(
    pageSource,
    "product-ui-upload-loop",
    "page must not expose the product UI upload-loop QA fixture",
  );
  assertNotIncludes(
    pageSource,
    "/api/qa/project-fixture",
    "page must not load project fixtures from the product runtime",
  );
  assertNotIncludes(pageSource, "loadQaProject", "page must not keep QA fixture loader code");
  assertNotIncludes(
    pageSource,
    "productUiAssets={generation.productUiAssets}",
    "page must not directly wire product UI asset pool props",
  );
  assertNotIncludes(
    pageSource,
    "productUiAssetPool={generation.productUiAssets}",
    "page must not directly wire product UI asset pool props",
  );

  const workbenchSource = await readFile(
    path.join(workspaceRoot, "src", "components", "project", "ProjectWorkbench.tsx"),
    "utf8",
  );
  assertIncludes(
    workbenchSource,
    "useProjectGeneration({ initialProject })",
    "ProjectWorkbench hook wiring",
  );
  assertIncludes(
    workbenchSource,
    "productUiAssets={generation.productUiAssets}",
    "ProjectWorkbench product UI asset pool prop",
  );
  assertIncludes(
    workbenchSource,
    "onProductUiAssetUpload={generation.uploadProductUiAsset}",
    "ProjectWorkbench product UI upload prop",
  );
  assertIncludes(
    workbenchSource,
    "onProductUiAssetRemove={generation.removeProductUiAsset}",
    "ProjectWorkbench product UI remove prop",
  );
  assertIncludes(workbenchSource, "<GenerationPanel", "ProjectWorkbench GenerationPanel ownership");
  assertIncludes(workbenchSource, "<SegmentEditor", "ProjectWorkbench SegmentEditor ownership");
  assertIncludes(
    workbenchSource,
    "isUploadingProductUiAsset={generation.isUploadingProductUiAsset}",
    "ProjectWorkbench product UI upload state prop",
  );
  assertIncludes(
    workbenchSource,
    "productUiAssetError={generation.productUiAssetError}",
    "ProjectWorkbench product UI upload error prop",
  );

  const previewPanelSource = await readFile(
    path.join(workspaceRoot, "src", "components", "project", "PreviewPanel.tsx"),
    "utf8",
  );
  assertIncludes(previewPanelSource, "component={ProjectVideo}", "PreviewPanel generic player");
  assertNotIncludes(previewPanelSource, "qaProject", "PreviewPanel must not read QA query params");
  assertNotIncludes(
    previewPanelSource,
    "initialFrame",
    "PreviewPanel must not carry upload-loop QA initial frame logic",
  );
  assertNotIncludes(
    previewPanelSource,
    "product-ui-upload-loop",
    "PreviewPanel must not special-case upload-loop QA",
  );

  const renderProjectSource = await readFile(
    path.join(workspaceRoot, "src", "lib", "render-project.ts"),
    "utf8",
  );
  assertIncludes(
    renderProjectSource,
    "id: PROJECT_VIDEO_COMPOSITION_ID",
    "renderProjectVideo selects the generic ProjectVideo composition",
  );
  assertIncludes(
    renderProjectSource,
    "Selecting ProjectVideo composition.",
    "renderProjectVideo generic composition progress message",
  );
  assertNotIncludes(
    renderProjectSource,
    "TECHNICAL_EXPLAINER_PREVIEW_COMPOSITION_ID",
    "renderProjectVideo must not define a technical preview composition id",
  );
  assertNotIncludes(
    renderProjectSource,
    "Selecting TechnicalExplainerTemplatePreview composition.",
    "renderProjectVideo must not render through the technical preview composition",
  );
};

const assertGenerationRequestsStayClean = async () => {
  const generationActionsSource = await readFile(
    path.join(workspaceRoot, "src", "helpers", "project-generation", "use-generation-actions.ts"),
    "utf8",
  );
  assertIncludes(
    generationActionsSource,
    "body: JSON.stringify(requestBody)",
    "brief generation request serialization",
  );
  assertIncludes(
    generationActionsSource,
    "transformGeneratedProject",
    "generation actions local project transform hook",
  );
  assertNotIncludes(
    generationActionsSource,
    "productUiAssets",
    "generation request body guardrail",
  );
  assertNotIncludes(
    generationActionsSource,
    "ProductUiAsset",
    "generation request body guardrail",
  );
  assertNotIncludes(
    generationActionsSource,
    "ProductUiAssetDescriptor",
    "generation request descriptor guardrail",
  );
};

await assertHookExports();
await assertGeneratedProjectAssetApplication();
await assertGenerationPanelSource();
await assertGenerationWiring();
await assertGenerationRequestsStayClean();

console.log("product-ui upload client smoke passed");
