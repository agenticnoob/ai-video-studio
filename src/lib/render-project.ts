import { randomUUID } from "node:crypto";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { bundle as bundleFn } from "@remotion/bundler";
import type {
  renderMedia as renderMediaFn,
  selectComposition as selectCompositionFn,
} from "@remotion/renderer";
import { normalizeProject, type VideoProject } from "./project-schema";
import {
  getRenderArtifactAbsolutePath,
  getRenderArtifactDownloadUrl,
  getRenderArtifactOutputPath,
} from "./render-artifacts";
import { TECHNICAL_EXPLAINER_TEMPLATE_ID } from "../templates/ids";

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
  outputPath: string;
  project: VideoProject;
  renderId: string;
  sizeInBytes: number;
};

export type ProjectRenderProgressReporter = (
  stepId: "prepare" | "bundle" | "composition" | "render" | "artifact",
  status: "running" | "success" | "failure",
  detail?: string,
) => void;

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

type ProductUiZoomSectionLike = {
  recipeId: "product-ui-zoom";
  asset?: {
    sourceType?: string;
    src?: string;
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const rewriteProductUiZoomSectionAsset = (section: unknown, assetOrigin: string): unknown => {
  if (!isRecord(section) || section.recipeId !== "product-ui-zoom") {
    return section;
  }

  const typedSection = section as ProductUiZoomSectionLike;
  const asset = typedSection.asset;
  if (asset?.sourceType !== "route" || !asset.src?.startsWith("/")) {
    return section;
  }

  return {
    ...section,
    asset: {
      ...asset,
      src: `${assetOrigin}${asset.src}`,
    },
  };
};

const getImplementationSectionsRecord = (
  implementation: unknown,
): (Record<string, unknown> & { sections: unknown[] }) | null => {
  if (!isRecord(implementation) || !Array.isArray(implementation.sections)) {
    return null;
  }

  return implementation as Record<string, unknown> & { sections: unknown[] };
};

const hasRouteProductUiZoomAsset = (project: VideoProject): boolean =>
  project.segments.some((segment) => {
    if (segment.templateId !== TECHNICAL_EXPLAINER_TEMPLATE_ID) {
      return false;
    }

    const implementation = getImplementationSectionsRecord(segment.implementation);
    if (!implementation) {
      return false;
    }

    return implementation.sections.some((section) => {
      if (!isRecord(section) || section.recipeId !== "product-ui-zoom") {
        return false;
      }

      const asset = section.asset;
      return isRecord(asset) && asset.sourceType === "route" && typeof asset.src === "string"
        ? asset.src.startsWith("/")
        : false;
    });
  });

const rewriteSegmentRouteAssets = (
  segment: VideoProject["segments"][number],
  assetOrigin: string,
): unknown => {
  const narration = segment.narration;
  const audio = narration?.audio;
  const implementation = getImplementationSectionsRecord(segment.implementation);
  const shouldRewriteProductUiZoomAssets =
    segment.templateId === TECHNICAL_EXPLAINER_TEMPLATE_ID && implementation !== null;

  if (!shouldRewriteProductUiZoomAssets && (!narration || !audio?.src.startsWith("/"))) {
    return segment;
  }

  return {
    ...segment,
    ...(shouldRewriteProductUiZoomAssets
      ? {
          implementation: {
            ...implementation,
            sections: implementation.sections.map((section: unknown) =>
              rewriteProductUiZoomSectionAsset(section, assetOrigin),
            ),
          },
        }
      : {}),
    ...(narration && audio?.src.startsWith("/")
      ? {
          narration: {
            ...narration,
            audio: {
              ...audio,
              src: `${assetOrigin}${audio.src}`,
            },
          },
        }
      : {}),
  };
};

const resolveRouteMediaForRender = (project: VideoProject): VideoProject => {
  const hasRouteMediaLayer = project.media?.layers.some(
    (layer) => layer.sourceType === "route" && layer.src.startsWith("/"),
  );
  const hasRouteSegmentNarration = project.segments.some((segment) =>
    segment.narration?.audio?.src.startsWith("/"),
  );
  const hasRouteTemplateAsset = hasRouteProductUiZoomAsset(project);

  if (!hasRouteMediaLayer && !hasRouteSegmentNarration && !hasRouteTemplateAsset) {
    return project;
  }

  const assetOrigin = getRenderAssetOrigin();

  return normalizeProject({
    ...project,
    ...(project.media
      ? {
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
        }
      : {}),
    segments: project.segments.map((segment) => rewriteSegmentRouteAssets(segment, assetOrigin)),
  } as Parameters<typeof normalizeProject>[0]);
};

export {
  getRenderArtifactAbsolutePath,
  getRenderArtifactDownloadUrl,
  getRenderArtifactOutputPath,
  isValidRenderId,
} from "./render-artifacts";

export const renderProjectVideo = async (
  projectInput: VideoProject,
  options: { onProgress?: ProjectRenderProgressReporter } = {},
): Promise<ProjectRenderResult> => {
  options.onProgress?.("prepare", "running", "Loading Remotion renderer modules.");
  const [{ bundle }, { renderMedia, selectComposition }, { webpackOverride }] = await Promise.all([
    importAtRuntime<RemotionBundlerModule>("@remotion/bundler"),
    importAtRuntime<RemotionRendererModule>("@remotion/renderer"),
    importAtRuntime<WebpackOverrideModule>(webpackOverrideModuleUrl),
  ]);
  options.onProgress?.("prepare", "success", "Remotion renderer modules loaded.");

  const project = resolveRouteMediaForRender(normalizeProject(projectInput));
  const renderId = createRenderId();
  const outputPath = getRenderArtifactOutputPath(renderId);
  const absoluteOutputPath = getRenderArtifactAbsolutePath(renderId);

  await mkdir(path.dirname(absoluteOutputPath), { recursive: true });

  options.onProgress?.("bundle", "running", "Bundling Remotion project.");
  const bundledProject = await bundle({
    entryPoint: remotionEntryPoint,
    webpackOverride,
  });
  options.onProgress?.("bundle", "success", "Remotion project bundled.");

  options.onProgress?.("composition", "running", "Selecting ProjectVideo composition.");
  const composition = await selectComposition({
    id: PROJECT_VIDEO_COMPOSITION_ID,
    inputProps: project,
    serveUrl: bundledProject,
  });
  options.onProgress?.("composition", "success", "ProjectVideo composition selected.");

  options.onProgress?.("render", "running", "Rendering mp4 file.");
  await renderMedia({
    codec: "h264",
    composition,
    inputProps: project,
    outputLocation: absoluteOutputPath,
    overwrite: false,
    serveUrl: bundledProject,
  });
  options.onProgress?.("render", "success", "Mp4 render completed.");

  const outputStats = await stat(absoluteOutputPath);
  options.onProgress?.("artifact", "success", "Render artifact ready.");

  return {
    absoluteOutputPath,
    downloadUrl: getRenderArtifactDownloadUrl(renderId),
    outputPath,
    project,
    renderId,
    sizeInBytes: outputStats.size,
  };
};
