import type { FC } from "react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { visuallyHidden } from "@mui/utils";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  Link as MuiLink,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandDownIcon from "@diligentcorp/atlas-react-bundle/icons/ExpandDown";
import AddIcon from "@diligentcorp/atlas-react-bundle/icons/Add";
import TrashIcon from "@diligentcorp/atlas-react-bundle/icons/Trash";
import ArrowLeftIcon from "@diligentcorp/atlas-react-bundle/icons/ArrowLeft";
import InfoIcon from "@diligentcorp/atlas-react-bundle/icons/Info";
import { Link as RouterLink, useNavigate } from "react-router";
import type {
  ConditionClause,
  PermissionLevel,
  PermissionSection,
  RoleEditModel,
  RoleRuleDraft,
} from "./types.js";
import { STR } from "../../utils/i18n.js";
import {
  sxPageTitleH1BillboardEmphasis,
  sxRuleCardTitleH3Emphasis,
  sxSectionTitleH2DisplayEmphasis,
} from "../../utils/atlasTitleTypographySx.js";
import { uiDividerDefaultBorderColor } from "../../utils/uiDividerBorder.js";
import {
  applyColumnSnapshot,
  applyLevelToAll,
  countLevels,
  getSectionAttributeCount,
  getSectionItems,
  getUniformLevel,
  snapshotColumns,
} from "./permissionSectionLogic.js";
import { createRoleRuleDraft, findOotbRoleIdInApplication } from "./sampleData.js";
import {
  hasPersistedPrototypeRole,
  putPersistedPrototypeRole,
} from "./prototypePersistedRolesStore.js";
import { PermissionLevelPick } from "./PermissionLevelPick.js";
import { SectionPermissionModePick } from "./SectionPermissionModePick.js";
import type { SectionPermissionMode } from "./types.js";

interface Props {
  initialModel: RoleEditModel;
}

function deepClone<T>(v: T): T {
  try {
    return structuredClone(v);
  } catch {
    return JSON.parse(JSON.stringify(v)) as T;
  }
}

function objectTypeLabel(objectType: string): string {
  if (objectType === "control") return STR.roleAccess.objectControl;
  if (objectType === "risk") return STR.roleAccess.objectRisk;
  return objectType;
}

function conditionValueLabel(value: string, fieldType: string): string {
  if (fieldType === "status" && value === "in_progress") {
    return STR.roleAccess.conditionValueInProgress;
  }
  if (value === "moderate") return STR.roleAccess.conditionValueModerate;
  return value;
}

function conditionFieldLabel(c: ConditionClause): string {
  if (c.fieldType === "status") return STR.roleAccess.conditionFieldStatus;
  if (c.fieldType === "attribute") {
    if (c.fieldName === "impact" || c.fieldName == null) {
      return STR.roleAccess.conditionFieldNameImpact;
    }
  }
  return STR.roleAccess.conditionFieldAttribute;
}

function conditionSummaryChip(c: ConditionClause): string {
  const field = conditionFieldLabel(c);
  const value = conditionValueLabel(c.value, c.fieldType);
  return STR.roleAccess.conditionChipIs(field, value);
}

function sectionIsReadable(section: PermissionSection): boolean {
  if (getSectionAttributeCount(section) === 0) return false;
  if (!section.useCustom) return section.summaryLevel !== "none";
  return getSectionItems(section).every((i) => i.level !== "none");
}

function sectionIsFullyEditable(section: PermissionSection): boolean {
  if (getSectionAttributeCount(section) === 0) return false;
  if (!section.useCustom) return section.summaryLevel === "edit";
  return getSectionItems(section).every((i) => i.level === "edit");
}

