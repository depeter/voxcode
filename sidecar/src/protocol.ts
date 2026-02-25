// Messages from Rust (received on stdin)
export type FromRust =
  | { type: "send"; text: string; cwd?: string }
  | { type: "respond_permission"; requestId: string; decision: string }
  | { type: "set_permission_mode"; mode: string }
  | { type: "interrupt" };

// Messages to Rust (sent on stdout)
export type ToRust =
  | { type: "sdk_message"; message: unknown }
  | { type: "permission_request"; requestId: string; toolName: string; input: unknown }
  | { type: "session_ready"; sessionId: string }
  | { type: "streaming_text"; text: string }
  | { type: "turn_complete"; messages: unknown[] }
  | { type: "error"; message: string };

export function emit(msg: ToRust): void {
  process.stdout.write(JSON.stringify(msg) + "\n");
}
