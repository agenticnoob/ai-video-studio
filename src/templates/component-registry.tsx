import type React from "react";

import type { VideoSegment } from "../lib/project-schema";
import type { TemplateId } from "./registry";
import type { RuntimeTemplateDefinition } from "./runtime-definition";
import { registeredTemplateBundles } from "./registered-bundles";

type RuntimeTemplateId = (typeof registeredTemplateBundles)[number]["definition"]["id"];
type MissingRuntimeTemplateIds = Exclude<TemplateId, RuntimeTemplateId>;
type ExtraRuntimeTemplateIds = Exclude<RuntimeTemplateId, TemplateId>;
type RuntimeCoverageCheck = [MissingRuntimeTemplateIds] extends [never]
  ? [ExtraRuntimeTemplateIds] extends [never]
    ? true
    : `Unexpected runtime template id: ${ExtraRuntimeTemplateIds}`
  : `Missing runtime template id: ${MissingRuntimeTemplateIds}`;

const runtimeCoverageCheck: RuntimeCoverageCheck = true;
void runtimeCoverageCheck;

type RuntimeTemplateDefinitionsById = {
  [TId in TemplateId]: RuntimeTemplateDefinition;
};

export const templateComponentDefinitions = Object.fromEntries(
  registeredTemplateBundles.map((bundle) => [bundle.definition.id, bundle.runtime]),
) as RuntimeTemplateDefinitionsById;

export const renderTemplateSegment = (segment: VideoSegment): React.ReactNode => {
  return templateComponentDefinitions[segment.templateId].renderSegment(segment);
};

export const getTemplateEditor = (templateId: TemplateId) => {
  return templateComponentDefinitions[templateId].Editor;
};
