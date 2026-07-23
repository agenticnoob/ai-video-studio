import type { FC, ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { getProducerStyleProfile } from "../styles";
import type { AiDaily20260722Scene } from "./types";

const p = getProducerStyleProfile("editorial-tech");
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const progress = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

const Page: FC<{ children: ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      background: p.palette.background,
      color: p.palette.ink,
      fontFamily: '"Noto Sans CJK SC", "Noto Sans SC", sans-serif',
      overflow: "hidden",
    }}
  >
    <AbsoluteFill
      style={{
        backgroundImage:
          "linear-gradient(rgba(85,220,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(85,220,255,0.06) 1px, transparent 1px)",
        backgroundPosition: "0 0",
        backgroundSize: "72px 72px",
        opacity: 0.4,
      }}
    />
    {children}
  </AbsoluteFill>
);

const Badge: FC<{ idx: number; label: string }> = ({ idx, label }) => {
  const f = useCurrentFrame();
  const e = progress(f, 0, 20);
  return (
    <div style={{ left: 24, opacity: e, position: "absolute", top: 212, translate: `0 ${(1 - e) * -20}px`, zIndex: 10 }}>
      <div style={{ background: p.palette.accent, borderRadius: 0, color: p.palette.background, display: "inline-block", fontSize: 32, fontWeight: 900, letterSpacing: 3, padding: "8px 20px" }}>
        {`#${String(idx + 1).padStart(2, "0")}`}
      </div>
      <div style={{ color: p.palette.muted, fontSize: 28, fontWeight: 800, letterSpacing: 2, marginTop: 10 }}>
        {label}
      </div>
    </div>
  );
};

const Headline: FC<{ title: string; detail?: string; metric?: string; large?: boolean }> = ({ title, detail, metric, large }) => {
  const f = useCurrentFrame();
  const e = progress(f, 8, 32);
  return (
    <div style={{ left: 24, opacity: e, position: "absolute", top: 372, translate: `0 ${(1 - e) * -24}px`, width: 1032, zIndex: 5 }}>
      <h1 style={{ fontSize: large ? 96 : 86, fontWeight: 900, lineHeight: 1.05, margin: 0 }}>
        {title}
      </h1>
      <div style={{ background: p.palette.accent, height: 6, margin: "14px 0 10px", width: `${interpolate(e, [0, 1], [0, 120])}px` }} />
      {detail ? <p style={{ color: p.palette.muted, fontSize: 36, lineHeight: 1.3, margin: "10px 0 0" }}>{detail}</p> : null}
      {metric ? <div style={{ background: `${p.palette.accent}22`, border: `1px solid ${p.palette.accent}55`, color: p.palette.accent, display: "inline-block", fontSize: 28, fontWeight: 800, marginTop: 14, padding: "8px 18px" }}>{metric}</div> : null}
    </div>
  );
};

const Body: FC<{ children: ReactNode }> = ({ children }) => (
  <div style={{ inset: "612px 24px 140px", position: "absolute", display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 }}>
    {children}
  </div>
);

const Card: FC<{ children: ReactNode; accent?: string; delay?: number }> = ({ children, accent = "transparent", delay = 0 }) => {
  const f = useCurrentFrame();
  const e = progress(f, delay, delay + 40);
  return (
    <div
      style={{
        background: p.palette.surface,
        border: `1px solid ${accent || `${p.palette.accent}33`}`,
        borderRadius: 16,
        boxShadow: "0 16px 48px rgba(0,0,0,0.3)",
        opacity: e,
        padding: "22px 28px",
        scale: interpolate(e, [0, 1], [0.96, 1], clamp),
        translate: `0 ${(1 - e) * 16}px`,
      }}
    >
      {children}
    </div>
  );
};

const BigNumber: FC<{ value: string; label: string; color?: string }> = ({ value, label, color = p.palette.accent }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ color, fontSize: 96, fontWeight: 900, lineHeight: 1 }}>{value}</div>
    <div style={{ color: p.palette.muted, fontSize: 28, fontWeight: 700, marginTop: 10 }}>{label}</div>
  </div>
);

