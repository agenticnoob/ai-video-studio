import type { FC } from "react";

import {
  getProducerSoundLibrary,
  getProducerTransitionSfxRole,
  ProducerSoundtrack,
} from "../sound";
import type { ProducerAssetManifest } from "../producer-samples/asset-manifest";
import assetManifestJson from "./assets.manifest.json";
import { tcpHandshakeEditorialSceneStarts } from "./data";
import type { TcpHandshakeEditorialAudioTrack } from "./types";

const transitionRole = getProducerTransitionSfxRole("editorial-fade");
if (transitionRole !== "soft-whoosh") throw new Error("Editorial transition SFX contract changed.");

export const TcpHandshakeEditorialSoundtrack: FC<{
  readonly tracks: readonly TcpHandshakeEditorialAudioTrack[];
  readonly durationInFrames: number;
}> = ({ tracks, durationInFrames }) => {
  const library = getProducerSoundLibrary(assetManifestJson as ProducerAssetManifest);
  const required = (role: "bgm" | "ambience" | "sfx", id: string) => {
    const entry = library[role].find((candidate) => candidate.id === id);
    if (!entry) throw new Error(`Missing editorial ${role} asset: ${id}.`);
    return entry;
  };
  const bgm = required("bgm", "editorial-bgm");
  const ambience = required("ambience", "editorial-ambience");
  const whoosh = required("sfx", "soft-whoosh");
  const node = required("sfx", "node-confirm");
  const narrationWindows = tracks.map((track, index) => ({
    startFrame: tcpHandshakeEditorialSceneStarts[index],
    endFrame: tcpHandshakeEditorialSceneStarts[index] + track.durationInFrames,
  }));

  return (
    <ProducerSoundtrack
      ambience={{ id: ambience.id, src: ambience.src, volume: 0.045 }}
      bgm={{ id: bgm.id, src: bgm.src, volume: 0.18 }}
      duckedBgmVolume={0.055}
      durationInFrames={durationInFrames}
      narrationWindows={narrationWindows}
      sfx={[
        {
          id: "editorial-whoosh-1",
          src: whoosh.src,
          from: Math.max(0, narrationWindows[0].endFrame - 4),
          durationInFrames: 18,
          volume: 0.28,
          transitionId: "editorial-fade",
        },
        {
          id: "editorial-whoosh-2",
          src: whoosh.src,
          from: Math.max(0, narrationWindows[1].endFrame - 4),
          durationInFrames: 18,
          volume: 0.28,
          transitionId: "editorial-fade",
        },
        {
          id: "editorial-node",
          src: node.src,
          from: Math.max(0, narrationWindows[2].endFrame - 18),
          durationInFrames: 8,
          volume: 0.24,
        },
      ]}
    />
  );
};
