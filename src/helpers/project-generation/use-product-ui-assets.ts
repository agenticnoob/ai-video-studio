"use client";

import { useState } from "react";

import type { ProductImageDescriptor, ProductImageUploadResult } from "../../lib/product-assets";

export const MAX_PRODUCT_UI_ASSET_POOL_ITEMS = 5;

export type ProductUiAssetPoolItem = {
  readonly descriptor: ProductImageDescriptor;
  readonly metadata: ProductImageUploadResult["metadata"];
};

export type UseProductUiAssetsResult = {
  readonly isUploadingProductUiAsset: boolean;
  readonly productUiAssetError: string | null;
  readonly productUiAssets: readonly ProductUiAssetPoolItem[];
  readonly removeProductUiAsset: (assetId: string) => void;
  readonly uploadProductUiAsset: (file: File) => Promise<void>;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const readOptionalError = (value: unknown): string | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  return typeof value["error"] === "string" ? value["error"] : undefined;
};

const parseProductUiAssetUploadResult = (value: unknown): ProductUiAssetPoolItem | undefined => {
  if (!isRecord(value) || !isRecord(value["descriptor"]) || !isRecord(value["metadata"])) {
    return undefined;
  }

  const descriptor = value["descriptor"];
  const metadata = value["metadata"];
  const assetId = metadata["assetId"];
  const contentType = metadata["contentType"];
  const originalName = metadata["originalName"];
  const sizeInBytes = metadata["sizeInBytes"];
  const alt = descriptor["alt"];
  const sourceType = descriptor["sourceType"];
  const src = descriptor["src"];
  const frameLabelValue = descriptor["frameLabel"];

  if (
    typeof assetId !== "string" ||
    typeof contentType !== "string" ||
    typeof originalName !== "string" ||
    typeof sizeInBytes !== "number" ||
    typeof alt !== "string" ||
    sourceType !== "route" ||
    typeof src !== "string" ||
    (frameLabelValue !== undefined && typeof frameLabelValue !== "string")
  ) {
    return undefined;
  }

  return {
    descriptor:
      typeof frameLabelValue === "string"
        ? { alt, frameLabel: frameLabelValue, sourceType, src }
        : { alt, sourceType, src },
    metadata: {
      assetId,
      contentType,
      originalName,
      sizeInBytes,
    },
  };
};

export const appendProductUiAssetToPool = (
  pool: readonly ProductUiAssetPoolItem[],
  item: ProductUiAssetPoolItem,
): readonly ProductUiAssetPoolItem[] => {
  return [...pool, item].slice(-MAX_PRODUCT_UI_ASSET_POOL_ITEMS);
};

export const removeProductUiAssetFromPool = (
  pool: readonly ProductUiAssetPoolItem[],
  assetId: string,
): readonly ProductUiAssetPoolItem[] => {
  return pool.filter((item) => item.metadata.assetId !== assetId);
};

export const useProductUiAssets = (): UseProductUiAssetsResult => {
  const [productUiAssets, setProductUiAssets] = useState<readonly ProductUiAssetPoolItem[]>([]);
  const [isUploadingProductUiAsset, setIsUploadingProductUiAsset] = useState(false);
  const [productUiAssetError, setProductUiAssetError] = useState<string | null>(null);

  const uploadProductUiAsset = async (file: File) => {
    setIsUploadingProductUiAsset(true);
    setProductUiAssetError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("alt", file.name);

      const response = await fetch("/api/assets/product-ui", {
        method: "POST",
        body: formData,
      });
      const data: unknown = await response.json();
      const uploadResult = parseProductUiAssetUploadResult(data);

      if (!response.ok || !uploadResult) {
        throw new Error(readOptionalError(data) ?? "上传产品截图失败。");
      }

      setProductUiAssets((current) => appendProductUiAssetToPool(current, uploadResult));
    } catch (caughtError) {
      setProductUiAssetError(
        caughtError instanceof Error ? caughtError.message : "上传产品截图失败。",
      );
    } finally {
      setIsUploadingProductUiAsset(false);
    }
  };

  const removeProductUiAsset = (assetId: string) => {
    setProductUiAssets((current) => removeProductUiAssetFromPool(current, assetId));
    setProductUiAssetError(null);
  };

  return {
    isUploadingProductUiAsset,
    productUiAssetError,
    productUiAssets,
    removeProductUiAsset,
    uploadProductUiAsset,
  };
};
