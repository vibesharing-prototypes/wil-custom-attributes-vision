import { useMemo, useState, type FC } from "react";
import { Alert, Box, Button, Link, Stack, Typography } from "@mui/material";
import type { AttributeDefinition } from "../../../types/attribute.js";
import type { AuditLogEntry } from "../types.js";
import { STR } from "../../../utils/i18n.js";
import { uiDividerDefaultBorderColor } from "../../../utils/uiDividerBorder.js";
import { AttributeListRow } from "./AttributeListRow.js";
import { SortableCustomAttributeList } from "./SortableCustomAttributeList.js";
import { RecentlyDeletedAuditRow } from "./RecentlyDeletedAuditRow.js";
import { collectRecentlyDeletedFlat } from "../utils/recentlyDeletedFromAudit.js";
import AddIcon from "@diligentcorp/atlas-react-bundle/icons/Add";
import HistoryIcon from "@diligentcorp/atlas-react-bundle/icons/History";

interface Props {
  attributes: AttributeDefinition[];
  /** When set, “Recently deleted” is derived from audit entries (hard-deleted attributes). */
  auditLog?: AuditLogEntry[];
  onAdd: () => void;
  onEdit: (attribute: AttributeDefinition) => void;
  onViewAuditLog: () => void;
  onViewAttributeHistory: (attribute: AttributeDefinition) => void;
  /** When true, list shows drag handles only; accordions stay collapsed. */
  reorderMode?: boolean;
  onExitReorderMode?: () => void;
  onReorderCustomAttributes?: (activeId: string, overId: string) => void;
}

/**
 * The custom attributes section in the schema management view.
 * Displays a section header with "Add attribute" action and the list of custom attributes.
 * Empty state is shown when no custom attributes exist yet.
 */
export const AttributeManagementList: FC<Props> = ({
  attributes,
  auditLog,
  onAdd,
  onEdit,
  onViewAuditLog,
  onViewAttributeHistory,
  reorderMode = false,
  onExitReorderMode,
  onReorderCustomAttributes,
}) => {
  const [recentlyDeletedExpanded, setRecentlyDeletedExpanded] = useState(false);

  const recentlyDeletedEntries = useMemo(
    () => (auditLog ? collectRecentlyDeletedFlat(auditLog, attributes) : []),
    [auditLog, attributes],
  );

  const recentlyDeletedCount = recentlyDeletedEntries.length;

  return (
    <Box>
      {/* Section heading row */}
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        gap={2}
        mb={2}
      >
        <Box>
          <Typography
            variant="h2"
            sx={{ fontWeight: 600 }}
          >
            {STR.schemaManagement.customSectionTitle}
          </Typography>
          <Typography
            variant="body2"
            sx={({ tokens }) => ({ color: tokens.semantic.color.type?.default?.value ?? "text.primary", mt: 0.5 })}
          >
            {STR.schemaManagement.customSectionSubtitle}
          </Typography>
        </Box>
        <Stack direction="row" gap={1} flexShrink={0}>
          <Button
            variant="text"
            startIcon={<HistoryIcon aria-hidden />}
            onClick={onViewAuditLog}
            aria-label={STR.auditLog.globalTitle}
          >
            {STR.auditLog.auditLogButton}
          </Button>
          {!reorderMode && (
            <Button
              variant="contained"
              startIcon={<AddIcon aria-hidden />}
              onClick={onAdd}
              aria-label={STR.schemaManagement.addAttribute}
            >
              {STR.schemaManagement.addAttribute}
            </Button>
          )}
        </Stack>
      </Stack>

      {reorderMode && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            onExitReorderMode ? (
              <Button color="inherit" size="small" onClick={onExitReorderMode}>
                {STR.schemaManagement.doneReorderMode}
              </Button>
            ) : undefined
          }
        >
          <Typography variant="body1" fontWeight={600} component="div">
            {STR.schemaManagement.reorderModeTitle}
          </Typography>
          <Typography variant="body1" component="div" sx={{ mt: 0.5 }}>
            {STR.schemaManagement.reorderModeDescription}
          </Typography>
        </Alert>
      )}

      {attributes.length === 0 ? (
        <Box
          sx={({ tokens }) => ({
            py: 6,
            textAlign: "center",
            border: "1px dashed",
            borderColor: uiDividerDefaultBorderColor(tokens),
            borderRadius: 1,
          })}
        >
          <Typography
            variant="body2"
            sx={({ tokens }) => ({ color: tokens.semantic.color.type?.muted?.value ?? "text.secondary" })}
          >
            {STR.schemaManagement.emptyState}
          </Typography>
        </Box>
      ) : reorderMode && onReorderCustomAttributes ? (
        <SortableCustomAttributeList
          attributes={attributes}
          onEdit={onEdit}
          onReorder={onReorderCustomAttributes}
        />
      ) : (
        <Box sx={{ overflow: "hidden" }}>
          {attributes.map((attr) => (
            <AttributeListRow
              key={attr.id}
              attribute={attr}
              onEdit={onEdit}
              onViewHistory={onViewAttributeHistory}
            />
          ))}
        </Box>
      )}

      {recentlyDeletedCount > 0 && (
        <Box sx={{ mt: 1.5, px: 0.5 }}>
          <Link
            component="button"
            variant="body2"
            underline="always"
            onClick={() => setRecentlyDeletedExpanded((v) => !v)}
            sx={({ tokens }) => ({
              color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
              cursor: "pointer",
            })}
          >
            {recentlyDeletedExpanded
              ? STR.schemaManagement.hideRecentlyDeleted
              : STR.schemaManagement.showRecentlyDeleted(recentlyDeletedCount)}
          </Link>
          {recentlyDeletedExpanded && (
            <Box
              sx={({ tokens }) => ({
                mt: 1,
                borderRadius: 1,
                overflow: "hidden",
                border: "1px solid",
                borderColor: uiDividerDefaultBorderColor(tokens),
              })}
            >
              {recentlyDeletedEntries.map((entry, i) => (
                <Box
                  key={entry.id}
                  sx={({ tokens }) =>
                    i < recentlyDeletedEntries.length - 1
                      ? {
                          borderBottom: "1px solid",
                          borderColor: uiDividerDefaultBorderColor(tokens),
                        }
                      : undefined
                  }
                >
                  <RecentlyDeletedAuditRow entry={entry} />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};
