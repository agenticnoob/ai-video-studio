import type { FC } from "react";
import { AbsoluteFill } from "remotion";

const Cover: FC<{ readonly portrait: boolean }> = ({ portrait }) => (
  <AbsoluteFill
    style={{
      alignItems: "center",
      background: "radial-gradient(circle at 68% 22%, #164e63 0%, #07111f 48%, #030712 100%)",
      color: "#f8fafc",
      display: "flex",
      fontFamily: 'Inter, "Noto Sans SC", ui-sans-serif, system-ui, sans-serif',
      justifyContent: "center",
      padding: portrait ? 110 : 140,
    }}
  >
    <div style={{ maxWidth: portrait ? 850 : 1500 }}>
      <div
        style={{
          color: "#38bdf8",
          fontSize: portrait ? 34 : 30,
          fontWeight: 800,
          letterSpacing: 5,
        }}
      >
        AGENT PRODUCER · PHASE 7
      </div>
      <h1
        style={{
          fontSize: portrait ? 126 : 112,
          letterSpacing: -5,
          lineHeight: 0.98,
          margin: "34px 0",
        }}
      >
        动态素材与声音设计
      </h1>
      <p style={{ color: "#cbd5e1", fontSize: portrait ? 48 : 42, lineHeight: 1.3, margin: 0 }}>
        本地媒体、逐帧动效、旁白 ducking 与可审核音效
      </p>
    </div>
  </AbsoluteFill>
);

export const AgentProducerMediaSoundProofCover16x9 = () => <Cover portrait={false} />;
export const AgentProducerMediaSoundProofCover9x16 = () => <Cover portrait />;
