import { StockAssetsException } from "../domain/errors.js";

const RETRY_DELAYS_MS = [250, 500] as const;

export type RequestWithPolicyInput = {
  readonly url: string | URL;
  readonly init?: RequestInit;
  readonly fetchImpl?: typeof fetch;
  readonly timeoutMs?: number;
  readonly sleep?: (milliseconds: number) => Promise<void>;
};

const defaultSleep = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function cancelResponse(response: Response): Promise<void> {
  if (response.body !== null) {
    await response.body.cancel().catch(() => undefined);
  }
}

export async function requestWithPolicy(
  input: RequestWithPolicyInput,
): Promise<Response> {
  const fetchImpl = input.fetchImpl ?? globalThis.fetch;
  const timeoutMs = input.timeoutMs ?? 20_000;
  const sleep = input.sleep ?? defaultSleep;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    const controller = new AbortController();
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort(new DOMException("Request timed out", "TimeoutError"));
    }, timeoutMs);

    try {
      const response = await fetchImpl(input.url, {
        ...input.init,
        signal: controller.signal,
      });
      if (
        response.status >= 500 &&
        response.status <= 599 &&
        attempt < RETRY_DELAYS_MS.length
      ) {
        await cancelResponse(response);
        await sleep(RETRY_DELAYS_MS[attempt] ?? 0);
        continue;
      }
      return response;
    } catch (error) {
      if (!timedOut) {
        throw error;
      }
      if (attempt >= RETRY_DELAYS_MS.length) {
        throw new StockAssetsException(
          "NETWORK_TIMEOUT",
          `Provider request timed out after ${timeoutMs} ms`,
          { cause: error },
        );
      }
      await sleep(RETRY_DELAYS_MS[attempt] ?? 0);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new StockAssetsException(
    "PROVIDER_ERROR",
    "Provider request retry policy exhausted unexpectedly",
  );
}
