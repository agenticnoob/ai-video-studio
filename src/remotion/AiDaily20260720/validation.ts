import { aiDaily20260720Audio } from "./audio.generated";
import aiDaily20260720AssetManifestJson from "./assets.manifest.json";
import { aiDaily20260720Manifest } from "./manifest";
import { aiDaily20260720NarrationBeats } from "./script";
import { AI_DAILY20260720_COMPOSITION_ID } from "./types";
import type { ProducerAssetManifest } from "../producer-samples/asset-manifest";

const aiDaily20260720AssetManifest = aiDaily20260720AssetManifestJson as ProducerAssetManifest;

export const producerValidationInput = {
  compositionId: AI_DAILY20260720_COMPOSITION_ID,
  manifest: aiDaily20260720Manifest,
  assetManifest: aiDaily20260720AssetManifest,
  beats: aiDaily20260720NarrationBeats.map((beat) => ({
    id: beat.sceneId,
    narrationRequired: true as const,
    ttsText: beat.text,
  })),
  tracks: aiDaily20260720Audio,
  scenes: aiDaily20260720Audio.map((track) => ({
    id: track.sceneId,
    durationInFrames: track.durationInFrames,
  })),
  scenePaddingFrames: 0,
  artifactPaths: ["public/generated/ai-daily-2026-07-20/", "out/ai-daily-2026-07-20/"],
  registeredCompositionIds: [
    AI_DAILY20260720_COMPOSITION_ID,
    aiDaily20260720Manifest.render.cover16x9CompositionId,
    aiDaily20260720Manifest.render.cover9x16CompositionId,
  ],
};
