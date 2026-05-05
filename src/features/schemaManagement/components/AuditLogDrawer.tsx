import type { FC } from "react";
import {
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";
import type { AuditAction, AuditLogEntry } from "../types.js";
import { STR } from "../../../utils/i18n.js";
import { uiDividerDefaultBorderColor } from "../../../utils/uiDividerBorder.js";

interface Props {
  open: boolean;
  entries: AuditLogEntry[];
  /**
   * When set, only entries for this attribute are shown and the drawer
   * displays a link to open the full global audit log.
   */
  attributeId?: string | null;
  /** Used as the subtitle when in per-attribute mode. */
  attributeName?: string | null;
  onClose: () => void;
  /** Called when the user clicks "View full audit log" in per-attribute mode. */
  onViewFullLog?: () => void;
  /**
   * Called in global mode when the user clicks an attribute name to drill
   * into that attribute's per-attribute history.
   */
  onSelectAttribute?: (attributeId: string, attributeName: string) => void;
}

const ACTION_LABELS: Record<AuditAction, string> = {
  created: "Created",
  edited: "Edited",
  /** Legacy prototype entries — same outcome as deleted in the UI. */
  deprecated: "Deleted",
  deleted: "Deleted",
  reactivated: "Reactivated",
};

type ChipColor = "success" | "info" | "warning" | "default" | "error";

const ACTION_CHIP_COLOR: Record<AuditAction, ChipColor> = {
  created: "success",
  edited: "info",
  deprecated: "error",
  deleted: "error",
  reactivated: "success",
};

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

const AuditEntry: FC<{
  entry: AuditLogEntry;
  showAttributeName: boolean;
  onSelectAttribute?: (attributeId: string, attributeName: string) => void;
}> = ({ entry, showAttributeName, onSelectAttribute }) => (
  <Stack gap={0.75} sx={{ py: 2 }}>
    <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
      <Chip
        label={ACTION_LABELS[entry.action]}
        size="small"
        color={ACTION_CHIP_COLOR[entry.action]}
        variant="outlined"
        sx={{ height: 20, fontSize: "0.7rem" }}
      />
      {showAttributeName && (
        onSelectAttribute ? (
          <Link
            component="button"
            underline="hover"
            onClick={() => onSelectAttribute(entry.attributeId, entry.attributeName)}
            sx={{ fontSize: "0.875rem", fontWeight: 500, cursor: "pointer" }}
          >
            {entry.attributeName}
          </Link>
        ) : (
          <Typography variant="body2" fontWeight={500}>
            {entry.attributeName}
          </Typography>
        )
      )}
    </Stack>

    <Typography
      variant="caption"
      sx={({ tokens }) => ({ color: tokens.semantic.color.type?.muted?.value ?? "text.secondary" })}
    >
      {entry.actor} · {formatTimestamp(entry.timestamp)}
    </Typography>

    {entry.changes && entry.changes.length > 0 && (
      <Stack gap={0.5} sx={{ mt: 0.25 }}>
        {entry.changes.map((change, i) => (
          <Box key={i}>
            <Typography
              variant="caption"
              sx={({ tokens }) => ({
                color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
              })}
            >
              <Box component="span" fontWeight={500}>
                {change.field}
              </Box>
              {change.from != null ? (
                <>
                  {" "}
                  <Box
                    component="span"
                    sx={({ tokens }) => ({
                      textDecoration: "line-through",
                      color: tokens.semantic.color.type?.muted?.value ?? "text.disabled",
                    })}
                  >
                    {change.from}
                  </Box>
                  {" → "}
                </>
              ) : (
                ": "
              )}
              {change.to ?? "—"}
            </Typography>
          </Box>
        ))}
      </Stack>
    )}
  </Stack>
);

/**
 * Side drawer showing the schema change audit log.
 *
 * Two modes:
 *  - Global: `attributeId` is null/undefined — shows all entries across all attributes.
 *  - Per-attribute: `attributeId` is set — shows only entries for that attribute, with a
 *    link to open the full global log.
 *
 * Entries are displayed in reverse chronological order (newest first).
 */
export const AuditLogDrawer: FC<Props> = ({
  open,
  entries,
  attributeId,
  attributeName,
  onClose,
  onViewFullLog,
  onSelectAttribute,
}) => {
  const isFiltered = Boolean(attributeId);
  const visibleEntries = isFiltered
    ? [...entries].filter((e) => e.attributeId === attributeId).reverse()
    : [...entries].reverse();

  const title = isFiltered
    ? STR.auditLog.perAttributeTitle
    : STR.auditLog.globalTitle;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        role: "dialog",
        "aria-labelledby": "audit-log-title",
        "aria-modal": "true",
        sx: { width: { xs: "100%", sm: 420 }, display: "flex", flexDirection: "column" },
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={({ tokens }) => ({
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          py: 2,
          borderBottom: "1px solid",
          borderColor: uiDividerDefaultBorderColor(tokens),
          flexShrink: 0,
          gap: 2,
        })}
      >
        <Box>
          <Typography id="audit-log-title" variant="h3" component="h2" fontWeight={600}>
            {title}
          </Typography>

          {isFiltered && attributeName && (
            <Typography
              variant="body2"
              sx={({ tokens }) => ({
                color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
                mt: 0.25,
              })}
            >
              {attributeName}
            </Typography>
          )}

          {isFiltered && onViewFullLog && (
            <Link
              component="button"
              underline="always"
              onClick={onViewFullLog}
              sx={{ fontSize: "0.75rem", mt: 0.5, display: "block", cursor: "pointer" }}
            >
              {STR.auditLog.viewFullLog}
            </Link>
          )}
        </Box>

        <IconButton
          onClick={onClose}
          size="small"
          aria-label="Close change history"
          edge="end"
          sx={{ flexShrink: 0, mt: 0.25 }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* ── Entry list ── */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        {visibleEntries.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography
              variant="body2"
              sx={({ tokens }) => ({
                color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
              })}
            >
              {STR.auditLog.emptyState}
            </Typography>
          </Box>
        ) : (
          visibleEntries.map((entry, index) => (
            <Box key={entry.id}>
              <AuditEntry
                entry={entry}
                showAttributeName={!isFiltered}
                onSelectAttribute={!isFiltered ? onSelectAttribute : undefined}
              />
              {index < visibleEntries.length - 1 && <Divider />}
            </Box>
          ))
        )}
      </Box>
    </Drawer>
  );
};
