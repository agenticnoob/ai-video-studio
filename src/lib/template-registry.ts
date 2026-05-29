import type { ComponentType } from "react";
import { z } from "zod";
import {
  COMP_NAME,
  defaultMyCompProps,
  type HeroCompositionProps,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "../../types/constants";
import { buildMockSpec } from "./mock-spec";
import { sampleVideo } from "./sample-video";
import { type VideoSpec, videoSpecSchema } from "./video-schema";
import { Main } from "../remotion/MyComp/Main";
import { ScriptedVideo } from "../remotion/ScriptedVideo/ScriptedVideo";

export const generatorFormSchema = z.object({
  prompt: z.string(),
  title: z.string(),
  fps: z.number().int(),
  width: z.number().int(),
  height: z.number().int(),
  sceneSeconds: z.number().int(),
  background: z.string(),
  primary: z.string(),
  secondary: z.string(),
  callToAction: z.string(),
});

export type GeneratorFormState = z.infer<typeof generatorFormSchema>;

export const defaultGeneratorFormState: GeneratorFormState = {
  prompt: "做一个介绍 AI 视频工作流的短视频，强调多模版、预览和最终导出。",
  title: "AI Video Studio Workflow",
  fps: 30,
  width: VIDEO_WIDTH,
  height: VIDEO_HEIGHT,
  sceneSeconds: 4,
  background: "#101820",
  primary: "#2dd4bf",
  secondary: "#f59e0b",
  callToAction: "Review the JSON, tune the template, and render the final video.",
};

type HeroTemplate = {
  id: "hero";
  label: string;
  description: string;
  compositionId: string;
  component: ComponentType<HeroCompositionProps>;
  getProps: (args: {
    heroTitle: string;
    generatedSpec: VideoSpec;
  }) => HeroCompositionProps;
};

type ScriptedTemplate = {
  id: "scripted";
  label: string;
  description: string;
  compositionId: string;
  component: ComponentType<VideoSpec>;
  schema: typeof videoSpecSchema;
  getProps: (args: {
    heroTitle: string;
    generatedSpec: VideoSpec;
  }) => VideoSpec;
};

export const templateRegistry: [HeroTemplate, ScriptedTemplate] = [
  {
    id: "hero",
    label: "Hero Intro",
    description: "保留官方 starter 的单标题动效，适合做片头。",
    compositionId: COMP_NAME,
    component: Main,
    getProps: ({ heroTitle }) => ({
      title: heroTitle || defaultMyCompProps.title,
    }),
  },
  {
    id: "scripted",
    label: "Scripted Video",
    description: "从 prompt 生成结构化 scenes，再按 scene 顺序渲染。",
    compositionId: "ScriptedVideo",
    component: ScriptedVideo,
    schema: videoSpecSchema,
    getProps: ({ generatedSpec }) => generatedSpec,
  },
];

export const buildDefaultScriptedSpec = () => sampleVideo;

export const buildGeneratedScriptedSpec = (form: GeneratorFormState) => buildMockSpec(form);
