import type { FC } from "react";

import {
  SCRIPTED_TEMPLATE_ID,
  type SPOTLIGHT_TEMPLATE_ID,
  type VideoSegment,
} from "../../lib/project-schema";
import { getTemplateLabel } from "../../lib/template-registry";
import type { VideoScene } from "../../lib/video-schema";

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

const sceneTypeLabelMap = {
  title: "标题",
  bullets: "要点",
  quote: "引语",
} as const;

type ScriptedSegment = Extract<VideoSegment, { templateId: typeof SCRIPTED_TEMPLATE_ID }>;
type SpotlightSegment = Extract<VideoSegment, { templateId: typeof SPOTLIGHT_TEMPLATE_ID }>;

const replaceScene = (
  segment: ScriptedSegment,
  index: number,
  scene: VideoScene,
): VideoSegment => ({
  ...segment,
  implementation: {
    ...segment.implementation,
    scenes: segment.implementation.scenes.map((currentScene, currentIndex) =>
      currentIndex === index ? scene : currentScene,
    ),
  },
});

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

  const updateTitle = (title: string) => {
    if (segment.templateId === SCRIPTED_TEMPLATE_ID) {
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
      });
      return;
    }

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
    });
  };

  const updateTheme = (key: keyof typeof themeLabelMap, value: string) => {
    if (segment.templateId === SCRIPTED_TEMPLATE_ID) {
      onSegmentChange({
        ...segment,
        implementation: {
          ...segment.implementation,
          theme: {
            ...segment.implementation.theme,
            [key]: value,
          },
        },
      });
      return;
    }

    onSegmentChange({
      ...segment,
      implementation: {
        ...segment.implementation,
        theme: {
          ...segment.implementation.theme,
          [key]: value,
        },
      },
    });
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

      {segment.templateId === SCRIPTED_TEMPLATE_ID ? (
        <ScriptedFields segment={segment} onSegmentChange={onSegmentChange} />
      ) : (
        <SpotlightFields segment={segment} onSegmentChange={onSegmentChange} />
      )}
    </section>
  );
};

const ScriptedFields: FC<{
  segment: ScriptedSegment;
  onSegmentChange: (segment: VideoSegment) => void;
}> = ({ segment, onSegmentChange }) => {
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

const SpotlightFields: FC<{
  segment: SpotlightSegment;
  onSegmentChange: (segment: VideoSegment) => void;
}> = ({ segment, onSegmentChange }) => {
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
