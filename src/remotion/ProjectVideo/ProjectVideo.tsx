import React from "react";
import { Sequence } from "remotion";

import { getSegmentDuration, getSegmentStart, type VideoProject } from "../../lib/project-schema";
import { renderRegisteredSegment } from "../template-component-registry";

export const ProjectVideo: React.FC<VideoProject> = (project) => {
  return (
    <>
      {project.segments.map((segment, index) => (
        <Sequence
          key={segment.id}
          from={getSegmentStart(project, index)}
          durationInFrames={getSegmentDuration(segment)}
        >
          {renderRegisteredSegment(segment)}
        </Sequence>
      ))}
    </>
  );
};
