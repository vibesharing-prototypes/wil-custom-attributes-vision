# Custom attributes: milestone requirements

Source documents: M0 PRD, M1 PRD, M2 PRD (partial), Design Brief
Last updated: 2026-03-16

---

## Milestone overview

| Feature | M0 | M1 | M2 | M3 |
|---|---|---|---|---|
| Attribute type specifications (all 12) | ✅ | — | — | — |
| UI component library — attribute rendering | ✅ | — | — | — |
| UI component library — schema management shell | ✅ | — | — | — |
| Read-only OOTB schema viewer | ✅ | — | — | — |
| OOTB semantic descriptions | ✅ | — | — | — |
| Description quality guidelines | ✅ | — | — | — |
| Create custom attributes (12 types) | — | ✅ | — | — |
| Mandatory description field | — | ✅ | — | — |
| Mark attributes required/optional | — | ✅ | — | — |
| Mandatory field validation | — | ✅ | — | — |
| Object-type-scoped permissions | — | ✅ | — | — |
| Soft delete / deprecation | — | ✅ | — | — |
| Audit logging | — | ✅ | — | — |
| Display without sections (flat list) | — | ✅ | — | — |
| AI-assisted description suggestion | — | should-have | — | — |
| MCP server (AI agent integration) | — | — | ✅ | — |
| OOTB section definitions | — | — | — | ✅ |
| Custom section creation | — | — | — | ✅ |
| Assign attributes to sections | — | — | — | ✅ |
| Section ordering, collapse/expand | — | — | — | ✅ |
| Move attributes between sections | — | — | — | ✅ |
| Soft delete sections (with reassignment) | — | — | — | ✅ |
| OOTB attribute visibility toggling | — | — | — | ✅ |
| OOTB attribute display name customization | — | — | — | ✅ |

---

## M0: Attribute standards, component library & OOTB semantic descriptions

### Design goals

- Define how each of the 12 attribute types behaves and renders — consistently across all host apps
- Deliver a shared UI component library so host app teams embed compliant implementations
- Design a read-only schema viewer as an Object Library component that host apps embed
- Establish the description quality standard for both OOTB (M0) and custom (M1) attributes

### Functional requirements

| FR | Capability | Priority | Prototype scope |
|---|---|---|---|
| FR-1 | Formal spec for all 12 attribute types (behavior, rendering, validation, edge cases) | Must-have | `src/types/attribute.ts`, `attributeTypeDecisions.md` |
| FR-2 | UI component library — attribute rendering | Must-have | `AttributeRenderer` + parts |
| FR-3 | UI component library — schema management shell | Must-have | `features/schemaManagement/` stub |
| FR-4 | Reference implementation (all 12 types in rendering + schema management) | Must-have | This prototype |
| FR-5 | OOTB attribute descriptions authored for all participating object types | Must-have | `sampleData.ts` (Risk schema) |
| FR-6 | OOTB object descriptions authored | Must-have | `objectDescription` in `sampleData.ts` |
| FR-7 | Description quality guidelines | Must-have | `semantic-descriptions-guidelines.md` |
| FR-8 | Host app adoption/migration guide | Must-have | Out of scope for prototype |
| FR-9 | Shared validation logic | Should-have | M1 prototype |
| FR-10 | GraphQL type definitions | Should-have | Backend — out of scope for prototype |
| FR-11 | Compliance verification process | Should-have | Process — out of scope for prototype |
| FR-12 | OOTB description storage model (versioned, localizable, customer-immutable) | Must-have | Backend — out of scope for prototype |
| FR-13 | GraphQL API exposing OOTB and custom descriptions with consistent shape | Must-have | Backend — out of scope for prototype |
| FR-14 | Read-only schema viewer UI (Object Library component, embedded by host apps) | Must-have | `ReadOnlySchemaViewer` |

### Non-functional requirements