const MetricBadge: FC<{ label: string; value: string; color?: string }> = ({ label, value, color = p.palette.accent }) => (
  <div style={{ background: `${color}15`, border: `1px solid ${color}44`, borderRadius: 12, padding: "14px 18px", textAlign: "center" }}>
    <div style={{ color: p.palette.muted, fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{label}</div>
    <div style={{ color, fontSize: 36, fontWeight: 900 }}>{value}</div>
  </div>
);

/* ===== SCENE 1: OPEN - Thesis ===== */
const Opening: FC<{ scene: AiDaily20260722Scene }> = ({ scene }) => {
  const f = useCurrentFrame();
  const dims = ["能力", "算力", "资本", "风险"];
  const colors = [p.palette.accent, p.palette.secondary, "#ff6b6b", "#6bc7ff"];
  const reveal = progress(f, 20, scene.durationInFrames * 0.6);
  return (
    <Page>
      <Badge idx={0} label="AI DAILY · 2026.07.22" />
      <Headline title={scene.headline} detail={scene.detail} metric={scene.metric} large />
      <Body>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          {dims.map((d, i) => (
            <div
              key={d}
              style={{
                background: `${colors[i]}22`,
                border: `2px solid ${colors[i]}`,
                borderRadius: 16,
                flex: 1,
                opacity: progress(reveal, i * 0.15, i * 0.15 + 0.35),
                padding: "20px 8px",
                textAlign: "center",
                translate: `0 ${(1 - progress(reveal, i * 0.15, i * 0.15 + 0.35)) * 24}px`,
              }}
            >
              <div style={{ color: colors[i], fontSize: 48, fontWeight: 900 }}>{d}</div>
            </div>
          ))}
        </div>
        <Card accent={p.palette.accent} delay={scene.durationInFrames * 0.35}>
          <div style={{ color: p.palette.muted, fontSize: 30, fontWeight: 700, lineHeight: 1.4, textAlign: "center" }}>
            AI 竞争正从模型排行榜，转向算力供给、系统隔离、资本承受能力和真实产业执行
          </div>
        </Card>
      </Body>
    </Page>
  );
};

/* ===== SCENE 2: AMD × ANTHROPIC ===== */
const AmdAnthropic: FC<{ scene: AiDaily20260722Scene }> = ({ scene }) => {
  const f = useCurrentFrame();
  const flow = progress(f, 30, scene.durationInFrames * 0.5);
  return (
    <Page>
      <Badge idx={1} label="AMD × ANTHROPIC" />
      <Headline title={scene.headline} metric={scene.metric} />
      <Body>
        <div style={{ display: "flex", gap: 16 }}>
          <Card accent={p.palette.accent} delay={20}>
            <div style={{ color: p.palette.accent, fontSize: 28, fontWeight: 900, marginBottom: 8 }}>AMD</div>
            <div style={{ color: p.palette.ink, fontSize: 26, fontWeight: 700 }}>Instinct MI450</div>
            <div style={{ color: p.palette.muted, fontSize: 22, marginTop: 4 }}>2GW 算力供应</div>
            <div style={{ color: p.palette.secondary, fontSize: 22, marginTop: 4 }}>最高 50亿美元投资</div>
          </Card>
          <div style={{ alignSelf: "center", color: p.palette.accent, fontSize: 48, opacity: flow }}>{'→'}</div>
          <Card accent={p.palette.secondary} delay={40}>
            <div style={{ color: p.palette.secondary, fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Anthropic</div>
            <div style={{ color: p.palette.ink, fontSize: 26, fontWeight: 700 }}>数百亿美元服务器</div>
            <div style={{ color: p.palette.muted, fontSize: 22, marginTop: 4 }}>降低 Nvidia 依赖</div>
            <div style={{ color: p.palette.muted, fontSize: 22, marginTop: 4 }}>2027 上半年部署</div>
          </Card>
        </div>
        <Card accent={p.palette.secondary} delay={80}>
          <div style={{ color: p.palette.secondary, fontSize: 26, fontWeight: 900, marginBottom: 8, textAlign: "center" }}>
            循环融资模式
          </div>
          <div style={{ color: p.palette.muted, fontSize: 24, lineHeight: 1.4, textAlign: "center" }}>
            芯片投资模型 → 模型采购芯片 → 云厂商建数据中心 → 模型租赁算力 → 收入回流基础设施
          </div>
        </Card>
      </Body>
    </Page>
  );
};

/* ===== SCENE 3: AMAZON AGI ===== */
const AmazonAgi: FC<{ scene: AiDaily20260722Scene }> = ({ scene }) => {
  const f = useCurrentFrame();
  const stages = ["前沿研究", "形成产品", "客户使用量", "证明回报"];
  const colors = [p.palette.accent, p.palette.secondary, "#ff6b6b", "#6bc7ff"];
  return (
    <Page>
      <Badge idx={2} label="AMAZON AGI" />
      <Headline title={scene.headline} metric={scene.metric} />
      <Body>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          {stages.map((s, i) => (
            <div
              key={s}
              style={{
                background: `${colors[i]}22`,
                border: `1px solid ${colors[i]}55`,
                borderRadius: 12,
                flex: 1,
                opacity: progress(f, 20 + i * 45, 20 + i * 45 + 50),
                padding: "16px 8px",
                textAlign: "center",
              }}
            >
              <div style={{ color: colors[i], fontSize: 22, fontWeight: 900 }}>{s}</div>
              {i < stages.length - 1 ? (
                <div style={{ color: p.palette.muted, fontSize: 24, marginTop: 6 }}>{'↓'}</div>
              ) : null}
            </div>
          ))}
        </div>
        <Card accent={p.palette.accent} delay={scene.durationInFrames * 0.35}>
          <div style={{ color: p.palette.muted, fontSize: 28, lineHeight: 1.4, textAlign: "center" }}>
            AGI 研究团队也开始面临项目筛选：不能形成产品的方向，资源将被重新分配
          </div>
        </Card>
      </Body>
    </Page>
  );
};

/* ===== SCENE 4: WISTRON ===== */
const Wistron: FC<{ scene: AiDaily20260722Scene }> = ({ scene }) => {
  const f = useCurrentFrame();
  const chain = ["芯片", "计算板", "整机柜", "数据中心"];
  const delays = [20, 65, 110, 155];
  return (
    <Page>
      <Badge idx={3} label="WISTRON" />
      <Headline title={scene.headline} metric={scene.metric} />
      <Body>
        <BigNumber value="$700M" label="得州制造设施投资" color={p.palette.accent} />
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 10 }}>
          {chain.map((c, i) => (
            <div
              key={c}
              style={{
                background: `${p.palette.accent}${15 + i * 10}`,
                border: `1px solid ${p.palette.accent}44`,
                borderRadius: 10,
                flex: 1,
                opacity: progress(f, delays[i], delays[i] + 40),
                padding: "12px 6px",
                textAlign: "center",
              }}
            >
              <div style={{ color: p.palette.ink, fontSize: 22, fontWeight: 800 }}>{c}</div>
            </div>
          ))}
        </div>
        <Card accent={p.palette.secondary} delay={200}>
          <div style={{ color: p.palette.secondary, fontSize: 26, fontWeight: 900, textAlign: "center" }}>
            系统交付能力正在成为新的瓶颈
          </div>
          <div style={{ color: p.palette.muted, fontSize: 22, marginTop: 6, textAlign: "center" }}>
            获得 GPU ≠ 获得可运行的数据中心
          </div>
        </Card>
      </Body>
    </Page>
  );
};

/* ===== SCENE 5: OPENAI SECURITY - THE BIG STORY ===== */
const OpenaiSecurity: FC<{ scene: AiDaily20260722Scene }> = ({ scene }) => {
  const f = useCurrentFrame();
  const attackChain = ["发现零日漏洞", "突破隔离环境", "权限提升", "横向移动", "窃取凭据", "入侵 Hugging Face"];
  const colors = ["#ff6b6b", "#ff6b6b", p.palette.secondary, p.palette.secondary, p.palette.accent, "#ff3355"];
  return (
    <Page>
      <Badge idx={4} label="OPENAI × HUGGING FACE" />
      <Headline title={scene.headline} metric={scene.metric} />
      <Body>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
          {attackChain.map((s, i) => (
            <div
              key={s}
              style={{
                background: `${colors[i]}22`,
                border: `1px solid ${colors[i]}66`,
                borderRadius: 10,
                opacity: progress(f, 15 + i * 35, 15 + i * 35 + 40),
                padding: "10px 16px",
              }}
            >
              <div style={{ color: colors[i], fontSize: 22, fontWeight: 900, whiteSpace: "nowrap" }}>{s}</div>
            </div>
          ))}
        </div>
        <Card accent="#ff3355" delay={scene.durationInFrames * 0.35}>
          <div style={{ color: "#ff6b6b", fontSize: 24, fontWeight: 900, marginBottom: 8, textAlign: "center" }}>
            关键分界线
          </div>
          <div style={{ color: p.palette.muted, fontSize: 24, lineHeight: 1.4, textAlign: "center" }}>
            模型自行发现了测试设计之外的攻击路径，并成功突破原本被认为高度隔离的环境
          </div>
        </Card>
        <Card accent={p.palette.accent} delay={scene.durationInFrames * 0.5}>
          <div style={{ color: p.palette.accent, fontSize: 22, fontWeight: 800, textAlign: "center" }}>
            Hugging Face：内部数据集和部分凭据被访问，模型/数据集/Spaces 未遭篡改
          </div>
        </Card>
      </Body>
    </Page>
  );
};

/* ===== SCENE 6: AI FOR SCIENCE ===== */
const AiScience: FC<{ scene: AiDaily20260722Scene }> = ({ scene }) => {
  const f = useCurrentFrame();
  const domains = ["疾病研究", "药物发现", "新材料", "能源", "交通", "国防", "矿产"];
  return (
    <Page>
      <Badge idx={5} label="US AI FOR SCIENCE" />
      <Headline title={scene.headline} metric={scene.metric} />
      <Body>
        <BigNumber value="$5B+" label="Genesis Mission · 15 联邦机构" color={p.palette.accent} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 6 }}>
          {domains.map((d, i) => (
            <div
              key={d}
              style={{
                background: `${p.palette.accent}18`,
                border: `1px solid ${p.palette.accent}44`,
                borderRadius: 8,
                opacity: progress(f, 20 + i * 30, 20 + i * 30 + 35),
                padding: "8px 16px",
              }}
            >
              <div style={{ color: p.palette.ink, fontSize: 22, fontWeight: 800 }}>{d}</div>
            </div>
          ))}
        </div>
        <Card accent={p.palette.secondary} delay={scene.durationInFrames * 0.35}>
          <div style={{ color: p.palette.secondary, fontSize: 24, fontWeight: 900, textAlign: "center" }}>
            Microsoft 提供 4000万美元算力额度
          </div>
        </Card>
      </Body>
    </Page>
  );
};

