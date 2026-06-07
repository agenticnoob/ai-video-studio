import type { FC } from "react";
import { AbsoluteFill } from "remotion";

import {
  BarChart,
  CrossDissolve,
  GalleryGrid,
  GradientShiftBackground,
  LogoFadeReveal,
  PoppingText,
} from "../primitives";
import {
  defaultPrimitiveCatalogId,
  primitiveCatalog,
  type PrimitiveCatalogId,
} from "./primitive-catalog";

export type PrimitiveCatalogPreviewProps = {
  selectedId?: PrimitiveCatalogId;
};

const catalogLabels = new Map(primitiveCatalog.map((entry) => [entry.id, entry.label]));

const renderPrimitive = (selectedId: PrimitiveCatalogId) => {
  if (selectedId === "rve-bar-chart") {
    return <BarChart />;
  }

  if (selectedId === "rve-gradient-shift-background") {
    return <GradientShiftBackground />;
  }

  if (selectedId === "rve-logo-fade-reveal") {
    return <LogoFadeReveal logoText="AI" name="AI Video Studio" tagline="Primitive catalog" />;
  }

  if (selectedId === "rve-gallery-grid") {
    return <GalleryGrid />;
  }

  if (selectedId === "rve-cross-dissolve") {
    return <CrossDissolve />;
  }

  return <PoppingText text="PRIMITIVES" />;
};

export const PrimitiveCatalogPreview: FC<PrimitiveCatalogPreviewProps> = ({
  selectedId = defaultPrimitiveCatalogId,
}) => {
  const label = catalogLabels.get(selectedId) ?? catalogLabels.get(defaultPrimitiveCatalogId);

  return (
    <AbsoluteFill style={{ backgroundColor: "#020617" }}>
      {renderPrimitive(selectedId)}
      <div
        style={{
          background: "rgba(2, 6, 23, 0.72)",
          border: "1px solid rgba(248, 250, 252, 0.2)",
          borderRadius: 8,
          bottom: 24,
          color: "#f8fafc",
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: 16,
          fontWeight: 700,
          left: 24,
          letterSpacing: 0,
          padding: "10px 14px",
          position: "absolute",
        }}
      >
        {label}
      </div>
    </AbsoluteFill>
  );
};
