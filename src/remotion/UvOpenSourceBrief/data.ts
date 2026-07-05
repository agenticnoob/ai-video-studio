import {
  UV_OPEN_SOURCE_BRIEF_CONTENT_FAMILY,
  UV_OPEN_SOURCE_BRIEF_PROFILE_ID,
  UV_OPEN_SOURCE_BRIEF_VOICEOVER_PLAYBACK_RATE,
  type UvOpenSourceBriefData,
  type UvOpenSourceBriefSceneId,
} from "./types";
import { uvOpenSourceBriefAudio } from "./audio.generated";

const audioBySceneId = new Map(uvOpenSourceBriefAudio.map((track) => [track.sceneId, track]));

const trackFor = (sceneId: UvOpenSourceBriefSceneId) => {
  const track = audioBySceneId.get(sceneId);

  if (!track) {
    throw new Error(`Missing uv open-source brief audio metadata for ${sceneId}`);
  }

  return track;
};

const timedTrackFor = (sceneId: UvOpenSourceBriefSceneId) => {
  const track = trackFor(sceneId);

  return {
    ...track,
    captions: {
      ...track.captions,
      cues: track.captions.cues.map((cue) => ({
        ...cue,
        durationInFrames: Math.max(
          1,
          Math.ceil(cue.durationInFrames / UV_OPEN_SOURCE_BRIEF_VOICEOVER_PLAYBACK_RATE),
        ),
        startFrame: Math.ceil(cue.startFrame / UV_OPEN_SOURCE_BRIEF_VOICEOVER_PLAYBACK_RATE),
      })),
    },
    durationInFrames: Math.ceil(
      track.durationInFrames / UV_OPEN_SOURCE_BRIEF_VOICEOVER_PLAYBACK_RATE,
    ),
  };
};

