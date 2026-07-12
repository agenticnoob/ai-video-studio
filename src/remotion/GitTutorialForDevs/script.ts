import type { StoryboardPlan } from "../../lib/storyboard-plan-schema";
import type { GitTutorialSceneId, GitTutorialVisualKind } from "./types";

const ttsOnlyTemplateReason =
  "Agent Producer standalone run uses this StoryboardPlan only to request narration through the repo TTS boundary.";

export type GitNarrationBeat = {
  readonly accent: string;
  readonly chapter: string;
  readonly headline: string;
  readonly id: GitTutorialSceneId;
  readonly narration: string;
  readonly primitiveMap: readonly string[];
  readonly visualKind: GitTutorialVisualKind;
};

export const gitNarrationBeats = [
  {
    accent: "#4ADE80",
    chapter: "开场",
    headline: "Git？每个开发者都需要的版本控制",
    id: "open",
    narration:
      "写代码的你，有没有遇到过这种情况——文件改乱了想找回旧版本？和同事合作代码互相覆盖？或者改完了一堆东西才发现不知道改了什么？[Question-ah] 这些问题的答案很简单：Git。Git 是目前最流行的版本控制系统，它就像一个时光机，记录你代码的每一次变化。",
    primitiveMap: ["GradientShiftBackground", "GridPulse", "VideoPanel", "Kicker"],
    visualKind: "hero",
  },
  {
    accent: "#22D3EE",
    chapter: "核心价值",
    headline: "Git 能做什么？为什么重要？",
    id: "what",
    narration:
      "Git 能做的事情非常多。它可以记录每次代码改动，让你随时回到任何一个历史版本。多人协作时，每个人在自己的分支上工作，互不干扰。开发新功能时创建分支，完成后安全地合并回来。出了问题？随时回滚到上一个稳定版本。没有 Git 的现代开发团队，就像没有方向盘的车。",
    primitiveMap: ["VideoPanel", "CalloutGrid", "useEntranceProgress"],
    visualKind: "bullets",
  },
  {
    accent: "#FACC15",
    chapter: "核心概念",
    headline: "几个核心概念，一听就懂",
    id: "concepts",
    narration:
      "几个最常用的概念。仓库，就是被 Git 管理的项目文件夹。提交，也叫 commit，就像给整个项目拍一张快照，记录当前所有文件的状态。分支，一条独立的开发线，你可以在这里自由实验。合并，就是把不同分支的工作整合到一起。还有远程仓库，比如 GitHub，让大家可以推送和拉取代码。理解这几个概念，日常使用 Git 就没问题了。",
    primitiveMap: ["VideoPanel", "useEntranceProgress", "GridPulse"],
    visualKind: "concept-diagram",
  },
  {
    accent: "#A78BFA",
    chapter: "日常使用",
    headline: "日常工作流，五个命令就够了",
    id: "workflow",
    narration:
      "日常使用 Git 其实只有几个命令。git clone 克隆别人的仓库到本地。git add 把改动的文件加入暂存区。git commit 把暂存的内容提交成一个版本。git push 把本地的提交推送到远程。git pull 拉取远程的最新代码。再多一个 git branch 用来管理分支。记住这六个命令，日常开发基本够用。每次改动提交一次，写清楚这次改了什么的提交信息，这是好习惯。",
    primitiveMap: ["TerminalSessionBlock", "VideoPanel", "GradientShiftBackground"],
    visualKind: "terminal-flow",
  },
  {
    accent: "#FB923C",
    chapter: "AI Agent",
    headline: "在 AI Agent 开发中怎么用 Git？",
    id: "agent",
    narration:
      "在 AI Agent 开发中，Git 尤其重要。AI 自动生成的代码变化很快，通过分支可以做隔离。让 Agent 每次运行前创建一个新分支，运行完 review 代码变更后再合并。Codex、Claude Code 都深度集成了 Git，每次自动提交可以让你清晰看到 AI 改了什么、改的对不对。git diff 查看改动，git log 查看历史，git checkout 切换回某个版本。Agent 加 Git，效率和安全感都翻倍。",
    primitiveMap: ["WorkflowMapBlock", "VideoPanel", "CodeDiffBlock"],
    visualKind: "agent-flow",
  },
  {
    accent: "#34D399",
    chapter: "建议",
    headline: "几个实用建议",
    id: "tips",
    narration:
      "想用好 Git，几个小建议。第一，经常提交，每次改动专注一件事。第二，提交信息写清楚，让别人和你自己以后都能看懂。第三，提交前用 git diff review 一遍自己的改动。第四，永远不会错的：在不确定的时候，先 git status 看看当前状态。做到这几点，Git 会成为你最可靠的助手。",
    primitiveMap: ["VideoPanel", "AnimatedList", "useEntranceProgress"],
    visualKind: "checklist",
  },
  {
    accent: "#4ADE80",
    chapter: "收束",
    headline: "现在就开始用 Git 吧",
    id: "close",
    narration:
      "Git 已经成了现代开发的标配。不管你写什么语言、用什么工具、是一个人还是团队协作，也不管你是手写代码还是用 AI Agent 辅助，Git 都能让你的开发更安心、更高效。不要犹豫，现在就开始用 Git 吧。",
    primitiveMap: ["GradientShiftBackground", "VideoPanel", "Kicker"],
    visualKind: "closing",
  },
] satisfies readonly GitNarrationBeat[];

export const createGitTutorialSingleScenePlan = (
  beat: GitNarrationBeat,
): StoryboardPlan => ({
  brief: `Generate natural Chinese tutorial narration for: ${beat.headline}`,
  globalStyle:
    "Warm Chinese tutorial narrator, friendly and approachable, clearly articulated, fast-paced, never theatrical.",
  language: "zh-CN",
  segments: [
    {
      id: beat.id,
      order: 1,
      purpose: beat.headline,
      templateId: "technical-explainer",
      templateReason: ttsOnlyTemplateReason,
      narration: {
        text: beat.narration,
        tone: "warm, friendly, clear, fast-paced, conversational",
      },
      visualBrief: `${beat.chapter}: ${beat.headline}`,
      pacingHint: "fast",
      expectedDurationSeconds: 22,
    },
  ],
  title: `Git 教程 - ${beat.headline}`,
});