import { segmentNarrationFromAsset, type SegmentNarrationAsset } from "../narration-asset-schema";
import { videoSegmentSchema, type VideoSegment } from "../project-schema";
import type {
  RenderStrategy,
  StoryboardPlan,
  StoryboardSegmentPlan,
  StrategyDecision,
} from "../storyboard-plan-schema";
import { buildFallbackSpotlightContent } from "../fallback-spotlight-content";
import { generateSegmentNarrationAsset } from "../tts";
import type { TtsProviderId } from "../tts/config";
import type { VoiceCloneRequest } from "../tts/voice-references";
import { minimaxCompileTemplateImplementation } from "../minimax";
import { compileProceduralGeneratorSegment } from "../procedural-generator-compiler";
import {
  SCENE_GRAPH_TEMPLATE_ID,
  SPOTLIGHT_TEMPLATE_ID,
  getTemplateDefinition,
  type TemplateId,
} from "../template-registry";
import { TemplateImplementationParseError } from "../minimax/parse-template-implementation";
import type { ProceduralGeneratorDiagnostics } from "../procedural-generator-schema";
import type { StagedGenerationProgressReporter } from "./pipeline";

export type CompilePlannedSegmentRequest = {
  narration: SegmentNarrationAsset;
  plan: StoryboardPlan;
  segment: StoryboardSegmentPlan;
};

export type CompilePlannedSegmentResult = {
  compilerAttempts: number;
  compilerFallback?: CompilePlannedSegmentFallback;
  narration: SegmentNarrationAsset;
  proceduralGenerator?: ProceduralGeneratorDiagnostics;
  repaired: boolean;
  renderStrategy: RenderStrategy;
  segment: VideoSegment;
  strategyDecision: StrategyDecision;
};

export type CompilePlannedSegmentFallback = {
  reason: string;
  type: "preserved_existing_segment" | "template_macro";
};

export type GenerateAndCompilePlannedSegmentRequest = {
  onProgress?: StagedGenerationProgressReporter;
  plan: StoryboardPlan;
  provider?: TtsProviderId;
  segment: StoryboardSegmentPlan;
  voiceClone?: VoiceCloneRequest;
  voiceId?: string;
};

const getTargetDurationInFrames = (
  segment: StoryboardSegmentPlan,
  narration: SegmentNarrationAsset,
): number => {
  const recommended = getTemplateDefinition(segment.templateId).capabilities
    .recommendedDurationFrames;
  return Math.max(narration.durationInFrames, recommended.min);
};

const getCompileRenderStrategy = (templateId: TemplateId): RenderStrategy =>
  templateId === SCENE_GRAPH_TEMPLATE_ID ? "primitive_scene_graph" : "template_macro";

export const canFallbackToExistingSegment = (segment: StoryboardSegmentPlan): boolean =>
  segment.templateId === SCENE_GRAPH_TEMPLATE_ID;

const getCompilerAttemptsFromError = (error: unknown): number =>
  error instanceof TemplateImplementationParseError && error.attempts ? error.attempts : 1;

const getFallbackReason = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback;

export const createExistingSegmentCompileFallback = ({
  error,
  narration,
  plannedSegment,
  segment,
}: {
  error: unknown;
  narration: SegmentNarrationAsset;
  plannedSegment: StoryboardSegmentPlan;
  segment: VideoSegment;
}): CompilePlannedSegmentResult => {
  const attempts = getCompilerAttemptsFromError(error);
  const reason = getFallbackReason(error, "SceneGraph compilation failed.");

  return {
    compilerAttempts: attempts,
    compilerFallback: {
      reason,
      type: "preserved_existing_segment",
    },
    narration,
    repaired: attempts > 1,
    renderStrategy: getCompileRenderStrategy(segment.templateId),
    segment,
    strategyDecision: plannedSegment.strategyDecision,
  };
};

export const createTemplateMacroCompileFallback = ({
  error,
  narration,
  segment,
  proceduralGenerator,
}: {
  error: unknown;
  narration: SegmentNarrationAsset;
  proceduralGenerator?: ProceduralGeneratorDiagnostics;
  segment: StoryboardSegmentPlan;
}): CompilePlannedSegmentResult => {
  const attempts = getCompilerAttemptsFromError(error);
  const reason = getFallbackReason(error, "SceneGraph compilation failed.");
  const content = buildFallbackSpotlightContent({
    narrationText: narration.text,
    segment,
  });
  const durationInFrames = getTargetDurationInFrames(segment, narration);
  const videoSegment = videoSegmentSchema.parse({
    id: segment.id,
    title: content.title,
    intent: segment.purpose,
    narration: segmentNarrationFromAsset(narration),
    templateId: SPOTLIGHT_TEMPLATE_ID,
    implementation: {
      meta: {
        title: content.title,
        fps: 30,
        width: 1280,
        height: 720,
      },
      theme: {
        background: "#101827",
        panel: "rgba(248,250,252,0.10)",
        primary: "#7dd3fc",
        secondary: "#f59e0b",
        text: "#f8fafc",
        muted: "#cbd5e1",
      },
      durationInFrames,
      kicker: content.kicker,
      headline: content.headline,
      subheadline: content.subheadline,
      callouts: content.callouts,
    },
  });

  return {
    compilerAttempts: attempts,
    compilerFallback: {
      reason,
      type: "template_macro",
    },
    narration,
    ...(proceduralGenerator ? { proceduralGenerator } : {}),
    repaired: attempts > 1,
    renderStrategy: "template_macro",
    segment: videoSegment,
    strategyDecision: segment.strategyDecision,
  };
};

export const compilePlannedSegment = async ({
  narration,
  plan,
  segment,
}: CompilePlannedSegmentRequest): Promise<CompilePlannedSegmentResult> => {
  if (segment.proceduralGenerator) {
    return compileProceduralGeneratorSegment({
      generator: segment.proceduralGenerator,
      narration,
      segment,
    });
  }

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
    renderStrategy: getCompileRenderStrategy(segment.templateId),
    segment: videoSegment,
    strategyDecision: segment.strategyDecision,
  };
};

export const generateAndCompilePlannedSegment = async ({
  onProgress,
  plan,
  provider,
  segment,
  voiceClone,
  voiceId,
}: GenerateAndCompilePlannedSegmentRequest): Promise<CompilePlannedSegmentResult> => {
  onProgress?.("narration", "running", `Generating narration for ${segment.id}.`);
  let narration: SegmentNarrationAsset;
  try {
    narration = await generateSegmentNarrationAsset({
      plan,
      provider,
      segmentId: segment.id,
      voiceId,
      voiceClone,
    });
    onProgress?.("narration", "success", `Narration generated for ${segment.id}.`);
  } catch (error) {
    onProgress?.("narration", "failure", error instanceof Error ? error.message : undefined);
    throw error;
  }

  onProgress?.("compiler", "running", `Compiling template for ${segment.id}.`);
  try {
    const compiled = await compilePlannedSegment({
      narration,
      plan,
      segment,
    });
    onProgress?.("compiler", "success", `Template compiled for ${segment.id}.`);
    return compiled;
  } catch (error) {
    if (canFallbackToExistingSegment(segment)) {
      const fallback = createTemplateMacroCompileFallback({
        error,
        narration,
        segment,
      });
      onProgress?.(
        "compiler",
        "success",
        `SceneGraph compilation failed for ${segment.id}; fell back to template macro.`,
      );
      return fallback;
    }
    onProgress?.("compiler", "failure", error instanceof Error ? error.message : undefined);
    throw error;
  }
};
