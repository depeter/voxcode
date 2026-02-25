import { ChevronDown, ChevronRight, Terminal, FileEdit, Eye, Search } from "lucide-react";
import { useState } from "react";
import type { ToolUseInfo } from "../../lib/types";

interface ToolUseBlockProps {
  tool: ToolUseInfo;
}

const TOOL_ICONS: Record<string, typeof Terminal> = {
  Bash: Terminal,
  Edit: FileEdit,
  Read: Eye,
  Grep: Search,
};

function getToolSummary(tool: ToolUseInfo): string {
  const input = tool.input;
  switch (tool.name) {
    case "Bash":
      return String(input.command || "").slice(0, 100);
    case "Edit":
      return String(input.file_path || "");
    case "Read":
      return String(input.file_path || "");
    case "Write":
      return String(input.file_path || "");
    case "Grep":
      return `${input.pattern || ""} in ${input.path || "."}`;
    case "Glob":
      return String(input.pattern || "");
    default:
      return tool.name;
  }
}

export function ToolUseBlock({ tool }: ToolUseBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = TOOL_ICONS[tool.name] || Terminal;
  const summary = getToolSummary(tool);

  return (
    <div className="my-2 border border-zinc-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800/50 transition-colors"
      >
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <Icon size={14} />
        <span className="font-medium text-zinc-300">{tool.name}</span>
        <span className="truncate text-zinc-500">{summary}</span>
      </button>
      {expanded && (
        <div className="px-3 py-2 bg-zinc-900/50 border-t border-zinc-800">
          <pre className="text-xs text-zinc-400 whitespace-pre-wrap overflow-x-auto">
            {JSON.stringify(tool.input, null, 2)}
          </pre>
          {tool.output && (
            <>
              <div className="text-xs text-zinc-500 mt-2 mb-1">Output:</div>
              <pre className="text-xs text-zinc-400 whitespace-pre-wrap overflow-x-auto max-h-48 overflow-y-auto">
                {tool.output}
              </pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}
