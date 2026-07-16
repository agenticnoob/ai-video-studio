import { cleanProducerDisplayText } from "./producer-audio/captions";
import type { ProducerAudioTrack, ProducerNarrationBeat } from "./producer-audio/types";
import {
  assertProducerSampleManifest,
  type ProducerSampleManifest,
} from "../../src/remotion/producer-samples/manifest";
import {
  assertProducerAssetManifest,
  type ProducerAssetManifest,
} from "../../src/remotion/producer-samples/asset-manifest";

export type ProducerValidationInput = {
  readonly compositionId: string;
  readonly manifest?: ProducerSampleManifest;
  readonly assetManifest?: ProducerAssetManifest;
  readonly beats: readonly ProducerNarrationBeat[];
  readonly tracks: readonly ProducerAudioTrack[];
  readonly scenes: readonly { readonly id: string; readonly durationInFrames: number }[];
  readonly scenePaddingFrames: number;
  readonly artifactPaths: readonly string[];
  readonly registeredCompositionIds: readonly string[];
  readonly isIgnoredPath: (path: string) => Promise<boolean>;
};

export const validateProducerAudioAlignment = (input: ProducerValidationInput): void => {
  const beatById = new Map(input.beats.map((beat) => [beat.id, beat]));
  const trackIds = new Set(input.tracks.map((track) => track.sceneId));
  for (const beatId of Array.from(beatById.keys())) {
    if (!trackIds.has(beatId)) throw new Error(`Missing audio id: ${beatId}.`);
  }
  for (const trackId of Array.from(trackIds)) {
    if (!beatById.has(trackId)) throw new Error(`Extra audio id: ${trackId}.`);
  }

  for (const track of input.tracks) {
    const beat = beatById.get(track.sceneId);
    if (!beat) continue;
    if (!(track.durationInFrames > 0) || !(track.durationInSeconds > 0)) {
      throw new Error(`${track.sceneId} must have positive duration.`);
    }

    if (beat.narrationRequired === false) {
      if (
        track.audioFile ||
        track.provider !== undefined ||
        track.format !== undefined ||
        track.narration ||
        track.captions.cues.length > 0
      ) {
        throw new Error(
          `${track.sceneId} is intentionally silent and must not contain narration audio.`,
        );
      }
      if (track.durationInFrames !== beat.durationInFrames) {
        throw new Error(`${track.sceneId} silent duration must match its declared duration.`);
      }
    } else {
      if (track.provider !== "voxcpm" || track.format !== "wav") {
        throw new Error(`${track.sceneId} must use direct VoxCPM WAV narration.`);
      }
      if (!track.audioFile.trim())
        throw new Error(`${track.sceneId} must include a narration audio file.`);
    }

    let previousEnd = 0;
    for (const cue of track.captions.cues) {
      const cueEnd = cue.startFrame + cue.durationInFrames;
      if (cue.startFrame < previousEnd || cueEnd > track.durationInFrames) {
        throw new Error(
          `${track.sceneId} caption cue range is unordered or outside audio duration.`,
        );
      }
      if (cleanProducerDisplayText(cue.text) !== cue.text || /^\s*\(/.test(cue.text)) {
        throw new Error(
          `${track.sceneId} display caption contains a control instruction or non-language tag.`,
        );
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
  if (input.manifest) {
    assertProducerSampleManifest(input.manifest);
    if (input.manifest.compositionId !== input.compositionId) {
      throw new Error(`${input.compositionId} does not match its Producer manifest.`);
    }
    if (input.manifest.sampleStatus === "maintained") {
      if (!input.assetManifest) {
        throw new Error(`${input.compositionId} must include its Producer asset manifest.`);
      }
      assertProducerAssetManifest(input.assetManifest);
      if (
        input.assetManifest.compositionId !== input.manifest.compositionId ||
        input.assetManifest.slug !== input.manifest.slug
      ) {
        throw new Error(
          `${input.compositionId} asset manifest does not match its sample manifest.`,
        );
      }
      if (input.manifest.soundDesign) {
        const assetsById = new Map(input.assetManifest.assets.map((asset) => [asset.id, asset]));
        const roleGroups = [
          ["narration", input.manifest.soundDesign.narrationAssetIds],
          ["bgm", input.manifest.soundDesign.bgmAssetIds],
          ["ambience", input.manifest.soundDesign.ambienceAssetIds],
          ["sfx", input.manifest.soundDesign.sfxAssetIds],
        ] as const;
        for (const [role, assetIds] of roleGroups) {
          for (const assetId of assetIds) {
            const asset = assetsById.get(assetId);
            if (!asset) {
              throw new Error(`${input.compositionId} ${role} asset ${assetId} is missing.`);
            }
            if (asset.kind !== "audio" || asset.sound?.role !== role) {
              throw new Error(
                `${input.compositionId} ${role} asset ${assetId} must declare the matching sound role.`,
              );
            }
          }
        }
      }
      for (const registrationId of [
        input.manifest.compositionId,
        input.manifest.render.cover16x9CompositionId,
        input.manifest.render.cover9x16CompositionId,
      ]) {
        if (!input.registeredCompositionIds.includes(registrationId)) {
          throw new Error(`${registrationId} is missing Remotion registration.`);
        }
      }
    }
  }
  validateProducerAudioAlignment(input);
  if (!input.registeredCompositionIds.includes(input.compositionId)) {
    throw new Error(`${input.compositionId} is missing Remotion registration.`);
  }
  await validateProducerArtifactBoundary(input);
};
