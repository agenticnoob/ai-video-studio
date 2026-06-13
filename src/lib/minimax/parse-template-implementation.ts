import type { z } from "zod";

import { getTemplateDefinition, type TemplateId } from "../template-registry";

const FENCE_PATTERN = /^```(?:json)?\s*|^```\s*$/gm;
const WRAPPED_IMPLEMENTATION_KEYS = ["implementation", "result", "data"] as const;

const stripFences = (raw: string): string => raw.replace(FENCE_PATTERN, "").trim();

const formatIssues = (issues: z.ZodIssue[]): string =>
  issues
    .slice(0, 5)
    .map((issue) => `${issue.path.join(".") || "<root>"}: ${issue.message}`)
    .join("; ");

export class TemplateImplementationParseError extends Error {
  attempts?: number;
  raw: string;

  constructor(message: string, raw: string) {
    super(message);
    this.name = "TemplateImplementationParseError";
    this.raw = raw;
  }
}

const parseStringCandidate = (value: string): unknown | null => {
  const trimmed = stripFences(value);
  if (!trimmed.startsWith("{")) {
    return null;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
};

const unwrapImplementationCandidate = (value: unknown): unknown | null => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  for (const key of WRAPPED_IMPLEMENTATION_KEYS) {
    const candidate = record[key];
    if (candidate === undefined) {
      continue;
    }
    if (typeof candidate === "string") {
      return parseStringCandidate(candidate);
    }
    return candidate;
  }

  return null;
};

export const parseTemplateImplementationToolCallArguments = (
  argumentsString: string,
  templateId: TemplateId,
): unknown => {
  const head = argumentsString.slice(0, 200);

  let parsed: unknown;
  try {
    parsed = JSON.parse(argumentsString);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new TemplateImplementationParseError(
      `MiniMax template implementation arguments were not valid JSON: ${detail}; raw=${head}`,
      argumentsString,
    );
  }

  const schema = getTemplateDefinition(templateId).implementationSchema;
  const result = schema.safeParse(parsed);
  if (result.success) {
    return result.data;
  }

  const wrapped = unwrapImplementationCandidate(parsed);
  if (wrapped !== null) {
    const retry = schema.safeParse(wrapped);
    if (retry.success) {
      return retry.data;
    }
    throw new TemplateImplementationParseError(
      `Generated "${templateId}" wrapped implementation failed schema validation: ${formatIssues(
        retry.error.issues,
      )}; raw=${head}`,
      argumentsString,
    );
  }

  throw new TemplateImplementationParseError(
    `Generated "${templateId}" implementation failed schema validation: ${formatIssues(
      result.error.issues,
    )}; raw=${head}`,
    argumentsString,
  );
};
