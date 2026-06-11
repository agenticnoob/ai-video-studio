import { NextResponse } from "next/server";

import { MinimaxConfigError } from "../../../../lib/minimax/provider";
import {
  generateStagedProjectFromBrief,
  generateStagedProjectFromPlan,
  generateStagedSegmentRevision,
} from "../../../../lib/staged-project-generation";
import {
  getStagedGenerationErrorStatus,
  stagedGenerateRequestSchema,
} from "../../../../lib/staged-generation-api";
import {
  StoryboardSegmentNotFoundError,
  TtsConfigError,
  TtsProviderError,
} from "../../../../lib/tts";

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

  try {
    if (parsedRequest.data.mode === "segment") {
      const result = await generateStagedSegmentRevision({
        project: parsedRequest.data.project,
        revisionPrompt: parsedRequest.data.revisionPrompt,
        segmentId: parsedRequest.data.segmentId,
        voiceId: parsedRequest.data.voiceId,
      });

      return NextResponse.json({
        plan: result.plan,
        project: result.project,
        diagnostics: {
          planner: {
            attempts: result.plannerAttempts,
            repaired: result.plannerRepaired,
          },
          compiler: [
            {
              attempts: result.compilerAttempts,
              repaired: result.repaired,
              segmentId: result.segment.id,
              templateId: result.segment.templateId,
            },
          ],
          narrationLayerCount: 1,
          segmentCount: 1,
        },
      });
    }

    const result =
      parsedRequest.data.mode === "brief"
        ? await generateStagedProjectFromBrief({
            brief: parsedRequest.data.brief,
            voiceId: parsedRequest.data.voiceId,
          })
        : await generateStagedProjectFromPlan({
            plan: parsedRequest.data.plan,
            voiceId: parsedRequest.data.voiceId,
          });

    return NextResponse.json({
      plan: result.plan,
      project: result.project,
      diagnostics: {
        planner:
          result.plannerAttempts === undefined || result.plannerRepaired === undefined
            ? undefined
            : {
                attempts: result.plannerAttempts,
                repaired: result.plannerRepaired,
              },
        compiler: result.segments.map((segment) => ({
          attempts: segment.compilerAttempts,
          repaired: segment.repaired,
          segmentId: segment.segment.id,
          templateId: segment.segment.templateId,
        })),
        narrationLayerCount: result.narrationLayers.length,
        segmentCount: result.segments.length,
      },
    });
  } catch (error) {
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
