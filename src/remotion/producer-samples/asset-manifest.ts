export const producerAssetKinds = [
  "image",
  "video",
  "svg",
  "audio",
  "font",
  "lottie",
  "rive",
  "gltf",
  "texture",
] as const;

export type ProducerAssetKind = (typeof producerAssetKinds)[number];

export type ProducerAsset = {
  readonly id: string;
  readonly kind: ProducerAssetKind;
  readonly localPath: string;
  readonly purpose: string;
  readonly source: {
    readonly provider: string;
    readonly sourceUrl?: string;
    readonly sourceId?: string;
    readonly creator?: string;
    readonly license: string;
    readonly attribution?: string;
    readonly attributionRequired?: boolean;
  };
  readonly integrity: {
    readonly sha256: string;
    readonly sizeInBytes: number;
  };
  readonly media?: {
    readonly width?: number;
    readonly height?: number;
    readonly durationInSeconds?: number;
    readonly fps?: number;
    readonly codec?: string;
    readonly audioCodec?: string;
    readonly pixelFormat?: string;
    readonly sampleRate?: number;
    readonly constantFrameRate?: boolean;
  };
  readonly requirements?: {
    readonly minWidth?: number;
    readonly minHeight?: number;
    readonly minDurationInSeconds?: number;
  };
};

export type ProducerAssetManifest = {
  readonly version: 1;
  readonly compositionId: string;
  readonly slug: string;
  readonly assets: readonly ProducerAsset[];
};

const generationFieldNames = new Set(["model", "prompt", "seed", "workflow"]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const requireRecord = (value: unknown, label: string): Record<string, unknown> => {
  if (!isRecord(value)) throw new Error(`${label} must be an object.`);
  return value;
};

const requireText = (value: unknown, label: string): string => {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} must be non-empty text.`);
  }
  return value;
};

const optionalText = (value: unknown, label: string): string | undefined => {
  if (value === undefined) return undefined;
  return requireText(value, label);
};

const requirePositive = (value: unknown, label: string): number => {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a positive number.`);
  }
  return value;
};

const rejectGenerationFields = (value: unknown, path = "asset manifest"): void => {
  if (Array.isArray(value)) {
    value.forEach((item, index) => rejectGenerationFields(item, `${path}[${index}]`));
    return;
  }
  if (!isRecord(value)) return;
  for (const [key, nested] of Object.entries(value)) {
    if (generationFieldNames.has(key.toLowerCase())) {
      throw new Error(`${path} must not include generation field ${key}.`);
    }
    rejectGenerationFields(nested, `${path}.${key}`);
  }
};

const assertLocalPath = (localPath: string, slug: string, label: string): void => {
  if (
    localPath.startsWith("/") ||
    localPath.includes("\\") ||
    localPath.split("/").some((part) => part === "." || part === "..") ||
    /^https?:\/\//i.test(localPath)
  ) {
    throw new Error(`${label} must be a repository-relative local path.`);
  }
  const libraryPrefix = "public/assets/library/";
  const compositionPrefix = `public/generated/${slug}/assets/`;
  if (!localPath.startsWith(libraryPrefix) && !localPath.startsWith(compositionPrefix)) {
    throw new Error(`${label} must live under ${libraryPrefix} or ${compositionPrefix}.`);
  }
};

const assertMedia = (
  asset: Record<string, unknown>,
  kind: ProducerAssetKind,
  label: string,
): void => {
  const rawMedia = asset.media;
  if (["font", "gltf", "rive"].includes(kind) && rawMedia === undefined) return;
  const media = requireRecord(rawMedia, `${label}.media`);
  const widthKinds: readonly ProducerAssetKind[] = ["image", "svg", "video", "lottie", "texture"];
  if (widthKinds.includes(kind)) {
    requirePositive(media.width, `${label}.media.width`);
    requirePositive(media.height, `${label}.media.height`);
  }
  if (kind === "video" || kind === "audio" || kind === "lottie") {
    requirePositive(media.durationInSeconds, `${label}.media.durationInSeconds`);
  }
  if (kind === "video" || kind === "lottie") {
    requirePositive(media.fps, `${label}.media.fps`);
  }
  if (kind === "video") {
    requireText(media.codec, `${label}.media.codec`);
    requireText(media.pixelFormat, `${label}.media.pixelFormat`);
    if (media.constantFrameRate !== true) {
      throw new Error(`${label}.media.constantFrameRate must be true.`);
    }
    optionalText(media.audioCodec, `${label}.media.audioCodec`);
  }
  if (kind === "audio") {
    requireText(media.codec, `${label}.media.codec`);
    requirePositive(media.sampleRate, `${label}.media.sampleRate`);
  }
};