| NFR | Category | Requirement |
|---|---|---|
| NFR-1 | Performance | Page render with 50 custom attributes within 10% of baseline |
| NFR-2 | Scalability | GraphQL API must support 200 custom attributes per object type at P95 < 300ms |
| NFR-3 | Reliability | Schema metadata: 99.9% availability SLO |
| NFR-4 | Security | Schema viewer and management components respect object-type and app-level permissions |
| NFR-5 | Backward compatibility | Introducing M0 must not break existing host app handling of OOTB attributes |
| NFR-6 | Internationalization | Description fields modeled to support per-locale values (should-have) |
| NFR-7 | Observability | Key operations (schema retrieval, attribute rendering, description fetch) instrumented |

### Open UX questions (M0)

1. What does Atlas DS already provide for the 12 attribute types? What gaps need filling?
   → **Consult Atlas MCP server before implementing each type**
2. Where and how should OOTB attribute descriptions surface to end users — tooltip, helper text, or inline?
   → **Decision recorded: inline helper text below label (see `attributeTypeDecisions.md`)**
3. In the read-only viewer, how are attributes organized in the absence of sections?
   → **Decision recorded: flat list in definition order (M1 baseline for M3 migration)**
4. How does the schema viewer component surface within host app navigation — dedicated page, panel, or contextual action?
   → **Prototype decision: dedicated page (`SchemaViewerPage`)**

---

## M1: Custom attribute core lifecycle

### Design goals

- Self-service schema management: Schema Administrators add custom attributes without Diligent intervention
- Every custom attribute carries a mandatory, high-quality semantic description
- Consistent create/edit/deprecate flow regardless of object type or host app
- Clear communication of attribute lifecycle states (active vs. deprecated)
- Validation feedback at the right moment (on save or workflow transition)

### User stories

**US-1: Create a custom attribute**
As a Schema Administrator, I want to define a custom attribute on an object type, so that my organization can capture data the base schema doesn't include.

Acceptance criteria:
- Access schema management for any object type I have `manage_schema:{object_type}` permission for
- Select from all 12 supported attribute types
- Must provide name and description before saving (description is mandatory)
- For select-type attributes, define option list inline during creation
- New attribute appears immediately on the object detail/edit view

**US-2: Mark an attribute as required**
As a Schema Administrator, I want to mark a custom attribute as required, so that end users cannot save or transition an object without populating it.

Acceptance criteria:
- Toggle required/optional on any custom attribute at creation or edit time
- Required attributes are visually indicated on the object detail/edit view
- Clear validation feedback when a required field is empty on save or workflow transition

**US-3: Edit a custom attribute**
As a Schema Administrator, I want to edit an existing attribute's name, description, or configuration, so that I can keep the schema accurate as needs evolve.

Acceptance criteria:
- Edit name, description, required/optional status, and type-specific config
- Attribute type cannot be changed after creation
- Warning shown if attribute already has data on existing objects
- All edits captured in audit log

**US-4: Deprecate a custom attribute**
As a Schema Administrator, I want to deprecate an attribute I no longer need, so that it stops appearing on new objects without losing existing data.

Acceptance criteria:
- Deprecate any active custom attribute
- Shown count of objects currently with data for that attribute before confirming
- Deprecated attributes hidden from create/edit form
- Existing data preserved and accessible
- Deprecated attributes visually distinguishable in schema management UI
- Deprecated attributes can be reactivated

**US-5: View and populate custom attributes as an end user**
As an end user, I want to see and fill in custom attributes on an object, so that I can capture the data my organization requires.

Acceptance criteria:
- Custom attributes appear on the object detail/edit view in a sensible default order
- Each custom attribute shows its description as helper text or tooltip
- Required attributes are clearly marked
- Validation errors shown inline on the relevant field when save attempted with empty required fields

### Happy path: create a custom attribute

1. Schema Administrator navigates to schema management for an object type
2. Selects "Add attribute"
3. Chooses attribute type from the supported list
4. Enters name and description (both required to proceed)
5. Configures type-specific options (e.g., defines option list for Single Select)
6. Optionally marks as required
7. Saves — attribute is immediately active on the object type
8. Change is recorded in audit log

**Alternative: save without description**
System prevents saving; description field shows inline error.

**Alternative: deprecate with existing data**
System shows: "X objects currently have data for this attribute. It will no longer appear on new or edited objects, but existing data will be preserved." → confirm → deprecated.

