import type { FC } from "react";

import {
  getProducerSoundLibrary,
  getProducerTransitionSfxRole,
  ProducerSoundtrack,
} from "../sound";
import type { ProducerAssetManifest } from "../producer-samples/asset-manifest";
import assetManifestJson from "./assets.manifest.json";
import { tcpHandshakeTerminalSceneStarts } from "./data";
import type { TcpHandshakeTerminalAudioTrack } from "./types";

const transitionRole = getProducerTransitionSfxRole("signal-wipe");
if (transitionRole !== "signal-sweep") throw new Error("Terminal transition SFX contract changed.");

export const TcpHandshakeTerminalSoundtrack: FC<{
  readonly tracks: readonly TcpHandshakeTerminalAudioTrack[];
  readonly durationInFrames: number;
}> = ({ tracks, durationInFrames }) => {
  const library = getProducerSoundLibrary(assetManifestJson as ProducerAssetManifest);
  const required = (role: "bgm" | "ambience" | "sfx", id: string) => {
    const entry = library[role].find((candidate) => candidate.id === id);
    if (!entry) throw new Error(`Missing terminal ${role} asset: ${id}.`);
    return entry;
  };
  const bgm = required("bgm", "terminal-bgm");
  const ambience = required("ambience", "terminal-ambience");
  const sweep = required("sfx", "signal-sweep");
  const key = required("sfx", "key-confirm");
  const narrationWindows = tracks.map((track, index) => ({
    startFrame: tcpHandshakeTerminalSceneStarts[index],
    endFrame: tcpHandshakeTerminalSceneStarts[index] + track.durationInFrames,
  }));
  return (
    <ProducerSoundtrack
      ambience={{ id: ambience.id, src: ambience.src, volume: 0.055 }}
      bgm={{ id: bgm.id, src: bgm.src, volume: 0.2 }}
      duckedBgmVolume={0.06}
      durationInFrames={durationInFrames}
      narrationWindows={narrationWindows}
      sfx={[
        {
          id: "terminal-sweep-1",
          src: sweep.src,
          from: Math.max(0, narrationWindows[0].endFrame - 3),
          durationInFrames: 14,
          volume: 0.3,
          transitionId: "signal-wipe",
        },
        {
          id: "terminal-sweep-2",
          src: sweep.src,
          from: Math.max(0, narrationWindows[1].endFrame - 3),
          durationInFrames: 14,
          volume: 0.3,
          transitionId: "signal-wipe",
        },
        {
          id: "terminal-key",
          src: key.src,
          from: Math.max(0, narrationWindows[2].endFrame - 14),
          durationInFrames: 6,
          volume: 0.26,
        },
      ]}
    />
  );
};
