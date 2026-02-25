import { Shield, Check, X } from "lucide-react";
import type { PermissionRequest } from "../../lib/types";
import { ToolPreview } from "./ToolPreview";

interface ApprovalCardProps {
  request: PermissionRequest;
  onApprove: (requestId: string) => void;
  onDeny: (requestId: string) => void;
}

export function ApprovalCard({ request, onApprove, onDeny }: ApprovalCardProps) {
  return (
    <div className="mx-4 my-2 border border-amber-700/50 bg-amber-950/20 rounded-xl overflow-hidden animate-in slide-in-from-bottom-2">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-amber-700/30">
        <Shield size={16} className="text-amber-400" />
        <span className="text-sm font-medium text-amber-200">
          Tool Approval: {request.toolName}
        </span>
      </div>
      <div className="p-4">
        <ToolPreview request={request} />
      </div>
      <div className="flex items-center gap-2 px-4 py-3 border-t border-amber-700/30 bg-amber-950/30">
        <button
          onClick={() => onApprove(request.requestId)}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Check size={14} />
          Approve
          <kbd className="ml-1 text-xs opacity-70 bg-green-700 px-1 rounded">Y</kbd>
        </button>
        <button
          onClick={() => onDeny(request.requestId)}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <X size={14} />
          Deny
          <kbd className="ml-1 text-xs opacity-70 bg-red-700 px-1 rounded">N</kbd>
        </button>
        <span className="text-xs text-zinc-500 ml-auto">
          Press Y/N to respond
        </span>
      </div>
    </div>
  );
}
