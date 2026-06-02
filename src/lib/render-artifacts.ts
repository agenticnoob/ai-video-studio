import path from "node:path";

export const RENDER_OUTPUT_DIRECTORY = "out/renders";
export const LATEST_RENDER_OUTPUT_PATH = "out/renders/latest.mp4";
export const LATEST_RENDER_DOWNLOAD_URL = "/api/render/latest";

const RENDER_ID_PATTERN = /^[a-z0-9-]+$/;

export const isValidRenderId = (renderId: string): boolean => {
  return RENDER_ID_PATTERN.test(renderId);
};

export const getRenderArtifactOutputPath = (renderId: string): string => {
  if (!isValidRenderId(renderId)) {
    throw new Error(`Invalid renderId: ${renderId}`);
  }

  return `${RENDER_OUTPUT_DIRECTORY}/${renderId}.mp4`;
};

export const getRenderArtifactAbsolutePath = (renderId: string): string => {
  return path.join(process.cwd(), getRenderArtifactOutputPath(renderId));
};

export const getRenderArtifactDownloadUrl = (renderId: string): string => {
  return `/api/render/${renderId}`;
};

export const getLatestRenderAbsolutePath = (): string => {
  return path.join(process.cwd(), LATEST_RENDER_OUTPUT_PATH);
};
