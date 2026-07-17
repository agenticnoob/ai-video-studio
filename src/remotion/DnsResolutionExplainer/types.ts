import type { ProducerAudioTrack } from "../../../scripts/lib/producer-audio/types";
import type { SegmentCaptions } from "../standalone-video/caption-types";

export const DNS_RESOLUTION_EXPLAINER_COMPOSITION_ID = "DnsResolutionExplainer";
export const DNS_RESOLUTION_EXPLAINER_FPS = 30;
export const DNS_RESOLUTION_EXPLAINER_WIDTH = 1920;
export const DNS_RESOLUTION_EXPLAINER_HEIGHT = 1080;
export const DNS_RESOLUTION_EXPLAINER_NARRATION_DURATION_IN_FRAMES = 737;
export const DNS_RESOLUTION_EXPLAINER_END_HOLD_IN_FRAMES = 2;
export const DNS_RESOLUTION_EXPLAINER_DURATION_IN_FRAMES =
  DNS_RESOLUTION_EXPLAINER_NARRATION_DURATION_IN_FRAMES +
  DNS_RESOLUTION_EXPLAINER_END_HOLD_IN_FRAMES;
export const DNS_RESOLUTION_EXPLAINER_TRANSITION_IN_FRAMES = 16;

export type DnsResolutionExplainerSceneId = "cache" | "delegation" | "answer";
export type DnsResolutionExplainerAudioTrack = ProducerAudioTrack & {
  readonly sceneId: DnsResolutionExplainerSceneId;
};
export type DnsResolutionExplainerScene = {
  readonly id: DnsResolutionExplainerSceneId;
  readonly step: string;
  readonly headline: string;
  readonly detail: string;
  readonly activeNodeCount: number;
  readonly narration: string;
  readonly audioFile: string;
  readonly captions: SegmentCaptions;
  readonly durationInFrames: number;
};
