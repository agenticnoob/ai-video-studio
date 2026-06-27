import { useEffect, useRef, useState, type FC } from "react";

import type { ProductUiAssetPoolItem } from "../../helpers/project-generation/use-product-ui-assets";
import {
  bindProductUiZoomAsset,
  findProductUiZoomSections,
  unbindProductUiZoomAsset,
} from "./product-ui-assets";
import type { TechnicalExplainerSegment } from "./schema";

type ProductUiZoomAssetEditorProps = {
  readonly isUploadingProductUiAsset?: boolean;
  readonly onProductUiAssetRemove?: (assetId: string) => void;
  readonly onProductUiAssetUpload?: (file: File) => Promise<void>;
  readonly productUiAssetError?: string | null;
  readonly productUiAssets?: readonly ProductUiAssetPoolItem[];
  readonly segment: TechnicalExplainerSegment;
  readonly onSegmentChange: (segment: TechnicalExplainerSegment) => void;
};

export const ProductUiZoomAssetEditor: FC<ProductUiZoomAssetEditorProps> = ({
  isUploadingProductUiAsset,
  onProductUiAssetRemove,
  onProductUiAssetUpload,
  productUiAssetError,
  productUiAssets,
  segment,
  onSegmentChange,
}) => {
  const productUiZoomSections = findProductUiZoomSections(segment);
  const productUiAssetPool = productUiAssets ?? [];
  const uploadedProductUiAssetSrcs = new Set(productUiAssetPool.map((item) => item.descriptor.src));
  const boundProductUiAssetSrcs = new Set(
    productUiZoomSections.flatMap((section) => (section.asset?.src ? [section.asset.src] : [])),
  );
  const boundOnlyProductUiAssetCount = Array.from(boundProductUiAssetSrcs).filter(
    (src) => !uploadedProductUiAssetSrcs.has(src),
  ).length;
  const visibleProductUiAssetCount = productUiAssetPool.length + boundOnlyProductUiAssetCount;
  const currentProductUiAssetError = productUiAssetError ?? null;
  const hasProductUiAssetUploader = typeof onProductUiAssetUpload === "function";
  const hasProductUiAssetRemover = typeof onProductUiAssetRemove === "function";
  const sectionUploadInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const pendingUploadSectionIdRef = useRef<string | null>(null);
  const pendingUploadLastAssetIdRef = useRef<string | null>(null);
  const [retryUploadSectionId, setRetryUploadSectionId] = useState<string | null>(null);

  const chooseFromPool = (
    sectionId: string,
    descriptor: (typeof productUiAssetPool)[number]["descriptor"],
  ) => {
    onSegmentChange(
      bindProductUiZoomAsset(segment, {
        descriptor,
        sectionId,
      }),
    );
  };

  const unbindSectionAsset = (sectionId: string) => {
    onSegmentChange(unbindProductUiZoomAsset(segment, sectionId));
  };

  const triggerSectionUpload = (sectionId: string) => {
    sectionUploadInputRefs.current[sectionId]?.click();
  };

  const handleSectionAssetUpload = async (sectionId: string, file: File) => {
    if (!hasProductUiAssetUploader) {
      return;
    }

    pendingUploadSectionIdRef.current = sectionId;
    pendingUploadLastAssetIdRef.current = productUiAssetPool.at(-1)?.metadata.assetId ?? null;
    setRetryUploadSectionId(sectionId);
    await onProductUiAssetUpload?.(file);
  };

  useEffect(() => {
    const pendingUploadSectionId = pendingUploadSectionIdRef.current;

    if (!pendingUploadSectionId) {
      return;
    }

    if (isUploadingProductUiAsset) {
      return;
    }

    const previousLastAssetId = pendingUploadLastAssetIdRef.current;
    const latestAsset = productUiAssetPool.at(-1);

    if (latestAsset && latestAsset.metadata.assetId !== previousLastAssetId) {
      chooseFromPool(pendingUploadSectionId, latestAsset.descriptor);
      pendingUploadSectionIdRef.current = null;
      pendingUploadLastAssetIdRef.current = null;
      setRetryUploadSectionId(null);
      return;
    }

    if (currentProductUiAssetError) {
      pendingUploadSectionIdRef.current = null;
      pendingUploadLastAssetIdRef.current = null;
    }
  }, [currentProductUiAssetError, isUploadingProductUiAsset, productUiAssetPool, segment]);

  return (
    <div className="mt-4 rounded-geist border border-panel-border-color bg-panel-surface-color p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-foreground">Product UI 绑定</h4>
          <p className="mt-1 text-xs leading-5 text-foreground">
            为 product-ui-zoom section 选择上传池中的素材，或上传新的截图后直接绑定。
          </p>
        </div>
        <div className="text-xs text-foreground">
          {isUploadingProductUiAsset ? "上传中" : `${visibleProductUiAssetCount} 张上传/已绑定素材`}
        </div>
      </div>

      {currentProductUiAssetError ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-geist border border-panel-border-color bg-background px-3 py-2 text-sm text-foreground">
          <span>{currentProductUiAssetError}</span>
          <button
            className="rounded-geist border border-foreground px-3 py-1.5 text-xs font-semibold text-foreground disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!retryUploadSectionId || isUploadingProductUiAsset || !hasProductUiAssetUploader}
            type="button"
            onClick={() => {
              if (retryUploadSectionId) {
                triggerSectionUpload(retryUploadSectionId);
              }
            }}
          >
            重试上传
          </button>
        </div>
      ) : null}

      {productUiZoomSections.length > 0 ? (
        <div className="mt-4 space-y-3">
          {productUiZoomSections.map((section) => {
            const boundAsset = section.asset
              ? productUiAssetPool.find((item) => item.descriptor.src === section.asset?.src)
              : undefined;
            const sectionAssetLabel =
              boundAsset?.metadata.originalName ?? section.asset?.alt ?? "尚未绑定素材";
            const sectionFrameLabel = section.asset?.frameLabel ?? "frameLabel 未设置";
            const canUpload = hasProductUiAssetUploader && !isUploadingProductUiAsset;

            return (
              <section
                className="rounded-geist border border-field-border-color bg-background p-3"
                key={section.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground">{section.title}</div>
                    <div className="mt-1 text-xs leading-5 text-foreground">
                      <span className="font-medium">frameLabel:</span> {sectionFrameLabel}
                    </div>
                    <div className="mt-1 text-xs leading-5 text-foreground">
                      <span className="font-medium">fallbackSummary:</span> {section.fallbackSummary}
                    </div>
                  </div>
                  <div className="text-xs font-medium text-foreground">
                    {section.asset ? "已绑定" : "未绑定"}
                  </div>
                </div>

                <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
                  <div className="min-w-0 space-y-1">
                    <div className="text-xs font-medium text-foreground">当前素材状态</div>
                    <div className="text-sm text-foreground">{sectionAssetLabel}</div>
                    {section.asset?.src ? (
                      <div className="truncate text-xs text-foreground">{section.asset.src}</div>
                    ) : (
                      <div className="text-xs text-foreground">点击池中素材或先上传一张截图。</div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <button
                      className="rounded-geist border border-foreground px-3 py-1.5 text-xs font-semibold text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={!canUpload}
                      type="button"
                      onClick={() => triggerSectionUpload(section.id)}
                    >
                      {section.asset ? "上传并替换" : "上传并绑定"}
                    </button>
                    <button
                      className="rounded-geist border border-panel-border-color px-3 py-1.5 text-xs font-semibold text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={!section.asset || isUploadingProductUiAsset}
                      type="button"
                      onClick={() => unbindSectionAsset(section.id)}
                    >
                      解绑
                    </button>
                    <input
                      accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                      className="sr-only"
                      disabled={!canUpload}
                      ref={(element) => {
                        sectionUploadInputRefs.current[section.id] = element;
                      }}
                      type="file"
                      onChange={async (event) => {
                        const file = event.currentTarget.files?.[0];
                        event.currentTarget.value = "";

                        if (file) {
                          await handleSectionAssetUpload(section.id, file);
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-xs font-medium text-foreground">上传池</div>
                  {productUiAssetPool.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {productUiAssetPool.map((item) => {
                        const isCurrentAsset = item.descriptor.src === section.asset?.src;

                        return (
                          <div
                            className="flex min-w-0 items-center gap-2 rounded-geist border border-panel-border-color bg-panel-surface-color px-2 py-1.5"
                            key={item.metadata.assetId}
                          >
                            <button
                              className={`min-w-0 truncate rounded-geist px-2 py-1 text-left text-xs font-semibold ${
                                isCurrentAsset
                                  ? "bg-foreground text-background"
                                  : "text-foreground hover:bg-foreground hover:text-background"
                              } disabled:cursor-not-allowed disabled:opacity-60`}
                              disabled={isUploadingProductUiAsset}
                              type="button"
                              onClick={() => chooseFromPool(section.id, item.descriptor)}
                            >
                              {item.metadata.originalName}
                            </button>
                              {hasProductUiAssetRemover ? (
                                <button
                                  className="rounded-geist border border-panel-border-color px-2 py-1 text-[11px] font-semibold text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                                  disabled={isUploadingProductUiAsset}
                                  type="button"
                                  onClick={() => onProductUiAssetRemove?.(item.metadata.assetId)}
                                >
                                移除
                              </button>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-foreground">
                      {section.asset
                        ? "当前分镜已有绑定素材，可上传替换或解绑。"
                        : "当前没有可用素材，先上传一张截图。"}
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 text-sm text-foreground">当前没有 product-ui-zoom section。</div>
      )}
    </div>
  );
};
