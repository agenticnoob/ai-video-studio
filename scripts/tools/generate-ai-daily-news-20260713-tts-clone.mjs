#!/usr/bin/env node
// Generate per-scene TTS audio for AiDailyNews20260713 using LYY voice clone
// Uses VoxCPM clone_with_prompt API directly (raw WAV binary)

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = path.resolve(import.meta.dirname, "../..");
const SLUG = "ai-daily-news-2026-07-13";
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
      "今天 AI 行业的重心不在新模型发布，而在算力基础设施、能源成本、资本集中和社会治理。Meta、Intel、Helsing 公布的大额投资，以及美国围绕数据中心电价的政策动作共同说明：AI 竞争已经从谁的模型更强，扩展为谁能够获得电力、芯片、数据中心、资本和政府支持。",
  },
  {
    id: "meta-infra",
    narration:
      "Meta 宣布将路易斯安那州 Hyperion 数据中心容量提升至 5GW，投资超 500 亿美元，并表示未来三年将在美国基础设施和就业投入约 6000 亿美元。同一天，Intel 启动 50 亿欧元投资升级爱尔兰工厂。5GW 已经接近大型区域电力系统规模，说明头部模型公司的核心资产正在从模型权重扩展到电力合同、土地、水资源和自有算力集群。",
  },
  {
    id: "waze-voice",
    narration:
      "Google 旗下 Waze 推出新的 AI 功能，用户可以通过自然语言报告路况，并获得个性化导航体验。信号很简单：语音模型正在从聊天入口进入驾驶、导航等持续在线场景，AI 的交互面正在从对话框扩展到每一次日常使用。",
  },
  {
    id: "gpt56-agent",
    narration:
      "OpenAI 于七月九日发布 GPT-5.6 系列，旗舰模型 Sol 引入 ultra 模式，利用多个子 Agent 并行执行复杂任务。它的重要性不只是基准成绩，而是模型产品结构正在发生变化：一个用户请求不再必然对应一次模型调用，而可能自动触发规划、并行子任务、工具调用、验证和结果汇总。",
  },
  {
    id: "gpt-live",
    narration:
      "OpenAI 于七月八日发布 GPT-Live，采用全双工架构，同时听取和生成语音；遇到复杂任务时委托给后端模型。这提供了一种明确的 Agent 架构方向：低延迟交互层、规划层、执行层和验证层分离。未来的 AI 助理不太可能由一个大模型承担所有任务，而会分成实时交互、规划和执行层。",
  },
  {
    id: "us-policy",
    narration:
      "白宫计划召集公用事业公司、数据中心开发商和州政府，推动一项自愿承诺：AI 公司和数据中心运营方应承担新增发电、电网升级和预留容量成本，避免把费用转嫁给普通居民。这意味着 AI 监管正在从模型安全扩展到电力、水资源、地方财政风险和成本分配。",
  },
  {
    id: "eu-copyright",
    narration:
      "欧盟委员会发布可行性研究，评估建立统一的文本与数据挖掘退出登记系统。版权所有者可以登记不允许其作品被用于模型训练。这目前仍是研究方案，但未来数据合规可能不只是有没有版权，还包括是否能够机器化读取权利人的退出声明。同一天，超过 200 名专家呼吁政府提前建立应对 AI 经济影响的政策和制度。",
  },
  {
    id: "helsing",
    narration:
      "欧洲国防 AI 公司 Helsing 完成 18 亿美元 E 轮融资，估值 180 亿美元。投资者包括 Lightspeed、General Catalyst、Goldman Sachs 等。Helsing 业务从战场数据分析扩展到自主无人机、水下监控、军用航空和实时目标识别。资本正在将国防 AI 视为独立的大型产业，防务、主权算力与 AI 正逐渐合并为同一投资主题。",
  },
  {
    id: "china-signal",
    narration:
      "中国宣布习近平将于七月十七日至二十日在上海出席 2026 世界人工智能大会并发表讲话，这是首次现场参加。结合近期关于限制最先进模型向海外开放的讨论，可以看到中美 AI 战略正出现相似变化：先进模型开始被视为与芯片、军事技术类似的国家级战略资产。",
  },
  {
    id: "trend-summary",
    narration:
      "AI 竞争基础设施化：Meta 5GW 和 Intel 投资显示电力和芯片成为核心壁垒。Agent 架构分层：GPT-Live 和 GPT-5.6 推动单模型到多模型编排。监管对象扩大：电价、版权退出和就业影响使合规从模型层进入完整产业链。资本继续头部集中：Helsing 融资验证国防 AI 成为热门赛道。AI 主权化：中美欧均强化控制和评估，全球统一模型和服务可能逐渐分区。",
  },
  {
    id: "close",
    narration:
      "对 Agent 开发者今天最值得关注的一点是：模型本身正逐渐成为可替换的执行组件，真正长期有价值的层开始转向任务编排、工具与数据授权、执行验证、成本控制和可靠性交付。这与为其他 Agent 提供可靠能力服务的方向高度一致。",
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
      console.warn(`  ⚠ Failed ${beat?.id ?? i}: ${err.message}`);
    }
  }

  // Write audio.generated.ts
  const ts = `// Auto-generated by scripts/tools/generate-ai-daily-news-20260713-tts-clone.mjs
// Voice clone: LYY (high-fidelity clone_with_prompt)
// ${new Date().toISOString()}

import type { AudioTrack } from "./types";

export const aiDailyNews20260713Audio: AudioTrack[] = ${JSON.stringify(results, null, 2)};
`;

  writeFileSync(
    path.join(ROOT, "src", "remotion", "AiDailyNews20260713", "audio.generated.ts"),
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
