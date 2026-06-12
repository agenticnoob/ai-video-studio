import { NextResponse } from "next/server";
import { z } from "zod";
import { ConcurrencyBusyError, runWithConcurrencyLimit } from "../../../lib/concurrency-limits";
import { videoProjectSchema } from "../../../lib/project-schema";
import { MinimaxConfigError } from "../../../lib/minimax/provider";
import { minimaxGenerateProject, minimaxReviseSegment } from "../../../lib/minimax";
import {
  finishTaskProgress,
  startTaskProgress,
  updateTaskProgressStep,
} from "../../../lib/task-progress";

const projectGenerateRequestSchema = z.object({
  mode: z.literal("project"),
  brief: z.string().trim().min(1, "Brief is required").max(4000, "Brief is too long"),
  progressId: z.string().trim().min(1).max(160).optional(),
});

const segmentGenerateRequestSchema = z.object({
  mode: z.literal("segment"),
  project: videoProjectSchema,
  progressId: z.string().trim().min(1).max(160).optional(),
  segmentId: z.string().trim().min(1, "Segment id is required"),
  revisionPrompt: z
    .string()
    .trim()
    .min(1, "Revision prompt is required")
    .max(4000, "Revision prompt is too long"),
});

const generateRequestSchema = z.discriminatedUnion("mode", [
  projectGenerateRequestSchema,
  segmentGenerateRequestSchema,
]);

// Match design doc §2.2: classify provider errors so route can pick 500 vs 502.
// 502 = upstream/network/parse problems, 500 = config or contract issues.
// Tool-calling failure modes (truncation / wrong tool / no tool calls) are
// 502 — they are upstream/contract issues, never configuration.
const UPSTREAM_ERROR_PATTERN =
  /MiniMax request failed|MiniMax returned a non-JSON response|did not include any message content|MiniMax response was not valid JSON|truncated by max_tokens|had no tool_calls|unexpected function|tool_call arguments were empty|tool_call arguments were not valid JSON/;

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsedRequest = generateRequestSchema.safeParse(body);

  if (!parsedRequest.success) {
    return NextResponse.json(
      { error: parsedRequest.error.issues[0]?.message ?? "Invalid generation request." },
      { status: 400 },
    );
  }

  try {
    const progressId = parsedRequest.data.progressId;
    if (progressId) {
      startTaskProgress({
        id: progressId,
        steps: [
          {
            id: "generate",
            label: parsedRequest.data.mode === "project" ? "生成项目" : "重生成分段",
          },
        ],
      });
      updateTaskProgressStep({
        id: progressId,
        status: "running",
        stepId: "generate",
      });
    }

    const result = await runWithConcurrencyLimit("generation", () =>
      parsedRequest.data.mode === "project"
        ? minimaxGenerateProject({ brief: parsedRequest.data.brief })
        : minimaxReviseSegment({
            project: parsedRequest.data.project,
            segmentId: parsedRequest.data.segmentId,
            revisionPrompt: parsedRequest.data.revisionPrompt,
          }),
    );

    updateTaskProgressStep({
      id: progressId,
      status: "success",
      stepId: "generate",
    });
    finishTaskProgress({ id: progressId, status: "success" });

    return NextResponse.json({
      project: result.project,
    });
  } catch (error) {
    const progressId = parsedRequest.data.progressId;
    updateTaskProgressStep({
      detail: error instanceof Error ? error.message : undefined,
      id: progressId,
      status: "failure",
      stepId: "generate",
    });
    finishTaskProgress({
      error: error instanceof Error ? error.message : "Generation request failed.",
      id: progressId,
      status: "failure",
    });

    if (error instanceof ConcurrencyBusyError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    if (error instanceof MinimaxConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const message =
      error instanceof Error ? error.message : "Generation request could not be completed.";
    const status = UPSTREAM_ERROR_PATTERN.test(message) ? 502 : 500;
    console.error("Project generation failed", { status, message });
    return NextResponse.json({ error: message }, { status });
  }
}
