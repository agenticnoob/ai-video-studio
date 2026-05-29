import { NextResponse } from "next/server";
import { z } from "zod";
import {
  buildMockProjectFromBrief,
  reviseProjectSegmentFromPrompt,
} from "../../../lib/project-generation";
import { videoProjectSchema } from "../../../lib/project-schema";

const projectGenerateRequestSchema = z.object({
  mode: z.literal("project"),
  brief: z.string().trim().min(1, "Brief is required").max(4000, "Brief is too long"),
});

const segmentGenerateRequestSchema = z.object({
  mode: z.literal("segment"),
  project: videoProjectSchema,
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

  let generatedProject;

  try {
    generatedProject =
      parsedRequest.data.mode === "project"
        ? buildMockProjectFromBrief({ brief: parsedRequest.data.brief })
        : reviseProjectSegmentFromPrompt(
            parsedRequest.data.project,
            parsedRequest.data.segmentId,
            parsedRequest.data.revisionPrompt,
          );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Generation request could not be completed.",
      },
      { status: 400 },
    );
  }

  const project = videoProjectSchema.safeParse(generatedProject);

  if (!project.success) {
    return NextResponse.json(
      { error: "Generated project failed schema validation." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    project: project.data,
    spec: project.data.segments[0]?.implementation,
  });
}
