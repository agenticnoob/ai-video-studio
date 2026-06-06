import type { z } from "zod";

import { spotlightSpecSchema } from "../../lib/spotlight-schema";
import { SPOTLIGHT_TEMPLATE_ID } from "../ids";
import { createTemplateSegmentSchema } from "../segment-schema";

export const spotlightSegmentSchema = createTemplateSegmentSchema(
  SPOTLIGHT_TEMPLATE_ID,
  spotlightSpecSchema,
);

export type SpotlightSegment = z.infer<typeof spotlightSegmentSchema>;
