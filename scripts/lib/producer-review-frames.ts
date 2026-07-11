import path from "node:path";

import type { ProducerSampleManifest } from "../../src/remotion/producer-samples/manifest";

export type ProducerReviewFrameJob = {
  readonly compositionId: string;
  readonly frame: number;
  readonly label: string;
  readonly purpose: string;
  readonly outputPath: string;
  readonly args: readonly string[];
};

export const slugifyReviewFrameLabel = (label: string): string =>
  label
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "review";

export const buildProducerReviewFrameJobs = ({
  manifest,
  entrypoint = "src/remotion/index.ts",
  outputRoot = "out",
  scale = 0.5,
}: {
  readonly manifest: ProducerSampleManifest;
  readonly entrypoint?: string;
  readonly outputRoot?: string;
  readonly scale?: number;
}): readonly ProducerReviewFrameJob[] => {
  if (manifest.reviewFrames.length === 0) {
    throw new Error(`${manifest.compositionId} must declare at least one review frame.`);
  }
  const outputs = new Set<string>();
  return manifest.reviewFrames.map((reviewFrame) => {
    if (!Number.isInteger(reviewFrame.frame) || reviewFrame.frame < 0) {
      throw new Error(`${manifest.compositionId} has a negative or invalid review frame.`);
    }
    const filename = `frame-${String(reviewFrame.frame).padStart(5, "0")}-${slugifyReviewFrameLabel(reviewFrame.label)}.png`;
    const outputPath = path.posix.join(outputRoot, manifest.slug, "review-frames", filename);
    if (outputs.has(outputPath)) throw new Error(`Duplicate review-frame output: ${outputPath}`);
    outputs.add(outputPath);
    return {
      compositionId: manifest.compositionId,
      frame: reviewFrame.frame,
      label: reviewFrame.label,
      purpose: reviewFrame.purpose,
      outputPath,
      args: [
        "remotion",
        "still",
        entrypoint,
        manifest.compositionId,
        outputPath,
        `--frame=${reviewFrame.frame}`,
        `--scale=${scale}`,
      ],
    };
  });
};
