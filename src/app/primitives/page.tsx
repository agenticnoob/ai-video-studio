"use client";

import { Player } from "@remotion/player";
import type { NextPage } from "next";
import { useMemo, useState } from "react";

import {
  PrimitiveCatalogPreview,
  defaultPrimitiveCatalogId,
  primitiveCatalog,
  type PrimitiveCatalogId,
} from "../../remotion/catalog";

const categoryLabels = {
  background: "背景",
  chart: "图表",
  cinematic: "电影感",
  logo: "Logo",
  media: "媒体",
  scene: "场景",
  text: "文字",
  transition: "转场",
} as const;

const PrimitiveCatalogPage: NextPage = () => {
  const [selectedId, setSelectedId] = useState<PrimitiveCatalogId>(defaultPrimitiveCatalogId);
  const selectedEntry = useMemo(
    () => primitiveCatalog.find((entry) => entry.id === selectedId) ?? primitiveCatalog[0],
    [selectedId],
  );

  return (
    <main className="mx-auto max-w-screen-2xl px-4 py-8 text-foreground">
      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="rounded-geist border border-unfocused-border-color bg-background p-5">
          <div className="text-xs uppercase tracking-[0.22em] text-foreground">
            Remotion primitives
          </div>
          <h1 className="mt-3 text-2xl font-bold text-foreground">组件预览</h1>
          <p className="mt-3 text-sm leading-6 text-foreground">
            这里展示的是内部 Remotion primitive，不是产品里的 segment template。
          </p>

          <div className="mt-5 max-h-[calc(100vh-220px)] space-y-2 overflow-y-auto pr-1">
            {primitiveCatalog.map((entry) => {
              const isSelected = entry.id === selectedId;

              return (
                <button
                  className={`w-full rounded-geist border p-3 text-left transition ${
                    isSelected
                      ? "border-foreground bg-foreground text-background"
                      : "border-unfocused-border-color bg-background hover:border-focused-border-color"
                  }`}
                  key={entry.id}
                  onClick={() => setSelectedId(entry.id)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div
                        className={
                          isSelected
                            ? "text-sm font-semibold"
                            : "text-sm font-semibold text-foreground"
                        }
                      >
                        {entry.label}
                      </div>
                      <div className="mt-1 text-xs">{categoryLabels[entry.category]}</div>
                    </div>
                    <div className="shrink-0 rounded-geist border border-current px-2 py-1 text-xs">
                      {entry.status}
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-5">{entry.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        <div className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <section className="overflow-hidden rounded-geist border border-unfocused-border-color bg-background">
            <Player
              acknowledgeRemotionLicense
              component={PrimitiveCatalogPreview}
              compositionHeight={720}
              compositionWidth={1280}
              controls
              durationInFrames={selectedEntry.durationInFrames}
              fps={30}
              inputProps={{ selectedId }}
              loop
              style={{ width: "100%" }}
            />
          </section>

          <section className="rounded-geist border border-unfocused-border-color bg-background p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">{selectedEntry.label}</h2>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  {selectedEntry.description}
                </p>
              </div>
              <div className="rounded-geist border border-unfocused-border-color px-3 py-2 text-sm text-foreground">
                {categoryLabels[selectedEntry.category]}
              </div>
            </div>

            <div className="mt-4 grid gap-3 text-sm text-foreground sm:grid-cols-3">
              <div>
                <div className="text-xs uppercase text-foreground">ID</div>
                <div className="mt-1 font-mono text-foreground">{selectedEntry.id}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-foreground">Source</div>
                <div className="mt-1 font-mono text-foreground">{selectedEntry.source.file}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-foreground">Commit</div>
                <div className="mt-1 font-mono text-foreground">
                  {selectedEntry.source.commit.slice(0, 7)}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default PrimitiveCatalogPage;