### Attribute types (canonical list, M1 FR-2)

| Type | Code | Description | Example use |
|---|---|---|---|
| Short text | `text` | Single-line text input | Reference IDs, labels |
| Long text | `longText` | Multi-line rich text | Detailed descriptions, notes |
| Number | `number` | Numeric value | Scores, counts |
| Date | `date` | Calendar date selection | Target dates, review dates |
| Date & time | `dateTime` | Date and time selection | Incident timestamps, review timestamps |
| Single select | `singleSelect` | Dropdown, one choice | Risk category, priority level |
| Multi-select | `multiSelect` | Multiple choices | Applicable regulations, affected departments |
| User | `user` | Single user from org directory | Risk owner, control owner |
| Users | `users` | Multiple users from org directory | Review committee members |
| Boolean | `boolean` | Yes/No | "Subject to SOX", "GDPR applicable" |
| Currency | `currency` | Monetary value with currency code | Estimated impact, remediation cost |
| Attachment | `attachment` | File upload | Supporting evidence, policy documents |

### Functional requirements

| FR | Capability | Priority | Notes |
|---|---|---|---|
| FR-1 | Schema management entry point gated by `manage_schema:{object_type}` | Must-have | Only permissioned users see management UI |
| FR-2 | Create custom attribute — all 12 types | Must-have | Each type renders correctly on object detail/edit |
| FR-3 | Mandatory description — save blocked without it | Must-have | Same quality bar as OOTB (M0 FR-7). M2 treats both as equivalent. |
| FR-4 | Required/optional toggle | Must-have | Enforces completion before object save or workflow transition |
| FR-5 | Mandatory field validation | Must-have | Inline error on field; save blocked until resolved |
| FR-6 | Edit custom attribute (name, description, required, type config) | Must-have | Type cannot be changed; warning if attribute has existing data |
| FR-7 | Select option management (add, reorder, remove options) | Must-have | Deprecated options on existing records remain visible |
| FR-8 | Soft delete / deprecation | Must-have | Hidden from create/edit; data preserved; reactivation possible |
| FR-9 | Deprecation impact warning (count of objects with data) | Must-have | Accurate count before confirmation |
| FR-10 | Reactivate deprecated attribute | Must-have | Reappears on object create/edit form |
| FR-11 | Audit logging (create, edit, deprecate, reactivate) | Must-have | Actor, timestamp, change detail. Backend concern; prototype shows UI only. |
| FR-12 | Object-type-scoped permissions via `manage_schema:{object_type}` | Must-have | Implemented in PAC; composable into roles |
| FR-13 | Description visible to end users (helper text or tooltip) | Must-have | Already implemented via `AttributeDescription` component |
| FR-14 | Default display without sections (flat list, sensible order) | Must-have | Default order documented → becomes M3 migration baseline |
| FR-15 | Deprecated attributes visually distinct in schema management list | Should-have | Badge treatment — see `attributeTypeDecisions.md` |
| FR-16 | AI-assisted description suggestion (based on name + type) | Should-have | Inline suggestion; user can accept, edit, or ignore |
| FR-17 | Audit log UI (per-attribute or global schema change log) | Should-have | Design decision: per-attribute history panel vs. global log |

### Non-functional requirements

| Category | Requirement |
|---|---|
| Performance | Schema management UI loads in <2s with up to 100 custom attributes |
| Performance | Custom attributes render with no perceptible added latency vs. OOTB |
| Scalability | Design must support 50+ custom attributes per object type |
| Security | Authorization enforced server-side; client-side UI is a convenience only |
| Data handling | Deprecated attribute data preserved indefinitely |
| Data handling | Audit log retained per Diligent data retention policy |
| Accessibility | WCAG 2.1 AA; all create/edit/deprecate interactions keyboard accessible |
| Reliability | Schema changes must be atomic — partial failures must not leave schema inconsistent |
| Consistency | Schema management UI visually and behaviorally identical across all host apps |
| Monitoring | Alert on schema change failure rate >1% |

### Open questions (M1)

