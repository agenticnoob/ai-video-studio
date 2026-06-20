import type { z } from "zod";

import { compileStoryboardPlanDraft } from "../storyboard-plan-draft-compiler";
import { storyboardPlanDraftSchema } from "../storyboard-plan-draft-schema";
import type { StoryboardPlan } from "../storyboard-plan-schema";
import { StoryboardPlanParseError } from "./parse-storyboard-plan";

const looksLikeWrappedDraft = (value: unknown): unknown | null => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const record = value as Record<string, unknown>;
  const draft = record.draft ?? record.storyboardDraft ?? record.storyboardPlanDraft;
  return draft !== null && typeof draft === "object" && !Array.isArray(draft) ? draft : null;
};

const formatIssues = (issues: z.ZodIssue[]): string =>
  issues
    .slice(0, 5)
    .map((issue) => `${issue.path.join(".") || "<root>"}: ${issue.message}`)
    .join("; ");

export const parseStoryboardPlanDraftToolCallArguments = (
  argumentsString: string,
): StoryboardPlan => {
  const head = argumentsString.slice(0, 200);

  let parsed: unknown;
  try {
    parsed = JSON.parse(argumentsString);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new StoryboardPlanParseError(
      `DeepSeek storyboard draft JSON output was not valid JSON: ${detail}; raw=${head}`,
      argumentsString,
    );
  }

  const result = storyboardPlanDraftSchema.safeParse(parsed);
  if (result.success) {
    return compileStoryboardPlanDraft(result.data);
  }

  const wrapped = looksLikeWrappedDraft(parsed);
  if (wrapped !== null) {
    const wrappedResult = storyboardPlanDraftSchema.safeParse(wrapped);
    if (wrappedResult.success) {
      return compileStoryboardPlanDraft(wrappedResult.data);
    }
  }

  throw new StoryboardPlanParseError(
    `Generated storyboard draft failed schema validation: ${formatIssues(result.error.issues)} ; raw=${head}`,
    argumentsString,
  );
};
