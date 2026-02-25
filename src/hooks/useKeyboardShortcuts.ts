import { useEffect } from "react";

interface ShortcutHandlers {
  onApprove?: () => void;
  onDeny?: () => void;
  onInterrupt?: () => void;
  onFocusInput?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't capture when typing in input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // But still handle Escape and Ctrl+C in inputs
        if (e.key === "Escape" && handlers.onInterrupt) {
          e.preventDefault();
          handlers.onInterrupt();
          return;
        }
        return;
      }

      switch (e.key) {
        case "y":
        case "Y":
          if (handlers.onApprove) {
            e.preventDefault();
            handlers.onApprove();
          }
          break;
        case "n":
        case "N":
          if (handlers.onDeny) {
            e.preventDefault();
            handlers.onDeny();
          }
          break;
        case "Escape":
          if (handlers.onInterrupt) {
            e.preventDefault();
            handlers.onInterrupt();
          }
          break;
        case "/":
          if (handlers.onFocusInput) {
            e.preventDefault();
            handlers.onFocusInput();
          }
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlers]);
}
