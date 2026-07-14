#!/usr/bin/env node
/**
 * Attempt to capture screenshots from key news sources for the
 * AiDailyNews20260713 video. Records failures outside the video frame.
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "generated", "ai-daily-news-2026-07-13");

mkdirSync(OUT, { recursive: true });

const TARGETS = [
  {
    id: "meta-data-center",
    label: "Meta 5GW data center",
    url: "https://www.reuters.com/business/meta-expands-louisiana-data-center-5-gigawatts-compute-capacity-2026-07-13/",
    sourceName: "Reuters",
  },
  {
    id: "intel-ireland",
    label: "Intel Ireland investment",
    url: "https://www.reuters.com/business/intel-announces-57-billion-capital-investment-irish-manufacturing-hub-2026-07-13/",
    sourceName: "Reuters",
  },
  {
    id: "openai-gpt56",
    label: "OpenAI GPT-5.6",
    url: "https://openai.com/index/gpt-5-6/",
    sourceName: "openai.com",
  },
  {
    id: "openai-gpt-live",
    label: "OpenAI GPT-Live",
    url: "https://openai.com/index/introducing-gpt-live/",
    sourceName: "openai.com",
  },
  {
    id: "white-house-power",
    label: "White House AI power cost",
    url: "https://www.reuters.com/legal/litigation/white-house-rally-utilities-data-centers-over-ai-power-costs-2026-07-13/",
    sourceName: "Reuters",
  },
  {
    id: "helsing-raise",
    label: "Helsing $1.8B raise",
    url: "https://www.reuters.com/business/aerospace-defense/europes-helsing-raises-18-billion-valuing-defence-group-18-billion-2026-07-13/",
    sourceName: "Reuters",
  },
  {
    id: "eu-copyright",
    label: "EU copyright opt-out",
    url: "https://digital-strategy.ec.europa.eu/en/library/new-feasibility-study-introducing-eu-level-registry-text-and-data-mining-opt-out",
    sourceName: "EU Digital Strategy",
  },
  {
    id: "experts-impact",
    label: "200+ experts AI economic impact",
    url: "https://www.reuters.com/business/over-200-experts-call-urgent-action-tackle-ais-economic-impact-2026-07-13/",
    sourceName: "Reuters",
  },
  {
    id: "china-xi-waic",
    label: "Xi Jinping at WAIC",
    url: "https://www.scmp.com/tech/article/3360404/xi-jinping-attend-world-ai-conference-first-time-china-elevates-tech-push",
    sourceName: "SCMP",
  },
];

const results = [];

async function capture(target) {
  const filePath = join(OUT, `${target.id}.png`);
  try {
    const browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    });
    const page = await context.newPage();

    await page.goto(target.url, { waitUntil: "networkidle", timeout: 30000 });
    // Wait a bit for dynamic content
    await page.waitForTimeout(3000);
    await page.screenshot({ path: filePath, fullPage: false });

    await browser.close();

    const stats = { ok: true, path: filePath };
    console.log(`✓ ${target.id}: captured`);
    return stats;
  } catch (err) {
    console.log(`✗ ${target.id}: ${err.message}`);
    return { ok: false, error: err.message };
  }
}

for (const target of TARGETS) {
  const result = await capture(target);
  results.push({ ...target, result });
  // Brief pause between captures
  await new Promise((r) => setTimeout(r, 2000));
}

// Write capture summary
const summary = results.map((r) => ({
  id: r.id,
  label: r.label,
  sourceName: r.sourceName,
  captureStatus: r.result.ok ? "captured-screenshot" : "source-card-fallback",
  fallbackReason: r.result.ok ? undefined : r.result.error,
  src: r.result.ok
    ? `generated/ai-daily-news-2026-07-13/${r.id}.png`
    : `generated/ai-daily-news-2026-07-13/${r.id}.svg`,
}));

writeFileSync(join(OUT, "capture-summary.json"), JSON.stringify(summary, null, 2));
console.log(`\nCapture summary written: ${summary.filter((s) => s.captureStatus === "captured-screenshot").length}/${summary.length} captured`);