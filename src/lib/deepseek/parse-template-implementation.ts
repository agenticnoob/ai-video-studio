import type { z } from "zod";

import { getTemplateDefinition, type TemplateId } from "../template-registry";
import { TECHNICAL_EXPLAINER_TEMPLATE_ID } from "../../templates/ids";

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

const clampNumber = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};

const normalizeTechnicalExplainerCandidate = (value: unknown): unknown => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }

  const record = value as Record<string, unknown>;
  if (!Array.isArray(record["sections"])) {
    return value;
  }

  return {
    ...record,
    sections: record["sections"].map((section) => {
      if (section === null || typeof section !== "object" || Array.isArray(section)) {
        return section;
      }

      const sectionRecord = section as Record<string, unknown>;
      if (typeof sectionRecord["durationInFrames"] !== "number") {
        return section;
      }

      return {
        ...sectionRecord,
        durationInFrames: clampNumber(sectionRecord["durationInFrames"], 45, 420),
      };
    }),
  };
};

const normalizeTemplateImplementationCandidate = (
  value: unknown,
  templateId: TemplateId,
): unknown => {
  if (templateId !== TECHNICAL_EXPLAINER_TEMPLATE_ID) {
    return value;
  }

  return normalizeTechnicalExplainerCandidate(value);
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
      `DeepSeek template implementation JSON output was not valid JSON: ${detail}; raw=${head}`,
      argumentsString,
    );
  }

  const schema = getTemplateDefinition(templateId).implementationSchema;
  const normalized = normalizeTemplateImplementationCandidate(parsed, templateId);
  const result = schema.safeParse(normalized);
  if (result.success) {
    return result.data;
  }

  const wrapped = unwrapImplementationCandidate(parsed);
  if (wrapped !== null) {
    const normalizedWrapped = normalizeTemplateImplementationCandidate(wrapped, templateId);
    const retry = schema.safeParse(normalizedWrapped);
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
