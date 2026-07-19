import type { ProducerAssetManifest } from "../producer-samples/asset-manifest";
import assetManifestJson from "./assets.manifest.json";
import { aiDailyNews20260719Audio } from "./audio.generated";
import { narrationBeats } from "./script";
import { aiDailyNews20260719Manifest } from "./manifest";
import { AI_DAILY_NEWS_20260719_COMPOSITION_ID } from "./types";

export const producerValidationInput = {
  compositionId: AI_DAILY_NEWS_20260719_COMPOSITION_ID,
  manifest: aiDailyNews20260719Manifest,
  assetManifest: assetManifestJson as ProducerAssetManifest,
  beats: narrationBeats.map((beat) => ({
    id: beat.id,
    narrationRequired: true as const,
    ttsText: beat.narration,
  })),
  tracks: aiDailyNews20260719Audio,
  scenes: aiDailyNews20260719Audio.map((track) => ({
    id: track.sceneId,
    durationInFrames: track.durationInFrames + 8,
  })),
  scenePaddingFrames: 8,
  artifactPaths: ["public/generated/ai-daily-news-2026-07-19/", "out/ai-daily-news-2026-07-19/"],
  registeredCompositionIds: [
    AI_DAILY_NEWS_20260719_COMPOSITION_ID,
    aiDailyNews20260719Manifest.render.cover16x9CompositionId,
    aiDailyNews20260719Manifest.render.cover9x16CompositionId,
  ],
};