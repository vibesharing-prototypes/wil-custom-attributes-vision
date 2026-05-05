import type { FC } from "react";
import { useEffect, useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Link,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { PageHeader } from "@diligentcorp/atlas-react-bundle";
import AddIcon from "@diligentcorp/atlas-react-bundle/icons/Add";
import ArrowLeftIcon from "@diligentcorp/atlas-react-bundle/icons/ArrowLeft";
import PageLayout from "../components/PageLayout.js";
import WorkflowTemplateCanvas from "../features/workflowManagement/WorkflowTemplateCanvas.js";
import WorkflowGraphCanvas from "../features/workflowManagement/WorkflowGraphCanvas.js";
import WorkflowStateSheet from "../features/workflowManagement/WorkflowStateSheet.js";
import WorkflowTransitionSheet from "../features/workflowManagement/WorkflowTransitionSheet.js";
import { useWorkflowTemplateEditor } from "../features/workflowManagement/useWorkflowTemplateEditor.js";
import type { CanvasItemSelection } from "../features/workflowManagement/WorkflowTemplateCanvas.js";
import type { WorkflowTemplate } from "../features/workflowManagement/types.js";
import type { StatusIndicatorColor, WorkflowDraft } from "../features/workflowManagement/draftTypes.js";
import type { Guard, Action } from "../features/workflowManagement/types.js";
import { atlasToastAlertSurfaceSx } from "../utils/atlasToastLayout.js";
import { STR } from "../utils/i18n.js";

// ─── Location state ───────────────────────────────────────────────────────────

interface EditorLocationState {
  mode: "new" | "edit";
  template?: WorkflowTemplate;
}

// ─── Template meta form ───────────────────────────────────────────────────────

interface TemplateMetaFormProps {
  name: string;
  version: number;
  service: string;
  onNameChange: (v: string) => void;
  onVersionChange: (v: number) => void;
  onServiceChange: (v: string) => void;
}

const TemplateMetaForm: FC<TemplateMetaFormProps> = ({
  name, version, service,
  onNameChange, onVersionChange, onServiceChange,
}) => (
  <Box
    sx={{
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 2,
      p: 2.5,
      backgroundColor: "var(--lens-semantic-color-surface-subtle, #fafafa)",
    }}
  >
    <Stack gap={2}>
      <Typography variant="subtitle2" fontWeight={600}>
        {STR.workflowEditor.templateMetaSectionTitle}
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
        <TextField
          label={STR.workflowEditor.templateNameLabel}
          helperText={STR.workflowEditor.templateNameHint}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          size="small"
          sx={{ flex: 2 }}
        />
        <TextField
          label={STR.workflowEditor.templateVersionLabel}
          value={version}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            if (!isNaN(n) && n > 0) onVersionChange(n);
          }}
          size="small"
          type="number"
          inputProps={{ min: 1 }}
          sx={{ flex: 0.5, minWidth: 90 }}
        />
        <TextField
          label={STR.workflowEditor.templateServiceLabel}
          helperText={STR.workflowEditor.templateServiceHint}
          value={service}
          onChange={(e) => onServiceChange(e.target.value)}
          size="small"
          sx={{ flex: 2 }}
          inputProps={{ style: { fontFamily: "monospace" } }}
        />
      </Stack>
    </Stack>
  </Box>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

/**
 * Workflow Template Editor page.
 *
 * Reached via navigate('/workflows/template/edit', { state: { mode: 'new' | 'edit', template? } })
 * from WorkflowsPlaceholderPage.
 *
 * Two canvas views share the same WorkflowDraft state:
 * - "linear" — WorkflowTemplateCanvas (horizontal chips, simple linear layout)
 * - "graph"  — WorkflowGraphCanvas (@xyflow/react, full node-graph with forks/loops)
 */
