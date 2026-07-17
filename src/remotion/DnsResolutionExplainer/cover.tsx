import type { FC } from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";

import { dnsResolutionExplainerAssets } from "./data";

type DnsResolutionExplainerCoverProps = { readonly portrait: boolean };

export const DnsResolutionExplainerCover: FC<DnsResolutionExplainerCoverProps> = ({ portrait }) => (
  <AbsoluteFill
    style={{
      background: "#f4ead5",
      color: "#292624",
      fontFamily: '"Noto Sans CJK SC", "Noto Sans SC", sans-serif',
      padding: portrait ? 100 : 120,
    }}
  >
    <div
      style={{
        color: "#287f8f",
        fontSize: portrait ? 38 : 34,
        fontWeight: 900,
        letterSpacing: 4,
        marginTop: portrait ? 120 : 20,
      }}
    >
      DNS · 从域名到 IP
    </div>
    <h1
      style={{
        fontSize: portrait ? 104 : 112,
        letterSpacing: portrait ? -4 : -5,
        lineHeight: 1.02,
        margin: "24px 0 28px",
        maxWidth: portrait ? 850 : 1320,
      }}
    >
      一次查询，怎样找到正确服务器？
    </h1>
    <div
      style={{
        background: "#fff8e8",
        border: "5px solid #292624",
        borderRadius: 32,
        boxShadow: "12px 14px 0 rgba(41, 38, 36, 0.16)",
        height: portrait ? 720 : 520,
        marginTop: portrait ? 70 : 26,
        overflow: "hidden",
        width: "100%",
      }}
    >
      <Img
        src={staticFile(dnsResolutionExplainerAssets.diagram)}
        style={{
          height: "100%",
          objectFit: portrait ? "contain" : "cover",
          width: "100%",
        }}
      />
    </div>
    <div
      style={{
        background: "#e7573f",
        borderRadius: 999,
        bottom: portrait ? 120 : 90,
        color: "#fff8e8",
        fontSize: portrait ? 40 : 34,
        fontWeight: 800,
        padding: "16px 30px",
        position: "absolute",
        right: portrait ? 100 : 120,
      }}
    >
      缓存 → 递归 → 权威答案
    </div>
  </AbsoluteFill>
);

export const DnsResolutionExplainerCover16x9 = () => (
  <DnsResolutionExplainerCover portrait={false} />
);
export const DnsResolutionExplainerCover9x16 = () => <DnsResolutionExplainerCover portrait />;
