import type { PermissionRequest } from "../../lib/types";

interface ToolPreviewProps {
  request: PermissionRequest;
}

export function ToolPreview({ request }: ToolPreviewProps) {
  const { toolName, input } = request;

  switch (toolName) {
    case "Bash":
      return (
        <div className="bg-zinc-900 rounded-lg p-3 font-mono text-sm">
          <div className="text-zinc-500 text-xs mb-1">$ command</div>
          <pre className="text-green-400 whitespace-pre-wrap">
            {String(input.command || "")}
          </pre>
        </div>
      );

    case "Edit":
      return (
        <div className="bg-zinc-900 rounded-lg p-3 text-sm">
          <div className="text-zinc-500 text-xs mb-1">
            {String(input.file_path || "")}
          </div>
          {input.old_string ? (
            <div className="mb-2">
              <div className="text-red-400 text-xs">- old</div>
              <pre className="text-red-300/70 whitespace-pre-wrap text-xs bg-red-950/30 rounded p-2">
                {String(input.old_string)}
              </pre>
            </div>
          ) : null}
          {input.new_string ? (
            <div>
              <div className="text-green-400 text-xs">+ new</div>
              <pre className="text-green-300/70 whitespace-pre-wrap text-xs bg-green-950/30 rounded p-2">
                {String(input.new_string)}
              </pre>
            </div>
          ) : null}
        </div>
      );

    case "Write":
      return (
        <div className="bg-zinc-900 rounded-lg p-3 text-sm">
          <div className="text-zinc-500 text-xs mb-1">
            Write: {String(input.file_path || "")}
          </div>
          <pre className="text-zinc-300 whitespace-pre-wrap text-xs max-h-32 overflow-y-auto">
            {String(input.content || "").slice(0, 500)}
            {String(input.content || "").length > 500 ? "\n..." : ""}
          </pre>
        </div>
      );

    case "Read":
      return (
        <div className="bg-zinc-900 rounded-lg p-3 text-sm">
          <div className="text-zinc-400">
            Read: <span className="text-zinc-200">{String(input.file_path || "")}</span>
          </div>
        </div>
      );

    case "Glob":
    case "Grep":
      return (
        <div className="bg-zinc-900 rounded-lg p-3 text-sm">
          <div className="text-zinc-400">
            {toolName}: <span className="text-zinc-200">{String(input.pattern || "")}</span>
            {input.path ? (
              <span className="text-zinc-500"> in {String(input.path)}</span>
            ) : null}
          </div>
        </div>
      );

    default:
      return (
        <div className="bg-zinc-900 rounded-lg p-3 text-sm">
          <pre className="text-zinc-400 whitespace-pre-wrap text-xs">
            {JSON.stringify(input, null, 2)}
          </pre>
        </div>
      );
  }
}
