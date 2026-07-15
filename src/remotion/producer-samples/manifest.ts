export const producerSampleCanvasProfiles = ["landscape-16x9", "portrait-9x16"] as const;

export const producerSamplePromotionTargets = [
  "primitive",
  "block",
  "effect",
  "transition",
  "style-profile",
] as const;

export const producerSampleContentFamilies = [
  "project-intro",
  "data-analysis",
  "tutorial",
  "trend-briefing",
] as const;

export type ProducerSampleContentFamily = (typeof producerSampleContentFamilies)[number];
export type ProducerSampleCanvasProfile = (typeof producerSampleCanvasProfiles)[number];
export type ProducerSamplePromotionTarget = (typeof producerSamplePromotionTargets)[number];
export type ProducerSampleStatus = "frozen-reference" | "maintained";

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
  | "smoke"
  | "manifest"
  | "validation"
  | "cover"
  | "render-metadata"
  | "publishing-copy";

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
    description: "Extract a semantic combination of primitives for Agent Producer use.",
  },
  {
    id: "promote-to-effect",
    label: "promote to effect",
    targetLayer: "effect",
    description: "Extract a deterministic visual treatment with a bounded preset surface.",
  },
  {
    id: "promote-to-transition",
    label: "promote to transition",
    targetLayer: "transition",
    description: "Extract a reusable frame-driven bridge and optional sound mapping.",
  },
  {
    id: "promote-to-style-profile",
    label: "promote to style profile",
    targetLayer: "style-profile",
    description: "Extract a proven visual, motion, media, and sound language.",
  },
] as const;

export type ProducerSamplePromotionGateState = (typeof producerSamplePromotionGateStates)[number];
export type ProducerSamplePromotionGateStateId = ProducerSamplePromotionGateState["id"];
export type ProducerSamplePromotionStatus = "sample-local" | "candidate" | "promoted";

export type ProducerSamplePromotionCandidate = {
  readonly id: string;
  readonly targetLayer: ProducerSamplePromotionTarget;
  readonly gateState: ProducerSamplePromotionGateStateId;
  readonly status: ProducerSamplePromotionStatus;
  readonly reason: string;
};

export type ProducerSampleSourceFile = {
  readonly path: string;
  readonly kind: ProducerSampleSourceFileKind;
};

