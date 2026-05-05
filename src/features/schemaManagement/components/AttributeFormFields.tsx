import type { ChangeEvent, FC } from "react";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import type { SelectChangeEvent } from "@mui/material";
import {
  AIDisclaimer,
  AILoadingIndicator,
} from "@diligentcorp/atlas-react-bundle";
import AiSparkleIcon from "@diligentcorp/atlas-react-bundle/icons/AiSparkle";
import type { AttributeDefinition, SchemaSection } from "../../../types/attribute.js";
import type { AttributeFormState } from "../types.js";
import { SelectOptionsEditor } from "./SelectOptionsEditor.js";
import { STR } from "../../../utils/i18n.js";
import { uiDividerDefaultBorderColor } from "../../../utils/uiDividerBorder.js";
import { CURRENCY_OPTIONS, type CurrencyOption } from "../../../utils/currencyCodes.js";
import { assessDescriptionQuality, type QualityLevel } from "../../../utils/descriptionQuality.js";
import { generateSemanticDescription } from "../../../utils/aiDescriptionGenerator.js";

interface Props {
  form: AttributeFormState;
  onChange: (updates: Partial<AttributeFormState>) => void;
  /** Existing custom attributes — used for overlap/duplicate detection */
  existingAttributes?: AttributeDefinition[];
  /** ID of the attribute being edited — excluded from overlap checks */
  editingAttributeId?: string;
  /**
   * Available OOTB sections for the section picker.
   * When provided and non-empty, a "Section" selector is shown so the user
   * can assign the attribute to a specific section.
   */
  sections?: SchemaSection[];
}

// ─── Overlap detection ────────────────────────────────────────────────────────

/** Normalize an attribute name for comparison: lowercase, alphanumeric only */
function normalizeForComparison(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findOverlappingAttribute(
  newName: string,
  existingAttributes: AttributeDefinition[],
  excludeId?: string,
): AttributeDefinition | null {
  if (!newName.trim()) return null;
  const normalized = normalizeForComparison(newName);
  if (normalized.length < 3) return null;

  return (
    existingAttributes.find((attr) => {
      if (attr.id === excludeId) return false;
      const existingNorm = normalizeForComparison(attr.name);
      // Exact match or one name is a substring of the other (min 5 chars for safety)
      return (
        existingNorm === normalized ||
        (normalized.length >= 5 && existingNorm.includes(normalized)) ||
        (existingNorm.length >= 5 && normalized.includes(existingNorm))
      );
    }) ?? null
  );
}

// ─── Quality indicator ────────────────────────────────────────────────────────

const QUALITY_COLORS: Record<QualityLevel, "error" | "warning" | "success"> = {
  poor: "error",
  fair: "warning",
  good: "success",
};

const QUALITY_LABEL: Record<QualityLevel, string> = {
  poor: STR.descriptionQuality.poor,
  fair: STR.descriptionQuality.fair,
  good: STR.descriptionQuality.good,
};

interface DescriptionQualityIndicatorProps {
  description: string;
  fieldName: string;
  /**
   * When set, overrides the heuristic score for prototype purposes (e.g. to
   * demonstrate that AI refinement raises quality). Criteria check marks in
   * the tooltip reflect the actual heuristic; only the summary score is overridden.
   */
  overrideScore?: number;
}

const DescriptionQualityIndicator: FC<DescriptionQualityIndicatorProps> = ({
  description,
  fieldName,
  overrideScore,
}) => {
  const quality = useMemo(
    () => assessDescriptionQuality(description, fieldName),
    [description, fieldName],
  );

  if (!description.trim()) return null;

  const displayScore = overrideScore ?? quality.score;
  const displayLevel: QualityLevel =
    displayScore <= 2 ? "poor" : displayScore <= 4 ? "fair" : "good";

  const color = QUALITY_COLORS[displayLevel];
  const label = QUALITY_LABEL[displayLevel];
  const tooltipContent = (
    <Stack gap={0.5}>
      <Typography variant="caption" fontWeight={600}>
        {STR.descriptionQuality.tooltipTitle}
      </Typography>
      {quality.criteria.map((c) => (
        <Typography key={c.id} variant="caption" sx={{ display: "flex", gap: 0.5 }}>
          <span>{c.passed ? "✓" : "○"}</span>
          <span>{c.label}</span>
        </Typography>
      ))}
    </Stack>
  );

  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <Typography
        variant="caption"
        sx={({ tokens }) => ({
          color: tokens.semantic.color.type?.default?.value ?? "text.primary",
          fontWeight: 600,
        })}
      >
        {STR.descriptionQuality.label}:
      </Typography>
      <Tooltip title={tooltipContent} arrow placement="right">
        <Chip
          label={`${label} (${displayScore}/6)`}
          size="small"
          color={color}
          variant="outlined"
          sx={{ height: 20, fontSize: "0.65rem", cursor: "help" }}
        />
      </Tooltip>
    </Stack>
  );
};

