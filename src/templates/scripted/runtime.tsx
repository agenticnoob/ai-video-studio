import type React from "react";

import type { VideoSpec } from "../../lib/video-schema";
import { ScriptedVideo } from "../../remotion/ScriptedVideo/ScriptedVideo";
import type { RuntimeTemplateEditorProps } from "../editor-types";
import { defineRuntimeTemplate } from "../runtime-definition";
import { ScriptedEditor } from "./editor";
import type { ScriptedSegment } from "./schema";

const ScriptedRuntimeEditor: React.FC<RuntimeTemplateEditorProps> = (props) => (
  <ScriptedEditor
    inputClassName={props.inputClassName}
    parsePositiveInteger={props.parsePositiveInteger}
    segment={props.segment as ScriptedSegment}
    onSegmentChange={props.onSegmentChange as (segment: ScriptedSegment) => void}
  />
);

export const scriptedRuntimeTemplate = defineRuntimeTemplate({
  renderSegment: (segment) => <ScriptedVideo {...(segment.implementation as VideoSpec)} />,
  Editor: ScriptedRuntimeEditor,
});
