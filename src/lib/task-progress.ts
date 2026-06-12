export type TaskProgressStatus = "idle" | "running" | "success" | "failure";
export type TaskProgressStepStatus = "pending" | "running" | "success" | "failure";

export type TaskProgressStep = {
  detail?: string;
  finishedAt?: number;
  id: string;
  label: string;
  startedAt?: number;
  status: TaskProgressStepStatus;
};

export type TaskProgress = {
  error?: string;
  finishedAt?: number;
  id: string;
  startedAt: number;
  status: TaskProgressStatus;
  steps: TaskProgressStep[];
  updatedAt: number;
};

const TASK_PROGRESS_TTL_MS = 30 * 60 * 1000;

const getStore = (): Map<string, TaskProgress> => {
  const globalStore = globalThis as typeof globalThis & {
    __aiVideoStudioTaskProgress?: Map<string, TaskProgress>;
  };

  globalStore.__aiVideoStudioTaskProgress ??= new Map<string, TaskProgress>();
  return globalStore.__aiVideoStudioTaskProgress;
};

const cleanupTaskProgress = () => {
  const store = getStore();
  const cutoff = Date.now() - TASK_PROGRESS_TTL_MS;

  store.forEach((progress, id) => {
    if (progress.updatedAt < cutoff) {
      store.delete(id);
    }
  });
};

export const startTaskProgress = ({
  id,
  steps,
}: {
  id: string;
  steps: { id: string; label: string }[];
}): TaskProgress => {
  cleanupTaskProgress();

  const now = Date.now();
  const progress: TaskProgress = {
    id,
    startedAt: now,
    status: "running",
    steps: steps.map((step) => ({ ...step, status: "pending" })),
    updatedAt: now,
  };

  getStore().set(id, progress);
  return progress;
};

export const updateTaskProgressStep = ({
  detail,
  id,
  stepId,
  status,
}: {
  detail?: string;
  id?: string;
  status: TaskProgressStepStatus;
  stepId: string;
}) => {
  if (!id) {
    return;
  }

  const store = getStore();
  const progress = store.get(id);

  if (!progress) {
    return;
  }

  const now = Date.now();
  progress.updatedAt = now;
  progress.steps = progress.steps.map((step) => {
    if (step.id !== stepId) {
      return step;
    }

    return {
      ...step,
      ...(detail ? { detail } : {}),
      ...(status === "running" && !step.startedAt ? { startedAt: now } : {}),
      ...(status === "success" || status === "failure" ? { finishedAt: now } : {}),
      status,
    };
  });
};

export const finishTaskProgress = ({
  error,
  id,
  status,
}: {
  error?: string;
  id?: string;
  status: "success" | "failure";
}) => {
  if (!id) {
    return;
  }

  const progress = getStore().get(id);

  if (!progress) {
    return;
  }

  const now = Date.now();
  progress.error = error;
  progress.finishedAt = now;
  progress.status = status;
  progress.updatedAt = now;

  if (status === "success") {
    progress.steps = progress.steps.map((step) =>
      step.status === "pending" || step.status === "running"
        ? { ...step, finishedAt: now, status: "success" }
        : step,
    );
  } else {
    progress.steps = progress.steps.map((step) =>
      step.status === "running" ? { ...step, finishedAt: now, status: "failure" } : step,
    );
  }
};

export const getTaskProgress = (id: string): TaskProgress | null => {
  cleanupTaskProgress();
  return getStore().get(id) ?? null;
};
