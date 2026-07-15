import type { ProducerAudioSummary, ProducerAudioTrack } from "./types";

export const serializeProducerAudioMetadata = ({
  header,
  exportName,
  typeImport,
  tracks,
}: {
  readonly header: string;
  readonly exportName: string;
  readonly typeImport: { readonly name: string; readonly path: string };
  readonly tracks: readonly ProducerAudioTrack[];
}): string =>
  `// ${header}\n\nimport type { ${typeImport.name} } from "${typeImport.path}";\n\nexport const ${exportName} = ${JSON.stringify(tracks, null, 2)} satisfies readonly ${typeImport.name}[];\n`;

export const updateProducerDurationConstant = ({
  source,
  constantName,
  durationInFrames,
}: {
  readonly source: string;
  readonly constantName: string;
  readonly durationInFrames: number;
}): string => {
  const escapedName = constantName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`export const ${escapedName} = \\d+;`, "g");
  const matches = source.match(pattern) ?? [];
  if (matches.length !== 1) {
    throw new Error(
      `Expected exactly one numeric assignment for ${constantName}; found ${matches.length}.`,
    );
  }
  return source.replace(pattern, `export const ${constantName} = ${durationInFrames};`);
};

export const buildProducerAudioSummary = ({
  compositionId,
  tracks,
}: {
  readonly compositionId: string;
  readonly tracks: readonly ProducerAudioTrack[];
}): ProducerAudioSummary => {
  const narratedSceneCount = tracks.filter((track) => track.provider === "voxcpm").length;
  return {
    compositionId,
    providers: narratedSceneCount > 0 ? ["voxcpm"] : [],
    sceneCount: tracks.length,
    narratedSceneCount,
    silentSceneCount: tracks.length - narratedSceneCount,
    totalDurationInFrames: tracks.reduce((total, track) => total + track.durationInFrames, 0),
  };
};
