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
  WC_PREDICTION_COMPOSITION_ID,
  WC_PREDICTION_DURATION_IN_FRAMES,
  WC_PREDICTION_FPS,
  WC_PREDICTION_HEIGHT,
  WC_PREDICTION_WIDTH,
  WorldCupPrediction,
} from "./standalone-samples/WorldCupPrediction";

import {
  WORLD_CUP_BETTING_ANALYSIS_COMPOSITION_ID,
  WORLD_CUP_BETTING_ANALYSIS_DURATION_IN_FRAMES,
  WORLD_CUP_BETTING_ANALYSIS_FPS,
  WORLD_CUP_BETTING_ANALYSIS_HEIGHT,
  WORLD_CUP_BETTING_ANALYSIS_WIDTH,
  WorldCupBettingAnalysisVideo,
} from "./WorldCupBettingAnalysis";
import {
  getUvOpenSourceBriefDuration,
  UV_OPEN_SOURCE_BRIEF_COMPOSITION_ID,
  UV_OPEN_SOURCE_BRIEF_FPS,
  UV_OPEN_SOURCE_BRIEF_HEIGHT,
  UV_OPEN_SOURCE_BRIEF_WIDTH,
  uvOpenSourceBriefData,
  UvOpenSourceBriefVideo,
} from "./UvOpenSourceBrief";
import {
  getOpenAiHardwareNewsBriefDuration,
  OPENAI_HARDWARE_NEWS_BRIEF_COMPOSITION_ID,
  OPENAI_HARDWARE_NEWS_BRIEF_FPS,
  OPENAI_HARDWARE_NEWS_BRIEF_HEIGHT,
  OPENAI_HARDWARE_NEWS_BRIEF_WIDTH,
  openAiHardwareNewsBriefData,
  OpenAiHardwareNewsBriefVideo,
} from "./OpenAiHardwareNewsBrief";
import {
  AI_DAILY_NEWS_BRIEF_20260708_COMPOSITION_ID,
  AI_DAILY_NEWS_BRIEF_20260708_FPS,
  AI_DAILY_NEWS_BRIEF_20260708_HEIGHT,
  AI_DAILY_NEWS_BRIEF_20260708_WIDTH,
  AiDailyNewsBrief20260708Video,
  aiDailyNewsBrief20260708Data,
  getAiDailyNewsBrief20260708Duration,
} from "./AiDailyNewsBrief20260708";
import {
  AI_CONCEPTS_FOR_BEGINNERS_COMPOSITION_ID,
  AI_CONCEPTS_FOR_BEGINNERS_FPS,
  AI_CONCEPTS_FOR_BEGINNERS_HEIGHT,
  AI_CONCEPTS_FOR_BEGINNERS_WIDTH,
  AiConceptsForBeginnersVideo,
  aiConceptsForBeginnersData,
  getAiConceptsForBeginnersDuration,
} from "./AiConceptsForBeginners";
import {
  AI_DAILY_NEWS_BRIEF_20260709_COMPOSITION_ID,
  AI_DAILY_NEWS_BRIEF_20260709_FPS,
  AI_DAILY_NEWS_BRIEF_20260709_HEIGHT,
  AI_DAILY_NEWS_BRIEF_20260709_WIDTH,
  AiDailyNewsBrief20260709Video,
  aiDailyNewsBrief20260709Data,
  getAiDailyNewsBrief20260709Duration,
} from "./AiDailyNewsBrief20260709";
import {
  AI_NEWS_STRATEGIC_BRIEF_20260709_COMPOSITION_ID,
  AI_NEWS_STRATEGIC_BRIEF_20260709_FPS,
  AI_NEWS_STRATEGIC_BRIEF_20260709_HEIGHT,
  AI_NEWS_STRATEGIC_BRIEF_20260709_WIDTH,
  AiNewsStrategicBrief20260709Video,
  aiNewsStrategicBrief20260709Data,
  getAiNewsStrategicBrief20260709Duration,
} from "./AiNewsStrategicBrief20260709";
import {
  AI_NEWS_COMPOSITION_ID,
  AiNewsVideo,
  VIDEO_DURATION_IN_FRAMES,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "./standalone-samples/AiNewsDaily";
import {
  AI_NEWS_60S_ID,
  AiNews60sVideo,
  VIDEO_DURATION_IN_FRAMES as AINEWS60S_DURATION,
  VIDEO_FPS as AINEWS60S_FPS,
  VIDEO_WIDTH as AINEWS60S_WIDTH,
  VIDEO_HEIGHT as AINEWS60S_HEIGHT,
} from "./standalone-samples/AiNews60s";
import {
  PROG_THINKING_COMPOSITION_ID,
  PROG_THINKING_DURATION,
  PROG_THINKING_FPS,
  PROG_THINKING_HEIGHT,
  PROG_THINKING_WIDTH,
  AiProgrammingThinking,
} from "./standalone-samples/AiProgrammingThinking";
import {
  GIT_TUTORIAL_COMPOSITION_ID,
  GIT_TUTORIAL_FPS,
  GIT_TUTORIAL_HEIGHT,
  GIT_TUTORIAL_WIDTH,
  GitTutorialForDevsVideo,
  gitTutorialData,
  getGitTutorialDuration,
} from "./GitTutorialForDevs";
import {
  HERMES_COMPOSITION_ID,
  HERMES_FPS,
  HERMES_HEIGHT,
  HERMES_WIDTH,
  HermesInnerLandscapeVideo,
  getHermesDuration,
} from "./HermesInnerLandscape";
import {
  COMPOSITION_ID as RAW_THOUGHT_COMPOSITION_ID,
  FPS as RAW_THOUGHT_FPS,
  HEIGHT as RAW_THOUGHT_HEIGHT,
  WIDTH as RAW_THOUGHT_WIDTH,
  RawThoughtMirrorVideo,
  getRawThoughtDuration,
} from "./RawThoughtMirror";

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
      <Composition
        id={UV_OPEN_SOURCE_BRIEF_COMPOSITION_ID}
        component={UvOpenSourceBriefVideo}
        durationInFrames={getUvOpenSourceBriefDuration(uvOpenSourceBriefData)}
        fps={UV_OPEN_SOURCE_BRIEF_FPS}
        width={UV_OPEN_SOURCE_BRIEF_WIDTH}
        height={UV_OPEN_SOURCE_BRIEF_HEIGHT}
      />
      <Composition
        id={OPENAI_HARDWARE_NEWS_BRIEF_COMPOSITION_ID}
        component={OpenAiHardwareNewsBriefVideo}
        durationInFrames={getOpenAiHardwareNewsBriefDuration(openAiHardwareNewsBriefData)}
        fps={OPENAI_HARDWARE_NEWS_BRIEF_FPS}
        width={OPENAI_HARDWARE_NEWS_BRIEF_WIDTH}
        height={OPENAI_HARDWARE_NEWS_BRIEF_HEIGHT}
      />
      <Composition
        id={AI_DAILY_NEWS_BRIEF_20260708_COMPOSITION_ID}
        component={AiDailyNewsBrief20260708Video}
        durationInFrames={getAiDailyNewsBrief20260708Duration(aiDailyNewsBrief20260708Data)}
        fps={AI_DAILY_NEWS_BRIEF_20260708_FPS}
        width={AI_DAILY_NEWS_BRIEF_20260708_WIDTH}
        height={AI_DAILY_NEWS_BRIEF_20260708_HEIGHT}
      />
      <Composition
        id={AI_CONCEPTS_FOR_BEGINNERS_COMPOSITION_ID}
        component={AiConceptsForBeginnersVideo}
        durationInFrames={getAiConceptsForBeginnersDuration(aiConceptsForBeginnersData)}
        fps={AI_CONCEPTS_FOR_BEGINNERS_FPS}
        width={AI_CONCEPTS_FOR_BEGINNERS_WIDTH}
        height={AI_CONCEPTS_FOR_BEGINNERS_HEIGHT}
      />
      <Composition
        id={AI_DAILY_NEWS_BRIEF_20260709_COMPOSITION_ID}
        component={AiDailyNewsBrief20260709Video}
        durationInFrames={getAiDailyNewsBrief20260709Duration(aiDailyNewsBrief20260709Data)}
        fps={AI_DAILY_NEWS_BRIEF_20260709_FPS}
        width={AI_DAILY_NEWS_BRIEF_20260709_WIDTH}
        height={AI_DAILY_NEWS_BRIEF_20260709_HEIGHT}
      />
      <Composition
        id={AI_NEWS_STRATEGIC_BRIEF_20260709_COMPOSITION_ID}
        component={AiNewsStrategicBrief20260709Video}
        durationInFrames={getAiNewsStrategicBrief20260709Duration(aiNewsStrategicBrief20260709Data)}
        fps={AI_NEWS_STRATEGIC_BRIEF_20260709_FPS}
        width={AI_NEWS_STRATEGIC_BRIEF_20260709_WIDTH}
        height={AI_NEWS_STRATEGIC_BRIEF_20260709_HEIGHT}
      />
      <Composition
        id={AI_NEWS_COMPOSITION_ID}
        component={AiNewsVideo}
        durationInFrames={VIDEO_DURATION_IN_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
      />
      <Composition
        id={AI_NEWS_60S_ID}
        component={AiNews60sVideo}
        durationInFrames={AINEWS60S_DURATION}
        fps={AINEWS60S_FPS}
        width={AINEWS60S_WIDTH}
        height={AINEWS60S_HEIGHT}
      />

      <Composition
        id={PROG_THINKING_COMPOSITION_ID}
        component={AiProgrammingThinking}
        durationInFrames={PROG_THINKING_DURATION}
        fps={PROG_THINKING_FPS}
        width={PROG_THINKING_WIDTH}
        height={PROG_THINKING_HEIGHT}
      />

      <Composition
        id={WC_PREDICTION_COMPOSITION_ID}
        component={WorldCupPrediction}
        durationInFrames={WC_PREDICTION_DURATION_IN_FRAMES}
        fps={WC_PREDICTION_FPS}
        width={WC_PREDICTION_WIDTH}
        height={WC_PREDICTION_HEIGHT}
      />
      <Composition
        id={GIT_TUTORIAL_COMPOSITION_ID}
        component={GitTutorialForDevsVideo}
        defaultProps={{ data: gitTutorialData }}
        durationInFrames={getGitTutorialDuration(gitTutorialData)}
        fps={GIT_TUTORIAL_FPS}
        width={GIT_TUTORIAL_WIDTH}
        height={GIT_TUTORIAL_HEIGHT}
      />
      <Composition
        id={HERMES_COMPOSITION_ID}
        component={HermesInnerLandscapeVideo}
        durationInFrames={getHermesDuration()}
        fps={HERMES_FPS}
        width={HERMES_WIDTH}
        height={HERMES_HEIGHT}
      />
    <Composition
        id={RAW_THOUGHT_COMPOSITION_ID}
        component={RawThoughtMirrorVideo}
        durationInFrames={getRawThoughtDuration()}
        fps={RAW_THOUGHT_FPS}
        width={RAW_THOUGHT_WIDTH}
        height={RAW_THOUGHT_HEIGHT}
      />
    </>
  );
};
