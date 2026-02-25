import { useEffect, useCallback } from "react";
import { useChatStore } from "../stores/chatStore";
import { useSettingsStore } from "../stores/settingsStore";
import * as tauri from "../lib/tauri";

export function useChat() {
  const {
    messages,
    isLoading,
    streamingContent,
    pendingPermissions,
    addUserMessage,
    handleSdkMessage,
    handleStreamingText,
    handleTurnComplete,
    addPermissionRequest,
    removePermissionRequest,
    clearMessages,
  } = useChatStore();

  const { cwd } = useSettingsStore();

  // Subscribe to Tauri events
  useEffect(() => {
    const unlisteners: Array<() => void> = [];

    tauri.onSdkMessage((msg) => {
      handleSdkMessage(msg);
    }).then((fn) => unlisteners.push(fn));

    tauri.onStreamingText((text) => {
      handleStreamingText(text);
    }).then((fn) => unlisteners.push(fn));

    tauri.onTurnComplete((msgs) => {
      handleTurnComplete(msgs);
    }).then((fn) => unlisteners.push(fn));

    tauri.onPermissionRequest((req) => {
      addPermissionRequest({
        requestId: req.requestId,
        toolName: req.toolName,
        input: req.input as Record<string, unknown>,
      });
    }).then((fn) => unlisteners.push(fn));

    tauri.onSidecarError((msg) => {
      console.error("Sidecar error:", msg);
    }).then((fn) => unlisteners.push(fn));

    return () => {
      unlisteners.forEach((fn) => fn());
    };
  }, [handleSdkMessage, handleStreamingText, handleTurnComplete, addPermissionRequest]);

  const send = useCallback(
    async (text: string) => {
      addUserMessage(text);
      await tauri.sendMessage(text, cwd || undefined);
    },
    [addUserMessage, cwd]
  );

  const interrupt = useCallback(async () => {
    await tauri.interruptSession();
  }, []);

  const approvePermission = useCallback(
    async (requestId: string) => {
      await tauri.respondPermission(requestId, "allow");
      removePermissionRequest(requestId);
    },
    [removePermissionRequest]
  );

  const denyPermission = useCallback(
    async (requestId: string) => {
      await tauri.respondPermission(requestId, "deny");
      removePermissionRequest(requestId);
    },
    [removePermissionRequest]
  );

  return {
    messages,
    isLoading,
    streamingContent,
    pendingPermissions,
    send,
    interrupt,
    approvePermission,
    denyPermission,
    clearMessages,
  };
}
