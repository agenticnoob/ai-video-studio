import { normalizeProject, type VideoProject, type VideoSegment } from "../project-schema";
import {
  storyboardPlanSchema,
  type StoryboardPlan,
} from "../storyboard-plan-schema";
import { StoryboardSegmentNotFoundError, generateSegmentNarrationAsset } from "../tts";
import type { TtsProviderId } from "../tts/config";
import type { VoiceCloneRequest } from "../tts/voice-references";
import {
  minimaxGenerateRevisedSegmentPlan,
  minimaxGenerateStoryboardPlan,
} from "../minimax";
import {
  assembleStagedProject,
  orderPlanSegments,
  replaceSegmentAndNarrationLayer,
} from "./assembly";
import {
  compilePlannedSegment,
  generateAndCompilePlannedSegment,
  type CompilePlannedSegmentResult,
} from "./segment";
import type { SegmentNarrationAsset } from "../narration-asset-schema";

export type GenerateStagedProjectFromPlanRequest = {
  plan: StoryboardPlan;
  provider?: TtsProviderId;
  voiceClone?: VoiceCloneRequest;
  voiceId?: string;
};

export type GenerateStagedProjectResult = {
  plan: StoryboardPlan;
  plannerAttempts?: number;
  plannerRepaired?: boolean;
  project: VideoProject;
  segments: CompilePlannedSegmentResult[];
};

export type GenerateStagedSegmentRevisionRequest = {
  project: VideoProject;
  provider?: TtsProviderId;
  revisionPrompt: string;
  segmentId: string;
  voiceClone?: VoiceCloneRequest;
  voiceId?: string;
};

export type GenerateStagedSegmentRevisionResult = {
  compilerAttempts: number;
  narration: SegmentNarrationAsset;
  plan: StoryboardPlan;
  plannerAttempts: number;
  plannerRepaired: boolean;
  project: VideoProject;
  repaired: boolean;
  segment: VideoSegment;
};

export const generateStagedProjectFromPlan = async ({
  provider,
  plan: rawPlan,
  voiceClone,
  voiceId,
}: GenerateStagedProjectFromPlanRequest): Promise<GenerateStagedProjectResult> => {
  const plan = storyboardPlanSchema.parse(rawPlan);
  const compiledSegments: CompilePlannedSegmentResult[] = [];

  for (const segment of orderPlanSegments(plan)) {
    compiledSegments.push(
      await generateAndCompilePlannedSegment({
        plan,
        provider,
        segment,
        voiceClone,
        voiceId,
      }),
    );
  }

  const project = assembleStagedProject({
    compiledSegments,
    plan,
  });

  return {
    plan,
    project,
    segments: compiledSegments,
  };
};

export const generateStagedSegmentRevision = async ({
  project: rawProject,
  provider,
  revisionPrompt,
  segmentId,
  voiceClone,
  voiceId,
}: GenerateStagedSegmentRevisionRequest): Promise<GenerateStagedSegmentRevisionResult> => {
  const project = normalizeProject(rawProject);
  const segmentIndex = project.segments.findIndex((segment) => segment.id === segmentId);

  if (segmentIndex < 0) {
    throw new StoryboardSegmentNotFoundError(segmentId);
  }

  const {
    attempts: plannerAttempts,
    plan: rawPlan,
    repaired: plannerRepaired,
  } = await minimaxGenerateRevisedSegmentPlan({
    project,
    revisionPrompt,
    segmentId,
  });
  const plan = storyboardPlanSchema.parse(rawPlan);
  const [plannedSegment] = plan.segments;
  const narration = await generateSegmentNarrationAsset({
    plan,
    provider,
    segmentId,
    voiceId,
    voiceClone,
  });
  const compiled = await compilePlannedSegment({
    narration,
    plan,
    segment: plannedSegment,
  });
  const revisedProject = replaceSegmentAndNarrationLayer({
    narration,
    project,
    segment: compiled.segment,
    segmentId,
  });

  return {
    compilerAttempts: compiled.compilerAttempts,
    narration,
    plan,
    plannerAttempts,
    plannerRepaired,
    project: revisedProject,
    repaired: compiled.repaired,
    segment: compiled.segment,
  };
};

export type GenerateStagedProjectFromBriefRequest = {
  brief: string;
  provider?: TtsProviderId;
  voiceClone?: VoiceCloneRequest;
  voiceId?: string;
};

export const generateStagedProjectFromBrief = async ({
  brief,
  provider,
  voiceClone,
  voiceId,
}: GenerateStagedProjectFromBriefRequest): Promise<GenerateStagedProjectResult> => {
  const {
    attempts: plannerAttempts,
    plan,
    repaired: plannerRepaired,
  } = await minimaxGenerateStoryboardPlan({
    brief,
  });
  const result = await generateStagedProjectFromPlan({ plan, provider, voiceClone, voiceId });
  return {
    ...result,
    plannerAttempts,
    plannerRepaired,
  };
};
