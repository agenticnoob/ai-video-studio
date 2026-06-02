import React from "react";
import type { State } from "../helpers/use-rendering";
import { Button } from "./Button";

const formatSize = (sizeInBytes: number): string => {
  return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const RenderControls: React.FC<{
  disabled?: boolean;
  onDismissResult: () => void;
  onRender: () => void;
  state: State;
}> = ({ disabled = false, onDismissResult, onRender, state }) => {
  const isRendering = state.status === "rendering";

  return (
    <section className="rounded-geist border border-unfocused-border-color bg-background p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">本地导出</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            使用当前编辑态 VideoProject 触发本地 Remotion render；每次成功导出都会生成唯一产物，
            同时刷新稳定副本 latest.mp4。
          </p>
        </div>
        <div className="rounded-geist border border-unfocused-border-color px-3 py-1 text-xs uppercase text-neutral-500">
          {state.status}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button disabled={disabled || isRendering} loading={isRendering} onClick={onRender}>
          {isRendering ? "正在导出..." : "导出最新视频"}
        </Button>
        {(state.status === "success" || state.status === "failure") && !isRendering ? (
          <Button secondary onClick={onDismissResult}>
            清除状态
          </Button>
        ) : null}
      </div>

      {state.status === "idle" ? (
        <p className="mt-4 text-sm text-neutral-500">
          稳定输出路径：<span className="font-mono text-foreground">out/renders/latest.mp4</span>
        </p>
      ) : null}

      {state.status === "rendering" ? (
        <div className="mt-4 rounded-geist border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          正在渲染当前预览对应的视频。如果编辑态发生变化，当前请求会被安全丢弃并回到 idle。
        </div>
      ) : null}

      {state.status === "failure" ? (
        <div className="mt-4 rounded-geist border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      ) : null}

      {state.status === "success" ? (
        <div className="mt-4 rounded-geist border border-emerald-300 bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
          <div className="font-medium">导出成功</div>
          <div className="mt-2">
            本次导出：<span className="font-mono text-emerald-900">{state.outputPath}</span>
          </div>
          <div className="mt-1">
            稳定副本：<span className="font-mono text-emerald-900">{state.latestOutputPath}</span>
          </div>
          <div className="mt-1">
            Render ID：<span className="font-mono text-emerald-900">{state.renderId}</span>
          </div>
          <div className="mt-1">文件大小：{formatSize(state.sizeInBytes)}</div>
          <div className="mt-3 flex flex-wrap gap-3">
            <a
              className="inline-flex rounded-geist border border-emerald-700 px-3 py-2 font-medium text-emerald-900 transition hover:bg-emerald-100"
              href={state.downloadUrl}
            >
              下载本次导出文件
            </a>
            <a
              className="inline-flex rounded-geist border border-emerald-700 px-3 py-2 font-medium text-emerald-900 transition hover:bg-emerald-100"
              href={state.latestDownloadUrl}
            >
              下载 latest.mp4
            </a>
          </div>
        </div>
      ) : null}
    </section>
  );
};
