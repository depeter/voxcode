import { query, type SDKMessage, type PermissionResult } from "@anthropic-ai/claude-agent-sdk";
import { emit } from "./protocol.js";
import { createPermissionRequest } from "./permission-handler.js";

let currentAbortController: AbortController | null = null;
let permissionMode: string = "default";

export function setPermissionMode(mode: string): void {
  permissionMode = mode;
}

export function interruptSession(): void {
  if (currentAbortController) {
    currentAbortController.abort();
    currentAbortController = null;
  }
}

export async function sendMessage(
  text: string,
  cwd?: string
): Promise<void> {
  currentAbortController = new AbortController();

  try {
    const options: Record<string, unknown> = {
      maxTurns: 50,
      abortController: currentAbortController,
      canUseTool: async (
        toolName: string,
        input: Record<string, unknown>,
      ): Promise<PermissionResult> => {
        // Send approval request to Rust/frontend and wait for response
        const decision = await createPermissionRequest(toolName, input);

        if (decision === "allow") {
          return { behavior: "allow" as const, updatedInput: input };
        } else {
          return {
            behavior: "deny" as const,
            message: "User denied this action",
          };
        }
      },
    };

    if (cwd) {
      options.cwd = cwd;
    }

    // Set permission mode
    if (permissionMode === "bypass") {
      options.permissionMode = "bypassPermissions";
      options.allowDangerouslySkipPermissions = true;
    } else if (permissionMode === "acceptEdits") {
      options.permissionMode = "acceptEdits";
    } else if (permissionMode === "plan") {
      options.permissionMode = "plan";
    }

    const q = query({
      prompt: text,
      options,
    });

    for await (const msg of q) {
      emit({ type: "sdk_message", message: msg as unknown });
    }

    emit({
      type: "turn_complete",
      messages: [],
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      emit({ type: "error", message: "Interrupted by user" });
    } else {
      const message = err instanceof Error ? err.message : String(err);
      emit({ type: "error", message });
    }
  } finally {
    currentAbortController = null;
  }
}
