import type { z } from "zod";

import { sceneGraphSchema } from "../../lib/scene-graph-schema";
import { SCENE_GRAPH_TEMPLATE_ID } from "../ids";
import { createTemplateSegmentSchema } from "../segment-schema";

export const sceneGraphSpecSchema = sceneGraphSchema;
export type SceneGraphSpec = z.infer<typeof sceneGraphSpecSchema>;

export const sceneGraphSegmentSchema = createTemplateSegmentSchema(
  SCENE_GRAPH_TEMPLATE_ID,
  sceneGraphSpecSchema,
);

export type SceneGraphSegment = z.infer<typeof sceneGraphSegmentSchema>;

export const getSceneGraphDuration = (spec: SceneGraphSpec): number => spec.durationInFrames;
