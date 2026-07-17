import type { ProducerNarrationBeat } from "../../../scripts/lib/producer-audio/types";

export const dnsResolutionExplainerNarrationBeats = [
  {
    id: "cache",
    narrationRequired: true,
    ttsText: "输入域名后，浏览器先检查本机和系统缓存；没有答案，才把问题交给递归解析器。",
    displayText: "输入域名后，浏览器先检查本机和系统缓存；没有答案，才把问题交给递归解析器。",
    language: "zh-CN",
  },
  {
    id: "delegation",
    narrationRequired: true,
    ttsText:
      "解析器先问根服务器，再找到顶级域服务器，最后抵达权威服务器；每一步都返回下一站的线索。",
    displayText:
      "解析器先问根服务器，再找到顶级域服务器，最后抵达权威服务器；每一步都返回下一站的线索。",
    language: "zh-CN",
  },
  {
    id: "answer",
    narrationRequired: true,
    ttsText:
      "权威服务器给出记录和生存时间；解析器缓存结果，把 IP 地址交回浏览器，后续查询因此更快。",
    displayText:
      "权威服务器给出记录和生存时间；解析器缓存结果，把 IP 地址交回浏览器，后续查询因此更快。",
    language: "zh-CN",
  },
] as const satisfies readonly ProducerNarrationBeat[];
