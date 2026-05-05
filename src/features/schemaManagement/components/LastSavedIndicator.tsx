import type { FC } from "react";
import { useMemo } from "react";
import { ButtonBase, Stack, Typography } from "@mui/material";
import CloudIcon from "@diligentcorp/atlas-react-bundle/icons/Cloud";
import { STR } from "../../../utils/i18n.js";

interface Props {
  /** ISO timestamp of the most recent schema change, or null if none yet. */
  latestTimestamp: string | null;
  /** Opens the global change history drawer. */
  onOpenChangeHistory: () => void;
}

function formatLocalizedTime(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  // Locale-aware formatting; do not hardcode time format string.
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Page-header autosave entry point — visually styled like the platform's
 * "lagging save" indicator (compact pill, muted text by default). Mirrors the
 * secondary button's hover/active/focus states without rendering the secondary
 * button border. Acts as the primary entry point to the schema-level change
 * history drawer.
 */
export const LastSavedIndicator: FC<Props> = ({ latestTimestamp, onOpenChangeHistory }) => {
  const label = useMemo(() => {
    if (!latestTimestamp) return STR.schemaManagement.lastSavedNever;
    const time = formatLocalizedTime(latestTimestamp);
    if (!time) return STR.schemaManagement.lastSavedNever;
    return STR.schemaManagement.lastSavedLabel(time);
  }, [latestTimestamp]);

  return (
    <ButtonBase
      type="button"
      onClick={onOpenChangeHistory}
      aria-label={STR.auditLog.globalTitle}
      focusRipple={false}
      sx={({ tokens, palette }) => {
        const mutedText =
          tokens.semantic.color.type?.muted?.value ?? palette.text.secondary;
        const defaultText =
          tokens.semantic.color.type?.default?.value ?? palette.text.primary;
        const hoverFill =
          tokens.semantic.color.action.secondary?.hoverFill?.value ?? "#f3f3f3";
        const activeFill =
          tokens.semantic.color.action.secondary?.activeFill?.value ?? "#e6e6e6";
        // Use the canonical Atlas focus shadow token so the white halo + blue
        // ring stay correct on both light and dark surfaces (Figma defines this
        // identically for both themes).
        const focusShadow =
          tokens.semantic.shadow?.focus?.value?.stringValue ??
          "0 0 0 1px #ffffff, 0 0 0 3px #0b4cce";
        return {
          flexShrink: 0,
          mt: 0.25,
          height: 24,
          px: "4px",
          py: "2px",
          gap: "4px",
          borderRadius: 9999,
          color: mutedText,
          backgroundColor: "transparent",
          transition: "background-color 120ms ease, color 120ms ease, box-shadow 120ms ease",
          "&:hover": {
            color: defaultText,
            backgroundColor: hoverFill,
          },
          "&:active": {
            color: defaultText,
            backgroundColor: activeFill,
          },
          // Mirrors the secondary button states minus the resting border.
          "&:focus-visible": {
            color: defaultText,
            backgroundColor: hoverFill,
            outline: "none",
            boxShadow: focusShadow,
          },
        };
      }}
    >
      <Stack direction="row" alignItems="center" gap="4px">
        <CloudIcon aria-hidden size="md" />
        <Typography
          variant="caption"
          component="span"
          sx={{ fontWeight: 600, lineHeight: "16px", whiteSpace: "nowrap" }}
        >
          {label}
        </Typography>
      </Stack>
    </ButtonBase>
  );
};
