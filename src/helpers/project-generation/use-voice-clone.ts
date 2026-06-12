"use client";

import { useState } from "react";

export type VoiceCloneSettings = {
  enabled: boolean;
  referenceId?: string;
  referenceText: string;
  originalName?: string;
};

type VoiceReferenceUploadResponse = {
  error?: string;
  format?: string;
  originalName?: string;
  referenceId?: string;
  referenceText?: string;
};

export type VoiceClonePayload = {
  enabled: true;
  referenceId: string;
  referenceText: string;
};

export type UseVoiceCloneResult = {
  getVoiceClonePayload: (enabledForRequest: boolean) => VoiceClonePayload | undefined;
  isUploadingVoiceReference: boolean;
  updateVoiceClone: (nextVoiceClone: VoiceCloneSettings) => void;
  uploadVoiceReference: (file: File) => Promise<void>;
  voiceClone: VoiceCloneSettings;
  voiceReferenceError: string | null;
};

export const useVoiceClone = (): UseVoiceCloneResult => {
  const [voiceClone, setVoiceClone] = useState<VoiceCloneSettings>({
    enabled: false,
    referenceText: "",
  });
  const [isUploadingVoiceReference, setIsUploadingVoiceReference] = useState(false);
  const [voiceReferenceError, setVoiceReferenceError] = useState<string | null>(null);

  const getVoiceClonePayload = (enabledForRequest: boolean): VoiceClonePayload | undefined => {
    if (!enabledForRequest || !voiceClone.enabled) {
      return undefined;
    }

    if (!voiceClone.referenceId) {
      throw new Error("请先上传声音克隆参考音频。");
    }
    if (!voiceClone.referenceText.trim()) {
      throw new Error("请输入参考音频对应文本。");
    }

    return {
      enabled: true,
      referenceId: voiceClone.referenceId,
      referenceText: voiceClone.referenceText.trim(),
    };
  };

  const uploadVoiceReference = async (file: File) => {
    setIsUploadingVoiceReference(true);
    setVoiceReferenceError(null);

    try {
      const formData = new FormData();
      formData.append("audio", file);

      const response = await fetch("/api/tts/voice-references", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as VoiceReferenceUploadResponse;

      if (!response.ok || !data.referenceId) {
        throw new Error(data.error ?? "上传参考音频失败。");
      }

      setVoiceClone((current) => ({
        ...current,
        originalName: data.originalName ?? file.name,
        referenceId: data.referenceId,
        referenceText: data.referenceText ?? current.referenceText,
      }));
    } catch (caughtError) {
      setVoiceReferenceError(caughtError instanceof Error ? caughtError.message : "上传参考音频失败。");
    } finally {
      setIsUploadingVoiceReference(false);
    }
  };

  const updateVoiceClone = (nextVoiceClone: VoiceCloneSettings) => {
    setVoiceClone(nextVoiceClone);
    setVoiceReferenceError(null);
  };

  return {
    getVoiceClonePayload,
    isUploadingVoiceReference,
    updateVoiceClone,
    uploadVoiceReference,
    voiceClone,
    voiceReferenceError,
  };
};
