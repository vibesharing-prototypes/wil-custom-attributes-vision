# Custom attributes: product context

Source documents: Discovery Brief, Design Brief
Last updated: 2026-03-16

---

## Problem

The Object Library provides stable, immutable base schemas for domain objects (risks, controls,
processes, assets, etc.) shared across Diligent's GRC product suite. Customers need a way to
extend these schemas with organization-specific structured data.

Without a consistent mechanism:

- **Risk Manager and Asset Manager are directly blocked** from completing their Object Library
  migration — this is a hard blocker for platform modernization.
- Customers depend on Diligent Professional Services for any schema customization, causing
  onboarding delays and friction.
- AI/agentic workflows (M2 MCP server) cannot understand customer-specific data without
  rich, described metadata on custom attributes.

---

## Solution direction

**Option A: Centralized Schema Management Console** — chosen.

A unified schema management UI built as part of the Object Library, embedded within each host
app. Schema Administrators manage custom attributes for any object type from a single,
consistent interface.

Host apps (Risk Manager, Internal Controls, Asset Manager, Issue Manager) implement the backend
schema management for their own domain objects. The Object Library provides the shared frontend
component layer.

**Why Option A was chosen:**
- Eliminates UX fragmentation across 4+ host apps (the core risk of Option B: distributed)
- Aligns with the Object Library's purpose as a shared foundation across the GRC suite
- Directly unblocks Risk Manager and Asset Manager from completing Object Library adoption
- Creates a single, well-described attribute registry for M2 AI/MCP consumption
- Option C (hybrid: centralized + in-context editing) rejected as premature — too much complexity
  for marginal incremental benefit over Option A at this stage

---

## Two design surfaces

Every UI deliverable in this project serves one of exactly two surfaces:

### 1. Schema management UI (admin-facing)
Where Schema Administrators define, edit, and deprecate custom attributes.
- Built on top of the M0 read-only schema viewer — it extends the same surface, not a new one
- `features/schemaManagement/` in this prototype
- Gated by `manage_schema:{object_type}` permission

### 2. Object detail/edit UI (end-user-facing)
Where End Users see and populate custom attribute values when creating or editing objects.
- Not yet built in M0/M1 prototype; `AttributeRenderer` is the shared component that powers it
- No permission gate — visible to all users who access the object

Both are Object Library frontend components that host apps embed. **Host apps never build their
own implementations of either surface.**

---

## Target personas

| Persona | Role | Key need in this project |
|---|---|---|
| **Platform Administrator** | Manages GRC platform config for their organization | Holistic view of custom attributes across all object types; assigns `manage_schema` permissions |
| **Schema Administrator** | Maintains the schema for a specific object type (e.g., Risk, Control) | Self-service: add, edit, deprecate custom attributes without Diligent intervention. Primary user of M1. |
| **Subject Matter Expert** | Risk Manager, Audit Manager, Compliance Officer | Requests custom attributes to match their methodology; may also act as Schema Administrator |
| **End User** | Risk Analyst, Auditor, Compliance Specialist | Clear, consistent data-entry experience; understands what custom fields mean and why they're required |
| **AI/Automation Systems** | M2 MCP server consumers (Diligent AI agents) | Machine-readable semantic descriptions on all attributes (OOTB and custom) — same quality bar as human-facing descriptions |

---

## Key constraints

| Constraint | Detail |
|---|---|
| **Embedded component model** | All schema viewer and schema management UI is delivered as Object Library components that host apps embed. Host apps never build their own. Design changes flow to all host apps automatically. |
| **Immutable base schemas** | OOTB attribute semantics, data, and internal identifiers cannot be changed. M3 adds display name customization and visibility toggling only. |
| **Soft delete only (M0–M3)** | No hard deletes. Deprecated attributes and deleted sections preserve data. Hard delete and type changes are M5+. |
| **Mandatory descriptions** | Every custom attribute must have a description (M1 FR-3). Same quality bar as OOTB descriptions. The M2 MCP server treats OOTB and custom descriptions as equivalent — agents cannot distinguish them. |
| **Object-type-scoped permissions** | Schema management is gated by `manage_schema:{object_type}`. Permissioned for Risk but not Control = can manage Risk schemas only. |
| **Backward compatibility** | Schema changes must never break existing objects or their stored data. |
| **Atlas DS** | All UI uses Atlas components via `@diligentcorp/atlas-react-bundle`. All styling via `sx` prop with Atlas design tokens — no hardcoded colors, no custom CSS beyond the `.sr-only` utility. |
| **Descriptions serve two audiences** | End users (helper text/tooltip in UI) and M2 AI agents (MCP schema query). Writing for one means writing for both. |

---

## Scope by milestone

| Feature area | M0 | M1 | M2 | M3 |
|---|---|---|---|---|
| 12 attribute type specifications | ✅ | — | — | — |
| Shared UI component library (attribute rendering) | ✅ | — | — | — |
| Read-only OOTB schema viewer | ✅ | — | — | — |
| OOTB semantic descriptions | ✅ | — | — | — |
| Description quality guidelines | ✅ | — | — | — |
| Create/edit/deprecate custom attributes | — | ✅ | — | — |
| Mandatory description field | — | ✅ | — | — |
| Required-field validation | — | ✅ | — | — |
| Object-type-scoped permissions | — | ✅ | — | — |
| Audit logging | — | ✅ | — | — |
| MCP server (AI agent integration) | — | — | ✅ | — |
| Sections (OOTB + custom) | — | — | — | ✅ |
| OOTB attribute visibility toggling | — | — | — | ✅ |
| OOTB display name customization | — | — | — | ✅ |

---

## Permissions model (M1)

Confirmed decisions from PM review (Tommy Kenéz, 2026-03-17):

| Decision | Detail |
|---|---|
| **Flat access model** | All users with schema management access see the same schema version. There are no per-field or per-section read permissions within the schema management page. |
| **All-or-nothing page gate** | If a user lacks `manage_schema:{object_type}`, they do not see the schema management page at all. No partial/read-only degraded view is shown for this surface. |
| **Granular edit permissions** | Not in scope for M1. Future milestones may add write-specific roles (e.g., view-only schema admins), but this is not planned. |
| **Prototype representation** | In the prototype, access is simulated via navigation — no real auth is enforced. In production, host apps are responsible for passing `manage_schema` claims down to the component. |

### Open question: descriptions in the object library

How and where do attribute descriptions surface outside the schema management page?

- **Object detail view**: descriptions as tooltip/helper text on form fields (planned for M1/M2 object detail surface)
- **Object library catalog**: descriptions visible when browsing the object type schema (currently read-only viewer, M0)
- **AI agents (M2 MCP)**: descriptions consumed by the MCP `get_object_schema` tool as semantic context

The format and placement on the object detail form field are not finalized for M1. No changes to prototype needed — this is a design decision for the object detail surface, which is out of scope for this prototype.

---

## Explicitly out of scope

| Item | Milestone |
|---|---|
| MCP server implementation (backend, no prototype UI) | M2 |
| Advanced validation: type-specific rules, cross-attribute rules, conditional visibility | M4 |
| Hard delete and attribute type changes post-creation | M5 |
| Computed/formula fields | M5 |
| Customer-facing MCP access (external AI tool integrations) | Future |
| Schema management via MCP | M5+ |
| OOTB attribute description customization by customers | Out of scope entirely (descriptions are Diligent-owned) |
