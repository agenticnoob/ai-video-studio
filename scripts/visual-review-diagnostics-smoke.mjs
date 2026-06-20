/* global console */

import assert from "node:assert/strict";

import { mergeVisualReviewStillAnalysisDiagnostics } from "../src/lib/staged-generation/visual-review.js";

const baseDiagnostics = {
  errorCount: 1,
  findingCount: 1,
  findings: [
    {
      message:
        "Segment narration audio lasts 210 frames, longer than the visual segment duration 180.",
      severity: "error",
      suggestedRepair:
        "Regenerate or compile the segment with visual duration at least as long as narration audio.",
      targetId: "seg-scene",
    },
  ],
  reviewFrameCount: 2,
  reviewFrames: [
    {
      frame: 0,
      reason: "segment_start",
      segmentId: "seg-scene",
    },
    {
      frame: 90,
      reason: "segment_midpoint",
      segmentId: "seg-scene",
    },
  ],
  status: "static_preflight",
  warningCount: 0,
};

const extraction = {
  status: "rendered",
  stillCount: 2,
  stills: [
    {
      analysis: {
        blankFrameScore: 0.88,
        borderBandRatio: 0.01,
        contrastScore: 0.08,
        dominantColorRatio: 0.72,
        edgeContentRatio: 0.02,
        fineDetailRatio: 0.04,
        lumaRange: 20,
        pixelCount: 921600,
        status: "low_contrast_frame",
      },
      contentType: "image/png",
      downloadUrl: "/api/visual-review/stills/review-1/seg-scene-start-frame-000000",
      frame: 0,
      outputPath: "/workspace/out/visual-review-stills/review-1/seg-scene-start-frame-000000.png",
      reason: "segment_start",
      segmentId: "seg-scene",
      sizeInBytes: 2048,
      stillId: "seg-scene-start-frame-000000",
    },
    {
      analysis: {
        blankFrameScore: 0.2,
        borderBandRatio: 0.01,
        contrastScore: 0.62,
        dominantColorRatio: 0.16,
        edgeContentRatio: 0.04,
        fineDetailRatio: 0.06,
        lumaRange: 158,
        pixelCount: 921600,
        status: "analyzed",
      },
      contentType: "image/png",
      downloadUrl: "/api/visual-review/stills/review-1/seg-scene-mid-frame-000090",
      frame: 90,
      outputPath: "/workspace/out/visual-review-stills/review-1/seg-scene-mid-frame-000090.png",
      reason: "segment_midpoint",
      segmentId: "seg-scene",
      sizeInBytes: 4096,
      stillId: "seg-scene-mid-frame-000090",
    },
  ],
};

const merged = mergeVisualReviewStillAnalysisDiagnostics({
  diagnostics: baseDiagnostics,
  extraction,
});

assert.equal(merged.status, "static_preflight");
assert.equal(merged.findingCount, 2);
assert.equal(merged.errorCount, 1);
assert.equal(merged.warningCount, 1);
assert.equal(merged.reviewFrameCount, 2);
assert.deepEqual(merged.reviewFrames, baseDiagnostics.reviewFrames);

const stillFinding = merged.findings.find(
  (finding) => finding.stillId === "seg-scene-start-frame-000000",
);
assert.ok(stillFinding);
assert.equal(stillFinding.targetId, "seg-scene");
assert.equal(stillFinding.frame, 0);
assert.equal(stillFinding.reviewReason, "segment_start");
assert.equal(stillFinding.severity, "warning");
assert.match(stillFinding.message, /low contrast/);

assert.equal(
  merged.findings.some((finding) => finding.stillId === "seg-scene-mid-frame-000090"),
  false,
  "analyzed stills should not create review findings.",
);

console.log("Visual review diagnostics smoke passed.");
