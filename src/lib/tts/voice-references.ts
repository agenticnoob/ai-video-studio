import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { z } from "zod";

import { TtsConfigError } from "./errors";

export const VOICE_REFERENCE_OUTPUT_DIRECTORY = "out/voice-references";
export const DEFAULT_F5_VOICE_REFERENCE_RUNTIME_DIRECTORY = "/voice-references";

const allowedVoiceReferenceExtensions = ["wav", "mp3", "m4a", "aac"] as const;
const allowedVoiceReferenceMimeTypes = new Set([
  "application/octet-stream",
  "audio/aac",
  "audio/m4a",
  "audio/mp3",
  "audio/mpeg",
  "audio/wav",
  "audio/wave",
  "audio/x-m4a",
  "audio/x-wav",
]);
const voiceReferenceIdPattern =
  /^voice-ref-\d{8}t\d{6}z-[a-z0-9]{8}\.(wav|mp3|m4a|aac)$/;

export const MAX_VOICE_REFERENCE_BYTES = 20 * 1024 * 1024;

export const voiceCloneRequestSchema = z
  .object({
    enabled: z.boolean(),
    referenceId: z.string().trim().max(120).optional(),
    referenceText: z.string().trim().max(2000).optional(),
  })
  .strict()
  .superRefine((value, context) => {
    if (!value.enabled) {
      return;
    }
    if (!value.referenceId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Voice clone reference id is required.",
        path: ["referenceId"],
      });
    }
    if (!value.referenceText) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Voice clone reference text is required.",
        path: ["referenceText"],
      });
    }
  });

export type VoiceCloneRequest = z.infer<typeof voiceCloneRequestSchema>;

export type ResolvedVoiceCloneReference = {
  referenceAudioPath: string;
  referenceText: string;
};

const getVoiceReferenceDirectory = (): string => {
  return path.join(process.cwd(), VOICE_REFERENCE_OUTPUT_DIRECTORY);
};

const getRuntimeVoiceReferenceDirectory = (): string => {
  return (
    (process.env.F5_TTS_VOICE_REFERENCE_RUNTIME_DIR ?? "").trim() ||
    DEFAULT_F5_VOICE_REFERENCE_RUNTIME_DIRECTORY
  ).replace(/\/+$/, "");
};

export const isAllowedVoiceReferenceMimeType = (mimeType: string): boolean => {
  return allowedVoiceReferenceMimeTypes.has(mimeType.toLowerCase());
};

export const getVoiceReferenceExtension = (filename: string): string | undefined => {
  const extension = path.extname(filename).replace(/^\./, "").toLowerCase();
  return allowedVoiceReferenceExtensions.includes(
    extension as (typeof allowedVoiceReferenceExtensions)[number],
  )
    ? extension
    : undefined;
};

export const createVoiceReferenceId = (extension: string): string => {
  const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}z$/i, "z");
  return `voice-ref-${timestamp}-${randomUUID().slice(0, 8)}.${extension}`.toLowerCase();
};

export const assertVoiceReferenceId = (referenceId: string): void => {
  if (!voiceReferenceIdPattern.test(referenceId)) {
    throw new TtsConfigError("Voice clone reference id is invalid.");
  }
};

export const getVoiceReferenceStoragePath = (referenceId: string): string => {
  assertVoiceReferenceId(referenceId);
  return path.join(getVoiceReferenceDirectory(), referenceId);
};

export const getVoiceReferenceRuntimePath = (referenceId: string): string => {
  assertVoiceReferenceId(referenceId);
  return `${getRuntimeVoiceReferenceDirectory()}/${referenceId}`;
};

export const writeVoiceReferenceFile = async ({
  buffer,
  referenceId,
}: {
  buffer: Buffer;
  referenceId: string;
}): Promise<string> => {
  const outputPath = getVoiceReferenceStoragePath(referenceId);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, Uint8Array.from(buffer), { flag: "wx" });
  return outputPath;
};

export const resolveVoiceCloneReference = async (
  voiceClone?: VoiceCloneRequest,
): Promise<ResolvedVoiceCloneReference | undefined> => {
  if (!voiceClone?.enabled) {
    return undefined;
  }

  const parsed = voiceCloneRequestSchema.parse(voiceClone);
  const referenceId = parsed.referenceId as string;
  const storagePath = getVoiceReferenceStoragePath(referenceId);

  try {
    await access(storagePath);
  } catch {
    throw new TtsConfigError(`Voice clone reference audio is not available: ${referenceId}`);
  }

  return {
    referenceAudioPath: getVoiceReferenceRuntimePath(referenceId),
    referenceText: parsed.referenceText as string,
  };
};
