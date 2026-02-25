import * as readline from "readline";
import type { FromRust } from "./protocol.js";
import { emit } from "./protocol.js";
import { sendMessage, setPermissionMode, interruptSession } from "./session.js";
import { resolvePermission } from "./permission-handler.js";

const rl = readline.createInterface({
  input: process.stdin,
  terminal: false,
});

emit({ type: "session_ready", sessionId: `session_${Date.now()}` });

rl.on("line", async (line: string) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  let msg: FromRust;
  try {
    msg = JSON.parse(trimmed) as FromRust;
  } catch {
    emit({ type: "error", message: `Invalid JSON: ${trimmed}` });
    return;
  }

  switch (msg.type) {
    case "send":
      // Fire and forget — responses stream back via emit()
      sendMessage(msg.text, msg.cwd).catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        emit({ type: "error", message });
      });
      break;

    case "respond_permission":
      resolvePermission(msg.requestId, msg.decision);
      break;

    case "set_permission_mode":
      setPermissionMode(msg.mode);
      break;

    case "interrupt":
      interruptSession();
      break;

    default:
      emit({
        type: "error",
        message: `Unknown message type: ${(msg as { type: string }).type}`,
      });
  }
});

rl.on("close", () => {
  process.exit(0);
});

process.on("SIGTERM", () => {
  process.exit(0);
});

process.on("SIGINT", () => {
  process.exit(0);
});
