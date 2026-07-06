import type { CSSProperties, ReactNode } from "react";

export type ScreenshotFocus<TAssetId extends string = string> = {
  readonly assetId: TAssetId;
  readonly endScale: number;
  readonly endX: number;
  readonly endY: number;
  readonly objectPosition: string;
  readonly overlayAlign: "left" | "right";
  readonly overlayMode?: "compact" | "default";
  readonly overlayVertical?: "center" | "flex-end" | "flex-start";
  readonly overlayMaxWidth?: number;
  readonly startScale: number;
  readonly startX: number;
  readonly startY: number;
  readonly targetDescription: string;
  readonly zoomHoldFrame: number;
  readonly zoomInFrame: number;
  readonly zoomOutFrame: number;
};

export type EvidenceLensAsset<TAssetId extends string = string> = {
  readonly id: TAssetId;
  readonly src: string;
};

export type EvidenceScreenshotBackdropProps<TAssetId extends string = string> = {
  readonly asset?: EvidenceLensAsset<TAssetId>;
  readonly backgroundColor?: string;
  readonly durationInFrames: number;
  readonly fallback?: ReactNode;
  readonly focus: ScreenshotFocus<TAssetId>;
};

export type EvidenceOverlayPanelProps = {
  readonly children: ReactNode;
  readonly compact?: boolean;
  readonly style?: CSSProperties;
};
