import { z } from "zod";

import {
  getPlannerRecipeIdsForTemplate,
  registeredTemplateIds,
  type TemplateId,
} from "./template-registry";

export const MAX_STORYBOARD_SEGMENTS = 6;

export const templateIdSchema = z.enum(registeredTemplateIds as [TemplateId, ...TemplateId[]]);

export const storyboardNarrationPlanSchema = z
  .object({
    text: z.string().trim().min(1).max(2000),
    tone: z.string().trim().min(1).max(160).optional(),
  })
  .strict();

export const storyboardRecipeHintSchema = z
  .object({
    recipeId: z.string().trim().min(1).max(80),
    reason: z.string().trim().min(1).max(400),
  })
  .strict();

export const storyboardSegmentPlanSchema = z
  .object({
    id: z.string().trim().min(1).max(80),
    order: z.number().int().min(1),
    title: z.string().trim().min(1).max(160).optional(),
    purpose: z.string().trim().min(1).max(1000),
    templateId: templateIdSchema,
    templateReason: z.string().trim().min(1).max(1000),
    narration: storyboardNarrationPlanSchema,
    visualBrief: z.string().trim().min(1).max(1200),
    recipeHints: z.array(storyboardRecipeHintSchema).min(1).max(5).optional(),
    pacingHint: z.string().trim().min(1).max(300).optional(),
    expectedDurationSeconds: z.number().positive().max(120).optional(),
  })
  .strict();

export const storyboardPlanSchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    brief: z.string().trim().min(1).max(4000),
    language: z.string().trim().min(1).max(80).optional(),
    globalStyle: z.string().trim().min(1).max(1000).optional(),
    segments: z.array(storyboardSegmentPlanSchema).min(1).max(MAX_STORYBOARD_SEGMENTS),
  })
  .strict()
  .superRefine((plan, ctx) => {
    const ids = new Set<string>();
    const orders = new Set<number>();

    for (let index = 0; index < plan.segments.length; index++) {
      const segment = plan.segments[index];

      if (ids.has(segment.id)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate segment id "${segment.id}".`,
          path: ["segments", index, "id"],
        });
      }
      ids.add(segment.id);

      if (orders.has(segment.order)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate segment order ${segment.order}.`,
          path: ["segments", index, "order"],
        });
      }
      orders.add(segment.order);

      const recipeHints = segment.recipeHints ?? [];
      if (recipeHints.length > 0) {
        const allowedRecipeIds = getPlannerRecipeIdsForTemplate(segment.templateId);
        if (allowedRecipeIds.length === 0) {
          ctx.addIssue({
            code: "custom",
            message: `Template "${segment.templateId}" does not support planner recipe hints.`,
            path: ["segments", index, "recipeHints"],
          });
        }

        for (let hintIndex = 0; hintIndex < recipeHints.length; hintIndex++) {
          const hint = recipeHints[hintIndex];
          if (!allowedRecipeIds.includes(hint.recipeId)) {
            ctx.addIssue({
              code: "custom",
              message: `Recipe "${hint.recipeId}" is not registered for template "${segment.templateId}".`,
              path: ["segments", index, "recipeHints", hintIndex, "recipeId"],
            });
          }
        }
      }
    }

    for (let expectedOrder = 1; expectedOrder <= plan.segments.length; expectedOrder++) {
      if (!orders.has(expectedOrder)) {
        ctx.addIssue({
          code: "custom",
          message: `Segment order must be contiguous from 1 to ${plan.segments.length}.`,
          path: ["segments"],
        });
        break;
      }
    }
  });

export type StoryboardNarrationPlan = z.infer<typeof storyboardNarrationPlanSchema>;
export type StoryboardRecipeHint = z.infer<typeof storyboardRecipeHintSchema>;
export type StoryboardSegmentPlan = z.infer<typeof storyboardSegmentPlanSchema>;
export type StoryboardPlan = z.infer<typeof storyboardPlanSchema>;
