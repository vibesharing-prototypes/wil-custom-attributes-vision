import type { FC } from "react";
import { Box, Button, Chip, IconButton, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import AddIcon from "@diligentcorp/atlas-react-bundle/icons/Add";
import LockedIcon from "@diligentcorp/atlas-react-bundle/icons/Locked";
import type { WorkflowDraft, WorkflowStateDraft, TransitionDraft } from "./draftTypes.js";
import { STATUS_INDICATOR_BG, STATUS_INDICATOR_RING } from "./draftTypes.js";
import { STR } from "../../utils/i18n.js";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CanvasSelection {
  type: "state";
  stateDraftId: string;
}

export interface ConnectionSelection {
  type: "transition";
  stateDraftId: string;
  transitionDraftId: string;
}

export type CanvasItemSelection = CanvasSelection | ConnectionSelection;

interface WorkflowTemplateCanvasProps {
  draft: WorkflowDraft;
  selectedItem: CanvasItemSelection | null;
  onSelectState: (stateDraftId: string) => void;
  onSelectTransition: (stateDraftId: string, transitionDraftId: string) => void;
  onAddNextStage: (afterStateDraftId: string) => void;
}

// ─── State node ───────────────────────────────────────────────────────────────

interface StateNodeProps {
  state: WorkflowStateDraft;
  isInitial: boolean;
  isSelected: boolean;
  onClick: () => void;
}

const StateNode: FC<StateNodeProps> = ({ state, isInitial, isSelected, onClick }) => {
  const { tokens } = useTheme() as { tokens: Record<string, unknown> & { semantic?: { color?: { type?: { muted?: { value?: string } } } } } };
  const isEmpty = !state.name.trim();
  const hasGuardedTransitions = state.transitions.some((t) => t.guards.length > 0);

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label={isEmpty ? STR.workflowEditor.emptyStateAriaLabel : `${STR.workflowEditor.stateNodeAriaLabel}: ${state.name}`}
      aria-pressed={isSelected}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      sx={{
        flexShrink: 0,
        width: 200,
        minHeight: 100,
        borderRadius: 2,
        border: "2px solid",
        borderColor: isSelected
          ? "primary.main"
          : isEmpty
            ? "divider"
            : `${STATUS_INDICATOR_RING[state.color]}66`,
        backgroundColor: isEmpty
          ? STATUS_INDICATOR_BG["subtle"]
          : STATUS_INDICATOR_BG[state.color],
        boxShadow: isSelected ? 4 : 1,
        p: 2,
        cursor: "pointer",
        outline: "none",
        transition: "box-shadow 150ms, border-color 150ms, background-color 150ms",
        "&:hover": { boxShadow: 3 },
        "&:focus-visible": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: 2,
        },
      }}
    >
      <Stack gap={1} height="100%">
        {/* Initial badge */}
        {isInitial && (
          <Chip
            label={STR.workflowEditor.initialStateBadge}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ alignSelf: "flex-start", fontSize: "0.6rem", height: 18, "& .MuiChip-label": { px: 0.75 } }}
          />
        )}

        {isEmpty ? (
          <Typography
            variant="body2"
            color="text.disabled"
            sx={{ fontStyle: "italic", mt: isInitial ? 0 : 1 }}
          >
            {STR.workflowEditor.emptyStatePlaceholder}
          </Typography>
        ) : (
          <>
            <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.3 }}>
              {state.name}
            </Typography>
            {state.description && (
              <Typography
                variant="caption"
                sx={{
                  color:
                    (tokens?.semantic as { color?: { type?: { muted?: { value?: string } } } })?.color?.type?.muted?.value ?? "text.secondary",
                  lineHeight: 1.4,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {state.description}
              </Typography>
            )}
          </>
        )}

        {/* Protected indicator (has guarded transitions) */}
        {hasGuardedTransitions && (
          <Stack direction="row" alignItems="center" gap={0.5} sx={{ mt: "auto" }}>
            <LockedIcon sx={{ fontSize: 12, color: "text.disabled" }} />
            <Typography variant="caption" color="text.disabled" sx={{ fontStyle: "italic", fontSize: "0.65rem" }}>
              {STR.workflowManagement.protectedStep}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

// ─── Connection element ───────────────────────────────────────────────────────

interface ConnectionElementProps {
  transition: TransitionDraft;
  isSelected: boolean;
  onClick: () => void;
}

const ConnectionElement: FC<ConnectionElementProps> = ({ transition, isSelected, onClick }) => {
  const isEmpty = !transition.eventName.trim();

  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={0.5}
      sx={{ flexShrink: 0, px: 0.5 }}
    >
      {/* Left arm */}
      <Box
        sx={{
          width: 20,
          height: 2,
          backgroundColor: isSelected ? "primary.main" : "divider",
          flexShrink: 0,
        }}
      />

      {/* Clickable trigger chip */}
      <Tooltip
        title={isEmpty ? STR.workflowEditor.connectionEmptyTooltip : STR.workflowEditor.connectionClickTooltip}
        placement="top"
      >
        <Chip
          label={isEmpty ? STR.workflowEditor.connectionEmptyLabel : transition.eventName}
          size="small"
          variant={isSelected ? "filled" : "outlined"}
          color={isSelected ? "primary" : "default"}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onClick();
            }
          }}
          aria-label={isEmpty
            ? STR.workflowEditor.connectionEmptyAriaLabel
            : `${STR.workflowEditor.connectionAriaLabel}: ${transition.eventName}`}
          aria-pressed={isSelected}
          sx={{
            fontFamily: isEmpty ? "inherit" : "monospace",
            fontSize: isEmpty ? "0.65rem" : "0.7rem",
            cursor: "pointer",
            border: isEmpty ? "1px dashed" : undefined,
            borderColor: isEmpty ? "divider" : undefined,
            color: isEmpty ? "text.disabled" : undefined,
          }}
        />
      </Tooltip>

      {/* Right arm + arrowhead */}
      <Box
        sx={{
          width: 20,
          height: 2,
          backgroundColor: isSelected ? "primary.main" : "divider",
          flexShrink: 0,
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            right: -6,
            top: "50%",
            transform: "translateY(-50%)",
            width: 0,
            height: 0,
            borderTop: "5px solid transparent",
            borderBottom: "5px solid transparent",
            borderLeft: `6px solid ${isSelected ? "var(--mui-palette-primary-main, #1976d2)" : "var(--mui-palette-divider, #e0e0e0)"}`,
          },
        }}
      />
    </Stack>
  );
};

