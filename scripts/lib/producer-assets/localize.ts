import { copyFile, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  assertProducerAssetManifest,
  producerAssetKinds,
  type ProducerAsset,
  type ProducerAssetKind,
  type ProducerAssetManifest,
} from "../../../src/remotion/producer-samples/asset-manifest";
import {
  calculateProducerAssetIntegrity,
  defaultProducerAssetExecFile,
  probeProducerAssetMedia,
} from "./metadata";
import { serializeProducerAssetManifest } from "./serialize";
import type {
  ProducerAssetExecFile,
  ProducerAssetFetch,
  ProducerAssetSupplyPlan,
  ProducerAssetSupplyRequest,
} from "./types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const requireText = (value: unknown, label: string): string => {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} must be non-empty.`);
  return value;
};

const rejectGenerationFields = (value: unknown, label = "asset supply plan"): void => {
  if (Array.isArray(value)) {
    value.forEach((item, index) => rejectGenerationFields(item, `${label}[${index}]`));
    return;
  }
  if (!isRecord(value)) return;
  for (const [key, nested] of Object.entries(value)) {
    if (["model", "prompt", "seed", "workflow"].includes(key.toLowerCase())) {
      throw new Error(`${label} must not include generation field ${key}.`);
    }
    rejectGenerationFields(nested, `${label}.${key}`);
  }
};

const destinationPathFor = (request: ProducerAssetSupplyRequest, slug: string): string => {
  const fileName = requireText(request.destination.fileName, `${request.id} destination fileName`);
  if (path.posix.basename(fileName) !== fileName || fileName.includes("\\")) {
    throw new Error(`${request.id} destination fileName must not contain a path.`);
  }
  if (request.kind === "video" && path.posix.extname(fileName).toLowerCase() !== ".mp4") {
    throw new Error(`${request.id} normalized video destination must use .mp4.`);
  }
  if (request.destination.scope === "library") {
    return path.posix.join("public/assets/library", fileName);
  }
  if (request.destination.scope === "composition") {
    return path.posix.join("public/generated", slug, "assets", fileName);
  }
  throw new Error(`${request.id} has unsupported destination scope.`);
};

const assertSupplyPlan: (value: unknown) => asserts value is ProducerAssetSupplyPlan = (value) => {
  rejectGenerationFields(value);
  if (!isRecord(value) || value.version !== 1) {
    throw new Error("Producer asset supply plan version must be 1.");
  }
  requireText(value.compositionId, "asset supply compositionId");
  const slug = requireText(value.slug, "asset supply slug");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("asset supply slug must be kebab-case.");
  }
  requireText(value.outputManifestPath, "asset supply outputManifestPath");
  if (!Array.isArray(value.assets)) throw new Error("asset supply assets must be an array.");
  const ids = new Set<string>();
  const destinations = new Set<string>();
  for (const [index, rawRequest] of value.assets.entries()) {
    if (!isRecord(rawRequest)) throw new Error(`asset supply assets[${index}] must be an object.`);
    const request = rawRequest as unknown as ProducerAssetSupplyRequest;
    const id = requireText(request.id, `asset supply assets[${index}].id`);
    if (ids.has(id)) throw new Error(`Duplicate producer asset supply id: ${id}.`);
    ids.add(id);
    if (!producerAssetKinds.includes(request.kind as ProducerAssetKind)) {
      throw new Error(`${id} has unsupported asset kind.`);
    }
    requireText(request.purpose, `${id}.purpose`);
    if (!isRecord(request.source)) throw new Error(`${id}.source must be an object.`);
    requireText(request.source.provider, `${id}.source.provider`);
    requireText(request.source.license, `${id}.source.license`);
    if (
      request.source.attributionRequired &&
      (!request.source.creator || !request.source.attribution)
    ) {
      throw new Error(`${id} requires complete creator and attribution metadata.`);
    }
    if (!isRecord(request.acquisition)) throw new Error(`${id}.acquisition must be an object.`);
    if (request.acquisition.type === "manual") {
      requireText(request.acquisition.sourcePath, `${id}.acquisition.sourcePath`);
    } else if (request.acquisition.type === "url") {
      const url = requireText(request.acquisition.url, `${id}.acquisition.url`);
      if (!/^https?:\/\//i.test(url)) throw new Error(`${id} URL acquisition must use HTTP(S).`);
      if (request.source.sourceUrl !== url) {
        throw new Error(`${id} sourceUrl must match its URL acquisition.`);
      }
    } else {
      throw new Error(`${id} has unsupported acquisition type.`);
    }
    if (!isRecord(request.destination)) throw new Error(`${id}.destination must be an object.`);
    const destinationPath = destinationPathFor(request, slug);
    if (destinations.has(destinationPath)) {
      throw new Error(`Duplicate producer asset destination: ${destinationPath}.`);
    }
    destinations.add(destinationPath);
  }
};

