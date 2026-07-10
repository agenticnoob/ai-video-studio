export {
  AiConceptsForBeginnersVideo,
  aiConceptsForBeginnersMetadata,
} from "./AiConceptsForBeginners";
export { aiConceptsForBeginnersData } from "./data";
export {
  AI_CONCEPTS_FOR_BEGINNERS_COMPOSITION_ID,
  AI_CONCEPTS_FOR_BEGINNERS_DURATION_IN_FRAMES,
  AI_CONCEPTS_FOR_BEGINNERS_FPS,
  AI_CONCEPTS_FOR_BEGINNERS_HEIGHT,
  AI_CONCEPTS_FOR_BEGINNERS_WIDTH,
} from "./types";

export const getAiConceptsForBeginnersDuration = (data: {
  readonly scenes: readonly { readonly durationInFrames: number }[];
}): number => data.scenes.reduce((sum, scene) => sum + scene.durationInFrames, 0);
