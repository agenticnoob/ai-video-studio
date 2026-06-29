import { storyboardPlanSchema, type StoryboardPlan } from "../../lib/storyboard-plan-schema";
import { SCRIPTED_TEMPLATE_ID } from "../../lib/template-registry";
import { worldCupBettingData } from "./data";
import type { SceneTiming } from "./types";

const ttsOnlyTemplateReason =
  "仅用于满足配音请求的 StoryboardPlan schema；此独立短片不使用项目内模板渲染。";

export const createWorldCupBettingSingleScenePlan = (scene: SceneTiming): StoryboardPlan =>
  storyboardPlanSchema.parse({
    brief: "生成一条世界杯竞彩数学期望分析短视频的单镜头中文口播。",
    globalStyle: "冷静、专业、克制的数据分析口播，不诱导下注，不使用广告语。",
    language: "zh",
    segments: [
      {
        expectedDurationSeconds: scene.durationInFrames / 30,
        id: scene.id,
        narration: {
          text: scene.narration,
          tone: "中文数据分析短视频口播，冷静、清晰、专业，语速自然，不煽动下注",
        },
        order: 1,
        purpose: scene.label,
        templateId: SCRIPTED_TEMPLATE_ID,
        templateReason: ttsOnlyTemplateReason,
        title: scene.label,
        visualBrief: scene.subtitle,
      },
    ],
    title: "世界杯竞彩分析：胜率最高，不等于数学期望最高",
  });

export const worldCupBettingNarrationScenes = worldCupBettingData.scenes;

export const worldCupBettingNarrationPlan: StoryboardPlan = createWorldCupBettingSingleScenePlan(
  worldCupBettingNarrationScenes[0],
);
