import type { z } from "zod";

import { compileStoryboardPlanDraft } from "../storyboard-plan-draft-compiler";
import { storyboardPlanDraftSchema } from "../storyboard-plan-draft-schema";
import { storyboardPlanSchema, type StoryboardPlan } from "../storyboard-plan-schema";

const formatIssues = (issues: z.ZodIssue[]): string =>
  issues
    .slice(0, 5)
    .map((issue) => `${issue.path.join(".") || "<root>"}: ${issue.message}`)
    .join("; ");

export class StoryboardPlanParseError extends Error {
  raw: string;

  constructor(message: string, raw: string) {
    super(message);
    this.name = "StoryboardPlanParseError";
    this.raw = raw;
  }
}

const looksLikeWrappedPlan = (value: unknown): unknown | null => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const record = value as Record<string, unknown>;
  const plan = record["plan"] ?? record["storyboardPlan"];
  if (plan === null || typeof plan !== "object" || Array.isArray(plan)) {
    return null;
  }
  return plan;
};

const looksLikeWrappedDraft = (value: unknown): unknown | null => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const record = value as Record<string, unknown>;
  const draft = record["draft"] ?? record["storyboardPlanDraft"];
  if (draft === null || typeof draft !== "object" || Array.isArray(draft)) {
    return null;
  }
  return draft;
};

const parseDraftPlan = (value: unknown, argumentsString: string, head: string): StoryboardPlan | null => {
  const draft = storyboardPlanDraftSchema.safeParse(value);
  if (!draft.success) {
    return null;
  }

  try {
    return compileStoryboardPlanDraft(draft.data);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new StoryboardPlanParseError(
      `Generated storyboard draft compiled to an invalid plan: ${detail}; raw=${head}`,
      argumentsString,
    );
  }
};

export const parseStoryboardPlanToolCallArguments = (argumentsString: string): StoryboardPlan => {
  const head = argumentsString.slice(0, 200);

  let parsed: unknown;
  try {
    parsed = JSON.parse(argumentsString);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new StoryboardPlanParseError(
      `DeepSeek storyboard JSON output was not valid JSON: ${detail}; raw=${head}`,
      argumentsString,
    );
  }

  const result = storyboardPlanSchema.safeParse(parsed);
  if (result.success) {
    return result.data;
  }

  const wrapped = looksLikeWrappedPlan(parsed);
  if (wrapped !== null) {
    const retry = storyboardPlanSchema.safeParse(wrapped);
    if (retry.success) {
      return retry.data;
    }
  }

  const draft = parseDraftPlan(parsed, argumentsString, head);
  if (draft !== null) {
    return draft;
  }

  const wrappedDraft = looksLikeWrappedDraft(parsed);
  if (wrappedDraft !== null) {
    const retry = parseDraftPlan(wrappedDraft, argumentsString, head);
    if (retry !== null) {
      return retry;
    }
  }

  throw new StoryboardPlanParseError(
    `Generated storyboard plan failed schema validation: ${formatIssues(result.error.issues)} ; raw=${head}`,
    argumentsString,
  );
};
