import type { SegmentCaptions } from "../../lib/caption-schema";
import type {
  StandaloneAudioTrack,
  StandaloneCanvasProfileId,
  StandaloneContentFamily,
  StandaloneTimedScene,
} from "../standalone-video/types";

export const WORLD_CUP_BETTING_ANALYSIS_COMPOSITION_ID = "WorldCupBettingAnalysis";
export const WORLD_CUP_BETTING_ANALYSIS_FPS = 30;
export const WORLD_CUP_BETTING_ANALYSIS_WIDTH = 1080;
export const WORLD_CUP_BETTING_ANALYSIS_HEIGHT = 1920;
export const WORLD_CUP_BETTING_ANALYSIS_DURATION_IN_FRAMES = 2089;
export const WORLD_CUP_BETTING_ANALYSIS_VOICEOVER_PLAYBACK_RATE = 1.1;
export const WORLD_CUP_BETTING_ANALYSIS_PROFILE_ID = "portrait-9x16";
export const WORLD_CUP_BETTING_ANALYSIS_CONTENT_FAMILY = "data-analysis";

export type OutcomeKey = "win" | "draw" | "loss";

export type MatchAnalysis = {
  readonly id: string;
  readonly homeTeam: string;
  readonly awayTeam: string;
  readonly homeCode: string;
  readonly awayCode: string;
  readonly marketOdds: Record<OutcomeKey, number>;
  readonly averageOdds: Record<OutcomeKey, number>;
  readonly noVigProbabilities: Record<OutcomeKey, number>;
  readonly expectedValues: Record<OutcomeKey, number>;
  readonly modelVerify: string;
  readonly context: string;
  readonly conclusion: string;
  readonly valueDirection: string;
  readonly likelyScores: readonly string[];
};

export type SceneId =
  | "title"
  | "source"
  | "formula"
  | "brazil-japan"
  | "germany-paraguay"
  | "netherlands-morocco"
  | "ranking"
  | "disclaimer";

export type SceneTiming = StandaloneTimedScene & {
  readonly id: SceneId;
  readonly label: string;
  readonly durationInFrames: number;
  readonly narration: string;
  readonly subtitle: string;
};

export type RankingColumn = {
  readonly title: string;
  readonly items: readonly string[];
};

export type WorldCupBettingAnalysisData = {
  readonly contentFamily: typeof WORLD_CUP_BETTING_ANALYSIS_CONTENT_FAMILY &
    StandaloneContentFamily;
  readonly profileId: typeof WORLD_CUP_BETTING_ANALYSIS_PROFILE_ID & StandaloneCanvasProfileId;
  readonly scenes: readonly SceneTiming[];
  readonly matches: readonly MatchAnalysis[];
  readonly rankings: readonly RankingColumn[];
  readonly summary: {
    readonly noBet: {
      readonly text: string;
      readonly detail: string;
    };
    readonly disclaimer: string;
  };
};

export type WorldCupBettingAudioTrack = StandaloneAudioTrack<SceneId> & {
  readonly sceneId: SceneId;
  readonly narration: string;
  readonly audioFile: string;
  readonly durationInFrames: number;
  readonly durationInSeconds: number;
  readonly provider?: string;
  readonly format?: "mp3" | "wav" | "aac" | "m4a";
  readonly captions?: SegmentCaptions;
};
