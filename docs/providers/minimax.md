# MiniMax Provider 接入设计稿

> 目标：把当前 `POST /api/generate` 的 deterministic mock 替换为对 [MiniMax（minimaxi.com）](https://api.minimaxi.com/v1) Chat Completions API 的真实调用，**保持 `VideoProject` 边界不动**，只让 provider 负责"接收 brief / 当前 project → 吐出符合 `videoProjectSchema` 的 JSON"。

## 0. 适用范围与不适用范围

适用范围：
- `src/app/api/generate/route.ts` 中两个 `mode`（`project` / `segment`）的远端生成路径。
- 由一个新增的 `src/lib/providers/minimax.ts`（建议文件名）封装远端调用。
- `.env.local` 中引入三个新环境变量。

不在本设计范围：
- 多 provider 抽象层 / provider registry / fallback 链（不在 v1 目标内）。
- 持久化、流式响应、token 计费、可观测性（埋点、日志、trace）。
- 模板扩展（保持 `templateId === "scripted"`）。
- 修改 `VideoProject` / `VideoSpec` / `sceneSchema` 任何字段。
- 重新组织 mock：mock 函数保留为测试工具，但 `route.ts` 不再调用。

## 1. 环境变量

| 变量名 | 必填 | 默认值 | 用途 |
|---|---|---|---|
| `MINIMAX_API_KEY` | 是 | — | MiniMax Chat Completions 的 Bearer token。建议本地写在 `.env.local`，CI 走 secret。 |
| `MINIMAX_MODEL` | 否 | `MiniMax-M2.7-highspeed` | 实际下发的 `model` 字段。**禁止硬编码**到代码里；所有读取都走 `process.env.MINIMAX_MODEL`，并提供默认值。 |
| `MINIMAX_BASE_URL` | 否 | `https://api.minimaxi.com/v1` | 远端根地址。所有请求都拼 `${BASE_URL}/text/chatcompletion_v2`。允许在测试或自建网关场景下整体覆盖。 |

### 1.1 推荐默认值
- `MINIMAX_MODEL` 推荐：`MiniMax-M2.7-highspeed`（经过 T1/T2/T3 probe 验证，tool-calling 路径 M2.7-highspeed 性能最优）。如需更高质量可换为 `MiniMax-M2.7`；如需更长上下文可换为 `MiniMax-Text-01` 长上下文版本（`MiniMax-Text-01` 在文档中已支持 1M context）。
- 这些只是建议；model 字段必须**只**从环境变量读取，禁止在源码中写死具体值。

### 1.2 缺失/非法配置
- `MINIMAX_API_KEY` 未设置 → 在首次 `route.ts` 进入时直接抛 `Error("MINIMAX_API_KEY is not configured. Set it in .env.local to enable real generation.")`，由 `route.ts` 翻译为 **HTTP 500**。
- `MINIMAX_MODEL` 未设置 → 用默认 `MiniMax-Text-01`；**不抛错**（默认即合规）。
- `MINIMAX_BASE_URL` 未设置或非法（不以 `http://` / `https://` 开头）→ 用默认值；非法但**未设置**时也不抛错，但若用户在 `.env.local` 里写成 `minimaxi.com/v1` 缺协议，则在第一次请求时打 `console.warn` 并回退默认。

## 2. 请求形态

调用 `POST ${MINIMAX_BASE_URL}/text/chatcompletion_v2`，body 用 OpenAI Chat Completions 兼容 schema：

```json
{
  "model": "${MINIMAX_MODEL}",
  "temperature": 0.4,
  "top_p": 0.9,
  "max_tokens": 4096,
  "response_format": { "type": "json_object" },
  "messages": [
    { "role": "system", "content": "<见第 3、4 节模板>" },
    { "role": "user",   "content": "<见第 3、4 节模板>" }
  ]
}
```

### 2.1 采样参数推荐

| 参数 | 推荐值 | 理由 |
|---|---|---|
| `temperature` | `0.4` | 结构化 JSON 任务需要稳定但不能全 determinism；`0` 容易在长 schema 上回退成重复 placeholder。 |
| `top_p` | `0.9` | 配合 `temperature` 限制长尾；如果选择关闭 `top_p` 也可以，文档没有强制要求；建议保留以保持行为可预测。 |
| `max_tokens` | `4096` | 3-segment 项目 + 全 schema 序列化，4K token 足够；不足会在响应里触发后续的 schema 校验失败。 |
| `response_format` | `{ "type": "json_object" }` | 强制 JSON 输出；MiniMax v2 endpoint 支持此字段，**必须传**，否则模型可能用 markdown fence 包 JSON、夹 prose、漏字段。 |
| `stream` | **不传**（默认 false） | 同步 JSON 解析比流式简单；`/api/generate` 已经是同步 RPC 风格。 |

### 2.2 错误码 → HTTP 状态映射

| 触发条件 | 远端返回 | `route.ts` 行为 | 返回 HTTP | 响应体 `error` |
|---|---|---|---|---|
| `MINIMAX_API_KEY` 未配置 | — | 提前 throw | **500** | `MINIMAX_API_KEY is not configured. Set it in .env.local to enable real generation.` |
| HTTP 非 2xx（含 401/403/429/5xx） | `{ type: "error", error: { type, message, http_code }, request_id }` | 透传 | **502** | `MiniMax request failed: <http_code> <body-snippet 前 200 字符>` |
| 响应非 JSON（HTML 错误页、CDN 拦截、proxy 报错） | text/html 等 | throw | **502** | `MiniMax returned a non-JSON response: <前 200 字符>` |
| 响应是 JSON 但 `choices[0].message.content` 缺失 / 是空字符串 | `{ choices: [...] }` 空 | throw | **502** | `MiniMax response did not include any message content.` |
| `content` 解析失败（不是合法 JSON、含 fence、含 prose） | — | throw | **502** | `MiniMax response was not valid JSON: <parse error>; raw=<content 前 200 字符>` |
| 解析出的 JSON 形状不合 `videoProjectSchema` | — | throw | **500** | `Generated project failed schema validation: <zod issue path + message> ; raw=<前 200 字符>` |

> 关键原则：**任何错误都不允许 silent fallback 回 mock**。`buildMockProjectFromBrief` / `reviseProjectSegmentFromPrompt` 一旦从 `route.ts` 解绑，UI 必须能感知到失败原因。

## 3. mode=project prompt

把 user 的 `brief` 拆成 1–3 个 segment，每个 segment 给出 `title` / `intent` / `templateId` / `implementation`。当前 `templateId` 固定为 `"scripted"`，因此 `implementation` 必须严格符合当前 scripted 模板的 `videoSpecSchema`。这里的 `scenes` 是 scripted 模板专有的内部序列字段，不是所有未来模板的通用字段。

### 3.1 期望产出形状

```jsonc
{
  "meta": {
    "title": "<string>",         // 来自 brief 首句或 LLM 概括
    "fps": 30,                   // 由 system 提示固定为 30
    "width": 1280,               // 固定
    "height": 720                // 固定
  },
  "brief": "<原 brief 原文>",
  "segments": [
    {
      "id": "segment-1",         // 固定为 "segment-<index+1>"
      "title": "<short title>",  // ≤ 64 字符
      "intent": "<1 句话>",
      "templateId": "scripted",  // 固定
      "implementation": {
        "meta": { "title": "<同 segment.title>", "fps": 30, "width": 1280, "height": 720 },
        "theme": { /* 完整 themeSchema */ },
        "scenes": [ /* 1+ scenes, 类型 ∈ {title, bullets, quote} */ ]
      }
    }
    // 可选 segment-2, segment-3
  ]
}
```

### 3.2 system prompt 模板（project mode）

```text
You generate structured "VideoProject" JSON for a segment-first video studio.

The output must:
- be a single JSON object (no markdown fence, no commentary)
- validate against the exact Zod schemas below — do not omit required fields
- contain between 1 and 3 segments (1 if brief ≤ 1 sentence, 2 if 2–4 sentences or < 280 chars, 3 if longer)
- use one primary template per segment
- use one primary template per segment
- use templateId "scripted" for every segment
- use fps=30, width=1280, height=720 in every implementation.meta

# Scripted implementation rules
Because every current segment uses templateId "scripted",
each segment.implementation must be the scripted VideoSpec shape. In that
shape, implementation.scenes is an array of 1+ scripted scenes. Each scene has a
discriminated `type` ∈ {"title", "bullets", "quote"} with fields:

  title:   { id, type:"title",   duration, kicker?, title, subtitle?, voiceover? }
  bullets: { id, type:"bullets", duration, kicker?, title, bullets: string[≥1], voiceover? }
  quote:   { id, type:"quote",   duration, kicker?, quote, author?, voiceover? }

- duration is an integer > 0, in frames at 30fps (so 90 ≈ 3 seconds)
- scene ids must be unique within the segment and stable across regenerations
  (e.g. "hook", "pipeline", "output")
- keep total per-segment duration between 90 and 600 frames

# Scripted theme rules
Every scripted implementation has a theme with all 6 fields:
  background, panel, primary, secondary, text, muted
Use CSS color literals (hex or rgba). Vary primary/secondary across segments
so multi-segment projects feel distinct, but keep contrast readable.

# Hard constraints
- Return ONLY the JSON object. Do not prefix with "Here is the JSON:".
- Do not add fields not in the schemas.
- Do not return empty implementation.scenes arrays for scripted segments.
- If the brief is empty or off-topic, still return a valid 1-segment project
  with a generic AI Video Studio workflow.
```

### 3.3 user prompt 模板（project mode）

```text
Brief:
"""
{brief}
"""

Return a single JSON object matching the VideoProject contract above.
```

## 4. mode=segment prompt

把当前完整 project（包括每个 segment 的完整 `implementation.meta` / `implementation.theme` / `implementation.scenes`）+ `segmentId` + `revisionPrompt` 喂给 LLM，要求 LLM **只修改该 segment 的 `title` / `intent` / `implementation`**，其它 segment **逐字回放**。

### 4.1 喂进去的 project 形态

```jsonc
{
  "meta": { "title", "fps", "width", "height" },
  "brief": "<原 brief>",
  "segments": [
    {
      "id": "segment-1",
      "title": "<title>",
      "intent": "<intent>",
      "templateId": "scripted",
      "implementation": {
        "meta": { "title", "fps", "width", "height" },
        "theme": { /* 完整 themeSchema */ },
        "scenes": [ /* 完整 scripted scenes */ ]
      }
    }
    // ... 其余 segment 同形
  ]
}
```

> 关键设计：segment mode **必须喂入完整 implementation**，这样模型可以逐字复制非目标 segment。早期只传 `implementation.meta` 会导致非目标 segment 丢失 `theme` / `scenes`，已被后续修正。

### 4.2 期望产出形状

完整 `VideoProject`，**结构和 project mode 完全一致**：

- 被编辑的 segment：`title` / `intent` / `implementation` 可以变；
- 其它 segment：所有字段（包括 `implementation.scenes` / `implementation.theme`）**必须**和原始 input 中该 segment 的内容逐字相同。

### 4.3 system prompt 模板（segment mode）

```text
You revise a single segment inside an existing "VideoProject" JSON.

# Output contract
Return the FULL VideoProject (not a partial diff), matching the exact Zod
schemas in this conversation. The output must be a single JSON object
(no markdown fence, no commentary).

# Preservation rules (HARD)
- For every segment whose id is NOT "{targetSegmentId}":
  - copy title, intent, templateId, implementation verbatim from the input
  - in particular: scenes array and theme must match the input byte-for-byte
  - do NOT regenerate, re-color, reorder, or rephrase them
- For the segment whose id IS "{targetSegmentId}":
  - you may change title, intent, and implementation
  - keep templateId = "scripted"
  - keep implementation.meta.title === implementation.scenes[0].title etc.
  - if the revision prompt is empty or off-topic, keep the segment as-is

# Revision request for target segment
{revisionPrompt}

# Scripted implementation schema reminder
- implementation.meta: { title, fps=30, width=1280, height=720 }
- implementation.theme: { background, panel, primary, secondary, text, muted }
- implementation.scenes: 1+ items, each type ∈ {"title", "bullets", "quote"} with the
  matching fields; duration is integer frames at 30fps

Return ONLY the JSON object.
```

### 4.4 user prompt 模板（segment mode）

```text
Current project (full implementation on every segment so non-target segments can be copied verbatim):
```json
{projectWithFullImplementations}
```

Target segmentId: "{targetSegmentId}"
Revision prompt: "{revisionPrompt}"

Return the full VideoProject JSON with all segments. Preserve other segments
verbatim, including scripted theme + scenes, and regenerate only the target segment.
```

## 5. JSON 解析策略

`parseAndValidateProject(rawText)` 工具函数（建议位置 `src/lib/providers/parse.ts`）：

1. **去 fence**：用正则 `^```(?:json)?\s*|\s*```$` 去掉首尾围栏；允许多行。
2. **直接 `JSON.parse`**：拿到对象。
3. **Zod 校验**：`videoProjectSchema.safeParse(parsed)`，失败时收集 `issues`。
4. **任何一步失败**：抛 `Error`，message 同时包含根因和 **前 200 字符的 raw text**（用于上游 log），并保留 stack。

禁止：
- 用 `??` 静默兜底字段。
- 失败后回退到 mock；必须由 `route.ts` 翻译为 500/502 并把消息回给前端。
- `JSON.parse` 之外再尝试 `eval`、HTML 实体解码、宽松 JSON 解析（会掩盖 schema 不合规的 bug）。

## 6. 错误处理

### 6.1 在 provider 层（`providers/minimax.ts`）

```ts
// 伪代码
export async function callMiniMaxChat(messages): Promise<string> {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    throw new Error("MINIMAX_API_KEY is not configured. Set it in .env.local to enable real generation.");
  }

  const baseUrl = process.env.MINIMAX_BASE_URL || "https://api.minimaxi.com/v1";
  const model = process.env.MINIMAX_MODEL || "MiniMax-M2.7-highspeed";

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/text/chatcompletion_v2`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, temperature: 0.4, top_p: 0.9, max_tokens: 4096,
                              response_format: { type: "json_object" }, messages }),
      // 推荐 30s 超时（Next.js route default 没有 abort，需要自己实现）
      signal: AbortSignal.timeout(30_000),
    });
  } catch (e) {
    throw new Error(`MiniMax request failed: network error: ${(e as Error).message}`);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`MiniMax request failed: ${res.status} ${body.slice(0, 200)}`);
  }

  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    const body = await res.text();
    throw new Error(`MiniMax returned a non-JSON response: ${body.slice(0, 200)}`);
  }

  const json = await res.json();
  const content: string | undefined = json?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || content.length === 0) {
    throw new Error("MiniMax response did not include any message content.");
  }

  return content;
}
```

### 6.2 在 route 层（`src/app/api/generate/route.ts`）

```ts
// 伪代码替换当前的 mock 调用分支
try {
  generatedProject = parsedRequest.data.mode === "project"
    ? await generateProjectViaMiniMax({ brief: parsedRequest.data.brief })
    : await reviseSegmentViaMiniMax({
        project: parsedRequest.data.project,
        segmentId: parsedRequest.data.segmentId,
        revisionPrompt: parsedRequest.data.revisionPrompt,
      });
} catch (error) {
  const message = error instanceof Error ? error.message : "Generation request could not be completed.";
  // 简易分类：包含 "request failed" / "non-JSON" / "did not include" → 502；其它 → 500
  const status = /MiniMax request failed|non-JSON|did not include/.test(message) ? 502 : 500;
  return NextResponse.json({ error: message }, { status });
}
```

> 注意：当前 `route.ts` 把所有生成失败都映射成 400，按上面建议升级为 500/502 区分配置/网络/解析/校验，更便于前端定位。

## 7. 与现有 mock 的兼容

**结论**：保留 mock 函数作为测试/本地 dry-run 工具，但**解绑** route。

| 文件 | 现状 | 建议 | 理由 |
|---|---|---|---|
| `src/lib/mock-spec.ts` | 提供 `buildMockSpec` / `buildMockSpecFromBrief` / `titleFromBrief` | **保留**，加入 `// test-only` JSDoc 注释 | 单文件、无副作用；可被单测和 dev offline 引用 |
| `src/lib/project-generation.ts` | 提供 `buildMockProjectFromBrief` / `reviseProjectSegmentFromPrompt` / `buildSegmentFromBriefPart` | **保留**，改名为 `*ForTest*` 后缀或加 `// test-only` 注释 | 现有单测可能依赖；只要不 import 进 route 就不影响生产路径 |
| `src/app/api/generate/route.ts` | 直接调用 mock | **改为调用 provider** | 这是 v1 唯一真正"切换"的入口 |
| 其它 mock 引用 | 暂无（`rg "buildMockProjectFromBrief"` 应当只剩 `project-generation.ts` 内部） | 切换后做一次 grep 确认没有遗漏 | 防止误留 import |

