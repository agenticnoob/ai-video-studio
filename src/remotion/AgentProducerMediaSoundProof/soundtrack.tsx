import type { FC } from "react";

import { getProducerSoundLibrary, ProducerSoundtrack } from "../sound";
import type { ProducerAssetManifest } from "../producer-samples/asset-manifest";
import assetManifestJson from "./assets.manifest.json";
import {
  AGENT_PRODUCER_MEDIA_SOUND_PROOF_SCENE_GAP_IN_FRAMES,
  type AgentProducerMediaSoundProofAudioTrack,
} from "./types";

export const AgentProducerMediaSoundProofSoundtrack: FC<{
  readonly tracks: readonly AgentProducerMediaSoundProofAudioTrack[];
  readonly durationInFrames: number;
}> = ({ tracks, durationInFrames }) => {
  const library = getProducerSoundLibrary(assetManifestJson as ProducerAssetManifest);
  const requiredEntry = (role: "bgm" | "ambience" | "sfx", id: string) => {
    const entry = library[role].find((candidate) => candidate.id === id);
    if (!entry) throw new Error(`Missing ${role} sound library entry: ${id}.`);
    return entry;
  };
  const bgm = requiredEntry("bgm", "proof-bgm");
  const ambience = requiredEntry("ambience", "proof-ambience");
  const softWhoosh = requiredEntry("sfx", "soft-whoosh");
  const signalSweep = requiredEntry("sfx", "signal-sweep");
  let cursor = 0;
  const narrationWindows = tracks.map((track) => {
    const startFrame = cursor;
    const endFrame = startFrame + track.durationInFrames;
    cursor = endFrame + AGENT_PRODUCER_MEDIA_SOUND_PROOF_SCENE_GAP_IN_FRAMES;
    return { startFrame, endFrame };
  });
  const firstBoundary = narrationWindows[0].endFrame;
  const secondBoundary = narrationWindows[1].endFrame;

  return (
    <ProducerSoundtrack
      ambience={{ id: ambience.id, src: ambience.src, volume: 0.05 }}
      bgm={{ id: bgm.id, src: bgm.src, volume: 0.22 }}
      duckedBgmVolume={0.07}
      durationInFrames={durationInFrames}
      narrationWindows={narrationWindows}
      sfx={[
        {
          id: "soft-whoosh",
          src: softWhoosh.src,
          from: Math.max(0, firstBoundary - 4),
          durationInFrames: 18,
          volume: 0.32,
          transitionId: "editorial-fade",
        },
        {
          id: "signal-sweep",
          src: signalSweep.src,
          from: Math.max(0, secondBoundary - 4),
          durationInFrames: 15,
          volume: 0.28,
          transitionId: "signal-wipe",
        },
      ]}
    />
  );
};
