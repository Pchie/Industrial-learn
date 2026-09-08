"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { parseTheme, THEME_STORAGE_KEY, type ThemePreference } from "./theme";

export function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>("system");
  useEffect(() => {
    setPreference(parseTheme(document.documentElement.dataset.theme));
    const sync = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY && event.key !== null) return;
      const next = parseTheme(event.newValue);
      document.documentElement.dataset.theme = next;
      setPreference(next);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const Icon = preference === "dark" ? Moon : preference === "light" ? Sun : Monitor;
  return (
    <label className="theme-toggle">
      <Icon aria-hidden="true" size={18} />
      <span className="sr-only">Appearance</span>
      <select
        value={preference}
        onChange={(event) => {
          const next = parseTheme(event.target.value);
          setPreference(next);
          document.documentElement.dataset.theme = next;
          try {
            localStorage.setItem(THEME_STORAGE_KEY, next);
          } catch {
            /* Session-only when storage is blocked. */
          }
        }}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </label>
  );
}
