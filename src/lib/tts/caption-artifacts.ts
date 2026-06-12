import { writeFile } from "node:fs/promises";
import path from "node:path";

import type { SegmentNarrationAsset } from "../narration-asset-schema";

export type SegmentCaptionArtifactInput = {
  audioOutputPath: string;
  audioSrc: string;
  captions: SegmentNarrationAsset["captions"];
  durationInFrames: number;
  durationInSeconds: number;
  provider: string;
  segmentId: string;
  text: string;
  voiceId?: string;
};

export const getCaptionArtifactOutputPath = (audioOutputPath: string): string => {
  const parsedPath = path.parse(audioOutputPath);
  return path.join(parsedPath.dir, `${parsedPath.name}.captions.json`);
};

export const writeSegmentCaptionArtifact = async ({
  audioOutputPath,
  audioSrc,
  captions,
  durationInFrames,
  durationInSeconds,
  provider,
  segmentId,
  text,
  voiceId,
}: SegmentCaptionArtifactInput): Promise<void> => {
  const captionOutputPath = getCaptionArtifactOutputPath(audioOutputPath);
  await writeFile(
    captionOutputPath,
    `${JSON.stringify(
      {
        segmentId,
        text,
        audio: {
          src: audioSrc,
          durationInFrames,
          durationInSeconds,
          provider,
          voiceId,
        },
        captions,
      },
      null,
      2,
    )}\n`,
  );
};
