import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import {
  getTtsArtifactAbsolutePath,
  getTtsArtifactOutputPath,
  getTtsAssetContentType,
  isValidTtsAssetPath,
} from "../../../../../lib/tts/artifacts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ assetPath: string[] }> },
) {
  const { assetPath: assetPathParts } = await params;
  const assetPath = assetPathParts.join("/");

  if (!isValidTtsAssetPath(assetPath)) {
    return NextResponse.json({ error: `Invalid TTS asset path: ${assetPath}` }, { status: 400 });
  }

  try {
    const absoluteOutputPath = getTtsArtifactAbsolutePath(assetPath);
    const [buffer, outputStats] = await Promise.all([
      readFile(absoluteOutputPath),
      stat(absoluteOutputPath),
    ]);
    const fileName = path.basename(absoluteOutputPath);

    return new Response(new Uint8Array(buffer), {
      headers: {
        "cache-control": "no-store",
        "content-disposition": `inline; filename="${fileName}"`,
        "content-length": String(outputStats.size),
        "content-type": getTtsAssetContentType(assetPath),
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: `TTS output is not available yet. Expected file: ${getTtsArtifactOutputPath(
          assetPath,
        )}`,
      },
      { status: 404 },
    );
  }
}
