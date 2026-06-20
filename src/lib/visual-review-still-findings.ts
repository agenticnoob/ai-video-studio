import type {
  VisualReviewFinding,
  VisualReviewFrame,
  VisualReviewStillAnalysis,
} from "./visual-review-schema";

export const buildVisualReviewStillAnalysisFindings = ({
  analysis,
  frame,
  reason,
  segmentId,
  stillId,
}: {
  analysis: VisualReviewStillAnalysis;
  frame: number;
  reason: VisualReviewFrame["reason"];
  segmentId: string;
  stillId: string;
}): VisualReviewFinding[] => {
  const sourceAttribution = {
    frame,
    reviewReason: reason,
    stillId,
    targetId: segmentId,
  } as const;

  if (analysis.status === "near_blank_frame") {
    return [
      {
        ...sourceAttribution,
        message: `Representative still appears near blank: dominant color ratio ${analysis.dominantColorRatio}, luma range ${analysis.lumaRange}.`,
        severity: "warning",
        suggestedRepair:
          "Inspect this frame and regenerate the target segment if the blank frame is unintended.",
      },
    ];
  }

  if (analysis.status === "low_contrast_frame") {
    return [
      {
        ...sourceAttribution,
        message: `Representative still appears low contrast: contrast score ${analysis.contrastScore}, luma range ${analysis.lumaRange}.`,
        severity: "warning",
        suggestedRepair:
          "Inspect this frame and regenerate the target segment if foreground content is hard to read.",
      },
    ];
  }

  if (analysis.status === "fine_detail_frame") {
    return [
      {
        ...sourceAttribution,
        message: `Representative still may contain overly fine detail: fine detail ratio ${analysis.fineDetailRatio}.`,
        severity: "warning",
        suggestedRepair:
          "Inspect this frame and regenerate the target segment if text or dense details are too small to read.",
      },
    ];
  }

  if (analysis.status === "letterbox_frame") {
    return [
      {
        ...sourceAttribution,
        message: `Representative still appears letterboxed or pillarboxed: border band ratio ${analysis.borderBandRatio}.`,
        severity: "warning",
        suggestedRepair:
          "Inspect this frame and regenerate the target segment if empty border bands are unintended.",
      },
    ];
  }

  if (analysis.status !== "unsafe_margin_frame") {
    return [];
  }

  return [
    {
      ...sourceAttribution,
      message: `Representative still has content too close to the frame edge: edge content ratio ${analysis.edgeContentRatio}.`,
      severity: "warning",
      suggestedRepair:
        "Inspect this frame and regenerate the target segment if important content sits outside the safe area.",
    },
  ];
};
