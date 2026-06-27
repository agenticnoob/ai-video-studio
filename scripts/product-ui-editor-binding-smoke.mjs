/* global console, process */

import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";

const workspaceRoot = process.cwd();
const compiledRoot = path.join("/tmp", `product-ui-editor-binding-smoke-build-${process.pid}`);
const bindingModulePath = path.join(
  compiledRoot,
  "templates",
  "technical-explainer",
  "product-ui-assets.js",
);

const readSource = async (relativePath) => {
  return readFile(path.join(workspaceRoot, relativePath), "utf8");
};

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

const assertAnyIncludes = (source, expectedList, label) => {
  if (expectedList.some((expected) => source.includes(expected))) {
    return;
  }

  fail(`${label}: expected source to include one of ${expectedList.join(", ")}`);
};

const compileExecutableHelpers = () => {
  const result = spawnSync(
    "npx",
    [
      "tsc",
      "--allowJs",
      "--target",
      "es2022",
      "--module",
      "commonjs",
      "--moduleResolution",
      "node",
      "--skipLibCheck",
      "--esModuleInterop",
      "--noEmit",
      "false",
      "--outDir",
      compiledRoot,
      "src/templates/technical-explainer/product-ui-assets.ts",
      "src/templates/technical-explainer/schema.ts",
    ],
    {
      cwd: workspaceRoot,
      encoding: "utf8",
      stdio: "pipe",
    },
  );

  if (result.status !== 0) {
    fail(
      [
        "failed to compile product-ui asset binding helper",
        result.stdout.trim(),
        result.stderr.trim(),
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }
};

const createSegment = () => ({
  id: "segment-product-ui-editor",
  title: "Product UI editor",
  intent: "Exercise product UI binding helpers.",
  templateId: "technical-explainer",
  implementation: {
    meta: {
      title: "Product UI editor",
      fps: 30,
      width: 1280,
      height: 720,
    },
    title: "Product UI editor",
    durationInFrames: 180,
    sections: [
      {
        id: "hero-product",
        recipeId: "product-ui-zoom",
        title: "Hero product surface",
        fallbackSummary: "Fallback before binding.",
      },
      {
        id: "non-product",
        recipeId: "stat-callout",
        title: "Non product section",
        value: "42%",
        label: "Conversion",
      },
    ],
  },
});

const createDescriptor = (assetId, extra = {}) => ({
  alt: `Product UI screenshot ${assetId}`,
  frameLabel: "Dashboard loaded",
  metadata: {
    assetId,
    originalName: `${assetId}.png`,
  },
  sourceType: "route",
  src: `/api/assets/product-ui/${assetId}.png`,
  ...extra,
});

const assertProductUiAssetBindingHelpers = async () => {
  compileExecutableHelpers();
  const bindingModule = await import(bindingModulePath);

  const requiredExports = [
    "bindProductUiZoomAsset",
    "findProductUiZoomSections",
    "getUnboundProductUiZoomSections",
    "unbindProductUiZoomAsset",
  ];

  for (const exportName of requiredExports) {
    if (typeof bindingModule[exportName] !== "function") {
      fail(`${exportName} export is required`);
    }
  }

  const firstDescriptor = createDescriptor("product-ui-asset-first");
  const replacementDescriptor = createDescriptor("product-ui-asset-replacement");
  const originalSegment = createSegment();
  const boundSegment = bindingModule.bindProductUiZoomAsset(originalSegment, {
    descriptor: firstDescriptor,
    sectionId: "hero-product",
  });
  const boundSection = boundSegment.implementation.sections[0];

  if (boundSection.asset?.src !== firstDescriptor.src) {
    fail("bindProductUiZoomAsset should bind the route descriptor src");
  }
  if (boundSection.asset?.alt !== firstDescriptor.alt) {
    fail("bindProductUiZoomAsset should bind the route descriptor alt");
  }
  if ("metadata" in boundSection.asset) {
    fail("bindProductUiZoomAsset must strip upload metadata from section.asset");
  }
  if (originalSegment.implementation.sections[0].asset !== undefined) {
    fail("bindProductUiZoomAsset must not mutate the original segment");
  }

  const replacedSegment = bindingModule.bindProductUiZoomAsset(boundSegment, {
    descriptor: replacementDescriptor,
    sectionId: "hero-product",
  });
  if (replacedSegment.implementation.sections[0].asset?.src !== replacementDescriptor.src) {
    fail("bindProductUiZoomAsset should replace an existing product-ui binding");
  }

  const unboundSegment = bindingModule.unbindProductUiZoomAsset(replacedSegment, "hero-product");
  if (unboundSegment.implementation.sections[0].asset !== undefined) {
    fail("unbindProductUiZoomAsset should remove the product-ui asset binding");
  }

  const unboundSections = bindingModule.getUnboundProductUiZoomSections(unboundSegment);
  if (unboundSections.length !== 1 || unboundSections[0].id !== "hero-product") {
    fail("getUnboundProductUiZoomSections should return only unbound product-ui sections");
  }

  const remoteDescriptor = createDescriptor("remote-product-ui", {
    sourceType: "remote",
    src: "https://example.test/product.png",
  });
  try {
    bindingModule.bindProductUiZoomAsset(originalSegment, {
      descriptor: remoteDescriptor,
      sectionId: "hero-product",
    });
    fail("bindProductUiZoomAsset should reject remote descriptors");
  } catch (caughtError) {
    if (!(caughtError instanceof Error) || caughtError.name !== "ProductUiZoomAssetBindingError") {
      throw caughtError;
    }
  }

  try {
    bindingModule.bindProductUiZoomAsset(originalSegment, {
      descriptor: firstDescriptor,
      sectionId: "non-product",
    });
    fail("bindProductUiZoomAsset should reject non product-ui sections");
  } catch (caughtError) {
    if (!(caughtError instanceof Error) || caughtError.name !== "ProductUiZoomAssetBindingError") {
      throw caughtError;
    }
  }
};

const assertTechnicalExplainerEditor = async () => {
  const source = await readSource("src/templates/technical-explainer/editor.tsx");
  const productUiZoomAssetEditorSource = await readSource(
    "src/templates/technical-explainer/product-ui-zoom-asset-editor.tsx",
  );

  assertIncludes(
    source,
    "<ProductUiZoomAssetEditor",
    "TechnicalExplainerEditor delegates product-ui-zoom binding UI",
  );
  assertIncludes(
    productUiZoomAssetEditorSource,
    "product-ui-zoom",
    "ProductUiZoomAssetEditor binding section",
  );
  assertIncludes(
    productUiZoomAssetEditorSource,
    "const productUiAssetPool = productUiAssets ?? [];",
    "ProductUiZoomAssetEditor defaults the optional asset pool",
  );
  assertIncludes(
    productUiZoomAssetEditorSource,
    "visibleProductUiAssetCount",
    "ProductUiZoomAssetEditor counts uploaded plus already bound assets",
  );
  assertIncludes(
    productUiZoomAssetEditorSource,
    "bindProductUiZoomAsset(segment",
    "ProductUiZoomAssetEditor binds descriptors through the template asset helper",
  );
  assertAnyIncludes(
    productUiZoomAssetEditorSource,
    ["unbindProductUiZoomAsset", "onUnbindProductUiZoomAsset", "解除绑定"],
    "ProductUiZoomAssetEditor unbind path",
  );
  assertAnyIncludes(
    productUiZoomAssetEditorSource,
    ["productUiZoomUploadError", "productUiAssetError", "uploadError"],
    "ProductUiZoomAssetEditor upload error state",
  );
  assertIncludes(productUiZoomAssetEditorSource, "重试上传", "ProductUiZoomAssetEditor retry path");
  assertIncludes(productUiZoomAssetEditorSource, "上传并替换", "ProductUiZoomAssetEditor replace behavior");
  assertIncludes(
    productUiZoomAssetEditorSource,
    "上传并绑定",
    "ProductUiZoomAssetEditor upload-and-bind behavior",
  );
  assertIncludes(
    productUiZoomAssetEditorSource,
    "上传池",
    "ProductUiZoomAssetEditor labels the current-page upload pool",
  );
  assertIncludes(
    productUiZoomAssetEditorSource,
    "当前分镜已有绑定素材，可上传替换或解绑。",
    "ProductUiZoomAssetEditor does not show zero assets when a section already has a bound asset",
  );
  assertIncludes(
    productUiZoomAssetEditorSource,
    'event.currentTarget.value = "";',
    "ProductUiZoomAssetEditor upload input reset",
  );
  assertAnyIncludes(
    productUiZoomAssetEditorSource,
    ['type="file"', 'type: "file"'],
    "ProductUiZoomAssetEditor upload input",
  );
  assertNotIncludes(
    source,
    'type="url"',
    "TechnicalExplainerEditor must not expose raw remote URL input",
  );
  assertNotIncludes(
    productUiZoomAssetEditorSource,
    'type="url"',
    "ProductUiZoomAssetEditor must not expose raw remote URL input",
  );
  assertNotIncludes(
    source,
    'placeholder="https://',
    "TechnicalExplainerEditor must not expose raw remote URL placeholder",
  );
  assertNotIncludes(
    productUiZoomAssetEditorSource,
    'placeholder="https://',
    "ProductUiZoomAssetEditor must not expose raw remote URL placeholder",
  );
  assertNotIncludes(
    source,
    'sourceType: "remote"',
    "TechnicalExplainerEditor must not create remote URL descriptors",
  );
  assertNotIncludes(
    productUiZoomAssetEditorSource,
    'sourceType: "remote"',
    "ProductUiZoomAssetEditor must not create remote URL descriptors",
  );
};

const assertTemplateEditorPropWiring = async () => {
  const editorTypesSource = await readSource("src/templates/editor-types.ts");
  assertAnyIncludes(
    editorTypesSource,
    ["productUiAssets", "productUiAssetPool"],
    "TemplateEditorProps product UI asset pool prop",
  );
  assertAnyIncludes(
    editorTypesSource,
    ["onProductUiAssetUpload", "uploadProductUiAsset"],
    "TemplateEditorProps upload callback prop",
  );
  assertAnyIncludes(
    editorTypesSource,
    ["onProductUiAssetRemove", "removeProductUiAsset"],
    "TemplateEditorProps remove callback prop",
  );
  assertAnyIncludes(
    editorTypesSource,
    ["isUploadingProductUiAsset", "productUiAssetError"],
    "TemplateEditorProps upload state prop",
  );

  const segmentEditorSource = await readSource("src/components/project/SegmentEditor.tsx");
  const technicalExplainerRuntimeSource = await readSource(
    "src/templates/technical-explainer/runtime.tsx",
  );
  assertIncludes(
    segmentEditorSource,
    "productUiAssets: readonly ProductUiAssetPoolItem[];",
    "SegmentEditor product UI asset pool prop",
  );
  assertIncludes(
    segmentEditorSource,
    "onProductUiAssetUpload: (file: File) => Promise<void>;",
    "SegmentEditor upload callback prop",
  );
  assertIncludes(
    segmentEditorSource,
    "onProductUiAssetRemove: (assetId: string) => void;",
    "SegmentEditor remove callback prop",
  );
  assertIncludes(
    segmentEditorSource,
    "productUiAssets={productUiAssets}",
    "SegmentEditor passes asset pool to runtime template editor",
  );
  assertIncludes(
    segmentEditorSource,
    "onProductUiAssetUpload={onProductUiAssetUpload}",
    "SegmentEditor passes upload callback to runtime template editor",
  );
  assertIncludes(
    segmentEditorSource,
    "onProductUiAssetRemove={onProductUiAssetRemove}",
    "SegmentEditor passes remove callback to runtime template editor",
  );
  assertIncludes(
    segmentEditorSource,
    "productUiAssetError={productUiAssetError}",
    "SegmentEditor passes upload error to runtime template editor",
  );
  assertIncludes(
    technicalExplainerRuntimeSource,
    "productUiAssets={props.productUiAssets}",
    "TechnicalExplainer runtime editor forwards asset pool to template editor",
  );
  assertIncludes(
    technicalExplainerRuntimeSource,
    "onProductUiAssetUpload={props.onProductUiAssetUpload}",
    "TechnicalExplainer runtime editor forwards upload callback to template editor",
  );
  assertIncludes(
    technicalExplainerRuntimeSource,
    "onProductUiAssetRemove={props.onProductUiAssetRemove}",
    "TechnicalExplainer runtime editor forwards remove callback to template editor",
  );
  assertIncludes(
    technicalExplainerRuntimeSource,
    "isUploadingProductUiAsset={props.isUploadingProductUiAsset}",
    "TechnicalExplainer runtime editor forwards upload state to template editor",
  );
  assertIncludes(
    technicalExplainerRuntimeSource,
    "productUiAssetError={props.productUiAssetError}",
    "TechnicalExplainer runtime editor forwards upload error to template editor",
  );

  const pageSource = await readSource("src/app/page.tsx");
  assertIncludes(
    pageSource,
    "<ProjectWorkbench initialProject={initialProject} />",
    "page passes initial project to ProjectWorkbench",
  );

  const workbenchSource = await readSource("src/components/project/ProjectWorkbench.tsx");
  assertIncludes(
    workbenchSource,
    "useProjectGeneration({ initialProject })",
    "ProjectWorkbench owns project generation hook",
  );
  assertIncludes(
    workbenchSource,
    "productUiAssets={generation.productUiAssets}",
    "ProjectWorkbench product UI asset prop wiring",
  );
  assertIncludes(
    workbenchSource,
    "onProductUiAssetUpload={generation.uploadProductUiAsset}",
    "ProjectWorkbench upload callback wiring",
  );
  assertIncludes(
    workbenchSource,
    "onProductUiAssetRemove={generation.removeProductUiAsset}",
    "ProjectWorkbench remove callback wiring",
  );
  assertIncludes(
    workbenchSource,
    "productUiAssetError={generation.productUiAssetError}",
    "ProjectWorkbench product UI upload error wiring",
  );
};

await assertProductUiAssetBindingHelpers();
await assertTechnicalExplainerEditor();
await assertTemplateEditorPropWiring();

console.log("product-ui editor binding smoke passed");
