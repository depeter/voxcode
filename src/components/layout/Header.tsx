import { Zap, FolderOpen, Trash2, Command } from "lucide-react";
import { useSettingsStore } from "../../stores/settingsStore";
import type { PermissionMode } from "../../lib/types";
import * as tauri from "../../lib/tauri";

interface HeaderProps {
  onClear: () => void;
}

const PERMISSION_MODES: { value: PermissionMode; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "acceptEdits", label: "Accept Edits" },
  { value: "plan", label: "Plan Mode" },
  { value: "bypass", label: "Bypass (Danger)" },
];

export function Header({ onClear }: HeaderProps) {
  const { permissionMode, cwd, setPermissionMode, setCwd } =
    useSettingsStore();

  const handleModeChange = async (mode: PermissionMode) => {
    setPermissionMode(mode);
    await tauri.setPermissionMode(mode);
  };

  const handleSetCwd = () => {
    const path = prompt("Enter working directory path:");
    if (path) {
      setCwd(path);
    }
  };

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-950">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Zap size={18} className="text-violet-400" />
          <span className="font-semibold text-zinc-100">VoxCode</span>
        </div>
        {cwd && (
          <span className="text-xs text-zinc-500 font-mono truncate max-w-64">
            {cwd}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleSetCwd}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
          title="Set working directory"
        >
          <FolderOpen size={14} />
          {cwd ? "Change dir" : "Set dir"}
        </button>
        <select
          value={permissionMode}
          onChange={(e) =>
            handleModeChange(e.target.value as PermissionMode)
          }
          className="text-xs bg-zinc-900 border border-zinc-700 text-zinc-300 rounded px-2 py-1 focus:outline-none focus:border-violet-500"
        >
          {PERMISSION_MODES.map((mode) => (
            <option key={mode.value} value={mode.value}>
              {mode.label}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-0.5 text-xs text-zinc-600 bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5">
          <Command size={10} />
          <span>K</span>
        </div>
        <button
          onClick={onClear}
          className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors"
          title="Clear chat"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </header>
  );
}
