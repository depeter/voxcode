import type { ChatMessage } from "../../lib/types";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ToolUseBlock } from "./ToolUseBlock";
import { User } from "lucide-react";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 px-4 py-3 ${isUser ? "bg-zinc-900/30" : ""}`}>
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
          isUser ? "bg-blue-600" : "bg-violet-600"
        }`}
      >
        {isUser ? <User size={14} /> : "C"}
      </div>
      <div className="flex-1 min-w-0">
        {message.content && (
          <div className="text-zinc-200">
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <MarkdownRenderer content={message.content} />
            )}
          </div>
        )}
        {message.toolUse?.map((tool) => (
          <ToolUseBlock key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}
