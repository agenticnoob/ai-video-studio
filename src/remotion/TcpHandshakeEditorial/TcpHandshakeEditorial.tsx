import { TransitionSeries } from "@remotion/transitions";
import { Audio } from "@remotion/media";
import type { FC } from "react";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";

import { StandaloneBottomCaption } from "../standalone-video";
import { getProducerStyleProfile } from "../styles";
import { getProducerTransitionPreset } from "../transitions";
import { tcpHandshakeEditorialAudio } from "./audio.generated";
import {
  tcpHandshakeEditorialAssets,
  tcpHandshakeEditorialScenes,
  tcpHandshakeEditorialSceneStarts,
} from "./data";
import { TcpHandshakeEditorialSoundtrack } from "./soundtrack";
import {
  TCP_HANDSHAKE_EDITORIAL_DURATION_IN_FRAMES,
  TCP_HANDSHAKE_EDITORIAL_TRANSITION_IN_FRAMES,
  type TcpHandshakeEditorialScene,
} from "./types";

const profile = getProducerStyleProfile("editorial-tech");
const editorialTransition = getProducerTransitionPreset({
  id: "editorial-fade",
  durationInFrames: TCP_HANDSHAKE_EDITORIAL_TRANSITION_IN_FRAMES,
});

const PacketRail: FC<{ readonly scene: TcpHandshakeEditorialScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [10, 52], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = scene.direction === "client-to-server" ? 180 + progress * 520 : 700 - progress * 520;
  return (
    <div style={{ height: 120, marginTop: 30, position: "relative", width: 880 }}>
      <div
        style={{
          background: profile.palette.muted,
          height: 2,
          left: 180,
          opacity: 0.55,
          position: "absolute",
          top: 58,
          width: 520,
        }}
      />
      <div
        style={{
          background: profile.palette.accent,
          borderRadius: 999,
          boxShadow: `0 0 28px ${profile.palette.accent}`,
          color: profile.palette.background,
          fontSize: 28,
          fontWeight: 900,
          left: x - 80,
          padding: "12px 22px",
          position: "absolute",
          top: 30,
          width: 116,
          textAlign: "center",
        }}
      >
        {scene.packet}
      </div>
    </div>
  );
};

const EditorialScene: FC<{
  readonly scene: TcpHandshakeEditorialScene;
  readonly index: number;
}> = ({ scene, index }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translate = interpolate(frame, [0, 24], [36, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        background: profile.palette.background,
        color: profile.palette.ink,
        fontFamily: '"Noto Sans CJK SC", "Noto Sans SC", sans-serif',
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(85,220,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(85,220,255,0.07) 1px, transparent 1px)",
          backgroundPosition: `${frame * 0.12}px ${frame * 0.08}px`,
          backgroundSize: "72px 72px",
          opacity: 0.45,
        }}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "0.9fr 1.1fr",
          gap: 86,
          inset: "98px 110px 150px",
          position: "absolute",
        }}
      >
        <div
          style={{
            alignSelf: "center",
            opacity,
            translate: `${-translate}px 0`,
          }}
        >
          <div
            style={{
              color: profile.palette.accent,
              fontSize: 30,
              fontWeight: 900,
              letterSpacing: 5,
              marginBottom: 28,
            }}
          >
            TCP HANDSHAKE · {scene.step}
          </div>
          <h1
            style={{
              fontSize: 92,
              letterSpacing: -4,
              lineHeight: 1.03,
              margin: 0,
              maxWidth: 760,
            }}
          >
            {scene.headline}
          </h1>
          <p
            style={{
              color: profile.palette.muted,
              fontSize: 38,
              lineHeight: 1.35,
              margin: "34px 0 0",
              maxWidth: 720,
            }}
          >
            {scene.detail}
          </p>
          <PacketRail scene={scene} />
        </div>
        <div
          style={{
            alignSelf: "center",
            background: profile.palette.surface,
            border: `1px solid ${profile.palette.accent}55`,
            borderRadius: 34,
            boxShadow: "0 32px 90px rgba(0,0,0,0.35)",
            opacity: interpolate(frame, [8, 28], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            overflow: "hidden",
            padding: 22,
            scale: interpolate(frame, [8, 32], [0.96, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <Img
            src={staticFile(tcpHandshakeEditorialAssets.diagram)}
            style={{ borderRadius: 22, display: "block", width: "100%" }}
          />
          <div
            style={{
              color: profile.palette.secondary,
              fontSize: 26,
              fontWeight: 800,
              padding: "18px 18px 4px",
              textAlign: "right",
            }}
          >
            {String(index + 1).padStart(2, "0")} / 03 · SEQUENCE CONFIRMATION
          </div>
        </div>
      </div>
      <StandaloneBottomCaption
        captions={scene.captions}
        variant="landscape"
        style={{
          background: "rgba(7,16,25,0.96)",
          border: "none",
          borderLeft: `5px solid ${profile.palette.accent}`,
          borderRadius: 0,
          bottom: 38,
          color: profile.palette.ink,
          fontSize: 32,
          left: 110,
          right: 660,
          textAlign: "left",
        }}
      />
    </AbsoluteFill>
  );
};

export const TcpHandshakeEditorial: FC = () => (
  <AbsoluteFill style={{ background: profile.palette.background }}>
    <TransitionSeries>
      <TransitionSeries.Sequence
        durationInFrames={
          tcpHandshakeEditorialScenes[0].durationInFrames +
          TCP_HANDSHAKE_EDITORIAL_TRANSITION_IN_FRAMES
        }
      >
        <EditorialScene index={0} scene={tcpHandshakeEditorialScenes[0]} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={editorialTransition.presentation}
        timing={editorialTransition.timing}
      />
      <TransitionSeries.Sequence
        durationInFrames={
          tcpHandshakeEditorialScenes[1].durationInFrames +
          TCP_HANDSHAKE_EDITORIAL_TRANSITION_IN_FRAMES
        }
      >
        <EditorialScene index={1} scene={tcpHandshakeEditorialScenes[1]} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={editorialTransition.presentation}
        timing={editorialTransition.timing}
      />
      <TransitionSeries.Sequence durationInFrames={tcpHandshakeEditorialScenes[2].durationInFrames}>
        <EditorialScene index={2} scene={tcpHandshakeEditorialScenes[2]} />
      </TransitionSeries.Sequence>
    </TransitionSeries>
    {tcpHandshakeEditorialAudio.map((track, index) => (
      <Sequence
        key={track.sceneId}
        from={tcpHandshakeEditorialSceneStarts[index]}
        durationInFrames={track.durationInFrames}
      >
        <Audio
          disallowFallbackToHtml5Audio
          onError={() => "fail"}
          src={staticFile(
            `generated/tcp-handshake-editorial/assets/narration-${track.sceneId}.wav`,
          )}
        />
      </Sequence>
    ))}
    <TcpHandshakeEditorialSoundtrack
      durationInFrames={TCP_HANDSHAKE_EDITORIAL_DURATION_IN_FRAMES}
      tracks={tcpHandshakeEditorialAudio}
    />
  </AbsoluteFill>
);