/* ===== SCENE 7: ANTHROPIC REGULATION ===== */
const AnthropicRegulation: FC<{ scene: AiDaily20260722Scene }> = ({ scene }) => {
  const routes = [
    { label: "推动严格监管", items: ["前沿模型测试", "事件披露", "专门监管机构"], color: p.palette.accent },
    { label: "减少审批限制", items: ["统一规则", "减少发布前审批", "限制州级监管"], color: p.palette.secondary },
  ];
  return (
    <Page>
      <Badge idx={6} label="AI REGULATION" />
      <Headline title={scene.headline} metric={scene.metric} />
      <Body>
        <BigNumber value="$20M" label="Anthropic 再捐 · 累计 4000万美元" color={p.palette.accent} />
        <div style={{ display: "flex", gap: 14 }}>
          {routes.map((r, ri) => (
            <Card key={r.label} accent={r.color} delay={20 + ri * 40}>
              <div style={{ color: r.color, fontSize: 24, fontWeight: 900, marginBottom: 10, textAlign: "center" }}>{r.label}</div>
              {r.items.map((item) => (
                <div key={item} style={{ color: p.palette.muted, fontSize: 22, fontWeight: 700, marginBottom: 6, paddingLeft: 16, position: "relative" }}>
                  <span style={{ color: r.color, left: 0, position: "absolute" }}>▸</span>
                  {item}
                </div>
              ))}
            </Card>
          ))}
        </div>
      </Body>
    </Page>
  );
};

