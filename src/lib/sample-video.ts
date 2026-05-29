import type { VideoSpec } from "./video-schema";

export const sampleVideo: VideoSpec = {
  meta: {
    title: "AI Video Studio demo",
    fps: 30,
    width: 1280,
    height: 720,
  },
  theme: {
    background: "#101820",
    panel: "rgba(250, 250, 248, 0.1)",
    primary: "#2dd4bf",
    secondary: "#f59e0b",
    text: "#f8fafc",
    muted: "#cbd5e1",
  },
  scenes: [
    {
      id: "hook",
      type: "title",
      duration: 120,
      kicker: "AI Video Studio",
      title: "从 Prompt 到视频预览",
      subtitle: "先生成结构化脚本，再进入模版渲染。",
    },
    {
      id: "pipeline",
      type: "bullets",
      duration: 150,
      kicker: "Pipeline",
      title: "迁移后的核心流程",
      bullets: [
        "选择模版并输入自然语言 brief",
        "生成结构化 scene JSON 供预览与后续渲染",
        "在网页里微调后再导出正式视频",
      ],
    },
    {
      id: "output",
      type: "quote",
      duration: 120,
      kicker: "Output",
      quote: "现在的 ai-video-studio 已经具备多模版入口与脚本型视频骨架。",
      author: "Hermes",
    },
  ],
};
