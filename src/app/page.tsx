"use client";

import { Player } from "@remotion/player";
import type { NextPage } from "next";
import { useMemo, useState } from "react";
import { ProjectSummary } from "../components/project/ProjectSummary";
import { SegmentEditor } from "../components/project/SegmentEditor";
import { SegmentList } from "../components/project/SegmentList";
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

const inputClassName =
  "mt-2 w-full rounded-geist border border-unfocused-border-color bg-background px-3 py-2 text-sm outline-none focus:border-focused-border-color";

const sectionClassName = "rounded-geist border border-unfocused-border-color bg-background p-5";

const defaultBrief =
  "Create a concise product demo video for AI Video Studio. Show how a user writes a brief, receives a segment-based project, tunes selected segments, and previews the full video result.";

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const durationInFrames = useMemo(() => getProjectDuration(project), [project]);
  const selectedSegment = useMemo(
    () => project.segments.find((segment) => segment.id === selectedSegmentId) ?? null,
    [project.segments, selectedSegmentId],
  );

  const generateProject = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief }),
      });
      const data = (await response.json()) as GenerateResponse;

      if (!response.ok || !data.project) {
        throw new Error(data.error ?? "Failed to generate a video project.");
      }

      const nextProject = normalizeProject(data.project);
      setProject(nextProject);
      setSelectedSegmentId(getInitialSelectedSegmentId(nextProject));
      setRevisionPrompt("");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to generate a video project.");
    } finally {
      setIsGenerating(false);
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
            <div className="text-xs uppercase tracking-[0.22em] text-neutral-500">AI Video Studio</div>
            <h1 className="mt-3 text-2xl font-bold text-foreground">Segment-first studio</h1>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Generate a project from a brief, preview the assembled full video, and refine one segment at a time.
            </p>

            <label className="mt-5 block text-sm font-medium text-foreground">
              Creative brief
              <textarea
                className={`${inputClassName} min-h-28 resize-y`}
                value={brief}
                onChange={(event) => setBrief(event.currentTarget.value)}
              />
            </label>

            <button
              className="mt-4 rounded-geist border border-foreground bg-foreground px-4 py-2 text-sm font-semibold text-background disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isGenerating}
              onClick={generateProject}
              type="button"
            >
              {isGenerating ? "Generating project..." : "Generate project"}
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
              autoPlay
              component={ProjectVideo}
              compositionHeight={project.meta.height}
              compositionWidth={project.meta.width}
              controls
              durationInFrames={durationInFrames}
              fps={project.meta.fps}
              inputProps={project}
              loop
              style={{ width: "100%" }}
            />
          </section>

          <ProjectSummary project={project} />

          <SegmentEditor
            revisionPrompt={revisionPrompt}
            segment={selectedSegment}
            onRevisionPromptChange={setRevisionPrompt}
            onSegmentChange={updateSegment}
          />
        </div>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <SegmentList
            project={project}
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
