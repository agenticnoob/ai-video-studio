export const producerVisualRenderModes = ["code-led", "asset-led", "hybrid"] as const;

export type ProducerVisualRenderMode = (typeof producerVisualRenderModes)[number];
export type ProducerVisualIntentReviewStatus = "draft" | "approved";

export type ProducerVisualIntent = {
  readonly sceneId: string;
  readonly subject: string;
  readonly action: string;
  readonly shotLanguage: string;
  readonly intendedMeaning: string;
  readonly primaryComposition: string;
  readonly silhouette: string;
  readonly renderMode: ProducerVisualRenderMode;
  readonly selectedCapabilities: readonly string[];
  readonly reviewStatus: ProducerVisualIntentReviewStatus;
  readonly intentionalComparison?: boolean;
};

const requireText = (value: string, label: string): void => {
  if (!value.trim()) throw new Error(`${label} must be non-empty.`);
};

export const validateProducerVisualIntents = ({
  compositionId,
  sceneIds,
  intents,
}: {
  readonly compositionId: string;
  readonly sceneIds: readonly string[];
  readonly intents: readonly ProducerVisualIntent[];
}): void => {
  requireText(compositionId, "compositionId");
  const expectedIds = [...sceneIds];
  const intentIds = intents.map((intent) => intent.sceneId);
  if (expectedIds.length === 0) {
    throw new Error(`${compositionId} creative contract must include at least one scene.`);
  }
  if (
    expectedIds.length !== intentIds.length ||
    expectedIds.some((sceneId, index) => sceneId !== intentIds[index])
  ) {
    throw new Error(
      `${compositionId} visual intent ids must exactly match scene ids in playback order.`,
    );
  }
  if (new Set(intentIds).size !== intentIds.length) {
    throw new Error(`${compositionId} visual intent ids must be unique.`);
  }

  for (const intent of intents) {
    for (const [label, value] of [
      ["subject", intent.subject],
      ["action", intent.action],
      ["shotLanguage", intent.shotLanguage],
      ["intendedMeaning", intent.intendedMeaning],
      ["primaryComposition", intent.primaryComposition],
      ["silhouette", intent.silhouette],
    ] as const) {
      requireText(value, `${compositionId}/${intent.sceneId} ${label}`);
      if (value.trim().toLowerCase().startsWith("replace with ")) {
        throw new Error(
          `${compositionId}/${intent.sceneId} ${label} still contains scaffold placeholder text.`,
        );
      }
    }
    if (!producerVisualRenderModes.includes(intent.renderMode)) {
      throw new Error(
        `${compositionId}/${intent.sceneId} has unsupported render mode: ${String(intent.renderMode)}.`,
      );
    }
    if (
      intent.selectedCapabilities.length === 0 ||
      intent.selectedCapabilities.some(
        (capability) =>
          !capability.trim() || capability.trim().toLowerCase().startsWith("replace-with-"),
      )
    ) {
      throw new Error(
        `${compositionId}/${intent.sceneId} must select at least one concrete capability.`,
      );
    }
    if (intent.reviewStatus !== "approved") {
      throw new Error(
        `${compositionId}/${intent.sceneId} visual intent must be explicitly approved before implementation.`,
      );
    }
  }

  for (let index = 1; index < intents.length; index += 1) {
    const previous = intents[index - 1];
    const current = intents[index];
    if (previous.intentionalComparison && current.intentionalComparison) continue;
    if (
      previous.primaryComposition.trim().toLowerCase() ===
      current.primaryComposition.trim().toLowerCase()
    ) {
      throw new Error(
        `${compositionId}/${current.sceneId} adjacent primary composition must differ from ${previous.sceneId}.`,
      );
    }
    if (previous.silhouette.trim().toLowerCase() === current.silhouette.trim().toLowerCase()) {
      throw new Error(
        `${compositionId}/${current.sceneId} adjacent silhouette must differ from ${previous.sceneId}.`,
      );
    }
  }
};

const producerSharedSourcePrefixes = [
  "src/remotion/primitives/",
  "src/remotion/catalog/",
  "src/remotion/effects/",
  "src/remotion/styles/",
  "src/remotion/transitions/",
  "src/remotion/media/",
  "src/remotion/motion/",
  "src/remotion/sound/",
  "src/remotion/standalone-video/",
  "src/remotion/producer-samples/",
] as const;

const isWithinPrefix = (value: string, prefix: string): boolean =>
  value === prefix.slice(0, -1) || value.startsWith(prefix);

const normalizeRepositoryPath = (value: string): string => {
  const segments: string[] = [];
  for (const segment of value.replaceAll("\\", "/").split("/")) {
    if (!segment || segment === ".") continue;
    if (segment === "..") {
      segments.pop();
      continue;
    }
    segments.push(segment);
  }
  return segments.join("/");
};

const getDirectory = (value: string): string => {
  const normalized = value.replaceAll("\\", "/");
  const slashIndex = normalized.lastIndexOf("/");
  return slashIndex === -1 ? "" : normalized.slice(0, slashIndex);
};

