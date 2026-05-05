import type { FC } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  InputAdornment,
  Link,
  ListSubheader,
  Menu,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@diligentcorp/atlas-react-bundle/icons/Add";
import ExternalLink from "@diligentcorp/atlas-react-bundle/icons/ExternalLink";
import SearchIcon from "@diligentcorp/atlas-react-bundle/icons/Search";
import ExportIcon from "@diligentcorp/atlas-react-bundle/icons/Export";
import { useNavigate } from "react-router";
import { useMergedRolesHomeSections } from "./prototypePersistedRolesStore.js";
import { rolesHomeSections } from "./sampleData.js";
import type { RoleApplicationSection, RoleListEntry } from "./types.js";
import { RoleSummaryCard } from "./components/RoleSummaryCard.js";
import { atlasToastAlertSurfaceSx } from "../../utils/atlasToastLayout.js";
import { STR } from "../../utils/i18n.js";
import {
  compactAtlasSx,
  sxSectionTitleH2DisplayEmphasis,
} from "../../utils/atlasTitleTypographySx.js";
import { uiDividerDefaultBorderColor } from "../../utils/uiDividerBorder.js";

const AddRoleMenuButton: FC<{ section: RoleApplicationSection }> = ({ section }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const buttonId = `add-role-${section.id}`;
  const menuId = `add-role-menu-${section.id}`;

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectRole = (roleId: string) => {
    handleClose();
    navigate("/roles/new/edit", { state: { duplicateFromRoleId: roleId } });
  };

  return (
    <>
      <Button
        id={buttonId}
        variant="text"
        size="medium"
        startIcon={<AddIcon slot="icon" />}
        aria-controls={open ? menuId : undefined}
        aria-expanded={open ? "true" : undefined}
        aria-haspopup="true"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ flexShrink: 0 }}
      >
        {STR.roleAccess.addRole}
      </Button>
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          list: {
            "aria-labelledby": buttonId,
            dense: true,
          },
        }}
      >
        <ListSubheader
          disableSticky
          sx={({ tokens }) => ({
            typography: "caption",
            fontWeight: 600,
            lineHeight: 1.5,
            color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
          })}
        >
          {STR.roleAccess.addRoleMenuOptionsHeader}
        </ListSubheader>
        {section.roles.map((role, index) => (
          <MenuItem
            key={role.id}
            dense
            autoFocus={index === 0}
            onClick={() => handleSelectRole(role.id)}
            sx={{ pr: 1.5 }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              gap={1}
              sx={{ width: "100%", minWidth: 0 }}
            >
              <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }} noWrap>
                {role.name}
              </Typography>
              {role.kind === "custom" ? (
                <Chip
                  size="small"
                  label={STR.roleAccess.chipCustom}
                  variant="outlined"
                  sx={({ tokens }) => ({
                    flexShrink: 0,
                    borderColor: uiDividerDefaultBorderColor(tokens),
                  })}
                />
              ) : null}
            </Stack>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

/** Filter a section's roles to those matching the query; returns null if nothing matches at all. */
function filterSection(
  section: RoleApplicationSection,
  query: string,
): { section: RoleApplicationSection; roles: RoleListEntry[] } | null {
  if (!query) return { section, roles: section.roles };

  const q = query.toLowerCase();
  const sectionMatches = section.applicationName.toLowerCase().includes(q);
  const matchingRoles = section.roles.filter((r) => r.name.toLowerCase().includes(q));

  if (!sectionMatches && matchingRoles.length === 0) return null;

  // If section name matches, show all roles; otherwise show only matching roles
  return { section, roles: sectionMatches ? section.roles : matchingRoles };
}

/** Whether the Asset Inventory section title matches the query. */
function assetInventorySectionMatchesQuery(query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return STR.roleAccess.assetInventorySectionTitle.toLowerCase().includes(q);
}

/** Triggers a browser download for the roles CSV file. */
function downloadRolesCSV(): void {
  const csvContent = "product,role,total_assignments\n";
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "roles_assignments.csv";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export const RolesHomeView: FC = () => {
  const mergedSections = useMergedRolesHomeSections(rolesHomeSections);
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadToastOpen, setDownloadToastOpen] = useState(false);
  const downloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleExport = useCallback(() => {
    setDownloadToastOpen(true);
    // Simulate a brief processing delay, then trigger the real browser download
    downloadTimerRef.current = setTimeout(() => {
      downloadRolesCSV();
      setDownloadToastOpen(false);
      downloadTimerRef.current = null;
    }, 1500);
  }, []);

  const handleCancelDownload = useCallback(() => {
    if (downloadTimerRef.current !== null) {
      clearTimeout(downloadTimerRef.current);
      downloadTimerRef.current = null;
    }
    setDownloadToastOpen(false);
  }, []);

  const filteredSections = useMemo(() => {
    return mergedSections
      .map((section) => filterSection(section, searchQuery))
      .filter((result): result is NonNullable<typeof result> => result !== null);
  }, [mergedSections, searchQuery]);

  const showAssetInventory = assetInventorySectionMatchesQuery(searchQuery);
  const hasResults = showAssetInventory || filteredSections.length > 0;

  return (
    <Stack gap={3}>
      {/* Search + Export toolbar */}
      <Stack direction="row" alignItems="center" gap={2} flexWrap="wrap">
        <TextField
          placeholder={STR.roleAccess.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="medium"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon aria-hidden fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ flexGrow: 1, maxWidth: 400 }}
          aria-label={STR.roleAccess.searchPlaceholder}
        />
        <Tooltip title={STR.roleAccess.exportTooltip} placement="bottom">
          <Button
            variant="text"
            size="medium"
            startIcon={<ExportIcon aria-hidden />}
            onClick={handleExport}
            disabled={downloadToastOpen}
            aria-label={STR.roleAccess.exportButton}
          >
            {STR.roleAccess.exportButton}
          </Button>
        </Tooltip>
      </Stack>

      {/* Asset Inventory — static section, visible when query matches */}
      {showAssetInventory && (
        <Stack gap={2}>
          <Box
            component="h2"
            sx={({ tokens }) =>
              compactAtlasSx(
                sxSectionTitleH2DisplayEmphasis({ tokens: tokens as unknown as Record<string, unknown> }),
              )
            }
          >
            {STR.roleAccess.assetInventorySectionTitle}
          </Box>
          <Card
            variant="outlined"
            sx={({ tokens }) => ({
              borderRadius: 2,
              borderColor: uiDividerDefaultBorderColor(tokens),
              p: 0,
            })}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "stretch", sm: "center" }}
              justifyContent="space-between"
              gap={2}
              sx={{ p: 2 }}
            >
              <Typography variant="body1" sx={{ flex: 1, minWidth: 0 }}>
                {STR.roleAccess.assetInventoryManagedBody}
              </Typography>
              <Button
                component="a"
                href="#"
                onClick={(e) => e.preventDefault()}
                variant="outlined"
                size="medium"
                endIcon={<ExternalLink aria-hidden />}
                sx={{ flexShrink: 0, alignSelf: { xs: "flex-start", sm: "center" } }}
              >
                {STR.roleAccess.manageInUsers}
              </Button>
            </Stack>
          </Card>
        </Stack>
      )}

      {/* Dynamic role sections */}
      {filteredSections.map(({ section, roles }) => (
        <Stack key={section.id} gap={2}>
          <Stack direction={{ xs: "column", md: "row" }} gap={2} justifyContent="space-between" alignItems={{ md: "flex-start" }}>
            <Box>
              <Box
                component="h2"
                sx={({ tokens }) =>
                  compactAtlasSx(
                    sxSectionTitleH2DisplayEmphasis({
                      tokens: tokens as unknown as Record<string, unknown>,
                    }),
                  )
                }
              >
                {section.applicationName}
              </Box>
              <Typography variant="body1" sx={({ tokens }) => ({ color: tokens.semantic.color.type?.muted?.value ?? "text.secondary", mt: 0.5 })}>
                {section.description}{" "}
                <Link href="#" onClick={(e) => e.preventDefault()} sx={{ cursor: "default" }}>
                  {STR.roleAccess.learnMore}
                </Link>
              </Typography>
            </Box>
            <AddRoleMenuButton section={section} />
          </Stack>

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
            }}
          >
            {roles.map((role) => (
              <RoleSummaryCard key={role.id} role={role} editPath={`/roles/${role.id}/edit`} />
            ))}
          </Box>
        </Stack>
      ))}

      {/* Empty state when search yields no results */}
      {!hasResults && (
        <Typography
          variant="body2"
          sx={({ tokens }) => ({
            color: tokens.semantic.color.type?.muted?.value ?? "text.secondary",
            textAlign: "center",
            py: 4,
          })}
        >
          {STR.roleAccess.searchNoResults}
        </Typography>
      )}

      {/* Download in-progress toast */}
      <Snackbar
        open={downloadToastOpen}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ top: "88px !important", right: "24px !important" }}
      >
        <Alert
          severity="info"
          sx={atlasToastAlertSurfaceSx}
          icon={<CircularProgress size={20} color="inherit" aria-hidden />}
          action={
            <Button
              variant="text"
              size="medium"
              color="inherit"
              onClick={handleCancelDownload}
            >
              Cancel
            </Button>
          }
          aria-live="polite"
        >
          Your download is in progress and it may take few seconds to complete.
        </Alert>
      </Snackbar>
    </Stack>
  );
};
