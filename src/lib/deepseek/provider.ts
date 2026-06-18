import { createDeepSeek } from "@ai-sdk/deepseek";
import { generateText, Output } from "ai";

import type { SegmentNarrationAsset } from "../narration-asset-schema";
import type { VideoProject } from "../project-schema";
import type { StoryboardPlan, StoryboardSegmentPlan } from "../storyboard-plan-schema";

export const DEFAULT_DEEPSEEK_MODEL = "deepseek-chat";
export const DEFAULT_DEEPSEEK_MAX_OUTPUT_TOKENS = 8192;

export type DeepSeekConfig = {
  apiKey: string;
  baseURL?: string;
  model: string;
};

export class DeepSeekConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeepSeekConfigError";
  }
}

export const readDeepSeekConfig = (): DeepSeekConfig => {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    throw new DeepSeekConfigError(
      "DEEPSEEK_API_KEY is not configured. Set it in .env to enable real generation.",
    );
  }

  const model = (process.env.DEEPSEEK_MODEL ?? "").trim() || DEFAULT_DEEPSEEK_MODEL;
  const baseURL = (process.env.DEEPSEEK_BASE_URL ?? "").trim() || undefined;
  if (baseURL && !/^https?:\/\//.test(baseURL)) {
    throw new DeepSeekConfigError("DEEPSEEK_BASE_URL must start with http:// or https://.");
  }

  return { apiKey: apiKey.trim(), baseURL, model };
};

export type DeepSeekChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type DeepSeekChatOptions = {
  maxOutputTokens?: number;
  signal?: AbortSignal;
};

const toAiMessages = (messages: DeepSeekChatMessage[]) =>
  messages.map((message) => ({
    content: message.content,
    role: message.role,
  }));

export const callDeepSeekChat = async (
  messages: DeepSeekChatMessage[],
  options: DeepSeekChatOptions = {},
): Promise<string> => {
  const config = readDeepSeekConfig();
  const provider = createDeepSeek({
    apiKey: config.apiKey,
    ...(config.baseURL ? { baseURL: config.baseURL } : {}),
  });
  const maxOutputTokens = options.maxOutputTokens ?? DEFAULT_DEEPSEEK_MAX_OUTPUT_TOKENS;

  let result: Awaited<ReturnType<typeof generateText>>;
  try {
    // Some DeepSeek-compatible gateways reject required/object tool_choice in
    // thinking mode, while still supporting response_format JSON mode.
    result = await generateText({
      abortSignal: options.signal ?? AbortSignal.timeout(90_000),
      maxOutputTokens,
      messages: toAiMessages(messages),
      model: provider(config.model),
      output: Output.json(),
      temperature: 0,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`DeepSeek request failed: ${detail}`);
  }

  if (result.output === undefined) {
    throw new Error("DeepSeek response had no JSON output.");
  }

  return JSON.stringify(result.output);
};

export type DeepSeekStoryboardPlanRequest = {
  brief: string;
  previousInvalidOutput?: string;
  validationError?: string;
};

export type DeepSeekSegmentPlanRevisionRequest = {
  project: VideoProject;
  revisionPrompt: string;
  segmentId: string;
  previousInvalidOutput?: string;
  validationError?: string;
};

export type DeepSeekTemplateCompileRequest = {
  plan: StoryboardPlan;
  segment: StoryboardSegmentPlan;
  narration: SegmentNarrationAsset;
  targetDurationInFrames: number;
  validationError?: string;
  previousInvalidOutput?: string;
};
