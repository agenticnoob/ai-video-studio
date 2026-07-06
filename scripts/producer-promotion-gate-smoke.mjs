import { existsSync, readFileSync } from "node:fs";

/* global console */

const {
  producerSampleManifests,
  producerSamplePromotionTargets,
  producerSamplePromotionGateStates,
  getProducerSampleManifestByCompositionId,
  getProducerSamplePromotionGateState,
} = await import("../src/remotion/producer-samples/index.js");

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const read = (path) => readFileSync(path, "utf8");

const allowedTargets = ["primitive", "block", "recipe", "template"];

assert(
  JSON.stringify(producerSamplePromotionTargets) === JSON.stringify(allowedTargets),
  "Promotion targets must stay bounded to primitive/block/recipe/template.",
);

assert(
  producerSamplePromotionGateStates.some((state) => state.id === "stay-sample-local"),
  "Promotion gate must keep a stay-sample-local decision.",
);
assert(
  producerSamplePromotionGateStates.some((state) => state.id === "promote-to-block"),
  "Promotion gate must define a promote-to-block decision.",
);
assert(
  getProducerSamplePromotionGateState("promote-to-block").targetLayer === "block",
  "promote-to-block must map to the block target layer.",
);

const uvManifest = getProducerSampleManifestByCompositionId("UvOpenSourceBrief");
assert(uvManifest, "UvOpenSourceBrief manifest is required for the first Promotion Gate example.");

const evidenceLensCandidates = uvManifest.promotionCandidates.filter((candidate) =>
  ["evidence-screenshot-backdrop", "evidence-overlay-panel", "screenshot-focus"].includes(
    candidate.id,
  ),
);
assert(evidenceLensCandidates.length === 3, "UvOpenSourceBrief must list the Evidence Lens pieces.");

for (const candidate of evidenceLensCandidates) {
  assert(
    candidate.gateState === "promote-to-block",
    `${candidate.id} must be recorded as a block-level Promotion Gate result.`,
  );
  assert(
    candidate.status === "promoted",
    `${candidate.id} must be recorded as promoted after Phase C extraction.`,
  );
  assert(
    candidate.productizationExposure === "agent-producer-internal",
    `${candidate.id} must stay internal to Agent Producer samples.`,
  );
}

const screenshotFocus = evidenceLensCandidates.find((candidate) => candidate.id === "screenshot-focus");
assert(
  screenshotFocus.targetLayer === "block",
  "ScreenshotFocus is reusable through the Evidence Lens block in Phase D, not exposed as a standalone primitive.",
);

for (const manifest of producerSampleManifests) {
  for (const candidate of manifest.promotionCandidates) {
    assert(
      allowedTargets.includes(candidate.targetLayer),
      `${manifest.compositionId}/${candidate.id} has unsupported target layer ${candidate.targetLayer}.`,
    );
    const gateState = getProducerSamplePromotionGateState(candidate.gateState);
    assert(
      !("targetLayer" in gateState) || gateState.targetLayer === candidate.targetLayer,
      `${manifest.compositionId}/${candidate.id} gateState must agree with targetLayer when it promotes.`,
    );
    assert(
      candidate.productizationExposure !== "productized-editor",
      `${manifest.compositionId}/${candidate.id} must not introduce editor exposure.`,
    );
    assert(
      candidate.productizationExposure !== "planner-visible",
      `${manifest.compositionId}/${candidate.id} must not introduce planner-visible exposure.`,
    );
  }

  for (const sourceFile of manifest.sourceFiles) {
    assert(
      !sourceFile.path.startsWith("public/generated/") && !sourceFile.path.startsWith("out/"),
      `${manifest.compositionId} sourceFiles must not include generated artifacts: ${sourceFile.path}`,
    );
  }
}

const docs = [
  "README.md",
  "docs/PRODUCER_PROMOTION_GATE.md",
  "docs/FINAL_PRODUCT_GOAL.md",
  "docs/ITERATION_STATUS.md",
  "docs/VISUAL_RECIPE_ROADMAP.md",
];
for (const doc of docs) {
  assert(existsSync(doc), `Missing promotion gate doc input: ${doc}`);
}

const joinedDocs = docs.map((doc) => read(doc)).join("\n");
assert(
  joinedDocs.includes("stay sample-local") &&
    joinedDocs.includes("promote to primitive") &&
    joinedDocs.includes("promote to block") &&
    joinedDocs.includes("promote to recipe") &&
    joinedDocs.includes("promote to template"),
  "Docs must describe each Promotion Gate decision.",
);
assert(
  joinedDocs.includes("Evidence Lens") && joinedDocs.includes("block-level reusable producer sample block"),
  "Docs must record Evidence Lens as the first block-level Promotion Gate example.",
);

console.log("Producer promotion gate smoke passed.");
