import type { z } from "zod";

import { storyboardPlanSchema, type StoryboardPlan } from "../storyboard-plan-schema";

const toRecord = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const nonEmptyString = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

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
  const record = toRecord(value);
  if (!record) {
    return null;
  }
  const plan = record["plan"] ?? record["storyboardPlan"];
  if (!toRecord(plan)) {
    return null;
  }
  return plan;
};

const recoverMissingSegmentPlanningFields = (value: unknown): unknown | null => {
  const plan = toRecord(value);
  const rawSegments = Array.isArray(plan?.segments) ? plan.segments : null;
  if (!plan || !rawSegments) {
    return null;
  }

  let changed = false;
  const planBrief = nonEmptyString(plan.brief) ?? "Describe the segment clearly.";
  const segments = rawSegments.map((segment) => {
    const record = toRecord(segment);
    if (!record) {
      return segment;
    }

    const fallbackText =
      nonEmptyString(record.purpose) ?? nonEmptyString(record.title) ?? planBrief;
    const nextSegment: Record<string, unknown> = { ...record };

    if (record.narration === undefined) {
      nextSegment.narration = { text: fallbackText };
      changed = true;
    }

    if (record.visualBrief === undefined) {
      nextSegment.visualBrief = `Visualize: ${fallbackText}`;
      changed = true;
    }

    return nextSegment;
  });

  if (!changed) {
    return null;
  }

  return {
    ...plan,
    segments,
  };
};

const parseStoryboardPlanCandidate = (value: unknown): StoryboardPlan | null => {
  const result = storyboardPlanSchema.safeParse(value);
  if (result.success) {
    return result.data;
  }

  const recovered = recoverMissingSegmentPlanningFields(value);
  if (recovered !== null) {
    const retry = storyboardPlanSchema.safeParse(recovered);
    if (retry.success) {
      return retry.data;
    }
  }

  return null;
};

export const parseStoryboardPlanToolCallArguments = (argumentsString: string): StoryboardPlan => {
  const head = argumentsString.slice(0, 200);

  let parsed: unknown;
  try {
    parsed = JSON.parse(argumentsString);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new StoryboardPlanParseError(
      `MiniMax storyboard tool_call arguments were not valid JSON: ${detail}; raw=${head}`,
      argumentsString,
    );
  }

  const result = storyboardPlanSchema.safeParse(parsed);
  if (result.success) {
    return result.data;
  }

  const recovered = recoverMissingSegmentPlanningFields(parsed);
  if (recovered !== null) {
    const retry = storyboardPlanSchema.safeParse(recovered);
    if (retry.success) {
      return retry.data;
    }
  }

  const wrapped = looksLikeWrappedPlan(parsed);
  if (wrapped !== null) {
    const retry = parseStoryboardPlanCandidate(wrapped);
    if (retry !== null) {
      return retry;
    }
  }

  throw new StoryboardPlanParseError(
    `Generated storyboard plan failed schema validation: ${formatIssues(result.error.issues)} ; raw=${head}`,
    argumentsString,
  );
};
