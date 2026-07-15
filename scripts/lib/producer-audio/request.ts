import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { SegmentCaptions } from "../../../src/remotion/standalone-video/caption-types";
import { buildProducerCaptionCues, splitProducerNarrationText } from "./captions";
import { readProducerVoxcpmConfig, type ProducerVoxcpmConfig } from "./config";
import type { ProducerVoxcpmRequestPlan } from "./types";
import { concatenatePcmWavs, getPcmWavDurationSeconds, trimPcmWavSilence } from "./wav";

export type ProducerNarrationAsset = {
  readonly audioSrc: string;
  readonly captions: SegmentCaptions;
  readonly durationInFrames: number;
  readonly durationInSeconds: number;
  readonly format: "wav";
  readonly outputPath: string;
  readonly provider: "voxcpm";
};

type PreparedReferences = {
  readonly promptAudio?: Buffer;
  readonly promptText?: string;
  readonly referenceAudio?: Buffer;
  readonly promptAudioName?: string;
  readonly referenceAudioName?: string;
};

const safeNamePattern = /^[a-z0-9][a-z0-9_-]*$/i;

const assertSafeName = (value: string, label: string): string => {
  if (!safeNamePattern.test(value))
    throw new Error(`${label} must use letters, numbers, hyphens, or underscores.`);
  return value;
};

const resolveCloneFile = (rootDir: string, filePath: string): string => {
  const cloneRoot = path.resolve(rootDir, "voices", "clone");
  const absolutePath = path.isAbsolute(filePath)
    ? path.resolve(filePath)
    : path.resolve(rootDir, filePath);
  const relative = path.relative(cloneRoot, absolutePath);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Private VoxCPM references must be files under ${cloneRoot}.`);
  }
  return absolutePath;
};

const audioMimeType = (filePath: string): string => {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".mp3") return "audio/mpeg";
  if (extension === ".m4a") return "audio/mp4";
  if (extension === ".aac") return "audio/aac";
  return "audio/wav";
};

const audioBlob = (buffer: Buffer, filePath: string): Blob =>
  new Blob([Uint8Array.from(buffer)], { type: audioMimeType(filePath) });

const prepareReferences = async (
  plan: ProducerVoxcpmRequestPlan,
  rootDir: string,
): Promise<PreparedReferences> => {
  if (plan.mode === "voice-design") return {};
  if (plan.mode === "controllable-clone") {
    const referencePath = resolveCloneFile(rootDir, plan.referenceAudioPath);
    return {
      referenceAudio: await readFile(referencePath),
      referenceAudioName: path.basename(referencePath),
    };
  }

  const promptPath = resolveCloneFile(rootDir, plan.promptAudioPath);
  const transcriptPath = resolveCloneFile(rootDir, plan.promptTranscriptPath);
  const referencePath = resolveCloneFile(rootDir, plan.referenceAudioPath ?? plan.promptAudioPath);
  const promptText = (await readFile(transcriptPath, "utf8")).trim();
  if (!promptText) throw new Error("VoxCPM high-fidelity transcript file is empty.");
  return {
    promptAudio: await readFile(promptPath),
    promptAudioName: path.basename(promptPath),
    promptText,
    referenceAudio: await readFile(referencePath),
    referenceAudioName: path.basename(referencePath),
  };
};

const appendTuningFields = (form: FormData, config: ProducerVoxcpmConfig): void => {
  form.set("cfg_value", String(config.cfgValue));
  form.set("inference_timesteps", String(config.inferenceTimesteps));
  form.set("normalize", String(config.normalize));
  form.set("denoise", String(config.denoise));
  form.set("retry_badcase", String(config.retryBadcase));
  form.set("save", String(config.save));
  form.set("filename_prefix", config.filenamePrefix);
};

const createRequest = ({
  chunk,
  config,
  plan,
  references,
}: {
  readonly chunk: string;
  readonly config: ProducerVoxcpmConfig;
  readonly plan: ProducerVoxcpmRequestPlan;
  readonly references: PreparedReferences;
}): { readonly endpoint: string; readonly init: RequestInit } => {
  if (plan.mode === "voice-design") {
    const text = plan.control ? `(${plan.control}) ${chunk}` : chunk;
    return {
      endpoint: config.ttsEndpoint,
      init: {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          cfg_value: config.cfgValue,
          inference_timesteps: config.inferenceTimesteps,
          normalize: config.normalize,
          denoise: config.denoise,
          retry_badcase: config.retryBadcase,
          save: config.save,
          filename_prefix: config.filenamePrefix,
        }),
      },
    };
  }

  const form = new FormData();
  form.set("text", chunk);
  appendTuningFields(form, config);
  if (plan.mode === "controllable-clone") {
    if (!references.referenceAudio || !references.referenceAudioName) {
      throw new Error("VoxCPM controllable-clone reference audio was not loaded.");
    }
    if (plan.control) form.set("control", plan.control);
    form.set(
      "reference_audio",
      audioBlob(references.referenceAudio, plan.referenceAudioPath),
      references.referenceAudioName,
    );
    return { endpoint: config.controllableCloneEndpoint, init: { method: "POST", body: form } };
  }

  if (
    !references.promptAudio ||
    !references.promptAudioName ||
    !references.promptText ||
    !references.referenceAudio ||
    !references.referenceAudioName
  ) {
    throw new Error("VoxCPM high-fidelity references were not loaded.");
  }
  form.set("prompt_text", references.promptText);
  form.set(
    "prompt_audio",
    audioBlob(references.promptAudio, plan.promptAudioPath),
    references.promptAudioName,
  );
  form.set(
    "reference_audio",
    audioBlob(references.referenceAudio, plan.referenceAudioPath ?? plan.promptAudioPath),
    references.referenceAudioName,
  );
  return { endpoint: config.highFidelityCloneEndpoint, init: { method: "POST", body: form } };
};

const callVoxcpm = async ({
  chunk,
  config,
  fetchImpl,
  plan,
  references,
}: {
  readonly chunk: string;
  readonly config: ProducerVoxcpmConfig;
  readonly fetchImpl: typeof fetch;
  readonly plan: ProducerVoxcpmRequestPlan;
  readonly references: PreparedReferences;
}): Promise<Buffer> => {
  const request = createRequest({ chunk, config, plan, references });
  let response: Response;
  try {
    response = await fetchImpl(request.endpoint, {
      ...request.init,
      signal: AbortSignal.timeout(config.timeoutMs),
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Direct VoxCPM request failed: network error: ${detail}`);
  }
  if (!response.ok) {
    throw new Error(`Direct VoxCPM request failed: ${response.status} ${await response.text()}`);
  }
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.startsWith("audio/")) {
    throw new Error(`Direct VoxCPM returned a non-audio response: ${await response.text()}`);
  }
  return Buffer.from(await response.arrayBuffer());
};