export const assertProducerAssetManifest: (
  value: unknown,
) => asserts value is ProducerAssetManifest = (value) => {
  rejectGenerationFields(value);
  const manifest = requireRecord(value, "asset manifest");
  if (manifest.version !== 1) throw new Error("asset manifest version must be 1.");
  requireText(manifest.compositionId, "asset manifest compositionId");
  const slug = requireText(manifest.slug, "asset manifest slug");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("asset manifest slug must be kebab-case.");
  }
  if (!Array.isArray(manifest.assets)) throw new Error("asset manifest assets must be an array.");

  const ids = new Set<string>();
  const paths = new Set<string>();
  const hashes = new Set<string>();
  manifest.assets.forEach((rawAsset, index) => {
    const asset = requireRecord(rawAsset, `assets[${index}]`);
    const id = requireText(asset.id, `assets[${index}].id`);
    if (ids.has(id)) throw new Error(`Duplicate producer asset id: ${id}.`);
    ids.add(id);
    if (!producerAssetKinds.includes(asset.kind as ProducerAssetKind)) {
      throw new Error(`${id} has unsupported asset kind: ${String(asset.kind)}.`);
    }
    const kind = asset.kind as ProducerAssetKind;
    const localPath = requireText(asset.localPath, `${id}.localPath`);
    assertLocalPath(localPath, slug, `${id}.localPath`);
    if (paths.has(localPath)) throw new Error(`Duplicate producer asset path: ${localPath}.`);
    paths.add(localPath);
    requireText(asset.purpose, `${id}.purpose`);

    const source = requireRecord(asset.source, `${id}.source`);
    requireText(source.provider, `${id}.source.provider`);
    requireText(source.license, `${id}.source.license`);
    const sourceUrl = optionalText(source.sourceUrl, `${id}.source.sourceUrl`);
    if (sourceUrl && !/^https?:\/\//i.test(sourceUrl)) {
      throw new Error(`${id}.source.sourceUrl must use HTTP(S).`);
    }
    optionalText(source.sourceId, `${id}.source.sourceId`);
    const creator = optionalText(source.creator, `${id}.source.creator`);
    const attribution = optionalText(source.attribution, `${id}.source.attribution`);
    if (
      source.attributionRequired !== undefined &&
      typeof source.attributionRequired !== "boolean"
    ) {
      throw new Error(`${id}.source.attributionRequired must be boolean.`);
    }
    if (source.attributionRequired === true && (!creator || !attribution)) {
      throw new Error(`${id} requires complete creator and attribution metadata.`);
    }

    const integrity = requireRecord(asset.integrity, `${id}.integrity`);
    const sha256 = requireText(integrity.sha256, `${id}.integrity.sha256`);
    if (!/^[a-f0-9]{64}$/.test(sha256)) {
      throw new Error(`${id}.integrity.sha256 must be a lowercase SHA-256 hash.`);
    }
    if (hashes.has(sha256)) throw new Error(`Duplicate producer asset checksum: ${sha256}.`);
    hashes.add(sha256);
    requirePositive(integrity.sizeInBytes, `${id}.integrity.sizeInBytes`);

    assertMedia(asset, kind, id);
    if (asset.requirements !== undefined) {
      const requirements = requireRecord(asset.requirements, `${id}.requirements`);
      for (const field of ["minWidth", "minHeight", "minDurationInSeconds"] as const) {
        if (requirements[field] !== undefined) {
          requirePositive(requirements[field], `${id}.requirements.${field}`);
        }
      }
    }
  });
};
