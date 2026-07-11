import type { ProducerSampleManifest } from "../../../src/remotion/producer-samples/manifest";

export const fixtureProducerManifest = {
  compositionId: "FixtureProducerVideo",
  sampleName: "FixtureProducerVideo",
  slug: "fixture-producer-video",
  contentFamily: "tutorial",
  canvasProfile: "landscape-16x9",
  localArtifactRoot: "public/generated/fixture-producer-video/",
  reviewFrames: [
    { frame: 45, label: "opening thesis", purpose: "Fixture opening." },
    { frame: 620, label: "model tiers", purpose: "Fixture model tiers." },
  ],
  ttsStatus: "planned",
  sourceFiles: [],
  promotionCandidates: [],
  notes: [],
} satisfies ProducerSampleManifest;
