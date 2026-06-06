import type { z } from "zod";

import { videoSpecSchema } from "../../lib/video-schema";
import { SCRIPTED_TEMPLATE_ID } from "../ids";
import { createTemplateSegmentSchema } from "../segment-schema";

export const scriptedSegmentSchema = createTemplateSegmentSchema(
  SCRIPTED_TEMPLATE_ID,
  videoSpecSchema,
);

export type ScriptedSegment = z.infer<typeof scriptedSegmentSchema>;
