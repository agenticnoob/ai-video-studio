import { createHash } from "node:crypto";

import sharp from "sharp";

import { StockAssetsException } from "../domain/errors.js";
import { requestWithPolicy } from "../providers/http.js";
import { PEXELS_IMAGE_HOSTS } from "../providers/pexels.js";

const MAX_REDIRECTS = 5;
const MAX_INPUT_PIXELS = 100_000_000;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

type ValidatedImageKind = {
  readonly format: "jpeg" | "png" | "webp";
  readonly mimeType: "image/jpeg" | "image/png" | "image/webp";
  readonly extension: "jpg" | "png" | "webp";
};

const IMAGE_KINDS: Readonly<Record<ValidatedImageKind["format"], ValidatedImageKind>> = {
  jpeg: { format: "jpeg", mimeType: "image/jpeg", extension: "jpg" },
  png: { format: "png", mimeType: "image/png", extension: "png" },
  webp: { format: "webp", mimeType: "image/webp", extension: "webp" },
};

export type ValidatedImage = {
  readonly bytes: Buffer;
  readonly mimeType: ValidatedImageKind["mimeType"];
  readonly extension: ValidatedImageKind["extension"];
  readonly width: number;
  readonly height: number;
  readonly sizeInBytes: number;
  readonly sha256: string;
};

export type DownloadValidatedImageInput = {
  readonly url: string;
  readonly maxBytes: number;
  readonly timeoutMs: number;
  readonly fetchImpl?: typeof fetch;
  readonly sleep?: (milliseconds: number) => Promise<void>;
};

function downloadRejected(message: string, cause?: unknown): StockAssetsException {
  return new StockAssetsException("DOWNLOAD_REJECTED", message, {
    ...(cause === undefined ? {} : { cause }),
  });
}

function validateImageUrl(rawUrl: string | URL): URL {
  let url: URL;
  try {
    url = rawUrl instanceof URL ? new URL(rawUrl.href) : new URL(rawUrl);
  } catch (error) {
    throw downloadRejected("Image URL is invalid", error);
  }

  if (
    url.protocol !== "https:" ||
    url.username !== "" ||
    url.password !== "" ||
    url.port !== "" ||
    !PEXELS_IMAGE_HOSTS.includes(
      url.hostname.toLowerCase() as (typeof PEXELS_IMAGE_HOSTS)[number],
    )
  ) {
    throw downloadRejected("Image URL is outside the approved HTTPS host policy");
  }
  return url;
}

function normalizeMimeType(response: Response): ValidatedImageKind["mimeType"] {
  const mimeType = response.headers
    .get("Content-Type")
    ?.split(";", 1)[0]
    ?.trim()
    .toLowerCase();
  if (
    mimeType !== "image/jpeg" &&
    mimeType !== "image/png" &&
    mimeType !== "image/webp"
  ) {
    throw downloadRejected("Image response has an unsupported Content-Type");
  }
  return mimeType;
}

function declaredContentLength(response: Response): number | undefined {
  const rawValue = response.headers.get("Content-Length");
  if (rawValue === null || !/^[0-9]+$/.test(rawValue)) {
    return undefined;
  }
  const parsed = Number(rawValue);
  return Number.isSafeInteger(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
}

async function readBoundedBody(
  response: Response,
  maxBytes: number,
): Promise<Buffer> {
  const contentLength = declaredContentLength(response);
  if (contentLength !== undefined && contentLength > maxBytes) {
    await response.body?.cancel().catch(() => undefined);
    throw downloadRejected("Image Content-Length exceeds the configured byte limit");
  }
  if (response.body === null) {
    throw downloadRejected("Image response body is missing");
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let sizeInBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      sizeInBytes += value.byteLength;
      if (sizeInBytes > maxBytes) {
        await reader.cancel().catch(() => undefined);
        throw downloadRejected("Image stream exceeds the configured byte limit");
      }
      chunks.push(Uint8Array.from(value));
    }
  } catch (error) {
    if (error instanceof StockAssetsException) {
      throw error;
    }
    throw downloadRejected("Image stream could not be read", error);
  } finally {
    reader.releaseLock();
  }

  const combined = new Uint8Array(sizeInBytes);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return Buffer.from(combined.buffer);
}

