import type { FC } from "react";

import type { VideoSegment } from "../../lib/project-schema";
import type { VideoScene } from "../../lib/video-schema";

type SegmentEditorProps = {
  segment: VideoSegment | null;
  revisionPrompt: string;
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

const replaceScene = (segment: VideoSegment, index: number, scene: VideoScene): VideoSegment => ({
  ...segment,
  implementation: {
    ...segment.implementation,
    scenes: segment.implementation.scenes.map((currentScene, currentIndex) =>
      currentIndex === index ? scene : currentScene,
    ),
  },
});

export const SegmentEditor: FC<SegmentEditorProps> = ({
  segment,
  revisionPrompt,
  onRevisionPromptChange,
  onSegmentChange,
}) => {
  if (!segment) {
    return (
      <section className="rounded-geist border border-unfocused-border-color bg-background p-5">
        <h2 className="text-base font-semibold text-foreground">Selected segment</h2>
        <p className="mt-3 text-sm text-neutral-600">Select a segment to edit its details.</p>
      </section>
    );
  }

  return (
    <section className="rounded-geist border border-unfocused-border-color bg-background p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Selected segment</h2>
          <div className="mt-1 text-xs text-neutral-500">{segment.id}</div>
        </div>
        <div className="rounded-geist border border-unfocused-border-color px-3 py-1 text-xs uppercase text-neutral-500">
          {segment.templateId}
        </div>
      </div>

      <label className="mt-4 block text-sm font-medium text-foreground">
        Natural-language revision
        <textarea
          className={`${inputClassName} min-h-24 resize-y`}
          placeholder="Describe how this segment should change in the next regeneration pass."
          value={revisionPrompt}
          onChange={(event) => onRevisionPromptChange(event.currentTarget.value)}
        />
      </label>
      <button
        className="mt-3 rounded-geist border border-unfocused-border-color px-4 py-2 text-sm font-semibold text-neutral-500"
        disabled
        type="button"
      >
        Regenerate segment later
      </button>

      <div className="mt-6 border-t border-unfocused-border-color pt-5">
        <h3 className="text-sm font-semibold text-foreground">Segment details</h3>
        <label className="mt-3 block text-sm font-medium text-foreground">
          Title
          <input
            className={inputClassName}
            value={segment.title}
            onChange={(event) =>
              onSegmentChange({
                ...segment,
                title: event.currentTarget.value,
                implementation: {
                  ...segment.implementation,
                  meta: {
                    ...segment.implementation.meta,
                    title: event.currentTarget.value,
                  },
                },
              })
            }
          />
        </label>
        <label className="mt-3 block text-sm font-medium text-foreground">
          Intent
          <textarea
            className={`${inputClassName} min-h-20`}
            value={segment.intent}
            onChange={(event) => onSegmentChange({ ...segment, intent: event.currentTarget.value })}
          />
        </label>
      </div>

      <div className="mt-6 border-t border-unfocused-border-color pt-5">
        <h3 className="text-sm font-semibold text-foreground">Theme</h3>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {(["background", "panel", "primary", "secondary", "text", "muted"] as const).map((key) => (
            <label key={key} className="block text-sm font-medium capitalize text-foreground">
              {key}
              <input
                className={inputClassName}
                value={segment.implementation.theme[key]}
                onChange={(event) =>
                  onSegmentChange({
                    ...segment,
                    implementation: {
                      ...segment.implementation,
                      theme: {
                        ...segment.implementation.theme,
                        [key]: event.currentTarget.value,
                      },
                    },
                  })
                }
              />
            </label>
          ))}
        </div>
      </div>

      <div className="mt-6 border-t border-unfocused-border-color pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-foreground">Structured scenes</h3>
          <div className="text-sm text-neutral-500">{segment.implementation.scenes.length} scenes</div>
        </div>

        <div className="mt-4 space-y-4">
          {segment.implementation.scenes.map((scene, index) => (
            <div key={scene.id} className="rounded-geist border border-unfocused-border-color p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    Scene {index + 1}: {scene.type}
                  </div>
                  <div className="text-xs text-neutral-500">{scene.id}</div>
                </div>
                <label className="w-32 text-sm font-medium text-foreground">
                  Frames
                  <input
                    className={inputClassName}
                    min={12}
                    type="number"
                    value={scene.duration}
                    onChange={(event) => {
                      const nextScene = {
                        ...scene,
                        duration: parsePositiveInteger(event.currentTarget.value, scene.duration, 12, 900),
                      };
                      onSegmentChange(replaceScene(segment, index, nextScene));
                    }}
                  />
                </label>
              </div>

              <label className="mt-3 block text-sm font-medium text-foreground">
                Kicker
                <input
                  className={inputClassName}
                  value={scene.kicker ?? ""}
                  onChange={(event) =>
                    onSegmentChange(replaceScene(segment, index, { ...scene, kicker: event.currentTarget.value }))
                  }
                />
              </label>

              {scene.type === "title" ? (
                <>
                  <label className="mt-3 block text-sm font-medium text-foreground">
                    Title
                    <input
                      className={inputClassName}
                      value={scene.title}
                      onChange={(event) =>
                        onSegmentChange(replaceScene(segment, index, { ...scene, title: event.currentTarget.value }))
                      }
                    />
                  </label>
                  <label className="mt-3 block text-sm font-medium text-foreground">
                    Subtitle
                    <textarea
                      className={`${inputClassName} min-h-20`}
                      value={scene.subtitle ?? ""}
                      onChange={(event) =>
                        onSegmentChange(replaceScene(segment, index, { ...scene, subtitle: event.currentTarget.value }))
                      }
                    />
                  </label>
                </>
              ) : null}

              {scene.type === "bullets" ? (
                <>
                  <label className="mt-3 block text-sm font-medium text-foreground">
                    Title
                    <input
                      className={inputClassName}
                      value={scene.title}
                      onChange={(event) =>
                        onSegmentChange(replaceScene(segment, index, { ...scene, title: event.currentTarget.value }))
                      }
                    />
                  </label>
                  <label className="mt-3 block text-sm font-medium text-foreground">
                    Bullets
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
                    Quote
                    <textarea
                      className={`${inputClassName} min-h-24`}
                      value={scene.quote}
                      onChange={(event) =>
                        onSegmentChange(replaceScene(segment, index, { ...scene, quote: event.currentTarget.value }))
                      }
                    />
                  </label>
                  <label className="mt-3 block text-sm font-medium text-foreground">
                    Author
                    <input
                      className={inputClassName}
                      value={scene.author ?? ""}
                      onChange={(event) =>
                        onSegmentChange(replaceScene(segment, index, { ...scene, author: event.currentTarget.value }))
                      }
                    />
                  </label>
                </>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