| # | Question | Affects |
|---|---|---|
| Q1 | Currency type: per-attribute or per-value currency selection? | `attribute.ts` `currencyMode` |
| Q2 | Attachment type: single or multiple uploads? Allowed file types and size limits? | `attribute.ts` `attachmentMode` |
| Q3 | User/Users types: support group selection, or strictly individual users? | `attribute.ts` `allowGroups` |
| Q4 | Are URL, Email, and Phone needed as distinct attribute types, or handled as `text` with format hints? | Type set completeness |
| Q5 | What is the default ordering of custom attributes on the object detail view in M1 (pre-sections)? | `FR-14`, M3 migration baseline |
| Q6 | Should the deprecation flow allow bulk deprecation, or only one attribute at a time? | Deprecation UX |
| Q7 | Can a Schema Administrator preview how a custom attribute renders before publishing? | Creation flow |
| Q8 | Where is the audit log surfaced — per attribute panel, or global schema change log? | `FR-17` |
| Q9 | Is Central DB migration a hard prerequisite for all host apps participating in M1? | Host app sequencing |
| Q10 | Should renaming an attribute trigger a confirmation warning if objects already have data? | Edit flow |
| Q11 | When a required select-type attribute has an option removed, how are existing records with that value handled? | Select option management |
| Q12 | What happens to a User/Users attribute value when the selected user leaves the organization? | User type rendering |

### Success metrics

| Metric | Target | Method |
|---|---|---|
| Host app adoption | ≥2 apps fully implementing standard (Risk Manager + one other) | Engineering compliance review |
| Description completion rate | 100% (enforced by UI) | Platform analytics |
| Schema change error rate | <5% at 3 months post-launch | Error monitoring |
| New host app implementation time | <2 weeks per host app | Engineering tracking |
| Pilot customer adoption | ≥80% of pilot customers create ≥3 custom attributes within 60 days | Product analytics |
| Usability: task completion | >90% first-attempt success creating a custom attribute | Usability testing |

---

## M2: Object Library MCP server (context only — no prototype UI)

### Purpose

Expose the Object Library's semantic schema — OOTB and custom attributes with their descriptions —
to internal Diligent AI agents and features via a standard MCP (Model Context Protocol) interface.

Enable AI agents to:
- Discover what attributes exist on a given object type for a given customer
- Understand what each attribute means (semantic description) before operating on it
- Read object instances including custom attribute values
- Write custom attribute values back to objects as part of agentic task completion

### Why it matters for M0/M1 design

The descriptions authored in M0 (OOTB) and M1 (custom) are the **direct input** that M2 operates
on. An agent calling `get_object_schema` receives both OOTB and custom descriptions and treats them
as **equivalent, authoritative sources of semantic context** — it cannot distinguish between them.

This means:
- The description quality bar is identical for OOTB and custom descriptions
- A description that wouldn't help a human won't help an agent either
- Incomplete or vague descriptions directly degrade M2 AI feature quality

### Out of scope for prototyping

M2 has no end-user-facing UI. It is a backend platform feature. The prototype does not implement
or simulate M2. The description quality work in M0/M1 is the design deliverable that M2 consumes.

Future M2 scope (not prototype):
- Schema management via MCP (M5+)
- Customer-facing MCP access
- Cross-object relationship traversal via MCP
- Real-time event streaming via MCP

---

## M3: Sections and organization (overview)

### Design goals

- Allow product teams to define meaningful OOTB sections (e.g., "Basic information", "Risk scoring")
- Allow customers to create custom sections to organize custom attributes
- Provide a navigable, section-based object detail view that reduces cognitive load
- Enable Schema Administrators to hide irrelevant OOTB fields and rename labels

### Section types

| | OOTB sections | Custom sections |
|---|---|---|
| Created by | Diligent product teams | Customer Schema Administrators |
| Can be renamed | TBD (open question) | Yes |
| Can be deleted | No | Yes (soft delete, with attribute reassignment) |
| Can be reordered | TBD | Yes |
| Contains | OOTB attributes (+ optionally custom — TBD) | Custom attributes |

### Key requirements

