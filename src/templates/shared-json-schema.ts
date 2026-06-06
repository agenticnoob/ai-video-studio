export const metaJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    fps: { type: "integer", const: 30 },
    width: { type: "integer", const: 1280 },
    height: { type: "integer", const: 720 },
  },
  required: ["title", "fps", "width", "height"],
} as const;

export const themeJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    background: { type: "string" },
    panel: { type: "string" },
    primary: { type: "string" },
    secondary: { type: "string" },
    text: { type: "string" },
    muted: { type: "string" },
  },
  required: ["background", "panel", "primary", "secondary", "text", "muted"],
} as const;

export const createSegmentJsonSchema = (
  templateId: string,
  implementation: Record<string, unknown>,
) =>
  ({
    type: "object",
    additionalProperties: false,
    properties: {
      id: { type: "string", pattern: "^segment-[0-9]+$" },
      title: { type: "string", maxLength: 64 },
      intent: { type: "string" },
      templateId: { type: "string", const: templateId },
      implementation,
    },
    required: ["id", "title", "intent", "templateId", "implementation"],
  }) as const;
