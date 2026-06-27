/* global console */

const {
  bindProductUiZoomAsset,
  findProductUiZoomSections,
  getUnboundProductUiZoomSections,
  unbindProductUiZoomAsset,
} = await import("../src/templates/technical-explainer/product-ui-assets.js");

const fail = (message) => {
  throw new Error(message);
};

const assertEqual = (actual, expected, label) => {
  if (actual !== expected) {
    fail(`${label}: expected ${String(expected)}, got ${String(actual)}`);
  }
};

const assertDeepEqual = (actual, expected, label) => {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) {
    fail(`${label}: expected ${expectedJson}, got ${actualJson}`);
  }
};

const assertMissingKey = (value, key, label) => {
  if (Object.hasOwn(value, key)) {
    fail(`${label}: unexpected key ${key}`);
  }
};

const baseSpec = Object.freeze({
  meta: {
    title: "Product UI Binding Smoke",
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
  durationInFrames: 360,
  title: "Product UI Binding Smoke",
  subtitle: "Bind a route screenshot into one product-ui-zoom section.",
  sections: [
    {
      id: "intro",
      recipeId: "hero-title-reveal",
      title: "Intro",
      primaryText: "Keep non-product sections untouched",
      secondaryText: "This section must be preserved exactly.",
      durationInFrames: 90,
      callouts: ["preserve"],
    },
    {
      id: "product-a",
      recipeId: "product-ui-zoom",
      title: "Dashboard focus",
      subtitle: "Fallback until a user uploads a product screenshot.",
      durationInFrames: 120,
      fallbackSummary: "Fallback copy remains available when unbound.",
      focalPoint: {
        xPercent: 58,
        yPercent: 44,
        zoomPercent: 145,
        label: "Inspector panel",
      },
      callouts: ["Status", "Detail"],
    },
    {
      id: "product-b",
      recipeId: "product-ui-zoom",
      title: "Settings focus",
      durationInFrames: 120,
      fallbackSummary: "Second product placeholder stays unbound.",
    },
  ],
});

const baseSegment = Object.freeze({
  id: "segment-product-ui",
  title: "Product UI segment",
  intent: "Show product UI screenshot binding.",
  templateId: "technical-explainer",
  implementation: baseSpec,
});

const uploadedDescriptor = Object.freeze({
  sourceType: "route",
  src: "/api/assets/product-ui/product-ui-asset-1710000000000-abcd1234.png",
  alt: "Uploaded product dashboard",
  frameLabel: "Dashboard frame",
  assetId: "product-ui-asset-1710000000000-abcd1234.png",
  originalName: "dashboard.png",
  sizeInBytes: 3821,
  contentType: "image/png",
});

const replacementDescriptor = Object.freeze({
  sourceType: "route",
  src: "/api/assets/product-ui/product-ui-asset-1710000000000-efgh5678.webp",
  alt: "Replacement product dashboard",
});

const assertProductSectionShape = (section, label) => {
  assertEqual(section.recipeId, "product-ui-zoom", `${label} recipe`);
  assertEqual(section.fallbackSummary, "Fallback copy remains available when unbound.", `${label} fallback`);
  assertDeepEqual(
    section.focalPoint,
    {
      xPercent: 58,
      yPercent: 44,
      zoomPercent: 145,
      label: "Inspector panel",
    },
    `${label} focal point`,
  );
  assertDeepEqual(section.callouts, ["Status", "Detail"], `${label} callouts`);
  assertEqual(section.durationInFrames, 120, `${label} duration`);
};

const sections = findProductUiZoomSections(baseSegment);
assertEqual(sections.length, 2, "product-ui section count");
assertEqual(sections[0].id, "product-a", "first product-ui section id");
assertEqual(sections[1].id, "product-b", "second product-ui section id");

const unboundSections = getUnboundProductUiZoomSections(baseSegment);
assertEqual(unboundSections.length, 2, "unbound product-ui section count");

const boundSegment = bindProductUiZoomAsset(baseSegment, {
  descriptor: uploadedDescriptor,
  sectionId: "product-a",
});
const boundSpec = boundSegment.implementation;
assertEqual(boundSpec.sections.length, baseSpec.sections.length, "bound section count");
assertDeepEqual(boundSpec.sections[0], baseSpec.sections[0], "non-product-ui section preservation");
assertDeepEqual(boundSpec.sections[2], baseSpec.sections[2], "non-target product-ui section preservation");

const boundSection = boundSpec.sections[1];
assertProductSectionShape(boundSection, "bound section");
assertDeepEqual(
  boundSection.asset,
  {
    sourceType: "route",
    src: "/api/assets/product-ui/product-ui-asset-1710000000000-abcd1234.png",
    alt: "Uploaded product dashboard",
    frameLabel: "Dashboard frame",
  },
  "metadata-stripped route descriptor",
);
assertMissingKey(boundSection.asset, "assetId", "bound asset");
assertMissingKey(boundSection.asset, "originalName", "bound asset");
assertMissingKey(boundSection.asset, "sizeInBytes", "bound asset");
assertMissingKey(boundSection.asset, "contentType", "bound asset");

const afterBindUnbound = getUnboundProductUiZoomSections(boundSegment);
assertEqual(afterBindUnbound.length, 1, "unbound count after binding");
assertEqual(afterBindUnbound[0].id, "product-b", "remaining unbound section");

const replacedSegment = bindProductUiZoomAsset(boundSegment, {
  descriptor: replacementDescriptor,
  sectionId: "product-a",
});
const replacedSection = replacedSegment.implementation.sections[1];
assertDeepEqual(
  replacedSection.asset,
  {
    sourceType: "route",
    src: "/api/assets/product-ui/product-ui-asset-1710000000000-efgh5678.webp",
    alt: "Replacement product dashboard",
  },
  "replacement descriptor",
);
assertProductSectionShape(replacedSection, "replaced section");

const unboundSegment = unbindProductUiZoomAsset(replacedSegment, "product-a");
const unboundSection = unboundSegment.implementation.sections[1];
assertMissingKey(unboundSection, "asset", "unbound section");
assertProductSectionShape(unboundSection, "unbound section");

try {
  bindProductUiZoomAsset(baseSegment, {
    descriptor: {
      sourceType: "route",
      src: "https://example.com/product.png",
      alt: "Remote image",
    },
    sectionId: "product-a",
  });
  fail("remote route src should be rejected");
} catch (error) {
  if (!(error instanceof Error) || !error.message.includes("route product-ui asset")) {
    throw error;
  }
}

try {
  bindProductUiZoomAsset(baseSegment, {
    descriptor: replacementDescriptor,
    sectionId: "intro",
  });
  fail("non-product-ui target should be rejected");
} catch (error) {
  if (!(error instanceof Error) || !error.message.includes("product-ui-zoom")) {
    throw error;
  }
}

try {
  unbindProductUiZoomAsset(baseSegment, "missing-section");
  fail("missing target section should be rejected");
} catch (error) {
  if (!(error instanceof Error) || !error.message.includes("missing-section")) {
    throw error;
  }
}

console.log("product-ui asset binding smoke passed");
