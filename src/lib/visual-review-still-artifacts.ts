import type { VisualReviewFrame } from "./visual-review-schema";

const STILL_ID_PATTERN = /^[a-z0-9-]+$/;
const EXTRACTION_ID_PATTERN = /^[a-z0-9-]+$/;
const DEFAULT_ARTIFACT_ROOT = "/workspace/out";

const joinPath = (...parts: string[]): string => {
  return parts
    .map((part, index) =>
      index === 0 ? part.replace(/\/+$/g, "") : part.replace(/^\/+|\/+$/g, ""),
    )
    .filter(Boolean)
    .join("/");
};

const getArtifactRoot = (): string => {
  const configuredRoot = (process.env.AI_VIDEO_STUDIO_ARTIFACT_ROOT ?? "").trim();
  const artifactRoot = (configuredRoot || DEFAULT_ARTIFACT_ROOT).replace(/\/+$/g, "");

  if (artifactRoot.startsWith("/")) {
    return artifactRoot;
  }

  return joinPath(process.cwd(), artifactRoot);
};

export const getVisualReviewStillOutputDirectory = (): string => {
  return joinPath(getArtifactRoot(), "visual-review-stills");
};

const toSafeIdPart = (value: string): string => {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "frame";
};

export const isValidVisualReviewStillId = (stillId: string): boolean => {
  return STILL_ID_PATTERN.test(stillId);
};

export const isValidVisualReviewExtractionId = (extractionId: string): boolean => {
  return EXTRACTION_ID_PATTERN.test(extractionId);
};

export const createVisualReviewStillId = (reviewFrame: VisualReviewFrame): string => {
  const framePart = reviewFrame.frame.toString().padStart(6, "0");
  return `${toSafeIdPart(reviewFrame.segmentId)}-${reviewFrame.reason.replaceAll(
    "_",
    "-",
  )}-frame-${framePart}`;
};

export const getVisualReviewStillOutputPath = ({
  extractionId,
  stillId,
}: {
  extractionId: string;
  stillId: string;
}): string => {
  if (!isValidVisualReviewExtractionId(extractionId)) {
    throw new Error(`Invalid visual review extractionId: ${extractionId}`);
  }
  if (!isValidVisualReviewStillId(stillId)) {
    throw new Error(`Invalid visual review stillId: ${stillId}`);
  }

  return joinPath(getVisualReviewStillOutputDirectory(), extractionId, `${stillId}.png`);
};

export const getVisualReviewStillDownloadUrl = ({
  extractionId,
  stillId,
}: {
  extractionId: string;
  stillId: string;
}): string => {
  if (!isValidVisualReviewExtractionId(extractionId)) {
    throw new Error(`Invalid visual review extractionId: ${extractionId}`);
  }
  if (!isValidVisualReviewStillId(stillId)) {
    throw new Error(`Invalid visual review stillId: ${stillId}`);
  }

  return `/api/visual-review/stills/${extractionId}/${stillId}`;
};

export const createVisualReviewStillArtifact = ({
  extractionId,
  reviewFrame,
}: {
  extractionId: string;
  reviewFrame: VisualReviewFrame;
}): VisualReviewStillArtifact => {
  const stillId = createVisualReviewStillId(reviewFrame);

  return {
    downloadUrl: getVisualReviewStillDownloadUrl({ extractionId, stillId }),
    outputPath: getVisualReviewStillOutputPath({ extractionId, stillId }),
    stillId,
  };
};

export type VisualReviewStillArtifact = {
  downloadUrl: string;
  outputPath: string;
  stillId: string;
};
