import type { PermissionRequest } from "../../lib/types";
import { ApprovalCard } from "./ApprovalCard";

interface ApprovalBannerProps {
  requests: PermissionRequest[];
  onApprove: (requestId: string) => void;
  onDeny: (requestId: string) => void;
}

export function ApprovalBanner({
  requests,
  onApprove,
  onDeny,
}: ApprovalBannerProps) {
  if (requests.length === 0) return null;

  return (
    <div className="border-t border-zinc-800">
      {requests.map((req) => (
        <ApprovalCard
          key={req.requestId}
          request={req}
          onApprove={onApprove}
          onDeny={onDeny}
        />
      ))}
    </div>
  );
}
