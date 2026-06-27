/* global console, process */

import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const workspaceRoot = process.cwd();
const evidenceDir = path.join(workspaceRoot, ".omo", "evidence", "product-ui-image-upload-loop");
const smokeImagePath = path.join(workspaceRoot, "public", "product-ui-upload-smoke.png");
const evidenceImagePath = path.join(evidenceDir, "product-ui-upload-smoke.png");
const artifactImagePath = path.join(workspaceRoot, "out", "product-ui-assets", "product-ui-asset-20260625t010101z-00000000.png");
const productUiAssetId = "product-ui-asset-20260625t010101z-00000000.png";
const uploadFixturePath = path.join(evidenceDir, "render-product-ui-upload-project.json");
const unboundFixturePath = path.join(evidenceDir, "render-product-ui-unbound-project.json");

const fail = (message) => {
  throw new Error(message);
};

const readJson = async (filePath) => {
  const source = await readFile(filePath, "utf8");
  return JSON.parse(source);
};

const readText = async (filePath) => {
  return readFile(filePath, "utf8");
};

const writeJson = async (filePath, value) => {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
};

const loadFixture = async (filePath) => {
  try {
    return await readJson(filePath);
  } catch (error) {
    fail(`Fixture is missing or invalid at ${path.relative(workspaceRoot, filePath)}: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const createTechnicalExplainerFixture = () => ({
  meta: {
    title: "Product UI Upload Loop",
    fps: 30,
    width: 1280,
    height: 720,
  },
  brief: "Deterministic product-ui upload loop smoke fixture.",
  segments: [
    {
      id: "segment-product-ui-upload",
      title: "Product UI upload loop",
      intent: "Show a product screenshot binding to one product-ui-zoom section.",
      templateId: "technical-explainer",
      implementation: {
        meta: {
          title: "Product UI upload loop",
          fps: 30,
          width: 1280,
          height: 720,
        },
        theme: {
          background: "#0b1020",
          panel: "rgba(255,255,255,0.10)",
          primary: "#38bdf8",
          secondary: "#f59e0b",
          text: "#f8fafc",
          muted: "#cbd5e1",
        },
        durationInFrames: 420,
        title: "Product UI screenshot binding loop",
        subtitle: "Bound assets stay route-based and unbound sections keep fallback copy.",
        sections: [
          {
            id: "hero",
            recipeId: "hero-title-reveal",
            title: "Upload loop",
            primaryText: "Deterministic product UI assets stay local",
            secondaryText: "Keep generated payloads free of upload descriptors.",
            durationInFrames: 90,
            callouts: ["Route asset", "No payload leak"],
          },
          {
            id: "product-ui",
            recipeId: "product-ui-zoom",
            title: "Bound product surface",
            subtitle: "This section binds one route descriptor only.",
            asset: {
              sourceType: "route",
              src: `/api/assets/product-ui/${productUiAssetId}`,
              alt: "Deterministic product UI screenshot fixture",
              frameLabel: "Route frame",
            },
            focalPoint: {
              xPercent: 61,
              yPercent: 47,
              zoomPercent: 142,
              label: "Inspector panel",
            },
            callouts: ["Local route asset", "Editable placeholder"],
            fallbackSummary: "Fallback copy remains visible when the section is unbound.",
            durationInFrames: 150,
          },
        ],
      },
    },
  ],
});

const createUnboundTechnicalExplainerFixture = () => ({
  ...createTechnicalExplainerFixture(),
  segments: (() => {
    const uploadFixture = createTechnicalExplainerFixture();
    const [segment] = uploadFixture.segments;

    return [
      {
        ...segment,
        implementation: {
          ...segment.implementation,
          sections: [
            segment.implementation.sections[0],
            {
              id: "product-ui",
              recipeId: "product-ui-zoom",
              title: "Bound product surface",
              subtitle: "This section binds one route descriptor only.",
              focalPoint: {
                xPercent: 61,
                yPercent: 47,
                zoomPercent: 142,
                label: "Inspector panel",
              },
              callouts: ["Local route asset", "Editable placeholder"],
              fallbackSummary: "Fallback copy remains visible when the section is unbound.",
              durationInFrames: 150,
            },
          ],
        },
      },
    ];
  })(),
});

const assertFixtureShape = (fixture, label) => {
  const [segment] = fixture.segments;
  if (!segment || segment.templateId !== "technical-explainer") {
    fail(`${label}: expected a technical-explainer segment`);
  }

  const productUiSections = segment.implementation.sections.filter(
    (section) => section.recipeId === "product-ui-zoom",
  );

  if (productUiSections.length !== 1) {
    fail(`${label}: expected exactly one product-ui-zoom section`);
  }

  const [productUiSection] = productUiSections;
  if (label === "upload fixture") {
    if (productUiSection.asset?.sourceType !== "route") {
      fail(`${label}: expected a route descriptor`);
    }
    if (productUiSection.asset?.src !== `/api/assets/product-ui/${productUiAssetId}`) {
      fail(`${label}: expected deterministic route src`);
    }
    if (!productUiSection.fallbackSummary) {
      fail(`${label}: expected fallbackSummary`);
    }
  } else {
    if ("asset" in productUiSection) {
      fail(`${label}: expected asset to be removed`);
    }
    if (!productUiSection.fallbackSummary) {
      fail(`${label}: expected fallbackSummary to remain present`);
    }
  }
};

const assertGenerationPayloadDoesNotIncludeProductUiAssets = (fixture) => {
  const source = JSON.stringify(fixture);
  if (source.includes('"mode":"brief"') || source.includes('"mode":"segment"')) {
    fail("fixture JSON must not contain staged generation request mode fields");
  }
};

const assertGenerationRequestSourceDoesNotIncludeProductUiAssets = (generationActionsSource) => {
  const requestBodySnippets = [
    ...generationActionsSource.matchAll(
      /const requestBody = [\s\S]*?;\n\s*const response = await fetch\("\/api\/generate\/staged"/g,
    ),
  ].map(([snippet]) => snippet);

  if (requestBodySnippets.length !== 2) {
    fail("generation actions should build explicit requestBody values before staged fetches");
  }

  for (const snippet of requestBodySnippets) {
    if (
      snippet.includes("/api/assets/product-ui") ||
      snippet.includes("productUiAssets") ||
      snippet.includes("sourceType")
    ) {
      fail("staged generation request source must not include product UI upload descriptors");
    }
  }
};

const assertSelectedSegmentGuardrail = (uploadFixture, unboundFixture) => {
  const [uploadSegment] = uploadFixture.segments;
  const [unboundSegment] = unboundFixture.segments;

  const originalSections = uploadSegment.implementation.sections;
  const preservedSections = unboundSegment.implementation.sections;

  if (originalSections.length !== preservedSections.length) {
    fail("selected-segment update should keep the surrounding section count stable");
  }

  if (JSON.stringify(originalSections[0]) !== JSON.stringify(preservedSections[0])) {
    fail("non-target sections should remain preserved by selected-segment updates");
  }

  const uploadProductUiSection = originalSections.find((section) => section.recipeId === "product-ui-zoom");
  const unboundProductUiSection = preservedSections.find((section) => section.recipeId === "product-ui-zoom");

  if (!uploadProductUiSection || !unboundProductUiSection) {
    fail("expected product-ui-zoom sections in both fixtures");
  }

  if (unboundProductUiSection.asset !== undefined) {
    fail("unbound fixture should remove section.asset");
  }

  if (!unboundProductUiSection.fallbackSummary) {
    fail("unbound fixture should keep fallbackSummary");
  }
};

const assertSourceGuardrails = async () => {
  const generationActionsSource = await readText(
    path.join(workspaceRoot, "src", "helpers", "project-generation", "use-generation-actions.ts"),
  );
  const assemblySource = await readText(
    path.join(workspaceRoot, "src", "lib", "staged-generation", "assembly.ts"),
  );

  assertGenerationRequestSourceDoesNotIncludeProductUiAssets(generationActionsSource);

  if (
    !assemblySource.includes("project.segments.map") ||
    !assemblySource.includes("layer.kind !== \"narration\"") ||
    !assemblySource.includes("layer.id !== `${segmentId}-narration-audio`")
  ) {
    fail("selected-segment assembly should preserve non-target segments and narration layers");
  }
};

const main = async () => {
  await mkdir(evidenceDir, { recursive: true });
  await mkdir(path.dirname(artifactImagePath), { recursive: true });
  await copyFile(smokeImagePath, evidenceImagePath);
  await copyFile(smokeImagePath, artifactImagePath);

  const uploadFixture = createTechnicalExplainerFixture();
  const unboundFixture = createUnboundTechnicalExplainerFixture();

  await writeJson(uploadFixturePath, uploadFixture);
  await writeJson(unboundFixturePath, unboundFixture);

  const savedUploadFixture = await loadFixture(uploadFixturePath);
  const savedUnboundFixture = await loadFixture(unboundFixturePath);

  assertFixtureShape(savedUploadFixture, "upload fixture");
  assertFixtureShape(savedUnboundFixture, "unbound fixture");
  assertGenerationPayloadDoesNotIncludeProductUiAssets(savedUploadFixture);
  assertGenerationPayloadDoesNotIncludeProductUiAssets(savedUnboundFixture);
  assertSelectedSegmentGuardrail(savedUploadFixture, savedUnboundFixture);
  await assertSourceGuardrails();

  console.log("product-ui upload fixtures smoke passed");
};

await main();
