import {
  callMinimaxChat,
  type MinimaxSegmentPlanRevisionRequest,
  type MinimaxStoryboardPlanRequest,
  type MinimaxTemplateCompileRequest,
} from "./provider";
import {
  buildSegmentPlanRevisionPrompt,
  buildStoryboardPlanPrompt,
  buildTemplateCompilerPrompt,
} from "./prompts";
import type { StoryboardPlan } from "../storyboard-plan-schema";
import {
  parseStoryboardPlanToolCallArguments,
  StoryboardPlanParseError,
} from "./parse-storyboard-plan";
import {
  parseTemplateImplementationToolCallArguments,
  TemplateImplementationParseError,
} from "./parse-template-implementation";
import { getTemplateDefinition } from "../template-registry";

export type MinimaxGenerateStoryboardPlanResult = {
  attempts: number;
  plan: StoryboardPlan;
  repaired: boolean;
};

const MAX_STORYBOARD_PLAN_REPAIR_ATTEMPTS = 1;

export const minimaxGenerateStoryboardPlan = async (
  request: MinimaxStoryboardPlanRequest,
): Promise<MinimaxGenerateStoryboardPlanResult> => {
  let validationError: string | undefined;
  let previousInvalidOutput: string | undefined;

  for (let attempt = 0; attempt <= MAX_STORYBOARD_PLAN_REPAIR_ATTEMPTS; attempt++) {
    const { messages, tools, toolChoice } = buildStoryboardPlanPrompt({
      ...request,
      previousInvalidOutput,
      validationError,
    });
    const argumentsString = await callMinimaxChat(messages, { tools, toolChoice });

    try {
      return {
        attempts: attempt + 1,
        plan: parseStoryboardPlanToolCallArguments(argumentsString),
        repaired: attempt > 0,
      };
    } catch (error) {
      if (!(error instanceof StoryboardPlanParseError)) {
        throw error;
      }
      if (attempt >= MAX_STORYBOARD_PLAN_REPAIR_ATTEMPTS) {
        throw error;
      }
      validationError = error.message;
      previousInvalidOutput = error.raw;
    }
  }

  throw new Error("Storyboard planning exhausted repair attempts.");
};

export type MinimaxGenerateRevisedSegmentPlanResult = {
  attempts: number;
  plan: StoryboardPlan;
  repaired: boolean;
};

const parseOneSegmentStoryboardPlan = (
  argumentsString: string,
  segmentId: string,
): StoryboardPlan => {
  const plan = parseStoryboardPlanToolCallArguments(argumentsString);
  if (plan.segments.length !== 1) {
    throw new StoryboardPlanParseError(
      `Generated revised storyboard plan must contain exactly one segment for "${segmentId}", but received ${plan.segments.length}.`,
      argumentsString,
    );
  }
  return plan;
};

export const minimaxGenerateRevisedSegmentPlan = async (
  request: MinimaxSegmentPlanRevisionRequest,
): Promise<MinimaxGenerateRevisedSegmentPlanResult> => {
  let validationError: string | undefined;
  let previousInvalidOutput: string | undefined;

  for (let attempt = 0; attempt <= MAX_STORYBOARD_PLAN_REPAIR_ATTEMPTS; attempt++) {
    const { messages, tools, toolChoice } = buildSegmentPlanRevisionPrompt({
      ...request,
      previousInvalidOutput,
      validationError,
    });
    const argumentsString = await callMinimaxChat(messages, { tools, toolChoice });

    try {
      const plan = parseOneSegmentStoryboardPlan(argumentsString, request.segmentId);
      const [segment] = plan.segments;

      return {
        attempts: attempt + 1,
        plan: {
          ...plan,
          segments: [
            {
              ...segment,
              id: request.segmentId,
              order: 1,
            },
          ],
        },
        repaired: attempt > 0,
      };
    } catch (error) {
      if (!(error instanceof StoryboardPlanParseError)) {
        throw error;
      }
      if (attempt >= MAX_STORYBOARD_PLAN_REPAIR_ATTEMPTS) {
        throw error;
      }
      validationError = error.message;
      previousInvalidOutput = error.raw;
    }
  }

  throw new Error("Storyboard segment planning exhausted repair attempts.");
};

export type MinimaxCompileTemplateImplementationResult = {
  attempts: number;
  durationInFrames: number;
  implementation: unknown;
  repaired: boolean;
};

const MAX_TEMPLATE_COMPILER_REPAIR_ATTEMPTS = 1;

const parseCompiledImplementation = (
  argumentsString: string,
  request: MinimaxTemplateCompileRequest,
): MinimaxCompileTemplateImplementationResult => {
  const implementation = parseTemplateImplementationToolCallArguments(
    argumentsString,
    request.segment.templateId,
  );
  const durationInFrames = getTemplateDefinition(request.segment.templateId).getDuration(
    implementation as never,
  );

  if (durationInFrames < request.targetDurationInFrames) {
    throw new TemplateImplementationParseError(
      `Generated "${request.segment.templateId}" implementation duration ${durationInFrames} frames is shorter than required narration duration ${request.targetDurationInFrames} frames.`,
      argumentsString,
    );
  }

  return {
    attempts: 1,
    durationInFrames,
    implementation,
    repaired: false,
  };
};

export const minimaxCompileTemplateImplementation = async (
  request: MinimaxTemplateCompileRequest,
): Promise<MinimaxCompileTemplateImplementationResult> => {
  let validationError: string | undefined;
  let previousInvalidOutput: string | undefined;

  for (let attempt = 0; attempt <= MAX_TEMPLATE_COMPILER_REPAIR_ATTEMPTS; attempt++) {
    const { messages, tools, toolChoice } = buildTemplateCompilerPrompt({
      ...request,
      validationError,
      previousInvalidOutput,
    });
    const argumentsString = await callMinimaxChat(messages, { tools, toolChoice });

    try {
      const result = parseCompiledImplementation(argumentsString, request);
      return {
        ...result,
        attempts: attempt + 1,
        repaired: attempt > 0,
      };
    } catch (error) {
      if (!(error instanceof TemplateImplementationParseError)) {
        throw error;
      }
      if (attempt >= MAX_TEMPLATE_COMPILER_REPAIR_ATTEMPTS) {
        error.attempts = attempt + 1;
        throw error;
      }
      validationError = error.message;
      previousInvalidOutput = error.raw;
    }
  }

  throw new Error("Template implementation compilation exhausted repair attempts.");
};
