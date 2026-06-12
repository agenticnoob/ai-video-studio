import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import {
  getTtsArtifactAbsolutePath,
  getTtsArtifactOutputPath,
  getTtsAssetContentType,
  isValidTtsAssetPath,
} from "../../../../../lib/tts/artifacts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ByteRange =
  | {
      end: number;
      start: number;
    }
  | "unsatisfiable";

const parseByteRange = (rangeHeader: string | null, fileSize: number): ByteRange | null => {
  if (!rangeHeader?.startsWith("bytes=")) {
    return null;
  }

  const [firstRange] = rangeHeader.slice("bytes=".length).split(",");
  const [rawStart, rawEnd] = firstRange.split("-");

  if (rawStart === "" && rawEnd === "") {
    return "unsatisfiable";
  }

  if (rawStart === "") {
    const suffixLength = Number(rawEnd);
    if (!Number.isInteger(suffixLength) || suffixLength <= 0) {
      return "unsatisfiable";
    }

    return {
      start: Math.max(fileSize - suffixLength, 0),
      end: fileSize - 1,
    };
  }

  const start = Number(rawStart);
  const requestedEnd = rawEnd === "" ? fileSize - 1 : Number(rawEnd);

  if (
    !Number.isInteger(start) ||
    !Number.isInteger(requestedEnd) ||
    start < 0 ||
    requestedEnd < start ||
    start >= fileSize
  ) {
    return "unsatisfiable";
  }

  return {
    start,
    end: Math.min(requestedEnd, fileSize - 1),
  };
};

const createTtsAssetHeaders = ({
  assetPath,
  contentLength,
  fileName,
}: {
  assetPath: string;
  contentLength: number;
  fileName: string;
}): HeadersInit => {
  return {
    "accept-ranges": "bytes",
    "access-control-allow-origin": "*",
    "access-control-expose-headers": "Accept-Ranges, Content-Length, Content-Range",
    "cache-control": "public, max-age=31536000, immutable",
    "content-disposition": `inline; filename="${fileName}"`,
    "content-length": String(contentLength),
    "content-type": getTtsAssetContentType(assetPath),
  };
};

const createFileResponseBody = (
  absoluteOutputPath: string,
  range?: { end: number; start: number },
): ReadableStream<Uint8Array> => {
  const stream = createReadStream(
    absoluteOutputPath,
    range
      ? {
          end: range.end,
          start: range.start,
        }
      : undefined,
  );

  return Readable.toWeb(stream) as ReadableStream<Uint8Array>;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ assetPath: string[] }> },
) {
  const { assetPath: assetPathParts } = await params;
  const assetPath = assetPathParts.join("/");

  if (!isValidTtsAssetPath(assetPath)) {
    return NextResponse.json({ error: `Invalid TTS asset path: ${assetPath}` }, { status: 400 });
  }

  try {
    const absoluteOutputPath = getTtsArtifactAbsolutePath(assetPath);
    const outputStats = await stat(absoluteOutputPath);
    const fileName = path.basename(absoluteOutputPath);
    const byteRange = parseByteRange(request.headers.get("range"), outputStats.size);

    if (byteRange === "unsatisfiable") {
      return new Response(null, {
        status: 416,
        headers: {
          "accept-ranges": "bytes",
          "content-range": `bytes */${outputStats.size}`,
        },
      });
    }

    if (byteRange) {
      return new Response(createFileResponseBody(absoluteOutputPath, byteRange), {
        status: 206,
        headers: {
          ...createTtsAssetHeaders({
            assetPath,
            contentLength: byteRange.end - byteRange.start + 1,
            fileName,
          }),
          "content-range": `bytes ${byteRange.start}-${byteRange.end}/${outputStats.size}`,
        },
      });
    }

    return new Response(createFileResponseBody(absoluteOutputPath), {
      headers: {
        ...createTtsAssetHeaders({
          assetPath,
          contentLength: outputStats.size,
          fileName,
        }),
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
