import type { VideoSegment } from "../lib/project-schema";
import type { ProductUiAssetPoolItem } from "../helpers/project-generation/use-product-ui-assets";

export type TemplateEditorProps<TSegment> = {
  inputClassName: string;
  isUploadingProductUiAsset?: boolean;
  onProductUiAssetRemove?: (assetId: string) => void;
  onProductUiAssetUpload?: (file: File) => Promise<void>;
  parsePositiveInteger: (value: string, fallback: number, min: number, max: number) => number;
  segment: TSegment;
  productUiAssetError?: string | null;
  productUiAssets?: readonly ProductUiAssetPoolItem[];
  onSegmentChange: (segment: TSegment) => void;
};

export type RuntimeTemplateEditorProps = {
  inputClassName: string;
  isUploadingProductUiAsset?: boolean;
  onProductUiAssetRemove?: (assetId: string) => void;
  onProductUiAssetUpload?: (file: File) => Promise<void>;
  parsePositiveInteger: (value: string, fallback: number, min: number, max: number) => number;
  segment: VideoSegment;
  productUiAssetError?: string | null;
  productUiAssets?: readonly ProductUiAssetPoolItem[];
  onSegmentChange: (segment: VideoSegment) => void;
};