function permissionSummaryLines(rule: RoleRuleDraft): string[] {
  const totalSections = rule.sections.length;
  let readableSections = 0;
  let editableSections = 0;
  for (const s of rule.sections) {
    if (sectionIsReadable(s)) readableSections += 1;
    if (sectionIsFullyEditable(s)) editableSections += 1;
  }
  let totalAttrs = 0;
  let readableAttrs = 0;
  let editableAttrs = 0;
  for (const s of rule.sections) {
    for (const i of getSectionItems(s)) {
      totalAttrs += 1;
      if (i.level !== "none") readableAttrs += 1;
      if (i.level === "edit") editableAttrs += 1;
    }
  }
  const lines: string[] = [];
  if (totalSections === 0) {
    lines.push(STR.roleAccess.canReadSomeSections(0, 0));
    lines.push(STR.roleAccess.canEditSections(0));
  } else if (readableSections === totalSections) {
    lines.push(STR.roleAccess.canReadAllSections(totalSections));
  } else {
    lines.push(STR.roleAccess.canReadSomeSections(readableSections, totalSections));
  }
  lines.push(STR.roleAccess.canEditSections(editableSections));
  if (totalAttrs === 0) {
    lines.push(STR.roleAccess.canReadAllAttributes(0));
    lines.push(STR.roleAccess.canEditAttributes(0));
  } else if (readableAttrs === totalAttrs) {
    lines.push(STR.roleAccess.canReadAllAttributes(totalAttrs));
    lines.push(STR.roleAccess.canEditAttributes(editableAttrs));
  } else {
    lines.push(STR.roleAccess.canReadSomeAttributes(readableAttrs, totalAttrs));
    lines.push(STR.roleAccess.canEditAttributes(editableAttrs));
  }
  return lines;
}

function actionSummaryChips(rule: RoleRuleDraft): string[] {
  const chips: string[] = [];
  if (rule.actionListView) chips.push(STR.roleAccess.actionListView);
  if (rule.actionNextStatus) chips.push(STR.roleAccess.actionNextStatus);
  return chips;
}

function SummaryChipRow({ label, chips }: { label: string; chips: string[] }) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} gap={{ xs: 1, sm: 2 }} alignItems={{ sm: "center" }}>
      <Typography variant="body1" fontWeight={600} sx={{ minWidth: { sm: 100 }, flexShrink: 0 }}>
        {label}
      </Typography>
      <Stack direction="row" gap={1} flexWrap="wrap" sx={{ minWidth: 0 }}>
        {chips.map((text, i) => (
          <Chip key={`${text}-${i}`} size="small" variant="outlined" label={text} />
        ))}
      </Stack>
    </Stack>
  );
}

