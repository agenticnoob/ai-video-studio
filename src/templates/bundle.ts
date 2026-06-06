import type { RuntimeTemplateDefinition } from "./runtime-definition";

export type TemplateBundle<TDefinition extends { id: string }> = {
  definition: TDefinition;
  runtime: RuntimeTemplateDefinition;
};

export const defineTemplateBundle = <TDefinition extends { id: string }>(
  bundle: TemplateBundle<TDefinition>,
) => bundle;
