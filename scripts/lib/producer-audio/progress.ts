import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { ProducerAudioTrack } from "./types";

export type ProducerAudioProgressScene = {
  readonly sceneId: string;
  readonly fingerprint: string;
  readonly outputPath: string;
  readonly track: ProducerAudioTrack;
};

export type ProducerAudioProgress = {
  readonly version: 1;
  readonly compositionId: string;
  readonly scenes: readonly ProducerAudioProgressScene[];
};

const stableValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, entry]) => entry !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, stableValue(entry)]),
    );
  }
  return value;
};

export const createProducerAudioFingerprint = (value: unknown): string =>
  createHash("sha256")
    .update(JSON.stringify(stableValue(value)))
    .digest("hex");

const isCaptionCue = (value: unknown): boolean => {
  if (!value || typeof value !== "object") return false;
  const cue = value as Record<string, unknown>;
  return (
    typeof cue.id === "string" &&
    typeof cue.text === "string" &&
    Number.isInteger(cue.startFrame) &&
    Number.isInteger(cue.durationInFrames) &&
    (cue.durationInFrames as number) > 0
  );
};

const isTrack = (value: unknown, sceneId: string): value is ProducerAudioTrack => {
  if (!value || typeof value !== "object") return false;
  const track = value as Record<string, unknown>;
  const captions = track.captions as Record<string, unknown> | undefined;
  return (
    track.sceneId === sceneId &&
    typeof track.narration === "string" &&
    typeof track.audioFile === "string" &&
    Number.isInteger(track.durationInFrames) &&
    (track.durationInFrames as number) > 0 &&
    typeof track.durationInSeconds === "number" &&
    Number.isFinite(track.durationInSeconds) &&
    (track.durationInSeconds as number) > 0 &&
    (track.provider === undefined || track.provider === "voxcpm") &&
    (track.format === undefined || track.format === "wav") &&
    Boolean(captions) &&
    Array.isArray(captions?.cues) &&
    captions.cues.every(isCaptionCue)
  );
};

const parseProgress = (source: string, compositionId: string): ProducerAudioProgress => {
  let value: unknown;
  try {
    value = JSON.parse(source);
  } catch {
    throw new Error("Producer audio progress must be valid JSON.");
  }
  if (!value || typeof value !== "object")
    throw new Error("Producer audio progress must be an object.");
  const progress = value as Record<string, unknown>;
  if (progress.version !== 1) throw new Error("Producer audio progress version must be 1.");
  if (progress.compositionId !== compositionId) {
    throw new Error(
      `Producer audio progress composition mismatch: expected ${compositionId}, got ${String(progress.compositionId)}.`,
    );
  }
  if (!Array.isArray(progress.scenes))
    throw new Error("Producer audio progress scenes must be an array.");

  const sceneIds = new Set<string>();
  const scenes = progress.scenes.map((value, index): ProducerAudioProgressScene => {
    if (!value || typeof value !== "object")
      throw new Error(`Producer audio progress scene ${index} is invalid.`);
    const scene = value as Record<string, unknown>;
    if (typeof scene.sceneId !== "string" || !scene.sceneId.trim()) {
      throw new Error(`Producer audio progress scene ${index} has no scene id.`);
    }
    if (sceneIds.has(scene.sceneId))
      throw new Error(`Duplicate Producer audio progress scene: ${scene.sceneId}.`);
    sceneIds.add(scene.sceneId);
    if (typeof scene.fingerprint !== "string" || !/^[a-f0-9]{64}$/.test(scene.fingerprint)) {
      throw new Error(`Producer audio progress scene ${scene.sceneId} has an invalid fingerprint.`);
    }
    if (typeof scene.outputPath !== "string") {
      throw new Error(`Producer audio progress scene ${scene.sceneId} has an invalid output path.`);
    }
    if (!isTrack(scene.track, scene.sceneId)) {
      throw new Error(`Producer audio progress scene ${scene.sceneId} has an invalid track.`);
    }
    return {
      sceneId: scene.sceneId,
      fingerprint: scene.fingerprint,
      outputPath: scene.outputPath,
      track: scene.track,
    };
  });
  return { version: 1, compositionId, scenes };
};

export const loadProducerAudioProgress = async ({
  compositionId,
  destination,
}: {
  readonly compositionId: string;
  readonly destination?: string;
}): Promise<ProducerAudioProgress> => {
  if (!destination) return { version: 1, compositionId, scenes: [] };
  try {
    return parseProgress(await readFile(destination, "utf8"), compositionId);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { version: 1, compositionId, scenes: [] };
    }
    throw error;
  }
};

export const writeProducerAudioProgress = async ({
  destination,
  progress,
}: {
  readonly destination?: string;
  readonly progress: ProducerAudioProgress;
}): Promise<void> => {
  if (!destination) return;
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, `${JSON.stringify(progress, null, 2)}\n`, "utf8");
};
