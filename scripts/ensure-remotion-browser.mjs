/* global console */

import { ensureBrowser } from "@remotion/renderer";

const formatMegabytes = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} Mb`;

let lastLoggedPercent = -1;

console.log("[remotion] Checking Chrome Headless Shell...");

const status = await ensureBrowser({
  chromeMode: "headless-shell",
  logLevel: "info",
  onBrowserDownload: ({ chromeMode }) => {
    console.log(`[remotion] Preparing browser dependency (${chromeMode})...`);

    return {
      version: null,
      onProgress: (progress) => {
        if (progress.alreadyAvailable) {
          return;
        }

        const percent = Math.floor(progress.percent);

        if (percent < 100 && percent - lastLoggedPercent < 10) {
          return;
        }

        lastLoggedPercent = percent;
        console.log(
          `[remotion] Downloading Chrome Headless Shell ${formatMegabytes(
            progress.downloadedBytes,
          )}/${formatMegabytes(progress.totalSizeInBytes)} (${percent}%)`,
        );
      },
    };
  },
});

if ("path" in status) {
  console.log(`[remotion] Browser ready: ${status.path}`);
} else {
  console.log(`[remotion] Browser status: ${status.type}`);
}
