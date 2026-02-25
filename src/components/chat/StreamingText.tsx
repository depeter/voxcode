import { MarkdownRenderer } from "./MarkdownRenderer";

interface StreamingTextProps {
  content: string;
}

export function StreamingText({ content }: StreamingTextProps) {
  if (!content) return null;

  return (
    <div className="flex gap-3 px-4 py-3">
      <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">
        C
      </div>
      <div className="flex-1 min-w-0 text-zinc-200">
        <MarkdownRenderer content={content} />
        <span className="inline-block w-2 h-4 bg-violet-400 animate-pulse ml-0.5" />
      </div>
    </div>
  );
}
