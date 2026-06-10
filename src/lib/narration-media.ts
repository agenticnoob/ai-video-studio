import type { AudioMediaLayer } from "./media-layer-schema";
import type { SegmentNarrationAsset } from "./narration-asset-schema";

const inferNarrationSourceType = (audioSrc: string): AudioMediaLayer["sourceType"] => {
  if (/^https?:\/\//.test(audioSrc)) {
    return "remote";
  }
  if (audioSrc.startsWith("/")) {
    return "route";
  }
  return "public";
};

export type CreateNarrationAudioLayerRequest = {
  narration: SegmentNarrationAsset;
  segmentId: string;
  startFrame: number;
};

export const createNarrationAudioLayer = ({
  narration,
  segmentId,
  startFrame,
}: CreateNarrationAudioLayerRequest): AudioMediaLayer => {
  return {
    id: `${segmentId}-narration-audio`,
    type: "audio",
    kind: "narration",
    src: narration.audioSrc,
    sourceType: inferNarrationSourceType(narration.audioSrc),
    startFrame,
    durationInFrames: narration.durationInFrames,
    volume: 1,
    loop: false,
  };
};
