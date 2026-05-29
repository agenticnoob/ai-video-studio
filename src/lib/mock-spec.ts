import type { VideoSpec } from "./video-schema";

export type MockGeneratorInput = {
  prompt: string;
  title: string;
  fps: number;
  width: number;
  height: number;
  sceneSeconds: number;
  background: string;
  primary: string;
  secondary: string;
  callToAction: string;
};

export type BriefGeneratorInput = {
  brief: string;
};

export type BriefSpecOverrides = Partial<
  Pick<
    MockGeneratorInput,
    "title" | "fps" | "width" | "height" | "sceneSeconds" | "background" | "primary" | "secondary" | "callToAction"
  >
>;

const clampNumber = (value: number, fallback: number, min: number, max: number) => {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(min, Math.min(max, Math.round(value)));
};

export const buildMockSpec = (input: MockGeneratorInput): VideoSpec => {
  const title = input.title.trim() || "AI Video Milestone";
  const fps = clampNumber(input.fps, 30, 12, 60);
  const width = clampNumber(input.width, 1280, 320, 3840);
  const height = clampNumber(input.height, 720, 320, 2160);
  const sceneSeconds = clampNumber(input.sceneSeconds, 4, 2, 12);
  const duration = sceneSeconds * fps;
  const topic = input.prompt.trim() || "Build an AI video workflow";

  return {
    meta: { title, fps, width, height },
    theme: {
      background: input.background || "#101820",
      panel: "rgba(250, 250, 248, 0.1)",
      primary: input.primary || "#2dd4bf",
      secondary: input.secondary || "#f59e0b",
      text: "#f8fafc",
      muted: "#cbd5e1",
    },
    scenes: [
      {
        id: "hook",
        type: "title",
        duration,
        kicker: "Generated Brief",
        title,
        subtitle: topic,
      },
      {
        id: "pipeline",
        type: "bullets",
        duration: duration + fps,
        kicker: "Pipeline",
        title: "From prompt to render",
        bullets: [
          "用户先选模版，再让系统生成结构化参数。",
          "网页负责预览与微调，模版负责视觉与动画。",
          "最终渲染链路复用 Remotion，本地优先。",
        ],
      },
      {
        id: "output",
        type: "quote",
        duration,
        kicker: "Output",
        quote: input.callToAction || "Review the JSON, tune the template, and render the final video.",
        author: "Mock generator",
      },
    ],
  };
};

export const titleFromBrief = (brief: string) => {
  const firstLine = brief
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  if (!firstLine) {
    return "AI Video Studio Workflow";
  }

  return firstLine.length > 64 ? `${firstLine.slice(0, 61)}...` : firstLine;
};

export const buildMockSpecFromBrief = (
  input: BriefGeneratorInput,
  overrides: BriefSpecOverrides = {},
): VideoSpec => {
  const brief = input.brief.trim() || "Create a concise product workflow video for AI Video Studio.";

  return buildMockSpec({
    prompt: brief,
    title: overrides.title ?? titleFromBrief(brief),
    fps: overrides.fps ?? 30,
    width: overrides.width ?? 1280,
    height: overrides.height ?? 720,
    sceneSeconds: overrides.sceneSeconds ?? 4,
    background: overrides.background ?? "#101820",
    primary: overrides.primary ?? "#2dd4bf",
    secondary: overrides.secondary ?? "#f59e0b",
    callToAction:
      overrides.callToAction ?? "Tune the structured spec in the studio, then preview the result live.",
  });
};
