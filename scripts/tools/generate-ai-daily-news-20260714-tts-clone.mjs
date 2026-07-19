#!/usr/bin/env node
// Generate per-scene TTS audio for AiDailyNews20260714 using LYY voice clone
// Uses VoxCPM clone_with_prompt API directly (raw WAV binary)

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = path.resolve(import.meta.dirname, "../..");
const SLUG = "ai-daily-news-2026-07-14";
const PUBLIC_DIR = path.join(ROOT, "public", "generated", SLUG);
const ASSET_PREFIX = `generated/${SLUG}`;

// LYY voice clone config
const PROMPT_AUDIO = path.join(ROOT, "voices", "clone", "lyy.wav");
const PROMPT_TEXT = "我觉得应该要犒赏一下自己。讨厌！好狗不挡道！天哪！原来命运是不可抗拒的。";
const REFERENCE_AUDIO = path.join(ROOT, "voices", "clone", "lyy-r.wav");
const VOXCPM_URL = "http://192.168.50.6:8810/clone_with_prompt";

const BEATS = [
  {
    id: "open",
    narration:
      "今天 AI 行业的重心不在决定性的前沿大模型首发，而在更系统的变化。企业预算正在从传统软件转向 AI 基础设施，数据中心开始遭遇电力与环保限制，AI 搜索产品被要求为生成内容承担直接责任，而资本继续涌向芯片、垂直 Agent 和头部模型公司。整个行业正在从模型能力竞赛，进入电力、芯片、部署能力和监管责任的系统竞争。",
  },
  {
    id: "budget-shift",
    narration:
      "IBM 表示客户将部分预算从软件、咨询和大型机转向 GPU 服务器、存储和网络设备，以提前锁定紧缺的 AI 基础设施。多笔大型交易因此未能按期完成，股价盘中一度下跌约百分之二十六。与此同时，台积电第二季度营收同比增长百分之三十六，创历史新高，预计净利润同比增长约百分之五十九，连续第五个季度创纪录。市场关注其是否将资本支出进一步上调。",
  },
  {
    id: "perf-watt",
    narration:
      "NVIDIA 强调固定电力预算下能产生多少 Token，这才是新的核心指标。在部分 MoE 模型测试中，GB300 NVL72 的每瓦性能可达 Hopper 平台的十到二十五倍。同一天，芯片创业公司 TYLsemi 完成四千三百万美元早期融资，其方案将芯片拆分为可组合的芯粒，宣称可将定制 AI 芯片开发成本降低接近一半。技术竞争正从单卡算力，转向每瓦收入、每 Token 成本和芯片定制化。",
  },
  {
    id: "legal-hallu",
    narration:
      "一项七月十三日发布的双语法律基准测试发现，受测模型在 GDPR 条文查询上准确率达百分之九十四至一百，但在资料稀缺的沙特数据保护法问题上，错误引用或编造条文的比例达到百分之六十到七十七。令人担忧的是，百分之九十一的虚构引用仍然表现出不低于零点八的高置信度。模型的自信程度，不能作为可靠性依据。",
  },
  {
    id: "regulation-wave",
    narration:
      "纽约州宣布对功率五十兆瓦及以上的新数据中心实施为期一年的建设禁令，期间将制定统一的环境影响标准。同一天，德国媒体监管机构表示，Google AI Overviews 和 Perplexity 生成的摘要属于服务提供者创建的内容，因此可能需要直接为错误内容负责。这改变了 AI 搜索的责任边界：传统搜索提供链接，AI 搜索生成答案，平台可能成为内容发布者。",
  },
  {
    id: "governance",
    narration:
      "澳大利亚宣布在总理与内阁部内部设立 Office of AI，统一协调不同政府部门的 AI 标准、审批和监管。目前该国尚无专门的综合 AI 法律。与此同时，Google DeepMind CEO Demis Hassabis 提议建立由美国主导、行业出资的全球前沿 AI 测试机构，在模型发布前进行网络、生物和欺骗能力测试。治理正在从分散的行业自律，转向国家级的集中监管协调。",
  },
  {
    id: "capital-flow",
    narration:
      "据路透社报道，DeepSeek 新一轮融资讨论的投前估值约为七百一十亿美元，并可能最快于二零二六年提交 IPO 申请。面向中型企业的 AI 金融平台 Flex 完成七千万美元融资，估值约十二亿美元，较六个月前翻倍。SoftBank CEO 孙正义预计，到二零四零年全球 AI 投资需求可能达到每年五万亿美元。资本正同时押注模型、芯片和垂直 Agent，但可闭环完成任务的业务系统才是真正的产品。",
  },
  {
    id: "close",
    narration:
      "今天的新闻给 Agent 开发者五个核心信号。第一，能否在有限 Token 和电力成本下长期运行。第二，能否验证每一次引用、判断和外部操作。第三，能否接入真实业务系统并承担结果责任。第四，能否提供权限、审计、重试和人工接管机制。第五，能否把不稳定的模型能力包装成稳定可交付的服务。面向 Agent 提供的 Skill、工具服务、执行验证和可靠性基础设施，其商业价值正变得更加明确。",
  },
];

const quote = (s) => `'${s.replace(/'/g, "'\\''")}'`;