// ─── Add button ───────────────────────────────────────────────────────────────

interface AddStageButtonProps {
  onClick: () => void;
}

const AddStageButton: FC<AddStageButtonProps> = ({ onClick }) => (
  <Stack
    direction="row"
    alignItems="center"
    gap={0.5}
    sx={{ flexShrink: 0 }}
  >
    {/* Connector arm before the add button */}
    <Box sx={{ width: 16, height: 2, backgroundColor: "divider", flexShrink: 0 }} />

    <Tooltip title={STR.workflowEditor.addNextStageTooltip} placement="top">
      <IconButton
        size="small"
        aria-label={STR.workflowEditor.addNextStageAriaLabel}
        onClick={onClick}
        sx={{
          border: "2px dashed",
          borderColor: "divider",
          borderRadius: 2,
          width: 40,
          height: 40,
          "&:hover": { borderColor: "primary.main", color: "primary.main" },
        }}
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  </Stack>
);

// ─── Empty canvas ─────────────────────────────────────────────────────────────

interface EmptyCanvasProps {
  onClickPlaceholder: () => void;
}

const EmptyCanvas: FC<EmptyCanvasProps> = ({ onClickPlaceholder }) => (
  <Stack alignItems="center" justifyContent="center" sx={{ py: 8, gap: 2 }}>
    <Typography variant="body1" color="text.secondary" textAlign="center">
      {STR.workflowEditor.emptyCanvasMessage}
    </Typography>
    <Button variant="outlined" onClick={onClickPlaceholder}>
      {STR.workflowEditor.emptyCanvasAction}
    </Button>
  </Stack>
);

// ─── Canvas ───────────────────────────────────────────────────────────────────

const WorkflowTemplateCanvas: FC<WorkflowTemplateCanvasProps> = ({
  draft,
  selectedItem,
  onSelectState,
  onSelectTransition,
  onAddNextStage,
}) => {
  const { states } = draft;

  if (states.length === 0) {
    return <EmptyCanvas onClickPlaceholder={() => onAddNextStage("")} />;
  }

  // Find the last state — the + button goes after it (if it has no outgoing transitions yet)
  const lastState = states[states.length - 1];
  const lastStateHasTransition = (lastState?.transitions.length ?? 0) > 0;
  // Show add button after the last state only when it has no outgoing transitions
  const showAddAfterLast = !lastStateHasTransition && lastState !== undefined;

  return (
    <Box sx={{ overflowX: "auto", pb: 2 }}>
      <Stack
        direction="row"
        alignItems="center"
        sx={{ minWidth: "max-content", gap: 0, py: 1 }}
      >
        {states.map((state, index) => {
          const isStateSelected =
            selectedItem?.type === "state" && selectedItem.stateDraftId === state.draftId;

          return (
            <Stack key={state.draftId} direction="row" alignItems="center">
              {/* State node */}
              <StateNode
                state={state}
                isInitial={index === 0}
                isSelected={isStateSelected}
                onClick={() => onSelectState(state.draftId)}
              />

              {/* Outgoing transition connections */}
              {state.transitions.map((transition) => {
                const isTransSelected =
                  selectedItem?.type === "transition" &&
                  selectedItem.stateDraftId === state.draftId &&
                  selectedItem.transitionDraftId === transition.draftId;

                // Find the target state
                const targetState = states.find((s) => s.draftId === transition.targetDraftId);
                const targetIndex = targetState ? states.indexOf(targetState) : -1;

                // Only render the connection to immediately adjacent states (linear flow)
                if (targetIndex === index + 1) {
                  return (
                    <ConnectionElement
                      key={transition.draftId}
                      transition={transition}
                      isSelected={isTransSelected}
                      onClick={() => onSelectTransition(state.draftId, transition.draftId)}
                    />
                  );
                }
                return null;
              })}

              {/* Add button after last state */}
              {index === states.length - 1 && showAddAfterLast && (
                <AddStageButton onClick={() => onAddNextStage(state.draftId)} />
              )}
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
};

export default WorkflowTemplateCanvas;
