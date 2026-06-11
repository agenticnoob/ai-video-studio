import React from "react";
import { Sequence } from "remotion";

import { getSegmentDuration, getSegmentStart, type VideoProject } from "../../lib/project-schema";
import { renderRegisteredSegment } from "../template-component-registry";
import { ProjectCaptionLayers } from "./ProjectCaptionLayers";
import { ProjectMediaLayers } from "./ProjectMediaLayers";
import { ProjectNarrationLayers } from "./ProjectNarrationLayers";

const getProjectMediaLayers = (project: VideoProject) => {
  const segmentIdsWithNarration = new Set(
    project.segments
      .filter((segment) => segment.narration?.audio)
      .map((segment) => `${segment.id}-narration-audio`),
  );

  return project.media?.layers.filter(
    (layer) => layer.kind !== "narration" || !segmentIdsWithNarration.has(layer.id),
  );
};

export const ProjectVideo: React.FC<VideoProject> = (project) => {
  return (
    <>
      <ProjectNarrationLayers project={project} />
      <ProjectMediaLayers layers={getProjectMediaLayers(project)} />
      {project.segments.map((segment, index) => (
        <Sequence
          key={segment.id}
          from={getSegmentStart(project, index)}
          durationInFrames={getSegmentDuration(segment)}
        >
          {renderRegisteredSegment(segment)}
        </Sequence>
      ))}
      <ProjectCaptionLayers project={project} />
    </>
  );
};
