import {
  segmentCaptionsSchema,
  type SegmentCaptionCue,
  type SegmentCaptions,
} from "./caption-schema";

type CaptionStyle = NonNullable<SegmentCaptions["style"]>;

export type ProviderCaptionCue = {
  id?: string;
  text: string;
  startFrame?: number;
  durationInFrames?: number;
  endFrame?: number;
  startSeconds?: number;
  durationSeconds?: number;
  endSeconds?: number;
  startMs?: number;
  endMs?: number;
};

export type NormalizeSegmentCaptionsRequest = {
  durationInFrames: number;
  fps?: number;
  language?: string;
  providerCues?: ProviderCaptionCue[];
  style?: CaptionStyle;
  text: string;
};

const DEFAULT_FPS = 30;
const MIN_CUE_DURATION_FRAMES = 12;
const MAX_FALLBACK_CUE_CHARS = 42;

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

const normalizeCueId = (id: string | undefined, index: number): string => {
  const normalized = id
    ?.trim()
    .replace(/[^a-z0-9_-]+/gi, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || `caption-${index + 1}`;
};

const secondsToFrames = (seconds: number, fps: number): number => {
  return Math.round(seconds * fps);
};

const cueStartFrame = (cue: ProviderCaptionCue, fps: number): number | undefined => {
  if (Number.isFinite(cue.startFrame)) {
    return cue.startFrame;
  }
  if (Number.isFinite(cue.startSeconds)) {
    return secondsToFrames(cue.startSeconds as number, fps);
  }
  if (Number.isFinite(cue.startMs)) {
    return secondsToFrames((cue.startMs as number) / 1000, fps);
  }
  return undefined;
};

const cueEndFrame = (cue: ProviderCaptionCue, fps: number): number | undefined => {
  if (Number.isFinite(cue.endFrame)) {
    return cue.endFrame;
  }
  if (Number.isFinite(cue.durationInFrames) && Number.isFinite(cue.startFrame)) {
    return (cue.startFrame as number) + (cue.durationInFrames as number);
  }
  if (Number.isFinite(cue.endSeconds)) {
    return secondsToFrames(cue.endSeconds as number, fps);
  }
  if (Number.isFinite(cue.durationSeconds) && Number.isFinite(cue.startSeconds)) {
    return secondsToFrames((cue.startSeconds as number) + (cue.durationSeconds as number), fps);
  }
  if (Number.isFinite(cue.endMs)) {
    return secondsToFrames((cue.endMs as number) / 1000, fps);
  }
  return undefined;
};

const normalizeProviderCue = ({
  cue,
  durationInFrames,
  fps,
  index,
}: {
  cue: ProviderCaptionCue;
  durationInFrames: number;
  fps: number;
  index: number;
}): SegmentCaptionCue | undefined => {
  const text = cue.text.trim();
  if (!text) {
    return undefined;
  }

  const rawStartFrame = cueStartFrame(cue, fps);
  const rawEndFrame = cueEndFrame(cue, fps);
  if (!Number.isFinite(rawStartFrame) || !Number.isFinite(rawEndFrame)) {
    return undefined;
  }

  const startFrame = clamp(
    Math.round(rawStartFrame as number),
    0,
    Math.max(0, durationInFrames - 1),
  );
  const endFrame = clamp(Math.round(rawEndFrame as number), startFrame + 1, durationInFrames);
  const cueDuration = endFrame - startFrame;

  if (cueDuration <= 0) {
    return undefined;
  }

  return {
    id: normalizeCueId(cue.id, index),
    text,
    startFrame,
    durationInFrames: cueDuration,
  };
};

const splitFallbackCaptionText = (text: string): string[] => {
  const sentences = text
    .trim()
    .split(/(?<=[.!?。！？])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const sourceParts = sentences.length > 0 ? sentences : [text.trim()];
  const chunks: string[] = [];

  for (const part of sourceParts) {
    const words = part.split(/\s+/).filter(Boolean);
    if (words.length <= 1 && part.length <= MAX_FALLBACK_CUE_CHARS) {
      chunks.push(part);
      continue;
    }

    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length > MAX_FALLBACK_CUE_CHARS && current) {
        chunks.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    if (current) {
      chunks.push(current);
    }
  }

  return chunks.length > 0 ? chunks : [text.trim()];
};

const buildFallbackCues = ({
  durationInFrames,
  text,
}: {
  durationInFrames: number;
  text: string;
}): SegmentCaptionCue[] => {
  const maxCueCount = Math.max(1, Math.floor(durationInFrames / MIN_CUE_DURATION_FRAMES));
  const chunks = splitFallbackCaptionText(text).slice(0, maxCueCount);
  const totalWeight = chunks.reduce((sum, chunk) => sum + Math.max(1, chunk.length), 0);
  let cursor = 0;

  return chunks.map((chunk, index) => {
    const remainingFrames = durationInFrames - cursor;
    const remainingCues = chunks.length - index;
    const weightedDuration = Math.round(
      (durationInFrames * Math.max(1, chunk.length)) / totalWeight,
    );
    const durationInFramesForCue =
      index === chunks.length - 1
        ? remainingFrames
        : clamp(weightedDuration, MIN_CUE_DURATION_FRAMES, remainingFrames - (remainingCues - 1));
    const cue = {
      id: `caption-${index + 1}`,
      text: chunk,
      startFrame: cursor,
      durationInFrames: Math.max(1, durationInFramesForCue),
    };
    cursor += cue.durationInFrames;
    return cue;
  });
};

export const normalizeSegmentCaptions = ({
  durationInFrames,
  fps = DEFAULT_FPS,
  language,
  providerCues,
  style,
  text,
}: NormalizeSegmentCaptionsRequest): SegmentCaptions => {
  if (!Number.isInteger(durationInFrames) || durationInFrames <= 0) {
    throw new Error(`Invalid caption duration: ${durationInFrames}`);
  }

  const normalizedProviderCues = (providerCues ?? [])
    .map((cue, index) => normalizeProviderCue({ cue, durationInFrames, fps, index }))
    .filter((cue): cue is SegmentCaptionCue => Boolean(cue));
  const cues =
    normalizedProviderCues.length > 0
      ? normalizedProviderCues
      : buildFallbackCues({ durationInFrames, text });

  return segmentCaptionsSchema.parse({
    ...(language ? { language } : {}),
    cues,
    ...(style ? { style } : {}),
  });
};
