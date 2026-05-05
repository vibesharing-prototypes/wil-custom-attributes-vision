import type { FC } from "react";
import { uiDividerDefaultBorderColor } from "../../../utils/uiDividerBorder.js";
import { Box, Card, Chip, Stack, Typography } from "@mui/material";
import { Link } from "react-router";
import type { RoleListEntry } from "../types.js";
import { STR } from "../../../utils/i18n.js";

interface Props {
  role: RoleListEntry;
  editPath: string;
}

export const RoleSummaryCard: FC<Props> = ({ role, editPath }) => {
  return (
    <Card
      variant="outlined"
      sx={({ tokens }) => ({
        borderRadius: 2,
        borderColor: uiDividerDefaultBorderColor(tokens),
        p: 0,
      })}
    >
      <Box
        component={Link}
        to={editPath}
        sx={{
          alignItems: "flex-start",
          color: "inherit",
          display: "flex",
          flexDirection: "column",
          p: 2,
          textAlign: "left",
          textDecoration: "none",
          "&:hover": { opacity: 0.92 },
        }}
      >
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
          {role.name}
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={0.75}>
          <Chip
            size="small"
            label={role.kind === "ootb" ? STR.roleAccess.chipOotb : STR.roleAccess.chipCustom}
            variant="outlined"
            sx={({ tokens }) => ({
              borderColor: uiDividerDefaultBorderColor(tokens),
            })}
          />
          {role.derivedRoleCount != null && role.derivedRoleCount > 0 && (
            <Chip
              size="small"
              variant="outlined"
              label={STR.roleAccess.chipDerivedCount(role.derivedRoleCount)}
              sx={({ tokens }) => ({
                borderColor: uiDividerDefaultBorderColor(tokens),
              })}
            />
          )}
          {role.basedOnRoleName != null && (
            <Chip
              size="small"
              variant="outlined"
              label={STR.roleAccess.chipBasedOn(role.basedOnRoleName)}
              sx={({ tokens }) => ({
                borderColor: uiDividerDefaultBorderColor(tokens),
              })}
            />
          )}
        </Stack>
        <Box sx={{ flex: 1 }} />
      </Box>
    </Card>
  );
};
