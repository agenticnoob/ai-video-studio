import React from "react";
import { Audio, Sequence, staticFile } from "remotion";

import type { ProjectMediaLayer } from "../../lib/media-layer-schema";

type ProjectMediaLayersProps = {
  layers?: ProjectMediaLayer[];
};

const resolveLayerSrc = (layer: ProjectMediaLayer): string => {
  if (layer.sourceType === "public") {
    return staticFile(layer.src.replace(/^\/+/, ""));
  }

  return layer.src;
};

const renderAudioLayer = (layer: ProjectMediaLayer): React.ReactNode => (
  <Sequence key={layer.id} from={layer.startFrame} durationInFrames={layer.durationInFrames}>
    <Audio
      src={resolveLayerSrc(layer)}
      startFrom={layer.trimStartFrame ?? 0}
      volume={() => layer.volume}
      loop={layer.loop}
    />
  </Sequence>
);

export const ProjectMediaLayers: React.FC<ProjectMediaLayersProps> = ({ layers = [] }) => {
  return <>{layers.map(renderAudioLayer)}</>;
};
