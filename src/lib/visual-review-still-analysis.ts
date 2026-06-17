import { inflateSync } from "node:zlib";
import { readFile } from "node:fs/promises";

import type { VisualReviewFinding, VisualReviewStillAnalysis } from "./visual-review-schema";

type PngMetadata = {
  bitDepth: number;
  colorType: number;
  height: number;
  width: number;
};

type PixelSample = {
  a: number;
  b: number;
  g: number;
  r: number;
};
type ByteArray = Uint8Array<ArrayBufferLike>;

const PNG_SIGNATURE_BYTES = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] as const;
const COLOR_CHANNELS_BY_TYPE = new Map<number, number>([
  [0, 1],
  [2, 3],
  [4, 2],
  [6, 4],
]);
const NEAR_BLANK_DOMINANT_COLOR_RATIO = 0.985;
const NEAR_BLANK_LUMA_RANGE = 8;
const LOW_CONTRAST_LUMA_RANGE = 36;

const createUnsupportedAnalysis = (): VisualReviewStillAnalysis => ({
  blankFrameScore: 0,
  contrastScore: 0,
  dominantColorRatio: 0,
  lumaRange: 0,
  pixelCount: 0,
  status: "unsupported",
});

const paethPredictor = (left: number, up: number, upLeft: number): number => {
  const estimate = left + up - upLeft;
  const leftDistance = Math.abs(estimate - left);
  const upDistance = Math.abs(estimate - up);
  const upLeftDistance = Math.abs(estimate - upLeft);

  if (leftDistance <= upDistance && leftDistance <= upLeftDistance) {
    return left;
  }
  if (upDistance <= upLeftDistance) {
    return up;
  }
  return upLeft;
};

const unfilterScanline = ({
  bytesPerPixel,
  filterType,
  previous,
  scanline,
}: {
  bytesPerPixel: number;
  filterType: number;
  previous: ByteArray;
  scanline: ByteArray;
}): ByteArray => {
  const output = new Uint8Array(scanline.length);

  for (let index = 0; index < scanline.length; index += 1) {
    const left = index >= bytesPerPixel ? output[index - bytesPerPixel] ?? 0 : 0;
    const up = previous[index] ?? 0;
    const upLeft = index >= bytesPerPixel ? (previous[index - bytesPerPixel] ?? 0) : 0;
    const raw = scanline[index] ?? 0;

    if (filterType === 0) {
      output[index] = raw;
    } else if (filterType === 1) {
      output[index] = (raw + left) & 0xff;
    } else if (filterType === 2) {
      output[index] = (raw + up) & 0xff;
    } else if (filterType === 3) {
      output[index] = (raw + Math.floor((left + up) / 2)) & 0xff;
    } else if (filterType === 4) {
      output[index] = (raw + paethPredictor(left, up, upLeft)) & 0xff;
    } else {
      throw new Error(`Unsupported PNG filter type: ${filterType}`);
    }
  }

  return output;
};

const hasPngSignature = (buffer: Buffer): boolean => {
  if (buffer.length < PNG_SIGNATURE_BYTES.length) {
    return false;
  }

  return PNG_SIGNATURE_BYTES.every((byte, index) => buffer[index] === byte);
};

const parsePng = (buffer: Buffer): { imageData: ByteArray; metadata: PngMetadata } | undefined => {
  if (!hasPngSignature(buffer)) {
    return undefined;
  }

  let metadata: PngMetadata | undefined;
  const dataChunks: Uint8Array[] = [];
  let dataLength = 0;
  let offset = 8;

  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;

    if (dataEnd + 4 > buffer.length) {
      return undefined;
    }

    if (type === "IHDR") {
      metadata = {
        bitDepth: buffer[dataStart + 8] ?? 0,
        colorType: buffer[dataStart + 9] ?? 0,
        height: buffer.readUInt32BE(dataStart + 4),
        width: buffer.readUInt32BE(dataStart),
      };
    } else if (type === "IDAT") {
      const chunk = new Uint8Array(buffer.subarray(dataStart, dataEnd));
      dataChunks.push(chunk);
      dataLength += chunk.byteLength;
    } else if (type === "IEND") {
      break;
    }

    offset = dataEnd + 4;
  }

  if (!metadata || dataChunks.length === 0) {
    return undefined;
  }

  const imageData = new Uint8Array(dataLength);
  let imageDataOffset = 0;
  for (const chunk of dataChunks) {
    imageData.set(chunk, imageDataOffset);
    imageDataOffset += chunk.byteLength;
  }

  return { imageData, metadata };
};

const samplePixel = ({
  bytesPerPixel,
  colorType,
  index,
  scanline,
}: {
  bytesPerPixel: number;
  colorType: number;
  index: number;
  scanline: ByteArray;
}): PixelSample => {
  const offset = index * bytesPerPixel;

  if (colorType === 0) {
    const gray = scanline[offset] ?? 0;
    return { a: 255, b: gray, g: gray, r: gray };
  }
  if (colorType === 4) {
    const gray = scanline[offset] ?? 0;
    return { a: scanline[offset + 1] ?? 255, b: gray, g: gray, r: gray };
  }
  if (colorType === 2) {
    return {
      a: 255,
      b: scanline[offset + 2] ?? 0,
      g: scanline[offset + 1] ?? 0,
      r: scanline[offset] ?? 0,
    };
  }

  return {
    a: scanline[offset + 3] ?? 255,
    b: scanline[offset + 2] ?? 0,
    g: scanline[offset + 1] ?? 0,
    r: scanline[offset] ?? 0,
  };
};

