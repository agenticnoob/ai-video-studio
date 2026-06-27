import { createReadStream } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";

import { z } from "zod";

import { getProductUiAssetDirectory } from "../artifact-paths";

const allowedProductImageExtensions = ["png", "jpg", "jpeg", "webp"] as const;
type ProductImageExtension = (typeof allowedProductImageExtensions)[number];
const productImageContentTypesByExtension = {
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
} as const;
const allowedProductImageMimeTypes: ReadonlySet<string> = new Set(
  Object.values(productImageContentTypesByExtension),
);
const productImageAssetIdPattern =
  /^product-ui-asset-\d{8}t\d{6}z-[a-z0-9]{8}\.(png|jpg|jpeg|webp)$/;

export const MAX_PRODUCT_IMAGE_ASSET_BYTES = 10 * 1024 * 1024;

export class ProductAssetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductAssetError";
  }
}

export const productImageDescriptorSchema = z
  .object({
    alt: z.string().trim().min(1).max(240),
    frameLabel: z.string().trim().min(1).max(120).optional(),
    sourceType: z.literal("route"),
    src: z
      .string()
      .trim()
      .regex(/^\/api\/assets\/product-ui\/product-ui-asset-\d{8}t\d{6}z-[a-z0-9]{8}\.(png|jpg|jpeg|webp)$/),
  })
  .strict();

export type ProductImageDescriptor = z.infer<typeof productImageDescriptorSchema>;

export type ProductImageAssetMetadata = {
  readonly assetId: string;
  readonly contentType: string;
  readonly originalName: string;
  readonly sizeInBytes: number;
};

export type ProductImageUploadResult = {
  readonly descriptor: ProductImageDescriptor;
  readonly metadata: ProductImageAssetMetadata;
};

export type ProductImageFile = {
  readonly buffer: Buffer;
  readonly contentType: string;
  readonly originalName: string;
};

export const isAllowedProductImageMimeType = (mimeType: string): boolean => {
  return allowedProductImageMimeTypes.has(mimeType.toLowerCase());
};

export const getProductImageExtension = (filename: string): ProductImageExtension | undefined => {
  const extension = path.extname(filename).replace(/^\./, "").toLowerCase();
  const candidate = extension as ProductImageExtension;
  return allowedProductImageExtensions.includes(candidate) ? candidate : undefined;
};

export const createProductImageAssetId = (extension: string): string => {
  const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}z$/i, "z");
  return `product-ui-asset-${timestamp}-${randomUUID().slice(0, 8)}.${extension}`.toLowerCase();
};

export const assertProductImageAssetId = (assetId: string): void => {
  if (!productImageAssetIdPattern.test(assetId)) {
    throw new ProductAssetError("Product UI asset id is invalid.");
  }
};

export const getProductImageAssetStoragePath = (assetId: string): string => {
  assertProductImageAssetId(assetId);
  return path.join(getProductUiAssetDirectory(), assetId);
};

export const getProductImageAssetContentType = (assetId: string): string => {
  const extension = getProductImageExtension(assetId);
  if (!extension) {
    throw new ProductAssetError("Product UI asset extension is invalid.");
  }
  return productImageContentTypesByExtension[extension];
};

export const createProductImageDescriptor = ({
  alt,
  assetId,
  frameLabel,
}: {
  readonly alt: string;
  readonly assetId: string;
  readonly frameLabel?: string;
}): ProductImageDescriptor => {
  assertProductImageAssetId(assetId);
  return productImageDescriptorSchema.parse({
    alt,
    frameLabel,
    sourceType: "route",
    src: `/api/assets/product-ui/${assetId}`,
  });
};

export const writeProductImageAsset = async ({
  alt,
  file,
  frameLabel,
}: {
  readonly alt: string;
  readonly file: ProductImageFile;
  readonly frameLabel?: string;
}): Promise<ProductImageUploadResult> => {
  const extension = getProductImageExtension(file.originalName);
  if (!extension) {
    throw new ProductAssetError("Product image filename must end in .png, .jpg, .jpeg, or .webp.");
  }
  if (!isAllowedProductImageMimeType(file.contentType)) {
    throw new ProductAssetError("Product image must be png, jpeg, or webp.");
  }
  if (file.buffer.byteLength <= 0) {
    throw new ProductAssetError("Product image file is empty.");
  }
  if (file.buffer.byteLength > MAX_PRODUCT_IMAGE_ASSET_BYTES) {
    throw new ProductAssetError("Product image file is too large. Maximum size is 10MB.");
  }

  const assetId = createProductImageAssetId(extension);
  const outputPath = getProductImageAssetStoragePath(assetId);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, Uint8Array.from(file.buffer), { flag: "wx" });

  return {
    descriptor: createProductImageDescriptor({ alt, assetId, frameLabel }),
    metadata: {
      assetId,
      contentType: getProductImageAssetContentType(assetId),
      originalName: file.originalName,
      sizeInBytes: file.buffer.byteLength,
    },
  };
};

export const createProductImageAssetResponse = async (
  assetId: string,
): Promise<Response> => {
  const storagePath = getProductImageAssetStoragePath(assetId);
  const outputStats = await stat(storagePath);
  const stream = createReadStream(storagePath);

  return new Response(Readable.toWeb(stream) as ReadableStream<Uint8Array>, {
    headers: {
      "cache-control": "public, max-age=31536000, immutable",
      "content-length": String(outputStats.size),
      "content-type": getProductImageAssetContentType(assetId),
    },
  });
};
