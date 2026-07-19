import type { FC } from "react";
import { AbsoluteFill } from "remotion";

const TITLE = "当智能走出\n人类认知之外";
const HOOK = "人类还拥有决定未来的权力吗？";

const KnowledgeSpheres: FC<{ readonly portrait: boolean }> = ({ portrait }) => (
  <div
    style={{
      bottom: portrait ? 430 : 80,
      height: portrait ? 760 : 920,
      position: "absolute",
      right: portrait ? -190 : -20,
      width: portrait ? 1080 : 980,
    }}
  >
    {[0, 1, 2, 3, 4].map((ring) => (
      <div
        key={ring}
        style={{
          border: `2px solid rgba(107,231,255,${0.34 - ring * 0.045})`,
          borderRadius: "50%",
          boxShadow: "0 0 60px rgba(107,231,255,0.08)",
          height: 320 + ring * 170,
          left: 360 - ring * 85,
          position: "absolute",
          top: 250 - ring * 85,
          width: 320 + ring * 170,
        }}
      />
    ))}
    <div
      style={{
        background:
          "radial-gradient(circle at 35% 30%, #ffffff, #6be7ff 18%, rgba(107,231,255,0.18) 52%, transparent 70%)",
        borderRadius: "50%",
        boxShadow: "0 0 90px rgba(107,231,255,0.6)",
        height: 260,
        left: 390,
        position: "absolute",
        top: 280,
        width: 260,
      }}
    />
    <div
      style={{
        background:
          "radial-gradient(circle at 35% 30%, #fff9ee, #ffad5b 22%, rgba(255,173,91,0.1) 62%, transparent 70%)",
        borderRadius: "50%",
        bottom: portrait ? 20 : 70,
        boxShadow: "0 0 50px rgba(255,173,91,0.72)",
        height: portrait ? 88 : 112,
        left: portrait ? 130 : 80,
        position: "absolute",
        width: portrait ? 88 : 112,
      }}
    />
  </div>
);

export const SuperintelligenceBeyondHumanCognitionCover: FC<{ readonly portrait: boolean }> = ({
  portrait,
}) => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(circle at 72% 42%, rgba(107,231,255,0.17), transparent 34%), radial-gradient(circle at 17% 82%, rgba(255,173,91,0.14), transparent 25%), #030712",
      color: "#f8f4ea",
      fontFamily: '"Noto Sans CJK SC", "Noto Sans SC", "Microsoft YaHei", sans-serif',
      overflow: "hidden",
    }}
  >
    <AbsoluteFill
      style={{
        backgroundImage:
          "linear-gradient(rgba(107,231,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(107,231,255,0.035) 1px, transparent 1px)",
        backgroundSize: portrait ? "54px 54px" : "62px 62px",
        maskImage: "linear-gradient(to bottom, transparent, black 20%, black 84%, transparent)",
      }}
    />
    <KnowledgeSpheres portrait={portrait} />
    <div
      style={{
        left: portrait ? 76 : 118,
        maxWidth: portrait ? 900 : 930,
        position: "absolute",
        top: portrait ? 180 : 170,
      }}
    >
      <div style={{ color: "#ffad5b", fontSize: portrait ? 32 : 30, fontWeight: 800, letterSpacing: 6 }}>
        COGNITION / AGENCY / FUTURE
      </div>
      <div
        style={{
          fontSize: portrait ? 118 : 116,
          fontWeight: 900,
          letterSpacing: -6,
          lineHeight: 1.02,
          marginTop: 34,
          textShadow: "0 24px 74px rgba(0,0,0,0.72)",
          whiteSpace: "pre-line",
        }}
      >
        {TITLE}
      </div>
      <div
        style={{
          background: "linear-gradient(90deg, #ffad5b, #6be7ff)",
          height: 5,
          marginTop: 42,
          width: portrait ? 180 : 230,
        }}
      />
    </div>
    <div
      style={{
        background: "rgba(3,7,18,0.9)",
        border: "1px solid rgba(107,231,255,0.3)",
        borderRadius: 18,
        bottom: portrait ? 118 : 96,
        color: "#f8f4ea",
        fontSize: portrait ? 46 : 42,
        fontWeight: 700,
        left: portrait ? 72 : 118,
        lineHeight: 1.3,
        padding: portrait ? "24px 30px" : "20px 28px",
        position: "absolute",
        right: portrait ? 72 : 650,
      }}
    >
      {HOOK}
    </div>
  </AbsoluteFill>
);

export const SuperintelligenceBeyondHumanCognitionCover16x9 = () => (
  <SuperintelligenceBeyondHumanCognitionCover portrait={false} />
);

export const SuperintelligenceBeyondHumanCognitionCover9x16 = () => (
  <SuperintelligenceBeyondHumanCognitionCover portrait />
);
