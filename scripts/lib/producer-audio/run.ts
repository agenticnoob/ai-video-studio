import { cleanProducerDisplayText, normalizeProducerCaptions } from "./captions";
import {
  buildProducerAudioSummary,
  serializeProducerAudioMetadata,
  updateProducerDurationConstant,
} from "./metadata";
import type { ProducerNarrationAsset } from "./request";
import type {
  ProducerAudioFallbackPolicy,
  ProducerAudioRequestPlan,
  ProducerAudioSummary,
  ProducerAudioTrack,
  ProducerNarrationBeat,
} from "./types";

export type RunProducerAudioGenerationConfig = {
  readonly compositionId: string;
  readonly beats: readonly ProducerNarrationBeat[];
  readonly createRequestPlan: (beat: ProducerNarrationBeat) => ProducerAudioRequestPlan;
  readonly requestNarration: (input: {
    readonly beat: ProducerNarrationBeat;
    readonly plan: ProducerAudioRequestPlan;
  }) => Promise<ProducerNarrationAsset>;
  readonly fallbackPolicy: ProducerAudioFallbackPolicy;
  readonly fallbackDurationInFrames?: number;
  readonly fps?: number;
  readonly metadata: {
    readonly header: string;
    readonly exportName: string;
    readonly typeImport: { readonly name: string; readonly path: string };
    readonly destination?: string;
  };
  readonly duration: {
    readonly source: string;
    readonly constantName: string;
    readonly destination?: string;
  };
  readonly summaryDestination?: string;
  readonly writeOutputs?: boolean;
  readonly writeTextFile?: (path: string, content: string) => Promise<void>;
};

export type RunProducerAudioGenerationResult = {
  readonly tracks: readonly ProducerAudioTrack[];
  readonly summary: ProducerAudioSummary;
  readonly metadataSource: string;
  readonly durationSource: string;
  readonly summarySource: string;
};

export const runProducerAudioGeneration = async (
  config: RunProducerAudioGenerationConfig,
): Promise<RunProducerAudioGenerationResult> => {
  const tracks: ProducerAudioTrack[] = [];
  const fallbackReasons: string[] = [];
  const fps = config.fps ?? 30;

  for (const beat of config.beats) {
    const plan = config.createRequestPlan(beat);
    let narration: ProducerNarrationAsset;
    try {
      narration = await config.requestNarration({ beat, plan });
    } catch (error) {
      if (config.fallbackPolicy === "forbid") {
        throw error;
      }
      const durationInFrames = config.fallbackDurationInFrames ?? fps * 3;
      const reason = `${beat.id}: ${error instanceof Error ? error.message : String(error)}`;
      fallbackReasons.push(reason);
      narration = {
        audioSrc: "",
        captions: { cues: [] },
        durationInFrames,
        durationInSeconds: durationInFrames / fps,
        provider: "explicit-silence-fallback",
      };
    }

    const displayText = cleanProducerDisplayText(beat.displayText ?? beat.ttsText);
    tracks.push({
      sceneId: beat.id,
      narration: displayText,
      audioFile: narration.audioSrc,
      captions: normalizeProducerCaptions({
        captions: narration.captions,
        displayText,
        durationInFrames: narration.durationInFrames,
      }),
      durationInFrames: narration.durationInFrames,
      durationInSeconds: narration.durationInSeconds,
      provider: narration.provider,
      ...(narration.format ? { format: narration.format } : {}),
    });
  }

  const summary = buildProducerAudioSummary({
    compositionId: config.compositionId,
    tracks,
    fallbackReasons,
  });
  const metadataSource = serializeProducerAudioMetadata({ ...config.metadata, tracks });
  const durationSource = updateProducerDurationConstant({
    ...config.duration,
    durationInFrames: summary.totalDurationInFrames,
  });
  const summarySource = `${JSON.stringify(summary, null, 2)}\n`;

  if (config.writeOutputs) {
    if (!config.writeTextFile) {
      throw new Error("writeTextFile is required when writeOutputs is true.");
    }
    if (!config.metadata.destination || !config.duration.destination || !config.summaryDestination) {
      throw new Error("All output destinations are required when writeOutputs is true.");
    }
    await config.writeTextFile(config.metadata.destination, metadataSource);
    await config.writeTextFile(config.duration.destination, durationSource);
    await config.writeTextFile(config.summaryDestination, summarySource);
  }

  return { tracks, summary, metadataSource, durationSource, summarySource };
};
