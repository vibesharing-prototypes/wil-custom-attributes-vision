import type { FC } from "react";
import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";
import AddIcon from "@diligentcorp/atlas-react-bundle/icons/Add";
import DeleteIcon from "@diligentcorp/atlas-react-bundle/icons/Trash";
import type { TransitionDraft, WorkflowStateDraft } from "./draftTypes.js";
import type { Guard, Action } from "./types.js";
import { newDraftId } from "./draftTypes.js";
import { STR } from "../../utils/i18n.js";

interface WorkflowTransitionSheetProps {
  /** Source state of this transition. */
  sourceState: WorkflowStateDraft | null;
  /** Target state of this transition (derived from targetDraftId). */
  targetState: WorkflowStateDraft | null;
  /** The transition being edited, or null when the sheet is closed. */
  transition: TransitionDraft | null;
  /** All states in the draft — used to populate the target-state selector. */
  allStates: WorkflowStateDraft[];
  onSave: (
    stateDraftId: string,
    transitionDraftId: string,
    updates: {
      eventName: string;
      targetDraftId: string;
      guards: Guard[];
      actions: Action[];
    },
  ) => void;
  onClose: () => void;
}

// ─── Guard row ────────────────────────────────────────────────────────────────

interface GuardRowProps {
  guard: Guard;
  onChange: (updated: Guard) => void;
  onRemove: () => void;
}

