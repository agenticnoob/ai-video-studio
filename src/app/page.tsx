"use client";

import { Player } from "@remotion/player";
import type { NextPage } from "next";
import { useMemo, useState } from "react";
import { RenderControls } from "../components/ui/RenderControls";
import { ProjectSummary } from "../components/project/ProjectSummary";
import { SegmentEditor } from "../components/project/SegmentEditor";
import { SegmentList } from "../components/project/SegmentList";
import { useRendering } from "../helpers/use-rendering";
import {
  getProjectDuration,
  normalizeProject,
  type VideoProject,
  type VideoSegment,
} from "../lib/project-schema";
import { sampleProject } from "../lib/sample-video";
import { ProjectVideo } from "../remotion/ProjectVideo/ProjectVideo";

type GenerateResponse = {
  project?: VideoProject;
  error?: string;
};

type GenerationPipeline = "staged" | "shortcut";

const inputClassName =
  "mt-2 w-full rounded-geist border border-unfocused-border-color bg-background px-3 py-2 text-sm outline-none focus:border-focused-border-color";

const sectionClassName = "rounded-geist border border-unfocused-border-color bg-background p-5";

const defaultBrief =
  "为 AI Video Studio 生成一条简洁的产品演示视频：展示用户如何输入创意 brief、获得分段项目、逐段微调，并预览完整成片。";

const getInitialSelectedSegmentId = (project: VideoProject): string | null => {
  return project.segments[0]?.id ?? null;
};

