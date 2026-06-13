import { readFile, stat } from "node:fs/promises";
import { NextResponse } from "next/server";
import {
  getLatestRenderAbsolutePath,
  getLatestRenderOutputPath,
} from "../../../../lib/render-artifacts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const absoluteOutputPath = getLatestRenderAbsolutePath();
    const [buffer, outputStats] = await Promise.all([
      readFile(absoluteOutputPath),
      stat(absoluteOutputPath),
    ]);

    return new Response(new Uint8Array(buffer), {
      headers: {
        "cache-control": "no-store",
        "content-disposition": 'attachment; filename="latest.mp4"',
        "content-length": String(outputStats.size),
        "content-type": "video/mp4",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: `Render output is not available yet. Expected file: ${getLatestRenderOutputPath()}`,
      },
      { status: 404 },
    );
  }
}