const GuardRow: FC<GuardRowProps> = ({ guard, onChange, onRemove }) => (
  <Box
    sx={{
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 1,
      p: 1.5,
      backgroundColor: "background.paper",
    }}
  >
    <Stack gap={1}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
        <Chip
          label={STR.workflowManagement.guardTypeBadge}
          size="small"
          variant="outlined"
          color="warning"
          sx={{ fontSize: "0.65rem", flexShrink: 0 }}
        />
        <IconButton
          size="small"
          aria-label={STR.workflowEditor.removeGuardAria(guard.name)}
          onClick={onRemove}
          sx={{ ml: "auto", flexShrink: 0 }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Stack>
      <TextField
        label={STR.workflowEditor.guardNameLabel}
        value={guard.name}
        onChange={(e) => onChange({ ...guard, name: e.target.value })}
        size="small"
        fullWidth
        inputProps={{ style: { fontFamily: "monospace" } }}
      />
      <TextField
        label={STR.workflowEditor.guardUrlLabel}
        value={guard.url}
        onChange={(e) => onChange({ ...guard, url: e.target.value })}
        size="small"
        fullWidth
        placeholder="https://your-service/webhooks/guard-name"
        inputProps={{ style: { fontFamily: "monospace", fontSize: "0.75rem" } }}
      />
    </Stack>
  </Box>
);

// ─── Action row ───────────────────────────────────────────────────────────────

interface ActionRowProps {
  action: Action;
  onChange: (updated: Action) => void;
  onRemove: () => void;
}

const ActionRow: FC<ActionRowProps> = ({ action, onChange, onRemove }) => (
  <Box
    sx={{
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 1,
      p: 1.5,
      backgroundColor: "background.paper",
    }}
  >
    <Stack gap={1}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
        <Chip
          label={STR.workflowManagement.actionTypeBadge}
          size="small"
          variant="outlined"
          color="info"
          sx={{ fontSize: "0.65rem", flexShrink: 0 }}
        />
        <IconButton
          size="small"
          aria-label={STR.workflowEditor.removeActionAria(action.name)}
          onClick={onRemove}
          sx={{ ml: "auto", flexShrink: 0 }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Stack>
      <TextField
        label={STR.workflowEditor.actionNameLabel}
        value={action.name}
        onChange={(e) => onChange({ ...action, name: e.target.value })}
        size="small"
        fullWidth
        inputProps={{ style: { fontFamily: "monospace" } }}
      />
    </Stack>
  </Box>
);

// ─── Component ────────────────────────────────────────────────────────────────

const WorkflowTransitionSheet: FC<WorkflowTransitionSheetProps> = ({
  sourceState,
  targetState,
  transition,
  allStates,
  onSave,
  onClose,
}) => {
  const [eventName, setEventName] = useState("");
  const [targetDraftId, setTargetDraftId] = useState("");
  const [guards, setGuards] = useState<Guard[]>([]);
  const [actions, setActions] = useState<Action[]>([]);

  useEffect(() => {
    if (transition) {
      setEventName(transition.eventName);
      setTargetDraftId(transition.targetDraftId);
      setGuards(transition.guards);
      setActions(transition.actions);
    }
  }, [transition?.draftId, transition]);

  const isValid = eventName.trim().length > 0 && targetDraftId.length > 0;

  const handleSave = () => {
    if (!transition || !sourceState || !isValid) return;
    onSave(sourceState.draftId, transition.draftId, {
      eventName: eventName.trim(),
      targetDraftId,
      guards,
      actions,
    });
    onClose();
  };

  const handleAddGuard = () => {
    setGuards((prev) => [
      ...prev,
      { name: "", type: "custom_webhook", url: "" },
    ]);
  };

  const handleUpdateGuard = (index: number, updated: Guard) => {
    setGuards((prev) => prev.map((g, i) => (i === index ? updated : g)));
  };

  const handleRemoveGuard = (index: number) => {
    setGuards((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddAction = () => {
    setActions((prev) => [...prev, { name: "", type: "custom" }]);
  };

  const handleUpdateAction = (index: number, updated: Action) => {
    setActions((prev) => prev.map((a, i) => (i === index ? updated : a)));
  };

  const handleRemoveAction = (index: number) => {
    setActions((prev) => prev.filter((_, i) => i !== index));
  };

  // Suppress unused variable warning
  void newDraftId;

  const sourceName = sourceState?.name.trim() || STR.workflowEditor.unnamedState;
  const resolvedTargetName =
    allStates.find((s) => s.draftId === targetDraftId)?.name.trim() ||
    targetState?.name.trim() ||
    STR.workflowEditor.unnamedState;

  return (
    <Drawer
      anchor="right"
      open={transition !== null}
      onClose={onClose}
      PaperProps={{
        role: "dialog",
        "aria-labelledby": "transition-sheet-title",
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
          <Typography id="transition-sheet-title" variant="h3" component="h2" fontWeight={600}>
            {STR.workflowEditor.transitionSheetTitle}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {STR.workflowEditor.transitionSheetSubtitle(sourceName, resolvedTargetName)}
          </Typography>
        </Stack>
        <IconButton
          onClick={onClose}
          size="small"
          aria-label={STR.workflowEditor.transitionSheetCloseAria}
          edge="end"
          sx={{ flexShrink: 0, mt: 0.25 }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: "auto", px: 3, py: 3 }}>
        <Stack gap={3}>
          {/* Event name */}
          <TextField
            id="event-name"
            label={STR.workflowEditor.eventNameLabel}
            helperText={STR.workflowEditor.eventNameHint}
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            fullWidth
            required
            autoFocus
            inputProps={{
              "aria-required": "true",
              style: { fontFamily: "monospace" },
            }}
          />

          {/* Target state selector */}
          <FormControl fullWidth size="small">
            <InputLabel id="transition-target-label">
              {STR.workflowEditor.transitionTargetLabel}
            </InputLabel>
            <Select
              labelId="transition-target-label"
              id="transition-target"
              value={targetDraftId}
              label={STR.workflowEditor.transitionTargetLabel}
              onChange={(e) => setTargetDraftId(e.target.value)}
            >
              {allStates.map((s) => (
                <MenuItem key={s.draftId} value={s.draftId}>
                  {s.name.trim() || `(${STR.workflowEditor.unnamedState})`}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{STR.workflowEditor.transitionTargetHint}</FormHelperText>
          </FormControl>

          <Divider />

          {/* Guards */}
          <Stack gap={1.5}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack gap={0.25}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {STR.workflowManagement.guardsTitle}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {STR.workflowEditor.guardsSectionHint}
                </Typography>
              </Stack>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddGuard}
                sx={{ flexShrink: 0 }}
              >
                {STR.workflowEditor.addGuardButton}
              </Button>
            </Stack>

            {guards.length > 0 && (
              <Stack gap={1}>
                {guards.map((guard, index) => (
                  <GuardRow
                    key={index}
                    guard={guard}
                    onChange={(updated) => handleUpdateGuard(index, updated)}
                    onRemove={() => handleRemoveGuard(index)}
                  />
                ))}
              </Stack>
            )}

            {guards.length === 0 && (
              <Typography variant="caption" color="text.disabled" sx={{ fontStyle: "italic" }}>
                {STR.workflowEditor.noGuardsPlaceholder}
              </Typography>
            )}
          </Stack>

          <Divider />

          {/* Actions */}
          <Stack gap={1.5}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack gap={0.25}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {STR.workflowManagement.actionsTitle}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {STR.workflowEditor.actionsSectionHint}
                </Typography>
              </Stack>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddAction}
                sx={{ flexShrink: 0 }}
              >
                {STR.workflowEditor.addActionButton}
              </Button>
            </Stack>

            {actions.length > 0 && (
              <>
                <Stack gap={1}>
                  {actions.map((action, index) => (
                    <ActionRow
                      key={index}
                      action={action}
                      onChange={(updated) => handleUpdateAction(index, updated)}
                      onRemove={() => handleRemoveAction(index)}
                    />
                  ))}
                </Stack>
                <Alert severity="info" sx={{ py: 0.5 }}>
                  <Typography variant="caption">
                    {STR.workflowManagement.actionAsyncNote}
                  </Typography>
                </Alert>
              </>
            )}

            {actions.length === 0 && (
              <Typography variant="caption" color="text.disabled" sx={{ fontStyle: "italic" }}>
                {STR.workflowEditor.noActionsPlaceholder}
              </Typography>
            )}
          </Stack>
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
          {STR.workflowEditor.saveTransition}
        </Button>
      </Box>
    </Drawer>
  );
};

export default WorkflowTransitionSheet;