const Home: NextPage = () => {
  const [brief, setBrief] = useState(defaultBrief);
  const [project, setProject] = useState<VideoProject>(sampleProject);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(
    getInitialSelectedSegmentId(sampleProject),
  );
  const [revisionPrompt, setRevisionPrompt] = useState("");
  const [generationPipeline, setGenerationPipeline] = useState<GenerationPipeline>("staged");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegeneratingSegment, setIsRegeneratingSegment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedProject = useMemo(() => normalizeProject(project), [project]);
  const durationInFrames = useMemo(
    () => getProjectDuration(normalizedProject),
    [normalizedProject],
  );
  const selectedSegment = useMemo(
    () => normalizedProject.segments.find((segment) => segment.id === selectedSegmentId) ?? null,
    [normalizedProject.segments, selectedSegmentId],
  );
  const {
    renderMedia,
    state: renderState,
    undo: resetRenderState,
  } = useRendering(normalizedProject);
  const isRendering = renderState.status === "rendering";
  const isMutatingProject = isGenerating || isRegeneratingSegment || isRendering;
  const isStagedGeneration = generationPipeline === "staged";

  const generateProject = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(isStagedGeneration ? "/api/generate/staged" : "/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isStagedGeneration ? { mode: "brief", brief } : { mode: "project", brief },
        ),
      });
      const data = (await response.json()) as GenerateResponse;

      if (!response.ok || !data.project) {
        throw new Error(data.error ?? "生成视频项目失败。");
      }

      const nextProject = normalizeProject(data.project);
      setProject(nextProject);
      setSelectedSegmentId(getInitialSelectedSegmentId(nextProject));
      setRevisionPrompt("");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "生成视频项目失败。");
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateSelectedSegment = async () => {
    if (!selectedSegmentId) {
      setError("请选择需要重生成的分段。");
      return;
    }

    if (!revisionPrompt.trim()) {
      setError("请输入分段修改指令。");
      return;
    }

    setIsRegeneratingSegment(true);
    setError(null);

    try {
      const response = await fetch(isStagedGeneration ? "/api/generate/staged" : "/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "segment",
          project: normalizedProject,
          segmentId: selectedSegmentId,
          revisionPrompt,
        }),
      });
      const data = (await response.json()) as GenerateResponse;

      if (!response.ok || !data.project) {
        throw new Error(data.error ?? "分段重生成失败。");
      }

      const nextProject = normalizeProject(data.project);
      setProject(nextProject);
      setSelectedSegmentId(
        nextProject.segments.some((segment) => segment.id === selectedSegmentId)
          ? selectedSegmentId
          : getInitialSelectedSegmentId(nextProject),
      );
      setRevisionPrompt("");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "分段重生成失败。");
    } finally {
      setIsRegeneratingSegment(false);
    }
  };

  const updateSegment = (nextSegment: VideoSegment) => {
    setProject((currentProject) =>
      normalizeProject({
        ...currentProject,
        segments: currentProject.segments.map((segment) =>
          segment.id === nextSegment.id ? nextSegment : segment,
        ),
      }),
    );
  };

  return (
    <main className="mx-auto max-w-screen-2xl px-4 py-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <section className={sectionClassName}>
            <div className="text-xs uppercase tracking-[0.22em] text-neutral-500">
              AI Video Studio
            </div>
            <h1 className="mt-3 text-2xl font-bold text-foreground">分段优先工作台</h1>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              从一段 brief 生成视频项目，先预览完整成片，再逐段细化修改，并直接导出当前编辑态成片。
            </p>

            <label className="mt-5 block text-sm font-medium text-foreground">
              创意 brief
              <textarea
                className={`${inputClassName} min-h-28 resize-y`}
                value={brief}
                onChange={(event) => setBrief(event.currentTarget.value)}
              />
            </label>

            <label className="mt-4 flex items-center gap-3 text-sm text-foreground">
              <input
                checked={isStagedGeneration}
                className="h-4 w-4 accent-foreground"
                disabled={isMutatingProject}
                type="checkbox"
                onChange={(event) =>
                  setGenerationPipeline(event.currentTarget.checked ? "staged" : "shortcut")
                }
              />
              <span>阶段式生成</span>
            </label>

            <button
              className="mt-4 rounded-geist border border-foreground bg-foreground px-4 py-2 text-sm font-semibold text-background disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isMutatingProject}
              onClick={generateProject}
              type="button"
            >
              {isGenerating
                ? isStagedGeneration
                  ? "正在阶段式生成..."
                  : "正在生成项目..."
                : isStagedGeneration
                  ? "阶段式生成项目"
                  : "生成项目"}
            </button>

            {error ? (
              <div className="mt-4 rounded-geist border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}
          </section>

          <section className="overflow-hidden rounded-geist border border-unfocused-border-color bg-background shadow-[0_0_120px_rgba(0,0,0,0.10)]">
            <Player
              acknowledgeRemotionLicense
              component={ProjectVideo}
              compositionHeight={normalizedProject.meta.height}
              compositionWidth={normalizedProject.meta.width}
              controls
              durationInFrames={durationInFrames}
              fps={normalizedProject.meta.fps}
              inputProps={normalizedProject}
              loop
              style={{ width: "100%" }}
            />
          </section>

          <RenderControls
            disabled={isGenerating || isRegeneratingSegment}
            onDismissResult={resetRenderState}
            onRender={renderMedia}
            state={renderState}
          />

          <ProjectSummary project={normalizedProject} />

          <div className={isRendering ? "pointer-events-none opacity-70" : undefined}>
            <SegmentEditor
              isRegenerating={isRegeneratingSegment}
              revisionPrompt={revisionPrompt}
              segment={selectedSegment}
              onRegenerateSegment={regenerateSelectedSegment}
              onRevisionPromptChange={setRevisionPrompt}
              onSegmentChange={updateSegment}
            />
          </div>
        </div>

        <div
          className={`space-y-6 xl:sticky xl:top-6 xl:self-start ${
            isRendering ? "pointer-events-none opacity-70" : ""
          }`}
        >
          <SegmentList
            project={normalizedProject}
            selectedSegmentId={selectedSegmentId}
            onSelectSegment={(segmentId) => {
              setSelectedSegmentId(segmentId);
              setRevisionPrompt("");
            }}
          />
        </div>
      </div>
    </main>
  );
};

export default Home;
