import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { AtlasThemeProvider } from "@diligentcorp/atlas-react-bundle";

import { ThemePreferenceProvider, useThemePreference } from "./contexts/ThemePreferenceContext.js";
import App from "./App.js";
import { ensureDiligentFavicon } from "./ensureDiligentFavicon.js";

ensureDiligentFavicon();

/**
 * Reads tokenMode from context so AtlasThemeProvider reacts to user preference
 * changes without being a parent of ThemePreferenceProvider.
 */
function ThemedApp() {
  const { tokenMode } = useThemePreference();
  return (
    <AtlasThemeProvider tokenMode={tokenMode}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <App />
      </LocalizationProvider>
    </AtlasThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemePreferenceProvider>
        <ThemedApp />
      </ThemePreferenceProvider>
    </BrowserRouter>
  </StrictMode>,
);
