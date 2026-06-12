import { NextResponse } from "next/server";

import { ConcurrencyBusyError, runWithConcurrencyLimit } from "../../../../lib/concurrency-limits";
import { MinimaxConfigError } from "../../../../lib/minimax/provider";
import {
  buildStagedProjectDiagnostics,
  buildStagedSegmentRevisionDiagnostics,
  generateStagedProjectFromBrief,
  generateStagedProjectFromPlan,
  generateStagedSegmentRevision,
} from "../../../../lib/staged-generation";
import {
  getStagedGenerationErrorStatus,
  stagedGenerateRequestSchema,
} from "../../../../lib/staged-generation-api";
import {
  StoryboardSegmentNotFoundError,
  TtsConfigError,
  TtsProviderError,
} from "../../../../lib/tts";
import {
  finishTaskProgress,
  startTaskProgress,
  updateTaskProgressStep,
} from "../../../../lib/task-progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsedRequest = stagedGenerateRequestSchema.safeParse(body);

  if (!parsedRequest.success) {
    return NextResponse.json(
      { error: parsedRequest.error.issues[0]?.message ?? "Invalid staged generation request." },
      { status: 400 },
    );
  }

  const progressId = parsedRequest.data.progressId;
  if (progressId) {
    startTaskProgress({
      id: progressId,
      steps: [
        { id: "planner", label: "分析内容" },
        { id: "narration", label: "生成素材" },
        { id: "compiler", label: "生成画面" },
        { id: "assembly", label: "整理结果" },
      ],
    });
  }

  const onProgress = (
    stepId: "planner" | "narration" | "compiler" | "assembly",
    status: "running" | "success" | "failure",
    detail?: string,
  ) => {
    updateTaskProgressStep({ detail, id: progressId, status, stepId });
  };

  try {
    const responseBody = await runWithConcurrencyLimit("generation", async () => {
      if (parsedRequest.data.mode === "segment") {
        const result = await generateStagedSegmentRevision({
          onProgress,
          project: parsedRequest.data.project,
          provider: parsedRequest.data.provider,
          revisionPrompt: parsedRequest.data.revisionPrompt,
          segmentId: parsedRequest.data.segmentId,
          voiceId: parsedRequest.data.voiceId,
          voiceClone: parsedRequest.data.voiceClone,
        });

        return {
          plan: result.plan,
          project: result.project,
          diagnostics: buildStagedSegmentRevisionDiagnostics(result),
        };
      }

      const result =
        parsedRequest.data.mode === "brief"
          ? await generateStagedProjectFromBrief({
              brief: parsedRequest.data.brief,
              onProgress,
              provider: parsedRequest.data.provider,
              voiceId: parsedRequest.data.voiceId,
              voiceClone: parsedRequest.data.voiceClone,
            })
          : await generateStagedProjectFromPlan({
              onProgress,
              plan: parsedRequest.data.plan,
              provider: parsedRequest.data.provider,
              voiceId: parsedRequest.data.voiceId,
              voiceClone: parsedRequest.data.voiceClone,
            });

      return {
        plan: result.plan,
        project: result.project,
        diagnostics: buildStagedProjectDiagnostics(result),
      };
    });

    finishTaskProgress({ id: progressId, status: "success" });
    return NextResponse.json(responseBody);
  } catch (error) {
    finishTaskProgress({
      error: error instanceof Error ? error.message : "Staged generation request failed.",
      id: progressId,
      status: "failure",
    });

    if (error instanceof ConcurrencyBusyError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    if (error instanceof StoryboardSegmentNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof MinimaxConfigError || error instanceof TtsConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (error instanceof TtsProviderError) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    const message =
      error instanceof Error ? error.message : "Staged generation request could not be completed.";
    const status = getStagedGenerationErrorStatus(error);
    console.error("Staged project generation failed", { status, message });
    return NextResponse.json({ error: message }, { status });
  }
}
