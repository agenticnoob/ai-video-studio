import path from "node:path";
import { getRenderOutputDirectory } from "./artifact-paths";

const RENDER_ID_PATTERN = /^[a-z0-9-]+$/;

export const isValidRenderId = (renderId: string): boolean => {
  return RENDER_ID_PATTERN.test(renderId);
};

export const getRenderArtifactOutputPath = (renderId: string): string => {
  if (!isValidRenderId(renderId)) {
    throw new Error(`Invalid renderId: ${renderId}`);
  }

  return path.join(getRenderOutputDirectory(), `${renderId}.mp4`);
};

export const getRenderArtifactAbsolutePath = (renderId: string): string => {
  return getRenderArtifactOutputPath(renderId);
};

export const getRenderArtifactDownloadUrl = (renderId: string): string => {
  return `/api/render/${renderId}`;
};