export const uvOpenSourceBriefData = {
  assets: {
    screenshots: [
      {
        id: "repo",
        label: "GitHub repository",
        sourceUrl: "https://github.com/astral-sh/uv",
        src: "generated/uv-open-source-brief/github-repo.png",
      },
      {
        id: "docs",
        label: "Official uv docs",
        sourceUrl: "https://docs.astral.sh/uv/",
        src: "generated/uv-open-source-brief/docs-home.png",
      },
      {
        id: "release",
        label: "GitHub release 0.11.26",
        sourceUrl: "https://github.com/astral-sh/uv/releases/tag/0.11.26",
        src: "generated/uv-open-source-brief/release-0.11.26.png",
      },
    ],
  },
  contentFamily: UV_OPEN_SOURCE_BRIEF_CONTENT_FAMILY,
  generatedAt: "2026-07-01T14:59:00.000Z",
  profileId: UV_OPEN_SOURCE_BRIEF_PROFILE_ID,
  scenes: [
    {
      audioFile: timedTrackFor("open").audioFile,
      captions: timedTrackFor("open").captions,
      durationInFrames: timedTrackFor("open").durationInFrames + 18,
      headline: "uv：Python 工具链正在被重新打包",
      id: "open",
      kicker: "开源项目速览",
      narration: "Python 环境管理今天的痛点，不是命令太少，而是工具太碎。uv 试图把这件事重新收拢。",
      primitiveMap: [
        "StandaloneTimeline",
        "StandaloneVoiceover",
        "StandaloneBottomCaption",
        "sample-local hero scene",
      ],
      visual: { kind: "hero" },
    },
    {
      audioFile: timedTrackFor("what").audioFile,
      captions: timedTrackFor("what").captions,
      durationInFrames: timedTrackFor("what").durationInFrames + 18,
      headline: "一个 Rust 写的 Python 包与项目管理器",
      id: "what",
      kicker: "它是什么",
      narration: "官方定义很直接：uv 是一个极快的 Python 包和项目管理器，用 Rust 写成。",
      primitiveMap: ["WorkflowMapBlock", "sample-local screenshot card", "docs screenshot evidence"],
      visual: { kind: "workflow" },
    },
    {
      audioFile: timedTrackFor("adoption").audioFile,
      captions: timedTrackFor("adoption").captions,
      durationInFrames: timedTrackFor("adoption").durationInFrames + 18,
      headline: "86.9k stars，不只是小众试验",
      id: "adoption",
      kicker: "采用信号",
      narration:
        "截至二零二六年七月一日，GitHub API 显示 uv 已经接近八万七千 stars，三千二百多个 forks。",
      primitiveMap: ["MetricCardGrid", "repo screenshot evidence", "StandaloneBottomCaption"],
      visual: { kind: "metrics" },
    },
    {
      audioFile: timedTrackFor("speed").audioFile,
      captions: timedTrackFor("speed").captions,
      durationInFrames: timedTrackFor("speed").durationInFrames + 18,
      headline: "速度是入口，统一工作流才是重点",
      id: "speed",
      kicker: "核心卖点",
      narration: "README 里最醒目的主张，是比 pip 快十到一百倍。但速度只是入口。",
      primitiveMap: [
        "sample-local benchmark bars",
        "MetricCardGrid-inspired counter",
        "repo screenshot",
      ],
      visual: { kind: "benchmark" },
    },
    {
      audioFile: timedTrackFor("workflow").audioFile,
      captions: timedTrackFor("workflow").captions,
      durationInFrames: timedTrackFor("workflow").durationInFrames + 18,
      headline: "init、add、run、sync 形成闭环",
      id: "workflow",
      kicker: "日常命令",
      narration:
        "开发者真正会记住的，是 uv init、uv add、uv run、uv sync 这种一套命令走完项目生命周期。",
      primitiveMap: ["TerminalSessionBlock", "StandaloneTimeline", "sample-local command annotation"],
      visual: { kind: "terminal" },
    },
    {
      audioFile: timedTrackFor("replace").audioFile,
      captions: timedTrackFor("replace").captions,
      durationInFrames: timedTrackFor("replace").durationInFrames + 18,
      headline: "它覆盖的是一组工具，而不是一个命令",
      id: "replace",
      kicker: "替代面",
      narration:
        "官方文档把 pip、pip-tools、pipx、poetry、pyenv、twine、virtualenv 都列进替代范围。这就是 uv 的野心。",
      primitiveMap: ["sample-local tool chip grid", "WorkflowMapBlock idea", "docs screenshot evidence"],
      visual: { kind: "tool-grid" },
    },
    {
      audioFile: timedTrackFor("release").audioFile,
      captions: timedTrackFor("release").captions,
      durationInFrames: timedTrackFor("release").durationInFrames + 18,
      headline: "0.11.26 在 2026-06-30 发布",
      id: "release",
      kicker: "当前性",
      narration:
        "最新 release 是零点十一点二十六，发布时间是二零二六年六月三十日。这个项目仍在高频迭代。",
      primitiveMap: ["TimelineProgressBlock", "release screenshot evidence", "sample-local release card"],
      visual: { kind: "release" },
    },
    {
      audioFile: timedTrackFor("close").audioFile,
      captions: timedTrackFor("close").captions,
      durationInFrames: timedTrackFor("close").durationInFrames + 18,
      headline: "uv 的价值，是降低 Python 项目的启动摩擦",
      id: "close",
      kicker: "结论",
      narration:
        "所以，uv 不只是又一个包管理器。它更像是在把 Python 项目的冷启动、协作和复现成本一起压低。",
      primitiveMap: ["sample-local closing scene", "StandaloneBottomCaption", "repo/docs evidence cards"],
      visual: { kind: "closing" },
    },
  ],
  topic: {
    docsUrl: "https://docs.astral.sh/uv/",
    latestRelease: {
      publishedAt: "2026-06-30T14:53:17Z",
      tag: "0.11.26",
      url: "https://github.com/astral-sh/uv/releases/tag/0.11.26",
    },
    repo: {
      description: "An extremely fast Python package and project manager, written in Rust.",
      forks: 3262,
      fullName: "astral-sh/uv",
      language: "Rust",
      stars: 86956,
      url: "https://github.com/astral-sh/uv",
    },
    speedClaim: "10-100x faster than pip",
    toolCoverage: ["pip", "pip-tools", "pipx", "poetry", "pyenv", "twine", "virtualenv"],
  },
} satisfies UvOpenSourceBriefData;
