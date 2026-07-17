import type { ProducerQualityPlan } from "../../../../../scripts/lib/producer-quality-gates";

export const producerQualityPlan = {
  compositionId: "SampleName",
  canvas: { width: 1920, height: 1080, fps: 30 },
  safeMargins: { top: 96, right: 120, bottom: 120, left: 120 },
  textLayouts: [
    {
      id: "replace-with-measured-title",
      text: "Replace with measured title evidence",
      box: { x: 120, y: 96, width: 1680, height: 180 },
      measuredWidth: 1,
      measuredHeight: 1,
      fits: false,
      foregroundColor: "#ffffff",
      backgroundColor: "#000000",
    },
  ],
  visibleElements: [
    {
      id: "replace-with-measured-focus-bounds",
      bounds: { x: 120, y: 96, width: 1680, height: 864 },
    },
  ],
  evidence: [{ id: "replace-with-resolved-evidence", status: "unresolved" }],
  reviewFrames: [
    {
      frame: 15,
      label: "opening",
      path: "out/sample-name/review-frames/frame-00015-opening.png",
    },
    {
      frame: 150,
      label: "proof",
      path: "out/sample-name/review-frames/frame-00150-proof.png",
    },
    {
      frame: 285,
      label: "closing",
      path: "out/sample-name/review-frames/frame-00285-closing.png",
    },
  ],
  artifact: {
    mp4Path: "out/sample-name/sample-name.mp4",
    metadataPath: "out/sample-name/sample-name.json",
    expectedWidth: 1920,
    expectedHeight: 1080,
    expectedFps: 30,
    expectedDurationInFrames: 300,
    chapters: [{ name: "Replace with final chapter timing", durationInFrames: 300 }],
  },
  artifactPaths: ["public/generated/sample-name/", "out/sample-name/"],
} as const satisfies ProducerQualityPlan;
