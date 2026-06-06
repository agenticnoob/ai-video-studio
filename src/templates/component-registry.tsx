import type React from "react";

import type { VideoSegment } from "../lib/project-schema";
import { SCRIPTED_TEMPLATE_ID, SPOTLIGHT_TEMPLATE_ID, type TemplateId } from "./ids";
import { scriptedTemplateBundle } from "./scripted";
import { spotlightTemplateBundle } from "./spotlight";

export const templateComponentDefinitions = {
  [SCRIPTED_TEMPLATE_ID]: scriptedTemplateBundle.runtime,
  [SPOTLIGHT_TEMPLATE_ID]: spotlightTemplateBundle.runtime,
} as const;

export const renderTemplateSegment = (segment: VideoSegment): React.ReactNode => {
  return templateComponentDefinitions[segment.templateId].renderSegment(segment);
};

export const getTemplateEditor = (templateId: TemplateId) => {
  return templateComponentDefinitions[templateId].Editor;
};