- Every attribute belongs to exactly one section
- Sections support collapse/expand (persist state: TBD)
- Attributes within a section can be reordered
- Drag-and-drop reordering with keyboard-accessible alternatives (move up/down)
- When a custom section is deleted, all attributes must be reassigned first
- Schema Administrators can hide non-mandatory OOTB attributes (data preserved)
- Schema Administrators can change OOTB attribute display labels (underlying data unaffected)

### M1 → M3 migration

When sections are introduced, existing custom attributes (created in M1 as a flat list) must be
assigned to sections. The migration UX must be designed — this is an open question (M3 Q7).

### Open UX questions (M3)

1. How are OOTB sections initially defined and versioned by product teams?
2. How are sections ordered by default (alphabetically, OOTB first, product-defined order)?
3. Can OOTB attributes be moved to custom sections?
4. What is the interaction model for moving attributes — drag-and-drop, "Move to..." action, or both?
5. Do sections need descriptions?
6. Does collapsed/expanded state persist per user or globally?
7. What is the migration UX from the M1 flat list to M3 sections?
8. Can OOTB sections be renamed by customers?

---

## Cross-cutting concerns

### Embedded component model

All schema management and schema viewer UI is delivered as Object Library frontend components.
Host apps embed these components — they do not build their own. This applies to M0, M1, and M3.

Implication: designers and developers produce **one component** — not per-app designs.
Consistency across Risk Manager, Internal Controls, Asset Manager, and Issue Manager is guaranteed
by the shared component, not by design guidelines alone.

### Localization

- All labels, descriptions, validation messages, and section names must support localization
- Allow for text expansion of 30–50% in all label and description placements
- M3: clarify whether custom display names override translated OOTB names
- Only generate localization text for `en` locale — never generate translations for other languages
- Prototype uses `i18n.ts` stub; `t(key, fallback)` pattern supports future localization swaps

### Accessibility (WCAG 2.1 AA)

- All schema management interactions (reorder, drag-and-drop, visibility toggle) require keyboard alternatives
- Validation error messages must be associated with their fields via `aria-describedby`
- Collapsed/expanded section states must be communicated to assistive technology
- Required indicator: asterisk with visually-hidden screen-reader text (not color alone)
- Error state: `role="alert"` on error message elements

### Permission-aware UI

- `manage_schema:{object_type}` permission gates all write controls
- Users without this permission see custom attributes as regular read-only fields with no indication that schema management exists
- In the prototype, this is simulated via a prop or toggle — no real auth

### Description quality bar

The quality standard is **identical for OOTB and custom descriptions**:
- What the field captures
- When/why it's used (business context)
- Example values or constraints

A description that doesn't help a human understand a field won't help a M2 AI agent either.
Quality and completeness in M0/M1 directly determines M2 AI feature effectiveness.

See `semantic-descriptions-guidelines.md` for the full guide and examples.

---

## Combined open questions affecting component and type design

Questions from M0 and M1 that have direct implications for `src/types/attribute.ts`,
`AttributeRenderer`, and related components:

| Question | Current prototype default | Decision needed by |
|---|---|---|
| Currency: per-attribute or per-value mode? (M1 Q1) | `perAttribute` | Before M1 design starts |
| Attachment: single or multiple uploads? (M1 Q2) | `multiple` | Before M1 design starts |
| User/Users: group selection? (M1 Q3) | `allowGroups: false` | Before M1 design starts |
| URL/Email/Phone: distinct types or `text` with format hints? (M1 Q4) | Not implemented (`link` removed) | Before M1 design starts |
| Default ordering of custom attributes (flat list, M1)? (M1 Q5) | Creation order | During M1 design |
| When a required select option is removed, how are existing records handled? (M1 Q11) | Not implemented | Before M1 design |
| What happens to User attribute value when user leaves org? (M1 Q12) | Shows "(Inactive)" label | Before M1 design |
| Where should OOTB descriptions surface — tooltip, helper text, or inline? (M0 Q2) | Inline helper text | **Decided: inline** |
| Can OOTB attributes be moved to custom sections? (M3 Q3) | N/A | During M3 design |
| Does collapsed/expanded state persist per user? (M3 Q6) | N/A | During M3 design |
