#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { loadStockAssetsConfig } from "./config.js";
import { redactSensitiveText } from "./domain/errors.js";
import { PexelsProviderAdapter } from "./providers/pexels.js";
import { createStockAssetsServer } from "./server.js";
import { CandidateStore } from "./storage/candidate-store.js";

const MAX_DIAGNOSTIC_LENGTH = 512;

function writeDiagnostic(
  label: string,
  error: unknown,
  sensitiveValues: readonly string[] = [],
): void {
  const rawMessage = error instanceof Error ? error.message : String(error);
  const message = redactSensitiveText(rawMessage, sensitiveValues)
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, MAX_DIAGNOSTIC_LENGTH);
  process.stderr.write(
    `stock-assets-mcp ${label}: ${message || "unknown error"}\n`,
  );
}

async function main(): Promise<void> {
  const startupConfig = await loadStockAssetsConfig(process.env);
  const { pexelsApiKey, ...config } = startupConfig;
  const provider = new PexelsProviderAdapter({
    apiKey: pexelsApiKey,
    timeoutMs: config.timeoutMs,
  });
  const store = new CandidateStore({ rootDir: config.outputDir });
  const server = createStockAssetsServer({ config, provider, store });
  const transport = new StdioServerTransport();

  let shutdownPromise: Promise<void> | undefined;
  const shutdown = (exitCode = 0): Promise<void> => {
    if (exitCode !== 0) {
      process.exitCode = exitCode;
    }
    shutdownPromise ??= Promise.resolve().then(() => server.close());
    return shutdownPromise;
  };
  const requestShutdown = (exitCode = 0): void => {
    void shutdown(exitCode).catch((error: unknown) => {
      process.exitCode = 1;
      writeDiagnostic("shutdown failed", error, [pexelsApiKey]);
    });
  };
  const onSignal = (): void => requestShutdown();
  const onStdinEnd = (): void => requestShutdown();

  process.on("SIGINT", onSignal);
  process.on("SIGTERM", onSignal);
  process.stdin.once("end", onStdinEnd);
  transport.onclose = () => requestShutdown();
  transport.onerror = (error: Error) => {
    writeDiagnostic("transport failed", error, [pexelsApiKey]);
    requestShutdown(1);
  };

  await server.connect(transport);
}

void main().catch((error: unknown) => {
  process.exitCode = 1;
  writeDiagnostic("startup failed", error, [process.env.PEXELS_API_KEY ?? ""]);
});
