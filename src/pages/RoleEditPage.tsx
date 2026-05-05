import type { FC } from "react";
import { useLayoutEffect, useMemo } from "react";
import { Alert, Button, Stack, Typography } from "@mui/material";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import PageLayout from "../components/PageLayout.js";
import { STR } from "../utils/i18n.js";
import { CustomRoleEditView } from "../features/roleAccessControl/CustomRoleEditView.js";
import { putPersistedPrototypeRole } from "../features/roleAccessControl/prototypePersistedRolesStore.js";
import { resolveRoleEditModelForEditor } from "../features/roleAccessControl/resolveRoleEditModelForEditor.js";
import {
  duplicateRoleEditModel,
  getDefaultRoleEditModel,
} from "../features/roleAccessControl/sampleData.js";

type RoleEditLocationState = {
  duplicateFromRoleId?: string;
};

/**
 * Creates the duplicate, persists it immediately (prototype “autosave”), then replaces the URL
 * with `/roles/{id}/edit` so refresh and deep links resolve to the saved role.
 */
const DuplicateRoleBootstrap: FC<{ duplicateFromRoleId: string }> = ({ duplicateFromRoleId }) => {
  const navigate = useNavigate();
  const model = useMemo(() => {
    const base = resolveRoleEditModelForEditor(duplicateFromRoleId);
    if (!base) return null;
    const dup = duplicateRoleEditModel(base);
    dup.name = `${base.name.trimEnd()}${STR.roleAccess.roleDuplicateNameSuffix}`;
    return dup;
  }, [duplicateFromRoleId]);

  useLayoutEffect(() => {
    if (!model) return;
    putPersistedPrototypeRole(model);
    navigate(`/roles/${model.id}/edit`, { replace: true });
  }, [model, navigate]);

  if (!model) {
    return (
      <PageLayout>
        <Stack gap={2}>
          <Alert severity="info">{STR.roleAccess.prototypeNoEditor}</Alert>
          <Button component={Link} to="/roles" variant="outlined" sx={{ alignSelf: "flex-start" }}>
            {STR.roleAccess.crumbRoles}
          </Button>
        </Stack>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 240 }} gap={1}>
        <Typography variant="body2" color="text.secondary">
          {STR.roleAccess.creatingDuplicateRole}
        </Typography>
      </Stack>
    </PageLayout>
  );
};

const RoleEditPage: FC = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const location = useLocation();
  const duplicateFromRoleId = (location.state as RoleEditLocationState | null)?.duplicateFromRoleId;

  if (roleId === "new") {
    if (!duplicateFromRoleId) {
      return (
        <PageLayout>
          <Stack gap={2}>
            <Alert severity="info">{STR.roleAccess.duplicateMissingSource}</Alert>
            <Button component={Link} to="/roles" variant="outlined" sx={{ alignSelf: "flex-start" }}>
              {STR.roleAccess.crumbRoles}
            </Button>
          </Stack>
        </PageLayout>
      );
    }
    return <DuplicateRoleBootstrap duplicateFromRoleId={duplicateFromRoleId} />;
  }

  const model = roleId ? resolveRoleEditModelForEditor(roleId) : undefined;

  if (!model) {
    return (
      <PageLayout>
        <Stack gap={2}>
          <Alert severity="info">{STR.roleAccess.prototypeNoEditor}</Alert>
          <Button component={Link} to={`/roles/${getDefaultRoleEditModel().id}/edit`} variant="outlined" sx={{ alignSelf: "flex-start" }}>
            {STR.roleAccess.openSampleRole}
          </Button>
        </Stack>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <CustomRoleEditView initialModel={model} />
    </PageLayout>
  );
};

export default RoleEditPage;