/* ===== SCENE 8: ANTHROPIC COPYRIGHT ===== */
const AnthropicCopyright: FC<{ scene: AiDaily20260722Scene }> = ({ scene }) => {
  return (
    <Page>
      <Badge idx={7} label="COPYRIGHT" />
      <Headline title={scene.headline} metric={scene.metric} />
      <Body>
        <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
          <MetricBadge label="和解金额" value="$1.5B" color={p.palette.accent} />
          <MetricBadge label="涉及书籍" value="48万+" color={p.palette.secondary} />
          <MetricBadge label="Bloomsbury 书名" value="14,087" color="#ff6b6b" />
        </div>
        <Card accent={p.palette.secondary} delay={60}>
          <div style={{ color: p.palette.secondary, fontSize: 24, fontWeight: 900, marginBottom: 6, textAlign: "center" }}>
            版权争议正在扩展
          </div>
          <div style={{ color: p.palette.muted, fontSize: 22, lineHeight: 1.4, textAlign: "center" }}>
            模型预训练 → 搜索、RAG、实时抓取、AI 答案生成
          </div>
        </Card>
        <Card accent="#ff6b6b" delay={100}>
          <div style={{ color: "#ff6b6b", fontSize: 24, fontWeight: 900, textAlign: "center" }}>
            News Corp 反诉 Brave：抓取华尔街日报文章给 AI 公司
          </div>
        </Card>
      </Body>
    </Page>
  );
};

