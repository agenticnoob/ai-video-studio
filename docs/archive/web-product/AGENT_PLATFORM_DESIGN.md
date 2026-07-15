# Agent Producer Platform Design

**Branch:** `refactor/agent-producer-service`
**Created:** 2026-07-13
**Status:** Design draft — implement after review

## 1. Motivation

Turn `ai-video-studio` from a single-repo video production workspace into a
**service platform** that external agents can use to produce high-quality
Remotion videos.

External agents write dedicated Remotion compositions (like
`PixelRAGChineseStandalone`) using the platform's primitives, upload them via
MCP/API, then preview and export through the platform.

## 2. Architecture

```
External Agent (Codex/Claude/Hermes)
  │
  │  MCP tools:
  │    upload_composition   → 上传 composition 到平台
  │    preview_composition  → 获取 still 预览
  │    render_composition   → 导出 mp4
  │    call_tts             → 语音合成
  │    list_primitives      → 查询可用 primitive
  │    list_recipes         → 查询可用 recipe
  │
  ▼
AI Video Studio Platform (Docker)
  │
  ├─ MCP Server              ← 新增：外部 agent 入口
  │
  ├─ compositions/            ← 新增：热加载目录
  │   └── <user-composition>/ ← agent 上传的 composition
  │       ├── types.ts
  │       ├── data.ts
  │       ├── script.ts
  │       ├── index.tsx
  │       └── ...
  │
  ├─ src/remotion/primitives/  ← 平台素材（91 个 primitive）
  ├─ src/remotion/recipes/blocks/  ← 平台素材
  ├─ src/remotion/standalone-video/  ← 平台 runtime 工具
  │
  ├─ Dynamic Registry         ← 新增：扫描 compositions/ 自动注册
  ├─ TTS Service (VoxCPM)     ← 现有
  └─ Render Engine            ← 现有
```

## 3. Composition Import Convention

**Decision (2026-07-13):** Use **path alias** instead of relative paths.

External compositions import platform primitives/recipes via a stable alias:

```typescript
// composition code — agent writes this
import { GridPulse } from 'platform-primitives';
import { TerminalSessionBlock } from 'platform-recipes';
import { StandaloneTimeline, StandaloneVoiceover } from 'platform-runtime';
```

Platform maps these via `tsconfig.json` paths or webpack resolve:

```json
{
  "compilerOptions": {
    "paths": {
      "platform-primitives": ["./src/remotion/primitives/index.ts"],
      "platform-recipes": ["./src/remotion/recipes/blocks/index.ts"],
      "platform-runtime": ["./src/remotion/standalone-video/index.ts"]
    }
  }
}
```

Rationale:
- Agent 不需要知道平台内部目录结构
- Composition 代码可移植——换个平台只需要改 tsconfig 映射
- 比相对路径更清晰，import 语句自说明"我用的是平台的素材"

## 4. Composition Lifecycle

```
Agent writes composition (in its own repo/workspace)
  │
  ▼  MCP: upload_composition
Composition files copied to platform compositions/<id>/
  │
  ▼  Platform scan
Dynamic registry detects new composition, registers in Remotion
  │
  ▼  MCP: preview_composition (optional)
Platform renders still frames → returns image URLs
  │
  ▼  MCP: call_tts (optional)
Platform generates narration audio → returns audio path
  │
  ▼  Agent updates composition data with TTS timing
  │  MCP: upload_composition (update)
  │
  ▼  MCP: render_composition
Platform renders final mp4 → returns download URL
  │
  ▼
Agent publishes / promotes
```

## 5. Dynamic Composition Registry

Remotion 要求 composition 在 `Root.tsx` 静态注册。

方案：**自动扫描 + 动态生成注册文件**

```
compositions/
  ├── my-video/
  │   ├── manifest.json    ← { id, fps, durationInFrames, width, height }
  │   ├── types.ts
  │   ├── data.ts
  │   ├── script.ts
  │   └── index.tsx        ← export default MyVideo
  └── another-video/
      └── ...
```

`scripts/scan-compositions.ts`（新增）：

```typescript
// 扫描 compositions/ 下每个文件夹
// 读取 manifest.json
// 生成 src/remotion/composition-registry.generated.ts
// 每个 composition 生成一个 <Composition> 注册项
```

生成的文件大概是这样：

```typescript
// auto-generated — do not edit
import { MyVideo } from '../../compositions/my-video/index';
import { AnotherVideo } from '../../compositions/another-video/index';

export const externalCompositions = [
  { id: 'my-video', component: MyVideo, fps: 30, durationInFrames: 4500, width: 1920, height: 1080 },
  { id: 'another-video', component: AnotherVideo, fps: 30, durationInFrames: 3000, width: 1920, height: 1080 },
];
```

`Root.tsx` 引入这个生成文件，自动注册。

## 6. MCP Server

### 协议选择

TBD — 两个选项：

- **stdio**：跟 `docker compose run` 结合，agent 本地起子进程连平台容器网络
- **HTTP-SSE**：平台暴露 http 端口，agent 通过 URL 远程调用

### 暴露的工具

| Tool | Description |
|------|-------------|
| `upload_composition` | 上传 composition 文件夹到平台 |
| `preview_composition` | 渲染指定帧返回 still |
| `render_composition` | 导出完整 mp4 |
| `call_tts` | 调用平台 TTS 生成 narration |
| `list_primitives` | 列出所有可用 primitive |
| `list_recipes` | 列出所有可用 recipe block |
| `get_composition_status` | 查询 composition 上传/渲染状态 |

## 7. Platform Cleanup

当前 repo 中的已 park 代码：

| Path | Status | Action |
|------|--------|--------|
| `src/app/page.tsx` + related pages | Parked (web editor) | 保留或移至 `src/app/archive/` |
| `src/app/api/generate/staged/` | Parked (staged generation) | 保留 TTS 相关 route，移除生成相关 |
| `src/app/api/render/` | Parked (VideoProject export) | 保留渲染能力，适配新 composition 路径 |
| `src/helpers/project-generation/` | Parked | 标记为 legacy |
| `src/lib/project-schema.ts` | Parked | 外部 composition 不需要 VideoProject |
| `src/templates/` | Could be useful | Recipe 沉淀路径，保留 |
| `src/remotion/ProjectVideo/` | Parked | 外部 composition 不走这个路径 |

**原则：** 不删文件，先标记 + 整理，避免破坏现有 composition 的参考价值。

## 8. Non-Goals (Phase 1)

- Web UI dashboard（纯 API/MCP）
- 用户管理 / 认证
- Composition market / sharing
- 自动 CI/CD
- npm publish platform packages（先走 tsconfig alias）

## 9. Open Questions

- [ ] MCP 协议：stdio vs HTTP-SSE？
- [ ] Composition 上传格式：zip？文件夹？manifest 字段定义？
- [ ] TTS 调用是否走 MCP 还是让 agent 直接调现成 `POST /api/tts`？
- [ ] platform-primitives alias 是否需要独立 npm 包？tsconfig paths 足够？