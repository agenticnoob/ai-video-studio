import { randomUUID } from "node:crypto";
import { copyFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { bundle as bundleFn } from "@remotion/bundler";
import type {
  renderMedia as renderMediaFn,
  selectComposition as selectCompositionFn,
} from "@remotion/renderer";
import { normalizeProject, type VideoProject } from "./project-schema";
import {
  getLatestRenderAbsolutePath,
  getRenderArtifactAbsolutePath,
  getRenderArtifactDownloadUrl,
  getRenderArtifactOutputPath,
  LATEST_RENDER_DOWNLOAD_URL,
  LATEST_RENDER_OUTPUT_PATH,
} from "./render-artifacts";

export const PROJECT_VIDEO_COMPOSITION_ID = "ProjectVideo";
const DEFAULT_RENDER_ASSET_ORIGIN = "http://127.0.0.1:3000";

const remotionEntryPoint = path.join(process.cwd(), "src/remotion/index.ts");
const webpackOverrideModuleUrl = pathToFileURL(
  path.join(process.cwd(), "src/remotion/webpack-override.mjs"),
).href;
const importAtRuntime = <T>(specifier: string): Promise<T> => {
  const dynamicImport = new Function("moduleSpecifier", "return import(moduleSpecifier);") as (
    moduleSpecifier: string,
  ) => Promise<T>;

  return dynamicImport(specifier);
};

type RemotionBundlerModule = {
  bundle: typeof bundleFn;
};

type RemotionRendererModule = {
  renderMedia: typeof renderMediaFn;
  selectComposition: typeof selectCompositionFn;
};

type BundleOptions = Exclude<Parameters<typeof bundleFn>[0], string>;

type WebpackOverrideModule = {
  webpackOverride: BundleOptions["webpackOverride"];
};

export type ProjectRenderResult = {
  absoluteOutputPath: string;
  downloadUrl: string;
  latestDownloadUrl: string;
  latestOutputPath: string;
  outputPath: string;
  project: VideoProject;
  renderId: string;
  sizeInBytes: number;
};

const createRenderId = (): string => {
  const timestamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
  return `render-${timestamp}-${randomUUID().slice(0, 8)}`.toLowerCase();
};

const getRenderAssetOrigin = (): string => {
  const configuredOrigin = (
    process.env.AI_VIDEO_STUDIO_RENDER_ASSET_ORIGIN ??
    process.env.NEXT_PUBLIC_APP_ORIGIN ??
    ""
  ).trim();

  return configuredOrigin.replace(/\/+$/, "") || DEFAULT_RENDER_ASSET_ORIGIN;
};

const resolveRouteMediaForRender = (project: VideoProject): VideoProject => {
  if (!project.media?.layers.length) {
    return project;
  }

  const assetOrigin = getRenderAssetOrigin();

  return normalizeProject({
    ...project,
    media: {
      layers: project.media.layers.map((layer) => {
        if (layer.sourceType !== "route" || !layer.src.startsWith("/")) {
          return layer;
        }

        return {
          ...layer,
          src: `${assetOrigin}${layer.src}`,
        };
      }),
    },
  });
};

export {
  getLatestRenderAbsolutePath,
  getRenderArtifactAbsolutePath,
  getRenderArtifactDownloadUrl,
  getRenderArtifactOutputPath,
  isValidRenderId,
  LATEST_RENDER_DOWNLOAD_URL,
  LATEST_RENDER_OUTPUT_PATH,
  RENDER_OUTPUT_DIRECTORY,
} from "./render-artifacts";

export const renderProjectVideo = async (
  projectInput: VideoProject,
): Promise<ProjectRenderResult> => {
  const [{ bundle }, { renderMedia, selectComposition }, { webpackOverride }] = await Promise.all([
    importAtRuntime<RemotionBundlerModule>("@remotion/bundler"),
    importAtRuntime<RemotionRendererModule>("@remotion/renderer"),
    importAtRuntime<WebpackOverrideModule>(webpackOverrideModuleUrl),
  ]);
  const project = resolveRouteMediaForRender(normalizeProject(projectInput));
  const renderId = createRenderId();
  const outputPath = getRenderArtifactOutputPath(renderId);
  const absoluteOutputPath = getRenderArtifactAbsolutePath(renderId);
  const latestAbsoluteOutputPath = getLatestRenderAbsolutePath();

  await mkdir(path.dirname(absoluteOutputPath), { recursive: true });

  const bundledProject = await bundle({
    entryPoint: remotionEntryPoint,
    webpackOverride,
  });

  const composition = await selectComposition({
    id: PROJECT_VIDEO_COMPOSITION_ID,
    inputProps: project,
    serveUrl: bundledProject,
  });

  await renderMedia({
    codec: "h264",
    composition,
    inputProps: project,
    outputLocation: absoluteOutputPath,
    overwrite: false,
    serveUrl: bundledProject,
  });

  await copyFile(absoluteOutputPath, latestAbsoluteOutputPath);

  const outputStats = await stat(absoluteOutputPath);

  return {
    absoluteOutputPath,
    downloadUrl: getRenderArtifactDownloadUrl(renderId),
    latestDownloadUrl: LATEST_RENDER_DOWNLOAD_URL,
    latestOutputPath: LATEST_RENDER_OUTPUT_PATH,
    outputPath,
    project,
    renderId,
    sizeInBytes: outputStats.size,
  };
};
