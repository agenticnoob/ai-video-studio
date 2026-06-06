import type { FC } from "react";

import { getProjectDuration, type VideoProject } from "../../lib/project-schema";
import { getTemplateLabel } from "../../lib/template-registry";

type ProjectSummaryProps = {
  project: VideoProject;
};

const formatDuration = (frames: number, fps: number): string => {
  const seconds = Math.round((frames / fps) * 10) / 10;
  return `${seconds} 秒`;
};

const formatTemplateSummary = (project: VideoProject): string => {
  const templateIds = Array.from(new Set(project.segments.map((segment) => segment.templateId)));

  return templateIds.length === 1 ? getTemplateLabel(templateIds[0]) : `${templateIds.length} 种`;
};

export const ProjectSummary: FC<ProjectSummaryProps> = ({ project }) => {
  const durationInFrames = getProjectDuration(project);

  return (
    <section className="rounded-geist border border-unfocused-border-color bg-background p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">{project.meta.title}</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-600">{project.brief}</p>
        </div>
        <div className="shrink-0 rounded-geist border border-unfocused-border-color px-3 py-2 text-sm text-neutral-600">
          {formatDuration(durationInFrames, project.meta.fps)}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-neutral-600 sm:grid-cols-4">
        <div>
          <div className="text-xs uppercase text-neutral-500">FPS</div>
          <div className="mt-1 font-medium text-foreground">{project.meta.fps}</div>
        </div>
        <div>
          <div className="text-xs uppercase text-neutral-500">尺寸</div>
          <div className="mt-1 font-medium text-foreground">
            {project.meta.width}x{project.meta.height}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase text-neutral-500">分段数</div>
          <div className="mt-1 font-medium text-foreground">{project.segments.length}</div>
        </div>
        <div>
          <div className="text-xs uppercase text-neutral-500">模板</div>
          <div className="mt-1 font-medium text-foreground">{formatTemplateSummary(project)}</div>
        </div>
      </div>
    </section>
  );
};
