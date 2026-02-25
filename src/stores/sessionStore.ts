import { create } from "zustand";

export interface Session {
  id: string;
  name: string;
  cwd: string;
  createdAt: number;
  lastActiveAt: number;
  messageCount: number;
}

interface SessionState {
  sessions: Session[];
  activeSessionId: string | null;

  createSession: (name: string, cwd: string) => string;
  setActiveSession: (id: string) => void;
  renameSession: (id: string, name: string) => void;
  removeSession: (id: string) => void;
  updateActivity: (id: string) => void;
  incrementMessages: (id: string) => void;
}

let sessionCounter = 0;

export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  activeSessionId: null,

  createSession: (name: string, cwd: string) => {
    const id = `session_${++sessionCounter}_${Date.now()}`;
    const session: Session = {
      id,
      name,
      cwd,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      messageCount: 0,
    };
    set((state) => ({
      sessions: [session, ...state.sessions],
      activeSessionId: id,
    }));
    return id;
  },

  setActiveSession: (id: string) => {
    set({ activeSessionId: id });
  },

  renameSession: (id: string, name: string) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, name } : s
      ),
    }));
  },

  removeSession: (id: string) => {
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
      activeSessionId:
        state.activeSessionId === id ? null : state.activeSessionId,
    }));
  },

  updateActivity: (id: string) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, lastActiveAt: Date.now() } : s
      ),
    }));
  },

  incrementMessages: (id: string) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id
          ? { ...s, messageCount: s.messageCount + 1, lastActiveAt: Date.now() }
          : s
      ),
    }));
  },
}));
