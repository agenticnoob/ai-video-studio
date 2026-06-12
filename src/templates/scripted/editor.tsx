import type { FC } from "react";

import { Card } from "../../components/ui/Card";
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
  const fieldClassName = "block text-xs font-medium text-foreground";

  return (
    <Card className="mt-5" tone="nested">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">Scripted 场景</h3>
        <div className="text-sm text-foreground">{segment.implementation.scenes.length} 个场景</div>
      </div>

      <div className="mt-3 space-y-3">
        {segment.implementation.scenes.map((scene, index) => (
          <Card key={scene.id} className="p-3" tone="item">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-foreground">
                  场景 {index + 1}：{sceneTypeLabelMap[scene.type]}
                </div>
                <div className="text-xs text-foreground">{scene.id}</div>
              </div>
              <label className="w-28 text-xs font-medium text-foreground">
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

            <label className={`${fieldClassName} mt-2`}>
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
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                <label className={fieldClassName}>
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
                <label className={fieldClassName}>
                  副标题
                  <textarea
                    className={`${inputClassName} min-h-14`}
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
              </div>
            ) : null}

            {scene.type === "bullets" ? (
              <div className="mt-2 grid gap-2 md:grid-cols-[minmax(200px,0.8fr)_minmax(260px,1.2fr)]">
                <label className={fieldClassName}>
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
                <label className={fieldClassName}>
                  要点列表
                  <textarea
                    className={`${inputClassName} min-h-16`}
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
              </div>
            ) : null}

            {scene.type === "quote" ? (
              <div className="mt-2 grid gap-2 md:grid-cols-[minmax(260px,1.2fr)_minmax(180px,0.8fr)]">
                <label className={fieldClassName}>
                  引语
                  <textarea
                    className={`${inputClassName} min-h-16`}
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
                <label className={fieldClassName}>
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
              </div>
            ) : null}
          </Card>
        ))}
      </div>
    </Card>
  );
};
