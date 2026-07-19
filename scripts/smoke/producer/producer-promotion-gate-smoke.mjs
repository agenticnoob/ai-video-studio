import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

/* global console */

const {
  producerSampleManifests,
  producerSamplePromotionTargets,
  producerSamplePromotionGateStates,
  getProducerSampleManifestByCompositionId,
  getProducerSamplePromotionGateState,
} = await import("../../../src/remotion/producer-samples/index.js");

const allowedTargets = ["primitive", "block", "effect", "transition", "style-profile"];
assert.deepEqual(
  [...producerSamplePromotionTargets],
  allowedTargets,
  "Promotion targets must stay bounded to Producer-owned reuse layers.",
);

for (const [gateStateId, targetLayer] of [
  ["promote-to-primitive", "primitive"],
  ["promote-to-block", "block"],
  ["promote-to-effect", "effect"],
  ["promote-to-transition", "transition"],
  ["promote-to-style-profile", "style-profile"],
]) {
  assert.equal(
    getProducerSamplePromotionGateState(gateStateId).targetLayer,
    targetLayer,
    `${gateStateId} must map to ${targetLayer}.`,
  );
}
assert(
  producerSamplePromotionGateStates.some((state) => state.id === "stay-sample-local"),
  "Promotion gate must keep a stay-sample-local decision.",
);

const uvManifest = getProducerSampleManifestByCompositionId("UvOpenSourceBrief");
assert(uvManifest, "UvOpenSourceBrief manifest is required for the Promotion Gate example.");
const evidenceLensCandidates = uvManifest.promotionCandidates.filter((candidate) =>
  ["evidence-screenshot-backdrop", "evidence-overlay-panel", "screenshot-focus"].includes(
    candidate.id,
  ),
);
assert.equal(evidenceLensCandidates.length, 3, "UvOpenSourceBrief must list Evidence Lens pieces.");
for (const candidate of evidenceLensCandidates) {
  assert.equal(candidate.targetLayer, "block", `${candidate.id} must remain block-level evidence.`);
  assert.equal(candidate.gateState, "promote-to-block", `${candidate.id} must use the block gate.`);
  assert.equal(candidate.status, "promoted", `${candidate.id} must retain promoted evidence.`);
}

const maintainedIds = new Set([
  "AgentProducerMediaSoundProof",
  "TcpHandshakeEditorial",
  "TcpHandshakeTerminal",
  "DnsResolutionExplainer",
  "AiDailyNews20260717",
  "SuperintelligenceBeyondHumanCognition",
]);
for (const manifest of producerSampleManifests) {
  assert.equal(
    manifest.sampleStatus,
    maintainedIds.has(manifest.compositionId) ? "maintained" : "frozen-reference",
    `${manifest.compositionId} must keep its explicit maintained or frozen status.`,
  );
  for (const candidate of manifest.promotionCandidates) {
    assert(
      allowedTargets.includes(candidate.targetLayer),
      `${manifest.compositionId}/${candidate.id} has unsupported target ${candidate.targetLayer}.`,
    );
    assert(!("productizationExposure" in candidate), "Productization exposure must be removed.");
    assert.notEqual(candidate.status, "productized", "Productized status must be removed.");
  }
  for (const sourceFile of manifest.sourceFiles) {
    assert(
      !sourceFile.path.startsWith("public/generated/") && !sourceFile.path.startsWith("out/"),
      `${manifest.compositionId} sourceFiles must exclude generated artifacts.`,
    );
  }
}

const promotionDocPath = "docs/PRODUCER_PROMOTION_GATE.md";
assert(existsSync(promotionDocPath), `Missing ${promotionDocPath}.`);
const promotionDoc = readFileSync(promotionDocPath, "utf8");
for (const decision of [
  "stay sample-local",
  "promote to primitive",
  "promote to block",
  "promote to effect",
  "promote to transition",
  "promote to style profile",
]) {
  assert(promotionDoc.includes(decision), `${promotionDocPath} must include ${decision}.`);
}
for (const forbidden of ["promote to recipe", "promote to template"]) {
  assert(!promotionDoc.includes(forbidden), `${promotionDocPath} must not include ${forbidden}.`);
}

console.log("Producer promotion gate smoke passed.");
