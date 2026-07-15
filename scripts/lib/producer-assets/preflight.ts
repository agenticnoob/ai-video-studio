import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import {
  assertProducerAssetManifest,
  type ProducerAsset,
  type ProducerAssetManifest,
} from "../../../src/remotion/producer-samples/asset-manifest";
import {
  calculateProducerAssetIntegrity,
  defaultProducerAssetExecFile,
  probeProducerAssetMedia,
} from "./metadata";
import { parseProducerAssetManifest } from "./serialize";
import type { ProducerAssetExecFile, ProducerAssetMedia } from "./types";

const closeEnough = (left: number | undefined, right: number | undefined): boolean =>
  left === undefined || right === undefined ? left === right : Math.abs(left - right) < 0.001;

const assertMediaMatches = (
  asset: ProducerAsset,
  current: ProducerAssetMedia | undefined,
): void => {
  const recorded = asset.media;
  if (!recorded && !current) return;
  if (!recorded || !current)
    throw new Error(`${asset.id} media metadata is missing or unreadable.`);
  for (const field of ["width", "height", "fps", "sampleRate"] as const) {
    if (recorded[field] !== current[field]) {
      throw new Error(`${asset.id} media ${field} does not match the asset manifest.`);
    }
  }
  if (!closeEnough(recorded.durationInSeconds, current.durationInSeconds)) {
    throw new Error(`${asset.id} media duration does not match the asset manifest.`);
  }
  for (const field of ["codec", "audioCodec", "pixelFormat", "constantFrameRate"] as const) {
    if (recorded[field] !== current[field]) {
      throw new Error(`${asset.id} media ${field} does not match the asset manifest.`);
    }
  }
};

const assertRequirements = (asset: ProducerAsset): void => {
  const requirements = asset.requirements;
  if (!requirements) return;
  if (requirements.minWidth && (asset.media?.width ?? 0) < requirements.minWidth) {
    throw new Error(`${asset.id} is undersized: width is below ${requirements.minWidth}.`);
  }
  if (requirements.minHeight && (asset.media?.height ?? 0) < requirements.minHeight) {
    throw new Error(`${asset.id} is undersized: height is below ${requirements.minHeight}.`);
  }
  if (
    requirements.minDurationInSeconds &&
    (asset.media?.durationInSeconds ?? 0) < requirements.minDurationInSeconds
  ) {
    throw new Error(
      `${asset.id} is undersized: duration is below ${requirements.minDurationInSeconds}.`,
    );
  }
};

export const preflightProducerAssets = async ({
  manifest,
  rootDir = process.cwd(),
  execFileImpl = defaultProducerAssetExecFile,
}: {
  readonly manifest: unknown;
  readonly rootDir?: string;
  readonly execFileImpl?: ProducerAssetExecFile;
}): Promise<void> => {
  assertProducerAssetManifest(manifest);
  const absoluteRoot = path.resolve(rootDir);
  for (const asset of manifest.assets) {
    const filePath = path.resolve(absoluteRoot, asset.localPath);
    const relative = path.relative(absoluteRoot, filePath);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error(`${asset.id} resolves outside the repository.`);
    }
    let fileStat;
    try {
      fileStat = await stat(filePath);
    } catch {
      throw new Error(`${asset.id} is missing: ${asset.localPath}.`);
    }
    if (!fileStat.isFile()) throw new Error(`${asset.id} is not a regular file.`);
    const integrity = await calculateProducerAssetIntegrity(filePath);
    if (integrity.sizeInBytes !== asset.integrity.sizeInBytes) {
      throw new Error(`${asset.id} size does not match the asset manifest.`);
    }
    if (integrity.sha256 !== asset.integrity.sha256) {
      throw new Error(`${asset.id} checksum does not match the asset manifest.`);
    }
    const currentMedia = await probeProducerAssetMedia({
      kind: asset.kind,
      filePath,
      execFileImpl,
    });
    assertMediaMatches(asset, currentMedia);
    assertRequirements(asset);
    if (asset.kind === "video") {
      if (
        asset.media?.codec !== "h264" ||
        asset.media.pixelFormat !== "yuv420p" ||
        asset.media.constantFrameRate !== true ||
        (asset.media.audioCodec !== undefined && asset.media.audioCodec !== "aac")
      ) {
        throw new Error(`${asset.id} is not normalized to H.264/yuv420p/CFR/AAC.`);
      }
    }
  }
};

export const readProducerAssetManifest = async (filePath: string): Promise<ProducerAssetManifest> =>
  parseProducerAssetManifest(await readFile(filePath, "utf8"));
