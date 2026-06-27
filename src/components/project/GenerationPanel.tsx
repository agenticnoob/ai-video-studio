import type { FC } from "react";

import type {
  GenerationOperation,
  ProductUiAssetPoolItem,
  VoiceCloneSettings,
} from "../../helpers/use-project-generation";
import { useTaskProgress } from "../../helpers/use-task-progress";
import { Card } from "../ui/Card";
import { ActivityProgress } from "../ui/ActivityProgress";

type GenerationPanelProps = {
  brief: string;
  disabled: boolean;
  error: string | null;
  generationOperation: GenerationOperation;
  isGenerating: boolean;
  isUploadingProductUiAsset: boolean;
  isUploadingVoiceReference: boolean;
  onBriefChange: (value: string) => void;
  onGenerate: () => void;
  onProductUiAssetRemove: (assetId: string) => void;
  onProductUiAssetUpload: (file: File) => void;
  onVoiceCloneChange: (settings: VoiceCloneSettings) => void;
  onVoiceReferenceUpload: (file: File) => void;
  productUiAssetError: string | null;
  productUiAssets: readonly ProductUiAssetPoolItem[];
  voiceClone: VoiceCloneSettings;
  voiceReferenceError: string | null;
};

const inputClassName =
  "mt-2 w-full rounded-geist border border-field-border-color bg-field-surface-color px-3 py-2 text-sm outline-none transition-colors focus:border-field-focus-border-color";

