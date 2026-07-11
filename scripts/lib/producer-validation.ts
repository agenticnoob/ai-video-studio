import { cleanProducerDisplayText } from "./producer-audio/captions";
import type { ProducerAudioTrack, ProducerNarrationBeat } from "./producer-audio/types";

export type ProducerValidationInput = {
  readonly compositionId: string;
  readonly beats: readonly ProducerNarrationBeat[];
  readonly tracks: readonly ProducerAudioTrack[];
  readonly scenes: readonly { readonly id: string; readonly durationInFrames: number }[];
  readonly expectedProvider: string;
  readonly scenePaddingFrames: number;
  readonly artifactPaths: readonly string[];
  readonly registeredCompositionIds: readonly string[];
  readonly fallbackReasons: readonly string[];
  readonly isIgnoredPath: (path: string) => Promise<boolean>;
};

export const validateProducerAudioAlignment = (input: ProducerValidationInput): void => {
  const beatIds = new Set(input.beats.map((beat) => beat.id));
  const trackIds = new Set(input.tracks.map((track) => track.sceneId));
  for (const beatId of Array.from(beatIds)) {
    if (!trackIds.has(beatId)) throw new Error(`Missing audio id: ${beatId}.`);
  }
  for (const trackId of Array.from(trackIds)) {
    if (!beatIds.has(trackId)) throw new Error(`Extra audio id: ${trackId}.`);
  }

  for (const track of input.tracks) {
    if (!(track.durationInFrames > 0) || !(track.durationInSeconds > 0)) {
      throw new Error(`${track.sceneId} must have positive duration.`);
    }
    if (track.provider !== input.expectedProvider && track.provider !== "explicit-silence-fallback") {
      throw new Error(`${track.sceneId} provider mismatch: expected ${input.expectedProvider}, got ${track.provider}.`);
    }
    if (track.provider === "explicit-silence-fallback" && input.fallbackReasons.length === 0) {
      throw new Error(`${track.sceneId} uses a fallback provider without an explicit fallback reason.`);
    }

    let previousEnd = 0;
    for (const cue of track.captions.cues) {
      const cueEnd = cue.startFrame + cue.durationInFrames;
      if (cue.startFrame < previousEnd || cueEnd > track.durationInFrames) {
        throw new Error(`${track.sceneId} caption cue range is unordered or outside audio duration.`);
      }
      if (cleanProducerDisplayText(cue.text) !== cue.text || /^\s*\(/.test(cue.text)) {
        throw new Error(`${track.sceneId} display caption contains a control instruction or non-language tag.`);
      }
      previousEnd = cueEnd;
    }
  }

  const tracksById = new Map(input.tracks.map((track) => [track.sceneId, track]));
  for (const scene of input.scenes) {
    const track = tracksById.get(scene.id);
    if (!track) continue;
    if (scene.durationInFrames > track.durationInFrames + input.scenePaddingFrames) {
      throw new Error(`${scene.id} scene duration exceeds normalized audio duration plus padding.`);
    }
  }
};

export const validateProducerArtifactBoundary = async (
  input: Pick<ProducerValidationInput, "artifactPaths" | "isIgnoredPath">,
): Promise<void> => {
  for (const artifactPath of input.artifactPaths) {
    if (!(await input.isIgnoredPath(artifactPath))) {
      throw new Error(`Producer artifact root is not ignored: ${artifactPath}`);
    }
  }
};

export const validateProducerSample = async (input: ProducerValidationInput): Promise<void> => {
  validateProducerAudioAlignment(input);
  if (!input.registeredCompositionIds.includes(input.compositionId)) {
    throw new Error(`${input.compositionId} is missing Remotion registration.`);
  }
  await validateProducerArtifactBoundary(input);
};
