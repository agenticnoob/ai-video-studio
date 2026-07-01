import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;
export const VIDEO_FPS = 30;
export const VIDEO_DURATION_IN_FRAMES = 60 * VIDEO_FPS;

type NewsItem = {
  id: string;
  label: string;
  title: string;
  source: string;
  date: string;
  summary: string;
  whyItMatters: string;
  color: string;
};

const NEWS_ITEMS: NewsItem[] = [
  {
    id: "openai-gpt-56",
    label: "01 / MODEL",
    title: "OpenAI \u9884\u89c8 GPT-5.6 Sol",
    source: "OpenAI",
    date: "2026-06-26",
    summary:
      "OpenAI \u5f00\u59cb\u6709\u9650\u9884\u89c8 GPT-5.6 \u7cfb\u5217\uff1aSol\u3001Terra\u3001Luna\uff0c\u91cd\u70b9\u5f3a\u5316 coding\u3001science \u4e0e cybersecurity \u80fd\u529b\u3002",
    whyItMatters:
      "\u6a21\u578b\u7ade\u4e89\u4ece\u201c\u804a\u5929\u80fd\u529b\u201d\u7ee7\u7eed\u8f6c\u5411\u957f\u4efb\u52a1\u3001\u4ee3\u7406\u6267\u884c\u3001\u7f51\u7edc\u5b89\u5168\u4e0e\u79d1\u7814\u5de5\u4f5c\u6d41\u3002",
    color: "#8BE9FD",
  },
  {
    id: "codex-agentic-work",
    label: "02 / AGENT",
    title: "Codex \u6570\u636e\u663e\u793a\uff1aAgentic AI \u6b63\u5728\u8fdb\u5165\u5de5\u4f5c\u6d41",
    source: "OpenAI",
    date: "2026-06-26",
    summary:
      "OpenAI \u62a5\u544a\u79f0\uff0cCodex \u5728\u5185\u90e8\u591a\u4e2a\u5c97\u4f4d\u7684\u4f7f\u7528\u5f3a\u5ea6\u663e\u8457\u4e0a\u5347\uff0c\u7814\u7a76\u3001\u5ba2\u670d\u3001\u5de5\u7a0b\u548c\u6cd5\u52a1\u5747\u51fa\u73b0\u9ad8\u500d\u589e\u957f\u3002",
    whyItMatters:
      "AI agent \u4e0d\u53ea\u662f\u5199\u4ee3\u7801\uff0c\u800c\u662f\u5728\u66ff\u4ee3\u4f20\u7edf\u5de5\u5177\u94fe\uff0c\u6210\u4e3a\u591a\u5c97\u4f4d\u7684\u4efb\u52a1\u6267\u884c\u5c42\u3002",
    color: "#A7F3D0",
  },
  {
    id: "anthropic-science",
    label: "03 / SCIENCE",
    title: "Anthropic \u628a Claude \u63a8\u5411\u79d1\u5b66\u5de5\u4f5c\u6d41",
    source: "Anthropic",
    date: "2026-06-30",
    summary:
      "Anthropic \u4e3e\u529e AI for Science \u6d3b\u52a8\uff0c\u5c55\u793a Claude \u5728\u836f\u4f01\u3001\u751f\u7269\u6280\u672f\u3001\u7814\u7a76\u673a\u6784\u4e2d\u7684\u5e94\u7528\u3002",
    whyItMatters:
      "AI \u6b63\u5728\u4ece\u529e\u516c\u52a9\u624b\u8fdb\u5165\u79d1\u7814\u7cfb\u7edf\uff1a\u6587\u732e\u3001\u5b9e\u9a8c\u3001\u6570\u636e\u3001\u8ba1\u7b97\u73af\u5883\u5f00\u59cb\u88ab\u91cd\u65b0\u7ec4\u7ec7\u3002",
    color: "#FDE68A",
  },
  {
    id: "codex-hardware",
    label: "04 / HARDWARE",
    title: "OpenAI \u9884\u544a Codex \u4e13\u7528\u786c\u4ef6",
    source: "The Verge",
    date: "2026-06-29",
    summary:
      "OpenAI \u4e0e Work Louder \u5408\u4f5c\u9884\u544a\u4e00\u6b3e Codex \u76f8\u5173\u786c\u4ef6\u8bbe\u5907\uff0c\u9884\u8ba1 7 \u6708 15 \u65e5\u53d1\u5e03\u3002",
    whyItMatters:
      "AI coding \u53ef\u80fd\u4e0d\u518d\u53ea\u5b58\u5728\u4e8e IDE \u91cc\uff0c\u5feb\u6377\u952e\u3001\u5b8f\u9762\u677f\u548c\u5b9e\u4f53\u63a7\u5236\u5668\u4f1a\u6210\u4e3a agent \u64cd\u4f5c\u5165\u53e3\u3002",
    color: "#C4B5FD",
  },
  {
    id: "apple-security",
    label: "05 / SECURITY",
    title: "Apple \u56e0 AI \u7f51\u7edc\u5b89\u5168\u538b\u529b\u63d0\u524d\u63a8\u9001\u8865\u4e01",
    source: "Reuters",
    date: "2026-06-29",
    summary:
      "Apple \u8868\u793a\u5c06\u66f4\u65e9\u53d1\u5e03\u90e8\u5206\u5b89\u5168\u66f4\u65b0\uff0c\u4ee5\u5e94\u5bf9 AI \u52a0\u901f\u6076\u610f\u653b\u51fb\u5de5\u5177\u5f00\u53d1\u5e26\u6765\u7684\u538b\u529b\u3002",
    whyItMatters:
      "AI \u8ba9\u6f0f\u6d1e\u5229\u7528\u7a97\u53e3\u53d8\u77ed\uff0c\u8f6f\u4ef6\u516c\u53f8\u9700\u8981\u4ece\u201c\u5b9a\u671f\u53d1\u7248\u201d\u8f6c\u5411\u201c\u5feb\u901f\u4fee\u8865\u201d\u3002",
    color: "#FDA4AF",
  },
  {
    id: "california-claude",
    label: "06 / GOV",
    title: "California \u4e0e Anthropic \u8fbe\u6210 Claude \u653f\u5e9c\u91c7\u8d2d\u5408\u4f5c",
    source: "Business Insider / POLITICO",
    date: "2026-06-29",
    summary:
      "California \u5c06\u4ee5\u6298\u6263\u4ef7\u5411\u5dde\u673a\u6784\u548c\u5730\u65b9\u653f\u5e9c\u63d0\u4f9b Claude\uff0c\u5e76\u5305\u542b\u57f9\u8bad\u4e0e\u6280\u672f\u652f\u6301\u3002",
    whyItMatters:
      "AI \u6a21\u578b\u8fdb\u5165\u516c\u5171\u90e8\u95e8\u91c7\u8d2d\uff0c\u4e0b\u4e00\u8f6e\u7ade\u4e89\u4f1a\u53d1\u751f\u5728\u653f\u5e9c\u670d\u52a1\u3001\u5408\u89c4\u548c\u5b89\u5168\u6cbb\u7406\u4e0a\u3002",
    color: "#93C5FD",
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function base64FromBytes(bytes: Uint8Array) {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let output = "";

  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const c = i + 2 < bytes.length ? bytes[i + 2] : 0;

    const triple = (a << 16) | (b << 8) | c;

    output += alphabet[(triple >> 18) & 63];
    output += alphabet[(triple >> 12) & 63];
    output += i + 1 < bytes.length ? alphabet[(triple >> 6) & 63] : "=";
    output += i + 2 < bytes.length ? alphabet[triple & 63] : "=";
  }

  return output;
}

function createSynthBgmDataUri() {
  const sampleRate = 16000;
  const durationSeconds = 8;
  const totalSamples = sampleRate * durationSeconds;
  const bytesPerSample = 2;
  const dataSize = totalSamples * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i++) {
      view.setUint8(offset + i, value.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  const melody = [196, 247, 294, 370, 330, 294, 247, 220];
  const bass = [98, 123.5, 147, 185];

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const beat = Math.floor(t * 2);
    const beatProgress = (t * 2) % 1;
    const melodyFreq = melody[beat % melody.length];
    const bassFreq = bass[Math.floor(beat / 2) % bass.length];

    const envelope =
      Math.exp(-beatProgress * 3.5) * clamp(beatProgress * 10, 0, 1);

    const melodyTone =
      Math.sin(2 * Math.PI * melodyFreq * t) * 0.22 * envelope +
      Math.sin(2 * Math.PI * melodyFreq * 2.01 * t) * 0.05 * envelope;

    const bassTone = Math.sin(2 * Math.PI * bassFreq * t) * 0.12;

    const pad =
      Math.sin(2 * Math.PI * 55 * t) * 0.035 +
      Math.sin(2 * Math.PI * 82.4 * t) * 0.03;

    const sidechain = 0.78 + 0.22 * Math.sin(2 * Math.PI * 2 * t);
    const sample = clamp((melodyTone + bassTone + pad) * sidechain, -1, 1);

    view.setInt16(44 + i * 2, sample * 32767, true);
  }

  return `data:audio/wav;base64,${base64FromBytes(new Uint8Array(buffer))}`;
}

const bgmSrc = createSynthBgmDataUri();

const useEnter = (delay = 0, duration = 20) => {
  const frame = useCurrentFrame();
  return interpolate(frame - delay, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
};

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const drift = interpolate(frame, [0, durationInFrames], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 20% 10%, rgba(139, 233, 253, 0.18), transparent 28%), radial-gradient(circle at 80% 22%, rgba(196, 181, 253, 0.16), transparent 26%), linear-gradient(180deg, #07111f 0%, #101827 48%, #05070d 100%)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -160,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          transform: `translateY(${drift * -140}px) rotate(-2deg)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -180,
          top: 240,
          width: 520,
          height: 520,
          borderRadius: "999px",
          border: "1px solid rgba(255,255,255,0.08)",
          transform: `scale(${1 + drift * 0.08})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -240,
          bottom: 180,
          width: 680,
          height: 680,
          borderRadius: "999px",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.09), transparent 60%)",
          filter: "blur(12px)",
        }}
      />
    </AbsoluteFill>
  );
};

const TopBar: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        top: 54,
        left: 58,
        right: 58,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "rgba(255,255,255,0.72)",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: 24,
        letterSpacing: 1.2,
      }}
    >
      <span>AI NEWS DAILY</span>
      <span>2026.06.30</span>
    </div>
  );
};

const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = useEnter(0, 28);
  const scale = spring({
    frame,
    fps: VIDEO_FPS,
    config: {
      damping: 18,
      stiffness: 90,
      mass: 0.9,
    },
  });

  const titleY = interpolate(enter, [0, 1], [80, 0]);
  const opacity = interpolate(enter, [0, 1], [0, 1]);

  const exit = interpolate(frame, [150, 210], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity: 1 - exit,
        transform: `translateY(${-exit * 80}px)`,
      }}
    >
      <TopBar />

      <div
        style={{
          position: "absolute",
          left: 58,
          right: 58,
          top: 300,
          color: "white",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div
          style={{
            display: "inline-flex",
            border: "1px solid rgba(255,255,255,0.18)",
            padding: "12px 18px",
            borderRadius: 999,
            fontSize: 24,
            color: "rgba(255,255,255,0.78)",
            letterSpacing: 1.4,
            marginBottom: 38,
            opacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          {"\u6700\u65b0 AI \u52a8\u5411 / 60 \u79d2\u901f\u89c8"}
        </div>

        <div
          style={{
            fontSize: 104,
            lineHeight: 1.02,
            fontWeight: 850,
            letterSpacing: -5,
            opacity,
            transform: `translateY(${titleY}px) scale(${0.96 + scale * 0.04})`,
          }}
        >
          {"\u4eca\u5929 AI \u5708"}
          <br />
          {"\u53d1\u751f\u4e86\u4ec0\u4e48\uff1f"}
        </div>

        <div
          style={{
            marginTop: 44,
            width: 760,
            color: "rgba(255,255,255,0.72)",
            fontSize: 34,
            lineHeight: 1.42,
            opacity: interpolate(frame, [28, 55], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            transform: `translateY(${interpolate(frame, [28, 55], [24, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}px)`,
          }}
        >
          {"\u5927\u6a21\u578b\u3001AI Agent\u3001\u79d1\u7814\u3001\u786c\u4ef6\u3001\u7f51\u7edc\u5b89\u5168\u3001\u653f\u5e9c\u91c7\u8d2d\uff0c\u4eca\u5929\u7684\u5173\u952e\u8bcd\u662f\uff1a"}
          <span style={{ color: "#8BE9FD" }}> AI \u8fdb\u5165\u771f\u5b9e\u7cfb\u7edf\u3002</span>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 58,
          bottom: 120,
          width: 760,
          height: 16,
          borderRadius: 999,
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${interpolate(frame, [0, 210], [0, 100], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}%`,
            height: "100%",
            background:
              "linear-gradient(90deg, #8BE9FD, #A7F3D0, #FDE68A, #C4B5FD)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const NewsCard: React.FC<{
  item: NewsItem;
  index: number;
}> = ({ item, index }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - index * 210;

  const progress = interpolate(localFrame, [0, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const exit = interpolate(localFrame, [162, 204], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  const y = interpolate(progress, [0, 1], [90, 0]) + exit * -90;
  const opacity = progress * (1 - exit);
  const scale = interpolate(progress, [0, 1], [0.94, 1]);

  const lineProgress = interpolate(localFrame, [24, 156], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `translateY(${y}px) scale(${scale})`,
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 58,
          right: 58,
          top: 210,
          bottom: 180,
          borderRadius: 48,
          padding: 54,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.13), rgba(255,255,255,0.07))",
          border: "1px solid rgba(255,255,255,0.16)",
          boxShadow: "0 36px 120px rgba(0,0,0,0.42)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -160,
            top: -160,
            width: 520,
            height: 520,
            borderRadius: "999px",
            background: item.color,
            opacity: 0.18,
            filter: "blur(8px)",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 54,
            right: 54,
            bottom: 46,
            height: 10,
            borderRadius: 999,
            background: "rgba(255,255,255,0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${lineProgress}%`,
              height: "100%",
              background: item.color,
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "rgba(255,255,255,0.66)",
            fontSize: 24,
            letterSpacing: 1.2,
          }}
        >
          <span>{item.label}</span>
          <span>{item.date}</span>
        </div>

        <div
          style={{
            marginTop: 42,
            display: "inline-flex",
            padding: "10px 16px",
            borderRadius: 999,
            color: "#07111f",
            background: item.color,
            fontSize: 24,
            fontWeight: 800,
          }}
        >
          {item.source}
        </div>

        <h1
          style={{
            marginTop: 38,
            marginBottom: 0,
            color: "white",
            fontSize: 68,
            lineHeight: 1.08,
            letterSpacing: -2.6,
            fontWeight: 900,
          }}
        >
          {item.title}
        </h1>

        <p
          style={{
            marginTop: 42,
            marginBottom: 0,
            color: "rgba(255,255,255,0.78)",
            fontSize: 34,
            lineHeight: 1.42,
            fontWeight: 500,
          }}
        >
          {item.summary}
        </p>

        <div
          style={{
            marginTop: 54,
            padding: "28px 30px",
            borderRadius: 32,
            background: "rgba(0,0,0,0.22)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div
            style={{
              color: item.color,
              fontSize: 24,
              fontWeight: 900,
              letterSpacing: 1.2,
              marginBottom: 12,
            }}
          >
            WHY IT MATTERS
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.84)",
              fontSize: 31,
              lineHeight: 1.45,
              fontWeight: 600,
            }}
          >
            {item.whyItMatters}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            right: 54,
            bottom: 82,
            color: "rgba(255,255,255,0.16)",
            fontSize: 150,
            fontWeight: 950,
            letterSpacing: -8,
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const NewsCarousel: React.FC = () => {
  return (
    <AbsoluteFill>
      <TopBar />
      {NEWS_ITEMS.map((item, index) => (
        <Sequence
          key={item.id}
          from={index * 210}
          durationInFrames={210}
          name={item.title}
        >
          <NewsCard item={item} index={0} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const ClosingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = useEnter(0, 28);

  const opacity = interpolate(frame, [0, 28, 210, 270], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity,
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <TopBar />

      <div
        style={{
          position: "absolute",
          left: 58,
          right: 58,
          top: 330,
          color: "white",
          transform: `translateY(${interpolate(enter, [0, 1], [80, 0])}px)`,
        }}
      >
        <div
          style={{
            fontSize: 82,
            lineHeight: 1.08,
            letterSpacing: -3.5,
            fontWeight: 920,
          }}
        >
          {"\u4eca\u65e5\u7ed3\u8bba\uff1a"}
          <br />
          {"AI \u6b63\u5728\u4ece\u5de5\u5177"}
          <br />
          {"\u53d8\u6210\u57fa\u7840\u8bbe\u65bd\u3002"}
        </div>

        <div
          style={{
            marginTop: 54,
            display: "grid",
            gap: 22,
          }}
        >
          {[
            "\u6a21\u578b\uff1aGPT-5.6 \u628a\u957f\u4efb\u52a1\u4e0e\u5b89\u5168\u63a8\u5230\u524d\u53f0",
            "Agent\uff1aCodex \u8bc1\u660e\u4ee3\u7406\u5de5\u4f5c\u6d41\u6b63\u5728\u6269\u6563",
            "\u79d1\u7814\uff1aClaude \u8fdb\u5165\u751f\u547d\u79d1\u5b66\u573a\u666f",
            "\u786c\u4ef6\uff1aAI coding \u5f00\u59cb\u62e5\u6709\u5b9e\u4f53\u5165\u53e3",
            "\u5b89\u5168\u4e0e\u6cbb\u7406\uff1a\u8865\u4e01\u3001\u91c7\u8d2d\u3001\u76d1\u7ba1\u90fd\u5728\u52a0\u901f",
          ].map((text, index) => (
            <div
              key={text}
              style={{
                padding: "24px 28px",
                borderRadius: 26,
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.84)",
                fontSize: 30,
                lineHeight: 1.35,
                opacity: interpolate(frame, [20 + index * 10, 42 + index * 10], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
                transform: `translateY(${interpolate(
                  frame,
                  [20 + index * 10, 42 + index * 10],
                  [28, 0],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }
                )}px)`,
              }}
            >
              {text}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 58,
          right: 58,
          bottom: 110,
          color: "rgba(255,255,255,0.56)",
          fontSize: 24,
          lineHeight: 1.45,
        }}
      >
        {"\u7d20\u6750\u6765\u6e90\uff1aOpenAI\u3001Anthropic\u3001Reuters\u3001The Verge\u3001Business Insider / POLITICO\u3002"}
        <br />
        {"\u89c6\u9891\u811a\u672c\uff1aRemotion + TypeScript + React"}
      </div>
    </AbsoluteFill>
  );
};

export const AiNewsVideo: React.FC = () => {
  const { fps } = useVideoConfig();

  const titleDuration = 7 * fps;
  const carouselDuration = NEWS_ITEMS.length * 7 * fps;
  const closingStart = titleDuration + carouselDuration;

  const bgm = useMemo(() => bgmSrc, []);

  return (
    <AbsoluteFill>
      <Background />

      <Audio src={bgm} loop volume={0.16} />

      <Sequence  durationInFrames={titleDuration}>
        <TitleScene />
      </Sequence>

      <Sequence from={titleDuration} durationInFrames={carouselDuration}>
        <NewsCarousel />
      </Sequence>

      <Sequence
        from={closingStart}
        durationInFrames={VIDEO_DURATION_IN_FRAMES - closingStart}
      >
        <ClosingScene />
      </Sequence>
    </AbsoluteFill>
  );
};

export default AiNewsVideo;