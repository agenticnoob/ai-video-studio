import type { z } from "zod";

import { storyboardPlanSchema, type StoryboardPlan } from "../storyboard-plan-schema";

const formatIssues = (issues: z.ZodIssue[]): string =>
  issues
    .slice(0, 5)
    .map((issue) => `${issue.path.join(".") || "<root>"}: ${issue.message}`)
    .join("; ");

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

export const parseStoryboardPlanToolCallArguments = (argumentsString: string): StoryboardPlan => {
  const head = argumentsString.slice(0, 200);

  let parsed: unknown;
  try {
    parsed = JSON.parse(argumentsString);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(
      `MiniMax storyboard tool_call arguments were not valid JSON: ${detail}; raw=${head}`,
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

  throw new Error(
    `Generated storyboard plan failed schema validation: ${formatIssues(result.error.issues)} ; raw=${head}`,
  );
};
