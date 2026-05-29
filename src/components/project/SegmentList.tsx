import type { FC } from "react";

import { getSegmentDuration, type VideoProject } from "../../lib/project-schema";

type SegmentListProps = {
  project: VideoProject;
  selectedSegmentId: string | null;
  onSelectSegment: (segmentId: string) => void;
};

const formatDuration = (frames: number, fps: number): string => {
  const seconds = Math.round((frames / fps) * 10) / 10;
  return `${seconds} 秒`;
};

export const SegmentList: FC<SegmentListProps> = ({
  project,
  selectedSegmentId,
  onSelectSegment,
}) => {
  return (
    <section className="rounded-geist border border-unfocused-border-color bg-background p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">分段列表</h2>
        <div className="text-sm text-neutral-500">共 {project.segments.length} 段</div>
      </div>

      <div className="mt-4 space-y-3">
        {project.segments.map((segment, index) => {
          const isSelected = segment.id === selectedSegmentId;

          return (
            <button
              key={segment.id}
              className={`w-full rounded-geist border p-4 text-left transition ${
                isSelected
                  ? "border-foreground bg-neutral-100"
                  : "border-unfocused-border-color bg-background hover:border-focused-border-color"
              }`}
              onClick={() => onSelectSegment(segment.id)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-medium uppercase text-neutral-500">
                    第 {index + 1} 段
                  </div>
                  <div className="mt-1 text-sm font-semibold text-foreground">{segment.title}</div>
                </div>
                <div className="shrink-0 text-xs text-neutral-500">
                  {formatDuration(getSegmentDuration(segment), project.meta.fps)}
                </div>
              </div>
              <p className="mt-2 line-clamp-2 text-sm leading-5 text-neutral-600">{segment.intent}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
};
