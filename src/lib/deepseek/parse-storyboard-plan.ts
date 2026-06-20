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

const finiteNumber = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const hasOwn = (record: Record<string, unknown>, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(record, key);

const stringifyObjectFields = (record: Record<string, unknown>): string | null => {
  const parts = Object.entries(record)
    .map(([key, value]) => {
      const text = nonEmptyString(value) ?? finiteNumber(value)?.toString();
      return text ? `${key}: ${text}` : null;
    })
    .filter((part): part is string => part !== null);

  return parts.length ? parts.join("; ") : null;
};

const readFrameAlias = (record: Record<string, unknown>): number | null =>
  finiteNumber(record.time) ?? finiteNumber(record.startFrame) ?? finiteNumber(record.frame);

const PROCEDURAL_GENERATOR_BEAT_LIMITS: Record<string, number> = {
  "line-path-flow": 16,
  "node-graph-flow": 20,
  "terminal-session": 16,
};

const proceduralGeneratorBeatLimit = (generatorId: unknown): number | null => {
  const id = nonEmptyString(generatorId);
  return id ? (PROCEDURAL_GENERATOR_BEAT_LIMITS[id] ?? null) : null;
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
  const nextPlan: Record<string, unknown> = { ...plan };
  if (hasOwn(nextPlan, "projectId")) {
    delete nextPlan.projectId;
    changed = true;
  }

  const globalStyleRecord = toRecord(nextPlan.globalStyle);
  if (globalStyleRecord) {
    const globalStyle = stringifyObjectFields(globalStyleRecord);
    if (globalStyle) {
      nextPlan.globalStyle = globalStyle;
      changed = true;
    }
  }

  const planBrief = nonEmptyString(plan.brief) ?? "Describe the segment clearly.";
  const segments = rawSegments.map((segment) => {
    const record = toRecord(segment);
    if (!record) {
      return segment;
    }

    const narration = toRecord(record.narration);
    const fallbackText =
      nonEmptyString(record.purpose) ??
      nonEmptyString(record.title) ??
      nonEmptyString(narration?.text) ??
      nonEmptyString(record.visualBrief) ??
      planBrief;
    const nextSegment: Record<string, unknown> = { ...record };

    if (hasOwn(nextSegment, "language")) {
      delete nextSegment.language;
      changed = true;
    }

    if (hasOwn(nextSegment, "durationSeconds")) {
      const durationSeconds = finiteNumber(nextSegment.durationSeconds);
      if (nextSegment.expectedDurationSeconds === undefined && durationSeconds !== null) {
        nextSegment.expectedDurationSeconds = durationSeconds;
      }
      delete nextSegment.durationSeconds;
      changed = true;
    }

    if (record.purpose === undefined) {
      nextSegment.purpose = fallbackText;
      changed = true;
    }

    if (record.templateReason === undefined) {
      const templateId = nonEmptyString(record.templateId) ?? "selected template";
      nextSegment.templateReason = `Template "${templateId}" matches this segment's planned visual structure.`;
      changed = true;
    }

    const strategyDecision = toRecord(record.strategyDecision);
    if (strategyDecision) {
      const nextStrategyDecision: Record<string, unknown> = { ...strategyDecision };
      let strategyDecisionChanged = false;

      if (strategyDecision.confidence === undefined) {
        nextStrategyDecision.confidence = 0.75;
        strategyDecisionChanged = true;
      }

      if (strategyDecision.reason === undefined) {
        const strategy = nonEmptyString(strategyDecision.strategy) ?? "template_macro";
        const fallbackStrategy =
          nonEmptyString(strategyDecision.fallbackStrategy) ?? "template_macro";
        nextStrategyDecision.reason = `Use ${strategy} for this segment, with ${fallbackStrategy} as the fallback.`;
        strategyDecisionChanged = true;
      }

      if (strategyDecisionChanged) {
        nextSegment.strategyDecision = nextStrategyDecision;
        changed = true;
      }
    }

    if (record.narration === undefined) {
      nextSegment.narration = { text: fallbackText };
      changed = true;
    }

    if (record.visualBrief === undefined) {
      nextSegment.visualBrief = `Visualize: ${fallbackText}`;
      changed = true;
    }

    const proceduralGenerator = toRecord(record.proceduralGenerator);
    if (proceduralGenerator) {
      const nextGenerator: Record<string, unknown> = { ...proceduralGenerator };
      let generatorChanged = false;

      if (proceduralGenerator.title === undefined) {
        nextGenerator.title = nonEmptyString(record.title) ?? fallbackText;
        generatorChanged = true;
      }

      if (Array.isArray(proceduralGenerator.beats)) {
        let beatsChanged = false;
        const beats = proceduralGenerator.beats.map((beat) => {
          const beatRecord = toRecord(beat);
          if (!beatRecord) {
            return beat;
          }

          const frameAlias = readFrameAlias(beatRecord);
          if (beatRecord.atFrame !== undefined && !hasOwn(beatRecord, "duration")) {
            return beat;
          }

          const {
            duration: _duration,
            frame: _frame,
            startFrame: _startFrame,
            time: _time,
            ...rest
          } = beatRecord;
          beatsChanged = true;
          return frameAlias === null
            ? rest
            : {
                ...rest,
                atFrame: frameAlias,
              };
        });
        const beatLimit = proceduralGeneratorBeatLimit(proceduralGenerator.generatorId);
        const limitedBeats =
          beatLimit !== null && beats.length > beatLimit ? beats.slice(0, beatLimit) : beats;

        if (limitedBeats.length !== beats.length) {
          beatsChanged = true;
        }

        if (beatsChanged) {
          nextGenerator.beats = limitedBeats;
          generatorChanged = true;
        }
      }

      if (generatorChanged) {
        nextSegment.proceduralGenerator = nextGenerator;
        changed = true;
      }
    }

    return nextSegment;
  });

  if (!changed) {
    return null;
  }

  return {
    ...nextPlan,
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
      `DeepSeek storyboard JSON output was not valid JSON: ${detail}; raw=${head}`,
      argumentsString,
    );
  }

  const result = storyboardPlanSchema.safeParse(parsed);
  if (result.success) {
    return result.data;
  }

  let validationIssues = result.error.issues;
  const recovered = recoverMissingSegmentPlanningFields(parsed);
  if (recovered !== null) {
    const retry = storyboardPlanSchema.safeParse(recovered);
    if (retry.success) {
      return retry.data;
    }
    validationIssues = retry.error.issues;
  }

  const wrapped = looksLikeWrappedPlan(parsed);
  if (wrapped !== null) {
    const retry = parseStoryboardPlanCandidate(wrapped);
    if (retry !== null) {
      return retry;
    }
  }

  throw new StoryboardPlanParseError(
    `Generated storyboard plan failed schema validation: ${formatIssues(validationIssues)} ; raw=${head}`,
    argumentsString,
  );
};
