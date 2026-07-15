import type {
  ProducerAsset,
  ProducerAssetKind,
} from "../../../src/remotion/producer-samples/asset-manifest";

export type ProducerAssetAcquisition =
  | { readonly type: "manual"; readonly sourcePath: string }
  | { readonly type: "url"; readonly url: string };

export type ProducerAssetSupplyRequest = Pick<
  ProducerAsset,
  "id" | "kind" | "purpose" | "source" | "requirements"
> & {
  readonly acquisition: ProducerAssetAcquisition;
  readonly destination: {
    readonly scope: "library" | "composition";
    readonly fileName: string;
  };
};

export type ProducerAssetSupplyPlan = {
  readonly version: 1;
  readonly compositionId: string;
  readonly slug: string;
  readonly outputManifestPath: string;
  readonly assets: readonly ProducerAssetSupplyRequest[];
};

export type ProducerAssetMedia = NonNullable<ProducerAsset["media"]>;

export type ProducerAssetExecFile = (
  file: string,
  args: readonly string[],
) => Promise<{ readonly stdout: string; readonly stderr?: string }>;

export type ProducerAssetFetch = (
  input: string | URL,
  init?: RequestInit,
) => Promise<Pick<Response, "arrayBuffer" | "ok" | "status">>;

export const mediaKindsUsingFfprobe: readonly ProducerAssetKind[] = [
  "image",
  "video",
  "audio",
  "texture",
];
