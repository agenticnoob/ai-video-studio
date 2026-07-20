import registryDocument from "./voice-profiles.json";

export const producerVoiceProfileIds = ["lyy", "science-explainer-young-male"] as const;

export type ProducerVoiceProfileId = (typeof producerVoiceProfileIds)[number];
export type ProducerCloneMode = "controllable-clone" | "high-fidelity-clone";

export type ProducerControllableCloneProfile = {
  readonly referenceAudioPath: string;
  readonly controlRequired: boolean;
};

export type ProducerHighFidelityCloneProfile = {
  readonly promptAudioPath: string;
  readonly promptTranscriptPath: string;
  readonly referenceAudioPath: string;
};

export type ProducerVoiceProfile = {
  readonly id: ProducerVoiceProfileId;
  readonly label: string;
  readonly useWhen: string;
  readonly defaultMode: ProducerCloneMode;
  readonly controllableClone?: ProducerControllableCloneProfile;
  readonly highFidelityClone?: ProducerHighFidelityCloneProfile;
};

const requireText = (value: unknown, label: string): string => {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} must be non-empty.`);
  }
  return value.trim();
};

const requireBoolean = (value: unknown, label: string): boolean => {
  if (typeof value !== "boolean") throw new Error(`${label} must be boolean.`);
  return value;
};

const requireClonePath = (
  value: unknown,
  label: string,
  extension: ".wav" | ".txt",
): string => {
  const filePath = requireText(value, label);
  if (
    !filePath.startsWith("voices/clone/") ||
    filePath.startsWith("/") ||
    filePath.includes("..") ||
    !filePath.endsWith(extension)
  ) {
    throw new Error(`${label} must be a repository-relative voices/clone/${extension} path.`);
  }
  return filePath;
};

const parseProfile = (value: unknown): ProducerVoiceProfile => {
  if (!value || typeof value !== "object") {
    throw new Error("Producer voice profile must be an object.");
  }
  const profile = value as Record<string, unknown>;
  const id = requireText(profile.id, "Producer voice profile id");
  if (!isProducerVoiceProfileId(id)) {
    throw new Error(`Unknown Producer voice profile id: ${id}.`);
  }
  const defaultMode = requireText(profile.defaultMode, `${id} defaultMode`);
  if (defaultMode !== "controllable-clone" && defaultMode !== "high-fidelity-clone") {
    throw new Error(`${id} has an unsupported default clone mode.`);
  }
  const controllable = profile.controllableClone as Record<string, unknown> | undefined;
  const highFidelity = profile.highFidelityClone as Record<string, unknown> | undefined;
  for (const forbidden of ["fallbackProfileId", "fallbackVoice", "provider"] as const) {
    if (forbidden in profile) throw new Error(`${id} must not declare ${forbidden}.`);
  }
  const parsed: ProducerVoiceProfile = {
    id,
    label: requireText(profile.label, `${id} label`),
    useWhen: requireText(profile.useWhen, `${id} useWhen`),
    defaultMode,
    ...(controllable
      ? {
          controllableClone: {
            referenceAudioPath: requireClonePath(
              controllable.referenceAudioPath,
              `${id} controllable referenceAudioPath`,
              ".wav",
            ),
            controlRequired: requireBoolean(
              controllable.controlRequired,
              `${id} controllable controlRequired`,
            ),
          },
        }
      : {}),
    ...(highFidelity
      ? {
          highFidelityClone: {
            promptAudioPath: requireClonePath(
              highFidelity.promptAudioPath,
              `${id} promptAudioPath`,
              ".wav",
            ),
            promptTranscriptPath: requireClonePath(
              highFidelity.promptTranscriptPath,
              `${id} promptTranscriptPath`,
              ".txt",
            ),
            referenceAudioPath: requireClonePath(
              highFidelity.referenceAudioPath,
              `${id} high-fidelity referenceAudioPath`,
              ".wav",
            ),
          },
        }
      : {}),
  };
  if (parsed.defaultMode === "controllable-clone" && !parsed.controllableClone) {
    throw new Error(`${id} default mode requires controllableClone configuration.`);
  }
  if (parsed.defaultMode === "high-fidelity-clone" && !parsed.highFidelityClone) {
    throw new Error(`${id} default mode requires highFidelityClone configuration.`);
  }
  return parsed;
};

export const isProducerVoiceProfileId = (value: string): value is ProducerVoiceProfileId =>
  (producerVoiceProfileIds as readonly string[]).includes(value);

export const producerVoiceProfiles = registryDocument.profiles.map(parseProfile);

export const assertProducerVoiceProfiles = (
  profiles: readonly ProducerVoiceProfile[] = producerVoiceProfiles,
): void => {
  if (registryDocument.version !== 1) {
    throw new Error("Producer voice profile registry version must be 1.");
  }
  if (profiles.length !== producerVoiceProfileIds.length) {
    throw new Error(`Expected ${producerVoiceProfileIds.length} Producer voice profiles.`);
  }
  const ids = new Set<ProducerVoiceProfileId>();
  for (const profile of profiles) {
    if (ids.has(profile.id)) {
      throw new Error(`Duplicate Producer voice profile: ${profile.id}.`);
    }
    ids.add(profile.id);
  }
  for (const id of producerVoiceProfileIds) {
    if (!ids.has(id)) throw new Error(`Missing Producer voice profile: ${id}.`);
  }
};

export const getProducerVoiceProfile = (id: ProducerVoiceProfileId): ProducerVoiceProfile => {
  const profile = producerVoiceProfiles.find((candidate) => candidate.id === id);
  if (!profile) throw new Error(`Unknown Producer voice profile: ${String(id)}.`);
  return profile;
};

assertProducerVoiceProfiles();
