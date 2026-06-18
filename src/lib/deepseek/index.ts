import {
  callDeepSeekChat,
  type DeepSeekSegmentPlanRevisionRequest,
  type DeepSeekStoryboardPlanRequest,
  type DeepSeekTemplateCompileRequest,
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

export type DeepSeekGenerateStoryboardPlanResult = {
  attempts: number;
  plan: StoryboardPlan;
  repaired: boolean;
};

const MAX_STORYBOARD_PLAN_REPAIR_ATTEMPTS = 1;

export const deepseekGenerateStoryboardPlan = async (
  request: DeepSeekStoryboardPlanRequest,
): Promise<DeepSeekGenerateStoryboardPlanResult> => {
  let validationError: string | undefined;
  let previousInvalidOutput: string | undefined;

  for (let attempt = 0; attempt <= MAX_STORYBOARD_PLAN_REPAIR_ATTEMPTS; attempt++) {
    const { messages } = buildStoryboardPlanPrompt({
      ...request,
      previousInvalidOutput,
      validationError,
    });
    const argumentsString = await callDeepSeekChat(messages);

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

export type DeepSeekGenerateRevisedSegmentPlanResult = {
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

export const deepseekGenerateRevisedSegmentPlan = async (
  request: DeepSeekSegmentPlanRevisionRequest,
): Promise<DeepSeekGenerateRevisedSegmentPlanResult> => {
  let validationError: string | undefined;
  let previousInvalidOutput: string | undefined;

  for (let attempt = 0; attempt <= MAX_STORYBOARD_PLAN_REPAIR_ATTEMPTS; attempt++) {
    const { messages } = buildSegmentPlanRevisionPrompt({
      ...request,
      previousInvalidOutput,
      validationError,
    });
    const argumentsString = await callDeepSeekChat(messages);

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

export type DeepSeekCompileTemplateImplementationResult = {
  attempts: number;
  durationInFrames: number;
  implementation: unknown;
  repaired: boolean;
};

const MAX_TEMPLATE_COMPILER_REPAIR_ATTEMPTS = 1;

const parseCompiledImplementation = (
  argumentsString: string,
  request: DeepSeekTemplateCompileRequest,
): DeepSeekCompileTemplateImplementationResult => {
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

export const deepseekCompileTemplateImplementation = async (
  request: DeepSeekTemplateCompileRequest,
): Promise<DeepSeekCompileTemplateImplementationResult> => {
  let validationError: string | undefined;
  let previousInvalidOutput: string | undefined;

  for (let attempt = 0; attempt <= MAX_TEMPLATE_COMPILER_REPAIR_ATTEMPTS; attempt++) {
    const { messages } = buildTemplateCompilerPrompt({
      ...request,
      validationError,
      previousInvalidOutput,
    });
    const argumentsString = await callDeepSeekChat(messages);

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
