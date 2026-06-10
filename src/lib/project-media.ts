import {
  getSegmentDuration,
  normalizeProject,
  type VideoProject,
} from "./project-schema";

const getNarrationLayerId = (segmentId: string): string => `${segmentId}-narration-audio`;

const getNarrationLayerStarts = (project: VideoProject): Map<string, number> => {
  const starts = new Map<string, number>();
  let startFrame = 0;

  for (const segment of project.segments) {
    starts.set(getNarrationLayerId(segment.id), startFrame);
    startFrame += getSegmentDuration(segment);
  }

  return starts;
};

export const preserveMediaLayersForSegmentRevision = ({
  originalProject,
  revisedProject,
}: {
  originalProject: VideoProject;
  revisedProject: VideoProject;
}): VideoProject => {
  const media = originalProject.media ?? revisedProject.media;

  if (!media) {
    return revisedProject;
  }

  const narrationLayerStarts = getNarrationLayerStarts(revisedProject);
  const layers = media.layers
    .map((layer) => {
      const startFrame =
        layer.kind === "narration" ? narrationLayerStarts.get(layer.id) : undefined;

      return startFrame === undefined
        ? layer
        : {
            ...layer,
            startFrame,
          };
    })
    .sort((a, b) => a.startFrame - b.startFrame || a.id.localeCompare(b.id));

  return normalizeProject({
    ...revisedProject,
    media: {
      layers,
    },
  });
};
