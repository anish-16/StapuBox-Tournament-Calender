import { useMemo } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const isDark = useMemo(() => theme === "dark", [theme]);

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn(
        "group relative inline-flex h-11 items-center justify-between rounded-full border border-brand-100/60 bg-white/90 px-3 text-sm font-semibold text-neutral-600 shadow-soft transition hover:border-brand-200 hover:bg-brand-50/80",
        "dark:border-neutral-600/80 dark:bg-neutral-800/70 dark:text-neutral-100 dark:hover:bg-neutral-700",
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="flex items-center gap-2">
        <Sun
          className={cn(
            "h-4 w-4 transition",
            isDark ? "text-neutral-400" : "text-brand-500",
          )}
        />
        <Moon
          className={cn(
            "h-4 w-4 transition",
            isDark ? "text-accent-foreground" : "text-neutral-300",
          )}
        />
      </span>
      <span className="ml-3 rounded-full bg-brand-500 px-3 py-1 text-xs uppercase tracking-wide text-white transition group-hover:bg-brand-600 dark:bg-brand-400 dark:text-neutral-900 dark:group-hover:bg-brand-300">
        {isDark ? "Dark" : "Light"}
      </span>
    </button>
  );
}
