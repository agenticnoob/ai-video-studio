import type { ProducerAssetManifest } from "../producer-samples/asset-manifest";
import { aiDaily20260721Audio } from "./audio.generated";
import aiDaily20260721AssetManifestJson from "./assets.manifest.json";
import { aiDaily20260721Manifest } from "./manifest";
import { aiDaily20260721NarrationBeats } from "./script";
import { AI_DAILY20260721_COMPOSITION_ID } from "./types";

export const producerValidationInput = {
  compositionId: AI_DAILY20260721_COMPOSITION_ID,
  manifest: aiDaily20260721Manifest,
  assetManifest: aiDaily20260721AssetManifestJson as ProducerAssetManifest,
  beats: aiDaily20260721NarrationBeats.map((beat) => ({
    id: beat.sceneId,
    narrationRequired: true as const,
    ttsText: beat.text,
  })),
  tracks: aiDaily20260721Audio,
  scenes: aiDaily20260721Audio.map((track) => ({
    id: track.sceneId,
    durationInFrames: track.durationInFrames,
  })),
  scenePaddingFrames: 0,
  artifactPaths: ["public/generated/ai-daily-2026-07-21/", "out/ai-daily-2026-07-21/"],
  registeredCompositionIds: [
    AI_DAILY20260721_COMPOSITION_ID,
    aiDaily20260721Manifest.render.cover16x9CompositionId,
    aiDaily20260721Manifest.render.cover9x16CompositionId,
  ],
};
