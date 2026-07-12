export {
  GitTutorialForDevsVideo,
  gitTutorialMetadata,
  getGitTutorialDuration,
} from "./GitTutorialForDevs";
export { gitNarrationBeats, createGitTutorialSingleScenePlan } from "./script";
export { gitTutorialData } from "./data";
export {
  GIT_TUTORIAL_COMPOSITION_ID,
  GIT_TUTORIAL_DURATION_IN_FRAMES,
  GIT_TUTORIAL_FPS,
  GIT_TUTORIAL_HEIGHT,
  GIT_TUTORIAL_WIDTH,
} from "./types";

export const getGitTutorialDataDuration = (data: {
  readonly scenes: readonly { readonly durationInFrames: number }[];
}): number => data.scenes.reduce((sum, scene) => sum + scene.durationInFrames, 0);