/**
 * Step 2 of progressive disclosure: the attribute configuration form.
 * Renders common fields (name, description) and type-specific config.
 * All fields are controlled; validation state is managed by the parent sheet.
 *
 * Also includes:
 * - AI description suggestion button (simulated in prototype)
 * - Inline description quality indicator (6-criterion checklist heuristic)
 * - Overlap/duplicate detection against existing attributes
 */
export const AttributeFormFields: FC<Props> = ({
  form,
  onChange,
  existingAttributes = [],
  editingAttributeId,
  sections = [],
}) => {
  const { selectedType } = form;

  const [aiState, setAiState] = useState<"idle" | "generating" | "done" | "error">("idle");
  // Overrides the displayed quality score after AI refinement to clearly show improvement.
  // Cleared when the user manually edits the description field again.
  const [aiRefinedScore, setAiRefinedScore] = useState<number | null>(null);

  const overlappingAttribute = useMemo(
    () => findOverlappingAttribute(form.name, existingAttributes, editingAttributeId),
    [form.name, existingAttributes, editingAttributeId],
  );

  const handleAiGenerate = useCallback(async () => {
    if (!selectedType) return;
    setAiState("generating");
    try {
      const suggestion = await generateSemanticDescription(
        form.name,
        selectedType,
        form.description,
      );
      onChange({ description: suggestion });
      setAiState("done");
      // Show a clearly improved score (5 or 6) to demonstrate AI value in the prototype.
      setAiRefinedScore(Math.random() > 0.5 ? 6 : 5);
    } catch {
      setAiState("error");
    }
  }, [selectedType, form.name, form.description, onChange]);

  const aiButtonLabel =
    form.description.trim()
      ? STR.aiDescription.refineButton
      : STR.aiDescription.generateButton;

  return (
    <Stack gap={3}>
      {/* ── Common fields ── */}
      <Stack gap={2}>
        <TextField
          label={STR.form.nameLabel}
          value={form.name}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ name: e.target.value })}
          required
          fullWidth
          helperText={STR.form.nameHint}
          inputProps={{ "aria-required": true }}
        />

        {/* Overlap warning */}
        {overlappingAttribute && (
          <Alert severity="warning">
            <Box sx={visuallyHidden}>Warning</Box>
            <strong>{STR.overlap.warningTitle}:</strong>{" "}
            {STR.overlap.warningBody.replace("{name}", overlappingAttribute.name)}
          </Alert>
        )}

        {/* Description field with refinement panel */}
        <Stack gap={0}>
          <TextField
            label={STR.form.descriptionLabel}
            value={form.description}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              onChange({ description: e.target.value });
              if (aiState === "done" || aiState === "error") setAiState("idle");
              if (aiRefinedScore !== null) setAiRefinedScore(null);
            }}
            required
            fullWidth
            multiline
            minRows={3}
            inputProps={{ "aria-required": true }}
          />

          {/* Refinement panel — quality, guidance, and AI action */}
          <Box
            sx={({ tokens }) => ({
              border: "1px solid",
              borderTop: "none",
              borderColor: uiDividerDefaultBorderColor(tokens),
              borderRadius: "16px",
              p: 1.5,
              mt: 1,
              color: "var(--lens-component-divider-colors-default-border-color)",
              backgroundColor: tokens.semantic.color.surface?.subtle?.value ?? "var(--lens-semantic-color-surface-subtle)",
            })}
          >
            <Stack gap={1.5}>
              <DescriptionQualityIndicator
                description={form.description}
                fieldName={form.name}
                overrideScore={aiRefinedScore ?? undefined}
              />

              <Typography
                variant="caption"
                sx={({ tokens }) => ({
                  color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
                })}
              >
                {STR.form.descriptionHint}
              </Typography>

              {/* AI state feedback (generating / error / done disclaimer) */}
              {aiState !== "idle" && (
                <Stack direction="row" alignItems="center" gap={1}>
                  {aiState === "generating" ? (
                    <>
                      <AILoadingIndicator size="sm" aria-label={STR.aiDescription.generatingLabel} />
                      <Typography
                        variant="caption"
                        sx={({ tokens }) => ({
                          color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
                        })}
                      >
                        {STR.aiDescription.generatingLabel}
                      </Typography>
                    </>
                  ) : aiState === "error" ? (
                    <Typography variant="caption" color="error">
                      {STR.aiDescription.errorMessage}
                    </Typography>
                  ) : aiState === "done" ? (
                    <AIDisclaimer variant="disclosure">
                      {STR.aiDescription.generatedDisclaimer}
                    </AIDisclaimer>
                  ) : null}
                </Stack>
              )}

              <Button
                variant="outlined"
                color="ai"
                size="small"
                startIcon={<AiSparkleIcon />}
                onClick={handleAiGenerate}
                disabled={!form.name.trim() || aiState === "generating"}
                sx={{ alignSelf: "flex-start" }}
              >
                {aiButtonLabel}
              </Button>
            </Stack>
          </Box>
      </Stack>

      {/* ── Section assignment ── */}
      {sections.length > 0 && (
        <FormControl fullWidth>
          <InputLabel id="section-picker-label">{STR.form.sectionLabel}</InputLabel>
          <Select
            labelId="section-picker-label"
            value={form.sectionId}
            label={STR.form.sectionLabel}
            onChange={(e: SelectChangeEvent) => onChange({ sectionId: e.target.value })}
          >
            {sections.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{STR.form.sectionHint}</FormHelperText>
        </FormControl>
      )}

    </Stack>

      {/* ── Type-specific fields ── */}
      {selectedType && <TypeSpecificConfig type={selectedType} form={form} onChange={onChange} />}
    </Stack>
  );
};

