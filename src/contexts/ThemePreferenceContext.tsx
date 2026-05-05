import { createContext, useContext, useState, type ReactNode } from "react";

export type TokenMode = "lens" | "atlas-light" | "atlas-dark";

const STORAGE_KEY = "app_theme_preference";

interface ThemePreferenceContextValue {
  tokenMode: TokenMode;
  setTokenMode: (mode: TokenMode) => void;
}

export const ThemePreferenceContext = createContext<ThemePreferenceContextValue>({
  tokenMode: "atlas-light",
  setTokenMode: () => {},
});

function readStoredMode(): TokenMode {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "lens" || stored === "atlas-light" || stored === "atlas-dark") {
    return stored;
  }
  return "atlas-light";
}

export function ThemePreferenceProvider({ children }: { children: ReactNode }) {
  const [tokenMode, setTokenModeState] = useState<TokenMode>(readStoredMode);

  function setTokenMode(mode: TokenMode) {
    setTokenModeState(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }

  return (
    <ThemePreferenceContext.Provider value={{ tokenMode, setTokenMode }}>
      {children}
    </ThemePreferenceContext.Provider>
  );
}

export function useThemePreference() {
  return useContext(ThemePreferenceContext);
}
