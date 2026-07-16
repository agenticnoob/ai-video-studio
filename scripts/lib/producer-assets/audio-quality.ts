import type { ProducerAsset } from "../../../src/remotion/producer-samples/asset-manifest";
import { defaultProducerAssetExecFile } from "./metadata";
import type { ProducerAssetExecFile } from "./types";

const parsePeakDb = (output: string): number => {
  const match = /max_volume:\s*(-?inf|-?\d+(?:\.\d+)?)\s*dB/i.exec(output);
  if (!match || match[1].toLowerCase() === "-inf") {
    throw new Error("Audio peak analysis produced no finite max_volume value.");
  }
  return Number(match[1]);
};

const parseLongestSilence = (output: string): number => {
  const durations = Array.from(output.matchAll(/silence_duration:\s*(\d+(?:\.\d+)?)/gi)).map(
    (match) => Number(match[1]),
  );
  return durations.length === 0 ? 0 : Math.max(...durations);
};

export const analyzeProducerAudioQuality = async ({
  filePath,
  execFileImpl = defaultProducerAssetExecFile,
}: {
  readonly filePath: string;
  readonly execFileImpl?: ProducerAssetExecFile;
}): Promise<{ readonly peakDb: number; readonly longestSilenceSeconds: number }> => {
  const peak = await execFileImpl("ffmpeg", [
    "-hide_banner",
    "-nostats",
    "-i",
    filePath,
    "-map",
    "0:a:0",
    "-af",
    "volumedetect",
    "-f",
    "null",
    "-",
  ]);
  const silence = await execFileImpl("ffmpeg", [
    "-hide_banner",
    "-nostats",
    "-i",
    filePath,
    "-map",
    "0:a:0",
    "-af",
    "silencedetect=noise=-45dB:d=0.1",
    "-f",
    "null",
    "-",
  ]);
  return {
    peakDb: parsePeakDb(`${peak.stdout}\n${peak.stderr ?? ""}`),
    longestSilenceSeconds: parseLongestSilence(`${silence.stdout}\n${silence.stderr ?? ""}`),
  };
};

export const assertProducerAudioQuality = async ({
  asset,
  filePath,
  execFileImpl = defaultProducerAssetExecFile,
}: {
  readonly asset: ProducerAsset;
  readonly filePath: string;
  readonly execFileImpl?: ProducerAssetExecFile;
}): Promise<void> => {
  if (asset.kind !== "audio" || !asset.sound) return;
  const quality = await analyzeProducerAudioQuality({ filePath, execFileImpl });
  if (quality.peakDb > asset.sound.maxAllowedPeakDb) {
    throw new Error(
      `${asset.id} peak ${quality.peakDb.toFixed(2)} dB exceeds clipping limit ${asset.sound.maxAllowedPeakDb.toFixed(2)} dB.`,
    );
  }
  if (quality.longestSilenceSeconds > asset.sound.maxSilenceSeconds) {
    throw new Error(
      `${asset.id} silence ${quality.longestSilenceSeconds.toFixed(3)}s exceeds ${asset.sound.maxSilenceSeconds.toFixed(3)}s.`,
    );
  }
};