const analyzePngBuffer = (buffer: Buffer): VisualReviewStillAnalysis => {
  const parsed = parsePng(buffer);
  if (!parsed || parsed.metadata.bitDepth !== 8) {
    return createUnsupportedAnalysis();
  }

  const channels = COLOR_CHANNELS_BY_TYPE.get(parsed.metadata.colorType);
  if (!channels || parsed.metadata.width <= 0 || parsed.metadata.height <= 0) {
    return createUnsupportedAnalysis();
  }

  const bytesPerPixel = channels;
  const scanlineLength = parsed.metadata.width * bytesPerPixel;
  const inflated = new Uint8Array(inflateSync(parsed.imageData));
  let offset = 0;
  let previous: ByteArray = new Uint8Array(scanlineLength);
  let pixelCount = 0;
  let minLuma = 255;
  let maxLuma = 0;
  const colorCounts = new Map<string, number>();

  for (let row = 0; row < parsed.metadata.height; row += 1) {
    const filterType = inflated[offset];
    const scanlineStart = offset + 1;
    const scanlineEnd = scanlineStart + scanlineLength;

    if (filterType === undefined || scanlineEnd > inflated.length) {
      return createUnsupportedAnalysis();
    }

    const scanline = unfilterScanline({
      bytesPerPixel,
      filterType,
      previous,
      scanline: inflated.subarray(scanlineStart, scanlineEnd),
    });

    for (let column = 0; column < parsed.metadata.width; column += 1) {
      const pixel = samplePixel({
        bytesPerPixel,
        colorType: parsed.metadata.colorType,
        index: column,
        scanline,
      });
      const luma = 0.2126 * pixel.r + 0.7152 * pixel.g + 0.0722 * pixel.b;
      const colorKey = `${pixel.r},${pixel.g},${pixel.b},${pixel.a}`;
      colorCounts.set(colorKey, (colorCounts.get(colorKey) ?? 0) + 1);
      minLuma = Math.min(minLuma, luma);
      maxLuma = Math.max(maxLuma, luma);
      pixelCount += 1;
    }

    previous = scanline;
    offset = scanlineEnd;
  }

  let dominantColorCount = 0;
  colorCounts.forEach((count) => {
    dominantColorCount = Math.max(dominantColorCount, count);
  });
  const dominantColorRatio = pixelCount > 0 ? dominantColorCount / pixelCount : 0;
  const lumaRange = maxLuma - minLuma;
  const blankFrameScore = Math.max(
    dominantColorRatio,
    Math.max(0, Math.min(1, 1 - lumaRange / 255)),
  );
  const contrastScore = Math.max(0, Math.min(1, lumaRange / 255));
  const isNearBlank =
    dominantColorRatio >= NEAR_BLANK_DOMINANT_COLOR_RATIO && lumaRange <= NEAR_BLANK_LUMA_RANGE;
  const isLowContrast = !isNearBlank && pixelCount > 0 && lumaRange <= LOW_CONTRAST_LUMA_RANGE;
  const status = isNearBlank
    ? "near_blank_frame"
    : isLowContrast
      ? "low_contrast_frame"
      : "analyzed";

  return {
    blankFrameScore: Number(blankFrameScore.toFixed(4)),
    contrastScore: Number(contrastScore.toFixed(4)),
    dominantColorRatio: Number(dominantColorRatio.toFixed(4)),
    lumaRange: Number(lumaRange.toFixed(2)),
    pixelCount,
    status,
  };
};

export const analyzeVisualReviewStill = async (
  outputPath: string,
): Promise<VisualReviewStillAnalysis> => {
  try {
    return analyzePngBuffer(await readFile(outputPath));
  } catch {
    return createUnsupportedAnalysis();
  }
};

export const buildVisualReviewStillAnalysisFindings = ({
  analysis,
  frame,
  segmentId,
}: {
  analysis: VisualReviewStillAnalysis;
  frame: number;
  segmentId: string;
}): VisualReviewFinding[] => {
  if (analysis.status === "near_blank_frame") {
    return [
      {
        frame,
        message: `Representative still appears near blank: dominant color ratio ${analysis.dominantColorRatio}, luma range ${analysis.lumaRange}.`,
        severity: "warning",
        suggestedRepair:
          "Inspect this frame and regenerate the target segment if the blank frame is unintended.",
        targetId: segmentId,
      },
    ];
  }

  if (analysis.status !== "low_contrast_frame") {
    return [];
  }

  return [
    {
      frame,
      message: `Representative still appears low contrast: contrast score ${analysis.contrastScore}, luma range ${analysis.lumaRange}.`,
      severity: "warning",
      suggestedRepair:
        "Inspect this frame and regenerate the target segment if foreground content is hard to read.",
      targetId: segmentId,
    },
  ];
};
