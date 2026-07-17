import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

import type { ProducerAsset } from "../../../src/remotion/producer-samples/asset-manifest";
import {
  isProducerStyleProfileId,
  producerStyleProfileIds,
} from "../../../src/remotion/styles/profile-ids";
import { assetLibraryKinds, type AssetLibraryItem, type AssetLibraryKind } from "./types";

const kindFacts: Record<
  AssetLibraryKind,
  { readonly extension: string; readonly mimeType: string }
> = {
  svg: { extension: "svg", mimeType: "image/svg+xml" },
  png: { extension: "png", mimeType: "image/png" },
  jpeg: { extension: "jpg", mimeType: "image/jpeg" },
  webp: { extension: "webp", mimeType: "image/webp" },
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const record = (value: unknown, label: string): Record<string, unknown> => {
  if (!isRecord(value)) throw new Error(`${label} must be an object.`);
  return value;
};

const text = (value: unknown, label: string): string => {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} must be non-empty.`);
  return value;
};

const optionalText = (value: unknown, label: string): string | undefined =>
  value === undefined ? undefined : text(value, label);

const positive = (value: unknown, label: string): number => {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a positive finite number.`);
  }
  return value;
};

const textArray = (value: unknown, label: string, allowEmpty = false): readonly string[] => {
  if (!Array.isArray(value) || (!allowEmpty && value.length === 0)) {
    throw new Error(`${label} must be a${allowEmpty ? "" : " non-empty"} string array.`);
  }
  return value.map((entry, index) => text(entry, `${label}[${index}]`));
};

export const assetLibraryFileName = (kind: AssetLibraryKind): string =>
  `asset.${kindFacts[kind].extension}`;

export const assetLibraryMimeType = (kind: AssetLibraryKind): string => kindFacts[kind].mimeType;

export const assertAssetLibraryItem: (value: unknown) => asserts value is AssetLibraryItem = (
  value,
) => {
  const item = record(value, "asset library item");
  if (item.version !== 1) throw new Error("asset library item version must be 1.");
  const id = text(item.id, "asset library item id");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(id)) {
    throw new Error(`${id} id must be kebab-case.`);
  }
  text(item.title, `${id}.title`);
  text(item.description, `${id}.description`);
  if (!assetLibraryKinds.includes(item.kind as AssetLibraryKind)) {
    throw new Error(`${id}.kind must be svg, png, jpeg, or webp.`);
  }
  const kind = item.kind as AssetLibraryKind;
  if (item.file !== assetLibraryFileName(kind)) {
    throw new Error(`${id}.file must be ${assetLibraryFileName(kind)}.`);
  }

  const semantics = record(item.semantics, `${id}.semantics`);
  textArray(semantics.subjects, `${id}.semantics.subjects`);
  textArray(semantics.keywords, `${id}.semantics.keywords`);
  textArray(semantics.roles, `${id}.semantics.roles`);
  textArray(semantics.recommendedUses, `${id}.semantics.recommendedUses`);
  textArray(semantics.avoidUses, `${id}.semantics.avoidUses`);
  const profileIds = textArray(semantics.styleProfileIds, `${id}.semantics.styleProfileIds`, true);
  const styleTags = textArray(semantics.styleTags, `${id}.semantics.styleTags`, true);
  if (profileIds.length === 0 && styleTags.length === 0) {
    throw new Error(`${id} requires a styleProfileId or styleTag.`);
  }
  for (const profileId of profileIds) {
    if (!isProducerStyleProfileId(profileId)) {
      throw new Error(
        `${id} has unknown style profile ${profileId}; expected ${producerStyleProfileIds.join(", ")}.`,
      );
    }
  }

  const visual = record(item.visual, `${id}.visual`);
  const width = positive(visual.width, `${id}.visual.width`);
  const height = positive(visual.height, `${id}.visual.height`);
  const aspectRatio = positive(visual.aspectRatio, `${id}.visual.aspectRatio`);
  if (Math.abs(aspectRatio - width / height) > 0.000001) {
    throw new Error(`${id}.visual.aspectRatio does not match width and height.`);
  }
  for (const color of textArray(visual.dominantColors, `${id}.visual.dominantColors`, true)) {
    if (!/^#[0-9a-f]{6}$/iu.test(color)) {
      throw new Error(`${id}.visual.dominantColors must contain six-digit hex colors.`);
    }
  }
  if (typeof visual.transparentBackground !== "boolean") {
    throw new Error(`${id}.visual.transparentBackground must be boolean.`);
  }

  const source = record(item.source, `${id}.source`);
  if (!["agent-authored", "user-provided", "url-import"].includes(String(source.kind))) {
    throw new Error(`${id}.source.kind is unsupported.`);
  }
  text(source.provider, `${id}.source.provider`);
  text(source.license, `${id}.source.license`);
  optionalText(source.creator, `${id}.source.creator`);
  optionalText(source.sourceId, `${id}.source.sourceId`);
  optionalText(source.attribution, `${id}.source.attribution`);
  if (typeof source.attributionRequired !== "boolean") {
    throw new Error(`${id}.source.attributionRequired must be boolean.`);
  }
  if (source.attributionRequired && (!source.creator || !source.attribution)) {
    throw new Error(`${id}.source requires creator and attribution.`);
  }
  if (source.kind === "agent-authored") {
    if (kind !== "svg") throw new Error(`${id} agent-authored v1 assets must be SVG.`);
    if (source.provider !== "repository") {
      throw new Error(`${id}.source.provider must be repository for agent-authored SVG.`);
    }
  }
  if (source.kind === "user-provided") {
    text(source.rightsBasis, `${id}.source.rightsBasis`);
  }
  if (source.kind === "url-import") {
    const sourceUrl = text(source.sourceUrl, `${id}.source.sourceUrl`);
    if (!/^https?:\/\//iu.test(sourceUrl)) {
      throw new Error(`${id}.source.sourceUrl must use HTTP(S).`);
    }
  }

  const integrity = record(item.integrity, `${id}.integrity`);
  const checksum = text(integrity.sha256, `${id}.integrity.sha256`);
  if (!/^[a-f0-9]{64}$/u.test(checksum)) {
    throw new Error(`${id}.integrity.sha256 must be a lowercase SHA-256 hash.`);
  }
  positive(integrity.sizeInBytes, `${id}.integrity.sizeInBytes`);
  if (integrity.mimeType !== assetLibraryMimeType(kind)) {
    throw new Error(`${id}.integrity.mimeType does not match ${kind}.`);
  }

  const lifecycle = record(item.lifecycle, `${id}.lifecycle`);
  if (lifecycle.status !== "active" && lifecycle.status !== "deprecated") {
    throw new Error(`${id}.lifecycle.status must be active or deprecated.`);
  }
  if (lifecycle.status === "deprecated") text(lifecycle.reason, `${id}.lifecycle.reason`);
};

