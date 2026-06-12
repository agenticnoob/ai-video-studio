"use client";

import { useEffect, useState } from "react";
import type { TaskProgress } from "../lib/task-progress";

type ProgressResponse = {
  progress?: TaskProgress;
};

export const useTaskProgress = (progressId: string | undefined, active: boolean) => {
  const [progress, setProgress] = useState<TaskProgress | null>(null);

  useEffect(() => {
    if (!progressId) {
      setProgress(null);
      return;
    }

    let cancelled = false;

    const fetchProgress = async () => {
      try {
        const response = await fetch(`/api/progress/${encodeURIComponent(progressId)}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as ProgressResponse;

        if (!cancelled) {
          setProgress(data.progress ?? null);
        }
      } catch {
        // Progress polling is best-effort; the primary request still owns errors.
      }
    };

    void fetchProgress();

    if (!active) {
      return () => {
        cancelled = true;
      };
    }

    const interval = window.setInterval(() => {
      void fetchProgress();
    }, 700);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [active, progressId]);

  return progress;
};
