import type { SegmentCaptions } from "../../lib/caption-schema";
import type {
  StandaloneCanvasProfileId,
  StandaloneContentFamily,
  StandaloneTimedScene,
} from "../standalone-video/types";

export const UV_OPEN_SOURCE_BRIEF_COMPOSITION_ID = "UvOpenSourceBrief";
export const UV_OPEN_SOURCE_BRIEF_FPS = 30;
export const UV_OPEN_SOURCE_BRIEF_WIDTH = 1920;
export const UV_OPEN_SOURCE_BRIEF_HEIGHT = 1080;
export const UV_OPEN_SOURCE_BRIEF_PROFILE_ID = "landscape-16x9";
export const UV_OPEN_SOURCE_BRIEF_CONTENT_FAMILY = "project-intro";
export const UV_OPEN_SOURCE_BRIEF_VOICEOVER_PLAYBACK_RATE = 1.08;

export type UvOpenSourceBriefSceneId =
  | "open"
  | "what"
  | "adoption"
  | "speed"
  | "workflow"
  | "replace"
  | "release"
  | "close";

export type UvScreenshotAsset = {
  readonly id: "repo" | "docs" | "release";
  readonly label: string;
  readonly src: string;
  readonly sourceUrl: string;
};

export type UvOpenSourceBriefScene = StandaloneTimedScene & {
  readonly id: UvOpenSourceBriefSceneId;
  readonly audioFile: string;
  readonly captions: SegmentCaptions;
  readonly durationInFrames: number;
  readonly headline: string;
  readonly kicker: string;
  readonly narration: string;
  readonly primitiveMap: readonly string[];
  readonly visual:
    | {
        readonly kind: "hero";
      }
    | {
        readonly kind: "workflow";
      }
    | {
        readonly kind: "metrics";
      }
    | {
        readonly kind: "benchmark";
      }
    | {
        readonly kind: "terminal";
      }
    | {
        readonly kind: "tool-grid";
      }
    | {
        readonly kind: "release";
      }
    | {
        readonly kind: "closing";
      };
};

export type UvOpenSourceBriefData = {
  readonly assets: {
    readonly screenshots: readonly UvScreenshotAsset[];
  };
  readonly contentFamily: typeof UV_OPEN_SOURCE_BRIEF_CONTENT_FAMILY & StandaloneContentFamily;
  readonly generatedAt: string;
  readonly profileId: typeof UV_OPEN_SOURCE_BRIEF_PROFILE_ID & StandaloneCanvasProfileId;
  readonly scenes: readonly UvOpenSourceBriefScene[];
  readonly topic: {
    readonly docsUrl: string;
    readonly latestRelease: {
      readonly publishedAt: string;
      readonly tag: string;
      readonly url: string;
    };
    readonly repo: {
      readonly description: string;
      readonly forks: number;
      readonly fullName: string;
      readonly language: string;
      readonly stars: number;
      readonly url: string;
    };
    readonly speedClaim: string;
    readonly toolCoverage: readonly string[];
  };
};

export const UV_OPEN_SOURCE_BRIEF_DURATION_IN_FRAMES = 1505;

export type UvOpenSourceBriefAudioTrack = {
  readonly audioFile: string;
  readonly captions: SegmentCaptions;
  readonly durationInFrames: number;
  readonly durationInSeconds?: number;
  readonly format?: "mp3" | "wav" | "aac" | "m4a";
  readonly narration: string;
  readonly provider?: string;
  readonly sceneId: UvOpenSourceBriefSceneId;
};
