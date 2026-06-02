import { NextResponse } from "next/server";
import { z } from "zod";
import { renderProjectVideo } from "../../../lib/render-project";
import { videoProjectSchema } from "../../../lib/project-schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const renderRequestSchema = z.object({
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

  try {
    const renderResult = await renderProjectVideo(parsedRequest.data.project);

    return NextResponse.json({
      downloadUrl: renderResult.downloadUrl,
      latestDownloadUrl: renderResult.latestDownloadUrl,
      latestOutputPath: renderResult.latestOutputPath,
      outputPath: renderResult.outputPath,
      renderId: renderResult.renderId,
      sizeInBytes: renderResult.sizeInBytes,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Render failed.";

    console.error("Project render failed", error);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
