import type React from "react";

import type { VideoSegment } from "../lib/project-schema";
import type { RuntimeTemplateEditorProps } from "./editor-types";

export type RuntimeTemplateDefinition = {
  renderSegment: (segment: VideoSegment) => React.ReactNode;
  Editor: React.FC<RuntimeTemplateEditorProps>;
};

export const defineRuntimeTemplate = (definition: RuntimeTemplateDefinition) => definition;
