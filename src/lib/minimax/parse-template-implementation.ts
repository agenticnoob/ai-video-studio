import type { z } from "zod";

import { getTemplateDefinition, type TemplateId } from "../template-registry";

const formatIssues = (issues: z.ZodIssue[]): string =>
  issues
    .slice(0, 5)
    .map((issue) => `${issue.path.join(".") || "<root>"}: ${issue.message}`)
    .join("; ");

export class TemplateImplementationParseError extends Error {
  raw: string;

  constructor(message: string, raw: string) {
    super(message);
    this.name = "TemplateImplementationParseError";
    this.raw = raw;
  }
}

const unwrapImplementationCandidate = (value: unknown): unknown | null => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  return record["implementation"] ?? null;
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
  }

  throw new TemplateImplementationParseError(
    `Generated "${templateId}" implementation failed schema validation: ${formatIssues(
      result.error.issues,
    )}; raw=${head}`,
    argumentsString,
  );
};
