import type { ProducerQualityPlan } from "../../lib/producer-quality-gates";

const fixtureRoot = "/tmp/producer-quality-gates-fixture";

export const producerQualityPlan = {
  compositionId: "ProducerQualityFixture",
  canvas: { width: 320, height: 180, fps: 30 },
  safeMargins: { top: 10, right: 10, bottom: 10, left: 10 },
  textLayouts: [
    {
      id: "fixture-title",
      text: "QUALITY",
      box: { x: 20, y: 20, width: 180, height: 48 },
      measuredWidth: 140,
      measuredHeight: 36,
      fits: true,
      foregroundColor: "#ffffff",
      backgroundColor: "#000000",
    },
  ],
  visibleElements: [{ id: "fixture-focus", bounds: { x: 20, y: 20, width: 280, height: 140 } }],
  evidence: [{ id: "fixture-evidence", status: "resolved-asset" }],
  reviewFrames: [{ frame: 15, label: "fixture", path: `${fixtureRoot}/review-good.png` }],
  artifact: {
    mp4Path: `${fixtureRoot}/fixture.mp4`,
    metadataPath: `${fixtureRoot}/fixture.json`,
    expectedWidth: 320,
    expectedHeight: 180,
    expectedFps: 30,
    expectedDurationInFrames: 30,
    chapters: [
      { name: "First", durationInFrames: 15 },
      { name: "Second", durationInFrames: 15 },
    ],
  },
  artifactPaths: [fixtureRoot],
} as const satisfies ProducerQualityPlan;
