import type React from "react";

import type { VideoSegment } from "../lib/project-schema";
import { renderTemplateSegment } from "../templates/component-registry";

export const renderRegisteredSegment = (segment: VideoSegment): React.ReactNode => {
  return renderTemplateSegment(segment);
};
