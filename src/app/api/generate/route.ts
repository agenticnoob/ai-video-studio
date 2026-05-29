import { NextResponse } from "next/server";
import { z } from "zod";
import { buildMockProjectFromBrief } from "../../../lib/project-generation";
import { videoProjectSchema } from "../../../lib/project-schema";

const generateRequestSchema = z.object({
  brief: z.string().trim().min(1, "Brief is required").max(4000, "Brief is too long"),
});

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

  const project = videoProjectSchema.safeParse(buildMockProjectFromBrief(parsedRequest.data));

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

