import type { FC } from "react";
import { Composition } from "remotion";
import {
  scriptedTemplateSmokeProject,
  spotlightTemplateSmokeProject,
  statsDashboardSmokeProject,
  technicalExplainerPreviewProject,
} from "../lib/staged-smoke-fixtures";
import { getProjectDuration, videoProjectSchema, type VideoProject } from "../lib/project-schema";
import { sampleProject } from "../lib/sample-video";
import {
  getPixelRAGChineseStandaloneDuration,
  PixelRAGChineseStandaloneVideo,
  pixelragChineseStandaloneData,
  PIXELRAG_CHINESE_STANDALONE_COMPOSITION_ID,
  PIXELRAG_CHINESE_STANDALONE_FPS,
  PIXELRAG_CHINESE_STANDALONE_HEIGHT,
  PIXELRAG_CHINESE_STANDALONE_WIDTH,
} from "./PixelRAGChineseStandalone";
import { ProjectVideo } from "./ProjectVideo/ProjectVideo";
import { RecipeShowcasePreview } from "./RecipeShowcase/RecipeShowcasePreview";
import {
  WORLD_CUP_BETTING_ANALYSIS_COMPOSITION_ID,
  WORLD_CUP_BETTING_ANALYSIS_DURATION_IN_FRAMES,
  WORLD_CUP_BETTING_ANALYSIS_FPS,
  WORLD_CUP_BETTING_ANALYSIS_HEIGHT,
  WORLD_CUP_BETTING_ANALYSIS_WIDTH,
  WorldCupBettingAnalysisVideo,
} from "./WorldCupBettingAnalysis";

const calculateVideoProjectMetadata = ({ props }: { props: VideoProject }) => {
  const parsedProject = videoProjectSchema.parse(props) as VideoProject;

  return {
    durationInFrames: getProjectDuration(parsedProject),
    fps: parsedProject.meta.fps,
    width: parsedProject.meta.width,
    height: parsedProject.meta.height,
  };
};

export const RemotionRoot: FC = () => {
  return (
    <>
      <Composition
        id="RecipeShowcasePreview"
        component={RecipeShowcasePreview}
        durationInFrames={1980}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="ProjectVideo"
        component={ProjectVideo}
        schema={videoProjectSchema}
        defaultProps={sampleProject}
        durationInFrames={getProjectDuration(sampleProject)}
        fps={30}
        width={1280}
        height={720}
        calculateMetadata={calculateVideoProjectMetadata}
      />
      <Composition
        id="ScriptedTemplatePreview"
        component={ProjectVideo}
        schema={videoProjectSchema}
        defaultProps={scriptedTemplateSmokeProject}
        durationInFrames={getProjectDuration(scriptedTemplateSmokeProject)}
        fps={30}
        width={1280}
        height={720}
        calculateMetadata={calculateVideoProjectMetadata}
      />
      <Composition
        id="SpotlightTemplatePreview"
        component={ProjectVideo}
        schema={videoProjectSchema}
        defaultProps={spotlightTemplateSmokeProject}
        durationInFrames={getProjectDuration(spotlightTemplateSmokeProject)}
        fps={30}
        width={1280}
        height={720}
        calculateMetadata={calculateVideoProjectMetadata}
      />
      <Composition
        id="StatsDashboardTemplatePreview"
        component={ProjectVideo}
        schema={videoProjectSchema}
        defaultProps={statsDashboardSmokeProject}
        durationInFrames={getProjectDuration(statsDashboardSmokeProject)}
        fps={30}
        width={1280}
        height={720}
        calculateMetadata={calculateVideoProjectMetadata}
      />
      <Composition
        id="TechnicalExplainerTemplatePreview"
        component={ProjectVideo}
        schema={videoProjectSchema}
        defaultProps={technicalExplainerPreviewProject}
        durationInFrames={getProjectDuration(technicalExplainerPreviewProject)}
        fps={30}
        width={1280}
        height={720}
        calculateMetadata={calculateVideoProjectMetadata}
      />
      <Composition
        id={PIXELRAG_CHINESE_STANDALONE_COMPOSITION_ID}
        component={PixelRAGChineseStandaloneVideo}
        defaultProps={{ data: pixelragChineseStandaloneData }}
        durationInFrames={getPixelRAGChineseStandaloneDuration(pixelragChineseStandaloneData)}
        fps={PIXELRAG_CHINESE_STANDALONE_FPS}
        width={PIXELRAG_CHINESE_STANDALONE_WIDTH}
        height={PIXELRAG_CHINESE_STANDALONE_HEIGHT}
      />
      <Composition
        id={WORLD_CUP_BETTING_ANALYSIS_COMPOSITION_ID}
        component={WorldCupBettingAnalysisVideo}
        durationInFrames={WORLD_CUP_BETTING_ANALYSIS_DURATION_IN_FRAMES}
        fps={WORLD_CUP_BETTING_ANALYSIS_FPS}
        width={WORLD_CUP_BETTING_ANALYSIS_WIDTH}
        height={WORLD_CUP_BETTING_ANALYSIS_HEIGHT}
      />
    </>
  );
};