type ProducerSampleManifestBase = {
  readonly sampleStatus: ProducerSampleStatus;
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

export type FrozenProducerSampleManifest = ProducerSampleManifestBase & {
  readonly sampleStatus: "frozen-reference";
};

export type MaintainedProducerSampleManifest = ProducerSampleManifestBase & {
  readonly sampleStatus: "maintained";
  readonly productionBrief: {
    readonly audience: string;
    readonly publishingSurface: string;
    readonly durationTargetSeconds: number;
  };
  readonly narration: {
    readonly required: boolean;
    readonly provider: "voxcpm";
    readonly mode: "voice-design" | "controllable-clone" | "high-fidelity-clone";
    readonly scriptPath: string;
    readonly audioMetadataPath: string;
  };
  readonly assets: readonly {
    readonly id: string;
    readonly localPath: string;
    readonly purpose: string;
  }[];
  readonly validationModule: string;
  readonly render: {
    readonly metadataPath: string;
    readonly cover16x9CompositionId: string;
    readonly cover9x16CompositionId: string;
  };
  readonly publishingCopyPath: string;
};

export type ProducerSampleManifest =
  | FrozenProducerSampleManifest
  | MaintainedProducerSampleManifest;

export const getProducerSamplePromotionGateState = (
  id: ProducerSamplePromotionGateStateId,
): ProducerSamplePromotionGateState => {
  const state = producerSamplePromotionGateStates.find((gateState) => gateState.id === id);
  if (!state) throw new Error(`Unknown producer sample promotion gate state: ${id}`);
  return state;
};

const requireText = (value: string, label: string): void => {
  if (!value.trim()) throw new Error(`${label} must be non-empty.`);
};

export const assertProducerSampleManifest = (manifest: ProducerSampleManifest): void => {
  requireText(manifest.compositionId, "compositionId");
  requireText(manifest.sampleName, `${manifest.compositionId} sampleName`);
  requireText(manifest.slug, `${manifest.compositionId} slug`);

  if (!manifest.localArtifactRoot.startsWith("public/generated/")) {
    throw new Error(
      `${manifest.compositionId} localArtifactRoot must live under public/generated/.`,
    );
  }
  if (!manifest.localArtifactRoot.endsWith("/")) {
    throw new Error(`${manifest.compositionId} localArtifactRoot must end with a slash.`);
  }
  if (manifest.reviewFrames.length === 0) {
    throw new Error(`${manifest.compositionId} must declare at least one review frame.`);
  }

  for (const reviewFrame of manifest.reviewFrames) {
    if (!Number.isInteger(reviewFrame.frame) || reviewFrame.frame < 0) {
      throw new Error(
        `${manifest.compositionId} has an invalid review frame: ${reviewFrame.frame}.`,
      );
    }
    requireText(reviewFrame.label, `${manifest.compositionId} review frame label`);
    requireText(reviewFrame.purpose, `${manifest.compositionId} review frame purpose`);
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

  if (manifest.sampleStatus === "frozen-reference") return;

  requireText(manifest.productionBrief.audience, `${manifest.compositionId} audience`);
  requireText(
    manifest.productionBrief.publishingSurface,
    `${manifest.compositionId} publishing surface`,
  );
  if (!(manifest.productionBrief.durationTargetSeconds > 0)) {
    throw new Error(`${manifest.compositionId} duration target must be positive.`);
  }
  if (manifest.narration.provider !== "voxcpm") {
    throw new Error(`${manifest.compositionId} maintained narration must use VoxCPM.`);
  }
  requireText(manifest.narration.scriptPath, `${manifest.compositionId} narration script path`);
  requireText(
    manifest.narration.audioMetadataPath,
    `${manifest.compositionId} audio metadata path`,
  );
  requireText(manifest.validationModule, `${manifest.compositionId} validation module`);
  requireText(manifest.render.metadataPath, `${manifest.compositionId} render metadata path`);
  requireText(
    manifest.render.cover16x9CompositionId,
    `${manifest.compositionId} 16x9 cover composition id`,
  );
  requireText(
    manifest.render.cover9x16CompositionId,
    `${manifest.compositionId} 9x16 cover composition id`,
  );
  if (manifest.render.cover16x9CompositionId === manifest.render.cover9x16CompositionId) {
    throw new Error(`${manifest.compositionId} cover composition ids must be distinct.`);
  }
  requireText(manifest.publishingCopyPath, `${manifest.compositionId} publishing copy path`);

  for (const asset of manifest.assets) {
    requireText(asset.id, `${manifest.compositionId} asset id`);
    requireText(asset.localPath, `${manifest.compositionId}/${asset.id} local asset path`);
    requireText(asset.purpose, `${manifest.compositionId}/${asset.id} asset purpose`);
    if (/^https?:\/\//i.test(asset.localPath)) {
      throw new Error(`${manifest.compositionId}/${asset.id} asset must use a local path.`);
    }
  }

  const sourcePaths = new Set(manifest.sourceFiles.map((sourceFile) => sourceFile.path));
  for (const requiredPath of [
    manifest.narration.scriptPath,
    manifest.narration.audioMetadataPath,
    manifest.validationModule,
    manifest.render.metadataPath,
    manifest.publishingCopyPath,
  ]) {
    if (!sourcePaths.has(requiredPath)) {
      throw new Error(`${manifest.compositionId} sourceFiles must include ${requiredPath}.`);
    }
  }
  for (const requiredKind of [
    "manifest",
    "validation",
    "cover",
    "render-metadata",
    "publishing-copy",
    "root-registration",
  ] as const) {
    if (!manifest.sourceFiles.some((sourceFile) => sourceFile.kind === requiredKind)) {
      throw new Error(
        `${manifest.compositionId} sourceFiles must include ${requiredKind} ownership.`,
      );
    }
  }
};