const collectProducerSourceImportSpecifiers = (
  source: string,
  includeTypeOnly: boolean,
): readonly string[] => {
  const results = new Set<string>();
  const staticPattern =
    /(?:import|export)\s+(?:type\s+)?(?:[^"'()]*?\s+from\s*)?["']([^"']+)["']/gu;
  const moduleCallPattern = /\b(?:import|require)\s*\(\s*([^)]*?)\s*\)/gu;
  for (const match of source.matchAll(staticPattern)) {
    if (!includeTypeOnly && /^(?:import|export)\s+type\b/u.test(match[0])) continue;
    if (match[1]) results.add(match[1]);
  }
  for (const match of source.matchAll(moduleCallPattern)) {
    const argument = match[1]?.trim() ?? "";
    const quote = argument[0];
    const isQuoted =
      (quote === '"' || quote === "'" || quote === "`") &&
      argument.length >= 2 &&
      argument.at(-1) === quote;
    if (!isQuoted || (quote === "`" && argument.includes("${"))) {
      throw new Error(
        "Producer renderer module calls must use a static string literal without interpolation.",
      );
    }
    results.add(argument.slice(1, -1));
  }
  return [...results];
};

export const getProducerSourceImportSpecifiers = (source: string): readonly string[] =>
  collectProducerSourceImportSpecifiers(source, true);

const getProducerRuntimeSourceImportSpecifiers = (source: string): readonly string[] =>
  collectProducerSourceImportSpecifiers(source, false);

const resolveProducerImport = (sourcePath: string, specifier: string): string =>
  specifier.startsWith(".")
    ? normalizeRepositoryPath(`${getDirectory(sourcePath)}/${specifier}`)
    : normalizeRepositoryPath(specifier);

export const validateProducerSourceBoundary = ({
  compositionId,
  rendererPath,
  source,
}: {
  readonly compositionId: string;
  readonly rendererPath: string;
  readonly source: string;
}): void => {
  const normalizedRendererPath = normalizeRepositoryPath(rendererPath);
  const ownRoot = `src/remotion/${compositionId}/`;
  if (!normalizedRendererPath.startsWith(ownRoot)) {
    throw new Error(`${compositionId} renderer source must live under ${ownRoot}.`);
  }

  for (const specifier of getProducerSourceImportSpecifiers(source)) {
    if (!specifier.startsWith(".") && !specifier.startsWith("src/remotion/")) continue;
    const resolved = resolveProducerImport(normalizedRendererPath, specifier);
    if (resolved.startsWith(ownRoot)) continue;
    if (producerSharedSourcePrefixes.some((prefix) => isWithinPrefix(resolved, prefix))) continue;
    if (resolved.startsWith("src/remotion/")) {
      throw new Error(
        `${compositionId} must not import dedicated composition source: ${specifier}.`,
      );
    }
    throw new Error(
      `${compositionId} renderer import must stay composition-local or use an approved Producer shared root: ${specifier}.`,
    );
  }
};

const producerSourceExtensions = [".ts", ".tsx", ".js", ".jsx", ".mjs"] as const;

const sourceCandidates = (resolvedPath: string): readonly string[] => {
  if (producerSourceExtensions.some((extension) => resolvedPath.endsWith(extension))) {
    return [resolvedPath];
  }
  if (/\.[a-z0-9]+$/iu.test(resolvedPath)) return [];
  return [
    ...producerSourceExtensions.map((extension) => `${resolvedPath}${extension}`),
    ...producerSourceExtensions.map((extension) => `${resolvedPath}/index${extension}`),
  ];
};

export const validateProducerSourceGraph = async ({
  compositionId,
  rendererPath,
  readSource,
}: {
  readonly compositionId: string;
  readonly rendererPath: string;
  readonly readSource: (path: string) => Promise<string | undefined>;
}): Promise<void> => {
  const ownRoot = `src/remotion/${compositionId}/`;
  const queue = [normalizeRepositoryPath(rendererPath)];
  const visited = new Set<string>();
  const cache = new Map<string, string>();

  while (queue.length > 0) {
    const sourcePath = queue.shift();
    if (!sourcePath || visited.has(sourcePath)) continue;
    const source = cache.get(sourcePath) ?? (await readSource(sourcePath));
    if (source === undefined) {
      throw new Error(`${compositionId} renderer dependency is missing: ${sourcePath}.`);
    }
    visited.add(sourcePath);
    validateProducerSourceBoundary({ compositionId, rendererPath: sourcePath, source });

    for (const specifier of getProducerRuntimeSourceImportSpecifiers(source)) {
      if (!specifier.startsWith(".") && !specifier.startsWith("src/remotion/")) continue;
      const resolved = resolveProducerImport(sourcePath, specifier);
      if (!resolved.startsWith(ownRoot)) continue;
      const candidates = sourceCandidates(resolved);
      let matchedPath: string | undefined;
      for (const candidate of candidates) {
        const candidateSource = await readSource(candidate);
        if (candidateSource === undefined) continue;
        cache.set(candidate, candidateSource);
        matchedPath = candidate;
        break;
      }
      if (candidates.length > 0 && !matchedPath) {
        throw new Error(
          `${compositionId} renderer dependency cannot be resolved: ${specifier} from ${sourcePath}.`,
        );
      }
      if (matchedPath && !visited.has(matchedPath)) queue.push(matchedPath);
    }
  }
};
