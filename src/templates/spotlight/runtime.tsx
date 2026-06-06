import type React from "react";

import type { SpotlightSpec } from "../../lib/spotlight-schema";
import { SpotlightVideo } from "../../remotion/SpotlightVideo/SpotlightVideo";
import type { RuntimeTemplateEditorProps } from "../editor-types";
import { defineRuntimeTemplate } from "../runtime-definition";
import { SpotlightEditor } from "./editor";
import type { SpotlightSegment } from "./schema";

const SpotlightRuntimeEditor: React.FC<RuntimeTemplateEditorProps> = (props) => (
  <SpotlightEditor
    inputClassName={props.inputClassName}
    parsePositiveInteger={props.parsePositiveInteger}
    segment={props.segment as SpotlightSegment}
    onSegmentChange={props.onSegmentChange as (segment: SpotlightSegment) => void}
  />
);

export const spotlightRuntimeTemplate = defineRuntimeTemplate({
  renderSegment: (segment) => <SpotlightVideo {...(segment.implementation as SpotlightSpec)} />,
  Editor: SpotlightRuntimeEditor,
});
