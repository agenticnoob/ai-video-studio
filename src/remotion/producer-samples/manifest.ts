export const producerSampleCanvasProfiles = ["landscape-16x9", "portrait-9x16"] as const;

export const producerSamplePromotionTargets = ["primitive", "block", "recipe", "template"] as const;

export const producerSampleContentFamilies = [
  "project-intro",
  "data-analysis",
  "tutorial",
  "trend-briefing",
] as const;

export type ProducerSampleContentFamily = (typeof producerSampleContentFamilies)[number];

export type ProducerSampleCanvasProfile = (typeof producerSampleCanvasProfiles)[number];

export type ProducerSamplePromotionTarget = (typeof producerSamplePromotionTargets)[number];

export type ProducerSampleTtsStatus =
  | "not-required"
  | "planned"
  | "generated-local"
  | "needs-regeneration";

export type ProducerSampleSourceFileKind =
  | "renderer"
  | "types"
  | "script"
  | "data"
  | "audio-metadata"
  | "root-registration"
  | "smoke";

export type ProducerSampleReviewFrame = {
  readonly frame: number;
  readonly label: string;
  readonly purpose: string;
};

export const producerSamplePromotionGateStates = [
  {
    id: "stay-sample-local",
    label: "stay sample-local",
    description:
      "Keep the visual idea inside the dedicated sample until another finished video proves reuse.",
  },
  {
    id: "promote-to-primitive",
    label: "promote to primitive",
    targetLayer: "primitive",
    description: "Extract a small reusable Remotion component with runtime-focused props only.",
  },
  {
    id: "promote-to-block",
    label: "promote to block",
    targetLayer: "block",
    description: "Extract a semantic composition of primitives for Agent Producer or template runtime use.",
  },
  {
    id: "promote-to-recipe",
    label: "promote to recipe",
    targetLayer: "recipe",
    description:
      "Productize a proven visual treatment inside a registered template after sample evidence exists.",
  },
  {
    id: "promote-to-template",
    label: "promote to template",
    targetLayer: "template",
    description:
      "Create or extend a provider-visible segment implementation mechanism only after recipe/block evidence is strong.",
  },
] as const;

export type ProducerSamplePromotionGateState = (typeof producerSamplePromotionGateStates)[number];

export type ProducerSamplePromotionGateStateId = ProducerSamplePromotionGateState["id"];

export type ProducerSamplePromotionStatus =
  | "sample-local"
  | "candidate"
  | "promoted"
  | "productized";

export type ProducerSampleProductizationExposure =
  | "none"
  | "agent-producer-internal"
  | "productization-existing";

export type ProducerSamplePromotionCandidate = {
  readonly id: string;
  readonly targetLayer: ProducerSamplePromotionTarget;
  readonly gateState: ProducerSamplePromotionGateStateId;
  readonly status: ProducerSamplePromotionStatus;
  readonly productizationExposure: ProducerSampleProductizationExposure;
  readonly reason: string;
};

export type ProducerSampleSourceFile = {
  readonly path: string;
  readonly kind: ProducerSampleSourceFileKind;
};

export type ProducerSampleManifest = {
  readonly compositionId: string;
  readonly sampleName: string;
  readonly slug: string;
  readonly contentFamily: ProducerSampleContentFamily;
  readonly canvasProfile: ProducerSampleCanvasProfile;
  readonly localArtifactRoot: `public/generated/${string}/`;
  readonly reviewFrames: readonly ProducerSampleReviewFrame[];
  readonly ttsStatus: ProducerSampleTtsStatus;
  readonly sourceFiles: readonly ProducerSampleSourceFile[];
  readonly promotionCandidates: readonly ProducerSamplePromotionCandidate[];
  readonly notes: readonly string[];
};

export const getProducerSamplePromotionGateState = (
  id: ProducerSamplePromotionGateStateId,
): ProducerSamplePromotionGateState => {
  const state = producerSamplePromotionGateStates.find((gateState) => gateState.id === id);

  if (!state) {
    throw new Error(`Unknown producer sample promotion gate state: ${id}`);
  }

  return state;
};

export const assertProducerSampleManifest = (manifest: ProducerSampleManifest): void => {
  if (!manifest.localArtifactRoot.startsWith("public/generated/")) {
    throw new Error(`${manifest.compositionId} localArtifactRoot must live under public/generated/.`);
  }

  if (!manifest.localArtifactRoot.endsWith("/")) {
    throw new Error(`${manifest.compositionId} localArtifactRoot must end with a slash.`);
  }

  if (manifest.reviewFrames.length === 0) {
    throw new Error(`${manifest.compositionId} must declare at least one review frame.`);
  }

  for (const reviewFrame of manifest.reviewFrames) {
    if (!Number.isInteger(reviewFrame.frame) || reviewFrame.frame < 0) {
      throw new Error(`${manifest.compositionId} has an invalid review frame: ${reviewFrame.frame}.`);
    }
  }

  for (const candidate of manifest.promotionCandidates) {
    if (!producerSamplePromotionTargets.includes(candidate.targetLayer)) {
      throw new Error(
        `${manifest.compositionId}/${candidate.id} has an unsupported promotion target: ${candidate.targetLayer}.`,
      );
    }

    const gateState = getProducerSamplePromotionGateState(candidate.gateState);

    if ("targetLayer" in gateState && gateState.targetLayer !== candidate.targetLayer) {
      throw new Error(
        `${manifest.compositionId}/${candidate.id} gateState ${candidate.gateState} does not match target ${candidate.targetLayer}.`,
      );
    }
  }
};
