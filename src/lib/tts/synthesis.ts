import type { SegmentCaptions } from "../caption-schema";
import { runWithConcurrencyLimit } from "../concurrency-limits";
import type { NarrationAudioFormat } from "../narration-asset-schema";
import { readF5TtsConfig, type TtsProviderId } from "./config";
import { synthesizeF5Speech } from "./f5";
import { synthesizeMinimaxSpeech } from "./minimax";

export type SegmentNarrationSynthesisRequest = {
  fallbackToMinimax: boolean;
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

const shouldFallbackToMinimax = (): boolean => {
  try {
    return readF5TtsConfig().fallbackToMinimax;
  } catch {
    return false;
  }
};

const synthesizeF5SpeechWithFallback = async (
  request: SegmentNarrationSynthesisRequest,
): Promise<SegmentNarrationSynthesisResult> => {
  try {
    return await synthesizeF5Speech(request);
  } catch (error) {
    if (!request.fallbackToMinimax || !shouldFallbackToMinimax()) {
      throw error;
    }

    console.warn("F5-TTS synthesis failed; falling back to MiniMax TTS.", {
      message: error instanceof Error ? error.message : String(error),
      segmentId: request.segmentId,
    });
    return synthesizeMinimaxSpeech({
      text: request.text,
      segmentId: request.segmentId,
      runId: request.runId,
      voiceId: request.voiceId,
    });
  }
};

export const synthesizeSegmentNarration = async (
  request: SegmentNarrationSynthesisRequest,
): Promise<SegmentNarrationSynthesisResult> => {
  return runWithConcurrencyLimit("tts", async () => {
    if (request.provider === "f5-tts") {
      return synthesizeF5SpeechWithFallback(request);
    }

    return synthesizeMinimaxSpeech({
      text: request.text,
      segmentId: request.segmentId,
      runId: request.runId,
      voiceId: request.voiceId,
    });
  });
};
