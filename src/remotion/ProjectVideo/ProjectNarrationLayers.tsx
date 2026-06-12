import React from "react";
import { Audio, Sequence } from "remotion";

import { getSegmentNarrationLayers } from "../../lib/project-timeline";
import type { VideoProject } from "../../lib/project-schema";

type ProjectNarrationLayersProps = {
  project: VideoProject;
};

export const ProjectNarrationLayers: React.FC<ProjectNarrationLayersProps> = ({ project }) => {
  return (
    <>
      {getSegmentNarrationLayers(project).map((layer) => (
        <Sequence
          key={layer.key}
          from={layer.startFrame}
          durationInFrames={layer.durationInFrames}
        >
          <Audio pauseWhenBuffering src={layer.src} />
        </Sequence>
      ))}
    </>
  );
};