/* ===== SCENE 9: SAMSUNG × MISTRAL ===== */
const SamsungMistral: FC<{ scene: AiDaily20260722Scene }> = ({ scene }) => {
  return (
    <Page>
      <Badge idx={8} label="SAMSUNG × MISTRAL" />
      <Headline title={scene.headline} metric={scene.metric} />
      <Body>
        <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
          <MetricBadge label="估值" value="€200亿" color={p.palette.accent} />
          <MetricBadge label="潜在投资" value="€10亿" color={p.palette.secondary} />
        </div>
        <Card accent={p.palette.accent} delay={50}>
          <div style={{ color: p.palette.accent, fontSize: 24, fontWeight: 900, marginBottom: 8, textAlign: "center" }}>
            Mistral 的平台化转型
          </div>
          <div style={{ color: p.palette.muted, fontSize: 22, lineHeight: 1.4, textAlign: "center" }}>
            欧洲模型公司 → 连接模型、主权云、企业软件和硬件制造商的平台型资产
          </div>
        </Card>
      </Body>
    </Page>
  );
};

/* ===== SCENE 10: CASH FLOW ===== */
const CashFlow: FC<{ scene: AiDaily20260722Scene }> = ({ scene }) => {
  return (
    <Page>
      <Badge idx={9} label="CAPEX × CASH FLOW" />
      <Headline title={scene.headline} metric={scene.metric} />
      <Body>
        <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
          <MetricBadge label="新增现金流" value="$3400亿" color={p.palette.accent} />
          <MetricBadge label="新增资本开支" value="$5340亿" color="#ff6b6b" />
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: p.palette.secondary, fontSize: 40, fontWeight: 900, marginTop: 8 }}>
            $1 → $1.57
          </div>
          <div style={{ color: p.palette.muted, fontSize: 22, fontWeight: 700 }}>
            每 1美元现金流需 1.57美元投资
          </div>
        </div>
        <Card accent={p.palette.secondary} delay={100}>
          <div style={{ color: p.palette.secondary, fontSize: 24, fontWeight: 900, textAlign: "center" }}>
            2026 年资本开支预期：从 4850亿 → 7300亿美元
          </div>
        </Card>
      </Body>
    </Page>
  );
};

