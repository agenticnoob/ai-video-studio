# 《当智能走出人类认知之外》研究记录

更新日期：2026-07-18

## 研究边界

本片把论断分成三层：`已观察能力` 只描述已有论文或系统展示的结果；`合理外推` 描述由多个现有能力连接而来的可能路径；`哲学思辨` 只提出概念问题，不作为预测。片中所有未来场景都不代表超级智能已经存在，也不代表某条发展路线必然发生。

## 一手资料与可支持的论断

### 递归自我增强

- I. J. Good, *Speculations Concerning the First Ultraintelligent Machine* (1965), DOI 页面：<https://www.sciencedirect.com/science/article/pii/S0065245808604180>
  - 支持：机器如果能够参与设计更好的机器，可能形成“智能爆炸”的经典历史论证。
  - 限制：原文明确是推测性论证，不是已观察到的工程闭环。
  - 分类：`哲学思辨 / 历史思想实验`。

### 自动化科学与实验闭环

- Szymanski et al., *An autonomous laboratory for the accelerated synthesis of inorganic materials*, Nature 624 (2023)：<https://www.nature.com/articles/s41586-023-06734-w>
  - 支持：A-Lab 把计算、机器学习、机器人合成与结果分析连接成无机材料实验闭环；论文报告其在连续运行中尝试合成目标材料。
  - 限制：这是受控领域内、目标由人类设定的实验系统，不能外推为通用自主科学家。
  - 分类：`已观察能力`。
- Romera-Paredes et al., *Mathematical discoveries from program search with large language models*, Nature 625 (2024)：<https://www.nature.com/articles/s41586-023-06924-6>
  - 支持：FunSearch 将语言模型生成与自动评估器循环结合，在可高效评分的问题上发现新程序。
  - 限制：方法依赖明确的评估函数、丰富反馈和可演化的程序骨架。
  - 分类：`已观察能力`。

### 材料、蛋白与芯片设计

- Merchant et al., *Scaling deep learning for materials discovery*, Nature 624 (2023)：<https://www.nature.com/articles/s41586-023-06735-9>
  - 支持：GNoME 用图网络和计算验证扩展候选稳定材料搜索；论文报告 381,000 个新预测稳定结构，并指出外部实验已验证其中一部分结构。
  - 限制：预测稳定不等于材料可制造、具有目标性能或可规模生产。
  - 分类：`已观察能力`。
- Jumper et al., *Highly accurate protein structure prediction with AlphaFold*, Nature 596 (2021)：<https://www.nature.com/articles/s41586-021-03819-2>
  - 支持：AlphaFold 在 CASP14 与后续集合中展示了高精度蛋白结构预测，并可扩展到大规模结构预测。
  - 限制：结构预测不是完整的生物学理解、药物设计或实验验证。
  - 分类：`已观察能力`。
- Google DeepMind, *How AlphaChip transformed computer chip design* (2024)：<https://deepmind.google/blog/how-alphachip-transformed-computer-chip-design/>
  - 支持：强化学习方法已经用于芯片布局，并在 Alphabet 芯片设计流程中部署。
  - 限制：芯片布局是完整芯片设计流程中的一个阶段，且该方法的比较与复现仍有公开争论；旁白只把它称为“参与设计芯片”。
  - 分类：`已观察能力`。

### 可解释性与“答案不等于理解”

- Anthropic, *Tracing the thoughts of a large language model* (2025)：<https://www.anthropic.com/research/tracing-thoughts-language-model>
  - 支持：归因图与回路追踪能揭示模型部分内部计算路径，并发现输出解释与内部过程不一致的案例。
  - 限制：研究团队明确指出，即使对很短的提示，方法也只能捕捉总计算的一小部分，并需要大量人工解释。
  - 分类：`已观察能力`。
- Anthropic, *Open-sourcing circuit tracing tools* (2025)：<https://www.anthropic.com/research/open-source-circuit-tracing>
  - 支持：回路追踪工具与方法已开放给外部研究，提供了可复查的部分机制路径。
  - 限制：部分可见不等于完整可解释，更不等于能让普通决策者独立重建答案。
  - 分类：`已观察能力`。

### 意识与主观经验边界

- Thomas Nagel, *What Is It Like to Be a Bat?*, The Philosophical Review 83 (1974)：<https://www.pdcnet.org/phr/content/phr_1974_0083_0004_0435_0450>
  - 支持：主观经验带有第一人称视角，客观描述与“成为该主体是什么感觉”之间存在概念张力。
  - 分类：`哲学思辨`。
- David Chalmers, *Facing Up to the Problem of Consciousness* (1995)：<https://consc.net/papers/facing.html>
  - 支持：区分功能/认知问题与解释主观体验为何存在的“困难问题”。
  - 分类：`哲学思辨`。
- Butlin et al., *Consciousness in Artificial Intelligence: Insights from the Science of Consciousness* (2023)：<https://arxiv.org/abs/2308.08708>
  - 支持：评估人工系统意识需要从多种意识理论提取指标，不能把语言流畅性直接当成意识证据。
  - 限制：这是一套评估框架，不是对任何现有系统有无意识的定论。
  - 分类：`学术框架 / 未决问题`。

## 15 幕 claim 分类

| 幕 | 核心论断 | 分类 |
| ---: | --- | --- |
| 1 | 人类答案可能只是局部地图 | 哲学思辨 |
| 2 | AI 已参与候选解释、方案与下一步判断 | 已观察能力，附可靠性与人类目标限制 |
| 3 | 人类知识可成为新认知工具的脚手架 | 合理外推 |
| 4 | 认知—验证—行动可在窄领域形成自动闭环 | 已观察能力；扩大到通用闭环是合理外推 |
| 5 | 完整递归自我增强可能带来智能爆炸 | 历史思想实验；未观察到完整开放世界闭环 |
| 6 | 多个技术环节耦合可能引发相变 | 合理外推；局部能力跃迁已观察 |
| 7 | 数字并行压缩研究时间会改变权力 | 合理外推；“世纪压进一秒”是哲学思辨 |
| 8 | 未来物理可能合法但超出人类直觉 | 哲学思辨 |
| 9 | AI 对 AI 的验证可能扩大理解缺口 | 合理外推；当前解释工具仅部分覆盖是已观察能力 |
| 10 | 依赖可在没有反叛时转移实质控制 | 制度与技术哲学思辨 |
| 11 | 非人类尺度可能重释制度与生命分类 | 价值哲学思辨 |
| 12 | 人工意识无公认定论或单一测试 | 当前学术未决；主观经验边界是哲学思辨 |
| 13 | 知识分类依赖观察尺度与目的 | 认识论思辨 |
| 14 | 自主反馈系统可能成为历史主体 | 哲学思辨 |
| 15 | 保留不可外包的价值选择 | 规范性主张，不是经验预测 |

## 素材与证据策略

2026-07-18 依次搜索了仓库可复用素材库中的 knowledge network、recursive loop、autonomous laboratory、unknown physics boundary、civilization dependency、consciousness mirror、future agency 等意图，七次搜索均返回空数组。研究来源只进入研究记录与发布说明；画面使用明确标注为概念模型的 code-driven information graphics，不伪造论文截图或实验现场。
