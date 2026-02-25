import { Command } from "cmdk";
import {
  Trash2,
  Minimize2,
  Cpu,
  Map,
  BarChart2,
  Download,
  Settings,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommand: (command: string) => void;
}

const COMMANDS = [
  {
    id: "clear",
    label: "Clear conversation",
    icon: Trash2,
    shortcut: "/clear",
  },
  {
    id: "compact",
    label: "Compact conversation",
    icon: Minimize2,
    shortcut: "/compact",
  },
  {
    id: "model",
    label: "Change model",
    icon: Cpu,
    shortcut: "/model",
  },
  {
    id: "plan",
    label: "Enter plan mode",
    icon: Map,
    shortcut: "/plan",
  },
  {
    id: "usage",
    label: "Show token usage",
    icon: BarChart2,
    shortcut: "/usage",
  },
  {
    id: "export",
    label: "Export conversation",
    icon: Download,
    shortcut: "/export",
  },
  {
    id: "settings",
    label: "Open settings",
    icon: Settings,
    shortcut: "/settings",
  },
];

export function CommandPalette({
  open,
  onOpenChange,
  onCommand,
}: CommandPaletteProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <Command
        className="relative w-[480px] bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden"
        label="Command palette"
      >
        <Command.Input
          autoFocus
          placeholder="Type a command..."
          className="w-full px-4 py-3 bg-transparent text-zinc-100 placeholder-zinc-500 border-b border-zinc-700 focus:outline-none text-sm"
        />
        <Command.List className="max-h-80 overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-zinc-500 text-sm">
            No commands found.
          </Command.Empty>
          {COMMANDS.map((cmd) => (
            <Command.Item
              key={cmd.id}
              value={cmd.label}
              onSelect={() => {
                onCommand(cmd.id);
                onOpenChange(false);
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-300 cursor-pointer data-[selected=true]:bg-zinc-800 data-[selected=true]:text-zinc-100"
            >
              <cmd.icon size={16} className="text-zinc-500" />
              <span className="flex-1">{cmd.label}</span>
              <span className="text-xs text-zinc-600 font-mono">
                {cmd.shortcut}
              </span>
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </div>
  );
}
