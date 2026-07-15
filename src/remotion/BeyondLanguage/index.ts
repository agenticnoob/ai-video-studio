export { BeyondLanguageVideo, getDuration } from "./BeyondLanguage";
export { audioTracks } from "./audio.generated";
export { data, totalDuration } from "./data";
export {
  COMPOSITION_ID,
  FPS,
  HEIGHT,
  WIDTH,
} from "./types";

export const getBeyondLanguageDuration = (d: { scenes: readonly { durationInFrames: number }[] }) =>
  d.scenes.reduce((s, c) => s + c.durationInFrames, 0);