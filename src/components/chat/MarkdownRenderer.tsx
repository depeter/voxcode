import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Copy, Check } from "lucide-react";
import { useState, useCallback, type ReactNode, type HTMLAttributes, type ComponentType } from "react";

interface MarkdownRendererProps {
  content: string;
}

function CodeBlock({ children, className, ...props }: HTMLAttributes<HTMLElement> & { children?: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const isInline = !match;

  const handleCopy = useCallback(() => {
    const text = String(children).replace(/\n$/, "");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [children]);

  if (isInline) {
    return (
      <code
        className="bg-zinc-800 px-1.5 py-0.5 rounded text-sm text-amber-300"
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="relative group">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleCopy}
          className="p-1.5 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-300"
          title="Copy code"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      {match && (
        <div className="text-xs text-zinc-500 px-4 pt-2">{match[1]}</div>
      )}
      <code className={className} {...props}>
        {children}
      </code>
    </div>
  );
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        code: CodeBlock as ComponentType<object>,
        pre: ({ children, ...props }) => (
          <pre
            className="bg-zinc-900 rounded-lg overflow-x-auto my-2 text-sm"
            {...props}
          >
            {children}
          </pre>
        ),
        p: ({ children, ...props }) => (
          <p className="mb-2 last:mb-0" {...props}>
            {children}
          </p>
        ),
        ul: ({ children, ...props }) => (
          <ul className="list-disc list-inside mb-2 space-y-1" {...props}>
            {children}
          </ul>
        ),
        ol: ({ children, ...props }) => (
          <ol className="list-decimal list-inside mb-2 space-y-1" {...props}>
            {children}
          </ol>
        ),
        a: ({ children, href, ...props }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
            {...props}
          >
            {children}
          </a>
        ),
        blockquote: ({ children, ...props }) => (
          <blockquote
            className="border-l-2 border-zinc-600 pl-4 italic text-zinc-400 my-2"
            {...props}
          >
            {children}
          </blockquote>
        ),
        table: ({ children, ...props }) => (
          <div className="overflow-x-auto my-2">
            <table className="min-w-full divide-y divide-zinc-700" {...props}>
              {children}
            </table>
          </div>
        ),
        th: ({ children, ...props }) => (
          <th className="px-3 py-2 text-left text-sm font-medium text-zinc-300" {...props}>
            {children}
          </th>
        ),
        td: ({ children, ...props }) => (
          <td className="px-3 py-2 text-sm text-zinc-400" {...props}>
            {children}
          </td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
