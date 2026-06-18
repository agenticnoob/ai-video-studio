/* global console */

import assert from "node:assert/strict";

import {
  applyDeterministicVisualRepair,
  getDeterministicVisualRepairPlan,
} from "../src/lib/deterministic-visual-repair.js";

const baseSceneGraphSegment = {
  id: "seg-scene",
  implementation: {
    beats: [],
    camera: {
      intensity: "medium",
      movement: "push-in",
    },
    captionSafeZone: false,
    composition: "node-graph",
    durationInFrames: 180,
    layers: [
      {
        id: "bg",
        startFrame: 0,
        treatment: "solid",
        type: "background",
      },
      {
        edges: [
          { from: "n1", status: "active", to: "n2" },
          { from: "n2", status: "active", to: "n3" },
          { from: "n3", status: "active", to: "n4" },
        ],
        id: "graph",
        layout: "radial",
        nodes: [
          { id: "n1", label: "Collect brief", status: "active" },
          { id: "n2", label: "Plan shots", status: "active" },
          { id: "n3", label: "Render frames", status: "active" },
          { id: "n4", label: "Review output", status: "active" },
        ],
        startFrame: 0,
        title: "Workflow",
        type: "node-graph",
      },
      {
        id: "code",
        language: "ts",
        layout: "wide",
        lines: ["const a = 1", "const b = 2", "const c = 3", "const d = 4"],
        startFrame: 24,
        title: "Detail",
        type: "code-panel",
      },
    ],
    layout: "node-graph",
    meta: {
      fps: 30,
      height: 720,
      title: "Scene repair fixture",
      width: 1280,
    },
    renderStrategy: "primitive_scene_graph",
    sceneType: "process",
    theme: {
      background: "#777777",
      muted: "#777777",
      panel: "rgba(119,119,119,0.16)",
      primary: "#777777",
      secondary: "#777777",
      text: "#777777",
    },
  },
  intent: "Show an AI video workflow.",
  templateId: "scene-graph",
  title: "Scene repair fixture",
};

const assertRepair = (status, expectedRepairType) => {
  const finding = {
    message: `Representative still has ${status}`,
    severity: "warning",
    stillId: "still-1",
    suggestedRepair: "Apply deterministic visual repair.",
    targetId: "seg-scene",
  };
  const result = applyDeterministicVisualRepair(baseSceneGraphSegment, finding, status);

  assert.equal(result.status, "repaired");
  assert.equal(result.segment.templateId, "scene-graph");
  assert.ok(
    result.appliedRepairs.some((repair) => repair.type === expectedRepairType),
    `expected repair ${expectedRepairType}`,
  );

  return result.segment.implementation;
};

const lowContrastSpec = assertRepair("low_contrast_frame", "boost_contrast");
assert.equal(lowContrastSpec.theme.background, "#06111f");
assert.equal(lowContrastSpec.theme.text, "#f8fafc");
assert.equal(lowContrastSpec.theme.primary, "#38bdf8");

const unsafeMarginSpec = assertRepair("unsafe_margin_frame", "apply_safe_layout");
assert.equal(unsafeMarginSpec.captionSafeZone, true);
assert.equal(unsafeMarginSpec.layout, "safe-lockup");
assert.equal(unsafeMarginSpec.camera.intensity, "subtle");

const letterboxSpec = assertRepair("letterbox_frame", "remove_empty_border");
assert.equal(letterboxSpec.layout, "full-bleed");
assert.equal(letterboxSpec.composition, "hero");

const fineDetailSpec = assertRepair("fine_detail_frame", "reduce_detail_density");
const fineDetailNodeLayer = fineDetailSpec.layers.find((layer) => layer.type === "node-graph");
const fineDetailCodeLayer = fineDetailSpec.layers.find((layer) => layer.type === "code-panel");
assert.ok(fineDetailNodeLayer);
assert.ok(fineDetailCodeLayer);
assert.equal(fineDetailNodeLayer.nodes.length, 3);
assert.equal(fineDetailCodeLayer.lines.length, 3);
assert.deepEqual(
  new Set(fineDetailNodeLayer.edges.flatMap((edge) => [edge.from, edge.to])),
  new Set(["n1", "n2", "n3"]),
);

const fallbackEdgeResult = applyDeterministicVisualRepair(
  {
    ...baseSceneGraphSegment,
    implementation: {
      ...baseSceneGraphSegment.implementation,
      layers: baseSceneGraphSegment.implementation.layers.map((layer) =>
        layer.type === "node-graph"
          ? {
              ...layer,
              edges: [{ from: "n3", status: "active", to: "n4" }],
            }
          : layer,
      ),
    },
  },
  {
    message: "Dense graph",
    severity: "warning",
    stillId: "still-1",
    targetId: "seg-scene",
  },
  "fine_detail_frame",
);
assert.equal(fallbackEdgeResult.status, "repaired");
const fallbackNodeLayer = fallbackEdgeResult.segment.implementation.layers.find(
  (layer) => layer.type === "node-graph",
);
assert.ok(fallbackNodeLayer);
assert.deepEqual(fallbackNodeLayer.edges, [{ from: "n1", status: "active", to: "n2" }]);

const nearBlankSpec = assertRepair("near_blank_frame", "add_primary_visual");
assert.ok(nearBlankSpec.layers.some((layer) => layer.type === "kinetic-title"));
assert.ok(nearBlankSpec.layers.some((layer) => layer.type === "shape"));

const unsupportedResult = applyDeterministicVisualRepair(
  { ...baseSceneGraphSegment, templateId: "spotlight" },
  {
    message: "Low contrast",
    severity: "warning",
    targetId: "spotlight-seg",
  },
  "low_contrast_frame",
);
assert.equal(unsupportedResult.status, "unsupported");

const plan = getDeterministicVisualRepairPlan("low_contrast_frame");
assert.equal(plan?.repairType, "boost_contrast");

console.log("Visual repair smoke passed.");
