import React from "react";

import {
  SCRIPTED_TEMPLATE_ID,
  SPOTLIGHT_TEMPLATE_ID,
  type VideoSegment,
} from "../lib/project-schema";
import { ScriptedVideo } from "./ScriptedVideo/ScriptedVideo";
import { SpotlightVideo } from "./SpotlightVideo/SpotlightVideo";

type SegmentRenderer = (segment: VideoSegment) => React.ReactNode;

export const templateComponentRegistry = {
  [SCRIPTED_TEMPLATE_ID]: (segment) => {
    if (segment.templateId !== SCRIPTED_TEMPLATE_ID) {
      throw new Error("Scripted renderer received a non-scripted segment.");
    }

    return <ScriptedVideo {...segment.implementation} />;
  },
  [SPOTLIGHT_TEMPLATE_ID]: (segment) => {
    if (segment.templateId !== SPOTLIGHT_TEMPLATE_ID) {
      throw new Error("Spotlight renderer received a non-spotlight segment.");
    }

    return <SpotlightVideo {...segment.implementation} />;
  },
} satisfies Record<VideoSegment["templateId"], SegmentRenderer>;

export const renderRegisteredSegment = (segment: VideoSegment): React.ReactNode => {
  return templateComponentRegistry[segment.templateId](segment);
};
