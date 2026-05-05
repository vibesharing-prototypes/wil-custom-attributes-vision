# Custom Attributes Vision

## What this is

A prototype for managing custom attributes, role-based access control, and workflow templates within an enterprise risk management system. Built for internal stakeholders to explore schema management (defining custom attributes on risk objects), role permission assignment, and workflow state/transition modeling. The prototype is password-gated and includes deployment metadata for tracking active versions.

## Key pages and components

- **Schema Management** (`/`) — Create, edit, reorder, and delete custom attributes; view audit logs of changes; manage attribute types (text, select, currency, etc.) with deprecation support
- **Roles Home** (`/roles`) — View and manage role definitions with permission levels
- **Role Edit** (`/roles/:roleId/edit`) — Edit individual role permissions and view activity logs
- **Workflows Placeholder** (`/workflows`) — Stub page for workflow features
- **Workflow Template Editor** (`/workflows/template/edit`) — Canvas-based editor for workflow states and transitions; instance table viewer
- **Attribute Renderer** — Reusable component for displaying custom attributes with label, value, and description parts
- **Navigation** — Left rail with theme toggle (Lens/Light/Dark) and deployment indicator showing active prototype channel

## Tech stack

- **React 18** + TypeScript + Vite
- **MUI (Material-UI)** for components and styling
- **React Router** for navigation
- **Atlas React Bundle** (Diligent's design system) for global nav and icons
- **Drag-and-drop** support for attribute reordering
- **Prototype persistence** via in-memory stores (not production databases)

## Current state

Schema management, roles, and workflow template editing are functionally prototyped with UI forms, lists, and editors. Workflows and some role features are partially complete or placeholder. All data is ephemeral (prototype stores). Password authentication and deployment metadata are working.