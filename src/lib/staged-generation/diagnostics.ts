import type {
  GenerateStagedProjectResult,
  GenerateStagedSegmentRevisionResult,
} from "./pipeline";

type PlannerDiagnostics = {
  attempts: number;
  repaired: boolean;
};

type CompilerDiagnostics = {
  attempts: number;
  repaired: boolean;
  segmentId: string;
  templateId: string;
};

export type StagedGenerationDiagnostics = {
  captionSegmentCount: number;
  compiler: CompilerDiagnostics[];
  narrationLayerCount: number;
  narrationProviders: string[];
  narrationSegmentCount: number;
  planner?: PlannerDiagnostics;
  segmentCount: number;
};

export const buildStagedProjectDiagnostics = (
  result: GenerateStagedProjectResult,
): StagedGenerationDiagnostics => {
  const narrationSegmentCount = result.segments.filter(
    (segment) => segment.segment.narration?.audio,
  ).length;

  return {
    planner:
      result.plannerAttempts === undefined || result.plannerRepaired === undefined
        ? undefined
        : {
            attempts: result.plannerAttempts,
            repaired: result.plannerRepaired,
          },
    compiler: result.segments.map((segment) => ({
      attempts: segment.compilerAttempts,
      repaired: segment.repaired,
      segmentId: segment.segment.id,
      templateId: segment.segment.templateId,
    })),
    captionSegmentCount: result.segments.filter(
      (segment) => segment.segment.narration?.captions?.cues.length,
    ).length,
    narrationSegmentCount,
    narrationProviders: Array.from(
      new Set(
        result.segments
          .map((segment) => segment.narration.provider)
          .filter((provider): provider is string => Boolean(provider)),
      ),
    ),
    narrationLayerCount: narrationSegmentCount,
    segmentCount: result.segments.length,
  };
};

export const buildStagedSegmentRevisionDiagnostics = (
  result: GenerateStagedSegmentRevisionResult,
): StagedGenerationDiagnostics => {
  const narrationSegmentCount = result.segment.narration?.audio ? 1 : 0;

  return {
    planner: {
      attempts: result.plannerAttempts,
      repaired: result.plannerRepaired,
    },
    compiler: [
      {
        attempts: result.compilerAttempts,
        repaired: result.repaired,
        segmentId: result.segment.id,
        templateId: result.segment.templateId,
      },
    ],
    captionSegmentCount: result.segment.narration?.captions?.cues.length ? 1 : 0,
    narrationSegmentCount,
    narrationProviders: result.narration.provider ? [result.narration.provider] : [],
    narrationLayerCount: narrationSegmentCount,
    segmentCount: 1,
  };
};
