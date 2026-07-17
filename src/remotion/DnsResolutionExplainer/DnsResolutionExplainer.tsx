import { Audio } from "@remotion/media";
import { TransitionSeries } from "@remotion/transitions";
import type { FC } from "react";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";

import { StandaloneBottomCaption } from "../standalone-video";
import { getProducerStyleProfile } from "../styles";
import { getProducerTransitionPreset } from "../transitions";
import { dnsResolutionExplainerAudio } from "./audio.generated";
import {
  dnsResolutionExplainerAssets,
  dnsResolutionExplainerScenes,
  dnsResolutionExplainerSceneStarts,
} from "./data";
import { DnsResolutionExplainerSoundtrack } from "./soundtrack";
import {
  DNS_RESOLUTION_EXPLAINER_END_HOLD_IN_FRAMES,
  DNS_RESOLUTION_EXPLAINER_NARRATION_DURATION_IN_FRAMES,
  DNS_RESOLUTION_EXPLAINER_TRANSITION_IN_FRAMES,
  type DnsResolutionExplainerScene,
} from "./types";

const profile = getProducerStyleProfile("hand-drawn-explainer");
const transition = getProducerTransitionPreset({
  id: "directional-slide",
  direction: "from-right",
  durationInFrames: DNS_RESOLUTION_EXPLAINER_TRANSITION_IN_FRAMES,
});

const PaperBackground: FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: profile.palette.background,
        backgroundImage:
          "radial-gradient(circle at 18% 22%, rgba(231, 87, 63, 0.08), transparent 32%), repeating-linear-gradient(2deg, rgba(41, 38, 36, 0.035) 0 2px, transparent 2px 18px)",
      }}
    />
  );
};

const DnsScene: FC<{ readonly scene: DnsResolutionExplainerScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const entrance = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const reveal = interpolate(
    frame,
    [8, Math.min(96, Math.max(40, scene.durationInFrames * 0.48))],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div
        style={{
          color: profile.palette.ink,
          fontFamily: '"Noto Sans CJK SC", "Noto Sans SC", sans-serif',
          left: 120,
          opacity: entrance,
          position: "absolute",
          top: 82,
          translate: `${(1 - entrance) * -28}px 0`,
          width: 1680,
        }}
      >
        <div
          style={{
            color: profile.palette.secondary,
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: 3,
          }}
        >
          {scene.step}
        </div>
        <h1 style={{ fontSize: 82, lineHeight: 1.05, margin: "14px 0 12px" }}>{scene.headline}</h1>
        <div style={{ color: profile.palette.muted, fontSize: 34, lineHeight: 1.35 }}>
          {scene.detail}
        </div>
      </div>
      <div
        style={{
          border: `5px solid ${profile.palette.ink}`,
          borderRadius: 32,
          boxShadow: "10px 12px 0 rgba(41, 38, 36, 0.16)",
          height: 610,
          left: 270,
          overflow: "hidden",
          position: "absolute",
          top: 332,
          width: 1380,
        }}
      >
        <div
          style={{
            height: 610,
            opacity: 0.72 + reveal * 0.28,
            position: "relative",
            scale: 0.985 + reveal * 0.015,
            width: 1380,
          }}
        >
          <Img
            src={staticFile(dnsResolutionExplainerAssets.diagram)}
            style={{
              height: 610,
              left: 0,
              objectFit: "cover",
              position: "absolute",
              top: 0,
              width: 1380,
            }}
          />
        </div>
      </div>
      <StandaloneBottomCaption captions={scene.captions} variant="landscape" />
    </AbsoluteFill>
  );
};

export const DnsResolutionExplainer: FC = () => (
  <AbsoluteFill style={{ background: profile.palette.background }}>
    <PaperBackground />
    <TransitionSeries>
      <TransitionSeries.Sequence
        durationInFrames={
          dnsResolutionExplainerScenes[0].durationInFrames +
          DNS_RESOLUTION_EXPLAINER_TRANSITION_IN_FRAMES
        }
      >
        <DnsScene scene={dnsResolutionExplainerScenes[0]} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={transition.presentation}
        timing={transition.timing}
      />
      <TransitionSeries.Sequence
        durationInFrames={
          dnsResolutionExplainerScenes[1].durationInFrames +
          DNS_RESOLUTION_EXPLAINER_TRANSITION_IN_FRAMES
        }
      >
        <DnsScene scene={dnsResolutionExplainerScenes[1]} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={transition.presentation}
        timing={transition.timing}
      />
      <TransitionSeries.Sequence
        durationInFrames={
          dnsResolutionExplainerScenes[2].durationInFrames +
          DNS_RESOLUTION_EXPLAINER_END_HOLD_IN_FRAMES
        }
      >
        <DnsScene scene={dnsResolutionExplainerScenes[2]} />
      </TransitionSeries.Sequence>
    </TransitionSeries>
    {dnsResolutionExplainerAudio.map((track, index) => (
      <Sequence
        key={track.sceneId}
        durationInFrames={track.durationInFrames}
        from={dnsResolutionExplainerSceneStarts[index]}
      >
        <Audio
          disallowFallbackToHtml5Audio
          onError={() => "fail"}
          src={staticFile(
            `generated/dns-resolution-explainer/assets/narration-${track.sceneId}.wav`,
          )}
        />
      </Sequence>
    ))}
    <DnsResolutionExplainerSoundtrack
      durationInFrames={DNS_RESOLUTION_EXPLAINER_NARRATION_DURATION_IN_FRAMES}
      tracks={dnsResolutionExplainerAudio}
    />
  </AbsoluteFill>
);
