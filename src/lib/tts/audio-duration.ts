import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export const probeAudioDurationSeconds = async (absoluteAudioPath: string): Promise<number> => {
  const { stdout } = await execFileAsync(
    "ffprobe",
    [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      absoluteAudioPath,
    ],
    { timeout: 15_000 },
  );

  const duration = Number(stdout.trim());
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error(`Could not read a positive audio duration from ${absoluteAudioPath}.`);
  }

  return duration;
};
