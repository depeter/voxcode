import { useState } from "react";
import { Plus, X, MessageSquare, FolderOpen, Pencil, Trash2 } from "lucide-react";
import { useSessionStore, type Session } from "../../stores/sessionStore";

interface SessionSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionSelect: (session: Session) => void;
}

export function SessionSidebar({
  isOpen,
  onClose,
  onSessionSelect,
}: SessionSidebarProps) {
  const {
    sessions,
    activeSessionId,
    createSession,
    renameSession,
    removeSession,
    setActiveSession,
  } = useSessionStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  if (!isOpen) return null;

  const handleNew = () => {
    const cwd = prompt("Working directory for new session:", "/home/peter");
    if (!cwd) return;
    const name = prompt("Session name:", `Session ${sessions.length + 1}`) || `Session ${sessions.length + 1}`;
    const id = createSession(name, cwd);
    const session = { id, name, cwd, createdAt: Date.now(), lastActiveAt: Date.now(), messageCount: 0 };
    onSessionSelect(session);
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      renameSession(id, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
        <span className="text-sm font-medium text-zinc-300">Sessions</span>
        <div className="flex gap-1">
          <button
            onClick={handleNew}
            className="p-1 text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-800"
            title="New session"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-800"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {sessions.length === 0 && (
          <div className="px-3 py-8 text-center text-zinc-600 text-xs">
            No sessions yet
          </div>
        )}
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`group flex items-center gap-2 px-3 py-2 cursor-pointer text-sm hover:bg-zinc-800/50 ${
              session.id === activeSessionId
                ? "bg-zinc-800/70 text-zinc-100"
                : "text-zinc-400"
            }`}
            onClick={() => {
              setActiveSession(session.id);
              onSessionSelect(session);
            }}
          >
            <MessageSquare size={14} className="flex-shrink-0" />
            <div className="flex-1 min-w-0">
              {editingId === session.id ? (
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => handleRename(session.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename(session.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="w-full bg-zinc-900 px-1 py-0.5 rounded text-xs"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  <div className="truncate text-xs">{session.name}</div>
                  <div className="text-xs text-zinc-600 truncate flex items-center gap-1">
                    <FolderOpen size={10} />
                    {session.cwd}
                  </div>
                </>
              )}
            </div>
            <div className="hidden group-hover:flex gap-0.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingId(session.id);
                  setEditName(session.name);
                }}
                className="p-0.5 text-zinc-600 hover:text-zinc-300 rounded"
              >
                <Pencil size={12} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeSession(session.id);
                }}
                className="p-0.5 text-zinc-600 hover:text-red-400 rounded"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
