import type { FC } from "react";
import { Alert, Box, Button, Divider, Stack, Typography } from "@mui/material";
import { PageHeader } from "@diligentcorp/atlas-react-bundle";
import EditIcon from "@diligentcorp/atlas-react-bundle/icons/Edit";
import AddIcon from "@diligentcorp/atlas-react-bundle/icons/Add";
import { useLocation, useNavigate } from "react-router";
import PageLayout from "../components/PageLayout.js";
import type { StatusIndicatorColor } from "../features/workflowManagement/draftTypes.js";
import WorkflowTemplateBoard from "../features/workflowManagement/WorkflowTemplateBoard.js";
import WorkflowInstanceTable from "../features/workflowManagement/WorkflowInstanceTable.js";
import {
  RISK_LIFECYCLE_TEMPLATE,
  RISK_LIFECYCLE_STATE_VIEW_MODELS,
  RISK_LIFECYCLE_INSTANCES,
} from "../features/workflowManagement/sampleData.js";
import { STR } from "../utils/i18n.js";

/**
 * Workflow Management page.
 *
 * Surfaces two sub-areas within the single /workflows route:
 *   1. Workflow Template board — states, named transition events, guards, actions.
 *   2. Workflow Instance table — objects currently running against this template.
 *
 * Aligned with the Workflows Service API model (xstate-inspired FSM).
 * Read-only scaffold for stakeholder discussion; editing will come in a later increment.
 */
interface WorkflowsLocationState {
  /** Color overrides keyed by FSM state name, passed back from the template editor. */
  colorOverrides?: Record<string, StatusIndicatorColor>;
}

const WorkflowsPlaceholderPage: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as WorkflowsLocationState | null;
  const colorOverrides = locationState?.colorOverrides;

  return (
    <PageLayout>
      <PageHeader
        pageTitle={STR.workflowManagement.pageTitle}
        pageSubtitle={STR.workflowManagement.pageSubtitle}
      />

      <Alert severity="info" sx={{ mt: 2, mb: 3 }}>
        {STR.workflowManagement.scaffoldNotice}
      </Alert>

      {/* Template editor entry point */}
      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          p: 2,
          mb: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          backgroundColor: "var(--lens-semantic-color-surface-subtle, #fafafa)",
        }}
      >
        <Stack gap={0.25}>
          <Typography variant="subtitle2" fontWeight={600}>
            {STR.workflowEditor.editorEntryTitle}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {STR.workflowEditor.editorEntryHint}
          </Typography>
        </Stack>
        <Stack direction="row" gap={1} flexShrink={0}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            onClick={() =>
              navigate("/workflows/template/edit", {
                state: { mode: "edit", template: RISK_LIFECYCLE_TEMPLATE },
              })
            }
          >
            {STR.workflowEditor.editTemplateButton}
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={() =>
              navigate("/workflows/template/edit", { state: { mode: "new" } })
            }
          >
            {STR.workflowEditor.newTemplateButton}
          </Button>
        </Stack>
      </Box>

      <Stack gap={4}>
        {/* Template board — colorOverrides applied when navigating back from the editor */}
        <WorkflowTemplateBoard
          template={RISK_LIFECYCLE_TEMPLATE}
          states={RISK_LIFECYCLE_STATE_VIEW_MODELS}
          colorOverrides={colorOverrides}
        />

        <Divider />

        {/* Instance table */}
        <WorkflowInstanceTable
          instances={RISK_LIFECYCLE_INSTANCES}
          stateViewModels={RISK_LIFECYCLE_STATE_VIEW_MODELS}
        />
      </Stack>
    </PageLayout>
  );
};

export default WorkflowsPlaceholderPage;
