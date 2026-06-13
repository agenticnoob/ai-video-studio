import { normalizeProject, type VideoProject, type VideoSegment } from "../project-schema";
import { storyboardPlanSchema, type StoryboardPlan } from "../storyboard-plan-schema";
import { StoryboardSegmentNotFoundError, generateSegmentNarrationAsset } from "../tts";
import type { TtsProviderId } from "../tts/config";
import type { VoiceCloneRequest } from "../tts/voice-references";
import { minimaxGenerateRevisedSegmentPlan, minimaxGenerateStoryboardPlan } from "../minimax";
import {
  assembleStagedProject,
  orderPlanSegments,
  replaceSegmentAndNarrationLayer,
} from "./assembly";
import {
  canFallbackToExistingSegment,
  compilePlannedSegment,
  createExistingSegmentCompileFallback,
  generateAndCompilePlannedSegment,
  type CompilePlannedSegmentResult,
} from "./segment";
import type { SegmentNarrationAsset } from "../narration-asset-schema";

export type GenerateStagedProjectFromPlanRequest = {
  onProgress?: StagedGenerationProgressReporter;
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
  onProgress?: StagedGenerationProgressReporter;
  project: VideoProject;
  provider?: TtsProviderId;
  revisionPrompt: string;
  segmentId: string;
  voiceClone?: VoiceCloneRequest;
  voiceId?: string;
};

export type GenerateStagedSegmentRevisionResult = {
  compilerAttempts: number;
  compilerFallback?: CompilePlannedSegmentResult["compilerFallback"];
  narration: SegmentNarrationAsset;
  plan: StoryboardPlan;
  plannerAttempts: number;
  plannerRepaired: boolean;
  project: VideoProject;
  repaired: boolean;
  renderStrategy: CompilePlannedSegmentResult["renderStrategy"];
  segment: VideoSegment;
};

export type StagedGenerationProgressReporter = (
  stepId: "planner" | "narration" | "compiler" | "assembly",
  status: "running" | "success" | "failure",
  detail?: string,
) => void;

export const generateStagedProjectFromPlan = async ({
  onProgress,
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
        onProgress,
        plan,
        provider,
        segment,
        voiceClone,
        voiceId,
      }),
    );
  }

  onProgress?.("assembly", "running", "Assembling compiled segments into VideoProject.");
  const project = assembleStagedProject({
    compiledSegments,
    plan,
  });
  onProgress?.("assembly", "success", "VideoProject assembled.");

  return {
    plan,
    project,
    segments: compiledSegments,
  };
};

export const generateStagedSegmentRevision = async ({
  onProgress,
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

  onProgress?.("planner", "running", "Planning revised segment.");
  let plannerResult: Awaited<ReturnType<typeof minimaxGenerateRevisedSegmentPlan>>;
  try {
    plannerResult = await minimaxGenerateRevisedSegmentPlan({
      project,
      revisionPrompt,
      segmentId,
    });
    onProgress?.("planner", "success", "Revised segment plan generated.");
  } catch (error) {
    onProgress?.("planner", "failure", error instanceof Error ? error.message : undefined);
    throw error;
  }

  const { attempts: plannerAttempts, plan: rawPlan, repaired: plannerRepaired } = plannerResult;
  const plan = storyboardPlanSchema.parse(rawPlan);
  const [plannedSegment] = plan.segments;
  onProgress?.("narration", "running", `Generating narration for ${segmentId}.`);
  let narration: SegmentNarrationAsset;
  try {
    narration = await generateSegmentNarrationAsset({
      plan,
      provider,
      segmentId,
      voiceId,
      voiceClone,
    });
    onProgress?.("narration", "success", `Narration generated for ${segmentId}.`);
  } catch (error) {
    onProgress?.("narration", "failure", error instanceof Error ? error.message : undefined);
    throw error;
  }

  onProgress?.("compiler", "running", `Compiling template for ${segmentId}.`);
  let compiled: CompilePlannedSegmentResult;
  try {
    compiled = await compilePlannedSegment({
      narration,
      plan,
      segment: plannedSegment,
    });
    onProgress?.("compiler", "success", `Template compiled for ${segmentId}.`);
  } catch (error) {
    if (canFallbackToExistingSegment(plannedSegment)) {
      compiled = createExistingSegmentCompileFallback({
        error,
        narration,
        segment: project.segments[segmentIndex],
      });
      onProgress?.(
        "compiler",
        "success",
        `SceneGraph compilation failed for ${segmentId}; preserved existing segment.`,
      );
    } else {
      onProgress?.("compiler", "failure", error instanceof Error ? error.message : undefined);
      throw error;
    }
  }

  onProgress?.("assembly", "running", "Replacing selected segment in VideoProject.");
  const revisedProject = compiled.compilerFallback
    ? project
    : replaceSegmentAndNarrationLayer({
        narration,
        project,
        segment: compiled.segment,
        segmentId,
      });
  onProgress?.(
    "assembly",
    "success",
    compiled.compilerFallback ? "Existing segment preserved." : "Selected segment replaced.",
  );

  return {
    compilerAttempts: compiled.compilerAttempts,
    compilerFallback: compiled.compilerFallback,
    narration,
    plan,
    plannerAttempts,
    plannerRepaired,
    project: revisedProject,
    repaired: compiled.repaired,
    renderStrategy: compiled.renderStrategy,
    segment: compiled.segment,
  };
};

export type GenerateStagedProjectFromBriefRequest = {
  brief: string;
  onProgress?: StagedGenerationProgressReporter;
  provider?: TtsProviderId;
  voiceClone?: VoiceCloneRequest;
  voiceId?: string;
};

export const generateStagedProjectFromBrief = async ({
  brief,
  onProgress,
  provider,
  voiceClone,
  voiceId,
}: GenerateStagedProjectFromBriefRequest): Promise<GenerateStagedProjectResult> => {
  onProgress?.("planner", "running", "Generating storyboard plan from brief.");
  let plannerResult: Awaited<ReturnType<typeof minimaxGenerateStoryboardPlan>>;
  try {
    plannerResult = await minimaxGenerateStoryboardPlan({
      brief,
    });
    onProgress?.("planner", "success", "Storyboard plan generated.");
  } catch (error) {
    onProgress?.("planner", "failure", error instanceof Error ? error.message : undefined);
    throw error;
  }

  const { attempts: plannerAttempts, plan, repaired: plannerRepaired } = plannerResult;
  const result = await generateStagedProjectFromPlan({
    onProgress,
    plan,
    provider,
    voiceClone,
    voiceId,
  });
  return {
    ...result,
    plannerAttempts,
    plannerRepaired,
  };
};
