import path from "node:path";

import {
  assertProducerSampleManifest,
  type MaintainedProducerSampleManifest,
  type ProducerSampleManifest,
} from "../../src/remotion/producer-samples/manifest";

export type ProducerRenderJob = {
  readonly kind: "video" | "cover-16x9" | "cover-9x16";
  readonly command: string;
  readonly args: readonly string[];
  readonly outputPaths: readonly string[];
};

export const buildProducerRenderJobs = ({
  execution = "host",
  manifest,
  entrypoint = "src/remotion/index.ts",
  outputRoot = "out",
}: {
  readonly execution?: "host" | "producer-container";
  readonly manifest: ProducerSampleManifest;
  readonly entrypoint?: string;
  readonly outputRoot?: string;
}): readonly ProducerRenderJob[] => {
  assertProducerSampleManifest(manifest);
  if (manifest.sampleStatus !== "maintained") {
    throw new Error(
      `${manifest.compositionId} is a frozen reference and cannot use producer:render.`,
    );
  }

  const maintainedManifest: MaintainedProducerSampleManifest = manifest;
  const sampleOutputRoot = path.posix.join(outputRoot, maintainedManifest.slug);
  const mp4Path = path.posix.join(sampleOutputRoot, `${maintainedManifest.slug}.mp4`);
  const finalMetadataPath = path.posix.join(sampleOutputRoot, `${maintainedManifest.slug}.json`);
  const cover16x9Path = path.posix.join(
    sampleOutputRoot,
    `${maintainedManifest.slug}-cover-16x9.png`,
  );
  const cover9x16Path = path.posix.join(
    sampleOutputRoot,
    `${maintainedManifest.slug}-cover-9x16.png`,
  );
  const coverCommand = execution === "producer-container" ? "npx" : "docker";
  const coverPrefix =
    execution === "producer-container"
      ? ["remotion", "still"]
      : ["compose", "run", "--rm", "producer", "npx", "remotion", "still"];

  return [
    {
      kind: "video",
      command: "bash",
      args: [
        "scripts/render-video.sh",
        maintainedManifest.compositionId,
        maintainedManifest.slug,
        maintainedManifest.render.metadataPath,
      ],
      outputPaths: [mp4Path, finalMetadataPath],
    },
    {
      kind: "cover-16x9",
      command: coverCommand,
      args: [
        ...coverPrefix,
        entrypoint,
        maintainedManifest.render.cover16x9CompositionId,
        cover16x9Path,
      ],
      outputPaths: [cover16x9Path],
    },
    {
      kind: "cover-9x16",
      command: coverCommand,
      args: [
        ...coverPrefix,
        entrypoint,
        maintainedManifest.render.cover9x16CompositionId,
        cover9x16Path,
      ],
      outputPaths: [cover9x16Path],
    },
  ];
};
