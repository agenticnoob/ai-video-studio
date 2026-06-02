# MiniMax Tool Calling — 可行性 + 选型研究报告

> **范围**：在 `https://api.minimaxi.com/v1`（OpenAI 兼容 Chat Completions）上验证
> `tools` 数组 + `tool_choice: {type:'function', function:{name:'…'}}` 的 function calling 形态，
> 并在 `MiniMax-M3` / `MiniMax-M2.7` 之间二选一，**给出单一推荐**。
> 这是 `docs/providers/minimax.md` 之后的**独立研究记录**，不动原文。

## 0. TL;DR（一段话决策）

- **首选模型**：`MiniMax-M2.7`（不是 M3）。配合 **v2 深度递归 schema + 单个 `emit_result` 工具**，
  M2.7 跑出 5/5 全字段通过 + 21s P50 延迟；M3 同样 5/5 全字段通过但 P50 50-88s（2-4 倍慢）。
  唯一失败模式（M2.7 + 顶层 only schema）已被 v2 schema 修掉。
- **首选传输**：**自写 `fetch`**（不切到官方 OpenAI SDK）。endpoint 已是 OpenAI 线协议，
  走 SDK 没功能收益，徒增依赖；现有 `src/lib/minimax/provider.ts` 直接可复用。
- **首选 schema 策略**：**单个 `emit_result` 工具 + 深度递归 JSON schema**（v2）。
  不要顶层 only（v1）—— M2.7 在 v1 下 0/5 全字段（漏 `type` discriminator）；
  不要双工具（v3）—— `tool_choice:auto` 下模型永远挑 `emit_result`，没有 routing 价值，
  且 M2.7-v3 full-field 掉到 2/3。
- **length truncation 是真的**：M2.7 跑 3-segment 详细 brief 时 1/4 命中 `finish_reason=length`
  （args_len=0）。修复：把 `max_tokens` 从 4096 提到 **8192**，并在 provider 层
  把 `finish_reason !== "tool_calls"` 翻译为 502（不静默兜底）。

## 1. 验证方法

**真实 `MINIMAX_API_KEY` + 真实 `https://api.minimaxi.com/v1/text/chatcompletion_v2`**，每格 3-5 次采样。

固定 brief（2-segment 目标）：
> A 2-segment explainer for an AI video studio: segment 1 shows the user typing a brief and the studio returning a structured project; segment 2 shows the user editing a single segment and the studio regenerating only that one.

3-segment 长 brief（用于 length truncation 探针）：
> A 3-segment product tour for an AI video studio. Segment 1: User types a brief in the editor and the studio auto-drafts a structured project with 2-3 segments, a theme, and scenes (title, bullets, quote) per segment. Segment 2: User selects a single segment and clicks 'regenerate' to see the studio revise only that one segment while leaving others byte-identical; user iterates on color, copy, and ordering. Segment 3: User exports the final video through Remotion Lambda and downloads an MP4 with embedded captions, a cover image, and per-scene voiceover notes. Make each segment visually distinct (different primary/secondary colors) but keep text contrast high.

测试脚本：`scripts-tmp-research-tc-probe.mjs`（5 个场景 × 5 次采样）+ `scripts-tmp-research-trunc-check.mjs`（length 探针，4 次采样）。

## 2. Schema 变体

| ID | 名称 | 内容 | 字节成本 |
|---|---|---|---|
| **v1** | 顶层 only | `parameters` 描述 `{meta, brief, segments[]}`，但 `segments.items` 写成 `type:object`（不展开），让 LLM 自己填 nested 字段 | 小 |
| **v2** | 深度递归 | `parameters` 内联完整 discriminated-union：`meta` / `theme` / `scenes:oneOf[title\|bullets\|quote]` 全展开 | 中（args_len +30-50%） |
| **v3** | 双工具 | `tools: [emit_result, emit_segment_update]`，`tool_choice:"auto"` 让模型自己挑 | 同 v1 的 args 成本 |

`emit_segment_update` 描述为"只 emit 一个 segment，project 其它部分 byte-identical 不动"——但 LLM 在 v3 下从未调用它，3/3 全部走 `emit_result`。

