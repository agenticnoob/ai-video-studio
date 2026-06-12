import { useEffect, useMemo, useState, type FC } from "react";
import type { TaskProgress } from "../../lib/task-progress";
import { Card } from "./Card";

type ActivityProgressProps = {
  detail: string;
  finishedAt?: number;
  idleDetail?: string;
  idleLabel: string;
  label: string;
  startedAt?: number;
  status: "idle" | "running" | "success" | "failure";
  taskProgress?: TaskProgress | null;
};

const formatElapsed = (milliseconds: number): string => {
  const totalSeconds = Math.max(0, Math.round(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds} 秒`;
  }

  return `${minutes} 分 ${seconds.toString().padStart(2, "0")} 秒`;
};

const statusLabelMap = {
  failure: "失败",
  idle: "未开始",
  running: "进行中",
  success: "已完成",
} as const;

export const ActivityProgress: FC<ActivityProgressProps> = ({
  detail,
  finishedAt,
  idleDetail,
  idleLabel,
  label,
  startedAt,
  status,
  taskProgress,
}) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (status !== "running") {
      return;
    }

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [status]);

  const elapsed = useMemo(() => {
    if (!startedAt) {
      return null;
    }

    return formatElapsed((finishedAt ?? now) - startedAt);
  }, [finishedAt, now, startedAt]);

  return (
    <Card className="text-foreground" tone="panel">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-medium">
        <span>{status === "idle" ? idleLabel : label}</span>
        <span className="bg-foreground px-2 py-1 text-xs uppercase text-background">
          {statusLabelMap[status]}
        </span>
      </div>
      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-[1fr_auto]">
        <div>{status === "idle" ? (idleDetail ?? detail) : detail}</div>
        <div className="font-mono">{elapsed ? `耗时 ${elapsed}` : "等待请求"}</div>
      </div>
      {taskProgress?.steps.length ? (
        <div className="mt-4">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {taskProgress.steps.map((step, index) => {
              const isComplete = step.status === "success";
              const isActive = step.status === "running";
              const isFailure = step.status === "failure";

              return (
                <div
                  key={step.label}
                  className={`flex items-center gap-2 text-xs ${
                    isComplete || isActive ? "font-semibold" : ""
                  }`}
                >
                  <span
                    className={
                      isComplete || isActive
                        ? "bg-foreground px-1.5 py-0.5 font-mono text-background"
                        : "font-mono"
                    }
                  >
                    {isComplete ? "✓" : isFailure ? "!" : index + 1}
                  </span>
                  <span>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
      {status === "running" ? (
        <div className="mt-3 text-xs leading-5">正在等待后台任务返回结果。</div>
      ) : null}
    </Card>
  );
};
