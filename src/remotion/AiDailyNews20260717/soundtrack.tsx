import type { FC } from "react";
import { data } from "./data";

import {
  getProducerSoundLibrary,
  ProducerSoundtrack,
} from "../sound";
import type { ProducerAssetManifest } from "../producer-samples/asset-manifest";
import assetManifestJson from "./assets.manifest.json";

export const AiDailyNews20260717Soundtrack: FC<{
  readonly durationInFrames: number;
}> = ({ durationInFrames }) => {
  const library = getProducerSoundLibrary(assetManifestJson as ProducerAssetManifest);
  const required = (role: "bgm" | "ambience" | "sfx", id: string) => {
    const entry = library[role].find((candidate) => candidate.id === id);
    if (!entry) throw new Error(`Missing news brief ${role} asset: ${id}.`);
    return entry;
  };
  const bgm = required("bgm", "news-brief-bgm");
  const ambience = required("ambience", "studio-ambience");

  // Build narration windows from scene durations
  const scenes = data.scenes;
  const narrationWindows: { startFrame: number; endFrame: number }[] = [];
  let currentStart = 0;
  for (const scene of scenes) {
    narrationWindows.push({
      startFrame: currentStart,
      endFrame: currentStart + scene.durationInFrames,
    });
    currentStart += scene.durationInFrames;
  }

  return (
    <ProducerSoundtrack
      ambience={{ id: ambience.id, src: ambience.src, volume: 0.035 }}
      bgm={{ id: bgm.id, src: bgm.src, volume: 0.14 }}
      duckedBgmVolume={0.045}
      durationInFrames={durationInFrames}
      narrationWindows={narrationWindows}
      sfx={[]}
    />
  );
};