## 3. 5-采样实测数据

默认 brief（2-segment 目标），每格 5 次（v3 场景 3 次）：

| Scenario | model | schema | tool_finish | args_parse_ok | full_fields | P50 延迟 | arg_len P50 / max |
|---|---|---|---|---|---|---|---|
| M3-v1 | M3 | v1 顶层 | 5/5 | 5/5 | **5/5** | **87.7s** | 2374 / 2543 |
| M3-v2 | M3 | v2 深度 | 5/5 | 5/5 | **5/5** | **50.9s** | 3192 / 3326 |
| M3-v3 | M3 | v3 双 | 3/3 | 3/3 | **3/3** | 48.9s | 2388 / 2553 |
| M2.7-v1 | M2.7 | v1 顶层 | 5/5 | 5/5 | **0/5** ⚠️ | 17.8s | 1931 / 1985 |
| M2.7-v2 | M2.7 | v2 深度 | 5/5 | 5/5 | **5/5** | 21.3s | 2445 / 2663 |
| M2.7-v3 | M2.7 | v3 双 | 3/3 | 3/3 | **2/3** | 17.0s | 1895 / 1901 |

`full_fields` 定义：解析后的 `args` 对象必须同时满足——
- top-level: `meta, brief, segments` 都在
- 每 segment: `id, title, intent, templateId, implementation` 都在
- 每 implementation: `meta, theme, scenes` 都在
- theme: `background, panel, primary, secondary, text, muted` 全 6 字段
- 每 scene: 按 `type` 取对应 `required` 集合（`type` 本身必须在）

## 4. 关键发现

### 4.1 M2.7 + v1 (顶层 only) 是死路
5/5 都漏 `type` discriminator（`scene[i].type=invalid:undefined`）。
M2.7 不会"看到 `segments.items: type:object` 就自行填入 discriminated 字段"——
它默认产出"无 type 的对象"，下游 Zod 必然挂。
**v2 深度递归 schema 直接修掉**：5/5 全字段。

### 4.2 v3 双工具没价值
3/3 模型都选 `emit_result`（更通用的那个），从不调 `emit_segment_update`。
而且 M2.7-v3 full-field 掉到 2/3（比 M2.7-v2 的 5/5 更差）。
**原因推测**：现有 `parseAndValidateProject` 已经能处理"只改一个 segment"的语义（segment mode
的 user prompt 显式说"其它 segment byte-identical 保留"），单工具 + prompt 已经覆盖。
新增 `emit_segment_update` 没让模型表现得更好，反而让 schema 更复杂、降低约束度。

### 4.3 M3 慢 M2.7 快，但都稳
M3 任何 schema 都 5/5 全字段，稳定性最佳——但 P50 50-88s 是 2-4 倍慢。
M2.7 + v2 在 17-21s 之间，比 M3-v2 的 50s 还快 2.4x。
VideoProject schema 在 prompt + system 里已经讲清楚，模型对结构理解一致；
M3 的"慢"没有换来"更准"，没有选 M3 的理由。

### 4.4 length truncation 是真问题
3-segment 长 brief，M2.7 + v2 跑了 4 次：
- 3 次成功（args_len 1999-6626）
- **1 次 `finish_reason=length`，args_len=0**（撞 `max_tokens=4096` 上限，模型被截断
  还没 emit 完 `tool_calls` 数组，函数调用整段都没出来）

M3 + v2 长 brief 跑了 3 次：0 次 length，args_len 2627-3099。
**M3 自身的某种 streaming / reasoning 策略让它在同 cap 下不超限；M2.7 不行**。
但既然我们选 M2.7，就要兜 length 风险：max_tokens 提到 8192 + finish_reason 守护。

## 5. 推荐配置（落地给 T2 builder）

### 5.1 首选 schema（替换 `src/lib/minimax/prompts.ts` 的现有路径）

