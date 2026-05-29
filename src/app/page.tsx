"use client";

import { Player } from "@remotion/player";
import type { NextPage } from "next";
import { useMemo, useState } from "react";
import { sampleVideo } from "../lib/sample-video";
import { getVideoDuration, type VideoScene, type VideoSpec, videoSpecSchema } from "../lib/video-schema";
import { ScriptedVideo } from "../remotion/ScriptedVideo/ScriptedVideo";

type GenerateResponse = {
  spec?: VideoSpec;
  error?: string;
};

const inputClassName =
  "mt-2 w-full rounded-geist border border-unfocused-border-color bg-background px-3 py-2 text-sm outline-none focus:border-focused-border-color";

const sectionClassName = "rounded-geist border border-unfocused-border-color bg-background p-5";

const defaultBrief =
  "Create a concise product demo video for AI Video Studio. Show how a user writes a brief, receives a structured video spec, tunes scenes, and previews the result.";

const parsePositiveInteger = (value: string, fallback: number, min: number, max: number) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(min, Math.min(max, Math.round(parsed)));
};

const replaceScene = (spec: VideoSpec, index: number, scene: VideoScene): VideoSpec => ({
  ...spec,
  scenes: spec.scenes.map((currentScene, currentIndex) => (currentIndex === index ? scene : currentScene)),
});

const Home: NextPage = () => {
  const [brief, setBrief] = useState(defaultBrief);
  const [spec, setSpec] = useState<VideoSpec>(sampleVideo);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const durationInFrames = useMemo(() => getVideoDuration(spec), [spec]);
  const durationSeconds = Math.round((durationInFrames / spec.meta.fps) * 10) / 10;

  const generateSpec = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief }),
      });
      const data = (await response.json()) as GenerateResponse;

      if (!response.ok || !data.spec) {
        throw new Error(data.error ?? "Failed to generate a video spec.");
      }

      setSpec(videoSpecSchema.parse(data.spec));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to generate a video spec.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="mx-auto max-w-screen-xl px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className={sectionClassName}>
            <div className="text-xs uppercase tracking-[0.22em] text-neutral-500">AI Video Studio</div>
            <h1 className="mt-3 text-2xl font-bold text-foreground">First-pass video workflow</h1>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Write a brief, generate a validated structured spec, edit the result, and preview the video live.
            </p>

            <label className="mt-5 block text-sm font-medium text-foreground">
              Creative brief
              <textarea
                className={`${inputClassName} min-h-36 resize-y`}
                value={brief}
                onChange={(event) => setBrief(event.currentTarget.value)}
              />
            </label>

            <button
              className="mt-4 w-full rounded-geist border border-foreground bg-foreground px-4 py-2 text-sm font-semibold text-background disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isGenerating}
              onClick={generateSpec}
              type="button"
            >
              {isGenerating ? "Generating spec..." : "Generate structured spec"}
            </button>

            {error ? (
              <div className="mt-4 rounded-geist border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}
          </section>

          <section className={sectionClassName}>
            <h2 className="text-base font-semibold text-foreground">Meta</h2>
            <label className="mt-3 block text-sm font-medium text-foreground">
              Title
              <input
                className={inputClassName}
                value={spec.meta.title}
                onChange={(event) =>
                  setSpec((current) => ({
                    ...current,
                    meta: { ...current.meta, title: event.currentTarget.value },
                  }))
                }
              />
            </label>

            <div className="mt-3 grid grid-cols-3 gap-3">
              <label className="block text-sm font-medium text-foreground">
                FPS
                <input
                  className={inputClassName}
                  min={12}
                  max={60}
                  type="number"
                  value={spec.meta.fps}
                  onChange={(event) =>
                    setSpec((current) => ({
                      ...current,
                      meta: {
                        ...current.meta,
                        fps: parsePositiveInteger(event.currentTarget.value, current.meta.fps, 12, 60),
                      },
                    }))
                  }
                />
              </label>
              <label className="block text-sm font-medium text-foreground">
                Width
                <input
                  className={inputClassName}
                  min={320}
                  type="number"
                  value={spec.meta.width}
                  onChange={(event) =>
                    setSpec((current) => ({
                      ...current,
                      meta: {
                        ...current.meta,
                        width: parsePositiveInteger(event.currentTarget.value, current.meta.width, 320, 3840),
                      },
                    }))
                  }
                />
              </label>
              <label className="block text-sm font-medium text-foreground">
                Height
                <input
                  className={inputClassName}
                  min={320}
                  type="number"
                  value={spec.meta.height}
                  onChange={(event) =>
                    setSpec((current) => ({
                      ...current,
                      meta: {
                        ...current.meta,
                        height: parsePositiveInteger(event.currentTarget.value, current.meta.height, 320, 2160),
                      },
                    }))
                  }
                />
              </label>
            </div>
          </section>

          <section className={sectionClassName}>
            <h2 className="text-base font-semibold text-foreground">Theme</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {(["background", "panel", "primary", "secondary", "text", "muted"] as const).map((key) => (
                <label key={key} className="block text-sm font-medium capitalize text-foreground">
                  {key}
                  <input
                    className={inputClassName}
                    value={spec.theme[key]}
                    onChange={(event) =>
                      setSpec((current) => ({
                        ...current,
                        theme: { ...current.theme, [key]: event.currentTarget.value },
                      }))
                    }
                  />
                </label>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="overflow-hidden rounded-geist border border-unfocused-border-color bg-background shadow-[0_0_120px_rgba(0,0,0,0.10)]">
            <Player
              acknowledgeRemotionLicense
              autoPlay
              component={ScriptedVideo}
              compositionHeight={spec.meta.height}
              compositionWidth={spec.meta.width}
              controls
              durationInFrames={durationInFrames}
              fps={spec.meta.fps}
              inputProps={spec}
              loop
              style={{ width: "100%" }}
            />
          </section>

          <section className={sectionClassName}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-foreground">Editable scenes</h2>
              <div className="text-sm text-neutral-500">
                {spec.scenes.length} scenes · {durationSeconds}s
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {spec.scenes.map((scene, index) => (
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
                          setSpec((current) => replaceScene(current, index, nextScene));
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
                        setSpec((current) => replaceScene(current, index, { ...scene, kicker: event.currentTarget.value }))
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
                            setSpec((current) =>
                              replaceScene(current, index, { ...scene, title: event.currentTarget.value }),
                            )
                          }
                        />
                      </label>
                      <label className="mt-3 block text-sm font-medium text-foreground">
                        Subtitle
                        <textarea
                          className={`${inputClassName} min-h-20`}
                          value={scene.subtitle ?? ""}
                          onChange={(event) =>
                            setSpec((current) =>
                              replaceScene(current, index, { ...scene, subtitle: event.currentTarget.value }),
                            )
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
                            setSpec((current) =>
                              replaceScene(current, index, { ...scene, title: event.currentTarget.value }),
                            )
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
                            setSpec((current) =>
                              replaceScene(current, index, { ...scene, bullets: bullets.length ? bullets : [""] }),
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
                            setSpec((current) =>
                              replaceScene(current, index, { ...scene, quote: event.currentTarget.value }),
                            )
                          }
                        />
                      </label>
                      <label className="mt-3 block text-sm font-medium text-foreground">
                        Author
                        <input
                          className={inputClassName}
                          value={scene.author ?? ""}
                          onChange={(event) =>
                            setSpec((current) =>
                              replaceScene(current, index, { ...scene, author: event.currentTarget.value }),
                            )
                          }
                        />
                      </label>
                    </>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Home;
