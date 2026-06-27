import type { FC } from "react";

import { Card } from "../../components/ui/Card";
import type { TemplateEditorProps } from "../editor-types";
import { ProductUiZoomAssetEditor } from "./product-ui-zoom-asset-editor";
import type { TechnicalExplainerSegment, TechnicalExplainerSpec } from "./schema";

const updateImplementation = (
  segment: TechnicalExplainerSegment,
  patch: Partial<TechnicalExplainerSpec>,
): TechnicalExplainerSegment => ({
  ...segment,
  implementation: {
    ...segment.implementation,
    ...patch,
  },
});

const formatJson = (value: unknown) => JSON.stringify(value, null, 2);

const parseJsonArray = <TValue,>(value: string, fallback: TValue[]): TValue[] => {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as TValue[]) : fallback;
  } catch {
    return fallback;
  }
};

export const TechnicalExplainerEditor: FC<TemplateEditorProps<TechnicalExplainerSegment>> = ({
  inputClassName,
  isUploadingProductUiAsset,
  onProductUiAssetRemove,
  onProductUiAssetUpload,
  parsePositiveInteger,
  segment,
  productUiAssetError,
  productUiAssets,
  onSegmentChange,
}) => {
  const fieldClassName = "block text-xs font-medium text-foreground";
  const sectionsJson = formatJson(segment.implementation.sections);

  return (
    <Card className="mt-5" tone="nested">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">Technical Explainer 内容</h3>
        <label className="text-xs font-medium text-foreground">
          帧数
          <input
            className={inputClassName}
            min={120}
            type="number"
            value={segment.implementation.durationInFrames}
            onChange={(event) =>
              onSegmentChange(
                updateImplementation(segment, {
                  durationInFrames: parsePositiveInteger(
                    event.currentTarget.value,
                    segment.implementation.durationInFrames,
                    120,
                    900,
                  ),
                }),
              )
            }
          />
        </label>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <label className={fieldClassName}>
          标题
          <input
            className={inputClassName}
            value={segment.implementation.title}
            onChange={(event) =>
              onSegmentChange(updateImplementation(segment, { title: event.currentTarget.value }))
            }
          />
        </label>
        <label className={fieldClassName}>
          副标题
          <textarea
            className={`${inputClassName} min-h-14`}
            value={segment.implementation.subtitle ?? ""}
            onChange={(event) =>
              onSegmentChange(
                updateImplementation(segment, { subtitle: event.currentTarget.value }),
              )
            }
          />
        </label>
      </div>
      <ProductUiZoomAssetEditor
        isUploadingProductUiAsset={isUploadingProductUiAsset}
        onProductUiAssetRemove={onProductUiAssetRemove}
        onProductUiAssetUpload={onProductUiAssetUpload}
        productUiAssetError={productUiAssetError}
        productUiAssets={productUiAssets}
        segment={segment}
        onSegmentChange={onSegmentChange}
      />
      <label className={`${fieldClassName} mt-3`}>
        Sections JSON
        <textarea
          className={`${inputClassName} min-h-64 font-mono text-[11px] leading-relaxed`}
          value={sectionsJson}
          onChange={(event) =>
            onSegmentChange(
              updateImplementation(segment, {
                sections: parseJsonArray<TechnicalExplainerSpec["sections"][number]>(
                  event.currentTarget.value,
                  segment.implementation.sections,
                ),
              }),
            )
          }
        />
      </label>
    </Card>
  );
};
