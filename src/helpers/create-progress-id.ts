"use client";

export const createProgressId = (): string => {
  const cryptoApi = globalThis.crypto;

  if (typeof cryptoApi?.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }

  const timestamp = Date.now().toString(36);

  if (typeof cryptoApi?.getRandomValues === "function") {
    const values = new Uint32Array(2);
    cryptoApi.getRandomValues(values);
    return `progress-${timestamp}-${values[0].toString(36)}-${values[1].toString(36)}`;
  }

  return `progress-${timestamp}-${Math.random().toString(36).slice(2, 12)}`;
};
