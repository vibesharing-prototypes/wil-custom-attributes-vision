import type { FC } from "react";
import {
  Alert,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";
import LockedIcon from "@diligentcorp/atlas-react-bundle/icons/Locked";
import type { StateViewModel } from "./types.js";
import { STR } from "../../utils/i18n.js";

// ─── Color helpers ────────────────────────────────────────────────────────────

const STATUS_CHIP_COLOR: Record<
  StateViewModel["color"],
  "default" | "info" | "warning" | "success"
> = {
  default: "default",
  info: "info",
  warning: "warning",
  success: "success",
};

// ─── Component ────────────────────────────────────────────────────────────────

interface WorkflowDetailDrawerProps {
  state: StateViewModel;
  allStates: StateViewModel[];
  onClose: () => void;
}

const WorkflowDetailDrawer: FC<WorkflowDetailDrawerProps> = ({
  state,
  allStates,
  onClose,
}) => {
  const isProtected = state.transitions.some((t) => t.guards.length > 0 || t.actions.length > 0);
  const isTerminal = state.transitions.length === 0;

  return (
    <Drawer
      anchor="right"
      open
      onClose={onClose}
      PaperProps={{
        role: "complementary",
        "aria-label": `${state.label} details`,
        sx: {
          width: { xs: "100%", sm: 440 },
          display: "flex",
          flexDirection: "column",
        },
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
        <Stack gap={1}>
          <Chip
            label={state.label}
            size="small"
            color={STATUS_CHIP_COLOR[state.color]}
            variant={state.color === "default" ? "outlined" : "filled"}
            sx={{ alignSelf: "flex-start", fontWeight: 600 }}
          />
          {isProtected && (
            <Stack direction="row" alignItems="center" gap={0.5}>
              <LockedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                {STR.workflowManagement.protectedStep}
              </Typography>
            </Stack>
          )}
        </Stack>
        <IconButton
          size="small"
          aria-label={STR.workflowManagement.closeDetailPanel}
          onClick={onClose}
          edge="end"
          sx={{ flexShrink: 0, mt: 0.25 }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: "auto", px: 3, py: 2 }}>
        <Stack gap={3}>
          {/* Description */}
          <Stack gap={0.5}>
            <Typography variant="subtitle2" component="h3" fontWeight={600}>
              {STR.workflowManagement.drawerDescription}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {state.description}
            </Typography>
          </Stack>

          <Divider />

          {/* Transitions */}
          {isTerminal ? (
            <Stack gap={0.5}>
              <Typography variant="subtitle2" component="h3" fontWeight={600}>
                {STR.workflowManagement.drawerTransitionsTo}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {STR.workflowManagement.terminalStateNote}
              </Typography>
            </Stack>
          ) : (
            <Stack gap={2}>
              <Typography variant="subtitle2" component="h3" fontWeight={600}>
                {STR.workflowManagement.drawerTransitionsTo}
              </Typography>

              {state.transitions.map((transition) => {
                const targetState = allStates.find((s) => s.id === transition.target);
                return (
                  <Box
                    key={transition.eventName}
                    sx={{
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                      p: 2,
                    }}
                  >
                    <Stack gap={1.5}>
                      {/* Event name + target */}
                      <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                        <Chip
                          label={transition.eventName}
                          size="small"
                          variant="outlined"
                          sx={{ fontFamily: "monospace", fontSize: "0.7rem" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          →
                        </Typography>
                        {targetState && (
                          <Chip
                            label={targetState.label}
                            size="small"
                            color={STATUS_CHIP_COLOR[targetState.color]}
                            variant={targetState.color === "default" ? "outlined" : "filled"}
                          />
                        )}
                        {transition.hasEventSchema && (
                          <Tooltip title={STR.workflowManagement.eventSchemaTooltip}>
                            <Chip
                              label={STR.workflowManagement.eventSchemaChip}
                              size="small"
                              variant="outlined"
                              color="default"
                              sx={{ fontSize: "0.65rem" }}
                            />
                          </Tooltip>
                        )}
                      </Stack>

                      {/* Guards */}
                      {transition.guards.length > 0 && (
                        <Stack gap={0.5}>
                          <Typography variant="caption" fontWeight={600} color="text.primary">
                            {STR.workflowManagement.guardsTitle}
                          </Typography>
                          <Stack gap={0.5}>
                            {transition.guards.map((guard) => (
                              <Stack
                                key={guard.name}
                                direction="row"
                                alignItems="center"
                                gap={1}
                              >
                                <Chip
                                  label={STR.workflowManagement.guardTypeBadge}
                                  size="small"
                                  variant="outlined"
                                  color="warning"
                                  sx={{ fontSize: "0.65rem", flexShrink: 0 }}
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontFamily: "monospace" }}
                                >
                                  {guard.name}
                                </Typography>
                              </Stack>
                            ))}
                          </Stack>
                        </Stack>
                      )}

                      {/* Actions */}
                      {transition.actions.length > 0 && (
                        <Stack gap={0.5}>
                          <Typography variant="caption" fontWeight={600} color="text.primary">
                            {STR.workflowManagement.actionsTitle}
                          </Typography>
                          <Stack gap={0.5}>
                            {transition.actions.map((action) => (
                              <Stack
                                key={action.name}
                                direction="row"
                                alignItems="center"
                                gap={1}
                              >
                                <Chip
                                  label={STR.workflowManagement.actionTypeBadge}
                                  size="small"
                                  variant="outlined"
                                  color="info"
                                  sx={{ fontSize: "0.65rem", flexShrink: 0 }}
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontFamily: "monospace" }}
                                >
                                  {action.name}
                                </Typography>
                              </Stack>
                            ))}
                          </Stack>
                          <Alert severity="info" sx={{ mt: 0.5, py: 0.5 }}>
                            <Typography variant="caption">
                              {STR.workflowManagement.actionAsyncNote}
                            </Typography>
                          </Alert>
                        </Stack>
                      )}
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Stack>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          px: 3,
          py: 1.5,
          borderTop: "1px solid",
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {STR.workflowManagement.drawerFootnote}
        </Typography>
      </Box>
    </Drawer>
  );
};

export default WorkflowDetailDrawer;
