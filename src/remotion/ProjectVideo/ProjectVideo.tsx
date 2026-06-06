import React from "react";
import { Sequence } from "remotion";

import {
  getSegmentDuration,
  getSegmentStart,
  SCRIPTED_TEMPLATE_ID,
  type VideoProject,
  type VideoSegment,
} from "../../lib/project-schema";
import { ScriptedVideo } from "../ScriptedVideo/ScriptedVideo";

const renderSegment = (segment: VideoSegment) => {
  switch (segment.templateId) {
    case SCRIPTED_TEMPLATE_ID:
      return <ScriptedVideo {...segment.implementation} />;
    default: {
      const unsupportedTemplateId: never = segment.templateId;
      throw new Error(`Unsupported templateId: ${unsupportedTemplateId}`);
    }
  }
};

export const ProjectVideo: React.FC<VideoProject> = (project) => {
  return (
    <>
      {project.segments.map((segment, index) => (
        <Sequence
          key={segment.id}
          from={getSegmentStart(project, index)}
          durationInFrames={getSegmentDuration(segment)}
        >
          {renderSegment(segment)}
        </Sequence>
      ))}
    </>
  );
};
