import { Fragment, useState } from "react";
import type { FC } from "react";
import { Box, Chip, Stack, Typography, useTheme } from "@mui/material";
import LockedIcon from "@diligentcorp/atlas-react-bundle/icons/Locked";
import type { StateViewModel, WorkflowTemplate } from "./types.js";
import type { StatusIndicatorColor } from "./draftTypes.js";
import WorkflowDetailDrawer from "./WorkflowDetailDrawer.js";
import { STR } from "../../utils/i18n.js";

// ─── Color maps ───────────────────────────────────────────────────────────────

/**
 * Maps the editor's StatusIndicatorColor to the board's StateViewModel color.
 * The board uses MUI Chip color names; the editor uses Atlas StatusIndicator names.
 */
const EDITOR_TO_BOARD_COLOR: Record<StatusIndicatorColor, StateViewModel["color"]> = {
  subtle: "default",
  information: "info",
  warning: "warning",
  success: "success",
  error: "default", // no direct error variant on the board
  generic: "default",
};

const STATUS_BG: Record<StateViewModel["color"], string> = {
  default: "var(--lens-semantic-color-surface-subtle, #f5f5f5)",
  info: "var(--lens-semantic-color-status-info-subtle, #e8f4fd)",
  warning: "var(--lens-semantic-color-status-warning-subtle, #fff8e1)",
  success: "var(--lens-semantic-color-status-success-subtle, #e8f5e9)",
};

const STATUS_BORDER: Record<StateViewModel["color"], string> = {
  default: "#bdbdbd",
  info: "#64b5f6",
  warning: "#ffb74d",
  success: "#81c784",
};

const STATUS_CHIP_COLOR: Record<
  StateViewModel["color"],
  "default" | "info" | "warning" | "success"
> = {
  default: "default",
  info: "info",
  warning: "warning",
  success: "success",
};

// ─── State card ───────────────────────────────────────────────────────────────

interface StateCardProps {
  state: StateViewModel;
  isSelected: boolean;
  onClick: () => void;
}

