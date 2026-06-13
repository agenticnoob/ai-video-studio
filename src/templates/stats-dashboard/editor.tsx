import type { FC } from "react";

import { Card } from "../../components/ui/Card";
import type { TemplateEditorProps } from "../editor-types";
import type { StatsDashboardSegment, StatsDashboardSpec } from "./schema";

const updateImplementation = (
  segment: StatsDashboardSegment,
  patch: Partial<StatsDashboardSpec>,
): StatsDashboardSegment => ({
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

export const StatsDashboardEditor: FC<TemplateEditorProps<StatsDashboardSegment>> = ({
  inputClassName,
  parsePositiveInteger,
  segment,
  onSegmentChange,
}) => {
  const fieldClassName = "block text-xs font-medium text-foreground";
  const blocksJson = formatJson(segment.implementation.blocks);
  const timelineJson = formatJson(segment.implementation.timeline ?? []);

  return (
    <Card className="mt-5" tone="nested">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">Stats Dashboard 内容</h3>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          <label className="text-xs font-medium text-foreground">
            布局
            <select
              className={inputClassName}
              value={segment.implementation.layout}
              onChange={(event) =>
                onSegmentChange(
                  updateImplementation(segment, {
                    layout: event.currentTarget.value as StatsDashboardSpec["layout"],
                  }),
                )
              }
            >
              <option value="hero-metric">Hero metric</option>
              <option value="single">Single</option>
              <option value="split">Split</option>
              <option value="grid">Grid</option>
              <option value="timeline">Timeline</option>
            </select>
          </label>
          <label className="text-xs font-medium text-foreground">
            帧数
            <input
              className={inputClassName}
              min={30}
              type="number"
              value={segment.implementation.durationInFrames}
              onChange={(event) =>
                onSegmentChange(
                  updateImplementation(segment, {
                    durationInFrames: parsePositiveInteger(
                      event.currentTarget.value,
                      segment.implementation.durationInFrames,
                      30,
                      1200,
                    ),
                  }),
                )
              }
            />
          </label>
        </div>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <label className={fieldClassName}>
          前导文案
          <input
            className={inputClassName}
            value={segment.implementation.kicker ?? ""}
            onChange={(event) =>
              onSegmentChange(updateImplementation(segment, { kicker: event.currentTarget.value }))
            }
          />
        </label>
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
        <label className={fieldClassName}>
          页脚说明
          <textarea
            className={`${inputClassName} min-h-14`}
            value={segment.implementation.footerNote ?? ""}
            onChange={(event) =>
              onSegmentChange(
                updateImplementation(segment, { footerNote: event.currentTarget.value }),
              )
            }
          />
        </label>
      </div>

      <div className="mt-3 grid gap-2">
        <label className={fieldClassName}>
          Blocks JSON
          <textarea
            className={`${inputClassName} min-h-52 font-mono text-[11px] leading-relaxed`}
            value={blocksJson}
            onChange={(event) =>
              onSegmentChange(
                updateImplementation(segment, {
                  blocks: parseJsonArray<StatsDashboardSpec["blocks"][number]>(
                    event.currentTarget.value,
                    segment.implementation.blocks,
                  ),
                }),
              )
            }
          />
        </label>
        <label className={fieldClassName}>
          Timeline JSON（可留空数组，按布局同屏展示）
          <textarea
            className={`${inputClassName} min-h-36 font-mono text-[11px] leading-relaxed`}
            value={timelineJson}
            onChange={(event) => {
              const timeline = parseJsonArray<NonNullable<StatsDashboardSpec["timeline"]>[number]>(
                event.currentTarget.value,
                segment.implementation.timeline ?? [],
              );
              onSegmentChange(
                updateImplementation(segment, {
                  timeline: timeline.length ? timeline : undefined,
                }),
              );
            }}
          />
        </label>
      </div>
    </Card>
  );
};
