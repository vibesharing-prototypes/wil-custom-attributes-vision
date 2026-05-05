import type { FC } from "react";
import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";
import AddIcon from "@diligentcorp/atlas-react-bundle/icons/Add";
import TrashIcon from "@diligentcorp/atlas-react-bundle/icons/Trash";
import type { StatusIndicatorColor, WorkflowStateDraft } from "./draftTypes.js";
import {
  STATUS_INDICATOR_BG,
  STATUS_INDICATOR_COLORS,
  STATUS_INDICATOR_RING,
} from "./draftTypes.js";
import { STR } from "../../utils/i18n.js";

// ─── Color picker ─────────────────────────────────────────────────────────────

interface ColorPickerProps {
  value: StatusIndicatorColor;
  onChange: (color: StatusIndicatorColor) => void;
}

const ColorPicker: FC<ColorPickerProps> = ({ value, onChange }) => (
  <Stack gap={1}>
    <Stack gap={0.25}>
      <Typography variant="subtitle2" fontWeight={600}>
        {STR.workflowEditor.stateColorLabel}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {STR.workflowEditor.stateColorHint}
      </Typography>
    </Stack>
    <Stack
      direction="row"
      gap={1}
      role="radiogroup"
      aria-label={STR.workflowEditor.stateColorLabel}
    >
      {STATUS_INDICATOR_COLORS.map((option) => {
        const isSelected = value === option;
        const label = STR.workflowEditor.colorOptionLabel(option);
        return (
          <Tooltip key={option} title={label} placement="top">
            <Box
              role="radio"
              aria-checked={isSelected}
              aria-label={label}
              tabIndex={0}
              onClick={() => onChange(option)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChange(option);
                }
              }}
              sx={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                backgroundColor: STATUS_INDICATOR_BG[option],
                cursor: "pointer",
                flexShrink: 0,
                boxShadow: isSelected
                  ? `0 0 0 2px white, 0 0 0 4px ${STATUS_INDICATOR_RING[option]}`
                  : `0 0 0 1px ${STATUS_INDICATOR_RING[option]}66`,
                transition: "box-shadow 120ms ease",
                outline: "none",
                "&:hover": {
                  boxShadow: `0 0 0 2px white, 0 0 0 4px ${STATUS_INDICATOR_RING[option]}`,
                },
                "&:focus-visible": {
                  boxShadow: `0 0 0 2px white, 0 0 0 4px ${STATUS_INDICATOR_RING[option]}`,
                },
              }}
            />
          </Tooltip>
        );
      })}
    </Stack>
  </Stack>
);

// ─── Sheet ────────────────────────────────────────────────────────────────────

interface WorkflowStateSheetProps {
  /** The state being edited, or null when the sheet is closed. */
  state: WorkflowStateDraft | null;
  isInitialState: boolean;
  /** Total number of states in the draft — used to gate initial-state removal. */
  totalStates: number;
  onSave: (draftId: string, updates: { name: string; description: string; color: StatusIndicatorColor }) => void;
  onClose: () => void;
  /** Called when the user clicks "Add next stage". Returns the new state's draftId. */
  onAddNextStage: (afterStateDraftId: string) => string;
  /** Called when the user clicks "Remove state". */
  onRemoveState: (draftId: string) => void;
}

