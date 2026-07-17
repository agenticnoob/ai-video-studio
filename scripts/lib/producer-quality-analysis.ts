import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

import type { ProducerQualityGateInput, ProducerQualityPlan } from "./producer-quality-gates";

const concatenate = (chunks: readonly Uint8Array[]): Uint8Array => {
  const output = new Uint8Array(chunks.reduce((size, chunk) => size + chunk.byteLength, 0));
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return output;
};

const decode = (value: Uint8Array): string => new TextDecoder().decode(value);

const run = async (command: string, args: readonly string[]): Promise<Uint8Array> =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    const stdout: Uint8Array[] = [];
    const stderr: Uint8Array[] = [];
    child.stdout.on("data", (chunk: Uint8Array) => stdout.push(chunk));
    child.stderr.on("data", (chunk: Uint8Array) => stderr.push(chunk));
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve(concatenate(stdout));
      else reject(new Error(`${command} exited ${code}: ${decode(concatenate(stderr))}`));
    });
  });

const parseRate = (value: string | undefined): number | undefined => {
  if (!value) return undefined;
  const [numerator, denominator = 1] = value.split("/").map(Number);
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0)
    return undefined;
  return numerator / denominator;
};

const parseChapterStart = (value: unknown, fps: number): number => {
  if (typeof value !== "string") return Number.NaN;
  const match = /^(\d+):(\d{2}):(\d{1,2}(?:\.\d+)?)$/.exec(value);
  if (!match) return Number.NaN;
  const seconds = Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
  return Math.round(seconds * fps);
};

export const analyzeProducerReviewFrame = async ({
  frame,
  path,
}: {
  readonly frame: number;
  readonly path: string;
}): Promise<ProducerQualityGateInput["renderedReviewFrames"][number]> => {
  try {
    const pixels = await run("ffmpeg", [
      "-v",
      "error",
      "-i",
      path,
      "-vf",
      "scale=64:64,format=gray",
      "-frames:v",
      "1",
      "-f",
      "rawvideo",
      "pipe:1",
    ]);
    if (pixels.length !== 64 * 64) throw new Error("unexpected gray-frame byte length");
    const values = [...pixels];
    const meanLuma = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance =
      values.reduce((sum, value) => sum + (value - meanLuma) ** 2, 0) / values.length;
    return {
      frame,
      path,
      readable: true,
      meanLuma,
      lumaStandardDeviation: Math.sqrt(variance),
    };
  } catch {
    return {
      frame,
      path,
      readable: false,
      meanLuma: 0,
      lumaStandardDeviation: 0,
    };
  }
};

export const collectProducerQualityEvidence = async (
  plan: ProducerQualityPlan,
): Promise<ProducerQualityGateInput> => {
  const renderedReviewFrames = await Promise.all(plan.reviewFrames.map(analyzeProducerReviewFrame));
  const probe = JSON.parse(
    decode(
      await run("ffprobe", [
        "-v",
        "error",
        "-show_entries",
        "stream=codec_type,codec_name,width,height,avg_frame_rate:format=duration",
        "-of",
        "json",
        plan.artifact.mp4Path,
      ]),
    ),
  ) as {
    readonly streams?: readonly {
      readonly codec_type?: string;
      readonly codec_name?: string;
      readonly width?: number;
      readonly height?: number;
      readonly avg_frame_rate?: string;
    }[];
    readonly format?: { readonly duration?: string };
  };
  const video = probe.streams?.find((stream) => stream.codec_type === "video");
  const audio = probe.streams?.find((stream) => stream.codec_type === "audio");
  const metadata = JSON.parse(await readFile(plan.artifact.metadataPath, "utf8")) as {
    readonly duration?: number;
    readonly durationInFrames?: number;
    readonly fps?: number;
    readonly chapters?: readonly { readonly name?: string; readonly startTime?: string }[];
  };
  const repositoryArtifactPaths = plan.artifactPaths.filter((artifactPath) => {
    const relativePath = path.relative(process.cwd(), path.resolve(artifactPath));
    return !relativePath.startsWith("..") && !path.isAbsolute(relativePath);
  });
  const trackedOutput =
    repositoryArtifactPaths.length === 0
      ? ""
      : decode(await run("git", ["ls-files", "--", ...repositoryArtifactPaths]));

  return {
    ...plan,
    renderedReviewFrames,
    observedArtifact: {
      videoCodec: video?.codec_name,
      audioCodec: audio?.codec_name,
      width: video?.width,
      height: video?.height,
      fps: parseRate(video?.avg_frame_rate),
      durationSeconds: probe.format?.duration ? Number(probe.format.duration) : undefined,
      metadataDurationSeconds: metadata.duration,
      metadataDurationInFrames: metadata.durationInFrames,
      metadataFps: metadata.fps,
      chapters: (metadata.chapters ?? []).map((chapter) => ({
        name: chapter.name ?? "",
        startFrame: parseChapterStart(chapter.startTime, plan.artifact.expectedFps),
      })),
    },
    trackedArtifactPaths: trackedOutput.split("\n").filter(Boolean),
  };
};
