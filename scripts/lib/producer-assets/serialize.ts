import {
  assertProducerAssetManifest,
  type ProducerAssetManifest,
} from "../../../src/remotion/producer-samples/asset-manifest";

export const parseProducerAssetManifest = (source: string): ProducerAssetManifest => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch (error) {
    throw new Error(`Producer asset manifest is not valid JSON: ${String(error)}`);
  }
  assertProducerAssetManifest(parsed);
  return parsed;
};

export const serializeProducerAssetManifest = (manifest: ProducerAssetManifest): string => {
  assertProducerAssetManifest(manifest);
  return `${JSON.stringify(manifest, null, 2)}\n`;
};
