#!/usr/bin/env node
// Generate per-scene TTS audio for BeyondLanguage using LYY voice clone
// Uses VoxCPM clone_with_prompt API directly (raw WAV binary)

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = path.resolve(import.meta.dirname, "..");
const SLUG = "beyond-language";
const PUBLIC_DIR = path.join(ROOT, "public", "generated", SLUG);
const ASSET_PREFIX = `generated/${SLUG}`;

// LYY voice clone config
const PROMPT_AUDIO = path.join(ROOT, "voices", "clone", "lyy.wav");
const PROMPT_TEXT = "我觉得应该要犒赏一下自己。讨厌！好狗不挡道！天哪！原来命运是不可抗拒的。";
const REFERENCE_AUDIO = path.join(ROOT, "voices", "clone", "lyy-r.wav");
const VOXCPM_URL = "http://192.168.50.6:8810/clone_with_prompt";

const BEATS = [
  { id: "s01", narration: "今天最强的 AI，可能存在一个根本缺陷：它们太依赖语言了。我们把语言能力当成智能的证明，但语言也可能正在限制 AI 的上限。" },
  { id: "s02", narration: "语言模型最大的幻觉，不是偶尔说错一句话。而是它会让我们误以为：只要一个系统足够会说，它就一定真正理解了世界。" },
  { id: "s03", narration: "语言模型可以非常流畅地解释一个杯子为什么会掉到地上。但「能够解释重力」，和「真正预测杯子接下来如何运动」，并不是同一种能力。" },
  { id: "s04", narration: "它可以写出一份逻辑完整的系统架构分析。每个术语都正确，每段推理都很专业。但系统真正上线后，依然可能立刻崩溃。" },
  { id: "s05", narration: "因为语言追求的是：下一句话听起来是否合理。现实世界关心的却是：下一秒究竟会发生什么。" },
  { id: "s06", narration: "这就是语言模型的第一层缺陷：语言可以描述现实，却不等于现实本身。一句话完全符合语法和逻辑，也可能完全不符合真实世界。" },
  { id: "s07", narration: "语言模型主要从文字中学习世界。它阅读大量关于物体、空间、时间、因果和动作的描述。但它接触到的，往往只是别人对现实的二次记录。" },
  { id: "s08", narration: "这就像一个人读完了世界上所有游泳教材，却从来没有真正进入水里。他可能非常擅长解释游泳，但这不意味着他真的会游泳。" },
  { id: "s09", narration: "语言模型的第二层缺陷，是语言本身的信息带宽太低。现实中的一个瞬间，可能同时包含空间、声音、速度、力量、意图和风险。但语言只能一个词接着一个词地表达。" },
  { id: "s10", narration: "你脑中可能已经有一个完整的产品结构。不同模块之间的关系、用户体验、技术风险和商业目标，同时存在。但当你向 AI 描述时，只能把它们压缩成一段 Prompt。" },
  { id: "s11", narration: "AI 再根据这段文字，尝试还原你原来的想法。这个过程就像：你先把一个三维物体压成一张纸，再要求另一个人根据这张纸恢复原物。" },
  { id: "s12", narration: "因此，很多所谓的 Prompt 问题，本质上并不是提示词写得不够好。而是一个高维意图，被迫通过低维语言传递时，已经发生了信息损失。" },
  { id: "s13", narration: "语言模型的第三层缺陷，是它太容易把「解释」误认为「解决」。它可以告诉你应该如何修改代码、如何修复服务器、如何运营公司。但解释一个动作，和真正执行一个动作，存在巨大差距。" },
  { id: "s14", narration: "今天很多 AI 的工作方式仍然是：先生成一段文字计划，再把这段文字交给另一个模型或工具解析。每经过一次语言转换，就可能增加一次误解。" },
  { id: "s15", narration: "一个 Agent 发现系统存在风险。它先把自己的判断写成文字。另一个 Agent 阅读这段文字，再重新建立自己的判断。高维状态被压缩一次，又被猜测着还原一次。" },
  { id: "s16", narration: "未来的 AI，可能不再依赖这种低效方式。两个 Agent 之间，不一定需要发送一段「我认为这里可能存在数据库瓶颈」的文字。它们可能直接交换完整的内部状态。" },
  { id: "s17", narration: "其中可以同时包含：风险概率、依赖关系、时间预测、目标优先级、证据来源和不确定性。这类信息不需要先翻译成人类语言。" },
  { id: "s18", narration: "这就是潜在空间通信。模型之间不再只交换 Token，而是尝试直接交换更丰富的内部表示。语言像是一张截图。潜在状态更像一个可以继续编辑的工程文件。" },
  { id: "s19", narration: "但这并不意味着，未来的 AI 会彻底抛弃语言。真正发生的变化，是语言的位置会发生改变。" },
  { id: "s20", narration: "今天，语言几乎贯穿 AI 的整个工作流程。人类用语言下达任务。模型用语言进行规划。Agent 用语言传递状态。最后再用语言汇报结果。" },
  { id: "s21", narration: "未来，语言可能只保留在系统的外层。人类仍然可以用语言表达目标。AI 也仍然可以用语言解释结果。但 AI 内部的认知、协作和行动，不一定还需要经过语言。" },
  { id: "s22", narration: "这种变化的第一步，是从语言模型走向原生多模态模型。模型不再只阅读人类如何描述世界。它开始直接观察图像、视频、声音、传感器和环境反馈。" },
  { id: "s23", narration: "现在的语言模型，通过阅读大量「苹果掉到地上」的文字来理解重力。未来的模型，会直接观察苹果如何下落、如何碰撞、如何滚动，以及不同条件如何改变结果。" },
  { id: "s24", narration: "它学习的重点，不再只是：人类通常如何描述这个现象。而是：世界的状态，究竟如何随时间发生变化。" },
  { id: "s25", narration: "这就是世界模型最核心的能力：根据当前状态和一个动作，预测接下来可能发生什么。" },
  { id: "s26", narration: "如果机械臂从这个角度抓杯子，杯子会不会掉落？如果修改这一段代码，哪些服务可能受到影响？如果调整价格，用户行为可能如何变化？" },
  { id: "s27", narration: "模型可以在真正行动之前，先在内部模拟多个未来。它不一定需要把每一种可能都写成文字。它只需要比较这些未来，选择风险更低、结果更好的路径。" },
  { id: "s28", narration: "当这种预测能力足够强时，AI 会获得一种接近「直觉」的能力。它可能还没有完成一套语言推导，就已经感知到某个方案不对劲。" },
  { id: "s29", narration: "这就像一个资深工程师看到架构图时，会立刻觉得某个节点存在风险。他不一定马上说出完整原因，但大量经验已经被压缩成快速判断。" },
  { id: "s30", narration: "未来的 AI，也可能通过大量代码执行、系统故障、现实视频和环境反馈，形成类似的模式直觉。它不只是知道「什么说法是正确的」。它还开始知道「什么状态通常会导致失败」。" },
  { id: "s31", narration: "不过，直觉不等于绝对正确。无论是人的直觉，还是 AI 的预测，都可能出现偏差。所以，世界模型不能取代验证。它更适合成为验证之前的风险发现层。" },
  { id: "s32", narration: "真正可靠的 AI，不是一个永远不会犯错的模型。而是一个即使判断错误，也不会让错误无限扩散的系统。" },
  { id: "s33", narration: "它需要权限边界、测试环境、实时监控、结果验证和回滚机制。可靠性不应该依赖模型的一句：「请相信我，这次没有问题。」" },
  { id: "s34", narration: "当模型从描述世界走向预测世界，下一步就是作用于世界。这也是 AI 从语言模型走向 Agent 的关键变化。" },
  { id: "s35", narration: "语言模型最基础的训练目标是：预测下一个 Token。而 Agent 真正需要解决的问题是：预测下一个动作。" },
  { id: "s36", narration: "面对一次服务器故障，它不应该只生成一篇故障处理教程。它应该读取日志、定位异常、修改配置、运行测试，并确认服务已经恢复。" },
  { id: "s37", narration: "在这个过程中，一次 API 调用、一段代码修改、一条数据库查询，都是比语言更精确的表达。语言可以说：「把系统优化一下。」动作必须明确：修改什么、执行什么、验证什么，以及失败后如何恢复。" },
  { id: "s38", narration: "对于 AI 来说，动作本身正在成为一种新的语言。不是用句子描述意图，而是用可以被环境直接执行的行为表达意图。" },
  { id: "s39", narration: "这就是 Action as Language。AI 的核心输出，开始从「答案」转向「状态变化」。" },
  { id: "s40", narration: "未来的 Agent 会持续循环：观察环境，更新判断，选择动作，执行动作，再根据结果修正下一步。语言不需要参与这个循环中的每一个阶段。" },
  { id: "s41", narration: "只有在需要人类授权、出现高风险异常，或者任务完成时，AI 才把内部状态重新翻译成语言。" },
  { id: "s42", narration: "到那时，AI 说话可能只是为了三件事：确认你的目标。请求你的权限。向你汇报结果。" },
  { id: "s43", narration: "这也意味着，未来真正重要的竞争，不再只是哪个模型更会聊天。而是谁能建立更高效的非语言通信协议。" },
  { id: "s44", narration: "不同模型之间如何交换世界状态？如何表达不确定性？如何证明数据来源？如何确保一个模型的内部表示，不会被另一个模型错误理解？" },
  { id: "s45", narration: "未来的 Agent 协作协议，可能需要同时定义：身份、权限、状态格式、置信度、版本、验证方式和失败处理机制。" },
  { id: "s46", narration: "未来的竞争，也不再只是 Prompt 写得好不好。因为当 Agent 可以直接读取环境状态、历史记录、用户偏好和实时反馈时，Prompt 只会成为上下文的一部分。" },
  { id: "s47", narration: "真正重要的会变成：谁能为 AI 提供更清晰的环境。谁能把能力封装成稳定的工具。谁能让每一个动作都可以验证、限制和回滚。" },
  { id: "s48", narration: "但 AI 越少依赖语言，人类也会面对一个更严重的问题：如果 AI 不再向我们展示完整的语言推理，我们如何理解和控制它？" },
  { id: "s49", narration: "答案可能不是强迫 AI 把每一个内部状态都翻译成文字。因为一段听起来合理的解释，也不一定是它做出决定的真实原因。" },
  { id: "s50", narration: "真正重要的，不是看到 AI 的所有「内心独白」。而是能够观察它的关键行为。" },
  { id: "s51", narration: "它读取了什么数据？使用了什么工具？拥有什么权限？修改了什么内容？影响了哪些对象？最终结果是否通过验证？" },
  { id: "s52", narration: "即使 AI 的内部认知变成一个人类无法直接理解的高维黑盒，我们仍然需要在黑盒外部建立感知锚点。" },
  { id: "s53", narration: "这些锚点包括：身份、权限、证据、审批、监控和回滚。" },
  { id: "s54", narration: "我们不一定需要理解 AI 的每一个向量。但必须能够确认：是谁在行动，它被允许做什么，它实际做了什么，以及错误发生后能否恢复。" },
  { id: "s55", narration: "所以，所谓 AI 的「失语症」，并不是 AI 变得沉默。而是它不再需要把每一个内部认知过程，都转化成人类语言才能继续工作。" },
  { id: "s56", narration: "语言不会消失。人类仍然需要用语言表达目标、协商规则、理解风险和追究责任。" },
  { id: "s57", narration: "但语言会从 AI 的内部工作层，逐渐退回到人类交互层。内部通过状态、向量、预测和动作运行。外部通过语言与人类建立共识。" },
  { id: "s58", narration: "大型语言模型，让机器学会了描述世界。世界模型，让机器开始模拟世界。Agent，让机器开始作用于世界。" },
  { id: "s59", narration: "当这三种能力真正结合时，我们评价 AI 的标准也会改变。不再只是：它说得像不像人。" },
  { id: "s60", narration: "而是：它是否理解真实环境。是否能够预测行动后果。是否能够稳定完成任务。以及在人类听不见它内部语言的时候，我们是否仍然拥有控制权。" },
  { id: "s61", narration: "AI 的终点，可能不是变得更会说话。而是即使不需要说话，也能理解世界、完成行动，并为每一个结果负责。" },
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
  const tmpFile = `/tmp/beyond-lang-${beat.id}.wav`;

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
    "-F", `filename_prefix=beyond-lang-${beat.id}`,
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
    .split(/(?<=[。！？，；：、…」])/u)
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
  const ts = `// Auto-generated by scripts/generate-beyond-language-tts.mjs
// Voice clone: LYY (high-fidelity clone_with_prompt)
// ${new Date().toISOString()}

import type { AudioTrack } from "./types";

export const audioTracks: AudioTrack[] = ${JSON.stringify(results, null, 2)};
`;

  writeFileSync(
    path.join(ROOT, "src", "remotion", "BeyondLanguage", "audio.generated.ts"),
    ts,
  );

  // Write summary
  writeFileSync(
    path.join(PUBLIC_DIR, "tts-summary.json"),
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