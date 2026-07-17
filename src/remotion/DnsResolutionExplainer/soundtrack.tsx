import type { FC } from "react";

import type { ProducerAssetManifest } from "../producer-samples/asset-manifest";
import {
  getProducerSoundLibrary,
  getProducerTransitionSfxRole,
  ProducerSoundtrack,
} from "../sound";
import assetManifestJson from "./assets.manifest.json";
import { dnsResolutionExplainerSceneStarts } from "./data";
import type { DnsResolutionExplainerAudioTrack } from "./types";

const transitionRole = getProducerTransitionSfxRole("directional-slide");
if (transitionRole !== "directional-whoosh") {
  throw new Error("DNS explainer transition SFX contract changed.");
}

export const DnsResolutionExplainerSoundtrack: FC<{
  readonly tracks: readonly DnsResolutionExplainerAudioTrack[];
  readonly durationInFrames: number;
}> = ({ tracks, durationInFrames }) => {
  const library = getProducerSoundLibrary(assetManifestJson as ProducerAssetManifest);
  const required = (role: "bgm" | "ambience" | "sfx", id: string) => {
    const entry = library[role].find((candidate) => candidate.id === id);
    if (!entry) throw new Error(`Missing DNS ${role} asset: ${id}.`);
    return entry;
  };
  const bgm = required("bgm", "dns-bgm");
  const ambience = required("ambience", "paper-room");
  const query = required("sfx", "pencil-query");
  const hop = required("sfx", "resolver-hop");
  const answer = required("sfx", "answer-confirm");
  const narrationWindows = tracks.map((track, index) => ({
    startFrame: dnsResolutionExplainerSceneStarts[index],
    endFrame: dnsResolutionExplainerSceneStarts[index] + track.durationInFrames,
  }));

  return (
    <ProducerSoundtrack
      ambience={{ id: ambience.id, src: ambience.src, volume: 0.04 }}
      bgm={{ id: bgm.id, src: bgm.src, volume: 0.16 }}
      duckedBgmVolume={0.05}
      durationInFrames={durationInFrames}
      narrationWindows={narrationWindows}
      sfx={[
        {
          id: "dns-query",
          src: query.src,
          from: 18,
          durationInFrames: 10,
          volume: 0.24,
        },
        {
          id: "dns-hop",
          src: hop.src,
          from: narrationWindows[1].startFrame + 28,
          durationInFrames: 14,
          volume: 0.26,
          transitionId: "directional-slide",
        },
        {
          id: "dns-answer",
          src: answer.src,
          from: narrationWindows[2].startFrame + 34,
          durationInFrames: 16,
          volume: 0.24,
        },
      ]}
    />
  );
};
