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
    segmentEditorSource,
    generationActionsSource,
    schemaSource,
    visualRepairSource,
    stillAnalysisSource,
    renderProjectSource,
    routeSource,
    packageSource,
  ] = await Promise.all([
    readSource("src/app/page.tsx"),
    readSource("src/helpers/use-visual-review.ts"),
    readSource("src/components/project/VisualReviewPanel.tsx"),
    readSource("src/components/project/SegmentEditor.tsx"),
    readSource("src/helpers/project-generation/use-generation-actions.ts"),
    readSource("src/lib/visual-review-schema.ts"),
    readSource("src/lib/deterministic-visual-repair.ts"),
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
  assertIncludes(panelSource, "reviewReasonLabelMap[finding.reviewReason]", "Visual review panel");
  assertIncludes(panelSource, "finding.stillId", "Visual review panel");
  assertIncludes(panelSource, "sourceStillUrlById", "Visual review panel");
  assertIncludes(panelSource, "sourceStillUrl", "Visual review panel");
  assertIncludes(panelSource, "打开截图", "Visual review panel");
  assertIncludes(panelSource, "onApplyRepairPrompt", "Visual review panel");
  assertIncludes(panelSource, "buildRepairPrompt", "Visual review panel");
  assertIncludes(panelSource, "套用修复指令", "Visual review panel");
  assertIncludes(panelSource, "Visual review finding", "Visual review panel");
  assertIncludes(panelSource, "suggestedRepair", "Visual review panel");
  assertIncludes(panelSource, "onRegenerateSegmentFromFinding", "Visual review panel");
  assertIncludes(panelSource, "立即修复分镜", "Visual review panel");
  assertIncludes(panelSource, "VisualReviewRepairOutcome", "Visual review repair action");
  assertIncludes(panelSource, "repairResult", "Visual review repair action");
  assertIncludes(panelSource, "修复中", "Visual review repair action");
  assertIncludes(panelSource, "分镜修复已完成", "Visual review repair action");
  assertIncludes(panelSource, "分镜修复失败", "Visual review repair action");
  assertIncludes(pageSource, "regenerateSelectedSegmentFromVisualReview", "Studio page");
  assertIncludes(
    pageSource,
    "const repairResult = await generation.regenerateSelectedSegment",
    "Studio page",
  );
  assertIncludes(pageSource, "if (!repairResult.ok)", "Studio page");
  assertIncludes(pageSource, "throw new Error(repairResult.error)", "Studio page");
  assertIncludes(pageSource, "applyDeterministicVisualRepair", "Studio page");
  assertIncludes(pageSource, "generation.updateSegment", "Studio page");
  assertIncludes(panelSource, "确定性修复已应用", "Visual review repair action");
  assertIncludes(panelSource, "已回退到分镜重生成", "Visual review repair action");
  assertIncludes(generationActionsSource, "GenerationActionResult", "Generation actions");
  assertIncludes(generationActionsSource, "return { ok: false, error:", "Generation actions");
  assertIncludes(generationActionsSource, "return { ok: true }", "Generation actions");
  assertIncludes(visualRepairSource, "getDeterministicVisualRepairPlan", "Visual repair");
  assertIncludes(visualRepairSource, "boost_contrast", "Visual repair");
  assertIncludes(visualRepairSource, "apply_safe_layout", "Visual repair");
  assertIncludes(visualRepairSource, "reduce_detail_density", "Visual repair");
  assertIncludes(pageSource, "focusSegmentRevisionPrompt", "Studio page");
  assertIncludes(pageSource, "segmentEditorSectionRef", "Studio page");
  assertIncludes(pageSource, "requestAnimationFrame", "Studio page");
  assertIncludes(panelSource, "套用后会跳到分镜编辑器", "Visual review panel");
  assertIncludes(segmentEditorSource, "revisionPromptTextAreaRef", "Segment editor");
  assertIncludes(segmentEditorSource, "focusRevisionPromptSignal", "Segment editor");
  assertIncludes(segmentEditorSource, "自然语言修改指令", "Segment editor");
  assertIncludes(pageSource, "applyVisualReviewRepairPrompt", "Studio page");
  assertIncludes(pageSource, "setRevisionPrompt", "Studio page");
  assertIncludes(pageSource, "selectSegment", "Studio page");
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
  assertIncludes(schemaSource, "reviewReason", "Visual review schema");
  assertIncludes(schemaSource, "stillId", "Visual review schema");
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
  assertIncludes(routeSource, "reason: still.reason", "Visual review still route");
  assertIncludes(routeSource, "stillId: still.stillId", "Visual review still route");
  assertIncludes(packageSource, "smoke:visual-review-stills", "package scripts");
  assertIncludes(packageSource, "smoke:visual-review-ui", "package scripts");
  assertIncludes(packageSource, "smoke:visual-repair", "package scripts");

  console.log("Visual review UI source smoke passed.");
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
