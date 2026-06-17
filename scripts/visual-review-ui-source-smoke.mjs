/* global console, process, URL */

import { readFile } from "node:fs/promises";

const readSource = async (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const assertIncludes = (source, needle, label) => {
  if (!source.includes(needle)) {
    throw new Error(`${label} expected to include ${needle}`);
  }
};

const main = async () => {
  const [
    pageSource,
    hookSource,
    panelSource,
    schemaSource,
    stillAnalysisSource,
    renderProjectSource,
    routeSource,
    packageSource,
  ] = await Promise.all([
    readSource("src/app/page.tsx"),
    readSource("src/helpers/use-visual-review.ts"),
    readSource("src/components/project/VisualReviewPanel.tsx"),
    readSource("src/lib/visual-review-schema.ts"),
    readSource("src/lib/visual-review-still-analysis.ts"),
    readSource("src/lib/render-project.ts"),
    readSource("src/app/api/visual-review/stills/route.ts"),
    readSource("package.json"),
  ]);

  assertIncludes(pageSource, "VisualReviewPanel", "Studio page");
  assertIncludes(pageSource, "useVisualReview", "Studio page");
  assertIncludes(hookSource, 'fetch("/api/visual-review/stills"', "Visual review hook");
  assertIncludes(hookSource, "createProgressId", "Visual review hook");
  assertIncludes(panelSource, "视觉复核", "Visual review panel");
  assertIncludes(panelSource, "ActivityProgress", "Visual review panel");
  assertIncludes(panelSource, "downloadUrl", "Visual review panel");
  assertIncludes(panelSource, "still.analysis.blankFrameScore", "Visual review panel");
  assertIncludes(panelSource, "still.analysis.contrastScore", "Visual review panel");
  assertIncludes(panelSource, "still.analysis.edgeContentRatio", "Visual review panel");
  assertIncludes(panelSource, "still.analysis.fineDetailRatio", "Visual review panel");
  assertIncludes(panelSource, "still.analysis.borderBandRatio", "Visual review panel");
  assertIncludes(panelSource, "near_blank_frame", "Visual review panel");
  assertIncludes(panelSource, "low_contrast_frame", "Visual review panel");
  assertIncludes(panelSource, "unsafe_margin_frame", "Visual review panel");
  assertIncludes(panelSource, "fine_detail_frame", "Visual review panel");
  assertIncludes(panelSource, "letterbox_frame", "Visual review panel");
  assertIncludes(panelSource, 'from "next/image"', "Visual review panel");
  assertIncludes(panelSource, "Image", "Visual review panel");
  assertIncludes(schemaSource, "visualReviewStillAnalysisSchema", "Visual review schema");
  assertIncludes(schemaSource, "contrastScore", "Visual review schema");
  assertIncludes(schemaSource, "edgeContentRatio", "Visual review schema");
  assertIncludes(schemaSource, "fineDetailRatio", "Visual review schema");
  assertIncludes(schemaSource, "borderBandRatio", "Visual review schema");
  assertIncludes(stillAnalysisSource, "LOW_CONTRAST_LUMA_RANGE", "Visual review still analysis");
  assertIncludes(stillAnalysisSource, "UNSAFE_MARGIN_EDGE_RATIO", "Visual review still analysis");
  assertIncludes(stillAnalysisSource, "FINE_DETAIL_RATIO", "Visual review still analysis");
  assertIncludes(stillAnalysisSource, "LETTERBOX_BAND_RATIO", "Visual review still analysis");
  assertIncludes(stillAnalysisSource, "low_contrast_frame", "Visual review still analysis");
  assertIncludes(stillAnalysisSource, "unsafe_margin_frame", "Visual review still analysis");
  assertIncludes(stillAnalysisSource, "fine_detail_frame", "Visual review still analysis");
  assertIncludes(stillAnalysisSource, "letterbox_frame", "Visual review still analysis");
  assertIncludes(
    stillAnalysisSource,
    "Representative still appears low contrast",
    "Visual review still analysis",
  );
  assertIncludes(
    stillAnalysisSource,
    "Representative still has content too close to the frame edge",
    "Visual review still analysis",
  );
  assertIncludes(
    stillAnalysisSource,
    "Representative still may contain overly fine detail",
    "Visual review still analysis",
  );
  assertIncludes(
    stillAnalysisSource,
    "Representative still appears letterboxed or pillarboxed",
    "Visual review still analysis",
  );
  assertIncludes(renderProjectSource, "analyzeVisualReviewStill", "Visual review still renderer");
  assertIncludes(routeSource, "mergeStillAnalysisFindings", "Visual review still route");
  assertIncludes(packageSource, "smoke:visual-review-stills", "package scripts");
  assertIncludes(packageSource, "smoke:visual-review-ui", "package scripts");

  console.log("Visual review UI source smoke passed.");
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
