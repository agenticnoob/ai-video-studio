import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";

import {
  getVisualReviewStillOutputPath,
  isValidVisualReviewExtractionId,
  isValidVisualReviewStillId,
} from "../../../../../../lib/visual-review-still-artifacts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createFileResponseBody = (absoluteOutputPath: string): ReadableStream<Uint8Array> => {
  return Readable.toWeb(createReadStream(absoluteOutputPath)) as ReadableStream<Uint8Array>;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ extractionId: string; stillId: string }> },
) {
  const { extractionId, stillId } = await params;

  if (!isValidVisualReviewExtractionId(extractionId)) {
    return NextResponse.json(
      { error: `Invalid visual review extractionId: ${extractionId}` },
      { status: 400 },
    );
  }
  if (!isValidVisualReviewStillId(stillId)) {
    return NextResponse.json(
      { error: `Invalid visual review stillId: ${stillId}` },
      { status: 400 },
    );
  }

  try {
    const absoluteOutputPath = getVisualReviewStillOutputPath({ extractionId, stillId });
    const outputStats = await stat(absoluteOutputPath);
    const fileName = path.basename(absoluteOutputPath);

    return new Response(createFileResponseBody(absoluteOutputPath), {
      headers: {
        "cache-control": "no-store",
        "content-disposition": `inline; filename="${fileName}"`,
        "content-length": String(outputStats.size),
        "content-type": "image/png",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: `Visual review still is not available yet. Expected still: ${getVisualReviewStillOutputPath(
          { extractionId, stillId },
        )}`,
      },
      { status: 404 },
    );
  }
}
