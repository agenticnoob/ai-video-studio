import { z } from "zod";

import { getVideoDuration, videoSpecSchema } from "./video-schema";

const videoProjectMetaSchema = videoSpecSchema.shape.meta;

export const SCRIPTED_TEMPLATE_ID = "scripted" as const;

// Current segment union has one implemented variant: `scripted`.
// `implementation` is template-specific; for this variant it must satisfy
// `videoSpecSchema`, whose `scenes` field is a scripted-template detail.
const rawVideoSegmentSchema = z.object({
  id: z.string(),
  title: z.string(),
  intent: z.string(),
  revisionPrompt: z.string().optional(),
  durationInFrames: z.number().int().positive().optional(),
  templateId: z.literal(SCRIPTED_TEMPLATE_ID).default(SCRIPTED_TEMPLATE_ID),
  implementation: videoSpecSchema,
});

export const videoSegmentSchema = rawVideoSegmentSchema.transform((segment) => ({
  ...segment,
  durationInFrames: getVideoDuration(segment.implementation),
}));

export const videoProjectSchema = z.object({
  meta: videoProjectMetaSchema,
  brief: z.string(),
  segments: z.array(videoSegmentSchema).min(1),
});

export type VideoSegment = z.infer<typeof videoSegmentSchema>;
export type VideoProject = z.infer<typeof videoProjectSchema>;

export const getSegmentDuration = (segment: VideoSegment): number => {
  return getVideoDuration(segment.implementation);
};

export const getProjectDuration = (project: VideoProject): number => {
  return project.segments.reduce((sum, segment) => sum + getSegmentDuration(segment), 0);
};

export const getSegmentStart = (project: VideoProject, index: number): number => {
  return project.segments
    .slice(0, index)
    .reduce((sum, segment) => sum + getSegmentDuration(segment), 0);
};

export const normalizeProject = (
  project: z.input<typeof videoProjectSchema>,
): VideoProject => {
  const meta = videoProjectMetaSchema.parse(project.meta);
  const segments = project.segments.map((segment) =>
    videoSegmentSchema.parse({
      ...segment,
      templateId: segment.templateId ?? SCRIPTED_TEMPLATE_ID,
      implementation: {
        ...segment.implementation,
        meta: {
          ...segment.implementation.meta,
          title: segment.title,
          fps: meta.fps,
          width: meta.width,
          height: meta.height,
        },
      },
    }),
  );

  return videoProjectSchema.parse({
    meta,
    brief: project.brief,
    segments,
  });
};