const resolveInsideRoot = (rootDir: string, relativePath: string, label: string): string => {
  if (path.isAbsolute(relativePath)) throw new Error(`${label} must be repository-relative.`);
  const absolutePath = path.resolve(rootDir, relativePath);
  const relative = path.relative(rootDir, absolutePath);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`${label} must resolve to a file inside the repository.`);
  }
  return absolutePath;
};

const acquireToPath = async ({
  request,
  rootDir,
  temporaryPath,
  fetchImpl,
}: {
  readonly request: ProducerAssetSupplyRequest;
  readonly rootDir: string;
  readonly temporaryPath: string;
  readonly fetchImpl: ProducerAssetFetch;
}): Promise<void> => {
  if (request.acquisition.type === "manual") {
    const sourcePath = path.isAbsolute(request.acquisition.sourcePath)
      ? request.acquisition.sourcePath
      : path.resolve(rootDir, request.acquisition.sourcePath);
    await copyFile(sourcePath, temporaryPath);
    return;
  }
  const response = await fetchImpl(request.acquisition.url);
  if (!response.ok) {
    throw new Error(`${request.id} URL acquisition failed with HTTP ${response.status}.`);
  }
  await writeFile(temporaryPath, new Uint8Array(await response.arrayBuffer()));
};

const normalizeVideo = async (
  inputPath: string,
  outputPath: string,
  execFileImpl: ProducerAssetExecFile,
): Promise<void> => {
  await execFileImpl("ffmpeg", [
    "-v",
    "error",
    "-y",
    "-i",
    inputPath,
    "-map",
    "0:v:0",
    "-map",
    "0:a?",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-fps_mode",
    "cfr",
    "-c:a",
    "aac",
    "-movflags",
    "+faststart",
    outputPath,
  ]);
};

export const localizeProducerAssets = async ({
  plan,
  rootDir = process.cwd(),
  fetchImpl = fetch as ProducerAssetFetch,
  execFileImpl = defaultProducerAssetExecFile,
}: {
  readonly plan: unknown;
  readonly rootDir?: string;
  readonly fetchImpl?: ProducerAssetFetch;
  readonly execFileImpl?: ProducerAssetExecFile;
}): Promise<ProducerAssetManifest> => {
  assertSupplyPlan(plan);
  const absoluteRoot = path.resolve(rootDir);
  const outputManifestPath = resolveInsideRoot(
    absoluteRoot,
    plan.outputManifestPath,
    "asset supply outputManifestPath",
  );
  const pending: {
    readonly asset: ProducerAsset;
    readonly finalPath: string;
    readonly temporaryPath: string;
  }[] = [];
  const temporaryPaths: string[] = [];
  try {
    for (const request of plan.assets) {
      const localPath = destinationPathFor(request, plan.slug);
      const finalPath = resolveInsideRoot(absoluteRoot, localPath, `${request.id}.localPath`);
      await mkdir(path.dirname(finalPath), { recursive: true });
      const extension = path.extname(finalPath);
      const temporaryPath = `${finalPath.slice(0, finalPath.length - extension.length)}.producer-tmp-${process.pid}${extension}`;
      const acquiredPath = `${temporaryPath}.source${extension || ".bin"}`;
      temporaryPaths.push(temporaryPath, acquiredPath);
      await acquireToPath({
        request,
        rootDir: absoluteRoot,
        temporaryPath: acquiredPath,
        fetchImpl,
      });
      if (request.kind === "video") {
        await normalizeVideo(acquiredPath, temporaryPath, execFileImpl);
      } else {
        await copyFile(acquiredPath, temporaryPath);
      }
      const integrity = await calculateProducerAssetIntegrity(temporaryPath);
      const media = await probeProducerAssetMedia({
        kind: request.kind,
        filePath: temporaryPath,
        execFileImpl,
      });
      pending.push({
        finalPath,
        temporaryPath,
        asset: {
          id: request.id,
          kind: request.kind,
          localPath,
          purpose: request.purpose,
          source: request.source,
          integrity,
          ...(media ? { media } : {}),
          ...(request.requirements ? { requirements: request.requirements } : {}),
        },
      });
    }

    const manifest: ProducerAssetManifest = {
      version: 1,
      compositionId: plan.compositionId,
      slug: plan.slug,
      assets: pending.map(({ asset }) => asset),
    };
    assertProducerAssetManifest(manifest);
    for (const item of pending) await rename(item.temporaryPath, item.finalPath);
    await mkdir(path.dirname(outputManifestPath), { recursive: true });
    const outputTemporaryPath = `${outputManifestPath}.producer-tmp-${process.pid}`;
    temporaryPaths.push(outputTemporaryPath);
    await writeFile(outputTemporaryPath, serializeProducerAssetManifest(manifest));
    await rename(outputTemporaryPath, outputManifestPath);
    return manifest;
  } finally {
    await Promise.all(temporaryPaths.map((temporaryPath) => rm(temporaryPath, { force: true })));
  }
};

export const readProducerAssetSupplyPlan = async (filePath: string): Promise<unknown> =>
  JSON.parse(await readFile(filePath, "utf8"));