可选增强（**不在 v1 必做**）：把 mock 入口放到 `process.env.MOCK_GENERATION === "1"` 守卫下，作为离线 debug 开关。

## 8. 验证与回归

代码改完后，至少在本地跑：

```bash
npm run lint
npx tsc --noEmit
npm run build
```

手测：
1. 不设 `MINIMAX_API_KEY` → POST `/api/generate` 返回 500 + 提示信息。
2. 设了合法 key 但 `MINIMAX_BASE_URL` 指向 `httpbin.org/status/500` → 返回 502。
3. 设了合法 key + 默认 model，POST 一段正常 brief → 返回的 `project` 能 `videoProjectSchema.parse` 通过；UI 渲染正常。
4. POST segment mode：修改返回 project 里**只**目标 segment 的 `implementation.scenes` 变了，其它 segment 与原 project 字段完全一致。
5. 故意把 LLM 响应截断/加 fence（用 mock 替换 `callMiniMaxChat` 返回值）→ 解析层抛错，route 502/500，无 silent fallback。

## 9. 已确认的基础事实

- `https://api.minimaxi.com/v1/models` 在未带 API key 的情况下返回 HTTP 401 + 标准 OpenAI 错误体 `{type:"error", error:{type:"authorized_error", message, http_code:"401"}, request_id}`，endpoint 真实存在并可访问。
- `https://api.minimaxi.com/v1/text/chatcompletion_v2` 接受 `POST` + JSON body，未带 key 时返回 `{base_resp:{status_code:1004, status_msg:"login fail: ..."}}`，可作为契约回归基线。
- `videoProjectSchema` 当前结构（`meta` / `brief` / `segments[]`，每个 segment 由 `videoSegmentSchema` transform 计算 `durationInFrames`）保持不变；provider 输出必须能被它原样接受。
