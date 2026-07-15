export const SCRIPTED_TEMPLATE_ID = "scripted" as const;
export const SPOTLIGHT_TEMPLATE_ID = "spotlight" as const;
export const STATS_DASHBOARD_TEMPLATE_ID = "stats-dashboard" as const;
export const TECHNICAL_EXPLAINER_TEMPLATE_ID = "technical-explainer" as const;

export const registeredTemplateIds = [
  SCRIPTED_TEMPLATE_ID,
  SPOTLIGHT_TEMPLATE_ID,
  STATS_DASHBOARD_TEMPLATE_ID,
  TECHNICAL_EXPLAINER_TEMPLATE_ID,
] as const;

export type TemplateId = (typeof registeredTemplateIds)[number];
