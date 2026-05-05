import type { FC } from "react";
import { useCallback, useEffect, useReducer } from "react";
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";
import HistoryIcon from "@diligentcorp/atlas-react-bundle/icons/History";
import TrashIcon from "@diligentcorp/atlas-react-bundle/icons/Trash";

import type { AttributeDefinition, AttributeType, SchemaSection } from "../../../types/attribute.js";
import type { AttributeFormState, AuditLogEntry, FormSheetMode } from "../types.js";
import { INITIAL_FORM_STATE } from "../types.js";
import { AttributeTypeSelector } from "./AttributeTypeSelector.js";
import { AttributeFormFields } from "./AttributeFormFields.js";
import { STR } from "../../../utils/i18n.js";
import { uiDividerDefaultBorderColor } from "../../../utils/uiDividerBorder.js";

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

interface Props {
  mode: FormSheetMode;
  editingAttribute?: AttributeDefinition | null;
  onSave: (def: Omit<AttributeDefinition, "id"> & { id?: string }) => void;
  onClose: () => void;
  /**
   * When provided, the type selector is restricted to these types.
   * Used for the BOS-constrained variant of schema management.
   */
  allowedTypes?: AttributeType[];
  /**
   * All existing custom attributes, used for overlap/duplicate detection.
   * The editing attribute (if any) is automatically excluded from the check.
   */
  existingAttributes?: AttributeDefinition[];
  /**
   * The most recent audit log entry for the attribute being edited.
   * When provided, a "Last modified by …" link is shown in the sheet header.
   */
  lastModifiedEntry?: AuditLogEntry | null;
  /** Opens the per-attribute audit log for the attribute being edited. */
  onViewHistory?: () => void;
  /**
   * When set, edit mode shows a destructive delete control at the bottom of the sheet
   * (custom, active attributes only — the sheet hides this for OOTB and already-deleted rows).
   */
  onRequestDelete?: () => void;
  /**
   * OOTB sections available for section assignment.
   * When provided, a section picker appears in the form so the user can
   * choose which section the attribute belongs to.
   */
  sections?: SchemaSection[];
}

type FormAction =
  | { type: "PATCH"; payload: Partial<AttributeFormState> }
  | { type: "RESET"; payload?: AttributeFormState };

function formReducer(
  state: AttributeFormState,
  action: FormAction,
): AttributeFormState {
  switch (action.type) {
    case "PATCH":
      return { ...state, ...action.payload };
    case "RESET":
      return action.payload ?? INITIAL_FORM_STATE;
    default:
      return state;
  }
}

/**
 * Side sheet for attribute creation (add) and editing.
 * Implements progressive disclosure:
 *   1. Type selector is shown first with the full grid.
 *   2. After a type is chosen, the grid collapses to a selected-type indicator
 *      and the configuration form expands below.
 *   In edit mode, the type selector is locked (types are immutable after save).
 *
 * Uses a plain MUI Drawer with header/content/footer layout to avoid
 * dependency on Atlas SideSheetPresets component tokens.
 */
