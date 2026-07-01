export const WC_PREDICTION_COMPOSITION_ID = "WorldCupPrediction";
export const WC_PREDICTION_FPS = 30;
export const WC_PREDICTION_WIDTH = 1080;
export const WC_PREDICTION_HEIGHT = 1920;
export const WC_PREDICTION_DURATION_IN_FRAMES = 1980;

export const SCENE_KEYS = [
  "opening",
  "favorites",
  "dark_horse",
  "data_model",
  "final_pick",
] as const;

export type SceneKey = (typeof SCENE_KEYS)[number];

export const SCENE_DURATIONS: Record<SceneKey, number> = {
  opening: 403,
  favorites: 390,
  dark_horse: 403,
  data_model: 403,
  final_pick: 381,
};

export const NARRATIONS: Record<SceneKey, string> = {
  opening:
    "世界杯冠军预测来了。不是只看名气，而是看阵容厚度、淘汰赛路径、关键球员状态，还有大赛稳定性。",
  favorites:
    "第一梯队，依然是那些传统强队。法国、阿根廷、巴西、英格兰，都有争冠底盘，但问题也很明显。",
  dark_horse:
    "黑马不是随便猜冷门。真正有威胁的球队，通常有稳定防线、快速反击，以及一两个能改变比赛的核心。",
  data_model:
    "如果用模型思路分析，冠军概率不是单场胜率，而是一整条晋级路径的连乘。路径越顺，爆冷风险越低。",
  final_pick:
    "我的预测是：最稳的冠军候选，是法国。阵容深度、身体对抗、淘汰赛经验，都更接近冠军模型。",
};
