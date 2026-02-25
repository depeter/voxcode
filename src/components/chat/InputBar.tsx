import { useState, useRef, useCallback, type KeyboardEvent, type ReactNode } from "react";
import { Send, Square } from "lucide-react";

interface InputBarProps {
  onSend: (text: string) => void;
  onInterrupt: () => void;
  isLoading: boolean;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
  micButton?: ReactNode;
  audioWaveform?: ReactNode;
  setText?: (text: string) => void;
  externalText?: string;
}

export function InputBar({
  onSend,
  onInterrupt,
  isLoading,
  inputRef,
  micButton,
  audioWaveform,
}: InputBarProps) {
  const [text, setText] = useState("");
  const localRef = useRef<HTMLTextAreaElement>(null);
  const ref = inputRef || localRef;

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setText("");
    if (ref.current) {
      ref.current.style.height = "auto";
    }
  }, [text, isLoading, onSend, ref]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleInput = useCallback(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = Math.min(ref.current.scrollHeight, 200) + "px";
    }
  }, [ref]);

  // Allow external code to set text (e.g., transcription)
  const appendText = useCallback((newText: string) => {
    setText((prev) => (prev ? prev + " " + newText : newText));
  }, []);

  // Expose appendText via ref pattern
  (ref as React.MutableRefObject<HTMLTextAreaElement | null> & { appendText?: (t: string) => void }).appendText = appendText;

  return (
    <div className="border-t border-zinc-800 bg-zinc-950 px-4 py-3">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        {audioWaveform}
        <div className="flex-1 relative">
          <textarea
            ref={ref}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              handleInput();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Send a message... (Enter to send, Shift+Enter for newline)"
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 pr-12 text-zinc-100 placeholder-zinc-500 resize-none focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
            rows={1}
            disabled={isLoading}
          />
        </div>
        {micButton}
        {isLoading ? (
          <button
            onClick={onInterrupt}
            className="p-3 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors"
            title="Stop (Esc)"
          >
            <Square size={18} />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="p-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send (Enter)"
          >
            <Send size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
