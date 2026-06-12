import { createNarrationAudioLayer } from "./narration-media";
import {
  normalizeProject,
  videoSegmentSchema,
  type VideoProject,
  type VideoSegment,
} from "./project-schema";
import { segmentNarrationFromAsset, type SegmentNarrationAsset } from "./narration-asset-schema";
import {
  storyboardPlanSchema,
  type StoryboardPlan,
  type StoryboardSegmentPlan,
} from "./storyboard-plan-schema";
import { generateSegmentNarrationAsset, StoryboardSegmentNotFoundError } from "./tts";
import type { TtsProviderId } from "./tts/config";
import type { VoiceCloneRequest } from "./tts/voice-references";
import {
  minimaxCompileTemplateImplementation,
  minimaxGenerateRevisedSegmentPlan,
  minimaxGenerateStoryboardPlan,
} from "./minimax";
import { getTemplateDefinition } from "./template-registry";
import type { AudioMediaLayer } from "./media-layer-schema";
import {
  assembleStagedProject,
  getNextNarrationStartFrame,
  orderPlanSegments,
  replaceSegmentAndNarrationLayer,
} from "./staged-project-assembly";

export type CompilePlannedSegmentRequest = {
  narration: SegmentNarrationAsset;
  plan: StoryboardPlan;
  segment: StoryboardSegmentPlan;
};

export type CompilePlannedSegmentResult = {
  compilerAttempts: number;
  narration: SegmentNarrationAsset;
  repaired: boolean;
  segment: VideoSegment;
};

const getTargetDurationInFrames = (
  segment: StoryboardSegmentPlan,
  narration: SegmentNarrationAsset,
): number => {
  const recommended = getTemplateDefinition(segment.templateId).capabilities
    .recommendedDurationFrames;
  return Math.max(narration.durationInFrames, recommended.min);
};

export const compilePlannedSegment = async ({
  narration,
  plan,
  segment,
}: CompilePlannedSegmentRequest): Promise<CompilePlannedSegmentResult> => {
  const compiled = await minimaxCompileTemplateImplementation({
    plan,
    segment,
    narration,
    targetDurationInFrames: getTargetDurationInFrames(segment, narration),
  });
  const videoSegment = videoSegmentSchema.parse({
    id: segment.id,
    title: segment.title ?? segment.purpose,
    intent: segment.purpose,
    narration: segmentNarrationFromAsset(narration),
    templateId: segment.templateId,
    implementation: compiled.implementation,
  });

  return {
    compilerAttempts: compiled.attempts,
    narration,
    repaired: compiled.repaired,
    segment: videoSegment,
  };
};

export type GenerateStagedProjectFromPlanRequest = {
  plan: StoryboardPlan;
  provider?: TtsProviderId;
  voiceId?: string;
  voiceClone?: VoiceCloneRequest;
};

export type GenerateStagedProjectResult = {
  narrationLayers: AudioMediaLayer[];
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
  voiceId?: string;
  voiceClone?: VoiceCloneRequest;
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
  voiceId,
  voiceClone,
}: GenerateStagedProjectFromPlanRequest): Promise<GenerateStagedProjectResult> => {
  const plan = storyboardPlanSchema.parse(rawPlan);
  const compiledSegments: CompilePlannedSegmentResult[] = [];
  const narrationLayers: AudioMediaLayer[] = [];
  let startFrame = 0;

  for (const segmentPlan of orderPlanSegments(plan)) {
    const narration = await generateSegmentNarrationAsset({
      plan,
      provider,
      segmentId: segmentPlan.id,
      voiceId,
      voiceClone,
    });
    const compiled = await compilePlannedSegment({
      plan,
      segment: segmentPlan,
      narration,
    });

    narrationLayers.push(
      createNarrationAudioLayer({
        narration,
        segmentId: segmentPlan.id,
        startFrame,
      }),
    );
    startFrame = getNextNarrationStartFrame(startFrame, compiled.segment);
    compiledSegments.push(compiled);
  }

  const project = assembleStagedProject({
    compiledSegments,
    narrationLayers,
    plan,
  });

  return {
    narrationLayers,
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
  voiceId,
  voiceClone,
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
  voiceId?: string;
  voiceClone?: VoiceCloneRequest;
};

export const generateStagedProjectFromBrief = async ({
  brief,
  provider,
  voiceId,
  voiceClone,
}: GenerateStagedProjectFromBriefRequest): Promise<GenerateStagedProjectResult> => {
  const {
    attempts: plannerAttempts,
    plan,
    repaired: plannerRepaired,
  } = await minimaxGenerateStoryboardPlan({
    brief,
  });
  const result = await generateStagedProjectFromPlan({ plan, provider, voiceId, voiceClone });
  return {
    ...result,
    plannerAttempts,
    plannerRepaired,
  };
};