interface TypeConfigProps {
  type: AttributeFormState["selectedType"];
  form: AttributeFormState;
  onChange: (updates: Partial<AttributeFormState>) => void;
}

const TypeSpecificConfig: FC<TypeConfigProps> = ({ type, form, onChange }) => {
  switch (type) {
    case "singleSelect":
    case "multiSelect":
      return (
        <>
          <Divider />
          <SelectOptionsEditor
            options={form.options}
            onChange={(options) => onChange({ options })}
          />
        </>
      );

    case "currency":
      return (
        <>
          <Divider />
          <Stack gap={2}>
            <FormControl fullWidth>
              <InputLabel id="currency-mode-label">{STR.form.currencyModeLabel}</InputLabel>
              <Select
                labelId="currency-mode-label"
                value={form.currencyMode}
                label={STR.form.currencyModeLabel}
                onChange={(e: SelectChangeEvent) =>
                  onChange({ currencyMode: e.target.value as "perAttribute" | "perValue" })
                }
              >
                <MenuItem value="perAttribute">{STR.form.currencyModePerAttribute}</MenuItem>
                <MenuItem value="perValue">{STR.form.currencyModePerValue}</MenuItem>
              </Select>
            </FormControl>

            {form.currencyMode === "perAttribute" && (
              <Autocomplete<CurrencyOption>
                options={CURRENCY_OPTIONS}
                groupBy={(option) => (option.common ? "Most used" : "All currencies")}
                getOptionLabel={(option) => `${option.code} – ${option.name}`}
                isOptionEqualToValue={(option, value) => option.code === value.code}
                value={
                  CURRENCY_OPTIONS.find((c) => c.code === form.currencyCode) ?? null
                }
                onChange={(_, selected) =>
                  onChange({ currencyCode: selected?.code ?? "" })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={STR.form.currencyCodeLabel}
                    helperText={STR.form.currencyCodeHint}
                    aria-describedby="currency-code-hint"
                  />
                )}
                renderGroup={(params) => (
                  <li key={params.key}>
                    <ListSubheader
                      component="div"
                      sx={{ lineHeight: "32px", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}
                    >
                      {params.group}
                    </ListSubheader>
                    <ul style={{ padding: 0 }}>{params.children}</ul>
                  </li>
                )}
                fullWidth
                autoHighlight
                blurOnSelect
              />
            )}
          </Stack>
        </>
      );

    case "attachment":
      return (
        <>
          <Divider />
          <FormControl fullWidth>
            <InputLabel id="attachment-mode-label">{STR.form.attachmentModeLabel}</InputLabel>
            <Select
              labelId="attachment-mode-label"
              value={form.attachmentMode}
              label={STR.form.attachmentModeLabel}
              onChange={(e: SelectChangeEvent) =>
                onChange({ attachmentMode: e.target.value as "single" | "multiple" })
              }
            >
              <MenuItem value="single">{STR.form.attachmentModeSingle}</MenuItem>
              <MenuItem value="multiple">{STR.form.attachmentModeMultiple}</MenuItem>
            </Select>
          </FormControl>
        </>
      );

    case "user":
    case "users":
      return (
        <>
          <Divider />
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={form.allowGroups}
                  onChange={(e) => onChange({ allowGroups: e.target.checked })}
                  inputProps={{ "aria-describedby": "allow-groups-hint" }}
                />
              }
              label={STR.form.allowGroupsLabel}
            />
            <FormHelperText id="allow-groups-hint">{STR.form.allowGroupsHint}</FormHelperText>
          </Box>
        </>
      );

    default:
      return null;
  }
};

