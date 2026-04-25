import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "dark" | "light";
export type DensityMode = "comfortable" | "compact";

interface UiState {
  theme: ThemeMode;
  density: DensityMode;
  initialized: boolean;

  initialize: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  toggleDensity: () => void;
}

const THEME_KEY = "ui-theme";

const applyTheme = (theme: ThemeMode) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      density: "comfortable",
      initialized: false,

      initialize: () => {
        if (get().initialized || typeof window === "undefined") return;

        const systemPrefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
        const theme = get().theme || (systemPrefersDark ? "dark" : "light");

        applyTheme(theme);

        set({
          theme,
          initialized: true,
        });
      },

      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },

      toggleTheme: () => {
        const next = get().theme === "dark" ? "light" : "dark";
        get().setTheme(next);
      },

      toggleDensity: () => {
        const next =
          get().density === "comfortable" ? "compact" : "comfortable";
        set({ density: next });
      },
    }),
    {
      name: THEME_KEY, // Use same key for persist
    },
  ),
);