const WorkflowStateSheet: FC<WorkflowStateSheetProps> = ({
  state,
  isInitialState,
  totalStates,
  onSave,
  onClose,
  onAddNextStage,
  onRemoveState,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState<StatusIndicatorColor>("subtle");

  // Sync form fields when the target state changes
  useEffect(() => {
    if (state) {
      setName(state.name);
      setDescription(state.description);
      setColor(state.color);
    }
  }, [state?.draftId, state]);

  const isValid = name.trim().length > 0;

  const handleSave = () => {
    if (!state || !isValid) return;
    onSave(state.draftId, { name: name.trim(), description: description.trim(), color });
    onClose();
  };

  const handleAddNextStage = () => {
    if (!state) return;
    if (name.trim() !== state.name || description.trim() !== state.description || color !== state.color) {
      onSave(state.draftId, { name: name.trim(), description: description.trim(), color });
    }
    onAddNextStage(state.draftId);
    onClose();
  };

  const handleRemoveState = () => {
    if (!state) return;
    onRemoveState(state.draftId);
    onClose();
  };

  // The initial state can only be removed when it is the only state remaining
  const canRemoveInitial = totalStates <= 1;
  const removeDisabled = isInitialState && !canRemoveInitial;

  const isTerminal = state?.transitions.length === 0;
  const title = state?.name.trim()
    ? STR.workflowEditor.stateSheetEditTitle(state.name)
    : STR.workflowEditor.stateSheetNewTitle;

  return (
    <Drawer
      anchor="right"
      open={state !== null}
      onClose={onClose}
      PaperProps={{
        role: "dialog",
        "aria-labelledby": "state-sheet-title",
        "aria-modal": "true",
        sx: { width: { xs: "100%", sm: 480 }, display: "flex", flexDirection: "column" },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          px: 3,
          py: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          gap: 2,
          flexShrink: 0,
        }}
      >
        <Stack gap={0.5}>
          <Typography id="state-sheet-title" variant="h3" component="h2" fontWeight={600}>
            {title}
          </Typography>
          {isInitialState && (
            <Typography variant="caption" color="primary.main" fontWeight={500}>
              {STR.workflowEditor.initialStateBadge}
            </Typography>
          )}
        </Stack>
        <IconButton
          onClick={onClose}
          size="small"
          aria-label={STR.workflowEditor.stateSheetCloseAria}
          edge="end"
          sx={{ flexShrink: 0, mt: 0.25 }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: "auto", px: 3, py: 3 }} aria-label="State configuration">
        <Stack gap={3}>
          <TextField
            id="state-name"
            label={STR.workflowEditor.stateNameLabel}
            helperText={STR.workflowEditor.stateNameHint}
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            error={name.trim().length === 0 && name.length > 0}
            inputProps={{
              "aria-required": "true",
              style: { fontFamily: "monospace" },
            }}
            autoFocus
          />

          <TextField
            id="state-description"
            label={STR.workflowEditor.stateDescriptionLabel}
            helperText={STR.workflowEditor.stateDescriptionHint}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />

          <ColorPicker value={color} onChange={setColor} />

          {/* Add next stage — only shown on terminal (no-outgoing-transition) states */}
          {isTerminal && (
            <>
              <Divider />
              <Stack gap={1}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {STR.workflowEditor.addNextStageSectionTitle}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {STR.workflowEditor.addNextStageSectionHint}
                </Typography>
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddNextStage}
                    size="small"
                  >
                    {STR.workflowEditor.addNextStageButton}
                  </Button>
                </Box>
              </Stack>
            </>
          )}

          {/* Remove state — always last */}
          <>
            <Divider />
            <Stack gap={1}>
              <Typography variant="subtitle2" fontWeight={600} color="error.main">
                {STR.workflowEditor.removeStateButton}
              </Typography>
              {removeDisabled ? (
                <Alert severity="info" sx={{ py: 0.5 }}>
                  <Typography variant="caption">
                    {STR.workflowEditor.removeInitialStateDisabledHint}
                  </Typography>
                </Alert>
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary">
                    {STR.workflowEditor.removeStateWarning}
                  </Typography>
                  <Box>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<TrashIcon />}
                      onClick={handleRemoveState}
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
                      {STR.workflowEditor.removeStateButton}
                    </Button>
                  </Box>
                </>
              )}
            </Stack>
          </>
        </Stack>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 1.5,
          px: 3,
          py: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <Button variant="outlined" onClick={onClose}>
          {STR.workflowEditor.cancel}
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={!isValid}>
          {STR.workflowEditor.saveState}
        </Button>
      </Box>
    </Drawer>
  );
};

export default WorkflowStateSheet;