export const AttributeFormSheet: FC<Props> = ({
  mode,
  editingAttribute,
  onSave,
  onClose,
  allowedTypes,
  existingAttributes = [],
  lastModifiedEntry,
  onViewHistory,
  onRequestDelete,
  sections = [],
}) => {
  const [form, dispatch] = useReducer(formReducer, INITIAL_FORM_STATE);

  const patch = useCallback((updates: Partial<AttributeFormState>) => {
    dispatch({ type: "PATCH", payload: updates });
  }, []);

  // Reset the form immediately before the close animation starts so that
  // transient warnings (e.g. overlap alert) don't flash during the slide-out.
  const handleClose = useCallback(() => {
    dispatch({ type: "RESET" });
    onClose();
  }, [onClose]);

  // Populate form when entering edit mode
  useEffect(() => {
    if (mode === "edit" && editingAttribute) {
      dispatch({
        type: "RESET",
        payload: {
          selectedType: editingAttribute.type,
          name: editingAttribute.name,
          description: editingAttribute.semanticDescription ?? "",
          options: editingAttribute.options ?? [],
          currencyCode: "USD",
          currencyMode: editingAttribute.currencyMode ?? "perAttribute",
          attachmentMode: editingAttribute.attachmentMode ?? "multiple",
          allowGroups: editingAttribute.allowGroups ?? false,
          sectionId: editingAttribute.sectionId ?? sections[0]?.id ?? "overview",
        },
      });
    } else if (mode === "create") {
      dispatch({ type: "RESET", payload: { ...INITIAL_FORM_STATE, sectionId: sections[0]?.id ?? "overview" } });
    }
  }, [mode, editingAttribute, sections]);

  const isValid = Boolean(
    form.selectedType &&
      form.name.trim() &&
      form.description.trim() &&
      (form.selectedType !== "singleSelect" && form.selectedType !== "multiSelect"
        ? true
        : form.options.length > 0),
  );

  const handleSave = () => {
    if (!isValid || !form.selectedType) return;

    const def: Omit<AttributeDefinition, "id"> & { id?: string } = {
      ...(editingAttribute ? { id: editingAttribute.id } : {}),
      name: form.name.trim(),
      type: form.selectedType,
      semanticDescription: form.description.trim(),
      isOotb: false,
      lifecycleStatus: "active",
      sectionId: form.sectionId || sections[0]?.id || "overview",
      ...(form.selectedType === "singleSelect" || form.selectedType === "multiSelect"
        ? { options: form.options }
        : {}),
      ...(form.selectedType === "currency"
        ? {
            currencyMode: form.currencyMode,
            ...(form.currencyMode === "perAttribute"
              ? { currencyCode: form.currencyCode }
              : {}),
          }
        : {}),
      ...(form.selectedType === "attachment"
        ? { attachmentMode: form.attachmentMode }
        : {}),
      ...(form.selectedType === "user" || form.selectedType === "users"
        ? { allowGroups: form.allowGroups }
        : {}),
    };

    onSave(def);
    onClose();
  };

  const title = mode === "edit" ? STR.form.editTitle : STR.form.addTitle;
  const showTypeCollapsed = Boolean(form.selectedType);
  const isEditMode = mode === "edit";
  const showDeleteSection = Boolean(
    isEditMode && editingAttribute && !editingAttribute.isOotb && onRequestDelete,
  );

  return (
    <Drawer
      anchor="right"
      open={mode !== null}
      onClose={handleClose}
      PaperProps={{
        role: "dialog",
        "aria-labelledby": "attr-sheet-title",
        "aria-modal": "true",
        sx: { width: { xs: "100%", sm: 480 }, display: "flex", flexDirection: "column" },
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
          <Typography id="attr-sheet-title" variant="h3" component="h2" fontWeight={600}>
            {title}
          </Typography>

          {/* Last modified — shown only in edit mode when audit data is available */}
          {isEditMode && lastModifiedEntry && onViewHistory && (
            <Link
              component="button"
              underline="always"
              onClick={onViewHistory}
              sx={{
                fontSize: "0.75rem",
                mt: 0.5,
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                cursor: "pointer",
              }}
            >
              <HistoryIcon aria-hidden sx={{ fontSize: "0.9rem" }} />
              {STR.auditLog.lastModifiedBy(lastModifiedEntry.actor, formatTimestamp(lastModifiedEntry.timestamp))}
            </Link>
          )}
        </Box>

        <IconButton
          onClick={handleClose}
          size="small"
          aria-label={`Close ${title}`}
          edge="end"
          sx={{ flexShrink: 0, mt: 0.25 }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* ── Scrollable content ── */}
      <Box sx={{ flex: 1, overflow: "auto", py: 2 }} aria-label="Attribute form">
        <Stack gap={3} sx={{ py: 1 }}>
          {/* Step 1 / collapsed type indicator */}
          <Box>
            <AttributeTypeSelector
              value={form.selectedType}
              onChange={(t) => patch({ selectedType: t })}
              collapsed={showTypeCollapsed}
              onChangeType={
                !isEditMode && showTypeCollapsed
                  ? () => patch({ selectedType: null })
                  : undefined
              }
              allowedTypes={allowedTypes}
            />
          </Box>

          {/* Hint before type selection */}
          {!form.selectedType && (
            <Typography
              variant="caption"
              sx={({ tokens }) => ({ color: tokens.semantic.color.type?.muted?.value ?? "text.secondary" })}
            >
              Select a type above to continue.
            </Typography>
          )}

          {/* Step 2: config form, revealed after type selection */}
          {form.selectedType && (
            <>
              <Divider />
              <AttributeFormFields
                form={form}
                onChange={patch}
                existingAttributes={existingAttributes}
                editingAttributeId={editingAttribute?.id}
                sections={sections}
              />
            </>
          )}

          {/* Delete stays in this sheet only (no row-level menu) — usability test assumption. */}
          {showDeleteSection && (
            <>
              <Divider />
              <Stack gap={1}>
                <Typography variant="subtitle2" fontWeight={600} color="error.main">
                  {STR.schemaManagement.deleteAttributeSheetSectionTitle}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {STR.schemaManagement.deleteAttributeSheetWarning}
                </Typography>
                <Box>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<TrashIcon />}
                    onClick={onRequestDelete}
                    aria-label={STR.schemaManagement.deleteAttributeSheetButton}
                    sx={({ tokens, palette }) => {
                      const d = tokens?.semantic?.color?.action?.destructive;
                      const fg = d?.default?.value ?? palette.error.main;
                      const border = d?.outline?.value ?? d?.default?.value ?? palette.error.main;
                      const hoverBorder =
                        d?.hover?.value ?? d?.pressed?.value ?? palette.error.dark;
                      const hoverBgFromTokens = d?.hoverFill?.value ?? d?.subtle?.value;
                      let hoverBg = hoverBgFromTokens;
                      if (!hoverBg) {
                        try {
                          hoverBg = alpha(
                            palette.error.main,
                            palette.mode === "dark" ? 0.16 : 0.08,
                          );
                        } catch {
                          hoverBg =
                            palette.mode === "dark"
                              ? "rgba(244, 67, 54, 0.16)"
                              : "rgba(211, 47, 47, 0.08)";
                        }
                      }
                      return {
                        borderColor: border,
                        color: fg,
                        "& .MuiButton-startIcon": { color: fg },
                        "&:hover": {
                          borderColor: hoverBorder,
                          backgroundColor: hoverBg,
                          color: fg,
                        },
                        "&:focus-visible": {
                          outline: `2px solid ${tokens?.semantic?.color?.ui?.focusRing?.value ?? palette.primary.main}`,
                          outlineOffset: 1,
                        },
                      };
                    }}
                  >
                    {STR.schemaManagement.deleteAttributeSheetButton}
                  </Button>
                </Box>
              </Stack>
            </>
          )}
        </Stack>
      </Box>

      {/* ── Footer ── */}
      <Box
        sx={({ tokens }) => ({
          display: "flex",
          justifyContent: "flex-end",
          gap: 1.5,
          py: 2,
          borderTop: "1px solid",
          borderColor: uiDividerDefaultBorderColor(tokens),
          flexShrink: 0,
        })}
      >
        <Button variant="outlined" onClick={handleClose}>
          {STR.form.cancel}
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={!isValid}>
          {STR.form.save}
        </Button>
      </Box>
    </Drawer>
  );
};
