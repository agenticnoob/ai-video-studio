import { segmentNarrationFromAsset, type SegmentNarrationAsset } from "./narration-asset-schema";
import { buildFallbackSpotlightContent } from "./fallback-spotlight-content";
import {
  buildProceduralGeneratorDiagnostics,
  compileNodeGraphFlowToSceneGraph,
  type NodeGraphFlowGenerator,
  type ProceduralGenerator,
  type ProceduralGeneratorDiagnostics,
} from "./procedural-generator-schema";
import { videoSegmentSchema, type VideoSegment } from "./project-schema";
import type {
  RenderStrategy,
  StoryboardSegmentPlan,
  StrategyDecision,
} from "./storyboard-plan-schema";
import { SCENE_GRAPH_TEMPLATE_ID, SPOTLIGHT_TEMPLATE_ID } from "./template-registry";

export type ProceduralGeneratorCompileFallback = {
  reason: string;
  type: "template_macro";
};

export type ProceduralGeneratorSegmentCompileResult = {
  compilerAttempts: number;
  compilerFallback?: ProceduralGeneratorCompileFallback;
  narration: SegmentNarrationAsset;
  proceduralGenerator: ProceduralGeneratorDiagnostics;
  repaired: boolean;
  renderStrategy: RenderStrategy;
  segment: VideoSegment;
  strategyDecision: StrategyDecision;
};

export type CompileProceduralGeneratorSegmentRequest = {
  generator: ProceduralGenerator;
  narration: SegmentNarrationAsset;
  segment: StoryboardSegmentPlan;
};

const compileProceduralGeneratorImplementation = (generator: ProceduralGenerator) => {
  if (generator.generatorId === "node-graph-flow") {
    return compileNodeGraphFlowToSceneGraph(generator as NodeGraphFlowGenerator);
  }

  throw new Error(`Unsupported procedural generator "${generator.generatorId}".`);
};

const createTemplateMacroFallbackSegment = ({
  narration,
  segment,
}: {
  narration: SegmentNarrationAsset;
  segment: StoryboardSegmentPlan;
}): VideoSegment => {
  const content = buildFallbackSpotlightContent({
    narrationText: narration.text,
    segment,
  });

  return videoSegmentSchema.parse({
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
      durationInFrames: narration.durationInFrames,
      kicker: content.kicker,
      headline: content.headline,
      subheadline: content.subheadline,
      callouts: content.callouts,
    },
  });
};

export const compileProceduralGeneratorSegment = ({
  generator,
  narration,
  segment,
}: CompileProceduralGeneratorSegmentRequest): ProceduralGeneratorSegmentCompileResult => {
  try {
    const implementation = compileProceduralGeneratorImplementation(generator);
    const videoSegment = videoSegmentSchema.parse({
      id: segment.id,
      title: segment.title ?? generator.generatorId,
      intent: segment.purpose,
      narration: segmentNarrationFromAsset(narration),
      templateId: SCENE_GRAPH_TEMPLATE_ID,
      implementation,
    });

    return {
      compilerAttempts: 1,
      narration,
      proceduralGenerator: buildProceduralGeneratorDiagnostics(generator),
      repaired: false,
      renderStrategy: "primitive_scene_graph",
      segment: videoSegment,
      strategyDecision: segment.strategyDecision,
    };
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : "Procedural generator compilation failed.";

    return {
      compilerAttempts: 1,
      compilerFallback: {
        reason,
        type: "template_macro",
      },
      narration,
      proceduralGenerator: buildProceduralGeneratorDiagnostics(generator, {
        compiledRenderStrategy: "template_macro",
        fallback: {
          reason,
          type: "template_macro",
        },
      }),
      repaired: false,
      renderStrategy: "template_macro",
      segment: createTemplateMacroFallbackSegment({
        narration,
        segment,
      }),
      strategyDecision: segment.strategyDecision,
    };
  }
};
