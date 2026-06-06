import type { FC } from "react";

import type { TemplateEditorProps } from "../editor-types";
import type { SpotlightSegment } from "./schema";

export const SpotlightEditor: FC<TemplateEditorProps<SpotlightSegment>> = ({
  inputClassName,
  parsePositiveInteger,
  segment,
  onSegmentChange,
}) => {
  return (
    <div className="mt-6 border-t border-unfocused-border-color pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">Spotlight 内容</h3>
        <label className="w-36 text-sm font-medium text-foreground">
          帧数
          <input
            className={inputClassName}
            min={30}
            type="number"
            value={segment.implementation.durationInFrames}
            onChange={(event) =>
              onSegmentChange({
                ...segment,
                implementation: {
                  ...segment.implementation,
                  durationInFrames: parsePositiveInteger(
                    event.currentTarget.value,
                    segment.implementation.durationInFrames,
                    30,
                    900,
                  ),
                },
              })
            }
          />
        </label>
      </div>

      <label className="mt-3 block text-sm font-medium text-foreground">
        前导文案
        <input
          className={inputClassName}
          value={segment.implementation.kicker ?? ""}
          onChange={(event) =>
            onSegmentChange({
              ...segment,
              implementation: {
                ...segment.implementation,
                kicker: event.currentTarget.value,
              },
            })
          }
        />
      </label>
      <label className="mt-3 block text-sm font-medium text-foreground">
        主标题
        <input
          className={inputClassName}
          value={segment.implementation.headline}
          onChange={(event) =>
            onSegmentChange({
              ...segment,
              implementation: {
                ...segment.implementation,
                headline: event.currentTarget.value,
              },
            })
          }
        />
      </label>
      <label className="mt-3 block text-sm font-medium text-foreground">
        副标题
        <textarea
          className={`${inputClassName} min-h-20`}
          value={segment.implementation.subheadline ?? ""}
          onChange={(event) =>
            onSegmentChange({
              ...segment,
              implementation: {
                ...segment.implementation,
                subheadline: event.currentTarget.value,
              },
            })
          }
        />
      </label>
      <label className="mt-3 block text-sm font-medium text-foreground">
        强调点
        <textarea
          className={`${inputClassName} min-h-28`}
          value={segment.implementation.callouts.join("\n")}
          onChange={(event) => {
            const callouts = event.currentTarget.value
              .split(/\r?\n/)
              .map((callout) => callout.trim())
              .filter(Boolean)
              .slice(0, 4);
            onSegmentChange({
              ...segment,
              implementation: {
                ...segment.implementation,
                callouts: callouts.length ? callouts : [""],
              },
            });
          }}
        />
      </label>
    </div>
  );
};
