import { useEffect, useRef } from "react";
import type { ChatMessage } from "../../lib/types";
import { MessageBubble } from "./MessageBubble";
import { StreamingText } from "./StreamingText";
import { MessageSquare } from "lucide-react";

interface ChatContainerProps {
  messages: ChatMessage[];
  streamingContent: string;
  isLoading: boolean;
}

export function ChatContainer({
  messages,
  streamingContent,
  isLoading,
}: ChatContainerProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  if (messages.length === 0 && !streamingContent) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-zinc-500">
          <MessageSquare size={48} className="mx-auto mb-4 opacity-30" />
          <h2 className="text-lg font-medium text-zinc-400">VoxCode</h2>
          <p className="text-sm mt-1">
            Voice-driven Claude development interface
          </p>
          <p className="text-xs mt-4 text-zinc-600">
            Type a message or press Space to speak
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto divide-y divide-zinc-800/50">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {streamingContent && <StreamingText content={streamingContent} />}
        {isLoading && !streamingContent && (
          <div className="flex gap-3 px-4 py-3">
            <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">
              C
            </div>
            <div className="flex items-center gap-1 py-2">
              <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
