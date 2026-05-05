import { useRef, useState } from "react";
import { NavLink, NavSection, RoutedNavLink } from "@diligentcorp/atlas-react-bundle/global-nav";
import EditFileIcon from "@diligentcorp/atlas-react-bundle/icons/EditFile";
import FlowsIcon from "@diligentcorp/atlas-react-bundle/icons/Flows";
import SettingsIcon from "@diligentcorp/atlas-react-bundle/icons/Settings";
import GroupIcon from "@diligentcorp/atlas-react-bundle/icons/Group";

import { NavigationDeploymentIndicator } from "./components/NavigationDeploymentIndicator.js";
import { useGlobalNavRailExpanded } from "./hooks/useGlobalNavRailExpanded.js";
import { useThemePreference, type TokenMode } from "./contexts/ThemePreferenceContext.js";
import { STR } from "./utils/i18n.js";

/**
 * App navigation reflecting the main prototype surfaces:
 * 1. Schema management (M1) — Risk object schema aligned with the ERM Baseline Configuration
 *    (default view)
 * 2. Roles & permissions — PAC-style role builder prototype (separate from schema management).
 * 3. Workflows — template editor + instance viewer for the Workflows Service FSM prototype.
 *
 * In production, "Schema management" entries would only appear for users with
 * manage_schema:{object_type} permission (M1 FR-1, FR-12).
 *
 * Explorations (BOS variants, schema viewer, permission card styles, form
 * preview) live in the lab prototype only — see `custom-attributes-lab`.
 */
export default function Navigation() {
  const { tokenMode, setTokenMode } = useThemePreference();
  const [configOpen, setConfigOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(true);

  const themeLabels: Record<TokenMode, string> = {
    lens: "Lens (legacy)",
    "atlas-light": "Light",
    "atlas-dark": "Dark",
  };

  const navRootRef = useRef<HTMLDivElement>(null);
  const navRailExpanded = useGlobalNavRailExpanded(navRootRef);

  return (
    <div
      ref={navRootRef}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        alignSelf: "stretch",
        flex: 1,
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          // overflow-y other than visible forces overflow-x to clip; inset content so focus
          // rings on atlas-gn-nav-link are not cropped on the left/right.
          paddingInline: 6,
        }}
      >
      <RoutedNavLink to="/" end label="Schema management">
        <EditFileIcon slot="icon" />
      </RoutedNavLink>

      <RoutedNavLink to="/roles" label="Roles & permissions">
        <GroupIcon slot="icon" />
      </RoutedNavLink>

      <RoutedNavLink to="/workflows" label={STR.workflowsStub.title}>
        <FlowsIcon slot="icon" />
      </RoutedNavLink>

      <hr />

      <NavSection
        label="App settings"
        isOpen={configOpen}
        onOpen={() => setConfigOpen(true)}
        onClose={() => setConfigOpen(false)}
      >
        <SettingsIcon slot="icon" />

        <NavSection
          label="Theme"
          isOpen={themeOpen}
          onOpen={() => setThemeOpen(true)}
          onClose={() => setThemeOpen(false)}
        >
          {(["lens", "atlas-light", "atlas-dark"] as TokenMode[]).map((mode) => (
            <NavLink
              key={mode}
              as="button"
              label={themeLabels[mode]}
              isCurrent={tokenMode === mode}
              onClick={() => setTokenMode(mode)}
            />
          ))}
        </NavSection>
      </NavSection>
      </div>
      <div
        aria-hidden={navRailExpanded ? undefined : true}
        style={{
          flexShrink: 0,
          opacity: navRailExpanded ? 1 : 0,
          maxHeight: navRailExpanded ? 220 : 0,
          overflow: "hidden",
          transition: "opacity 120ms ease-out, max-height 150ms ease-out",
          pointerEvents: navRailExpanded ? "auto" : "none",
        }}
      >
        <NavigationDeploymentIndicator />
      </div>
    </div>
  );
}
