"use client";

import { useRef, type FC, type PointerEvent } from "react";

import { getSegmentDuration, type VideoProject } from "../../lib/project-schema";
import { getTemplateLabel } from "../../lib/template-registry";

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
  const dragStateRef = useRef({
    isDragging: false,
    scrollLeft: 0,
    startX: 0,
  });

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragStateRef.current = {
      isDragging: true,
      scrollLeft: event.currentTarget.scrollLeft,
      startX: event.clientX,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;

    if (!dragState.isDragging) {
      return;
    }

    const deltaX = event.clientX - dragState.startX;

    event.currentTarget.scrollLeft = dragState.scrollLeft - deltaX;
  };

  const handlePointerCancel = () => {
    const dragState = dragStateRef.current;
    dragState.isDragging = false;
  };

  return (
    <section className="bg-background p-1">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">分段列表</h2>
        <div className="text-sm text-foreground">共 {project.segments.length} 段</div>
      </div>

      <div
        className="mt-4 flex cursor-grab gap-3 overflow-x-auto pb-2 active:cursor-grabbing"
        onPointerCancel={handlePointerCancel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerCancel}
      >
        {project.segments.map((segment, index) => {
          const isSelected = segment.id === selectedSegmentId;

          return (
            <button
              key={segment.id}
              className={`min-w-[260px] max-w-[320px] p-3 text-left transition sm:min-w-[300px] ${
                isSelected
                  ? "bg-foreground text-background"
                  : "bg-background text-foreground hover:bg-foreground hover:text-background"
              }`}
              onPointerUp={(event) => {
                const deltaX = Math.abs(event.clientX - dragStateRef.current.startX);

                if (deltaX <= 4) {
                  onSelectSegment(segment.id);
                }
              }}
              onClick={(event) => {
                if (event.detail === 0) {
                  onSelectSegment(segment.id);
                }
              }}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-medium uppercase">
                    第 {index + 1} 段 · {getTemplateLabel(segment.templateId)}
                  </div>
                  <div
                    className={
                      isSelected
                        ? "mt-1 text-sm font-semibold"
                        : "mt-1 text-sm font-semibold text-foreground"
                    }
                  >
                    {segment.title}
                  </div>
                </div>
                <div className="shrink-0 text-xs">
                  {formatDuration(getSegmentDuration(segment), project.meta.fps)}
                </div>
              </div>
              <p className="mt-2 line-clamp-2 text-sm leading-5">{segment.intent}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
};
