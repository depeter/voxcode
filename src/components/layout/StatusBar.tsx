import { Circle } from "lucide-react";

interface StatusBarProps {
  isConnected: boolean;
  isLoading: boolean;
  pendingApprovals: number;
}

export function StatusBar({
  isConnected,
  isLoading,
  pendingApprovals,
}: StatusBarProps) {
  return (
    <footer className="flex items-center justify-between px-4 py-1 border-t border-zinc-800 bg-zinc-950 text-xs text-zinc-500">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Circle
            size={8}
            className={
              isConnected
                ? "fill-green-500 text-green-500"
                : "fill-red-500 text-red-500"
            }
          />
          {isConnected ? "Connected" : "Disconnected"}
        </div>
        {isLoading && (
          <span className="text-violet-400">Processing...</span>
        )}
        {pendingApprovals > 0 && (
          <span className="text-amber-400">
            {pendingApprovals} pending approval{pendingApprovals > 1 ? "s" : ""}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span>Esc: interrupt</span>
        <span>Y/N: approve/deny</span>
      </div>
    </footer>
  );
}
