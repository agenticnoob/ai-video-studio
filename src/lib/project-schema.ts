import { z } from "zod";

import { projectMediaSchema } from "./media-layer-schema";
import { shotLanguagePlanSchema } from "./scene-graph-schema";
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
  visualLanguage: shotLanguagePlanSchema.optional(),
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

const toRecord = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

export const normalizeProject = (project: z.input<typeof videoProjectSchema>): VideoProject => {
  const meta = videoProjectMetaSchema.parse(project.meta);
  const media = project.media ? projectMediaSchema.parse(project.media) : undefined;
  const segments = project.segments.map((segment) => {
    const templateId = segment.templateId ?? SCRIPTED_TEMPLATE_ID;
    const implementation = toRecord(segment.implementation);
    const implementationMeta = toRecord(implementation.meta);

    return videoSegmentSchema.parse({
      ...segment,
      templateId,
      implementation: {
        ...implementation,
        meta: {
          ...implementationMeta,
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
    ...(project.visualLanguage
      ? { visualLanguage: shotLanguagePlanSchema.parse(project.visualLanguage) }
      : {}),
    ...(media ? { media } : {}),
    segments,
  });
};
