import { SCENE_GRAPH_TEMPLATE_ID } from "../templates/ids";
import { sceneGraphSpecSchema, type SceneGraphSpec } from "../templates/scene-graph/schema";
import type { VideoSegment } from "./project-schema";
import type { VisualReviewStillAnalysis } from "./visual-review-schema";

type VisualRepairStatus = VisualReviewStillAnalysis["status"];

type DeterministicVisualRepairType =
  | "boost_contrast"
  | "apply_safe_layout"
  | "remove_empty_border"
  | "reduce_detail_density"
  | "add_primary_visual";

type DeterministicVisualRepairPlan = {
  description: string;
  repairType: DeterministicVisualRepairType;
  status: VisualRepairStatus;
};

type AppliedDeterministicVisualRepair = {
  description: string;
  type: DeterministicVisualRepairType;
};

type SceneGraphBackgroundLayer = Extract<SceneGraphSpec["layers"][number], { type: "background" }>;
type SceneGraphNodeLayer = Extract<SceneGraphSpec["layers"][number], { type: "node-graph" }>;

export type DeterministicVisualRepairResult =
  | {
      appliedRepairs: AppliedDeterministicVisualRepair[];
      segment: VideoSegment;
      status: "repaired";
    }
  | {
      reason: string;
      status: "unsupported";
    };

const repairPlans: Partial<Record<VisualRepairStatus, DeterministicVisualRepairPlan>> = {
  fine_detail_frame: {
    description: "Reduce visible node and code density.",
    repairType: "reduce_detail_density",
    status: "fine_detail_frame",
  },
  letterbox_frame: {
    description: "Switch to a full-bleed hero layout to remove empty borders.",
    repairType: "remove_empty_border",
    status: "letterbox_frame",
  },
  low_contrast_frame: {
    description: "Apply a high-contrast technical-video color system.",
    repairType: "boost_contrast",
    status: "low_contrast_frame",
  },
  near_blank_frame: {
    description: "Add a primary title and visual anchor layer.",
    repairType: "add_primary_visual",
    status: "near_blank_frame",
  },
  unsafe_margin_frame: {
    description: "Move the scene into a caption-safe layout.",
    repairType: "apply_safe_layout",
    status: "unsafe_margin_frame",
  },
};

export const getDeterministicVisualRepairPlan = (
  status: VisualRepairStatus,
): DeterministicVisualRepairPlan | undefined => repairPlans[status];

const ensureBackgroundLayer = (spec: SceneGraphSpec): SceneGraphBackgroundLayer => {
  return (
    spec.layers.find((layer) => layer.type === "background") ?? {
      id: "repair-background",
      startFrame: 0,
      treatment: "depth-gradient",
      type: "background",
    }
  );
};

const boostContrast = (spec: SceneGraphSpec): SceneGraphSpec => ({
  ...spec,
  theme: {
    background: "#06111f",
    muted: "#cbd5e1",
    panel: "rgba(15,23,42,0.82)",
    primary: "#38bdf8",
    secondary: "#f59e0b",
    text: "#f8fafc",
  },
});

const applySafeLayout = (spec: SceneGraphSpec): SceneGraphSpec => ({
  ...spec,
  camera: {
    ...spec.camera,
    intensity: "subtle",
  },
  captionSafeZone: true,
  layout: "safe-lockup",
});

const removeEmptyBorder = (spec: SceneGraphSpec): SceneGraphSpec => ({
  ...spec,
  camera: {
    ...spec.camera,
    movement: spec.camera.movement === "static" ? "push-in" : spec.camera.movement,
  },
  composition: "hero",
  layout: "full-bleed",
  layers: [
    {
      ...ensureBackgroundLayer(spec),
      treatment: "depth-gradient" as const,
    },
    ...spec.layers.filter((layer) => layer.type !== "background"),
  ],
});

