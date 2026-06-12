import React from "react";
import { Sequence } from "remotion";

import {
  getRenderableMediaLayers,
  getSegmentTimelineWindows,
} from "../../lib/project-timeline";
import type { VideoProject } from "../../lib/project-schema";
import { renderRegisteredSegment } from "../template-component-registry";
import { ProjectCaptionLayers } from "./ProjectCaptionLayers";
import { ProjectMediaLayers } from "./ProjectMediaLayers";
import { ProjectNarrationLayers } from "./ProjectNarrationLayers";

export const ProjectVideo: React.FC<VideoProject> = (project) => {
  return (
    <>
      <ProjectNarrationLayers project={project} />
      <ProjectMediaLayers layers={getRenderableMediaLayers(project)} />
      {getSegmentTimelineWindows(project).map(({ durationInFrames, segment, startFrame }) => (
        <Sequence
          key={segment.id}
          from={startFrame}
          durationInFrames={durationInFrames}
        >
          {renderRegisteredSegment(segment)}
        </Sequence>
      ))}
      <ProjectCaptionLayers project={project} />
    </>
  );
};
