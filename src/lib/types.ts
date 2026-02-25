export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  toolUse?: ToolUseInfo[];
  isStreaming?: boolean;
}

export interface ToolUseInfo {
  id: string;
  name: string;
  input: Record<string, unknown>;
  output?: string;
  status: "pending" | "running" | "completed" | "error";
}

export interface PermissionRequest {
  requestId: string;
  toolName: string;
  input: Record<string, unknown>;
}

export interface SdkMessage {
  type: string;
  role?: string;
  content?: SdkContent[];
  [key: string]: unknown;
}

export interface SdkContent {
  type: string;
  text?: string;
  name?: string;
  id?: string;
  input?: Record<string, unknown>;
  content?: string;
  [key: string]: unknown;
}

export type PermissionMode = "default" | "acceptEdits" | "plan" | "bypass";
