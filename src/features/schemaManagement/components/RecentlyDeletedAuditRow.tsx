import type { FC } from "react";
import { Box, Stack, Typography } from "@mui/material";
import type { AuditLogEntry } from "../types.js";
import { TYPE_LABELS, STR } from "../../../utils/i18n.js";
import { getTypeIcon } from "./AttributeTypeSelector.js";
import type { AttributeType } from "../../../types/attribute.js";

function formatDeletedAt(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface Props {
  entry: AuditLogEntry;
}

/**
 * Read-only row for “recently deleted” — data comes from audit only (no description).
 */
export const RecentlyDeletedAuditRow: FC<Props> = ({ entry }) => {
  const type = (entry.deleteSnapshot?.attributeType ?? "text") as AttributeType;
  const TypeIcon = getTypeIcon(type);

  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={1.5}
      sx={{
        px: 2,
        py: 1.25,
        minWidth: 0,
      }}
    >
      <Box
        sx={({ tokens }) => ({
          color:
            tokens.semantic.color.type?.secondary?.value ??
            tokens.semantic.color.type?.muted?.value ??
            "text.secondary",
          display: "flex",
          flexShrink: 0,
        })}
      >
        <TypeIcon aria-hidden />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" fontWeight={500} sx={{ color: "text.secondary" }}>
          {entry.attributeName}
        </Typography>
        <Typography variant="caption" sx={({ tokens }) => ({ color: tokens.semantic.color.type?.muted?.value ?? "text.secondary" })}>
          {TYPE_LABELS[type]} · {STR.schemaManagement.recentlyDeletedDeletedMeta(formatDeletedAt(entry.timestamp), entry.actor)}
        </Typography>
      </Box>
    </Stack>
  );
}
