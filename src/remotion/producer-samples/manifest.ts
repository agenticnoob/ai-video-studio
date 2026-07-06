export const producerSampleCanvasProfiles = ["landscape-16x9", "portrait-9x16"] as const;

export const producerSampleContentFamilies = [
  "project-intro",
  "data-analysis",
  "tutorial",
  "trend-briefing",
] as const;

export type ProducerSampleContentFamily = (typeof producerSampleContentFamilies)[number];

export type ProducerSampleCanvasProfile = (typeof producerSampleCanvasProfiles)[number];

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

export type ProducerSamplePromotionCandidate = {
  readonly id: string;
  readonly targetLayer: "primitive" | "block" | "recipe" | "template";
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
};
