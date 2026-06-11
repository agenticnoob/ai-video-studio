import type { FC } from "react";

import type { GenerationPipeline } from "../../helpers/use-project-generation";

type GenerationPanelProps = {
  brief: string;
  disabled: boolean;
  error: string | null;
  generationPipeline: GenerationPipeline;
  isGenerating: boolean;
  isStagedGeneration: boolean;
  onBriefChange: (value: string) => void;
  onGenerate: () => void;
  onGenerationPipelineChange: (pipeline: GenerationPipeline) => void;
};

const inputClassName =
  "mt-2 w-full rounded-geist border border-unfocused-border-color bg-background px-3 py-2 text-sm outline-none focus:border-focused-border-color";

const sectionClassName = "rounded-geist border border-unfocused-border-color bg-background p-5";

export const GenerationPanel: FC<GenerationPanelProps> = ({
  brief,
  disabled,
  error,
  generationPipeline,
  isGenerating,
  isStagedGeneration,
  onBriefChange,
  onGenerate,
  onGenerationPipelineChange,
}) => {
  return (
    <section className={sectionClassName}>
      <div className="text-xs uppercase tracking-[0.22em] text-neutral-500">AI Video Studio</div>
      <h1 className="mt-3 text-2xl font-bold text-foreground">分段优先工作台</h1>
      <p className="mt-3 text-sm leading-6 text-neutral-600">
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

      <label className="mt-4 flex items-center gap-3 text-sm text-foreground">
        <input
          checked={generationPipeline === "staged"}
          className="h-4 w-4 accent-foreground"
          disabled={disabled}
          type="checkbox"
          onChange={(event) =>
            onGenerationPipelineChange(event.currentTarget.checked ? "staged" : "shortcut")
          }
        />
        <span>阶段式生成</span>
      </label>

      <button
        className="mt-4 rounded-geist border border-foreground bg-foreground px-4 py-2 text-sm font-semibold text-background disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
        onClick={onGenerate}
        type="button"
      >
        {isGenerating
          ? isStagedGeneration
            ? "正在阶段式生成..."
            : "正在生成项目..."
          : isStagedGeneration
            ? "阶段式生成项目"
            : "生成项目"}
      </button>

      {error ? (
        <div className="mt-4 rounded-geist border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </section>
  );
};
