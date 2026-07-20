import {
  stockAssetsErrorSchema,
  type StockAssetsError,
  type StockAssetsErrorCode,
} from "./schemas.js";

const DEFAULT_RETRYABILITY: Readonly<Record<StockAssetsErrorCode, boolean>> = {
  PROVIDER_NOT_CONFIGURED: false,
  INVALID_INPUT: false,
  IMAGE_NOT_FOUND: false,
  RATE_LIMITED: true,
  NETWORK_TIMEOUT: true,
  PROVIDER_ERROR: false,
  DOWNLOAD_REJECTED: false,
  OUTPUT_BOUNDARY_VIOLATION: false,
  INTEGRITY_MISMATCH: false,
};

export type StockAssetsExceptionOptions = {
  readonly retryable?: boolean;
  readonly retryAfterSeconds?: number;
  readonly cause?: unknown;
};

export class StockAssetsException extends Error {
  readonly code: StockAssetsErrorCode;
  readonly retryable: boolean;
  readonly retryAfterSeconds: number | undefined;

  constructor(
    code: StockAssetsErrorCode,
    message: string,
    options: StockAssetsExceptionOptions = {},
  ) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.name = "StockAssetsException";
    this.code = code;
    this.retryable = options.retryable ?? DEFAULT_RETRYABILITY[code];
    this.retryAfterSeconds = options.retryAfterSeconds;
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function redactSensitiveText(
  value: string,
  sensitiveValues: readonly string[] = [],
): string {
  let redacted = value
    .replace(
      /(authorization\s*:\s*)(?:bearer\s+)?[^\s,;]+/gi,
      "$1[REDACTED]",
    )
    .replace(
      /(PEXELS_API_KEY\s*=\s*)[^\s,;]+/gi,
      "$1[REDACTED]",
    );

  const uniqueSensitiveValues = [...new Set(sensitiveValues)]
    .map((secret) => secret.trim())
    .filter((secret) => secret.length > 0)
    .sort((left, right) => right.length - left.length);

  for (const secret of uniqueSensitiveValues) {
    redacted = redacted.replace(
      new RegExp(escapeRegExp(secret), "g"),
      "[REDACTED]",
    );
  }

  return redacted.slice(0, 1_000);
}

export type StockAssetsToolErrorResult = {
  readonly isError: true;
  readonly structuredContent: StockAssetsError;
  readonly content: readonly [
    {
      readonly type: "text";
      readonly text: string;
    },
  ];
};

export function toToolErrorResult(
  error: unknown,
  sensitiveValues: readonly string[] = [],
): StockAssetsToolErrorResult {
  const exception =
    error instanceof StockAssetsException
      ? error
      : new StockAssetsException(
          "PROVIDER_ERROR",
          "Unexpected stock assets provider error",
        );
  const message = redactSensitiveText(exception.message, sensitiveValues);
  const structuredContent = stockAssetsErrorSchema.parse({
    ok: false,
    error: {
      code: exception.code,
      message,
      retryable: exception.retryable,
      ...(exception.retryAfterSeconds === undefined
        ? {}
        : { retryAfterSeconds: exception.retryAfterSeconds }),
    },
  });

  return {
    isError: true,
    structuredContent,
    content: [
      {
        type: "text",
        text: JSON.stringify(structuredContent),
      },
    ],
  };
}