const reduceNodeGraphDensity = (layer: SceneGraphNodeLayer): SceneGraphNodeLayer => {
  const nodes = layer.nodes.slice(0, 3);
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = layer.edges.filter((edge) => nodeIds.has(edge.from) && nodeIds.has(edge.to));
  const fallbackEdge =
    nodes.length >= 2
      ? [
          {
            from: nodes[0]?.id ?? "",
            status: "active" as const,
            to: nodes[1]?.id ?? "",
          },
        ]
      : [];

  return {
    ...layer,
    edges: edges.length ? edges : fallbackEdge,
    layout: "pipeline",
    nodes,
  };
};

const reduceDetailDensity = (spec: SceneGraphSpec): SceneGraphSpec => ({
  ...spec,
  layers: spec.layers.map((layer) => {
    if (layer.type === "node-graph") {
      return reduceNodeGraphDensity(layer);
    }

    if (layer.type === "code-panel") {
      return {
        ...layer,
        lines: layer.lines.slice(0, 3),
        layout: "wide" as const,
      };
    }

    if (layer.type === "terminal-panel") {
      return {
        ...layer,
        lines: layer.lines.slice(0, 3),
        layout: "bottom" as const,
      };
    }

    return layer;
  }),
});

const addPrimaryVisual = (spec: SceneGraphSpec, segment: VideoSegment): SceneGraphSpec => {
  const hasPrimaryTitle = spec.layers.some((layer) => layer.type === "kinetic-title");
  const hasPrimaryShape = spec.layers.some((layer) => layer.type === "shape");
  const primaryLayers: SceneGraphSpec["layers"] = [];

  if (!hasPrimaryTitle) {
    primaryLayers.push({
      id: "repair-primary-title",
      layout: "center",
      motionPreset: "pop",
      startFrame: 0,
      text: segment.title || spec.meta.title,
      type: "kinetic-title",
    });
  }

  if (!hasPrimaryShape) {
    primaryLayers.push({
      id: "repair-primary-frame",
      layout: "center-mark",
      shape: "frame",
      startFrame: 0,
      tone: "primary",
      type: "shape",
    });
  }

  return {
    ...spec,
    composition: spec.composition === "lockup" ? "hero" : spec.composition,
    layers: [
      {
        ...ensureBackgroundLayer(spec),
        treatment: "depth-gradient" as const,
      },
      ...primaryLayers,
      ...spec.layers.filter((layer) => layer.type !== "background"),
    ].slice(0, 12),
  };
};

const applyRepairPlan = (
  spec: SceneGraphSpec,
  segment: VideoSegment,
  plan: DeterministicVisualRepairPlan,
): SceneGraphSpec => {
  switch (plan.repairType) {
    case "boost_contrast":
      return boostContrast(spec);
    case "apply_safe_layout":
      return applySafeLayout(spec);
    case "remove_empty_border":
      return removeEmptyBorder(spec);
    case "reduce_detail_density":
      return reduceDetailDensity(spec);
    case "add_primary_visual":
      return addPrimaryVisual(spec, segment);
  }
};

export const applyDeterministicVisualRepair = (
  segment: VideoSegment,
  _finding: unknown,
  status: VisualRepairStatus,
): DeterministicVisualRepairResult => {
  const plan = getDeterministicVisualRepairPlan(status);

  if (!plan) {
    return {
      reason: `No deterministic repair is available for visual-review status "${status}".`,
      status: "unsupported",
    };
  }

  if (segment.templateId !== SCENE_GRAPH_TEMPLATE_ID) {
    return {
      reason: "Deterministic visual repair v1 only supports scene-graph segments.",
      status: "unsupported",
    };
  }

  const repairedSpec = applyRepairPlan(segment.implementation as SceneGraphSpec, segment, plan);
  const parsedSpec = sceneGraphSpecSchema.safeParse(repairedSpec);

  if (!parsedSpec.success) {
    return {
      reason: "Deterministic visual repair produced an invalid SceneGraph.",
      status: "unsupported",
    };
  }

  return {
    appliedRepairs: [
      {
        description: plan.description,
        type: plan.repairType,
      },
    ],
    segment: {
      ...segment,
      implementation: parsedSpec.data,
    } as VideoSegment,
    status: "repaired",
  };
};
