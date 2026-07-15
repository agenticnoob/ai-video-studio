type PcmWavData = {
  readonly bitsPerSample: 16;
  readonly blockAlign: number;
  readonly channels: number;
  readonly data: Buffer;
  readonly sampleRate: number;
};

const readAscii = (buffer: Buffer, offset: number, length: number): string =>
  buffer.toString("ascii", offset, offset + length);

const parsePcmWav = (buffer: Buffer): PcmWavData => {
  if (
    buffer.length < 44 ||
    readAscii(buffer, 0, 4) !== "RIFF" ||
    readAscii(buffer, 8, 4) !== "WAVE"
  ) {
    throw new Error("VoxCPM returned audio that is not a RIFF/WAVE file.");
  }

  let offset = 12;
  let audioFormat: number | undefined;
  let bitsPerSample: number | undefined;
  let blockAlign: number | undefined;
  let channels: number | undefined;
  let sampleRate: number | undefined;
  let data: Buffer | undefined;

  while (offset + 8 <= buffer.length) {
    const chunkId = readAscii(buffer, offset, 4);
    const chunkSize = buffer.readUInt32LE(offset + 4);
    const chunkStart = offset + 8;
    const chunkEnd = chunkStart + chunkSize;
    if (chunkEnd > buffer.length) throw new Error("VoxCPM returned a malformed WAV chunk.");

    if (chunkId === "fmt ") {
      if (chunkSize < 16) throw new Error("VoxCPM returned a malformed WAV fmt chunk.");
      audioFormat = buffer.readUInt16LE(chunkStart);
      channels = buffer.readUInt16LE(chunkStart + 2);
      sampleRate = buffer.readUInt32LE(chunkStart + 4);
      blockAlign = buffer.readUInt16LE(chunkStart + 12);
      bitsPerSample = buffer.readUInt16LE(chunkStart + 14);
    } else if (chunkId === "data") {
      data = buffer.subarray(chunkStart, chunkEnd);
    }
    offset = chunkEnd + (chunkSize % 2);
  }

  if (
    audioFormat !== 1 ||
    bitsPerSample !== 16 ||
    !channels ||
    !sampleRate ||
    !blockAlign ||
    !data ||
    blockAlign !== channels * 2 ||
    data.length % blockAlign !== 0
  ) {
    throw new Error("VoxCPM WAV output must be valid PCM 16-bit audio.");
  }

  return { bitsPerSample: 16, blockAlign, channels, data, sampleRate };
};

const encodePcmWav = (wav: PcmWavData): Buffer => {
  const buffer = Buffer.alloc(44 + wav.data.length);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + wav.data.length, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(wav.channels, 22);
  buffer.writeUInt32LE(wav.sampleRate, 24);
  buffer.writeUInt32LE(wav.sampleRate * wav.blockAlign, 28);
  buffer.writeUInt16LE(wav.blockAlign, 32);
  buffer.writeUInt16LE(wav.bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(wav.data.length, 40);
  buffer.set(wav.data, 44);
  return buffer;
};

const isFrameAudible = (wav: PcmWavData, frameIndex: number, threshold: number): boolean => {
  const frameOffset = frameIndex * wav.blockAlign;
  for (let channel = 0; channel < wav.channels; channel += 1) {
    if (Math.abs(wav.data.readInt16LE(frameOffset + channel * 2)) > threshold) return true;
  }
  return false;
};

export const trimPcmWavSilence = (
  buffer: Buffer,
  { paddingSeconds = 0.06, threshold = 384 } = {},
): Buffer => {
  const wav = parsePcmWav(buffer);
  const frameCount = wav.data.length / wav.blockAlign;
  let firstAudibleFrame = -1;
  let lastAudibleFrame = -1;

  for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
    if (isFrameAudible(wav, frameIndex, threshold)) {
      firstAudibleFrame = frameIndex;
      break;
    }
  }
  if (firstAudibleFrame < 0) throw new Error("VoxCPM WAV chunk contains no audible samples.");

  for (let frameIndex = frameCount - 1; frameIndex >= firstAudibleFrame; frameIndex -= 1) {
    if (isFrameAudible(wav, frameIndex, threshold)) {
      lastAudibleFrame = frameIndex;
      break;
    }
  }

  const paddingFrames = Math.round(wav.sampleRate * paddingSeconds);
  const startFrame = Math.max(0, firstAudibleFrame - paddingFrames);
  const endFrame = Math.min(frameCount, lastAudibleFrame + paddingFrames + 1);
  return encodePcmWav({
    ...wav,
    data: wav.data.subarray(startFrame * wav.blockAlign, endFrame * wav.blockAlign),
  });
};

export const concatenatePcmWavs = (buffers: readonly Buffer[]): Buffer => {
  if (buffers.length === 0) throw new Error("VoxCPM did not generate any audio chunks.");
  const wavs = buffers.map(parsePcmWav);
  const first = wavs[0];
  if (!first) throw new Error("VoxCPM did not generate any audio chunks.");
  for (const wav of wavs.slice(1)) {
    if (
      wav.bitsPerSample !== first.bitsPerSample ||
      wav.blockAlign !== first.blockAlign ||
      wav.channels !== first.channels ||
      wav.sampleRate !== first.sampleRate
    ) {
      throw new Error("VoxCPM generated WAV chunks with incompatible audio formats.");
    }
  }

  const data = Buffer.alloc(wavs.reduce((total, wav) => total + wav.data.length, 0));
  let offset = 0;
  for (const wav of wavs) {
    data.set(wav.data, offset);
    offset += wav.data.length;
  }
  return encodePcmWav({ ...first, data });
};

export const getPcmWavDurationSeconds = (buffer: Buffer): number => {
  const wav = parsePcmWav(buffer);
  const duration = wav.data.length / wav.blockAlign / wav.sampleRate;
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error("VoxCPM WAV duration must be positive.");
  }
  return duration;
};