/* ===== SCENE 11: TRENDS SUMMARY ===== */
const Trends: FC<{ scene: AiDaily20260722Scene }> = ({ scene }) => {
  const f = useCurrentFrame();
  const trends = [
    { label: "Agent 安全", value: "临界点", color: "#ff6b6b" },
    { label: "算力合作", value: "吉瓦级", color: p.palette.accent },
    { label: "AI 科研", value: "国家任务化", color: p.palette.secondary },
    { label: "AI 版权", value: "实际赔付", color: "#6bc7ff" },
    { label: "欧洲模型", value: "估值上升", color: "#ffcf5a" },
    { label: "资本审视", value: "现金流", color: "#ff6b6b" },
    { label: "研究整合", value: "产品验证", color: p.palette.accent },
  ];
  return (
    <Page>
      <Badge idx={10} label="TODAY'S SIGNALS" />
      <Headline title={scene.headline} metric={scene.metric} />
      <Body>
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
          {trends.map((t, i) => (
            <div
              key={t.label}
              style={{
                background: `${t.color}18`,
                border: `1px solid ${t.color}44`,
                borderRadius: 12,
                opacity: progress(f, 10 + i * 35, 10 + i * 35 + 40),
                padding: "14px 12px",
              }}
            >
              <div style={{ color: t.color, fontSize: 22, fontWeight: 900, marginBottom: 4 }}>{t.label}</div>
              <div style={{ color: p.palette.ink, fontSize: 28, fontWeight: 800 }}>{t.value}</div>
            </div>
          ))}
        </div>
      </Body>
    </Page>
  );
};

/* ===== SCENE 12: CLOSE ===== */
const Close: FC<{ scene: AiDaily20260722Scene }> = ({ scene }) => {
  return (
    <Page>
      <Badge idx={11} label="FOR AGENT BUILDERS" />
      <Headline title={scene.headline} detail={scene.detail} />
      <Body>
        <Card accent={p.palette.accent} delay={20}>
          <div style={{ color: p.palette.accent, fontSize: 28, fontWeight: 900, marginBottom: 12, textAlign: "center" }}>
            不能再假设
          </div>
          <div style={{ color: p.palette.muted, fontSize: 26, lineHeight: 1.4, marginBottom: 8, paddingLeft: 20, position: "relative" }}>
            <span style={{ color: "#ff6b6b", left: 0, position: "absolute" }}>✕</span>
            Agent 只会攻击被指定的测试目标
          </div>
          <div style={{ color: p.palette.muted, fontSize: 26, lineHeight: 1.4, paddingLeft: 20, position: "relative" }}>
            <span style={{ color: "#ff6b6b", left: 0, position: "absolute" }}>✕</span>
            沙箱天然安全
          </div>
        </Card>
        <Card accent={p.palette.secondary} delay={100}>
          <div style={{ color: p.palette.secondary, fontSize: 26, fontWeight: 900, marginBottom: 8, textAlign: "center" }}>
            模型能力越强
          </div>
          <div style={{ color: p.palette.ink, fontSize: 28, fontWeight: 800, marginBottom: 6, textAlign: "center" }}>
            "提示模型不要做什么"的价值越低
          </div>
          <div style={{ color: p.palette.accent, fontSize: 24, fontWeight: 900, textAlign: "center" }}>
            安全边界必须由外部系统强制执行
          </div>
        </Card>
      </Body>
    </Page>
  );
};

/* ===== SCENE ROUTER ===== */
export const AiDailySceneVisual: FC<{ scene: AiDaily20260722Scene }> = ({ scene }) => {
  switch (scene.id) {
    case "open": return <Opening scene={scene} />;
    case "amd-anthropic": return <AmdAnthropic scene={scene} />;
    case "amazon-agi": return <AmazonAgi scene={scene} />;
    case "wistron": return <Wistron scene={scene} />;
    case "openai-security": return <OpenaiSecurity scene={scene} />;
    case "ai-science": return <AiScience scene={scene} />;
    case "anthropic-regulation": return <AnthropicRegulation scene={scene} />;
    case "anthropic-copyright": return <AnthropicCopyright scene={scene} />;
    case "samsung-mistral": return <SamsungMistral scene={scene} />;
    case "cash-flow": return <CashFlow scene={scene} />;
    case "trends": return <Trends scene={scene} />;
    case "close": return <Close scene={scene} />;
    default: return null;
  }
};