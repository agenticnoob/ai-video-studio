import React from "react";
import { useTaskProgress } from "../../helpers/use-task-progress";
import type { State } from "../../helpers/use-rendering";
import { ActivityProgress } from "./ActivityProgress";
import { Button } from "./Button";
import { Card } from "./Card";

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
  const taskProgress = useTaskProgress(
    state.status === "idle" ? undefined : state.progressId,
    state.status === "rendering",
  );

  return (
    <Card as="section" tone="panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">本地导出</h2>
          <p className="mt-2 text-sm leading-6 text-foreground">
            使用当前编辑态 VideoProject 触发本地 Remotion render；每次成功导出都会生成唯一产物，
            同时刷新稳定副本 latest.mp4。
          </p>
        </div>
        <div className="bg-foreground px-3 py-1 text-xs uppercase text-background">
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

      <div className="mt-4">
        <ActivityProgress
          detail={
            state.status === "rendering"
              ? "正在等待 /api/render 完成本地 Remotion 渲染。"
              : state.status === "success"
                ? "后端已返回导出文件路径、Render ID 和文件大小。"
                : state.status === "failure"
                  ? "导出请求已结束，后端返回失败或前端解析失败。"
                  : "点击导出后会记录真实请求耗时。"
          }
          finishedAt={
            state.status === "success" || state.status === "failure" ? state.finishedAt : undefined
          }
          idleDetail="当前没有导出请求。"
          idleLabel="导出状态"
          label={state.status === "rendering" ? "导出请求" : "最近一次导出请求"}
          startedAt={state.status === "idle" ? undefined : state.startedAt}
          status={state.status === "rendering" ? "running" : state.status}
          taskProgress={taskProgress}
        />
      </div>

      {state.status === "idle" ? (
        <p className="mt-4 text-sm text-foreground">
          稳定输出路径会使用当前服务端配置的 render 输出目录，并写入 `latest.mp4`。
        </p>
      ) : null}

      {state.status === "rendering" ? (
        <div className="mt-4 text-sm text-foreground">
          正在渲染当前预览对应的视频。如果编辑态发生变化，当前请求会被安全丢弃并回到 idle。
        </div>
      ) : null}

      {state.status === "failure" ? (
        <div className="mt-4 text-sm font-medium text-foreground">{state.error}</div>
      ) : null}

      {state.status === "success" ? (
        <div className="mt-4 text-sm text-foreground">
          <div className="font-medium">导出成功</div>
          <div className="mt-2">
            本次导出：<span className="font-mono text-foreground">{state.outputPath}</span>
          </div>
          <div className="mt-1">
            稳定副本：<span className="font-mono text-foreground">{state.latestOutputPath}</span>
          </div>
          <div className="mt-1">
            Render ID：<span className="font-mono text-foreground">{state.renderId}</span>
          </div>
          <div className="mt-1">文件大小：{formatSize(state.sizeInBytes)}</div>
          <div className="mt-3 flex flex-wrap gap-3">
            <a
              className="inline-flex bg-foreground px-3 py-2 font-medium text-background transition"
              href={state.downloadUrl}
            >
              下载本次导出文件
            </a>
            <a
              className="inline-flex bg-foreground px-3 py-2 font-medium text-background transition"
              href={state.latestDownloadUrl}
            >
              下载稳定副本 latest.mp4
            </a>
          </div>
        </div>
      ) : null}
    </Card>
  );
};
