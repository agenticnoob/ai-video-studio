import type { FC } from "react";
import { AbsoluteFill } from "remotion";

type SampleNameCoverProps = {
  readonly portrait: boolean;
};

export const SampleNameCover: FC<SampleNameCoverProps> = ({ portrait }) => (
  <AbsoluteFill
    style={{
      alignItems: "center",
      background: "linear-gradient(145deg, #07111f 0%, #10243d 58%, #155e75 100%)",
      color: "#f8fafc",
      display: "flex",
      fontFamily: 'Inter, "Noto Sans SC", ui-sans-serif, system-ui, sans-serif',
      justifyContent: "center",
      padding: portrait ? 120 : 140,
    }}
  >
    <div
      style={{
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        gap: portrait ? 52 : 38,
        maxWidth: portrait ? 840 : 1480,
        textAlign: "center",
      }}
    >
      <div style={{ color: "#67e8f9", fontSize: portrait ? 42 : 38, fontWeight: 700 }}>
        CODE-DRIVEN EXPLAINER
      </div>
      <h1
        style={{
          fontSize: portrait ? 132 : 118,
          letterSpacing: -4,
          lineHeight: 0.98,
          margin: 0,
        }}
      >
        Replace with the real topic promise
      </h1>
      <p
        style={{
          color: "#cbd5e1",
          fontSize: portrait ? 48 : 42,
          lineHeight: 1.25,
          margin: 0,
          maxWidth: portrait ? 780 : 1180,
        }}
      >
        One supporting line, one clear focal point, and only manifest-backed existing assets.
      </p>
    </div>
  </AbsoluteFill>
);

export const SampleNameCover16x9 = () => <SampleNameCover portrait={false} />;
export const SampleNameCover9x16 = () => <SampleNameCover portrait />;
