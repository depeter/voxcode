import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";

// Typed Tauri invoke wrappers
export async function sendMessage(
  text: string,
  cwd?: string
): Promise<void> {
  return invoke("send_message", { text, cwd });
}

export async function interruptSession(): Promise<void> {
  return invoke("interrupt");
}

export async function respondPermission(
  requestId: string,
  decision: string
): Promise<void> {
  return invoke("respond_permission", { requestId, decision });
}

export async function setPermissionMode(mode: string): Promise<void> {
  return invoke("set_permission_mode", { mode });
}

export async function isSidecarRunning(): Promise<boolean> {
  return invoke("is_sidecar_running");
}

// Typed event listeners
export function onSdkMessage(
  callback: (message: unknown) => void
): Promise<UnlistenFn> {
  return listen("sdk-message", (event) => callback(event.payload));
}

export function onPermissionRequest(
  callback: (request: {
    requestId: string;
    toolName: string;
    input: unknown;
  }) => void
): Promise<UnlistenFn> {
  return listen("permission-request", (event) =>
    callback(event.payload as { requestId: string; toolName: string; input: unknown })
  );
}

export function onStreamingText(
  callback: (text: string) => void
): Promise<UnlistenFn> {
  return listen("streaming-text", (event) =>
    callback(event.payload as string)
  );
}

export function onTurnComplete(
  callback: (messages: unknown[]) => void
): Promise<UnlistenFn> {
  return listen("turn-complete", (event) =>
    callback(event.payload as unknown[])
  );
}

export function onSessionReady(
  callback: (sessionId: string) => void
): Promise<UnlistenFn> {
  return listen("session-ready", (event) =>
    callback(event.payload as string)
  );
}

export function onSidecarError(
  callback: (message: string) => void
): Promise<UnlistenFn> {
  return listen("sidecar-error", (event) =>
    callback(event.payload as string)
  );
}

export function onSidecarExited(
  callback: () => void
): Promise<UnlistenFn> {
  return listen("sidecar-exited", () => callback());
}
