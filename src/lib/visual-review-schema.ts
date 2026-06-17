import { z } from "zod";

export const visualReviewFindingSchema = z
  .object({
    severity: z.enum(["info", "warning", "error"]),
    frame: z.number().int().min(0).optional(),
    targetId: z.string().trim().min(1).max(160).optional(),
    message: z.string().trim().min(1).max(500),
    suggestedRepair: z.string().trim().min(1).max(500).optional(),
  })
  .strict();

export const visualReviewFrameSchema = z
  .object({
    frame: z.number().int().min(0),
    reason: z.enum(["segment_start", "segment_midpoint", "segment_end"]),
    segmentId: z.string().trim().min(1).max(160),
  })
  .strict();

export const visualReviewDiagnosticsSchema = z
  .object({
    status: z.literal("static_preflight"),
    errorCount: z.number().int().min(0),
    findingCount: z.number().int().min(0),
    findings: z.array(visualReviewFindingSchema),
    reviewFrameCount: z.number().int().min(0),
    reviewFrames: z.array(visualReviewFrameSchema),
    warningCount: z.number().int().min(0),
  })
  .strict();

export type VisualReviewFinding = z.infer<typeof visualReviewFindingSchema>;
export type VisualReviewFrame = z.infer<typeof visualReviewFrameSchema>;
export type VisualReviewDiagnostics = z.infer<typeof visualReviewDiagnosticsSchema>;
