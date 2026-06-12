export type ConcurrencyTaskId = "generation" | "render" | "tts";

type BusyMode = "queue" | "reject";

type TaskConfig = {
  envName: string;
  label: string;
};

type QueuedWaiter = {
  reject: (error: Error) => void;
  resolve: () => void;
  timer: ReturnType<typeof setTimeout>;
};

const DEFAULT_CONCURRENCY = 1;
const DEFAULT_QUEUE_TIMEOUT_MS = 300_000;

const TASK_CONFIG: Record<ConcurrencyTaskId, TaskConfig> = {
  generation: {
    envName: "AI_VIDEO_STUDIO_GENERATION_CONCURRENCY",
    label: "generation",
  },
  render: {
    envName: "AI_VIDEO_STUDIO_RENDER_CONCURRENCY",
    label: "render",
  },
  tts: {
    envName: "AI_VIDEO_STUDIO_TTS_CONCURRENCY",
    label: "TTS synthesis",
  },
};

export class ConcurrencyBusyError extends Error {
  readonly taskId: ConcurrencyTaskId;

  constructor(taskId: ConcurrencyTaskId, message: string) {
    super(message);
    this.name = "ConcurrencyBusyError";
    this.taskId = taskId;
  }
}

class InProcessLimiter {
  private activeCount = 0;
  private readonly queue: QueuedWaiter[] = [];

  async run<T>({
    limit,
    mode,
    queueTimeoutMs,
    taskId,
  }: {
    limit: number;
    mode: BusyMode;
    queueTimeoutMs: number;
    taskId: ConcurrencyTaskId;
  }, task: () => Promise<T>): Promise<T> {
    await this.acquire({ limit, mode, queueTimeoutMs, taskId });

    try {
      return await task();
    } finally {
      this.release();
    }
  }

  private acquire({
    limit,
    mode,
    queueTimeoutMs,
    taskId,
  }: {
    limit: number;
    mode: BusyMode;
    queueTimeoutMs: number;
    taskId: ConcurrencyTaskId;
  }): Promise<void> {
    if (this.activeCount < limit) {
      this.activeCount += 1;
      return Promise.resolve();
    }

    const taskLabel = TASK_CONFIG[taskId].label;

    if (mode === "reject") {
      throw new ConcurrencyBusyError(
        taskId,
        `Another ${taskLabel} task is already running. Please retry after it finishes.`,
      );
    }

    return new Promise<void>((resolve, reject) => {
      const waiter: QueuedWaiter = {
        reject,
        resolve: () => {
          clearTimeout(waiter.timer);
          this.activeCount += 1;
          resolve();
        },
        timer: setTimeout(() => {
          const index = this.queue.indexOf(waiter);
          if (index >= 0) {
            this.queue.splice(index, 1);
          }
          reject(
            new ConcurrencyBusyError(
              taskId,
              `Timed out waiting for the current ${taskLabel} task to finish.`,
            ),
          );
        }, queueTimeoutMs),
      };

      this.queue.push(waiter);
    });
  }

  private release(): void {
    this.activeCount = Math.max(0, this.activeCount - 1);
    const next = this.queue.shift();
    if (next) {
      next.resolve();
    }
  }
}

const readPositiveIntegerEnv = (name: string, fallback: number): number => {
  const rawValue = (process.env[name] ?? "").trim();
  if (!rawValue) {
    return fallback;
  }

  const value = Number(rawValue);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return value;
};

const readBusyMode = (): BusyMode => {
  const rawValue = (process.env.AI_VIDEO_STUDIO_BUSY_MODE ?? "reject").trim().toLowerCase();
  if (rawValue === "reject" || rawValue === "queue") {
    return rawValue;
  }

  throw new Error("AI_VIDEO_STUDIO_BUSY_MODE must be either reject or queue.");
};

const getLimiterStore = (): Map<ConcurrencyTaskId, InProcessLimiter> => {
  const globalStore = globalThis as typeof globalThis & {
    __aiVideoStudioConcurrencyLimiters?: Map<ConcurrencyTaskId, InProcessLimiter>;
  };

  globalStore.__aiVideoStudioConcurrencyLimiters ??= new Map();
  return globalStore.__aiVideoStudioConcurrencyLimiters;
};

const getLimiter = (taskId: ConcurrencyTaskId): InProcessLimiter => {
  const store = getLimiterStore();
  const existing = store.get(taskId);
  if (existing) {
    return existing;
  }

  const limiter = new InProcessLimiter();
  store.set(taskId, limiter);
  return limiter;
};

export const runWithConcurrencyLimit = async <T>(
  taskId: ConcurrencyTaskId,
  task: () => Promise<T>,
): Promise<T> => {
  const taskConfig = TASK_CONFIG[taskId];
  const limit = readPositiveIntegerEnv(taskConfig.envName, DEFAULT_CONCURRENCY);
  const queueTimeoutMs = readPositiveIntegerEnv(
    "AI_VIDEO_STUDIO_QUEUE_TIMEOUT_MS",
    DEFAULT_QUEUE_TIMEOUT_MS,
  );

  return getLimiter(taskId).run(
    {
      limit,
      mode: readBusyMode(),
      queueTimeoutMs,
      taskId,
    },
    task,
  );
};
