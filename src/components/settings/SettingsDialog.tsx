import { X, Download } from "lucide-react";
import { useState } from "react";

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  isModelLoaded: boolean;
  onLoadModel: (path: string) => void;
}

const WHISPER_MODELS = [
  { name: "tiny.en", size: "75 MB", url: "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin" },
  { name: "base.en", size: "142 MB", url: "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin" },
  { name: "small.en", size: "466 MB", url: "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.en.bin" },
];

export function SettingsDialog({
  open,
  onClose,
  isModelLoaded,
  onLoadModel,
}: SettingsDialogProps) {
  const [modelPath, setModelPath] = useState("~/.voxcode/models/ggml-base.en.bin");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative w-[500px] max-h-[80vh] bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
          <h2 className="text-sm font-medium text-zinc-200">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-800"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Whisper Model */}
          <div>
            <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">
              Speech-to-Text
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isModelLoaded ? "bg-green-500" : "bg-zinc-600"}`} />
                <span className="text-sm text-zinc-300">
                  {isModelLoaded ? "Whisper model loaded" : "No model loaded"}
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  value={modelPath}
                  onChange={(e) => setModelPath(e.target.value)}
                  placeholder="Path to ggml model file"
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-300 focus:outline-none focus:border-violet-500"
                />
                <button
                  onClick={() => onLoadModel(modelPath.replace("~", "/home/peter"))}
                  className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded text-sm"
                >
                  Load
                </button>
              </div>
              <div className="text-xs text-zinc-500">
                Download a model from whisper.cpp:
              </div>
              {WHISPER_MODELS.map((model) => (
                <a
                  key={model.name}
                  href={model.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-zinc-800 text-xs text-zinc-400 hover:text-zinc-200"
                >
                  <Download size={12} />
                  <span>ggml-{model.name}.bin</span>
                  <span className="text-zinc-600">({model.size})</span>
                </a>
              ))}
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div>
            <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">
              Keyboard Shortcuts
            </h3>
            <div className="space-y-1 text-sm">
              {[
                ["Enter", "Send message"],
                ["Shift+Enter", "Newline"],
                ["Escape", "Interrupt / Cancel"],
                ["Y / N", "Approve / Deny tool use"],
                ["/", "Focus input / Command palette"],
                ["Space (hold)", "Push-to-talk"],
              ].map(([key, desc]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-zinc-400">{desc}</span>
                  <kbd className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
