import type { FC } from "react";
import { AbsoluteFill, Sequence } from "remotion";

import {
  getSceneContentPrerollFrom,
  SceneTransitionStage,
  type RecipeSceneTransitionMotion,
} from "../../remotion/recipes/motion";
import type { RuntimeTemplateEditorProps } from "../editor-types";
import { defineRuntimeTemplate } from "../runtime-definition";
import { TechnicalExplainerEditor } from "./editor";
import {
  ArchitectureLayerStackScene,
  BeforeAfterCompareScene,
  CodeDiffHighlightScene,
  DecisionMatrixScene,
  HeroTitleRevealScene,
  MetricCountupScene,
  ProductUiZoomScene,
  ScreenshotEvidenceFlowScene,
  TerminalBuildRunScene,
  TimelineProgressScene,
  WorkflowNodeMapScene,
} from "./recipe-scenes";
import type {
  TechnicalExplainerSection,
  TechnicalExplainerSegment,
  TechnicalExplainerSpec,
} from "./schema";

const SECTION_OVERLAP_IN_FRAMES = 18;
const SECTION_TRANSITION_IN_FRAMES = 36;

export const getTechnicalExplainerSectionTimings = (spec: TechnicalExplainerSpec) => {
  const fallbackDuration = Math.max(
    60,
    Math.floor(spec.durationInFrames / Math.max(1, spec.sections.length)),
  );
  let cursor = 0;

  return spec.sections.map((section, index) => {
    const durationInFrames = section.durationInFrames ?? fallbackDuration;
    const from = Math.max(0, cursor - (index === 0 ? 0 : SECTION_OVERLAP_IN_FRAMES));
    cursor += durationInFrames;

    return {
      durationInFrames,
      sequence: {
        durationInFrames: durationInFrames + SECTION_OVERLAP_IN_FRAMES,
        from,
      },
    };
  });
};

const getMotionForSection = (section: TechnicalExplainerSection): RecipeSceneTransitionMotion => {
  if (
    section.recipeId === "terminal-build-run" ||
    section.recipeId === "metric-countup" ||
    section.recipeId === "code-diff-highlight" ||
    section.recipeId === "screenshot-evidence-flow"
  ) {
    return "fly-through";
  }
  return "stage-push";
};

const SectionScene: FC<{
  durationInFrames: number;
  section: TechnicalExplainerSection;
  spec: TechnicalExplainerSpec;
}> = ({ durationInFrames, section, spec }) => {
  switch (section.recipeId) {
    case "hero-title-reveal":
      return (
        <HeroTitleRevealScene
          durationInFrames={durationInFrames}
          section={section}
          theme={spec.theme}
        />
      );
    case "terminal-build-run":
      return (
        <TerminalBuildRunScene
          durationInFrames={durationInFrames}
          section={section}
          theme={spec.theme}
        />
      );
    case "workflow-node-map":
      return (
        <WorkflowNodeMapScene
          durationInFrames={durationInFrames}
          section={section}
          theme={spec.theme}
        />
      );
    case "metric-countup":
      return (
        <MetricCountupScene
          durationInFrames={durationInFrames}
          section={section}
          theme={spec.theme}
        />
      );
    case "timeline-progress":
      return (
        <TimelineProgressScene
          durationInFrames={durationInFrames}
          section={section}
          theme={spec.theme}
        />
      );
    case "code-diff-highlight":
      return (
        <CodeDiffHighlightScene
          durationInFrames={durationInFrames}
          section={section}
          theme={spec.theme}
        />
      );
    case "before-after-compare":
      return (
        <BeforeAfterCompareScene
          durationInFrames={durationInFrames}
          section={section}
          theme={spec.theme}
        />
      );
    case "decision-matrix":
      return (
        <DecisionMatrixScene
          durationInFrames={durationInFrames}
          section={section}
          theme={spec.theme}
        />
      );
    case "architecture-layer-stack":
      return (
        <ArchitectureLayerStackScene
          durationInFrames={durationInFrames}
          section={section}
          theme={spec.theme}
        />
      );
    case "screenshot-evidence-flow":
      return (
        <ScreenshotEvidenceFlowScene
          durationInFrames={durationInFrames}
          section={section}
          theme={spec.theme}
        />
      );
    case "product-ui-zoom":
      return (
        <ProductUiZoomScene
          durationInFrames={durationInFrames}
          section={section}
          theme={spec.theme}
        />
      );
  }
};

export const TechnicalExplainerVideo: FC<TechnicalExplainerSpec> = (spec) => {
  const sectionTimings = getTechnicalExplainerSectionTimings(spec);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: spec.theme.background,
        height: spec.meta.height,
        overflow: "hidden",
        perspective: 1200,
        width: spec.meta.width,
      }}
    >
      {spec.sections.map((section, index) => {
        const sectionTiming = sectionTimings[index]!;

        return (
          <Sequence {...sectionTiming.sequence} key={section.id}>
            <SceneTransitionStage
              height={spec.meta.height}
              index={index}
              motion={getMotionForSection(section)}
              overlapFrames={SECTION_OVERLAP_IN_FRAMES}
              sceneCount={spec.sections.length}
              sceneDurationInFrames={sectionTiming.durationInFrames}
              transitionFrames={SECTION_TRANSITION_IN_FRAMES}
              width={spec.meta.width}
            >
              <Sequence from={getSceneContentPrerollFrom(index)}>
                <SectionScene
                  durationInFrames={sectionTiming.durationInFrames}
                  section={section}
                  spec={spec}
                />
              </Sequence>
            </SceneTransitionStage>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const TechnicalExplainerRuntimeEditor: FC<RuntimeTemplateEditorProps> = (props) => (
  <TechnicalExplainerEditor
    isUploadingProductUiAsset={props.isUploadingProductUiAsset}
    inputClassName={props.inputClassName}
    onProductUiAssetRemove={props.onProductUiAssetRemove}
    onProductUiAssetUpload={props.onProductUiAssetUpload}
    parsePositiveInteger={props.parsePositiveInteger}
    productUiAssetError={props.productUiAssetError}
    productUiAssets={props.productUiAssets}
    segment={props.segment as TechnicalExplainerSegment}
    onSegmentChange={props.onSegmentChange as (segment: TechnicalExplainerSegment) => void}
  />
);

export const technicalExplainerRuntimeTemplate = defineRuntimeTemplate({
  renderSegment: (segment) => (
    <TechnicalExplainerVideo {...(segment.implementation as TechnicalExplainerSpec)} />
  ),
  Editor: TechnicalExplainerRuntimeEditor,
});
