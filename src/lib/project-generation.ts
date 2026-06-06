/**
 * Test-only mock project generation. No longer wired into POST /api/generate;
 * the real generation path is implemented in `src/lib/minimax/`. The mock is
 * kept as a deterministic offline tool for unit tests and local dev dry-runs.
 */

import { buildMockSpecFromBrief, titleFromBrief } from "./mock-spec";
import {
  normalizeProject,
  SCRIPTED_TEMPLATE_ID,
  videoSegmentSchema,
  type VideoProject,
  type VideoSegment,
} from "./project-schema";

type BriefPart = {
  index: number;
  text: string;
};

const SEGMENT_COLORS = [
  { background: "#101820", primary: "#2dd4bf", secondary: "#f59e0b" },
  { background: "#172033", primary: "#60a5fa", secondary: "#f97316" },
  { background: "#1f1630", primary: "#f472b6", secondary: "#22c55e" },
] as const;

const cleanBrief = (brief: string): string => {
  return brief.replace(/\s+/g, " ").trim();
};

const getSegmentCount = (brief: string): number => {
  const normalized = cleanBrief(brief);

  if (normalized.length >= 280) {
    return 3;
  }

  if (normalized.length >= 120) {
    return 2;
  }

  return 1;
};

const splitIntoSourceUnits = (brief: string): string[] => {
  const paragraphUnits = brief
    .split(/\r?\n+/)
    .map((part) => cleanBrief(part))
    .filter(Boolean);

  if (paragraphUnits.length > 1) {
    return paragraphUnits;
  }

  const sentenceUnits = brief
    .split(/(?<=[.!?])\s+/)
    .map((part) => cleanBrief(part))
    .filter(Boolean);

  return sentenceUnits.length > 0 ? sentenceUnits : [cleanBrief(brief)];
};

const rebalanceUnits = (units: string[], segmentCount: number): BriefPart[] => {
  const safeUnits = units.length > 0 ? units : ["Create a concise AI Video Studio workflow video."];
  const parts: string[] = Array.from({ length: segmentCount }, () => "");

  safeUnits.forEach((unit, index) => {
    const bucketIndex = Math.min(index % segmentCount, segmentCount - 1);
    parts[bucketIndex] = cleanBrief(`${parts[bucketIndex]} ${unit}`);
  });

  return parts.map((text, index) => ({
    index,
    text: text || safeUnits[Math.min(index, safeUnits.length - 1)],
  }));
};

const summarizeIntent = (part: string, fallbackTitle: string): string => {
  const normalized = cleanBrief(part);

  if (!normalized) {
    return `Introduce ${fallbackTitle} and prepare the viewer for the next beat.`;
  }

  if (normalized.length <= 120) {
    return normalized;
  }

  return `${normalized.slice(0, 117)}...`;
};

const buildSegmentTitle = (part: string, index: number): string => {
  const baseTitle = titleFromBrief(part).replace(/\.\.\.$/, "");
  return `Segment ${index + 1}: ${baseTitle || `Storyboard Beat ${index + 1}`}`;
};

export const buildSegmentFromBriefPart = (
  part: string,
  index: number,
  projectMeta?: VideoProject["meta"],
): VideoSegment => {
  const colors = SEGMENT_COLORS[index % SEGMENT_COLORS.length];
  const title = buildSegmentTitle(part, index);
  const implementation = buildMockSpecFromBrief(
    { brief: part },
    {
      title,
      fps: projectMeta?.fps ?? 30,
      width: projectMeta?.width ?? 1280,
      height: projectMeta?.height ?? 720,
      sceneSeconds: 3 + index,
      background: colors.background,
      primary: colors.primary,
      secondary: colors.secondary,
      callToAction: `Refine segment ${index + 1} and keep the full project aligned before export.`,
    },
  );

  return videoSegmentSchema.parse({
    id: `segment-${index + 1}`,
    title,
    intent: summarizeIntent(part, title),
    templateId: SCRIPTED_TEMPLATE_ID,
    implementation,
  });
};

export const reviseSegmentFromPrompt = (
  segment: VideoSegment,
  revisionPrompt: string,
  index = 0,
): VideoSegment => {
  const revisedBrief = cleanBrief([segment.intent, revisionPrompt].filter(Boolean).join(". "));

  const nextSegment = buildSegmentFromBriefPart(revisedBrief, index, segment.implementation.meta);

  return videoSegmentSchema.parse({
    ...segment,
    title: segment.title,
    revisionPrompt,
    intent: summarizeIntent(revisedBrief, segment.title),
    implementation: {
      ...nextSegment.implementation,
      meta: {
        ...nextSegment.implementation.meta,
        title: segment.title,
      },
    },
  });
};

export const reviseProjectSegmentFromPrompt = (
  project: VideoProject,
  segmentId: string,
  revisionPrompt: string,
): VideoProject => {
  const segmentIndex = project.segments.findIndex((segment) => segment.id === segmentId);

  if (segmentIndex < 0) {
    throw new Error(`Segment "${segmentId}" was not found.`);
  }

  return normalizeProject({
    ...project,
    segments: project.segments.map((segment, index) =>
      index === segmentIndex ? reviseSegmentFromPrompt(segment, revisionPrompt, index) : segment,
    ),
  });
};

export const buildMockProjectFromBrief = (input: { brief: string }): VideoProject => {
  const brief = cleanBrief(input.brief) || "Create a concise AI Video Studio workflow video.";
  const segmentCount = getSegmentCount(brief);
  const sourceUnits = splitIntoSourceUnits(brief);
  const briefParts = rebalanceUnits(sourceUnits, segmentCount);
  const meta = {
    title: titleFromBrief(brief),
    fps: 30,
    width: 1280,
    height: 720,
  };

  return normalizeProject({
    meta,
    brief,
    segments: briefParts.map((part) => buildSegmentFromBriefPart(part.text, part.index, meta)),
  });
};
