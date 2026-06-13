import { NextResponse } from "next/server";
import { z } from "zod";
import { ConcurrencyBusyError, runWithConcurrencyLimit } from "../../../lib/concurrency-limits";
import { renderProjectVideo } from "../../../lib/render-project";
import { videoProjectSchema } from "../../../lib/project-schema";
import {
  finishTaskProgress,
  startTaskProgress,
  updateTaskProgressStep,
} from "../../../lib/task-progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const renderRequestSchema = z.object({
  progressId: z.string().trim().min(1).max(160).optional(),
  project: videoProjectSchema,
});

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsedRequest = renderRequestSchema.safeParse(body);

  if (!parsedRequest.success) {
    return NextResponse.json(
      { error: parsedRequest.error.issues[0]?.message ?? "Invalid render request." },
      { status: 400 },
    );
  }

  const progressId = parsedRequest.data.progressId;
  if (progressId) {
    startTaskProgress({
      id: progressId,
      steps: [
        { id: "prepare", label: "准备导出" },
        { id: "bundle", label: "整理资源" },
        { id: "composition", label: "读取项目" },
        { id: "render", label: "生成视频" },
        { id: "artifact", label: "保存文件" },
      ],
    });
  }

  try {
    const renderResult = await runWithConcurrencyLimit("render", () =>
      renderProjectVideo(parsedRequest.data.project, {
        onProgress: (stepId, status, detail) =>
          updateTaskProgressStep({ detail, id: progressId, status, stepId }),
      }),
    );

    finishTaskProgress({ id: progressId, status: "success" });

    return NextResponse.json({
      downloadUrl: renderResult.downloadUrl,
      outputPath: renderResult.outputPath,
      renderId: renderResult.renderId,
      sizeInBytes: renderResult.sizeInBytes,
    });
  } catch (error) {
    if (error instanceof ConcurrencyBusyError) {
      finishTaskProgress({ error: error.message, id: progressId, status: "failure" });
      return NextResponse.json({ error: error.message }, { status: 429 });
    }

    const message = error instanceof Error ? error.message : "Render failed.";

    console.error("Project render failed", error);
    finishTaskProgress({ error: message, id: progressId, status: "failure" });

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
