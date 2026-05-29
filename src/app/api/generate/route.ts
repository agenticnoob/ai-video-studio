import { NextResponse } from "next/server";
import { z } from "zod";
import { buildMockSpecFromBrief } from "../../../lib/mock-spec";
import { videoSpecSchema } from "../../../lib/video-schema";

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

  const spec = videoSpecSchema.safeParse(buildMockSpecFromBrief(parsedRequest.data));

  if (!spec.success) {
    return NextResponse.json({ error: "Generated spec failed schema validation." }, { status: 500 });
  }

  return NextResponse.json({ spec: spec.data });
}