const WorkflowTemplateEditorPage: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as EditorLocationState | null;

  const editor = useWorkflowTemplateEditor();
  const [selectedItem, setSelectedItem] = useState<CanvasItemSelection | null>(null);
  const [pendingNewStateId, setPendingNewStateId] = useState<string | null>(null);
  const [canvasView, setCanvasView] = useState<"linear" | "graph">("linear");

  // ── Undo-delete toast ──
  const [undoToastOpen, setUndoToastOpen] = useState(false);
  const [deletedStateName, setDeletedStateName] = useState("");
  const [draftSnapshot, setDraftSnapshot] = useState<WorkflowDraft | null>(null);

  // Initialize from location state on mount
  useEffect(() => {
    if (locationState?.mode === "edit" && locationState.template) {
      editor.initFromTemplate(locationState.template);
    } else {
      editor.initEmpty();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-open the state sheet for a newly added state
  useEffect(() => {
    if (pendingNewStateId) {
      setSelectedItem({ type: "state", stateDraftId: pendingNewStateId });
      setPendingNewStateId(null);
    }
  }, [pendingNewStateId, editor.draft.states]);

  // ── Canvas interactions ──

  const handleSelectState = useCallback((stateDraftId: string) => {
    setSelectedItem((prev) =>
      prev?.type === "state" && prev.stateDraftId === stateDraftId
        ? null
        : { type: "state", stateDraftId },
    );
  }, []);

  const handleSelectTransition = useCallback((stateDraftId: string, transitionDraftId: string) => {
    setSelectedItem((prev) => {
      const isSame =
        prev?.type === "transition" &&
        prev.stateDraftId === stateDraftId &&
        prev.transitionDraftId === transitionDraftId;
      return isSame ? null : { type: "transition", stateDraftId, transitionDraftId };
    });
  }, []);

  const handleAddNextStage = useCallback(
    (afterStateDraftId: string) => {
      const newStateId = editor.addStateAfter(afterStateDraftId);
      setPendingNewStateId(newStateId);
    },
    [editor],
  );

  // ── State removal + undo ──

  const handleRemoveState = useCallback(
    (draftId: string) => {
      const stateToDelete = editor.draft.states.find((s) => s.draftId === draftId);
      // Deep-clone the draft so the snapshot is immune to subsequent mutations
      const snapshot: WorkflowDraft = JSON.parse(JSON.stringify(editor.draft));
      const name = stateToDelete?.name.trim() ?? "";

      editor.removeState(draftId);
      setSelectedItem((prev) =>
        prev?.type === "state" && prev.stateDraftId === draftId ? null : prev,
      );

      setDraftSnapshot(snapshot);
      setDeletedStateName(name);
      setUndoToastOpen(true);
    },
    [editor],
  );

  const handleUndoDelete = useCallback(() => {
    if (draftSnapshot) {
      editor.restoreDraft(draftSnapshot);
      setDraftSnapshot(null);
    }
    setUndoToastOpen(false);
  }, [draftSnapshot, editor]);

  const handleUndoToastClose = useCallback(
    (_event?: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === "clickaway") return;
      setUndoToastOpen(false);
      setDraftSnapshot(null);
    },
    [],
  );

  // ── Position persistence ──

  const handleUpdateStatePosition = useCallback(
    (stateDraftId: string, position: { x: number; y: number }) => {
      editor.updateStatePosition(stateDraftId, position);
    },
    [editor],
  );

  // Graph-specific: add transition between two existing states
  const handleAddTransition = useCallback(
    (sourceStateId: string, targetStateId: string): string => {
      const newTransitionId = editor.addTransition(sourceStateId, targetStateId);
      // Auto-open the transition sheet for the newly drawn edge
      setSelectedItem({ type: "transition", stateDraftId: sourceStateId, transitionDraftId: newTransitionId });
      return newTransitionId;
    },
    [editor],
  );

  // Graph-specific: remove a transition by deleting its edge
  const handleRemoveTransition = useCallback(
    (stateDraftId: string, transitionDraftId: string) => {
      editor.removeTransition(stateDraftId, transitionDraftId);
      // Clear selection if the removed transition was selected
      setSelectedItem((prev) =>
        prev?.type === "transition" &&
        prev.stateDraftId === stateDraftId &&
        prev.transitionDraftId === transitionDraftId
          ? null
          : prev,
      );
    },
    [editor],
  );

  // Graph-specific: add a free-standing state (no auto-connection)
  const handleAddIsolatedState = useCallback(() => {
    const newId = editor.addIsolatedState();
    setPendingNewStateId(newId);
  }, [editor]);

  // ── State sheet ──

  const selectedStateId = selectedItem?.type === "state" ? selectedItem.stateDraftId : null;
  const selectedState = selectedStateId
    ? (editor.draft.states.find((s) => s.draftId === selectedStateId) ?? null)
    : null;
  const selectedStateIndex = selectedState
    ? editor.draft.states.indexOf(selectedState)
    : -1;

  const handleSaveState = useCallback(
    (draftId: string, updates: { name: string; description: string; color: StatusIndicatorColor }) => {
      editor.updateState(draftId, updates);
    },
    [editor],
  );

  const handleAddNextStageFromSheet = useCallback(
    (afterStateDraftId: string): string => {
      const newId = editor.addStateAfter(afterStateDraftId);
      setPendingNewStateId(newId);
      return newId;
    },
    [editor],
  );

  // ── Transition sheet ──

  const selectedTransition =
    selectedItem?.type === "transition"
      ? (() => {
          const state = editor.draft.states.find(
            (s) => s.draftId === selectedItem.stateDraftId,
          );
          return state?.transitions.find((t) => t.draftId === selectedItem.transitionDraftId) ?? null;
        })()
      : null;

  const transitionSourceState =
    selectedItem?.type === "transition"
      ? (editor.draft.states.find((s) => s.draftId === selectedItem.stateDraftId) ?? null)
      : null;

  const transitionTargetState = selectedTransition
    ? (editor.draft.states.find((s) => s.draftId === selectedTransition.targetDraftId) ?? null)
    : null;

  const handleSaveTransition = useCallback(
    (
      stateDraftId: string,
      transitionDraftId: string,
      updates: { eventName: string; targetDraftId: string; guards: Guard[]; actions: Action[] },
    ) => {
      editor.updateTransition(stateDraftId, transitionDraftId, {
        eventName: updates.eventName,
        targetDraftId: updates.targetDraftId,
      });
      // Sync guards: remove all then re-add
      const state = editor.draft.states.find((s) => s.draftId === stateDraftId);
      const transition = state?.transitions.find((t) => t.draftId === transitionDraftId);
      if (transition) {
        for (const g of transition.guards) {
          editor.removeGuard(stateDraftId, transitionDraftId, g.name);
        }
        for (const g of updates.guards) {
          if (g.name.trim()) editor.addGuard(stateDraftId, transitionDraftId, g);
        }
        for (const a of transition.actions) {
          editor.removeAction(stateDraftId, transitionDraftId, a.name);
        }
        for (const a of updates.actions) {
          if (a.name.trim()) editor.addAction(stateDraftId, transitionDraftId, a);
        }
      }
    },
    [editor],
  );

  // ── Render ──

  const isNewMode = locationState?.mode !== "edit";
  const pageTitle = isNewMode
    ? STR.workflowEditor.newTemplatePageTitle
    : STR.workflowEditor.pageTitle;

  const canvasHint =
    canvasView === "graph"
      ? STR.workflowEditor.graphCanvasHint
      : STR.workflowEditor.canvasHint;

  return (
    <PageLayout>
      {/* Back navigation — passes current draft colors so the overview board stays in sync */}
      <Stack direction="row" alignItems="center" gap={0.5} sx={{ mb: 1, ml: -1 }}>
        <Button
          variant="text"
          size="small"
          startIcon={<ArrowLeftIcon />}
          onClick={() =>
            navigate("/workflows", {
              state: {
                colorOverrides: Object.fromEntries(
                  editor.draft.states
                    .filter((s) => s.name.trim())
                    .map((s) => [s.name.trim(), s.color]),
                ),
              },
            })
          }
          sx={{ color: "text.secondary", textTransform: "none" }}
        >
          {STR.workflowsStub.title}
        </Button>
      </Stack>

      <PageHeader
        pageTitle={pageTitle}
        pageSubtitle={STR.workflowEditor.pageSubtitle}
      />

      <Alert severity="info" sx={{ mt: 2, mb: 3 }}>
        {STR.workflowEditor.scaffoldNotice}
      </Alert>

      <Stack gap={4}>
        {/* Template metadata */}
        <TemplateMetaForm
          name={editor.draft.name}
          version={editor.draft.version}
          service={editor.draft.service}
          onNameChange={(v) => editor.updateTemplateMeta({ name: v })}
          onVersionChange={(v) => editor.updateTemplateMeta({ version: v })}
          onServiceChange={(v) => editor.updateTemplateMeta({ service: v })}
        />

        <Divider />

        {/* Canvas section */}
        <Stack gap={1.5}>
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={1}
          >
            <Stack gap={0.25}>
              <Typography variant="h6" component="h2" fontWeight={600}>
                {STR.workflowManagement.templateSectionTitle}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {canvasHint}
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
              {/* State count badge */}
              {editor.draft.states.length > 0 && (
                <Chip
                  label={`${editor.draft.states.length} state${editor.draft.states.length === 1 ? "" : "s"}`}
                  size="small"
                  variant="outlined"
                />
              )}

              {/* Canvas view toggle */}
              <ToggleButtonGroup
                value={canvasView}
                exclusive
                onChange={(_, v) => { if (v) setCanvasView(v); }}
                size="small"
                aria-label={STR.workflowEditor.canvasViewToggleAria}
              >
                <ToggleButton value="linear">
                  {STR.workflowEditor.canvasViewLinear}
                </ToggleButton>
                <ToggleButton value="graph">
                  {STR.workflowEditor.canvasViewGraph}
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Graph only: add free-standing state (same control that lived under the canvas) */}
              {canvasView === "graph" && (
                <Tooltip title={STR.workflowEditor.addNextStageTooltip} placement="top">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleAddIsolatedState}
                  >
                    {STR.workflowEditor.addNextStageButton}
                  </Button>
                </Tooltip>
              )}
            </Stack>
          </Stack>

          {canvasView === "linear" ? (
            <WorkflowTemplateCanvas
              draft={editor.draft}
              selectedItem={selectedItem}
              onSelectState={handleSelectState}
              onSelectTransition={handleSelectTransition}
              onAddNextStage={handleAddNextStage}
            />
          ) : (
            <WorkflowGraphCanvas
              draft={editor.draft}
              selectedItem={selectedItem}
              onSelectState={handleSelectState}
              onSelectTransition={handleSelectTransition}
              onAddTransition={handleAddTransition}
              onRemoveTransition={handleRemoveTransition}
              onRemoveState={handleRemoveState}
              onUpdateStatePosition={handleUpdateStatePosition}
              onAddStateAfter={handleAddNextStage}
            />
          )}
        </Stack>
      </Stack>

      {/* State sheet */}
      <WorkflowStateSheet
        state={selectedState}
        isInitialState={selectedStateIndex === 0}
        totalStates={editor.draft.states.length}
        onSave={handleSaveState}
        onClose={() => setSelectedItem(null)}
        onAddNextStage={handleAddNextStageFromSheet}
        onRemoveState={handleRemoveState}
      />

      {/* Transition sheet */}
      <WorkflowTransitionSheet
        sourceState={transitionSourceState}
        targetState={transitionTargetState}
        transition={selectedTransition}
        allStates={editor.draft.states}
        onSave={handleSaveTransition}
        onClose={() => setSelectedItem(null)}
      />

      {/* Undo-delete toast — same Snackbar + Alert pattern as schema management */}
      <Snackbar
        open={undoToastOpen}
        autoHideDuration={5000}
        onClose={handleUndoToastClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ top: "88px !important", right: "24px !important" }}
      >
        <Alert
          severity="success"
          aria-live="polite"
          onClose={handleUndoToastClose}
          sx={atlasToastAlertSurfaceSx}
        >
          {STR.workflowEditor.stateRemovedToast(deletedStateName)}
          {" "}
          <Link
            component="button"
            type="button"
            underline="always"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleUndoDelete();
            }}
            sx={{ verticalAlign: "baseline", cursor: "pointer" }}
          >
            {STR.workflowEditor.undoButton}
          </Link>
        </Alert>
      </Snackbar>
    </PageLayout>
  );
};

export default WorkflowTemplateEditorPage;