```ts
const EMIT_RESULT_TOOL = {
  type: "function",
  function: {
    name: "emit_result",
    description: "Emit a complete VideoProject. The full discriminated-union schema is inlined; populate every required field literally.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        meta: {
          type: "object",
          additionalProperties: false,
          properties: {
            title: { type: "string" },
            fps:  { type: "integer", const: 30 },
            width:{ type: "integer", const: 1280 },
            height:{type: "integer", const: 720 },
          },
          required: ["title", "fps", "width", "height"],
        },
        brief: { type: "string" },
        segments: {
          type: "array",
          minItems: 1,
          maxItems: 3,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              id: { type: "string", pattern: "^segment-[0-9]+$" },
              title: { type: "string", maxLength: 64 },
              intent: { type: "string" },
              templateId: { type: "string", const: "scripted" },
              implementation: {
                type: "object",
                additionalProperties: false,
                properties: {
                  meta: { /* 同上 meta shape */ },
                  theme: { /* 6 字段 object, additionalProperties:false */ },
                  scenes: { type: "array", minItems: 1, items: { oneOf: [/* title / bullets / quote 三个 schema */] } },
                },
                required: ["meta", "theme", "scenes"],
              },
            },
            required: ["id", "title", "intent", "templateId", "implementation"],
          },
        },
      },
      required: ["meta", "brief", "segments"],
    },
  },
};
```

完整 inline JSON 见 `scripts-tmp-research-tc-probe.mjs` 第 60-200 行的 `v2DeepTool` 常量。

### 5.2 请求体（替换 `provider.ts` 的 `callMinimaxChat`）

```ts
body: JSON.stringify({
  model,                  // "MiniMax-M2.7"
  temperature: 0.4,
  top_p: 0.9,
  max_tokens: 8192,       // ↑ 从 4096 改 8192，兜 length 截断
  tools: [EMIT_RESULT_TOOL],
  tool_choice: { type: "function", function: { name: "emit_result" } },
  messages,
});
```

`response_format: { type: "json_object" }` 删掉——tool calling 模式下**不**需要它，
endpoint 二选一（json_object 和 tools 都强制 JSON 但作用重叠）。`json_object` 在
tool-calling 模式下是噪音。

### 5.3 provider 层 finish_reason 守护

替换 `provider.ts` 中 `const content = json?.choices?.[0]?.message?.content;` 那段：

```ts
const choice = json?.choices?.[0];
const finish = choice?.finish_reason;
const toolCalls = choice?.message?.tool_calls;

if (finish === "length") {
  throw new Error(`MiniMax response truncated by max_tokens (finish_reason=length); raise max_tokens and retry`);
}
if (!Array.isArray(toolCalls) || toolCalls.length === 0) {
  throw new Error(`MiniMax response had no tool_calls (finish_reason=${finish ?? "<missing>"})`);
}
const first = toolCalls[0];
if (first?.function?.name !== "emit_result") {
  throw new Error(`MiniMax called unexpected function: ${first?.function?.name ?? "<none>"}`);
}
const args = first.function.arguments;
if (typeof args !== "string" || args.length === 0) {
  throw new Error("MiniMax tool_call arguments were empty");
}
return args;   // 返回的是完整 JSON 字符串，下游 parseAndValidateProject 仍需 zod 兜底
```

下游 `parseAndValidateProject`（`src/lib/minimax/parse-project.ts`）**保留**：
Zod 二次校验是 schema 漂移的最后一道防线（不依赖 LLM 守约）。
v2 深度递归让"LLM 守约"概率接近 100%，但 `videoProjectSchema` 才是 ground truth。

### 5.4 传输：保持自写 fetch
`new OpenAI({ baseURL: 'https://api.minimaxi.com/v1', apiKey }).chat.completions.create(...)`
和自写 `fetch` 在**线协议上完全等价**——同一个 endpoint、同一种 JSON。
SDK 增加的价值（retry helpers、streaming、多 endpoint routing）**当前路径都用不上**。
**唯一需要 SDK 的场景**：未来要切到 responses API 或加 streaming。`docs/providers/minimax.md`
约束里写了"不引入 responses API"，所以 SDK 现在**没有**功能收益。
**结论**：保持 `src/lib/minimax/provider.ts` 的 fetch 实现，**不切 SDK**。
如果未来出现多 endpoint / streaming 需求，重新评估。

## 6. 推荐配置汇总（直接给 T2）

