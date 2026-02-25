import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export function useAudio() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcription, setTranscription] = useState("");
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  useEffect(() => {
    // Check if model is loaded
    invoke<boolean>("is_model_loaded").then(setIsModelLoaded).catch(() => {});

    const unlisteners: Array<() => void> = [];

    listen<number>("audio-level", (e) => {
      setAudioLevel(e.payload);
    }).then((fn) => unlisteners.push(fn));

    listen<string>("transcription", (e) => {
      setTranscription(e.payload);
    }).then((fn) => unlisteners.push(fn));

    return () => {
      unlisteners.forEach((fn) => fn());
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      await invoke("start_recording");
      setIsRecording(true);
      setTranscription("");
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<string> => {
    try {
      const text = await invoke<string>("stop_recording");
      setIsRecording(false);
      setTranscription(text);
      return text;
    } catch (err) {
      console.error("Failed to stop recording:", err);
      setIsRecording(false);
      return "";
    }
  }, []);

  const loadModel = useCallback(async (modelPath: string) => {
    try {
      await invoke("load_whisper_model", { modelPath });
      setIsModelLoaded(true);
    } catch (err) {
      console.error("Failed to load model:", err);
    }
  }, []);

  return {
    isRecording,
    audioLevel,
    transcription,
    isModelLoaded,
    startRecording,
    stopRecording,
    loadModel,
  };
}