const checksumFile = async (filePath: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);
    stream.on("data", (chunk) =>
      hash.update(typeof chunk === "string" ? chunk : new Uint8Array(chunk)),
    );
    stream.on("error", reject);
    stream.on("end", () => resolve(hash.digest("hex")));
  });

const inspectSvg = (source: string, label: string): { width: number; height: number } => {
  if (!/^\s*<svg\b/iu.test(source)) throw new Error(`${label} SVG has no root element.`);
  const unsafe: readonly [RegExp, string][] = [
    [/<\s*script\b/iu, "script"],
    [/<\s*foreignObject\b/iu, "foreignObject"],
    [/\son[a-z]+\s*=/iu, "event handler"],
    [/<!DOCTYPE|<!ENTITY/iu, "document entity"],
    [/<\s*(?:iframe|object|embed|link)\b/iu, "external element"],
    [/(?:href|xlink:href|src)\s*=\s*["']\s*(?:https?:|\/\/|javascript:|data:)/iu, "dangerous URL"],
    [
      /(?:@import|@font-face|url\(\s*["']?\s*(?:https?:|\/\/|javascript:|data:))/iu,
      "external style resource",
    ],
  ];
  for (const [pattern, reason] of unsafe) {
    if (pattern.test(source)) throw new Error(`${label} SVG contains ${reason}.`);
  }
  const dimension = (name: "width" | "height"): number | undefined => {
    const raw = new RegExp(`\\b${name}=["']([^"']+)["']`, "iu").exec(source)?.[1];
    if (!raw) return undefined;
    const value = Number(raw.replace(/px$/iu, ""));
    return Number.isFinite(value) && value > 0 ? value : undefined;
  };
  const viewBox = /\bviewBox=["']([^"']+)["']/iu
    .exec(source)?.[1]
    ?.trim()
    .split(/[\s,]+/u)
    .map(Number);
  const width = dimension("width") ?? (viewBox?.length === 4 ? viewBox[2] : undefined);
  const height = dimension("height") ?? (viewBox?.length === 4 ? viewBox[3] : undefined);
  if (!width || !height || width <= 0 || height <= 0) {
    throw new Error(`${label} SVG must declare positive dimensions.`);
  }
  return { width, height };
};

const inspectPng = (bytes: Buffer, label: string): { width: number; height: number } => {
  if (
    bytes.length < 45 ||
    bytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a" ||
    bytes.subarray(12, 16).toString("ascii") !== "IHDR" ||
    bytes.subarray(bytes.length - 8, bytes.length - 4).toString("ascii") !== "IEND"
  ) {
    throw new Error(`${label} PNG signature or header is invalid.`);
  }
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (!width || !height) throw new Error(`${label} PNG dimensions are invalid.`);
  return { width, height };
};

const inspectJpeg = (bytes: Buffer, label: string): { width: number; height: number } => {
  if (
    bytes.length < 12 ||
    bytes[0] !== 0xff ||
    bytes[1] !== 0xd8 ||
    bytes[bytes.length - 2] !== 0xff ||
    bytes[bytes.length - 1] !== 0xd9
  ) {
    throw new Error(`${label} JPEG signature is invalid.`);
  }
  let offset = 2;
  while (offset + 8 < bytes.length) {
    if (bytes[offset] !== 0xff) break;
    const marker = bytes[offset + 1];
    if (
      [0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(
        marker,
      )
    ) {
      const height = bytes.readUInt16BE(offset + 5);
      const width = bytes.readUInt16BE(offset + 7);
      if (!width || !height) break;
      return { width, height };
    }
    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
    } else {
      const length = bytes.readUInt16BE(offset + 2);
      if (length < 2) break;
      offset += 2 + length;
    }
  }
  throw new Error(`${label} JPEG has no readable frame dimensions.`);
};

const readUInt24LE = (bytes: Buffer, offset: number): number =>
  bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);

const inspectWebp = (bytes: Buffer, label: string): { width: number; height: number } => {
  if (
    bytes.length < 30 ||
    bytes.subarray(0, 4).toString("ascii") !== "RIFF" ||
    bytes.subarray(8, 12).toString("ascii") !== "WEBP" ||
    bytes.readUInt32LE(4) !== bytes.length - 8
  ) {
    throw new Error(`${label} WebP RIFF header is invalid.`);
  }
  const chunk = bytes.subarray(12, 16).toString("ascii");
  if (chunk !== "VP8X" || bytes.readUInt32LE(16) < 10) {
    throw new Error(`${label} WebP must expose a complete VP8X dimensions header.`);
  }
  return { width: readUInt24LE(bytes, 24) + 1, height: readUInt24LE(bytes, 27) + 1 };
};

export const inspectAssetLibraryFile = async (
  filePath: string,
  kind: AssetLibraryKind,
  label = path.basename(path.dirname(filePath)) || filePath,
): Promise<{
  readonly width: number;
  readonly height: number;
  readonly sha256: string;
  readonly sizeInBytes: number;
  readonly mimeType: string;
}> => {
  const fileStat = await stat(filePath).catch(() => undefined);
  if (!fileStat?.isFile() || fileStat.size <= 0) throw new Error(`${label} asset file is missing.`);
  const bytes = await readFile(filePath);
  const dimensions =
    kind === "svg"
      ? inspectSvg(bytes.toString("utf8"), label)
      : kind === "png"
        ? inspectPng(bytes, label)
        : kind === "jpeg"
          ? inspectJpeg(bytes, label)
          : inspectWebp(bytes, label);
  return {
    ...dimensions,
    sha256: await checksumFile(filePath),
    sizeInBytes: fileStat.size,
    mimeType: assetLibraryMimeType(kind),
  };
};

export const serializeAssetLibraryItem = (item: AssetLibraryItem): string => {
  assertAssetLibraryItem(item);
  return `${JSON.stringify(item, null, 2)}\n`;
};

export const validateAssetLibraryItemDirectory = async (
  itemDir: string,
  expectedId = path.basename(itemDir),
): Promise<AssetLibraryItem> => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(expectedId)) {
    throw new Error(`${expectedId} item directory must be kebab-case.`);
  }
  const entries = (await readdir(itemDir, { withFileTypes: true }))
    .map((entry) => entry.name)
    .sort();
  if (!entries.includes("asset.json")) throw new Error(`${expectedId} is missing asset.json.`);
  const raw = JSON.parse(await readFile(path.join(itemDir, "asset.json"), "utf8")) as unknown;
  assertAssetLibraryItem(raw);
  if (raw.id !== expectedId) throw new Error(`${expectedId} directory does not match metadata id.`);
  const expectedEntries = ["asset.json", raw.file].sort();
  if (JSON.stringify(entries) !== JSON.stringify(expectedEntries)) {
    throw new Error(`${expectedId} must contain exactly asset.json and ${raw.file}.`);
  }
  const current = await inspectAssetLibraryFile(path.join(itemDir, raw.file), raw.kind, raw.id);
  if (current.sha256 !== raw.integrity.sha256) throw new Error(`${raw.id} checksum drift.`);
  if (current.sizeInBytes !== raw.integrity.sizeInBytes) throw new Error(`${raw.id} size drift.`);
  if (current.mimeType !== raw.integrity.mimeType) throw new Error(`${raw.id} MIME drift.`);
  if (current.width !== raw.visual.width || current.height !== raw.visual.height) {
    throw new Error(`${raw.id} dimensions drift.`);
  }
  return raw;
};

export const validateAssetLibrary = async ({
  rootDir = process.cwd(),
}: {
  readonly rootDir?: string;
} = {}): Promise<readonly AssetLibraryItem[]> => {
  const itemsRoot = path.join(rootDir, "public/assets/library/items");
  const entries = await readdir(itemsRoot, { withFileTypes: true }).catch(
    (error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") return [];
      throw error;
    },
  );
  const items: AssetLibraryItem[] = [];
  const checksums = new Set<string>();
  for (const entry of entries
    .filter((value) => value.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name))) {
    const item = await validateAssetLibraryItemDirectory(
      path.join(itemsRoot, entry.name),
      entry.name,
    );
    if (checksums.has(item.integrity.sha256)) {
      throw new Error(`${item.id} has a duplicate library checksum.`);
    }
    checksums.add(item.integrity.sha256);
    items.push(item);
  }
  if (entries.some((entry) => !entry.isDirectory())) {
    throw new Error("Asset library items/ may contain item directories only.");
  }
  return items;
};

export const validateProducerAssetLibraryReference = async ({
  asset,
  rootDir = process.cwd(),
}: {
  readonly asset: ProducerAsset;
  readonly rootDir?: string;
}): Promise<void> => {
  if (!asset.localPath.startsWith("public/assets/library/items/")) return;
  const match =
    /^public\/assets\/library\/items\/([a-z0-9]+(?:-[a-z0-9]+)*)\/(asset\.(?:svg|png|jpg|webp))$/u.exec(
      asset.localPath,
    );
  if (!match) throw new Error(`${asset.id} library path drift.`);
  const [, id, file] = match;
  const itemDir = path.join(rootDir, "public/assets/library/items", id);
  let item: AssetLibraryItem;
  try {
    item = await validateAssetLibraryItemDirectory(itemDir, id);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(`${asset.id} library item is missing.`);
    }
    throw error;
  }
  if (item.lifecycle.status === "deprecated")
    throw new Error(`${asset.id} library item is deprecated.`);
  if (asset.id !== item.id || file !== item.file)
    throw new Error(`${asset.id} library path drift.`);
  const expectedKind = item.kind === "svg" ? "svg" : "image";
  if (asset.kind !== expectedKind) throw new Error(`${asset.id} library kind drift.`);
  if (asset.integrity.sha256 !== item.integrity.sha256) {
    throw new Error(`${asset.id} library checksum drift.`);
  }
  if (asset.integrity.sizeInBytes !== item.integrity.sizeInBytes) {
    throw new Error(`${asset.id} library size drift.`);
  }
  if (asset.media?.width !== item.visual.width || asset.media?.height !== item.visual.height) {
    throw new Error(`${asset.id} library media drift.`);
  }
  for (const field of [
    "provider",
    "creator",
    "license",
    "attribution",
    "attributionRequired",
  ] as const) {
    if (asset.source[field] !== item.source[field]) {
      throw new Error(`${asset.id} library source ${field} drift.`);
    }
  }
  if (
    asset.source.sourceUrl !== item.source.sourceUrl ||
    asset.source.sourceId !== item.source.sourceId
  ) {
    throw new Error(`${asset.id} library source reference drift.`);
  }
};