export const GenerationPanel: FC<GenerationPanelProps> = ({
  brief,
  disabled,
  error,
  generationOperation,
  isGenerating,
  isUploadingProductUiAsset,
  isUploadingVoiceReference,
  onBriefChange,
  onGenerate,
  onProductUiAssetRemove,
  onProductUiAssetUpload,
  onVoiceCloneChange,
  onVoiceReferenceUpload,
  productUiAssetError,
  productUiAssets,
  voiceClone,
  voiceReferenceError,
}) => {
  const taskProgress = useTaskProgress(
    generationOperation.status === "idle" ? undefined : generationOperation.progressId,
    generationOperation.status === "running",
  );

  return (
    <Card as="section" tone="panel">
      <div className="text-xs uppercase tracking-[0.22em] text-foreground">AI Video Studio</div>
      <h1 className="mt-3 text-2xl font-bold text-foreground">分段优先工作台</h1>
      <p className="mt-3 text-sm leading-6 text-foreground">
        从一段 brief 生成视频项目，先预览完整成片，再逐段细化修改，并直接导出当前编辑态成片。
      </p>

      <label className="mt-5 block text-sm font-medium text-foreground">
        创意 brief
        <textarea
          className={`${inputClassName} min-h-28 resize-y`}
          value={brief}
          onChange={(event) => onBriefChange(event.currentTarget.value)}
        />
      </label>

      <div className="mt-4">
        <label className="flex items-center gap-3 text-sm text-foreground">
          <input
            checked={voiceClone.enabled}
            className="h-4 w-4 accent-foreground"
            disabled={disabled}
            type="checkbox"
            onChange={(event) =>
              onVoiceCloneChange({
                ...voiceClone,
                enabled: event.currentTarget.checked,
              })
            }
          />
          <span>声音克隆</span>
        </label>

        {voiceClone.enabled ? (
          <div className="mt-4 space-y-3">
            <label className="block text-sm font-medium text-foreground">
              参考音频文本
              <textarea
                className={`${inputClassName} min-h-20 resize-y`}
                disabled={disabled}
                value={voiceClone.referenceText}
                onChange={(event) =>
                  onVoiceCloneChange({
                    ...voiceClone,
                    referenceText: event.currentTarget.value,
                  })
                }
              />
            </label>

            <label className="block text-sm font-medium text-foreground">
              参考音频
              <input
                accept=".wav,.mp3,.m4a,.aac,audio/wav,audio/mpeg,audio/mp3,audio/m4a,audio/aac"
                className={`${inputClassName} file:mr-3 file:rounded-geist file:border file:border-panel-border-color file:bg-foreground file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-background`}
                disabled={disabled || isUploadingVoiceReference}
                type="file"
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  event.currentTarget.value = "";
                  if (file) {
                    onVoiceReferenceUpload(file);
                  }
                }}
              />
            </label>

            <div className="text-sm text-foreground">
              {isUploadingVoiceReference
                ? "正在上传参考音频..."
                : voiceClone.originalName
                  ? `已上传：${voiceClone.originalName}`
                  : "未上传参考音频"}
            </div>

            {voiceReferenceError ? (
              <div className="text-sm font-medium text-foreground">{voiceReferenceError}</div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-4 rounded-geist border border-panel-border-color bg-panel-surface-color p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-foreground">产品截图素材</div>
            <div className="mt-1 text-xs text-foreground">PNG / JPEG / WebP，最多保留 5 张</div>
          </div>
          <label className="cursor-pointer rounded-geist border border-foreground px-3 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background">
            {isUploadingProductUiAsset ? "上传中..." : "上传"}
            <input
              accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
              className="sr-only"
              disabled={disabled || isUploadingProductUiAsset}
              type="file"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                event.currentTarget.value = "";
                if (file) {
                  onProductUiAssetUpload(file);
                }
              }}
            />
          </label>
        </div>

        {productUiAssets.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {productUiAssets.map((item) => (
              <li
                className="flex items-center justify-between gap-3 rounded-geist border border-field-border-color bg-field-surface-color px-3 py-2"
                key={item.metadata.assetId}
              >
                <span className="min-w-0 truncate text-sm text-foreground">
                  {item.metadata.originalName}
                </span>
                <button
                  className="shrink-0 rounded-geist border border-panel-border-color px-2 py-1 text-xs font-semibold text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={disabled || isUploadingProductUiAsset}
                  type="button"
                  onClick={() => onProductUiAssetRemove(item.metadata.assetId)}
                >
                  移除
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-3 text-sm text-foreground">未上传产品截图</div>
        )}

        {productUiAssetError ? (
          <div className="mt-3 text-sm font-medium text-foreground">{productUiAssetError}</div>
        ) : null}
      </div>

      <button
        className="mt-4 rounded-geist border border-foreground bg-foreground px-4 py-2 text-sm font-semibold text-background disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled || isUploadingProductUiAsset || isUploadingVoiceReference}
        onClick={onGenerate}
        type="button"
      >
        {isGenerating ? "正在生成项目..." : "生成项目"}
      </button>

      <div className="mt-4">
        <ActivityProgress
          detail={
            generationOperation.status === "running"
              ? generationOperation.kind === "segment"
                ? "正在等待分段重生成接口返回新的分段数据。"
                : "正在等待生成接口返回完整 VideoProject。"
              : generationOperation.status === "success"
                ? generationOperation.kind === "segment"
                  ? "已收到新的分段数据，并刷新当前编辑态项目。"
                  : "已收到新的 VideoProject，并刷新预览。"
                : generationOperation.status === "failure"
                  ? "请求已结束，后端返回失败或前端解析失败。"
                  : "点击生成后会记录真实请求耗时。"
          }
          finishedAt={
            generationOperation.status === "success" || generationOperation.status === "failure"
              ? generationOperation.finishedAt
              : undefined
          }
          idleDetail="当前没有生成请求。"
          idleLabel="生成状态"
          label={
            generationOperation.status === "running"
              ? generationOperation.kind === "segment"
                ? "分段重生成请求"
                : "项目生成请求"
              : "最近一次生成请求"
          }
          startedAt={
            generationOperation.status === "idle" ? undefined : generationOperation.startedAt
          }
          status={generationOperation.status}
          taskProgress={taskProgress}
        />
      </div>

      {error ? <div className="mt-4 text-sm font-medium text-foreground">{error}</div> : null}
    </Card>
  );
};
