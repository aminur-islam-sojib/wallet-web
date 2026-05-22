import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import React, { useEffect, useState } from "react";

export default function ThemeToggleButton() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const root = document.documentElement;
    const stored = window.localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const nextTheme =
      stored === "light" || stored === "dark"
        ? stored
        : prefersDark
          ? "dark"
          : "light";

    root.classList.toggle("dark", nextTheme === "dark");
    setTheme(nextTheme);
  }, []);
  function setThemePreference(nextTheme: "light" | "dark") {
    const root = document.documentElement;
    root.classList.toggle("dark", nextTheme === "dark");
    window.localStorage.setItem("theme", nextTheme);
    setTheme(nextTheme);
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
