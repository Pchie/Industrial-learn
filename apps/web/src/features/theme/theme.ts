export const THEME_STORAGE_KEY = "industrial-learn-theme";
export type ThemePreference = "light" | "dark" | "system";

export function parseTheme(value: unknown): ThemePreference {
  return value === "light" || value === "dark" || value === "system" ? value : "light";
}

// Runs before hydration. It reads only a display preference, never account data.
export const themeInitialiser = `try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');document.documentElement.dataset.theme=t==='light'||t==='dark'||t==='system'?t:'light'}catch{document.documentElement.dataset.theme='light'}`;
