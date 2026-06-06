import type { FC } from "react";

import type { VideoSegment } from "../../lib/project-schema";
import { getTemplateLabel } from "../../lib/template-registry";
import { getTemplateEditor } from "../../templates/component-registry";

type SegmentEditorProps = {
  isRegenerating: boolean;
  segment: VideoSegment | null;
  revisionPrompt: string;
  onRegenerateSegment: () => void;
  onRevisionPromptChange: (value: string) => void;
  onSegmentChange: (segment: VideoSegment) => void;
};

const inputClassName =
  "mt-2 w-full rounded-geist border border-unfocused-border-color bg-background px-3 py-2 text-sm outline-none focus:border-focused-border-color";

const parsePositiveInteger = (value: string, fallback: number, min: number, max: number) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(min, Math.min(max, Math.round(parsed)));
};

const themeLabelMap = {
  background: "背景",
  panel: "面板",
  primary: "主色",
  secondary: "辅助色",
  text: "文字",
  muted: "弱化文字",
} as const;

export const SegmentEditor: FC<SegmentEditorProps> = ({
  isRegenerating,
  segment,
  revisionPrompt,
  onRegenerateSegment,
  onRevisionPromptChange,
  onSegmentChange,
}) => {
  if (!segment) {
    return (
      <section className="rounded-geist border border-unfocused-border-color bg-background p-5">
        <h2 className="text-base font-semibold text-foreground">当前分段</h2>
        <p className="mt-3 text-sm text-neutral-600">请选择一个分段后再编辑详情。</p>
      </section>
    );
  }

  const TemplateEditor = getTemplateEditor(segment.templateId);

  const updateTitle = (title: string) => {
    onSegmentChange({
      ...segment,
      title,
      implementation: {
        ...segment.implementation,
        meta: {
          ...segment.implementation.meta,
          title,
        },
      },
    } as VideoSegment);
  };

  const updateTheme = (key: keyof typeof themeLabelMap, value: string) => {
    onSegmentChange({
      ...segment,
      implementation: {
        ...segment.implementation,
        theme: {
          ...segment.implementation.theme,
          [key]: value,
        },
      },
    } as VideoSegment);
  };

  return (
    <section className="rounded-geist border border-unfocused-border-color bg-background p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">当前分段</h2>
          <div className="mt-1 text-xs text-neutral-500">{segment.id}</div>
        </div>
        <div className="rounded-geist border border-unfocused-border-color px-3 py-1 text-xs uppercase text-neutral-500">
          {getTemplateLabel(segment.templateId)}
        </div>
      </div>

      <label className="mt-4 block text-sm font-medium text-foreground">
        自然语言修改指令
        <textarea
          className={`${inputClassName} min-h-24 resize-y`}
          placeholder="描述这个分段下一次重生成时应如何调整。"
          value={revisionPrompt}
          onChange={(event) => onRevisionPromptChange(event.currentTarget.value)}
        />
      </label>
      <button
        className="mt-3 rounded-geist border border-foreground bg-foreground px-4 py-2 text-sm font-semibold text-background disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!revisionPrompt.trim() || isRegenerating}
        onClick={onRegenerateSegment}
        type="button"
      >
        {isRegenerating ? "正在重生成分段..." : "重生成当前分段"}
      </button>

      <div className="mt-6 border-t border-unfocused-border-color pt-5">
        <h3 className="text-sm font-semibold text-foreground">分段详情</h3>
        <label className="mt-3 block text-sm font-medium text-foreground">
          标题
          <input
            className={inputClassName}
            value={segment.title}
            onChange={(event) => updateTitle(event.currentTarget.value)}
          />
        </label>
        <label className="mt-3 block text-sm font-medium text-foreground">
          意图说明
          <textarea
            className={`${inputClassName} min-h-20`}
            value={segment.intent}
            onChange={(event) => onSegmentChange({ ...segment, intent: event.currentTarget.value })}
          />
        </label>
      </div>

      <div className="mt-6 border-t border-unfocused-border-color pt-5">
        <h3 className="text-sm font-semibold text-foreground">模板主题</h3>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {(["background", "panel", "primary", "secondary", "text", "muted"] as const).map(
            (key) => (
              <label key={key} className="block text-sm font-medium capitalize text-foreground">
                {themeLabelMap[key]}
                <input
                  className={inputClassName}
                  value={segment.implementation.theme[key]}
                  onChange={(event) => updateTheme(key, event.currentTarget.value)}
                />
              </label>
            ),
          )}
        </div>
      </div>

      <TemplateEditor
        inputClassName={inputClassName}
        parsePositiveInteger={parsePositiveInteger}
        segment={segment}
        onSegmentChange={onSegmentChange}
      />
    </section>
  );
};
