import type { SxProps, Theme } from "@mui/material/styles";

/**
 * Large corner radius for toast surfaces — Atlas **semantic / radius / lg** (12px).
 *
 * @see https://diligentbrands.atlassian.net/wiki/spaces/ATLAS/pages/5820843746/Toasts+with+MUI
 */
export const ATLAS_TOAST_BORDER_RADIUS = "var(--lens-semantic-radius-lg, 12px)";

/** Same typography as MuiAlert message (`theme.typography.body2`). */
export function atlasToastMessageTypographySx(theme: Theme) {
  return theme.typography.body2;
}

/**
 * Shared **MUI Alert** toast surface: corner radius, **body2** message (matches `MuiAlert` root),
 * and **links** that inherit the alert text color (fixes inverse / filled / legacy themes).
 */
export const atlasToastAlertSurfaceSx: SxProps<Theme> = {
  borderRadius: ATLAS_TOAST_BORDER_RADIUS,
  "& .MuiAlert-message": {
    typography: "body2",
  },
  "& .MuiAlert-message .MuiLink-root, & .MuiAlert-message a": {
    color: "inherit",
    textDecorationColor: "currentColor",
  },
  "& .MuiAlert-action .MuiButton-root, & .MuiAlert-action .MuiIconButton-root": {
    color: "inherit",
  },
};
