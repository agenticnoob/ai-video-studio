import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { ConcurrencyBusyError, runWithConcurrencyLimit } from "../../../../lib/concurrency-limits";
import { videoProjectSchema } from "../../../../lib/project-schema";
import { renderVisualReviewStills } from "../../../../lib/render-project";
import {
  buildStaticVisualReviewDiagnostics,
  summarizeVisualReviewFindings,
} from "../../../../lib/staged-generation/visual-review";
import {
  finishTaskProgress,
  startTaskProgress,
  updateTaskProgressStep,
} from "../../../../lib/task-progress";
import { buildVisualReviewStillAnalysisFindings } from "../../../../lib/visual-review-still-analysis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const visualReviewStillRequestSchema = z.object({
  progressId: z.string().trim().min(1).max(160).optional(),
  project: videoProjectSchema,
});

const createExtractionId = (): string => {
  const timestamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
  return `review-${timestamp}-${randomUUID().slice(0, 8)}`.toLowerCase();
};

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsedRequest = visualReviewStillRequestSchema.safeParse(body);

  if (!parsedRequest.success) {
    return NextResponse.json(
      { error: parsedRequest.error.issues[0]?.message ?? "Invalid visual review still request." },
      { status: 400 },
    );
  }

  const progressId = parsedRequest.data.progressId;
  if (progressId) {
    startTaskProgress({
      id: progressId,
      steps: [
        { id: "prepare", label: "准备复核" },
        { id: "bundle", label: "整理画面" },
        { id: "composition", label: "读取项目" },
        { id: "render", label: "截取画面" },
        { id: "artifact", label: "保存截图" },
      ],
    });
  }

  try {
    const diagnostics = buildStaticVisualReviewDiagnostics({
      project: parsedRequest.data.project,
    });
    const extraction = await runWithConcurrencyLimit("render", () =>
      renderVisualReviewStills({
        extractionId: createExtractionId(),
        onProgress: (stepId, status, detail) =>
          updateTaskProgressStep({ detail, id: progressId, status, stepId }),
        project: parsedRequest.data.project,
        reviewFrames: diagnostics.reviewFrames,
      }),
    );
    const stillAnalysisFindings = mergeStillAnalysisFindings(extraction.stills);
    const visualReview = summarizeVisualReviewFindings({
      findings: [...diagnostics.findings, ...stillAnalysisFindings],
      reviewFrames: diagnostics.reviewFrames,
    });

    finishTaskProgress({ id: progressId, status: "success" });

    return NextResponse.json({
      extraction,
      visualReview: {
        ...visualReview,
        stillExtraction: extraction,
      },
    });
  } catch (error) {
    if (error instanceof ConcurrencyBusyError) {
      finishTaskProgress({ error: error.message, id: progressId, status: "failure" });
      return NextResponse.json({ error: error.message }, { status: 429 });
    }

    const message =
      error instanceof Error ? error.message : "Visual review still extraction failed.";

    console.error("Visual review still extraction failed", error);
    finishTaskProgress({ error: message, id: progressId, status: "failure" });

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

const mergeStillAnalysisFindings = (
  stills: Awaited<ReturnType<typeof renderVisualReviewStills>>["stills"],
) =>
  stills.flatMap((still) =>
    buildVisualReviewStillAnalysisFindings({
      analysis: still.analysis,
      frame: still.frame,
      segmentId: still.segmentId,
    }),
  );
