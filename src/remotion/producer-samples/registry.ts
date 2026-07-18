import type { MaintainedProducerSampleManifest, ProducerSampleManifest } from "./manifest";
import { agentProducerMediaSoundProofManifest } from "../AgentProducerMediaSoundProof/manifest";
import { tcpHandshakeEditorialManifest } from "../TcpHandshakeEditorial/manifest";
import { tcpHandshakeTerminalManifest } from "../TcpHandshakeTerminal/manifest";
import { aiDailyNews20260717Manifest } from "../AiDailyNews20260717/manifest";
import { dnsResolutionExplainerManifest } from "../DnsResolutionExplainer/manifest";

export const producerSampleManifests = [
  {
    compositionId: "AiConceptsForBeginners",
    sampleName: "AiConceptsForBeginners",
    slug: "ai-concepts-for-beginners",
    contentFamily: "tutorial",
    canvasProfile: "landscape-16x9",
    localArtifactRoot: "public/generated/ai-concepts-for-beginners/",
    ttsStatus: "generated-local",
    sampleStatus: "frozen-reference",
    reviewFrames: [
      {
        frame: 60,
        label: "restaurant opening",
        purpose: "Check the orbiting concept labels, main title hierarchy, and caption clearance.",
      },
      {
        frame: 3999,
        label: "context workbench",
        purpose: "Check workbench density, context-window capacity bar, and readable labels.",
      },
      {
        frame: 5235,
        label: "retrieval conveyor",
        purpose: "Check RAG flow direction, step hierarchy, and beginner readability.",
      },
      {
        frame: 9019,
        label: "agent loop",
        purpose: "Check observe-plan-act-check loop focus and manager metaphor.",
      },
      {
        frame: 12604,
        label: "subagent delegation",
        purpose: "Check main-agent delegation tree and bounded parallel assignments.",
      },
      {
        frame: 14995,
        label: "complete concept map",
        purpose: "Check final five-category relationship map and closing caption clearance.",
      },
    ],
    sourceFiles: [
      {
        path: "src/remotion/AiConceptsForBeginners/AiConceptsForBeginners.tsx",
        kind: "renderer",
      },
      { path: "src/remotion/AiConceptsForBeginners/types.ts", kind: "types" },
      { path: "src/remotion/AiConceptsForBeginners/script.ts", kind: "script" },
      { path: "src/remotion/AiConceptsForBeginners/data.ts", kind: "data" },
      {
        path: "src/remotion/AiConceptsForBeginners/audio.generated.ts",
        kind: "audio-metadata",
      },
      { path: "src/remotion/Root.tsx", kind: "root-registration" },
      { path: "scripts/ai-concepts-for-beginners-smoke.mjs", kind: "smoke" },
    ],
    promotionCandidates: [
      {
        id: "concept-metaphor-system-map",
        targetLayer: "block",
        gateState: "stay-sample-local",
        status: "sample-local",
        reason:
          "The restaurant metaphor and final category map need a second educational topic before becoming a shared Producer block.",
      },
      {
        id: "beginner-concept-workbench",
        targetLayer: "block",
        gateState: "stay-sample-local",
        status: "sample-local",
        reason:
          "The context workbench, MCP socket rail, and agent loop are useful local visual blocks but their props are still tailored to this script.",
      },
    ],
    notes: [
      "Generated VoxCPM clone audio, TTS summary, stills, and mp4 stay local-only under public/generated/ai-concepts-for-beginners/ and out/.",
      "The narration explains eleven concepts in dependency-aware order and treats LangChain as one optional implementation framework.",
      "The sample uses an AI restaurant metaphor and repo primitives before sample-local relationship diagrams.",
      "This remains a dedicated Agent Producer composition and does not use the parked web prompt path.",
    ],
  },
  {
    compositionId: "AiDailyNewsBrief20260709",
    sampleName: "AiDailyNewsBrief20260709",
    slug: "ai-daily-news-brief-2026-07-09",
    contentFamily: "trend-briefing",
    canvasProfile: "landscape-16x9",
    localArtifactRoot: "public/generated/ai-daily-news-brief-2026-07-09/",
    ttsStatus: "generated-local",
    sampleStatus: "frozen-reference",
    reviewFrames: [
      {
        frame: 45,
        label: "opening thesis",
        purpose: "Check daily 2026-07-09 thesis, foreground 3D cards, and caption clearance.",
      },
      {
        frame: 620,
        label: "GPT-5.6 model tiers",
        purpose: "Check Sol/Terra/Luna model-tier readability and caption clearance.",
      },
      {
        frame: 1560,
        label: "sovereign compute",
        purpose: "Check Humain/Cohere workflow map density and 50MW framing.",
      },
      {
        frame: 2500,
        label: "grid equipment",
        purpose: "Check 160-week equipment bottleneck chart and side-card spacing.",
      },
      {
        frame: 3680,
        label: "market repricing",
        purpose: "Check Samsung/capital hard-asset repricing card readability.",
      },
      {
        frame: 5200,
        label: "developer playbook",
        purpose: "Check model gateway, audit, cost, and fallback workflow readability.",
      },
    ],
    sourceFiles: [
      {
        path: "src/remotion/AiDailyNewsBrief20260709/AiDailyNewsBrief20260709.tsx",
        kind: "renderer",
      },
      { path: "src/remotion/AiDailyNewsBrief20260709/types.ts", kind: "types" },
      { path: "src/remotion/AiDailyNewsBrief20260709/script.ts", kind: "script" },
      { path: "src/remotion/AiDailyNewsBrief20260709/data.ts", kind: "data" },
      {
        path: "src/remotion/AiDailyNewsBrief20260709/audio.generated.ts",
        kind: "audio-metadata",
      },
      { path: "src/remotion/Root.tsx", kind: "root-registration" },
      { path: "scripts/ai-daily-news-brief-2026-07-09-smoke.mjs", kind: "smoke" },
    ],
    promotionCandidates: [
      {
        id: "daily-ai-news-card-3d",
        targetLayer: "block",
        gateState: "stay-sample-local",
        status: "sample-local",
        reason:
          "The foreground 3D news-card language now works across consecutive daily news samples; keep sample-local until another topic proves a stable reusable API.",
      },
      {
        id: "ai-infrastructure-briefing-flow",
        targetLayer: "block",
        gateState: "stay-sample-local",
        status: "sample-local",
        reason:
          "The model-access to compute-power to capital-repricing story structure is useful but still specific to this AI infrastructure day.",
      },
    ],
    notes: [
      "Generated source cards, TTS audio, stills, and rendered mp4 stay local-only under public/generated/ai-daily-news-brief-2026-07-09/ and out/.",
      "The video covers only the user-provided 2026-07-09 daily AI news pack, not the older 2026-06-17 to 2026-07-09 strategic recap.",
      "Real source capture is handled with source-card fallback records outside the frame; generated source cards are not called screenshots.",
      "3D is used for foreground content cards and transition plates rather than as a background-only scene.",
      "This sample remains a dedicated Agent Producer composition and does not use the parked web prompt path.",
    ],
  },
  {
    compositionId: "AiNewsStrategicBrief20260709",
    sampleName: "AiNewsStrategicBrief20260709",
    slug: "ai-news-strategic-brief-2026-07-09",
    contentFamily: "trend-briefing",
    canvasProfile: "landscape-16x9",
    localArtifactRoot: "public/generated/ai-news-strategic-brief-2026-07-09/",
    ttsStatus: "generated-local",
    sampleStatus: "frozen-reference",
    reviewFrames: [
      {
        frame: 45,
        label: "opening thesis",
        purpose: "Check broad 23-day thesis, foreground 3D cards, and caption clearance.",
      },
      {
        frame: 620,
        label: "model access gate",
        purpose: "Check access-control framing and no fallback/screenshot wording in-frame.",
      },
      {
        frame: 1760,
        label: "model matrix",
        purpose: "Check flagship/daily/low-cost model tier readability and caption clearance.",
      },
      {
        frame: 3300,
        label: "coding security",
        purpose:
          "Check coding-agent security checklist readability and foreground 3D card spacing.",
      },
      {
        frame: 4300,
        label: "financial regulation",
        purpose: "Check financial-agent risk framing and timeline readability.",
      },
      {
        frame: 5500,
        label: "power grid",
        purpose: "Check electricity chart readability and side-card spacing.",
      },
      {
        frame: 6200,
        label: "market risk",
        purpose: "Check AI capex/real-delivery risk framing and stacked-card spacing.",
      },
    ],
    sourceFiles: [
      {
        path: "src/remotion/AiNewsStrategicBrief20260709/AiNewsStrategicBrief20260709.tsx",
        kind: "renderer",
      },
      { path: "src/remotion/AiNewsStrategicBrief20260709/types.ts", kind: "types" },
      { path: "src/remotion/AiNewsStrategicBrief20260709/script.ts", kind: "script" },
      { path: "src/remotion/AiNewsStrategicBrief20260709/data.ts", kind: "data" },
      {
        path: "src/remotion/AiNewsStrategicBrief20260709/audio.generated.ts",
        kind: "audio-metadata",
      },
      { path: "src/remotion/Root.tsx", kind: "root-registration" },
      { path: "scripts/ai-news-strategic-brief-2026-07-09-smoke.mjs", kind: "smoke" },
    ],
    promotionCandidates: [
      {
        id: "strategic-news-card-3d",
        targetLayer: "block",
        gateState: "stay-sample-local",
        status: "sample-local",
        reason:
          "The 3D content-card stack is effective for long strategic briefings; keep sample-local until another recap reuses it.",
      },
      {
        id: "multi-week-ai-trend-briefing",
        targetLayer: "block",
        gateState: "stay-sample-local",
        status: "sample-local",
        reason:
          "The compressed multi-week trend structure needs another topic before extraction into a shared Producer block.",
      },
    ],
    notes: [
      "Generated source cards, TTS audio, stills, and rendered mp4 stay local-only under public/generated/ai-news-strategic-brief-2026-07-09/ and out/.",
      "The video compresses the user-provided 2026-06-17 to 2026-07-09 news stream into structural trends rather than a day-by-day bulletin.",
      "Real browser capture was attempted with the local Playwright wrapper, but it stalled before producing usable screenshots; visible evidence uses information graphics and localized source-card fallback assets.",
      "3D is used for foreground content cards and transition plates rather than as a background-only scene.",
      "This sample remains a dedicated Agent Producer composition and does not use the parked web prompt path.",
    ],
  },
  {
    compositionId: "AiDailyNewsBrief20260708",
    sampleName: "AiDailyNewsBrief20260708",
    slug: "ai-daily-news-brief-2026-07-08",
    contentFamily: "trend-briefing",
    canvasProfile: "landscape-16x9",
    localArtifactRoot: "public/generated/ai-daily-news-brief-2026-07-08/",
    ttsStatus: "generated-local",
    sampleStatus: "frozen-reference",
    reviewFrames: [
      {
        frame: 45,
        label: "opening thesis",
        purpose: "Check first-read headline, 3D card hierarchy, and caption clearance.",
      },
      {
        frame: 620,
        label: "model gate evidence",
        purpose: "Check source-card fallback readability and cautious GPT-5.6 framing.",
      },
      {
        frame: 1540,
        label: "china access map",
        purpose: "Check limited-license and capital map density.",
      },
      {
        frame: 2600,
        label: "coding security",
        purpose: "Check audit checklist readability and 3D foreground card motion.",
      },
      {
        frame: 4000,
        label: "power grid",
        purpose: "Check electricity source-card fallback and overlay placement.",
      },
      {
        frame: 5520,
        label: "closing playbook",
        purpose: "Check final infrastructure takeaway and safe margins.",
      },
    ],
    sourceFiles: [
      {
        path: "src/remotion/AiDailyNewsBrief20260708/AiDailyNewsBrief20260708.tsx",
        kind: "renderer",
      },
      { path: "src/remotion/AiDailyNewsBrief20260708/types.ts", kind: "types" },
      { path: "src/remotion/AiDailyNewsBrief20260708/script.ts", kind: "script" },
      { path: "src/remotion/AiDailyNewsBrief20260708/data.ts", kind: "data" },
      {
        path: "src/remotion/AiDailyNewsBrief20260708/audio.generated.ts",
        kind: "audio-metadata",
      },
      { path: "src/remotion/Root.tsx", kind: "root-registration" },
      { path: "scripts/ai-daily-news-brief-2026-07-08-smoke.mjs", kind: "smoke" },
    ],
    promotionCandidates: [
      {
        id: "foreground-news-card-3d",
        targetLayer: "block",
        gateState: "stay-sample-local",
        status: "sample-local",
        reason:
          "The foreground 3D content-card language fits this long trend briefing; promote only after another news video reuses it cleanly.",
      },
      {
        id: "localized-news-source-card",
        targetLayer: "block",
        gateState: "stay-sample-local",
        status: "sample-local",
        reason:
          "The localized source-card fallback pattern is useful but should be generalized after a real screenshot capture pass and another topic.",
      },
    ],
    notes: [
      "Generated source cards, TTS audio, stills, and rendered mp4 stay local-only under public/generated/ai-daily-news-brief-2026-07-08/ and out/.",
      "GPT-5.6 is framed as reported broader rollout plus official preview context; the sample explicitly avoids overstating government approval.",
      "3D is used for foreground content cards and transition plates rather than as a background-only scene.",
      "This sample remains a dedicated Agent Producer composition and does not use the parked web prompt path.",
    ],
  },
  {
    compositionId: "OpenAiHardwareNewsBrief",
    sampleName: "OpenAiHardwareNewsBrief",
    slug: "openai-hardware-news-brief",
    contentFamily: "trend-briefing",
    canvasProfile: "landscape-16x9",
    localArtifactRoot: "public/generated/openai-hardware-news-brief/",
    ttsStatus: "generated-local",
    sampleStatus: "frozen-reference",
    reviewFrames: [
      {
        frame: 45,
        label: "opening hook",
        purpose: "Check headline readability and device focal point.",
      },
      {
        frame: 300,
        label: "codex report evidence",
        purpose: "Check Evidence Lens screenshot/source card readability.",
      },
      {
        frame: 720,
        label: "workflow analysis",
        purpose: "Check workflow block density and metric card spacing.",
      },
      {
        frame: 1180,
        label: "launch watch",
        purpose: "Check date-focused closing and caption clearance.",
      },
    ],
    sourceFiles: [
      {
        path: "src/remotion/OpenAiHardwareNewsBrief/OpenAiHardwareNewsBrief.tsx",
        kind: "renderer",
      },
      { path: "src/remotion/OpenAiHardwareNewsBrief/types.ts", kind: "types" },
      { path: "src/remotion/OpenAiHardwareNewsBrief/script.ts", kind: "script" },
      { path: "src/remotion/OpenAiHardwareNewsBrief/data.ts", kind: "data" },
      {
        path: "src/remotion/OpenAiHardwareNewsBrief/audio.generated.ts",
        kind: "audio-metadata",
      },
      { path: "src/remotion/Root.tsx", kind: "root-registration" },
      { path: "scripts/openai-hardware-news-brief-smoke.mjs", kind: "smoke" },
    ],
    promotionCandidates: [
      {
        id: "news-source-card",
        targetLayer: "block",
        gateState: "stay-sample-local",
        status: "sample-local",
        reason:
          "The source-card fallback is useful for this news sample but needs another run before block promotion.",
      },
      {
        id: "hardware-shortcut-console",
        targetLayer: "block",
        gateState: "stay-sample-local",
        status: "sample-local",
        reason:
          "The Codex shortcut controller visual is topic-specific until another hardware/workflow story proves reuse.",
      },
    ],
    notes: [
      "Generated source cards and narration audio stay local-only under public/generated/openai-hardware-news-brief/.",
      "The generated source cards are explicitly source-card fallbacks, not screenshots; the sample data records why real capture was not used.",
      "The government stake beat is framed only as reported early talks, not as a completed deal.",
      "This sample remains a dedicated Agent Producer composition and does not use the parked web prompt path.",
    ],
  },
  {
    compositionId: "UvOpenSourceBrief",
    sampleName: "UvOpenSourceBrief",
    slug: "uv-open-source-brief",
    contentFamily: "project-intro",
    canvasProfile: "landscape-16x9",
    localArtifactRoot: "public/generated/uv-open-source-brief/",
    ttsStatus: "generated-local",
    sampleStatus: "frozen-reference",
    reviewFrames: [
      {
        frame: 45,
        label: "opening context",
        purpose: "Check first-read headline and hero composition.",
      },
      {
        frame: 260,
        label: "repo evidence",
        purpose: "Check screenshot readability and overlay placement.",
      },
      {
        frame: 650,
        label: "workflow beat",
        purpose: "Check block composition and caption clearance.",
      },
      {
        frame: 1390,
        label: "closing synthesis",
        purpose: "Check final synthesis and safe margins.",
      },
    ],
    sourceFiles: [
      { path: "src/remotion/UvOpenSourceBrief/UvOpenSourceBrief.tsx", kind: "renderer" },
      { path: "src/remotion/UvOpenSourceBrief/types.ts", kind: "types" },
      { path: "src/remotion/UvOpenSourceBrief/script.ts", kind: "script" },
      { path: "src/remotion/UvOpenSourceBrief/data.ts", kind: "data" },
      { path: "src/remotion/UvOpenSourceBrief/audio.generated.ts", kind: "audio-metadata" },
      { path: "src/remotion/Root.tsx", kind: "root-registration" },
      { path: "scripts/uv-open-source-brief-smoke.mjs", kind: "smoke" },
    ],
    promotionCandidates: [
      {
        id: "evidence-screenshot-backdrop",
        targetLayer: "block",
        gateState: "promote-to-block",
        status: "promoted",
        reason: "Shared in Producer Sample OS as the Evidence Lens full-frame screenshot backdrop.",
      },
      {
        id: "evidence-overlay-panel",
        targetLayer: "block",
        gateState: "promote-to-block",
        status: "promoted",
        reason: "Shared in Producer Sample OS as the Evidence Lens translucent proof overlay.",
      },
      {
        id: "screenshot-focus",
        targetLayer: "block",
        gateState: "promote-to-block",
        status: "promoted",
        reason:
          "Shared through the Evidence Lens block as claim-aligned zoom-in, hold, and return metadata.",
      },
    ],
    notes: [
      "Generated screenshots and narration audio stay local-only under public/generated/uv-open-source-brief/.",
      "Screenshot evidence scenes use the shared Evidence Lens block while keeping uv facts sample-local.",
      "This sample remains a dedicated composition and does not use the parked web prompt path.",
    ],
  },
  {
    compositionId: "WorldCupBettingAnalysis",
    sampleName: "WorldCupBettingAnalysis",
    slug: "world-cup-betting-analysis",
    contentFamily: "data-analysis",
    canvasProfile: "portrait-9x16",
    localArtifactRoot: "public/generated/world-cup-betting-analysis/",
    ttsStatus: "generated-local",
    sampleStatus: "frozen-reference",
    reviewFrames: [
      {
        frame: 30,
        label: "title",
        purpose: "Check portrait title readability and visual hierarchy.",
      },
      {
        frame: 360,
        label: "formula",
        purpose: "Check EV formula explanation and subtitle separation.",
      },
      {
        frame: 900,
        label: "match analysis",
        purpose: "Check odds/probability chart density.",
      },
      {
        frame: 1840,
        label: "disclaimer",
        purpose: "Check risk disclaimer prominence.",
      },
    ],
    sourceFiles: [
      {
        path: "src/remotion/WorldCupBettingAnalysis/WorldCupBettingAnalysis.tsx",
        kind: "renderer",
      },
      { path: "src/remotion/WorldCupBettingAnalysis/types.ts", kind: "types" },
      { path: "src/remotion/WorldCupBettingAnalysis/script.ts", kind: "script" },
      { path: "src/remotion/WorldCupBettingAnalysis/data.ts", kind: "data" },
      { path: "src/remotion/WorldCupBettingAnalysis/audio.generated.ts", kind: "audio-metadata" },
      { path: "src/remotion/Root.tsx", kind: "root-registration" },
      { path: "scripts/world-cup-betting-analysis-smoke.mjs", kind: "smoke" },
    ],
    promotionCandidates: [
      {
        id: "odds-ev-ranking",
        targetLayer: "block",
        gateState: "promote-to-block",
        status: "promoted",
        reason:
          "The odds, no-vig probability, EV, and risk ranking story remains historical evidence for a shared data-analysis block.",
      },
      {
        id: "risk-disclaimer-frame",
        targetLayer: "block",
        gateState: "promote-to-block",
        status: "candidate",
        reason: "Explicit risk-note treatment is reusable for data-analysis shorts.",
      },
    ],
    notes: [
      "Generated F5 voiceover files stay local-only under public/generated/world-cup-betting-analysis/.",
      "The sample redraws odds data in code when no source screenshot is available.",
    ],
  },
  {
    compositionId: "PixelRAGChineseStandalonePreview",
    sampleName: "PixelRAGChineseStandalone",
    slug: "pixelrag-chinese-standalone",
    contentFamily: "project-intro",
    canvasProfile: "landscape-16x9",
    localArtifactRoot: "public/generated/pixelrag-chinese-standalone/",
    ttsStatus: "generated-local",
    sampleStatus: "frozen-reference",
    reviewFrames: [
      {
        frame: 30,
        label: "opening",
        purpose: "Check project intro headline and foreground 3D readability.",
      },
      {
        frame: 420,
        label: "screenshot process",
        purpose: "Check screenshot-backed visual proof and caption clearance.",
      },
      {
        frame: 820,
        label: "retrieval flow",
        purpose: "Check vector/index motion and focal point.",
      },
      {
        frame: 1280,
        label: "closing",
        purpose: "Check final takeaway and safe margins.",
      },
    ],
    sourceFiles: [
      {
        path: "src/remotion/PixelRAGChineseStandalone/PixelRAGChineseStandalone.tsx",
        kind: "renderer",
      },
      { path: "src/remotion/PixelRAGChineseStandalone/types.ts", kind: "types" },
      { path: "src/remotion/PixelRAGChineseStandalone/script.ts", kind: "script" },
      { path: "src/remotion/PixelRAGChineseStandalone/data.generated.ts", kind: "audio-metadata" },
      { path: "src/remotion/PixelRAGChineseStandalone/visuals.tsx", kind: "renderer" },
      { path: "src/remotion/Root.tsx", kind: "root-registration" },
      { path: "scripts/pixelrag-chinese-standalone-smoke.mjs", kind: "smoke" },
    ],
    promotionCandidates: [
      {
        id: "screenshot-evidence-flow",
        targetLayer: "block",
        gateState: "promote-to-block",
        status: "promoted",
        reason:
          "Screenshot/process language remains historical evidence for the shared Evidence Lens block.",
      },
      {
        id: "foreground-3d-evidence-cards",
        targetLayer: "block",
        gateState: "promote-to-block",
        status: "candidate",
        reason:
          "The foreground 3D card/page/index treatment may be reusable after another project-intro sample proves it.",
      },
    ],
    notes: [
      "This sample currently stores generated audio metadata inside data.generated.ts; Producer Sample OS v1 accepts that legacy shape.",
      "Generated screenshots and audio stay local-only under public/generated/pixelrag-chinese-standalone/.",
    ],
  },
  {
    compositionId: "GitTutorialForDevs",
    sampleName: "GitTutorialForDevs",
    slug: "git-tutorial-for-devs",
    contentFamily: "tutorial",
    canvasProfile: "landscape-16x9",
    localArtifactRoot: "public/generated/git-tutorial/",
    ttsStatus: "generated-local",
    sampleStatus: "frozen-reference",
    reviewFrames: [
      {
        frame: 30,
        label: "hero",
        purpose: "Check Git logo badge, headline hierarchy, tag cloud, and caption clearance.",
      },
      {
        frame: 800,
        label: "what",
        purpose: "Check 2x2 card grid density and command tag readability.",
      },
      {
        frame: 1700,
        label: "concepts",
        purpose: "Check 4-column concept cards, bilingual labels, and command blocks.",
      },
      {
        frame: 2800,
        label: "terminal",
        purpose: "Check terminal session density and file tree sidebar.",
      },
      {
        frame: 4000,
        label: "agent",
        purpose: "Check timeline and code diff block readability.",
      },
      {
        frame: 4800,
        label: "tips",
        purpose: "Check 4 wide tips cards with numbered badges.",
      },
      {
        frame: 5400,
        label: "close",
        purpose: "Check stat row, checklist, and closing CTA clearance.",
      },
    ],
    sourceFiles: [
      { path: "src/remotion/GitTutorialForDevs/GitTutorialForDevs.tsx", kind: "renderer" },
      { path: "src/remotion/GitTutorialForDevs/types.ts", kind: "types" },
      { path: "src/remotion/GitTutorialForDevs/script.ts", kind: "script" },
      { path: "src/remotion/GitTutorialForDevs/data.ts", kind: "data" },
      { path: "src/remotion/GitTutorialForDevs/audio.generated.ts", kind: "audio-metadata" },
      { path: "src/remotion/Root.tsx", kind: "root-registration" },
    ],
    promotionCandidates: [
      {
        id: "git-basics-card-grid",
        targetLayer: "block",
        gateState: "stay-sample-local",
        status: "sample-local",
        reason:
          "The 2x2 card grid with icon-label-description-command works for this Git tutorial but needs another tutorial topic before block promotion.",
      },
      {
        id: "scenic-background-composition",
        targetLayer: "primitive",
        gateState: "stay-sample-local",
        status: "sample-local",
        reason:
          "BokehCircles, GridPulse, and CameraDrift work together for this tutorial; extract individual primitives only after another video proves each independently.",
      },
    ],
    notes: [
      "Generated VoxCPM voice-design TTS, captions, stills, and mp4 stay local-only under public/generated/git-tutorial/ and out/.",
      "Each scene has its own .wav file with properly measured durationInFrames and durationInSeconds.",
      "This sample remains a dedicated Agent Producer composition and does not use the parked web prompt path.",
      "GitTagBar (10-tag command decoration) is sample-local and not yet promoted.",
    ],
  },
  agentProducerMediaSoundProofManifest,
  tcpHandshakeEditorialManifest,
  tcpHandshakeTerminalManifest,
  dnsResolutionExplainerManifest,
  aiDailyNews20260717Manifest,
] as const satisfies readonly ProducerSampleManifest[];

export const getProducerSampleManifestByCompositionId = (
  compositionId: string,
): ProducerSampleManifest | undefined =>
  producerSampleManifests.find((manifest) => manifest.compositionId === compositionId);

export const maintainedProducerSampleManifests = (
  producerSampleManifests as readonly ProducerSampleManifest[]
).filter(
  (manifest): manifest is MaintainedProducerSampleManifest =>
    manifest.sampleStatus === "maintained",
);
