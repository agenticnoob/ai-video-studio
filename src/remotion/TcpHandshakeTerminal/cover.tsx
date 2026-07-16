import type { FC } from "react";
import { AbsoluteFill } from "remotion";

const TerminalCover: FC<{ readonly portrait: boolean }> = ({ portrait }) => (
  <AbsoluteFill
    style={{
      background: "#020806",
      color: "#b7ffcf",
      fontFamily: "Menlo, Consolas, monospace",
      overflow: "hidden",
      padding: portrait ? 96 : 116,
    }}
  >
    <AbsoluteFill
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(84,255,136,0.08) 0px, rgba(84,255,136,0.08) 1px, transparent 1px, transparent 8px)",
      }}
    />
    <div
      style={{
        border: "3px solid #54ff88",
        inset: portrait ? 78 : 88,
        padding: portrait ? 74 : 88,
        position: "absolute",
      }}
    >
      <div style={{ color: "#54ff88", fontSize: portrait ? 34 : 30, letterSpacing: 4 }}>
        $ tcp.handshake --trace
      </div>
      <h1
        style={{
          fontSize: portrait ? 126 : 116,
          letterSpacing: -5,
          lineHeight: 1,
          margin: portrait ? "180px 0 70px" : "110px 0 58px",
        }}
      >
        TCP 三次握手
      </h1>
      <div
        style={{ display: "flex", flexDirection: "column", fontSize: portrait ? 46 : 40, gap: 28 }}
      >
        <span>&gt; TX&nbsp; SYN</span>
        <span>&gt; RX&nbsp; SYN-ACK</span>
        <span>&gt; TX&nbsp; ACK</span>
        <span style={{ color: "#ffcf4a", marginTop: 24 }}>&gt; STATE&nbsp; ESTABLISHED_</span>
      </div>
    </div>
  </AbsoluteFill>
);

export const TcpHandshakeTerminalCover16x9 = () => <TerminalCover portrait={false} />;
export const TcpHandshakeTerminalCover9x16 = () => <TerminalCover portrait />;
