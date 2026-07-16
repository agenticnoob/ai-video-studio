import type { ProducerNarrationBeat } from "../../../scripts/lib/producer-audio/types";

export const agentProducerMediaSoundProofNarrationBeats = [
  {
    id: "open",
    narrationRequired: true,
    ttsText: "现成素材进入清单后，画面与声音都能被可靠复用。",
    displayText: "现成素材进入清单后，画面与声音都能被可靠复用。",
    language: "zh-CN",
  },
  {
    id: "media",
    narrationRequired: true,
    ttsText: "本地视频可以裁切、循环和变速，背景音乐会在旁白出现时自动降低音量。",
    displayText: "本地视频可以裁切、循环和变速，背景音乐会在旁白出现时自动降低音量。",
    language: "zh-CN",
  },
  {
    id: "signal",
    narrationRequired: true,
    ttsText: "动画、转场音效和环境声保持逐帧确定，最终结果可以重复审核。",
    displayText: "动画、转场音效和环境声保持逐帧确定，最终结果可以重复审核。",
    language: "zh-CN",
  },
] as const satisfies readonly ProducerNarrationBeat[];
