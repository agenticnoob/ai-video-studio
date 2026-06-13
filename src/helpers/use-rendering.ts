import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { normalizeProject, type VideoProject } from "../lib/project-schema";
import { createProgressId } from "./create-progress-id";

export type State =
  | {
      status: "idle";
    }
  | {
      progressId: string;
      startedAt: number;
      status: "rendering";
    }
  | {
      finishedAt: number;
      downloadUrl: string;
      outputPath: string;
      renderId: string;
      progressId: string;
      sizeInBytes: number;
      startedAt: number;
      status: "success";
    }
  | {
      error: string;
      finishedAt: number;
      progressId: string;
      startedAt: number;
      status: "failure";
    };

type RenderResponse = {
  downloadUrl?: string;
  error?: string;
  outputPath?: string;
  renderId?: string;
  sizeInBytes?: number;
};

const isRenderSuccessResponse = (
  response: RenderResponse,
): response is Required<
  Pick<
    RenderResponse,
    "downloadUrl" | "outputPath" | "renderId" | "sizeInBytes"
  >
> => {
  return (
    typeof response.downloadUrl === "string" &&
    typeof response.outputPath === "string" &&
    typeof response.renderId === "string" &&
    typeof response.sizeInBytes === "number"
  );
};

export const useRendering = (project: VideoProject) => {
  const normalizedProject = useMemo(() => normalizeProject(project), [project]);
  const projectSignature = useMemo(() => JSON.stringify(normalizedProject), [normalizedProject]);
  const latestProjectSignatureRef = useRef(projectSignature);
  const activeRenderAbortControllerRef = useRef<AbortController | null>(null);
  const renderAttemptRef = useRef(0);
  const [state, setState] = useState<State>({
    status: "idle",
  });

  useEffect(() => {
    latestProjectSignatureRef.current = projectSignature;
    renderAttemptRef.current += 1;
    activeRenderAbortControllerRef.current?.abort();
    activeRenderAbortControllerRef.current = null;
    setState({ status: "idle" });
  }, [projectSignature]);

  const renderMedia = useCallback(async () => {
    const requestSignature = projectSignature;
    const renderAttempt = renderAttemptRef.current + 1;
    const abortController = new AbortController();
    const startedAt = Date.now();
    const progressId = createProgressId();

    activeRenderAbortControllerRef.current?.abort();
    activeRenderAbortControllerRef.current = abortController;
    renderAttemptRef.current = renderAttempt;
    setState({ progressId, startedAt, status: "rendering" });

    try {
      const response = await fetch("/api/render", {
        body: JSON.stringify({ progressId, project: normalizedProject }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
        signal: abortController.signal,
      });
      const data = (await response.json()) as RenderResponse;

      if (!response.ok || !isRenderSuccessResponse(data)) {
        throw new Error(data.error ?? "视频导出失败。\n请检查 render 日志后重试。");
      }

      if (
        renderAttemptRef.current !== renderAttempt ||
        latestProjectSignatureRef.current !== requestSignature
      ) {
        return;
      }

      setState({
        downloadUrl: data.downloadUrl,
        finishedAt: Date.now(),
        outputPath: data.outputPath,
        progressId,
        renderId: data.renderId,
        sizeInBytes: data.sizeInBytes,
        startedAt,
        status: "success",
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      if (
        renderAttemptRef.current !== renderAttempt ||
        latestProjectSignatureRef.current !== requestSignature
      ) {
        return;
      }

      setState({
        error: error instanceof Error ? error.message : "视频导出失败。",
        finishedAt: Date.now(),
        progressId,
        startedAt,
        status: "failure",
      });
    } finally {
      if (activeRenderAbortControllerRef.current === abortController) {
        activeRenderAbortControllerRef.current = null;
      }
    }
  }, [normalizedProject, projectSignature]);

  const undo = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return useMemo(() => {
    return {
      renderMedia,
      state,
      undo,
    };
  }, [renderMedia, state, undo]);
};
