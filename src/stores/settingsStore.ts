import { create } from "zustand";
import type { PermissionMode } from "../lib/types";

interface SettingsState {
  permissionMode: PermissionMode;
  cwd: string;
  setPermissionMode: (mode: PermissionMode) => void;
  setCwd: (cwd: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  permissionMode: "default",
  cwd: "",

  setPermissionMode: (mode: PermissionMode) => {
    set({ permissionMode: mode });
  },

  setCwd: (cwd: string) => {
    set({ cwd });
  },
}));
