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

export const visualReviewStillAnalysisSchema = z
  .object({
    blankFrameScore: z.number().min(0).max(1),
    borderBandRatio: z.number().min(0).max(1),
    contrastScore: z.number().min(0).max(1),
    dominantColorRatio: z.number().min(0).max(1),
    edgeContentRatio: z.number().min(0).max(1),
    fineDetailRatio: z.number().min(0).max(1),
    lumaRange: z.number().min(0).max(255),
    pixelCount: z.number().int().min(0),
    status: z.enum([
      "analyzed",
      "near_blank_frame",
      "low_contrast_frame",
      "unsafe_margin_frame",
      "fine_detail_frame",
      "letterbox_frame",
      "unsupported",
    ]),
  })
  .strict();

export const visualReviewStillSchema = visualReviewFrameSchema
  .extend({
    analysis: visualReviewStillAnalysisSchema,
    contentType: z.literal("image/png"),
    downloadUrl: z.string().trim().min(1).max(500).startsWith("/"),
    outputPath: z.string().trim().min(1).max(1000),
    sizeInBytes: z.number().int().min(0),
    stillId: z.string().trim().min(1).max(200),
  })
  .strict();

export const visualReviewStillExtractionSchema = z
  .object({
    status: z.literal("rendered"),
    stillCount: z.number().int().min(0),
    stills: z.array(visualReviewStillSchema),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.stillCount !== value.stills.length) {
      context.addIssue({
        code: "custom",
        message: "stillCount must match stills.length.",
        path: ["stillCount"],
      });
    }
  });

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
export type VisualReviewStillAnalysis = z.infer<typeof visualReviewStillAnalysisSchema>;
export type VisualReviewStill = z.infer<typeof visualReviewStillSchema>;
export type VisualReviewStillExtraction = z.infer<typeof visualReviewStillExtractionSchema>;
export type VisualReviewDiagnostics = z.infer<typeof visualReviewDiagnosticsSchema>;
