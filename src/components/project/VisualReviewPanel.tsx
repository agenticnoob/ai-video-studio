import Image from "next/image";
import type { FC } from "react";

import type { VisualReviewState } from "../../helpers/use-visual-review";
import { useTaskProgress } from "../../helpers/use-task-progress";
import { ActivityProgress } from "../ui/ActivityProgress";
import { Card } from "../ui/Card";

type VisualReviewPanelProps = {
  disabled: boolean;
  onDismissResult: () => void;
  onReview: () => void;
  state: VisualReviewState;
};

const findingSeverityLabelMap = {
  error: "错误",
  info: "提示",
  warning: "警告",
} as const;

const reviewReasonLabelMap = {
  segment_end: "结尾",
  segment_midpoint: "中段",
  segment_start: "开头",
} as const;

const stillAnalysisStatusLabelMap = {
  analyzed: "已分析",
  fine_detail_frame: "细节风险",
  low_contrast_frame: "低对比",
  near_blank_frame: "近空帧",
  unsafe_margin_frame: "边距风险",
  unsupported: "未分析",
} as const;

export const VisualReviewPanel: FC<VisualReviewPanelProps> = ({
  disabled,
  onDismissResult,
  onReview,
  state,
}) => {
  const isReviewing = state.status === "reviewing";
  const taskProgress = useTaskProgress(
    state.status === "idle" ? undefined : state.progressId,
    isReviewing,
  );

  return (
    <Card as="section" tone="panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-foreground">Visual Review</div>
          <h2 className="mt-2 text-lg font-semibold text-foreground">视觉复核</h2>
          <p className="mt-2 text-sm leading-6 text-foreground">
            截取每个分镜的开头、中段和结尾画面，并返回静态复核发现。
          </p>
        </div>
        <button
          className="rounded-geist border border-foreground bg-foreground px-4 py-2 text-sm font-semibold text-background disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled || isReviewing}
          onClick={onReview}
          type="button"
        >
          {isReviewing ? "正在复核..." : "复核画面"}
        </button>
      </div>

      <div className="mt-4">
        <ActivityProgress
          detail={
            isReviewing
              ? "正在渲染代表帧截图。"
              : state.status === "success"
                ? `已生成 ${state.extraction.stillCount} 张代表帧截图。`
                : state.status === "failure"
                  ? "复核请求失败。"
                  : "点击复核后会生成当前项目的代表帧截图。"
          }
          finishedAt={
            state.status === "success" || state.status === "failure" ? state.finishedAt : undefined
          }
          idleDetail="当前没有复核结果。"
          idleLabel="复核状态"
          label={isReviewing ? "视觉复核请求" : "最近一次视觉复核"}
          startedAt={state.status === "idle" ? undefined : state.startedAt}
          status={
            state.status === "reviewing"
              ? "running"
              : state.status === "success" || state.status === "failure"
                ? state.status
                : "idle"
          }
          taskProgress={taskProgress}
        />
      </div>

      {state.status === "failure" ? (
        <div className="mt-4 text-sm font-medium text-foreground">{state.error}</div>
      ) : null}

      {state.status === "success" ? (
        <div className="mt-4 space-y-4">
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-geist border border-panel-border-color bg-background/40 p-3">
              <div className="text-xs uppercase tracking-[0.16em]">发现</div>
              <div className="mt-2 text-xl font-semibold">{state.visualReview.findingCount}</div>
            </div>
            <div className="rounded-geist border border-panel-border-color bg-background/40 p-3">
              <div className="text-xs uppercase tracking-[0.16em]">警告</div>
              <div className="mt-2 text-xl font-semibold">{state.visualReview.warningCount}</div>
            </div>
            <div className="rounded-geist border border-panel-border-color bg-background/40 p-3">
              <div className="text-xs uppercase tracking-[0.16em]">错误</div>
              <div className="mt-2 text-xl font-semibold">{state.visualReview.errorCount}</div>
            </div>
          </div>

          {state.visualReview.findings.length ? (
            <div className="space-y-2">
              {state.visualReview.findings.slice(0, 4).map((finding, index) => (
                <div
                  className="rounded-geist border border-panel-border-color bg-background/40 p-3 text-sm leading-6"
                  key={`${finding.targetId ?? "project"}-${finding.frame ?? "any"}-${index}`}
                >
                  <div className="font-semibold">
                    {findingSeverityLabelMap[finding.severity]}
                    {finding.frame !== undefined ? ` · frame ${finding.frame}` : ""}
                  </div>
                  <div className="mt-1">{finding.message}</div>
                  {finding.suggestedRepair ? (
                    <div className="mt-1 text-xs">{finding.suggestedRepair}</div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-geist border border-panel-border-color bg-background/40 p-3 text-sm">
              静态复核没有发现确定性问题。
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {state.extraction.stills.map((still) => (
              <a
                className="block rounded-geist border border-panel-border-color bg-background/40 p-2 text-sm text-foreground"
                href={still.downloadUrl}
                key={still.stillId}
                rel="noreferrer"
                target="_blank"
              >
                <div className="relative aspect-video w-full overflow-hidden rounded-geist border border-panel-border-color">
                  <Image
                    unoptimized
                    alt={`${still.segmentId} ${reviewReasonLabelMap[still.reason]} frame ${still.frame}`}
                    className="object-cover"
                    fill
                    sizes="(min-width: 1280px) 220px, (min-width: 640px) 40vw, 90vw"
                    src={still.downloadUrl}
                  />
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <span>{reviewReasonLabelMap[still.reason]}</span>
                  <span className="font-mono text-xs">frame {still.frame}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span>{stillAnalysisStatusLabelMap[still.analysis.status]}</span>
                  <span className="font-mono">
                    blank {Math.round(still.analysis.blankFrameScore * 100)}%
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span>contrast</span>
                  <span className="font-mono">
                    {Math.round(still.analysis.contrastScore * 100)}%
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span>margin</span>
                  <span className="font-mono">
                    {Math.round(still.analysis.edgeContentRatio * 100)}%
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span>detail</span>
                  <span className="font-mono">
                    {Math.round(still.analysis.fineDetailRatio * 100)}%
                  </span>
                </div>
              </a>
            ))}
          </div>

          <button
            className="rounded-geist border border-panel-border-color px-3 py-2 text-sm font-semibold"
            onClick={onDismissResult}
            type="button"
          >
            清除复核结果
          </button>
        </div>
      ) : null}
    </Card>
  );
};
