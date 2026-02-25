import { Mic, MicOff } from "lucide-react";
import { useCallback, useEffect } from "react";

interface MicButtonProps {
  isRecording: boolean;
  isModelLoaded: boolean;
  onStartRecording: () => void;
  onStopRecording: () => Promise<string>;
  onTranscription: (text: string) => void;
}

export function MicButton({
  isRecording,
  isModelLoaded,
  onStartRecording,
  onStopRecording,
  onTranscription,
}: MicButtonProps) {
  const handleClick = useCallback(async () => {
    if (isRecording) {
      const text = await onStopRecording();
      if (text) onTranscription(text);
    } else {
      onStartRecording();
    }
  }, [isRecording, onStartRecording, onStopRecording, onTranscription]);

  // Space bar for push-to-talk (only when not focused on input)
  useEffect(() => {
    if (!isModelLoaded) return;

    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }
      if (e.code === "Space" && !e.repeat && !isRecording) {
        e.preventDefault();
        onStartRecording();
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (e.code === "Space" && isRecording) {
        e.preventDefault();
        onStopRecording().then((text) => {
          if (text) onTranscription(text);
        });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isModelLoaded, isRecording, onStartRecording, onStopRecording, onTranscription]);

  return (
    <button
      onClick={handleClick}
      disabled={!isModelLoaded}
      className={`p-3 rounded-lg transition-colors ${
        isRecording
          ? "bg-red-600 hover:bg-red-500 text-white animate-pulse"
          : isModelLoaded
          ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
          : "text-zinc-600 cursor-not-allowed"
      }`}
      title={
        !isModelLoaded
          ? "Whisper model not loaded"
          : isRecording
          ? "Stop recording"
          : "Start recording (hold Space)"
      }
    >
      {isRecording ? <Mic size={18} /> : <MicOff size={18} />}
    </button>
  );
}
