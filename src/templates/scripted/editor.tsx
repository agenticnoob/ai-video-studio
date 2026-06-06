import type { FC } from "react";

import type { VideoScene } from "../../lib/video-schema";
import type { TemplateEditorProps } from "../editor-types";
import type { ScriptedSegment } from "./schema";

const sceneTypeLabelMap = {
  title: "标题",
  bullets: "要点",
  quote: "引语",
} as const;

const replaceScene = (
  segment: ScriptedSegment,
  index: number,
  scene: VideoScene,
): ScriptedSegment => ({
  ...segment,
  implementation: {
    ...segment.implementation,
    scenes: segment.implementation.scenes.map((currentScene, currentIndex) =>
      currentIndex === index ? scene : currentScene,
    ),
  },
});

export const ScriptedEditor: FC<TemplateEditorProps<ScriptedSegment>> = ({
  inputClassName,
  parsePositiveInteger,
  segment,
  onSegmentChange,
}) => {
  return (
    <div className="mt-6 border-t border-unfocused-border-color pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">Scripted 场景</h3>
        <div className="text-sm text-neutral-500">
          {segment.implementation.scenes.length} 个场景
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {segment.implementation.scenes.map((scene, index) => (
          <div key={scene.id} className="rounded-geist border border-unfocused-border-color p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-foreground">
                  场景 {index + 1}：{sceneTypeLabelMap[scene.type]}
                </div>
                <div className="text-xs text-neutral-500">{scene.id}</div>
              </div>
              <label className="w-32 text-sm font-medium text-foreground">
                帧数
                <input
                  className={inputClassName}
                  min={12}
                  type="number"
                  value={scene.duration}
                  onChange={(event) => {
                    const nextScene = {
                      ...scene,
                      duration: parsePositiveInteger(
                        event.currentTarget.value,
                        scene.duration,
                        12,
                        900,
                      ),
                    };
                    onSegmentChange(replaceScene(segment, index, nextScene));
                  }}
                />
              </label>
            </div>

            <label className="mt-3 block text-sm font-medium text-foreground">
              前导文案
              <input
                className={inputClassName}
                value={scene.kicker ?? ""}
                onChange={(event) =>
                  onSegmentChange(
                    replaceScene(segment, index, { ...scene, kicker: event.currentTarget.value }),
                  )
                }
              />
            </label>

            {scene.type === "title" ? (
              <>
                <label className="mt-3 block text-sm font-medium text-foreground">
                  标题
                  <input
                    className={inputClassName}
                    value={scene.title}
                    onChange={(event) =>
                      onSegmentChange(
                        replaceScene(segment, index, {
                          ...scene,
                          title: event.currentTarget.value,
                        }),
                      )
                    }
                  />
                </label>
                <label className="mt-3 block text-sm font-medium text-foreground">
                  副标题
                  <textarea
                    className={`${inputClassName} min-h-20`}
                    value={scene.subtitle ?? ""}
                    onChange={(event) =>
                      onSegmentChange(
                        replaceScene(segment, index, {
                          ...scene,
                          subtitle: event.currentTarget.value,
                        }),
                      )
                    }
                  />
                </label>
              </>
            ) : null}

            {scene.type === "bullets" ? (
              <>
                <label className="mt-3 block text-sm font-medium text-foreground">
                  标题
                  <input
                    className={inputClassName}
                    value={scene.title}
                    onChange={(event) =>
                      onSegmentChange(
                        replaceScene(segment, index, {
                          ...scene,
                          title: event.currentTarget.value,
                        }),
                      )
                    }
                  />
                </label>
                <label className="mt-3 block text-sm font-medium text-foreground">
                  要点列表
                  <textarea
                    className={`${inputClassName} min-h-28`}
                    value={scene.bullets.join("\n")}
                    onChange={(event) => {
                      const bullets = event.currentTarget.value
                        .split(/\r?\n/)
                        .map((bullet) => bullet.trim())
                        .filter(Boolean);
                      onSegmentChange(
                        replaceScene(segment, index, {
                          ...scene,
                          bullets: bullets.length ? bullets : [""],
                        }),
                      );
                    }}
                  />
                </label>
              </>
            ) : null}

            {scene.type === "quote" ? (
              <>
                <label className="mt-3 block text-sm font-medium text-foreground">
                  引语
                  <textarea
                    className={`${inputClassName} min-h-24`}
                    value={scene.quote}
                    onChange={(event) =>
                      onSegmentChange(
                        replaceScene(segment, index, {
                          ...scene,
                          quote: event.currentTarget.value,
                        }),
                      )
                    }
                  />
                </label>
                <label className="mt-3 block text-sm font-medium text-foreground">
                  作者
                  <input
                    className={inputClassName}
                    value={scene.author ?? ""}
                    onChange={(event) =>
                      onSegmentChange(
                        replaceScene(segment, index, {
                          ...scene,
                          author: event.currentTarget.value,
                        }),
                      )
                    }
                  />
                </label>
              </>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};