function detectImageKind(
  bytes: ArrayLike<number> & { readonly length: number },
): ValidatedImageKind {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return IMAGE_KINDS.jpeg;
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return IMAGE_KINDS.png;
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return IMAGE_KINDS.webp;
  }
  throw downloadRejected("Image bytes have unsupported magic");
}

async function decodeDimensions(
  bytes: Buffer,
  expectedKind: ValidatedImageKind,
): Promise<{ readonly width: number; readonly height: number }> {
  try {
    const options = {
      failOn: "error" as const,
      limitInputPixels: MAX_INPUT_PIXELS,
    };
    const metadata = await sharp(bytes, options).metadata();
    if (metadata.format !== expectedKind.format) {
      throw downloadRejected("Decoded image format disagrees with magic bytes");
    }
    if (
      metadata.width === undefined ||
      metadata.height === undefined ||
      !Number.isInteger(metadata.width) ||
      !Number.isInteger(metadata.height) ||
      metadata.width <= 0 ||
      metadata.height <= 0
    ) {
      throw downloadRejected("Decoded image dimensions must be positive integers");
    }

    await sharp(bytes, options).raw().toBuffer();
    return { width: metadata.width, height: metadata.height };
  } catch (error) {
    if (error instanceof StockAssetsException) {
      throw error;
    }
    throw downloadRejected("Image bytes failed strict raster decoding", error);
  }
}

async function requestImageResponse(
  url: URL,
  input: DownloadValidatedImageInput,
): Promise<Response> {
  try {
    return await requestWithPolicy({
      url,
      init: {
        method: "GET",
        redirect: "manual",
        headers: {
          Accept: "image/jpeg, image/png, image/webp",
        },
      },
      ...(input.fetchImpl === undefined ? {} : { fetchImpl: input.fetchImpl }),
      ...(input.sleep === undefined ? {} : { sleep: input.sleep }),
      timeoutMs: input.timeoutMs,
    });
  } catch (error) {
    if (error instanceof StockAssetsException) {
      throw error;
    }
    throw downloadRejected("Image request failed before receiving a response", error);
  }
}

export async function downloadValidatedImage(
  input: DownloadValidatedImageInput,
): Promise<ValidatedImage> {
  if (!Number.isSafeInteger(input.maxBytes) || input.maxBytes <= 0) {
    throw downloadRejected("Image byte limit must be a positive safe integer");
  }
  if (!Number.isSafeInteger(input.timeoutMs) || input.timeoutMs <= 0) {
    throw downloadRejected("Image timeout must be a positive safe integer");
  }

  let currentUrl = validateImageUrl(input.url);
  let redirects = 0;
  let response: Response;
  while (true) {
    response = await requestImageResponse(currentUrl, input);
    if (!REDIRECT_STATUSES.has(response.status)) {
      break;
    }
    if (redirects >= MAX_REDIRECTS) {
      await response.body?.cancel().catch(() => undefined);
      throw downloadRejected("Image redirect limit exceeded");
    }
    const location = response.headers.get("Location");
    await response.body?.cancel().catch(() => undefined);
    if (location === null) {
      throw downloadRejected("Image redirect is missing a Location header");
    }
    let redirectUrl: URL;
    try {
      redirectUrl = new URL(location, currentUrl);
    } catch (error) {
      throw downloadRejected("Image redirect Location is invalid", error);
    }
    currentUrl = validateImageUrl(redirectUrl);
    redirects += 1;
  }

  if (!response.ok) {
    await response.body?.cancel().catch(() => undefined);
    throw downloadRejected(`Image request failed with status ${response.status}`);
  }

  const declaredMimeType = normalizeMimeType(response);
  const bytes = await readBoundedBody(response, input.maxBytes);
  const imageKind = detectImageKind(bytes);
  if (declaredMimeType !== imageKind.mimeType) {
    throw downloadRejected("Image Content-Type disagrees with magic bytes");
  }
  const dimensions = await decodeDimensions(bytes, imageKind);
  const hashInput = new DataView(Uint8Array.from(bytes).buffer);

  return {
    bytes,
    mimeType: imageKind.mimeType,
    extension: imageKind.extension,
    width: dimensions.width,
    height: dimensions.height,
    sizeInBytes: bytes.byteLength,
    sha256: createHash("sha256").update(hashInput).digest("hex"),
  };
}
