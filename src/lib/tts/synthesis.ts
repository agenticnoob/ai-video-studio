import type { SegmentCaptions } from "../caption-schema";
import { runWithConcurrencyLimit } from "../concurrency-limits";
import type { NarrationAudioFormat } from "../narration-asset-schema";
import type { TtsProviderId } from "./config";
import { synthesizeF5Speech } from "./f5";

export type SegmentNarrationSynthesisRequest = {
  language?: string;
  provider: TtsProviderId;
  referenceAudioPath?: string;
  referenceText?: string;
  runId: string;
  segmentId: string;
  text: string;
  voiceId?: string;
};

export type SegmentNarrationSynthesisResult = {
  audioSrc: string;
  captions?: SegmentCaptions;
  durationInFrames: number;
  durationInSeconds: number;
  format: NarrationAudioFormat;
  outputPath: string;
  provider: TtsProviderId;
  voiceId?: string;
};

export const synthesizeSegmentNarration = async (
  request: SegmentNarrationSynthesisRequest,
): Promise<SegmentNarrationSynthesisResult> => {
  return runWithConcurrencyLimit("tts", async () => {
    return synthesizeF5Speech(request);
  });
};
