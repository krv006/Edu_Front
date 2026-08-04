import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORAGE_KEYS } from "@/shared/constants";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  /** light ⇄ dark almashtiradi (system bo'lsa — hozirgi ko'rinishning teskarisiga). */
  toggle: () => void;
}

function prefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
}

export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === "system") return prefersDark() ? "dark" : "light";
  return mode;
}

/** `.dark` klassini `<html>` ga qo'yadi — theme.css shu selektorga tayanadi. */
function applyTheme(mode: ThemeMode): void {
  if (typeof document === "undefined") return;
  const resolved = resolveTheme(mode);
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.style.colorScheme = resolved;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: "system",
      setMode: (mode) => {
        applyTheme(mode);
        set({ mode });
      },
      toggle: () => {
        const next: ThemeMode = resolveTheme(get().mode) === "dark" ? "light" : "dark";
        applyTheme(next);
        set({ mode: next });
      },
    }),
    {
      name: STORAGE_KEYS.THEME,
      onRehydrateStorage: () => (state) => applyTheme(state?.mode ?? "system"),
    }
  )
);

// Tizim mavzusi o'zgarsa va foydalanuvchi "system" ni tanlagan bo'lsa — darhol moslashamiz.
if (typeof window !== "undefined") {
  applyTheme(useThemeStore.getState().mode);
  window.matchMedia?.("(prefers-color-scheme: dark)").addEventListener?.("change", () => {
    if (useThemeStore.getState().mode === "system") applyTheme("system");
  });
}

/** Komponentlar uchun: hozirgi rejim, hisoblangan ko'rinish va boshqaruv. */
export function useTheme() {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);
  const toggle = useThemeStore((state) => state.toggle);
  return { mode, resolved: resolveTheme(mode), setMode, toggle };
}
