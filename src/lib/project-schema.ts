import { z } from "zod";

import { projectMediaSchema } from "./media-layer-schema";
import {
  SCRIPTED_TEMPLATE_ID,
  SPOTLIGHT_TEMPLATE_ID,
  getTemplateDefinition,
  videoSegmentSchemaVariants,
} from "./template-registry";
import { videoSpecSchema } from "./video-schema";

const videoProjectMetaSchema = videoSpecSchema.shape.meta;

export { SCRIPTED_TEMPLATE_ID, SPOTLIGHT_TEMPLATE_ID };

const rawVideoSegmentSchema = z.discriminatedUnion("templateId", videoSegmentSchemaVariants);

export const videoSegmentSchema = rawVideoSegmentSchema.transform((segment) => {
  return {
    ...segment,
    durationInFrames: getTemplateDefinition(segment.templateId).getDuration(
      segment.implementation as never,
    ),
  };
});

export const videoProjectSchema = z.object({
  meta: videoProjectMetaSchema,
  brief: z.string(),
  media: projectMediaSchema.optional(),
  segments: z.array(videoSegmentSchema).min(1),
});

export type VideoSegment = z.infer<typeof videoSegmentSchema>;
export type VideoProject = z.infer<typeof videoProjectSchema>;

export const getSegmentDuration = (segment: VideoSegment): number => {
  return getTemplateDefinition(segment.templateId).getDuration(segment.implementation as never);
};

export const getProjectDuration = (project: VideoProject): number => {
  return project.segments.reduce((sum, segment) => sum + getSegmentDuration(segment), 0);
};

export const getSegmentStart = (project: VideoProject, index: number): number => {
  return project.segments
    .slice(0, index)
    .reduce((sum, segment) => sum + getSegmentDuration(segment), 0);
};

export const normalizeProject = (project: z.input<typeof videoProjectSchema>): VideoProject => {
  const meta = videoProjectMetaSchema.parse(project.meta);
  const media = project.media ? projectMediaSchema.parse(project.media) : undefined;
  const segments = project.segments.map((segment) => {
    const templateId = segment.templateId ?? SCRIPTED_TEMPLATE_ID;

    return videoSegmentSchema.parse({
      ...segment,
      templateId,
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
    });
  });

  return videoProjectSchema.parse({
    meta,
    brief: project.brief,
    ...(media ? { media } : {}),
    segments,
  });
};
