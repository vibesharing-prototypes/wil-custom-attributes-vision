import { AppLayout } from "@diligentcorp/atlas-react-bundle";
import { Outlet, Route, Routes } from "react-router";
import "./styles.css";

import Navigation from "./Navigation.js";
import ObjectListPage from "./pages/ObjectListPage.js";
import ObjectDetailPage from "./pages/ObjectDetailPage.js";
import RecordDetailPage from "./pages/RecordDetailPage.js";
import SchemaManagementPage from "./pages/SchemaManagementPage.js";
import RolesHomePage from "./pages/RolesHomePage.js";
import RoleEditPage from "./pages/RoleEditPage.js";
import WorkflowsPlaceholderPage from "./pages/WorkflowsPlaceholderPage.js";
import WorkflowTemplateEditorPage from "./pages/WorkflowTemplateEditorPage.js";

/**
 * Vision (v2) prototype routes. Schema management, roles, and workflows only —
 * explorations live in the lab prototype.
 */
export default function App() {
  return (
    <Routes>
      <Route
        element={
          <AppLayout orgName="Acme Corp" navigation={<Navigation />}>
            <Outlet />
          </AppLayout>
        }
      >
        <Route path="/" element={<ObjectListPage />} />
        <Route path="/objects/:objectType" element={<ObjectDetailPage />} />
        <Route path="/objects/:objectType/records/:recordId" element={<RecordDetailPage />} />
        <Route path="/objects/:objectType/schema" element={<SchemaManagementPage />} />
        <Route path="/workflows" element={<WorkflowsPlaceholderPage />} />
        <Route path="/workflows/template/edit" element={<WorkflowTemplateEditorPage />} />
        <Route path="/roles" element={<RolesHomePage />} />
        <Route path="/roles/:roleId/edit" element={<RoleEditPage />} />
      </Route>
    </Routes>
  );
}
