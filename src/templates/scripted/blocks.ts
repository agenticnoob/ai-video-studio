import type { VideoScene } from "../../lib/video-schema";

type ScriptedSceneType = VideoScene["type"];

export type ScriptedBlockContract = {
  type: ScriptedSceneType;
  label: string;
  visualEffect: string;
  bestFor: string[];
  llmFields: string[];
  primitiveMapping: string[];
};

export const scriptedBlockContracts = [
  {
    type: "title",
    label: "Title block",
    visualEffect: "Large title card with optional kicker and subtitle inside a themed panel.",
    bestFor: ["opening a segment", "introducing a section", "presenting one core idea"],
    llmFields: ["id", "duration", "kicker?", "title", "subtitle?"],
    primitiveMapping: [
      "scene.kicker -> TitleScene.kicker",
      "scene.title -> TitleScene.title",
      "scene.subtitle -> TitleScene.subtitle",
      "implementation.theme -> TitleScene.theme and VideoPanel.theme",
      "scene.duration -> entrance duration cap in SceneRenderer",
    ],
  },
  {
    type: "bullets",
    label: "Bullet block",
    visualEffect: "Heading with a short list of scan-friendly bullets inside a themed panel.",
    bestFor: ["steps", "benefits", "reasons", "compact explanations", "takeaways"],
    llmFields: ["id", "duration", "kicker?", "title", "bullets"],
    primitiveMapping: [
      "scene.kicker -> BulletScene.kicker",
      "scene.title -> BulletScene.title",
      "scene.bullets -> BulletScene.bullets",
      "implementation.theme -> BulletScene.theme and VideoPanel.theme",
      "scene.duration -> entrance duration cap in SceneRenderer",
    ],
  },
  {
    type: "quote",
    label: "Quote block",
    visualEffect: "Large quote text with optional attribution inside a themed panel.",
    bestFor: ["testimonials", "emotional emphasis", "memorable statements", "reflective beats"],
    llmFields: ["id", "duration", "kicker?", "quote", "author?"],
    primitiveMapping: [
      "scene.kicker -> QuoteScene.kicker",
      "scene.quote -> QuoteScene.quote",
      "scene.author -> QuoteScene.author",
      "implementation.theme -> QuoteScene.theme and VideoPanel.theme",
      "scene.duration -> entrance duration cap in SceneRenderer",
    ],
  },
] satisfies ScriptedBlockContract[];

export const scriptedBlockPromptSummary = scriptedBlockContracts
  .map((block) => `  ${block.type}: { ${block.llmFields.join(", ")} }`)
  .join("\n");
