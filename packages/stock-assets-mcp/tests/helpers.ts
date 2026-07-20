import assert from "node:assert/strict";

export type FetchCall = {
  readonly url: string;
  readonly method: string;
  readonly headers: Readonly<Record<string, string>>;
  readonly redirect: RequestRedirect | undefined;
  readonly signal: AbortSignal | undefined;
};

export type FetchQueueEntry =
  | Response
  | Error
  | ((call: FetchCall) => Response | Promise<Response>);

function headersToRecord(headers: HeadersInit | undefined): Record<string, string> {
  const normalized = new Headers(headers);
  return Object.fromEntries(normalized.entries());
}

export function createFetchQueue(entries: readonly FetchQueueEntry[]): {
  readonly calls: FetchCall[];
  readonly fetch: typeof fetch;
} {
  const queue = [...entries];
  const calls: FetchCall[] = [];

  const fetchImpl: typeof fetch = async (input, init) => {
    const call: FetchCall = {
      url:
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url,
      method: init?.method ?? "GET",
      headers: headersToRecord(init?.headers),
      redirect: init?.redirect,
      signal: init?.signal ?? undefined,
    };
    calls.push(call);

    const entry = queue.shift();
    if (entry === undefined) {
      assert.fail(`Unexpected fetch call to ${call.url}`);
    }
    if (entry instanceof Error) {
      throw entry;
    }
    return typeof entry === "function" ? await entry(call) : entry;
  };

  return { calls, fetch: fetchImpl };
}

export type PexelsPhotoFixture = ReturnType<typeof pexelsPhoto>;

export function pexelsPhoto(
  id: number,
  overrides: Partial<{
    width: number;
    height: number;
    alt: string;
    avgColor: string;
    photographer: string;
  }> = {},
) {
  const width = overrides.width ?? 3_024;
  const height = overrides.height ?? 3_024;
  const photographer = overrides.photographer ?? `Photographer ${id}`;
  const base = `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg`;

  return {
    id,
    width,
    height,
    url: `https://www.pexels.com/photo/fixture-${id}/`,
    photographer,
    photographer_url: `https://www.pexels.com/@fixture-${id}`,
    photographer_id: id + 100,
    avg_color: overrides.avgColor ?? "#978E82",
    src: {
      original: base,
      large2x: `${base}?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940`,
      large: `${base}?auto=compress&cs=tinysrgb&h=650&w=940`,
      medium: `${base}?auto=compress&cs=tinysrgb&h=350`,
      small: `${base}?auto=compress&cs=tinysrgb&h=130`,
      portrait: `${base}?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800`,
      landscape: `${base}?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200`,
      tiny: `${base}?auto=compress&cs=tinysrgb&dpr=1&fit=crop&h=200&w=280`,
    },
    liked: false,
    alt: overrides.alt ?? `Fixture photo ${id}`,
  };
}

export function pexelsSearchResponse(
  input: {
    readonly photos: readonly PexelsPhotoFixture[];
    readonly page?: number;
    readonly perPage?: number;
    readonly totalResults?: number;
    readonly headers?: Readonly<Record<string, string>>;
  },
): Response {
  const page = input.page ?? 1;
  const perPage = input.perPage ?? 12;
  return Response.json(
    {
      page,
      per_page: perPage,
      photos: input.photos,
      total_results: input.totalResults ?? input.photos.length,
      ...(page > 1
        ? { prev_page: `https://api.pexels.com/v1/search?page=${page - 1}` }
        : {}),
      ...(input.totalResults !== undefined && page * perPage < input.totalResults
        ? { next_page: `https://api.pexels.com/v1/search?page=${page + 1}` }
        : {}),
    },
    {
      headers: {
        "X-Ratelimit-Limit": "20000",
        "X-Ratelimit-Remaining": "19999",
        "X-Ratelimit-Reset": "1590529646",
        ...input.headers,
      },
    },
  );
}

export function pexelsPhotoResponse(photo: PexelsPhotoFixture): Response {
  return Response.json(photo, {
    headers: {
      "X-Ratelimit-Limit": "20000",
      "X-Ratelimit-Remaining": "19998",
      "X-Ratelimit-Reset": "1590529646",
    },
  });
}

export function timeoutFetchEntry(): FetchQueueEntry {
  return ({ signal }) =>
    new Promise<Response>((_resolve, reject) => {
      if (signal?.aborted) {
        reject(signal.reason);
        return;
      }
      signal?.addEventListener("abort", () => reject(signal.reason), {
        once: true,
      });
    });
}
