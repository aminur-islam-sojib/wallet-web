"use client";

import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import React, { useEffect, useSyncExternalStore } from "react";

type ThemePreference = "light" | "dark";

function getThemePreference(): ThemePreference {
  if (typeof window === "undefined") return "light";

  const stored = window.localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (stored === "light" || stored === "dark") return stored;
  return prefersDark ? "dark" : "light";
}

function subscribeToThemePreference(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("themechange", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("themechange", onStoreChange);
  };
}

export default function ThemeToggleButton() {
  const theme = useSyncExternalStore(
    subscribeToThemePreference,
    getThemePreference,
    () => "light",
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  function setThemePreference(nextTheme: ThemePreference) {
    const root = document.documentElement;
    root.classList.toggle("dark", nextTheme === "dark");
    window.localStorage.setItem("theme", nextTheme);
    window.dispatchEvent(new Event("themechange"));
  }

  return (
    <div className="grid gap-3 rounded-lg border p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Theme
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setThemePreference("light")}
          className={cn(
            "flex min-h-11 items-center justify-center gap-2 rounded-md border text-sm font-semibold transition",
            theme === "light"
              ? "border-foreground/40 bg-foreground text-background"
              : "hover:bg-muted",
          )}
          aria-pressed={theme === "light"}
        >
          <Sun className="size-4" />
          Light
        </button>
        <button
          type="button"
          onClick={() => setThemePreference("dark")}
          className={cn(
            "flex min-h-11 items-center justify-center gap-2 rounded-md border text-sm font-semibold transition",
            theme === "dark"
              ? "border-foreground/40 bg-foreground text-background"
              : "hover:bg-muted",
          )}
          aria-pressed={theme === "dark"}
        >
          <Moon className="size-4" />
          Dark
        </button>
      </div>
    </div>
  );
}
