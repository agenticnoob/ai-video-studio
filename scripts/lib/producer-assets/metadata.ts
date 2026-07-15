import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { promisify } from "node:util";

import type { ProducerAssetKind } from "../../../src/remotion/producer-samples/asset-manifest";
import type { ProducerAssetExecFile, ProducerAssetMedia } from "./types";

const execFileAsync = promisify(execFile);

export const defaultProducerAssetExecFile: ProducerAssetExecFile = async (file, args) => {
  const result = await execFileAsync(file, [...args], { encoding: "utf8" });
  return { stdout: result.stdout, stderr: result.stderr };
};

const positiveNumber = (value: unknown): number | undefined => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

const parseRational = (value: unknown): number | undefined => {
  if (typeof value !== "string" || !value.trim()) return positiveNumber(value);
  const [numerator, denominator] = value.split("/").map(Number);
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return undefined;
  }
  return positiveNumber(numerator / denominator);
};

const parseSvgLength = (value: string | undefined): number | undefined => {
  if (!value) return undefined;
  return positiveNumber(value.trim().replace(/px$/i, ""));
};

const probeSvg = async (filePath: string): Promise<ProducerAssetMedia> => {
  const source = await readFile(filePath, "utf8");
  if (!/<svg\b/i.test(source)) throw new Error("SVG asset has no <svg> root element.");
  const width = parseSvgLength(/\bwidth=["']([^"']+)["']/i.exec(source)?.[1]);
  const height = parseSvgLength(/\bheight=["']([^"']+)["']/i.exec(source)?.[1]);
  const viewBox = /\bviewBox=["']([^"']+)["']/i
    .exec(source)?.[1]
    ?.trim()
    .split(/[\s,]+/)
    .map(Number);
  const viewBoxWidth = viewBox?.length === 4 ? positiveNumber(viewBox[2]) : undefined;
  const viewBoxHeight = viewBox?.length === 4 ? positiveNumber(viewBox[3]) : undefined;
  const resolvedWidth = width ?? viewBoxWidth;
  const resolvedHeight = height ?? viewBoxHeight;
  if (!resolvedWidth || !resolvedHeight) {
    throw new Error("SVG asset must declare positive width/height or viewBox dimensions.");
  }
  return { width: resolvedWidth, height: resolvedHeight, codec: "svg" };
};

const probeLottie = async (filePath: string): Promise<ProducerAssetMedia> => {
  const parsed = JSON.parse(await readFile(filePath, "utf8")) as Record<string, unknown>;
  const width = positiveNumber(parsed.w);
  const height = positiveNumber(parsed.h);
  const fps = positiveNumber(parsed.fr);
  const inPoint = typeof parsed.ip === "number" ? parsed.ip : Number(parsed.ip);
  const outPoint = typeof parsed.op === "number" ? parsed.op : Number(parsed.op);
  if (!width || !height || !fps || !Number.isFinite(inPoint) || !Number.isFinite(outPoint)) {
    throw new Error("Lottie asset must declare positive w, h, fr, ip, and op metadata.");
  }
  const durationInSeconds = positiveNumber((outPoint - inPoint) / fps);
  if (!durationInSeconds) throw new Error("Lottie asset duration must be positive.");
  return { width, height, fps, durationInSeconds, codec: "lottie-json" };
};

type FfprobeStream = {
  readonly avg_frame_rate?: string;
  readonly codec_name?: string;
  readonly codec_type?: string;
  readonly duration?: string;
  readonly height?: number;
  readonly pix_fmt?: string;
  readonly r_frame_rate?: string;
  readonly sample_rate?: string;
  readonly width?: number;
};

const probeWithFfprobe = async (
  kind: ProducerAssetKind,
  filePath: string,
  execFileImpl: ProducerAssetExecFile,
): Promise<ProducerAssetMedia> => {
  const { stdout } = await execFileImpl("ffprobe", [
    "-v",
    "error",
    "-print_format",
    "json",
    "-show_streams",
    "-show_format",
    filePath,
  ]);
  const parsed = JSON.parse(stdout) as {
    readonly streams?: readonly FfprobeStream[];
    readonly format?: { readonly duration?: string };
  };
  const streams = parsed.streams ?? [];
  const video = streams.find((stream) => stream.codec_type === "video");
  const audio = streams.find((stream) => stream.codec_type === "audio");
  if (kind === "image" || kind === "texture") {
    if (!video?.width || !video.height)
      throw new Error(`${kind} asset has no readable image stream.`);
    return {
      width: video.width,
      height: video.height,
      codec: video.codec_name,
      pixelFormat: video.pix_fmt,
    };
  }
  if (kind === "audio") {
    if (!audio) throw new Error("Audio asset has no readable audio stream.");
    const durationInSeconds =
      positiveNumber(audio.duration) ?? positiveNumber(parsed.format?.duration);
    const sampleRate = positiveNumber(audio.sample_rate);
    if (!durationInSeconds || !sampleRate || !audio.codec_name) {
      throw new Error("Audio asset is missing duration, sample rate, or codec metadata.");
    }
    return { durationInSeconds, sampleRate, codec: audio.codec_name };
  }
  if (!video?.width || !video.height || !video.codec_name || !video.pix_fmt) {
    throw new Error("Video asset has no readable video stream.");
  }
  const durationInSeconds =
    positiveNumber(video.duration) ?? positiveNumber(parsed.format?.duration);
  const averageFps = parseRational(video.avg_frame_rate);
  const realFps = parseRational(video.r_frame_rate);
  if (!durationInSeconds || !averageFps || !realFps) {
    throw new Error("Video asset is missing duration or frame-rate metadata.");
  }
  return {
    width: video.width,
    height: video.height,
    durationInSeconds,
    fps: averageFps,
    codec: video.codec_name,
    audioCodec: audio?.codec_name,
    pixelFormat: video.pix_fmt,
    constantFrameRate: Math.abs(averageFps - realFps) < 0.0001,
  };
};

export const probeProducerAssetMedia = async ({
  kind,
  filePath,
  execFileImpl = defaultProducerAssetExecFile,
}: {
  readonly kind: ProducerAssetKind;
  readonly filePath: string;
  readonly execFileImpl?: ProducerAssetExecFile;
}): Promise<ProducerAssetMedia | undefined> => {
  if (kind === "svg") return probeSvg(filePath);
  if (kind === "lottie") return probeLottie(filePath);
  if (["image", "video", "audio", "texture"].includes(kind)) {
    return probeWithFfprobe(kind, filePath, execFileImpl);
  }
  return undefined;
};

export const calculateProducerAssetIntegrity = async (
  filePath: string,
): Promise<{ readonly sha256: string; readonly sizeInBytes: number }> => {
  const fileStat = await stat(filePath);
  if (!fileStat.isFile() || fileStat.size <= 0) {
    throw new Error(`Producer asset must be a non-empty regular file: ${filePath}`);
  }
  const sha256 = await new Promise<string>((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);
    stream.on("data", (chunk) =>
      hash.update(typeof chunk === "string" ? chunk : new Uint8Array(chunk)),
    );
    stream.on("error", reject);
    stream.on("end", () => resolve(hash.digest("hex")));
  });
  return { sha256, sizeInBytes: fileStat.size };
};
