import { NextResponse } from "next/server";
import { z } from "zod";

import { MinimaxConfigError } from "../../../../lib/minimax/provider";
import { TemplateImplementationParseError } from "../../../../lib/minimax/parse-template-implementation";
import {
  generateStagedProjectFromBrief,
  generateStagedProjectFromPlan,
  generateStagedSegmentRevision,
} from "../../../../lib/staged-project-generation";
import { storyboardPlanSchema } from "../../../../lib/storyboard-plan-schema";
import { videoProjectSchema } from "../../../../lib/project-schema";
import {
  StoryboardSegmentNotFoundError,
  TtsConfigError,
  TtsProviderError,
} from "../../../../lib/tts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stagedBriefRequestSchema = z.object({
  mode: z.literal("brief"),
  brief: z.string().trim().min(1, "Brief is required").max(4000, "Brief is too long"),
  voiceId: z.string().trim().min(1).max(160).optional(),
});

const stagedPlanRequestSchema = z.object({
  mode: z.literal("plan"),
  plan: storyboardPlanSchema,
  voiceId: z.string().trim().min(1).max(160).optional(),
});

const stagedSegmentRequestSchema = z.object({
  mode: z.literal("segment"),
  project: videoProjectSchema,
  segmentId: z.string().trim().min(1, "Segment id is required"),
  revisionPrompt: z
    .string()
    .trim()
    .min(1, "Revision prompt is required")
    .max(4000, "Revision prompt is too long"),
  voiceId: z.string().trim().min(1).max(160).optional(),
});

const stagedGenerateRequestSchema = z.discriminatedUnion("mode", [
  stagedBriefRequestSchema,
  stagedPlanRequestSchema,
  stagedSegmentRequestSchema,
]);

const UPSTREAM_ERROR_PATTERN =
  /MiniMax request failed|MiniMax returned a non-JSON response|MiniMax response was not valid JSON|truncated by max_tokens|had no tool_calls|unexpected function|tool_call arguments were empty|tool_call arguments were not valid JSON|Generated storyboard plan failed schema validation|MiniMax template implementation arguments were not valid JSON|Generated ".*" implementation failed schema validation|implementation duration .* is shorter than required narration duration/;

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
    const status =
      error instanceof TemplateImplementationParseError || UPSTREAM_ERROR_PATTERN.test(message)
        ? 502
        : 500;
    console.error("Staged project generation failed", { status, message });
    return NextResponse.json({ error: message }, { status });
  }
}
