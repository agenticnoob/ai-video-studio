import {
  callMinimaxChat,
  type MinimaxProjectRequest,
  type MinimaxSegmentPlanRevisionRequest,
  type MinimaxSegmentRequest,
  type MinimaxStoryboardPlanRequest,
  type MinimaxTemplateCompileRequest,
} from "./provider";
import {
  buildProjectPrompt,
  buildSegmentPlanRevisionPrompt,
  buildSegmentPrompt,
  buildStoryboardPlanPrompt,
  buildTemplateCompilerPrompt,
} from "./prompts";
import { parseToolCallArguments } from "./parse-project";
import type { VideoProject } from "../project-schema";
import type { StoryboardPlan } from "../storyboard-plan-schema";
import { parseStoryboardPlanToolCallArguments } from "./parse-storyboard-plan";
import {
  parseTemplateImplementationToolCallArguments,
  TemplateImplementationParseError,
} from "./parse-template-implementation";
import { getTemplateDefinition } from "../template-registry";
import { preserveMediaLayersForSegmentRevision } from "../project-media";

export type MinimaxGenerateProjectResult = {
  project: VideoProject;
};

/**
 * Generate a full VideoProject from a brief via the MiniMax Chat Completions
 * tool-calling endpoint. The model is force-routed to the single
 * `emit_result` tool (deep-recursive schema; see
 * `docs/providers/minimax-tool-calling.md` §5.1), and we parse the tool
 * call's `arguments` string with Zod-enforced `videoProjectSchema`.
 *
 * `parseToolCallArguments` is the only success path — free-text JSON is no
 * longer accepted (per the task spec: "业务层只接受 emit_result 工具的
 * arguments, 并不接受自由文本 JSON").
 */
export const minimaxGenerateProject = async (
  request: MinimaxProjectRequest,
): Promise<MinimaxGenerateProjectResult> => {
  const { messages, tools, toolChoice } = buildProjectPrompt(request.brief);
  const argumentsString = await callMinimaxChat(messages, { tools, toolChoice });
  return { project: parseToolCallArguments(argumentsString) };
};

export type MinimaxGenerateStoryboardPlanResult = {
  plan: StoryboardPlan;
};

export const minimaxGenerateStoryboardPlan = async (
  request: MinimaxStoryboardPlanRequest,
): Promise<MinimaxGenerateStoryboardPlanResult> => {
  const { messages, tools, toolChoice } = buildStoryboardPlanPrompt(request.brief);
  const argumentsString = await callMinimaxChat(messages, { tools, toolChoice });
  return { plan: parseStoryboardPlanToolCallArguments(argumentsString) };
};

export type MinimaxGenerateRevisedSegmentPlanResult = {
  plan: StoryboardPlan;
};

export const minimaxGenerateRevisedSegmentPlan = async (
  request: MinimaxSegmentPlanRevisionRequest,
): Promise<MinimaxGenerateRevisedSegmentPlanResult> => {
  const { messages, tools, toolChoice } = buildSegmentPlanRevisionPrompt(request);
  const argumentsString = await callMinimaxChat(messages, { tools, toolChoice });
  const plan = parseStoryboardPlanToolCallArguments(argumentsString);
  const [segment] = plan.segments;

  return {
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
  };
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
        throw error;
      }
      validationError = error.message;
      previousInvalidOutput = error.raw;
    }
  }

  throw new Error("Template implementation compilation exhausted repair attempts.");
};

export type MinimaxReviseSegmentResult = {
  project: VideoProject;
};

/**
 * Revise a single segment of an existing VideoProject. Like the project-mode
 * path, this uses the single `emit_result` tool and the deep-recursive schema
 * — the model returns the FULL project with non-target segments preserved
 * byte-identical. The tool_choice forces `emit_result` so the model never
 * falls back to a content-channel JSON blob.
 */
export const minimaxReviseSegment = async (
  request: MinimaxSegmentRequest,
): Promise<MinimaxReviseSegmentResult> => {
  const { messages, tools, toolChoice } = buildSegmentPrompt(
    request.project,
    request.segmentId,
    request.revisionPrompt,
  );
  const argumentsString = await callMinimaxChat(messages, { tools, toolChoice });
  return {
    project: preserveMediaLayersForSegmentRevision({
      originalProject: request.project,
      revisedProject: parseToolCallArguments(argumentsString),
    }),
  };
};
