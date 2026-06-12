import React from "react";
import { Audio, Sequence } from "remotion";

import {
  getSegmentDuration,
  getSegmentStart,
  type VideoProject,
  type VideoSegment,
} from "../../lib/project-schema";

type ProjectNarrationLayersProps = {
  project: VideoProject;
};

const renderSegmentNarration = (
  project: VideoProject,
  segment: VideoSegment,
  index: number,
): React.ReactNode => {
  const audio = segment.narration?.audio;

  if (!audio) {
    return null;
  }

  return (
    <Sequence
      key={`${segment.id}-segment-narration`}
      from={getSegmentStart(project, index)}
      durationInFrames={Math.min(audio.durationInFrames, getSegmentDuration(segment))}
    >
      <Audio pauseWhenBuffering src={audio.src} />
    </Sequence>
  );
};

export const ProjectNarrationLayers: React.FC<ProjectNarrationLayersProps> = ({ project }) => {
  return (
    <>{project.segments.map((segment, index) => renderSegmentNarration(project, segment, index))}</>
  );
};
