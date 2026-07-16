import type { FC } from "react";
import { AbsoluteFill } from "remotion";

const EditorialCover: FC<{ readonly portrait: boolean }> = ({ portrait }) => (
  <AbsoluteFill
    style={{
      background: "linear-gradient(145deg, #071019 0%, #102536 62%, #0b3347 100%)",
      color: "#f4fbff",
      fontFamily: '"Noto Sans CJK SC", "Noto Sans SC", sans-serif',
      overflow: "hidden",
      padding: portrait ? 104 : 124,
    }}
  >
    <div
      style={{
        backgroundImage:
          "linear-gradient(rgba(85,220,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(85,220,255,0.08) 1px, transparent 1px)",
        backgroundSize: portrait ? "72px 72px" : "84px 84px",
        inset: 0,
        position: "absolute",
      }}
    />
    <div
      style={{ maxWidth: portrait ? 850 : 1450, position: "relative", top: portrait ? 300 : 150 }}
    >
      <div
        style={{
          color: "#55dcff",
          fontSize: portrait ? 38 : 34,
          fontWeight: 900,
          letterSpacing: 6,
        }}
      >
        THREE PACKETS · ONE CONNECTION
      </div>
      <h1
        style={{
          fontSize: portrait ? 142 : 132,
          letterSpacing: -6,
          lineHeight: 0.98,
          margin: "42px 0",
        }}
      >
        TCP 三次握手
      </h1>
      <p style={{ color: "#9fb4c6", fontSize: portrait ? 52 : 46, lineHeight: 1.3, margin: 0 }}>
        SYN → SYN-ACK → ACK，双向序列号如何完成确认
      </p>
      <div style={{ display: "flex", gap: 22, marginTop: 80 }}>
        {["SYN", "SYN-ACK", "ACK"].map((label, index) => (
          <div
            key={label}
            style={{
              background: index === 1 ? "#ffcf5a" : "#55dcff",
              borderRadius: 999,
              color: "#071019",
              fontSize: portrait ? 30 : 28,
              fontWeight: 900,
              padding: "16px 28px",
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  </AbsoluteFill>
);

export const TcpHandshakeEditorialCover16x9 = () => <EditorialCover portrait={false} />;
export const TcpHandshakeEditorialCover9x16 = () => <EditorialCover portrait />;
