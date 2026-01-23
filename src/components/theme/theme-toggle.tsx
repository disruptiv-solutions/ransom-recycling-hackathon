"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ThemeMode = "light" | "dark";

const getInitialTheme = (): ThemeMode => {
  if (typeof window === "undefined") return "light";

  try {
    const stored = window.localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;

    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    return prefersDark ? "dark" : "light";
  } catch {
    return "light";
  }
};

const applyThemeToDocument = (theme: ThemeMode) => {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
};

export const ThemeToggle = ({ className }: { className?: string }) => {
  const [theme, setTheme] = React.useState<ThemeMode>("light");
  const isDark = theme === "dark";

  React.useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    applyThemeToDocument(initial);
  }, []);

  const handleToggle = () => {
    const nextTheme: ThemeMode = isDark ? "light" : "dark";
    setTheme(nextTheme);
    applyThemeToDocument(nextTheme);

    try {
      window.localStorage.setItem("theme", nextTheme);
    } catch {
      // ignore
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleToggle}
      className={cn(
        "h-11 w-full justify-between rounded-full border-border bg-card px-4 text-sm font-semibold text-foreground shadow-sm hover:bg-muted",
        className
      )}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <span className="flex items-center gap-2">
        {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        {isDark ? "Dark" : "Light"}
      </span>
      <span className="text-xs text-muted-foreground">Theme</span>
    </Button>
  );
};

