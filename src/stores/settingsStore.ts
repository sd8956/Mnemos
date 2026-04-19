import { create } from "zustand";
import {
  loadSettings,
  saveSettings,
  type AppSettings,
} from "../lib/settings";
import type { CanvasPosition } from "../types";

type SettingsStore = {
  engramDbPath: string | null;
  engramAutoRefresh: boolean;
  engramCategoryPositions: Record<string, CanvasPosition>;
  isLoaded: boolean;

  hydrate: () => Promise<void>;
  setEngramDbPath: (path: string | null) => Promise<void>;
  setEngramAutoRefresh: (enabled: boolean) => Promise<void>;
  setEngramCategoryPosition: (
    categoryId: string,
    position: CanvasPosition,
  ) => void;
};

function snapshot(state: SettingsStore): AppSettings {
  return {
    engramDbPath: state.engramDbPath,
    engramAutoRefresh: state.engramAutoRefresh,
    engramCategoryPositions: state.engramCategoryPositions,
  };
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  engramDbPath: null,
  engramAutoRefresh: true,
  engramCategoryPositions: {},
  isLoaded: false,

  hydrate: async () => {
    const loaded = await loadSettings();
    set({
      engramDbPath: loaded.engramDbPath,
      engramAutoRefresh: loaded.engramAutoRefresh,
      engramCategoryPositions: loaded.engramCategoryPositions ?? {},
      isLoaded: true,
    });
  },

  setEngramDbPath: async (path) => {
    set({ engramDbPath: path });
    await saveSettings(snapshot(get()));
  },

  setEngramAutoRefresh: async (enabled) => {
    set({ engramAutoRefresh: enabled });
    await saveSettings(snapshot(get()));
  },

  setEngramCategoryPosition: (categoryId, position) => {
    set((state) => ({
      engramCategoryPositions: {
        ...state.engramCategoryPositions,
        [categoryId]: position,
      },
    }));
    void saveSettings(snapshot(get()));
  },
}));
