import { emit } from "./protocol.js";

type PermissionResolver = (decision: string) => void;

const pendingRequests = new Map<string, PermissionResolver>();
let requestCounter = 0;

export function createPermissionRequest(
  toolName: string,
  input: unknown
): Promise<string> {
  const requestId = `perm_${++requestCounter}_${Date.now()}`;

  return new Promise<string>((resolve) => {
    pendingRequests.set(requestId, resolve);

    emit({
      type: "permission_request",
      requestId,
      toolName,
      input,
    });
  });
}

export function resolvePermission(
  requestId: string,
  decision: string
): void {
  const resolver = pendingRequests.get(requestId);
  if (resolver) {
    resolver(decision);
    pendingRequests.delete(requestId);
  } else {
    console.error(`No pending permission request with id: ${requestId}`);
  }
}
