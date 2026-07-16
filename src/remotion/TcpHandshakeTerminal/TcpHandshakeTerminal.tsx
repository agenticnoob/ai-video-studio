import { Audio } from "@remotion/media";
import { TransitionSeries } from "@remotion/transitions";
import type { FC } from "react";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";

import { StandaloneBottomCaption } from "../standalone-video";
import { getProducerStyleProfile } from "../styles";
import { getProducerTransitionPreset } from "../transitions";
import { tcpHandshakeTerminalAudio } from "./audio.generated";
import {
  tcpHandshakeTerminalAssets,
  tcpHandshakeTerminalScenes,
  tcpHandshakeTerminalSceneStarts,
} from "./data";
import { TcpHandshakeTerminalSoundtrack } from "./soundtrack";
import {
  TCP_HANDSHAKE_TERMINAL_DURATION_IN_FRAMES,
  TCP_HANDSHAKE_TERMINAL_TRANSITION_IN_FRAMES,
  type TcpHandshakeTerminalScene,
} from "./types";

const profile = getProducerStyleProfile("retro-terminal");
const terminalTransition = getProducerTransitionPreset({
  id: "signal-wipe",
  durationInFrames: TCP_HANDSHAKE_TERMINAL_TRANSITION_IN_FRAMES,
});

const TerminalScene: FC<{ readonly scene: TcpHandshakeTerminalScene; readonly index: number }> = ({
  scene,
  index,
}) => {
  const frame = useCurrentFrame();
  const revealCount = Math.min(scene.lines.length, Math.max(0, Math.floor((frame - 14) / 14) + 1));
  const packetX = interpolate(frame, [8, 68], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        background: profile.palette.background,
        color: profile.palette.ink,
        fontFamily: "Menlo, Consolas, monospace",
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(84,255,136,0.05) 0px, rgba(84,255,136,0.05) 1px, transparent 1px, transparent 7px)",
          backgroundPositionY: `${frame % 8}px`,
          opacity: 0.8,
        }}
      />
      <div
        style={{
          border: `2px solid ${profile.palette.accent}77`,
          boxShadow: `0 0 55px ${profile.palette.accent}18 inset`,
          inset: "74px 90px 150px",
          position: "absolute",
        }}
      >
        <div
          style={{
            alignItems: "center",
            borderBottom: `2px solid ${profile.palette.accent}55`,
            display: "flex",
            fontSize: 26,
            fontWeight: 800,
            justifyContent: "space-between",
            letterSpacing: 3,
            padding: "22px 30px",
          }}
        >
          <span>TCP_TRACE / SESSION_0x03</span>
          <span style={{ color: profile.palette.secondary }}>
            STEP {index + 1}/3 · {scene.state}
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.06fr 0.94fr",
            height: "calc(100% - 76px)",
          }}
        >
          <div style={{ padding: "50px 52px" }}>
            <div style={{ color: profile.palette.accent, fontSize: 34, marginBottom: 42 }}>
              {scene.command}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
              {scene.lines.map((line, lineIndex) => (
                <div
                  key={line}
                  style={{
                    color:
                      lineIndex === scene.lines.length - 1
                        ? profile.palette.secondary
                        : profile.palette.ink,
                    fontSize: 42,
                    fontWeight: lineIndex === scene.lines.length - 1 ? 900 : 600,
                    opacity: lineIndex < revealCount ? 1 : 0.12,
                    translate: lineIndex < revealCount ? "0 0" : "28px 0",
                  }}
                >
                  <span style={{ color: profile.palette.muted, marginRight: 22 }}>&gt;</span>
                  {line}
                </div>
              ))}
            </div>
            <div
              style={{
                alignItems: "center",
                display: "flex",
                gap: 18,
                marginTop: 76,
              }}
            >
              <div
                style={{
                  border: `2px solid ${profile.palette.accent}`,
                  color: profile.palette.accent,
                  fontSize: 34,
                  fontWeight: 900,
                  padding: "16px 24px",
                }}
              >
                {scene.packet}
              </div>
              <div
                style={{
                  background: profile.palette.accent,
                  height: 3,
                  position: "relative",
                  width: 420,
                }}
              >
                <div
                  style={{
                    background: profile.palette.secondary,
                    boxShadow: `0 0 25px ${profile.palette.secondary}`,
                    height: 18,
                    left: `${packetX * 96}%`,
                    position: "absolute",
                    top: -8,
                    width: 18,
                  }}
                />
              </div>
            </div>
          </div>
          <div
            style={{
              alignItems: "center",
              borderLeft: `2px solid ${profile.palette.accent}44`,
              display: "flex",
              justifyContent: "center",
              overflow: "hidden",
              padding: 34,
            }}
          >
            <Img
              src={staticFile(tcpHandshakeTerminalAssets.packet)}
              style={{
                filter: "drop-shadow(0 0 24px rgba(84,255,136,0.24))",
                opacity: interpolate(frame, [4, 24], [0, 0.92], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
                scale: interpolate(frame, [4, 34], [1.04, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
                width: "100%",
              }}
            />
          </div>
        </div>
      </div>
      <StandaloneBottomCaption
        captions={scene.captions}
        variant="landscape"
        style={{
          background: "rgba(2,8,6,0.98)",
          border: `1px solid ${profile.palette.accent}`,
          borderRadius: 0,
          bottom: 38,
          color: profile.palette.ink,
          fontFamily: "Menlo, Consolas, monospace",
          fontSize: 30,
          left: 90,
          right: 90,
          textAlign: "left",
        }}
      />
    </AbsoluteFill>
  );
};

export const TcpHandshakeTerminal: FC = () => (
  <AbsoluteFill style={{ background: profile.palette.background }}>
    <TransitionSeries>
      <TransitionSeries.Sequence
        durationInFrames={
          tcpHandshakeTerminalScenes[0].durationInFrames +
          TCP_HANDSHAKE_TERMINAL_TRANSITION_IN_FRAMES
        }
      >
        <TerminalScene index={0} scene={tcpHandshakeTerminalScenes[0]} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={terminalTransition.presentation}
        timing={terminalTransition.timing}
      />
      <TransitionSeries.Sequence
        durationInFrames={
          tcpHandshakeTerminalScenes[1].durationInFrames +
          TCP_HANDSHAKE_TERMINAL_TRANSITION_IN_FRAMES
        }
      >
        <TerminalScene index={1} scene={tcpHandshakeTerminalScenes[1]} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={terminalTransition.presentation}
        timing={terminalTransition.timing}
      />
      <TransitionSeries.Sequence durationInFrames={tcpHandshakeTerminalScenes[2].durationInFrames}>
        <TerminalScene index={2} scene={tcpHandshakeTerminalScenes[2]} />
      </TransitionSeries.Sequence>
    </TransitionSeries>
    {tcpHandshakeTerminalAudio.map((track, index) => (
      <Sequence
        key={track.sceneId}
        from={tcpHandshakeTerminalSceneStarts[index]}
        durationInFrames={track.durationInFrames}
      >
        <Audio
          disallowFallbackToHtml5Audio
          onError={() => "fail"}
          src={staticFile(`generated/tcp-handshake-terminal/assets/narration-${track.sceneId}.wav`)}
        />
      </Sequence>
    ))}
    <TcpHandshakeTerminalSoundtrack
      durationInFrames={TCP_HANDSHAKE_TERMINAL_DURATION_IN_FRAMES}
      tracks={tcpHandshakeTerminalAudio}
    />
  </AbsoluteFill>
);
