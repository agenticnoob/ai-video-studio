import type { MinimaxTool } from "./provider";

/**
 * Single `emit_result` tool — the v2 deep-recursive shape validated against
 * the live MiniMax `MiniMax-M2.7` endpoint in the T1 research probe.
 *
 * Rationale (see docs/providers/minimax-tool-calling.md §5.1):
 *  - **Single tool** beats dual-tool routing (model always picks the broader
 *    `emit_result`; `emit_segment_update` was never selected under
 *    `tool_choice:auto` and degraded M2.7 full-field coverage to 2/3).
 *  - **Deep recursion** beats top-level-only (M2.7 0/5 full-field coverage
 *    under top-level only — it skipped the scene `type` discriminator; deep
 *    recursion pulled coverage to 5/5).
 *  - All nested objects use `additionalProperties: false` so a stray field
 *    from the LLM trips validation downstream (the JSON Schema guard above
 *    is for the wire contract; Zod is still the source of truth).
 */
export const EMIT_RESULT_TOOL: MinimaxTool = {
  type: "function",
  function: {
    name: "emit_result",
    description:
      "Emit a complete VideoProject. The full discriminated-union schema is inlined; populate every required field literally. Return the full project (for segment mode, return the full project with non-target segments byte-identical to the input).",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        meta: {
          type: "object",
          additionalProperties: false,
          properties: {
            title: { type: "string" },
            fps: { type: "integer", const: 30 },
            width: { type: "integer", const: 1280 },
            height: { type: "integer", const: 720 },
          },
          required: ["title", "fps", "width", "height"],
        },
        brief: { type: "string" },
        segments: {
          type: "array",
          minItems: 1,
          maxItems: 3,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              id: { type: "string", pattern: "^segment-[0-9]+$" },
              title: { type: "string", maxLength: 64 },
              intent: { type: "string" },
              templateId: { type: "string", const: "scripted" },
              implementation: {
                type: "object",
                additionalProperties: false,
                properties: {
                  meta: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      title: { type: "string" },
                      fps: { type: "integer", const: 30 },
                      width: { type: "integer", const: 1280 },
                      height: { type: "integer", const: 720 },
                    },
                    required: ["title", "fps", "width", "height"],
                  },
                  theme: {
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
                  },
                  scenes: {
                    type: "array",
                    minItems: 1,
                    items: {
                      oneOf: [
                        {
                          type: "object",
                          additionalProperties: false,
                          properties: {
                            id: { type: "string" },
                            type: { type: "string", const: "title" },
                            duration: { type: "integer", minimum: 1 },
                            kicker: { type: "string" },
                            title: { type: "string" },
                            subtitle: { type: "string" },
                            voiceover: { type: "string" },
                          },
                          required: ["id", "type", "duration", "title"],
                        },
                        {
                          type: "object",
                          additionalProperties: false,
                          properties: {
                            id: { type: "string" },
                            type: { type: "string", const: "bullets" },
                            duration: { type: "integer", minimum: 1 },
                            kicker: { type: "string" },
                            title: { type: "string" },
                            bullets: { type: "array", minItems: 1, items: { type: "string" } },
                            voiceover: { type: "string" },
                          },
                          required: ["id", "type", "duration", "title", "bullets"],
                        },
                        {
                          type: "object",
                          additionalProperties: false,
                          properties: {
                            id: { type: "string" },
                            type: { type: "string", const: "quote" },
                            duration: { type: "integer", minimum: 1 },
                            kicker: { type: "string" },
                            quote: { type: "string" },
                            author: { type: "string" },
                            voiceover: { type: "string" },
                          },
                          required: ["id", "type", "duration", "quote"],
                        },
                      ],
                    },
                  },
                },
                required: ["meta", "theme", "scenes"],
              },
            },
            required: ["id", "title", "intent", "templateId", "implementation"],
          },
        },
      },
      required: ["meta", "brief", "segments"],
    },
  },
};

/** Forced selection — model must call `emit_result`, no auto-routing. */
export const EMIT_RESULT_TOOL_CHOICE = {
  type: "function" as const,
  function: { name: "emit_result" },
};
