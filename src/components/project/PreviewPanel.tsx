import { Player } from "@remotion/player";
import type { FC } from "react";

import type { VideoProject } from "../../lib/project-schema";
import { ProjectVideo } from "../../remotion/ProjectVideo/ProjectVideo";

type PreviewPanelProps = {
  durationInFrames: number;
  project: VideoProject;
};

export const PreviewPanel: FC<PreviewPanelProps> = ({ durationInFrames, project }) => {
  return (
    <section className="overflow-hidden rounded-geist border border-unfocused-border-color bg-background shadow-[0_0_120px_rgba(0,0,0,0.10)]">
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
    </section>
  );
};
