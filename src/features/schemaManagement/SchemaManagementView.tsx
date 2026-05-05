import type { FC, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Link,
  MenuItem,
  OutlinedInput,
  Select,
  type SelectChangeEvent,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router";
import type { AttributeDefinition, AttributeType, ObjectSchema } from "../../types/attribute.js";
import type { AuditLogEntry } from "./types.js";
import { atlasToastAlertSurfaceSx } from "../../utils/atlasToastLayout.js";
import { STR, TYPE_LABELS } from "../../utils/i18n.js";
import { uiDividerDefaultBorderColor } from "../../utils/uiDividerBorder.js";
import { useSchemaManagement } from "./hooks/useSchemaManagement.js";
import { AttributeFormSheet } from "./components/AttributeFormSheet.js";
import { AuditLogDrawer } from "./components/AuditLogDrawer.js";
import { DeleteAttributeDialog } from "./components/DeleteAttributeDialog.js";
import { AttributeListRow } from "./components/AttributeListRow.js";
import { RecentlyDeletedAuditRow } from "./components/RecentlyDeletedAuditRow.js";
import {
  SectionEmptyDropZone,
  SectionSortableAttributes,
  SectionTailDropZone,
  SectionedReorderDndProvider,
  useSectionReorderCrossSectionHighlight,
} from "./components/SectionedReorderDnd.js";
import type { FormSheetMode } from "./types.js";
import {
  buildMergedSchemaSections,
  getCustomAttributesHydratedFromPersistence,
  persistFormPreviewCustomAttributes,
} from "../../pages/formPreviewShared.js";
import { collectRecentlyDeletedBySection } from "./utils/recentlyDeletedFromAudit.js";
import AddIcon from "@diligentcorp/atlas-react-bundle/icons/Add";
import ClearIcon from "@diligentcorp/atlas-react-bundle/icons/Clear";
import SwapVertIcon from "@diligentcorp/atlas-react-bundle/icons/SwapVert";

type FilterMode = "all" | "base" | "custom";

const ATTRIBUTE_TYPE_FILTER_ORDER: AttributeType[] = [
  "text",
  "longText",
  "number",
  "date",
  "dateTime",
  "boolean",
  "singleSelect",
  "multiSelect",
  "user",
  "users",
  "currency",
  "attachment",
  "url",
  "email",
  "phone",
];

interface Props {
  schema: ObjectSchema;
  initialCustomAttributes?: AttributeDefinition[];
  initialAuditEntries?: AuditLogEntry[];
  allowedTypes?: AttributeType[];
  showAttributeOrderTools?: boolean;
  /** Lets the host page wire a global "Change history" control to the same audit drawer opener. */
  onRegisterOpenGlobalAuditLog?: (open: () => void) => void;
  /** Publishes the timestamp of the most recent audit entry so the host page header can show it. */
  onLatestAuditTimestampChange?: (timestamp: string | null) => void;
}

function applyAttributeFilter(attrs: AttributeDefinition[], mode: FilterMode): AttributeDefinition[] {
  if (mode === "all") return attrs;
  if (mode === "base") return attrs.filter((a) => a.isOotb === true);
  return attrs.filter((a) => a.isOotb !== true);
}

function hideDeprecatedRows(attrs: AttributeDefinition[], showDeprecated: boolean): AttributeDefinition[] {
  if (showDeprecated) return attrs;
  return attrs.filter((a) => a.lifecycleStatus !== "deprecated");
}

function applySearchAndTypeFilter(
  attrs: AttributeDefinition[],
  search: string,
  selectedTypes: AttributeType[],
  allTypesInFilter: readonly AttributeType[],
): AttributeDefinition[] {
  let out = attrs;
  const q = search.trim().toLowerCase();
  if (q) {
    out = out.filter((a) => {
      const nameMatch = a.name.toLowerCase().includes(q);
      const desc = (a.semanticDescription ?? "").toLowerCase();
      return nameMatch || desc.includes(q);
    });
  }
  const allCount = allTypesInFilter.length;
  const typeFilterActive =
    selectedTypes.length > 0 && selectedTypes.length < allCount;
  if (typeFilterActive) {
    const set = new Set(selectedTypes);
    out = out.filter((a) => set.has(a.type));
  }
  return out;
}

function splitOotbAndCustomInOrder(rows: AttributeDefinition[]): {
  ootb: AttributeDefinition[];
  custom: AttributeDefinition[];
} {
  const ootb: AttributeDefinition[] = [];
  const custom: AttributeDefinition[] = [];
  for (const a of rows) {
    if (a.isOotb === true) ootb.push(a);
    else custom.push(a);
  }
  return { ootb, custom };
}

/**
 * Dashed custom-attributes reorder region.
 * For sections with at least one custom attribute, highlights the whole region when a dragged row
 * hovers from another section. For empty sections, leaves the highlight to the inner
 * `SectionEmptyDropZone` so the visible drop target matches the actual droppable area.
 */
const ReorderCustomAttributesSurface: FC<{
  sectionId: string;
  emptyList: boolean;
  children: ReactNode;
}> = ({ sectionId, emptyList, children }) => {
  const crossSectionHighlight = useSectionReorderCrossSectionHighlight(sectionId);
  const surfaceHighlight = crossSectionHighlight && !emptyList;
  return (
    <Box
      sx={({ tokens, palette }) => {
        const accentBorder =
          tokens.semantic.color.type?.primary?.value ?? tokens.semantic.color.border?.accent?.value ?? palette.primary.main;
        const focusRing = tokens.semantic.color.ui?.focusRing?.value ?? accentBorder;
        return {
          width: 1,
          boxSizing: "border-box",
          mx: 0,
          mb: 0,
          p: emptyList ? 3 : 2,
          border: "1px dashed",
          borderColor: surfaceHighlight ? accentBorder : uiDividerDefaultBorderColor(tokens),
          borderRadius: 1,
          overflow: "visible",
          // Avoid MUI `alpha(palette.primary.*)` here: Atlas themes often use CSS variables, which `alpha` cannot parse.
          bgcolor: surfaceHighlight
            ? tokens.semantic.color.surface?.subtle?.value ?? "action.selected"
            : "transparent",
          boxShadow: surfaceHighlight ? `0 0 0 2px ${focusRing}` : "none",
          transition: "border-color 120ms ease, background-color 120ms ease, box-shadow 120ms ease",
        };
      }}
    >
      {children}
    </Box>
  );
};

/**
 * The full M1 schema management surface.
 */
export const SchemaManagementView: FC<Props> = ({
  schema,
  initialCustomAttributes = [],
  initialAuditEntries = [],
  allowedTypes,
  showAttributeOrderTools = false,
  onRegisterOpenGlobalAuditLog,
  onLatestAuditTimestampChange,
}) => {
  const hydratedInitial = useMemo(
    () => getCustomAttributesHydratedFromPersistence(structuredClone(initialCustomAttributes), schema),
    [schema, initialCustomAttributes],
  );

  const {
    customAttributes,
    auditLog,
    toast,
    hideToast,
    addAttribute,
    updateAttribute,
    deleteAttribute,
    replaceCustomAttributes,
  } = useSchemaManagement(hydratedInitial, initialAuditEntries);

  const [sheetMode, setSheetMode] = useState<FormSheetMode>(null);
  const [editingAttribute, setEditingAttribute] = useState<AttributeDefinition | null>(null);
  const [deletingAttribute, setDeletingAttribute] = useState<AttributeDefinition | null>(null);

  const [auditLogOpen, setAuditLogOpen] = useState(false);
  const [auditLogAttributeId, setAuditLogAttributeId] = useState<string | null>(null);

  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilters, setSelectedTypeFilters] = useState<AttributeType[]>([]);

  const [recentlyDeletedExpandedBySection, setRecentlyDeletedExpandedBySection] = useState<Record<string, boolean>>(
    {},
  );

  const [inlineReorderActive, setInlineReorderActive] = useState(false);
  const [reorderDraft, setReorderDraft] = useState<AttributeDefinition[]>(() => structuredClone(hydratedInitial));
  const [reorderToastOpen, setReorderToastOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!showAttributeOrderTools) return;
    const st = location.state as { openAttributeReorder?: boolean } | null | undefined;
    if (st?.openAttributeReorder) {
      setInlineReorderActive(true);
      setReorderDraft(structuredClone(customAttributes));
      navigate(
        { pathname: location.pathname, search: location.search, hash: location.hash },
        { replace: true, state: {} },
      );
    }
  }, [location, navigate, showAttributeOrderTools, customAttributes]);

  const customSource = inlineReorderActive ? reorderDraft : customAttributes;

  const mergedSections = useMemo(
    () => buildMergedSchemaSections(schema, customSource),
    [schema, customSource],
  );

  const sectionIdsForAudit = useMemo(() => mergedSections.map((s) => s.id), [mergedSections]);

  const recentlyDeletedBySection = useMemo(
    () => collectRecentlyDeletedBySection(auditLog, customAttributes, sectionIdsForAudit),
    [auditLog, customAttributes, sectionIdsForAudit],
  );

  const openGlobalAuditLog = useCallback(() => {
    setAuditLogAttributeId(null);
    setAuditLogOpen(true);
  }, []);

  useEffect(() => {
    if (!onRegisterOpenGlobalAuditLog) return;
    onRegisterOpenGlobalAuditLog(openGlobalAuditLog);
    return () => {
      onRegisterOpenGlobalAuditLog(() => {});
    };
  }, [onRegisterOpenGlobalAuditLog, openGlobalAuditLog]);

  useEffect(() => {
    if (!onLatestAuditTimestampChange) return;
    const latest = auditLog.length > 0 ? auditLog[auditLog.length - 1].timestamp : null;
    onLatestAuditTimestampChange(latest);
  }, [auditLog, onLatestAuditTimestampChange]);

  const openAttributeAuditLog = useCallback((attributeId: string, _attributeName?: string) => {
    setAuditLogAttributeId(attributeId);
    setAuditLogOpen(true);
  }, []);

  const closeAuditLog = useCallback(() => {
    setAuditLogOpen(false);
  }, []);

  const handleAdd = useCallback(() => {
    setEditingAttribute(null);
    setSheetMode("create");
  }, []);

  const handleEdit = useCallback((attr: AttributeDefinition) => {
    setEditingAttribute(attr);
    setSheetMode("edit");
  }, []);

  const handleSheetClose = useCallback(() => {
    setSheetMode(null);
    setEditingAttribute(null);
  }, []);

  const handleSave = useCallback(
    (def: Omit<AttributeDefinition, "id"> & { id?: string }) => {
      if (def.id) {
        const oldAttr = customAttributes.find((a) => a.id === def.id);
        updateAttribute(def.id, def, oldAttr);
      } else {
        addAttribute(def);
      }
    },
    [addAttribute, updateAttribute, customAttributes],
  );

  const handleRequestDelete = useCallback(() => {
    const attr = editingAttribute;
    if (!attr || attr.isOotb) return;
    setDeletingAttribute(attr);
  }, [editingAttribute]);

  const handleDeleteConfirm = useCallback(
    (id: string, reason?: string) => {
      const attr = deletingAttribute ?? customAttributes.find((a) => a.id === id);
      if (attr) deleteAttribute(attr, reason);
      handleSheetClose();
    },
    [deleteAttribute, deletingAttribute, customAttributes, handleSheetClose],
  );

  const handleViewHistory = useCallback(
    (attr: AttributeDefinition) => {
      openAttributeAuditLog(attr.id);
    },
    [openAttributeAuditLog],
  );

  const handleReorderSave = useCallback(() => {
    replaceCustomAttributes(structuredClone(reorderDraft));
    persistFormPreviewCustomAttributes(reorderDraft, schema);
    setInlineReorderActive(false);
    setReorderToastOpen(true);
  }, [replaceCustomAttributes, reorderDraft, schema]);

  const handleReorderCancel = useCallback(() => {
    setInlineReorderActive(false);
    setReorderDraft(structuredClone(customAttributes));
  }, [customAttributes]);

  const beginInlineReorder = useCallback(() => {
    setReorderDraft(structuredClone(customAttributes));
    setSearchQuery("");
    setSelectedTypeFilters([]);
    setFilterMode("custom");
    setInlineReorderActive(true);
  }, [customAttributes]);

  const replaceReorderDraft = useCallback((next: AttributeDefinition[]) => {
    setReorderDraft(structuredClone(next));
  }, []);

  const sections = schema.sections ?? [];

  const auditLogAttributeName = useMemo(() => {
    if (!auditLogAttributeId) return null;
    const fromList = [...customAttributes, ...schema.attributes].find((a) => a.id === auditLogAttributeId);
    if (fromList) return fromList.name;
    const fromAudit = [...auditLog].reverse().find((e) => e.attributeId === auditLogAttributeId);
    return fromAudit?.attributeName ?? null;
  }, [auditLogAttributeId, auditLog, customAttributes, schema.attributes]);

  const editingLastModified = editingAttribute
    ? [...auditLog].reverse().find((e) => e.attributeId === editingAttribute.id) ?? null
    : null;

  const addDisabled = inlineReorderActive;

  const { visibleAttributesCount, totalAttributesCount } = useMemo(() => {
    let visible = 0;
    let total = 0;
    for (const section of mergedSections) {
      total += section.attributes.length;
      const originFiltered = applyAttributeFilter(section.attributes, filterMode);
      const searchTypeFiltered = showAttributeOrderTools
        ? applySearchAndTypeFilter(originFiltered, searchQuery, selectedTypeFilters, ATTRIBUTE_TYPE_FILTER_ORDER)
        : originFiltered;
      const showDep = recentlyDeletedExpandedBySection[section.id] === true;
      visible += hideDeprecatedRows(searchTypeFiltered, showDep).length;
    }
    return { visibleAttributesCount: visible, totalAttributesCount: total };
  }, [
    mergedSections,
    filterMode,
    searchQuery,
    selectedTypeFilters,
    showAttributeOrderTools,
    recentlyDeletedExpandedBySection,
  ]);

  return (
    <Stack gap={3}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ md: "flex-start" }}
        justifyContent="space-between"
        gap={2}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography component="h2" variant="h4" sx={{ fontWeight: 600 }}>
            {STR.schemaManagement.attributesSectionTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {STR.schemaManagement.showingAttributesCount(visibleAttributesCount, totalAttributesCount)}
          </Typography>
        </Box>

        <Stack direction="row" gap={1} flexShrink={0} flexWrap="wrap" alignItems="center" justifyContent={{ xs: "flex-start", md: "flex-end" }}>
          {/* Preview-in-host link removed in Vision: form-preview exploration lives in the lab prototype. */}
          {showAttributeOrderTools && (
            <Button
              type="button"
              variant="outlined"
              color="primary"
              onClick={beginInlineReorder}
              disabled={inlineReorderActive}
              aria-pressed={inlineReorderActive}
              startIcon={<SwapVertIcon aria-hidden />}
              sx={inlineReorderActive ? { bgcolor: "action.selected" } : undefined}
            >
              {STR.schemaManagement.reorderAttributes}
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<AddIcon aria-hidden />}
            onClick={handleAdd}
            disabled={addDisabled}
            aria-label={STR.schemaManagement.addCustomAttribute}
          >
            {STR.schemaManagement.addCustomAttribute}
          </Button>
        </Stack>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} gap={2} alignItems={{ sm: "center" }}>
        {showAttributeOrderTools && !inlineReorderActive && (
          <TextField
            size="small"
            label={STR.schemaManagement.searchAttributesLabel}
            placeholder={STR.schemaManagement.searchAttributesPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 1, minWidth: { xs: "100%", sm: 220 } }}
          />
        )}
        {showAttributeOrderTools && !inlineReorderActive && (
          <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 220 } }}>
            <InputLabel id="schema-mgmt-type-filter-label">{STR.schemaManagement.filterByTypeLabel}</InputLabel>
            <Select<AttributeType[]>
              labelId="schema-mgmt-type-filter-label"
              id="schema-mgmt-type-filter"
              label={STR.schemaManagement.filterByTypeLabel}
              multiple
              value={selectedTypeFilters}
              onChange={(e: SelectChangeEvent<typeof selectedTypeFilters>) => {
                const v = e.target.value;
                setSelectedTypeFilters(typeof v === "string" ? (v.split(",") as AttributeType[]) : [...v]);
              }}
              input={
                <OutlinedInput
                  label={STR.schemaManagement.filterByTypeLabel}
                  endAdornment={
                    selectedTypeFilters.length > 0 &&
                    selectedTypeFilters.length < ATTRIBUTE_TYPE_FILTER_ORDER.length ? (
                      <InputAdornment
                        position="end"
                        sx={(theme) => ({
                          maxHeight: 32,
                          marginInlineEnd: `calc(${theme.spacing(3)} + 4px)`,
                        })}
                      >
                        <IconButton
                          size="small"
                          edge="end"
                          aria-label={STR.schemaManagement.clearTypeFilterAria}
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTypeFilters([]);
                          }}
                        >
                          <ClearIcon aria-hidden size="md" />
                        </IconButton>
                      </InputAdornment>
                    ) : undefined
                  }
                />
              }
              renderValue={(selected) => {
                const sel = selected as AttributeType[];
                if (sel.length === 0 || sel.length === ATTRIBUTE_TYPE_FILTER_ORDER.length) {
                  return STR.schemaManagement.typeFilterAll;
                }
                return STR.schemaManagement.typeFilterSelectedCount(sel.length);
              }}
              MenuProps={{ PaperProps: { sx: { maxHeight: 360 } } }}
            >
              {ATTRIBUTE_TYPE_FILTER_ORDER.map((t) => (
                <MenuItem key={t} value={t}>
                  <Checkbox checked={selectedTypeFilters.includes(t)} size="small" sx={{ mr: 0.5, py: 0 }} />
                  {TYPE_LABELS[t]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 200 } }}>
          <InputLabel id="schema-mgmt-origin-filter-label">{STR.schemaManagement.originLabel}</InputLabel>
          <Select<FilterMode>
            labelId="schema-mgmt-origin-filter-label"
            label={STR.schemaManagement.originLabel}
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as FilterMode)}
          >
            <MenuItem value="all">{STR.schemaManagement.originAllLabel}</MenuItem>
            <MenuItem value="base">{STR.schemaManagement.filterBase}</MenuItem>
            <MenuItem value="custom">{STR.schemaManagement.filterCustom}</MenuItem>
          </Select>
        </FormControl>
        {showAttributeOrderTools && inlineReorderActive && (
          <Stack direction="row" gap={1.5} sx={{ marginLeft: "auto", flexShrink: 0 }}>
            <Button type="button" variant="outlined" color="primary" onClick={handleReorderCancel}>
              {STR.form.cancel}
            </Button>
            <Button type="button" variant="contained" color="primary" onClick={handleReorderSave}>
              {STR.schemaManagement.saveAttributeOrder}
            </Button>
          </Stack>
        )}
      </Stack>

      {inlineReorderActive && showAttributeOrderTools && (
        <Alert severity="info">
          <Typography variant="body2">{STR.schemaManagement.reorderModeActiveHint}</Typography>
        </Alert>
      )}

      <SectionedReorderDndProvider
        draft={reorderDraft}
        setDraft={replaceReorderDraft}
        schema={schema}
        enabled={inlineReorderActive && showAttributeOrderTools}
      >
      <Stack gap={3} sx={{ width: 1 }}>
        {mergedSections.map((section) => {
          const originFiltered = applyAttributeFilter(section.attributes, filterMode);
          const searchTypeFiltered = showAttributeOrderTools
            ? applySearchAndTypeFilter(originFiltered, searchQuery, selectedTypeFilters, ATTRIBUTE_TYPE_FILTER_ORDER)
            : originFiltered;
          const showDep = recentlyDeletedExpandedBySection[section.id] === true;
          const visibleRows = hideDeprecatedRows(searchTypeFiltered, showDep);
          const { ootb: ootbRows, custom: customRows } = splitOotbAndCustomInOrder(visibleRows);
          const deletedEntries = recentlyDeletedBySection[section.id] ?? [];
          const deletedCount = deletedEntries.length;
          const showCustomHeading = customRows.length > 0;
          const reorderActive = inlineReorderActive && showAttributeOrderTools;

          return (
            <Box key={section.id}>
              <Typography component="h3" variant="h5" sx={{ fontWeight: 600, mb: 1, px: 2 }}>
                {section.title}
              </Typography>
              <Box sx={{ overflow: reorderActive ? "visible" : "hidden" }}>
                {visibleRows.length === 0 && !reorderActive ? (
                  <Typography
                    variant="body2"
                    sx={({ tokens }) => ({
                      px: 2,
                      py: 3,
                      color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
                    })}
                  >
                    {STR.schemaManagement.sectionEmptyForFilter}
                  </Typography>
                ) : (
                  <Box sx={{ overflow: "hidden" }}>
                    {ootbRows.map((attr, index) => (
                      <Box
                        key={attr.id}
                        sx={({ tokens }) =>
                          index < ootbRows.length - 1 ||
                          (index === ootbRows.length - 1 &&
                            !reorderActive &&
                            showCustomHeading &&
                            customRows.length > 0)
                            ? {
                                borderBottom: "1px solid",
                                borderColor: uiDividerDefaultBorderColor(tokens),
                              }
                            : undefined
                        }
                      >
                        <AttributeListRow
                          attribute={attr}
                          readonly
                          suppressRowActions={inlineReorderActive && showAttributeOrderTools}
                          flatBottom={reorderActive && index === ootbRows.length - 1}
                        />
                      </Box>
                    ))}

                    {showCustomHeading && !reorderActive && (
                      <Box sx={{ px: 2, pt: ootbRows.length > 0 ? 2 : 0, pb: 1 }}>
                        <Typography
                          variant="subtitle2"
                          component="h3"
                          sx={({ tokens }) => ({
                            fontWeight: 600,
                            color: tokens.semantic.color.type?.default?.value ?? "text.primary",
                          })}
                        >
                          {STR.schemaManagement.customSectionTitle}
                        </Typography>
                      </Box>
                    )}

                    {reorderActive ? (
                      <ReorderCustomAttributesSurface
                        sectionId={section.id}
                        emptyList={customRows.length === 0}
                      >
                        <Typography
                          variant="subtitle2"
                          component="h3"
                          sx={({ tokens }) => ({
                            fontWeight: 600,
                            color: tokens.semantic.color.type?.default?.value ?? "text.primary",
                            mb: customRows.length > 0 ? 1.5 : 1,
                          })}
                        >
                          {STR.schemaManagement.customSectionTitle}
                        </Typography>
                        {customRows.length > 0 ? (
                          <>
                            <SectionSortableAttributes
                              sectionId={section.id}
                              attributes={customRows}
                              withRowDividers
                            />
                            <SectionTailDropZone sectionId={section.id} />
                          </>
                        ) : (
                          <SectionEmptyDropZone
                            sectionId={section.id}
                            label={STR.schemaManagement.reorderEmptySectionDropHint}
                          />
                        )}
                      </ReorderCustomAttributesSurface>
                    ) : (
                      customRows.map((attr, index) => (
                        <Box
                          key={attr.id}
                          sx={({ tokens }) =>
                            index < customRows.length - 1
                              ? {
                                  borderBottom: "1px solid",
                                  borderColor: uiDividerDefaultBorderColor(tokens),
                                }
                              : undefined
                          }
                        >
                          <AttributeListRow
                            attribute={attr}
                            readonly={false}
                            onEdit={handleEdit}
                            onViewHistory={handleViewHistory}
                          />
                        </Box>
                      ))
                    )}
                  </Box>
                )}

                {deletedCount > 0 && (
                  <Box
                    sx={({ tokens }) => ({
                      px: 1.5,
                      py: 1,
                      borderTop: "1px solid",
                      borderColor: uiDividerDefaultBorderColor(tokens),
                    })}
                  >
                    <Link
                      component="button"
                      type="button"
                      variant="body2"
                      underline="always"
                      onClick={() =>
                        setRecentlyDeletedExpandedBySection((prev) => ({
                          ...prev,
                          [section.id]: !showDep,
                        }))
                      }
                      sx={({ tokens }) => ({
                        color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
                        cursor: "pointer",
                      })}
                    >
                      {showDep
                        ? STR.schemaManagement.hideRecentlyDeleted
                        : STR.schemaManagement.showRecentlyDeleted(deletedCount)}
                    </Link>
                    {showDep && (
                      <Typography
                        variant="caption"
                        component="p"
                        sx={({ tokens }) => ({
                          display: "block",
                          mt: 0.5,
                          color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
                        })}
                      >
                        {STR.schemaManagement.recentlyDeletedRetentionCaption}
                      </Typography>
                    )}
                    {showDep && (
                      <Box
                        sx={({ tokens }) => ({
                          mt: 1,
                          borderRadius: 1,
                          overflow: "hidden",
                          border: "1px solid",
                          borderColor: uiDividerDefaultBorderColor(tokens),
                        })}
                      >
                        {deletedEntries.map((entry, i) => (
                          <Box
                            key={entry.id}
                            sx={({ tokens }) =>
                              i < deletedEntries.length - 1
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
            </Box>
          );
        })}
      </Stack>
      </SectionedReorderDndProvider>

      <AttributeFormSheet
        mode={sheetMode}
        editingAttribute={editingAttribute}
        onSave={handleSave}
        onClose={handleSheetClose}
        allowedTypes={allowedTypes}
        existingAttributes={customAttributes}
        lastModifiedEntry={editingLastModified}
        onViewHistory={
          editingAttribute ? () => openAttributeAuditLog(editingAttribute.id) : undefined
        }
        onRequestDelete={handleRequestDelete}
        sections={sections}
      />

      <DeleteAttributeDialog
        attribute={deletingAttribute}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingAttribute(null)}
      />

      <AuditLogDrawer
        open={auditLogOpen}
        entries={auditLog}
        attributeId={auditLogAttributeId}
        attributeName={auditLogAttributeName}
        onClose={closeAuditLog}
        onViewFullLog={openGlobalAuditLog}
        onSelectAttribute={openAttributeAuditLog}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={toast.severity === "error" ? null : 5000}
        onClose={hideToast}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ top: "88px !important", right: "24px !important" }}
      >
        <Alert severity={toast.severity} aria-live="polite" onClose={hideToast} sx={atlasToastAlertSurfaceSx}>
          {toast.message}
          {toast.attributeId && (
            <>
              {" "}
              <Link
                component="button"
                underline="always"
                onClick={() => {
                  openAttributeAuditLog(toast.attributeId!);
                  hideToast();
                }}
                sx={{ verticalAlign: "baseline", cursor: "pointer" }}
              >
                {STR.auditLog.viewHistory}
              </Link>
            </>
          )}
        </Alert>
      </Snackbar>

      <Snackbar
        open={reorderToastOpen}
        autoHideDuration={5000}
        onClose={() => setReorderToastOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ top: "88px !important", right: "24px !important" }}
      >
        <Alert severity="success" aria-live="polite" onClose={() => setReorderToastOpen(false)} sx={atlasToastAlertSurfaceSx}>
          {STR.formPreview.formUpdatedToast}
        </Alert>
      </Snackbar>
    </Stack>
  );
};