export const requestProducerNarrationAsset = async ({
  config = readProducerVoxcpmConfig(),
  fetchImpl = fetch,
  fps = 30,
  plan,
  rootDir = process.cwd(),
  slug,
}: {
  readonly config?: ProducerVoxcpmConfig;
  readonly fetchImpl?: typeof fetch;
  readonly fps?: number;
  readonly plan: ProducerVoxcpmRequestPlan;
  readonly rootDir?: string;
  readonly slug: string;
}): Promise<ProducerNarrationAsset> => {
  assertSafeName(slug, "Producer audio slug");
  assertSafeName(plan.sceneId, "Producer scene id");
  if (!Number.isFinite(fps) || fps <= 0) throw new Error("Producer audio fps must be positive.");

  const ttsChunks = splitProducerNarrationText(plan.ttsText);
  const displayChunks = splitProducerNarrationText(plan.displayText);
  if (ttsChunks.length === 0 || ttsChunks.length !== displayChunks.length) {
    throw new Error("VoxCPM ttsText and displayText punctuation chunks must match.");
  }
  const references = await prepareReferences(plan, rootDir);
  const chunkBuffers: Buffer[] = [];
  const chunkDurationsInSeconds: number[] = [];
  for (const chunk of ttsChunks) {
    const audio = await callVoxcpm({ chunk, config, fetchImpl, plan, references });
    const trimmed = trimPcmWavSilence(audio);
    chunkBuffers.push(trimmed);
    chunkDurationsInSeconds.push(getPcmWavDurationSeconds(trimmed));
  }

  const output = concatenatePcmWavs(chunkBuffers);
  const durationInSeconds = getPcmWavDurationSeconds(output);
  const durationInFrames = Math.max(1, Math.round(durationInSeconds * fps));
  const outputPath = path.join(
    rootDir,
    "public",
    "generated",
    slug,
    "audio",
    `${plan.sceneId}.wav`,
  );
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, Uint8Array.from(output));

  return {
    audioSrc: `generated/${slug}/audio/${plan.sceneId}.wav`,
    captions: buildProducerCaptionCues({
      chunkDurationsInSeconds,
      displayChunks,
      durationInFrames,
      ...(plan.language ? { language: plan.language } : {}),
      fps,
    }),
    durationInFrames,
    durationInSeconds,
    format: "wav",
    outputPath,
    provider: "voxcpm",
  };
};
