import type { VideoProject, VideoSegment } from "../project-schema";
import { getSegmentTimelineWindows } from "../project-timeline";
import type { AssetRequirement } from "../storyboard-plan-schema";
import type {
  VisualReviewDiagnostics,
  VisualReviewFinding,
  VisualReviewFrame,
  VisualReviewStillExtraction,
} from "../visual-review-schema";
import { buildVisualReviewStillAnalysisFindings } from "../visual-review-still-findings";

type VisualReviewSummaryOptions = {
  findings: VisualReviewFinding[];
  reviewFrames: VisualReviewFrame[];
  reviewScope?: VisualReviewDiagnostics["reviewScope"];
  reviewStage?: VisualReviewDiagnostics["reviewStage"];
};

const getVisualReviewNextAction = ({
  findings,
  reviewStage,
}: {
  findings: VisualReviewFinding[];
  reviewStage: VisualReviewDiagnostics["reviewStage"];
}): VisualReviewDiagnostics["nextAction"] => {
  if (findings.length > 0) {
    return "manual_repair";
  }

  if (reviewStage === "static_preflight") {
    return "manual_review";
  }

  return "none";
};

export const summarizeVisualReviewFindings = ({
  findings,
  reviewFrames,
  reviewScope = "project",
  reviewStage = "static_preflight",
}: VisualReviewSummaryOptions): VisualReviewDiagnostics => {
  return {
    status: "static_preflight",
    errorCount: findings.filter((finding) => finding.severity === "error").length,
    findingCount: findings.length,
    findings,
    nextAction: getVisualReviewNextAction({ findings, reviewStage }),
    reviewFrameCount: reviewFrames.length,
    reviewFrames,
    reviewScope,
    reviewStage,
    warningCount: findings.filter((finding) => finding.severity === "warning").length,
  };
};

export const mergeVisualReviewStillAnalysisDiagnostics = ({
  diagnostics,
  extraction,
}: {
  diagnostics: VisualReviewDiagnostics;
  extraction: VisualReviewStillExtraction;
}): VisualReviewDiagnostics => {
  const stillAnalysisFindings = extraction.stills.flatMap((still) =>
    buildVisualReviewStillAnalysisFindings({
      analysis: still.analysis,
      frame: still.frame,
      reason: still.reason,
      segmentId: still.segmentId,
      stillId: still.stillId,
    }),
  );

  return summarizeVisualReviewFindings({
    findings: [...diagnostics.findings, ...stillAnalysisFindings],
    reviewFrames: diagnostics.reviewFrames,
    reviewScope: diagnostics.reviewScope,
    reviewStage: "still_analysis",
  });
};

const reviewSegmentTiming = (segment: VideoSegment): VisualReviewFinding[] => {
  const findings: VisualReviewFinding[] = [];
  const audioDuration = segment.narration?.audio?.durationInFrames;
  const captions = segment.narration?.captions?.cues ?? [];

  if (audioDuration !== undefined && audioDuration > segment.durationInFrames) {
    findings.push({
      severity: "error",
      targetId: segment.id,
      message: `Segment narration audio lasts ${audioDuration} frames, longer than the visual segment duration ${segment.durationInFrames}.`,
      suggestedRepair:
        "Regenerate or compile the segment with visual duration at least as long as narration audio.",
    });
  }

  for (const cue of captions) {
    const cueEndFrame = cue.startFrame + cue.durationInFrames;
    if (cueEndFrame > segment.durationInFrames) {
      findings.push({
        severity: "warning",
        frame: segment.durationInFrames,
        targetId: cue.id,
        message: `Caption cue ends at frame ${cueEndFrame}, beyond segment duration ${segment.durationInFrames}.`,
        suggestedRepair: "Clamp caption timing or extend the segment duration before rendering.",
      });
    }
    if (cue.text.length > 120) {
      findings.push({
        severity: "warning",
        frame: cue.startFrame,
        targetId: cue.id,
        message: "Caption cue is longer than 120 characters and may be hard to read.",
        suggestedRepair: "Split the caption cue into shorter readable chunks.",
      });
    }
  }

  return findings;
};

const buildRepresentativeReviewFrames = (project: VideoProject): VisualReviewFrame[] => {
  return getSegmentTimelineWindows(project).flatMap((window) => {
    const endFrame = window.startFrame + Math.max(0, window.durationInFrames - 1);
    const midpointFrame = window.startFrame + Math.floor(window.durationInFrames / 2);

    return [
      {
        frame: window.startFrame,
        reason: "segment_start",
        segmentId: window.segmentId,
      },
      {
        frame: midpointFrame,
        reason: "segment_midpoint",
        segmentId: window.segmentId,
      },
      {
        frame: endFrame,
        reason: "segment_end",
        segmentId: window.segmentId,
      },
    ];
  });
};

export const buildStaticVisualReviewDiagnostics = ({
  project,
  requiredAssets,
}: {
  project: VideoProject;
  requiredAssets?: AssetRequirement[];
}): VisualReviewDiagnostics => {
  const findings: VisualReviewFinding[] = project.segments.flatMap(reviewSegmentTiming);
  const reviewFrames = buildRepresentativeReviewFrames(project);

  for (const asset of requiredAssets ?? []) {
    findings.push({
      severity: "info",
      targetId: asset.id,
      message: `Planned asset "${asset.id}" (${asset.kind}) is not resolved in the current non-executable asset-plan phase.`,
      suggestedRepair: asset.fallback,
    });
  }

  return summarizeVisualReviewFindings({ findings, reviewFrames });
};
