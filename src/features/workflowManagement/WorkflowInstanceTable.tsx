import type { FC } from "react";
import {
  Alert,
  Box,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import AutomatedLockedIcon from "@diligentcorp/atlas-react-bundle/icons/AutomatedLocked";
import type { WorkflowInstance, StateViewModel } from "./types.js";
import { STR } from "../../utils/i18n.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CHIP_COLOR: Record<
  StateViewModel["color"],
  "default" | "info" | "warning" | "success"
> = {
  default: "default",
  info: "info",
  warning: "warning",
  success: "success",
};

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return "1 month ago";
  return `${diffMonths} months ago`;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface WorkflowInstanceTableProps {
  instances: WorkflowInstance[];
  /** View model map keyed by state id — used to look up chip color and label. */
  stateViewModels: StateViewModel[];
}

const WorkflowInstanceTable: FC<WorkflowInstanceTableProps> = ({
  instances,
  stateViewModels,
}) => {
  const stateMap = new Map(stateViewModels.map((s) => [s.id, s]));
  const lockedCount = instances.filter((i) => i.locked_by !== null).length;

  return (
    <Stack gap={2}>
      {/* Section header */}
      <Stack gap={0.5}>
        <Typography variant="h6" component="h2" fontWeight={600}>
          {STR.workflowManagement.instancesTitle}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {STR.workflowManagement.instancesSubtitle}
        </Typography>
      </Stack>

      {/* Lock warning banner when any instance is locked */}
      {lockedCount > 0 && (
        <Alert severity="warning" icon={<AutomatedLockedIcon fontSize="inherit" />}>
          <Typography variant="body2">
            {STR.workflowManagement.instancesLockBanner(lockedCount)}
          </Typography>
        </Alert>
      )}

      {/* Table */}
      <TableContainer
        sx={{
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Table size="small" aria-label={STR.workflowManagement.instancesTableAriaLabel}>
          <TableHead>
            <TableRow
              sx={{ backgroundColor: "var(--lens-semantic-color-surface-subtle, #f5f5f5)" }}
            >
              <TableCell sx={{ fontWeight: 600, py: 1.5 }}>
                {STR.workflowManagement.instanceColObject}
              </TableCell>
              <TableCell sx={{ fontWeight: 600, py: 1.5 }}>
                {STR.workflowManagement.instanceColType}
              </TableCell>
              <TableCell sx={{ fontWeight: 600, py: 1.5 }}>
                {STR.workflowManagement.instanceColState}
              </TableCell>
              <TableCell sx={{ fontWeight: 600, py: 1.5 }}>
                {STR.workflowManagement.instanceColUpdated}
              </TableCell>
              <TableCell sx={{ fontWeight: 600, py: 1.5, width: 40 }} aria-label="Status" />
            </TableRow>
          </TableHead>
          <TableBody>
            {instances.map((instance) => {
              const vm = stateMap.get(instance.state);
              const isLocked = instance.locked_by !== null;

              return (
                <TableRow
                  key={instance.id}
                  sx={{
                    opacity: isLocked ? 0.85 : 1,
                    "&:last-child td, &:last-child th": { border: 0 },
                  }}
                >
                  {/* Object label */}
                  <TableCell>
                    <Typography variant="body2" fontWeight={isLocked ? 500 : 400}>
                      {instance.objectRef.label}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {instance.objectRef.id}
                    </Typography>
                  </TableCell>

                  {/* Object type */}
                  <TableCell>
                    <Chip
                      label={instance.objectRef.objectType}
                      size="small"
                      variant="outlined"
                      sx={{ textTransform: "capitalize" }}
                    />
                  </TableCell>

                  {/* Current state */}
                  <TableCell>
                    {vm ? (
                      <Chip
                        label={vm.label}
                        size="small"
                        color={STATUS_CHIP_COLOR[vm.color]}
                        variant={vm.color === "default" ? "outlined" : "filled"}
                      />
                    ) : (
                      <Chip
                        label={instance.state}
                        size="small"
                        variant="outlined"
                        sx={{ fontFamily: "monospace" }}
                      />
                    )}
                  </TableCell>

                  {/* Last updated */}
                  <TableCell>
                    <Tooltip title={new Date(instance.updated_at).toLocaleString()} placement="top">
                      <Typography variant="caption" color="text.secondary">
                        {formatRelativeDate(instance.updated_at)}
                      </Typography>
                    </Tooltip>
                  </TableCell>

                  {/* Lock indicator */}
                  <TableCell>
                    {isLocked && (
                      <Tooltip title={STR.workflowManagement.instanceLockedTooltip}>
                        <Box
                          component="span"
                          sx={{ display: "inline-flex", alignItems: "center" }}
                        >
                          <AutomatedLockedIcon
                            sx={{ fontSize: 16, color: "warning.main" }}
                            aria-label={STR.workflowManagement.instanceLockedAriaLabel}
                          />
                        </Box>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="caption" color="text.secondary">
        {STR.workflowManagement.instancesFootnote}
      </Typography>
    </Stack>
  );
};

export default WorkflowInstanceTable;
