import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import {
  getRenderArtifactAbsolutePath,
  getRenderArtifactOutputPath,
  isValidRenderId,
} from "../../../../lib/render-artifacts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ renderId: string }> },
) {
  const { renderId } = await params;

  if (!isValidRenderId(renderId)) {
    return NextResponse.json({ error: `Invalid renderId: ${renderId}` }, { status: 400 });
  }

  try {
    const absoluteOutputPath = getRenderArtifactAbsolutePath(renderId);
    const [buffer, outputStats] = await Promise.all([
      readFile(absoluteOutputPath),
      stat(absoluteOutputPath),
    ]);
    const fileName = path.basename(absoluteOutputPath);

    return new Response(new Uint8Array(buffer), {
      headers: {
        "cache-control": "no-store",
        "content-disposition": `attachment; filename="${fileName}"`,
        "content-length": String(outputStats.size),
        "content-type": "video/mp4",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: `Render output is not available yet. Expected file: ${getRenderArtifactOutputPath(renderId)}`,
      },
      { status: 404 },
    );
  }
}
