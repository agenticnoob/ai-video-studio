export { AiConceptsRedefinedVideo, getDuration } from "./AiConceptsRedefined";
export { audioTracks } from "./audio.generated";
export { data, totalDuration } from "./data";
export {
  COMPOSITION_ID,
  FPS,
  HEIGHT,
  WIDTH,
} from "./types";

export const getAiConceptsRedefinedDuration = (d: { scenes: readonly { durationInFrames: number }[] }) =>
  d.scenes.reduce((s, c) => s + c.durationInFrames, 0);