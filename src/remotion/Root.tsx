import type { FC } from "react";
import { Composition, Folder, Still } from "remotion";
import {
  AGENT_PRODUCER_MEDIA_SOUND_PROOF_COMPOSITION_ID,
  AGENT_PRODUCER_MEDIA_SOUND_PROOF_DURATION_IN_FRAMES,
  AGENT_PRODUCER_MEDIA_SOUND_PROOF_FPS,
  AGENT_PRODUCER_MEDIA_SOUND_PROOF_HEIGHT,
  AGENT_PRODUCER_MEDIA_SOUND_PROOF_WIDTH,
  AgentProducerMediaSoundProof,
  AgentProducerMediaSoundProofCover16x9,
  AgentProducerMediaSoundProofCover9x16,
} from "./AgentProducerMediaSoundProof";
import {
  DNS_RESOLUTION_EXPLAINER_COMPOSITION_ID,
  DNS_RESOLUTION_EXPLAINER_DURATION_IN_FRAMES,
  DNS_RESOLUTION_EXPLAINER_FPS,
  DNS_RESOLUTION_EXPLAINER_HEIGHT,
  DNS_RESOLUTION_EXPLAINER_WIDTH,
  DnsResolutionExplainer,
  DnsResolutionExplainerCover16x9,
  DnsResolutionExplainerCover9x16,
} from "./DnsResolutionExplainer";
import {
  TCP_HANDSHAKE_EDITORIAL_COMPOSITION_ID,
  TCP_HANDSHAKE_EDITORIAL_DURATION_IN_FRAMES,
  TCP_HANDSHAKE_EDITORIAL_FPS,
  TCP_HANDSHAKE_EDITORIAL_HEIGHT,
  TCP_HANDSHAKE_EDITORIAL_WIDTH,
  TcpHandshakeEditorial,
  TcpHandshakeEditorialCover16x9,
  TcpHandshakeEditorialCover9x16,
} from "./TcpHandshakeEditorial";
import {
  TCP_HANDSHAKE_TERMINAL_COMPOSITION_ID,
  TCP_HANDSHAKE_TERMINAL_DURATION_IN_FRAMES,
  TCP_HANDSHAKE_TERMINAL_FPS,
  TCP_HANDSHAKE_TERMINAL_HEIGHT,
  TCP_HANDSHAKE_TERMINAL_WIDTH,
  TcpHandshakeTerminal,
  TcpHandshakeTerminalCover16x9,
  TcpHandshakeTerminalCover9x16,
} from "./TcpHandshakeTerminal";
import {
  REMOTION_CAPABILITY_SHOWCASE_COMPOSITION_ID,
  REMOTION_CAPABILITY_SHOWCASE_DURATION_IN_FRAMES,
  REMOTION_CAPABILITY_SHOWCASE_FPS,
  REMOTION_CAPABILITY_SHOWCASE_HEIGHT,
  REMOTION_CAPABILITY_SHOWCASE_WIDTH,
  RemotionCapabilityShowcase,
} from "./capability-showcase";
import {
  getPixelRAGChineseStandaloneDuration,
  PixelRAGChineseStandaloneVideo,
  pixelragChineseStandaloneData,
  PIXELRAG_CHINESE_STANDALONE_COMPOSITION_ID,
  PIXELRAG_CHINESE_STANDALONE_FPS,
  PIXELRAG_CHINESE_STANDALONE_HEIGHT,
  PIXELRAG_CHINESE_STANDALONE_WIDTH,
} from "./PixelRAGChineseStandalone";
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
  AI_DAILY_NEWS_20260713_COMPOSITION_ID,
  AI_DAILY_NEWS_20260713_FPS,
  AI_DAILY_NEWS_20260713_HEIGHT,
  AI_DAILY_NEWS_20260713_WIDTH,
  AiDailyNews20260713Video,
  aiDailyNews20260713Data,
  getAiDailyNews20260713Duration,
} from "./AiDailyNews20260713";
import {
  AI_DAILY_NEWS_20260714_COMPOSITION_ID,
  AI_DAILY_NEWS_20260714_FPS,
  AI_DAILY_NEWS_20260714_HEIGHT,
  AI_DAILY_NEWS_20260714_WIDTH,
  AiDailyNews20260714Video,
  aiDailyNews20260714Data,
  getAiDailyNews20260714Duration,
} from "./AiDailyNews20260714";
import {
  AI_DAILY_NEWS_20260717_COMPOSITION_ID,
  AI_DAILY_NEWS_20260717_FPS,
  AI_DAILY_NEWS_20260717_HEIGHT,
  AI_DAILY_NEWS_20260717_WIDTH,
  AiDailyNews20260717Video,
  AiDailyNews20260717Cover16x9,
  AiDailyNews20260717Cover9x16,
  aiDailyNews20260717Data,
  getDuration as getAiDailyNews20260717Duration,
} from "./AiDailyNews20260717";
import {
  SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_COMPOSITION_ID,
  SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_DURATION_IN_FRAMES,
  SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_FPS,
  SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_HEIGHT,
  SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_WIDTH,
  SuperintelligenceBeyondHumanCognitionCover16x9,
  SuperintelligenceBeyondHumanCognitionCover9x16,
  SuperintelligenceBeyondHumanCognitionVideo,
} from "./SuperintelligenceBeyondHumanCognition";
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
import {
  COMPOSITION_ID as AI_CONCEPTS_REDEFINED_COMPOSITION_ID,
  FPS as AI_CONCEPTS_REDEFINED_FPS,
  HEIGHT as AI_CONCEPTS_REDEFINED_HEIGHT,
  WIDTH as AI_CONCEPTS_REDEFINED_WIDTH,
  AiConceptsRedefinedVideo,
  getAiConceptsRedefinedDuration,
  data as aiConceptsRedefinedData,
} from "./AiConceptsRedefined";
import {
  COMPOSITION_ID as BEYOND_LANGUAGE_COMPOSITION_ID,
  FPS as BEYOND_LANGUAGE_FPS,
  HEIGHT as BEYOND_LANGUAGE_HEIGHT,
  WIDTH as BEYOND_LANGUAGE_WIDTH,
  BeyondLanguageVideo,
  getBeyondLanguageDuration,
  data as beyondLanguageData,
} from "./BeyondLanguage";

