import { useState } from "react";
import type { FC } from "react";
import { Button, Stack, Typography } from "@mui/material";
import HistoryIcon from "@diligentcorp/atlas-react-bundle/icons/History";
import PageLayout from "../components/PageLayout.js";
import { STR } from "../utils/i18n.js";
import {
  compactAtlasSx,
  sxPageTitleH1BillboardEmphasis,
} from "../utils/atlasTitleTypographySx.js";
import { RolesHomeView } from "../features/roleAccessControl/RolesHomeView.js";
import { ActivityLogsSheet } from "../features/roleAccessControl/components/ActivityLogsSheet.js";

const RolesHomePage: FC = () => {
  const [activityLogsOpen, setActivityLogsOpen] = useState(false);

  return (
    <PageLayout>
      <Stack gap={1}>
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          gap={2}
          flexWrap="wrap"
        >
          <Typography
            component="h1"
            sx={({ tokens }) =>
              compactAtlasSx(
                sxPageTitleH1BillboardEmphasis({ tokens: tokens as unknown as Record<string, unknown> }),
              )
            }
          >
            {STR.roleAccess.homeTitle}
          </Typography>
          <Button
            variant="text"
            size="medium"
            startIcon={<HistoryIcon aria-hidden />}
            onClick={() => setActivityLogsOpen(true)}
            aria-label={STR.activityLogs.button}
            sx={{ flexShrink: 0 }}
          >
            {STR.activityLogs.button}
          </Button>
        </Stack>
        <Typography
          component="h2"
          variant="body1"
          sx={({ tokens }) => ({
            m: 0,
            color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
          })}
        >
          {STR.roleAccess.homeSubtitle}
        </Typography>
      </Stack>

      <RolesHomeView />

      <ActivityLogsSheet
        open={activityLogsOpen}
        onClose={() => setActivityLogsOpen(false)}
      />
    </PageLayout>
  );
};

export default RolesHomePage;