const StateCard: FC<StateCardProps> = ({ state, isSelected, onClick }) => {
  const { tokens } = useTheme() as {
    tokens: Record<string, unknown> & {
      semantic?: {
        color?: {
          type?: {
            default?: { value?: string };
            muted?: { value?: string };
          };
        };
      };
    };
  };

  const isProtected = state.transitions.some(
    (t) => t.guards.length > 0 || t.actions.length > 0,
  );
  const firstTransition = state.transitions[0];
  const isTerminal = state.transitions.length === 0;

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      aria-label={`${state.label} — ${state.summary}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      sx={{
        flexShrink: 0,
        width: 220,
        borderRadius: 2,
        border: "2px solid",
        borderColor: isSelected ? STATUS_BORDER[state.color] : "transparent",
        backgroundColor: STATUS_BG[state.color],
        p: 2,
        cursor: "pointer",
        outline: "none",
        transition: "box-shadow 150ms, border-color 150ms",
        boxShadow: isSelected ? 3 : 1,
        "&:hover": { boxShadow: 3 },
        "&:focus-visible": {
          outline: "2px solid",
          outlineColor: STATUS_BORDER[state.color],
          outlineOffset: 2,
        },
      }}
    >
      <Stack gap={1}>
        <Chip
          label={state.label}
          size="small"
          color={STATUS_CHIP_COLOR[state.color]}
          variant={state.color === "default" ? "outlined" : "filled"}
          sx={{ alignSelf: "flex-start", fontWeight: 600 }}
        />
        <Typography
          variant="body2"
          sx={{
            color:
              (
                tokens?.semantic as {
                  color?: { type?: { default?: { value?: string } } };
                }
              )?.color?.type?.default?.value ?? "text.primary",
            lineHeight: 1.4,
          }}
        >
          {state.summary}
        </Typography>

        {/* Outgoing event name */}
        {!isTerminal && firstTransition && (
          <Stack direction="row" alignItems="center" gap={0.5} sx={{ mt: 0.25 }}>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.65rem" }}>
              {STR.workflowManagement.eventLabel}
            </Typography>
            <Chip
              label={firstTransition.eventName}
              size="small"
              variant="outlined"
              sx={{
                fontFamily: "monospace",
                fontSize: "0.6rem",
                height: 18,
                "& .MuiChip-label": { px: 0.75 },
              }}
            />
          </Stack>
        )}

        {/* Protected indicator */}
        {isProtected && (
          <Stack direction="row" alignItems="center" gap={0.5}>
            <LockedIcon
              sx={{
                fontSize: 12,
                color:
                  (
                    tokens?.semantic as {
                      color?: { type?: { muted?: { value?: string } } };
                    }
                  )?.color?.type?.muted?.value ?? "text.secondary",
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color:
                  (
                    tokens?.semantic as {
                      color?: { type?: { muted?: { value?: string } } };
                    }
                  )?.color?.type?.muted?.value ?? "text.secondary",
                fontStyle: "italic",
              }}
            >
              {STR.workflowManagement.protectedStep}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

// ─── Arrow ────────────────────────────────────────────────────────────────────

const Arrow: FC = () => (
  <Box
    aria-hidden
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      color: "text.secondary",
      fontSize: "1.5rem",
      px: 0.5,
      mt: "10px",
    }}
  >
    →
  </Box>
);

// ─── Template metadata bar ────────────────────────────────────────────────────

interface TemplateBadgesProps {
  template: WorkflowTemplate;
}

const TemplateBadges: FC<TemplateBadgesProps> = ({ template }) => (
  <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
    <Chip
      label={`v${template.version}`}
      size="small"
      variant="outlined"
      color="default"
      sx={{ fontWeight: 600 }}
    />
    <Chip label={template.service} size="small" variant="outlined" color="default" />
    <Typography variant="caption" color="text.secondary">
      {STR.workflowManagement.templateMetaOrg(template.org_id)}
    </Typography>
  </Stack>
);

// ─── Board ────────────────────────────────────────────────────────────────────

interface WorkflowTemplateBoardProps {
  template: WorkflowTemplate;
  states: StateViewModel[];
  /**
   * Optional color overrides keyed by FSM state name (e.g. "in_review").
   * Passed back from the editor via router state so board colors stay in sync
   * after the user edits the template. Values use the editor's StatusIndicatorColor.
   */
  colorOverrides?: Record<string, StatusIndicatorColor>;
}

const WorkflowTemplateBoard: FC<WorkflowTemplateBoardProps> = ({
  template,
  states,
  colorOverrides,
}) => {
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const selectedState = states.find((s) => s.id === selectedStateId) ?? null;

  const handleCardClick = (id: string) => {
    setSelectedStateId((prev) => (prev === id ? null : id));
  };

  return (
    <>
      <TemplateBadges template={template} />

      {/* Board */}
      <Box sx={{ overflowX: "auto", pb: 2 }}>
        <Stack direction="row" alignItems="flex-start" gap={0} sx={{ minWidth: "max-content" }}>
          {states.map((state, index) => {
            // Apply editor color overrides when available
            const overrideColor =
              colorOverrides?.[state.id] != null
                ? EDITOR_TO_BOARD_COLOR[colorOverrides[state.id]]
                : undefined;
            const resolvedState: StateViewModel = overrideColor
              ? { ...state, color: overrideColor }
              : state;

            return (
              <Fragment key={state.id}>
                <StateCard
                  state={resolvedState}
                  isSelected={selectedStateId === state.id}
                  onClick={() => handleCardClick(state.id)}
                />
                {index < states.length - 1 && <Arrow />}
              </Fragment>
            );
          })}
        </Stack>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
        {STR.workflowManagement.boardHint}
      </Typography>

      {/* Detail panel */}
      {selectedState && (
        <WorkflowDetailDrawer
          state={selectedState}
          allStates={states}
          onClose={() => setSelectedStateId(null)}
        />
      )}
    </>
  );
};

export default WorkflowTemplateBoard;