function ConditionsBlock({
  conditions,
  onChange,
}: {
  conditions: ConditionClause[];
  onChange: (next: ConditionClause[]) => void;
}) {
  const update = (id: string, patch: Partial<ConditionClause>) => {
    onChange(conditions.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };
  const remove = (id: string) => {
    onChange(conditions.filter((c) => c.id !== id));
  };
  const add = () => {
    onChange([
      ...conditions,
      {
        id: `cond-${Date.now()}`,
        fieldType: "status",
        operator: "is",
        value: "in_progress",
      },
    ]);
  };

  return (
    <Paper
      variant="outlined"
      sx={({ tokens }) => ({
        p: 3,
        borderRadius: 1.5,
        bgcolor: tokens.semantic.color.surface?.variant?.value ?? "action.hover",
      })}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="body1" fontWeight={600}>
            {STR.roleAccess.whenConditionsTitle}
          </Typography>
          <Typography variant="caption" sx={({ tokens }) => ({ color: tokens.semantic.color.type?.muted?.value ?? "text.secondary" })}>
            {STR.roleAccess.whenConditionsHint}
          </Typography>
        </Box>
        <Button size="medium" variant="outlined" startIcon={<AddIcon slot="icon" />} onClick={add}>
          {STR.roleAccess.addCondition}
        </Button>
      </Stack>

      <Stack gap={3}>
        {conditions.map((c, index) => (
          <Box key={c.id}>
            {index > 0 && (
              <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
                <Divider sx={{ flex: 1 }} />
                <Typography variant="caption" fontWeight={600}>
                  {STR.roleAccess.conditionAnd}
                </Typography>
                <Divider sx={{ flex: 1 }} />
              </Stack>
            )}
            <Stack direction={{ xs: "column", lg: "row" }} gap={2} alignItems={{ lg: "flex-end" }}>
              <FormControl fullWidth sx={{ flex: 1 }}>
                <InputLabel>{STR.roleAccess.conditionColField}</InputLabel>
                <Select
                  label={STR.roleAccess.conditionColField}
                  value={c.fieldType}
                  onChange={(e) => update(c.id, { fieldType: String(e.target.value) })}
                >
                  <MenuItem value="status">{STR.roleAccess.conditionFieldStatus}</MenuItem>
                  <MenuItem value="attribute">{STR.roleAccess.conditionFieldAttribute}</MenuItem>
                </Select>
              </FormControl>
              {c.fieldType === "attribute" && (
                <FormControl fullWidth sx={{ flex: 1 }}>
                  <InputLabel>{STR.roleAccess.conditionColFieldName}</InputLabel>
                  <Select
                    label={STR.roleAccess.conditionColFieldName}
                    value={c.fieldName ?? "impact"}
                    onChange={(e) => update(c.id, { fieldName: String(e.target.value) })}
                  >
                    <MenuItem value="impact">{STR.roleAccess.conditionFieldNameImpact}</MenuItem>
                  </Select>
                </FormControl>
              )}
              <FormControl fullWidth sx={{ flex: 1 }}>
                <InputLabel>{STR.roleAccess.conditionColOperator}</InputLabel>
                <Select
                  label={STR.roleAccess.conditionColOperator}
                  value={c.operator}
                  onChange={(e) => update(c.id, { operator: String(e.target.value) })}
                >
                  <MenuItem value="is">{STR.roleAccess.conditionOpIs}</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ flex: 1 }}>
                <InputLabel>{STR.roleAccess.conditionColValue}</InputLabel>
                <Select
                  label={STR.roleAccess.conditionColValue}
                  value={c.value}
                  onChange={(e) => update(c.id, { value: String(e.target.value) })}
                >
                  {c.fieldType === "status" ? (
                    <MenuItem value="in_progress">{STR.roleAccess.conditionValueInProgress}</MenuItem>
                  ) : (
                    <MenuItem value="moderate">{STR.roleAccess.conditionValueModerate}</MenuItem>
                  )}
                </Select>
              </FormControl>
              <Button
                color="inherit"
                sx={{ alignSelf: { xs: "flex-end", lg: "center" }, minWidth: 40 }}
                onClick={() => remove(c.id)}
                aria-label={STR.roleAccess.removeCondition}
              >
                <TrashIcon slot="icon" />
              </Button>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}

function permissionLevelLabel(level: PermissionLevel): string {
  if (level === "none") return STR.roleAccess.levelNone;
  if (level === "view") return STR.roleAccess.levelView;
  return STR.roleAccess.levelEdit;
}

function sectionModeHeaderText(section: PermissionSection): string {
  if (section.useCustom) {
    const c = countLevels(section);
    return STR.roleAccess.sectionCustomSummary(c.none, c.view, c.edit);
  }
  return permissionLevelLabel(section.summaryLevel);
}

/** Custom section attributes: single column below this width (verbose locales); two columns from here up. */
const SECTION_CUSTOM_TWO_COLUMN_UP_PX = 1200;

function PermissionSectionsBlock({
  sections,
  onChange,
}: {
  sections: PermissionSection[];
  onChange: (next: PermissionSection[]) => void;
}) {
  const [liveMessage, setLiveMessage] = useState("");

  const announce = useCallback((msg: string) => {
    setLiveMessage("");
    queueMicrotask(() => setLiveMessage(msg));
  }, []);

  useEffect(() => {
    if (!liveMessage) return undefined;
    const id = window.setTimeout(() => setLiveMessage(""), 4000);
    return () => window.clearTimeout(id);
  }, [liveMessage]);

  const replaceSection = (sectionId: string, next: PermissionSection) => {
    onChange(sections.map((s) => (s.id === sectionId ? next : s)));
  };

  const handleGroupLevel = (section: PermissionSection, level: PermissionLevel) => {
    if (getSectionAttributeCount(section) === 0) return;
    // Leaving Custom via the section control: persist current columns so re-selecting Custom restores work.
    const lastCustomSnapshot = section.useCustom ? snapshotColumns(section) : section.lastCustomSnapshot;
    const applied = applyLevelToAll(section, level);
    replaceSection(section.id, {
      ...applied,
      summaryLevel: level,
      lastGroupLevel: level,
      useCustom: false,
      lastCustomSnapshot,
    });
    announce(STR.roleAccess.permissionGroupModeAnnounce(section.title, permissionLevelLabel(level)));
  };

  const handleCustomToggle = (section: PermissionSection, on: boolean) => {
    if (getSectionAttributeCount(section) === 0) return;
    if (on) {
      const withColumns =
        section.lastCustomSnapshot != null
          ? applyColumnSnapshot(section, section.lastCustomSnapshot)
          : section;
      replaceSection(section.id, { ...withColumns, useCustom: true, expanded: true });
      announce(STR.roleAccess.permissionCustomModeAnnounce(section.title));
      return;
    }
    const leavingCustomSnapshot = snapshotColumns(section);
    const uniform = getUniformLevel(section);
    if (uniform != null) {
      replaceSection(section.id, {
        ...section,
        useCustom: false,
        summaryLevel: uniform,
        lastGroupLevel: uniform,
        lastCustomSnapshot: leavingCustomSnapshot,
      });
      announce(
        STR.roleAccess.permissionCustomOffUniformAnnounce(section.title, permissionLevelLabel(uniform)),
      );
      return;
    }
    const level = section.lastGroupLevel;
    const applied = applyLevelToAll(section, level);
    replaceSection(section.id, {
      ...applied,
      useCustom: false,
      summaryLevel: level,
      lastGroupLevel: level,
      lastCustomSnapshot: leavingCustomSnapshot,
    });
    announce(STR.roleAccess.permissionCustomOffMixedAnnounce(section.title, permissionLevelLabel(level)));
  };

  const handleSectionPermissionMode = (section: PermissionSection, mode: SectionPermissionMode) => {
    if (getSectionAttributeCount(section) === 0) return;
    if (mode === "custom") {
      if (!section.useCustom) handleCustomToggle(section, true);
      return;
    }
    handleGroupLevel(section, mode);
  };

  const handleItemLevel = (
    section: PermissionSection,
    column: "leftColumn" | "rightColumn",
    itemId: string,
    level: PermissionLevel,
  ) => {
    let next: PermissionSection = {
      ...section,
      [column]: section[column].map((p) => (p.id === itemId ? { ...p, level } : p)),
    };
    if (next.useCustom) {
      const uniform = getUniformLevel(next);
      if (uniform != null) {
        next = {
          ...next,
          useCustom: false,
          summaryLevel: uniform,
          lastGroupLevel: uniform,
          lastCustomSnapshot: snapshotColumns(next),
        };
        announce(
          STR.roleAccess.permissionAutoUniformAnnounce(section.title, permissionLevelLabel(uniform)),
        );
      }
    }
    replaceSection(section.id, next);
  };

  return (
    <Stack gap={1}>
      <Box component="span" aria-live="polite" aria-atomic="true" sx={visuallyHidden}>
        {liveMessage}
      </Box>
      {sections.map((section) => {
        const attrCount = getSectionAttributeCount(section);
        const controlsDisabled = attrCount === 0;

        return (
          <Accordion
            key={section.id}
            expanded={section.expanded}
            onChange={(_, exp) => replaceSection(section.id, { ...section, expanded: exp })}
            disableGutters
            elevation={0}
            sx={({ tokens }) => ({
              border: `1px solid ${uiDividerDefaultBorderColor(tokens)}`,
              borderRadius: 1,
              "&:before": { display: "none" },
              overflow: "hidden",
            })}
          >
            <AccordionSummary
              expandIcon={<ExpandDownIcon slot="icon" />}
              sx={{
                px: 2,
                "& .MuiAccordionSummary-content": { my: 1.5, alignItems: "center", gap: 2, flexWrap: "wrap" },
              }}
            >
              <Stack direction="row" alignItems="baseline" flexWrap="wrap" gap={0.5} sx={{ minWidth: 0 }}>
                <Typography fontWeight={600} component="span">
                  {section.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" component="span" sx={{ wordBreak: "break-word" }}>
                  · {sectionModeHeaderText(section)}
                </Typography>
              </Stack>
              <Box sx={{ flex: 1 }} />
              <Box onClick={(e) => e.stopPropagation()}>
                <SectionPermissionModePick
                  name={`perm-section-${section.id}`}
                  ariaLabel={`${section.title} — ${STR.roleAccess.allowPermissionsTitle}`}
                  value={section.useCustom ? "custom" : section.summaryLevel}
                  onChange={(mode) => handleSectionPermissionMode(section, mode)}
                  disabled={controlsDisabled}
                />
              </Box>
            </AccordionSummary>
            {(section.useCustom || section.expanded) && (
              <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
                {section.useCustom ? (
                  <Stack
                    alignItems="stretch"
                    sx={({ breakpoints }) => ({
                      flexDirection: "column",
                      gap: 0,
                      [breakpoints.up(SECTION_CUSTOM_TWO_COLUMN_UP_PX)]: {
                        flexDirection: "row",
                        gap: 2,
                      },
                    })}
                  >
                    <Stack gap={0.5} sx={{ flex: 1 }}>
                      {section.leftColumn.map((item) => (
                        <Box
                          key={item.id}
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: { xs: "flex-start", md: "center" },
                            justifyContent: "space-between",
                            gap: 2,
                            py: 0.5,
                          }}
                        >
                          <Typography
                            id={`perm-row-label-${section.id}-l-${item.id}`}
                            variant="body1"
                            component="span"
                            sx={{
                              flex: "1 1 auto",
                              minWidth: 0,
                              wordBreak: "break-word",
                            }}
                          >
                            {item.label}
                          </Typography>
                          <PermissionLevelPick
                            name={`perm-${section.id}-l-${item.id}`}
                            ariaLabelledby={`perm-row-label-${section.id}-l-${item.id}`}
                            value={item.level}
                            onChange={(l) => handleItemLevel(section, "leftColumn", item.id, l)}
                          />
                        </Box>
                      ))}
                    </Stack>
                    <Divider
                      orientation="vertical"
                      flexItem
                      sx={({ tokens, breakpoints }) => ({
                        display: "none",
                        borderColor: uiDividerDefaultBorderColor(tokens),
                        mx: "12px",
                        [breakpoints.up(SECTION_CUSTOM_TWO_COLUMN_UP_PX)]: {
                          display: "block",
                        },
                      })}
                    />
                    <Stack gap={0.5} sx={{ flex: 1 }}>
                      {section.rightColumn.map((item) => (
                        <Box
                          key={item.id}
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: { xs: "flex-start", md: "center" },
                            justifyContent: "space-between",
                            gap: 2,
                            py: 0.5,
                          }}
                        >
                          <Typography
                            id={`perm-row-label-${section.id}-r-${item.id}`}
                            variant="body1"
                            component="span"
                            sx={{
                              flex: "1 1 auto",
                              minWidth: 0,
                              wordBreak: "break-word",
                            }}
                          >
                            {item.label}
                          </Typography>
                          <PermissionLevelPick
                            name={`perm-${section.id}-r-${item.id}`}
                            ariaLabelledby={`perm-row-label-${section.id}-r-${item.id}`}
                            value={item.level}
                            onChange={(l) => handleItemLevel(section, "rightColumn", item.id, l)}
                          />
                        </Box>
                      ))}
                    </Stack>
                  </Stack>
                ) : (
                  attrCount > 0 && (
                    <Typography variant="body1" color="text.secondary">
                      {STR.roleAccess.permissionExpandHintGroupMode}
                    </Typography>
                  )
                )}
              </AccordionDetails>
            )}
          </Accordion>
        );
      })}
    </Stack>
  );
}