export const RemotionRoot: FC = () => {
  return (
    <>
      <Folder name="Agent-Producer-Inventory">
        <Composition
          id={REMOTION_CAPABILITY_SHOWCASE_COMPOSITION_ID}
          component={RemotionCapabilityShowcase}
          durationInFrames={REMOTION_CAPABILITY_SHOWCASE_DURATION_IN_FRAMES}
          fps={REMOTION_CAPABILITY_SHOWCASE_FPS}
          width={REMOTION_CAPABILITY_SHOWCASE_WIDTH}
          height={REMOTION_CAPABILITY_SHOWCASE_HEIGHT}
        />
        <Composition
          id={AGENT_PRODUCER_MEDIA_SOUND_PROOF_COMPOSITION_ID}
          component={AgentProducerMediaSoundProof}
          durationInFrames={AGENT_PRODUCER_MEDIA_SOUND_PROOF_DURATION_IN_FRAMES}
          fps={AGENT_PRODUCER_MEDIA_SOUND_PROOF_FPS}
          width={AGENT_PRODUCER_MEDIA_SOUND_PROOF_WIDTH}
          height={AGENT_PRODUCER_MEDIA_SOUND_PROOF_HEIGHT}
        />
        <Still
          id="AgentProducerMediaSoundProofCover16x9"
          component={AgentProducerMediaSoundProofCover16x9}
          width={1920}
          height={1080}
        />
        <Still
          id="AgentProducerMediaSoundProofCover9x16"
          component={AgentProducerMediaSoundProofCover9x16}
          width={1080}
          height={1920}
        />
        <Composition
          id={DNS_RESOLUTION_EXPLAINER_COMPOSITION_ID}
          component={DnsResolutionExplainer}
          durationInFrames={DNS_RESOLUTION_EXPLAINER_DURATION_IN_FRAMES}
          fps={DNS_RESOLUTION_EXPLAINER_FPS}
          width={DNS_RESOLUTION_EXPLAINER_WIDTH}
          height={DNS_RESOLUTION_EXPLAINER_HEIGHT}
        />
        <Still
          id="DnsResolutionExplainerCover16x9"
          component={DnsResolutionExplainerCover16x9}
          width={1920}
          height={1080}
        />
        <Still
          id="DnsResolutionExplainerCover9x16"
          component={DnsResolutionExplainerCover9x16}
          width={1080}
          height={1920}
        />
        <Composition
          id={TCP_HANDSHAKE_EDITORIAL_COMPOSITION_ID}
          component={TcpHandshakeEditorial}
          durationInFrames={TCP_HANDSHAKE_EDITORIAL_DURATION_IN_FRAMES}
          fps={TCP_HANDSHAKE_EDITORIAL_FPS}
          width={TCP_HANDSHAKE_EDITORIAL_WIDTH}
          height={TCP_HANDSHAKE_EDITORIAL_HEIGHT}
        />
        <Still
          id="TcpHandshakeEditorialCover16x9"
          component={TcpHandshakeEditorialCover16x9}
          width={1920}
          height={1080}
        />
        <Still
          id="TcpHandshakeEditorialCover9x16"
          component={TcpHandshakeEditorialCover9x16}
          width={1080}
          height={1920}
        />
        <Composition
          id={TCP_HANDSHAKE_TERMINAL_COMPOSITION_ID}
          component={TcpHandshakeTerminal}
          durationInFrames={TCP_HANDSHAKE_TERMINAL_DURATION_IN_FRAMES}
          fps={TCP_HANDSHAKE_TERMINAL_FPS}
          width={TCP_HANDSHAKE_TERMINAL_WIDTH}
          height={TCP_HANDSHAKE_TERMINAL_HEIGHT}
        />
        <Still
          id="TcpHandshakeTerminalCover16x9"
          component={TcpHandshakeTerminalCover16x9}
          width={1920}
          height={1080}
        />
        <Still
          id="TcpHandshakeTerminalCover9x16"
          component={TcpHandshakeTerminalCover9x16}
          width={1080}
          height={1920}
        />
        <Composition
          id={AI_DAILY_NEWS_20260717_COMPOSITION_ID}
          component={AiDailyNews20260717Video}
          durationInFrames={getAiDailyNews20260717Duration(aiDailyNews20260717Data)}
          fps={AI_DAILY_NEWS_20260717_FPS}
          width={AI_DAILY_NEWS_20260717_WIDTH}
          height={AI_DAILY_NEWS_20260717_HEIGHT}
        />
        <Still
          id="AiDailyNews20260717Cover16x9"
          component={AiDailyNews20260717Cover16x9}
          width={1920}
          height={1080}
        />
        <Still
          id="AiDailyNews20260717Cover9x16"
          component={AiDailyNews20260717Cover9x16}
          width={1080}
          height={1920}
        />
        <Composition
          id={SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_COMPOSITION_ID}
          component={SuperintelligenceBeyondHumanCognitionVideo}
          durationInFrames={SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_DURATION_IN_FRAMES}
          fps={SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_FPS}
          width={SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_WIDTH}
          height={SUPERINTELLIGENCE_BEYOND_HUMAN_COGNITION_HEIGHT}
        />
        <Still
          id="SuperintelligenceBeyondHumanCognitionCover16x9"
          component={SuperintelligenceBeyondHumanCognitionCover16x9}
          width={1920}
          height={1080}
        />
        <Still
          id="SuperintelligenceBeyondHumanCognitionCover9x16"
          component={SuperintelligenceBeyondHumanCognitionCover9x16}
          width={1080}
          height={1920}
        />
      </Folder>
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
        id={AI_DAILY_NEWS_20260713_COMPOSITION_ID}
        component={AiDailyNews20260713Video}
        durationInFrames={getAiDailyNews20260713Duration(aiDailyNews20260713Data)}
        fps={AI_DAILY_NEWS_20260713_FPS}
        width={AI_DAILY_NEWS_20260713_WIDTH}
        height={AI_DAILY_NEWS_20260713_HEIGHT}
      />
      <Composition
        id={AI_DAILY_NEWS_20260714_COMPOSITION_ID}
        component={AiDailyNews20260714Video}
        durationInFrames={getAiDailyNews20260714Duration(aiDailyNews20260714Data)}
        fps={AI_DAILY_NEWS_20260714_FPS}
        width={AI_DAILY_NEWS_20260714_WIDTH}
        height={AI_DAILY_NEWS_20260714_HEIGHT}
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
      <Composition
        id={AI_CONCEPTS_REDEFINED_COMPOSITION_ID}
        component={AiConceptsRedefinedVideo}
        durationInFrames={getAiConceptsRedefinedDuration(aiConceptsRedefinedData)}
        fps={AI_CONCEPTS_REDEFINED_FPS}
        width={AI_CONCEPTS_REDEFINED_WIDTH}
        height={AI_CONCEPTS_REDEFINED_HEIGHT}
        defaultProps={{ data: aiConceptsRedefinedData }}
      />
      <Composition
        id={BEYOND_LANGUAGE_COMPOSITION_ID}
        component={BeyondLanguageVideo}
        durationInFrames={getBeyondLanguageDuration(beyondLanguageData)}
        fps={BEYOND_LANGUAGE_FPS}
        width={BEYOND_LANGUAGE_WIDTH}
        height={BEYOND_LANGUAGE_HEIGHT}
        defaultProps={{ data: beyondLanguageData }}
      />
    </>
  );
};
