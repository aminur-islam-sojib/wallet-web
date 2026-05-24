"use client";

import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";

type ThemePreference = "light" | "dark";

function getThemePreference(): ThemePreference {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function subscribeToTheme(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("themechange", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("themechange", onChange);
  };
}

function setThemePreference(next: ThemePreference) {
  document.documentElement.classList.toggle("dark", next === "dark");
  window.localStorage.setItem("theme", next);
  window.dispatchEvent(new Event("themechange"));
}

export default function ThemeToggleButton() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemePreference,
    () => "light",
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      onClick={() => setThemePreference(isDark ? "light" : "dark")}
      className={cn(
        "group relative flex h-10 w-full items-center rounded-full border px-1 transition-all duration-300",
        isDark
          ? "border-foreground/20 bg-foreground"
          : "border-border bg-muted/60",
      )}
    >
      {/* sliding pill */}
      <span
        className={cn(
          "absolute h-8 w-[calc(50%-4px)] rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isDark
            ? "left-[calc(50%+2px)] bg-background"
            : "left-1 bg-background shadow-sm",
        )}
        aria-hidden="true"
      />

      {/* labels */}
      <span className="relative z-10 flex flex-1 items-center justify-center gap-1.5 text-xs font-medium transition-colors duration-200">
        <Sun
          className={cn(
            "size-3.5 transition-colors duration-200",
            !isDark ? "text-amber-500" : "text-muted-foreground",
          )}
        />
        <span
          className={cn(!isDark ? "text-foreground" : "text-muted-foreground")}
        >
          Light
        </span>
      </span>

      <span className="relative z-10 flex flex-1 items-center justify-center gap-1.5 text-xs font-medium transition-colors duration-200">
        <Moon
          className={cn(
            "size-3.5 transition-colors duration-200",
            isDark ? "text-blue-400" : "text-muted-foreground",
          )}
        />
        <span
          className={cn(isDark ? "text-background" : "text-muted-foreground")}
        >
          Dark
        </span>
      </span>
    </button>
  );
}