function RuleCard({
  rule,
  expanded,
  onChange,
  onEdit,
  onSave,
  onCancel,
}: {
  rule: RoleRuleDraft;
  expanded: boolean;
  onChange: (r: RoleRuleDraft) => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const actionChips = actionSummaryChips(rule);
  const conditionChips = rule.conditions.map(conditionSummaryChip);
  const permissionChips = permissionSummaryLines(rule);

  return (
    <Paper
      variant="outlined"
      data-rule-card-id={rule.id}
      sx={({ tokens }) => ({
        p: 3,
        borderRadius: 2,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: uiDividerDefaultBorderColor(tokens),
      })}
    >
      {!expanded ? (
        <Stack gap={2}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
            <Box component="h3" sx={({ tokens }) => sxRuleCardTitleH3Emphasis({ tokens })}>
              {objectTypeLabel(rule.objectType)}
            </Box>
            <Button size="large" color="inherit" onClick={onEdit} sx={{ flexShrink: 0 }}>
              {STR.roleAccess.editRule}
            </Button>
          </Stack>

          <Stack gap={2}>
            <SummaryChipRow
              label={STR.roleAccess.summaryActions}
              chips={actionChips.length > 0 ? actionChips : [STR.roleAccess.ruleSummaryNoActions]}
            />
            <SummaryChipRow
              label={STR.roleAccess.summaryConditions}
              chips={conditionChips.length > 0 ? conditionChips : [STR.roleAccess.ruleSummaryNoConditions]}
            />
            <SummaryChipRow label={STR.roleAccess.summaryPermissions} chips={permissionChips} />
          </Stack>
        </Stack>
      ) : (
        <>
          <Stack direction={{ xs: "column", sm: "row" }} gap={2} alignItems={{ sm: "center" }} sx={{ mb: 3 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>{STR.roleAccess.objectLabel}</InputLabel>
              <Select
                label={STR.roleAccess.objectLabel}
                value={rule.objectType}
                onChange={(e) => onChange({ ...rule, objectType: String(e.target.value) })}
              >
                <MenuItem value="risk">{STR.roleAccess.objectRisk}</MenuItem>
                <MenuItem value="control">{STR.roleAccess.objectControl}</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ flex: 1 }} />
            <Stack direction="row" gap={1}>
              <Button size="medium" color="inherit" onClick={onCancel}>
                {STR.roleAccess.cancel}
              </Button>
              <Button size="medium" variant="contained" onClick={onSave}>
                {STR.roleAccess.save}
              </Button>
            </Stack>
          </Stack>

          <ConditionsBlock conditions={rule.conditions} onChange={(conditions) => onChange({ ...rule, conditions })} />

          <Typography variant="body1" fontWeight={600} sx={{ mt: 4, mb: 2 }}>
            {STR.roleAccess.allowActionsTitle}
          </Typography>
          <Stack gap={1} sx={{ mb: 4 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={rule.actionListView}
                  onChange={(e) => onChange({ ...rule, actionListView: e.target.checked })}
                />
              }
              label={STR.roleAccess.actionListView}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={rule.actionNextStatus}
                  onChange={(e) => onChange({ ...rule, actionNextStatus: e.target.checked })}
                />
              }
              label={STR.roleAccess.actionNextStatus}
            />
          </Stack>

          <Typography variant="body1" fontWeight={600} sx={{ mb: 2 }}>
            {STR.roleAccess.allowPermissionsTitle}
          </Typography>
          <PermissionSectionsBlock sections={rule.sections} onChange={(sections) => onChange({ ...rule, sections })} />
        </>
      )}
    </Paper>
  );
}

export const CustomRoleEditView: FC<Props> = ({ initialModel }) => {
  const navigate = useNavigate();
  const [model, setModel] = useState<RoleEditModel>(() => deepClone(initialModel));
  const [expandedRuleIds, setExpandedRuleIds] = useState<Set<string>>(() => new Set());
  const ruleSnapshotsRef = useRef<Map<string, RoleRuleDraft>>(new Map());
  const pendingScrollRuleIdRef = useRef<string | null>(null);

  const updateRule = useCallback((ruleId: string, next: RoleRuleDraft) => {
    setModel((m) => ({
      ...m,
      rules: m.rules.map((r) => (r.id === ruleId ? next : r)),
    }));
  }, []);

  const expandRule = useCallback((ruleId: string) => {
    const r = model.rules.find((x) => x.id === ruleId);
    if (r && !r.isDraftRule) {
      ruleSnapshotsRef.current.set(ruleId, deepClone(r));
    }
    setExpandedRuleIds((prev) => new Set(prev).add(ruleId));
  }, [model.rules]);

  const collapseRule = useCallback((ruleId: string) => {
    setExpandedRuleIds((prev) => {
      const next = new Set(prev);
      next.delete(ruleId);
      return next;
    });
  }, []);

  const handleSaveRule = useCallback(
    (ruleId: string) => {
      ruleSnapshotsRef.current.delete(ruleId);
      setModel((m) => ({
        ...m,
        rules: m.rules.map((r) => (r.id === ruleId ? { ...r, isDraftRule: false } : r)),
      }));
      collapseRule(ruleId);
    },
    [collapseRule],
  );

  const handleCancelRule = useCallback(
    (ruleId: string) => {
      setModel((m) => {
        const draft = m.rules.find((r) => r.id === ruleId);
        if (draft?.isDraftRule) {
          ruleSnapshotsRef.current.delete(ruleId);
          return { ...m, rules: m.rules.filter((r) => r.id !== ruleId) };
        }
        const snap = ruleSnapshotsRef.current.get(ruleId);
        if (snap) {
          ruleSnapshotsRef.current.delete(ruleId);
          return { ...m, rules: m.rules.map((r) => (r.id === ruleId ? deepClone(snap) : r)) };
        }
        return m;
      });
      collapseRule(ruleId);
    },
    [collapseRule],
  );

  const handleAddRule = useCallback(() => {
    const id = `rule-${Date.now()}`;
    pendingScrollRuleIdRef.current = id;
    const newRule: RoleRuleDraft = { ...createRoleRuleDraft(id), isDraftRule: true };
    setModel((m) => ({ ...m, rules: [...m.rules, newRule] }));
    setExpandedRuleIds((prev) => new Set(prev).add(id));
  }, []);

  useLayoutEffect(() => {
    const id = pendingScrollRuleIdRef.current;
    if (!id || !model.rules.some((r) => r.id === id)) return;
    pendingScrollRuleIdRef.current = null;
    const el = document.querySelector(`[data-rule-card-id="${CSS.escape(id)}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [model.rules]);

  /** Session-persisted duplicates autosave to the in-memory catalog (matches “Saved” + Done UX). */
  useEffect(() => {
    if (hasPersistedPrototypeRole(model.id)) {
      putPersistedPrototypeRole(model);
    }
  }, [model]);

  const persistIfSessionRole = useCallback(() => {
    if (hasPersistedPrototypeRole(model.id)) {
      putPersistedPrototypeRole(model);
    }
  }, [model]);

  const basedOnOotbLinkId =
    model.kind === "custom" && model.basedOnOotbRoleName != null && model.basedOnOotbRoleName !== ""
      ? findOotbRoleIdInApplication(model.applicationName, model.basedOnOotbRoleName)
      : undefined;

  return (
    <Stack gap={3}>
      <Breadcrumbs aria-label={STR.roleAccess.breadcrumbsLabel}>
        <MuiLink component={RouterLink} to="/" color="inherit" underline="hover">
          {STR.roleAccess.crumbViewSchema}
        </MuiLink>
        <MuiLink component={RouterLink} to="/roles" color="inherit" underline="hover">
          {STR.roleAccess.crumbRoles}
        </MuiLink>
        <Typography color="text.primary">{model.name}</Typography>
      </Breadcrumbs>

      <Stack direction={{ xs: "column", md: "row" }} gap={2} justifyContent="space-between" alignItems={{ md: "flex-start" }}>
        <Stack direction="row" gap={1} alignItems="flex-start" flexWrap="wrap">
          <Button
            color="inherit"
            sx={{ minWidth: 40, mt: 0.25 }}
            aria-label={STR.roleAccess.backToRoles}
            onClick={() => {
              persistIfSessionRole();
              navigate("/roles");
            }}
          >
            <ArrowLeftIcon slot="icon" />
          </Button>
          <Box>
            <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
              <Box component="h1" sx={({ tokens }) => sxPageTitleH1BillboardEmphasis({ tokens })}>
                {STR.roleAccess.editTitlePrefix}
                {model.name}
              </Box>
              {model.kind === "custom" && (
                <Box
                  component="span"
                  sx={({ tokens }) => ({
                    px: 1.5,
                    py: 0.25,
                    borderRadius: 999,
                    typography: "caption",
                    fontWeight: 600,
                    bgcolor: tokens.semantic.color.status?.success?.default?.value ?? "success.light",
                    color: tokens.semantic.color.status?.neutral?.textDefault?.value ?? "text.primary",
                  })}
                >
                  {STR.roleAccess.chipCustom}
                </Box>
              )}
            </Stack>
            <Typography variant="body1" sx={{ mt: 1, maxWidth: 720 }}>
              {model.headerNote}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" alignItems="center" gap={2} flexShrink={0}>
          <Typography variant="caption" sx={({ tokens }) => ({ color: tokens.semantic.color.type?.muted?.value ?? "text.secondary" })}>
            {STR.roleAccess.savedStatus}
          </Typography>
          <Button
            variant="outlined"
            size="medium"
            onClick={() => {
              persistIfSessionRole();
              navigate("/roles");
            }}
          >
            {STR.roleAccess.done}
          </Button>
        </Stack>
      </Stack>

      <Paper
        variant="outlined"
        sx={({ tokens }) => ({
          p: 3,
          borderRadius: 2,
          bgcolor: tokens.semantic.color.surface?.variant?.value ?? "action.hover",
        })}
      >
        <Stack
          direction="row"
          flexWrap="wrap"
          columnGap={4}
          rowGap={2}
          alignItems="flex-start"
          useFlexGap
        >
          <Box
            sx={{
              minWidth: { xs: "100%", sm: 140 },
              maxWidth: 280,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 0.5,
            }}
          >
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              {STR.roleAccess.metaApplication}
            </Typography>
            <Typography variant="body1">{model.applicationName}</Typography>
          </Box>
          <Box
            sx={{
              minWidth: { xs: "100%", sm: 160 },
              maxWidth: 320,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 0.5,
            }}
          >
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              {STR.roleAccess.metaLicense}
            </Typography>
            <Typography variant="body1">{model.requiredLicense}</Typography>
          </Box>
          {model.kind === "custom" && model.basedOnOotbRoleName != null && model.basedOnOotbRoleName !== "" && (
            <Box
              sx={{
                minWidth: { xs: "100%", sm: 140 },
                maxWidth: 280,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 0.5,
              }}
            >
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                {STR.roleAccess.metaBasedOn}
              </Typography>
              {basedOnOotbLinkId != null ? (
                <MuiLink
                  component={RouterLink}
                  to={`/roles/${basedOnOotbLinkId}/edit`}
                  variant="body1"
                  fontWeight={600}
                  underline="always"
                  sx={{ display: "block", lineHeight: 1.5 }}
                >
                  {model.basedOnOotbRoleName}
                </MuiLink>
              ) : (
                <Typography variant="body1" fontWeight={600}>
                  {model.basedOnOotbRoleName}
                </Typography>
              )}
            </Box>
          )}
          <Box
            sx={{
              minWidth: { xs: "100%", sm: 200 },
              maxWidth: 360,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 0.5,
            }}
          >
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              {STR.roleAccess.metaCapabilities}
            </Typography>
            <Stack direction="row" alignItems="center" gap={0.5} flexWrap="wrap" sx={{ minWidth: 0 }}>
              <Typography variant="body1" component="span">
                {STR.roleAccess.metaCapabilitiesCanChangeObjectState}
              </Typography>
              <Tooltip title={STR.roleAccess.metaCapabilitiesFootnote} arrow placement="top">
                <IconButton
                  size="small"
                  aria-label={STR.roleAccess.metaCapabilitiesInfoAria}
                  sx={({ tokens }) => ({
                    p: 0.25,
                    color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
                  })}
                >
                  <InfoIcon slot="icon" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Stack>
      </Paper>

      <Box component="h2" sx={({ tokens }) => sxSectionTitleH2DisplayEmphasis({ tokens })}>
        {STR.roleAccess.roleDetailsTitle}
      </Box>
      <TextField
        label={STR.roleAccess.roleNameLabel}
        value={model.name}
        onChange={(e) => setModel((m) => ({ ...m, name: e.target.value }))}
        required
        fullWidth
        helperText={STR.roleAccess.roleNameHint}
      />
      <TextField
        label={STR.roleAccess.roleDescriptionLabel}
        value={model.description}
        onChange={(e) => setModel((m) => ({ ...m, description: e.target.value }))}
        fullWidth
        multiline
        minRows={4}
      />

      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box component="h2" sx={({ tokens }) => sxSectionTitleH2DisplayEmphasis({ tokens })}>
          {STR.roleAccess.rulesTitle}
        </Box>
        <Button size="medium" variant="contained" startIcon={<AddIcon slot="icon" />} onClick={handleAddRule}>
          {STR.roleAccess.addRule}
        </Button>
      </Stack>

      {model.rules.map((rule) => (
        <RuleCard
          key={rule.id}
          rule={rule}
          expanded={expandedRuleIds.has(rule.id)}
          onChange={(r) => updateRule(rule.id, r)}
          onEdit={() => expandRule(rule.id)}
          onSave={() => handleSaveRule(rule.id)}
          onCancel={() => handleCancelRule(rule.id)}
        />
      ))}
    </Stack>
  );
};
