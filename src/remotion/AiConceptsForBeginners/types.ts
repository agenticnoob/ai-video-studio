import type { SegmentCaptions } from "../../lib/caption-schema";
import type {
  StandaloneCanvasProfileId,
  StandaloneContentFamily,
  StandaloneTimedScene,
} from "../standalone-video/types";

export const AI_CONCEPTS_FOR_BEGINNERS_COMPOSITION_ID = "AiConceptsForBeginners";
export const AI_CONCEPTS_FOR_BEGINNERS_FPS = 30;
export const AI_CONCEPTS_FOR_BEGINNERS_WIDTH = 1920;
export const AI_CONCEPTS_FOR_BEGINNERS_HEIGHT = 1080;
export const AI_CONCEPTS_FOR_BEGINNERS_PROFILE_ID = "landscape-16x9";
export const AI_CONCEPTS_FOR_BEGINNERS_CONTENT_FAMILY = "tutorial";
export const AI_CONCEPTS_FOR_BEGINNERS_VOICEOVER_PLAYBACK_RATE = 1.2;
export const AI_CONCEPTS_FOR_BEGINNERS_MIN_DURATION_IN_FRAMES =
  7 * 60 * AI_CONCEPTS_FOR_BEGINNERS_FPS;
export const AI_CONCEPTS_FOR_BEGINNERS_MAX_DURATION_IN_FRAMES =
  9 * 60 * AI_CONCEPTS_FOR_BEGINNERS_FPS;

export type AiConceptsForBeginnersSceneId =
  | "open"
  | "llm"
  | "prompt"
  | "context"
  | "rag"
  | "function-calling"
  | "mcp"
  | "agent"
  | "workflow"
  | "skill"
  | "subagent"
  | "langchain"
  | "close";

export type AiConceptsForBeginnersVisualKind = AiConceptsForBeginnersSceneId;

export type AiConceptsForBeginnersScene = StandaloneTimedScene & {
  readonly accent: string;
  readonly audioFile: string;
  readonly captions: SegmentCaptions;
  readonly chapter: string;
  readonly concept: string;
  readonly durationInFrames: number;
  readonly headline: string;
  readonly id: AiConceptsForBeginnersSceneId;
  readonly narration: string;
  readonly primitiveMap: readonly string[];
  readonly supportingText: string;
  readonly visual: {
    readonly kind: AiConceptsForBeginnersVisualKind;
  };
};

export type AiConceptsForBeginnersData = {
  readonly contentFamily: typeof AI_CONCEPTS_FOR_BEGINNERS_CONTENT_FAMILY & StandaloneContentFamily;
  readonly generatedAt: string;
  readonly profileId: typeof AI_CONCEPTS_FOR_BEGINNERS_PROFILE_ID & StandaloneCanvasProfileId;
  readonly scenes: readonly AiConceptsForBeginnersScene[];
  readonly topic: {
    readonly audience: "AI beginners";
    readonly concepts: readonly string[];
    readonly metaphor: "AI restaurant";
    readonly title: string;
  };
};

export const AI_CONCEPTS_FOR_BEGINNERS_DURATION_IN_FRAMES = 15657;

export type AiConceptsForBeginnersAudioTrack = {
  readonly audioFile: string;
  readonly captions: SegmentCaptions;
  readonly durationInFrames: number;
  readonly durationInSeconds?: number;
  readonly format?: "mp3" | "wav" | "aac" | "m4a";
  readonly narration: string;
  readonly provider?: string;
  readonly sceneId: AiConceptsForBeginnersSceneId;
};
