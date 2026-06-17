import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { normalizeProject, type VideoProject } from "../lib/project-schema";
import type {
  VisualReviewDiagnostics,
  VisualReviewStillExtraction,
} from "../lib/visual-review-schema";
import { createProgressId } from "./create-progress-id";

export type VisualReviewState =
  | {
      status: "idle";
    }
  | {
      progressId: string;
      startedAt: number;
      status: "reviewing";
    }
  | {
      extraction: VisualReviewStillExtraction;
      finishedAt: number;
      progressId: string;
      startedAt: number;
      status: "success";
      visualReview: VisualReviewDiagnostics;
    }
  | {
      error: string;
      finishedAt: number;
      progressId: string;
      startedAt: number;
      status: "failure";
    };

type VisualReviewResponse = {
  error?: string;
  extraction?: VisualReviewStillExtraction;
  visualReview?: VisualReviewDiagnostics & {
    stillExtraction?: VisualReviewStillExtraction;
  };
};

const isVisualReviewSuccessResponse = (
  response: VisualReviewResponse,
): response is Required<Pick<VisualReviewResponse, "extraction" | "visualReview">> => {
  return (
    response.extraction?.status === "rendered" &&
    Array.isArray(response.extraction.stills) &&
    response.extraction.stillCount === response.extraction.stills.length &&
    response.visualReview?.status === "static_preflight" &&
    Array.isArray(response.visualReview.findings) &&
    Array.isArray(response.visualReview.reviewFrames)
  );
};

export const useVisualReview = (project: VideoProject) => {
  const normalizedProject = useMemo(() => normalizeProject(project), [project]);
  const projectSignature = useMemo(() => JSON.stringify(normalizedProject), [normalizedProject]);
  const latestProjectSignatureRef = useRef(projectSignature);
  const activeReviewAbortControllerRef = useRef<AbortController | null>(null);
  const reviewAttemptRef = useRef(0);
  const [state, setState] = useState<VisualReviewState>({
    status: "idle",
  });

  useEffect(() => {
    latestProjectSignatureRef.current = projectSignature;
    reviewAttemptRef.current += 1;
    activeReviewAbortControllerRef.current?.abort();
    activeReviewAbortControllerRef.current = null;
    setState({ status: "idle" });
  }, [projectSignature]);

  const reviewProject = useCallback(async () => {
    const requestSignature = projectSignature;
    const reviewAttempt = reviewAttemptRef.current + 1;
    const abortController = new AbortController();
    const startedAt = Date.now();
    const progressId = createProgressId();

    activeReviewAbortControllerRef.current?.abort();
    activeReviewAbortControllerRef.current = abortController;
    reviewAttemptRef.current = reviewAttempt;
    setState({ progressId, startedAt, status: "reviewing" });

    try {
      const response = await fetch("/api/visual-review/stills", {
        body: JSON.stringify({ progressId, project: normalizedProject }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
        signal: abortController.signal,
      });
      const data = (await response.json()) as VisualReviewResponse;

      if (!response.ok || !isVisualReviewSuccessResponse(data)) {
        throw new Error(data.error ?? "视觉复核失败，请检查截图生成日志后重试。");
      }

      if (
        reviewAttemptRef.current !== reviewAttempt ||
        latestProjectSignatureRef.current !== requestSignature
      ) {
        return;
      }

      setState({
        extraction: data.extraction,
        finishedAt: Date.now(),
        progressId,
        startedAt,
        status: "success",
        visualReview: data.visualReview,
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      if (
        reviewAttemptRef.current !== reviewAttempt ||
        latestProjectSignatureRef.current !== requestSignature
      ) {
        return;
      }

      setState({
        error: error instanceof Error ? error.message : "视觉复核失败。",
        finishedAt: Date.now(),
        progressId,
        startedAt,
        status: "failure",
      });
    } finally {
      if (activeReviewAbortControllerRef.current === abortController) {
        activeReviewAbortControllerRef.current = null;
      }
    }
  }, [normalizedProject, projectSignature]);

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return useMemo(() => {
    return {
      reset,
      reviewProject,
      state,
    };
  }, [reset, reviewProject, state]);
};
