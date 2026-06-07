export type PrimitiveCatalogCategory =
  | "background"
  | "chart"
  | "logo"
  | "media"
  | "text"
  | "transition";

export type PrimitiveCatalogStatus = "candidate" | "ported" | "adopted" | "deprecated";

export type PrimitiveCatalogEntry = {
  category: PrimitiveCatalogCategory;
  description: string;
  durationInFrames: number;
  id: string;
  label: string;
  source: {
    commit: string;
    file: string;
    license: "MIT";
    repository: string;
  };
  status: PrimitiveCatalogStatus;
};

const rveSource = {
  commit: "6209b724798e48ff395f8df1a6fa2d26082372b5",
  license: "MIT" as const,
  repository: "https://github.com/reactvideoeditor/remotion-templates",
};

export const primitiveCatalog = [
  {
    id: "rve-popping-text",
    label: "Popping Text",
    category: "text",
    description: "Spring-based character pop entrance for short emphatic text.",
    durationInFrames: 120,
    source: { ...rveSource, file: "templates/popping-text.tsx" },
    status: "ported",
  },
  {
    id: "rve-bar-chart",
    label: "Bar Chart",
    category: "chart",
    description: "Animated SVG bar chart with staggered bar growth.",
    durationInFrames: 120,
    source: { ...rveSource, file: "templates/chart-animation.tsx" },
    status: "ported",
  },
  {
    id: "rve-gradient-shift-background",
    label: "Gradient Shift Background",
    category: "background",
    description: "Frame-driven ambient gradient with slowly shifting color phases.",
    durationInFrames: 180,
    source: { ...rveSource, file: "templates/gradient-shift.tsx" },
    status: "ported",
  },
  {
    id: "rve-logo-fade-reveal",
    label: "Logo Fade Reveal",
    category: "logo",
    description: "Logo block and brand copy reveal with subtle spring motion.",
    durationInFrames: 120,
    source: { ...rveSource, file: "templates/logo-fade-reveal.tsx" },
    status: "ported",
  },
  {
    id: "rve-gallery-grid",
    label: "Gallery Grid",
    category: "media",
    description: "Staggered six-cell gallery reveal for image or color-card layouts.",
    durationInFrames: 120,
    source: { ...rveSource, file: "templates/gallery-grid.tsx" },
    status: "ported",
  },
  {
    id: "rve-cross-dissolve",
    label: "Cross Dissolve",
    category: "transition",
    description: "Classic opacity dissolve between two full-frame scene nodes.",
    durationInFrames: 90,
    source: { ...rveSource, file: "templates/cross-dissolve.tsx" },
    status: "ported",
  },
] as const satisfies readonly PrimitiveCatalogEntry[];

export type PrimitiveCatalogId = (typeof primitiveCatalog)[number]["id"];

export const defaultPrimitiveCatalogId: PrimitiveCatalogId = "rve-popping-text";