const getAudioDurationSeconds = (filePath) => {
  const output = execSync(
    `ffprobe -v quiet -show_format -print_format json "${filePath}"`,
    { encoding: "utf-8", timeout: 15000 },
  );
  return parseFloat(JSON.parse(output).format.duration);
};

const genForBeat = (beat, idx) => {
  console.log(`[${idx + 1}/${BEATS.length}] Generating TTS for ${beat.id}...`);

  const audioName = `${beat.id}.wav`;
  const outputPath = path.join(PUBLIC_DIR, audioName);
  const tmpFile = `/tmp/ai-news-${beat.id}.wav`;

  const curlCmd = [
    "curl", "-s", "-o", tmpFile,
    "-X", "POST",
    "-F", `text=${beat.narration}`,
    "-F", `prompt_text=${PROMPT_TEXT}`,
    "-F", `prompt_audio=@${PROMPT_AUDIO}`,
    "-F", `reference_audio=@${REFERENCE_AUDIO}`,
    "-F", "cfg_value=2.0",
    "-F", "inference_timesteps=10",
    "-F", "normalize=true",
    "-F", "denoise=false",
    "-F", "save=false",
    "-F", `filename_prefix=ai-news-${beat.id}`,
    VOXCPM_URL,
  ];

  const escapedCmd = curlCmd.map((arg) => {
    if (/[\s'()]/u.test(arg)) return quote(arg);
    return arg;
  }).join(" ");

  execSync(escapedCmd, { encoding: "utf-8", timeout: 180000, maxBuffer: 100 * 1024 * 1024 });

  // Check if we got a valid WAV
  const fileStat = execSync(`stat -c%s "${tmpFile}"`, { encoding: "utf-8" });
  const fileSize = parseInt(fileStat.trim(), 10);

  if (fileSize < 1000) {
    console.warn(`  ⚠ Response too small (${fileSize}B) for ${beat.id}`);
    return null;
  }

  // Copy to public dir
  execSync(`cp "${tmpFile}" "${outputPath}"`);

  const durationSeconds = getAudioDurationSeconds(outputPath);
  const fps = 30;
  const durationInFrames = Math.round(durationSeconds * fps);

  // Split text by punctuation for cue timing
  const cueTexts = beat.narration
    .split(/(?<=[。！？，；：、…])/u)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const totalChars = cueTexts.reduce((sum, t) => sum + t.length, 0);
  let cursor = 0;
  const cues = cueTexts.map((text, i) => {
    const charRatio = text.length / totalChars;
    const durInFrames = i < cueTexts.length - 1
      ? Math.round(durationInFrames * charRatio)
      : durationInFrames - cursor;
    const cue = {
      id: `caption-${i + 1}`,
      text: text.trim(),
      startFrame: cursor,
      durationInFrames: Math.max(1, durInFrames),
    };
    cursor += durInFrames;
    return cue;
  });

  console.log(
    `  → ${audioName} (${durationInFrames}f, ${durationSeconds.toFixed(2)}s, ${cues.length} cues, ${(fileSize / 1024).toFixed(0)}KB)`,
  );

  return {
    audioFile: `${ASSET_PREFIX}/${audioName}`,
    captions: { language: "zh-CN", cues },
    durationInFrames,
    durationInSeconds: durationSeconds,
    format: "wav",
    narration: beat.narration,
    provider: "voxcpm-clone-lyy",
    sceneId: beat.id,
  };
};

const main = () => {
  mkdirSync(PUBLIC_DIR, { recursive: true });

  const results = [];
  for (let i = 0; i < BEATS.length; i++) {
    try {
      const result = genForBeat(BEATS[i], i);
      if (result) results.push(result);
    } catch (err) {
      console.warn(`  ⚠ Failed ${BEATS[i]?.id ?? i}: ${err.message}`);
    }
  }

  // Write audio.generated.ts
  const ts = `// Auto-generated by scripts/tools/generate-ai-daily-news-20260714-tts-clone.mjs
// Voice clone: LYY (high-fidelity clone_with_prompt)
// ${new Date().toISOString()}

import type { AudioTrack } from "./types";

export const aiDailyNews20260714Audio: AudioTrack[] = ${JSON.stringify(results, null, 2)};
`;

  writeFileSync(
    path.join(ROOT, "src", "remotion", "AiDailyNews20260714", "audio.generated.ts"),
    ts,
  );

  // Write summary
  writeFileSync(
    path.join(PUBLIC_DIR, "tts-summary-clone.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        mode: "clone_with_prompt",
        voice: "LYY",
        totalBeats: BEATS.length,
        successful: results.length,
        failed: BEATS.length - results.length,
        results: results.map((r) => ({
          sceneId: r.sceneId,
          durationInFrames: r.durationInFrames,
          durationInSeconds: r.durationInSeconds,
          captionCues: r.captions?.cues?.length ?? 0,
        })),
      },
      null,
      2,
    ),
  );

  console.log(`\nDone. ${results.length}/${BEATS.length} scenes generated.`);
  if (results.length < BEATS.length) {
    console.log(`  ${BEATS.length - results.length} scenes failed.`);
  }
};

main();
