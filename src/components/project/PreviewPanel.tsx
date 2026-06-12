import { Player } from "@remotion/player";
import type { FC } from "react";

import type { VideoProject } from "../../lib/project-schema";
import { ProjectVideo } from "../../remotion/ProjectVideo/ProjectVideo";
import { Card } from "../ui/Card";

type PreviewPanelProps = {
  durationInFrames: number;
  project: VideoProject;
};

export const PreviewPanel: FC<PreviewPanelProps> = ({ durationInFrames, project }) => {
  return (
    <Card as="section" className="overflow-hidden" tone="panel">
      <Player
        acknowledgeRemotionLicense
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
    </Card>
  );
};
