import { create } from "zustand";
import type { ChatMessage, PermissionRequest, SdkMessage, SdkContent } from "../lib/types";

interface ChatState {
  messages: ChatMessage[];
  pendingPermissions: PermissionRequest[];
  isLoading: boolean;
  streamingContent: string;

  addUserMessage: (text: string) => void;
  handleSdkMessage: (message: unknown) => void;
  handleStreamingText: (text: string) => void;
  handleTurnComplete: (messages: unknown[]) => void;
  addPermissionRequest: (request: PermissionRequest) => void;
  removePermissionRequest: (requestId: string) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
}

let messageCounter = 0;

function extractTextFromContent(content: SdkContent[]): string {
  return content
    .filter((c) => c.type === "text" && c.text)
    .map((c) => c.text!)
    .join("");
}

function extractToolUseFromContent(content: SdkContent[]) {
  return content
    .filter((c) => c.type === "tool_use")
    .map((c) => ({
      id: c.id || `tool_${Date.now()}`,
      name: c.name || "unknown",
      input: (c.input as Record<string, unknown>) || {},
      status: "completed" as const,
    }));
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  pendingPermissions: [],
  isLoading: false,
  streamingContent: "",

  addUserMessage: (text: string) => {
    const msg: ChatMessage = {
      id: `msg_${++messageCounter}`,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };
    set((state) => ({
      messages: [...state.messages, msg],
      isLoading: true,
      streamingContent: "",
    }));
  },

  handleSdkMessage: (rawMessage: unknown) => {
    const message = rawMessage as SdkMessage;
    if (!message || !message.type) return;

    // Handle assistant messages
    if (message.role === "assistant" && message.content) {
      const text = extractTextFromContent(message.content);
      const toolUse = extractToolUseFromContent(message.content);

      if (text || toolUse.length > 0) {
        const msg: ChatMessage = {
          id: `msg_${++messageCounter}`,
          role: "assistant",
          content: text,
          timestamp: Date.now(),
          toolUse: toolUse.length > 0 ? toolUse : undefined,
        };
        set((state) => ({
          messages: [...state.messages, msg],
          streamingContent: "",
        }));
      }
    }

    // Handle tool results
    if (message.type === "tool_result") {
      const content = message.content as string | undefined;
      if (content) {
        set((state) => {
          const messages = [...state.messages];
          // Find the last assistant message with a matching tool use
          for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].toolUse) {
              const toolUse = messages[i].toolUse!;
              const tool = toolUse.find((t) => t.status === "completed" && !t.output);
              if (tool) {
                tool.output = content;
                break;
              }
            }
          }
          return { messages };
        });
      }
    }
  },

  handleStreamingText: (text: string) => {
    set((state) => ({
      streamingContent: state.streamingContent + text,
    }));
  },

  handleTurnComplete: (_messages: unknown[]) => {
    set((state) => {
      // If there's remaining streaming content, add it as a message
      const newMessages = [...state.messages];
      if (state.streamingContent) {
        newMessages.push({
          id: `msg_${++messageCounter}`,
          role: "assistant",
          content: state.streamingContent,
          timestamp: Date.now(),
        });
      }
      return {
        messages: newMessages,
        isLoading: false,
        streamingContent: "",
      };
    });
  },

  addPermissionRequest: (request: PermissionRequest) => {
    set((state) => ({
      pendingPermissions: [...state.pendingPermissions, request],
    }));
  },

  removePermissionRequest: (requestId: string) => {
    set((state) => ({
      pendingPermissions: state.pendingPermissions.filter(
        (p) => p.requestId !== requestId
      ),
    }));
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  clearMessages: () => {
    set({ messages: [], streamingContent: "", isLoading: false, pendingPermissions: [] });
  },
}));
