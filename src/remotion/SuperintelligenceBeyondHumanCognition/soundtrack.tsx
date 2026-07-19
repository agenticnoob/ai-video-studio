import type { FC } from "react";

import type { ProducerAssetManifest } from "../producer-samples/asset-manifest";
import { getProducerSoundLibrary, ProducerSoundtrack } from "../sound";
import assetManifestJson from "./assets.manifest.json";
import { superintelligenceBeyondHumanCognitionAudio } from "./audio.generated";
import { superintelligenceBeyondHumanCognitionSceneStarts } from "./data";

export const SuperintelligenceBeyondHumanCognitionSoundtrack: FC<{
  readonly durationInFrames: number;
}> = ({ durationInFrames }) => {
  const library = getProducerSoundLibrary(assetManifestJson as ProducerAssetManifest);
  const required = (role: "bgm" | "ambience" | "sfx", id: string) => {
    const entry = library[role].find((candidate) => candidate.id === id);
    if (!entry) throw new Error(`Missing superintelligence ${role} asset: ${id}.`);
    return entry;
  };

  const bed = required("bgm", "cinematic-bed");
  const ambience = required("ambience", "spatial-air");
  const bloom = required("sfx", "chapter-bloom");
  const node = required("sfx", "node-confirm");
  const sweep = required("sfx", "phase-sweep");
  const impact = required("sfx", "historical-impact");
  const starts = superintelligenceBeyondHumanCognitionSceneStarts;
  const narrationWindows = superintelligenceBeyondHumanCognitionAudio.map((track, index) => ({
    startFrame: starts[index],
    endFrame: starts[index] + track.durationInFrames,
  }));

  return (
    <ProducerSoundtrack
      ambience={{ id: ambience.id, src: ambience.src, volume: 0.025 }}
      bgm={{ id: bed.id, src: bed.src, volume: 0.11 }}
      duckedBgmVolume={0.035}
      durationInFrames={durationInFrames}
      narrationWindows={narrationWindows}
      sfx={[
        { id: "opening-node", src: node.src, from: 32, durationInFrames: 12, volume: 0.18 },
        { id: "loop-close", src: impact.src, from: starts[3] + 92, durationInFrames: 14, volume: 0.22 },
        { id: "recursive-node", src: node.src, from: starts[4] + 120, durationInFrames: 12, volume: 0.17 },
        { id: "phase-change", src: sweep.src, from: starts[5] + 104, durationInFrames: 18, volume: 0.2 },
        { id: "chapter-two", src: bloom.src, from: starts[3], durationInFrames: 15, volume: 0.2, transitionId: "cinematic-film-burn" },
        { id: "chapter-three", src: bloom.src, from: starts[7], durationInFrames: 15, volume: 0.2, transitionId: "cinematic-film-burn" },
        { id: "dependency-transfer", src: impact.src, from: starts[9] + 110, durationInFrames: 14, volume: 0.22 },
        { id: "chapter-four", src: bloom.src, from: starts[10], durationInFrames: 15, volume: 0.2, transitionId: "cinematic-film-burn" },
        { id: "chapter-five", src: bloom.src, from: starts[13], durationInFrames: 15, volume: 0.21, transitionId: "cinematic-film-burn" },
        { id: "historical-subject", src: impact.src, from: starts[13] + 110, durationInFrames: 14, volume: 0.24 },
        { id: "final-choice", src: node.src, from: starts[14] + 72, durationInFrames: 12, volume: 0.17 },
      ]}
    />
  );
};
