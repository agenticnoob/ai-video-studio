export const SCRIPTED_TEMPLATE_ID = "scripted" as const;
export const SPOTLIGHT_TEMPLATE_ID = "spotlight" as const;

export const registeredTemplateIds = [SCRIPTED_TEMPLATE_ID, SPOTLIGHT_TEMPLATE_ID] as const;

export type TemplateId = (typeof registeredTemplateIds)[number];
