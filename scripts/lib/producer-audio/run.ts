import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { cleanProducerDisplayText, normalizeProducerCaptions } from "./captions";
import {
  buildProducerAudioSummary,
  serializeProducerAudioMetadata,
  updateProducerDurationConstant,
} from "./metadata";
import {
  createProducerAudioFingerprint,
  loadProducerAudioProgress,
  writeProducerAudioProgress,
  type ProducerAudioProgressScene,
} from "./progress";
import type { ProducerNarrationAsset } from "./request";
import type {
  ProducerAudioSummary,
  ProducerAudioTrack,
  ProducerNarratedBeat,
  ProducerNarrationBeat,
  ProducerVoxcpmRequestPlan,
} from "./types";

export type RunProducerAudioGenerationConfig = {
  readonly compositionId: string;
  readonly beats: readonly ProducerNarrationBeat[];
  readonly createRequestPlan: (beat: ProducerNarratedBeat) => ProducerVoxcpmRequestPlan;
  readonly requestNarration: (input: {
    readonly beat: ProducerNarratedBeat;
    readonly plan: ProducerVoxcpmRequestPlan;
  }) => Promise<ProducerNarrationAsset>;
  readonly fps?: number;
  readonly progressDestination?: string;
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
};

export type RunProducerAudioGenerationResult = {
  readonly tracks: readonly ProducerAudioTrack[];
  readonly summary: ProducerAudioSummary;
  readonly metadataSource: string;
  readonly durationSource: string;
  readonly summarySource: string;
};

const outputExists = async (outputPath: string): Promise<boolean> => {
  try {
    await access(outputPath);
    return true;
  } catch {
    return false;
  }
};

const writeText = async (destination: string, content: string): Promise<void> => {
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, content, "utf8");
};

const validateNarrationAsset = (asset: ProducerNarrationAsset, sceneId: string): void => {
  if (asset.provider !== "voxcpm") throw new Error(`${sceneId} must use direct VoxCPM narration.`);
  if (asset.format !== "wav") throw new Error(`${sceneId} direct VoxCPM narration must be WAV.`);
  if (!asset.audioSrc.trim() || !asset.outputPath.trim()) {
    throw new Error(`${sceneId} direct VoxCPM narration is missing its audio path.`);
  }
  if (!(asset.durationInFrames > 0) || !(asset.durationInSeconds > 0)) {
    throw new Error(`${sceneId} direct VoxCPM narration must have positive measured duration.`);
  }
};

export const runProducerAudioGeneration = async (
  config: RunProducerAudioGenerationConfig,
): Promise<RunProducerAudioGenerationResult> => {
  const fps = config.fps ?? 30;
  if (!Number.isFinite(fps) || fps <= 0) throw new Error("Producer audio fps must be positive.");
  const sceneIds = new Set<string>();
  for (const beat of config.beats) {
    if (sceneIds.has(beat.id))
      throw new Error(`Duplicate Producer narration scene id: ${beat.id}.`);
    sceneIds.add(beat.id);
  }

  const previousProgress = await loadProducerAudioProgress({
    compositionId: config.compositionId,
    destination: config.progressDestination,
  });
  const progressByScene = new Map(previousProgress.scenes.map((scene) => [scene.sceneId, scene]));
  const completedScenes = new Map<string, ProducerAudioProgressScene>();
  const tracks: ProducerAudioTrack[] = [];

  const persistCompleted = async (): Promise<void> => {
    await writeProducerAudioProgress({
      destination: config.progressDestination,
      progress: {
        version: 1,
        compositionId: config.compositionId,
        scenes: config.beats
          .map((beat) => completedScenes.get(beat.id))
          .filter((scene): scene is ProducerAudioProgressScene => Boolean(scene)),
      },
    });
  };

  for (const beat of config.beats) {
    if (beat.narrationRequired === false) {
      if (!Number.isInteger(beat.durationInFrames) || beat.durationInFrames <= 0) {
        throw new Error(`${beat.id} explicit silence requires positive durationInFrames.`);
      }
      const track: ProducerAudioTrack = {
        sceneId: beat.id,
        narration: "",
        audioFile: "",
        captions: { cues: [] },
        durationInFrames: beat.durationInFrames,
        durationInSeconds: beat.durationInFrames / fps,
      };
      tracks.push(track);
      completedScenes.set(beat.id, {
        sceneId: beat.id,
        fingerprint: createProducerAudioFingerprint(beat),
        outputPath: "",
        track,
      });
      await persistCompleted();
      continue;
    }

    const plan = config.createRequestPlan(beat);
    const fingerprint = createProducerAudioFingerprint(plan);
    const previous = progressByScene.get(beat.id);
    let track: ProducerAudioTrack | undefined;
    if (
      previous?.fingerprint === fingerprint &&
      previous.outputPath &&
      previous.track.provider === "voxcpm" &&
      previous.track.audioFile &&
      (await outputExists(previous.outputPath))
    ) {
      track = previous.track;
    }

    if (!track) {
      const narration = await config.requestNarration({ beat, plan });
      validateNarrationAsset(narration, beat.id);
      const displayText = cleanProducerDisplayText(beat.displayText ?? beat.ttsText);
      track = {
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
        provider: "voxcpm",
        format: "wav",
      };
      completedScenes.set(beat.id, {
        sceneId: beat.id,
        fingerprint,
        outputPath: narration.outputPath,
        track,
      });
    } else {
      completedScenes.set(beat.id, previous as ProducerAudioProgressScene);
    }
    tracks.push(track);
    await persistCompleted();
  }

  const summary = buildProducerAudioSummary({ compositionId: config.compositionId, tracks });
  const metadataSource = serializeProducerAudioMetadata({ ...config.metadata, tracks });
  const durationSource = updateProducerDurationConstant({
    ...config.duration,
    durationInFrames: summary.totalDurationInFrames,
  });
  const summarySource = `${JSON.stringify(summary, null, 2)}\n`;

  if (config.writeOutputs) {
    if (
      !config.metadata.destination ||
      !config.duration.destination ||
      !config.summaryDestination
    ) {
      throw new Error(
        "All Producer audio output destinations are required when writeOutputs is true.",
      );
    }
    await writeText(config.metadata.destination, metadataSource);
    await writeText(config.duration.destination, durationSource);
    await writeText(config.summaryDestination, summarySource);
  }

  return { tracks, summary, metadataSource, durationSource, summarySource };
};
