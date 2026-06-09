import {
  callMinimaxChat,
  type MinimaxProjectRequest,
  type MinimaxSegmentRequest,
  type MinimaxStoryboardPlanRequest,
} from "./provider";
import { buildProjectPrompt, buildSegmentPrompt, buildStoryboardPlanPrompt } from "./prompts";
import { parseToolCallArguments } from "./parse-project";
import type { VideoProject } from "../project-schema";
import type { StoryboardPlan } from "../storyboard-plan-schema";
import { parseStoryboardPlanToolCallArguments } from "./parse-storyboard-plan";

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
  return { project: parseToolCallArguments(argumentsString) };
};
