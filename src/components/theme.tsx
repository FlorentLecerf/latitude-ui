"use client";
import * as React from "react";
import { cn } from "../cn";
import { THEME_STORAGE_KEY, type Theme } from "./theme-init";

/** Applique le thème sur <html> et le persiste. */
export function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", t);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, t);
  } catch {
    /* localStorage indisponible (mode privé) — on ignore. */
  }
}

/** Hook : lit le thème courant depuis le DOM et expose un toggle. */
export function useTheme(): { theme: Theme; setTheme: (t: Theme) => void; toggle: () => void } {
  const [theme, setThemeState] = React.useState<Theme>("light");
  React.useEffect(() => {
    const cur = (document.documentElement.getAttribute("data-theme") as Theme) || "light";
    setThemeState(cur);
  }, []);
  const setTheme = React.useCallback((t: Theme) => {
    setThemeState(t);
    applyTheme(t);
  }, []);
  const toggle = React.useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      applyTheme(next);
      return next;
    });
  }, []);
  return { theme, setTheme, toggle };
}

export interface ThemeToggleProps extends React.HTMLAttributes<HTMLButtonElement> {
  labels?: { light: string; dark: string };
}
export function ThemeToggle({ className, labels = { light: "Mode clair", dark: "Mode sombre" }, ...props }: ThemeToggleProps) {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      className={cn("lt-toggle", className)}
      aria-label="Basculer le thème clair / sombre"
      aria-pressed={theme === "dark"}
      {...props}
    >
      <span>{theme === "dark" ? labels.dark : labels.light}</span>
      <span className="lt-toggle__sw" aria-hidden />
    </button>
  );
}