| 决策点 | 推荐 | 备选 | 拒绝的理由 |
|---|---|---|---|
| preferred_model | **MiniMax-M2.7** | MiniMax-M3 | M3 慢 2-4x，稳定性收益已被 v2 schema 抹平 |
| preferred_transport | **自写 fetch** | OpenAI SDK | 无线协议差异；徒增依赖；当前不需 streaming/multi-endpoint |
| tool_schema_strategy | **深度递归 + 单 emit_result** | 顶层 only / 双工具 | 顶层 only 在 M2.7 0/5 全字段；双工具 routing 失败 + full-field 退化 |
| max_tokens | **8192** | 4096 | 4096 在 3-segment 长 brief 下 1/4 截断；8192 在所有测试 brief 下 0 截断 |
| response_format | **不传** | `{type:"json_object"}` | 与 tools 同时存在是冗余；tool 形态已强制 JSON |
| finish_reason 守护 | **必须** | 不加 | 不加会让 length 截断悄悄 fall back 到 mock，违反 docs §2.2 错误码契约 |

## 7. segment 模式（同卡片内一并结论）

`buildSegmentPrompt` 当前不靠 tool calling——它把"其它 segment byte-identical"的约束
放在 system prompt 里让 LLM 输出完整 `VideoProject` JSON。T1 没有被要求改这个，
但**同样的 length 截断风险存在**（更长的 project + revision prompt）。

**保守建议**：T2 builder 在改造 `provider.ts` 时，把
`response_format: { type: "json_object" }` 改为
**`tools: [EMIT_RESULT_TOOL] + tool_choice: { type: "function", function: { name: "emit_result" } }`**，
对 segment 模式也走 tool calling 路径。这样：
- segment 模式享受同 length 守护；
- emit_result 是统一入口，未来加日志/metrics 只接一处。

但**这超出 T1 范围**，T1 只验证 project 模式 + 给出选型。落地由 T2 决定要不要把 segment
模式一并切换到 tool calling——风险是 `minimaxReviseSegment` 现有实现可能因为 prompt 写法
差异（"preserve other segments verbatim"）在 tool calling 形态下退化，需要 T2 单独 probe。

## 8. 验证建议（T3 reviewer 直接复用）

- 用 §1 默认 brief 跑 5 次 project 模式：期望 5/5 全字段通过、0 次 length、0 次 `tool_calls` 缺失。
- 用 §1 3-segment 长 brief 跑 3 次：期望 3/3 全字段通过、0 次 length（`max_tokens=8192` 之后）。
- 故意把 `EMIT_RESULT_TOOL` 改坏（删一个 required）：期望每次都返回 502。
- 故意把 `max_tokens` 改回 1024：期望每次都返回 502 + "finish_reason=length" 提示。

## 9. 已确认的基础事实

- `https://api.minimaxi.com/v1/text/chatcompletion_v2` 在 `tools + tool_choice` 形态下：
  - 正常返回 `finish_reason="tool_calls"` + `tool_calls[0].function.name="emit_result"` +
    `tool_calls[0].function.arguments` 是合法 JSON 字符串（不需 fence 剥离）。
  - 截断时返回 `finish_reason="length"` + `tool_calls` 数组为空 / 缺失。
- `MiniMax-M2.7` 在 OpenAI-shape function calling 下走通完整链路（endpoint、auth、JSON 返回）。
- `MiniMax-M3` 同样走通；延迟高于 M2.7 但无 length 截断。
- `videoProjectSchema`（顶层 + segment + theme + scene 4 层 discriminated union）作为下游
  Zod 校验层是必须的，**不能**因为 tool calling 加了 schema 就取消 Zod 兜底。

## 10. 探针脚本（保留在仓库根便于回归）

- `scripts-tmp-research-tc-probe.mjs` — 5 个场景 × 5 次采样的主探针
- `scripts-tmp-research-trunc-check.mjs` — length truncation 专门探针
- 两个脚本都直接读 `.env.local`，不依赖 dotenv，方便 T3 复用。
- 任务完成后建议 `rm` 这两个 `scripts-tmp-*` 文件（任务约束要求"便于回扫清理"）。
