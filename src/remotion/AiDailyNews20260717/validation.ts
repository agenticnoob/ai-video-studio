import type { ProducerAssetManifest } from "../producer-samples/asset-manifest";
import assetManifestJson from "./assets.manifest.json";
import { aiDailyNews20260717Audio } from "./audio.generated";
import { narrationBeats } from "./script";
import { aiDailyNews20260717Manifest } from "./manifest";
import { AI_DAILY_NEWS_20260717_COMPOSITION_ID } from "./types";

export const producerValidationInput = {
  compositionId: AI_DAILY_NEWS_20260717_COMPOSITION_ID,
  manifest: aiDailyNews20260717Manifest,
  assetManifest: assetManifestJson as ProducerAssetManifest,
  beats: narrationBeats.map((beat) => ({
    id: beat.id,
    narrationRequired: true as const,
    ttsText: beat.narration,
  })),
  tracks: aiDailyNews20260717Audio,
  scenes: aiDailyNews20260717Audio.map((track) => ({
    id: track.sceneId,
    durationInFrames: track.durationInFrames + 8,
  })),
  scenePaddingFrames: 8,
  artifactPaths: ["public/generated/ai-daily-news-2026-07-17/", "out/ai-daily-news-2026-07-17/"],
  registeredCompositionIds: [
    AI_DAILY_NEWS_20260717_COMPOSITION_ID,
    aiDailyNews20260717Manifest.render.cover16x9CompositionId,
    aiDailyNews20260717Manifest.render.cover9x16CompositionId,
  ],
};